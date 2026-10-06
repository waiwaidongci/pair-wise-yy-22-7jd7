import type { RestorationStep } from "../types/RestorationStep";
import { INITIAL_PLAN_VERSION } from "../constants/PlanVersion";

export const createDefaultRestorationStep = (overrides: Partial<RestorationStep> = {}): RestorationStep => ({
  id: 1 as never,
  plan_id: 1 as never,
  step_order: "step order 1" as never,
  technique: "technique 1" as never,
  material_used: "material used 1" as never,
  operator_id: 1 as never,
  step_status: "SUBMITTED" as never,
  finished_at: "2026-06-11T09:00:00Z" as never,
  plan_version: INITIAL_PLAN_VERSION as never,
  ...overrides
});

export const createRestorationStepForm = createDefaultRestorationStep;
export const createRestorationStepResponse = createDefaultRestorationStep;
