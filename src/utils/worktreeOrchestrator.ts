import { parseWorkflowConfig } from "./workflowParser.js"
import {
  getCurrentBranch,
  createWorktree,
  worktreeExists,
} from "./worktreeManager.js"
import {
  loadTrackMetadata,
  updateTrackWorktreeInfo,
} from "./metadataManager.js"

export interface WorktreeSetupResult {
  worktreeCreated: boolean
  worktreePath?: string
  worktreeBranch?: string
  usingExistingWorktree?: boolean
  fallbackToNormalMode?: boolean
  error?: string
}

export async function setupWorktreeForTrack(
  projectRoot: string,
  trackId: string
): Promise<WorktreeSetupResult> {
  try {
    let config
    try {
      config = parseWorkflowConfig(projectRoot)
    } catch (err) {
      const message =
        `Failed to parse workflow configuration: ${(err as Error).message}. ` +
        `Check that conductor/workflow.md exists and is valid YAML/Markdown.`
      throw new Error(message)
    }

    if (!config.use_worktrees) {
      return {
        worktreeCreated: false,
      }
    }

    const metadata = loadTrackMetadata(projectRoot, trackId)

    if (metadata.worktree_path && metadata.worktree_branch) {
      const exists = await worktreeExists(projectRoot, trackId)
      
      if (exists) {
        return {
          worktreeCreated: false,
          worktreePath: metadata.worktree_path,
          worktreeBranch: metadata.worktree_branch,
          usingExistingWorktree: true,
        }
      }
    }

    const currentBranch = await getCurrentBranch(projectRoot)
    const worktreePath = await createWorktree(
      projectRoot,
      trackId,
      currentBranch
    )
    const worktreeBranch = `conductor/${trackId}`

    updateTrackWorktreeInfo(projectRoot, trackId, worktreePath, worktreeBranch)

    return {
      worktreeCreated: true,
      worktreePath,
      worktreeBranch,
    }
  } catch (error) {
    return {
      worktreeCreated: false,
      fallbackToNormalMode: true,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
