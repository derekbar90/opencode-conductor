# Implementation Plan: Git Worktree Support for Track Isolation

## Phase 1: Foundation and Configuration [checkpoint: a782546]

### Task 1.1: Add worktree configuration to workflow template
- [x] Task: Write tests for workflow.md worktree configuration parsing [951dfad]
    - [x] Create test file `src/utils/workflowParser.test.ts`
    - [x] Write test: Parse workflow.md with `use_worktrees: true`
    - [x] Write test: Parse workflow.md with `use_worktrees: false`
    - [x] Write test: Parse workflow.md without worktree config (default false)
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement workflow configuration parser for worktrees [951dfad]
    - [x] Create or update `src/utils/workflowParser.ts` to extract `use_worktrees` setting
    - [x] Add TypeScript type definition for worktree config
    - [x] Implement logic to default to `false` when not specified
    - [x] Run tests and confirm they pass (Green phase)
    - [x] Refactor if needed while keeping tests green

- [x] Task: Update workflow.md template with worktree documentation [2facce1]
    - [x] Open `src/templates/workflow.md`
    - [x] Add section explaining `use_worktrees` option
    - [x] Document the worktree directory structure (`../<project-name>-worktrees/<track_id>/`)
    - [x] Add example configuration showing `use_worktrees: false` (default)
    - [x] Commit changes

- [ ] Task: Conductor - User Manual Verification 'Phase 1: Foundation and Configuration' (Protocol in workflow.md)

## Phase 2: Worktree Creation Logic [checkpoint: aa93d60] ✅ COMPLETE

### Task 2.1: Implement worktree path resolution
- [x] Task: Write tests for worktree path generation [1bfbc29]
    - [x] Create test file `src/utils/worktreeManager.test.ts`
    - [x] Write test: Generate worktree path from project name and track_id
    - [x] Write test: Handle project names with spaces
    - [x] Write test: Handle special characters in project names
    - [x] Write test: Verify path is sibling to project root
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement worktree path utilities [1bfbc29]
    - [x] Create `src/utils/worktreeManager.ts`
    - [x] Implement `getWorktreePath(projectRoot: string, trackId: string): string`
    - [x] Implement `sanitizeProjectName(name: string): string` for safe directory names
    - [x] Run tests and confirm they pass (Green phase)
    - [x] Refactor if needed

### Task 2.2: Implement worktree and branch creation
- [x] Task: Write tests for worktree creation operations [git-note: 037e951]
    - [x] Write test: Create worktree with correct branch name format
    - [x] Write test: Detect current branch before creating worktree
    - [x] Write test: Handle existing worktree directory error
    - [x] Write test: Verify worktree created in correct location
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement worktree creation logic [git-note: 037e951]
    - [x] Add `createWorktree(trackId: string, baseBranch: string): Promise<string>` to worktreeManager
    - [x] Implement Git command: `git worktree add <path> -b conductor/<track_id> <base_branch>`
    - [x] Add error handling for existing directories
    - [x] Return absolute path to created worktree
    - [x] Run tests and confirm they pass (Green phase)

- [x] Task: Write tests for worktree existence check [git-note: 80067c7]
    - [x] Write test: Detect when worktree directory already exists
    - [x] Write test: Return false when worktree doesn't exist
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Implement worktree existence validation [git-note: 80067c7]
    - [x] Add `worktreeExists(trackId: string): Promise<boolean>`
    - [x] Check both filesystem and Git worktree list
    - [x] Run tests and confirm they pass (Green phase)

- [x] Task: Conductor - User Manual Verification 'Phase 2: Worktree Creation Logic' (Protocol in workflow.md) [git-note: aa93d60]

## Phase 3: Track Metadata Integration [checkpoint: ]

