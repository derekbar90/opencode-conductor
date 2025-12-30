import { type Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { setupCommand } from "./commands/setup.js";
import { newTrackCommand } from "./commands/newTrack.js";
import { implementCommand } from "./commands/implement.js";
import { statusCommand } from "./commands/status.js";
import { revertCommand } from "./commands/revert.js";
import { bootstrap } from "./utils/bootstrap.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ConductorPlugin: Plugin = async (ctx) => {
  console.log("[Conductor] Plugin loading...");
  // Run bootstrap in background to avoid hanging startup
  bootstrap(ctx).catch(err => console.error("[Conductor] Bootstrap failed:", err));

  return {
    config: async (config) => {
      console.log("[Conductor] config hook triggered");
      
      const plugins = config.plugin || [];
      const isOMOActive = plugins.some(p => typeof p === "string" && p.includes("oh-my-opencode"));
      
      let agentPrompt = "";
      try {
        const promptPath = join(__dirname, "prompts/agent.md");
        agentPrompt = await readFile(promptPath, "utf-8");
      } catch (e) {
        console.error("[Conductor] Failed to read agent prompt");
        agentPrompt = "Specialized agent for Conductor spec-driven development.";
      }

      // Do not await toasts in the config hook
      ctx.client.tui.showToast({
        body: {
          title: "Conductor",
          message: isOMOActive ? "Conductor Agent & Commands registered" : "Conductor Commands registered",
          variant: "success",
          duration: 3000
        }
      }).catch(() => {});

      // Register the Conductor Agent logic. 
      // User can override the model in their global opencode.json or oh-my-opencode.json
      config.agent = config.agent || {};
      const existingConductor = config.agent["conductor"] || {};

      config.agent["conductor"] = {
        description: "Spec-Driven Development Architect. Manages the project lifecycle using the Conductor protocol.",
        model: existingConductor.model || config.model,
        prompt: agentPrompt,
        ...existingConductor,
        tools: {
          ...existingConductor.tools,
          conductor_setup: true,
          conductor_new_track: true,
          conductor_implement: true,
          conductor_status: true,
          conductor_revert: true
        }
      };

      config.command = config.command || {};
      config.command = {
        ...config.command,
        "c-setup": {
          description: "Setup or resume Conductor environment",
          agent: "conductor",
          template: "Invoke the conductor_setup tool to start or resume the project initialization. Do NOT create todos during this phase."
        },
        "c-new": {
          description: "Create a new track (feature/bug)",
          agent: "conductor",
          template: "Invoke the conductor_new_track tool with arguments: $ARGUMENTS. Do NOT create todos during this phase."
        },
        "c-implement": {
          description: "Implement the next pending task",
          agent: "conductor",
          template: "Invoke the conductor_implement tool. If a track name is provided ($ARGUMENTS), use it; otherwise, implement the next available track."
        },
        "c-status": {
          description: "Show Conductor project status",
          agent: "conductor",
          template: "Invoke the conductor_status tool to summarize the project progress."
        },
        "c-revert": {
          description: "Revert a track, phase, or task",
          agent: "conductor",
          template: "Invoke the conductor_revert tool for: $ARGUMENTS"
        }
      };
      
      console.log("[Conductor] config hook completed");
    },
    tool: {
      conductor_setup: setupCommand(ctx),
      conductor_new_track: newTrackCommand(ctx),
      conductor_implement: implementCommand(ctx),
      conductor_status: statusCommand(ctx),
      conductor_revert: revertCommand(ctx),
    },
  };
};
export default ConductorPlugin;
