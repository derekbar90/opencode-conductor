import { type Plugin } from "@opencode-ai/plugin";
import { join, dirname } from "path";
import { homedir } from "os";
import { existsSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { parse } from "smol-toml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ConductorPlugin: Plugin = async (ctx) => {
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

  console.log(`[Conductor] Plugin loaded. (OMO Synergy: ${isOMOActive ? "Enabled" : "Disabled"})`);

  // 2. Helper to load and process prompt templates
  const loadPrompt = async (filename: string, replacements: Record<string, string> = {}) => {
    const promptPath = join(__dirname, "prompts", filename);
    try {
      const content = await readFile(promptPath, "utf-8");
      const parsed = parse(content) as { prompt: string; description: string };
      
      let promptText = parsed.prompt;
      
      // Default Replacements
      const defaults = {
        isOMOActive: isOMOActive ? "true" : "false",
        templatesDir: join(dirname(__dirname), "templates")
      };

      const finalReplacements = { ...defaults, ...replacements };

      for (const [key, value] of Object.entries(finalReplacements)) {
        promptText = promptText.replaceAll(`{{${key}}}`, value || "");
      }

      return {
        prompt: promptText,
        description: parsed.description
      };
    } catch (error) {
      console.error(`[Conductor] Failed to load prompt ${filename}:`, error);
      return { prompt: `SYSTEM ERROR: Failed to load prompt ${filename}`, description: "Error loading command" };
    }
  };

  // 3. Load Strategies for Implement Command
  let strategySection = "";
  try {
    const strategyFile = isOMOActive ? "delegate.md" : "manual.md";
    strategySection = await readFile(join(__dirname, "prompts", "strategies", strategyFile), "utf-8");
  } catch (e) {
    strategySection = "SYSTEM ERROR: Could not load execution strategy.";
  }

  // 4. Load all Command Prompts
  // conductor:setup
  const setup = await loadPrompt("setup.toml");

  // conductor:newTrack
  // Note: Arguments ($ARGUMENTS) are handled natively by OpenCode commands via variable injection in the template string?
  // Actually, for OpenCode commands, we put the placeholder directly in the string passed to 'template'.
  // Our TOML files use {{args}}, so we need to map that to "$ARGUMENTS" or "$1".
  const newTrack = await loadPrompt("newTrack.toml", { args: "$ARGUMENTS" });

  // conductor:implement
  const implement = await loadPrompt("implement.toml", { 
    track_name: "$ARGUMENTS", // Map command arg to the TOML variable
    strategy_section: strategySection 
  });

  // conductor:status
  const status = await loadPrompt("status.toml");

  // conductor:revert
  const revert = await loadPrompt("revert.toml", { target: "$ARGUMENTS" });

  return {
    command: {
      "conductor:setup": {
        template: setup.prompt,
        description: setup.description,
        agent: "conductor",
      },
      "conductor:newTrack": {
        template: newTrack.prompt,
        description: newTrack.description,
        agent: "conductor",
      },
      "conductor:implement": {
        template: implement.prompt,
        description: implement.description,
        agent: "sisyphus",
      },
      "conductor:status": {
        template: status.prompt,
        description: status.description,
        agent: "conductor",
      },
      "conductor:revert": {
        template: revert.prompt,
        description: revert.description,
        agent: "conductor",
      }
    },
    // Keep the Hook for Sisyphus Synergy
    "tool.execute.before": async (input: any, output: any) => {
      if (input.tool === "delegate_to_agent") {
        const agentName = (output.args.agent_name || output.args.agent || "").toLowerCase();
        
        if (agentName.includes("sisyphus")) {
          const conductorDir = join(ctx.directory, "conductor");
          
          const safeRead = async (path: string) => {
             try {
               if (existsSync(path)) return await readFile(path, "utf-8");
             } catch (e) { /* ignore */ }
             return null;
          };
          
          // We load the raw TOML just to get the protocol text if needed, or just hardcode a reference.
          // Since we already loaded 'implement' above, we could potentially reuse it, but simplicity is better here.
          // Let's just grab the workflow.md
          const workflowMd = await safeRead(join(conductorDir, "workflow.md"));
          
          let injection = "\n\n--- [SYSTEM INJECTION: CONDUCTOR CONTEXT PACKET] ---\n";
          injection += "You are receiving this task from the Conductor Architect.\n";

          if (workflowMd) {
             injection += "\n### DEVELOPMENT WORKFLOW\n";
             injection += "Follow these TDD and Commit rules precisely.\n";
             injection += "```markdown\n" + workflowMd + "\n```\n";
          }

          injection += "\n### DELEGATED AUTHORITY\n";
          injection += "- **EXECUTE:** Implement the requested task using the Workflow.\n";
          injection += "- **REFINE:** You have authority to update `plan.md` if it is flawed.\n";
          injection += "- **ESCALATE:** If you modify the Plan or Spec, report 'PLAN_UPDATED' immediately.\n";
          injection += "--- [END INJECTION] ---\n";

          output.args.objective += injection;
        }
      }
    }
  };
};

export default ConductorPlugin;
