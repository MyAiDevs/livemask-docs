# VPN Connect Config Security Model

> Security companion for `docs/contracts/api/connect-config.md`.

## 1. Threat Model

| Threat | Likelihood | Impact | Control |
| --- | --- | --- | --- |
| connect_config 被中间人截获 | Low（TLS 传输） | High（凭据泄露） | session_bound + 短 TTL + `expires_at`；Backend 可吊销 |
| connect_config 从 App 本地存储泄露 | Medium（设备失陷） | High | 平台安全存储加密；session 吊销可使已泄露凭据失效 |
| `node_secret` 通过 connect_config 泄露 | N/A | Critical | **设计禁止**：connect_config 不含 node_secret/node_secret_hash/HMAC key |
| session 凭据被重放 | Low（TLS + session_id） | Medium | session_id 绑定用户 + 节点 + 时间窗口，Backend 侧可做一次性校验 |
| 日志 / Lark / CI 泄露敏感字段 | Medium | Medium | 日志必须过滤 `credentials.*`、`tls.server_public_key`、`server.endpoint + port` |
| 批量枚举有效 session_id | Low | Medium | session_id 使用 `crypto/rand` 生成，足够熵；Rate limit connect-config API |
| 离线破解 session 凭据 | Low | Low | 凭据使用随机 UUID，与节点密钥独立；过期后自动失效 |
| 客户端设备被当作 NAT / 路由器共享 VPN 给多设备 | Medium | Medium/High | App 原生层不提供 LAN sharing/router mode；Backend session policy + NodeAgent 聚合检测 + 限流/吊销；详见 `docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md` |

## 2. 密钥分层

```text
Layer 0 — Node long-term identity (node_secret / node_secret_hash)
  用途：NodeAgent sing-box server 身份认证
  存储：Backend DB + NodeAgent 本地文件
  传输：/internal/agent/config（mTLS / node signature）
  App：不可见

Layer 1 — NodeTransportKey (sing-box TLS/reality 公钥)
  用途：sing-box reality server_public_key / TLS 证书
  存储：Backend DB
  传输：/internal/agent/config → NodeAgent
  App：connect_config `tls.server_public_key`（公钥，非秘密）

Layer 2 — Session-bound credential (UUID / password)
  用途：App 连接 sing-box server 的临时身份
  存储：Backend 临时缓存（Redis with TTL）
  传输：connect-config API → App（TLS）
  有效期：session 生命周期（`expires_at`）

Layer 3 — App Device Token (JWT / refresh token)
  用途：App 调用 API 的身份认证
  存储：App 平台安全存储
  传输：所有 API 请求头
```

## 3. 证书链

```text
                          ┌─────────────────────────┐
                          │  Backend DB              │
                          │  - node_secret (hash)    │
                          │  - server_public_key     │
                          │  - session state         │
                          └──────┬──────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
          ┌──────────────────┐     ┌──────────────────────┐
          │   NodeAgent      │     │  Backend API         │
          │  sing-box server │     │  connect-config      │
          │  - node_secret   │     │  - session UUID      │
          │  - server_key    │     │  - server_public_key │
          │  - server config │     │  - (no node_secret)  │
          └────────┬─────────┘     └──────────┬───────────┘
                   │                          │
                   │  TLS + reality           │  TLS + JWT
                   │  + session UUID          │
                   │                          │
                   └──────────┬───────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │  App Client          │
                    │  connect_config      │
                    │  (Layer 2 + Layer 3) │
                    └──────────────────────┘
```

## 4. Session 安全

### 4.1 Session 生成

```text
session_id = base64(crypto/rand(24))  // 192-bit 随机
session_key = uuid.NewV7()            // 时间排序 + 随机
```

- session_id 用于追踪和吊销
- credentials.uuid 是 session 绑定的唯一凭据
- Backend 同时保留 `session_id → { user_id, node_id, expires_at, status }` 映射

### 4.2 Session 状态机

```text
active ──→ expired（expires_at 到达）
  │
  ├──→ revoked（管理员吊销 / 节点下线 / 用户切换）
  │
  └──→ closed（正常断开）
```

