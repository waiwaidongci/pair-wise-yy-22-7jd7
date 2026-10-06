import type { RestorationStep } from "./RestorationStep";

/** 提交时冻结的待审快照 */
export interface PlanVersionSnapshot {
  id: number;
  plan_id: number;
  version: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  steps: RestorationStep[];
  frozen_by: number;
  frozen_at: string;
  operation_id: string;
}

/** 专家审批意见：APPLIED 生效 / CONFLICT_RETAINED 冲突保留 */
export interface ApprovalRecord {
  id: number;
  plan_id: number;
  version: number;
  expert_id: number;
  decision: string;
  opinion: string;
  outcome: string;
  operation_id: string;
  created_at: string;
}

/** 版本留档记录 */
export interface VersionArchiveRecord {
  id: number;
  plan_id: number;
  version: number;
  action: string;
  actor_id: number;
  detail: string;
  created_at: string;
}

/** 版本追溯聚合：GET /api/restoration-plan/:id/trace */
export interface PlanVersionTrace {
  snapshots: PlanVersionSnapshot[];
  approvals: ApprovalRecord[];
  archives: VersionArchiveRecord[];
}
