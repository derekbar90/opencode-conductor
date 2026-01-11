import { basename, dirname, join } from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { existsSync, rmSync } from "fs"

const execAsync = promisify(exec)

/**
 * Sanitize a project name for use in directory names
 * @param name - The raw project name
 * @returns Sanitized project name safe for file system
 */
export function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/[-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Validate and sanitize a track ID for safe use in paths and branch names
 * @param trackId - The track identifier to validate
 * @returns Sanitized track ID
 * @throws Error if trackId contains invalid characters
 */
export function validateTrackId(trackId: string): string {
  if (!trackId || typeof trackId !== "string") {
    throw new Error("Track ID must be a non-empty string")
  }
  
  const trimmed = trackId.trim()
  
  if (!trimmed) {
    throw new Error("Track ID must be a non-empty string")
  }
  
  if (trimmed.includes("..")) {
    throw new Error(
      `Track ID "${trackId}" contains ".." which could lead to path traversal.`
    )
  }
  
  if (/[\/\\:]/.test(trimmed)) {
    throw new Error(
      `Track ID "${trackId}" contains invalid characters. ` +
      `Path separators (/, \\) and colons (:) are not allowed.`
    )
  }
  
  return trimmed
}

/**
 * Generate the full path for a worktree directory
 * @param projectRoot - Absolute path to the project root
 * @param trackId - The track identifier
 * @returns Absolute path to the worktree directory
 */
export function getWorktreePath(projectRoot: string, trackId: string): string {
  const validatedTrackId = validateTrackId(trackId)
  const projectDirName = basename(projectRoot)
  const sanitizedName = sanitizeProjectName(projectDirName)
  const parentDir = dirname(projectRoot)
  const worktreesParent = join(parentDir, `${sanitizedName}-worktrees`)
  
  return join(worktreesParent, validatedTrackId)
}

/**
 * Get the current Git branch name
 * @param projectRoot - Absolute path to the project root
 * @returns Current branch name
 */
export async function getCurrentBranch(projectRoot: string): Promise<string> {
  const { stdout } = await execAsync("git branch --show-current", {
    cwd: projectRoot,
  })
  return stdout.trim()
}

/**
 * Create a new Git worktree for a track
 * @param projectRoot - Absolute path to the project root
 * @param trackId - The track identifier
 * @param baseBranch - The base branch to branch from
 * @returns Absolute path to the created worktree
 */
export async function createWorktree(
  projectRoot: string,
  trackId: string,
  baseBranch: string
): Promise<string> {
  const worktreePath = getWorktreePath(projectRoot, trackId)
  const branchName = `conductor/${trackId}`
  
  if (existsSync(worktreePath)) {
    const isGitWorktree = await worktreeExists(projectRoot, trackId)
    
    if (!isGitWorktree) {
      try {
        await execAsync("git worktree prune", { cwd: projectRoot })
      } catch (error) {
        // Prune failed, continue to force removal
      }
      
      if (existsSync(worktreePath)) {
        rmSync(worktreePath, { recursive: true, force: true })
      }
    } else {
      throw new Error(`Worktree already exists at ${worktreePath}. Use a different track name or remove the existing worktree.`)
    }
  }
  
  const command = `git worktree add "${worktreePath}" -b ${branchName} ${baseBranch}`
  
  await execAsync(command, { cwd: projectRoot })
  
  return worktreePath
}

export async function worktreeExists(
  projectRoot: string,
  trackId: string
): Promise<boolean> {
  const worktreePath = getWorktreePath(projectRoot, trackId)
  
  try {
    const { stdout } = await execAsync("git worktree list --porcelain", {
      cwd: projectRoot,
    })
    
    return stdout.includes(worktreePath)
  } catch (error) {
    throw error
  }
}

