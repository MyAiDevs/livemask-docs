# App Release Distribution Cursor Handoff

> Task group: `TASK-DOC-APP-RELEASE-DISTRIBUTION-001`
> Scope: Multi-repo implementation handoff for App release management, artifact
> storage, update check, Website downloads, and CI/CD release upload.

## 0. Mandatory Reading For Every Cursor Window

Read before editing code:

1. `docs/contracts/app/APP_RELEASE_DISTRIBUTION_CONTRACT.md`
2. `docs/contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md`
3. `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`
4. `docs/contracts/content/CONTENT_SYSTEM_CONTRACT.md`
5. `docs/contracts/i18n/I18N_LOCALIZATION_CONTRACT.md`
6. `docs/contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md`
7. `ai-rules/v3.7/00-Core-Principles.md`
8. `ai-rules/v3.7/04-Multi-Repo-Linkage.md`
9. `ai-rules/v3.7/13-Multi-Repo-Development.md`
10. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- App release and NodeAgent release may share one Admin **Release Control**
  menu/page, but they remain separate domains.
- Admin never calls storage provider or Job Service directly.
- App and Website never receive S3/OSS/COS/GCS credentials.
- Backend never logs signed URL query strings or storage secrets.
- App crash/exception logs still use Sentry; release events are not crash logs.
- Do not stop the shared local dev runtime. Use targeted service recreate only.

## 1. Backend Window

Repository: `livemask-backend`
Primary tasks:

- `TASK-BACKEND-APP-RELEASE-001`
- `TASK-BACKEND-APP-RELEASE-STORAGE-001`
- `TASK-BACKEND-APP-RELEASE-LATEST-001` completed on branch
  `task/TASK-BACKEND-APP-RELEASE-LATEST-001`, commit `449786b`.

### 1.0 Latest Public Release Endpoint

Implemented:

- `GET /api/v1/app/releases/latest`
- Optional query filters:
  - `channel`
  - `platform`
- Public-safe response with version, build number, title, release notes content
  ID, minimum supported version, force update metadata, and artifact platform /
  arch / type / size / sha256 / signature fields.
- Sensitive fields are excluded from the public response:
  - `storage_key`
  - `created_by`
  - `updated_by`
  - `target_regions`
  - `target_locales`

Validation:

```text
go test ./internal/apprelease/... PASS (14 tests)
go vet ./internal/apprelease/... clean
go build ./internal/apprelease/... clean
git diff --check clean
```

### 1.1 Data Model

Implement PostgreSQL schema for:

- `app_releases`
- `app_release_artifacts`
- `app_release_events`
- `app_release_storage_settings` or safe integration with System Settings
- optional `app_release_adoption_daily`

Required fields are defined in `APP_RELEASE_DISTRIBUTION_CONTRACT.md`.

### 1.2 Admin APIs

Implement:

- `GET/POST /admin/api/v1/app/releases`
- `GET/PUT/DELETE /admin/api/v1/app/releases/{release_id}`
- `POST /admin/api/v1/app/releases/{release_id}/artifacts`
- `POST /admin/api/v1/app/releases/{release_id}/publish`
- `POST /admin/api/v1/app/releases/{release_id}/pause`
- `POST /admin/api/v1/app/releases/{release_id}/resume`
- `POST /admin/api/v1/app/releases/{release_id}/revoke`
- `POST /admin/api/v1/app/releases/{release_id}/rollback`
- `GET /admin/api/v1/app/releases/{release_id}/events`
- `GET /admin/api/v1/app/releases/{release_id}/adoption`
- `GET/PUT /admin/api/v1/app-release-storage`
- `POST /admin/api/v1/app-release-storage/verify`

RBAC:

- `app_release:read`
- `app_release:write`
- `app_release:upload`
- `settings:read/write/verify` for storage settings

Audit every mutation.

### 1.3 Public/App APIs

Implement:

- `GET /api/v1/app/releases/check`
- `GET /api/v1/app/releases/artifacts/{artifact_id}/download`
- `POST /api/v1/app/releases/events`

Rules:

- Check endpoint filters by platform, arch, version, build_number, channel,
  locale, rollout percentage, status, and compatibility.
- Download endpoint proxies or issues short-lived signed URLs.
- Responses never expose storage keys, local paths, credentials, private keys,
  or signed URL query strings in logs/audit.

### 1.4 Storage Adapters

Implement storage abstraction:

- S3-compatible
- Alibaba OSS
- Tencent COS
- Google Cloud Storage
- local server storage

