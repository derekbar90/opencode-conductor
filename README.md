# Conductor Plugin for OpenCode

> **Measure twice, code once.**

Conductor is a specialized OpenCode plugin designed to enforce a rigorous, **Context-Driven Development** lifecycle. It transforms OpenCode from a reactive coding tool into a proactive project architect that follows a strict protocol to specify, plan, and implement software features and bug fixes.

The philosophy is simple: **control your code by controlling your context.** By treating project requirements and plans as managed artifacts, Conductor ensures every agent interaction is grounded in deep, persistent project awareness.

---

## 🚀 Key Features

*   **Specialized `@conductor` Agent**: A dedicated subagent that acts as your Project Architect and Technical Lead.
*   **Native Slash Commands**: Integrated shortcuts like `/c-setup`, `/c-new`, and `/c-implement` for frictionless project management.
*   **Protocol-Driven Workflow**: Automated enforcement of the **Context -> Spec -> Plan -> Implement** lifecycle.
*   **Smart Revert**: A Git-aware revert system that understands logical units of work (Tracks, Phases, Tasks) instead of just raw commit hashes.
*   **19+ Style Templates**: Built-in support for a vast range of languages including Rust, Solidity, Zig, Julia, Kotlin, Swift, and more.
*   **Zero-Config Bootstrap**: Automatically installs agents and commands to your global OpenCode configuration on first run.
*   **Sisyphus Synergy**: Optimized to work alongside [OhMyOpenCode](https://github.com/code-yeongyu/oh-my-opencode) for a multi-agent team experience.

---

## 🛠️ The Conductor Lifecycle

Conductor organizes your work into **Tracks** (features or bug fixes). Every Track follows three mandatory phases:

### 1. Project Initialization (`/c-setup`)
Run this once per project. The `@conductor` agent will interview you to define:
*   **Product Vision**: Target users, core goals, and primary features.
*   **Tech Stack**: Languages, frameworks, and databases.
*   **Workflow Rules**: Testing standards (e.g., TDD), commit strategies, and documentation patterns.

### 2. Track Planning (`/c-new`)
When you're ready for a new task, tell Conductor what you want to build.
*   **Specification (`spec.md`)**: Conductor asks 3-5 targeted questions to clarify the "What" and "Why".
*   **Implementation Plan (`plan.md`)**: Once the spec is approved, Conductor generates a step-by-step checklist adhering to your project's workflow rules.

### 3. Autonomous Implementation (`/c-implement`)
The agent works through the `plan.md` checklist, executing tasks, running tests, and making semantic commits automatically until the Track is complete.

---

## 📦 Installation

Add the plugin to your global OpenCode configuration file. OpenCode will automatically fetch and install it from NPM.

**File:** `~/.config/opencode/opencode.json`

```json
{
  "plugin": [
    "opencode-conductor-plugin"
  ]
}
```

*Note: Please restart OpenCode after the first run to enable the global slash commands.*

---

## ⚙️ Configuration

We highly recommend pinning the `@conductor` agent to a "flash" model for optimal performance during planning phases.

### Standard OpenCode Config
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

### OhMyOpenCode Config

> **⚠️ Important:** Due to current OpenCode limitations, you need to configure the conductor agent in **both** config files when using oh-my-opencode. Additionally, the conductor agent must have the `task` tool enabled to delegate work to other agents like Sisyphus.

**File:** `~/.config/opencode/opencode.json`
```json
{
  "plugin": [
    "oh-my-opencode@latest",
    "opencode-conductor-plugin@latest"
  ],
  "agent": {
    "conductor": {
      "model": "google/gemini-3-flash",
      "tools": {
        "task": true
      }
    }
  }
}
```

**File:** `~/.config/opencode/oh-my-opencode.json`
```json
{
  "agents": {
    "conductor": {
      "model": "google/gemini-3-flash",
      "tools": {
        "task": true
      }
    }
  }
}
```

*Note: The key difference is `"agent"` (singular) in `opencode.json` vs `"agents"` (plural) in `oh-my-opencode.json`. The `task` tool is required for conductor to delegate implementation work to Sisyphus and other oh-my-opencode agents. See [Issue #3](https://github.com/derekbar90/opencode-conductor/issues/3) for details.*

---

## 📋 Commands Reference

| Command | Description |
| :--- | :--- |
| `/c-setup` | Initialize the `conductor/` directory and project "Constitution". |
| `/c-new "desc"` | Start a new feature/bug Track with spec and plan generation. |
| `/c-implement` | Start implementing the next pending task in the current track. |
| `/c-status` | Get a high-level overview of project progress and active tracks. |
| `/c-revert` | Interactively select a task, phase, or track to undo via Git. |

---

## 🤝 Synergy with OhMyOpenCode

If you use the **OhMyOpenCode** suite, `@conductor` acts as your Technical Lead. While **Sisyphus** manages the general conversation and orchestration, he can delegate complex architectural planning and protocol enforcement to the `@conductor` agent. 

Conductor includes built-in "Loop Protection" to ensure it never conflicts with OhMyOpenCode's continuation enforcers during interactive Q&A sessions.

---

## 📈 Automated Versioning

This project follows **Conventional Commits**. Releases are automated via Semantic Release:
- `feat:` -> Minor version bump
- `fix:` -> Patch version bump
- `BREAKING CHANGE:` -> Major version bump

---

## 📜 License

Distributed under the [Apache License 2.0](LICENSE).