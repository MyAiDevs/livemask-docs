# TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-001 — Admin Control Plane Smoke Coverage

> Owner: CI/CD / QA
> Repo: `livemask-ci-cd`
> Status: Completed (syntax + wiring), runtime smoke blocked by local runtime not running
> Task branch commit: `5e23b1c`
> Dev merge commit: `63dcdaa`
> Remote dev ref: `63dcdaa`
> Completed: 2026-05-20

## 1. Background

Admin System Settings, Job Center, Protocol Capability, NodeAgent Release, and
Sentry Settings pages were merged to `livemask-admin` dev. CI/CD needed matching
smoke coverage, but `scripts/admin-control-plane-smoke.sh` did not exist. Per
the Smoke Script Discovery Rule, the CI/CD window first inspected existing
scripts and chose to enhance the domain scripts instead of creating a duplicate
aggregate script.

## 2. Scope

- Discover existing CI/CD smoke scripts before editing.
- Enhance Admin control-plane domain smoke coverage.
- Keep `scripts/smoke.sh` wiring stable because all enhanced scripts were already
  called there.
- Keep workflow wiring unchanged because no new aggregate script was created.

## 3. Delivered

Script discovery result:

```text
scripts/admin-control-plane-smoke.sh: MISSING
Decision: enhance existing domain scripts
Created scripts: none
```

Enhanced scripts:

| Script | Added coverage |
| --- | --- |
| `scripts/system-settings-smoke.sh` | Admin Settings page 404 checks for 10 paths; Admin Observability Settings API check |
| `scripts/jobs-smoke.sh` | Admin Job Center page 404 checks; job definitions/runs/schedules GET checks; RBAC; secret leak scan |
| `scripts/protocol-capability-smoke.sh` | Admin Protocol page 404 checks |
| `scripts/release-control-smoke.sh` | NodeAgent Release detail API; Admin Release page 404 checks |
| `scripts/sentry-config-smoke.sh` | Admin Observability page 404 check; `sentry_app` API forbidden-field scan |

Unchanged scripts:

```text
scripts/jobs-hardening-smoke.sh
scripts/protocol-endpoint-smoke.sh
scripts/observability-smoke.sh
scripts/smoke.sh
```

`scripts/smoke.sh` was not changed because the five enhanced scripts were already
called from the aggregate smoke entrypoint.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-ci-cd` | Domain smoke scripts now cover Admin control-plane routes/APIs. |
| `livemask-admin` | New Admin pages have route/API regression coverage once runtime is available. |
| `livemask-backend` | Settings, Jobs, Protocol, Release, and Sentry APIs will be exercised by smoke. |
| `livemask-docs` | Tracks smoke coverage and runtime execution blocker. |

## 5. Validation

Static validation:

```text
bash -n scripts/system-settings-smoke.sh PASS
bash -n scripts/jobs-smoke.sh PASS
bash -n scripts/protocol-capability-smoke.sh PASS
bash -n scripts/release-control-smoke.sh PASS
bash -n scripts/sentry-config-smoke.sh PASS
bash -n scripts/smoke.sh PASS
git diff --check PASS
dev-merge-guard PASS
```

Runtime smoke:

```text
BLOCKED / SKIP report: local dev runtime was not running.
No docker compose down, volume deletion, or runtime teardown was performed.
```

## 6. Follow-up

- Run the enhanced domain smoke scripts against a running dev-local or staging
  runtime and update this task from "syntax + wiring" to "runtime PASS".
- Ensure protocol capability smoke is rerun after Backend `68f04ac` is deployed
  into the runtime.
