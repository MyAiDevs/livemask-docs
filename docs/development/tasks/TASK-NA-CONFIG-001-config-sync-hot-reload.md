# TASK-NA-CONFIG-001 - NodeAgent 配置同步、轮询、降级与热更新

- 状态：Ready
- Owner：NodeAgent Lead
- 主影响仓库：`livemask-nodeagent`
- 受影响仓库：`livemask-backend`, `livemask-docs`, `livemask-ci-cd`
- 关联里程碑：M1 / 配置中心
- 依赖：`TASK-P0-03-config-center`

## 1. Background

NodeAgent 需要读取 `nodeagent.runtime_config`，用于 sing-box 健康检查、上报间隔、离线缓冲、degraded mode 等运行策略。配置必须支持轮询补偿、last-known-good、非法配置拒绝应用和离线恢复。

## 2. Scope

### In Scope

- 调用 `GET /internal/agent/config` 拉取 `nodeagent.runtime_config`。
- 请求携带 `node_id`、`agent_version`、本地 `config_version`。
- 校验 `config_key`、`schema_version`、`config_version`、`config_hash`。
- 持久化 last-known-good，并在启动时优先加载。
- 周期性轮询配置版本，补偿 Pub/Sub 丢失。
- 配置变更后应用到 runtime scheduler / reporting / degraded mode。
- 非法配置拒绝应用并保留旧版本。
- 上报当前 config version / hash 到 Backend 心跳或后续状态接口。

### Out of Scope

- 完整节点身份 / mTLS。
- Backend 心跳接口新增实现。
- sing-box 全量配置生成。

## 3. Contracts

- API：`docs/contracts/api/config-center.md#3-nodeagent-read`
- Config：`docs/contracts/config/core-configs.md#nodeagentruntime_config`
- Events：`docs/contracts/events/core-events.md#config-published`
- Redis：`pubsub:config.published`
- Parent：`TASK-P1-05-config-hot-reload`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-nodeagent` | config client、cache、polling、runtime apply | 是 | unit + mock backend + local run |
| `livemask-backend` | 依赖 `/internal/agent/config` | 否 | staging smoke 已覆盖 |
| `livemask-app` | 无直接影响 | 否 | N/A |
| `livemask-admin` | 发布配置影响 NodeAgent | 否 | 后续联调 |
| `livemask-ci-cd` | 可后续增加 agent smoke | 否 | 后续 TASK |
| `livemask-docs` | 行为差异需更新 | 如有差异则是 | docs diff |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Backend | NodeAgent | API response, seed payload, config schema | config 字段不稳定 |
| 2 | NodeAgent | QA / Ops | poll interval, cache path, degraded behavior | 无法模拟 Backend/网络失败 |
| 3 | Admin | NodeAgent | 发布/回滚配置后 agent 可感知 | Admin 未完成 |
| 4 | NodeAgent | Monitoring | 当前 config version/hash 可观测 | 心跳/状态接口缺失 |

## 6. Implementation Plan

- [ ] 新增 config client。
- [ ] 定义 `nodeagent.runtime_config` 本地模型。
- [ ] 实现 config hash / version / schema 校验。
- [ ] 实现 last-known-good 持久化和启动加载。
- [ ] 实现周期轮询和手动 reload。
- [ ] 实现 runtime apply：reporting interval、health timeout、degraded mode。
- [ ] 非法配置拒绝应用并记录错误。
- [ ] 输出标准任务完成报告并运行 task-sync。

## 7. Validation Plan

- [ ] 首次启动成功拉取并持久化配置。
- [ ] Backend 不可用时加载 last-known-good。
- [ ] 配置版本更新后 agent 应用新值。
- [ ] 非法 schema / hash 缺失时拒绝应用。
- [ ] 轮询能补偿 Pub/Sub 丢失。
- [ ] 离线恢复后同步到最新版本。
- [ ] 当前 config version/hash 可在日志或状态输出中看到。

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| 错误配置导致节点不可用 | 用户无法连接 | last-known-good + schema 校验 + degraded mode | NodeAgent |
| 轮询过频 | Backend 压力 | 默认 interval + jitter + backoff | NodeAgent |
| 无法观测配置版本 | 排障困难 | 状态输出 / 后续心跳携带 version/hash | NodeAgent / Backend |

## 9. Rollback

- 回滚触发条件：新配置导致节点健康检查异常、上报中断、degraded mode 异常。
- 回滚步骤：NodeAgent 保持 last-known-good；Admin/Backend 发布上一稳定 payload 的新版本。
- 回滚验证：NodeAgent 当前 version/hash 与稳定版本一致，健康检查恢复。

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- Logs：
- 文档链接：`docs/contracts/api/config-center.md`

## 11. Follow-up

- `TASK-P1-05-config-hot-reload`
- NodeAgent heartbeat/status API 携带 config version/hash

