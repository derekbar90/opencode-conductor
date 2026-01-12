# Git Worktree Workflow Guide

## Overview

Conductor's worktree support provides **isolated development environments** for each Track (feature or bug fix). This guide explains how to use worktrees effectively and troubleshoot common issues.

---

## What Are Git Worktrees?

Git worktrees allow you to check out multiple branches simultaneously in separate directories. Instead of switching branches in your main working directory, each worktree operates independently.

### Benefits

- **No Context Switching**: Work on multiple Tracks without changing branches
- **Branch Isolation**: Each Track has its own branch (`conductor/<track_id>`)
- **Parallel Development**: Multiple Tracks can be active simultaneously
- **Clean Main Directory**: Your primary working directory remains untouched
- **Reduced Merge Conflicts**: Changes are isolated until Track completion

---

## Setup

### Prerequisites

- Git 2.5+ (worktree support introduced in Git 2.5)
- OpenCode Conductor plugin installed
- Project initialized with `/conductor:setup`

### Enabling Worktrees

1. Open your project's `conductor/workflow.md` file
2. Add the configuration option:

```yaml
use_worktrees: true
```

3. Save the file

That's it! Worktrees are now enabled for all new Tracks.

---

## Workflow

### 1. Creating a Track

```bash
/conductor:newTrack "Add user authentication"
```

**What Happens**:
- Creates branch `conductor/auth_20260111` (example track ID)
- Creates worktree directory at `../<project>-conductor-auth_20260111/`
- Switches to the worktree directory automatically
- Updates track metadata with worktree information

**Directory Structure**:
```
/your-project/               # Main working directory (unchanged)
/your-project-conductor-auth_20260111/  # Worktree for Track
```

### 2. Implementing the Track

```bash
/conductor:implement
```

**What Happens**:
- Agent works in the worktree directory
- All commits go to the `conductor/<track_id>` branch
- Main working directory remains clean
- You can switch back to main directory anytime

### 3. Completing the Track

When all tasks in `plan.md` are complete:

**What Happens Automatically**:
1. **Merge**: Changes from `conductor/<track_id>` → your current branch
2. **Remove Worktree**: Deletes the worktree directory
3. **Delete Branch**: Removes the `conductor/<track_id>` branch
4. **Update Metadata**: Marks Track as complete

---

## Working with Worktrees

### Switching Between Worktrees

You can work in multiple worktrees simultaneously:

```bash
# Terminal 1: Work on authentication Track
cd ../myproject-conductor-auth_20260111/
/conductor:implement

# Terminal 2: Work on payment Track
cd ../myproject-conductor-payment_20260111/
/conductor:implement

# Terminal 3: Check main project
cd /myproject/
git status
```

### Viewing Active Worktrees

```bash
git worktree list
```

**Example Output**:
```
/myproject                                    a1b2c3d [main]
/myproject-conductor-auth_20260111           e4f5g6h [conductor/auth_20260111]
/myproject-conductor-payment_20260111        i7j8k9l [conductor/payment_20260111]
```

### Manual Worktree Operations

While Conductor handles worktrees automatically, you can also manage them manually:

```bash
# Add worktree manually
git worktree add ../myproject-test main

# Remove worktree manually
git worktree remove ../myproject-test

# Prune stale worktree references
git worktree prune
```

---

## Troubleshooting

### Merge Conflicts During Cleanup

**Symptom**: Track completion fails with merge conflict error

**What Conductor Does**:
1. Lists conflicted files
2. Provides resolution instructions
3. Preserves worktree for manual intervention

**Resolution Steps**:

1. Navigate to the worktree directory:
   ```bash
   cd ../<project>-conductor-<track_id>/
   ```

2. View conflicted files:
   ```bash
   git status
   # or
   git diff --name-only --diff-filter=U
   ```

3. Resolve conflicts manually:
   ```bash
   # Edit conflicted files
   vim path/to/conflicted/file.ts
   
   # Stage resolved files
   git add path/to/conflicted/file.ts
   ```

4. Complete the merge:
   ```bash
   git merge --continue
   ```

5. Return to main directory and retry cleanup:
   ```bash
   cd /your-project/
   /conductor:implement
   ```

### Stale Worktree Directories

**Symptom**: Worktree directory exists but Git doesn't recognize it

**Cause**: Manual deletion or interrupted cleanup

**Resolution**:

```bash
# Remove stale references
git worktree prune

# If directory still exists, remove manually
rm -rf ../<project>-conductor-<track_id>/
```

Conductor will detect and clean up stale directories automatically on next Track creation.

### Worktree Creation Fails

**Symptom**: Error message during `/conductor:newTrack`

**Common Causes**:
- Git version < 2.5
- Disk space insufficient
- Directory permissions issues
- Worktree path already exists

