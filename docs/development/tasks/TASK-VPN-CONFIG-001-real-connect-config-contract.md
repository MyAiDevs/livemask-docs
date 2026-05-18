# TASK-VPN-CONFIG-001 — Real VPN Connect Config Contract & Security Model

- 状态：Draft
- Owner：Backend Lead / Security
- 创建日期：2026-05-18
- 目标完成日期：2026-05-25
- 主影响仓库：`livemask-backend`, `livemask-app`, `livemask-docs`
- 受影响仓库：`livemask-nodeagent`, `livemask-admin`
- 关联里程碑：M1 — 连接契约闭环

## 1. Background

当前 MVP skeleton 中的 connect_config 使用占位值：

```json
{
  "endpoint": "mvp-not-issued",
  "port": 0,
  "protocol": "mvp"
}
```

这无法支持真实连接。App 端无法构建 sing-box 客户端配置，NodeAgent 无法校验连接凭据，iOS/macOS NetworkExtension 和 Android VpnService 所需字段缺失。

本 TASK 将占位契约替换为生产级 connect_config，覆盖 Backend、NodeAgent、App 三方数据流，以及密钥安全边界、平台适配、配置生命周期和可观测性约束。

## 2. Scope

### In Scope

- `GET /api/v1/client/nodes/connect-config` API 契约
- connect_config JSON schema 定义（server / credentials / tls / multiplex / dns / routing / keep_alive / platform_hints）
- 协议映射表（connect_config → sing-box client outbound）
- 密钥分层模型（node_secret → server_public_key → session credential → device token）
- 会话绑定、过期、吊销、轮换规则
- iOS/macOS NetworkExtension 所需字段（app_group, tunnel_type）
- Android VpnService 所需字段（allowed_applications, bypassable）
- Windows/Linux 预留字段
- 安全约束：禁止下发 node_secret / node_secret_hash / HMAC key
- 可观测性安全规则：日志、Lark、CI 不得打印敏感字段
- connect_config 错误码

### Out of Scope

- connect-config API 的实际 Backend 实现（Go handler）
- App 端 connect_config 到 sing-box 客户端的转换代码
- NodeAgent sing-box server 配置同步
- session 吊销 API 的管理端 UI

## 3. Contracts

| 契约 | 文档 |
| --- | --- |
| Connect Config API | `docs/contracts/api/connect-config.md` |
| Security Model | `docs/security/VPN_CONNECT_CONFIG_SECURITY_MODEL.md` |
| API 索引 | `docs/contracts/api/core-mvp.md` |
| Error Codes | `docs/contracts/error-codes.md` → `CONFIG_` 域新增 |
| Config 关系 | `docs/contracts/config/core-configs.md` — NodeAgent sing-box 配置 |
| Chain Audit | `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md` — H9 |

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增 3 个文档，更新 5 个引用文件 | 是 | docs check |
| `livemask-backend` | 实现 connect-config API handler、session 管理、吊销端点、credential 生成 | 是 | API 集成测试 |
| `livemask-app` | connect_config 接收、平台安全存储、原生层转换 sing-box client config | 是 | Android/iOS E2E |
| `livemask-nodeagent` | sing-box server 配置需与 connect_config credentials 对应 | 否 | 兼容性确认 |
| `livemask-admin` | session 吊销管理端点 | 后续 | — |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Backend + Security | TASK scope、安全模型、验收标准 | 验收标准不可测试 |
| 2 | Security | Backend | 密钥分层图、禁止字段列表、日志过滤规则 | 日志过滤规则未明确 |
| 3 | Backend (connect-config API) | App (Flutter + native) | connect_config schema、协议映射表、错误码 | 协议映射未覆盖 reality |
| 4 | Backend | NodeAgent | session credential 生成规则、sing-box server 配置同步 | credentials 格式不兼容 |
| 5 | App (native layer) | QA | Android VpnService / iOS NetworkExtension 连接测试 | 平台原生实现未就绪 |
| 6 | QA / Ops | Task Owner | 日志无敏感字段、Lark 无凭据、CI 不 dump body | 日志过滤规则未验证 |

## 6. Implementation Plan

