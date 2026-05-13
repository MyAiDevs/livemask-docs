# iOS NetworkExtension Chain

> 覆盖 iOS App、PacketTunnelProvider、App Group、Darwin Notification、sing-box、Backend 配置和用户反馈的闭环。

## 1. 正向链路

```text
iOS App fetches recommendation/config
  -> stores tunnel config in App Group
  -> starts PacketTunnelProvider
  -> PacketTunnelProvider launches sing-box
  -> tunnel status reported to App
  -> App reports connection quality to Backend
  -> Backend adjusts recommendation / node quality
```

## 2. 角色

| 角色 | 职责 |
| --- | --- |
| iOS App | UI、权限、配置写入、状态展示 |
| NetworkExtension | tunnel 生命周期、sing-box 运行 |
| Backend | 推荐节点、配置、质量上报 |
| Security | App Group、Keychain、日志脱敏 |
| QA | iOS 版本、后台、断网、重启、权限测试 |
| Support | 用户授权失败和连接失败解释 |

## 3. 必须契约

### App / Extension 本地契约

- App Group config file path
- config schema version
- tunnel command channel
- status channel
- log redaction policy

### Backend API

- `POST /api/v1/client/nodes/recommend`
- `GET /api/v1/config/client`
- `POST /api/v1/client/vpn/report-connection-quality`

### Local Events

- `tunnel.start_requested`
- `tunnel.started`
- `tunnel.failed`
- `tunnel.stopped`
- `singbox.crashed`

## 4. 状态机

| 状态 | 含义 |
| --- | --- |
| `idle` | 未启动 |
| `starting` | 正在启动 tunnel |
| `connected` | 已连接 |
| `reconnecting` | 自动重连 |
| `failed` | 启动或运行失败 |
| `stopping` | 正在停止 |

## 5. 假设审计

### H1：App 写配置成功但 Extension 读取旧配置

- 配置文件必须包含 `config_version` 和 `config_hash`。
- Extension 启动前校验 hash。
- 不一致时返回 `CONFIG_HASH_MISMATCH` 给 App。

### H2：Extension 崩溃但 App 仍显示 connected

- App 必须监听 tunnel status。
- 超过 heartbeat TTL 未收到状态时显示 reconnecting / failed。
- App 上报 failure_reason。

### H3：用户未授权 VPN 权限

- App 不调用 Backend 连接质量成功上报。
- 显示本地授权引导。
- Product / Support 提供解释话术。

### H4：iOS 后台限制导致断连

- App 记录 lifecycle 和 tunnel stop reason。
- 重回前台时拉取最新推荐和配置。
- 避免无限重启造成电量/审核风险。

## 6. 验证矩阵

- [ ] 首次授权启动
- [ ] 拒绝授权
- [ ] App kill / reboot 后状态恢复
- [ ] Extension crash
- [ ] 配置 hash mismatch
- [ ] 网络切换 Wi-Fi / Cellular
- [ ] 后台运行和前台恢复

## 7. 回滚

- 通过 remote config 禁用新协议或新配置。
- 回退到 last-known-good tunnel config。
- App 隐藏不稳定节点或协议。
