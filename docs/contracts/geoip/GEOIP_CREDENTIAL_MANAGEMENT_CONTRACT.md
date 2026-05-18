# GeoIP Credential Management Contract

> Task: `TASK-DOC-GEOIP-CREDENTIALS-001`
> Owner: Backend / Admin / DevOps
> Status: Draft
> Scope: Defines GeoIP credential priority, encryption key, Admin API, secret redaction,
> audit behavior, env fallback, and CI/CD smoke coverage for
> `TASK-CICD-GEOIP-CREDENTIALS-001`.

## 1. 目标

本契约补充 `GEOIP_SOURCE_HARDENING_CONTRACT.md` 中未覆盖的 GeoIP 第三方 source
credential 管理能力，统一约束 Backend、Admin、CI/CD 对以下能力的理解：

- Credential 存储优先级（env → DB）
- Encryption key 生命周期
- Admin API 完整 CRUD + action 端点
- Secret redaction（API response、audit log、error message）
- Env fallback 不破坏现有 GeoIP update flow

## 2. Credential 存储优先级

每个 GeoIP source 可能包含以下敏感字段：

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| `license_key` | License key / subscription key | `sk-xxxx` |
| `api_key` | API key / access key | `ak-xxxx` |
| `token` | Bearer token | 第三方签发的 token |
| `endpoint_url` | 下载 URL（可能含 query credential） | `https://example.com/dl?key=xxx` |

### 2.1 优先级（从高到低）

1. **环境变量** — 每个 source 独立 env var，格式：
   - `GEOIP_{SOURCE}_LICENSE_KEY`
   - `GEOIP_{SOURCE}_API_KEY`
   - `GEOIP_{SOURCE}_ENDPOINT_URL`
   示例：`GEOIP_MAXMIND_GEOLITE2_LICENSE_KEY`

2. **数据库 `geoip_sources` 表** — 加密存储（AES-256-GCM），由
   `GEOIP_CREDENTIAL_ENCRYPTION_KEY` 加密。

3. **硬编码默认值** — 仅在 dev 模式下允许空值；production 必须提供 env 或 DB
   credential。

读取逻辑：

```
Backend 初始化 GeoIP source 时：
  1. 优先读取环境变量 GEOIP_{SOURCE}_XXX
  2. 环境变量不存在时，从 geoip_sources 表读取解密后的 credential
  3. 都不存在 → 降级 / 返回配置错误
```

### 2.2 Encrypted DB 存储

`geoip_sources` 表新增字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `encrypted_license_key` | `text` / `bytea` | AES-256-GCM 加密 |
| `encrypted_api_key` | `text` / `bytea` | AES-256-GCM 加密 |
| `encrypted_token` | `text` / `bytea` | AES-256-GCM 加密 |
| `endpoint_url` | `text` | 明文 URL（但仍可能在 response 中 redacted） |
| `credential_updated_at` | `timestamptz` | 最近一次 credential 变更时间 |
| `credential_updated_by` | `uuid` | 操作人 user_id |

加密要求：

| 约束 | 规则 |
| --- | --- |
| 算法 | AES-256-GCM |
| Key 来源 | 环境变量 `GEOIP_CREDENTIAL_ENCRYPTION_KEY` |
| Key 长度 | 32 字节（256 bit） |
| Nonce | 随机 12 字节，每次加密重新生成 |
| AAD | source name（防密文重放） |
| 存储 | nonce + ciphertext，hex 编码存 text 字段 |

### 2.3 Encryption Key 安全规则

| 场景 | 规则 |
| --- | --- |
| Dev 默认值 | `GEOIP_CREDENTIAL_ENCRYPTION_KEY=dev-encryption-key-32bytes-long-for-aes-gcm!!` |
| Production | 必须使用真实密钥，长度 32 字节 |
| Key rotation | 先写入新 key + 重新加密所有 credential，再删除旧 key |
| API response 泄露 | 禁止返回 `GEOIP_CREDENTIAL_ENCRYPTION_KEY` 给任何 API 调用 |
| Log 泄露 | 禁止写入 logs / audit |

