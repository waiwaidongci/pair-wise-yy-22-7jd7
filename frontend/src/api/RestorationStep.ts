import { mockData } from "../mocks/seedData";
import type { RestorationStep } from "../types/RestorationStep";
import { withOperationRetry } from "../utils/operationRetry";

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

export async function listRestorationStepsByPlan(planId: number): Promise<RestorationStep[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(`${endpoint}?plan_id=${planId}`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return (mockData.restorationStep as unknown as RestorationStep[]).filter((s) => s.plan_id === planId);
}

async function postWithOperation(path: string, body: Record<string, unknown>, operationNo: string) {
  const res = await fetch(`${endpoint}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, operation_no: operationNo })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data as { message?: string }).message ?? "request failed") as Error & {
      status: number;
      code: string;
    };
    err.status = res.status;
    err.code = (data as { code?: string }).code ?? "REQUEST_FAILED";
    throw err;
  }
  return data;
}

export function createRestorationStep(payload: Partial<RestorationStep>, operationNo: string) {
  return withOperationRetry((op) => postWithOperation("/", { ...payload }, op), operationNo);
}

export async function saveRestorationStep(payload: RestorationStep) {
  console.info("save RestorationStep", payload);
  return payload;
}
