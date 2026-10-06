export type VersionArchiveReason = "LEGACY_UPGRADE" | "SUBMIT_FREEZE" | "APPROVE" | "APPROVE_OPINION";

export interface VersionArchive {
  id: number;
  entity_type: "RestorationPlan" | "RestorationStep";
  entity_id: number;
  version_no: number;
  snapshot: string;
  reason: VersionArchiveReason;
  operation_no: string;
  note: string;
  created_at: string;
}
