export interface SubmitPlanPayload {
  operation_no: string;
}

export interface ApprovePlanPayload {
  operation_no: string;
  expected_version: number;
  comment: string;
}

export interface RejectPlanPayload {
  operation_no: string;
  comment: string;
}
