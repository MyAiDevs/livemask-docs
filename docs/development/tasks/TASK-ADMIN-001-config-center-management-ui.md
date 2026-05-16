# TASK-ADMIN-001 - 配置中心管理页

- 状态：Ready
- Owner：Admin Frontend Lead
- 主影响仓库：`livemask-admin`
- 受影响仓库：`livemask-backend`, `livemask-docs`, `livemask-ci-cd`
- 关联里程碑：M1 / 配置中心
- 依赖：`TASK-P0-03-config-center`

## 1. Background

Backend 配置中心核心 API 和 CI/CD staging smoke 已完成。Admin 需要提供配置查看、草稿、发布、回滚和审计入口，让运营和技术人员可以安全管理 `client.remote_config`、`nodeagent.runtime_config`、`recommendation.strategy.default` 等配置。

## 2. Scope

### In Scope

- 配置列表页：展示 `config_key`、当前版本、hash、状态、发布时间。
- 配置详情页：展示当前 payload、最近版本、发布时间和变更原因。
- 草稿编辑：JSON editor / form-first 皆可，但必须校验 JSON 结构。
- 发布确认：展示 `expected_hash`、变更原因、影响端和回滚提示。
- 回滚入口：选择历史版本，创建新的发布版本。
- 错误态：展示 `CONFIG_SCHEMA_INVALID`、`CONFIG_VERSION_CONFLICT`、`CONFIG_NOT_PUBLISHED` 等错误。
- 完成报告必须声明 App / NodeAgent 是否可以继续热更新开发。

### Out of Scope

- 完整 RBAC 权限系统。
- 高级灰度实验和复杂 targeting UI。
- 支付配置真实 secret 管理 UI。

## 3. Contracts

- API：`docs/contracts/api/config-center.md`
- Config：`docs/contracts/config/core-configs.md`
- Events：`docs/contracts/events/core-events.md#config-published`
- Data：`docs/contracts/data-consistency.md`
- Parent：`TASK-P1-05-config-hot-reload`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-admin` | 配置中心 UI、状态处理、表单/JSON 编辑 | 是 | frontend build + manual flow |
| `livemask-backend` | 依赖 Admin API contract | 否 | mock/staging API verification |
| `livemask-app` | 读取配置，不依赖 Admin UI | 否 | N/A |
| `livemask-nodeagent` | 读取配置，不依赖 Admin UI | 否 | N/A |
| `livemask-ci-cd` | 可后续补 UI smoke | 否 | 后续 TASK |
| `livemask-docs` | 记录 UI 行为和错误态 | 如有差异则是 | docs diff |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Backend | Admin | API contract, seed config examples, error codes | API 字段或错误码不稳定 |
| 2 | Admin | QA | 页面路径、测试账号/Mock、发布/回滚流程 | 无法模拟 draft/publish/rollback |
| 3 | QA | App / NodeAgent | 发布流程可用，配置版本可观察 | Admin 发布结果不可信 |
| 4 | Admin | Docs | 页面行为、风险和未完成项 | UI 行为与契约不一致 |

## 6. Implementation Plan

- [ ] 新建配置中心路由和导航入口。
- [ ] 实现配置列表页。
- [ ] 实现配置详情和版本历史展示。
- [ ] 实现 draft 创建 / 编辑。
- [ ] 实现 publish 确认和错误处理。
- [ ] 实现 rollback 确认和错误处理。
- [ ] 增加 loading / empty / degraded / error states。
- [ ] 输出标准任务完成报告并运行 task-sync。

## 7. Validation Plan

- [ ] `npm ci` / 项目等价安装命令通过。
- [ ] `npm run build` / 项目等价构建命令通过。
- [ ] Admin list 能展示至少 4 个 seed configs。
- [ ] Draft 创建后返回新版本和 hash。
- [ ] Publish 使用 expected hash，冲突时展示 `CONFIG_VERSION_CONFLICT`。
- [ ] Rollback 创建新版本，不回退版本号。
- [ ] API 不可用时页面可解释失败，不误报成功。

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| JSON 编辑误发布非法配置 | App / NodeAgent 应用失败 | 前端 JSON 校验 + 后端 schema 校验 + 发布确认 | Admin |
| 缺少真实 Admin Auth | MVP 无法完整验证权限 | 用 mock/auth placeholder，但明确后续 RBAC TASK | Admin / Backend |
| 回滚语义误解为版本号倒退 | 审计和客户端同步混乱 | UI 明确“创建新发布版本” | Admin |

## 9. Rollback

- 回滚触发条件：Admin UI 发布错误配置、页面导致误操作、无法展示正确版本。
- 回滚步骤：关闭配置中心导航入口或回退前端 commit；配置本身通过 Backend rollback API 回滚。
- 回滚验证：Admin 不再可触发错误操作，Backend 当前 published config 正确。

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- Screenshots / logs：
- 文档链接：`docs/contracts/api/config-center.md`

## 11. Follow-up

- `TASK-P1-05-config-hot-reload`
- Admin RBAC / Audit 深化 TASK

