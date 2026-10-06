# 文物修复档案协作平台

面向博物馆修复团队的文物病害记录、修复方案、影像版本和审批归档平台。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20110>

后端健康检查：<http://localhost:21110/health>


## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 后端：进入 `backend` 后按技术栈运行开发命令，接口统一挂在 `/api`。


## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Ant Design + Zustand |
| 后端 | NestJS + TypeScript + Prisma |
| 数据库 | PostgreSQL 15 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `relic-restore`
- `FRONTEND_PORT`: 前端端口，默认 `20110`
- `BACKEND_PORT`: 后端端口，默认 `21110`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: relic-restore`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-relic-restore}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- RelicCondition: constants/RelicCondition、types/RelicCondition、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanApprovalStatus: constants/PlanApprovalStatus、types/PlanApprovalStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- DamageSeverity: constants/DamageSeverity、types/DamageSeverity、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PlanVersion（INITIAL_PLAN_VERSION / ApprovalOutcome / VersionArchiveAction）: 前后端 `constants/PlanVersion.*`、`models/RestorationPlan.*`、`models/RestorationStep.*`、`constructors/RestorationPlan*`、`constructors/RestorationStep*`、`services/PlanVersionService.ts`、`repositories/RestorationPlan*`、`repositories/RestorationStep*`、`components/common/ApprovalTimeline.tsx`、`hooks/usePlanApproval.ts`、`utils/formatters.*`（formatPlanVersion）均有引用。

## 方案-步骤共享版本与审批并发

修复方案（RestorationPlan）与修复步骤（RestorationStep）共用一条可追溯版本线，解决"专家点通过时步骤清单已被改、旧版步骤仍按已批准内容执行"的问题：

- **版本字段**：方案持有 `version`（工作稿）/ `submitted_version`（冻结待审）/ `approved_version`（已批准）；步骤携带 `plan_version`，与方案同属一条版本线。
- **提交即冻结**：`POST /api/restoration-plan/:id/submit` 把当前工作稿的步骤清单冻结进 `plan_version_snapshot`，工作稿版本号 +1；审批期间新增的步骤落在工作稿，不进冻结快照。
- **审批只认冻结版**：`POST /api/restoration-plan/:id/approve` 携带 `expected_version`，仅当方案仍在待审且与冻结版本一致时生效（先到者生效）；后到者意见写入 `approval_record`（CONFLICT_RETAINED）保留，返回 409 `APPROVAL_CONFLICT` 提示同步最新版本。
- **执行守卫**：`POST /api/restoration-step/:id/execute` 仅允许 `plan_version === approved_version` 的步骤继续，其余返回 409 `VERSION_MISMATCH`。
- **幂等重试**：写操作携带 `operation_id`，服务端落 `operation_log`；写入失败后客户端按同一操作编号重试，已成功直接重放结果，已失败重新执行，不产生重复记录。
- **旧数据升级**：缺少版本的旧方案/旧步骤在读取时升级为初始版 v1 并写入 `version_archive` 留档；遗留 SUBMITTED 方案同步冻结 v1 快照，遗留 APPROVED 方案补登 `approved_version=1`。
- **版本追溯**：`GET /api/restoration-plan/:id/trace` 一次返回快照、审批意见与留档记录。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
