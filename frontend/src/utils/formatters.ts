export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
/** 方案与步骤共用的版本标签，页面徽标与日志共用 */
export const formatPlanVersion = (planId: string | number, version: string | number | null | undefined) =>
  version == null ? `plan#${planId}@v-` : `plan#${planId}@v${version}`;
