import { create } from "zustand";
import {
  listRestorationStep,
  listRestorationStepsByPlan,
  createRestorationStep
} from "../api/RestorationStep";
import { createOperationNo } from "../utils/operationRetry";
import type { RestorationStep } from "../types/RestorationStep";

type State = {
  rows: RestorationStep[];
  loading: boolean;
  load: () => Promise<void>;
  loadByPlan: (planId: number) => Promise<void>;
  create: (payload: Partial<RestorationStep>) => Promise<void>;
};

export const useRestorationStepStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationStep(), loading: false });
  },
  async loadByPlan(planId) {
    set({ loading: true });
    set({ rows: await listRestorationStepsByPlan(planId), loading: false });
  },
  async create(payload) {
    await createRestorationStep(payload, createOperationNo());
    await get().load();
  }
}));