MVP can implement local storage first, but interfaces/config must support the
other providers. Storage credentials are write-only settings.

### 1.5 Validation

Run:

```bash
go test ./... -count=1
go vet ./...
go build ./...
git diff --check
```

## 2. Admin Window

Repository: `livemask-admin`
Primary task:

- `TASK-ADMIN-APP-RELEASE-001`
- Completed on branch `task/TASK-ADMIN-APP-RELEASE-001`, commit `5729c2a`.
- Release Control IA completed on branch `task/TASK-ADMIN-RELEASE-CONTROL-IA-001`,
  commit `fea9f48`.

Implemented `/admin/app/releases`:

- App Releases are under the same Operations **Release Control** group/page as
  NodeAgent Releases when implementing Admin navigation. Recommended routes:
  - `/admin/releases` overview with App / NodeAgent tabs or cards
  - `/admin/app/releases` canonical App release deep link
  - `/admin/nodeagent/releases` canonical NodeAgent release deep link
- Release list with version, build number, channel, status, platform coverage,
  rollout percentage.
- Release detail with artifact matrix, release notes, events, adoption.
- Create/edit draft release.
- Publish, pause, resume, revoke, rollback with confirmations.
- Link release notes to Content System `release_note`.
- Link storage settings to `/admin/settings/app-releases`.
- Chinese default, English fallback.
- `src/types/app-release.ts`, `src/lib/app-release-api.ts`,
  `src/lib/app-release-mock.ts`, and `src/hooks/use-app-release.ts`.
- `/admin/app/releases/{releaseId}` detail page with metadata cards, artifact
  list, and timeline.
- `src/components/ui/tabs.tsx` added for the shared `/admin/releases` overview.
- `MockBadge` indicates mock fallback surfaces.

Security UI:

- Do not mix App release and NodeAgent release permissions. App release pages
  use `app_release:*`; NodeAgent release pages continue to use NodeAgent/Node
  permissions.
- Do not display raw storage key, local path, access key, secret key, private
  signing key, signed URL query strings.
- If direct upload is implemented, use Backend-issued upload/proxy flow with
  size/type validation.
- MVP may be CI/CD upload only, with Admin registering/publishing metadata.

Validation:

```bash
npx vitest run
npx next build
```

Validation:

```bash
npm run build
git diff --check
```

## 3. App Window

Repository: `livemask-app`
Primary task:

- `TASK-APP-RELEASE-CHECK-001`
- Regression completed as `TASK-APP-RELEASE-CHECK-REGRESSION-001`.

Implemented / verified:

- Update-check API client.
- Platform/arch/version/build_number/channel/locale request fields.
- Localized update available, forced update, deferred update, and no-update UI.
- Checksum/signature verification for direct-download platforms.
- Safe release events:
  `update_prompt_shown`, `download_started`, `download_succeeded`,
  `download_failed`, `install_started`, `install_deferred`,
  `install_succeeded`, `install_failed`, `version_active`.

Rules:

- iOS uses App Store/TestFlight URL when returned.
- Do not log signed URL query strings or local installer paths.
- Sentry remains crash/exception pipeline.
- `download_url` must never be written to Sentry breadcrumbs.
- Signed query strings are only passed to the OS/browser launcher and are not
  logged.
- sha256 and signature values are used for local verification only.
- Release notes support zh-CN / en-US through the App locale provider.
- On iOS/Android, `PlatformInfo._hostArchitecture()` depends on compile-time
  `APP_ARCH`. Production release pipelines must inject the correct value.

Validation:

```bash
flutter test
flutter analyze
git diff --check
```

Security regression checks:

| Check | Status | Evidence |
| --- | --- | --- |
| `download_url` not sent to Sentry breadcrumb | PASS | No Sentry call path records release download URL. |
| Signed query not logged | PASS | URL is passed to `launchUrl` only. |
| Forced update is not dismissible | PASS | Uses `PopScope(canPop: false)`. |
| Optional update can be dismissed | PASS | Close action sets dismissed state. |
| sha256/signature remain local | PASS | Used only for local verification. |
| zh-CN/en-US release notes | PASS | Locale comes from `localeProvider`. |

Regression platform matrix:

| Target | Status | Notes |
| --- | --- | --- |
| macOS arm64 | PASS | Universal binary built; arm64 slice verified. |
| macOS x64 | PASS | x86_64 slice verified through universal binary. |
| iOS simulator | PASS | `build/ios/iphonesimulator/Runner.app` generated. |
| iOS device | BLOCKED | Requires Xcode signing configuration and a physical device. |
| Web | PASS | `build/web` generated successfully. |
| Android debug | PASS | Kotlin language-version blocker resolved by `TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001`. |
| Android release | PASS | Build succeeds after Kotlin fix; real release signing key remains separate production-readiness work. |
| Windows | BLOCKED | Requires Parallels VM. |
| Linux | BLOCKED | Requires Parallels VM. |

