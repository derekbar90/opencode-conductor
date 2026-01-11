import { describe, it, expect, vi, beforeEach } from "vitest"
import { exec } from "child_process"
import { promisify } from "util"
import { existsSync } from "fs"
import {
  mergeWorktreeBranch,
  removeWorktree,
  deleteWorktreeBranch,
  cleanupWorktree,
  getConflictedFiles,
  type CleanupResult,
} from "./worktreeCleanup.js"
import * as metadataManager from "./metadataManager.js"

vi.mock("child_process", () => ({
  exec: vi.fn(),
}))

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
}))

vi.mock("./metadataManager.js", () => ({
  loadTrackMetadata: vi.fn(),
  clearTrackWorktreeInfo: vi.fn(),
}))

const execAsync = promisify(exec)

describe("worktreeCleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("mergeWorktreeBranch", () => {
    it("should merge conductor branch to target branch successfully", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "Merge made by recursive strategy", stderr: "" })
        return {} as any
      })

      const result = await mergeWorktreeBranch(
        "/test/project",
        "feature_123",
        "main"
      )

      expect(result).toBe(true)
      expect(exec).toHaveBeenCalledTimes(2)
      expect(exec).toHaveBeenCalledWith(
        "git checkout main",
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
      expect(exec).toHaveBeenCalledWith(
        "git merge conductor/feature_123",
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
    })

    it("should handle fast-forward merge", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("checkout")) {
          callback(null, { stdout: "Switched to branch 'main'", stderr: "" })
        } else if (cmd.includes("merge")) {
          callback(null, { stdout: "Fast-forward", stderr: "" })
        }
        return {} as any
      })

      const result = await mergeWorktreeBranch(
        "/test/project",
        "feature_123",
        "main"
      )

      expect(result).toBe(true)
    })

    it("should detect merge conflicts and return false", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("checkout")) {
          callback(null, { stdout: "Switched to branch 'main'", stderr: "" })
        } else if (cmd.includes("merge")) {
          callback(new Error("CONFLICT: Merge conflict in file.txt"), {
            stdout: "",
            stderr: "CONFLICT: Merge conflict in file.txt",
          })
        }
        return {} as any
      })

      const result = await mergeWorktreeBranch(
        "/test/project",
        "feature_123",
        "main"
      )

      expect(result).toBe(false)
    })

    it("should throw error if checkout fails", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(new Error("Branch 'main' not found"), {
          stdout: "",
          stderr: "Branch 'main' not found",
        })
        return {} as any
      })

      await expect(
        mergeWorktreeBranch("/test/project", "feature_123", "main")
      ).rejects.toThrow("Branch 'main' not found")
    })
  })

  describe("removeWorktree", () => {
    it("should remove worktree successfully", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })
      vi.mocked(existsSync).mockReturnValue(false)

      await removeWorktree("/test/project", "feature_123")

      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("git worktree remove"),
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
    })

    it("should verify directory no longer exists after removal", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })
      vi.mocked(existsSync).mockReturnValue(false)

      await removeWorktree("/test/project", "feature_123")

      expect(existsSync).toHaveBeenCalled()
    })

    it("should forcefully delete directory if it still exists", async () => {
      const { rmSync } = await import("fs")

      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })
      vi.mocked(existsSync).mockReturnValue(true)

      await removeWorktree("/test/project", "feature_123")

      expect(rmSync).toHaveBeenCalledWith(
        expect.stringContaining("feature_123"),
        { recursive: true, force: true }
      )
    })

    it("should handle locked worktrees", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("worktree remove") && !cmd.includes("--force")) {
          callback(new Error("worktree is locked"), {
            stdout: "",
            stderr: "worktree is locked",
          })
        } else {
          callback(null, { stdout: "", stderr: "" })
        }
        return {} as any
      })
      vi.mocked(existsSync).mockReturnValue(false)

      await removeWorktree("/test/project", "feature_123")

      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("git worktree remove --force"),
        expect.anything(),
        expect.any(Function)
      )
    })
  })

  describe("deleteWorktreeBranch", () => {
    it("should delete conductor branch after successful merge", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("branch -d")) {
          callback(null, { stdout: "Deleted branch conductor/feature_123", stderr: "" })
        } else if (cmd.includes("branch --list")) {
          callback(null, { stdout: "", stderr: "" })
        }
        return {} as any
      })

      await deleteWorktreeBranch("/test/project", "feature_123")

      expect(exec).toHaveBeenCalledWith(
        "git branch -d conductor/feature_123",
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
    })

    it("should verify branch no longer exists", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("branch -d")) {
          callback(null, { stdout: "Deleted branch", stderr: "" })
        } else if (cmd.includes("branch --list")) {
          callback(null, { stdout: "", stderr: "" })
        }
        return {} as any
      })

      await deleteWorktreeBranch("/test/project", "feature_123")

      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("git branch --list conductor/feature_123"),
        expect.anything(),
        expect.any(Function)
      )
    })

    it("should handle branch deletion errors gracefully", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(new Error("branch not fully merged"), {
          stdout: "",
          stderr: "error: The branch 'conductor/feature_123' is not fully merged",
        })
        return {} as any
      })

      await expect(
        deleteWorktreeBranch("/test/project", "feature_123")
      ).rejects.toThrow("branch not fully merged")
    })
  })

  describe("cleanupWorktree orchestrator", () => {
    it("should execute complete cleanup sequence successfully", async () => {
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "completed",
        created_at: "2026-01-11T12:00:00Z",
        updated_at: "2026-01-11T12:30:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
        original_project_root: "/test/project",
      })

      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("checkout") || cmd.includes("merge")) {
          callback(null, { stdout: "Success", stderr: "" })
        } else if (cmd.includes("worktree remove")) {
          callback(null, { stdout: "", stderr: "" })
        } else if (cmd.includes("branch -d")) {
          callback(null, { stdout: "Deleted branch", stderr: "" })
        } else if (cmd.includes("branch --list")) {
          callback(null, { stdout: "", stderr: "" })
        }
        return {} as any
      })

      vi.mocked(existsSync).mockReturnValue(false)

      const result = await cleanupWorktree("/test/project", "feature_123", "main")

      expect(result.success).toBe(true)
      expect(result.merged).toBe(true)
      expect(result.worktreeRemoved).toBe(true)
      expect(result.branchDeleted).toBe(true)
      expect(metadataManager.clearTrackWorktreeInfo).toHaveBeenCalledWith(
        "/test/project",
        "feature_123"
      )
    })

    it("should stop cleanup sequence if merge fails due to conflicts", async () => {
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "completed",
        created_at: "2026-01-11T12:00:00Z",
        updated_at: "2026-01-11T12:30:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
        original_project_root: "/test/project",
      })

      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("checkout")) {
          callback(null, { stdout: "Success", stderr: "" })
        } else if (cmd.includes("merge")) {
          callback(new Error("CONFLICT: merge conflict"), { stdout: "", stderr: "" })
        } else if (cmd.includes("git diff --name-only --diff-filter=U")) {
          callback(null, { stdout: "src/file1.ts\nsrc/file2.ts\n", stderr: "" })
        }
        return {} as any
      })

      const result = await cleanupWorktree("/test/project", "feature_123", "main")

      expect(result.success).toBe(false)
      expect(result.merged).toBe(false)
      expect(result.worktreeRemoved).toBe(false)
      expect(result.branchDeleted).toBe(false)
      expect(result.error).toContain("Merge conflicts detected")
      expect(result.error).toContain("src/file1.ts")
      expect(result.error).toContain("src/file2.ts")
      expect(result.error).toContain("To resolve:")
      expect(metadataManager.clearTrackWorktreeInfo).not.toHaveBeenCalled()
    })

    it("should preserve worktree if removal fails", async () => {
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "completed",
        created_at: "2026-01-11T12:00:00Z",
        updated_at: "2026-01-11T12:30:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
        original_project_root: "/test/project",
      })

      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("checkout") || cmd.includes("merge")) {
          callback(null, { stdout: "Success", stderr: "" })
        } else if (cmd.includes("worktree remove")) {
          callback(new Error("Cannot remove worktree"), { stdout: "", stderr: "" })
        }
        return {} as any
      })

      const result = await cleanupWorktree("/test/project", "feature_123", "main")

      expect(result.success).toBe(false)
      expect(result.merged).toBe(true)
      expect(result.worktreeRemoved).toBe(false)
      expect(result.branchDeleted).toBe(false)
      expect(result.error).toContain("Failed to remove worktree")
      expect(metadataManager.clearTrackWorktreeInfo).not.toHaveBeenCalled()
    })

    it("should clean up metadata after complete successful cleanup", async () => {
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "completed",
        created_at: "2026-01-11T12:00:00Z",
        updated_at: "2026-01-11T12:30:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
        original_project_root: "/test/project",
      })

      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      vi.mocked(existsSync).mockReturnValue(false)

      await cleanupWorktree("/test/project", "feature_123", "main")

      expect(metadataManager.clearTrackWorktreeInfo).toHaveBeenCalledWith(
        "/test/project",
        "feature_123"
      )
    })

    it("should return original project root from metadata", async () => {
      const originalRoot = "/test/original/project"
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "completed",
        created_at: "2026-01-11T12:00:00Z",
        updated_at: "2026-01-11T12:30:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
        original_project_root: originalRoot,
      })

      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      vi.mocked(existsSync).mockReturnValue(false)

      const result = await cleanupWorktree("/test/project", "feature_123", "main")

      expect(result.originalProjectRoot).toBe(originalRoot)
    })
  })

  describe("getConflictedFiles", () => {
    it("should return list of files with merge conflicts", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        if (cmd.includes("git diff --name-only --diff-filter=U")) {
          callback(null, { stdout: "src/file1.ts\nsrc/file2.ts\nREADME.md\n", stderr: "" })
        }
        return {} as any
      })

      const files = await getConflictedFiles("/test/project")

      expect(files).toEqual(["src/file1.ts", "src/file2.ts", "README.md"])
    })

    it("should return empty array when no conflicts exist", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      const files = await getConflictedFiles("/test/project")

      expect(files).toEqual([])
    })

    it("should handle errors gracefully", async () => {
      vi.mocked(exec).mockImplementation((cmd: string, options: any, callback: any) => {
        callback(new Error("Git command failed"), { stdout: "", stderr: "" })
        return {} as any
      })

      await expect(getConflictedFiles("/test/project")).rejects.toThrow("Git command failed")
    })
  })
})