**What Conductor Does**:
- Automatically falls back to normal workflow (branch-based)
- Logs the error for troubleshooting
- Track creation continues without interruption

**Manual Check**:
```bash
# Check Git version
git --version

# Check disk space
df -h

# Check existing worktrees
git worktree list
```

### Worktree Branch Already Exists

**Symptom**: Error "branch 'conductor/<track_id>' already exists"

**Resolution**:

```bash
# List existing branches
git branch -a

# If branch is leftover from incomplete Track:
git branch -D conductor/<track_id>

# Then retry Track creation
/conductor:newTrack "your feature"
```

### Cannot Remove Worktree (Files in Use)

**Symptom**: Error during cleanup "cannot remove worktree, files in use"

**Cause**: Files open in editor or process running in worktree

**Resolution**:

1. Close all files from worktree in your editor
2. Stop any processes running in worktree directory
3. Retry cleanup:
   ```bash
   /conductor:implement
   ```

### Switching Back to Main Directory

**Symptom**: Agent still working in worktree after Track completion

**Resolution**:

```bash
# Conductor automatically switches back, but you can also:
cd /your-project/
```

---

## Best Practices

### When to Use Worktrees

**✅ Good Use Cases**:
- Working on multiple features simultaneously
- Long-running Tracks that span days/weeks
- Experimental features that might be abandoned
- Features requiring different dependencies/configurations
- Team environments with frequent branch switches

**❌ When NOT to Use**:
- Quick one-file fixes (overhead not worth it)
- Projects with very slow filesystem (worktree creation overhead)
- CI/CD environments (use normal branches)
- Disk space constrained environments

### Disk Space Management

Each worktree is a **full copy** of your working directory:

```
# Example disk usage
/myproject/                    # 500 MB
/myproject-conductor-auth/     # 500 MB (duplicate)
/myproject-conductor-payment/  # 500 MB (duplicate)
Total: 1.5 GB
```

**Recommendations**:
- Limit active worktrees to 2-3 simultaneously
- Complete and cleanup Tracks regularly
- Consider disabling for small SSDs

### Cleaning Up Regularly

```bash
# View all active worktrees
git worktree list

# Remove unused worktrees
git worktree remove ../myproject-conductor-old_track/

# Prune stale references
git worktree prune
```

---

## Advanced Usage

### Custom Worktree Locations

By default, Conductor creates worktrees at `../<project>-conductor-<track_id>/`. 

To customize this location, modify `src/utils/worktreeManager.ts` in the Conductor plugin source.

### Integration with IDEs

**VS Code**:
```bash
# Open worktree in new VS Code window
code ../<project>-conductor-<track_id>/
```

**JetBrains IDEs**:
```bash
# Open worktree in new window
idea ../<project>-conductor-<track_id>/
```

### CI/CD Considerations

Worktrees are designed for **local development only**. For CI/CD:

```yaml
# Example .github/workflows/ci.yml
use_worktrees: false  # Disable in CI environment
```

---

## Configuration Reference

### workflow.md Options

```yaml
# Enable worktree support (default: false)
use_worktrees: true

# Worktree behavior is controlled by this single option
# No additional configuration needed
```

### Disabling Worktrees

To return to normal branch-based workflow:

1. Edit `conductor/workflow.md`
2. Set `use_worktrees: false` (or remove the line)
3. Complete any active worktree-based Tracks first
4. New Tracks will use normal branches

---

## FAQ

**Q: Do I need to commit the worktree directories?**  
A: No. Worktree directories are temporary and should be added to `.gitignore`:
```
../*-conductor-*/
```

**Q: Can I use worktrees with GitHub/GitLab?**  
A: Yes. Worktrees are purely local. The remote repository sees only the branches.

**Q: What happens if I delete a worktree directory manually?**  
A: Run `git worktree prune` to clean up references. Conductor will detect and handle stale directories automatically.

**Q: Can I have multiple worktrees for the same Track?**  
A: No. Each Track gets exactly one worktree. Track IDs are unique.

**Q: Do worktrees affect git performance?**  
A: Minimal impact. The `.git` directory is shared between all worktrees.

**Q: Can I disable worktrees for specific Tracks?**  
A: Not currently. The setting applies to all Tracks. Set `use_worktrees: false` if you need normal branches.

**Q: What's the difference between worktrees and git stash?**  
A: Stash temporarily saves changes. Worktrees provide **persistent separate environments** with their own branches.

---

## Further Reading

- [Git Worktree Official Documentation](https://git-scm.com/docs/git-worktree)
- [Conductor Main Documentation](../README.md)
- [Conductor Workflow Reference](../conductor/workflow.md)

---

## Support

For issues or questions:
1. Check this troubleshooting guide first
2. Review existing [GitHub Issues](https://github.com/derekbar90/opencode-conductor/issues)
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Git version (`git --version`)
   - OS and filesystem type