### Task 3.1: Extend metadata schema for worktrees
- [x] Task: Write tests for metadata worktree fields [git-note: a5c0f60]
    - [x] Create test file `src/utils/metadataManager.test.ts` (or extend existing)
    - [x] Write test: Save metadata with worktree_path field
    - [x] Write test: Save metadata with worktree_branch field
    - [x] Write test: Load metadata and read worktree fields
    - [x] Write test: Handle metadata without worktree fields (backward compatibility)
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Update metadata TypeScript types [git-note: a5c0f60]
    - [x] Open or create `src/types/metadata.ts`
    - [x] Add optional fields: `worktree_path?: string` and `worktree_branch?: string`
    - [x] Update metadata save/load functions in `src/utils/stateManager.ts`
    - [x] Run tests and confirm they pass (Green phase)

### Task 3.2: Store worktree information on track start
- [x] Task: Write tests for worktree metadata persistence [git-note: 3612e32]
    - [x] Write test: Track metadata includes worktree_path when worktree is used
    - [x] Write test: Track metadata includes worktree_branch
    - [x] Write test: Track metadata omits worktree fields when use_worktrees is false
    - [x] Run tests and confirm they fail (Red phase)

- [x] Task: Update implement command to save worktree info [git-note: 3612e32]
    - [x] Modify `src/commands/implement.ts` (or equivalent)
    - [x] After worktree creation, update track metadata with worktree_path and worktree_branch
    - [x] Ensure metadata is written before any task execution
    - [x] Run tests and confirm they pass (Green phase)

- [ ] Task: Conductor - User Manual Verification 'Phase 3: Track Metadata Integration' (Protocol in workflow.md)

## Phase 4: Implement Command Integration [checkpoint: ]

### Task 4.1: Modify implement command to detect worktree configuration
- [ ] Task: Write tests for worktree mode detection
    - [ ] Write test: Detect use_worktrees enabled in workflow.md
    - [ ] Write test: Default to non-worktree mode when disabled
    - [ ] Write test: Load existing worktree path from track metadata
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Update implement command initialization
    - [ ] Read workflow.md to check `use_worktrees` setting
    - [ ] Check track metadata for existing worktree_path
    - [ ] Set execution context based on configuration
    - [ ] Run tests and confirm they pass (Green phase)

### Task 4.2: Implement worktree creation flow in implement command
- [ ] Task: Write tests for implement command worktree setup
    - [ ] Write test: Create worktree on first task execution when enabled
    - [ ] Write test: Get current branch before worktree creation
    - [ ] Write test: Notify user of worktree creation with path
    - [ ] Write test: Skip worktree creation if already exists
    - [ ] Write test: Fall back to normal mode if worktree creation fails
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Integrate worktree creation into implement command
    - [ ] Detect if this is the first task of the track
    - [ ] Get current Git branch with `git branch --show-current`
    - [ ] Call `createWorktree(trackId, currentBranch)`
    - [ ] Update track metadata with worktree info
    - [ ] Display user notification with worktree path
    - [ ] Implement fallback logic on failure
    - [ ] Run tests and confirm they pass (Green phase)

### Task 4.3: Change working directory context for task execution
- [ ] Task: Write tests for working directory switching
    - [ ] Write test: Change process.cwd() to worktree path
    - [ ] Write test: All Git operations happen in worktree
    - [ ] Write test: File reads/writes happen in worktree
    - [ ] Write test: Restore original directory after task completion
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement working directory context management
    - [ ] Store original working directory
    - [ ] Use `process.chdir()` to switch to worktree before task execution
    - [ ] Ensure all subsequent operations use worktree context
    - [ ] Add try-finally block to restore directory on errors
    - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Conductor - User Manual Verification 'Phase 4: Implement Command Integration' (Protocol in workflow.md)

## Phase 5: Worktree Cleanup and Merge [checkpoint: ]

