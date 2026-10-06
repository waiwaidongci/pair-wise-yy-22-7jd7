export interface CreateRestorationStepPayload {
  operation_no: string;
  plan_id: number;
  step_order: string;
  technique: string;
  material_used: string;
  operator_id: number;
}
