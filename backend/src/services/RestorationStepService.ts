import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { versioningService } from "./VersioningService";
import { createRestorationStepDto } from "../constructors/RestorationStepDtoFactory";
import type { RestorationStep } from "../models/RestorationStep";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const restorationStepService = {
  list(operationNo: string): RestorationStep[] {
    const rows = restorationStepRepository.findAll();
    return versioningService.upgradeLegacy(rows, "RestorationStep", operationNo, (row) =>
      restorationStepRepository.update(row)
    );
  },

  listByPlan(planId: number, operationNo: string): RestorationStep[] {
    const rows = restorationStepRepository.findByPlan(planId);
    return versioningService.upgradeLegacy(rows, "RestorationStep", operationNo, (row) =>
      restorationStepRepository.update(row)
    );
  },

  // 审批期间的新记录留在工作稿：归属下一版本，不进入冻结待审集
  create(payload: Record<string, unknown>, operationNo: string) {
    const plan = restorationPlanRepository.findById(Number(payload.plan_id));
    if (!plan) throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND);
    const versionNo = plan.approval_status === "SUBMITTED" ? plan.version_no + 1 : plan.version_no;
    const row = createRestorationStepDto({
      id: restorationStepRepository.nextId(),
      ...payload,
      version_no: versionNo,
      step_status: "DRAFT"
    }) as RestorationStep;
    return versioningService.runWithOperation(
      operationNo,
      "RestorationStep",
      row.id,
      "create",
      payload,
      () => {
        restorationStepRepository.insert(row);
        return row;
      }
    );
  }
};
