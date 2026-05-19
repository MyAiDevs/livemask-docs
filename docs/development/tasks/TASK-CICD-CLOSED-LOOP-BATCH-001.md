# TASK-CICD-CLOSED-LOOP-BATCH-001 — CI/CD Closed-Loop Smoke Batch

> Status: partial / evidence_missing
> Owner: CI-CD / QA / Docs
> Repo: `livemask-ci-cd`
> Related repos: `livemask-backend`, `livemask-admin`, `livemask-job-service`, `livemask-website`, `livemask-app`, `livemask-docs`
> Created: 2026-05-19 (registered in MVP plan), file created 2026-05-20

## 1. Background

CI/CD smoke scripts have been defined for six functional domains: Dashboard,
System Settings / Scheduler, App Release, Observability, I18N, and Jobs
Hardening. These smoke scripts are integrated into `scripts/smoke.sh` and the
staging workflow (`.github/workflows/staging-smoke.yml`). Backend/Admin
implementation of the corresponding API endpoints will transition smoke results
from SKIP to PASS.

## 2. Scope

### In Scope

- `scripts/smoke.sh` integrated entry point for all 6 smoke scripts.
- `.github/workflows/staging-smoke.yml` staging workflow.
- Smoke scripts for each domain (defined in `livemask-ci-cd`).

| Subtask | Script | Scope |
|---------|--------|-------|
| `TASK-CICD-DASHBOARD-001` | `dashboard-smoke.sh` | Dashboard traffic/countries/bandwidth/top-users/mock/empty-error |
| `TASK-CICD-SYSTEM-SETTINGS-SCHEDULER-001` | `system-settings-smoke.sh` | System settings CRUD, Schedule CRUD, secret leak scan |
| `TASK-CICD-APP-RELEASE-001` | `app-release-smoke.sh` | App release lifecycle, Website downloads, storage secret scan |
| `TASK-CICD-OBSERVABILITY-SMOKE-001` | `observability-smoke.sh` | NodeAgent logs, Sentry/Payment/Notification logs, metrics |
| `TASK-CICD-I18N-001` | `i18n-smoke.sh` | Backend message_key, Admin zh-CN, Website hreflang/sitemap, App locale |
| `TASK-CICD-JOBS-HARDENING-001` | `jobs-hardening-smoke.sh` | Queue lease/retry/backoff/dead-letter/duplicate lock/run events |

### Out of Scope

- Runtime implementation of Backend/Admin/App/Job Service APIs.
- Subscription or payment smoke scenarios outside the defined domains.

## 3. Deliverables

- [x] `scripts/smoke.sh` integration entry exists in `livemask-ci-cd`.
- [x] `.github/workflows/staging-smoke.yml` references the integrated smoke.
- [ ] Each of the 6 subtask smoke scripts PASS against a running local stack.
- [ ] Secret leak scan passes for all 6 domains.
- [ ] CI/CD smoke runs from `dev` branch (not task branches).

## 4. Current Status

Per `MVP_IMPLEMENTATION_PLAN.md` section 3 and `scripts/smoke.sh` integration:

- `TASK-CICD-OBSERVABILITY-SMOKE-001` — ✅ Passed (23 sections, 0 failures)
- `TASK-CICD-SENTRY-CONFIG-SMOKE-001` — ✅ Passed
- Remaining 5 subtasks: actual CI/CD smoke run evidence against deployed stack is not yet documented in `livemask-docs`.

## 5. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-ci-cd` |
| **Task branch** | Not applicable (batch task — subtasks each have their own branches) |
| **Task branch commit** | Needs audit per subtask |
| **Dev merge commit** | **Evidence missing** — need `livemask-ci-cd` dev commit that merged the smoke scripts |
| **Remote dev ref** | **Evidence missing** |
| **Validation** | Partial — Observability smoke PASS, others unevaluated in docs |

## 6. Cross-Repo Impact

| Repo | Impact |
|------|--------|
| `livemask-backend` | Must implement APIs before smoke transitions from SKIP to PASS |
| `livemask-admin` | Must implement Admin UI before smoke transitions from SKIP to PASS |
| `livemask-job-service` | Must implement executor APIs before smoke transitions from SKIP to PASS |
| `livemask-website` | Must implement content/release pages before smoke transitions from SKIP to PASS |
| `livemask-app` | App localization smoke may require App deployment |
| `livemask-ci-cd` | Owns smoke scripts and workflow |
| `livemask-docs` | Tracks evidence and records status in MVP plan |

## 7. Remaining Gaps

- `livemask-ci-cd` dev merge commit and remote dev ref not documented.
- Subtask-level evidence (dashboard, system settings, app release, i18n, jobs hardening) not yet collected.
- Staging workflow run results not linked from docs.

## 8. Completion Report Requirements

Completion report must include:

- `livemask-ci-cd` dev merge commit and remote dev ref.
- Each subtask smoke script PASS/FAIL result.
- Secret leak scan evidence.
- Confirmation that staging workflow runs from `dev`.
- This task file status upgraded to `Completed` only when all evidence is present.
