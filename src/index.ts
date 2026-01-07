import type { Plugin } from "@opencode-ai/plugin";
import * as fs from "fs";
import * as path from "path";
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
  // List all files and folders which are in conductor subfolder (.json and .md files only)
  const conductorPath = path.join(directory, "conductor");
  let files: string[] = [];
  let fileHeirarchy = "";
  let llmFiles = "";

  const getFilesRecursively = (dir: string): string[] => {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFilesRecursively(filePath));
      } else {
        if (filePath.endsWith(".json") || filePath.endsWith(".md")) {
          results.push(filePath);
        }
      }
    });
    return results;
  };

  if (fs.existsSync(conductorPath)) {
    files = getFilesRecursively(conductorPath);
    fileHeirarchy = files
      .map((f) => path.relative(directory, f))
      .join("\n                    ");
    
    // Concat them nicely for the LLM using <> tags
    llmFiles = files
      .map((f) => {
        const content = fs.readFileSync(f, "utf-8");
        const relPath = path.relative(directory, f);
        return `<File path="${relPath}">\n${content}\n</File>`;
      })
      .join("\n\n");
  }

  const isConductorSetup = () => {
    const setupStatePath = path.join(conductorPath, "setup_state.json");
    return fs.existsSync(setupStatePath);
  };

  // @note read setup json file and write a utility function which will determine if setup has occured within the project yet
  const setupOccurred = isConductorSetup();

  return {
    config: async (_config) => {
      _config.command = {
        ..._config.command,
        "conductor:implement": {
          template: ImplementPrompt.prompt + `
            Environment Details: 
              - Directory: ${directory}
              - Conductor Setup: ${setupOccurred}
              - Current Conductor Files (Location: ${directory}/conductor)
                  File Tree:
                    ${fileHeirarchy}
                  
                  Files Content:
                  ${llmFiles}
          `,
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
          template: SetupPrompt.prompt + `
            Environment Details: 
              - Directory: ${directory}
              - Conductor Setup: ${setupOccurred}
          `,
          description: SetupPrompt.description,
        },
        "conductor:status": {
          template: StatusPrompt.prompt + `
          Environment Details: 
            - Directory: ${directory}
            - Conductor Setup: ${setupOccurred}
            - Current Conductor Files (Location: ${directory}/conductor)
                File Tree:
                  ${fileHeirarchy}
        `,
          description: StatusPrompt.description,
        },
      };
    },
  };
};
