import { type Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { setupCommand } from "./commands/setup.js";
import { newTrackCommand } from "./commands/newTrack.js";
import { implementCommand } from "./commands/implement.js";
import { statusCommand } from "./commands/status.js";
import { revertCommand } from "./commands/revert.js";
import { join, dirname } from "path";
import { homedir } from "os";
import { existsSync, readFileSync } from "fs";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function detectOMO(): boolean {
  const home = homedir();
  
  // Method 1: Check if oh-my-opencode is installed in OpenCode's plugin cache
  // This is where OpenCode actually installs plugins at runtime
  const cachePluginPath = join(home, ".cache", "opencode", "node_modules", "oh-my-opencode");
  if (existsSync(cachePluginPath)) {
    return true;
  }

  // Method 2: Check opencode.json config for plugin declaration
  const configPath = join(home, ".config", "opencode", "opencode.json");
  try {
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      if (Array.isArray(config.plugin)) {
        if (config.plugin.some((p: string) => p.includes("oh-my-opencode"))) {
          return true;
        }
      }
    }
  } catch {
    // Config read failed, continue to other methods
  }

  // Method 3: Check if oh-my-opencode config file exists (user has configured it)
  const omoConfigPath = join(home, ".config", "opencode", "oh-my-opencode.json");
  if (existsSync(omoConfigPath)) {
    return true;
  }

  return false;
}

const ConductorPlugin: Plugin = async (ctx) => {
  const isOMOActive = detectOMO();
  console.log(`[Conductor] Plugin tools loaded. (OMO Synergy: ${isOMOActive ? "Enabled" : "Disabled"})`);

  const extendedCtx = { ...ctx, isOMOActive };

  return {
    tool: {
      conductor_setup: setupCommand(extendedCtx),
      conductor_new_track: newTrackCommand(extendedCtx),
      conductor_implement: implementCommand(extendedCtx),
      conductor_status: statusCommand(extendedCtx),
      conductor_revert: revertCommand(extendedCtx),
    },
    "tool.execute.before": async (input: any, output: any) => {
      // INTERCEPT: Task Delegation Hook
      // Purpose: Automatically inject the full Conductor context (Plan, Spec, Workflow, Protocol)
      // whenever the Conductor delegates a task via the `task` tool. This ensures the subagent
      // has "Engineering Authority" without needing the LLM to manually copy-paste huge context blocks.
      
      if (input.tool === "task") {
        const subagentType = (output.args.subagent_type || "").toLowerCase();
        
        // Intercept delegation to implementation subagents
        if (subagentType.includes("implement") || subagentType === "general" || subagentType.includes("sisyphus")) {
          console.log(`[Conductor] Intercepting task delegation to ${subagentType}. Injecting Context Packet...`);
          
          const conductorDir = join(ctx.directory, "conductor");
          const promptsDir = join(__dirname, "prompts");

          // Helper to safely read file content
          const safeRead = async (path: string) => {
             try {
               if (existsSync(path)) return await readFile(path, "utf-8");
             } catch (e) { /* ignore */ }
             return null;
          };

          const implementToml = await safeRead(join(promptsDir, "implement.toml"));
          const workflowMd = await safeRead(join(conductorDir, "workflow.md"));
          
          // Construct the injection block
          let injection = "\n\n--- [SYSTEM INJECTION: CONDUCTOR CONTEXT PACKET] ---\n";
          injection += "You are receiving this task from the Conductor Architect.\n";
          
          if (implementToml) {
            injection += "\n### 1. ARCHITECTURAL PROTOCOL (Reference Only)\n";
            injection += "Use this protocol to understand the project's rigorous standards. DO NOT restart the project management lifecycle (e.g. track selection).\n";
            injection += "```toml\n" + implementToml + "\n```\n";
          }

          if (workflowMd) {
             injection += "\n### 2. DEVELOPMENT WORKFLOW\n";
             injection += "Follow these TDD and Commit rules precisely.\n";
             injection += "```markdown\n" + workflowMd + "\n```\n";
          }

          injection += "\n### 3. DELEGATED AUTHORITY\n";
          injection += "- **EXECUTE:** Implement the requested task using the Workflow.\n";
          injection += "- **REFINE:** You have authority to update `plan.md` if it is flawed.\n";
          injection += "- **ESCALATE:** If you modify the Plan or Spec, report 'PLAN_UPDATED' immediately.\n";
          injection += "--- [END INJECTION] ---\n";

          // Append to the prompt
          if (output.args.prompt) {
            output.args.prompt += injection;
          }
        }
      }
    }
  };
};

export default ConductorPlugin;