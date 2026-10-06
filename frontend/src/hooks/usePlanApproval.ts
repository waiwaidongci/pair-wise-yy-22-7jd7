import { useCallback, useMemo, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import type { RestorationPlan } from "../types/RestorationPlan";

/**
 * 方案审批 hook：提交冻结、专家审批、冲突提示。
 * 审批以方案冻结的 submitted_version 为凭据，两个专家同时提交时先到者生效，
 * 后到者意见由服务端保留，这里给出同步提示。
 */
export function usePlanApproval() {
  const { rows, conflictTip, submit, approve, clearConflict } = useRestorationPlanStore();
  const [busyId, setBusyId] = useState<number | null>(null);

  const run = useCallback(
    async (planId: number, action: (id: number) => Promise<void>) => {
      setBusyId(planId);
      try {
        await action(planId);
      } finally {
        setBusyId(null);
      }
    },
    []
  );

  const submitForReview = useCallback((plan: RestorationPlan) => run(plan.id, submit), [run, submit]);

  const decide = useCallback(
    (plan: RestorationPlan, decision: "APPROVED" | "REJECTED", opinion: string) =>
      run(plan.id, (id) => approve(id, decision, opinion)),
    [run, approve]
  );

  /** 可提交：草稿或已驳回；可审批：处于待审且有冻结版本 */
  const canSubmit = useMemo(() => (plan: RestorationPlan) => plan.approval_status !== "SUBMITTED", []);
  const canReview = useMemo(
    () => (plan: RestorationPlan) => plan.approval_status === "SUBMITTED" && plan.submitted_version != null,
    []
  );

  return { plans: rows, busyId, conflictTip, submitForReview, decide, canSubmit, canReview, clearConflict };
}
