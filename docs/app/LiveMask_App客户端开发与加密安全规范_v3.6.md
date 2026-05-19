# LiveMask App 客户端开发与加密安全规范 v3.6

## 1. 目标
本文档专门针对 **多平台客户端（Flutter）** 的开发、构建、加密、反逆向以及与后端的安全衔接进行详细规范。

目标是让客户端在**功能完整**的同时，具备较强的**反逆向、抗篡改、抗调试**能力，保护核心协议配置和用户隐私。

## 2. 技术选型
- **框架**：Flutter 3.x
- **核心网络库**：sing-box（libcore / flutter_singbox）
- **本地存储**：Hive + 加密（AES-GCM）
- **状态管理**：Riverpod 或 Bloc
- **构建**：官方 Flutter build + 混淆

### 2.1 VPN 原生运行时边界（强制）

Flutter/Dart 不能被当作系统 VPN 运行时本身。Flutter 负责 UI、状态、
API、缓存、诊断和跨平台交互；真正的 VPN 连接、断开、权限申请、系统
tunnel 生命周期必须由各平台原生层实现，并通过 MethodChannel 或独立
Flutter plugin 暴露给 Dart。

| 平台 | 必须使用的原生能力 |
|------|--------------------|
| Android | Kotlin/Java `VpnService` + 用户授权 + 前台服务 |
| iOS | Swift NetworkExtension / PacketTunnelProvider + entitlement |
| macOS | NetworkExtension 或经过审批的 privileged helper |
| Windows | 本地 service / tunnel engine / installer 权限 |
| Linux | daemon / NetworkManager / TUN 权限与发行版降级 |
| Web | 不支持系统 VPN 启停，不得伪造连接能力 |

任何客户端 TASK 如果声明“VPN 已可连接”，必须提供对应平台的原生运行时
验证，而不能只以 Flutter 页面状态、Mock、按钮跳转或 Dart service 作为完成依据。

详细契约见：`docs/app/VPN_NATIVE_RUNTIME_CONTRACT.md`。

## 3. 多平台构建与加密规范

### 3.1 Android
```bash
flutter build apk --release \
  --obfuscate \
  --split-debug-info=build/app/outputs/symbols \
  --target-platform android-arm,android-arm64
```

**额外加固建议**：
- 使用 R8（默认开启）进行进一步混淆
- 启用 `minifyEnabled true` + `shrinkResources true`
- 可选：接入腾讯乐固 / 360加固 / Appdome 等商业加固（推荐在 CI 中最后一步处理）

### 3.2 iOS
```bash
flutter build ios --release --obfuscate --split-debug-info=...
```

- 使用 Xcode 的 Bitcode（已废弃，建议关闭）
- 开启 App Attest + DeviceCheck
- 发布时使用 App Store Connect 的加密选项

### 3.3 Windows / macOS / Linux
- 使用 `--obfuscate`
- Windows 可额外使用 VMProtect 或 Themida 进行二次保护（可选，成本较高）

## 4. 核心安全措施

### 4.1 配置与协议保护
- 所有 sing-box 配置（Reality、Hysteria2 等）**必须通过后端接口动态拉取**，禁止硬编码在客户端。
- 拉取配置时必须校验 `config_version` + `config_hash`（SHA256）。
- 本地缓存配置必须加密存储（Hive + AES-GCM）。

### 4.2 证书锁定（Certificate Pinning）
- 对所有后端 API 域名进行证书 pinning（使用 `http_certificate_pinning` 或自定义 Dio 拦截器）。
- 定期更新 pinning 公钥指纹（通过配置中心下发）。

### 4.3 API 请求安全
- 所有敏感接口（充值、佣金查询、节点列表）必须携带：
  - JWT + 设备指纹（可选）
  - 请求签名（timestamp + nonce + HMAC）
- 后端对签名进行严格校验，防止重放攻击。

### 4.4 本地数据保护
- 用户 Token、节点配置、黑白名单等敏感数据必须加密存储。
- 使用 Flutter Secure Storage（Android Keystore / iOS Keychain）存储密钥。
- Hive 数据库启用加密。

### 4.5 反调试与反篡改
- 启动时检测是否处于调试模式（`flutter attach` / Frida / Xposed）。
- 检测模拟器环境（可选）。
- 关键代码路径加入完整性校验（checksum）。
- 发现异常时立即清空本地敏感数据并退出，或进入“安全模式”只允许基础功能。

## 5. 与后端的衔接规范

