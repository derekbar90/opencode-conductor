import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { createConductorCommand } from "../utils/commandFactory.js"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { readFile } from "fs/promises"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const setupCommand = createConductorCommand({
  name: "setup.toml",
  description: "Scaffolds the project and sets up the Conductor environment",
  requiresSetup: false,
  args: {},
})

export const newTrackCommand = createConductorCommand({
  name: "newTrack.toml",
  description: "Plans a track, generates track-specific spec documents and updates the tracks file",
  args: {
    description: tool.schema.string().optional().describe("Brief description of the track (feature, bug fix, chore, etc.)"),
  },
  additionalContext: async (ctx, args) => {
    return {
      args: args.description || "",
    }
  },
})

export const implementCommand = createConductorCommand({
  name: "implement.toml",
  description: "Executes the tasks defined in the specified track's plan",
  args: {
    track_name: tool.schema.string().optional().describe("Name or description of the track to implement"),
  },
  additionalContext: async (ctx, args) => {
    // 1. Choose strategy based on OMO activity
    const strategyFile = (ctx as any).isOMOActive ? "delegate.md" : "manual.md"
    const strategyPath = join(__dirname, "../prompts/strategies", strategyFile)
    
    let strategySection = ""
    try {
      strategySection = await readFile(strategyPath, "utf-8")
    } catch (e) {
      console.warn(`[Conductor] Failed to load strategy ${strategyFile}:`, e)
      strategySection = "Error: Could not load execution strategy."
    }

    return {
      strategy_section: strategySection,
      track_name: args.track_name || "",
    }
  },
})

export const statusCommand = createConductorCommand({
  name: "status.toml",
  description: "Displays the current progress of the project",
  args: {},
})

export const revertCommand = createConductorCommand({
  name: "revert.toml",
  description: "Reverts previous work",
  args: {
    target: tool.schema.string().optional().describe("Target to revert (e.g., 'track <track_id>', 'phase <phase_name>', 'task <task_name>')"),
  },
  additionalContext: async (ctx, args) => {
    return {
      target: args.target || "",
    }
  },
})

// Export as functions for backward compatibility
export function createSetupTool(ctx: any): ToolDefinition {
  return setupCommand(ctx)
}

export function createNewTrackTool(ctx: any): ToolDefinition {
  return newTrackCommand(ctx)
}

export function createImplementTool(ctx: any): ToolDefinition {
  return implementCommand(ctx)
}

export function createStatusTool(ctx: any): ToolDefinition {
  return statusCommand(ctx)
}

export function createRevertTool(ctx: any): ToolDefinition {
  return revertCommand(ctx)
}
