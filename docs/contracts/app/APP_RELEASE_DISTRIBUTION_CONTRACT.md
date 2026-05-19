# App Release Distribution Contract

> Task: `TASK-DOC-APP-RELEASE-DISTRIBUTION-001`
> Owner: Backend / Admin / App / Website / CI-CD / Docs
> Status: Ready
> Scope: Defines LiveMask App version release management across Admin,
> Backend, artifact storage, App update check, Website downloads, CI/CD build
> upload, rollout channels, signatures, audit, rollback, and secret boundaries.

Related mandatory contracts:

- [Admin System Settings Contract](../admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md)
- [Admin Job Center / Scheduler Contract](../jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [Content System Contract](../content/CONTENT_SYSTEM_CONTRACT.md)
- [I18N Localization Contract](../i18n/I18N_LOCALIZATION_CONTRACT.md)
- [Log / Audit / Metric Pipeline Contract](../observability/LOG_METRIC_PIPELINE_CONTRACT.md)

## 1. Why This Exists

`/admin` currently lacks a first-class App version release surface. LiveMask must
manage desktop/mobile installers, checksums, signatures, release notes,
channels, forced/minimum versions, rollout cohorts, and storage providers in a
single controlled workflow.

Supported artifact storage targets:

- AWS S3-compatible object storage
- Alibaba Cloud OSS
- Tencent Cloud COS
- Google Cloud Storage
- Server-local artifact storage behind Backend download proxy
- Future CDN layer in front of any of the above

Admin must not be a raw object browser. It creates release intent, sees safe
metadata, publishes/pauses/revokes versions, and observes update adoption.
Backend owns metadata, signed download URLs/proxy paths, validation, audit, and
public update-check APIs. CI/CD owns building, checksumming, signing, and
uploading artifacts.

## 2. Product Surfaces

| Surface | Route | Purpose |
| --- | --- | --- |
| Admin Release Control | `/admin/releases` | Shared release-control entry for App releases and NodeAgent releases |
| Admin App Releases | `/admin/app/releases` | Manage App versions, artifacts, channels, publish/revoke/rollback |
| Admin App Release Detail | `/admin/app/releases/{release_id}` | Artifact matrix, rollout, events, adoption, download status |
| Admin App Release Settings | `/admin/settings/app-releases` | Storage provider, signing key status, CDN/download policy |
| Website Downloads | `/download` or `/downloads` | Public latest stable downloads and release notes |
| App Update Check | App startup/settings | Check latest compatible version and show update UX |

Admin information architecture:

- App Release and NodeAgent Release may live under the same Operations
  **Release Control** menu/page, with `/admin/releases` as an optional overview.
- `/admin/app/releases` remains the canonical App release deep link.
- `/admin/nodeagent/releases` remains the canonical NodeAgent release deep link.
- The shared page/group must use separate tabs or sections. Permissions, API
  clients, data models, audit actions, and rollout semantics must not be mixed.
- NodeAgent binary release and App release are separate domains even though both
  use artifact storage, signatures, release notes, and publish/pause/rollback
  style workflows.

## 3. Release Channels And Platforms

### 3.1 Channels

| Channel | Purpose | Public |
| --- | --- | --- |
| `stable` | Default production release | Yes |
| `beta` | Opt-in pre-release | Optional |
| `internal` | Staff/tester release | No |
| `hotfix` | Emergency patch track | Yes, when published |

### 3.2 Platforms

| Platform | Artifact Examples | Notes |
| --- | --- | --- |
| `android` | `.apk`, future `.aab` metadata | Direct APK download supported; Play Store link may be added later |
| `ios` | App Store/TestFlight metadata, `.ipa` internal artifact if allowed | Public iOS updates usually route to App Store/TestFlight |
| `macos` | `.dmg`, `.zip`, `.pkg` | Must include architecture and signing/notarization metadata |
| `windows` | `.exe`, `.msi`, `.zip` | Must include installer type and code-signing status |
| `linux` | `.AppImage`, `.deb`, `.rpm`, `.tar.gz` | Must include distro/arch compatibility |

Architecture values: `arm64`, `x64`, `universal`, `armv7`, `unknown`.

## 4. Domain Model

### 4.1 App Release

```json
{
  "release_id": "uuid",
  "version": "1.4.0",
  "build_number": "10400",
  "channel": "stable",
  "status": "draft",
  "title": "LiveMask 1.4.0",
  "release_notes_content_id": "uuid",
  "min_supported_version": "1.2.0",
  "force_update_below": "1.1.0",
  "rollout_percentage": 10,
  "target_filters": {
    "platforms": ["android", "macos"],
    "regions": ["global"],
    "locales": ["zh-CN", "en-US"]
  },
  "published_at": null,
  "revoked_at": null,
  "created_by": "uuid",
  "updated_by": "uuid",
  "created_at": "2026-05-19T08:00:00Z",
  "updated_at": "2026-05-19T08:00:00Z"
}
```

### 4.2 App Release Artifact

```json
{
  "artifact_id": "uuid",
  "release_id": "uuid",
  "platform": "macos",
  "arch": "universal",
  "artifact_type": "dmg",
  "storage_provider": "oss",
  "storage_key": "app/releases/1.4.0/macos/universal/LiveMask-1.4.0-universal.dmg",
  "download_url": null,
  "size_bytes": 125829120,
  "sha256": "hex",
  "signature": "base64",
  "signature_algorithm": "ed25519",
  "notarization_status": "passed",
  "code_signing_status": "passed",
  "uploaded_by": "ci",
  "uploaded_at": "2026-05-19T08:10:00Z"
}
```

Rules:

- Admin API responses must not expose raw `storage_key` by default. Detail APIs
  may expose a masked key for operators with `app_release:write`.
- Public/App APIs return Backend-issued `download_url` or Backend proxy path,
  never storage credentials.
- Every artifact requires `sha256`, `size_bytes`, and either `signature` or an
  explicit documented store-only exception for App Store/TestFlight metadata.
- Artifact path segments must be generated server-side. User-controlled paths
  are forbidden.

### 4.3 Storage Provider Settings

```json
{
  "provider": "oss",
  "enabled": true,
  "bucket": "livemask-artifacts",
  "region": "oss-cn-hongkong",
  "base_prefix": "app/releases",
  "cdn_base_url": "https://download.example.com",
  "secret_hint": "access_key: ****abcd",
  "signed_url_ttl_seconds": 600,
  "last_verified_at": "2026-05-19T08:00:00Z"
}
```

Supported `provider`: `s3`, `oss`, `cos`, `gcs`, `local`.

Secrets such as access key, secret key, role ARN, STS token, COS secret,
OSS secret, GCS service account JSON, workload identity binding, local
filesystem root, and signing private key are write-only and must never be
returned. Admin shows only `secret_hint`, provider health, and last
verification result.

## 5. State Model

| Status | Meaning | Terminal |
| --- | --- | --- |
| `draft` | Metadata exists but not published | No |
| `uploaded` | Required artifacts uploaded and validated | No |
| `published` | Eligible clients can receive update | No |
| `paused` | Temporarily hidden from update checks | No |
| `revoked` | Release must not be offered | Yes |
| `superseded` | Replaced by a newer published release | Yes |
| `failed` | Validation/upload failed | Yes |

Allowed transitions:

```text
draft -> uploaded -> published -> paused -> published
published -> superseded
published -> revoked
draft/uploaded -> failed
```

Revoked releases remain in history and must not be physically deleted while any
audit, adoption, or support record references them.

## 6. Backend Admin API Contract

All Admin endpoints require Admin JWT audience.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/api/v1/app/releases` | `app_release:read` | List releases with filters |
| POST | `/admin/api/v1/app/releases` | `app_release:write` | Create draft release metadata |
| GET | `/admin/api/v1/app/releases/{release_id}` | `app_release:read` | Release detail |
| PUT | `/admin/api/v1/app/releases/{release_id}` | `app_release:write` | Update draft/paused release metadata |
| DELETE | `/admin/api/v1/app/releases/{release_id}` | `app_release:write` | Delete draft only |
| POST | `/admin/api/v1/app/releases/{release_id}/artifacts` | `app_release:write` | Register uploaded artifact metadata |
| POST | `/admin/api/v1/app/releases/{release_id}/publish` | `app_release:write` | Publish release |
| POST | `/admin/api/v1/app/releases/{release_id}/pause` | `app_release:write` | Pause rollout |
| POST | `/admin/api/v1/app/releases/{release_id}/resume` | `app_release:write` | Resume rollout |
| POST | `/admin/api/v1/app/releases/{release_id}/revoke` | `app_release:write` | Revoke release |
| POST | `/admin/api/v1/app/releases/{release_id}/rollback` | `app_release:write` + `jobs:execute` | Create rollback/republish job if needed |
| GET | `/admin/api/v1/app/releases/{release_id}/events` | `app_release:read` | Release event timeline |
| GET | `/admin/api/v1/app/releases/{release_id}/adoption` | `app_release:read` | Version adoption and update telemetry |
| GET | `/admin/api/v1/app-release-storage` | `settings:read` | Read safe storage settings |
| PUT | `/admin/api/v1/app-release-storage` | `settings:write` | Update write-only storage settings |
| POST | `/admin/api/v1/app-release-storage/verify` | `settings:verify` | Verify storage provider through Job Service |

Filters for list:

- `platform`
- `channel`
- `status`
- `version`
- `created_after`
- `created_before`
- `page`
- `limit`

## 7. Public / App API Contract

### 7.1 Update Check

```http
GET /api/v1/app/releases/check?platform=android&arch=arm64&version=1.3.0&build_number=10300&channel=stable&locale=zh-CN
```

Response:

```json
{
  "update_available": true,
  "force_update": false,
  "release": {
    "version": "1.4.0",
    "build_number": "10400",
    "channel": "stable",
    "title": "LiveMask 1.4.0",
    "release_notes": "localized summary",
    "download_url": "https://backend.example/api/v1/app/releases/artifacts/uuid/download",
    "artifact_type": "apk",
    "size_bytes": 98234123,
    "sha256": "hex",
    "signature": "base64",
    "signature_algorithm": "ed25519"
  },
  "poll_after_seconds": 21600
}
```

Rules:

- The check endpoint is rate-limited by device/user/IP.
- It must return `update_available=false` when there is no compatible release.
- It must not expose storage provider secrets or object keys.
- Forced update only applies when `current_version < force_update_below` or a
  security revocation rule requires it.
- iOS may return `store_url` or `testflight_url` instead of a direct artifact.

### 7.2 Download

```http
GET /api/v1/app/releases/artifacts/{artifact_id}/download
```

Backend may proxy the object or issue a short-lived signed URL. Download events
should be logged as safe summary events without raw signed query parameters.

### 7.3 App Event Reporting

```http
POST /api/v1/app/releases/events
```

Allowed event types:

- `update_prompt_shown`
- `download_started`
- `download_succeeded`
- `download_failed`
- `install_started`
- `install_deferred`
- `install_succeeded`
- `install_failed`
- `version_active`

Events must be safe: no local file path, no device secret, no full signed URL,
no crash stack. App crash/exception details remain in Sentry.

## 8. Admin UI Requirements

`livemask-admin` must implement:

- Sidebar route `/admin/app/releases`.
- Release list with channel/status/platform/version filters.
- Create/edit draft release metadata.
- Artifact matrix by platform/arch/artifact type.
- Storage provider status with link to `/admin/settings/app-releases`.
- Publish, pause, resume, revoke, rollback actions with confirmation.
- Release notes link to Content System `release_note`.
- Adoption chart: active versions, downloads, failed installs, forced-update users.
- Event timeline with redacted metadata.
- Chinese default labels and English fallback.
- No raw storage key, local path, access key, secret key, private signing key, or
  signed URL query string displayed.

Admin upload behavior:

- MVP may use CI/CD upload only and let Admin register metadata.
- If Admin direct upload is implemented, it must request a Backend-issued
  pre-signed upload URL or upload through Backend with size/type limits.
- Admin must never ask the operator to paste cloud access keys into a release
  form. Storage credentials belong in System Settings and are write-only.

## 9. Artifact Storage And Security

Required storage abstraction:

| Provider | Backend Adapter |
| --- | --- |
| S3-compatible | `S3AppReleaseStorage` |
| Alibaba OSS | `OSSAppReleaseStorage` |
| Tencent COS | `COSAppReleaseStorage` |
| Google Cloud Storage | `GCSAppReleaseStorage` |
| Local server | `LocalAppReleaseStorage` |

Security rules:

- Storage provider config uses secret references or encrypted credential storage.
- Raw credentials are never stored in release rows or job parameters.
- Backend validates artifact MIME/type, extension, size cap, sha256, signature,
  and platform/arch compatibility before publishing.
- Direct object keys use deterministic prefix:
  `app/releases/{version}/{platform}/{arch}/livemask-{version}-{platform}-{arch}.{ext}`.
- Path traversal, arbitrary external URL release, and operator-provided storage
  paths are forbidden.
- Signed download URLs must be short-lived and omitted from audit logs.
- Revoking a release immediately removes it from update-check results.

## 10. Job Service Integration

Long-running release workflows must use Job Service:

| Job Type | Purpose |
| --- | --- |
| `app_release_artifact_verify` | Verify checksum/signature/notarization metadata |
| `app_release_publish` | Publish release and generate release events |
| `app_release_revoke` | Revoke release and invalidate caches/signed URL eligibility |
| `app_release_storage_verify` | Verify S3/OSS/COS/GCS/local storage settings |
| `app_release_adoption_aggregate` | Aggregate download/install/version-active telemetry |
| `website_downloads_refresh` | Refresh Website downloads page data/sitemap if needed |

Admin actions create Backend API requests; Backend creates Job Service runs.
Job Service calls Backend internal executor APIs with service auth and never
receives cloud provider raw secrets.

## 11. CI/CD Release Flow

`livemask-ci-cd` should provide a release pipeline:

```text
build App artifacts
  -> compute sha256
  -> sign artifact or manifest
  -> upload to configured storage provider
  -> call Backend Admin/internal API to register artifacts
  -> optional publish as draft/internal/beta
  -> smoke update-check and download metadata
```

Required CI inputs:

- `version`
- `build_number`
- `channel`
- `platform`
- `arch`
- `artifact_path`
- `release_notes_content_id` or release notes file
- storage provider selection from environment/config

CI must not print storage credentials, signing private keys, signed upload URLs,
or signed download URLs.

## 12. RBAC

| Permission | Meaning | Suggested Roles |
| --- | --- | --- |
| `app_release:read` | View releases, artifacts, adoption, events | ops_operator, support_agent, auditor, admin, super_admin |
| `app_release:write` | Create/update/publish/pause/revoke releases | admin, super_admin |
| `app_release:upload` | Register or upload artifacts | ops_operator, admin, super_admin, CI service actor |
| `settings:read` | View safe storage/signing settings | auditor, ops_operator, admin, super_admin |
| `settings:write` | Update storage/signing settings | admin, super_admin |
| `settings:verify` | Verify storage settings | ops_operator, admin, super_admin |

## 13. Audit And Observability

Audit every mutation:

- create release
- update release metadata
- register artifact
- publish/pause/resume/revoke/rollback
- storage settings update
- storage verification
- direct Admin upload request, if supported

Required metrics/log summaries:

- release check count by platform/channel/result
- download count by platform/version/result
- artifact verify failure count
- publish/revoke job duration
- active version adoption by platform/channel

No audit/log/event may contain raw provider secrets, local file paths, raw object
keys for public users, signed URL query strings, or signing private keys.

## 14. Website Requirements

`livemask-website` must consume Backend release metadata for download pages.

Required behavior:

- Public downloads page shows latest stable release per platform.
- Release notes link to Content System `release_note`.
- Download links use Backend public download endpoint or Backend-provided safe
  CDN URL.
- Website must not hardcode release artifact URLs.
- Sitemap/RSS should include public release notes where appropriate.

## 15. App Requirements

`livemask-app` must:

- Call update-check with platform, arch, version, build number, channel, locale.
- Show localized update UI.
- Respect `force_update`.
- Verify `sha256` and signature for direct-download artifacts where platform
  allows.
- Report safe update events.
- Never log signed URL query strings or local installer paths.
- Keep App crash/exception reporting in Sentry; update event API is not a crash
  log transport.

## 16. CI/CD Smoke Requirements

Smoke coverage:

| Step | Expected |
| --- | --- |
| Admin login | 200 |
| List releases | 200 |
| Create draft release | 201 |
| Register fixture artifact | 200/201 and sha256 stored |
| Verify artifact job | 202 + run_id |
| Publish release | 202 or 200 |
| App update check | returns published compatible version |
| Download metadata/path | no raw storage key or secret |
| Pause release | update check no longer offers paused release |
| Resume release | update check offers release again |
| Revoke release | update check never offers revoked release |
| Website downloads endpoint/page | latest stable appears |
| Storage settings safe read | only `secret_hint`, no raw secret |
| Secret leak scan | no access key, secret key, signed query, local path, private key |

## 17. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-DOC-APP-RELEASE-DISTRIBUTION-001` | `livemask-docs` | This contract and handoff |
| `TASK-BACKEND-APP-RELEASE-001` | `livemask-backend` | Release metadata schema, Admin APIs, public update-check/download APIs |
| `TASK-BACKEND-APP-RELEASE-LATEST-001` | `livemask-backend` | Public `GET /api/v1/app/releases/latest` endpoint; done on branch `task/TASK-BACKEND-APP-RELEASE-LATEST-001`, commit `449786b` |
| `TASK-BACKEND-APP-RELEASE-STORAGE-001` | `livemask-backend` | S3/OSS/COS/GCS/local storage adapters, signed URL/proxy, settings |
| `TASK-ADMIN-APP-RELEASE-001` | `livemask-admin` | `/admin/app/releases` UI and `/admin/settings/app-releases` integration |
| `TASK-APP-RELEASE-CHECK-001` | `livemask-app` | Update check, localized UI, checksum/signature verification, safe events |
| `TASK-WEBSITE-DOWNLOADS-001` | `livemask-website` | Downloads page consumes Backend release metadata |
| `TASK-JOBS-APP-RELEASE-001` | `livemask-job-service` | Artifact verify, publish/revoke, adoption aggregate jobs |
| `TASK-CICD-APP-RELEASE-001` | `livemask-ci-cd` | Build/sign/upload/register/smoke pipeline |

## 18. Done Criteria

- Admin has `/admin/app/releases` and storage settings entry.
- Backend stores release/artifact metadata and exposes Admin/public APIs.
- Storage provider abstraction supports S3-compatible, Alibaba OSS, Tencent COS,
  Google Cloud Storage, and local server storage.
- CI/CD can upload/register at least one fixture artifact.
- App update-check returns correct compatible release metadata.
- Public download never exposes storage credentials or unsafe object paths.
- Release publish/pause/revoke are audited and smoke-tested.
- Website downloads page reads Backend release metadata instead of hardcoding.
