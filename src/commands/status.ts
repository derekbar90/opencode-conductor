import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { existsSync } from "fs";
import { join } from "path";
import { loadPrompt } from "../utils/promptLoader.js";

export const statusCommand = (ctx: any): ToolDefinition =>
  tool({
    description: "Shows the status of Conductor tracks.",
    args: {},
    async execute(args: {}) {
       const conductorDir = join(ctx.directory, "conductor");
       if (!existsSync(join(conductorDir, "tracks.md"))) {
           return "Conductor is not set up.";
       }

       return await loadPrompt("status.toml");
    },
  });
