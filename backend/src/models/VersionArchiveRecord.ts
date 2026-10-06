/** 版本留档：冻结、审批、驳回、旧数据升级初始版，全程可追溯 */
export interface VersionArchiveRecord {
  id: number;
  plan_id: number;
  version: number;
  action: string;
  actor_id: number;
  detail: string;
  created_at: string;
}
