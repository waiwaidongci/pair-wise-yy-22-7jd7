import { seed } from "../seed";
import type { PlanVersionSnapshot } from "../models/PlanVersionSnapshot";

/** 冻结快照仓储：提交时写入，审批与追溯只读 */
export const planVersionSnapshotRepository = {
  findByPlan: (planId: number) => seed.planVersionSnapshot.filter((row) => row.plan_id === planId),
  findByPlanAndVersion: (planId: number, version: number) =>
    seed.planVersionSnapshot.find((row) => row.plan_id === planId && row.version === version),
  save: (row: Omit<PlanVersionSnapshot, "id">) => {
    const record = { ...row, id: seed.planVersionSnapshot.length + 1 };
    seed.planVersionSnapshot.push(record);
    return record;
  }
};
