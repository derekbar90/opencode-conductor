# Installation Guide

Follow these steps to install the Conductor plugin into your OpenCode environment.

## 🚀 Simple Installation (Recommended)

Add the plugin to your global `opencode.json` file. OpenCode will automatically fetch and install it from NPM.

**File:** `~/.config/opencode/opencode.json`

```json
{
  "plugin": [
    "@derekbar90/opencode-conductor"
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

## 🛠️ Commands Available

Once installed and restarted, type `/` in the OpenCode TUI to access:
*   **/c-setup**: Initialize project context (Product, Tech Stack, Workflow).
*   **/c-new**: Create a new feature or bug track (e.g., `/c-new "login page"`).
*   **/c-implement**: Begin autonomous implementation of the next task.
*   **/c-status**: View high-level project progress.
*   **/c-revert**: Smart undo of specific tracks, phases, or tasks.

---

## 🏗️ Development & Manual Install

If you want to install from source or contribute:

### 1. Build and Package
```bash
npm install
npm run build
npm pack
```

### 2. Local Installation
```bash
cd ~/.config/opencode
npm install /path/to/opencode-conductor-0.1.0.tgz
```

### 3. Contributing (Versioning)
This project uses **Conventional Commits**. To trigger an automated release, use the following prefixes in your commit messages:
- `feat:` for new features (Minor version bump)
- `fix:` for bug fixes (Patch version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` (No version bump)