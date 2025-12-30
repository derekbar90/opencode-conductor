# Installation Guide

Follow these steps to install the Conductor plugin into your OpenCode environment.

## 🚀 Simple Installation (Recommended)

Add the plugin to your global `opencode.json` file. OpenCode will automatically fetch and install it from NPM.

**File:** `~/.config/opencode/opencode.json`

```json
{
  "plugin": [
    "opencode-conductor-plugin"
  ]
}
```

### ⚡ First-Run Setup (Auto-Bootstrapping)
The Conductor plugin features a built-in bootstrap utility. The first time you start OpenCode with the plugin loaded:
1.  It will automatically install the `@conductor` agent definition to `~/.config/opencode/agent/`.
2.  It will install the `c-` slash commands to `~/.config/opencode/command/`.
3.  You will see an OpenCode notification once this is finished.

**IMPORTANT:** You must **restart OpenCode** after this first run to enable the slash commands in the TUI.

---

## ⚙️ Configuration

### Agent Model
By default, the `@conductor` agent uses your session's default model. We **highly recommend** pinning it to a "flash" model for optimal performance and cost-efficiency during the planning phases.

#### Standard OpenCode Config
**File:** `~/.config/opencode/opencode.json`
```json
{
  "agent": {
    "conductor": {
      "model": "google/gemini-3-flash"
    }
  }
}
```

#### OhMyOpenCode Config
**File:** `~/.config/opencode/oh-my-opencode.json`
```json
{
  "agents": {
    "conductor": {
      "model": "google/gemini-3-flash"
    }
  }
}
```

---

## 🏗️ Development & Manual Install

If you want to install from source or contribute to the plugin development:

### 1. Build from Source
```bash
# Clone and enter the repo
git clone https://github.com/derekbar90/opencode-conductor.git
cd opencode-conductor

# Install dependencies and build
npm install
npm run build
```

### 2. Local Linking (Real-time Development)
To see your changes reflected immediately without reinstalling:
```bash
# Inside the opencode-conductor repo
npm link

# Inside your global opencode config directory
cd ~/.config/opencode
npm link opencode-conductor-plugin
```
Then, update your `~/.config/opencode/opencode.json` to include `"opencode-conductor-plugin"`.

### 3. Manual Scaffolding (Fallback)
If the auto-bootstrapping script fails or you prefer manual control, you can copy the definitions yourself from the `dist` folder:

```bash
# Create target directories
mkdir -p ~/.config/opencode/agent
mkdir -p ~/.config/opencode/command

# Copy Agent definition
cp dist/prompts/agent/conductor.md ~/.config/opencode/agent/

# Copy Slash Commands
cp dist/prompts/commands/*.md ~/.config/opencode/command/
```

### 4. Verification
Check the terminal output where you started OpenCode. You should see:
`[Conductor] Plugin tools loaded.`

If you see errors, ensure that your `node_modules` are up to date by running `npm install` again.

---

## 🛠️ Commands Available

Once installed and restarted, type `/` in the OpenCode TUI to access:
*   **/c-setup**: Initialize project context (Product, Tech Stack, Workflow).
*   **/c-new**: Create a new feature or bug track (e.g., `/c-new "login page"`).
*   **/c-implement**: Begin autonomous implementation of the next task.
*   **/c-status**: View high-level project progress.
*   **/c-revert**: Smart undo of specific tracks, phases, or tasks.

---

## 📈 Contributing (Versioning)
This project uses **Conventional Commits**. To trigger an automated release, use the following prefixes in your commit messages:
- `feat:` for new features (Minor version bump)
- `fix:` for bug fixes (Patch version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` (No version bump)
