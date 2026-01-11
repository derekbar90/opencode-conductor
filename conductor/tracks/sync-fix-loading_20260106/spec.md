# Specification: Sync Fork with Upstream and Fix Plugin Late Loading Issue

## Overview

This track addresses two critical objectives:
1. **Repository Synchronization**: Sync the forked repository with the upstream `derekbar90/opencode-conductor` to incorporate all latest changes
2. **Fix Plugin Loading Timing Issue**: Resolve the problem where the `opencode-conductor` plugin loads too late, causing initialization messages to appear after the user has closed or is closing the OpenCode application

The work will culminate in a pull request to the upstream repository with the complete solution.

## Problem Statement

**Current Issue:**
The opencode-conductor plugin is experiencing an asynchronous loading problem where:
- The plugin initialization completes after expected timing
- Initialization messages (e.g., "Plugin loaded", "Conductor tools available") appear when the user is closing OpenCode
- This creates a poor user experience and suggests the plugin may not be ready when users need it

**Root Cause (Hypothesis):**
The plugin's async initialization in `src/index.ts` may be:
- Taking too long to complete
- Not properly awaiting critical setup steps
- Loading resources (templates, prompts) synchronously during initialization
- Missing proper initialization lifecycle hooks

## User Stories

### Story 1: As a Developer Using OpenCode
**As a** developer starting OpenCode with the Conductor plugin installed  
**I want** the plugin to load completely before I begin interacting with OpenCode  
**So that** all `/c-*` commands are available immediately when I need them

**Acceptance Criteria:**
- Plugin initialization completes before OpenCode is ready for user input
- No loading messages appear during shutdown
- All plugin tools are available within 2 seconds of OpenCode start

### Story 2: As a Contributor to the Upstream Repository
**As a** contributor with a fork of opencode-conductor  
**I want** my fork to be in sync with the upstream repository  
**So that** my pull request is based on the latest codebase and can be merged cleanly

**Acceptance Criteria:**
- Fork's main branch contains all commits from `upstream/main`
- No merge conflicts exist between fork and upstream
- Branch history is clean and ready for PR submission

### Story 3: As a Plugin User
**As a** user who just installed the Conductor plugin  
**I want** clear feedback when the plugin is ready  
**So that** I know when I can start using `/c-setup` and other commands

**Acceptance Criteria:**
- Single, clear initialization message appears at appropriate time
- Message indicates plugin is ready to use
- No duplicate or late messages during shutdown

## Requirements

### Functional Requirements

