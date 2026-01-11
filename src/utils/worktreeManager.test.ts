import { describe, it, expect, vi, beforeEach } from "vitest"
import { getWorktreePath, sanitizeProjectName, createWorktree, getCurrentBranch } from "./worktreeManager.js"
import { join, resolve, dirname } from "path"
import { exec } from "child_process"
import { promisify } from "util"

vi.mock("child_process", () => ({
  exec: vi.fn(),
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

const execAsync = promisify(exec)

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
        expect.stringContaining("-b conductor/feature_20260111"),
        expect.any(Object),
        expect.any(Function)
      )
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining("main"),
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
})
