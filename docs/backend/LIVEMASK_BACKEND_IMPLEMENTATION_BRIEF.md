# LiveMask Backend Implementation Brief

> This document is the backend implementation brief for AI-assisted development.
> Use it before generating code, splitting backend tasks, or reviewing backend
> pull requests.

## 1. Goal

Build the LiveMask backend as the system of record for:

- users and authentication
- subscription and entitlement state
- node inventory and node health
- App client configuration
- NodeAgent runtime configuration
- connection quality reports
- quick feedback and support records
- payment orders and payment webhooks
- audit logs and operational history

The backend must keep the App, NodeAgent, Admin, PostgreSQL, Redis, CI/CD, and
monitoring chain consistent.

## 2. MVP Scope

Backend MVP should prioritize these modules:

| Module | Purpose |
| --- | --- |
| Auth / Session | Login, JWT, refresh, logout |
| User / Entitlement | Current plan, access level, subscription state |
| Client Config | App config pull, version/hash validation |
| NodeAgent Config | Agent config pull, version/hash validation |
| Node Recommendation | Recommended node list for App |
| Connection Quality | App quality report ingestion |
| NodeAgent Report | Agent heartbeat, metrics, degraded state |
| Quick Feedback | User feedback to low-priority appeal/support queue |
| Payment USDT | Order creation, webhook normalization, status events |
| Admin Read APIs | Basic dashboard and operations views |

Out of MVP unless a TASK explicitly pulls them in:

- C2C trading
- full points economy
- ambassador revenue tracebacks
- multi-provider payment routing
- complex fraud rules
- production-grade BI exports

## 3. Architecture Principles

1. **PostgreSQL is the business source of truth**  
   Redis can accelerate, cache, queue, rate-limit, and publish, but Redis must
   not become the only source for audited business state.

2. **Every cross-system write must be recoverable**  
   If DB succeeds and Redis fails, a compensation path must rebuild Redis from
   DB. If Redis succeeds before DB, use pending state and short TTL.

3. **All external writes must be idempotent**  
   Payment webhooks, App reports, and NodeAgent reports must tolerate retries.

4. **Version and hash fields are mandatory for config**  
   App and NodeAgent must never blindly accept mutable runtime config.

5. **Errors are contracts**  
   Any user-visible or client-actionable backend error must use documented
   `error_code`, `retry_after`, and `fallback_action` when applicable.

6. **Admin actions require audit**  
   Config, entitlement, payment correction, node status, and moderation actions
   must produce audit records.

## 4. Suggested Backend Stack

If the repo has not chosen a stack yet, use this default:

| Layer | Recommendation |
| --- | --- |
| Language | Go |
| HTTP router | chi / Gin / Fiber, choose one and keep it consistent |
| DB | PostgreSQL |
| Cache / queue | Redis |
| Migrations | golang-migrate / Atlas |
| Validation | request DTO validation at boundary |
| Auth | JWT access token + refresh token |
| Observability | structured logs + metrics + trace/request id |
| Testing | unit tests + handler tests + repository integration tests |

Do not introduce a framework only to hide simple HTTP, DB, and Redis flows.

## 5. Required API Contracts

Implement against:

- `docs/contracts/api/core-mvp.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/state-machines.md`
- `docs/contracts/data-consistency.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

Backend implementation must not rename or remove contract fields without a
contract update.

### 5.1 App APIs

| Endpoint | Backend responsibility |
| --- | --- |
| `GET /api/v1/config/client` | Return App config, version, hash, fallback action |
| `POST /api/v1/client/nodes/recommend` | Return recommended nodes with TTL |
| `POST /api/v1/client/vpn/report-connection-quality` | Idempotently ingest quality report |
| `POST /api/v1/client/nodes/quick-feedback` | Create low-priority feedback/appeal |
| `POST /api/v1/payments/usdt/orders` | Create payment order |

### 5.2 NodeAgent APIs

| Endpoint | Backend responsibility |
| --- | --- |
| `GET /internal/agent/config` | Return agent runtime config |
| `POST /internal/agent/report` | Idempotently ingest heartbeat/metrics/degraded state |

### 5.3 Payment Webhook

| Endpoint | Backend responsibility |
| --- | --- |
| `POST /api/v1/payments/nowpayments/webhook` | Verify signature, normalize event, update order state |

## 6. Data Model Guidance

Minimum tables:

| Table | Purpose |
| --- | --- |
| `users` | user identity |
| `sessions` / `refresh_tokens` | session lifecycle |
| `plans` | subscription plan definitions |
| `subscriptions` | user entitlement source |
| `nodes` | node inventory |
| `node_status_snapshots` | latest and historical node health |
| `system_configs` | versioned config payloads |
| `config_publish_events` | config release/audit trail |
| `connection_quality_reports` | App quality reports |
| `node_agent_reports` | Agent reports |
| `feedback_reports` | user feedback / appeal seed |
| `payment_orders` | payment order source |
| `payment_events` | normalized provider webhook events |
| `audit_logs` | Admin/system actions |
| `outbox_events` | reliable event publishing |

Every table that receives external or retried writes should have an idempotency
key or unique constraint.

## 7. Redis Key Guidance

Backend Redis usage should follow `docs/data/redis-key-registry.md`.

Recommended key classes:

| Key class | Example | Notes |
| --- | --- | --- |
| node realtime | `node:{node_id}:status` | TTL required |
| recommendation cache | `client:{user_id}:recommendation` | short TTL |
| config cache | `config:client:latest` | invalidated after DB commit |
| idempotency | `idem:{scope}:{request_id}` | TTL + DB final check |
| rate limit | `rate:{subject}:{route}` | include route and subject |
| queues | Redis Stream / list | consumer must be idempotent |

Redis keys must not contain raw tokens, payment secrets, or personal content.

## 8. State Machines

Backend must own these state machines:

| State machine | Source doc |
| --- | --- |
| subscription lifecycle | `docs/contracts/state-machines.md` |
| payment lifecycle | `docs/contracts/state-machines.md` |
| node health / degraded | `docs/contracts/state-machines.md` |
| config publish lifecycle | `docs/contracts/state-machines.md` |

State transition rules:

- transitions must be explicit
- invalid transitions must be rejected and logged
- payment webhook transitions must be idempotent
- Admin override transitions must create audit logs

## 9. Backend Error Model

All API errors should use this shape:

```json
{
  "request_id": "req_...",
  "error_code": "NODE_RECOMMENDATION_UNAVAILABLE",
  "message": "No healthy node is currently available.",
  "retry_after": 30,
  "fallback_action": "use_cached"
}
```

Rules:

- `message` is safe for user-facing or support-facing display.
- `error_code` drives App / NodeAgent behavior.
- `retry_after` prevents retry storms.
- `fallback_action` tells clients how to recover.

## 10. Security Requirements

| Area | Requirement |
| --- | --- |
| Auth | JWT access token + refresh token rotation |
| NodeAgent auth | node signature or mTLS |
| Payment webhook | provider signature verification |
| Admin | role-based access control |
| Sensitive config | never hard-code node secrets in App |
| Logs | no tokens, payment secrets, browsing history, or raw traffic content |
| Rate limit | login, payment, feedback, recommendation |

## 11. Observability

Required fields in structured logs:

| Field | Purpose |
| --- | --- |
| `request_id` | cross-service trace |
| `user_id` | when available and safe |
| `node_id` | node-related flows |
| `config_version` | config consistency |
| `error_code` | operational diagnosis |
| `latency_ms` | performance |
| `idempotency_key` | duplicate diagnosis |

Minimum metrics:

- API latency by route
- API error rate by `error_code`
- Redis write failure rate
- DB transaction failure rate
- config publish success/failure
- payment webhook success/failure
- NodeAgent report freshness
- recommendation fallback rate

## 12. Testing Matrix

| Test | Required |
| --- | --- |
| handler validation tests | yes |
| idempotency tests | yes |
| DB transaction tests | yes |
| Redis failure compensation tests | yes |
| payment webhook replay tests | yes |
| config hash mismatch tests | yes |
| stale node status tests | yes |
| unknown error compatibility tests | yes |

Before merging a backend TASK, run:

```bash
go test ./...
```

If Docker-based integration tests are available:

```bash
docker compose -f infra/docker-compose.test.yml up -d
go test ./... -tags=integration
```

## 13. AI Implementation Prompt

Use this prompt for backend AI coding:

```text
You are implementing LiveMask backend in the livemask-backend repository.

Read these docs before coding:
- docs/contracts/api/core-mvp.md
- docs/contracts/error-codes.md
- docs/contracts/state-machines.md
- docs/contracts/data-consistency.md
- docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md
- docs/backend/LIVEMASK_BACKEND_IMPLEMENTATION_BRIEF.md

Implement only the TASK scope. Do not invent unrelated modules.

Backend rules:
- PostgreSQL is the business source of truth.
- Redis is cache/realtime/queue and must be recoverable.
- External writes must be idempotent.
- API errors must return request_id, error_code, message, retry_after when needed, and fallback_action when needed.
- Config APIs must include config_version and config_hash.
- NodeAgent report APIs must handle duplicate and out-of-order reports.
- Payment webhooks must verify signature and be replay-safe.
- Admin-changing actions must create audit logs.
- Logs must not include tokens, payment secrets, browsing history, or traffic content.

After implementation, add focused tests and update docs when contracts, state
machines, DB schema, Redis keys, or error codes change.
```

## 14. Acceptance Checklist

- [ ] TASK ID is referenced.
- [ ] API contract updated or confirmed unchanged.
- [ ] DB migration exists for schema changes.
- [ ] Redis keys are documented when added.
- [ ] Error codes are documented.
- [ ] State transitions are explicit.
- [ ] Idempotency is tested.
- [ ] Redis failure path is recoverable.
- [ ] App and NodeAgent impact is checked.
- [ ] Admin audit impact is checked.
- [ ] CI passes.