### 5.1 配置拉取流程（必须实现）
1. 客户端启动 → 调用 `/client/config/pull?version=xxx`
2. 服务端返回最新配置 + `config_version` + `config_hash`
3. 客户端校验 hash，不一致则更新本地配置并重载 sing-box
4. 失败时使用本地缓存（带有效期）

### 5.2 Quarantine 节点过滤
- 客户端在获取节点列表时，必须过滤 `status = 'quarantine'` 的节点（对付费用户不可见）。
- 免费用户可看到部分免费区节点（受带宽限制）。

### 5.3 威胁情报黑名单
- 客户端定期从后端同步 IP/域名黑名单。
- 本地 sing-box outbound 规则动态更新，阻断危险流量。

## 6. 注意事项与禁忌

| 事项 | 说明 | 风险等级 |
|------|------|----------|
| **禁止硬编码节点配置** | 所有 Reality、Hysteria2 配置必须动态下发 | 极高 |
| **禁止明文存储 Token** | 必须使用 Flutter Secure Storage | 高 |
| **禁止关闭证书校验** | 生产环境必须开启 pinning | 高 |
| **混淆必须在 Release 构建时开启** | Debug 模式可关闭便于开发 | 中 |
| **敏感接口必须做请求签名** | 防止重放和篡改 | 高 |
| **定期更新 pinning 公钥** | 通过配置中心下发新指纹 | 中 |
| **App 启动时做环境检测** | 发现调试/模拟器给出警告或限制功能 | 中 |

## 7. 日志上报与崩溃监控（生产级必需）

### 7.1 技术选型推荐（开源免费架构）

**首选方案：Sentry（自托管版）**

- **理由**：
  - Flutter / Dart 官方支持最好，集成极简。
  - 自动捕获崩溃（Crash）、ANR、OOM、Flutter 错误。
  - 支持 Breadcrumbs（面包屑），非常适合排查 VPN 连接问题。
  - 支持 Performance Monitoring（可观测连接耗时、协议切换耗时）。
  - 开源核心，可通过 Docker Compose 自托管（与后端部署风格一致）。
  - SaaS 免费额度对中小团队足够，自托管完全免费且数据可控。

**备选轻量方案**（如果不想引入 Sentry）：
- 使用后端已有的 API + PostgreSQL / Loki 存储结构化日志。
- 优点：架构统一，无额外服务。
- 缺点：崩溃自动上报能力较弱，需要自己实现全局异常捕获 + 上报。

**最终推荐**：**Sentry 自托管**（平衡最好）。

### 7.2 Sentry 集成规范

**Flutter 端集成要点**：

```yaml
# pubspec.yaml
dependencies:
  sentry_flutter: ^8.x.x
```

**初始化（必须在 main() 最前面）**：

```dart
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = 'https://xxx@xxx.ingest.sentry.io/xxx'; // 从配置中心动态下发
      options.environment = kReleaseMode ? 'production' : 'development';
      options.tracesSampleRate = 0.1; // 性能采样率
      options.attachScreenshot = true;
      options.attachViewHierarchy = true;
      options.beforeSend = (event, hint) {
        // 隐私过滤：禁止上报任何用户流量内容
        if (event.message?.formatted?.contains('流量') ?? false) return null;
        return event;
      };
    },
    appRunner: () => runApp(MyApp()),
  );
}
```

**关键上报事件（VPN 场景必须上报）**：

| 事件类型 | 必须包含的 Context | 目的 |
|----------|---------------------|------|
| `vpn.connection.success` | node_id, protocol, latency, network_type | 成功连接统计 |
| `vpn.connection.failed` | node_id, protocol, error_code, reason, network_type | 排查连接失败 |
| `vpn.protocol.fallback` | from_protocol, to_protocol, reason | 协议热切换分析 |
| `vpn.config.update_failed` | config_version, error | 配置热更新失败排查 |
| `singbox.error` | error_code, message, node_id | sing-box 底层错误 |
| `app.crash` | last_node, last_protocol, network_type, app_version | 崩溃上下文 |
| `app.anr` | duration_ms, stack | ANR 分析 |

**Breadcrumb 示例**（强烈推荐）：

```dart
Sentry.addBreadcrumb(Breadcrumb(
  category: 'vpn',
  message: 'Protocol switched from Reality to Hysteria2',
  level: SentryLevel.info,
  data: {'node_id': node.id, 'reason': 'high_latency'},
));
```

### 7.3 隐私与合规要求（VPN App 必须严格遵守）

- **绝对禁止**上报用户实际访问的域名、IP、流量内容。
- 只上报**元数据 + 错误信息**（节点ID、协议、延迟、错误码、网络类型、App版本、设备型号等）。
- 所有上报前必须经过 `beforeSend` 过滤敏感信息。
- 在隐私政策中明确说明会收集崩溃和连接诊断数据。

