CREATE TABLE IF NOT EXISTS relic_item (
  id INTEGER PRIMARY KEY,
  relic_code TEXT,
  name TEXT,
  era TEXT,
  material TEXT,
  collection_level TEXT,
  storage_location TEXT,
  current_condition TEXT
);

CREATE TABLE IF NOT EXISTS damage_record (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_type TEXT,
  position_desc TEXT,
  severity TEXT,
  discovered_by TEXT,
  discovered_at TEXT,
  image_url TEXT,
  status TEXT
);

CREATE TABLE IF NOT EXISTS restoration_plan (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  damage_record_id TEXT,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  approval_status TEXT,
  owner_id TEXT,
  -- 共享可追溯版本：工作稿版本 / 冻结待审版本 / 已批准版本
  version INTEGER,
  submitted_version INTEGER,
  approved_version INTEGER
);

CREATE TABLE IF NOT EXISTS restoration_step (
  id INTEGER PRIMARY KEY,
  plan_id TEXT,
  step_order TEXT,
  technique TEXT,
  material_used TEXT,
  operator_id TEXT,
  step_status TEXT,
  finished_at TEXT,
  -- 所属方案版本，与 restoration_plan.version 同一条版本线
  plan_version INTEGER
);

-- 提交审批时冻结的待审快照
CREATE TABLE IF NOT EXISTS plan_version_snapshot (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  version INTEGER,
  plan_title TEXT,
  method TEXT,
  risk_assessment TEXT,
  steps TEXT,
  frozen_by INTEGER,
  frozen_at TEXT,
  operation_id TEXT
);

-- 专家审批意见：先到者 APPLIED，后到者 CONFLICT_RETAINED
CREATE TABLE IF NOT EXISTS approval_record (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  version INTEGER,
  expert_id INTEGER,
  decision TEXT,
  opinion TEXT,
  outcome TEXT,
  operation_id TEXT,
  created_at TEXT
);

-- 幂等操作日志：写入失败后按 operation_id 重试
CREATE TABLE IF NOT EXISTS operation_log (
  operation_id TEXT PRIMARY KEY,
  action TEXT,
  status TEXT,
  http_status INTEGER,
  response TEXT,
  error TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 版本留档：冻结 / 审批 / 驳回 / 旧数据升级初始版
CREATE TABLE IF NOT EXISTS version_archive (
  id INTEGER PRIMARY KEY,
  plan_id INTEGER,
  version INTEGER,
  action TEXT,
  actor_id INTEGER,
  detail TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS image_version (
  id INTEGER PRIMARY KEY,
  relic_id TEXT,
  plan_id TEXT,
  version_no TEXT,
  image_type TEXT,
  file_path TEXT,
  capture_at TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  actor TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  created_at TEXT
);
