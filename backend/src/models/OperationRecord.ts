/** 幂等操作日志：写入失败后客户端按 operation_id 重试，SUCCESS 直接重放结果，FAILED 重新执行 */
export interface OperationRecord {
  operation_id: string;
  action: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  http_status: number;
  response: unknown;
  error: string | null;
  created_at: string;
  updated_at: string;
}
