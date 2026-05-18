# Admin / Frontend 文档入口

## 1. 职责范围

`livemask-admin` 负责运营后台、权限管理、配置编辑、审计查看、数据大盘、人工复核和内部工具。

管理员、运营者、赞助大使、推广大使、普通用户和订阅用户可以共用同一个后台产品和设计系统，但必须使用独立 URI 边界和权限边界，不能混在同一路径空间。

推荐路径边界：

| Surface | URI Prefix | 角色 |
| --- | --- | --- |
| 系统管理后台 | `/admin/system/*` | 超级管理员 / 安全管理员 |
| 运营后台 | `/admin/ops/*` | 运营 / 客服 / 节点运维 |
| 财务收益后台 | `/admin/finance/*` | 财务 / 收益审核 |
| 赞助大使自助后台 | `/sponsor/*` | 赞助节点 / Sponsor Ambassador |
| 推广大使自助后台 | `/ambassador/*` | 推广大使 |
| 普通用户账户后台 | `/account/*` | 登录用户 |
| 订阅用户账单后台 | `/billing/*` | 订阅 / 支付用户 |

隐藏菜单不是安全边界。所有前端路径隔离必须由 Backend 鉴权和授权同步强制执行。

## 2. 修改 Admin 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否修改 Backend Admin API 契约
- [ ] 是否修改配置项、FeatureFlag、风控参数或支付参数
- [ ] 是否新增或修改 URI 前缀、角色边界或权限边界
- [ ] 是否需要审计日志、双人复核或权限控制
- [ ] 是否影响运营、客服、财务或安全团队流程

## 3. 必须更新文档的场景

- Admin API 字段、筛选条件、分页、导出格式变化
- 配置表单新增、删除或修改字段
- 权限、角色、审批流或审计日志变化
- 运营大盘指标、口径或告警阈值变化
- 人工复核、申诉、退款、封禁流程变化

## 4. 完成标准

- [ ] API contract 已更新或确认无需更新
- [ ] 配置变更有 `CONFIG_CHANGE_RECORD`
- [ ] 权限矩阵和审计字段已说明
- [ ] 运营人员操作路径和异常处理路径完整
- [ ] 验证截图、接口响应或手工验证记录写入任务单

## 5. 前端设计输入

- `docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md`

该文档用于 Admin Console、赞助节点、推广大使、收益配置、收益计算、追溯重算与 Website 的前端设计输入，包含 Atoms 可直接使用的 Prompt、页面结构、组件要求、状态设计和验收清单。

## 6. 协议端点模板与灰度管理

- [Protocol & Endpoint Template Contract](../contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) — Admin 需要实现 Protocol 模板管理（系统模板 / 自定义模板）、Assignment 创建（节点选择、灰度策略）、灰度进度查看和回滚操作。模板字段白名单必须遵守安全边界，secret 永不展示。

相关后续任务：`TASK-ADMIN-PROTOCOL-TEMPLATE-001`

## 7. Admin Job Center

- `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`
- `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
- `docs/architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md`

通用触发器、定时任务、重试、取消、运行历史、事件日志、审计和 RBAC 必须归入独立的 Admin Job Center。GeoIP 更新、NodeAgent 发布/回滚、内容发布、Dashboard 聚合、账单对账、CI smoke 等任务都应通过 `/admin/jobs` 统一管理。

Job 执行层必须从第一版开始独立为 `livemask-job-service`，由 Backend 作为 Admin API Gateway 做认证、授权、审计归因和 service auth 转发。Admin 不直接调用 Job Service，也不在功能页面内重复实现 scheduler。

功能页面可以展示状态并跳转到 Job Center，但不应长期拥有通用 scheduler/trigger 能力。例如 `/admin/geoip` 可以保留数据库状态和 source credential 配置入口，真正的 `Trigger Update` 应迁移到 `/admin/jobs?job_type=geoip_source_update`。

## 8. Control Plane Operations Dashboard

- [Admin Control Plane Dashboard Contract](../contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md) — 定义所有 Dashboard 路由、Real-First Data 规则、Backend API 契约、3D/traffic map 数据契约、各模块 Widget 规格和 RBAC 门禁。

Dashboard 路由矩阵：

| Surface | Route | Data Source |
| --- | --- | --- |
| 全局总览 | `/admin` | `GET /admin/api/v1/dashboard/overview` + `control-plane` |
| 流量地图 | `/admin/traffic` | `GET /admin/api/v1/dashboard/traffic/flows` + `countries` |
| Job 中心 | `/admin/jobs` | `GET /admin/api/v1/dashboard/jobs/summary` |
| GeoIP | `/admin/geoip` | `GET /admin/api/v1/dashboard/geoip/summary` |
| 协议端点模板 | `/admin/protocol-endpoints` | `GET /admin/api/v1/dashboard/protocol-endpoint/summary` |
| NodeAgent 发布 | `/admin/nodeagent/releases` | `GET /admin/api/v1/dashboard/nodeagent/summary` |
| 内容管理 | `/admin/content` | `GET /admin/api/v1/dashboard/content/summary` |
| 事件/告警 | embedded in `/admin` | `GET /admin/api/v1/dashboard/incidents` |

所有数据必须 Real-First。Production 不得静默展示 mock 数据。Local/dev 环境允许 mock fallback 但必须展示 Mock/Stale 徽章。

相关后续任务：`TASK-ADMIN-DASHBOARD-001`