| 状态 | 说明 | 恢复方式 |
| --- | --- | --- |
| `active` | session 有效，App 可连接 | — |
| `expired` | `expires_at` 超时 | 重新请求 connect-config |
| `revoked` | 人为吊销 | 重新请求推荐 |
| `closed` | 正常断开 | 重新请求或续期 |

### 4.3 Session TTL 推荐

| 场景 | 推荐 TTL | 说明 |
| --- | --- | --- |
| 首次连接 | 15 min | 短 TTL 降低泄露风险 |
| 保持活跃 | 60 min | 持续心跳会刷新 session 有效期 |
| 峰值连接 | 2 h | 最长不超过 2 小时，需重新请求 |
| 切换节点 | 0 | 旧 session 立即吊销 |

## 5. 节点密钥与 App 凭据隔离

| 项目 | 节点长期密钥 | App session 凭据 |
| --- | --- | --- |
| 存储位置 | Backend DB + NodeAgent | Backend 临时 Redis + App 安全存储 |
| 有效期 | 无限期（人工轮换） | 分钟到小时级 |
| 泄露影响 | 节点完全暴露 | 单 session 暴露 |
| 吊销方式 | 替换 node_secret + 重启 sing-box | API 吊销 session |
| App 可见 | 不可见 | 仅 session-bound 凭据 |
| 日志输出 | 禁止 | 禁止 |

## 6. 日志与可观测性安全规则

| 规则 | 说明 |
| --- | --- |
| 禁止输出完整 `credentials.*` | 日志级别 **禁止** 写入任何 credentials 字段值 |
| 禁止输出 `server.endpoint` + `server.port` 组合 | 日志中可以单独输出 node_id，不可拼接 endpoint 和 port |
| 禁止输出 `tls.server_public_key` | 公钥非秘密但不应出现在日志中 |
| Lark 通知模板不得包含凭证字段 | 只报告 `connect_config_issued_total` 等聚合指标 |
| CI 输出不得包含 connect_config payload | 可以在 CI 日志中断言 schema_version 存在，但禁止 dump 完整 body |
| 审计日志记录 session_id 但不记录 credentials | 用于追踪吊销，不记录连接凭据原文 |

## 7. 平台安全存储要求

| 平台 | 安全存储 | connect_config 存储要求 |
| --- | --- | --- |
| iOS | Keychain (kSecClassGenericPassword) | 使用 App Group 共享 Keychain 供 NetworkExtension 读取 |
| macOS | Keychain 或 Keychain + 文件加密 | 同 iOS，使用 App Group |
| Android | EncryptedSharedPreferences / 安全存储（Android KeyStore） | VpnService 通过 Binder/Messenger 从主进程获取 |
| Windows | DPAPI（Data Protection API） | 预留 |
| Linux | libsecret / 加密文件 | 预留 |

## 8. 验收标准

- [ ] connect_config 不包含 `node_secret` / `node_secret_hash` / HMAC key
- [ ] credentials 是 session-bound，与节点长期密钥无关
- [ ] session 过期后 App 无法连接
- [ ] session 吊销后 App 收到 `CONNECT_CONFIG_SESSION_REVOKED` 错误
- [ ] 日志无 `credentials.*` 明文输出
- [ ] Lark 通知无 connect_config 敏感字段
- [ ] CI 不打印 connect_config 完整 payload
- [ ] iOS/macOS Keychain 存储测试通过
- [ ] Android EncryptedSharedPreferences 存储测试通过
- [ ] `node_secret` 只存在于 NodeAgent 和 Backend，从未进入 App 网络路径
- [ ] NAT sharing guard 不记录 raw destination IP/domain/URL、DNS 历史或 packet payload
- [ ] App native runtime 不提供 LAN-facing proxy、VPN sharing 或 router mode
- [ ] NodeAgent 仅上报 aggregate per-session counters 和 redacted risk event

## 9. 相关文档

- `docs/contracts/api/connect-config.md` — connect_config 契约
- `docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md` — NAT sharing / device-as-router abuse guard
- `docs/contracts/api/core-mvp.md` — API 索引
- `docs/contracts/data-consistency.md` — 数据一致性规则
- `docs/security/AUTH_RBAC_SECURITY_MODEL.md` — 认证授权安全模型
- `docs/app/VPN_NATIVE_RUNTIME_CONTRACT.md` — 平台原生 VPN 运行时契约
