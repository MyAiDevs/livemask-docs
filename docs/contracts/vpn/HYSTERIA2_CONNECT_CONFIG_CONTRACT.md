# Hysteria2 Connect Config 跨仓库契约

> 本文定义 Hysteria2 协议在 NodeAgent / Backend / App / Admin / CI 之间的字段边界、安全边界和后续任务。
> 作为第一个真实扩展协议，Hysteria2 将验证 ProtocolProfile 插件接口的完备性。

## 1. Protocol Profile Naming

### 合法 profile 列表

| profile | 状态 | 说明 |
| --- | --- | --- |
| `singbox` | 已实现 | sing-box 原生 multi-protocol 模式 |
| `mixed` | 已实现 | mixed 入站协议 |
| `socks` | 已实现 | SOCKS5 入站协议 |
| `tun` | 已实现 | TUN 设备 |
| `hysteria2` | **首个真实扩展协议** | Hysteria2 协议（本文契约范围） |
| `vless_reality` | reserved | VLESS + Reality，尚未进入实现阶段 |
| `trojan` | reserved | Trojan 协议，尚未进入实现阶段 |
| `shadowtls` | reserved | ShadowTLS 协议，尚未进入实现阶段 |
| `wireguard` | reserved | WireGuard 协议，尚未进入实现阶段 |

### 命名规则

- `protocol_profile` 字段只使用上述合法值。
- `transport`（tcp / quic / websocket / grpc / kcp）与 `protocol_profile` 分离，独立配置。
- `tcp_udp` 不是合法 `protocol_profile`。

## 2. Node Endpoint Metadata

### `connect_node_endpoints` 字段定义

NodeAgent 通过 Reporter 上报的端点元数据，Backend 接收并写入 `connect_node_endpoints` 表。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `node_id` | uuid | 是 | 节点 ID |
| `public_endpoint_host` | string | 是 | 公网可达 IP 或域名 |
| `public_endpoint_port` | int | 是 | 公网监听端口 |
| `transport` | string | 否 | 传输层协议：tcp / quic / websocket / grpc / kcp |
| `sni` | string | 否 | TLS SNI 值 |
| `alpn` | string[] | 否 | ALPN 协议列表 |
| `protocol_profile` | string | 是 | 协议标识，必须为合法 profile 之一 |
| `profile_config` | jsonb | 否 | 协议特定配置（见下方安全字段定义） |
| `enabled` | bool | 是 | 是否启用 |
| `updated_at` | timestamp | 是 | 最后更新时间 |

### `profile_config` hysteria2 安全字段

#### 可下发的安全字段（允许 Backend → NodeAgent）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `up_mbps` | int | 上行带宽 Mbps（可选，用于 sing-box 流控） |
| `down_mbps` | int | 下行带宽 Mbps |
| `hop_ports` | string | 端口跳跃范围，如 "100-200,300-400" |
| `obfs_type` | string | 混淆类型（salamander / none） |
| `port` | int | 监听端口（与 public_endpoint_port 一致，冗余字段） |

#### 禁止下发的字段（永不可含在 `profile_config` 中）

以下字段不得以明文形式出现在 `profile_config`、`connect_config` 响应、日志或 Admin 界面中：

| 字段 | 说明 |
| --- | --- |
| `auth` | Hysteria2 认证字符串 |
| `auth_payload` | 认证负载 |
| `obfs_password` | 混淆密码 |
| `private_key` | 服务端私钥 |
| `secret_key` | 通用密钥 |
| `node_secret` | 节点长期密钥 |
| `node_secret_hash` | 节点密钥哈希 |
| `hmac` | HMAC 密钥 |
| `token` | 认证 Token |
| `password` | 密码 |

> 这些 secrets 存储在 Backend DB 和 NodeAgent 本地安全存储中，不进入 App、Admin 或日志。

## 3. Backend connect_config Response

### 正常 Hysteria2 响应示例

```json
{
  "config_version": 1,
  "session_id": "sess_h2_2xK3m9Rq...",
  "expires_at": "2026-05-18T15:00:00Z",
  "profile_type": "hysteria2",
  "server": {
    "node_id": "uuid-of-node",
    "endpoint": "203.0.113.42",
    "port": 443,
    "transport": "quic",
    "sni": "cdn.example.com",
    "alpn": ["h3"]
  },
  "client": {
    "protocol": "hysteria2",
    "hysteria2": {
      "up_mbps": 100,
      "down_mbps": 500,
      "hop_ports": null,
      "obfs_type": "salamander",
      "port": 443
    }
  },
  "is_skeleton": false
}
```

**说明**:

- `profile_type` 固定为 `"hysteria2"`，App 据此选择解析逻辑。
- `server.endpoint` / `port` / `transport` / `sni` / `alpn` 来自 `connect_node_endpoints` 元数据。
- `client.hysteria2` 包含会话安全的字段（无 `auth`、`obfs_password` 等）。
- `client.protocol` 为 `"hysteria2"`，用于驱动 App 原生引擎选择。
- `is_skeleton` 为 `false` 表示这是一个真实可连接的配置。

