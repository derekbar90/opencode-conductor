# Track Specification: Git Worktree Support for Track Isolation

## Overview

Add optional Git worktree support to `/conductor:implement` to enable isolated work environments for each track. This prevents conflicts when working on multiple tracks and provides clean workspace management throughout the track lifecycle.

## Motivation

Currently, all tracks share the same working directory, which can cause:
- Conflicts when switching between tracks
- Accidental commits to wrong tracks
- Difficulty managing parallel development efforts

Git worktrees provide isolated directories that share the same Git repository, allowing multiple branches to be checked out simultaneously without conflicts.

## Functional Requirements

### 1. Workflow Configuration
- Add a simple boolean configuration option `use_worktrees` in `conductor/workflow.md`
- When `use_worktrees: true`, all track implementations use worktrees
- When `use_worktrees: false` (default), use current behavior (single working directory)

### 2. Worktree Creation (on track implementation start)
- Create worktree in `../<project-name>-worktrees/<track_id>/`
- Create branch named `conductor/<track_id>` based on the current branch where the track is executed
- Switch context to the worktree for all subsequent operations
- Example: If on `main` branch and track is `auth-system_20260111`, create worktree at `../opencode-conductor-worktrees/auth-system_20260111/` with branch `conductor/auth-system_20260111`

### 3. Track Implementation in Worktree
- All task execution happens within the worktree directory
- All commits are made to the `conductor/<track_id>` branch
- Track metadata and plan updates continue to work normally

### 4. Worktree Cleanup (on track completion)
- **Step 1: Confirmation** - Ask user if they want to clean up the worktree and merge changes
- **Step 2: Branch Selection** - If multiple branches exist, suggest merging to current branch or let user choose target branch
- **Step 3: Merge** - Merge `conductor/<track_id>` branch to selected target branch
- **Step 4: Worktree Removal** - Remove the worktree using `git worktree remove`
- **Step 5: Directory Verification** - Verify the worktree directory `../<project-name>-worktrees/<track_id>/` no longer exists
- **Step 6: Cleanup Remnants** - If directory or files still exist, forcefully delete them
- **Step 7: Branch Deletion** - Delete the `conductor/<track_id>` branch after successful merge

### 5. Error Handling
- If worktree creation fails, fall back to normal (non-worktree) mode with user notification
- If worktree directory already exists, prompt user to clean it up or use different track name
- If merge conflicts occur during cleanup, pause and request user intervention
- If directory deletion fails, report specific error and suggest manual cleanup commands

## Non-Functional Requirements

### Backward Compatibility
- Existing tracks without worktrees continue to work normally
- Tracks can be started with or without worktrees based on configuration
- No breaking changes to existing `/conductor:implement` behavior when `use_worktrees: false`

### User Experience
- Clear notifications when creating/removing worktrees
- Helpful error messages with suggested remediation steps
- Confirmation dialogs prevent accidental data loss

### Platform Compatibility
- Works on macOS, Linux, and Windows (Git Bash/WSL)
- Respects OS-specific path separators
- Handles spaces in project names correctly

## Acceptance Criteria

1. **Configuration**: `use_worktrees` flag in `workflow.md` correctly enables/disables worktree mode
2. **Creation**: Worktree and branch created successfully in correct location based on current branch
3. **Isolation**: Multiple tracks can run in parallel without interfering with each other
4. **Task Execution**: All task operations (commits, tests, etc.) work correctly within worktree
5. **Cleanup**: Worktree removal is complete with verification, no remnants left behind
6. **Merge**: Changes successfully merged to user-selected target branch
7. **Error Handling**: Graceful degradation when worktree operations fail
8. **Documentation**: `workflow.md` template updated with `use_worktrees` option and explanation

## Out of Scope

- Automatic PR generation for regular tracks (tracks do NOT generate PRs by default)
- GUI/visual interface for managing worktrees
- Migration of existing in-progress tracks to worktrees
- Worktree sharing between different Conductor projects
- Advanced Git worktree features (sparse checkouts, linked worktrees)

## Implementation Notes

- This feature itself will be implemented in a worktree and submitted as a PR to the upstream repository
- The implementation should update the `/conductor:implement` command handler
- State tracking in `metadata.json` should include worktree path if applicable
- The default `workflow.md` template should document this feature with `use_worktrees: false` as default
