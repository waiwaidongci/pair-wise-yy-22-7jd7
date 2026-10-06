export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;
/** 方案与步骤共用的版本标签，日志模板与留档 detail 统一使用 */
export const formatPlanVersion = (planId: string | number, version: string | number) => `plan#${planId}@v${version}`;
