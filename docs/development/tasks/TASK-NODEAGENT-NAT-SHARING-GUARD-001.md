# TASK-NODEAGENT-NAT-SHARING-GUARD-001 - NodeAgent NAT Sharing Aggregate Signals

> Status: Ready
> Repository: livemask-nodeagent
> Environment: dev-local
> Parent: TASK-DOC-NAT-SHARING-GUARD-001
> Contract: docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md
> Issues: livemask-docs#20, livemask-nodeagent#1

## 1. Background

NodeAgent cannot perfectly prove downstream physical device count, but it can
provide aggregate per-session/window signals that help Backend detect likely
VPN sharing abuse without storing browsing history or raw destinations.

## 2. Scope

### In Scope

- Collect aggregate per-session/window counters such as concurrent flow count,
  destination fanout count, sustained Mbps, burst Mbps, and coarse protocol mix.
- Apply Backend-issued per-session limits when supported by the runtime.
- Emit privacy-safe risk events such as `nat_sharing_suspected` and
  `nat_sharing_action_applied`.
- Redact session identifiers in logs and metrics.
- Keep metrics labels low-cardinality.
- Preserve last-known-good behavior if policy fetch fails.

### Out of Scope

- Backend scoring/action ownership.
- App warning UI.
- Admin settings UI.
- Packet payload inspection.
- Raw destination/domain/URL/DNS query storage.
- Editing `../livemask-docs` from NodeAgent.

## 3. Contracts

- API: Backend internal risk event ingest or existing event upload path.
- Config: Backend-issued `nat_sharing_guard` policy slice.
- Events: `nat_sharing_suspected`, `nat_sharing_action_applied`.
- Error Codes: use Backend-defined codes only in responses; NodeAgent logs stay
  redacted.
- State Machines: observe/warn/throttle/revoke actions are Backend-owned.

## 4. Cross-Repo Impact

| Repo | Impact | Must Modify | Validation |
| --- | --- | --- | --- |
| `livemask-nodeagent` | Primary aggregate signal implementation | Yes | Go tests, synthetic counters |
| `livemask-backend` | Receives events and sends policy | No | Integration compatibility |
| `livemask-app` | Receives Backend warning status later | No | N/A |
| `livemask-admin` | Views redacted events later | No | N/A |
| `livemask-ci-cd` | Later smoke sends synthetic events | No | Follow-up |

## 5. Implementation Plan

- [ ] Locate traffic/runtime counters that can be aggregated safely.
- [ ] Add policy parser with LKG fallback.
- [ ] Add privacy-safe event builder and redaction tests.
- [ ] Add enforcement hook for supported throttle/cap actions.
- [ ] Add unit tests and synthetic event fixtures.

## 6. Validation Plan

- [ ] `go test ./...`
- [ ] `go vet ./...`
- [ ] `go build ./...`
- [ ] Synthetic high-fanout counter test emits only aggregate fields.
- [ ] Logs/metrics contain no raw destinations, domains, URLs, payloads, or
  unredacted session IDs.
- [ ] `git diff --check`

## 7. Risks

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| High-cardinality metrics | Monitoring cost/noise | Hash/redact IDs and cap labels | NodeAgent |
| Runtime cannot observe some signals | Weak detection | Mark optional signals disabled and rely on Backend policy | NodeAgent |
| Privacy leak in logs | Security breach | Redaction tests and forbidden-key scan | NodeAgent |

## 8. Rollback

- Rollback trigger: runtime instability, false enforcement, or privacy leak.
- Rollback steps: disable policy application, fall back to observe/no-op, or
  revert NodeAgent merge.
- Rollback verification: NodeAgent starts, heartbeat works, no NAT risk events
  are emitted unless policy is enabled.

## 9. Completion Evidence

- Task branch:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- Synthetic event evidence:
- Privacy evidence:
- Docs handoff:

## 10. Follow-up

- TASK-CICD-NAT-SHARING-GUARD-001
