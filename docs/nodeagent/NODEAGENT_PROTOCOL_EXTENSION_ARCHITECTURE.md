# NodeAgent Multi-Protocol Extension Architecture

> 本文定义 NodeAgent 的多协议模块化架构，使协议扩展不硬改 renderer、runtime manager 或 health checker。
> 每个协议作为一个 ProtocolProfile 插件注册，由 Renderer dispatcher 根据 protocol 字段路由。

## 1. 当前能力状态

### 已实现

| 能力 | 说明 |
| --- | --- |
| sing-box runtime lifecycle | 启动、停止、重启 sing-box 进程，监控进程状态 |
| basic mixed/socks/tun skeleton | 基本 mixed/socks 入站和 TUN 设备骨架 |
| DNS/route/bypass LAN skeleton | DNS 配置、路由规则、绕过局域网骨架 |
| endpoint report | 上报 public endpoint、listen port、协议类型到 Backend |
| public probe / endpoint_ready | 探测公网可达性并标记节点就绪 |
| degraded_reason | 降级原因上报（process_crashed、config_apply_failed、health_check_failed） |

### 未实现

| 能力 | 说明 |
| --- | --- |
| hysteria2 real inbound/outbound | Hysteria2 协议真实入站/出站配置 |
| vless reality | VLESS + Reality 协议 |
| trojan | Trojan 协议 |
| shadowtls | ShadowTLS 协议 |
| wireguard | WireGuard 协议 |
| protocol-level handshake health | 协议级握手健康检查 |
| credential rotation | 凭据轮换（非重启切换凭据） |
| per-session ephemeral credentials | 单 session 临时凭据（与 Backend connect_config 对应） |

## 2. 架构总览

```text
NodeAgent
├── ConfigManager          ← 拉取 /internal/agent/config，管理 config version/hash
├── Renderer               ← 将 NodeAgent 内部配置转换为 sing-box JSON（含 ProtocolProfile dispatcher）
│   └── ProtocolProfile    ← 插件接口，每个协议一个实现
│       ├── mixed_profile
│       ├── hysteria2_profile  (future)
│       ├── vless_reality_profile (future)
│       ├── trojan_profile      (future)
│       └── wireguard_profile   (future)
├── RuntimeManager         ← sing-box 进程生命周期管理
├── HealthChecker          ← 定时健康检查，调用 ProtocolProfile.HealthChecks()
├── Reporter               ← 端点上报、心跳、degraded_reason
├── PublicProber           ← 公网可达性探测
└── ConfigValidator        ← 配置校验，调用 ProtocolProfile.Validate()
```

## 3. ProtocolProfile 插件接口

每个协议实现以下接口，由 Renderer 的 `Render()` 和 HealthChecker 的 `Check()` 统一调度。

```go
type ProtocolProfile interface {
    // Name 返回协议标识，如 "hysteria2", "vless", "trojan"
    Name() string

    // Validate 校验协议配置的完整性（端口、凭据、TLS 等）
    Validate(config *ProtocolConfig) error

    // Render 将协议配置渲染为 sing-box JSON fragment
    // 返回的 map 将被合并到最终 sing-box config 的 inbounds 数组
    Render(config *ProtocolConfig) (map[string]any, error)

    // Endpoint 返回该协议的公开端点元数据（协议、端口、server_name 等）
    Endpoint(config *ProtocolConfig) (*PublicEndpoint, error)

    // HealthChecks 返回该协议的健康检查列表
    // 每个 HealthCheck 包含检查名称、检查函数（error 表示不健康）
    HealthChecks(config *ProtocolConfig) []HealthCheck

    // SecretRefs 返回该协议引用的所有密钥引用
    // 用于启动前确认密钥就绪和日志 redaction
    SecretRefs(config *ProtocolConfig) []SecretRef

    // Redact 对协议配置中的敏感字段做脱敏处理
    // 用于日志输出和错误报告
    Redact(config *ProtocolConfig) *ProtocolConfig

    // SupportsClientConfig 标识该协议是否可以生成 App 侧 connect_config
    SupportsClientConfig() bool
}
```

## 4. ProtocolConfig 模型

```go
type ProtocolConfig struct {
    Profile        string            // 协议标识：mixed / hysteria2 / vless / trojan / shadowtls / wireguard
    Transport      string            // 传输层：tcp / quic / websocket / grpc / kcp
    Listen         string            // 监听地址：0.0.0.0:443
    PublicEndpoint *PublicEndpoint    // 公网端点（端口、IP、协议、server_name）
    TLS            *TLSConfig        // TLS / Reality / uTLS 配置
    DNS            *DNSConfig        // DNS 配置
    Route          *RouteConfig      // 路由规则（bypass LAN、block list）
    Secrets        map[string]string // 密钥映射表（source 在 SecretRefs 中定义）
    Health         *HealthConfig     // 健康检测间隔、阈值
    Users          []UserConfig      // 用户/凭据列表（含 session-bound credentials）
}

type TLSConfig struct {
    Enabled         bool
    ServerName      string   // SNI / reality server_name
    ServerPublicKey string   // reality server_public_key
    ALPN            []string
    UTLS            *UTLSConfig
}

type PublicEndpoint struct {
    Protocol    string
    Host        string
    Port        int
    ServerName  string
    Transport   string
}

type UserConfig struct {
    UUID     string   // sing-box UUID / 临时凭据
    Password string   // 协议密码（可 session-bound）
    ShortID  string   // reality short_id
    Ephemeral bool    // 是否 session 临时凭据
}

type HealthConfig struct {
    IntervalSeconds int
    TimeoutSeconds  int
    MaxRetries      int
}

type HealthCheck struct {
    Name   string
    Check  func() error    // 返回 nil 表示健康，否则表示失败
    Timeout time.Duration
}
```

