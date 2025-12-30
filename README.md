# OpenCode Conductor Plugin

This plugin brings the Conductor spec-driven development framework to OpenCode.

## Features

- **Setup**: Initialize a new or existing project with Conductor.
- **New Track**: Create feature/bug tracks with spec and plan generation.
- **Implement**: Autonomously implement tracks following a strict workflow.
- **Status**: View project progress.
- **Revert**: Smart revert of tracks/tasks.

## Usage

1. **Install**: Add this plugin to your `opencode.json` or install via npm.
2. **Setup**: Run `conductor_setup` (or ask "Setup conductor").
3. **Start**: Run `conductor_new_track` (or ask "New track").
4. **Code**: Run `conductor_implement` (or ask "Implement track").

## Development

```bash
npm install
npm run build
```