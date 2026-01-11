export interface WorkflowConfig {
  use_worktrees: boolean
}

/**
 * Parse workflow.md content and extract configuration settings
 * @param content - The content of workflow.md file
 * @returns Configuration object with parsed settings
 */
export function parseWorkflowConfig(content: string): WorkflowConfig {
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
