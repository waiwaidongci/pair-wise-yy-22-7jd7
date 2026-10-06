import { seed } from "../seed";
import type { OperationRecord } from "../models/OperationRecord";

const rows: OperationRecord[] = [...(seed.operationRecord as unknown as OperationRecord[])];

export const operationRecordRepository = {
  findAll: (): OperationRecord[] => rows.map((row) => ({ ...row })),
  findByOperationNo: (operationNo: string): OperationRecord | undefined =>
    rows.find((row) => row.operation_no === operationNo),
  insert: (row: OperationRecord): OperationRecord => {
    rows.push(row);
    return { ...row };
  }
};
