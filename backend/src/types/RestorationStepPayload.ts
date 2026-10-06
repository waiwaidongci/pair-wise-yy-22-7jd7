export interface CreateRestorationStepPayload {
  plan_id: number;
  step_order: string;
  technique: string;
  material_used: string;
  operator_id: number;
  operation_id?: string;
}

export interface ExecuteRestorationStepPayload {
  operation_id: string;
}

export type RestorationStepPayload = Record<string, unknown>;
