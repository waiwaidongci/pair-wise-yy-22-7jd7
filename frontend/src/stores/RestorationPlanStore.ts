import { create } from "zustand";
import {
  approveRestorationPlan,
  listRestorationPlan,
  submitRestorationPlan,
  traceRestorationPlan
} from "../api/RestorationPlan";
import { ApiError } from "../api/http";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { PlanVersionTrace } from "../types/ApprovalRecord";

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  /** 审批冲突提示：后到者意见已保留，请同步最新版本 */
  conflictTip: string | null;
  trace: PlanVersionTrace | null;
  load: () => Promise<void>;
  submit: (planId: number) => Promise<void>;
  approve: (planId: number, decision: "APPROVED" | "REJECTED", opinion: string) => Promise<void>;
  loadTrace: (planId: number) => Promise<void>;
  clearConflict: () => void;
};

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  conflictTip: null,
  trace: null,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationPlan(), loading: false });
  },
  async submit(planId) {
    await submitRestorationPlan(planId);
    console.info(LOG_TEMPLATES.RestorationPlan[4], planId);
    await get().load();
  },
  async approve(planId, decision, opinion) {
    const plan = get().rows.find((row) => row.id === planId);
    if (!plan || plan.submitted_version == null) {
      set({ conflictTip: ERROR_MESSAGES.PLAN_NOT_SUBMITTED });
      return;
    }
    try {
      const result = await approveRestorationPlan(planId, {
        expected_version: plan.submitted_version,
        decision,
        opinion
      });
      if (result.outcome === "APPLIED") {
        console.info(LOG_TEMPLATES.RestorationPlan[5], planId);
        set({ conflictTip: null });
      }
    } catch (err) {
      // 后到者：意见已保留，提示同步最新版本
      if (err instanceof ApiError && err.code === ERROR_CODES.APPROVAL_CONFLICT) {
        console.info(LOG_TEMPLATES.RestorationPlan[6], planId);
        set({ conflictTip: ERROR_MESSAGES.APPROVAL_CONFLICT });
      } else {
        throw err;
      }
    }
    await get().load();
  },
  async loadTrace(planId) {
    set({ trace: await traceRestorationPlan(planId) });
  },
  clearConflict() {
    set({ conflictTip: null });
  }
}));
