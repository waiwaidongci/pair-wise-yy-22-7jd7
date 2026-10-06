import { seed } from "../seed";
import type { VersionArchive } from "../models/VersionArchive";

const rows: VersionArchive[] = [...(seed.versionArchive as unknown as VersionArchive[])];

export const versionArchiveRepository = {
  findAll: (): VersionArchive[] => rows.map((row) => ({ ...row })),
  findByEntity: (entityType: VersionArchive["entity_type"], entityId: number): VersionArchive[] =>
    rows.filter((row) => row.entity_type === entityType && row.entity_id === entityId).map((row) => ({ ...row })),
  insert: (row: VersionArchive): VersionArchive => {
    rows.push(row);
    return { ...row };
  },
  nextId: (): number => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1
};
