import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"
import { type PluginInput } from "@opencode-ai/plugin"

export interface BackgroundTask {
  id: string
  sessionID: string
  parentSessionID: string
  parentMessageID?: string
  description: string
  prompt: string
  agent: string
  status: "running" | "completed" | "failed" | "cancelled"
  startedAt: Date
  completedAt?: Date
  error?: string
  progress: {
    toolCalls: number
    lastUpdate: Date
  }
}

export interface LaunchInput {
  description: string
  prompt: string
  agent: string
  parentSessionID: string
  parentMessageID?: string
}

export interface BackgroundTaskArgs {
  description: string
  prompt: string
  agent: string
}

export interface BackgroundOutputArgs {
  task_id: string
  block?: boolean
  timeout?: number
}

const BACKGROUND_TASK_DESCRIPTION = "Launch a specialized agent in the background to perform research or implementation tasks."
const BACKGROUND_OUTPUT_DESCRIPTION = "Retrieve the results or status of a background task."

export class BackgroundManager {
  private tasks: Map<string, BackgroundTask>
  private client: any
  private pollingInterval?: ReturnType<typeof setInterval>

  constructor(ctx: PluginInput) {
    this.tasks = new Map()
    this.client = (ctx as any).client
  }

  async launch(input: LaunchInput): Promise<BackgroundTask> {
    if (!input.agent || input.agent.trim() === "") {
      throw new Error("Agent parameter is required")
    }

    const createResult = await this.client.session.create({
      body: {
        parentID: input.parentSessionID,
        title: `Background: ${input.description}`,
      },
    })

    if (createResult.error) {
      throw new Error(`Failed to create background session: ${createResult.error}`)
    }

    const sessionID = createResult.data.id

    const task: BackgroundTask = {
      id: `bg_${Math.random().toString(36).substring(2, 10)}`,
      sessionID,
      parentSessionID: input.parentSessionID,
      parentMessageID: input.parentMessageID,
      description: input.description,
      prompt: input.prompt,
      agent: input.agent,
      status: "running",
      startedAt: new Date(),
      progress: {
        toolCalls: 0,
        lastUpdate: new Date(),
      },
    }

    this.tasks.set(task.id, task)
    this.startPolling()

    this.client.session.promptAsync({
      path: { id: sessionID },
      body: {
        agent: input.agent,
        tools: {
          "conductor:background_task": false,
          "conductor:delegate": false,
        },
        parts: [{ type: "text", text: input.prompt }],
      },
    }).catch((error: any) => {
      console.error("[Conductor] Background task error:", error)
      task.status = "failed"
      task.error = String(error)
    })

    return task
  }

  async cancel(id: string): Promise<string> {
    const task = this.tasks.get(id)
    if (!task) return `Task not found: ${id}`
    if (task.status !== "running") return `Task is not running (status: ${task.status})`

    task.status = "cancelled"
    task.completedAt = new Date()
    
    // Attempt to notify parent session
    await this.client.session.prompt({
      path: { id: task.parentSessionID },
      body: {
        parts: [{ type: "text", text: `[BACKGROUND TASK CANCELLED] Task "${task.description}" has been manually cancelled.` }],
      },
    }).catch(() => {}) // Ignore errors here, as the parent session might be gone

    return `Task ${id} cancelled successfully.`
  }

  private async pollRunningTasks(): Promise<void> {
    try {
      const statusResult = await this.client.session.status()
      const allStatuses = (statusResult.data ?? {}) as Record<string, { type: string }>

      for (const task of this.tasks.values()) {
        if (task.status !== "running") continue

        const sessionStatus = allStatuses[task.sessionID]
        if (sessionStatus?.type === "idle") {
          this.completeTask(task)
        }
      }

      if (!this.hasRunningTasks()) {
        this.stopPolling()
      }
    } catch (e) {
      console.error("[Conductor] Polling error:", e)
    }
  }

  private completeTask(task: BackgroundTask) {
    task.status = "completed"
    task.completedAt = new Date()
    this.notifyParentSession(task)
  }

  private async notifyParentSession(task: BackgroundTask) {
    const message = `[BACKGROUND TASK COMPLETED] Task "${task.description}" finished. Use conductor:background_output with task_id="${task.id}" to get results.`
    
    await this.client.session.prompt({
      path: { id: task.parentSessionID },
      body: {
        parts: [{ type: "text", text: message }],
      },
    }).catch(() => {}) // Ignore errors here, as the parent session might be gone
  }

  getTask(id: string): BackgroundTask | undefined {
    return this.tasks.get(id)
  }

  private startPolling() {
    if (this.pollingInterval) return
    this.pollingInterval = setInterval(() => this.pollRunningTasks(), 3000)
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = undefined
    }
  }

  private hasRunningTasks(): boolean {
    return Array.from(this.tasks.values()).some(t => t.status === "running")
  }
}

export function createBackgroundTask(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: BACKGROUND_TASK_DESCRIPTION,
    args: {
      description: tool.schema.string().describe("Short task description"),
      prompt: tool.schema.string().describe("Full detailed prompt for the agent"),
      agent: tool.schema.string().describe("Agent type to use"),
    },
    async execute(args: BackgroundTaskArgs, toolContext) {
      const ctx = toolContext as any
      const task = await manager.launch({
        description: args.description,
        prompt: args.prompt,
        agent: args.agent.trim(),
        parentSessionID: ctx.sessionID,
        parentMessageID: ctx.messageID,
      })

      return `Background task launched successfully. Task ID: ${task.id}`
    },
  })
}

export function createBackgroundOutput(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: BACKGROUND_OUTPUT_DESCRIPTION,
    args: {
      task_id: tool.schema.string().describe("Task ID to get output from"),
      block: tool.schema.boolean().optional().describe("Wait for completion"),
      timeout: tool.schema.number().optional().describe("Max wait time in ms"),
    },
    async execute(args: BackgroundOutputArgs, toolContext) {
      const task = manager.getTask(args.task_id)
      if (!task) return `Task not found: ${args.task_id}`

      if (args.block && task.status === "running") {
        const startTime = Date.now()
        const timeoutMs = Math.min(args.timeout ?? 60000, 600000)
        while (Date.now() - startTime < timeoutMs) {
          await new Promise(r => setTimeout(r, 2000))
          // Re-fetch task to get the latest status
          if (manager.getTask(args.task_id)?.status === "completed") break
        }
      }

      if (task.status === "completed") {
        const client = (toolContext as any).client || (manager as any).client
        const messagesResult = await client.session.messages({
          path: { id: task.sessionID },
        })

        const lastMessage = messagesResult.data
          ?.filter((m: any) => m.info.role === "assistant")
          .pop()

        const responseText = lastMessage?.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text).join("\n") || "No response."

        return `### Results for: ${task.description}\n\n${responseText}`
      }

      return `Task status: ${task.status}. (Started at: ${task.startedAt.toISOString()})`
    },
  })
}

export function createBackgroundCancel(manager: BackgroundManager): ToolDefinition {
  return tool({
    description: "Cancel a running background task",
    args: {
      taskId: tool.schema.string().describe("Task ID to cancel"),
    },
    async execute(args: { taskId: string }) {
      return await manager.cancel(args.taskId)
    },
  })
}