## 3. Admin API 端点

所有端点位于 `/admin/api/v1/geoip/sources`，需要 `geoip:read` 或 `geoip:write`
权限。

### 3.1 Read 端点（`geoip:read`）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/admin/api/v1/geoip/sources` | 列出所有 source（不含 credential 字段） |
| GET | `/admin/api/v1/geoip/sources/{source}` | 单个 source 详情（不含 credential 字段） |

### 3.2 Write 端点（`geoip:write`）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| PUT | `/admin/api/v1/geoip/sources/{source}` | 更新 credential（license_key, api_key, endpoint_url） |
| POST | `/admin/api/v1/geoip/sources/{source}/verify` | 用当前 credential 测试第三方 source 连接 |
| POST | `/admin/api/v1/geoip/sources/{source}/rotate-secret` | 重新加密所有 credential（换 nonce） |
| POST | `/admin/api/v1/geoip/sources/{source}/disable` | 禁用 source（不影响 DB credential） |
| POST | `/admin/api/v1/geoip/sources/{source}/enable` | 启用 source |

### 3.3 RBAC 权限映射

| 角色 | `geoip:read` | `geoip:write` |
| --- | --- | --- |
| SuperAdmin | ✅ | ✅ |
| Admin | ✅ | ✅ |
| Auditor | ✅ | ❌ |
| Operator | ✅ | ✅ |

| 场景 | 预期结果 |
| --- | --- |
| 无 token | 401 |
| User token（app audience） | 403 |
| Auditor 读取 | 200 |
| Auditor 写入（PUT/verify/rotate/disable/enable） | 403 |
| Admin 读取 | 200 |
| Admin 写入 | 200/201 |

## 4. Secret Redaction

### 4.1 API Response 禁止字段

以下字段**不得**出现在任何 API response 的 JSON body 中：

| 字段 | 原因 |
| --- | --- |
| `encrypted_secret` / `encrypted_license_key` / `encrypted_api_key` | 密文不应暴露给前端 |
| `plaintext` / `plaintext_secret` | 明文 credential |
| `license_key` | 第三方 license key |
| `api_key` | 第三方 API key |
| `token`（bare key） | 非 access_token/refresh_token 的 token 字段 |
| `GEOIP_CREDENTIAL_ENCRYPTION_KEY` | 加密密钥 |
| `encryption_key` | 加密密钥 |

允许的例外：

| 字段 | 条件 |
| --- | --- |
| `access_token` | JWT auth response |
| `refresh_token` | JWT auth response |
| 非 `credential` 上下文的 `token` | 如 push notification token |

### 4.2 `endpoint_url` 处理

| 场景 | 行为 |
| --- | --- |
| URL 无 query param | 返回完整 URL |
| URL 含 query param（`?key=xxx`） | query 部分替换为 `REDACTED` |
| URL 含 path credential | 由 adapter 控制，path 中的密钥也必须 redact |
| URL 为空 | 返回空字符串 |

### 4.3 Audit Log Redaction

操作 audit log 时：

| 允许记录 | 禁止记录 |
| --- | --- |
| source name, edition, profile, version | encrypted_secret |
| 操作类型（update/verify/rotate/disable/enable） | plaintext credential |
| 操作人 ID、时间 | license_key, api_key |
| 操作结果（success/failure） | encryption key |
| 变更摘要（`credential_updated: true`） | endpoint_url query params |

Audit log 中 credential 相关操作以 `credential_updated` 或 `secret_rotated`
形式记录，不包含实际值。

### 4.4 Error Message Redaction

| 场景 | 规则 |
| --- | --- |
| 第三方 source 连接失败 | 返回 `GEOIP_SOURCE_CONNECTION_FAILED` |
| Encryption/decryption 失败 | 返回 `GEOIP_CREDENTIAL_ENCRYPTION_ERROR` |
| Credential 缺失 | 返回 `GEOIP_SOURCE_CREDENTIAL_MISSING` |
| 具体错误细节 | 仅记录在 server log，不返回给客户端 |

