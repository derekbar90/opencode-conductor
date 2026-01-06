import { type PluginInput } from "@opencode-ai/plugin"
import { tool, type ToolDefinition } from "@opencode-ai/plugin/tool"

export function createDelegationTool(ctx: PluginInput): ToolDefinition {
  return tool({
    description: "Delegate a specific task to a specialized subagent",
    args: {
      task_description: tool.schema.string().describe("Summary of the work"),
      subagent_type: tool.schema.string().describe("The name of the agent to call"),
      prompt: tool.schema.string().describe("Detailed instructions for the subagent"),
    },
    async execute(args: any, toolContext: any) {
      // 1. Create a sub-session linked to the current one
      const createResult = await (ctx as any).client.session.create({
        body: {
          parentID: (toolContext as any).sessionID,
          title: `${args.task_description} (Delegated to ${args.subagent_type})`,
        },
      })

      if (createResult.error) return `Error: ${createResult.error}`
      const sessionID = createResult.data.id

      // 2. Send the prompt to the subagent
      await (ctx as any).client.session.prompt({
        path: { id: sessionID },
        body: {
          agent: args.subagent_type,
          tools: {
            "conductor_delegate": false, 
          },
          parts: [{ type: "text", text: args.prompt }],
        },
      })

      // 3. Fetch and return the assistant's response
      const messagesResult = await (ctx as any).client.session.messages({
        path: { id: sessionID },
      })

      const lastMessage = messagesResult.data
        ?.filter((m: any) => m.info.role === "assistant")
        .pop()

      const responseText = lastMessage?.parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text).join("\n") || "No response."

      return `${responseText}\n\n<task_metadata>\nsession_id: ${sessionID}\n</task_metadata>`
    },
  })
}
