/** 旧数据缺少版本时升级到的初始版本号 */
export const INITIAL_PLAN_VERSION = 1;

export const ApprovalOutcome = ["APPLIED", "CONFLICT_RETAINED"] as const;
export type ApprovalOutcome = (typeof ApprovalOutcome)[number];

export const ApprovalOutcomeText: Record<ApprovalOutcome, string> = {
  APPLIED: "已生效",
  CONFLICT_RETAINED: "意见已保留"
};

export const VersionArchiveAction = ["SUBMIT_FREEZE", "APPROVE", "REJECT", "LEGACY_UPGRADE"] as const;
export type VersionArchiveAction = (typeof VersionArchiveAction)[number];

export const VersionArchiveActionText: Record<VersionArchiveAction, string> = {
  SUBMIT_FREEZE: "提交冻结",
  APPROVE: "审批通过",
  REJECT: "审批驳回",
  LEGACY_UPGRADE: "旧数据升级初始版"
};
