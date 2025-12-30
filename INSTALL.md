# Installation Guide

Follow these steps to install the Conductor plugin into your OpenCode environment.

## Prerequisites

*   [OpenCode](https://opencode.ai/) installed and configured.
*   Node.js and npm installed.

## 1. Build and Package

First, clone this repository and generate the distributable package:

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Create the npm tarball (.tgz)
npm pack
```

This will create a file named something like `opencode-conductor-0.1.0.tgz`.

## 2. Global Installation

Install the generated tarball into your global OpenCode configuration directory. This ensures that the plugin and its dependencies (like `smol-toml`) are available to OpenCode.

```bash
# Replace <path-to-tgz> with the absolute path to the file generated in step 1
cd ~/.config/opencode
npm install <path-to-tgz>
```

## 3. Register the Plugin

Add the plugin to your global `opencode.json` file:

**File:** `~/.config/opencode/opencode.json`

```json
{
  "plugin": [
    "opencode-conductor"
  ]
}
```

## 4. Install Slash Commands (Recommended)

To make the Conductor workflows easily accessible via `/` commands in the OpenCode TUI, you should install the command markdown files:

```bash
mkdir -p ~/.config/opencode/command
cp src/prompts/commands/*.md ~/.config/opencode/command/
```

*Note: If the `src/prompts/commands` directory doesn't exist in your version, you can manually create the files as described in the "Manual Command Creation" section below.*

## 5. Verify Installation

Restart your OpenCode session. You should see a toast notification saying "Conductor: Plugin initialized".

Try the following to verify:
*   Type `/` to see the `c-` prefixed commands.
*   Run `/c-setup` to start the project initialization.

---

## Manual Command Creation

If you prefer to create the slash commands manually, create the following files in `~/.config/opencode/command/`:

### `c-setup.md`
```markdown
---
description: Setup or resume Conductor environment
---
Invoke the conductor_setup tool to start or resume the project initialization. Do NOT create todos during this phase.
```

### `c-new.md`
```markdown
---
description: Create a new track (feature/bug)
---
Invoke the conductor_new_track tool with description: "$ARGUMENTS". Do NOT create todos during this phase.
```

### `c-implement.md`
```markdown
---
description: Implement the next pending task
---
Invoke the conductor_implement tool. If a track name is provided ("$ARGUMENTS"), use it; otherwise, implement the next available track.
```

### `c-status.md`
```markdown
---
description: Show Conductor project status
---
Invoke the conductor_status tool to summarize the project progress.
```

### `c-revert.md`
```markdown
---
description: Revert a track, phase, or task
---
Invoke the conductor_revert tool for: "$ARGUMENTS"
```