## 5. Env Fallback Rule

Env fallback **不能破坏**现有的 GeoIP update 功能。

具体规则：

| 场景 | 预期行为 |
| --- | --- |
| 某些 source 仅通过 env 配置 credential | Admin update 不受影响 |
| 某些 source 仅通过 DB 配置 credential | Admin update 正常 |
| 某些 source 没有任何 credential | 该 source 的 update job 返回 credential_missing |
| 其他 source 不受影响 | 继续正常触发 update |
| `POST /admin/api/v1/geoip/update` | 仍可调用，不受 credential 管理影响 |
| `GET /api/v1/geoip/manifest` | App manifest 不受 credential 管理影响 |

## 6. Credential 生命周期

```text
[创建]
Backend 首次启动 → 从 env 读取 credential → 加密写入 geoip_sources
                                      ↘ env 不存在 → source 标记为 credential_missing

[更新] (Admin PUT)
用户提交 license_key → Backend 加密 → 更新 geoip_sources → 记录 audit log
                                                         ↘ 返回成功（不含 credential 明文）

[验证] (Admin verify)
Admin 触发 verify → Backend 用当前 credential（env 优先）尝试连接第三方
                  → 成功 → 返回 ok
                  → 失败 → 返回错误码（不含具体失败原因中的 credential）

[轮换] (Admin rotate-secret)
Admin 触发 rotate → Backend 重新加密所有现有 credential（换 nonce）
                  → 更新 credential_updated_at → 记录 audit log

[禁用/启用] (Admin disable/enable)
不影响 DB credential 数据。
仅影响 source 的 enabled 状态。
```

## 7. CI/CD Smoke Coverage

对应 `TASK-CICD-GEOIP-CREDENTIALS-001`，`scripts/geoip-credentials-smoke.sh` 覆盖：

| 节 | 测试域 | 涵盖 |
| --- | --- | --- |
| 1 | Admin login | 3 种角色（admin、auditor、user） |
| 2 | GET sources list | 200、security scan |
| 3 | GET source detail | 200、name match、security scan |
| 4 | PUT credential | 更新 credential、security scan |
| 5 | POST verify | 200/202、security scan |
| 6 | POST rotate-secret | 200、security scan |
| 7 | POST disable | 200 |
| 8 | POST enable | 200 |
| 9 | No token → 401 | 7 个端点 |
| 10 | User token → 403 | 7 个端点 |
| 11 | Auditor read/write RBAC | 5 个子测试（read OK、write 403） |
| 12 | API 响应不含敏感字段 | 全 response 安全扫描 |
| 13 | endpoint_url redaction | URL query 检查 |
| 14 | Audit log 不含 secret | DB audit_log 表检查 |
| 15 | Env fallback 不破坏 update | 3 个子测试（update、manifest、DB list） |

集成方式：

- `scripts/geoip-credentials-smoke.sh` — 独立可执行的 smoke 脚本
- `scripts/smoke.sh` — 编排器，在 geoip-smoke.sh 后调用
- `.github/workflows/staging-smoke.yml` — CI workflow step
- `scripts/api-smoke-cases.tsv` — 附加 ~12 个 API case

## 8. 后续任务索引

| Task ID | Repo | Goal |
| --- | --- | --- |
| `TASK-CICD-GEOIP-CREDENTIALS-001` | `livemask-ci-cd` | GeoIP credentials smoke（本任务） |
| `TASK-BACKEND-GEOIP-CREDENTIALS-001` | `livemask-backend` | GeoIP credential encryption, Admin API, redaction, audit |

## 9. 完成标准

- [ ] Credential 优先级（env → DB）已实现
- [ ] Encryption key 生命周期已定义
- [ ] Admin API 所有端点已实现 ± smoke 覆盖
- [ ] Secret redaction 规则已实现（response、audit、error）
- [ ] Audit log 不含 credential 明文
- [ ] Env fallback 不破坏现有 GeoIP update
- [ ] CI/CD smoke 全部 PASS
