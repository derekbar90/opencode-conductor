import type { Plugin } from "@opencode-ai/plugin";
import ImplementPrompt from "./prompts/conductor/implement.json" with { type: "json" };
import NewTrackPrompt from "./prompts/conductor/newTrack.json" with { type: "json" };
import RevertPrompt from "./prompts/conductor/revert.json" with { type: "json" };
import SetupPrompt from "./prompts/conductor/setup.json" with { type: "json" };
import StatusPrompt from "./prompts/conductor/status.json" with { type: "json" };

export const MyPlugin: Plugin = async ({
  project,
  client,
  $,
  directory,
  worktree,
}) => {
  return {
    config: async (_config) => {
      _config.command = {
        ..._config.command,
        "conductor:implement": {
          template: ImplementPrompt.prompt,
          description: ImplementPrompt.description,
        },
        "conductor:newTrack": {
          template: NewTrackPrompt.prompt,
          description: NewTrackPrompt.description,
        },
        "conductor:revert": {
          template: RevertPrompt.prompt,
          description: RevertPrompt.description,
        },
        "conductor:setup": {
          template: SetupPrompt.prompt,
          description: SetupPrompt.description,
        },
        "conductor:status": {
          template: StatusPrompt.prompt,
          description: StatusPrompt.description,
        },
      };
    },
  };
};
