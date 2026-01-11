import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { loadTrackMetadata, saveTrackMetadata, updateTrackWorktreeInfo, type TrackMetadata } from "./metadataManager.js"

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  rmSync: vi.fn(),
}))

describe("metadataManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("saveTrackMetadata", () => {
    it("should save metadata with worktree_path field", () => {
      const metadata: TrackMetadata = {
        track_id: "feature_20260111",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_20260111",
      }

      saveTrackMetadata("/test/project", "feature_20260111", metadata)

      expect(writeFileSync).toHaveBeenCalledWith(
        "/test/project/conductor/tracks/feature_20260111/metadata.json",
        expect.stringContaining('"worktree_path"'),
        "utf-8"
      )
    })

    it("should save metadata with worktree_branch field", () => {
      const metadata: TrackMetadata = {
        track_id: "feature_20260111",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
        worktree_branch: "conductor/feature_20260111",
      }

      saveTrackMetadata("/test/project", "feature_20260111", metadata)

      expect(writeFileSync).toHaveBeenCalledWith(
        "/test/project/conductor/tracks/feature_20260111/metadata.json",
        expect.stringContaining('"worktree_branch"'),
        "utf-8"
      )
    })

    it("should save metadata with both worktree fields", () => {
      const metadata: TrackMetadata = {
        track_id: "feature_20260111",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_20260111",
        worktree_branch: "conductor/feature_20260111",
      }

      saveTrackMetadata("/test/project", "feature_20260111", metadata)

      const writtenData = vi.mocked(writeFileSync).mock.calls[0][1] as string
      expect(writtenData).toContain('"worktree_path"')
      expect(writtenData).toContain('"worktree_branch"')
    })

    it("should create track directory if it doesn't exist", () => {
      vi.mocked(existsSync).mockReturnValue(false)

      const metadata: TrackMetadata = {
        track_id: "feature_20260111",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
      }

      saveTrackMetadata("/test/project", "feature_20260111", metadata)

      expect(mkdirSync).toHaveBeenCalledWith(
        "/test/project/conductor/tracks/feature_20260111",
        { recursive: true }
      )
    })
  })

  describe("loadTrackMetadata", () => {
    it("should load metadata and read worktree fields", () => {
      const mockMetadata = {
        track_id: "feature_20260111",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
        worktree_path: "/test/project-worktrees/feature_20260111",
        worktree_branch: "conductor/feature_20260111",
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockMetadata))

      const metadata = loadTrackMetadata("/test/project", "feature_20260111")

      expect(metadata.worktree_path).toBe("/test/project-worktrees/feature_20260111")
      expect(metadata.worktree_branch).toBe("conductor/feature_20260111")
    })

    it("should handle metadata without worktree fields (backward compatibility)", () => {
      const mockMetadata = {
        track_id: "feature_20260111",
        type: "feature",
        status: "new",
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockMetadata))

      const metadata = loadTrackMetadata("/test/project", "feature_20260111")

      expect(metadata.worktree_path).toBeUndefined()
      expect(metadata.worktree_branch).toBeUndefined()
      expect(metadata.track_id).toBe("feature_20260111")
    })

    it("should throw error when metadata file doesn't exist", () => {
      vi.mocked(existsSync).mockReturnValue(false)

      expect(() => {
        loadTrackMetadata("/test/project", "nonexistent_track")
      }).toThrow("Track metadata not found")
    })

    it("should throw error when JSON is malformed", () => {
      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue("invalid json{")

      expect(() => {
        loadTrackMetadata("/test/project", "feature_20260111")
      }      ).toThrow()
    })
  })

  describe("updateTrackWorktreeInfo", () => {
    it("should update existing metadata with worktree_path when worktree is used", () => {
      const existingMetadata = {
        track_id: "feature_20260111",
        type: "feature" as const,
        status: "new" as const,
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existingMetadata))

      updateTrackWorktreeInfo(
        "/test/project",
        "feature_20260111",
        "/test/project-worktrees/feature_20260111",
        "conductor/feature_20260111"
      )

      expect(writeFileSync).toHaveBeenCalled()
      const writtenData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string)
      expect(writtenData.worktree_path).toBe("/test/project-worktrees/feature_20260111")
      expect(writtenData.worktree_branch).toBe("conductor/feature_20260111")
    })

    it("should update existing metadata with worktree_branch", () => {
      const existingMetadata = {
        track_id: "feature_20260111",
        type: "feature" as const,
        status: "new" as const,
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existingMetadata))

      updateTrackWorktreeInfo(
        "/test/project",
        "feature_20260111",
        "/test/project-worktrees/feature_20260111",
        "conductor/feature_20260111"
      )

      const writtenData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string)
      expect(writtenData.worktree_branch).toBe("conductor/feature_20260111")
    })

    it("should preserve other metadata fields when updating worktree info", () => {
      const existingMetadata = {
        track_id: "feature_20260111",
        type: "feature" as const,
        status: "in_progress" as const,
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature with existing data",
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existingMetadata))

      updateTrackWorktreeInfo(
        "/test/project",
        "feature_20260111",
        "/test/project-worktrees/feature_20260111",
        "conductor/feature_20260111"
      )

      const writtenData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string)
      expect(writtenData.track_id).toBe("feature_20260111")
      expect(writtenData.type).toBe("feature")
      expect(writtenData.status).toBe("in_progress")
      expect(writtenData.description).toBe("Test feature with existing data")
    })

    it("should update the updated_at timestamp", () => {
      const existingMetadata = {
        track_id: "feature_20260111",
        type: "feature" as const,
        status: "new" as const,
        created_at: "2026-01-11T00:00:00Z",
        updated_at: "2026-01-11T00:00:00Z",
        description: "Test feature",
      }

      vi.mocked(existsSync).mockReturnValue(true)
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(existingMetadata))

      updateTrackWorktreeInfo(
        "/test/project",
        "feature_20260111",
        "/test/project-worktrees/feature_20260111",
        "conductor/feature_20260111"
      )

      const writtenData = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string)
      expect(writtenData.updated_at).not.toBe("2026-01-11T00:00:00Z")
      expect(new Date(writtenData.updated_at).getTime()).toBeGreaterThan(0)
    })
  })
})

