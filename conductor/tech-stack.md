# Technology Stack: OpenCode Conductor Plugin

## Overview

OpenCode Conductor is built as a TypeScript-based Node.js plugin for the OpenCode ecosystem. The technology choices prioritize type safety, modularity, and seamless integration with the OpenCode plugin architecture.

---

## Core Technologies

### Programming Language

**TypeScript 5.0+**
- **Version**: 5.0.0 or higher
- **Target**: ES2022
- **Module System**: ES Modules (NodeNext)
- **Configuration**: Strict mode enabled for maximum type safety
- **Rationale**: TypeScript provides compile-time type checking, excellent IDE support, and prevents runtime errors. ES2022 features enable modern JavaScript syntax while maintaining broad Node.js compatibility.

### Runtime Platform

**Node.js**
- **Module Resolution**: NodeNext (ES Modules)
- **Compatibility**: Targets modern Node.js LTS versions (v18+)
- **Module Type**: ES Modules (type: "module" in package.json)
- **Rationale**: Node.js provides the runtime environment for OpenCode plugins. ES Modules offer better tree-shaking, clearer dependency management, and align with modern JavaScript standards.

---

## Core Dependencies

### Plugin Framework

**@opencode-ai/plugin (^1.0.209)**
- **Purpose**: Core plugin SDK for OpenCode integration
- **Usage**: Provides plugin lifecycle hooks, tool definitions, agent integration, and context access
- **Key Imports**:
  - `Plugin` - Main plugin type definition
  - `tool` - Tool definition utilities
  - `ToolDefinition` - Type for tool specifications
- **Rationale**: Official OpenCode SDK ensures compatibility and access to OpenCode's agent orchestration system.

### Configuration Parsing

**smol-toml (^1.6.0)**
- **Purpose**: TOML configuration file parser
- **Usage**: Loads command prompts and configuration from `.toml` files
- **Rationale**: TOML provides a clean, human-readable format for structured configuration. The `smol-toml` library is lightweight and has zero dependencies.

---

## Development Dependencies

### Release Automation

**semantic-release (^24.2.1)**
- **Purpose**: Automated versioning and package publishing
- **Configuration**: Conventional Commits standard
- **Workflow**:
  - `feat:` commits → minor version bump
  - `fix:` commits → patch version bump
  - `BREAKING CHANGE:` → major version bump
- **Plugins Used**:
  - `@semantic-release/commit-analyzer` - Analyzes commit messages
  - `@semantic-release/release-notes-generator` - Generates CHANGELOG
  - `@semantic-release/changelog` - Updates CHANGELOG.md
  - `@semantic-release/npm` - Publishes to NPM registry
  - `@semantic-release/git` - Commits version bumps
  - `@semantic-release/github` - Creates GitHub releases

### Type Definitions

**@types/node (^20.0.0)**
- **Purpose**: TypeScript type definitions for Node.js APIs
- **Coverage**: File system, path manipulation, OS utilities, process management
- **Rationale**: Enables type-safe usage of Node.js built-in modules.

---

## Build System

### Compilation

**TypeScript Compiler (tsc)**
- **Input**: `src/**/*` TypeScript files
- **Output**: `dist/` directory with JavaScript + declaration files
- **Configuration**: `tsconfig.json`
  - Target: ES2022
  - Module: NodeNext
  - Strict mode: Enabled
  - Declaration files: Generated (.d.ts)
  - Source maps: Not generated (production builds)

### Build Scripts

**NPM Scripts** (defined in `package.json`):
```json
{
  "build": "tsc && npm run copy-prompts && npm run copy-templates",
  "copy-prompts": "mkdir -p dist/prompts && cp src/prompts/*.toml src/prompts/*.md dist/prompts/ && mkdir -p dist/prompts/agent && cp src/prompts/agent/*.md dist/prompts/agent/ && mkdir -p dist/prompts/commands && cp src/prompts/commands/*.md dist/prompts/commands/ && mkdir -p dist/prompts/strategies && cp src/prompts/strategies/*.md dist/prompts/strategies/",
  "copy-templates": "mkdir -p dist/templates && cp -r src/templates/* dist/templates/",
  "postinstall": "node scripts/postinstall.cjs",
  "prepublishOnly": "npm run build"
}
```

**Build Process:**
1. TypeScript compilation (`tsc`)
2. Copy prompt files (`.toml`, `.md`) to `dist/prompts/`
3. Copy template files to `dist/templates/`
4. Post-install script runs bootstrap logic

---

## Architecture

### Plugin Architecture Pattern

**Command-Based Design:**
- Each slash command (`/c-setup`, `/c-new`, etc.) maps to a dedicated command handler
- Command handlers are registered as OpenCode tools
- Commands load their prompts from TOML files for separation of logic and content

**Directory Structure:**
```
src/
├── commands/          # Command handlers (setup, newTrack, implement, status, revert)
├── prompts/           # TOML and Markdown prompt templates
│   ├── agent/         # Agent-specific prompts
│   ├── commands/      # Command-specific prompts
│   └── strategies/    # Execution strategy prompts
├── templates/         # Code style guides and workflow templates
│   ├── code_styleguides/  # 19+ language style guides
│   └── workflow.md    # Default workflow template
├── utils/             # Shared utilities
│   ├── stateManager.ts     # State persistence and retrieval
│   ├── promptLoader.ts     # TOML/Markdown prompt loading
│   └── bootstrap.ts        # Global configuration bootstrap
└── index.ts           # Plugin entry point
```