### Task 5.1: Implement cleanup confirmation dialog
- [ ] Task: Write tests for cleanup confirmation flow
    - [ ] Write test: Prompt user for cleanup confirmation
    - [ ] Write test: Detect multiple branches in repository
    - [ ] Write test: Suggest current branch as merge target
    - [ ] Write test: Allow user to specify different target branch
    - [ ] Write test: Abort cleanup if user declines
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement cleanup dialog logic
    - [ ] Create `promptWorktreeCleanup(trackId: string): Promise<CleanupOptions>`
    - [ ] List available branches with `git branch --list`
    - [ ] Get current branch as default suggestion
    - [ ] Allow user to select target branch or cancel
    - [ ] Return cleanup configuration object
    - [ ] Run tests and confirm they pass (Green phase)

### Task 5.2: Implement branch merge logic
- [ ] Task: Write tests for merge operations
    - [ ] Write test: Merge conductor/<track_id> to target branch
    - [ ] Write test: Detect merge conflicts and pause
    - [ ] Write test: Verify merge successful before cleanup
    - [ ] Write test: Handle fast-forward vs regular merge
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement merge functionality
    - [ ] Create `mergeWorktreeBranch(trackId: string, targetBranch: string): Promise<boolean>`
    - [ ] Checkout target branch
    - [ ] Execute `git merge conductor/<track_id>`
    - [ ] Detect conflicts and throw descriptive error
    - [ ] Return success status
    - [ ] Run tests and confirm they pass (Green phase)

### Task 5.3: Implement worktree removal with verification
- [ ] Task: Write tests for worktree removal
    - [ ] Write test: Remove worktree with git worktree remove
    - [ ] Write test: Verify directory no longer exists
    - [ ] Write test: Forcefully delete remnants if directory remains
    - [ ] Write test: Handle locked worktrees
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement worktree removal logic
    - [ ] Create `removeWorktree(trackId: string): Promise<void>`
    - [ ] Execute `git worktree remove <path>`
    - [ ] Check if directory still exists with `fs.existsSync()`
    - [ ] If exists, use `fs.rmSync(path, { recursive: true, force: true })`
    - [ ] Verify deletion successful
    - [ ] Run tests and confirm they pass (Green phase)

### Task 5.4: Implement branch deletion after cleanup
- [ ] Task: Write tests for branch deletion
    - [ ] Write test: Delete conductor/<track_id> branch after successful merge
    - [ ] Write test: Handle branch deletion errors gracefully
    - [ ] Write test: Verify branch no longer exists
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement branch deletion
    - [ ] Create `deleteWorktreeBranch(trackId: string): Promise<void>`
    - [ ] Execute `git branch -d conductor/<track_id>`
    - [ ] Catch errors (e.g., branch not fully merged) and report
    - [ ] Verify branch deleted with `git branch --list`
    - [ ] Run tests and confirm they pass (Green phase)

### Task 5.5: Integrate cleanup flow into track completion
- [ ] Task: Write tests for complete cleanup flow integration
    - [ ] Write test: Cleanup triggered when track status changes to 'completed'
    - [ ] Write test: Cleanup skipped if use_worktrees is false
    - [ ] Write test: Complete cleanup sequence executes in correct order
    - [ ] Write test: Update metadata to remove worktree fields after cleanup
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Hook cleanup into track completion in implement command
    - [ ] Detect when final task of track is completed
    - [ ] Check if worktree was used (from metadata)
    - [ ] Call cleanup confirmation dialog
    - [ ] Execute merge → remove worktree → verify → delete branch sequence
    - [ ] Update track metadata to remove worktree_path and worktree_branch
    - [ ] Restore working directory to original location
    - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Conductor - User Manual Verification 'Phase 5: Worktree Cleanup and Merge' (Protocol in workflow.md)

## Phase 6: Error Handling and Edge Cases [checkpoint: ]

### Task 6.1: Implement fallback for worktree creation failures
- [ ] Task: Write tests for worktree fallback scenarios
    - [ ] Write test: Fall back to normal mode if Git worktree command fails
    - [ ] Write test: Notify user of fallback with clear message
    - [ ] Write test: Continue track execution in normal mode after fallback
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement robust fallback logic
    - [ ] Wrap worktree creation in try-catch
    - [ ] Log detailed error information
    - [ ] Display user-friendly fallback notification
    - [ ] Continue with implement command in non-worktree mode
    - [ ] Run tests and confirm they pass (Green phase)

