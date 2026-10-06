export interface SubmitPlanPayload {
  /** 幂等操作编号：写入失败后客户端按此编号重试 */
  operation_id: string;
}

export interface ApprovePlanPayload {
  operation_id: string;
  /** 专家评审时看到的冻结版本号，先到者生效的乐观并发依据 */
  expected_version: number;
  decision: "APPROVED" | "REJECTED";
  opinion: string;
}

export type RestorationPlanPayload = Record<string, unknown>;
