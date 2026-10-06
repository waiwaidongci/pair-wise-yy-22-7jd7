import type { PlanVersionSnapshot } from "../models/PlanVersionSnapshot";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";

/** 提交冻结：把方案待审内容与当前工作稿步骤清单整体快照，之后审批只认此快照 */
export const createPlanVersionSnapshot = (
  plan: RestorationPlan,
  steps: RestorationStep[],
  operationId: string,
  actorId: number,
  id: number
): PlanVersionSnapshot => ({
  id,
  plan_id: plan.id,
  version: plan.version,
  plan_title: plan.plan_title,
  method: plan.method,
  risk_assessment: plan.risk_assessment,
  steps: steps.map((step) => ({ ...step })),
  frozen_by: actorId,
  frozen_at: new Date().toISOString(),
  operation_id: operationId
});
