export interface RestorationStep {
  id: number;
  plan_id: number;
  step_order: string;
  technique: string;
  material_used: string;
  operator_id: number;
  step_status: string;
  finished_at: string;
  /** 所属方案版本，与方案共用同一条可追溯版本线 */
  plan_version: number;
}
