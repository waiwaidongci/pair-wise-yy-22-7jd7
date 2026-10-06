import { mockData } from "../mocks/seedData";
import type { RestorationStep } from "../types/RestorationStep";
import { newOperationId, postWithOperationRetry } from "./http";

const endpoint = "/api/restoration-step";

export async function listRestorationStep(): Promise<RestorationStep[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.restorationStep as unknown as RestorationStep[])];
}

export async function saveRestorationStep(payload: RestorationStep) {
  console.info("save RestorationStep", payload);
  return payload;
}

/** 新建步骤：服务端自动打上方案当前工作稿版本，审批期间的新记录留在工作稿 */
export async function createRestorationStep(
  payload: Pick<RestorationStep, "plan_id" | "step_order" | "technique" | "material_used" | "operator_id">
) {
  return postWithOperationRetry<RestorationStep>(endpoint, { ...payload, operation_id: newOperationId() });
}

export interface ExecuteStepResult {
  step?: RestorationStep;
  code?: string;
  message?: string;
}

/** 执行步骤：仅已批准版本可继续，写入失败按 operation_id 重试 */
export async function executeRestorationStep(stepId: number, operationId: string = newOperationId()) {
  return postWithOperationRetry<ExecuteStepResult>(`${endpoint}/${stepId}/execute`, { operation_id: operationId });
}
