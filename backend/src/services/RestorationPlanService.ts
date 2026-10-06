import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { versioningService, VersionConflictError } from "./VersioningService";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import type { RestorationPlan } from "../models/RestorationPlan";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const restorationPlanService = {
  list(operationNo: string): RestorationPlan[] {
    const rows = restorationPlanRepository.findAll();
    return versioningService.upgradeLegacy(rows, "RestorationPlan", operationNo, (row) =>
      restorationPlanRepository.update(row)
    );
  },

  create(payload: Record<string, unknown>, operationNo: string) {
    const row = createRestorationPlanDto({
      id: restorationPlanRepository.nextId(),
      ...payload,
      version_no: 1,
      frozen_version_no: null,
      approval_status: "DRAFT"
    }) as RestorationPlan;
    return versioningService.runWithOperation(
      operationNo,
      "RestorationPlan",
      row.id,
      "create",
      payload,
      () => {
        restorationPlanRepository.insert(row);
        return row;
      }
    );
  },

  // 提交时冻结待审内容：方案与当前步骤快照留档，步骤 stamped 到冻结版本
  submit(id: number, operationNo: string) {
    return versioningService.runWithOperation(
      operationNo,
      "RestorationPlan",
      id,
      "submit",
      { operation_no: operationNo },
      () => {
        const plan = restorationPlanRepository.findById(id);
        if (!plan) throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
        if (plan.approval_status !== "DRAFT") throw new VersionConflictError(ERROR_MESSAGES.PLAN_NOT_SUBMITTABLE);
        const steps = restorationStepRepository.findByPlan(id);
        // 冻结待审内容：方案与当前步骤快照留档；旧步骤补盖当前版本戳
        versioningService.archive("RestorationPlan", plan.id, plan.version_no, plan, "SUBMIT_FREEZE", operationNo, "提交审批，冻结待审方案内容");
        steps.forEach((step) => {
          if (step.version_no == null) {
            step.version_no = plan.version_no;
            restorationStepRepository.update(step);
          }
          versioningService.archive("RestorationStep", step.id, step.version_no, step, "SUBMIT_FREEZE", operationNo, "提交审批，冻结待审步骤内容");
        });
        plan.frozen_version_no = plan.version_no;
        plan.approval_status = "SUBMITTED";
        restorationPlanRepository.update(plan);
        return plan;
      }
    );
  },

  // 两个专家同时审批：先到者生效，后到者保留意见并提示同步
  approve(id: number, expectedVersion: number, comment: string, operationNo: string) {
    return versioningService.runWithOperation(
      operationNo,
      "RestorationPlan",
      id,
      "approve",
      { operation_no: operationNo, expected_version: expectedVersion, comment },
      () => {
        const plan = restorationPlanRepository.findById(id);
        if (!plan) throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
        if (plan.approval_status !== "SUBMITTED" || plan.frozen_version_no !== expectedVersion) {
          // 后到者：意见留档，抛出冲突由 UI 提示同步
          versioningService.archive(
            "RestorationPlan",
            plan.id,
            plan.version_no,
            { comment, expected_version: expectedVersion },
            "APPROVE_OPINION",
            operationNo,
            "审批未生效，专家意见已保留"
          );
          throw new VersionConflictError(ERROR_MESSAGES.VERSION_CONFLICT);
        }
        const steps = restorationStepRepository.findByPlan(id);
        steps.forEach((step) => {
          if (step.version_no === plan.frozen_version_no) {
            step.step_status = "APPROVED";
            restorationStepRepository.update(step);
          }
        });
        versioningService.archive(
          "RestorationPlan",
          plan.id,
          plan.frozen_version_no,
          { plan, comment },
          "APPROVE",
          operationNo,
          "审批通过，冻结版本步骤生效"
        );
        plan.approval_status = "APPROVED";
        plan.version_no = (plan.frozen_version_no ?? plan.version_no) + 1;
        plan.frozen_version_no = null;
        restorationPlanRepository.update(plan);
        return plan;
      }
    );
  },

  reject(id: number, comment: string, operationNo: string) {
    return versioningService.runWithOperation(
      operationNo,
      "RestorationPlan",
      id,
      "reject",
      { operation_no: operationNo, comment },
      () => {
        const plan = restorationPlanRepository.findById(id);
        if (!plan) throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
        if (plan.approval_status !== "SUBMITTED") throw new VersionConflictError(ERROR_MESSAGES.PLAN_NOT_SUBMITTABLE);
        versioningService.archive(
          "RestorationPlan",
          plan.id,
          plan.frozen_version_no ?? plan.version_no,
          { comment },
          "APPROVE_OPINION",
          operationNo,
          "审批驳回，意见已留档"
        );
        plan.approval_status = "REJECTED";
        plan.frozen_version_no = null;
        restorationPlanRepository.update(plan);
        return plan;
      }
    );
  }
};
