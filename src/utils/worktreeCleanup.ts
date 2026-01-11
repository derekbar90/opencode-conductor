import { exec } from "child_process"
import { promisify } from "util"
import { existsSync, rmSync } from "fs"
import { getWorktreePath } from "./worktreeManager.js"
import {
  loadTrackMetadata,
  clearTrackWorktreeInfo,
} from "./metadataManager.js"

const execAsync = promisify(exec)

export interface CleanupResult {
  success: boolean
  merged: boolean
  worktreeRemoved: boolean
  branchDeleted: boolean
  originalProjectRoot?: string
  error?: string
}

export async function mergeWorktreeBranch(
  projectRoot: string,
  trackId: string,
  targetBranch: string
): Promise<boolean> {
  try {
    await execAsync(`git checkout ${targetBranch}`, { cwd: projectRoot })

    await execAsync(`git merge conductor/${trackId}`, { cwd: projectRoot })

    return true
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("CONFLICT")) {
      return false
    }
    throw error
  }
}

export async function removeWorktree(
  projectRoot: string,
  trackId: string
): Promise<void> {
  const worktreePath = getWorktreePath(projectRoot, trackId)

  try {
    await execAsync(`git worktree remove "${worktreePath}"`, {
      cwd: projectRoot,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes("locked")) {
      await execAsync(`git worktree remove --force "${worktreePath}"`, {
        cwd: projectRoot,
      })
    } else {
      throw error
    }
  }

  if (existsSync(worktreePath)) {
    rmSync(worktreePath, { recursive: true, force: true })
  }
}

export async function deleteWorktreeBranch(
  projectRoot: string,
  trackId: string
): Promise<void> {
  const branchName = `conductor/${trackId}`

  await execAsync(`git branch -d ${branchName}`, { cwd: projectRoot })

  const { stdout } = await execAsync(`git branch --list ${branchName}`, {
    cwd: projectRoot,
  })

  if (stdout.trim() !== "") {
    throw new Error(`Branch ${branchName} still exists after deletion`)
  }
}

export async function cleanupWorktree(
  projectRoot: string,
  trackId: string,
  targetBranch: string
): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: false,
    merged: false,
    worktreeRemoved: false,
    branchDeleted: false,
  }

  try {
    const metadata = loadTrackMetadata(projectRoot, trackId)
    result.originalProjectRoot = metadata.original_project_root

    const merged = await mergeWorktreeBranch(projectRoot, trackId, targetBranch)
    if (!merged) {
      result.error =
        "Merge conflicts detected. Please resolve conflicts manually."
      return result
    }
    result.merged = true

    await removeWorktree(projectRoot, trackId)
    result.worktreeRemoved = true

    await deleteWorktreeBranch(projectRoot, trackId)
    result.branchDeleted = true

    clearTrackWorktreeInfo(projectRoot, trackId)

    result.success = true
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (!result.merged) {
      result.error = `Failed to merge: ${errorMessage}`
    } else if (!result.worktreeRemoved) {
      result.error = `Failed to remove worktree: ${errorMessage}`
    } else {
      result.error = `Failed to delete branch: ${errorMessage}`
    }

    return result
  }
}
