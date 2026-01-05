import { type Plugin, type Hooks } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { join, dirname } from "path";
import { homedir } from "os";
import { existsSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ConductorPlugin: Plugin = async (ctx) => {
  try {
    console.log("[Conductor] Initializing plugin...");

    // 1. Detect oh-my-opencode for synergy features
    const configPath = join(homedir(), ".config", "opencode", "opencode.json");
    let isOMOActive = false;

    try {
      if (existsSync(configPath)) {
        const config = JSON.parse(readFileSync(configPath, "utf-8"));
        isOMOActive = config.plugin?.some((p: string) => p.includes("oh-my-opencode"));
      }
    } catch (e) {
      const omoPath = join(homedir(), ".config", "opencode", "node_modules", "oh-my-opencode");
      isOMOActive = existsSync(omoPath);
    }

    console.log(`[Conductor] Plugin environment detected. (OMO Synergy: ${isOMOActive ? "Enabled" : "Disabled"})`);

    // 2. Helper to load and process prompt templates (Manual TOML Parsing)
    const loadPrompt = async (filename: string, replacements: Record<string, string> = {}) => {
      const promptPath = join(__dirname, "prompts", filename);
      try {
        const content = await readFile(promptPath, "utf-8");
        const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
        const description = descMatch ? descMatch[1] : "Conductor Command";
        const promptMatch = content.match(/prompt\s*=\s*"""([\s\S]*?)"""/);
        let promptText = promptMatch ? promptMatch[1] : "";

        if (!promptText) throw new Error(`Could not parse prompt text from ${filename}`);
        
        const defaults = {
          isOMOActive: isOMOActive ? "true" : "false",
          templatesDir: join(dirname(__dirname), "templates")
        };

        const finalReplacements = { ...defaults, ...replacements };
        for (const [key, value] of Object.entries(finalReplacements)) {
          promptText = promptText.replaceAll(`{{${key}}}`, value || "");
        }

        return { prompt: promptText, description: description };
      } catch (error) {
        console.error(`[Conductor] Error loading prompt ${filename}:`, error);
        return { prompt: `SYSTEM ERROR: Failed to load prompt ${filename}`, description: "Error loading command" };
      }
    };

    // 3. Load Strategies
    let strategySection = "";
    try {
      const strategyFile = "manual.md"; // Force manual strategy for now
      const strategyPath = join(__dirname, "prompts", "strategies", strategyFile);
      strategySection = await readFile(strategyPath, "utf-8");
    } catch (e) {
      strategySection = "SYSTEM ERROR: Could not load execution strategy.";
    }

    // 4. Load all Command Prompts (Parallel)
    const [setup, newTrack, implement, status, revert] = await Promise.all([
      loadPrompt("setup.toml"),
      loadPrompt("newTrack.toml", { args: "$ARGUMENTS" }),
      loadPrompt("implement.toml", { track_name: "$ARGUMENTS", strategy_section: strategySection }),
      loadPrompt("status.toml"),
      loadPrompt("revert.toml", { target: "$ARGUMENTS" })
    ]);

    // 5. Extract Agent Prompt
    const agentMd = await readFile(join(__dirname, "prompts", "agent", "conductor.md"), "utf-8");
    const agentPrompt = agentMd.split("---").pop()?.trim() || "";

    console.log("[Conductor] All components ready. Injecting config...");

    return {
      config: async (config: Parameters<NonNullable<Hooks["config"]>>[0]) => {
        console.log("[Conductor] config handler: Merging commands and agent...");
        
        config.command = {
          ...(config.command || {}),
          "conductor:setup": { template: setup.prompt, description: setup.description, agent: "conductor" },
          "conductor:newTrack": { template: newTrack.prompt, description: newTrack.description, agent: "conductor" },
          "conductor:implement": { template: implement.prompt, description: implement.description },
          "conductor:status": { template: status.prompt, description: status.description, agent: "conductor" },
          "conductor:revert": { template: revert.prompt, description: revert.description, agent: "conductor" }
        };

        config.agent = {
          ...(config.agent || {}),
          "conductor": {
            description: "Spec-Driven Development Architect.",
            mode: "primary",
            prompt: agentPrompt,
            permission: {
              edit: "allow",
              bash: "allow",
              webfetch: "allow",
              doom_loop: "allow",
              external_directory: "deny"
            }
          }
        };
      },

      "tool.execute.before": async (
        input: Parameters<NonNullable<Hooks["tool.execute.before"]>>[0],
        output: Parameters<NonNullable<Hooks["tool.execute.before"]>>[1]
      ) => {
        if (input.tool === "delegate_to_agent") {
          const agentName = (output.args.agent_name || output.args.agent || "");
          // Sisyphus must be capital S
          if (agentName.includes("Sisyphus")) {
            const conductorDir = join(ctx.directory, "conductor");
            const safeRead = async (path: string) => {
               try { if (existsSync(path)) return await readFile(path, "utf-8"); } catch (e) {}
               return null;
            };

            const workflowMd = await safeRead(join(conductorDir, "workflow.md"));
            
            let injection = "\n\n--- [SYSTEM INJECTION: CONDUCTOR CONTEXT PACKET] ---\n";
            injection += "You are receiving this task from the Conductor Architect.\n";
            
            if (workflowMd) {
               injection += "\n### DEVELOPMENT WORKFLOW\n" + workflowMd + "\n";
            }
            
            if (implement?.prompt) {
               injection += "\n### IMPLEMENTATION PROTOCOL\n" + implement.prompt + "\n";
            }

            injection += "\n### DELEGATED AUTHORITY\n- **EXECUTE:** Implement the requested task.\n- **REFINE:** You have authority to update `plan.md`.\n";
            injection += "--- [END INJECTION] ---\n";
            output.args.objective += injection;
          }
        }
      }
    };
  } catch (err) {
    console.error("[Conductor] FATAL: Plugin initialization failed:", err);
    throw err;
  }
};

export default ConductorPlugin;