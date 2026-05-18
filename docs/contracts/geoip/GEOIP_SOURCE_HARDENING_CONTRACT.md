# GeoIP Source Hardening Contract

> Task: `TASK-DOC-GEOIP-CONTRACT-002`
> Owner: Backend / NodeAgent / App / Admin / DevOps
> Status: Draft
> Scope: Supplement to `GEOIP_DATABASE_SYNC_CONTRACT.md`. Defines GeoIP production
> hardening capabilities: third-party source download, source allowlist, artifact
> storage abstraction, manifest signature, full/delta package strategy, App API
> rate limit, unknown format/profile handling, MaxMind tar.gz extraction, and
> security boundaries.

## 1. 目标

本契约补充 `GEOIP_DATABASE_SYNC_CONTRACT.md` 后新增的 GeoIP 生产化能力，统一
约束 Backend、NodeAgent、App、Admin、CI/CD 对以下能力的理解：

- 真实第三方 GeoIP source 下载
- Source allowlist
- Artifact storage 抽象
- Manifest signature
- Full / delta package strategy
- App API rate limit
- Unknown format/profile 处理
- MaxMind tar.gz 待办
- 安全边界：SSRF、path traversal、secret leak、signed URL redaction

## 2. 当前实现状态总览

| 仓库 | 任务 | 状态 | 说明 |
| --- | --- | --- | --- |
| `livemask-backend` | `TASK-BACKEND-GEOIP-001` | ✅ 已完成 | GeoIP API、Admin API、App API、NodeAgent HMAC API、source registry |
| `livemask-backend` | `TASK-BACKEND-GEOIP-SOURCE-002` | ✅ 已完成 | Source hardening、storage abstraction、manifest signature、rate limit、delta fallback skeleton |
| `livemask-nodeagent` | `TASK-NODEAGENT-GEOIP-001` | ✅ 已完成 | check/download/events、SHA256 校验、atomic swap、LKG、status、sync/rollback endpoint |
| `livemask-app` | `TASK-APP-GEOIP-001` | ✅ 已完成 | manifest、package download、SHA256、local cache、LKG rollback、events、debug UI |
| `livemask-admin` | `TASK-ADMIN-GEOIP-001` | ✅ 已完成 | databases list/detail、trigger update、activate/rollback、jobs/events、geoip:read/write RBAC |
| `livemask-ci-cd` | `TASK-CICD-GEOIP-001` | ✅ 已完成 | 基础 GeoIP 全链路 smoke（8 域 27 节） |
| `livemask-ci-cd` | `TASK-CICD-GEOIP-CREDENTIALS-001` | ✅ 已完成 | GeoIP credentials smoke（15 域） |

### 2.1 未完成增强

| 领域 | 后续任务 | 状态 |
| --- | --- | --- |
| Manifest signature verify（NodeAgent） | `TASK-NODEAGENT-GEOIP-003` | ❌ 未开始 |
| Delta package apply（NodeAgent） | `TASK-NODEAGENT-GEOIP-004` | ❌ 未开始 |
| Lookup engine（NodeAgent） | `TASK-NODEAGENT-GEOIP-005` | ❌ 未开始 |
| Lookup engine（App） | `TASK-APP-GEOIP-LOOKUP-001` | ❌ 未开始 |
| MaxMind tar.gz extraction | `TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` | ❌ 未开始 |
| Signature / rate limit / delta smoke hardening | `TASK-CICD-GEOIP-HARDENING-002` | ❌ 未开始 |
| Event retry queue（NodeAgent） | `TASK-NODEAGENT-GEOIP-002` | ❌ 未开始 |
| Heartbeat contract extension | `TASK-NODEAGENT-GEOIP-006` | ❌ 未开始 |
| Compatibility gate | `TASK-NODEAGENT-GEOIP-007` | ❌ 未开始 |
| Runtime config integration | `TASK-NODEAGENT-GEOIP-008` | ❌ 未开始 |

## 3. Source Allowlist

Backend 只能从内置 allowlist 拉取 GeoIP 数据库。

合法 source：

| Source | Description |
| --- | --- |
| `dbip_lite` | DB-IP Lite |
| `maxmind_geolite2` | MaxMind GeoLite2 |
| `ip2location_lite` | IP2Location LITE |
| `hackl0us_geoip2_cn` | Hackl0us/GeoIP2-CN |

禁止行为：

