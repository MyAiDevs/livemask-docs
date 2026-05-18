# GeoIP Source Hardening Contract

> Task: `TASK-DOC-GEOIP-CONTRACT-002`
> Owner: Backend / NodeAgent / App / Admin / DevOps
> Status: Draft
> Scope: Supplement to `TASK-BACKEND-GEOIP-SOURCE-002`. Defines GeoIP production hardening capabilities: third-party source download, source allowlist, artifact storage abstraction, manifest signature, full/delta package strategy, App API rate limit, unknown format/profile handling, MaxMind tar.gz extraction, and security boundaries.

## 1. 目标

本契约补充 `TASK-BACKEND-GEOIP-SOURCE-002` 后新增的 GeoIP 生产化能力，统一约束 Backend、NodeAgent、App、Admin、CI/CD 对以下能力的理解：

- 真实第三方 GeoIP source 下载
- Source allowlist
- Artifact storage 抽象
- Manifest signature
- Full / delta package strategy
- App API rate limit
- Unknown format/profile 处理
- MaxMind tar.gz 待办
- 安全边界：SSRF、path traversal、secret leak、signed URL redaction

## 2. Source Allowlist

Backend 只能从内置 allowlist source 拉取 GeoIP 数据库。

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

## 3. Source 格式规范

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

## 4. Hackl0us/GeoIP2-CN

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
- 如果 Hackl0us 源未来变更文件格式，Backend adapter 负责兼容或返回 `GEOIP_UNKNOWN_FORMAT`。

## 5. Download Security

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

## 6. Artifact Storage

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

## 7. Manifest Signature

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
- `dev` 环境允许 unsigned manifest，但 response/status 应带 warning 或 signature 为空。

NodeAgent/App 行为：

| 场景 | NodeAgent | App |
| --- | --- | --- |
| signature 存在且校验通过 | 可继续下载 | 可继续下载 |
| signature 存在但校验失败 | 拒绝下载，不覆盖 current | 拒绝下载，不覆盖 current |
| signature 缺失，dev mode | warning/degraded 可接受 | warning 可接受 |
| signature 缺失，prod required | 拒绝 | 拒绝 |

## 8. Manifest 字段

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

## 9. Full / Delta Strategy

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

NodeAgent/App：

- delta 未实现时必须 fallback full 或拒绝并保持 current。
- delta apply 失败不能覆盖 current。
- full package 校验成功后才能 promote current。

## 10. Rate Limit

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

## 11. Admin 可见字段

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

## 12. NodeAgent 行为要求

NodeAgent 必须：

- 只从 Backend manifest/package API 同步。
- 不直接访问第三方 GeoIP source。
- 校验 sha256。
- 校验 signature，如果 prod 要求开启。
- 拒绝 unknown format。
- 检查 compatibility。
- 下载失败不覆盖 current。
- 校验失败不覆盖 current。
- 支持 LKG rollback。
- error/status 不泄露 signature/token/path。

状态建议：

| Status | Description |
| --- | --- |
| `disabled` | GeoIP sync disabled |
| `ready` | Current package is valid |
| `syncing` | Download in progress |
| `stale` | Current package out of date |
| `failed` | Sync failed |
| `unsupported` | Unknown format |
| `signature_failed` | Signature verification failed |
| `incompatible` | Version compatibility check failed |

## 13. App 行为要求

App 必须：

- 只从 Backend `/api/v1/geoip/*` 同步。
- 不直接访问第三方 GeoIP source。
- 使用用户 JWT。
- 解析 optional `signature`、`strategy`、`fallback_full`。
- sha256 mismatch 不覆盖 current。
- unsupported format 不 crash。
- rate limit 429 不无限重试。
- GeoIP sync 失败不影响登录、连接、计费等核心功能。
- 本地缓存需要 `current` + `LKG`。
- event 上报失败不得阻塞主流程。

## 14. CI/CD 验收矩阵

`TASK-CICD-GEOIP-001` 或后续 smoke 必须覆盖：

| # | Test case | Expected |
| --- | --- | --- |
| 1 | Backend manifest returns active database | 200 OK |
| 2 | App manifest requires JWT | 401 without token |
| 3 | NodeAgent check requires HMAC | 401 without HMAC |
| 4 | Wrong HMAC rejected | 403 |
| 5 | Expired timestamp rejected | 403 |
| 6 | Package download works | 200 OK, valid content |
| 7 | SHA256 matches | Verification passes |
| 8 | Corrupted package rejected | Verification fails, LKG preserved |
| 9 | Unknown source rejected | Error returned |
| 10 | Unknown format rejected | Error returned |
| 11 | Path traversal rejected | Error returned |
| 12 | Admin list/detail requires `geoip:read` | 403 without permission |
| 13 | Admin update/activate/rollback requires `geoip:write` | 403 without permission |
| 14 | No storage_path leak | Response redacts storage path |
| 15 | No signing key leak | Response/log redacts signing key |
| 16 | No token/hmac/private_key leak | Response/log redacts secrets |
| 17 | Rate limit returns 429 | 429 after exceeding limit |
| 18 | Delta unavailable falls back to full | `fallback_full=true` |

## 15. MaxMind tar.gz 待办

当前 `maxmind_geolite2` 需要特别说明：

- MaxMind 官方下载通常可能是压缩包格式，例如 `.tar.gz`。
- Backend adapter 需要解压并提取 `.mmdb`。
- 当前 `TASK-BACKEND-GEOIP-SOURCE-002` 已标记待办：`tar.gz extraction not implemented`。

在提取实现完成前：

- MaxMind source 可以返回明确错误；
- 不得把 `.tar.gz` 直接标记为可用 `maxmind-mmdb`；
- 不得向 App/NodeAgent 下发不可直接读取的 tar 包，除非 manifest 明确 `compression=tar.gz` 且客户端支持。

后续建议任务：

| Task ID | Goal |
| --- | --- |
| `TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` | Implement MaxMind tar.gz decompression and .mmdb extraction |

## 16. 后续任务

| Task ID | Repo | Goal |
| --- | --- | --- |
| `TASK-APP-GEOIP-001` | `livemask-app` | App GeoIP manifest/package sync, cache, sha256, LKG, events |
| `TASK-DOC-GEOIP-CONTRACT-002` | `livemask-docs` | 补充本契约 |
| `TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` | `livemask-backend` | 实现 MaxMind tar.gz 解压和 .mmdb 提取 |
| `TASK-NODEAGENT-GEOIP-003` | `livemask-nodeagent` | Manifest signature verify + key rotation |
| `TASK-NODEAGENT-GEOIP-004` | `livemask-nodeagent` | Delta package apply |
| `TASK-CICD-GEOIP-HARDENING-002` | `livemask-ci-cd` | 覆盖 signature/rate-limit/delta fallback/source hardening smoke |

## 17. 完成标准

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
