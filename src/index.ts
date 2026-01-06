import { type Plugin, type Hooks } from "@opencode-ai/plugin";
import { join, dirname } from "path";
import { existsSync} from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { createDelegationTool } from "./tools/delegate.js";
import {
  BackgroundManager,
  createBackgroundTask,
  createBackgroundOutput,
  createBackgroundCancel,
} from "./tools/background.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const safeRead = async (path: string) => {
  try {
    if (existsSync(path)) return await readFile(path, "utf-8");
  } catch (e) {}
  return null;
};

const ConductorPlugin: Plugin = async (ctx) => {
  try {
    console.log("[Conductor] Initializing plugin..."); 

    const backgroundManager = new BackgroundManager(ctx);

    // 1. Helper to load and process prompt templates (Manual TOML Parsing)
    const loadPrompt = async (
      filename: string,
      replacements: Record<string, string> = {},
    ) => {
      const promptPath = join(__dirname, "prompts", filename);
      try {
        const content = await readFile(promptPath, "utf-8");
        const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
        const description = descMatch ? descMatch[1] : "Conductor Command";
        const promptMatch = content.match(/prompt\s*=\s*"""([\s\S]*?)"""/);
        let promptText = promptMatch ? promptMatch[1] : "";

        if (!promptText)
          throw new Error(`Could not parse prompt text from ${filename}`);

        const defaults = {
          templatesDir: join(dirname(__dirname), "templates"),
        };

        const finalReplacements = { ...defaults, ...replacements };
        for (const [key, value] of Object.entries(finalReplacements)) {
          promptText = promptText.replaceAll(`{{${key}}}`, value || "");
        }

        return { prompt: promptText, description: description };
      } catch (error) {
        console.error(`[Conductor] Error loading prompt ${filename}:`, error);
        return {
          prompt: `SYSTEM ERROR: Failed to load prompt ${filename}`,
          description: "Error loading command",
        };
      }
    };

    // 3. Load all Command Prompts (Parallel)
    const [setup, newTrack, implement, status, revert] =
      await Promise.all([
        loadPrompt("setup.toml"),
        loadPrompt("newTrack.toml", { args: "$ARGUMENTS" }),
        loadPrompt("implement.toml", {
          track_name: "$ARGUMENTS",
        }),
        loadPrompt("status.toml"),
        loadPrompt("revert.toml", { target: "$ARGUMENTS" }),
        safeRead(join(ctx.directory, "conductor", "workflow.md")),
      ]);

    // 4. Extract Agent Prompts
    const [conductorMd, implementerMd] = await Promise.all([
      readFile(join(__dirname, "prompts", "agent", "conductor.md"), "utf-8"),
      readFile(join(__dirname, "prompts", "agent", "implementer.md"), "utf-8"),
    ]);

    const conductorPrompt = conductorMd.split("---").pop()?.trim() || "";
    const implementerPrompt = implementerMd.split("---").pop()?.trim() || "";

    console.log("[Conductor] All components ready. Injecting config...");

    return {
      tool: {
        ...(ctx.client.tool || {}),
        "conductor_delegate": createDelegationTool(ctx),
        "conductor_bg_task": createBackgroundTask(backgroundManager),
        "conductor_bg_output": createBackgroundOutput(backgroundManager),
        "conductor_bg_cancel": createBackgroundCancel(backgroundManager),
      },
      config: async (config) => {
        if (!config) return;
        console.log(
          "[Conductor] config handler: Merging commands and agents...",
        );

        config.command = {
          ...(config.command || {}),
          "conductor_setup": {
            template: setup.prompt,
            description: setup.description,
            agent: "conductor",
          },
          "conductor_newTrack": {
            template: newTrack.prompt,
            description: newTrack.description,
            agent: "conductor",
          },
          "conductor_implement": {
            template: implement.prompt,
            description: implement.description,
            agent: "conductor_implementer",
          },
          "conductor_status": {
            template: status.prompt,
            description: status.description,
            agent: "conductor",
          },
          "conductor_revert": {
            template: revert.prompt,
            description: revert.description,
            agent: "conductor",
          },
        };

        config.agent = {
          ...(config.agent || {}),
          conductor: {
            description: "Conductor Protocol Steward.",
            mode: "primary",
            prompt: conductorPrompt,
            permission: {
              read: {
                "*": "allow",
                "*.env": "deny",
                "*.env.*": "deny",
                "*.env.example": "allow",
              },
              edit: "allow",
              bash: "allow",
              grep: "allow",
              glob: "allow",
              list: "allow",
              lsp: "allow",
              todoread: "allow",
              todowrite: "allow",
              webfetch: "allow",
              external_directory: "deny",
              doom_loop: "ask",
            } as any,
          },
          conductor_implementer: {
            description: "Conductor Protocol Implementer.",
            mode: "primary",
            prompt: implementerPrompt,
            permission: {
              read: {
                "*": "allow",
                "*.env": "deny",
                "*.env.*": "deny",
                "*.env.example": "allow",
              },
              edit: "allow",
              bash: "allow",
              grep: "allow",
              glob: "allow",
              list: "allow",
              lsp: "allow",
              todoread: "allow",
              todowrite: "allow",
              webfetch: "allow",
              "conductor_delegate": "allow",
              "conductor_bg_task": "allow",
              "conductor_bg_output": "allow",
              "conductor_bg_cancel": "allow",
              external_directory: "deny",
              doom_loop: "ask",
            } as any,
          },
        };
      },

      // "tool.execute.before": async (input, output) => {
      //   const delegationTools = [
      //     "delegate_to_agent",
      //     "task",
      //     "background_task",
      //     "conductor_delegate",
      //     "conductor_bg_task",
      //   ];

      //   if (delegationTools.includes(input.tool)) {
      //     const conductorDir = join(ctx.directory, "conductor");

      //     const workflowMd = await safeRead(join(conductorDir, "workflow.md"));

      //     if (workflowMd) {
      //       let injection = "\n\n--- [SYSTEM INJECTION: CONDUCTOR CONTEXT PACKET] ---\n";
      //       injection +=
      //         "You are receiving this task from the Conductor.\n";
      //       injection +=
      //         "You MUST adhere to the following project workflow rules:\n";

      //       injection += "\n### DEVELOPMENT WORKFLOW\n" + workflowMd + "\n";

      //       if (implement?.prompt) {
      //         injection +=
      //           "\n### IMPLEMENTATION PROTOCOL\n" + implement.prompt + "\n";
      //       }

      //       injection +=
      //         "\n### DELEGATED AUTHORITY\n- **EXECUTE:** Implement the requested task.\n- **REFINE:** You have authority to update `plan.md` and `spec.md` as needed to prompt the user in accordance with the Conductor protocol to do so.\n";
      //       injection += "--- [END INJECTION] ---\n";

      //       // Inject into the primary instruction field depending on the tool's schema
      //       if (typeof output.args.objective === "string") {
      //         output.args.objective += injection;
      //       } else if (typeof output.args.prompt === "string") {
      //         output.args.prompt += injection;
      //       } else if (typeof output.args.instruction === "string") {
      //         output.args.instruction += injection;
      //       }
      //     }
      //   }
      // },
    };
  } catch (err) {
    console.error("[Conductor] FATAL: Plugin initialization failed:", err);
    throw err;
  }
};

export default ConductorPlugin;
