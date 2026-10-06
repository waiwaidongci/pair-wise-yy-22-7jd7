import { StatusBadge } from "./StatusBadge";
import { ApprovalOutcomeText, VersionArchiveActionText, type VersionArchiveAction } from "../../constants/PlanVersion";
import type { ApprovalRecord, VersionArchiveRecord } from "../../types/ApprovalRecord";
import { formatDate, formatPlanVersion } from "../../utils/formatters";

/** 审批时间线：版本留档 + 专家意见（生效 / 冲突保留） */
export function ApprovalTimeline({
  title = "审批时间线",
  value = "READY",
  archives = [],
  approvals = []
}: {
  title?: string;
  value?: string;
  archives?: VersionArchiveRecord[];
  approvals?: ApprovalRecord[];
}) {
  return (
    <div className="shared-widget">
      <strong>{title}</strong>
      <StatusBadge value={value} />
      <ul className="timeline">
        {archives.map((row) => (
          <li key={`archive-${row.id}`}>
            <StatusBadge value={formatPlanVersion(row.plan_id, row.version)} />
            <span>{VersionArchiveActionText[row.action as VersionArchiveAction] ?? row.action}</span>
            <em>{formatDate(row.created_at)}</em>
          </li>
        ))}
        {approvals.map((row) => (
          <li key={`approval-${row.id}`}>
            <StatusBadge value={formatPlanVersion(row.plan_id, row.version)} />
            <span>
              专家#{row.expert_id} {row.decision}（{ApprovalOutcomeText[row.outcome as keyof typeof ApprovalOutcomeText] ?? row.outcome}）
            </span>
            <em>{row.opinion}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
