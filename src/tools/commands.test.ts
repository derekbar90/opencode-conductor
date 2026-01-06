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
  let mockToolContext: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock session creation
    const mockSessionId = "test-session-123"
    mockClient = {
      session: {
        create: vi.fn().mockResolvedValue({
          data: { id: mockSessionId },
          error: null,
        }),
        prompt: vi.fn().mockResolvedValue(undefined),
        messages: vi.fn().mockResolvedValue({
          data: [
            {
              info: { role: "assistant" },
              parts: [{ type: "text", text: "Test response from agent" }],
            },
          ],
        }),
      },
    }

    mockCtx = {
      client: mockClient,
      directory: "/test/project",
    } as any

    mockToolContext = {
      sessionID: "parent-session-456",
      messageID: "message-789",
    }

    // Mock readFile to return a valid TOML structure
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

    it("should have no required arguments", () => {
      const tool = createSetupTool(mockCtx)
      expect(tool.args).toEqual({})
    })

    it("should load setup.toml prompt and execute command", async () => {
      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)

      expect(readFile).toHaveBeenCalled()
      expect(mockClient.session.create).toHaveBeenCalledWith({
        body: {
          parentID: "parent-session-456",
          title: "Test command",
        },
      })
      expect(mockClient.session.prompt).toHaveBeenCalled()
      expect(mockClient.session.messages).toHaveBeenCalled()
      expect(result).toContain("Test response from agent")
      expect(result).toContain("<task_metadata>")
      expect(result).toContain("session_id: test-session-123")
    })

    it("should handle session creation errors", async () => {
      mockClient.session.create.mockResolvedValue({
        data: null,
        error: "Failed to create session",
      })

      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)

      expect(result).toBe("Error: Failed to create session")
    })
  })

  describe("createNewTrackTool", () => {
    it("should create a tool with correct description", () => {
      const tool = createNewTrackTool(mockCtx)
      expect(tool.description).toBe(
        "Plans a track, generates track-specific spec documents and updates the tracks file",
      )
    })

    it("should have optional description argument", () => {
      const tool = createNewTrackTool(mockCtx)
      expect(tool.args).toHaveProperty("description")
      expect(tool.args.description).toBeDefined()
    })

    it("should pass description to prompt when provided", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "New Track"
prompt = """
Track description: {{args}}
"""
`)

      const tool = createNewTrackTool(mockCtx)
      await tool.execute({ description: "Login feature" }, mockToolContext)

      expect(mockClient.session.prompt).toHaveBeenCalled()
      const promptCall = mockClient.session.prompt.mock.calls[0][0]
      expect(promptCall.body.parts[0].text).toContain("Login feature")
    })

    it("should work without description argument", async () => {
      const tool = createNewTrackTool(mockCtx)
      await tool.execute({}, mockToolContext)

      expect(mockClient.session.create).toHaveBeenCalled()
      expect(mockClient.session.prompt).toHaveBeenCalled()
    })
  })

  describe("createImplementTool", () => {
    it("should create a tool with correct description", () => {
      const tool = createImplementTool(mockCtx)
      expect(tool.description).toBe(
        "Executes the tasks defined in the specified track's plan",
      )
    })

    it("should have optional track_name argument", () => {
      const tool = createImplementTool(mockCtx)
      expect(tool.args).toHaveProperty("track_name")
    })

    it("should pass track_name to prompt when provided", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Implement"
prompt = """
Track: {{track_name}}
"""
`)

      const tool = createImplementTool(mockCtx)
      await tool.execute({ track_name: "auth-track" }, mockToolContext)

      expect(mockClient.session.prompt).toHaveBeenCalled()
      const promptCall = mockClient.session.prompt.mock.calls[0][0]
      expect(promptCall.body.parts[0].text).toContain("auth-track")
      expect(promptCall.body.agent).toBe("conductor_implementer")
    })

    it("should use conductor_implementer agent", async () => {
      const tool = createImplementTool(mockCtx)
      await tool.execute({}, mockToolContext)

      const promptCall = mockClient.session.prompt.mock.calls[0][0]
      expect(promptCall.body.agent).toBe("conductor_implementer")
    })
  })

  describe("createStatusTool", () => {
    it("should create a tool with correct description", () => {
      const tool = createStatusTool(mockCtx)
      expect(tool.description).toBe("Displays the current progress of the project")
    })

    it("should have no required arguments", () => {
      const tool = createStatusTool(mockCtx)
      expect(tool.args).toEqual({})
    })

    it("should load status.toml and execute command", async () => {
      const tool = createStatusTool(mockCtx)
      await tool.execute({}, mockToolContext)

      expect(readFile).toHaveBeenCalled()
      expect(mockClient.session.create).toHaveBeenCalled()
      expect(mockClient.session.prompt).toHaveBeenCalled()
    })
  })

  describe("createRevertTool", () => {
    it("should create a tool with correct description", () => {
      const tool = createRevertTool(mockCtx)
      expect(tool.description).toBe("Reverts previous work")
    })

    it("should have optional target argument", () => {
      const tool = createRevertTool(mockCtx)
      expect(tool.args).toHaveProperty("target")
    })

    it("should pass target to prompt when provided", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Revert"
prompt = """
Target: {{target}}
"""
`)

      const tool = createRevertTool(mockCtx)
      await tool.execute({ target: "track auth-track" }, mockToolContext)

      expect(mockClient.session.prompt).toHaveBeenCalled()
      const promptCall = mockClient.session.prompt.mock.calls[0][0]
      expect(promptCall.body.parts[0].text).toContain("track auth-track")
    })

    it("should work without target argument", async () => {
      const tool = createRevertTool(mockCtx)
      await tool.execute({}, mockToolContext)

      expect(mockClient.session.create).toHaveBeenCalled()
      expect(mockClient.session.prompt).toHaveBeenCalled()
    })
  })

  describe("Error Handling", () => {
    it("should handle file read errors gracefully", async () => {
      vi.mocked(readFile).mockRejectedValue(new Error("File not found"))

      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)

      // Should still attempt to execute, but with error prompt
      expect(mockClient.session.create).toHaveBeenCalled()
      expect(mockClient.session.prompt).toHaveBeenCalled()
    })

    it("should handle missing prompt text in TOML", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Test"
prompt = ""
`)

      const tool = createSetupTool(mockCtx)
      
      // Should handle error gracefully - the error is caught and returns error message
      // The tool will still execute but with an error prompt
      const result = await tool.execute({}, mockToolContext)
      expect(mockClient.session.create).toHaveBeenCalled()
      expect(mockClient.session.prompt).toHaveBeenCalled()
      // The prompt should contain the error message
      const promptCall = mockClient.session.prompt.mock.calls[0][0]
      expect(promptCall.body.parts[0].text).toContain("SYSTEM ERROR")
    })

    it("should handle empty messages response", async () => {
      mockClient.session.messages.mockResolvedValue({
        data: [],
      })

      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)

      expect(result).toContain("No response.")
    })

    it("should handle messages with no text parts", async () => {
      mockClient.session.messages.mockResolvedValue({
        data: [
          {
            info: { role: "assistant" },
            parts: [{ type: "image", url: "test.jpg" }],
          },
        ],
      })

      const tool = createSetupTool(mockCtx)
      const result = await tool.execute({}, mockToolContext)

      expect(result).toContain("No response.")
    })
  })

  describe("Prompt Replacement", () => {
    it("should replace template variables in prompts", async () => {
      vi.mocked(readFile).mockResolvedValue(`
description = "Test"
prompt = """
Templates dir: {{templatesDir}}
Args: {{args}}
"""
`)

      const tool = createNewTrackTool(mockCtx)
      await tool.execute({ description: "test track" }, mockToolContext)

      const promptCall = mockClient.session.prompt.mock.calls[0][0]
      const promptText = promptCall.body.parts[0].text
      
      // Should replace templatesDir
      expect(promptText).toContain("Templates dir:")
      // Should replace args
      expect(promptText).toContain("test track")
    })
  })
})
