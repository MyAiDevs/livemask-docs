# TASK-BACKEND-NAT-SHARING-GUARD-001 - Backend NAT Sharing Guard Policy And Risk APIs

> Status: Ready
> Repository: livemask-backend
> Environment: dev-local
> Parent: TASK-DOC-NAT-SHARING-GUARD-001
> Contract: docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md
> Issues: livemask-docs#18, livemask-backend#3

## 1. Background

LiveMask must discourage users from turning one VPN session into a LAN router,
hotspot, NAT gateway, or shared proxy for multiple downstream devices. The
contract defines a best-effort, privacy-preserving control. Backend owns policy,
session risk state, action decisions, Admin APIs, App-facing warning state, and
audit logs.

## 2. Scope

### In Scope

- Add `nat_sharing_guard` policy storage or extend App Runtime Governance with
  the schema from the contract.
- Add session risk event persistence using aggregate counters only.
- Add scoring/actions for observe, warn, throttle, revoke, and cooldown.
- Expose Admin read/update/preview APIs and App session warning/status response.
- Add stable error/warning codes:
  - `NAT_SHARING_SUSPECTED`
  - `NAT_SHARING_THROTTLED`
  - `CONNECT_CONFIG_SESSION_REVOKED`
- Update OpenAPI in the same task.

### Out of Scope

- NodeAgent traffic-counter collection.
- App warning UI.
- Admin page implementation.
- Storing destination history, domains, URLs, packet payloads, DNS queries, or
  raw destination IP lists.
- Editing `../livemask-docs` from Backend.

## 3. Contracts

- API: Admin policy/settings APIs, App warning/status response, internal
  NodeAgent risk event ingest if needed.
- Config: `nat_sharing_guard` policy from
  `docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md`.
- Events: privacy-safe aggregate risk events only.
- Error Codes: `NAT_SHARING_SUSPECTED`, `NAT_SHARING_THROTTLED`,
  `CONNECT_CONFIG_SESSION_REVOKED`.
- State Machines: observe -> warn -> throttle -> revoke with cooldown and
  Admin override.

## 4. Cross-Repo Impact

| Repo | Impact | Must Modify | Validation |
| --- | --- | --- | --- |
| `livemask-backend` | Primary policy, scoring, APIs, audit | Yes | Go tests, OpenAPI validation |
| `livemask-nodeagent` | Later reports aggregate counters | No | Contract compatibility |
| `livemask-app` | Later displays warning/throttle state | No | Contract compatibility |
| `livemask-admin` | Later edits policy and views risk events | No | Contract compatibility |
| `livemask-ci-cd` | Later smoke validates privacy and enforcement | No | Follow-up smoke |
| `livemask-docs` | Records completion evidence | No | Docs handoff |

## 5. Implementation Plan

- [ ] Locate existing App Runtime Governance / System Settings policy storage.
- [ ] Add policy schema and validation ranges.
- [ ] Add privacy-safe risk event model and redaction.
- [ ] Add scoring/action service with dry-run default.
- [ ] Add Admin APIs and App-facing warning/status behavior.
- [ ] Update OpenAPI JSON/YAML and validation.
- [ ] Add tests for policy, events, errors, RBAC, and privacy rejection.

## 6. Validation Plan

- [ ] `go test ./...`
- [ ] `go vet ./...`
- [ ] `go build ./...`
- [ ] `bash scripts/validate-openapi.sh`
- [ ] Secret/privacy scan proves no raw destinations, domains, URLs, payloads,
  credentials, email, phone, or wallet data are stored or returned.
- [ ] `git diff --check`

## 7. Risks

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| False positives revoke real users | Bad UX/support load | Dry-run default, warn before revoke, cooldown, Admin override | Backend |
| Privacy-invasive implementation | Compliance/security breach | Aggregate counters only and tests rejecting raw destinations | Backend |
| OpenAPI drift | Admin/CI mismatch | Update OpenAPI in same task and run validation | Backend |

## 8. Rollback

- Rollback trigger: policy causes false enforcement, privacy leak, or Backend
  startup/API regression.
- Rollback steps: disable `nat_sharing_guard` or revert the Backend merge.
- Rollback verification: policy disabled, connect flow works, and audit records
  the rollback.

## 9. Completion Evidence

- Task branch:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- OpenAPI evidence:
- Privacy evidence:
- Docs handoff:

## 10. Follow-up

- TASK-NODEAGENT-NAT-SHARING-GUARD-001
- TASK-APP-NAT-SHARING-GUARD-001
- TASK-ADMIN-NAT-SHARING-GUARD-001
- TASK-CICD-NAT-SHARING-GUARD-001