- Admin request body 不得传任意 `download_url`
- Backend 不得跟随 `file://` / `ftp://` / `gopher://` 等非 `http(s)` URL
- Backend 不得把用户输入拼接成下载 URL
- Backend 不得在 API response/log 中输出带 token/license 的完整 URL

每个 source 必须由独立 adapter 管理：

```go
type GeoIPSourceAdapter interface {
    Name() string
    Fetch(ctx context.Context, req FetchRequest) (*FetchedArtifact, error)
    DetectFormat(...) ...
    Normalize(...) ...
    LicenseName() string
    Attribution() string
    SupportedProfiles() []string
}
```

## 4. Source 格式规范

不同开源 GeoIP 项目的数据库文件格式可能不一致，必须统一映射到标准 format/profile。

合法 format：

| Format | Description |
| --- | --- |
| `maxmind-mmdb` | MaxMind MMDB format |
| `dbip-mmdb` | DB-IP MMDB format |
| `ip2location-bin` | IP2Location binary format |
| `geoip2-cn-mmdb` | GeoIP2-CN MMDB format |
| `geoip2-cn-dat` | GeoIP2-CN DAT format |

合法 profile 示例：

| Profile | Description |
| --- | --- |
| `country` | Country-level data |
| `city` | City-level data |
| `asn` | ASN data |
| `cn` | China-specific data |

处理规则：

| 场景 | Backend | NodeAgent | App |
| --- | --- | --- | --- |
| 已知 format | 接受并生成 manifest | 可下载/校验/缓存 | 可下载/校验/缓存 |
| 未知 format | 拒绝，返回 `GEOIP_UNKNOWN_FORMAT` | 拒绝上线 package | 标记 `unsupported`，不 crash |
| 已知 source + 不支持 format | update job failed | 不影响 current/LKG | 不影响 current/LKG |
| profile 路径含 `../` | 拒绝 | 拒绝 | 拒绝 |

## 5. Hackl0us/GeoIP2-CN

Hackl0us/GeoIP2-CN 必须作为独立 source：

- `source = hackl0us_geoip2_cn`
- 不能混入 MaxMind 或 DB-IP adapter。

支持格式需按实际 artifact 判断：

- `geoip2-cn-mmdb`
- `geoip2-cn-dat`

要求：

- Backend adapter 负责识别实际文件格式。
- Manifest 必须明确 `source`、`format`、`profile`。
- NodeAgent/App 不通过 source 名猜格式，只信任 manifest 的标准化 format。
- 如果 Hackl0us 源未来变更文件格式，Backend adapter 负责兼容或返回
  `GEOIP_UNKNOWN_FORMAT`。

## 6. Download Security

Backend 下载第三方 source 时必须满足：

- timeout
- max bytes
- redirect limit <= 3
- http status 必须是 2xx
- 只允许 http/https
- 拒绝 `file`/`ftp`/`gopher`/`data`/`javascript`
- 错误信息必须 redaction

默认限制：

| Variable | Default |
| --- | --- |
| `GEOIP_DOWNLOAD_TIMEOUT_SEC` | `60` |
| `GEOIP_DOWNLOAD_MAX_BYTES` | `104857600` |

日志规则：

| 允许记录 | 禁止记录 |
| --- | --- |
| source, edition, profile, version, status, size, sha256 | license key, token, signed URL query, cloud credential |

## 7. Artifact Storage

Backend 不应把本地 filesystem path 暴露给 Admin/App/NodeAgent。

统一 storage interface：

```go
type ArtifactStorage interface {
    Put(ctx context.Context, key string, r io.Reader, size int64) (StoredArtifact, error)
    Get(ctx context.Context, key string) (io.ReadCloser, StoredArtifact, error)
    Exists(ctx context.Context, key string) (bool, error)
    SignedURL(ctx context.Context, key string, ttl time.Duration) (string, error)
    Delete(ctx context.Context, key string) error
}
```

MVP：

| Implementation | Notes |
| --- | --- |
| `LocalArtifactStorage` | Local filesystem for MVP |

未来：

| Implementation | Notes |
| --- | --- |
| `OSSArtifactStorage` | Alibaba Cloud OSS |
| `S3ArtifactStorage` | AWS S3 |

Storage key 必须规范化：

```
geoip/{source}/{version}/{filename}
```

禁止：

- `../`
- absolute path
- 用户传入 raw path
- `storage_path` 出现在 API JSON

