# TASK-DOC-PROTOCOL-001 — NodeAgent Multi-Protocol Extension Architecture Docs

- 状态：Draft
- Owner：NodeAgent Lead
- 创建日期：2026-05-18
- 目标完成日期：2026-05-25
- 主影响仓库：`livemask-nodeagent`, `livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-app`
- 关联里程碑：M1 — 协议架构闭环

## 1. Background

当前 NodeAgent 的 `protocol_profile` 只是字符串标记，不是可扩展协议模块接口。
hysteria2 / vless reality / trojan / shadowtls / wireguard 等真实协议尚未实现。
为了后续协议扩展不硬改 renderer，需要定义 NodeAgent 多协议模块化架构，包括：

- ProtocolProfile 插件接口
- ProtocolConfig 模型
- SecretRef / SecretSource / redaction 规则
- Renderer dispatch 机制
- HealthCheck hook
- Public endpoint metadata hook
- Backend connect_config 与 NodeAgent profile 的对应关系
- 后续协议扩展路线图

## 2. Scope

### In Scope

- ProtocolProfile 接口定义（Name, Validate, Render, Endpoint, HealthChecks, SecretRefs, Redact, SupportsClientConfig）
- ProtocolConfig 模型（含 TLSConfig, PublicEndpoint, UserConfig, HealthConfig）
- SecretRef / SecretSource / RotatePolicy 定义
- Redaction 安全规则
- Renderer dispatch 机制描述（Renderer 不感知具体协议字段）
- HealthChecker 调用 ProtocolProfile.HealthChecks() 流程
- PublicProber 调用 ProtocolProfile.Endpoint() 流程
- Backend connect_config ↔ NodeAgent profile 字段映射
- Credential 生命周期（长期 vs session-bound）
- 当前已实现/未实现能力矩阵
- 后续协议扩展路线图（9 个步骤）
- Profile 开发指南（文件组织、实现步骤、测试要求、安全审查清单）

### Out of Scope

- ProtocolProfile 接口的 Go 代码实现（仅为文档契约）
- hysteria2 / vless / trojan / shadowtls / wireguard 具体 profile 实现
- Renderer dispatcher 的代码实现
- Backend connect-config API 的 hysteria2 支持
- App 端协议适配

## 3. Contracts

| 契约 | 文档 |
| --- | --- |
| 多协议扩展架构 | `docs/nodeagent/NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md` |
| Profile 开发指南 | `docs/nodeagent/PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md` |
| Connect Config 映射 | `docs/contracts/api/connect-config.md` — 第 4 节协议映射表 |
| connect_config credentials | `docs/security/VPN_CONNECT_CONFIG_SECURITY_MODEL.md` — 密钥分层 |

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增 2 个架构文档 + 1 个 TASK 文档 | 是 | docs check |
| `livemask-nodeagent` | 后续按此架构实现 ProtocolProfile 接口和具体协议 | 是 | 单元测试 + 集成测试 |
| `livemask-backend` | connect-config API 生成逻辑需按协议分派 | 间接 | 兼容性确认 |
| `livemask-app` | 后续消费新协议 connect_config | 间接 | E2E 测试 |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | NodeAgent + Backend | 架构图、能力矩阵、路线图 | 支持矩阵与实际能力不符 |
| 2 | Docs (架构) | NodeAgent (实现) | ProtocolProfile 接口设计、Renderer dispatch 流程 | 接口未覆盖健康检查和凭据轮换 |
| 3 | NodeAgent (架构) | Backend (connect-config) | 字段映射表、credential 生命周期 | connect_config 字段与 profile 不一致 |
| 4 | NodeAgent (架构) | Security | SecretRef、Redact 规则、日志安全 | redaction 规则未覆盖所有敏感字段 |
| 5 | Docs / Security | QA | 测试要求、安全审查清单 | 测试未覆盖 redaction 或 secret 声明 |

## 6. Implementation Plan

- [ ] 1. 编写 `NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md`
  - 能力矩阵（已实现 / 未实现）
  - 架构总览图
  - ProtocolProfile 接口定义
  - ProtocolConfig 模型
  - SecretRef / SecretSource / Redaction
  - Renderer dispatch
  - HealthCheck hook
  - Public endpoint hook
  - connect_config ↔ profile 映射
  - Credential 生命周期
  - 路线图
