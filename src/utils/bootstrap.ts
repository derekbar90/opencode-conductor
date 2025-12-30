import { existsSync, mkdirSync, copyFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function bootstrap(ctx: any) {
  const opencodeConfigDir = join(homedir(), ".config", "opencode");
  const targetAgentDir = join(opencodeConfigDir, "agent");
  const targetCommandDir = join(opencodeConfigDir, "command");

  const sourcePromptsDir = join(__dirname, "../prompts");
  const sourceAgentFile = join(sourcePromptsDir, "agent/conductor.md");
  const sourceCommandsDir = join(sourcePromptsDir, "commands");

  let installedAnything = false;

  // 1. Ensure directories exist
  if (!existsSync(targetAgentDir)) mkdirSync(targetAgentDir, { recursive: true });
  if (!existsSync(targetCommandDir)) mkdirSync(targetCommandDir, { recursive: true });

  // 2. Install Agent if missing
  const targetAgentFile = join(targetAgentDir, "conductor.md");
  if (!existsSync(targetAgentFile)) {
    if (existsSync(sourceAgentFile)) {
      copyFileSync(sourceAgentFile, targetAgentFile);
      installedAnything = true;
    }
  }

  // 3. Install Commands if missing
  if (existsSync(sourceCommandsDir)) {
    const commands = readdirSync(sourceCommandsDir);
    for (const cmdFile of commands) {
      const targetCmdFile = join(targetCommandDir, cmdFile);
      if (!existsSync(targetCmdFile)) {
        copyFileSync(join(sourceCommandsDir, cmdFile), targetCmdFile);
        installedAnything = true;
      }
    }
  }

  if (installedAnything) {
    // Do not await toasts during bootstrapping as the TUI might not be ready
    ctx.client.tui.showToast({
      body: {
        title: "Conductor",
        message: "First-run setup: Conductor agent and commands installed globally. Please restart OpenCode to enable slash commands.",
        variant: "info",
        duration: 5000
      }
    }).catch(() => {});
  }
}
