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

  try {
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      // Check both "plugin" and "plugins" keys for robustness
      const plugins = config.plugin || config.plugins || [];
      isOMOActive = plugins.some((p: any) => 
        (typeof p === "string" && p.includes("oh-my-opencode")) || 
        (p && typeof p === "object" && p.name?.includes("oh-my-opencode"))
      );
    }
  } catch (e) {
    // Silent fail on JSON parse
  }

  // Double check filesystem if config check didn't find it
  if (!isOMOActive) {
    isOMOActive = existsSync(omoFSPath);
  }

  console.log(`[Conductor] Plugin tools loaded. (Synergy: ${isOMOActive ? "Enabled" : "Disabled"})`);
  if (!isOMOActive) {
     console.log(`[Conductor] Debug: Checked ${configPath} and ${omoFSPath}`);
  }

  const extendedCtx = { ...ctx, isOMOActive };

  return {
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