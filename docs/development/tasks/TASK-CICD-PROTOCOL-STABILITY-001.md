# TASK-CICD-PROTOCOL-STABILITY-001 — CI/CD Protocol Stability Smoke

> Status: Completed
> Repository: livemask-ci-cd
> Environment: dev-local

## 1. Background

Protocol endpoint rollout is a stability-sensitive VPN workflow. CI/CD must
verify the rollout path beyond simple route existence: assignment persistence,
NodeAgent events, rollback events, and Backend-owned reconnect hint endpoints.

This task extends the existing protocol smoke scripts. It does not create a new
aggregate script and does not replace the Backend/NodeAgent/App implementation
tasks.

## 2. Implemented Scope

| Script | Change |
| --- | --- |
| `scripts/protocol-endpoint-smoke.sh` | Added 201 lines of protocol stability checks. |
| `scripts/protocol-capability-smoke.sh` | Syntax validation retained. |
| `scripts/smoke.sh` | Syntax validation retained. |

New protocol endpoint smoke coverage:

- `[13b]` NodeAgent `endpoint_ready` event via HMAC POST.
- `[11b]` Assignment DB record verification for `protocol_assignments`,
  `protocol_rollout_events`, and `protocol_template_versions`.
- `[11c]` App reconnect hint API endpoint probing:
  `/admin/api/v1/dashboard/reconnect/summary` and
  `/internal/connect/reconnect-hints`.
- `[17b]` NodeAgent `rolled_back` event via HMAC POST.
- Script header coverage list updated from 18 to 21 sections.

## 3. Runtime Behavior

The smoke remains compatible with progressive deployment. If the new Backend
protocol stability endpoints are not deployed yet, the script reports `SKIP`
instead of `FAIL`.

This keeps the CI/CD task complete while preserving accurate downstream blockers
for Backend, NodeAgent, and App reconnect implementation.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must expose protocol assignment/event/reconnect endpoints for smoke sections to turn from SKIP to PASS. |
| `livemask-nodeagent` | Event upload behavior can be verified through HMAC `endpoint_ready` and `rolled_back` event paths. |
| `livemask-app` | Reconnect hint API availability is now part of CI/CD visibility. |
| `livemask-admin` | No direct UI dependency in this task. |
| `livemask-ci-cd` | Protocol stability smoke is enhanced and merged to dev. |
| `livemask-docs` | Records smoke coverage and remaining implementation dependencies. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-CICD-PROTOCOL-STABILITY-001` |
| Task branch commit | `dccfbd6` |
| Dev merge commit | `d721677` |
| Remote dev ref | `origin/dev` (`d721677`) |
| Validation | `bash -n scripts/protocol-endpoint-smoke.sh` PASS, `bash -n scripts/protocol-capability-smoke.sh` PASS, `bash -n scripts/smoke.sh` PASS, `git diff --check` PASS |

## 6. Remaining Dependencies

- Backend must ensure `protocol_assignments`, endpoint event ingest, rollback
  event ingest, and reconnect hint APIs are deployed.
- NodeAgent must implement real event upload for `endpoint_ready` and
  `rolled_back`.
- App must consume Backend reconnect hints in the App reconnect stability task.

## 7. Done Criteria

- [x] Protocol smoke includes `endpoint_ready` event coverage.
- [x] Protocol smoke includes assignment DB verification.
- [x] Protocol smoke probes reconnect hint endpoints.
- [x] Protocol smoke includes `rolled_back` event coverage.
- [x] Smoke syntax checks pass on merged `dev`.
- [x] SKIP behavior is retained for not-yet-deployed Backend endpoints.
