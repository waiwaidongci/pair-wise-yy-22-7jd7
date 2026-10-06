/** 旧数据缺少版本时升级到的初始版本号 */
export const INITIAL_PLAN_VERSION = 1;

/** 审批意见处理结果：先到者生效 / 后到者保留意见 */
export const ApprovalOutcome = ["APPLIED", "CONFLICT_RETAINED"] as const;
export type ApprovalOutcome = (typeof ApprovalOutcome)[number];

/** 版本留档动作 */
export const VersionArchiveAction = ["SUBMIT_FREEZE", "APPROVE", "REJECT", "LEGACY_UPGRADE"] as const;
export type VersionArchiveAction = (typeof VersionArchiveAction)[number];
