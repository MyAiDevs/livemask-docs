# TASK-DOCS-APP-RUNTIME-CLOSED-LOOP-VALIDATION-001

> Status: Completed
> Owner: livemask-docs / livemask-app
> Scope: AppClient runtime validation, debug log evidence, backend integration
> closure, and dev role preset login policy.

## 1. Background

App compilation alone is not enough evidence that an App task is complete.
LiveMask App tasks often depend on Backend API, NodeAgent, and Job Service
behavior. A build can pass while login, connect config, reconnect hints,
observability upload, growth notifications, release checks, or job-triggered
flows are broken.

This task upgrades the App development documentation so ordinary App feature
tasks must include runtime evidence and closed-loop debug logs. It also defines
a dev-only role preset login requirement so engineers can switch between common
user roles without manually typing credentials for every verification pass.

## 2. Policy

For non-iOS App feature tasks, `Completed (Android-primary)` now requires:

- Flutter analyze and tests.
- Android build.
- Android emulator or authorized physical device launch.
- Debug-log evidence for task-relevant network calls.
- Backend API communication evidence.
- NodeAgent communication evidence when the task touches connect, diagnostics,
  protocol, node region, observability, or VPN runtime.
- Job Service communication evidence when the task triggers or observes async
  jobs, rollout state, release checks, growth digest, notification dispatch, or
  scheduled work.
- A task-specific closed-loop checklist showing request -> response -> UI/state
  -> event/log/metric.

Compilation-only completion is no longer acceptable for App feature work.

## 3. Dev Role Preset Login

`livemask-app` should provide a dev-only account switcher that can log in as
pre-seeded roles without manual credential entry.

Required roles:

| Preset | Purpose |
| --- | --- |
| Normal user | Baseline App login, profile, subscription, connect, content feed. |
| Promotion ambassador | Referral link, reward banner/toast, referral report. |
| Sponsor ambassador | Sponsor report, node-related earning prompts, sponsor feedback. |
| Trial / expired user | Plan/paywall/connect-disabled states. |
| Debug operator account if supported | Diagnostics and QA-only surfaces. |

Rules:

- The preset switcher must be dev-only and disabled in production builds.
- Do not store real production credentials in l10n ARB files, release assets, or
  public config.
- Dev presets may come from debug-only dart-defines, local dev config, or a
  Backend dev seed endpoint.
- Completion reports must state whether preset login was used and which role was
  validated.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-app` | Must update `.cursorrules`, README, and implementation backlog to require runtime/debug-log closed-loop validation and dev-only role preset login. |
| `livemask-backend` | Must provide dev-local seeded users or documented dev credentials/seed API for preset roles. |
| `livemask-nodeagent` | Must expose logs/metrics/status that App validation can correlate for connect/protocol/diagnostics tasks. |
| `livemask-job-service` | Must expose job status and logs for App flows that depend on async jobs. |
| `livemask-ci-cd` | App smoke should distinguish build-only evidence from runtime closed-loop evidence. |
| `livemask-docs` | Owns this documentation and rule source. |

## 5. Files Updated

| File | Change |
| --- | --- |
| `docs/app/APP_PLATFORM_COMPATIBILITY_MATRIX.md` | Added runtime closed-loop evidence requirements. |
| `docs/app/APP_LOCAL_BUILD_AND_TROUBLESHOOTING.md` | Added debug log and service-communication evidence guidance. |
| `docs/app/README.md` | Added App runtime validation section. |
| `docs/development/MVP_IMPLEMENTATION_PLAN.md` | Added this task and updated App priority notes. |
| `docs/development/tasks/README.md` | Registered this task. |

## 6. Completion Evidence

| Field | Value |
| --- | --- |
| Repository | `livemask-docs` |
| Task branch | `task/TASK-DOCS-APP-RUNTIME-CLOSED-LOOP-VALIDATION-001` |
| Validation | `bash scripts/check-docs.sh` PASS, `git diff --check` PASS |

## 7. Done Criteria

- [x] App completion policy says build-only evidence is insufficient.
- [x] Runtime debug log evidence requirements are documented.
- [x] Backend/NodeAgent/Job Service closed-loop evidence requirements are documented.
- [x] Dev-only role preset login requirement is documented.
- [x] Task index and MVP plan are updated.
