import { describe, it, expect, vi, beforeEach } from "vitest"
import { parseWorkflowConfig } from "./workflowParser.js"
import { readFileSync } from "fs"

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}))

describe("workflowParser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("parseWorkflowConfig", () => {
    it("should parse workflow.md with use_worktrees: true", () => {
      const content = `# Project Workflow

## Configuration
use_worktrees: true

## Other sections...`
      
      vi.mocked(readFileSync).mockReturnValue(content)
      
      const config = parseWorkflowConfig("/test/project")
      expect(config.use_worktrees).toBe(true)
      expect(readFileSync).toHaveBeenCalledWith("/test/project/conductor/workflow.md", "utf8")
    })

    it("should parse workflow.md with use_worktrees: false", () => {
      const content = `# Project Workflow

## Configuration
use_worktrees: false

## Other sections...`
      
      vi.mocked(readFileSync).mockReturnValue(content)
      
      const config = parseWorkflowConfig("/test/project")
      expect(config.use_worktrees).toBe(false)
      expect(readFileSync).toHaveBeenCalledWith("/test/project/conductor/workflow.md", "utf8")
    })

    it("should default to false when worktree config is not specified", () => {
      const content = `# Project Workflow

## Guiding Principles
1. **The Plan is the Source of Truth**

## Other sections...`
      
      vi.mocked(readFileSync).mockReturnValue(content)
      
      const config = parseWorkflowConfig("/test/project")
      expect(config.use_worktrees).toBe(false)
    })

    it("should handle empty content", () => {
      const content = ""
      
      vi.mocked(readFileSync).mockReturnValue(content)
      
      const config = parseWorkflowConfig("/test/project")
      expect(config.use_worktrees).toBe(false)
    })

    it("should be case-insensitive for the configuration key", () => {
      const content = `# Project Workflow

## Configuration
USE_WORKTREES: true`
      
      vi.mocked(readFileSync).mockReturnValue(content)
      
      const config = parseWorkflowConfig("/test/project")
      expect(config.use_worktrees).toBe(true)
    })

    it("should handle various boolean representations", () => {
      const testCases = [
        { input: "true", expected: true },
        { input: "True", expected: true },
        { input: "TRUE", expected: true },
        { input: "yes", expected: true },
        { input: "false", expected: false },
        { input: "False", expected: false },
        { input: "FALSE", expected: false },
        { input: "no", expected: false },
      ]

      testCases.forEach(({ input, expected }) => {
        const content = `use_worktrees: ${input}`
        vi.mocked(readFileSync).mockReturnValue(content)
        
        const config = parseWorkflowConfig("/test/project")
        expect(config.use_worktrees).toBe(expected)
      })
    })
  })
})
