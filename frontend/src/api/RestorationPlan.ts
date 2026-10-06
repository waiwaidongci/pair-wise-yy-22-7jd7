import { mockData } from "../mocks/seedData";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanVersionTrace } from "../types/ApprovalRecord";
import { newOperationId, postWithOperationRetry } from "./http";

const endpoint = "/api/restoration-plan";

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.restorationPlan as unknown as RestorationPlan[])];
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}

export interface SubmitPlanResult {
  plan: RestorationPlan;
  snapshot?: unknown;
  code?: string;
  message?: string;
}

/** 提交审批：冻结当前工作稿为待审快照，失败按 operation_id 重试 */
export async function submitRestorationPlan(planId: number, operationId: string = newOperationId()) {
  return postWithOperationRetry<SubmitPlanResult>(`${endpoint}/${planId}/submit`, { operation_id: operationId });
}

export interface ApprovePlanResult {
  plan?: RestorationPlan;
  outcome?: "APPLIED" | "CONFLICT_RETAINED";
  code?: string;
  message?: string;
}

/** 专家审批：expected_version 为评审时看到的冻结版本，冲突时意见保留并提示同步 */
export async function approveRestorationPlan(
  planId: number,
  payload: { expected_version: number; decision: "APPROVED" | "REJECTED"; opinion: string },
  operationId: string = newOperationId()
) {
  return postWithOperationRetry<ApprovePlanResult>(`${endpoint}/${planId}/approve`, {
    operation_id: operationId,
    ...payload
  });
}

/** 版本追溯：快照 + 审批意见 + 留档 */
export async function traceRestorationPlan(planId: number): Promise<PlanVersionTrace> {
  const res = await fetch(`${endpoint}/${planId}/trace`);
  if (!res.ok) throw new Error(`trace failed: ${res.status}`);
  return res.json();
}
