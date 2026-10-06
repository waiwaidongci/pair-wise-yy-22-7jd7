import { seed } from "../seed";
import type { OperationRecord } from "../models/OperationRecord";

/** 幂等操作日志：按操作编号记录写入结果，支撑失败后的同号重试 */
export const operationLogRepository = {
  find: (operationId: string) => seed.operationRecord.find((row) => row.operation_id === operationId),
  savePending: (operationId: string, action: string) => {
    const record: OperationRecord = {
      operation_id: operationId,
      action,
      status: "PENDING",
      http_status: 0,
      response: null,
      error: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    seed.operationRecord.push(record);
    return record;
  },
  markSuccess: (record: OperationRecord, httpStatus: number, response: unknown) => {
    record.status = "SUCCESS";
    record.http_status = httpStatus;
    record.response = response;
    record.error = null;
    record.updated_at = new Date().toISOString();
    return record;
  },
  markFailed: (record: OperationRecord, error: unknown) => {
    record.status = "FAILED";
    record.error = error instanceof Error ? error.message : String(error);
    record.updated_at = new Date().toISOString();
    return record;
  }
};
