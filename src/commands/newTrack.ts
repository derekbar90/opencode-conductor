import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { existsSync } from "fs";
import { join } from "path";
import { loadPrompt } from "../utils/promptLoader.js";

export const newTrackCommand = (ctx: any): ToolDefinition =>
  tool({
    description: "Creates a new track (feature/bug) in the Conductor system. IMPORTANT: Do NOT create any todos using 'todowrite' or 'task' tools before or during this command, as it manages its own interactive state and will conflict with continuation enforcers.",
    args: {
      description: tool.schema.string().optional().describe("Brief description of the track."),
    },
    async execute(args: { description?: string }) {
       const conductorDir = join(ctx.directory, "conductor");
       if (!existsSync(join(conductorDir, "product.md")) || 
           !existsSync(join(conductorDir, "workflow.md"))) {
           return "Conductor is not set up. Please run `conductor_setup`.";
       }

       // Map the description to {{args}} in the legacy TOML
       return await loadPrompt("newTrack.toml", { args: args.description || "" });
    },
  });
