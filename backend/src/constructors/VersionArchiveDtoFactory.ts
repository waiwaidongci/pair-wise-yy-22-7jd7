import type { VersionArchive, VersionArchiveReason } from "../models/VersionArchive";

export const createVersionArchive = (
  overrides: Partial<VersionArchive> & Pick<VersionArchive, "entity_type" | "entity_id" | "version_no" | "reason" | "operation_no">
): VersionArchive => ({
  id: 0,
  snapshot: "{}",
  note: "",
  created_at: new Date().toISOString(),
  ...overrides
});

export type { VersionArchiveReason };