**FR1: Repository Synchronization**
- Fetch all changes from `upstream/main` (https://github.com/derekbar90/opencode-conductor)
- Update local `main` branch to match `upstream/main` exactly
- Push synchronized changes to fork (`origin`)
- Delete the obsolete `fix/omo-detection-and-task-delegation` branch (local and remote)

**FR2: Create New Feature Branch**
- Create a new branch from the updated `main`
- Branch name should clearly indicate the fix (e.g., `fix/plugin-late-loading`)
- Ensure branch is based on the latest synchronized main

**FR3: Fix Plugin Loading Timing**
- Identify the async operations causing delayed initialization
- Optimize or restructure plugin initialization to complete faster
- Ensure all critical resources are loaded before plugin reports "ready"
- Remove or relocate any console logs that appear during shutdown

**FR4: Verify Plugin Initialization**
- Test that plugin loads within acceptable timeframe (< 2 seconds)
- Verify all commands (`/c-setup`, `/c-new`, etc.) are available immediately
- Confirm no messages appear during OpenCode shutdown
- Test on a clean OpenCode installation

**FR5: Create Pull Request**
- Commit all changes with clear, descriptive conventional commit messages
- Push feature branch to fork
- Create pull request to `derekbar90/opencode-conductor:main`
- Include clear description of the problem and solution in PR description

### Non-Functional Requirements

**NFR1: Backward Compatibility**
- Plugin functionality remains unchanged (only timing/initialization improves)
- Existing conductor directories and workflows continue to work
- No breaking changes to plugin API or commands

**NFR2: Performance**
- Plugin initialization completes in < 2 seconds on average hardware
- No blocking operations during plugin load
- Template and prompt loading is optimized

**NFR3: Code Quality**
- Follow existing code style and conventions
- Add comments explaining any timing-critical changes
- Maintain TypeScript strict mode compliance

## Acceptance Criteria

### Primary Acceptance Criteria

1. **Repository Sync Complete**
   - `git log origin/main` shows all commits from `upstream/main`
   - No divergence between fork and upstream
   - Old branch `fix/omo-detection-and-task-delegation` is deleted

2. **Plugin Loads Before User Interaction**
   - Start OpenCode with Conductor plugin installed
   - Observe console output shows plugin ready message within 2 seconds
   - Type `/c-` and verify autocomplete shows all commands immediately

3. **No Shutdown Messages**
   - Close OpenCode normally
   - Verify no "Plugin loaded" or initialization messages appear during shutdown
   - Console remains clean during exit process

4. **Pull Request Created**
   - PR exists at https://github.com/derekbar90/opencode-conductor/pulls
   - PR description clearly explains the timing issue and solution
   - PR is based on latest upstream main
   - All CI checks pass (if applicable)

### Verification Methods

**Manual Testing:**
1. Install plugin in clean OpenCode environment
2. Start OpenCode and measure time until plugin ready message
3. Immediately try running `/c-setup` to verify availability
4. Close OpenCode and verify console during shutdown

**Code Review:**
1. Review `src/index.ts` for async initialization patterns
2. Check for any synchronous file operations during plugin load
3. Verify console.log statements are appropriately placed
4. Ensure no blocking operations in plugin initialization

## Dependencies and Constraints

### Dependencies
- Git access to both fork and upstream repository
- OpenCode development environment for testing
- Node.js and npm for building plugin

### Constraints

**Constraint 1: Maintain Upstream Compatibility**
- Solution must be acceptable to upstream maintainer
- Cannot introduce breaking changes
- Must follow upstream contribution guidelines

**Constraint 2: Preserve Plugin Functionality**
- All existing features must continue to work
- No changes to command behavior or workflow
- Conductor methodology remains unchanged

**Constraint 3: Git History**
- Keep clean, linear commit history for PR
- Use conventional commit messages
- Avoid force-pushing to shared branches

## Out of Scope

The following items are explicitly **not** included in this track:

❌ Adding new features to the plugin  
❌ Refactoring unrelated code  
❌ Updating dependencies or package versions  
❌ Changing plugin architecture or command structure  
❌ Implementing automated tests (unless necessary for the fix)  
❌ Updating documentation beyond PR description  

## Success Metrics

**Quantitative:**
- Plugin initialization time: < 2 seconds
- Zero late loading messages during shutdown
- PR merged into upstream repository

**Qualitative:**
- User experience improves with reliable, fast plugin loading
- Upstream maintainer approves the fix
- Solution is maintainable and doesn't introduce technical debt

## Technical Investigation Areas

### Areas to Investigate
1. **Async Plugin Registration** (`src/index.ts`):
   - Review the `ConductorPlugin` function export
   - Check if async operations are properly awaited
   - Verify plugin tools are registered synchronously

2. **File System Operations**:
   - Check `promptLoader.ts` for synchronous reads
   - Review template copying in `bootstrap.ts`
   - Identify any blocking I/O during initialization

3. **OMO Detection Logic**:
   - Review `detectOMO()` function for timing issues
   - Check if file system checks are causing delays
   - Consider caching or lazy loading for detection

4. **Console Logging**:
   - Locate all `console.log()` statements in plugin code
   - Determine which messages appear during shutdown
   - Move or remove inappropriate logging

## Implementation Strategy

1. **Phase 1**: Repository sync and branch cleanup
2. **Phase 2**: Profile and identify the slow initialization code
3. **Phase 3**: Implement fixes for async loading
4. **Phase 4**: Test and verify improvements
5. **Phase 5**: Create and submit pull request