## 5. SecretRef / SecretSource / Redaction 规则

### SecretRef

```go
type SecretRef struct {
    Name          string        // 密钥名称，如 "hysteria2.obfs.password"
    Source        SecretSource  // 密钥来源
    Required      bool          // 是否必须
    RotatePolicy  RotatePolicy  // 轮换策略
    RedactionKey  string        // 脱敏标记键（用于 Redact 方法定位）
}

type SecretSource string

const (
    SecretSourceEnv          SecretSource = "env"            // 环境变量
    SecretSourceFile         SecretSource = "file"           // 本地文件
    SecretSourceBackend      SecretSource = "backend"        // Backend API 下发
    SecretSourceLocalGen     SecretSource = "local_generated" // 本地生成（如 WireGuard key pair）
)

type RotatePolicy string

const (
    RotatePolicyNever   RotatePolicy = "never"
    RotatePolicyDaily   RotatePolicy = "daily"
    RotatePolicyWeekly  RotatePolicy = "weekly"
    RotatePolicyOnDemand RotatePolicy = "on_demand"  // Backend 触发轮换
)
```

### Redaction 规则

```go
func (p *ProtocolConfig) Redact() *ProtocolConfig {
    // 深拷贝后脱敏
    redacted := p.DeepCopy()
    for ref := range p.SecretRefs() {
        switch ref.RedactionKey {
        case "password", "private_key", "psk", "secret":
            // 替换为 "***"
        case "uuid":
            // 保留前 8 位 + "***"
        case "server_public_key":
            // 保留前 12 位 + "***"
        }
    }
    return redacted
}
```

### 安全规则

| 规则 | 说明 |
| --- | --- |
| 不在日志打印 secrets | 日志输出必须使用 `Redact()` 后的配置 |
| 不在 Lark/CI 输出 secrets | Lark 通知模板不含明文密钥，CI 不 dump 完整 payload |
| 不把 node_secret/HMAC/private_key 混入 connect_config | connect_config 只拿最小必要临时凭据 |
| App connect_config 只拿最小必要临时凭据 | `credentials` 中只有 session-bound UUID/password |
| 所有协议配置必须支持 redaction | 每个 ProtocolProfile 必须实现 `Redact()` |

## 6. Renderer Dispatch 机制

```text
Renderer.Render(nodeConfig *NodeConfig) -> map[string]any (sing-box JSON)
  │
  ├── 1. 读取 nodeConfig.Inbounds[]
  │
  ├── 2. 对每个 inbound:
  │      ├── profile = registry.Get(inbound.Protocol)
  │      ├── protocolConfig = ProtocolConfig{Profile: inbound.Protocol, ...}
  │      ├── err = profile.Validate(protocolConfig)
  │      └── fragment = profile.Render(protocolConfig)
  │
  ├── 3. 合并所有 fragment 到 finalConfig["inbounds"]
  │
  ├── 4. 附加全局配置（DNS、Route、TUN、log level）
  │
  └── 5. 返回最终 sing-box JSON
```

关键设计：

- `Renderer` 不感知具体协议字段，全部委托 `ProtocolProfile.Render()`
- 新增协议只需注册新的 `ProtocolProfile`，不修改 `Renderer.Render()`
- `ProtocolProfile.Render()` 返回的是 sing-box JSON fragment（`map[string]any`），由 Renderer 合并到最终配置
- `Validate()` 在 Render 前执行，配置错误在启动前阻断

## 7. HealthCheck Hook

HealthChecker 按以下流程工作：

```text
HealthChecker.Run()
  │
  ├── 遍历所有 inbounds
  │
  ├── profile = registry.Get(inbound.Protocol)
  │
  ├── checks = profile.HealthChecks(protocolConfig)
  │
  ├── 并行执行 checks（每个 check 独立超时）
  │      ├── 全部成功 → inbound 健康
  │      ├── 部分失败 → inbound degraded，记录 degraded_reason
  │      └── 全部失败 → inbound 不健康，触发降级或重启
  │
  └── 汇总结果 → Reporter.degraded_reason / endpoint_ready 更新
```

协议级 health check 示例：

