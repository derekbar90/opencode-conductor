# Conductor Plugin for OpenCode

> **Measure twice, code once.**

Conductor is a specialized OpenCode plugin designed to enforce a rigorous, **Context-Driven Development** lifecycle. It transforms OpenCode from a reactive coding tool into a proactive project architect that follows a strict protocol to specify, plan, and implement software features and bug fixes.

The philosophy is simple: **control your code by controlling your context.** By treating project requirements and plans as managed artifacts, Conductor ensures every agent interaction is grounded in deep, persistent project awareness.

---

## 🚀 Key Features

*   **Specialized `@conductor` Agent**: A dedicated subagent that acts as your Project Architect and Technical Lead.
*   **Native Slash Commands**: Integrated shortcuts like `/conductor:setup`, `/conductor:newTrack`, and `/conductor:implement` for frictionless project management.
*   **Modern Permissions**: Fully compatible with OpenCode v1.1.1 granular permission system.
*   **Protocol-Driven Workflow**: Automated enforcement of the **Context -> Spec -> Plan -> Implement** lifecycle.
*   **Smart Revert**: A Git-aware revert system that understands logical units of work (Tracks, Phases, Tasks) instead of just raw commit hashes.
*   **Git Worktree Support**: Optional isolated worktree environments for each Track, preventing context switching and branch conflicts.
*   **19+ Style Templates**: Built-in support for a vast range of languages including Rust, Solidity, Zig, Julia, Kotlin, Swift, and more.
*   **Zero-Config Bootstrap**: Automatically installs agents and commands to your global OpenCode configuration on first run.
*   **Sisyphus Synergy**: Optimized to work alongside [OhMyOpenCode](https://github.com/code-yeongyu/oh-my-opencode) for a multi-agent team experience.
*   **Agent Agnostic**: Commands can be invoked by any agent, giving you the freedom to choose your primary interface.

---

## 🛠️ The Conductor Lifecycle

Conductor organizes your work into **Tracks** (features or bug fixes). Every Track follows three mandatory phases:

### 1. Project Initialization (`/conductor:setup`)
Run this once per project. The agent will interview you to define:
*   **Product Vision**: Target users, core goals, and primary features.
*   **Tech Stack**: Languages, frameworks, and databases.
*   **Workflow Rules**: Testing standards (e.g., TDD), commit strategies, and documentation patterns.

### 2. Track Planning (`/conductor:newTrack`)
When you're ready for a new task, tell the agent what you want to build.
*   **Specification (`spec.md`)**: Conductor asks 3-5 targeted questions to clarify the "What" and "Why".
*   **Implementation Plan (`plan.md`)**: Once the spec is approved, Conductor generates a step-by-step checklist adhering to your project's workflow rules.

### 3. Autonomous Implementation (`/conductor:implement`)
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

## 📋 Commands Reference

| Command | Description |
| :--- | :--- |
| `/conductor:setup` | Initialize the `conductor/` directory and project "Constitution". |
| `/conductor:newTrack "desc"` | Start a new feature/bug Track with spec and plan generation. |
| `/conductor:implement` | Start implementing the next pending task in the current track. |
| `/conductor:status` | Get a high-level overview of project progress and active tracks. |
| `/conductor:revert` | Interactively select a task, phase, or track to undo via Git. |

---

## 🌲 Git Worktree Support

Conductor supports **isolated worktree environments** for each Track, preventing branch conflicts and eliminating context switching overhead.

### What are Git Worktrees?

Git worktrees allow you to have multiple working directories attached to the same repository. Each worktree can be on a different branch, letting you work on multiple features simultaneously without constantly switching branches or stashing changes.

### Why Use Worktrees with Conductor?

*   **Branch Isolation**: Each Track gets its own directory and branch (`conductor/<track_id>`)
*   **Zero Context Switching**: Work on multiple Tracks without branch conflicts
*   **Parallel Development**: Multiple Tracks can be in progress simultaneously
*   **Clean Separation**: Main working directory remains untouched during Track work
*   **Automatic Cleanup**: Worktrees are merged and removed automatically on Track completion

### Enabling Worktree Mode

Add the following to your project's `conductor/workflow.md`:

```yaml
use_worktrees: true
```

When enabled:
1. **Track Creation**: `/conductor:newTrack` creates a worktree at `../<project>-conductor-<track_id>/`
2. **Automatic Branch**: Creates and switches to branch `conductor/<track_id>`
3. **Isolated Work**: All implementation happens in the worktree directory
4. **Automatic Merge**: Track completion merges changes back to your current branch
5. **Automatic Cleanup**: Worktree directory and branch are removed after successful merge

### Example Workflow

```bash
# 1. Enable worktrees in your project
# Add "use_worktrees: true" to conductor/workflow.md

# 2. Create a new Track
/conductor:newTrack "Add user authentication"
# Creates worktree at ../myproject-conductor-auth_20260111/

# 3. Implement the Track
/conductor:implement
# All work happens in the isolated worktree

# 4. Complete the Track
# Conductor automatically:
#   - Merges conductor/auth_20260111 → your current branch
#   - Removes the worktree directory
#   - Deletes the conductor/auth_20260111 branch
```

### Fallback Behavior

If worktree creation fails (e.g., Git version too old, disk space issues), Conductor automatically falls back to normal branch-based workflow. Your work continues uninterrupted.

### Troubleshooting

**Merge Conflicts During Cleanup**:
If Track completion encounters merge conflicts:
1. Conductor lists the conflicted files
2. Manually resolve conflicts in the worktree directory
3. Run `/conductor:implement` again to complete cleanup

**Stale Worktree Directories**:
If you manually delete a worktree, run:
```bash
git worktree prune
```

For detailed troubleshooting, see `docs/worktree-workflow.md`.

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