### 7.4 自托管 Sentry（Docker Compose 方式）

后端团队可将 Sentry 加入现有 `docker-compose.yml` 中（推荐使用 `getsentry/self-hosted` 官方镜像）。

```yaml
# docker-compose.yml 新增服务（简化版）
sentry:
  image: getsentry/sentry:latest
  # ... (完整配置参考 Sentry 官方自托管文档)
```

### 7.5 与现有监控体系的联动

- Sentry 捕获的严重错误（尤其是崩溃 + VPN 连接失败）应通过 Webhook 推送到内部通知系统（Telegram / Email）。
- 重要错误可自动创建 `appeals` 记录，触发人工关注。

---

## 8. 推荐开发流程


1. 日常开发使用 Debug 模式（关闭混淆，便于调试）
2. 提测/发布前必须执行 Release + Obfuscate 构建
3. CI/CD 中最后一步可接入商业加固（可选）
4. 发布后持续监控异常（通过 Sentry / 自定义上报）

## 8. 未来演进方向
- 引入 App Attest（iOS） + Play Integrity API（Android）
- 增加运行时完整性校验（RASP）
- 客户端与后端建立 mTLS（双向证书）

---

**文档状态**：v3.6 最终版，已与后端配置热更新、威胁狩猎、通知系统形成闭环。

此文档应作为客户端开发团队的**核心规范**，任何客户端改动必须符合本规范。

---

## 9. 动态资源治理配置应用（vpn_client_governance）

> Current contract: the old `vpn_client_governance` design is superseded by
> [App Runtime Governance Config Contract](../contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md).
> New implementations should use `app_runtime_governance` and
> `GET /api/v1/app/runtime-config`.

### 9.1 配置结构说明
客户端从 `/client/config` 接口拉取的 `vpn_client_governance` 配置用于动态控制资源使用和连接行为，显著降低 iOS Extension 被系统终止的风险，并优化弱网环境下的表现。

完整结构定义见《LiveMask_数据库详细设计_v3.6.md》。

### 9.2 客户端应用代码示例（Dart / Riverpod）

```dart
// lib/core/config/vpn_governance_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:livemask/core/config/config_service.dart';

part 'vpn_governance_provider.g.dart';

@riverpod
class VpnGovernance extends _$VpnGovernance {
  @override
  VpnClientGovernance build() {
    // 监听配置热更新
    ref.listen(configServiceProvider, (previous, next) {
      if (next.hasValue) {
        final config = next.value!.vpnClientGovernance;
        state = config;
      }
    });
    return VpnClientGovernance.defaultValue();
  }

  void applyToConnectionOrchestrator(ConnectionOrchestrator orchestrator) {
    final config = state;
    if (!config.enabled) return;

    orchestrator.updateHealthCheckInterval(
      Duration(milliseconds: config.behavior.healthCheckIntervalMs)
    );

    orchestrator.updateReconnectPolicy(
      initialBackoff: Duration(milliseconds: config.behavior.reconnectInitialBackoffMs),
      maxBackoff: Duration(milliseconds: config.behavior.reconnectMaxBackoffMs),
    );

    orchestrator.updateCircuitBreakerThreshold(
      config.behavior.circuitBreakerFailureThreshold
    );
  }
}

// 在 Connection Orchestrator 中使用
class ConnectionOrchestrator {
  void updateHealthCheckInterval(Duration interval) { ... }
  void updateReconnectPolicy({required Duration initialBackoff, required Duration maxBackoff}) { ... }
  void updateCircuitBreakerThreshold(int threshold) { ... }
}
```

### 9.3 sing-box 配置动态映射示例

```dart
// lib/core/vpn/singbox_config_builder.dart

Map<String, dynamic> buildSingboxConfig(VpnClientGovernance governance) {
  final limits = governance.resourceLimits;

  return {
    "log": {"level": "warn"},
    "dns": {...},
    "inbounds": [
      {
        "type": "tun",
        "mtu": 1500,
        "address": ["172.19.0.1/30"],
        // 根据 governance 动态调整
        "udpTimeout": limits.bufferSizeKb > 256 ? "5m" : "2m",
      }
    ],
    "outbounds": [...],
    // 可根据 platform_overrides 进一步调整
  };
}
```

### 9.4 注意事项
- 配置变更后应**平滑生效**，避免正在进行的连接中断。
- iOS 平台优先使用 `platform_overrides.ios` 中的更保守值。
- 所有数值变更必须通过后台 `system_configs` 下发，客户端禁止硬编码。