### Task 6.2: Handle merge conflicts during cleanup
- [ ] Task: Write tests for merge conflict scenarios
    - [ ] Write test: Detect merge conflicts during cleanup
    - [ ] Write test: Preserve worktree when conflicts occur
    - [ ] Write test: Provide clear instructions for manual resolution
    - [ ] Write test: Allow retry after manual resolution
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement conflict handling
    - [ ] Detect merge conflicts from Git exit code
    - [ ] Display conflict files and resolution instructions
    - [ ] Skip worktree removal and branch deletion on conflicts
    - [ ] Provide command to retry cleanup after resolution
    - [ ] Run tests and confirm they pass (Green phase)

### Task 6.3: Handle existing worktree directories
- [ ] Task: Write tests for existing directory scenarios
    - [ ] Write test: Detect when worktree directory already exists
    - [ ] Write test: Prompt user to clean up or choose different name
    - [ ] Write test: Offer to force-remove stale worktree
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Implement existing directory handling
    - [ ] Check for directory existence before creation
    - [ ] Verify if it's a valid Git worktree with `git worktree list`
    - [ ] Offer options: remove and retry, or use different track name
    - [ ] Implement force-remove option for stale worktrees
    - [ ] Run tests and confirm they pass (Green phase)

### Task 6.4: Platform compatibility (Windows path handling)
- [ ] Task: Write tests for cross-platform path handling
    - [ ] Write test: Generate correct paths on Windows
    - [ ] Write test: Generate correct paths on Unix systems
    - [ ] Write test: Handle spaces in project names across platforms
    - [ ] Run tests and confirm they fail (Red phase)

- [ ] Task: Ensure platform-agnostic path operations
    - [ ] Use Node.js `path` module for all path operations
    - [ ] Test path generation on different OS separators
    - [ ] Escape spaces and special characters appropriately
    - [ ] Run tests and confirm they pass (Green phase)

- [ ] Task: Conductor - User Manual Verification 'Phase 6: Error Handling and Edge Cases' (Protocol in workflow.md)

## Phase 7: Documentation and Final Integration [checkpoint: ]

### Task 7.1: Update project documentation
- [ ] Task: Update README.md with worktree feature
    - [ ] Add section explaining worktree support
    - [ ] Document configuration option in workflow.md
    - [ ] Add example use cases for worktrees
    - [ ] Document cleanup process
    - [ ] Commit changes

- [ ] Task: Update CHANGELOG.md
    - [ ] Add entry for new worktree feature
    - [ ] Document breaking changes (if any)
    - [ ] Note backward compatibility
    - [ ] Commit changes

### Task 7.2: Create user guide for worktree workflow
- [ ] Task: Write worktree workflow guide
    - [ ] Create `docs/worktree-workflow.md` (or update existing docs)
    - [ ] Document setup steps
    - [ ] Provide troubleshooting section
    - [ ] Add examples of common scenarios
    - [ ] Commit changes

### Task 7.3: Integration testing
- [ ] Task: Manual end-to-end test
    - [ ] Initialize new test project with `/conductor:setup`
    - [ ] Enable `use_worktrees: true` in workflow.md
    - [ ] Create test track with `/conductor:newTrack`
    - [ ] Verify worktree created in correct location
    - [ ] Complete at least one task in worktree
    - [ ] Verify commits are in conductor/<track_id> branch
    - [ ] Complete the track and verify cleanup process
    - [ ] Confirm merge successful and worktree removed
    - [ ] Verify no remnants left in filesystem

- [ ] Task: Test backward compatibility
    - [ ] Create track with `use_worktrees: false`
    - [ ] Verify normal (non-worktree) behavior works
    - [ ] Switch between worktree and non-worktree modes
    - [ ] Confirm no breaking changes

- [ ] Task: Conductor - User Manual Verification 'Phase 7: Documentation and Final Integration' (Protocol in workflow.md)