- [ ] 1. 定义 connect-config API 契约（`docs/contracts/api/connect-config.md`）
- [ ] 2. 定义安全模型（`docs/security/VPN_CONNECT_CONFIG_SECURITY_MODEL.md`）
- [ ] 3. 更新 `docs/contracts/api/core-mvp.md` 引用 connect-config
- [ ] 4. 更新 `docs/contracts/error-codes.md` 新增 connect_config 错误码
- [ ] 5. 更新 `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md` 新增 H9
- [ ] 6. 更新 `docs/contracts/config/core-configs.md` 增加 NodeAgent sing-box server 配置关系
- [ ] 7. 更新 `docs/security/README.md` 引用新安全模型
- [ ] 8. 注册 TASK 到 `MVP_IMPLEMENTATION_PLAN.md` 和 `docs/development/tasks/README.md`
- [ ] 9. 运行 `bash scripts/check-docs.sh` 全绿
- [ ] 10. 代码实现（后续步骤，不在本 TASK 的范围限制内）

## 7. Validation Plan

### 契约检查

- [ ] connect-config.md 定义了完整的 request/response schema
- [ ] connect-config.md 包含协议映射表
- [ ] connect-config.md 包含配置生命周期
- [ ] VPN_CONNECT_CONFIG_SECURITY_MODEL.md 定义了密钥分层
- [ ] VPN_CONNECT_CONFIG_SECURITY_MODEL.md 包含 Session 状态机
- [ ] VPN_CONNECT_CONFIG_SECURITY_MODEL.md 包含日志安全规则
- [ ] connect-config.md 不包含 `node_secret` / `node_secret_hash` / HMAC key
- [ ] 错误码文档登记了 `CONNECT_CONFIG_*` 错误

### 安全检查

- [ ] 密钥分层图中 node_secret 仅存在于 NodeAgent 和 Backend
- [ ] connect_config credentials 是 session-bound，与节点长期密钥无关
- [ ] 日志输出规则覆盖 `credentials.*`、`server.endpoint + port`、`tls.server_public_key`
- [ ] Lark 通知模板不含凭据字段
- [ ] CI 不打印 connect_config 完整 payload

### 平台适配

- [ ] connect_config 包含 ios.platform_hints（app_group, tunnel_type）
- [ ] connect_config 包含 android.platform_hints（allowed_applications, bypassable）
- [ ] connect_config 包含 windows 预留字段
- [ ] connect_config 包含 linux 预留字段

### 生命周期

- [ ] `expires_at` 定义明确
- [ ] session 状态机定义完整（active → expired / revoked / closed）
- [ ] session 吊销路径定义
- [ ] 正常断开、超时、切换节点、节点下线行为已定义

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| sing-box 协议版本差异导致 connect_config 无法转换 | App 无法连接 | 协议映射表定义明确版本约束 | Backend / App |
| 日志过滤规则遗漏某个敏感字段 | 凭据泄露 | 代码 review + 渗透测试 + 自动化检查 | Security |
| iOS NetworkExtension App Group 标识未定 | platform_hints 中 app_group 占位 | 确定 bundle id 后再最终确定 | App |
| session 吊销延迟导致泄露凭据继续可用 | 安全窗口 | session TTL 短（15-60 min），吊销后 Redis key 立即删除 | Backend |

## 9. Rollback

- 回滚触发条件：connect-config API 引入安全漏洞、协议映射错误导致连接大面积失败、日志泄露确认
- 回滚步骤：
  1. 恢复 recommend API 返回 skeleton connect_config（`mvp-not-issued`）
  2. 保留 session 吊销能力以清理已下发凭据
  3. 记录回滚原因和修复计划
- 回滚验证：App 回归 MVP 占位状态，不能真实连接但不出安全事件

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- Screenshots / logs：
- 文档链接：`docs/contracts/api/connect-config.md`, `docs/security/VPN_CONNECT_CONFIG_SECURITY_MODEL.md`
- Dashboard / alert：
- Product / support note：

## 11. Follow-up

- `TASK-BE-CONNECT-001`：实现 connect-config API handler + session 管理
- `TASK-APP-CONNECT-001`：App 端 connect_config 接收 + 原生层转换
- `TASK-NA-SINGBOX-CONFIG-001`：NodeAgent sing-box server 配置同步
- `TASK-ADMIN-SESSION-001`：Admin session 吊销管理页
