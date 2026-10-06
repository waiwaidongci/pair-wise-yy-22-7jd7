export interface RestorationPlan {
  id: number;
  relic_id: number;
  damage_record_id: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  /** 当前工作稿版本号，提交冻结后递增 */
  version: number;
  /** 已冻结待审的版本号，无待审时为空 */
  submitted_version: number | null;
  /** 已批准生效的版本号，仅该版本步骤允许继续执行 */
  approved_version: number | null;
}

/** 旧数据行：可能缺失版本字段，读取时由仓储层升级为初始版并留档 */
export type RestorationPlanRow = Omit<RestorationPlan, "version" | "submitted_version" | "approved_version"> &
  Partial<Pick<RestorationPlan, "version" | "submitted_version" | "approved_version">>;
