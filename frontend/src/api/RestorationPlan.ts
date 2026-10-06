import { mockData } from "../mocks/seedData";
import type { RestorationPlan } from "../types/RestorationPlan";
import { withOperationRetry } from "../utils/operationRetry";

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

export function submitRestorationPlan(id: number, operationNo: string) {
  return withOperationRetry((op) => postWithOperation(`/${id}/submit`, {}, op), operationNo);
}

export function approveRestorationPlan(id: number, expectedVersion: number, comment: string, operationNo: string) {
  return withOperationRetry(
    (op) => postWithOperation(`/${id}/approve`, { expected_version: expectedVersion, comment }, op),
    operationNo
  );
}

export function rejectRestorationPlan(id: number, comment: string, operationNo: string) {
  return withOperationRetry((op) => postWithOperation(`/${id}/reject`, { comment }, op), operationNo);
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}
