import { seed } from "../seed";
import { INITIAL_PLAN_VERSION } from "../constants/PlanVersion";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatPlanVersion } from "../utils/formatters";
import { createPlanVersionSnapshot } from "../constructors/PlanVersionSnapshotFactory";
import type { RestorationPlan, RestorationPlanRow } from "../models/RestorationPlan";
import { planVersionSnapshotRepository } from "./PlanVersionSnapshotRepository";
import { restorationStepRepository } from "./RestorationStepRepository";
import { versionArchiveRepository } from "./VersionArchiveRepository";

/**
 * 旧数据缺少版本时升级为初始版并留档：
 * - DRAFT：工作稿即为初始版 v1；
 * - SUBMITTED：把当前内容冻结为 v1 快照（审批只认冻结版），工作稿推进到 v2；
 * - APPROVED：补登 approved_version=v1，工作稿推进到 v2，新步骤不得混入已批准版本。
 */
const ensureVersioned = (row: RestorationPlanRow): RestorationPlan => {
  if (row.version != null) return row as RestorationPlan;

  if (row.approval_status === "SUBMITTED") {
    row.version = INITIAL_PLAN_VERSION;
    const frozenSteps = restorationStepRepository.findByPlanAndVersion(row.id, INITIAL_PLAN_VERSION);
    planVersionSnapshotRepository.save(createPlanVersionSnapshot(row as RestorationPlan, frozenSteps, "legacy-upgrade", 0, 0));
    row.submitted_version = INITIAL_PLAN_VERSION;
    row.approved_version = null;
    row.version = INITIAL_PLAN_VERSION + 1;
  } else if (row.approval_status === "APPROVED") {
    row.submitted_version = null;
    row.approved_version = INITIAL_PLAN_VERSION;
    row.version = INITIAL_PLAN_VERSION + 1;
  } else {
    row.submitted_version = null;
    row.approved_version = null;
    row.version = INITIAL_PLAN_VERSION;
  }
  console.info(LOG_TEMPLATES.RestorationPlan[7], formatPlanVersion(row.id, row.version));
  versionArchiveRepository.append({
    plan_id: row.id,
    version: INITIAL_PLAN_VERSION,
    action: "LEGACY_UPGRADE",
    actor_id: 0,
    detail: `legacy plan(${row.approval_status}) upgraded to ${formatPlanVersion(row.id, INITIAL_PLAN_VERSION)}`
  });
  return row as RestorationPlan;
};

export const restorationPlanRepository = {
  findAll: () => seed.restorationPlan.map(ensureVersioned),
  findById: (id: number) => {
    const row = seed.restorationPlan.find((item) => item.id === id);
    return row ? ensureVersioned(row) : undefined;
  },
  save: (row: RestorationPlanRow) => {
    seed.restorationPlan.push(row);
    return row;
  },
  update: (row: RestorationPlan) => row
};
