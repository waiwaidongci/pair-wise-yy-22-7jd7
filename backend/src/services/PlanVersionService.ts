import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createApprovalRecord } from "../constructors/ApprovalRecordFactory";
import { createPlanVersionSnapshot } from "../constructors/PlanVersionSnapshotFactory";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ApprovePlanPayload, SubmitPlanPayload } from "../types/RestorationPlanPayload";
import { formatPlanVersion } from "../utils/formatters";
import { approvalRecordRepository } from "../repositories/ApprovalRecordRepository";
import { operationLogRepository } from "../repositories/OperationLogRepository";
import { planVersionSnapshotRepository } from "../repositories/PlanVersionSnapshotRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { versionArchiveRepository } from "../repositories/VersionArchiveRepository";

export interface OperationResult {
  httpStatus: number;
  body: unknown;
}

export const httpError = (status: number, code: keyof typeof ERROR_CODES, message?: string) =>
  Object.assign(new Error(message ?? ERROR_MESSAGES[code]), { status, code: ERROR_CODES[code] });

/**
 * 幂等执行器：写操作按操作编号落日志。
 * SUCCESS 直接重放结果；FAILED / PENDING（上次中断）用同一编号重新执行；
 * 业务冲突（如审批撞车）作为成功处理的结果落库，重试返回同样的 409，不会重复写意见。
 */
const runIdempotent = (operationId: string | undefined, action: string, fn: () => OperationResult): OperationResult => {
  if (!operationId) return fn();
  const existing = operationLogRepository.find(operationId);
  if (existing && existing.status === "SUCCESS") {
    return { httpStatus: existing.http_status, body: existing.response };
  }
  const record = existing ?? operationLogRepository.savePending(operationId, action);
  try {
    const result = fn();
    operationLogRepository.markSuccess(record, result.httpStatus, result.body);
    return result;
  } catch (err) {
    operationLogRepository.markFailed(record, err);
    throw err;
  }
};

/**
 * 方案与步骤共用的版本中枢：提交冻结、审批并发、执行守卫都走这里，
 * 保证 RestorationPlan.version 与 RestorationStep.plan_version 是同一条可追溯版本线。
 */
