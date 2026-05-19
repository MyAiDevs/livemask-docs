# TASK-DOC-PROTOCOL-STABILITY-GATE-001

> Status: Ready
> Owner: Docs / Backend / NodeAgent / Admin / App / Job Service / CI-CD / QA
> Scope: Adds the implementation gate for NodeAgent multi-protocol,
> multi-endpoint configuration, template versioning, App graceful reconnect,
> Admin real node detail APIs, and VPN stability QA.

## 1. Background

Protocol and endpoint rollout is a VPN runtime stability feature, not a normal
CRUD feature. A bad rollout can disconnect active users, blackhole traffic, leak
secrets, or make Admin display a false healthy state.

This task freezes the rule before implementation:

```text
Admin creates intent
  -> Backend validates templates, versions, node capabilities, and RBAC
  -> Job Service rolls out by wave with per-node locks and failure thresholds
  -> NodeAgent pulls assignment, applies with LKG, health-checks endpoint
  -> NodeAgent reports event to Backend
  -> Backend updates endpoint eligibility and emits App reconnect hints
  -> App pulls fresh connect_config and reconnects gracefully
  -> Admin shows real state, rollback, logs, and metrics
```

NodeAgent must not notify App directly. The realtime detail is correct, but the
channel owner must be Backend, because Backend owns user sessions, App audience,
connect_config selection, rate limits, and reconnect hint deduplication.

## 2. Mandatory Architecture Rules

1. NodeAgent is pull-safe. It pulls assignments and reports events. It does not
   receive direct commands from Admin, Job Service, or App.
2. Backend is the only authority that decides whether an endpoint is eligible
   for new App sessions.
3. Backend is the only authority that sends reconnect hints to App clients.
4. Job Service owns rollout waves, retries, backoff, pause, rollback, and
   per-node locking.
5. Admin reads Backend APIs only. Admin must not call NodeAgent, Job Service, or
   Prometheus directly from the browser.
6. App never receives NodeAgent long-term secrets, template secret refs, private
   keys, node HMAC material, or signed artifact URLs.
7. Template rollback creates a new versioned assignment. It never mutates
   history or rewinds version numbers.
8. Existing App sessions must not be disrupted until NodeAgent reports
   `endpoint_ready` and Backend marks the endpoint eligible.
9. Mass reconnect must be rate-limited and wave-gated. A single node change
   cannot fan out into an unbounded reconnect storm.
10. Any page that still uses mock or demo data must show a clear mock marker and
    must have a tracked backend endpoint to replace it.

## 3. Implementation Readiness Gate

No repository may mark protocol endpoint rollout as complete until every item is
answered with evidence.

| Gate | Required evidence |
| --- | --- |
| Template model | Backend schema stores template, immutable versions, config hash, secret refs, enabled/blocked flags. |
| Capability model | NodeAgent reports capabilities from local registry; Backend stores fresh/stale state; Admin gates unsupported protocols. |
| Assignment model | Backend stores current, target, previous/LKG assignment and per-node status. |
| LKG | NodeAgent stores last-known-good assignment and can roll back after failed apply or health check. |
| Health | NodeAgent has protocol-specific readiness checks before reporting `endpoint_ready`. |
| App reconnect | Backend emits reconnect hints only after endpoint eligibility changes; App pulls fresh config before reconnecting. |
| Backpressure | Job Service rolls out by wave with per-node locks, retry/backoff, failure threshold, pause, and rollback. |
| Admin real data | Node detail, template, assignment, events, logs, metrics, and rollout views use Backend APIs, not hardcoded demo data. |
| Redaction | Events/logs/status never expose node secrets, private keys, tokens, signed URLs, raw sing-box config, or user PII. |
| CI/CD | Smoke covers template seed/CRUD/version, assignment, NodeAgent apply event, App reconnect hint, rollback, and secret leak scan. |

## 4. Cross-Repo Impact

