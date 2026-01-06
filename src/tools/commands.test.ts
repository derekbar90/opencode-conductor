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
import { existsSync } from "fs"

// Mock fs/promises
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
}))

// Mock fs
vi.mock("fs", () => ({
  existsSync: vi.fn(),
}))

describe("Command Tools", () => {
  let mockCtx: PluginInput
  let mockToolContext: any
  
  beforeEach(() => {
    vi.clearAllMocks()

    mockCtx = {
      directory: "/test/project",
      isOMOActive: false,
    } as any

    mockToolContext = {
      sessionID: "test-session-id",
      messageID: "test-message-id",
    }

    // Default mocks
    vi.mocked(readFile).mockResolvedValue(`
description = "Test command"
prompt = """
Test prompt content
"""
`)
    vi.mocked(existsSync).mockReturnValue(true) // Assume setup exists by default
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
prompt = "Setup Prompt"
`)
      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)
      expect(result).toBe("Setup Prompt")
    })

    it("should NOT require setup to exist", async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      vi.mocked(readFile).mockResolvedValue(`
description = "Setup"
prompt = "Setup Prompt"
`)
      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)
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
prompt = "Track description: {{args}}"
`)
      const tool = createNewTrackTool(mockCtx)
      const result = await tool.execute({ description: "Login feature" }, mockToolContext)
      expect(result).toBe("Track description: Login feature")
    })

    it("should return error if not set up", async () => {
      vi.mocked(existsSync).mockReturnValue(false)
      const tool = createNewTrackTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)
      expect(result).toContain("Conductor is not set up")
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
prompt = "Track: {{track_name}}"
`)
      const tool = createImplementTool(mockCtx)
      const result = await tool.execute({ track_name: "auth-track" }, mockToolContext)
      expect(result).toBe("Track: auth-track")
    })

    it("should include strategy section", async () => {
       vi.mocked(readFile).mockImplementation(async (path) => {
           if (typeof path === 'string' && path.endsWith("manual.md")) {
               return "Manual Strategy"
           }
           return `
description = "Implement"
prompt = "Strategy: {{strategy_section}}"
`
       })

       const tool = createImplementTool(mockCtx)
       const result = await tool.execute({}, mockToolContext)
       expect(result).toBe("Strategy: Manual Strategy")
    })
  })

  describe("createStatusTool", () => {
    it("should execute and return prompt", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Status"
prompt = "Status Prompt"
`)
      const tool = createStatusTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)
      expect(result).toBe("Status Prompt")
    })
  })

  describe("createRevertTool", () => {
    it("should replace target in prompt", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Revert"
prompt = "Target: {{target}}"
`)
      const tool = createRevertTool(mockCtx)
      const result = await tool.execute({ target: "track 1" }, mockToolContext)
      expect(result).toBe("Target: track 1")
    })
  })

  describe("Error Handling", () => {
    it("should throw error if readFile fails", async () => {
      vi.mocked(readFile).mockRejectedValue(new Error("File not found"))
      const tool = createSetupTool(mockCtx)
      await expect(tool.execute({}, mockToolContext)).rejects.toThrow("Failed to load prompt")
    })
  })

  describe("Prompt Replacement", () => {
    it("should replace standard variables", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Test"
prompt = "Templates: {{templatesDir}}, OMO: {{isOMOActive}}"
`)
      const tool = createNewTrackTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)
      
      expect(result).toContain("Templates:")
      expect(result).toContain("OMO: false")
    })
  })
})
