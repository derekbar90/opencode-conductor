import { type PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { join, dirname } from "path"
import { readFile } from "fs/promises"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Helper to load and process prompt templates
async function loadPrompt(
  filename: string,
  replacements: Record<string, string> = {},
) {
  const promptPath = join(__dirname, "..", "prompts", filename)
  try {
    const content = await readFile(promptPath, "utf-8")
    const descMatch = content.match(/description\s*=\s*"([^"]+)"/)
    const description = descMatch ? descMatch[1] : "Conductor Command"
    const promptMatch = content.match(/prompt\s*=\s*"""([\s\S]*?)"""/)
    let promptText = promptMatch ? promptMatch[1] : ""

    if (!promptText)
      throw new Error(`Could not parse prompt text from ${filename}`)

    const defaults = {
      templatesDir: join(dirname(dirname(__dirname)), "templates"),
    }

    const finalReplacements = { ...defaults, ...replacements }
    for (const [key, value] of Object.entries(finalReplacements)) {
      promptText = promptText.replaceAll(`{{${key}}}`, value || "")
    }

    return { prompt: promptText, description: description }
  } catch (error) {
    console.error(`[Conductor] Error loading prompt ${filename}:`, error)
    return {
      prompt: `SYSTEM ERROR: Failed to load prompt ${filename}`,
      description: "Error loading command",
    }
  }
}

export function createSetupTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Scaffolds the project and sets up the Conductor environment",
    args: {},
    async execute(args: {}) {
      const { prompt } = await loadPrompt("setup.toml")
      return prompt
    },
  })
}

export function createNewTrackTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Plans a track, generates track-specific spec documents and updates the tracks file",
    args: {
      description: tool.schema.string().optional().describe("Brief description of the track (feature, bug fix, chore, etc.)"),
    },
    async execute(args: { description?: string }) {
      const trackDescription = args.description || ""
      const { prompt } = await loadPrompt("newTrack.toml", {
        args: trackDescription,
      })
      return prompt
    },
  })
}

export function createImplementTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Executes the tasks defined in the specified track's plan",
    args: {
      track_name: tool.schema.string().optional().describe("Name or description of the track to implement"),
    },
    async execute(args: { track_name?: string }) {
      const trackName = args.track_name || ""
      const { prompt } = await loadPrompt("implement.toml", {
        track_name: trackName,
      })
      return prompt
    },
  })
}

export function createStatusTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Displays the current progress of the project",
    args: {},
    async execute(args: {}) {
      const { prompt } = await loadPrompt("status.toml")
      return prompt
    },
  })
}

export function createRevertTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Reverts previous work",
    args: {
      target: tool.schema.string().optional().describe("Target to revert (e.g., 'track <track_id>', 'phase <phase_name>', 'task <task_name>')"),
    },
    async execute(args: { target?: string }) {
      const target = args.target || ""
      const { prompt } = await loadPrompt("revert.toml", {
        target: target,
      })
      return prompt
    },
  })
}