### Skeleton Fallback 示例

当 Backend 无法返回真实 Hysteria2 配置时（如引擎未就绪、节点未就绪），返回 skeleton 占位：

```json
{
  "config_version": 1,
  "session_id": "sess_skeleton_xxxx",
  "expires_at": "2026-05-18T15:00:00Z",
  "profile_type": "hysteria2",
  "server": {
    "node_id": "uuid-of-node",
    "endpoint": "mvp-not-issued",
    "port": 0,
    "transport": "",
    "sni": "",
    "alpn": []
  },
  "client": {
    "protocol": "mvp",
    "hysteria2": {}
  },
  "is_skeleton": true
}
```

**说明**:

- `is_skeleton=true` 通知 App 该配置不可用于真实连接。
- `endpoint` 为固定字符串 `"mvp-not-issued"`，端口为 `0`。
- `client.protocol` 为 `"mvp"`，App 据此展示 "工程 pending" 状态。
- skeleton 用于 MVP 阶段纯链路验证，不触发任何 native tunnel。

## 4. Secret Lifecycle

### 核心原则

```
Backend DB (node_secret, auth, private_key, obfs_password, etc.)
  │
  ├──→ NodeAgent (通过 /internal/agent/config 获取长期 secrets)
  │       └── sing-box server 使用 local secrets
  │       └── 日志/状态上报使用 Redact() 脱敏
  │
  └──╌╌ (不进入) ╌╌→ App connect_config
                     └── App session config 只拿 session-bound 安全字段
                     └── Hysteria2 auth / obfs_password 不在 connect_config 中
```

### 五条安全边界

| # | 边界 | 控制措施 |
| --- | --- | --- |
| 1 | **NodeAgent 长期 secrets 不进入 App** | `node_secret`、`private_key`、`obfs_password` 等只在 NodeAgent 和 Backend 之间传递 |
| 2 | **Backend 不把 node_secret/HMAC/private_key 发给 App** | connect_config 响应中的 `client.hysteria2` 字段只包含 ups/downs/obfs_type 等非敏感字段 |
| 3 | **App session config 只拿 session-bound 安全字段** | Hysteria2 的 `auth`/`obfs_password` 后续走 `SecretRef` / session credential 设计，不作为明文下发 |
| 4 | **Admin 只能看 metadata，不能看 secret 明文** | Admin endpoint editor 只编辑 `profile_config` 中的非敏感字段（up_mbps / down_mbps / hop_ports / obfs_type / port），secret 字段永不展示 |
| 5 | **Logs/audit/status 不可打印 secret** | 所有日志输出必须通过 `Redact()` 脱敏，CI 不 dump 完整 payload，Lark 通知不含明文密钥 |

### 后续 Secret 架构

Hysteria2 的 `auth`（认证密码）和 `obfs_password`（混淆密码）后续必须走以下设计之一：

1. **SecretRef 模型**：NodeAgent 侧通过 SecretSource（env / file / backend）引用，不在配置字段中明文传递。
2. **Session credential**：Backend 为每个 session 生成临时认证凭据，随 connect_config 下发但加密传输。

在 SecretRef / session credential 就绪前，Hysteria2 `auth` 和 `obfs_password` 仅作为 NodeAgent 静态配置存在，不下发到 App。

## 5. Repo Responsibilities

### livemask-nodeagent

| 职责 | 说明 |
| --- | --- |
| ProtocolProfile hysteria2 实现 | `Render()` / `Validate()` / `HealthCheck()` / `Endpoint()` |
| secret redaction | `Redact()` 脱敏 `auth`、`obfs_password`、`private_key` 等 |
| endpoint metadata 上报 | 通过 Reporter 上报 `connect_node_endpoints` 记录 |
| 无 if/else 蔓延 | hysteria2 通过 ProtocolProfile 插件注册，Renderer dispatcher 不感知具体协议字段 |

相关 TASK: `TASK-NODEAGENT-HYSTERIA2-001`

### livemask-backend

| 职责 | 说明 |
| --- | --- |
| connect_config profile dispatch | 根据 `protocol_profile` 分发到对应 profile handler，hysteria2 走独立分支 |
| profile_config whitelist | 下发给 NodeAgent 的 `profile_config` 必须通过字段白名单过滤（只包含安全字段） |
| 不响应 secret | connect_config 响应中不包含 `node_secret` / `auth` / `obfs_password` 等 |
| warnings / fallback | 当 hysteria2 引擎未就绪时返回 skeleton fallback |

相关 TASK: `TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001`

### livemask-admin

