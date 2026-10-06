import { seed } from "../seed";
import type { VersionArchiveRecord } from "../models/VersionArchiveRecord";

/** 版本留档仓储：冻结、审批、旧数据升级全程可追溯 */
export const versionArchiveRepository = {
  findByPlan: (planId: number) => seed.versionArchive.filter((row) => row.plan_id === planId),
  findAll: () => seed.versionArchive,
  append: (row: Omit<VersionArchiveRecord, "id" | "created_at">) => {
    const record: VersionArchiveRecord = {
      ...row,
      id: seed.versionArchive.length + 1,
      created_at: new Date().toISOString()
    };
    seed.versionArchive.push(record);
    return record;
  }
};
