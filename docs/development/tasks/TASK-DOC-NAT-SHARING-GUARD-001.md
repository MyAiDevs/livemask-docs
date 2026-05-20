# TASK-DOC-NAT-SHARING-GUARD-001

> Owner: Docs / Security / Backend / NodeAgent / App / Admin / CI-CD
> Repo: `livemask-docs`
> Status: Completed
> Environment: dev-local
> Issues: livemask-docs#17

## 1. Background

The product needs a policy to stop one App user from turning a LiveMask VPN
session into a router, hotspot, NAT gateway, or LAN proxy for multiple
downstream devices.

This is a real abuse scenario, but it cannot be solved by NodeAgent alone with a
perfect guarantee. Server-side nodes usually see the VPN session and aggregate
flows, not a trustworthy list of downstream physical devices. A rooted phone,
desktop with admin privileges, or external router can still NAT traffic outside
the App's direct control.

Therefore the product needs a layered, privacy-preserving guard:

- App native runtime does not intentionally expose LAN sharing / router mode.
- Backend issues short-lived session credentials and owns risk policy.
- NodeAgent gathers aggregate per-session flow signals and applies caps.
- Admin operates thresholds, dry-run, rollout, and audit.
- CI/CD verifies behavior and proves no browsing history or raw destinations are
  stored.

## 2. Scope

This docs task defines the cross-repo contract and follow-up tasks. It does not
change runtime code.

Included:

- NAT sharing / device-as-router threat model.
- Privacy boundary for allowed signals.
- Backend / NodeAgent / App / Admin / CI-CD responsibilities.
- Policy schema for `nat_sharing_guard`.
- Follow-up implementation tasks.

Excluded:

- Runtime enforcement implementation.
- Packet payload inspection.
- Raw destination/domain logging.
- Claims of perfect prevention on rooted/admin-controlled devices.

## 3. Deliverables

- [x] Add `docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md`.
- [x] Link the contract from security docs.
- [x] Extend VPN connect_config security model with NAT sharing threat.
- [x] Extend App native runtime contract with no-sharing requirements.
- [x] Link App Runtime Governance to `nat_sharing_guard`.
- [x] Link NodeAgent README to NodeAgent guard responsibilities.
- [x] Add task/index entries for future implementation.

## 4. Cross-Repo Impact

| Repo | Impact | Current State |
| --- | --- | --- |
| `livemask-backend` | Must own policy, session risk state, warning/throttle/revoke actions, and Admin APIs. | Future task |
| `livemask-nodeagent` | Must collect aggregate counters and report redacted risk events. | Future task |
| `livemask-app` | Must avoid shipping LAN sharing/router mode and display Backend warnings. | Future task |
| `livemask-admin` | Must expose dry-run/settings and redacted risk events. | Future task |
| `livemask-ci-cd` | Must verify policy, RBAC, enforcement and no privacy leaks. | Future task |
| `livemask-docs` | Owns contract and task ledger. | This task |

## 5. Follow-Up Tasks

| Task | Repo | Scope | Validation |
| --- | --- | --- | --- |
| [TASK-BACKEND-NAT-SHARING-GUARD-001](TASK-BACKEND-NAT-SHARING-GUARD-001.md) | `livemask-backend` | Policy storage, session risk scoring, Admin APIs, App warning/status response | Go tests + smoke |
| [TASK-NODEAGENT-NAT-SHARING-GUARD-001](TASK-NODEAGENT-NAT-SHARING-GUARD-001.md) | `livemask-nodeagent` | Aggregate counters, redacted events, enforcement hooks | Go tests + synthetic traffic counters |
| [TASK-APP-NAT-SHARING-GUARD-001](TASK-APP-NAT-SHARING-GUARD-001.md) | `livemask-app` | Native runtime no-sharing posture, warning UI, no-Sentry leakage tests | Flutter tests + platform runtime checks |
| [TASK-ADMIN-NAT-SHARING-GUARD-001](TASK-ADMIN-NAT-SHARING-GUARD-001.md) | `livemask-admin` | App runtime/security settings UI and redacted event views | Vitest + Next build |
| [TASK-CICD-NAT-SHARING-GUARD-001](TASK-CICD-NAT-SHARING-GUARD-001.md) | `livemask-ci-cd` | End-to-end smoke and privacy leak scan | Docker dev-local smoke |

## 6. Validation

- `bash scripts/check-docs.sh`
- `git diff --check`

## 7. Done Criteria

- Contract explains feasibility and limitations clearly.
- No document claims NodeAgent can perfectly block all NAT/router abuse alone.
- Privacy rules forbid destination history, domains, URLs, and payload storage.
- Follow-up implementation tasks are registered in task/MVP indexes.
- Docs validation passes.

## 8. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-DOC-NAT-SHARING-GUARD-001` |
| Contract | `docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md` |
| Follow-up tasks | Backend, NodeAgent, App, Admin, CI/CD implementation TASK files created |
| Validation | `bash scripts/check-docs.sh`; `python3 scripts/check-task-leases.py`; `git diff --check` |
| Docs handoff | Runtime repos must implement only their follow-up TASKs and must not edit `livemask-docs` directly. |
