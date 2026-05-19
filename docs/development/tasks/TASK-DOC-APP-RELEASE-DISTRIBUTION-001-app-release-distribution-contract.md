# TASK-DOC-APP-RELEASE-DISTRIBUTION-001 - App Release Distribution Contract

## 1. Background

`/admin` lacks App version release management. LiveMask needs a controlled App
release workflow for Android, iOS, macOS, Windows, Linux, and future Web
artifacts. The workflow must support S3-compatible storage, Alibaba OSS,
Tencent COS, and server-local storage without exposing provider credentials to
Admin, App, or Website.

## 2. Scope

In scope:

- Define App release metadata and artifact metadata.
- Define Admin `/admin/app/releases` and `/admin/settings/app-releases`.
- Define Backend Admin APIs, public App update-check APIs, and download APIs.
- Define storage provider abstraction and secret boundaries.
- Define App update-check, checksum/signature verification, and safe event reporting.
- Define Website downloads requirements.
- Define CI/CD build/sign/upload/register/smoke workflow.
- Define Job Service release artifact verify/publish/revoke/adoption jobs.

Out of scope:

- Implement production App Store / Play Store submission automation.
- Store cloud credentials in Admin release forms.
- Replace App Sentry crash reporting with Backend log upload.

## 3. Contracts

- [App Release Distribution Contract](../../contracts/app/APP_RELEASE_DISTRIBUTION_CONTRACT.md)
- [Admin System Settings Contract](../../contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md)
- [Admin Job Center / Scheduler Contract](../../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)

## 4. Cross-Repo Impact

| Repo | Impact | Follow-up |
| --- | --- | --- |
| `livemask-backend` | Release/artifact schema, Admin APIs, public update-check/download APIs, storage adapters | `TASK-BACKEND-APP-RELEASE-LATEST-001` done on branch `task/TASK-BACKEND-APP-RELEASE-LATEST-001`, commit `449786b`; broader Admin/storage APIs remain `TASK-BACKEND-APP-RELEASE-001` / `TASK-BACKEND-APP-RELEASE-STORAGE-001` |
| `livemask-admin` | `/admin/app/releases` UI, `/admin/releases` shared Release Control IA, `/admin/settings/app-releases` integration | `TASK-ADMIN-APP-RELEASE-001` done on branch `task/TASK-ADMIN-APP-RELEASE-001`, commit `5729c2a`; `TASK-ADMIN-RELEASE-CONTROL-IA-001` done on branch `task/TASK-ADMIN-RELEASE-CONTROL-IA-001`, commit `fea9f48` |
| `livemask-app` | update-check client, localized update UI, checksum/signature verification, safe events | `TASK-APP-RELEASE-CHECK-001`; regression `TASK-APP-RELEASE-CHECK-REGRESSION-001` done with Sentry/logging safety checks, macOS universal PASS, iOS simulator PASS, web PASS, and Android/Windows/Linux/iOS-device blockers recorded |
| `livemask-website` | downloads page consumes Backend release metadata | `TASK-WEBSITE-DOWNLOADS-001` |
| `livemask-job-service` | artifact verify, publish/revoke, storage verify, adoption aggregate jobs | `TASK-JOBS-APP-RELEASE-001` done on branch `task/TASK-JOBS-APP-RELEASE-001`, commit `5f87d6d`; Backend executor APIs still required |
| `livemask-ci-cd` | build/sign/upload/register/smoke pipeline | `TASK-CICD-APP-RELEASE-001` |
| `livemask-docs` | contract, task index, handoff | current task |

## 5. Validation

Docs validation:

- `bash scripts/check-docs.sh`
- `git diff --check`

Implementation validation is defined in the contract and repo-specific tasks.
