# TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001 — NodeAgent Protocol Capability Sync Contract

- 状态：Done
- Owner：Docs / Backend / NodeAgent / Admin
- 创建日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-admin`, `livemask-ci-cd`
- 关联里程碑：Protocol & Endpoint Template Rollout

## 1. Background

Admin 目前容易把 Backend seed templates 或 reserved protocols 当成“当前可用协议”展示，导致运营误以为所有协议都已经被 NodeAgent 支持。

这会造成两个问题：

- Admin 展示多种协议，但 NodeAgent 实际无法 Validate / Render / HealthCheck / Endpoint report。
- Template rollout 可能把不可用协议下发到节点，产生黑洞、失败 rollout 或 App connect_config 不一致。

正确方向不是等待 NodeAgent 一次性补齐所有协议，而是先让 NodeAgent 上报真实 protocol capabilities，Backend 聚合后供 Admin 展示和 rollout gating 使用。

## 2. Scope

### In Scope

- 在 Protocol & Endpoint Template Contract 中新增 protocol capability sync 规则。
- 定义 NodeAgent capability report 字段。
- 定义 Backend 聚合和 Admin 展示规则。
- 定义 unsupported / reserved / partial / app_pending 的处理。
- 登记后续 Backend / NodeAgent / Admin / CI-CD 任务。

### Out of Scope

- 不实现具体协议。
- 不修改任何代码仓库。
- 不把 reserved protocols 伪装成可用协议。

## 3. Contracts

- API：`/internal/agent/status` 或 heartbeat 增加 `protocol_capabilities`；Admin 增加 protocol capability read APIs。
- Config：NodeAgent registry must expose implemented profiles from local code.
- Events：rollout apply can emit `protocol_unsupported`, `protocol_partial`, `protocol_capability_changed`。
- Error Codes：Backend/Admin should use `PROTOCOL_UNSUPPORTED_BY_NODE`, `PROTOCOL_CAPABILITY_UNKNOWN`, `PROTOCOL_RESERVED`.
- State Machines：Template assignment must block or skip unsupported targets before rollout.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 更新 Protocol & Endpoint contract 和任务索引 | 是 | `bash scripts/check-docs.sh` |
| `livemask-nodeagent` | 后续上报真实 protocol capabilities | 后续任务 | NodeAgent unit + heartbeat payload tests |
| `livemask-backend` | 后续存储、聚合、暴露 node protocol capability | 后续任务 | Backend API tests + assignment gating tests |
| `livemask-admin` | 后续在模板、节点、assignment UI 展示支持状态并阻断不支持操作 | 后续任务 | UI tests + RBAC + unsupported flow |
| `livemask-ci-cd` | 后续 smoke 验证 unsupported protocol 不可 rollout | 后续任务 | Protocol capability smoke |
| `livemask-app` | 间接受益，避免收到不可用 connect_config | 可选 | reconnect/connect_config smoke |

## 5. Required Capability States

| State | Meaning |
| --- | --- |
| `implemented` | NodeAgent supports Validate, Render, Endpoint, HealthCheck for the protocol. |
| `partial` | NodeAgent can parse or validate but cannot fully render/apply/health-check. |
| `reserved` | Known protocol name exists in roadmap/seed templates but rollout is blocked. |
| `unsupported` | NodeAgent does not know or cannot use the protocol. |
| `app_pending` | NodeAgent/Backend support exists but App native engine is not ready for client use. |
| `unknown` | Backend has not received capability report from this node or report is stale. |

## 6. Follow-Up Tasks

| TASK | Repo | Purpose |
| --- | --- | --- |
| `TASK-NODEAGENT-PROTOCOL-CAPABILITY-001` | `livemask-nodeagent` | Expose registry-derived protocol capabilities in heartbeat/status. |
| `TASK-BACKEND-PROTOCOL-CAPABILITY-001` | `livemask-backend` | Store capability reports, aggregate support matrix, enforce assignment gating. |
| `TASK-ADMIN-PROTOCOL-CAPABILITY-001` | `livemask-admin` | Show capability badges on templates, node detail, assignment wizard, and rollout status. |
| `TASK-CICD-PROTOCOL-CAPABILITY-001` | `livemask-ci-cd` | Smoke: unsupported/reserved protocol cannot be assigned; implemented protocol is assignable. |

## 7. Validation

Run:

```bash
bash scripts/check-docs.sh
```

## 8. Local Dev Runtime

This is a docs-only task. Do not run `docker compose down`, `scripts/local-dev.sh stop`, or any local runtime shutdown command.
