export const LOG_TEMPLATES = {
  RelicItem: ["RelicItem.create", "RelicItem.update", "RelicItem.status", "RelicItem.export"],
  DamageRecord: ["DamageRecord.create", "DamageRecord.update", "DamageRecord.status", "DamageRecord.export"],
  RestorationPlan: ["RestorationPlan.create", "RestorationPlan.update", "RestorationPlan.status", "RestorationPlan.export", "RestorationPlan.submit.freeze", "RestorationPlan.approve.applied", "RestorationPlan.approve.conflictRetained", "RestorationPlan.version.legacyUpgrade"],
  RestorationStep: ["RestorationStep.create", "RestorationStep.update", "RestorationStep.status", "RestorationStep.export", "RestorationStep.version.assignWorkingDraft", "RestorationStep.version.guardRejected", "RestorationStep.version.legacyUpgrade"],
  ImageVersion: ["ImageVersion.create", "ImageVersion.update", "ImageVersion.status", "ImageVersion.export"]
};
