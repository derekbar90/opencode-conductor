import { basename, dirname, join } from "path"
import { exec } from "child_process"
import { promisify } from "util"

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
 * Generate the full path for a worktree directory
 * @param projectRoot - Absolute path to the project root
 * @param trackId - The track identifier
 * @returns Absolute path to the worktree directory
 */
export function getWorktreePath(projectRoot: string, trackId: string): string {
  const projectDirName = basename(projectRoot)
  const sanitizedName = sanitizeProjectName(projectDirName)
  const parentDir = dirname(projectRoot)
  const worktreesParent = join(parentDir, `${sanitizedName}-worktrees`)
  
  return join(worktreesParent, trackId)
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
  
  const command = `git worktree add "${worktreePath}" -b ${branchName} ${baseBranch}`
  
  await execAsync(command, { cwd: projectRoot })
  
  return worktreePath
}

