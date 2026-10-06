export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: string;
  technique: string;
  material_used: string;
  operator_id: number;
  step_status: string;
  finished_at: string;
  /** 所属方案版本，与 RestorationPlan.version 共用同一条可追溯版本线 */
  plan_version: number;
}

/** 旧数据行：可能缺失 plan_version，读取时升级为初始版并留档 */
export type RestorationStepRow = Omit<RestorationStep, "plan_version"> & Partial<Pick<RestorationStep, "plan_version">>;
