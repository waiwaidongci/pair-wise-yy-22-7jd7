import { useEffect } from "react";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { ApprovalTimeline } from "../components/common/ApprovalTimeline";
import { StatusBadge } from "../components/common/StatusBadge";
import { formatPlanVersion } from "../utils/formatters";

export function PlansPage() {
  const { plans, busyId, conflictTip, submitForReview, decide, canSubmit, canReview, clearConflict } = usePlanApproval();
  const { rows: planRows, loading, load, trace, loadTrace } = useRestorationPlanStore();
  const { rows: steps, load: loadSteps, execute, guardTip, clearGuardTip } = useRestorationStepStore();

  useEffect(() => {
    void load();
    void loadSteps();
  }, [load, loadSteps]);

  return (
    <section className="page">
      <h1>修复方案</h1>
      {conflictTip && (
        <div className="alert conflict" role="alert" onClick={clearConflict}>
          {conflictTip}
        </div>
      )}
      {guardTip && (
        <div className="alert guard" role="alert" onClick={clearGuardTip}>
          {guardTip}
        </div>
      )}
      {loading && <p>加载中…</p>}
      <div className="table">
        {planRows.map((plan) => (
          <article key={plan.id} className="row">
            <strong>{plan.plan_title}</strong>
            <StatusBadge value={plan.approval_status} />
            <span title="工作稿版本">{formatPlanVersion(plan.id, plan.version)}</span>
            <span title="冻结待审版本">待审 {formatPlanVersion(plan.id, plan.submitted_version)}</span>
            <span title="已批准版本">批准 {formatPlanVersion(plan.id, plan.approved_version)}</span>
            {canSubmit(plan) && (
              <button disabled={busyId === plan.id} onClick={() => void submitForReview(plan)}>
                提交审批
              </button>
            )}
            {canReview(plan) && (
              <>
                <button disabled={busyId === plan.id} onClick={() => void decide(plan, "APPROVED", "同意按冻结版本执行")}>
                  专家通过
                </button>
                <button disabled={busyId === plan.id} onClick={() => void decide(plan, "REJECTED", "需补充风险评估")}>
                  专家驳回
                </button>
              </>
            )}
            <button onClick={() => void loadTrace(plan.id)}>版本追溯</button>
          </article>
        ))}
      </div>
      <h2>修复步骤</h2>
      <div className="table">
        {steps.map((step) => {
          const plan = planRows.find((row) => row.id === step.plan_id);
          const executable = plan != null && plan.approved_version != null && step.plan_version === plan.approved_version;
          return (
            <article key={step.id} className="row">
              <strong>{step.technique}</strong>
              <StatusBadge value={step.step_status} />
              <span>{formatPlanVersion(step.plan_id, step.plan_version)}</span>
              <button disabled={!executable} title={executable ? "已批准版本可继续执行" : "仅已批准版本的步骤可执行"} onClick={() => void execute(step.id)}>
                执行
              </button>
            </article>
          );
        })}
      </div>
      {trace && (
        <ApprovalTimeline
          title="版本追溯"
          value={plans[0]?.approval_status ?? "READY"}
          archives={trace.archives}
          approvals={trace.approvals}
        />
      )}
    </section>
  );
}