当前实现：

- ✅ Backend `Database.StoragePath` 标记 `json:"-"`，不参与序列化
- ✅ Admin 响应不包含 `storage_path`
- ✅ package 下载通过 Backend API handler 路由，非直接路径暴露
- ✅ `ValidatePackagePath()` 拒绝 `..` 和绝对路径

## 8. Manifest Signature

GeoIP manifest 支持签名字段：

```json
{
  "signature": {
    "algorithm": "hmac-sha256",
    "key_id": "geoip-manifest-v1",
    "value": "hex-signature"
  }
}
```

环境变量：

| Variable | Purpose |
| --- | --- |
| `GEOIP_MANIFEST_SIGNING_KEY` | Signing key |
| `GEOIP_MANIFEST_KEY_ID` | Key identifier |

规则：

- 签名内容使用 canonical JSON。
- `signature` 字段本身不参与签名。
- 同一 manifest 内容必须生成相同 signature。
- `version`/`sha256`/`size`/`source` 任一变化，signature 必须变化。
- signing key 不得返回给任何 API。
- signing key 不得写入 logs/audit。
- `dev` 环境允许 unsigned manifest，但 response/status 应带 warning 或 signature
  为空。

NodeAgent/App 行为：

| 场景 | NodeAgent | App |
| --- | --- | --- |
| signature 存在且校验通过 | 可继续下载 | 可继续下载 |
| signature 存在但校验失败 | 拒绝下载，不覆盖 current | 拒绝下载，不覆盖 current |
| signature 缺失，dev mode | warning/degraded 可接受 | warning 可接受 |
| signature 缺失，prod required | 拒绝 | 拒绝 |

当前实现状态：

| 端 | 状态 | 说明 |
| --- | --- | --- |
| Backend | ✅ 已完成 | 生成/支持 signature 字段 |
| App | ✅ 已完成 | 已兼容解析 optional signature |
| NodeAgent | ❌ 未完成 | `TASK-NODEAGENT-GEOIP-003`：manifest signature verify |
| CI/CD | ❌ 未覆盖 | `TASK-CICD-GEOIP-HARDENING-002`：signature hardening smoke |

## 9. Manifest 字段

Backend App manifest response 可包含：

```json
{
  "update_available": true,
  "current_version": "2026-04",
  "target_version": "2026-05",
  "strategy": "full",
  "fallback_full": true,
  "database": {
    "database_id": "geoip-db-2026-05",
    "source": "dbip_lite",
    "edition": "country",
    "format": "dbip-mmdb",
    "profile": "country",
    "version": "2026-05",
    "sha256": "sha256:...",
    "size_bytes": 123456,
    "generated_at": "2026-05-01T00:00:00Z",
    "expires_at": "2026-06-01T00:00:00Z"
  },
  "artifact": {
    "package_url": "/api/v1/geoip/package/geoip-db-2026-05",
    "content_type": "application/octet-stream",
    "compression": "none",
    "sha256": "sha256:...",
    "size_bytes": 123456
  },
  "license": {
    "name": "CC-BY-4.0",
    "attribution": "IP Geolocation by DB-IP"
  },
  "compatibility": {
    "app_min_version": "0.1.0",
    "nodeagent_min_version": "0.1.0"
  },
  "signature": {
    "algorithm": "hmac-sha256",
    "key_id": "geoip-manifest-v1",
    "value": "..."
  }
}
```

兼容规则：

- App/NodeAgent 必须忽略未知字段。
- Backend 不得删除已有字段，只能新增 optional 字段。
- `strategy` 缺失时默认视为 `full`。
- `fallback_full` 缺失时默认 `false`。

## 10. Full / Delta Strategy

MVP 只要求 full package 可用。Delta 是协议骨架。

合法 strategy：

| Strategy | Description |
| --- | --- |
| `full` | Full database package |
| `delta` | Incremental delta package |

规则：

| 场景 | Backend response |
| --- | --- |
| 无 `current_version` | `strategy=full` |
| `current_version` 已是最新 | `update_available=false` |
| 存在可用 delta | `strategy=delta` |
| delta 不存在或不可用 | `strategy=full`, `fallback_full=true` |
| delta 文件缺失 | fallback full |
| delta sha256 不匹配 | client 拒绝，保留 current/LKG |

当前实现状态：

