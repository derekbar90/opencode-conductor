import { basename, dirname, join } from "path"

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
