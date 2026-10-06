export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  /** 当前工作稿版本号 */
  version: number;
  /** 冻结待审版本号 */
  submitted_version: number | null;
  /** 已批准版本号，仅该版本步骤可继续执行 */
  approved_version: number | null;
}
