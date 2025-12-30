import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool";
import { StateManager } from "../utils/stateManager.js";
import { loadPrompt } from "../utils/promptLoader.js";

export const setupCommand = (ctx: any): ToolDefinition =>
  tool({
    description: "Sets up the Conductor environment for the project. Call this to start or resume the setup process. IMPORTANT: Do NOT create any todos using 'todowrite' or 'task' tools before or during this command, as it manages its own interactive state and will conflict with continuation enforcers.",
    args: {
      user_input: tool.schema.string().optional().describe("The user's response to a previous question, if applicable."),
    },
    async execute(args: { user_input?: string }) {
      const stateManager = new StateManager(ctx.directory);
      // Ensure the setup state is tracked, but for the prompt, we use the original system directive.
      // The original setup.toml prompt handles the logic flow via the LLM following instructions.
      // We pass the current state implicitly by letting the LLM read the state file as per instructions.
      
      return await loadPrompt("setup.toml");
    },
  });