| 端 | 状态 | 说明 |
| --- | --- | --- |
| Backend | ✅ 已完成 | delta fallback skeleton 已就位，`strategy`/`fallback_full` 字段已定义 |
| App | ✅ 已完成 | 已兼容 `strategy`/`fallback_full` 字段，支持 delta→full fallback 流程 |
| NodeAgent | ❌ 未完成 | `TASK-NODEAGENT-GEOIP-004`：delta apply 未实现 |
| CI/CD | ❌ 未覆盖 | `TASK-CICD-GEOIP-HARDENING-002`：delta fallback hardening smoke |

NodeAgent/App：

- delta 未实现时必须 fallback full 或拒绝并保持 current。
- delta apply 失败不能覆盖 current。
- full package 校验成功后才能 promote current。

## 11. Rate Limit

Backend 对 App GeoIP API 启用 rate limit：

| Endpoint | Purpose |
| --- | --- |
| `GET  /api/v1/geoip/manifest` | Manifest check |
| `GET  /api/v1/geoip/package/{database_id}` | Package download |
| `POST /api/v1/geoip/events` | Event reporting |

默认配置：

| Variable | Default |
| --- | --- |
| `GEOIP_RATE_LIMIT_ENABLED` | `true` |
| `GEOIP_RATE_LIMIT_MANIFEST_PER_MIN` | `30` |
| `GEOIP_RATE_LIMIT_PACKAGE_PER_MIN` | `10` |
| `GEOIP_RATE_LIMIT_EVENTS_PER_MIN` | `60` |

返回：

```json
{
  "error": {
    "code": "GEOIP_RATE_LIMITED",
    "message": "too many geoip requests"
  }
}
```

要求：

- Admin API 不受 App rate limit 影响。
- NodeAgent HMAC API 不受 App rate limit 影响，或使用单独更宽松 limit。
- key 优先 `user_id`，其次 IP。
- App 收到 429 后不得无限重试。

## 12. App GeoIP Contract — 当前实现

### 12.1 App 端 API 调用

App 通过 `GET /api/v1/geoip/manifest` 获取 manifest，通过
`GET /api/v1/geoip/package/{database_id}` 下载 package，通过
`POST /api/v1/geoip/events` 上报事件。

所有请求使用 authenticated Dio 实例（`AuthTokenInterceptor` 自动注入
`Authorization: Bearer <JWT>`）。

### 12.2 当前实现状态

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| Manifest fetch + parse | ✅ 已完成 | `RealGeoIPApiClient.fetchManifest()` |
| Package download + size cap | ✅ 已完成 | 100MB cap via `kGeoIPMaxPackageBytes` |
| SHA-256 checksum verification | ✅ 已完成 | `GeoIPVerifier.verify()` |
| Local cache (current + LKG) | ✅ 已完成 | `GeoIPCacheStorage` — `current/` + `previous/` |
| LKG rollback | ✅ 已完成 | SHA256 mismatch 时保留 current，不覆盖 |
| Event reporting（best-effort） | ✅ 已完成 | 失败不阻塞主流程 |
| Debug UI | ✅ 已完成 | 开发调试页面 |
| compatibility/expiration check | ✅ 已完成 | `compatibility.app_min_version`、`expires_at` |
| `strategy`/`fallback_full` 兼容 | ✅ 已完成 | MVP 只处理 `full`，骨架兼容 delta |
| `signature` 字段兼容解析 | ✅ 已完成 | optional 字段，不校验 |
| GeoIP sync 失败不影响核心功能 | ✅ 已完成 | 不阻塞登录、连接、计费 |

### 12.3 未完成

| 功能 | 后续任务 | 说明 |
| --- | --- | --- |
| GeoIPLookupService | `TASK-APP-GEOIP-LOOKUP-001` | 尚未实现 lookup 引擎 |
| Web 平台 path_provider/storage | 后续适配 | 需要 platform-specific storage 处理 |
| Windows/Linux 构建验证 | 后续适配 | 需对应系统验证 |

### 12.4 App 端强制规则

App 必须：

- 只从 Backend `/api/v1/geoip/*` 同步。
- 不直接访问第三方 GeoIP source。
- 使用用户 JWT。
- 校验 sha256。
- checksum mismatch 不覆盖 current。
- unknown format 不 crash。
- rate limit 429 不无限重试。
- GeoIP sync 失败不影响登录、连接、计费等核心功能。
- event 上报失败不得阻塞主流程。
- 不展示完整 `package_url`/token/path/signature。

