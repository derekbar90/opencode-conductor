# Implementation Plan: Sync Fork with Upstream and Fix Plugin Late Loading Issue

## Phase 1: Repository Synchronization and Branch Cleanup [checkpoint: ]

- [ ] Task: Fetch all changes from upstream repository (git fetch upstream)
- [ ] Task: Verify current branch state and stash any uncommitted changes if needed
- [ ] Task: Switch to main branch and update it with upstream/main changes
- [ ] Task: Push synchronized main to fork (origin)
- [ ] Task: Delete local branch fix/omo-detection-and-task-delegation
- [ ] Task: Delete remote branch fix/omo-detection-and-task-delegation from fork
- [ ] Task: Verify synchronization is complete (git log comparison)
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Repository Synchronization and Branch Cleanup' (Protocol in workflow.md)

## Phase 2: Create New Feature Branch [checkpoint: ]

- [ ] Task: Create new branch from updated main (e.g., fix/plugin-late-loading)
- [ ] Task: Push new branch to fork to establish remote tracking
- [ ] Task: Verify branch is based on latest synchronized main
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Create New Feature Branch' (Protocol in workflow.md)

## Phase 3: Investigation and Profiling [checkpoint: ]

- [ ] Task: Write test to measure plugin initialization time (Red Phase)
- [ ] Task: Add timing instrumentation to src/index.ts to profile async operations
- [ ] Task: Run OpenCode and capture console output during startup and shutdown
- [ ] Task: Identify specific operations causing delayed initialization
- [ ] Task: Document findings in implementation notes
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Investigation and Profiling' (Protocol in workflow.md)

## Phase 4: Fix Async Initialization Timing [checkpoint: ]

- [ ] Task: Write failing tests for plugin initialization timing requirements (Red Phase)
- [ ] Task: Optimize async operations in ConductorPlugin function (Green Phase)
- [ ] Task: Ensure all tool registrations happen synchronously
- [ ] Task: Move any heavy I/O operations to lazy loading if possible
- [ ] Task: Run tests to verify initialization timing improvements (Green Phase)
- [ ] Task: Refactor code for clarity while maintaining performance improvements
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Fix Async Initialization Timing' (Protocol in workflow.md)

## Phase 5: Fix Console Logging During Shutdown [checkpoint: ]

- [ ] Task: Write test to verify no console output during shutdown (Red Phase)
- [ ] Task: Review all console.log statements in src/index.ts and command files (Green Phase)
- [ ] Task: Remove or relocate inappropriate logging messages
- [ ] Task: Ensure plugin ready message appears only during successful initialization
- [ ] Task: Run tests to verify logging behavior (Green Phase)
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Fix Console Logging During Shutdown' (Protocol in workflow.md)

## Phase 6: Optimize Resource Loading [checkpoint: ]

- [ ] Task: Write tests for promptLoader.ts performance (Red Phase)
- [ ] Task: Review promptLoader.ts for synchronous file operations (Green Phase)
- [ ] Task: Optimize template loading in bootstrap.ts if needed
- [ ] Task: Review detectOMO() function for potential delays
- [ ] Task: Implement caching or lazy loading where appropriate (Green Phase)
- [ ] Task: Run tests to verify resource loading improvements
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Optimize Resource Loading' (Protocol in workflow.md)

## Phase 7: Integration Testing and Verification [checkpoint: ]

- [ ] Task: Build the plugin (npm run build)
- [ ] Task: Test plugin in clean OpenCode environment
- [ ] Task: Measure and verify initialization time < 2 seconds
- [ ] Task: Test all /c-* commands are immediately available
- [ ] Task: Verify no messages appear during OpenCode shutdown
- [ ] Task: Test plugin functionality remains unchanged
- [ ] Task: Run full test suite to ensure no regressions
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Integration Testing and Verification' (Protocol in workflow.md)

## Phase 8: Create Pull Request [checkpoint: ]

- [ ] Task: Review all commits for clear conventional commit messages
- [ ] Task: Squash or reorder commits if needed for clean history
- [ ] Task: Push feature branch to fork
- [ ] Task: Create PR to derekbar90/opencode-conductor:main
- [ ] Task: Write comprehensive PR description explaining problem and solution
- [ ] Task: Link to the session URL (https://opncd.ai/share/lxGfv1FL) in PR description
- [ ] Task: Verify CI checks pass on PR (if applicable)
- [ ] Task: Conductor - User Manual Verification 'Phase 8: Create Pull Request' (Protocol in workflow.md)

## Notes

### Success Criteria
- Fork synchronized with upstream/main
- Old branch deleted completely
- Plugin initializes in < 2 seconds
- No shutdown messages appear
- All commands available immediately
- PR created and ready for review
- No breaking changes or regressions

### Key Files to Modify
- `src/index.ts` - Main plugin initialization
- `src/utils/promptLoader.ts` - Prompt loading optimization
- `src/utils/bootstrap.ts` - Bootstrap timing
- Test files (to be created) - Initialization timing tests

### Testing Strategy
This track requires writing tests to verify:
1. Plugin initialization completes within time limit
2. No console output during shutdown
3. All tools registered before plugin reports ready
4. Resource loading is optimized

### Git Commands Reference
```bash
# Phase 1
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git branch -D fix/omo-detection-and-task-delegation
git push origin --delete fix/omo-detection-and-task-delegation

# Phase 2
git checkout -b fix/plugin-late-loading
git push -u origin fix/plugin-late-loading

# Phase 8
git push origin fix/plugin-late-loading
gh pr create --base main --head fix/plugin-late-loading
```

### Performance Targets
- Plugin initialization: < 2 seconds
- Tool registration: Synchronous (0ms blocking)
- Console output: Clean during shutdown
- No user-facing functionality changes
