import { describe, it, expect, vi, beforeEach } from "vitest"
import { setupWorktreeForTrack, type WorktreeSetupResult } from "./worktreeOrchestrator.js"
import * as workflowParser from "./workflowParser.js"
import * as worktreeManager from "./worktreeManager.js"
import * as metadataManager from "./metadataManager.js"

vi.mock("./workflowParser.js")
vi.mock("./worktreeManager.js")
vi.mock("./metadataManager.js")

describe("worktreeOrchestrator", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("setupWorktreeForTrack", () => {
    it("should skip worktree creation when use_worktrees is false", async () => {
      vi.mocked(workflowParser.parseWorkflowConfig).mockReturnValue({
        use_worktrees: false,
      })

      const result = await setupWorktreeForTrack("/test/project", "feature_123")

      expect(result.worktreeCreated).toBe(false)
      expect(result.worktreePath).toBeUndefined()
      expect(result.worktreeBranch).toBeUndefined()
      expect(worktreeManager.createWorktree).not.toHaveBeenCalled()
    })

    it("should skip worktree creation when worktree already exists", async () => {
      vi.mocked(workflowParser.parseWorkflowConfig).mockReturnValue({
        use_worktrees: true,
      })
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "in_progress",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
      })
      vi.mocked(worktreeManager.worktreeExists).mockResolvedValue(true)

      const result = await setupWorktreeForTrack("/test/project", "feature_123")

      expect(result.worktreeCreated).toBe(false)
      expect(result.worktreePath).toBe("/test/project-worktrees/feature_123")
      expect(result.worktreeBranch).toBe("conductor/feature_123")
      expect(worktreeManager.createWorktree).not.toHaveBeenCalled()
    })

    it("should create worktree when use_worktrees is enabled and worktree doesn't exist", async () => {
      vi.mocked(workflowParser.parseWorkflowConfig).mockReturnValue({
        use_worktrees: true,
      })
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test",
      })
      vi.mocked(worktreeManager.worktreeExists).mockResolvedValue(false)
      vi.mocked(worktreeManager.getCurrentBranch).mockResolvedValue("main")
      vi.mocked(worktreeManager.createWorktree).mockResolvedValue(
        "/test/project-worktrees/feature_123"
      )

      const result = await setupWorktreeForTrack("/test/project", "feature_123")

      expect(result.worktreeCreated).toBe(true)
      expect(result.worktreePath).toBe("/test/project-worktrees/feature_123")
      expect(result.worktreeBranch).toBe("conductor/feature_123")
      expect(worktreeManager.getCurrentBranch).toHaveBeenCalledWith("/test/project")
      expect(worktreeManager.createWorktree).toHaveBeenCalledWith(
        "/test/project",
        "feature_123",
        "main"
      )
    })

    it("should update track metadata after worktree creation", async () => {
      vi.mocked(workflowParser.parseWorkflowConfig).mockReturnValue({
        use_worktrees: true,
      })
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test",
      })
      vi.mocked(worktreeManager.worktreeExists).mockResolvedValue(false)
      vi.mocked(worktreeManager.getCurrentBranch).mockResolvedValue("main")
      vi.mocked(worktreeManager.createWorktree).mockResolvedValue(
        "/test/project-worktrees/feature_123"
      )

      await setupWorktreeForTrack("/test/project", "feature_123")

      expect(metadataManager.updateTrackWorktreeInfo).toHaveBeenCalledWith(
        "/test/project",
        "feature_123",
        "/test/project-worktrees/feature_123",
        "conductor/feature_123"
      )
    })

    it("should fallback gracefully when worktree creation fails", async () => {
      vi.mocked(workflowParser.parseWorkflowConfig).mockReturnValue({
        use_worktrees: true,
      })
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test",
      })
      vi.mocked(worktreeManager.worktreeExists).mockResolvedValue(false)
      vi.mocked(worktreeManager.getCurrentBranch).mockResolvedValue("main")
      vi.mocked(worktreeManager.createWorktree).mockRejectedValue(
        new Error("Directory already exists")
      )

      const result = await setupWorktreeForTrack("/test/project", "feature_123")

      expect(result.worktreeCreated).toBe(false)
      expect(result.error).toContain("Directory already exists")
      expect(result.fallbackToNormalMode).toBe(true)
    })

    it("should return existing worktree info from metadata", async () => {
      vi.mocked(workflowParser.parseWorkflowConfig).mockReturnValue({
        use_worktrees: true,
      })
      vi.mocked(metadataManager.loadTrackMetadata).mockReturnValue({
        track_id: "feature_123",
        type: "feature",
        status: "in_progress",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test",
        worktree_path: "/test/project-worktrees/feature_123",
        worktree_branch: "conductor/feature_123",
      })
      vi.mocked(worktreeManager.worktreeExists).mockResolvedValue(true)

      const result = await setupWorktreeForTrack("/test/project", "feature_123")

      expect(result.worktreePath).toBe("/test/project-worktrees/feature_123")
      expect(result.worktreeBranch).toBe("conductor/feature_123")
      expect(result.usingExistingWorktree).toBe(true)
    })
  })
})
