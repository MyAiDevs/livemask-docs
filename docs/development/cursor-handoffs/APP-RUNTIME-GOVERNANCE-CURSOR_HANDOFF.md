# App Runtime Governance Cursor Handoff

> Task group: `TASK-DOC-APP-RUNTIME-GOVERNANCE-001`
> Scope: Multi-repo implementation handoff for App runtime performance,
> resource, reconnect, cache and platform governance config.

## 0. Mandatory Reading For Every Window

Read before editing code:

1. `docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md`
2. `docs/contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md`
3. `docs/contracts/config/core-configs.md`
4. `docs/app/README.md`
5. `ai-rules/v3.7/00-Core-Principles.md`
6. `ai-rules/v3.7/04-Multi-Repo-Linkage.md`
7. `ai-rules/v3.7/06-Client-App-Specific-Rules.md`
8. `ai-rules/v3.7/13-Multi-Repo-Development.md`
9. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- Work on `dev` or a task branch from `dev`.
- Do not edit another repo's implementation files from the wrong window.
- This config must contain no secrets.
- App must keep last-known-good and must not block startup when config fetch
  fails.
- Web must not claim system VPN runtime support.
- Do not run CI/CD smoke yet; CI/CD starts after Backend/Admin/App complete.

## 1. Backend Cursor Prompt

```text
TASK ID: TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001
Repo: livemask-backend
Branch: task/TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001

Implement App Runtime Governance config.

Read:
- docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md
- docs/contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md
- docs/contracts/config/core-configs.md

Implement:
1. Versioned config storage for section app.runtime_governance.
2. Validation for resource_limits, behavior, performance and platform_overrides.
3. Admin APIs:
   - GET /admin/api/v1/system-settings/app-runtime
   - PUT /admin/api/v1/system-settings/app-runtime
   - POST /admin/api/v1/system-settings/app-runtime/preview
   - POST /admin/api/v1/system-settings/app-runtime/publish
   - POST /admin/api/v1/system-settings/app-runtime/rollback
4. App API:
   - GET /api/v1/app/runtime-config
5. config_version, config_hash, generated_at and effective_platform response.
6. Audit logs for save/publish/rollback.

Security:
- Response must never contain node_secret, connect credentials, service token,
  Sentry server token, payment credential, IM contact identifier, signed URL
  query, local filesystem path or raw endpoint host/port beyond already safe
  public connection config contracts.
- This config is not a secret store.

Tests:
- valid config publish.
- invalid memory/range rejected.
- iOS override resolved.
- web config cannot enable system VPN runtime behavior.
- App API returns effective config and hash.
- missing config returns safe defaults or enabled=false without 500.
- secret-like fields rejected or stripped.
- audit log does not contain full payload with forbidden fields.

Validation:
- go test ./... -count=1
- go vet ./...
- go build ./...
- git diff --check

Completion report must state CI/CD smoke is not run yet.
```

## 2. Admin Cursor Prompt

```text
TASK ID: TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001
Repo: livemask-admin
Branch: task/TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001

Implement /admin/settings/app-runtime.

Read:
- docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md
- docs/contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md
- docs/contracts/admin/ADMIN_NAVIGATION_IA_CONTRACT.md

Implement:
1. Add System nav entry/route under Settings: /admin/settings/app-runtime.
2. UI tabs:
   - Defaults
   - iOS
   - Android
   - macOS
   - Windows
   - Linux
   - Web
   - Preview / Version history
3. Editors for:
   - resource_limits
   - behavior
   - performance
   - platform_overrides
4. Preview action by platform/app_version/release_channel.
5. Publish and rollback actions with confirmation and audit reason.
6. Version/hash/last updated display.

Rules:
- Chinese default, English fallback.
- No secret inputs. This config must never ask for token/key/secret values.
- Warn clearly on iOS memory/reconnect changes.
- Mock read is allowed in local mode, but publish/rollback must not silently
  succeed in mock mode.
- Use Backend APIs only. Do not call App, Job Service, Prometheus or Sentry
  directly.

Tests:
- page renders.
- range validation blocks invalid values.
- preview payload matches selected platform.
- publish requires confirmation.
- rollback requires reason.
- no secret-like inputs or labels are present.
- low-permission user cannot edit.

Validation:
- npm run build
- npm test or targeted vitest
- git diff --check

Completion report must state which routes and API clients were added.
```

## 3. App Cursor Prompt

```text
TASK ID: TASK-APP-RUNTIME-GOVERNANCE-001
Repo: livemask-app
Branch: task/TASK-APP-RUNTIME-GOVERNANCE-001

Implement App runtime governance config consumption.

Read:
- docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md
- docs/app/README.md
- ai-rules/v3.7/06-Client-App-Specific-Rules.md

Implement:
1. API client for GET /api/v1/app/runtime-config.
2. Model for schema_version, config_version, config_hash and runtime_governance.
3. Local last-known-good storage.
4. Validation:
   - config_key == app_runtime_governance
   - supported schema_version
   - config_hash verifies canonical effective config
   - ranges are safe
5. Apply to:
   - connection health check interval
   - reconnect backoff
   - circuit breaker threshold
   - local queue/cache limits
   - platform-specific memory pressure hints where native hooks exist
6. Debug/status state:
   current, stale, fallback, invalid, last_success_at, config_version.

Rules:
- Fetch must be non-blocking. Failure cannot block startup, login, content,
  GeoIP, Sentry or VPN connection.
- If active tunnel would be disrupted, defer applying disruptive changes until
  reconnect or next session.
- Flutter UI code must not claim native VPN runtime is complete.
- Do not accept secrets, endpoints, signed URLs, payment credentials or IM
  identifiers in config.
- Web platform must not enable system VPN runtime behavior.

Tests:
- success fetch saves LKG.
- network failure uses LKG.
- invalid hash rejected.
- invalid ranges rejected.
- unknown fields ignored.
- iOS override selected.
- web config does not enable VPN runtime.
- no forbidden fields are logged or cached.

Validation:
- flutter analyze
- flutter test
- git diff --check

Completion report must include platform validation status. Do not claim
Windows/Linux native validation unless it was run on those platforms.
```

## 4. CI/CD Cursor Prompt Later

Do not start until Backend/Admin/App complete.

```text
TASK ID: TASK-CICD-APP-RUNTIME-GOVERNANCE-SMOKE-001
Repo: livemask-ci-cd
Branch: task/TASK-CICD-APP-RUNTIME-GOVERNANCE-SMOKE-001

Implement app-runtime-governance smoke:
1. Admin login.
2. low-permission user cannot write.
3. read current config.
4. preview iOS effective config.
5. invalid memory/interval rejected.
6. publish valid config.
7. App API returns config_version/config_hash/effective_platform.
8. response secret leak scan.
9. rollback creates new version.
10. App tests or scripted mock verify LKG fallback.
```

## 5. Completion Order

1. Backend implements API and validation.
2. Admin implements UI, can parallelize read-only with Backend.
3. App implements fetch/cache/apply.
4. CI/CD smoke starts after all three report completed.
