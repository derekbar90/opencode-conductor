import { describe, it, expect, vi, beforeEach } from "vitest"
import { type PluginInput } from "@opencode-ai/plugin"
import {
  createSetupTool,
  createNewTrackTool,
  createImplementTool,
  createStatusTool,
  createRevertTool,
} from "./commands.js"
import { readFile } from "fs/promises"

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}))

describe("Command Tools", () => {
  let mockCtx: PluginInput
  
  beforeEach(() => {
    vi.clearAllMocks()

    mockCtx = {
      directory: "/test/project",
      isOMOActive: false,
    } as any

    // Default mocks - must use triple quotes for the regex in commandFactory
    vi.mocked(readFile).mockResolvedValue(`
description = "Test command"
prompt = """
Test prompt content
"""
`)
  })

  describe("createSetupTool", () => {
    it("should create a tool with correct description", () => {
      const tool = createSetupTool(mockCtx)
      expect(tool.description).toBe(
        "Scaffolds the project and sets up the Conductor environment",
      )
    })

    it("should return prompt text when executed", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Setup"
prompt = """Setup Prompt"""
`)
      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({})
      expect(result).toBe("Setup Prompt")
    })
  })

  describe("createNewTrackTool", () => {
    it("should have optional description argument", () => {
      const tool = createNewTrackTool(mockCtx)
      expect(tool.args).toHaveProperty("description")
    })

    it("should replace description in prompt", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "New Track"
prompt = """Track description: {{args}}"""
`)
      const tool = createNewTrackTool(mockCtx)
      const result = await tool.execute({ description: "Login feature" })
      expect(result).toBe("Track description: Login feature")
    })
  })

  describe("createImplementTool", () => {
    it("should have optional track_name argument", () => {
      const tool = createImplementTool(mockCtx)
      expect(tool.args).toHaveProperty("track_name")
    })

    it("should replace track_name in prompt", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Implement"
prompt = """Track: {{track_name}}"""
`)
      const tool = createImplementTool(mockCtx)
      const result = await tool.execute({ track_name: "auth-track" })
      expect(result).toBe("Track: auth-track")
    })

    it("should include strategy section", async () => {
       vi.mocked(readFile).mockImplementation(async (path) => {
           if (typeof path === 'string' && path.endsWith("manual.md")) {
               return "Manual Strategy"
           }
           return `
description = "Implement"
prompt = """Strategy: {{strategy_section}}"""
`
       })

       const tool = createImplementTool(mockCtx)
       const result = await tool.execute({})
       expect(result).toBe("Strategy: Manual Strategy")
    })
  })

  describe("createStatusTool", () => {
    it("should execute and return prompt", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Status"
prompt = """Status Prompt"""
`)
      const tool = createStatusTool(mockCtx)
      const result = await tool.execute({})
      expect(result).toBe("Status Prompt")
    })
  })

  describe("createRevertTool", () => {
    it("should replace target in prompt", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Revert"
prompt = """Target: {{target}}"""
`)
      const tool = createRevertTool(mockCtx)
      const result = await tool.execute({ target: "track 1" })
      expect(result).toBe("Target: track 1")
    })
  })

  describe("Error Handling", () => {
    it("should return error string if readFile fails", async () => {
      vi.mocked(readFile).mockRejectedValue(new Error("File not found"))
      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({})
      expect(result).toContain("SYSTEM ERROR: Failed to load prompt")
    })
  })

  describe("Prompt Replacement", () => {
    it("should replace standard variables", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Test"
prompt = """Templates: {{templatesDir}}"""
`)
      const tool = createNewTrackTool(mockCtx)
      const result = await tool.execute({})
      
      expect(result).toContain("Templates:")
    })
  })
})
