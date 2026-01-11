import { readFileSync } from "fs"
import { join } from "path"

export interface WorkflowConfig {
  use_worktrees: boolean
}

/**
 * Parse workflow.md content and extract configuration settings
 * @param projectRoot - The root directory of the project containing conductor/workflow.md
 * @returns Configuration object with parsed settings
 */
export function parseWorkflowConfig(projectRoot: string): WorkflowConfig {
  const workflowPath = join(projectRoot, "conductor", "workflow.md")
  const content = readFileSync(workflowPath, "utf8")
  
  const config: WorkflowConfig = {
    use_worktrees: false,
  }

  const worktreeRegex = /use_worktrees\s*:\s*(\w+)/i
  const match = content.match(worktreeRegex)

  if (match && match[1]) {
    const value = match[1].toLowerCase()
    config.use_worktrees = value === "true" || value === "yes"
  }

  return config
}