| Repo | Impact | Required follow-up |
| --- | --- | --- |
| `livemask-backend` | Owns protocol template/version state, capability aggregation, endpoint eligibility, reconnect hints, real Admin node detail APIs, audit, and internal NodeAgent APIs. | `TASK-BACKEND-PROTOCOL-STABILITY-001` |
| `livemask-nodeagent` | Must harden assignment pull/apply, LKG, rollback, readiness checks, event retry, metrics, and log redaction. | `TASK-NODEAGENT-PROTOCOL-STABILITY-001` |
| `livemask-admin` | Must replace Node List / Node Detail demo data and implement template, version, assignment, eligibility, rollout, and rollback UI. | `TASK-ADMIN-PROTOCOL-STABILITY-001` |
| `livemask-app` | Must consume only Backend reconnect hints, fetch fresh connect_config, and safely handle unsupported or app_pending profiles. | `TASK-APP-RECONNECT-STABILITY-001` |
| `livemask-job-service` | Must execute protocol rollout/rollback by wave with per-node locks, retry/backoff, failure thresholds, and redacted events. | `TASK-JOBS-PROTOCOL-STABILITY-001` |
| `livemask-ci-cd` | Must turn protocol capability/rollout smoke SKIPs into PASS and add stability checks. | `TASK-CICD-PROTOCOL-STABILITY-001` |
| `livemask-docs` | Owns this gate, Cursor handoff, contract links, and QA matrix. | `TASK-DOC-PROTOCOL-STABILITY-GATE-001` |

## 5. Required Backend Admin APIs

Backend must implement these Admin-facing APIs before Admin removes mock data.
All routes require Admin JWT and RBAC. Suggested permissions: `node:read`,
`node:write`, `jobs:execute`, `jobs:read`, `logs:read`, `metrics:read`.

### 5.1 Node Detail APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/api/v1/nodes` | List nodes with health, region, traffic, protocol summary, capability freshness. |
| GET | `/admin/api/v1/nodes/{node_id}` | Node detail canonical state. |
| GET | `/admin/api/v1/nodes/{node_id}/heartbeats` | Recent heartbeat timeline. |
| GET | `/admin/api/v1/nodes/{node_id}/logs` | Latest redacted node logs. |
| GET | `/admin/api/v1/nodes/{node_id}/metrics-summary` | CPU, memory, endpoint readiness, queue depth, traffic summary. |
| GET | `/admin/api/v1/protocol/nodes/{node_id}/capabilities` | Latest capability report with fresh/stale marker. |
| GET | `/admin/api/v1/nodes/{node_id}/protocol-endpoints` | Current endpoint metadata and health by protocol/transport. |
| GET | `/admin/api/v1/nodes/{node_id}/protocol-assignments` | Current, target, previous, LKG assignments. |
| GET | `/admin/api/v1/nodes/{node_id}/protocol-events` | Protocol apply/health/rollback events. |
| POST | `/admin/api/v1/nodes/{node_id}/protocol-endpoints/{endpoint_id}/probe` | Queue endpoint probe job. |

