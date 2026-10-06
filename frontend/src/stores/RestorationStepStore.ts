import { create } from "zustand";
import { executeRestorationStep, listRestorationStep } from "../api/RestorationStep";
import { ApiError } from "../api/http";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { RestorationStep } from "../types/RestorationStep";

type State = {
  rows: RestorationStep[];
  loading: boolean;
  /** 版本守卫提示：非已批准版本的步骤不能继续执行 */
  guardTip: string | null;
  load: () => Promise<void>;
  execute: (stepId: number) => Promise<void>;
  clearGuardTip: () => void;
};

export const useRestorationStepStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  guardTip: null,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationStep(), loading: false });
  },
  async execute(stepId) {
    try {
      await executeRestorationStep(stepId);
      set({ guardTip: null });
    } catch (err) {
      if (err instanceof ApiError && err.code === ERROR_CODES.VERSION_MISMATCH) {
        console.info(LOG_TEMPLATES.RestorationStep[5], stepId);
        set({ guardTip: ERROR_MESSAGES.VERSION_MISMATCH });
      } else {
        throw err;
      }
    }
    await get().load();
  },
  clearGuardTip() {
    set({ guardTip: null });
  }
}));