- [ ] 2. 编写 `PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md`
  - 文件组织
  - 7 步实现流程
  - 测试要求（13 项）
  - 安全审查清单
  - Registry 与 Backend config 联动
- [ ] 3. 创建 TASK 文档（本文）
- [ ] 4. 更新 `docs/nodeagent/README.md` 新增链接
- [ ] 5. 注册 TASK 到 `docs/development/tasks/README.md`
- [ ] 6. 注册 TASK 到 `docs/development/MVP_IMPLEMENTATION_PLAN.md`
- [ ] 7. 运行 `bash scripts/check-docs.sh` 全绿

## 7. Validation Plan

### 架构检查

- [ ] ProtocolProfile 接口覆盖 Name / Validate / Render / Endpoint / HealthChecks / SecretRefs / Redact / SupportsClientConfig
- [ ] ProtocolConfig 模型覆盖 profile / transport / listen / public_endpoint / tls / dns / route / secrets / health
- [ ] SecretRef 包含 name / source / required / rotate_policy / redaction_key
- [ ] Renderer dispatch 描述清楚 Renderer 不感知具体协议字段
- [ ] HealthCheck hook 描述清楚 HealthChecker 调用 Profile.HealthChecks()
- [ ] Public endpoint hook 描述清楚 PublicProber 调用 Profile.Endpoint()

### 安全检查

- [ ] Redaction 规则覆盖 password / private_key / psk / secret / uuid / server_public_key
- [ ] 安全规则明确禁止在日志/Lark/CI 输出 secrets
- [ ] 安全规则明确 node_secret/HMAC/private_key 不混入 connect_config
- [ ] 所有协议配置必须实现 Redact()

### 能力矩阵

- [ ] 已实现清单准确（runtime、mixed/socks/tun、dns/route、endpoint report、probe、degraded_reason）
- [ ] 未实现清单准确（hysteria2、vless、trojan、shadowtls、wireguard、handshake health、credential rotation、ephemeral credentials）

### 开发指南

- [ ] 7 步实现流程完整（Validate → Render → SecretRefs → Redact → HealthChecks → 注册 → 测试）
- [ ] 测试要求包含 13 项测试
- [ ] 安全审查清单包含 8 项
- [ ] Registry 与 Backend config 联动描述清楚

### 路线图

- [ ] 路线图包含 9 个步骤，依赖关系清晰
- [ ] 第一个协议实现后接口锁定

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| ProtocolProfile 接口初期不稳定，新增协议需要回溯修改 | Step 1 延迟 | Step 1 先定义最小接口，两个参考实现后再冻结 | NodeAgent Lead |
| mixed 参考实现覆盖不全导致接口缺失字段 | 后续协议发现接口不完整 | 在 Design Review 阶段补全 | NodeAgent Lead |
| connect_config ↔ profile 映射表与 Backend 实现不一致 | App 无法连接 | 映射表需要在 VPN-CONFIG-001 实现时验证 | Backend Lead |
| 日志过滤规则更新后 redaction 未同步 | 凭据泄露 | redaction 规则与安全模型共用同一份配置 | Security |

## 9. Rollback

- 回滚触发条件：架构设计与 NodeAgent 实际实现无法对应
- 回滚步骤：
  1. 从 `docs/nodeagent/README.md` 移除新增链接
  2. 撤销新增的 3 个文档
  3. 保留后续协议扩展的 roadmap 作为参考，但不绑定接口
- 回滚验证：`docs check` 通过，README 链接完整

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- Screenshots / logs：
- 文档链接：`docs/nodeagent/NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md`, `docs/nodeagent/PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md`
- Dashboard / alert：
- Product / support note：

## 11. Follow-up

- `TASK-NODEAGENT-PROTOCOL-001` — ProtocolProfile 接口 + Renderer dispatcher + Registry 代码实现
- `TASK-NODEAGENT-HYSTERIA2-001` — 首个真实协议 hysteria2 profile
- `TASK-BACKEND-CONNECT-CONFIG-002` — Hysteria2 client config 下发
- `TASK-APP-ANDROID-ENGINE-002` — Android 端 hysteria2 客户端配置消费
- `TASK-APP-IOS-PACKET-TUNNEL-002` — iOS/macOS hysteria2 适配
- VLESS/Trojan/ShadowTLS/WireGuard 后续协议