### 5.2 Template And Rollout APIs

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/api/v1/protocol-templates` | List templates with version, eligibility, reserved/blocked state. |
| POST | `/admin/api/v1/protocol-templates` | Create custom template. |
| GET | `/admin/api/v1/protocol-templates/{template_id}` | Template detail. |
| PUT | `/admin/api/v1/protocol-templates/{template_id}` | Update editable fields and create new version when config changes. |
| GET | `/admin/api/v1/protocol-templates/{template_id}/versions` | Immutable version history. |
| POST | `/admin/api/v1/protocol-templates/{template_id}/versions` | Create version snapshot. |
| GET | `/admin/api/v1/protocol-templates/{template_id}/eligibility` | Fleet and per-node eligibility preview. |
| POST | `/admin/api/v1/protocol-templates/{template_id}/publish` | Publish selected version through Job Service rollout. |
| POST | `/admin/api/v1/protocol-templates/{template_id}/rollback` | Roll back to previous/LKG version through Job Service. |
| POST | `/admin/api/v1/protocol-rollouts` | Create rollout run. |
| GET | `/admin/api/v1/protocol-rollouts/{run_id}` | Rollout progress and wave state. |
| POST | `/admin/api/v1/protocol-rollouts/{run_id}/pause` | Pause rollout. |
| POST | `/admin/api/v1/protocol-rollouts/{run_id}/resume` | Resume rollout. |
| POST | `/admin/api/v1/protocol-rollouts/{run_id}/rollback` | Create rollback run. |

## 6. Required Backend Internal APIs

| Method | Path | Caller | Purpose |
| --- | --- | --- | --- |
| GET | `/internal/agent/protocol-assignment` | NodeAgent | Pull current target assignment. |
| POST | `/internal/agent/protocol-events` | NodeAgent | Report apply, ready, degraded, failed, rollback events. |
| POST | `/internal/agent/protocol-capabilities` | NodeAgent optional | Capability report if not included in heartbeat. |
| POST | `/internal/job-executors/protocol-endpoint/rollout-wave` | Job Service | Create per-node target assignments for a wave. |
| POST | `/internal/job-executors/protocol-endpoint/rollback-wave` | Job Service | Create rollback assignments for a wave. |
| POST | `/internal/connect/reconnect-hints` | Backend worker/internal | Create or enqueue reconnect hints for affected sessions. |

## 7. App Reconnect Stability Rules

1. App must treat reconnect hints as hints, not config payloads.
2. App must fetch current session/connect_config after receiving a hint.
3. App must deduplicate by `hint_id`.
4. App must honor `reconnect_after_ms` and `expires_at`.
5. App must keep the old tunnel alive until the new config is fetched and
   considered supported.
6. Unsupported profile types enter a safe pending/unsupported state, not a
   blackholed tunnel attempt.
7. App reports `reconnect_hint_received`, `config_refreshed`,
   `reconnect_started`, `reconnect_succeeded`, and `reconnect_failed` events.
8. Backend must rate-limit reconnect hints per node, user, device, and rollout.

## 8. QA Matrix

### 8.1 Functional

- Seed templates exist and reserved templates are blocked.
- Custom template create/update/version/list works.
- Template validation rejects secret-like keys and unsafe fields.
- Node capability report controls eligibility.
- Unsupported and `app_pending` protocols cannot reach App connect_config.
- Assignment preview shows skipped nodes and reasons.
- Rollout creates Job Service run and wave events.
- NodeAgent pulls assignment and reports `endpoint_ready`.
- Backend updates `connect_node_endpoints`.
- App receives reconnect hint and fetches fresh config.
- Rollback creates new assignment and restores LKG.

### 8.2 Failure And Chaos

- NodeAgent restarts during apply.
- NodeAgent applies config but health check fails.
- Backend is temporarily unavailable when NodeAgent reports event.
- Job Service worker retries then dead-letters.
- App is offline during reconnect hint.
- App receives duplicate/stale/expired hint.
- Old App version lacks profile support.
- Endpoint becomes degraded after being ready.
- Rollout wave exceeds failure threshold and pauses.
- Rollback also fails on one node and requires manual intervention.

### 8.3 Performance And Stability

- No unbounded reconnect fan-out.
- Rollout wave size and rate limit are configurable.
- Admin node detail does not poll high-cost endpoints aggressively.
- Backend list APIs are paginated and indexed.
- Metrics and logs queries use bounded time windows.
- Reconnect hint creation is idempotent per rollout/node/session.

## 9. Cursor Window Split

| Repo | Task | Status |
| --- | --- | --- |
| `livemask-backend` | `TASK-BACKEND-PROTOCOL-STABILITY-001` | Implement schemas, APIs, eligibility, reconnect hint emission, real node detail data. |
| `livemask-nodeagent` | `TASK-NODEAGENT-PROTOCOL-STABILITY-001` | Harden assignment apply, LKG, rollback, readiness checks, event retry, metrics/logs. |
| `livemask-admin` | `TASK-ADMIN-PROTOCOL-STABILITY-001` | Replace node detail demo data, template/version/assignment/rollback UI, support badges. |
| `livemask-app` | `TASK-APP-RECONNECT-STABILITY-001` | Verify real Backend reconnect hints and unsupported protocol safety. |
| `livemask-job-service` | `TASK-JOBS-PROTOCOL-STABILITY-001` | Harden rollout/rollback executor, locks, failure thresholds, events. |
| `livemask-ci-cd` | `TASK-CICD-PROTOCOL-STABILITY-001` | Turn protocol capability/rollout smoke SKIPs into PASS and add chaos checks where feasible. |
| `livemask-docs` | `TASK-DOC-PROTOCOL-STABILITY-GATE-001` | This task and handoff. |

## 10. Done Criteria

- Protocol endpoint contract includes implementation readiness gate.
- Reconnect hint contract clearly states Backend-owned realtime channel.
- Admin node detail required API list exists.
- Cursor handoff exists for every impacted repo.
- QA matrix exists before runtime implementation starts.
- Docs index, task README, and MVP plan link this task.
