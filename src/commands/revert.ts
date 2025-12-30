import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { existsSync } from "fs";
import { join } from "path";
import { loadPrompt } from "../utils/promptLoader.js";

export const revertCommand = (ctx: any): ToolDefinition =>
  tool({
    description: "Reverts a Conductor track, phase, or task.",
    args: {
      target: tool.schema.string().optional().describe("ID or description of what to revert."),
    },
    async execute(args: { target?: string }) {
       const conductorDir = join(ctx.directory, "conductor");
       if (!existsSync(join(conductorDir, "tracks.md"))) {
           return "Conductor is not set up.";
       }

       return await loadPrompt("revert.toml");
    },
  });
