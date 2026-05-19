# TASK-BACKEND-NODE-DETAIL-REAL-DATA-001 — Backend Node Detail Real Data Validation

- 状态：Ready
- Owner：Backend
- 创建日期：2026-05-19
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-backend`
- 受影响仓库：`livemask-admin`, `livemask-docs`
- 关联里程碑：Phase 4 Admin 后台核心页面

## 1. Background

Admin 节点详情页 (`/admin/nodes/[id]`) 使用三个辅助端点来展示节点状态：

| 端点 | 页面用途 |
| --- | --- |
| `GET /admin/api/v1/nodes/{node_id}/logs` | Latest Logs 卡片 |
| `GET /admin/api/v1/nodes/{node_id}/metrics-summary` | Node Metrics 面板 |
| `GET /admin/api/v1/protocol/nodes/{node_id}/capabilities` | Protocol Capabilities 卡片 |

**当前问题：**
这三个端点虽然在 log-metric-pipeline contract 中已定义路由，但 Backend 当前在 local/dev 环境下可能返回：
- 空数组（无数据但无原因）
- 404（无实现）
- 静默 mock fallback（Admin 端 `tryReal` 降级到 mock 数据，无法判断是真实空数据还是 Backend 不可用）

**任务目标不是"接口存在"**，而是确认：
1. 对于数据库中存在的 node_id，三个端点都能返回真实数据
2. 权限检查正确（401/403 返回标准错误码）
3. 空数据时返回明确原因（如 `node_not_found`, `no_logs_available`, `no_capability_report`）
4. 数据源链路上报完整：NodeAgent -> Backend -> Admin

## 2. Scope

### In Scope

- Backend 端确认数据库有真实数据源（`observability_logs`, `node_metric_summaries`, `node_protocol_capabilities` 表）
- Backend 确认权限中间件在这三个端点正常工作
- 定义空数据的标准响应格式
- Admin 端针对真实数据 vs mock 的区分逻辑验证
- 修复 LOG_METRIC_PIPELINE_CONTRACT.md 中 metrics-summary 路径不一致
- Admin README 更新

### Out of Scope

- 非本仓库代码（Go Backend handler 实现不在本窗口修改）
- NodeAgent 端数据上报逻辑
- 新的 UI 组件或页面

## 3. Contracts

### API - 端点契约

#### GET /admin/api/v1/nodes/{node_id}/logs

已在 `LOG_METRIC_PIPELINE_CONTRACT.md` 8.2 节定义。

**权限：** `node:read` + `logs:read`

**正常响应（200）：**
```json
{
  "logs": [
    {
      "log_id": "log-uuid",
      "family": "node",
      "level": "info",
      "source": "nodeagent",
      "component": "singbox",
      "event_type": "endpoint_ready",
      "message": "Endpoint ready for transport udp",
      "metadata": { "node_id": "...", "protocol_profile": "hysteria2" },
      "node_id": "...",
      "created_at": "2026-05-19T10:00:00Z"
    }
  ],
  "total": 1
}
```

**空数据（200）：**
```json
{
  "logs": [],
  "total": 0
}
```
-> 不需要特殊错误码，空数组本身就表示"该节点还没有日志"。

**node_id 不存在（404）：**
```json
{
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "Node not found"
  }
}
```

#### GET /admin/api/v1/nodes/{node_id}/metrics-summary

**路径说明：** `metrics-summary`（连字符），**不是** `metrics/summary`（斜杠）。

已在 `PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md` 和 `TASK-DOC-PROTOCOL-STABILITY-GATE-001` 中统一使用 `metrics-summary`。

**权限：** `node:read` + `metrics:read`

**正常响应（200）：**
```json
{
  "node_id": "...",
  "endpoint_ready": true,
  "config_degraded": false,
  "singbox_running": true,
  "geoip_ready": true,
  "event_queue_depth": 0,
  "log_queue_depth": 0,
  "active_job_type": null,
  "collected_at": "2026-05-19T10:00:00Z"
}
```

**空数据/节点无上报（200）：**
```json
{
  "node_id": "...",
  "endpoint_ready": false,
  "config_degraded": false,
  "singbox_running": false,
  "geoip_ready": false,
  "event_queue_depth": 0,
  "log_queue_depth": 0,
  "active_job_type": null,
  "collected_at": null
}
```
-> 所有布尔字段为 false，表示"该节点没有上报过 metrics"。

**node_id 不存在（404）：**
```json
{
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "Node not found"
  }
}
```

#### GET /admin/api/v1/protocol/nodes/{node_id}/capabilities

已在 `PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md` Admin API 节定义。

**权限：** `node:read`

**正常响应（200）：**
```json
{
  "capabilities": [
    {
      "protocol": "hysteria2",
      "state": "implemented",
      "transports": ["udp"],
      "supports_validate": true,
      "supports_render": true,
      "supports_endpoint": true,
      "supports_health_check": true,
      "supports_secret_refs": true,
      "supports_client_config": true,
      "profile_version": "1.0.0",
      "reason": null,
      "reported_at": "2026-05-19T10:00:00Z"
    }
  ]
}
```

**空数据/节点无上报（200）：**
```json
{
  "capabilities": []
}
```
-> 空数组表示"该节点从未上报 protocol capability"。

**node_id 不存在（404）：**
```json
{
  "error": {
    "code": "NODE_NOT_FOUND",
    "message": "Node not found"
  }
}
```

### 空数据原因解释规范

| 场景 | Admin 显示 | 原因 |
| --- | --- | --- |
| 200 + `logs: []` | "No logs found." | 正常空数据 |
| 200 + `metrics` 全部 false | "Metrics unavailable." | 正常空数据 |
| 200 + `capabilities: []` | "No protocol capability data reported by this node." | 正常空数据 |
| 403 | "Access Denied" | 缺少 `node:read` / `logs:read` / `metrics:read` |
| 404 NODE_NOT_FOUND | "Node not found" | node_id 不存在 |
| Network error | Mock fallback + 黄条 | Backend 不可达 |

### 权限矩阵

| 端点 | 必需权限 | 403 错误码 |
| --- | --- | --- |
| `/nodes/{node_id}/logs` | `node:read` + `logs:read` | `PERMISSION_DENIED` |
| `/nodes/{node_id}/metrics-summary` | `node:read` + `metrics:read` | `PERMISSION_DENIED` |
| `/protocol/nodes/{node_id}/capabilities` | `node:read` | `PERMISSION_DENIED` |

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 实现/验证三个端点在真实 node_id 下有数据，权限正确，错误码规范 | 是 | Backend API tests + manual curl |
| `livemask-admin` | 更新 README，修复 contract 路径，添加空数据/权限测试 | 是 | UI smoke + unit tests |
| `livemask-docs` | 修复 LOG_METRIC_PIPELINE_CONTRACT 路径不一致 | 是 | `bash scripts/check-docs.sh` |
| `livemask-nodeagent` | NodeAgent 上报 protocol capabilities 和 metrics | 后续 TASK | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Backend | Admin | 三个端点返回真实数据的验证截图/curl | Backend 未实现端点 |
| 2 | Admin | QA | 节点详情页显示真实数据而非 mock | 权限不正确或 404 |
| 3 | QA | Product | 验收矩阵测试通过 | 数据源链路上报未完成 |

## 6. Implementation Plan

- [x] 创建本任务单，定义端点契约
- [x] 修复 LOG_METRIC_PIPELINE_CONTRACT.md `metrics/summary` -> `metrics-summary`
- [x] Admin 端添加空数据检测和权限测试
- [ ] Backend 端（livemask-backend 窗口）：
  - [ ] 确认 observability_logs 表有该 node_id 的日志数据
  - [ ] 确认 node_metric_summaries 表有该 node_id 的 metrics 数据
  - [ ] 确认 node_protocol_capabilities 表有该 node_id 的能力上报数据
  - [ ] 验证三个端点的权限中间件（401/403）
  - [ ] 验证 node_id 不存在的 404 响应
  - [ ] 在 Backend 单元测试中覆盖空数据和权限场景

## 7. Validation Plan

### Admin 端验证

- [x] `logs.test.ts` 已有 `/metrics-summary` 路径测试，确认正确
- [x] 节点详情页已正确处理空数据（显示 "No logs found." / "Metrics unavailable." / "No protocol capability data reported"）
- [x] 空数据不会触发 mock 降级（只有 Network error 才降级）

### Backend 端验证（在 livemask-backend 窗口）

- [ ] 用真实 node_id 调用三个端点，确认返回非空数据
- [ ] 用不存在的 node_id 调用，确认返回 `NODE_NOT_FOUND` 404
- [ ] 用缺少权限的 token 调用，确认返回 403 `PERMISSION_DENIED`
- [ ] 用刚注册（无上报）的 node_id 调用，确认返回规范的空数据响应

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Backend 表中有节点但无日志/metrics/capabilities 数据 | Admin 显示空数据，运营误以为系统有问题 | 明确空数据与错误的区别，UI 显示清晰描述 | Backend |
| 权限配置不正确 | 403 返回但不含标准 `PERMISSION_DENIED` 错误码 | Admin `tryReal` 只对 404/501 降级 mock；401/403 抛出 | Backend |
| NodeAgent 未上报 protocol capabilities | capabilities 端点总是返回空数组 | UI 显示 "No protocol capability data reported"，并在节点详情页说明条件 | Admin |

## 9. Rollback

- 回滚触发条件：Backend 变更导致 Admin 节点详情页无法正常访问
- 回滚步骤：`git revert <backend-commit> && git push`
- 回滚验证：Admin 节点详情页退化到 mock fallback 模式

## 10. Completion Evidence

- PR：Backend 端提交 + Admin 端提交
- Commit：
- Test output：
- 文档链接：`docs/development/tasks/TASK-BACKEND-NODE-DETAIL-REAL-DATA-001.md`
- API 验证：

```bash
# Backend 端验证命令（由 Backend 窗口执行）
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/api/v1/nodes/{real_node_id}/logs?limit=3"
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/api/v1/nodes/{real_node_id}/metrics-summary"
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:8080/admin/api/v1/protocol/nodes/{real_node_id}/capabilities"
```

## 11. Follow-up

- TASK-NODEAGENT-PROTOCOL-CAPABILITY-001 — NodeAgent 上报 protocol capabilities（livemask-nodeagent）
- TASK-NODEAGENT-METRICS-LOGS-001 — NodeAgent 上报 metrics summary（livemask-nodeagent）
- TASK-ADMIN-NODE-DETAIL-OBSERVABILITY-FIX-001 — Admin Node Detail 对接真实端点（已完成）
