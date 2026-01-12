import { describe, it, expect, vi, beforeEach } from "vitest"
import { getWorktreePath, sanitizeProjectName, createWorktree, getCurrentBranch, worktreeExists, validateTrackId } from "./worktreeManager.js"
import { dirname } from "path"
import { exec } from "child_process"
import { existsSync } from "fs"
import { promisify } from "util"

vi.mock("child_process", () => ({
  exec: vi.fn(),
}))

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
}))

vi.mock("util", () => ({
  promisify: vi.fn((fn) => {
    return (cmd: string, options: any) => {
      return new Promise((resolve, reject) => {
        fn(cmd, options, (error: Error | null, result: any) => {
          if (error) reject(error)
          else resolve(result)
        })
      })
    }
  }),
}))

describe("worktreeManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  describe("sanitizeProjectName", () => {
    it("should keep simple project names unchanged", () => {
      expect(sanitizeProjectName("my-project")).toBe("my-project")
      expect(sanitizeProjectName("opencode-conductor")).toBe("opencode-conductor")
    })

    it("should handle project names with spaces", () => {
      expect(sanitizeProjectName("my project")).toBe("my-project")
      expect(sanitizeProjectName("open code  conductor")).toBe("open-code-conductor")
    })

    it("should handle special characters in project names", () => {
      expect(sanitizeProjectName("my@project!")).toBe("my-project")
      expect(sanitizeProjectName("project#2$test")).toBe("project-2-test")
      expect(sanitizeProjectName("hello(world)")).toBe("hello-world")
    })

    it("should handle consecutive special characters", () => {
      expect(sanitizeProjectName("my---project")).toBe("my-project")
      expect(sanitizeProjectName("test___app")).toBe("test-app")
    })

    it("should trim leading and trailing hyphens", () => {
      expect(sanitizeProjectName("-my-project-")).toBe("my-project")
      expect(sanitizeProjectName("---test---")).toBe("test")
    })

    it("should convert to lowercase", () => {
      expect(sanitizeProjectName("MyProject")).toBe("myproject")
      expect(sanitizeProjectName("OPENCODE")).toBe("opencode")
    })
  })

  describe("validateTrackId", () => {
    it("should accept valid track IDs", () => {
      expect(validateTrackId("auth-feature_20260111")).toBe("auth-feature_20260111")
      expect(validateTrackId("feature_123")).toBe("feature_123")
      expect(validateTrackId("bug-fix-456")).toBe("bug-fix-456")
    })

    it("should trim whitespace from track IDs", () => {
      expect(validateTrackId("  feature_123  ")).toBe("feature_123")
      expect(validateTrackId("\nauth-feature\t")).toBe("auth-feature")
    })

    it("should reject track IDs with forward slashes", () => {
      expect(() => validateTrackId("feature/123")).toThrow(
        'Track ID "feature/123" contains invalid characters'
      )
    })

    it("should reject track IDs with backslashes", () => {
      expect(() => validateTrackId("feature\\123")).toThrow(
        'Track ID "feature\\123" contains invalid characters'
      )
    })

    it("should reject track IDs with colons", () => {
      expect(() => validateTrackId("feature:123")).toThrow(
        'Track ID "feature:123" contains invalid characters'
      )
    })

    it("should reject track IDs with path traversal sequences", () => {
      expect(() => validateTrackId("../etc/passwd")).toThrow(
        'Track ID "../etc/passwd" contains ".." which could lead to path traversal'
      )
      expect(() => validateTrackId("feature..123")).toThrow(
        'Track ID "feature..123" contains ".." which could lead to path traversal'
      )
    })

    it("should reject track IDs with shell metacharacters", () => {
      expect(() => validateTrackId("feature;rm -rf")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("test|cat /etc/passwd")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("feature`whoami`")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("test$USER")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("feature(test)")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("test&background")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("feature>output")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("test<input")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("feature'quoted'")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId('test"quoted"')).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("feature!bang")).toThrow("contains unsafe shell characters")
      expect(() => validateTrackId("test with spaces")).toThrow("contains unsafe shell characters")
    })

    it("should reject empty track IDs", () => {
      expect(() => validateTrackId("")).toThrow("Track ID must be a non-empty string")
      expect(() => validateTrackId("   ")).toThrow("Track ID must be a non-empty string")
    })

    it("should reject non-string track IDs", () => {
      expect(() => validateTrackId(null as any)).toThrow("Track ID must be a non-empty string")
      expect(() => validateTrackId(undefined as any)).toThrow("Track ID must be a non-empty string")
      expect(() => validateTrackId(123 as any)).toThrow("Track ID must be a non-empty string")
    })
  })

  describe("getWorktreePath", () => {
    it("should generate worktree path from project name and track_id", () => {
      const projectRoot = "/Users/test/my-project"
      const trackId = "auth-feature_20260111"
      
      const path = getWorktreePath(projectRoot, trackId)
      
      expect(path).toBe("/Users/test/my-project-worktrees/auth-feature_20260111")
    })

    it("should handle project names with spaces", () => {
      const projectRoot = "/Users/test/my project"
      const trackId = "feature_123"
      
      const path = getWorktreePath(projectRoot, trackId)
      
      expect(path).toBe("/Users/test/my-project-worktrees/feature_123")
    })

    it("should handle special characters in project names", () => {
      const projectRoot = "/Users/test/my@project!"
      const trackId = "feature_456"
      
      const path = getWorktreePath(projectRoot, trackId)
      
      expect(path).toBe("/Users/test/my-project-worktrees/feature_456")
    })

    it("should verify path is sibling to project root", () => {
      const projectRoot = "/Users/test/projects/opencode-conductor"
      const trackId = "worktree_20260111"
      
      const path = getWorktreePath(projectRoot, trackId)
      
      const projectParent = dirname(projectRoot)
      const worktreeParent = dirname(dirname(path))
      
      expect(worktreeParent).toBe(projectParent)
    })

    it("should handle nested project paths", () => {
      const projectRoot = "/Users/test/code/workspace/my-app"
      const trackId = "feature_789"
      
      const path = getWorktreePath(projectRoot, trackId)
      
      expect(path).toBe("/Users/test/code/workspace/my-app-worktrees/feature_789")
    })

    it("should handle Windows-style paths", () => {
      const projectRoot = "C:\\Users\\test\\my-project"
      const trackId = "feature_123"
      
      const path = getWorktreePath(projectRoot, trackId)
      
      expect(path).toContain("my-project-worktrees")
      expect(path).toContain("feature_123")
    })
  })

  describe("getCurrentBranch", () => {
    it("should detect current branch", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(null, { stdout: "main\n", stderr: "" })
        return {} as any
      })

      const branch = await getCurrentBranch("/test/project")
      
      expect(branch).toBe("main")
      expect(exec).toHaveBeenCalledWith(
        "git branch --show-current",
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
    })

    it("should handle branch detection errors", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(new Error("Not a git repository"), null)
        return {} as any
      })

      await expect(getCurrentBranch("/test/project")).rejects.toThrow("Not a git repository")
    })
  })

  describe("createWorktree", () => {
    it("should create worktree with correct branch name format", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      const worktreePath = await createWorktree(
        "/test/project",
        "feature_20260111",
        "main"
      )

      expect(worktreePath).toContain("feature_20260111")
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("git worktree add"),
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('-b "conductor/feature_20260111"'),
        expect.any(Object),
        expect.any(Function)
      )
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('"main"'),
        expect.any(Object),
        expect.any(Function)
      )
    })

    it("should verify worktree created in correct location", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      const worktreePath = await createWorktree(
        "/test/project",
        "feature_20260111",
        "main"
      )

      expect(worktreePath).toBe("/test/project-worktrees/feature_20260111")
    })

    it("should handle existing worktree directory error", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(new Error("fatal: '/path' already exists"), null)
        return {} as any
      })

      await expect(
        createWorktree("/test/project", "feature_20260111", "main")
      ).rejects.toThrow("already exists")
    })

    it("should remove stale worktree directory and retry creation", async () => {
      const { rmSync } = await import("fs")
      
      vi.mocked(existsSync).mockReturnValueOnce(true).mockReturnValueOnce(true)
      
      let callCount = 0
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        if (cmd.includes("git worktree list --porcelain")) {
          callback(null, { stdout: "", stderr: "" })
        } else if (cmd.includes("git worktree prune")) {
          callback(null, { stdout: "", stderr: "" })
        } else if (cmd.includes("git worktree add")) {
          callback(null, { stdout: "", stderr: "" })
        }
        return {} as any
      })

      const worktreePath = await createWorktree(
        "/test/project",
        "feature_20260111",
        "main"
      )

      expect(rmSync).toHaveBeenCalledWith(
        expect.stringContaining("feature_20260111"),
        { recursive: true, force: true }
      )
      expect(worktreePath).toContain("feature_20260111")
    })

    it("should handle stale directory removal failure gracefully", async () => {
      const { rmSync } = await import("fs")
      
      vi.mocked(existsSync).mockReturnValue(true)
      
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        if (cmd.includes("git worktree list --porcelain")) {
          callback(null, { stdout: "", stderr: "" })
        } else if (cmd.includes("git worktree prune")) {
          callback(new Error("Prune failed"), null)
        } else if (cmd.includes("git worktree add")) {
          callback(null, { stdout: "", stderr: "" })
        }
        return {} as any
      })

      const worktreePath = await createWorktree(
        "/test/project",
        "feature_20260111",
        "main"
      )

      expect(rmSync).toHaveBeenCalled()
      expect(worktreePath).toContain("feature_20260111")
    })

    it("should throw error if worktree exists and is registered in Git", async () => {
      vi.mocked(existsSync).mockReturnValue(true)
      
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        if (cmd.includes("git worktree list --porcelain")) {
          callback(null, { stdout: "/test/project-worktrees/feature_20260111\n", stderr: "" })
        }
        return {} as any
      })

      await expect(
        createWorktree("/test/project", "feature_20260111", "main")
      ).rejects.toThrow("Worktree already exists")
    })

    it("should pass project root as working directory", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      await createWorktree("/test/project", "feature_20260111", "main")

      expect(exec).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
    })
  })

  describe("worktreeExists", () => {
    it("should return true when worktree directory exists", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        // Mock git worktree list output
        const worktreeList = "/test/project-worktrees/feature_20260111  abc123 [conductor/feature_20260111]"
        callback(null, { stdout: worktreeList, stderr: "" })
        return {} as any
      })

      const exists = await worktreeExists("/test/project", "feature_20260111")
      
      expect(exists).toBe(true)
      expect(exec).toHaveBeenCalledWith(
        "git worktree list --porcelain",
        expect.objectContaining({ cwd: "/test/project" }),
        expect.any(Function)
      )
    })

    it("should return false when worktree doesn't exist", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        // Mock empty worktree list
        callback(null, { stdout: "", stderr: "" })
        return {} as any
      })

      const exists = await worktreeExists("/test/project", "nonexistent_track")
      
      expect(exists).toBe(false)
    })

    it("should handle git worktree list errors gracefully", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        callback(new Error("Not a git repository"), null)
        return {} as any
      })

      await expect(worktreeExists("/test/project", "feature_20260111")).rejects.toThrow("Not a git repository")
    })

    it("should check worktree path in git output", async () => {
      vi.mocked(exec).mockImplementation((cmd: any, options: any, callback: any) => {
        const worktreeList = `
worktree /test/project
HEAD abc123
branch refs/heads/main

worktree /test/project-worktrees/feature_20260111
HEAD def456
branch refs/heads/conductor/feature_20260111

worktree /test/project-worktrees/other_track
HEAD ghi789
branch refs/heads/conductor/other_track
`
        callback(null, { stdout: worktreeList, stderr: "" })
        return {} as any
      })

      const exists = await worktreeExists("/test/project", "feature_20260111")
      
      expect(exists).toBe(true)
    })
  })
})
