import type { RestorationStep } from "./RestorationStep";

/** 提交审批时冻结的待审内容快照，审批只认快照不认活数据 */
export interface PlanVersionSnapshot {
  id: number;
  plan_id: number;
  version: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  /** 冻结时刻的步骤清单副本，审批期间的新记录不进快照 */
  steps: RestorationStep[];
  frozen_by: number;
  frozen_at: string;
  operation_id: string;
}
