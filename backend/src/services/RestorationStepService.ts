import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { planVersionService } from "./PlanVersionService";
import type { CreateRestorationStepPayload, ExecuteRestorationStepPayload } from "../types/RestorationStepPayload";
import type { OperationResult } from "./PlanVersionService";

export const restorationStepService = {
  list: () => restorationStepRepository.findAll(),
  /** 新建步骤：自动打上方案当前工作稿版本，审批期间的新记录留在工作稿 */
  create: (payload: CreateRestorationStepPayload) => {
    const plan = restorationPlanRepository.findById(Number(payload.plan_id));
    if (!plan) {
      throw Object.assign(new Error(`plan ${payload.plan_id} not found`), { status: 404, code: ERROR_CODES.VALIDATION_FAILED });
    }
    const step = restorationStepRepository.save({
      id: restorationStepRepository.findAll().reduce((max, row) => Math.max(max, row.id), 0) + 1,
      plan_id: plan.id,
      step_order: payload.step_order,
      technique: payload.technique,
      material_used: payload.material_used,
      operator_id: payload.operator_id,
      step_status: "DRAFT",
      finished_at: "",
      plan_version: planVersionService.assignWorkingVersion(plan)
    });
    console.info(LOG_TEMPLATES.RestorationStep[0], step.id);
    return step;
  },
  /** 执行步骤：仅已批准版本可继续，写入失败按 operation_id 重试 */
  execute: (stepId: number, payload: ExecuteRestorationStepPayload): OperationResult =>
    planVersionService.runIdempotent(payload.operation_id, "RestorationStep.execute", () => {
      const step = restorationStepRepository.findById(stepId);
      if (!step) {
        throw Object.assign(new Error(`step ${stepId} not found`), { status: 404, code: ERROR_CODES.VALIDATION_FAILED });
      }
      const plan = restorationPlanRepository.findById(step.plan_id);
      if (!plan) {
        throw Object.assign(new Error(`plan ${step.plan_id} not found`), { status: 404, code: ERROR_CODES.VALIDATION_FAILED });
      }
      try {
        planVersionService.assertExecutable(plan, step);
      } catch {
        return { httpStatus: 409, body: { code: ERROR_CODES.VERSION_MISMATCH, message: ERROR_MESSAGES.VERSION_MISMATCH, step } };
      }
      step.step_status = "DONE";
      step.finished_at = new Date().toISOString();
      restorationStepRepository.update(step);
      console.info(LOG_TEMPLATES.RestorationStep[2], step.id);
      return { httpStatus: 200, body: { step } };
    })
};
