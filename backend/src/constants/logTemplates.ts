export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: [
    "RestorationPlan.create",
    "RestorationPlan.update",
    "RestorationPlan.status",
    "RestorationPlan.export",
    "RestorationPlan.submit.freeze",
    "RestorationPlan.approve.pass",
    "RestorationPlan.approve.reject",
    "RestorationPlan.version.conflict"
  ],
  RestorationStep: [
    "RestorationStep.create",
    "RestorationStep.update",
    "RestorationStep.status",
    "RestorationStep.export",
    "RestorationStep.version.assign",
    "RestorationStep.freeze",
    "RestorationStep.effective",
    "RestorationStep.archive"
  ],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"],
  VersionArchive: ["VersionArchive.create", "VersionArchive.query", "VersionArchive.legacy.upgrade", "VersionArchive.opinion.keep"],
  OperationRecord: ["OperationRecord.register", "OperationRecord.replay", "OperationRecord.conflict", "OperationRecord.failed"]
};