| 职责 | 说明 |
| --- | --- |
| endpoint editor | Admin 可编辑 `connect_node_endpoints` 记录中的 hysteria2 字段 |
| profile_config safe fields | 编辑器只展示/编辑安全字段：`up_mbps`、`down_mbps`、`hop_ports`、`obfs_type`、`port` |
| 不展示/编辑 secret | `auth`、`obfs_password`、`private_key` 等不在 Admin 任何界面中出现 |

相关 TASK: `TASK-ADMIN-ENDPOINT-002`

### livemask-app

| 职责 | 说明 |
| --- | --- |
| 解析 `profile_type=hysteria2` | App 根据 `profile_type` 选择解析路径 |
| display engine pending | 当 `is_skeleton=true` 或 `client.protocol=mvp` 时，展示 "工程 pending" 提示 |
| 不连接直到 native engine 存在 | Android VpnService / iOS PacketTunnelProvider 完成 hysteria2 适配前不发起连接 |
| 不解析 secret | App 不解析 `auth`、`obfs_password` 等敏感字段 |

相关 TASK: `TASK-APP-CONNECT-PROFILE-001`、`TASK-APP-ANDROID-ENGINE-HYSTERIA2-001`、`TASK-APP-IOS-PACKET-TUNNEL-HYSTERIA2-001`

### livemask-ci-cd

| 职责 | 说明 |
| --- | --- |
| 端点注册 → connect_config hysteria2 smoke | 端到端验证 endpoint registration → connect_config 返回 hysteria2 profile |
| 不执行真实 tunnel smoke | 直到 native engine 存在前，smoke 只验证 API 契约不验证实际连接 |

相关 TASK: `TASK-CICD-PROTOCOL-SMOKE-001`

## 6. Task Roadmap

| # | Task | 目标 | Owner | 依赖 |
| --- | --- | --- | --- | --- |
| 1 | `TASK-NODEAGENT-HYSTERIA2-001` | 实现 hysteria2 ProtocolProfile（Render / Validate / HealthCheck / Endpoint / Redact） | NodeAgent | TASK-NODEAGENT-PROTOCOL-001 |
| 2 | `TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001` | Backend 端 hysteria2 connect_config 生成 + profile dispatch + skeleton fallback | Backend | TASK-NODEAGENT-HYSTERIA2-001 + TASK-VPN-CONFIG-001 |
| 3 | `TASK-ADMIN-ENDPOINT-002` | Admin endpoint editor hysteria2 字段支持（安全字段白名单） | Admin | TASK-NODEAGENT-HYSTERIA2-001 |
| 4 | `TASK-APP-CONNECT-PROFILE-001` | App 端解析 `profile_type=hysteria2` + skeleton 占位态展示 | App | TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 |
| 5 | `TASK-CICD-PROTOCOL-SMOKE-001` | CI smoke 验证 endpoint registration → connect_config hysteria2 | DevOps | TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 |
| 6 | `TASK-APP-ANDROID-ENGINE-HYSTERIA2-001` | Android VpnService hysteria2 原生引擎集成 | App | TASK-APP-CONNECT-PROFILE-001 |
| 7 | `TASK-APP-IOS-PACKET-TUNNEL-HYSTERIA2-001` | iOS/macOS PacketTunnelProvider hysteria2 适配 | App | TASK-APP-CONNECT-PROFILE-001 |

## 7. Validation Matrix

| 验证项 | NodeAgent | Backend | Admin | App | CI | 通过标准 |
| --- | --- | --- | --- | --- | --- | --- |
| endpoint metadata 注册 | 上报 hysteria2 端点 | 接收并存储 | 可见 | — | validate API | `connect_node_endpoints` 包含正确的 protocol_profile=hysteria2 |
| connect_config skeleton | — | 返回 is_skeleton=true | — | 正确展示 pending | validate response | 响应格式符合 skeleton 示例，endpoint 为 "mvp-not-issued" |
| connect_config real hysteria2 | — | 返回 profile_type=hysteria2 | — | 正确解析字段 | validate response | 响应格式符合正常示例，is_skeleton=false |
| 无 secret 泄露 | Redact() 覆盖全部敏感字段 | 响应不含 auth/obfs_password | 不展示/编辑 secret | 不解析 secret | grep secret fields | 所有输出（日志/响应/Admin 页面）不含禁止字段 |
| App 解析 | — | — | — | 识别 profile_type | mock connect_config | App 能正确区分 normal / skeleton / unknown profile |
| Admin 编辑 | — | — | 编辑 safe fields | — | validate editor | Admin 只展示 up_mbps/down_mbps/hop_ports/obfs_type/port |
| CI smoke | — | hysteria2 connect_config 返回 | — | — | smoke 测试 | 端点注册 → connect_config 返回预期 profile_type |
| native tunnel pending | — | — | — | 不发起连接 | — | App 在 native engine 缺失时不连接，仅显示 pending |

## 8. 变更日志

| 日期 | 变更 | 作者 |
| --- | --- | --- |
| 2026-05-18 | 初始版本 | TASK-DOC-HYSTERIA2-CONTRACT-001 |
