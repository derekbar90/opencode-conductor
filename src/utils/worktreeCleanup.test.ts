import { describe, it, expect, vi, beforeEach } from "vitest"
import { exec } from "child_process"
import { promisify } from "util"
import { existsSync } from "fs"
import {
  mergeWorktreeBranch,
  removeWorktree,
  deleteWorktreeBranch,
} from "./worktreeCleanup.js"

vi.mock("child_process", () => ({
  exec: vi.fn(),
}))

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
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
})
