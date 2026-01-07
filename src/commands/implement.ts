import { tool } from "@opencode-ai/plugin/tool";
import { createConductorCommand } from "../utils/commandFactory.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const implementCommand = createConductorCommand({
  name: "legacy/conductor/commands/conductor/implement.toml",
  description: "Implements a feature or fixes a bug following a strict Plan and Spec.",
  args: {
    track_name: tool.schema.string().optional().describe("Specific track to implement. If omitted, selects the next incomplete track."),
  },
  additionalContext: async (ctx, args) => {
    // 1. Choose strategy based on OMO activity
    const strategyFile = (ctx as any).isOMOActive ? "delegate.md" : "manual.md"; 
    const strategyPath = join(__dirname, "../prompts/strategies", strategyFile);
    
    let strategySection = "";
    try {
      strategySection = await readFile(strategyPath, "utf-8");
    } catch (e) {
      console.warn(`[Conductor] Failed to load strategy ${strategyFile}:`, e);
      strategySection = "Error: Could not load execution strategy.";
    }

    return {
      strategy_section: strategySection,
      track_name: args.track_name || ""
    };
  }
});