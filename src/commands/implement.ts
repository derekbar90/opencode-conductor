import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { loadPrompt } from "../utils/promptLoader.js";

export const implementCommand = (ctx: any): ToolDefinition =>
  tool({
    description: "Implements tasks from a Conductor track.",
    args: {
      track_name: tool.schema.string().optional().describe("Specific track to implement. If omitted, selects the next incomplete track."),
    },
    async execute(args: { track_name?: string }) {
       const conductorDir = join(ctx.directory, "conductor");
       if (!existsSync(join(conductorDir, "product.md"))) {
           return "Conductor is not set up. Please run `conductor_setup`.";
       }

       // Load the appropriate strategy snippet
       const strategyFile = ctx.isOMOActive ? "delegate.md" : "manual.md";
       const strategyPath = join(__dirname, "../prompts/strategies", strategyFile);
       let strategySection = "";
       
       try {
         strategySection = await readFile(strategyPath, "utf-8");
       } catch (e) {
         console.warn(`[Conductor] Failed to load strategy ${strategyFile}:`, e);
         strategySection = "Error: Could not load execution strategy.";
       }

       return await loadPrompt("implement.toml", {
         isOMOActive: ctx.isOMOActive ? "true" : "false",
         strategy_section: strategySection
       });
    },
  });
