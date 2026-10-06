import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { INITIAL_PLAN_VERSION } from "../constants/PlanVersion";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { planVersionService } from "./PlanVersionService";
import type { ApprovePlanPayload, SubmitPlanPayload } from "../types/RestorationPlanPayload";
import type { RestorationPlanRow } from "../models/RestorationPlan";

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),
  create: (row: RestorationPlanRow) => {
    console.info(LOG_TEMPLATES.RestorationPlan[0], row.plan_title);
    return restorationPlanRepository.save({
      ...row,
      version: row.version ?? INITIAL_PLAN_VERSION,
      submitted_version: row.submitted_version ?? null,
      approved_version: row.approved_version ?? null
    });
  },
  submit: (planId: number, payload: SubmitPlanPayload, actorId: number) =>
    planVersionService.submit(planId, payload, actorId),
  approve: (planId: number, payload: ApprovePlanPayload, expertId: number) =>
    planVersionService.approve(planId, payload, expertId),
  trace: (planId: number) => planVersionService.trace(planId)
};
