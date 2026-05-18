# Connect Config Contract

> Backend → App 的 VPN 连接凭据契约。定义 App 连接节点所需的最小字段集合。
> 本契约不涉及 NodeAgent 持有的 `node_secret` / `node_secret_hash` / HMAC key。

## 1. 设计原则

| 原则 | 说明 |
| --- | --- |
| 最小凭据 | connect_config 只包含 App 连接所需字段，不包含节点长期密钥 |
| 会话绑定 | 每次推荐产生唯一 `session_id`，配置过期后自动失效 |
| 无节点密钥 | 禁止在 connect_config 中出现 `node_secret` / `node_secret_hash` / HMAC key |
| 平台适配 | iOS/macOS NetworkExtension 和 Android VpnService 所需字段由 App 原生层从 connect_config 转换，Backend 不感知平台差异 |
| 不可打印 | 敏感字段不得出现在日志、Lark 通知和 CI 输出中 |

## 2. 数据流

```text
Backend (保有 sing-box server 完整配置 + 节点密钥)
  │
  ├──→ NodeAgent（通过 /internal/agent/config 下发完整 sing-box server 配置）
  │        └── sing-box server 运行，使用 node_secret 验证客户端
  │
  └──→ App（通过 recommend API 获得 connect_config）
           └── native VPN layer → sing-box client config → 连接到 server
```

App 持有的 connect_config 不包含 sing-box server 侧的 `node_secret`。  
认证通过 session-bound 的临时凭据完成，该凭据与 `node_secret` 无关。

## 3. Schema

### `POST /api/v1/client/nodes/connect-config`

代替原来 recommend API 的 `recommended_nodes` 数组，或作为 recommend 后的二次请求获取具体连接配置。

- Caller：App Client（获得推荐节点后，请求该节点的连接配置）
- Auth：User JWT
- Idempotency：`request_id`

