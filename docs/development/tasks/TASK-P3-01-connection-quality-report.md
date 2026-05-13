# TASK-P3-01 - App 上报连接质量

- 状态：Ready
- Owner：App / Backend
- 主影响仓库：`livemask-app`, `livemask-backend`
- 受影响仓库：`livemask-nodeagent`, `livemask-docs`
- 关联里程碑：M3

## 1. Background

App 连接成功/失败结果是推荐引擎和节点质量评分的用户侧反馈，必须幂等、可降权、可审计。

## 2. Scope

- `POST /client/vpn/report-connection-quality`
- request_id 幂等
- latency / success / failure_reason
- 低权重影响节点质量
- App 离线缓存后补报

## 3. Contracts

- API：`docs/contracts/api/core-mvp.md#connection-quality-api`
- Events：`docs/contracts/events/core-events.md#node-quality-events`
- Data：`docs/contracts/data-consistency.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-app` | 连接结果上报和离线补报 | 是 | duplicate request test |
| `livemask-backend` | 接收、幂等、降权 | 是 | API + DB unique test |
| `livemask-nodeagent` | 节点质量互补数据 | 否 | recommendation impact check |
| `livemask-docs` | API / event contract | 是 | docs check |

## 5. Validation Plan

- [ ] success report accepted
- [ ] failure report accepted
- [ ] duplicate request_id ignored
- [ ] offline retry accepted once
- [ ] node score short-term weight adjusted

## 6. Rollback

- 关闭 App 质量上报权重。
- 保留日志但不影响推荐。
- 恢复前一版推荐权重。
