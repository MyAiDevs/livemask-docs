# Protocol Profile Development Guide

> NodeAgent 协议插件（ProtocolProfile）开发指南。每个新协议作为一个独立的 profile 实现，注册到 Profile Registry 后即可被 Renderer、HealthChecker、PublicProber 调用。

## 1. 文件组织

每个 profile 位于 `internal/protocol/<name>/` 目录下：

```text
internal/protocol/
├── registry.go              // 全局 Registry，profile 注册和查找
├── profile.go               // ProtocolProfile 接口定义
├── config.go                // ProtocolConfig 模型
├── secret.go                // SecretRef / SecretSource 定义
├── mixed/                   // mixed 协议参考实现
│   ├── profile.go
│   ├── validate.go
│   ├── render.go
│   ├── endpoint.go
│   ├── health.go
│   ├── secrets.go
│   └── redact.go
├── hysteria2/               // hysteria2 实现（future）
│   └── ...
├── vless/                   // vless + reality 实现（future）
│   └── ...
└── trojan/                  // trojan 实现（future）
    └── ...
```

## 2. 实现步骤

### Step 1: 定义 Profile 结构体

```go
package myprotocol

type Profile struct {
    // 协议专用配置，与 ProtocolConfig 配合使用
}

func NewProfile() protocol.ProtocolProfile {
    return &Profile{}
}
```

### Step 2: 实现 Validate()

检验协议的必须字段是否完备。示例：

```go
func (p *Profile) Validate(config *protocol.ProtocolConfig) error {
    if config.Listen == "" {
        return errors.New("myprotocol: listen address required")
    }
    if len(config.Users) == 0 {
        return errors.New("myprotocol: at least one user required")
    }
    for _, u := range config.Users {
        if u.Password == "" {
            return errors.New("myprotocol: user password required")
        }
    }
    return nil
}
```

### Step 3: 实现 Render()

将 ProtocolConfig 转换为 sing-box inbound JSON fragment。

```go
func (p *Profile) Render(config *protocol.ProtocolConfig) (map[string]any, error) {
    inbound := map[string]any{
        "type":       config.Profile,
        "listen":     config.Listen,
        "listen_port": config.PublicEndpoint.Port,
        "users":      p.renderUsers(config.Users),
    }
    if config.TLS != nil {
        inbound["tls"] = p.renderTLS(config.TLS)
    }
    return inbound, nil
}
```

### Step 4: 实现 SecretRefs()

声明该协议引用的所有密钥来源：

```go
func (p *Profile) SecretRefs(config *protocol.ProtocolConfig) []protocol.SecretRef {
    return []protocol.SecretRef{
        {
            Name:         "myprotocol.password",
            Source:       protocol.SecretSourceBackend,
            Required:     true,
            RotatePolicy: protocol.RotatePolicyDaily,
            RedactionKey: "password",
        },
    }
}
```

### Step 5: 实现 Redact()

对协议配置脱敏，供日志输出使用：

```go
func (p *Profile) Redact(config *protocol.ProtocolConfig) *protocol.ProtocolConfig {
    redacted := config.DeepCopy()
    for i := range redacted.Users {
        if redacted.Users[i].Password != "" {
            redacted.Users[i].Password = "***"
        }
    }
    return redacted
}
```

### Step 6: 实现 HealthChecks()

```go
func (p *Profile) HealthChecks(config *protocol.ProtocolConfig) []protocol.HealthCheck {
    return []protocol.HealthCheck{
        {
            Name: "tcp_connect",
            Check: func() error {
                // TCP 建连验证
                return nil // 或 error
            },
            Timeout: 5 * time.Second,
        },
        {
            Name: "protocol_handshake",
            Check: func() error {
                // 协议级握手
                return nil
            },
            Timeout: 10 * time.Second,
        },
    }
}
```

### Step 7: 注册 Profile

在 `internal/protocol/registry.go` 的 `init()` 或配置加载阶段：

```go
func init() {
    Register("myprotocol", myprotocol.NewProfile())
}
```

## 3. Single-flight 和 Idempotent Registration

如果 `init()` 时机不好控制（如测试场景），也可显示调用：

```go
registry := protocol.NewRegistry()
registry.Register("hysteria2", hysteria2.NewProfile())
registry.Register("vless", vless.NewProfile())
```

注册规则：
- 同一协议标识不可重复注册（panic on duplicate）
- 未注册的协议在 `Render()` 时返回 `ErrProfileNotFound`
- Registry 是全局单例，在 NodeAgent 启动时完成注册

## 4. 测试要求

每个 profile 必须包含：

| 测试 | 说明 |
| --- | --- |
| `TestValidate_ValidConfig` | 合法配置通过 |
| `TestValidate_MissingField` | 缺字段报错 |
| `TestRender_OutputFormat` | 输出符合 sing-box JSON schema |
| `TestRender_WithTLS` | TLS 配置渲染正确 |
| `TestRender_WithUsers` | 用户列表渲染正确 |
| `TestEndpoint_Metadata` | 端点元数据正确 |
| `TestHealthCheck_TCPConnect` | TCP 检查逻辑 |
| `TestHealthCheck_Handshake` | 协议握手检查 |
| `TestSecretRefs_Declared` | 所有密钥引用声明 |
| `TestRedact_NoPlaintext` | 脱敏后无明文 |
| `TestSupportsClientConfig` | 客户端配置支持标记 |
| `TestRegistry_RegisterAndLookup` | 注册和查找正确 |
| `TestRegistry_DuplicatePanics` | 重复注册 panic |

## 5. 安全审查清单

协议实现提交前必须确认：

- [ ] `Redact()` 覆盖所有敏感字段
- [ ] 日志输出使用 `Redact()` 后的配置
- [ ] 不包含 `node_secret` / `node_secret_hash` / HMAC key 输出
- [ ] `SecretRefs` 声明完整（无遗漏引用密钥）
- [ ] 所有密钥来源安全（env / file / backend / local_generated）
- [ ] App connect_config 只拿该协议的最小必要凭据
- [ ] 支持 credential 过滤（区分长期凭据和 session-bound 凭据）
- [ ] `SupportsClientConfig()` 返回值正确

## 6. Profile Registry 与 Backend Config 联动

```text
Backend /internal/agent/config payload:
{
  "inbounds": [
    {
      "protocol": "hysteria2",
      "listen": "0.0.0.0:443",
      "transport": "quic",
      "users": [...],
      "tls": {...},
      "health": {...}
    }
  ]
}

NodeAgent 处理流程：
1. ConfigManager 解析 inbound 列表
2. 对每个 inbound，registry.Lookup(inbound.protocol)
3. profile.Validate(protocolConfig)
4. profile.Render(protocolConfig) → sing-box fragment
5. Renderer 合并所有 fragment 到最终 sing-box JSON
6. RuntimeManager 重启或 reload sing-box
7. HealthChecker 启动定时检查
8. PublicProber 调用 profile.Endpoint() 上报
```

## 7. 参考实现模板

建议在 `internal/protocol/mixed/` 中保留一个最小参考实现，新协议开发者直接拷贝修改。