| 协议 | HealthCheck 名称 | 检测方式 |
| --- | --- | --- |
| hysteria2 | `udp_connectivity` | UDP 回显或 stun 探测 |
| vless reality | `tls_handshake` | TLS 握手 + reality 认证 |
| trojan | `tcp_connect` | TCP 建连 + Trojan 协议握手 |
| wireguard | `wg_handshake` | WireGuard 最新握手时间 |
| mixed/socks | `tcp_listen` | 监听端口可访问 |

## 8. Public Endpoint Metadata Hook

PublicProber 调用 `ProtocolProfile.Endpoint()` 获取端点元数据：

```go
type PublicEndpoint struct {
    Protocol   string `json:"protocol"`
    Host       string `json:"host"`
    Port       int    `json:"port"`
    ServerName string `json:"server_name,omitempty"`
    Transport  string `json:"transport,omitempty"`
}
```

PublicProber 将 `PublicEndpoint` 通过 Reporter 上报到 Backend，用于：

- 推荐引擎的节点可用性判断
- Admin 节点状态展示
- Connect-config API 的 `server` 字段来源
- 节点下线自动标记

## 9. Backend connect_config 与 NodeAgent Profile 的对应关系

| Backend connect_config | NodeAgent ProtocolProfile | 说明 |
| --- | --- | --- |
| `server.protocol` | `Name()` | 选择使用哪个 profile |
| `server.endpoint:port` | `Endpoint().Host:Port` | Public endpoint 来源 |
| `server.transport` | `Transport` | 传输层协议 |
| `credentials.uuid` | `Users[].UUID` | session-bound 用户 ID |
| `credentials.password` | `Users[].Password` | 协议密码 |
| `credentials.short_id` | `Users[].ShortID` | reality short_id |
| `tls.server_name` | `TLS.ServerName` | SNI 值 |
| `tls.server_public_key` | `TLS.ServerPublicKey` | reality public key |

NodeAgent 侧 `Users` 列表包含多个用户的凭据（含 session-bound + 长期凭据），Backend 通过 connect-config API 只下发当前 session 的凭据。

## 10. Credential 生命周期

```text
Backend 生成 session-bound credential
  → 存储到 Redis（session_id → credential，含 TTL）
  → connect-config API 下发到 App
  → NodeAgent /internal/agent/config 下发的 Users 列表包含该 credential
  → sing-box server 认证连接
  → session 过期/吊销 → credential 从 Redis 删除
  → NodeAgent 下次拉取 config 时 Users 列表移除已过期 credential
```

凭据类型对比：

| 类型 | 生命周期 | 存储位置 | 下发给 App |
| --- | --- | --- | --- |
| 节点长期 UUID | 永久（人工轮换） | Backend DB + NodeAgent | 否 |
| Session-bound UUID | 分钟~小时级 | Backend Redis + NodeAgent | 是 |
| 节点临时密码 | 小时~天级 | Backend DB + NodeAgent | 根据协议决定 |

## 11. 后续协议扩展路线图

| Step | TASK | 交付物 | 依赖 |
| --- | --- | --- | --- |
| 1 | TASK-NODEAGENT-PROTOCOL-001 | ProtocolProfile 接口定义 + Renderer dispatcher + Registry + SecretRef 框架 | 本文 |
| 2 | TASK-NODEAGENT-HYSTERIA2-001 | hysteria2 Profile 实现 + HealthCheck + Endpoint + Redact | Step 1 |
| 3 | TASK-BACKEND-CONNECT-CONFIG-002 | Backend 端 hysteria2 connect_config 生成 + session credential 管理 | Step 2 + VPN-CONFIG-001 |
| 4 | TASK-APP-ANDROID-ENGINE-002 | Android 端 hysteria2 客户端配置转换 + VpnService 适配 | Step 3 |
| 5 | TASK-APP-IOS-PACKET-TUNNEL-002 | iOS/macOS PacketTunnelProvider hysteria2 适配 | Step 3 |
| 6 | TASK-NODEAGENT-VLESS-001 | VLESS + Reality Profile | Step 1 |
| 7 | TASK-NODEAGENT-TROJAN-001 | Trojan Profile | Step 1 |
| 8 | TASK-NODEAGENT-SHADOWTLS-001 | ShadowTLS Profile | Step 1 |
| 9 | TASK-NODEAGENT-WIREGUARD-001 | WireGuard Profile | Step 1 |

## 12. 风险

| 风险 | 影响 | 缓解措施 |
| --- | --- | --- |
| ProtocolProfile 接口初期不稳定，新增协议时需要回溯修改接口 | Step 1 延迟、Step 2 重做 | Step 1 先定义最小接口，两个参考实现（mixed + hysteria2）后再冻结 |
| 多 profile 健康检查并发导致 sing-box 进程竞争 | 健康检查误报 | HealthCheck 使用单独 goroutine pool，不与 sing-box 共享资源 |
| Credential 轮换期间新旧 credential 同时存在 | 短时间窗口内旧凭据仍可连接 | 轮换时保留旧 credential 1 个 TTL 窗口，过期间歇性去重 |
| App 端协议适配滞后 | 新协议部署后 App 无法连接 | 每个协议上线前必须先完成 App 端 connect_config 消费 |
