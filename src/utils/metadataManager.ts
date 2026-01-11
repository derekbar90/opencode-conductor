import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

export interface TrackMetadata {
  track_id: string
  type: "feature" | "bug"
  status: "new" | "in_progress" | "completed"
  created_at: string
  updated_at: string
  description: string
  worktree_path?: string
  worktree_branch?: string
}

export function saveTrackMetadata(
  projectRoot: string,
  trackId: string,
  metadata: TrackMetadata
): void {
  const trackDir = join(projectRoot, "conductor", "tracks", trackId)
  const metadataPath = join(trackDir, "metadata.json")

  if (!existsSync(trackDir)) {
    mkdirSync(trackDir, { recursive: true })
  }

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8")
}

export function loadTrackMetadata(
  projectRoot: string,
  trackId: string
): TrackMetadata {
  const metadataPath = join(
    projectRoot,
    "conductor",
    "tracks",
    trackId,
    "metadata.json"
  )

  if (!existsSync(metadataPath)) {
    throw new Error(`Track metadata not found: ${metadataPath}`)
  }

  const content = readFileSync(metadataPath, "utf-8")
  return JSON.parse(content) as TrackMetadata
}

export function updateTrackWorktreeInfo(
  projectRoot: string,
  trackId: string,
  worktreePath: string,
  worktreeBranch: string
): void {
  const metadata = loadTrackMetadata(projectRoot, trackId)
  
  metadata.worktree_path = worktreePath
  metadata.worktree_branch = worktreeBranch
  metadata.updated_at = new Date().toISOString()
  
  saveTrackMetadata(projectRoot, trackId, metadata)
}
