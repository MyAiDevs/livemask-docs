# LiveMask Contract Index

> Task: `TASK-DOCS-GOVERNANCE-SYNC-BATCH-001`
> Status: Ready
> Purpose: Single contract index for multi-repo Cursor windows, PR reviews, and
> CI/CD smoke ownership checks.

This file is the canonical quick index. `README.md` remains the human-readable
contracts landing page, but CI/CD and Cursor handoffs should reference this file
when they need one stable list of contract ownership.

## Core Contracts

| Domain | Contract | Status | Primary Task | Impacted Repos |
| --- | --- | --- | --- | --- |
| API | [Core MVP API](api/core-mvp.md) | Stable | `TASK-P0-03` | Backend / App / Website / CI-CD |
| API | [Auth / RBAC](api/auth-rbac.md) | Stable | `TASK-AUTH-001` | Backend / Admin / Website / App / CI-CD |
| Config | [Core MVP Config](config/core-configs.md) | Stable | `TASK-P0-03` | Backend / Admin / App / NodeAgent |
| Events | [Core MVP Events](events/core-events.md) | Stable | `TASK-P0-03` | Backend / Job Service / NodeAgent / App |
| Errors | [Error Codes](error-codes.md) | Stable | `TASK-P0-03` | All repos |
| State | [State Machines](state-machines.md) | Stable | `TASK-P0-03` | Backend / Admin / App |
| Data | [Data Consistency](data-consistency.md) | Stable | `TASK-P0-03` | Backend / Job Service / App / NodeAgent |

## Admin And Operations

| Domain | Contract | Status | Primary Task | Impacted Repos |
| --- | --- | --- | --- | --- |
| Admin IA | [Admin Navigation IA](admin/ADMIN_NAVIGATION_IA_CONTRACT.md) | Ready | `TASK-DOC-ADMIN-NAV-IA-001` | Admin / Backend / CI-CD |
| Dashboard | [Admin Control Plane Dashboard](admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md) | Ready | `TASK-DOC-ADMIN-DASHBOARD-REALTIME-001` | Backend / Admin / Job Service / CI-CD |
| System Settings | [Admin System Settings](admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md) | Ready | `TASK-DOC-ADMIN-SYSTEM-SETTINGS-001` | Backend / Admin / Job Service / App / CI-CD |
| Jobs | [Admin Job Scheduler](jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md) | Ready | `TASK-DOC-ADMIN-JOBS-001` | Backend / Job Service / Admin / CI-CD |
| Jobs | [Job Queue Usage Matrix](jobs/JOB_QUEUE_USAGE_MATRIX.md) | Ready | `TASK-DOC-JOB-QUEUE-MATRIX-001` | Backend / Job Service / NodeAgent / App / CI-CD |
| Observability | [Log / Audit / Metric Pipeline](observability/LOG_METRIC_PIPELINE_CONTRACT.md) | Ready | `TASK-DOC-OBSERVABILITY-LOGS-METRICS-001` | Backend / Job Service / NodeAgent / App / Admin / CI-CD |

## App, Website, And Content

| Domain | Contract | Status | Primary Task | Impacted Repos |
| --- | --- | --- | --- | --- |
| App Release | [App Release Distribution](app/APP_RELEASE_DISTRIBUTION_CONTRACT.md) | Ready | `TASK-DOC-APP-RELEASE-DISTRIBUTION-001` | Backend / Admin / App / Website / Job Service / CI-CD |
| App Runtime | [App Runtime Governance Config](app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md) | Ready | `TASK-DOC-APP-RUNTIME-GOVERNANCE-001` | Backend / Admin / App / CI-CD |
| Content | [Content System](content/CONTENT_SYSTEM_CONTRACT.md) | Stable | `TASK-DOC-CONTENT-001` | Backend / Admin / App / Website / CI-CD |
| Content | [Blog / SEO Content Sub-Contract](content/BLOG_SEO_CONTENT_CONTRACT.md) | Stable | `TASK-DOC-CONTENT-001` | Backend / Website / CI-CD |
| I18N | [I18N Localization](i18n/I18N_LOCALIZATION_CONTRACT.md) | Ready | `TASK-DOC-I18N-001` | Backend / Admin / App / Website / CI-CD |
| Users | [User Contact / Notification](users/USER_CONTACT_NOTIFICATION_CONTRACT.md) | Ready | `TASK-DOC-USER-CONTACT-NOTIFICATION-001` | Backend / Admin / Job Service / Support / CI-CD |
| Users | [User Growth / Revenue](users/USER_GROWTH_REVENUE_CONTRACT.md) | Ready | `TASK-DOC-USER-GROWTH-REVENUE-001` | Backend / Admin / App / Website / Job Service / CI-CD |

## Node, GeoIP, Protocol, And Realtime

| Domain | Contract | Status | Primary Task | Impacted Repos |
| --- | --- | --- | --- | --- |
| NodeAgent | [Release / Config / Rollback](nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md) | Stable | `TASK-DOC-NODEAGENT-RELEASE-001` | Backend / NodeAgent / Admin / Job Service / CI-CD |
| GeoIP | [Database Sync](geoip/GEOIP_DATABASE_SYNC_CONTRACT.md) | Stable | `TASK-DOC-GEOIP-SYNC-001` | Backend / NodeAgent / App / Admin / CI-CD |
| GeoIP | [Source Hardening](geoip/GEOIP_SOURCE_HARDENING_CONTRACT.md) | Stable | `TASK-DOC-GEOIP-CONTRACT-002` | Backend / Job Service / CI-CD |
| GeoIP | [Credential Management](geoip/GEOIP_CREDENTIAL_MANAGEMENT_CONTRACT.md) | Ready | `TASK-DOC-GEOIP-CREDENTIALS-001` | Backend / Admin / Job Service / CI-CD |
| VPN | [Hysteria2 Connect Config](vpn/HYSTERIA2_CONNECT_CONFIG_CONTRACT.md) | Ready | `TASK-VPN-CONFIG-001` | Backend / NodeAgent / App / Admin / CI-CD |
| Protocol Endpoint | [Template & Rollout](protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) | Ready | `TASK-DOC-PROTOCOL-ENDPOINT-001` | Backend / NodeAgent / Admin / Job Service / App / CI-CD |
| Protocol Endpoint | [Capability & Negotiation](protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md#34-protocol-capability-sync) | Ready | `TASK-DOC-PROTOCOL-CAPABILITY-001` | Backend / NodeAgent / Admin / CI-CD |
| Protocol Endpoint | [Stability Gate](../development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) | Ready | `TASK-DOC-PROTOCOL-STABILITY-GATE-001` | Backend / NodeAgent / Admin / App / Job Service / CI-CD |
| Realtime | [Client Reconnect Hint](realtime/CLIENT_RECONNECT_HINT_CONTRACT.md) | Ready | `TASK-DOC-RECONNECT-001` | Backend / App / NodeAgent / CI-CD |

## Governance Rules

- Any API, config, event, error code, status, permission, or smoke behavior
  change must update the relevant contract first.
- Cross-repo changes must list impacted repos and validation paths.
- CI/CD smoke scripts must link to the contract they verify.
- Cursor handoffs must name the contract and task ID before implementation.
- If code and contract disagree, stop and decide whether code or contract is
  wrong before expanding implementation.
