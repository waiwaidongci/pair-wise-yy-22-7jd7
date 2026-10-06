import { seed } from "../seed";
import { INITIAL_PLAN_VERSION } from "../constants/PlanVersion";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatPlanVersion } from "../utils/formatters";
import type { RestorationStep, RestorationStepRow } from "../models/RestorationStep";
import { versionArchiveRepository } from "./VersionArchiveRepository";

/** 旧步骤缺少 plan_version 时升级为初始版并留档，与方案共用同一条版本线 */
const ensureVersioned = (row: RestorationStepRow): RestorationStep => {
  if (row.plan_version == null) {
    row.plan_version = INITIAL_PLAN_VERSION;
    console.info(LOG_TEMPLATES.RestorationStep[6], formatPlanVersion(row.plan_id, row.plan_version));
    versionArchiveRepository.append({
      plan_id: row.plan_id,
      version: row.plan_version,
      action: "LEGACY_UPGRADE",
      actor_id: 0,
      detail: `legacy step#${row.id} upgraded to ${formatPlanVersion(row.plan_id, row.plan_version)}`
    });
  }
  return row as RestorationStep;
};

export const restorationStepRepository = {
  findAll: () => seed.restorationStep.map(ensureVersioned),
  findById: (id: number) => {
    const row = seed.restorationStep.find((item) => item.id === id);
    return row ? ensureVersioned(row) : undefined;
  },
  findByPlan: (planId: number) => seed.restorationStep.filter((row) => row.plan_id === planId).map(ensureVersioned),
  findByPlanAndVersion: (planId: number, version: number) =>
    seed.restorationStep.filter((row) => row.plan_id === planId).map(ensureVersioned).filter((row) => row.plan_version === version),
  save: (row: RestorationStepRow) => {
    seed.restorationStep.push(row);
    return row;
  },
  update: (row: RestorationStep) => row
};
