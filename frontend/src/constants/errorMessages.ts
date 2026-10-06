export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  APPROVAL_CONFLICT: "审批已被其他专家先行提交，您的意见已保留，请同步最新版本",
  VERSION_MISMATCH: "该步骤不属于已批准版本，不能继续执行",
  PLAN_NOT_SUBMITTED: "方案未处于待审状态",
  PLAN_ALREADY_SUBMITTED: "方案已提交并冻结，正在审批中"
};
