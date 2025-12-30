import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { existsSync } from "fs";
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

       return await loadPrompt("implement.toml");
    },
  });
