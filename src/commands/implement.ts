import { tool } from "@opencode-ai/plugin/tool";
import { createConductorCommand } from "../utils/commandFactory.js";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { setupWorktreeForTrack } from "../utils/worktreeOrchestrator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const implementCommand = createConductorCommand({
  name: "legacy/conductor/commands/conductor/implement.toml",
  description: "Implements a feature or fixes a bug following a strict Plan and Spec.",
  args: {
    track_name: tool.schema.string().optional().describe("Specific track to implement. If omitted, selects the next incomplete track."),
  },
  additionalContext: async (ctx, args) => {
    const strategyFile = (ctx as any).isOMOActive ? "delegate.md" : "manual.md"; 
    const strategyPath = join(__dirname, "../prompts/strategies", strategyFile);
    
    let strategySection = "";
    try {
      strategySection = await readFile(strategyPath, "utf-8");
    } catch (e) {
      console.warn(`[Conductor] Failed to load strategy ${strategyFile}:`, e);
      strategySection = "Error: Could not load execution strategy.";
    }

    let worktreeInfo = "";
    if (args.track_name) {
      try {
        const workDir = (ctx as any).workDir || process.cwd();
        const worktreeResult = await setupWorktreeForTrack(workDir, args.track_name);
        
        if (worktreeResult.worktreePath) {
          worktreeInfo = `\n\n## Worktree Configuration\n\nThis track is using Git worktree isolation:\n- **Worktree Path**: ${worktreeResult.worktreePath}\n- **Branch**: ${worktreeResult.worktreeBranch}\n- **Working Directory**: ${worktreeResult.worktreePath}\n\n`;
          
          if (worktreeResult.worktreeCreated) {
            worktreeInfo += `✓ Worktree created successfully for track "${args.track_name}".\n`;
          } else if (worktreeResult.usingExistingWorktree) {
            worktreeInfo += `✓ Using existing worktree for track "${args.track_name}".\n`;
          }
          
          worktreeInfo += `\nAll file operations for this track should be performed in the worktree directory.\n`;
        } else if (worktreeResult.fallbackToNormalMode) {
          worktreeInfo = `\n\n## Worktree Setup Failed\n\nWorktree creation failed: ${worktreeResult.error}\nFalling back to normal mode (working in main project directory).\n\n`;
        }
      } catch (error) {
        console.warn(`[Conductor] Worktree setup error:`, error);
      }
    }

    return {
      strategy_section: strategySection,
      track_name: args.track_name || "",
      worktree_info: worktreeInfo
    };
  }
});