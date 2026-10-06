import { seed } from "../seed";
import type { ApprovalRecord } from "../models/ApprovalRecord";

/** 审批意见仓储：先生效者与冲突保留者的意见都落库 */
export const approvalRecordRepository = {
  findByPlan: (planId: number) => seed.approvalRecord.filter((row) => row.plan_id === planId),
  save: (row: Omit<ApprovalRecord, "id">) => {
    const record = { ...row, id: seed.approvalRecord.length + 1 };
    seed.approvalRecord.push(record);
    return record;
  }
};
