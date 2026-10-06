import { versionArchiveRepository } from "../repositories/VersionArchiveRepository";
import { operationRecordRepository } from "../repositories/OperationRecordRepository";
import { createVersionArchive } from "../constructors/VersionArchiveDtoFactory";
import type { VersionArchiveReason } from "../models/VersionArchive";
import type { OperationRecordStatus } from "../models/OperationRecord";

export class VersionConflictError extends Error {
  code = "VERSION_CONFLICT";
  status = 409;
  constructor(message: string) {
    super(message);
    this.name = "VersionConflictError";
  }
}

type VersionedRow = { id: number; version_no?: number };

export const versioningService = {
  // 旧数据缺少版本时升级为初始版并留档
  upgradeLegacy<T extends VersionedRow>(
    rows: T[],
    entityType: "RestorationPlan" | "RestorationStep",
    operationNo: string,
    persist?: (row: T) => void
  ): T[] {
    return rows.map((row) => {
      if (row.version_no == null) {
        const snapshot = { ...row };
        versionArchiveRepository.insert(
          createVersionArchive({
            id: versionArchiveRepository.nextId(),
            entity_type: entityType,
            entity_id: row.id,
            version_no: 1,
            snapshot: JSON.stringify(snapshot),
            reason: "LEGACY_UPGRADE",
            operation_no: operationNo,
            note: "旧数据缺少版本号，升级为初始版 v1 并留档"
          })
        );
        const upgraded = {
          ...row,
          version_no: 1,
          ...(entityType === "RestorationPlan" ? { frozen_version_no: null } : {})
        };
        persist?.(upgraded);
        return upgraded;
      }
      return row;
    });
  },

  // 写入失败后按操作编号重试：同一操作编号只执行一次，重放返回首次结果
  runWithOperation<T>(
    operationNo: string,
    entityType: string,
    entityId: number,
    action: string,
    requestBody: unknown,
    fn: () => T
  ): { result: T; replayed: boolean } {
    const existing = operationRecordRepository.findByOperationNo(operationNo);
    if (existing) {
      return { result: JSON.parse(existing.response_body) as T, replayed: true };
    }
    try {
      const result = fn();
      operationRecordRepository.insert({
        operation_no: operationNo,
        entity_type: entityType,
        entity_id: entityId,
        action,
        request_body: JSON.stringify(requestBody),
        response_body: JSON.stringify(result),
        status: "SUCCESS",
        created_at: new Date().toISOString()
      });
      return { result, replayed: false };
    } catch (err) {
      const status: OperationRecordStatus = err instanceof VersionConflictError ? "CONFLICT" : "FAILED";
      const error = err as Error & { code?: string };
      operationRecordRepository.insert({
        operation_no: operationNo,
        entity_type: entityType,
        entity_id: entityId,
        action,
        request_body: JSON.stringify(requestBody),
        response_body: JSON.stringify({ code: error.code ?? "INTERNAL_ERROR", message: error.message }),
        status,
        created_at: new Date().toISOString()
      });
      throw err;
    }
  },

  // 留档：冻结快照 / 审批意见 / 驳回意见
  archive(
    entityType: "RestorationPlan" | "RestorationStep",
    entityId: number,
    versionNo: number,
    snapshot: unknown,
    reason: VersionArchiveReason,
    operationNo: string,
    note: string
  ) {
    return versionArchiveRepository.insert(
      createVersionArchive({
        id: versionArchiveRepository.nextId(),
        entity_type: entityType,
        entity_id: entityId,
        version_no: versionNo,
        snapshot: JSON.stringify(snapshot),
        reason,
        operation_no: operationNo,
        note
      })
    );
  }
};
