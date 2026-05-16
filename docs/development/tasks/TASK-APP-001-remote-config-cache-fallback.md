# TASK-APP-001 - 远程配置读取、缓存与降级

- 状态：Ready
- Owner：App Client Lead
- 主影响仓库：`livemask-app`
- 受影响仓库：`livemask-backend`, `livemask-docs`, `livemask-admin`
- 关联里程碑：M1 / 配置中心
- 依赖：`TASK-P0-03-config-center`

## 1. Background

App 需要从 Backend 读取 `client.remote_config`，用于功能开关、连接推荐 TTL、反馈开关等策略。读取失败时必须使用 last-known-good，避免配置中心或网络异常导致 App 无法启动或无法连接。

## 2. Scope

### In Scope

- App 启动或登录后调用 `GET /api/v1/config/client`。
- 请求携带 `client_version`、`platform`、本地 `config_version`。
- 校验 response 的 `config_key`、`config_version`、`config_hash`、`schema_version`。
- 将最新可用配置保存为 last-known-good。
- 后端不可用、超时、schema 不兼容时使用 last-known-good。
- 提供配置状态给调试/设置页：current / stale / fallback / invalid。
- 为后续连接推荐、反馈开关、降级策略提供本地读取接口。

### Out of Scope

- 完整节点推荐 UI。
- 推送式实时配置更新。
- 支付配置或 NodeAgent 配置读取。

## 3. Contracts

- API：`docs/contracts/api/config-center.md#2-public-client-read`
- Config：`docs/contracts/config/core-configs.md#clientremote_config`
- Error Codes：`CONFIG_NOT_PUBLISHED`, `CONFIG_SCHEMA_INVALID`, `CONFIG_KEY_NOT_FOUND`
- Parent：`TASK-P1-05-config-hot-reload`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-app` | remote config client、cache、fallback | 是 | unit + mocked API + manual startup |
| `livemask-backend` | 依赖 `/api/v1/config/client` | 否 | staging smoke 已覆盖 |
| `livemask-admin` | 发布配置后影响 App | 否 | 后续联调 |
| `livemask-nodeagent` | 无直接影响 | 否 | N/A |
| `livemask-docs` | 行为差异需更新 | 如有差异则是 | docs diff |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Backend | App | API response, seed payload, error codes | 缺少稳定 response |
| 2 | App | QA | cache location, fallback behavior, test switches | 无法模拟网络失败 |
| 3 | Admin | App | 发布新 config 后 App 可感知版本变化 | Admin 未完成 |
| 4 | App | Product / Support | 用户可见降级文案和支持路径 | 降级状态不可解释 |

## 6. Implementation Plan

- [ ] 新增 remote config client/service。
- [ ] 定义本地 config model 和 schema/version/hash 校验。
- [ ] 实现 last-known-good 持久化。
- [ ] 实现启动读取和手动刷新入口。
- [ ] 实现失败 fallback：network timeout / 500 / invalid schema / incompatible version。
- [ ] 暴露配置读取接口给连接和反馈模块。
- [ ] 增加单元测试和 mock API 测试。
- [ ] 输出标准任务完成报告并运行 task-sync。

## 7. Validation Plan

- [ ] 首次成功读取保存 last-known-good。
- [ ] 第二次 Backend 不可用时使用 last-known-good。
- [ ] `config_key` 不匹配时拒绝应用。
- [ ] `config_hash` 缺失或格式错误时拒绝应用。
- [ ] 旧 `config_version` 能被新 response 覆盖。
- [ ] 无 last-known-good 且 Backend 不可用时进入可解释 degraded state。

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| 配置读取阻塞启动 | App 启动慢或不可用 | 超时 + 异步刷新 + last-known-good | App |
| 错误配置被应用 | 连接策略异常 | schema/hash/key 校验 + fallback | App |
| 缓存过期不可见 | 排障困难 | 设置/调试状态显示版本与更新时间 | App |

## 9. Rollback

- 回滚触发条件：App 配置读取导致启动失败、连接策略异常、fallback 不生效。
- 回滚步骤：回退 App commit 或关闭 remote config 开关；Backend 发布上一稳定配置。
- 回滚验证：App 使用 last-known-good 或默认配置可正常启动和连接。

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- Screenshots / logs：
- 文档链接：`docs/contracts/api/config-center.md`

## 11. Follow-up

- `TASK-P1-05-config-hot-reload`
- App 连接推荐和快速反馈功能接入 remote config