### State Management

**StateManager Utility:**
- Manages `conductor/setup_state.json` for setup resumption
- Tracks track metadata in `conductor/tracks/<track_id>/metadata.json`
- Provides atomic read/write operations for state files

### Prompt System

**PromptLoader Utility:**
- Loads TOML files with variable interpolation
- Supports template variables (e.g., `{{templatesDir}}`, `{{isOMOActive}}`)
- Returns formatted prompt strings for agent consumption

---

## External Integrations

### Git Version Control

**Required Tooling:**
- Git CLI must be available in PATH
- Used for:
  - Repository initialization (`git init`)
  - Status checking (`git status --porcelain`)
  - Commit creation with conventional messages
  - Git notes for task summaries
  - Revert operations at track/phase/task granularity

### NPM Registry

**Publishing Target:**
- Registry: `https://registry.npmjs.org/`
- Package Name: `opencode-conductor-plugin`
- Access: Public
- Automated via semantic-release on main branch

### GitHub

**CI/CD Platform:**
- GitHub Actions workflows in `.github/workflows/`
- Automated publishing on release
- Asset packaging and upload

---

## Template System

### Code Style Guides (19+ Languages)

**Available Templates:**
- **Popular Languages**: TypeScript, JavaScript, Python, Java, Go, Rust
- **Modern Languages**: Kotlin, Swift, Zig, Julia, Solidity, Dart
- **Web Technologies**: React, Vue, HTML/CSS
- **System Languages**: C, C++, C#
- **Scripting**: Ruby, PHP, Shell, SQL

**Location**: `src/templates/code_styleguides/*.md`

**Usage**: Copied to `conductor/code_styleguides/` during project setup based on detected or selected tech stack.

### Workflow Template

**Default Workflow** (`src/templates/workflow.md`):
- Test-Driven Development (TDD) guidelines
- Commit strategy (per-task or per-phase)
- Test coverage requirements (default: 80%)
- Git notes usage for task summaries
- Phase completion verification protocols

---

## Compatibility Requirements

### Node.js Version
- **Minimum**: Node.js 18 (LTS)
- **Recommended**: Node.js 20 (LTS)
- **Reason**: ES Modules support, modern JavaScript features (ES2022)

### OpenCode Version
- **Minimum**: Compatible with `@opencode-ai/plugin` ^1.0.209
- **Integration**: Requires OpenCode plugin system support

### Operating Systems
- **Supported**: macOS, Linux, Windows (WSL2 recommended)
- **Requirements**: Git CLI, Node.js/NPM

### OhMyOpenCode Integration
- **Optional**: Detects and integrates with `oh-my-opencode` plugin
- **Detection Methods**:
  1. Check for plugin in `~/.cache/opencode/node_modules/`
  2. Check `opencode.json` plugin array
  3. Check for `oh-my-opencode.json` config file
- **Synergy Features**: Loop protection during interactive Q&A

---

## Future Technology Considerations

### Potential Additions

**Database for State Management:**
- Current: JSON files in `conductor/` directory
- Future: SQLite or LevelDB for complex query support and concurrent access

**Web UI for Track Management:**
- Current: CLI-only interface
- Future: Optional web dashboard for visualizing tracks, specs, and progress

**Multi-Repository Support:**
- Current: Single repository per conductor instance
- Future: Monorepo awareness and cross-repo track dependencies

**Language Server Protocol (LSP) Integration:**
- Current: Template-based code style guides
- Future: Real-time linting and style enforcement via LSP

---

## Technology Decision Rationale

### Why TypeScript?
- **Type Safety**: Catch errors at compile time, not runtime
- **Developer Experience**: Excellent IDE support, autocomplete, refactoring
- **Ecosystem**: Native OpenCode plugin SDK support
- **Maintainability**: Self-documenting code through type annotations

### Why ES Modules?
- **Modern Standard**: Aligned with ECMAScript specifications
- **Tree Shaking**: Better bundle optimization (future consideration)
- **Clarity**: Explicit imports/exports improve code readability
- **Interoperability**: Better integration with modern tooling

### Why TOML for Configuration?
- **Readability**: More human-friendly than JSON or YAML for configuration
- **Structure**: Supports nested tables and clear hierarchies
- **Minimal**: Simple syntax without YAML's ambiguity pitfalls
- **Tooling**: Lightweight parser with zero dependencies

### Why Semantic Release?
- **Automation**: Eliminates manual versioning and changelog maintenance
- **Consistency**: Enforces conventional commit standards
- **Transparency**: Automated release notes and GitHub releases
- **Reliability**: Industry-standard tool used by thousands of projects

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test plugin locally (requires OpenCode installation)
# Edit ~/.config/opencode/opencode.json to include local plugin path
```

### Publishing Workflow
1. Commit changes using conventional commit format
2. Push to main branch
3. GitHub Actions triggers semantic-release
4. Version bumped automatically based on commit type
5. CHANGELOG.md updated
6. Package published to NPM
7. GitHub release created

### Testing Strategy
- **Current**: Manual testing via OpenCode plugin system
- **Future**: Unit tests for utility modules, integration tests for commands