Build platform artifacts only for platforms available in the current
environment; do not claim Windows/Linux validation from macOS-only builds.

## 4. Website Window

Repository: `livemask-website`
Primary task:

- `TASK-WEBSITE-DOWNLOADS-001`
- Completed as part of `TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001` on branch
  `task/TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001`, commit `9d8c144`.
- Release-control regression completed on branch
  `task/TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001`, commit `5edaada`.

Implemented:

- Downloads page consumes Backend release metadata.
- Latest stable release per platform.
- Release notes link to Content System `release_note`.
- Localized crawler-visible download text.
- No hardcoded artifact URLs.
- No raw storage key or signed URL query rendered into HTML.
- zh-CN default route and en-US fallback.
- `hreflang` alternates in page metadata and sitemap.
- Blog pages consume Content APIs.
- `help_article` and `release_note` content types are supported.
- Build-time `sitemap.xml` and `rss.xml` generation with Backend fallback.
- Regression verified `/download`, latest stable release per platform,
  `GET /api/v1/app/releases/latest` client integration, release notes URL
  typing, zh-CN default / en-US fallback, hreflang output, no hardcoded artifact
  URL, no signed URL query exposure, and no per-request sitemap/RSS generation.

Validation:

```bash
tsc -b
npm run build
dist/sitemap.xml generated
dist/rss.xml generated
git diff --check
```

Backend status:

- `GET /api/v1/app/releases/latest` is implemented by
  `TASK-BACKEND-APP-RELEASE-LATEST-001`.
- Ensure sitemap/RSS/content APIs remain locale-aware for production data.
- Run Website real integration smoke against the deployed Backend endpoint.

## 5. Job Service Window

Repository: `livemask-job-service`
Primary task:

- `TASK-JOBS-APP-RELEASE-001`

Status: implemented on branch `task/TASK-JOBS-APP-RELEASE-001`, commit
`5f87d6d`.

Registered jobs:

- `app_release_artifact_verify`
- `app_release_publish`
- `app_release_revoke`
- `app_release_storage_verify`
- `app_release_adoption_aggregate`
- `website_downloads_refresh`

Backend executor paths:

- `POST /internal/job-executors/app-release/artifact-verify`
- `POST /internal/job-executors/app-release/publish`
- `POST /internal/job-executors/app-release/revoke`
- `POST /internal/job-executors/app-release/storage-verify`
- `POST /internal/job-executors/app-release/adoption-aggregate`
- `POST /internal/job-executors/app-release/website-downloads-refresh`

Rules:

- Job Service calls Backend internal executor APIs.
- Job Service never stores raw S3/OSS/COS/GCS credentials or signing private keys.
- App Release jobs use owner domain `app_release` and must not call or mutate
  NodeAgent release APIs, permissions, or data tables.
- Event metadata must be redacted.

Validation:

```bash
go test ./... -count=1
go vet ./...
go build ./cmd/job-service/
git diff --check
```

Backend follow-up required:

- Implement all `/internal/job-executors/app-release/*` endpoints listed above.

## 6. CI/CD Window

Repository: `livemask-ci-cd`
Primary task:

- `TASK-CICD-APP-RELEASE-001`

Implement:

- Build artifact inputs per platform.
- Compute sha256.
- Sign artifact or release manifest.
- Upload to configured storage provider.
- Register artifact with Backend.
- Optional publish as draft/internal/beta.
- Smoke update-check and download metadata.

Smoke steps:

1. Admin login.
2. Create draft release.
3. Register fixture artifact.
4. Verify artifact job returns `run_id`.
5. Publish release.
6. App update-check returns compatible release.
7. Download metadata has no raw storage key/secret.
8. Pause/resume/revoke behavior reflected by update-check.
9. Website downloads sees latest stable.
10. Secret leak scan.

Do not print storage credentials, private signing keys, signed upload URLs, or
signed download URLs.

## 7. Completion Report Requirements

Every window must report:

- `TASK ID`
- `Repository / Branch / Commit`
- Completed files and behavior
- Docs/contract impact
- Tests and validation commands
- Cross-repo impact and unlocked windows
- Blocked windows and exact blockers
- Risks / TODOs
- Next task recommendation
