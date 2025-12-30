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
  let isOMOActive = false;

  try {
    if (existsSync(configPath)) {
      const config = JSON.parse(readFileSync(configPath, "utf-8"));
      isOMOActive = config.plugin?.some((p: string) => p.includes("oh-my-opencode"));
    }
  } catch (e) {
    // Fallback to filesystem check if config read fails
    const omoPath = join(homedir(), ".config", "opencode", "node_modules", "oh-my-opencode");
    isOMOActive = existsSync(omoPath);
  }

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
  };
};

export default ConductorPlugin;