#### Request

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request_id` | string | 是 | 幂等与追踪 |
| `node_id` | uuid | 是 | 选择的节点 ID |
| `client_version` | string | 是 | App 版本 |
| `platform` | string | 是 | ios / android / macOS / windows / linux |
| `session_id` | string | 否 | 复用已有 session（续期场景） |

#### Response

```json
{
  "schema_version": "1.0",
  "config_version": 1,
  "session_id": "sess_2xK3m9Rq...",
  "expires_at": "2026-05-18T13:00:00Z",
  "server": {
    "node_id": "uuid-of-node",
    "display_name": "JP-Tokyo-01",
    "endpoint": "203.0.113.42",
    "port": 443,
    "protocol": "reality",
    "transport": "tcp"
  },
  "credentials": {
    "uuid": "user-session-bound-uuid",
    "password": null,
    "short_id": "abcd1234"
  },
  "tls": {
    "server_name": "www.cloudflare.com",
    "server_public_key": "base64-encoded-public-key",
    "alpn": ["h2", "http/1.1"],
    "utls": {
      "enabled": true,
      "fingerprint": "chrome"
    }
  },
  "multiplex": {
    "enabled": true,
    "protocol": "smux",
    "max_connections": 8,
    "min_streams": 4,
    "padding": true
  },
  "dns": {
    "servers": ["1.1.1.1", "8.8.8.8"],
    "strategy": "ipv4_only"
  },
  "routing": {
    "mode": "split",
    "exclude_networks": ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
    "block_list": ["example-blocked.com"]
  },
  "keep_alive": {
    "interval_seconds": 15,
    "idle_timeout_seconds": 300
  },
  "platform_hints": {
    "ios": {
      "app_group": "group.com.livemask.app",
      "tunnel_type": "packet-tunnel"
    },
    "android": {
      "allowed_applications": [],
      "blocked_applications": ["com.example.blocked"],
      "bypassable": true
    }
  }
}
```

### 字段说明

#### 顶层

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | 响应 schema 版本 |
| `config_version` | int | 是 | connect_config 版本（非 `node_secret` 版本） |
| `session_id` | string | 是 | 会话绑定标识，Backend 侧可吊销 |
| `expires_at` | string | 是 | ISO8601 UTC，过期后 App 必须重新请求 |
| `server` | object | 是 | 节点服务端信息 |
| `credentials` | object | 否 | 连接凭据（协议相关，某些协议无独立 credential） |
| `tls` | object | 否 | TLS/XTLS 配置（reality 协议必填） |
| `multiplex` | object | 否 | 多路复用配置 |
| `dns` | object | 否 | DNS 配置 |
| `routing` | object | 否 | 路由策略 |
| `keep_alive` | object | 否 | 保活配置 |
| `platform_hints` | object | 否 | 各平台适配 Hint，App 原生层读取 |

#### `server`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `node_id` | uuid | 是 | 节点 ID |
| `display_name` | string | 是 | 用户可见名称 |
| `endpoint` | string | 是 | IP 或域名 |
| `port` | int | 是 | 端口 |
| `protocol` | string | 是 | reality / hysteria2 / shadowsocks / vless / vmess / naive / wireguard / trojan / tuic |
| `transport` | string | 否 | tcp / kcp / websocket / grpc / quic |
| `reserved` | int[] | 否 | sing-box `reserved` 字段 |

#### `credentials`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `uuid` | string | 否 | sing-box UUID（vless/reality/trojan 等） |
| `password` | string | 否 | 协议密码（shadowsocks/tuic/hysteria2 等） |
| `short_id` | string | 否 | reality `short_id` |

**安全约束**：`credentials` 中的值必须是 session-bound 的临时凭据，与节点长期密钥无关。

#### `tls`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `server_name` | string | 是 | TLS SNI / reality server_name |
| `server_public_key` | string | 否 | reality `server_public_key`，base64 |
| `alpn` | string[] | 否 | ALPN 列表 |
| `utls` | object | 否 | uTLS 指纹伪装 |

#### `routing`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `mode` | string | 是 | `full` / `split` / `direct` |
| `exclude_networks` | string[] | 否 | 排除的私有网段（`split` 模式） |
| `include_networks` | string[] | 否 | 包含的网段 |
| `block_list` | string[] | 否 | 域名/IP 屏蔽列表 |
| `dns_strategy` | string | 否 | `ipv4_only` / `ipv6_only` / `prefer_ipv4` / `prefer_ipv6` |

#### `platform_hints`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `ios` | object | 否 | iOS/macOS NetworkExtension 提示 |
| `android` | object | 否 | Android VpnService 提示 |
| `windows` | object | 否 | Windows 预留 |
| `linux` | object | 否 | Linux 预留 |

`ios` 子字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `app_group` | string | 是 | App Group identifier，用于 NetworkExtension 共享配置 |
| `tunnel_type` | string | 是 | `packet-tunnel` / `proxy` |

`android` 子字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `allowed_applications` | string[] | 否 | 允许走 VPN 的 App 包名 |
| `blocked_applications` | string[] | 否 | 禁止走 VPN 的 App 包名 |
| `bypassable` | bool | 是 | 是否允许用户绕过 VPN |

## 4. 协议映射表

connect_config 与 sing-box 客户端配置的字段映射关系（App 原生层负责转换）：

| connect_config | sing-box client outbound | 说明 |
| --- | --- | --- |
| `server.endpoint` | `server` | 必须 |
| `server.port` | `server_port` | 必须 |
| `server.protocol` | `type` | 决定使用哪个 outbound 类型 |
| `server.transport` | `transport.type` | transport 层 |
| `credentials.uuid` | `uuid` | vless/vmess/reality |
| `credentials.password` | `password` | shadowsocks/hysteria2/tuic |
| `credentials.short_id` | `short_id` | reality |
| `tls.server_name` | `tls.server_name` | SNI |
| `tls.server_public_key` | `tls.reality.public_key` | reality |
| `tls.utls.enabled` | `tls.utls.enabled` | uTLS |

## 5. 安全边界

| 边界 | 控制措施 |
| --- | --- |
| 凭据泄露 | session_id 和凭据有 `expires_at`，Backend 可主动吊销 session |
| 节点密钥泄露 | `node_secret` 只存在于 NodeAgent 和 Backend，不在 connect_config 中 |
| 重放攻击 | connect_config 与 session_id 绑定，Backend 可校验 session 的有效性 |
| 日志泄露 | `server.endpoint`、`credentials.*`、`tls.server_public_key` 等字段不得出现在日志、Lark 通知和 CI 输出中 |

## 6. 配置生命周期

```text
App 请求推荐
  → Backend 返回推荐列表（不含 connect_config）
  → App 选择节点，请求 connect-config API
  → Backend 生成 session-bound connect_config
  → App 连接并缓存 connect_config（加密本地存储）
  → connects
  → connect_config 过期 / 断开 / 用户切换节点 → session 失效 → 重新请求
```

| 事件 | connect_config 行为 |
| --- | --- |
| 正常断开 | session 标记为 closed，connect_config 失效 |
| 超时 | `expires_at` 后 session 失效，App 必须刷新 |
| 切换节点 | 旧 session 吊销，生成新 connect_config |
| 管理员吊销 | Backend 标记 session 为 revoked，App 下次请求失败 |
| 节点下线 | 关联的所有 session 自动作废，App 收到 fallback |
| App 更新 | `client_version` 变化可能触发 connect_config schema 升级 |

## 7. 相关事件

参见 `docs/contracts/events/core-events.md`：

- `config.published` — 配置版本变化影响 connect_config schema
- `node.status_reported` — 节点状态变化影响 connect_config 的可用性

## 8. 可观测性

| 指标 | 说明 | 是否含敏感字段 |
| --- | --- | --- |
| `connect_config_issued_total` | 下发次数 | 否 |
| `connect_config_expired_total` | 过期次数 | 否 |
| `connect_config_revoked_total` | 吊销次数 | 否 |
| `connect_config_session_active` | 当前活跃 session 数 | 否 |
| `session_bound_credential_issued_total` | session 凭据下发次数 | 否 |

所有日志级别不得输出 `credentials.*`、`tls.server_public_key`、`server.endpoint` + `server.port` 的完整组合。
