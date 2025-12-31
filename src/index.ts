import { type Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { setupCommand } from "./commands/setup.js";
import { newTrackCommand } from "./commands/newTrack.js";
import { implementCommand } from "./commands/implement.js";
import { statusCommand } from "./commands/status.js";
import { revertCommand } from "./commands/revert.js";
import { join } from "path";
import { homedir } from "os";
import { existsSync, readFileSync } from "fs";

const ConductorPlugin: Plugin = async (ctx) => {
  // Detect oh-my-opencode for synergy features
  const configPath = join(homedir(), ".config", "opencode", "opencode.json");
  const omoFSPath = join(homedir(), ".config", "opencode", "node_modules", "oh-my-opencode");
  let isOMOActive = false;
  let mainSessionID: string | undefined;

  try {
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      const plugins = config.plugin || config.plugins || [];
      isOMOActive = plugins.some((p: any) => 
        (typeof p === "string" && p.includes("oh-my-opencode")) || 
        (p && typeof p === "object" && p.name?.includes("oh-my-opencode"))
      );
    }
  } catch (e) {}

  if (!isOMOActive) isOMOActive = existsSync(omoFSPath);

  console.log(`[Conductor] Plugin tools loaded. (Synergy: ${isOMOActive ? "Enabled" : "Disabled"})`);

  const extendedCtx = { ...ctx, isOMOActive };

  return {
    event: async (input) => {
      const { event } = input;
      const props = event.properties;

      // 1. Track the main session ID
      if (event.type === "session.created") {
        const info = (props as any)?.info;
        if (info && !info.parentID) {
          mainSessionID = info.id;
        }
      }

      // 2. Monitor for telemetry tags in subagent messages
      if (event.type === "message.part.updated" && mainSessionID) {
        const text = (props as any)?.part?.text || "";
        const syncMatch = text.match(/<conductor_sync\s+id="([^"]+)"\s+status="([^"]+)"\s*\/>/);
        
        if (syncMatch) {
          const [_, todoId, status] = syncMatch;
          
          // Execute a hidden command in the main session to update the todo UI
          await ctx.client.session.command({
            path: { id: mainSessionID },
            body: { 
              command: `/todowrite ${status} ${todoId}`
            } as any
          }).catch(() => {});
        }
      }
    },
    config: async (config) => {
      // 1. Enable delegation to Sisyphus by making it a subagent-capable agent
      if (config.agent?.["Sisyphus"] && config.agent["Sisyphus"].mode === "primary") {
        config.agent["Sisyphus"].mode = "all";
      }

      // 2. Ensure Conductor agent has access to necessary tools for OMO synergy
      if (config.agent?.["conductor"]) {
        config.agent["conductor"].tools = {
          ...config.agent["conductor"].tools,
          task: true,
          todowrite: true,
          todoread: true
        };
      }

      // 3. Register slash commands
      config.command = config.command || {};
      const conductorCommands = {
        "c-setup": {
          description: "Setup or resume Conductor environment",
          agent: "conductor",
          template: "Invoke the conductor_setup tool. Do NOT create todos during this phase."
        },
        "c-new": {
          description: "Create a new track (feature/bug)",
          agent: "conductor",
          template: "Invoke the conductor_new_track tool with arguments: $ARGUMENTS. Use todowrite to plan steps."
        },
        "c-implement": {
          description: "Implement the next pending task",
          agent: "conductor",
          template: "Invoke the conductor_implement tool. Delegate to Sisyphus via task() if OMO is active."
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

      Object.assign(config.command, conductorCommands);
    },
    tool: {
      conductor_setup: setupCommand(extendedCtx),
      conductor_new_track: newTrackCommand(extendedCtx),
      conductor_implement: implementCommand(extendedCtx),
      conductor_status: statusCommand(extendedCtx),
      conductor_revert: revertCommand(extendedCtx),
    },
  };
};

export default ConductorPlugin;