export const planVersionService = {
  runIdempotent,

  /** 提交审批：冻结当前工作稿为待审快照，工作稿版本号 +1，审批期间的新记录留在新工作稿 */
  submit(planId: number, payload: SubmitPlanPayload, actorId: number): OperationResult {
    return runIdempotent(payload.operation_id, "RestorationPlan.submit", () => {
      const plan = restorationPlanRepository.findById(planId);
      if (!plan) throw httpError(404, "VALIDATION_FAILED", `plan ${planId} not found`);
      if (plan.approval_status === "SUBMITTED") {
        return {
          httpStatus: 409,
          body: { code: ERROR_CODES.PLAN_ALREADY_SUBMITTED, message: ERROR_MESSAGES.PLAN_ALREADY_SUBMITTED, plan }
        };
      }
      const workingSteps = restorationStepRepository.findByPlanAndVersion(planId, plan.version);
      const snapshot = planVersionSnapshotRepository.save(
        createPlanVersionSnapshot(plan, workingSteps, payload.operation_id ?? "", actorId, 0)
      );
      plan.submitted_version = plan.version;
      plan.approval_status = "SUBMITTED";
      plan.version += 1;
      restorationPlanRepository.update(plan);
      console.info(LOG_TEMPLATES.RestorationPlan[4], formatPlanVersion(plan.id, plan.submitted_version));
      versionArchiveRepository.append({
        plan_id: plan.id,
        version: plan.submitted_version,
        action: "SUBMIT_FREEZE",
        actor_id: actorId,
        detail: `froze ${workingSteps.length} step(s) into ${formatPlanVersion(plan.id, plan.submitted_version)}`
      });
      return { httpStatus: 200, body: { plan, snapshot } };
    });
  },

  /**
   * 专家审批：仅当方案仍在待审且 expected_version 等于冻结版本时生效（先到者生效）。
   * 后到者意见写入 CONFLICT_RETAINED 留痕，返回 409 提示同步最新版本。
   */
  approve(planId: number, payload: ApprovePlanPayload, expertId: number): OperationResult {
    return runIdempotent(payload.operation_id, "RestorationPlan.approve", () => {
      const plan = restorationPlanRepository.findById(planId);
      if (!plan) throw httpError(404, "VALIDATION_FAILED", `plan ${planId} not found`);
      const wins =
        plan.approval_status === "SUBMITTED" &&
        plan.submitted_version !== null &&
        plan.submitted_version === payload.expected_version;
      if (wins) {
        plan.approval_status = payload.decision;
        if (payload.decision === "APPROVED") plan.approved_version = plan.submitted_version;
        plan.submitted_version = null;
        restorationPlanRepository.update(plan);
        approvalRecordRepository.save(
          createApprovalRecord({
            plan_id: plan.id,
            version: payload.expected_version,
            expert_id: expertId,
            decision: payload.decision,
            opinion: payload.opinion,
            outcome: "APPLIED",
            operation_id: payload.operation_id
          })
        );
        console.info(LOG_TEMPLATES.RestorationPlan[5], formatPlanVersion(plan.id, payload.expected_version));
        versionArchiveRepository.append({
          plan_id: plan.id,
          version: payload.expected_version,
          action: payload.decision === "APPROVED" ? "APPROVE" : "REJECT",
          actor_id: expertId,
          detail: `${payload.decision} ${formatPlanVersion(plan.id, payload.expected_version)} by expert#${expertId}`
        });
        return { httpStatus: 200, body: { plan, outcome: "APPLIED" } };
      }
      // 后到者：保留意见，提示同步
      const decided = plan.approval_status === "APPROVED" || plan.approval_status === "REJECTED";
      const code = decided ? ERROR_CODES.APPROVAL_CONFLICT : ERROR_CODES.PLAN_NOT_SUBMITTED;
      const message = decided ? ERROR_MESSAGES.APPROVAL_CONFLICT : ERROR_MESSAGES.PLAN_NOT_SUBMITTED;
      approvalRecordRepository.save(
        createApprovalRecord({
          plan_id: plan.id,
          version: payload.expected_version,
          expert_id: expertId,
          decision: payload.decision,
          opinion: payload.opinion,
          outcome: "CONFLICT_RETAINED",
          operation_id: payload.operation_id
        })
      );
      console.info(LOG_TEMPLATES.RestorationPlan[6], formatPlanVersion(plan.id, payload.expected_version));
      return {
        httpStatus: 409,
        body: {
          code,
          message,
          outcome: "CONFLICT_RETAINED",
          current: {
            approval_status: plan.approval_status,
            version: plan.version,
            submitted_version: plan.submitted_version,
            approved_version: plan.approved_version
          }
        }
      };
    });
  },

  /** 新步骤落入当前工作稿版本：审批期间新增的步骤不进冻结快照 */
  assignWorkingVersion(plan: RestorationPlan): number {
    console.info(LOG_TEMPLATES.RestorationStep[4], formatPlanVersion(plan.id, plan.version));
    return plan.version;
  },

  /** 执行守卫：只有已批准版本的步骤允许继续执行，旧版与工作稿步骤一律拦截 */
  assertExecutable(plan: RestorationPlan, step: RestorationStep): void {
    if (plan.approved_version === null || step.plan_version !== plan.approved_version) {
      console.info(LOG_TEMPLATES.RestorationStep[5], formatPlanVersion(plan.id, step.plan_version));
      throw httpError(409, "VERSION_MISMATCH");
    }
  },

  /** 版本追溯：快照、审批意见、留档一次取齐 */
  trace(planId: number) {
    return {
      snapshots: planVersionSnapshotRepository.findByPlan(planId),
      approvals: approvalRecordRepository.findByPlan(planId),
      archives: versionArchiveRepository.findByPlan(planId)
    };
  }
};
