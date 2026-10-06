export const createRestorationPlanDto = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  relic_id: 1,
  damage_record_id: 1,
  plan_title: "plan title 1",
  method: "method 1",
  risk_assessment: "risk assessment 1",
  approval_status: "DRAFT",
  owner_id: 1,
  version_no: 1,
  frozen_version_no: null,
  ...overrides
});
