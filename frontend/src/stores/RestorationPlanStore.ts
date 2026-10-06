import { create } from "zustand";
import {
  listRestorationPlan,
  submitRestorationPlan,
  approveRestorationPlan,
  rejectRestorationPlan
} from "../api/RestorationPlan";
import { createOperationNo } from "../utils/operationRetry";
import type { RestorationPlan } from "../types/RestorationPlan";

type ConflictResult = { conflict: boolean };

type State = {
  rows: RestorationPlan[];
  loading: boolean;
  load: () => Promise<void>;
  submit: (id: number) => Promise<ConflictResult>;
  approve: (id: number, expectedVersion: number, comment: string) => Promise<ConflictResult>;
  reject: (id: number, comment: string) => Promise<ConflictResult>;
};

export const useRestorationPlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listRestorationPlan(), loading: false });
  },
  async submit(id) {
    try {
      await submitRestorationPlan(id, createOperationNo());
      await get().load();
      return { conflict: false };
    } catch (err) {
      if ((err as { status?: number })?.status === 409) return { conflict: true };
      throw err;
    }
  },
  async approve(id, expectedVersion, comment) {
    try {
      await approveRestorationPlan(id, expectedVersion, comment, createOperationNo());
      await get().load();
      return { conflict: false };
    } catch (err) {
      if ((err as { status?: number })?.status === 409) {
        await get().load(); // 同步最新版本，意见已由服务端留档
        return { conflict: true };
      }
      throw err;
    }
  },
  async reject(id, comment) {
    try {
      await rejectRestorationPlan(id, comment, createOperationNo());
      await get().load();
      return { conflict: false };
    } catch (err) {
      if ((err as { status?: number })?.status === 409) {
        await get().load();
        return { conflict: true };
      }
      throw err;
    }
  }
}));
