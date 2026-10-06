import type { ApprovalRecord } from "../models/ApprovalRecord";

/** 审批意见留痕：生效（APPLIED）或冲突保留（CONFLICT_RETAINED）都落同一条记录 */
export const createApprovalRecord = (overrides: Partial<ApprovalRecord> = {}): ApprovalRecord => ({
  id: 0,
  plan_id: 0,
  version: 0,
  expert_id: 0,
  decision: "APPROVED",
  opinion: "",
  outcome: "APPLIED",
  operation_id: "",
  created_at: new Date().toISOString(),
  ...overrides
});
