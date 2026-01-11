# Product Guide: OpenCode Conductor Plugin

## Overview

OpenCode Conductor is a specialized plugin that transforms OpenCode from a reactive coding assistant into a proactive project architect. It enforces a rigorous, Context-Driven Development lifecycle where every code change is driven by formal specifications and tracked implementation plans.

## Philosophy

**"Measure twice, code once."**

The core philosophy is simple: **control your code by controlling your context.** By treating project requirements and plans as managed artifacts, Conductor ensures every AI agent interaction is grounded in deep, persistent project awareness.

## Target Users

### Primary Audience
Development teams using OpenCode who need consistent architectural standards and rigorous specification protocols across team members. These teams require:
- Standardized development workflows that all team members follow
- Persistent project context that survives across coding sessions
- Formal specifications before implementation begins
- Trackable, reversible units of work

### User Personas
1. **The Distributed Team Lead**: Managing remote developers who need consistent practices
2. **The Quality-Focused Engineer**: Values thorough planning and test-driven development
3. **The Context-Conscious Developer**: Frustrated by losing project context between sessions

## Core Goals

### Primary Objective
Enforce a rigorous Context-Driven Development lifecycle that ensures every code change is driven by formal specification and tracked implementation plans. This prevents ad-hoc development and ensures all work is:
- **Specified**: Clear requirements before coding begins
- **Planned**: Step-by-step implementation checklist
- **Tracked**: Organized into logical units (Tracks)
- **Reversible**: Smart revert capabilities at any granularity

### Secondary Objectives
- Maintain persistent project awareness across all AI interactions
- Standardize development practices within teams
- Reduce technical debt through disciplined workflows
- Enable intelligent rollback of features without Git surgery

## Key Features

### 1. Protocol-Driven Workflow
Mandatory **Context → Spec → Plan → Implement** lifecycle that cannot be bypassed:
- **Context Phase**: Establish project vision, tech stack, and workflow rules
- **Specification Phase**: 3-5 targeted questions to clarify requirements
- **Planning Phase**: Auto-generated step-by-step implementation checklist
- **Implementation Phase**: Autonomous execution with automated testing and commits

### 2. Smart Git-Aware Revert System
Unlike traditional Git operations, Conductor understands logical units of work:
- **Track-Level Revert**: Undo entire features or bug fixes
- **Phase-Level Revert**: Roll back groups of related tasks
- **Task-Level Revert**: Revert individual implementation steps
- **Semantic Understanding**: Tracks are organized by intent, not just commit hashes

### 3. Specialized Conductor Agent
A dedicated `@conductor` subagent that acts as Project Architect and Technical Lead:
- Maintains project constitution (`product.md`, `tech-stack.md`, `workflow.md`)
- Enforces specification quality before allowing implementation
- Generates context-aware implementation plans
- Synergizes with OhMyOpenCode's Sisyphus for team orchestration

### 4. Comprehensive Language Support
19+ built-in code style templates including:
- Popular languages: TypeScript, JavaScript, Python, Java, Go, Rust
- Modern languages: Kotlin, Swift, Zig, Julia, Solidity
- Web technologies: React, Vue, HTML/CSS
- System languages: C, C++, C#
- Scripting: Ruby, PHP, Shell, SQL

### 5. Native Slash Commands
Frictionless project management through integrated shortcuts:
- `/c-setup` - Initialize project constitution
- `/c-new` - Start new feature/bug track with spec generation
- `/c-implement` - Execute implementation autonomously
- `/c-status` - View project progress and active tracks
- `/c-revert` - Interactive rollback of tracks/phases/tasks

### 6. Zero-Config Bootstrap
Automatically installs agents and commands to global OpenCode configuration on first run. No manual setup required.

## Success Metrics

### For Development Teams
- Reduced time spent on "What was I building again?" context recovery
- Increased specification quality through structured Q&A
- Higher test coverage through enforced TDD workflows
- Fewer incomplete or abandoned features

### For Technical Leads
- Consistent development practices across team members
- Clear audit trail of all feature implementations
- Ability to review specifications before code is written
- Reduced technical debt from ad-hoc development

## Competitive Advantages

1. **Context Persistence**: Unlike general AI assistants, Conductor maintains deep project awareness
2. **Enforcement, Not Suggestion**: Workflow rules are mandatory, not optional best practices
3. **Semantic Git Operations**: Understands features and tasks, not just commits
4. **OpenCode Native**: Built specifically for OpenCode's agent ecosystem
5. **OhMyOpenCode Synergy**: Seamless integration with multi-agent workflows
