# TASK-APP-NAT-SHARING-GUARD-001 - App NAT Sharing No-Sharing Posture And Warning UX

> Status: Ready
> Repository: livemask-app
> Environment: dev-local
> Parent: TASK-DOC-NAT-SHARING-GUARD-001
> Contract: docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md
> Issues: livemask-docs#19, livemask-app#2

## 1. Background

The App must not intentionally expose VPN sharing, LAN proxy, router mode, or
hotspot-forwarding features. Backend/NodeAgent own risk scoring and enforcement,
while App owns user-safe warnings and platform runtime posture.

## 2. Scope

### In Scope

- Audit native VPN runtime boundaries for LAN-facing listeners/proxy surfaces.
- Ensure no UI or config path advertises "share VPN to LAN", "router mode", or
  similar behavior.
- Parse Backend warning/throttle/revoke states when available.
- Show localized warning/throttle/reconnect messages without exposing internal
  risk signals.
- Add Sentry/log redaction tests for risk payloads and connect credentials.

### Out of Scope

- Backend policy/scoring implementation.
- NodeAgent aggregate counters.
- Admin policy UI.
- Claiming perfect prevention on rooted/admin-controlled devices.
- Editing `../livemask-docs` from App.

## 3. Contracts

- API: App-facing warning/status fields from Backend.
- Config: `nat_sharing_guard` policy may appear through runtime governance.
- Events: App should not emit raw risk payloads to Sentry.
- Error Codes: `NAT_SHARING_SUSPECTED`, `NAT_SHARING_THROTTLED`,
  `CONNECT_CONFIG_SESSION_REVOKED`.
- State Machines: observe/warn/throttle/revoke user states.

## 4. Cross-Repo Impact

| Repo | Impact | Must Modify | Validation |
| --- | --- | --- | --- |
| `livemask-app` | Primary warning UX and native no-sharing posture | Yes | Flutter tests, platform checks |
| `livemask-backend` | Provides warning/status fields | No | Contract compatibility |
| `livemask-nodeagent` | Provides aggregate event inputs to Backend | No | N/A |
| `livemask-admin` | Configures policy later | No | N/A |
| `livemask-ci-cd` | Later smoke verifies no sensitive leakage | No | Follow-up |

## 5. Implementation Plan

- [ ] Audit App VPN/native boundary and UI copy for sharing/router features.
- [ ] Add models/parsers for Backend warning/throttle/revoke state.
- [ ] Add localized UI states and reconnect guidance.
- [ ] Add Sentry/log redaction tests.
- [ ] Add platform-specific evidence for no App-created LAN proxy/listener.

## 6. Validation Plan

- [ ] `flutter analyze`
- [ ] `flutter test`
- [ ] Platform runtime check for task-relevant platform(s).
- [ ] Sentry/log test confirms no raw referral codes, payout addresses, connect
  credentials, endpoint URLs, or risk payloads are emitted.
- [ ] `git diff --check`

## 7. Risks

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| User confusion from warning copy | Support burden | Localized, non-accusatory text and clear next step | App |
| App claims enforcement it cannot guarantee | Product/legal risk | Use best-effort language and Backend-owned actions | App |
| Sensitive risk data leaks to Sentry | Security breach | Redaction tests and minimal UI fields | App |

## 8. Rollback

- Rollback trigger: warning UI blocks normal connections, native runtime
  regression, or telemetry leak.
- Rollback steps: disable warning UI via config or revert App merge.
- Rollback verification: normal connect flow works and logs remain redacted.

## 9. Completion Evidence

- Task branch:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- Runtime/platform evidence:
- Privacy evidence:
- Docs handoff:

## 10. Follow-up

- TASK-CICD-NAT-SHARING-GUARD-001