## 13. NodeAgent GeoIP Contract — 当前实现

### 13.1 NodeAgent 端 API

NodeAgent 通过 HMAC-signed 的 internal API 与 Backend 通信：

| 操作 | Method | Path |
| --- | --- | --- |
| Check for update | GET | `/internal/agent/geoip/check` |
| Download package | GET | `/internal/agent/geoip/package/{database_id}` |
| Report event | POST | `/internal/agent/geoip/events` |

HMAC 算法（两层）：

1. `SHA-256(rawNodeSecret)` → hex → 用作 HMAC key
2. `HMAC-SHA256(key=secretHashHex, msg=nodeID + ":" + timestamp)`

NodeAgent 自身暴露的状态端点：

| 端点 | 内容 |
| --- | --- |
| `GET /geoip/status` | 完整 `GeoIPStatus` JSON |
| `POST /geoip/sync` | 触发即时同步 |
| `POST /geoip/rollback` | 触发 LKG 回滚 |
| `GET /agent/status` | 含 `geoip` 字段 |
| `GET /healthz` | GeoIP stale/failed 时 degraded（不 crash） |

### 13.2 当前实现状态

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| Manifest check + Download | ✅ 已完成 | `Client.Check()` + `Client.DownloadPackage()` |
| SHA-256 in-memory verify（写盘前） | ✅ 已完成 | `verifyBytesSHA256()` |
| Known format allowlist（5种） | ✅ 已完成 | `format == ""` 或未知格式拒绝 |
| Package URL schema 验证 | ✅ 已完成 | 只允许 http/https |
| Profile/format 一致性检查 | ✅ 已完成 | 必须匹配 manager 配置 |
| Atomic symlink swap（不覆盖 current） | ✅ 已完成 | `current → previous`，`current → new` |
| Cleanup temp on failure | ✅ 已完成 | `CleanupTemp()` |
| LKG fallback on swap failure | ✅ 已完成 | `attemptLKGFallback()` |
| Event reporting（async） | ✅ 已完成 | 10s timeout，不阻塞 sync |
| Error redaction（node_secret 等） | ✅ 已完成 | `redactError()` 覆盖 7+ 敏感模式 |
| Path traversal 防护（profile + version） | ✅ 已完成 | `sanitizeFilename()` 替换 `..`/`/`/`\`/`~` |
| Download size cap（100MB） | ✅ 已完成 | `io.LimitReader` |
| LKG persist + rollback | ✅ 已完成 | 版本化目录 + `lkg.json` |
| Status hooks + OnStatusChange | ✅ 已完成 | 外部 consumer 可监听状态变化 |

### 13.3 未完成

| 功能 | 后续任务 | 说明 |
| --- | --- | --- |
| Manifest signature verify | `TASK-NODEAGENT-GEOIP-003` | 需实现 HMAC verify + key rotation |
| Delta package apply | `TASK-NODEAGENT-GEOIP-004` | delta 下载/校验/应用 全流程 |
| Lookup engine | `TASK-NODEAGENT-GEOIP-005` | GeoIP database lookup 接口 |
| Event retry queue | `TASK-NODEAGENT-GEOIP-002` | event 上报失败后持久化重试 |
| Heartbeat contract extension | `TASK-NODEAGENT-GEOIP-006` | GeoIP 状态心跳字段扩展 |
| Compatibility gate | `TASK-NODEAGENT-GEOIP-007` | manifest compatibility.field 校验 |
| Runtime config integration | `TASK-NODEAGENT-GEOIP-008` | config center 动态配置接入 |

### 13.4 NodeAgent 端强制规则

NodeAgent 必须：

- 只从 Backend manifest/package API 同步。
- 不直接访问第三方 GeoIP source。
- HMAC 调用 internal API。
- sha256 必须匹配。
- corrupted package 不覆盖 current。
- rollback 使用 LKG。
- status/error redaction（不泄露 signature/token/path）。
- unknown format 拒绝。
- 下载失败不覆盖 current。
- 校验签名（prod required 时）。
- 校验 compatibility。

## 14. Admin GeoIP Contract — 当前实现

### 14.1 Admin 端 API

Admin 通过 admin JWT + permission 控制访问：

| 操作 | Method | Path | 所需权限 |
| --- | --- | --- | --- |
| List databases | GET | `/admin/api/v1/geoip/databases` | `geoip:read` 或 `audit:read` |
| Get database detail | GET | `/admin/api/v1/geoip/databases/{id}` | `geoip:read` |
| Activate database | POST | `/admin/api/v1/geoip/databases/{id}/activate` | `geoip:write` |
| Rollback database | POST | `/admin/api/v1/geoip/databases/{id}/rollback` | `geoip:write` |
| Trigger update | POST | `/admin/api/v1/geoip/update` | `geoip:write` |

### 14.2 当前实现状态

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| Types & Interfaces | ✅ 已完成 | `src/types/geoip.ts` — 完整类型定义 |
| API client（5 endpoints） | ✅ 已完成 | `src/lib/geoip-api.ts` |
| Mock data（6 DBs、4 jobs、3 events） | ✅ 已完成 | `src/lib/geoip-mock.ts` |
| React Query hooks（5 hooks） | ✅ 已完成 | `src/hooks/use-geoip.ts` |
| RBAC permissions（geoip:read/write） | ✅ 已完成 | 权限已注册，role→permission mapping 已定义 |
| Admin UI pages | ❌ 未开始 | TASK-ADMIN-GEOIP-001 前端页面（databases、app-packages、sources、rollouts） |
| Config management UI | ❌ 未开始 | GeoIP 运行时配置管理尚未建设 |

### 14.3 Admin 可见字段

Admin 可以查看：

| 可见 | 不可见 |
| --- | --- |
| source | storage_path |
| edition | local filesystem path |
| format | license key |
| profile | cloud credential |
| version | manifest signing key |
| sha256 | signed URL token |
| size_bytes | node_secret |
| license | hmac |
| attribution | private_key |
| status | |
| generated_at | |
| expires_at | |
| compatibility | |
| update job status | |
| rollout event | |

### 14.4 Admin RBAC 权限映射

| 角色 | `geoip:read` | `geoip:write` |
| --- | --- | --- |
| SuperAdmin | ✅ | ✅ |
| Admin | ✅ | ✅ |
| Auditor | ✅ | ❌ |
| Operator | ✅ | ✅ |

## 15. CI/CD GeoIP Smoke Contract — 当前实现

### 15.1 TASK-CICD-GEOIP-001 已覆盖

| # | 测试域 | 测试小节数 | 涵盖内容 |
| --- | --- | --- | --- |
| 1 | Backend GeoIP manifest | 4 | App manifest JWT auth、no-token 401、package download、event reporting |
| 2 | NodeAgent HMAC check/package/events | 5 | HMAC auth、wrong HMAC 401、expired timestamp 401、package download、event |
| 3 | App GeoIP manifest auth | 2 | website audience、admin audience mismatch |
| 4 | Admin GeoIP RBAC | 6 | admin list/detail/update、no-token 401、user-token 403、write permission |
| 5 | Package SHA256 校验 | 3 | hex 格式验证、长度 64、NodeAgent SHA256 字段存在性 |
| 6 | Corrupted package 保护 | 1 | SHA256 mismatch detection contract 验证 |
| 7 | Source/profile/format validation | 3 | unknown source rejection（400）、known source acceptance、format field |
| 8 | Path traversal / secret leak | 3 | storage_path leak check、7 敏感字段 pattern、internal path exposure |

### 15.2 TASK-CICD-GEOIP-HARDENING-002 待覆盖

以下 hardening smoke 尚未实现：

| # | 测试域 | 说明 |
| --- | --- | --- |
| 1 | Manifest signature verify | signature 存在但错误时拒绝下载 |
| 2 | App 429 rate limit | 超过 limit 后返回 429，App 不无限重试 |
| 3 | Delta fallback | delta 不可用时 fallback full |
| 4 | MaxMind tar.gz | 未解压的 tar.gz 不被当作 mmdb 下发 |
| 5 | Storage path leak regression | 确保 storage_path 始终不出现 |

### 15.3 集成方式

- `scripts/geoip-smoke.sh` — 独立可执行的 smoke 脚本
- `scripts/smoke.sh` — 编排器，在 content smoke 后调用
- `.github/workflows/staging-smoke.yml` — CI workflow step
- `scripts/api-smoke-cases.tsv` — 附加 3 个 API case（manifest、admin RBAC）

## 16. MaxMind tar.gz 待办

当前 `TASK-BACKEND-GEOIP-SOURCE-002` **未实现** MaxMind tar.gz extraction。

规则：

- 不得把 `.tar.gz` 直接当 `maxmind-mmdb` 下发。
- 未实现前必须返回明确错误（adapter 返回 `not implemented`）。

后续任务：

| Task ID | Goal |
| --- | --- |
| `TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` | Implement MaxMind tar.gz decompression and .mmdb extraction |

`TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` 必须：

- 下载 tar.gz
- 安全解压（防 zip-slip / path traversal）
- 提取 `.mmdb`
- 校验 sha256
- normalize 为 `maxmind-mmdb`

## 17. 后续任务索引

| Task ID | Repo | Goal |
| --- | --- | --- |
| `TASK-APP-GEOIP-001` | `livemask-app` | App GeoIP manifest/package sync, cache, sha256, LKG, events ✅ |
| `TASK-APP-GEOIP-LOOKUP-001` | `livemask-app` | App GeoIP lookup engine 实现 |
| `TASK-ADMIN-GEOIP-001` | `livemask-admin` | Admin GeoIP databases/update/rollout UI ✅ |
| `TASK-BACKEND-GEOIP-001` | `livemask-backend` | GeoIP source registry, update job, APIs ✅ |
| `TASK-BACKEND-GEOIP-SOURCE-002` | `livemask-backend` | Source hardening, storage, signature, rate limit, delta ✅ |
| `TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` | `livemask-backend` | MaxMind tar.gz decompression + .mmdb extraction |
| `TASK-NODEAGENT-GEOIP-001` | `livemask-nodeagent` | GeoIP sync manager, verifier, LKG, rollback ✅ |
| `TASK-NODEAGENT-GEOIP-002` | `livemask-nodeagent` | Event retry queue |
| `TASK-NODEAGENT-GEOIP-003` | `livemask-nodeagent` | Manifest signature verify + key rotation |
| `TASK-NODEAGENT-GEOIP-004` | `livemask-nodeagent` | Delta package apply |
| `TASK-NODEAGENT-GEOIP-005` | `livemask-nodeagent` | Lookup engine |
| `TASK-NODEAGENT-GEOIP-006` | `livemask-nodeagent` | Heartbeat contract extension |
| `TASK-NODEAGENT-GEOIP-007` | `livemask-nodeagent` | Compatibility gate |
| `TASK-NODEAGENT-GEOIP-008` | `livemask-nodeagent` | Runtime config integration |
| `TASK-CICD-GEOIP-001` | `livemask-ci-cd` | GeoIP update and rollback smoke ✅ |
| `TASK-CICD-GEOIP-HARDENING-002` | `livemask-ci-cd` | Signature/rate-limit/delta-fallback/source-hardening smoke |
| `TASK-APP-NODE-REGION-001` | `livemask-app` | Safe region display using Backend fields + local GeoIP |
| `TASK-DOC-GEOIP-CONTRACT-002` | `livemask-docs` | 本契约 |
| `TASK-DOC-GEOIP-CREDENTIALS-001` | `livemask-docs` | GeoIP credential management contract — credential priority, encryption key, Admin API, secret redaction, audit, env fallback |

## 18. Companion Contracts

此文档是 GeoIP 相关合同系列的一部分：

- [GEOIP_DATABASE_SYNC_CONTRACT.md](GEOIP_DATABASE_SYNC_CONTRACT.md) — 基础 GeoIP 数据库同步、版本分发、回滚
- [GEOIP_CREDENTIAL_MANAGEMENT_CONTRACT.md](GEOIP_CREDENTIAL_MANAGEMENT_CONTRACT.md) — Credential 管理：优先级、加密、Admin API、redaction、audit

## 19. 完成标准

本契约完成后，必须满足：

- [ ] Docs check 通过。
- [ ] 明确 Backend / App / NodeAgent / Admin / CI/CD 职责。
- [ ] 明确 source allowlist 与格式兼容规范。
- [ ] 明确 manifest signature 行为。
- [ ] 明确 full/delta fallback。
- [ ] 明确 rate limit。
- [ ] 明确 MaxMind tar.gz 当前限制。
- [ ] 明确 unknown format/profile 处理。
- [ ] 不引入任何真实 secret、license key、token、URL credential。
- [ ] 各仓库当前实现状态已记录。
- [ ] 未完成项已登记后续任务。
