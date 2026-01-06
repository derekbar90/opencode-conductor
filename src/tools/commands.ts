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

// Helper to execute a command prompt in a sub-session
async function executeCommand(
  ctx: PluginInput,
  toolContext: any,
  promptText: string,
  agent: string,
  description: string,
): Promise<string> {
  // Create a sub-session linked to the current one
  const createResult = await (ctx as any).client.session.create({
    body: {
      parentID: (toolContext as any).sessionID,
      title: description,
    },
  })

  if (createResult.error) return `Error: ${createResult.error}`
  const sessionID = createResult.data.id

  // Send the prompt to the agent
  await (ctx as any).client.session.prompt({
    path: { id: sessionID },
    body: {
      agent: agent,
      parts: [{ type: "text", text: promptText }],
    },
  })

  // Fetch and return the assistant's response
  const messagesResult = await (ctx as any).client.session.messages({
    path: { id: sessionID },
  })

  const lastMessage = messagesResult.data
    ?.filter((m: any) => m.info.role === "assistant")
    .pop()

  const responseText = lastMessage?.parts
    ?.filter((p: any) => p.type === "text")
    .map((p: any) => p.text)
    .join("\n") || "No response."

  return `${responseText}\n\n<task_metadata>\nsession_id: ${sessionID}\n</task_metadata>`
}

export function createSetupTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Scaffolds the project and sets up the Conductor environment",
    args: {},
    async execute(args: {}, toolContext: any) {
      const { prompt, description } = await loadPrompt("setup.toml")
      return await executeCommand(ctx, toolContext, prompt, "conductor", description)
    },
  })
}

export function createNewTrackTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Plans a track, generates track-specific spec documents and updates the tracks file",
    args: {
      description: tool.schema.string().optional().describe("Brief description of the track (feature, bug fix, chore, etc.)"),
    },
    async execute(args: { description?: string }, toolContext: any) {
      const trackDescription = args.description || ""
      const { prompt, description } = await loadPrompt("newTrack.toml", {
        args: trackDescription,
      })
      return await executeCommand(ctx, toolContext, prompt, "conductor", description)
    },
  })
}

export function createImplementTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Executes the tasks defined in the specified track's plan",
    args: {
      track_name: tool.schema.string().optional().describe("Name or description of the track to implement"),
    },
    async execute(args: { track_name?: string }, toolContext: any) {
      const trackName = args.track_name || ""
      const { prompt, description } = await loadPrompt("implement.toml", {
        track_name: trackName,
      })
      return await executeCommand(ctx, toolContext, prompt, "conductor_implementer", description)
    },
  })
}

export function createStatusTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Displays the current progress of the project",
    args: {},
    async execute(args: {}, toolContext: any) {
      const { prompt, description } = await loadPrompt("status.toml")
      return await executeCommand(ctx, toolContext, prompt, "conductor", description)
    },
  })
}

export function createRevertTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Reverts previous work",
    args: {
      target: tool.schema.string().optional().describe("Target to revert (e.g., 'track <track_id>', 'phase <phase_name>', 'task <task_name>')"),
    },
    async execute(args: { target?: string }, toolContext: any) {
      const target = args.target || ""
      const { prompt, description } = await loadPrompt("revert.toml", {
        target: target,
      })
      return await executeCommand(ctx, toolContext, prompt, "conductor", description)
    },
  })
}
