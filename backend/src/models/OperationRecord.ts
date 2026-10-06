export type OperationRecordStatus = "SUCCESS" | "CONFLICT" | "FAILED";

export interface OperationRecord {
  operation_no: string;
  entity_type: string;
  entity_id: number;
  action: string;
  request_body: string;
  response_body: string;
  status: OperationRecordStatus;
  created_at: string;
}
