# NAT Sharing / Device-as-Router Abuse Guard Contract

> Task: `TASK-DOC-NAT-SHARING-GUARD-001`
> Owner: Security / Backend / NodeAgent / App / Admin / CI-CD
> Status: Ready
> Scope: Defines a privacy-preserving guardrail against users turning one
> LiveMask App session into a LAN router, hotspot, NAT gateway, or shared proxy
> for multiple downstream devices.

## 1. Decision

This control is feasible as a layered abuse-prevention system, but it must not
be described as a perfect server-side guarantee.

NodeAgent alone cannot always prove that a client device is forwarding traffic
for other devices, especially when the user controls the device, hotspot, local
router, or operating system. The correct product architecture is:

```text
App native VPN runtime
  -> avoids creating LAN-facing proxy/listener or intentional route sharing
Backend connect/session policy
  -> issues short-lived, session-bound credentials and risk actions
NodeAgent / sing-box runtime
  -> observes aggregate per-session flow signals and enforces caps
Backend risk service
  -> scores aggregate signals and revokes/throttles/warns
Admin settings
  -> controls thresholds, dry-run, rollout, and audit
CI/CD smoke
  -> verifies policy, enforcement, and no privacy leakage
```

The goal is to prevent casual sharing, detect high-confidence abuse, and provide
safe actions such as warning, throttling, session revocation, or temporary
cooldown. It is not a DRM-style guarantee against rooted devices or external
routers.

## 2. Threat Model

| Threat | Likelihood | Impact | Required Control |
| --- | --- | --- | --- |
| User enables OS hotspot and routes multiple devices through one VPN session | Medium | Revenue abuse, node pressure, degraded QoS | App best-effort no-sharing posture + Backend session limits + NodeAgent aggregate detection |
| User runs a local LAN proxy bound to `0.0.0.0` and shares VPN upstream | Medium | Account sharing, traffic amplification | App must not ship LAN proxy mode; NodeAgent detects fanout/flow abuse |
| User uses a local router or rooted device to NAT traffic through the tunnel | Low/Medium | Harder abuse, cannot be perfectly blocked | Best-effort risk scoring, throttling, session revoke, account review |
| False positive for heavy but legitimate single-device usage | Medium | Poor UX, support burden | Dry-run mode, conservative thresholds, warn before revoke, Admin override |
| Privacy-invasive detection captures browsing history | Unacceptable | Compliance/security breach | Store aggregate counters only; never store raw destinations, domains, payloads, or full URLs |

## 3. Privacy Boundary

Allowed signals are aggregate and low-cardinality:

| Signal | Allowed | Notes |
| --- | --- | --- |
| `concurrent_flow_count` | Yes | Per session/window integer |
| `destination_fanout_count` | Yes | Count only, no raw IP/domain list |
| `sustained_mbps` / `burst_mbps` | Yes | Per session/window |
| `protocol_mix` | Yes | Aggregate counts by coarse protocol family |
| `ttl_hop_limit_anomaly` | Optional | Only if the runtime can observe it safely; must be disabled by default |
| Raw destination IP/domain/URL | No | Must never be stored or returned |
| Packet payload | No | Must never be inspected or stored |
| User email/phone/wallet/device advertising ID | No | Use internal IDs or hashes where needed |

## 4. Policy Schema

The policy may live under `app_runtime_governance` and connect/session policy,
because both App and NodeAgent need different slices of the same decision.

```json
{
  "nat_sharing_guard": {
    "enabled": true,
    "mode": "observe",
    "dry_run": true,
    "thresholds": {
      "max_concurrent_flows": 128,
      "max_destination_fanout_5m": 80,
      "max_sustained_mbps": 50,
      "ttl_anomaly_enabled": false
    },
    "actions": {
      "warn_user": true,
      "throttle_mbps": 5,
      "revoke_session": false,
      "cooldown_minutes": 30
    },
    "privacy": {
      "store_raw_destination": false,
      "store_payload": false,
      "store_domains": false,
      "aggregate_window_seconds": 300
    }
  }
}
```

Valid modes:

| Mode | Behavior |
| --- | --- |
| `observe` | Record privacy-safe risk events only. |
| `warn` | Return warning state to App and Admin without traffic enforcement. |
| `throttle` | Apply temporary per-session bandwidth or flow cap. |
| `revoke` | Revoke the current session and require reconnect/re-auth. |

MVP default must be `enabled=true`, `mode=observe`, and `dry_run=true` until
CI/CD smoke and Admin override behavior are proven.

## 5. Backend Requirements

Backend must:

- Include safe `nat_sharing_guard` policy in App runtime governance and/or
  session policy response.
- Bind connect credentials to one user/session/device context where possible.
- Track risk events with aggregate counters only.
- Expose Admin summary and settings through System Settings or App Runtime
  Governance.
- Support actions: `warn`, `throttle`, `revoke_session`, and `cooldown`.
- Write audit logs for policy changes and enforcement actions.
- Return stable user-visible errors/warnings, for example:
  - `NAT_SHARING_SUSPECTED`
  - `NAT_SHARING_THROTTLED`
  - `CONNECT_CONFIG_SESSION_REVOKED`

Backend must not:

- Store destination history.
- Store raw domains, URLs, packet payloads, or DNS queries for this feature.
- Treat one signal as conclusive proof without thresholds and cooldowns.

## 6. NodeAgent Requirements

NodeAgent must:

- Apply Backend-issued per-session limits where supported by the local runtime.
- Collect aggregate per-session/window counters.
- Emit privacy-safe events such as `nat_sharing_suspected` and
  `nat_sharing_action_applied`.
- Redact session identifiers in logs and metrics.
- Keep labels low-cardinality.
- Continue to support last-known-good config if the policy fetch fails.

Recommended event shape:

```json
{
  "event_type": "nat_sharing_suspected",
  "node_id": "node_uuid",
  "session_id_hash": "sha256:...",
  "risk_score": 72,
  "window_start": "2026-05-20T02:00:00Z",
  "window_end": "2026-05-20T02:05:00Z",
  "signals": {
    "concurrent_flow_count": 190,
    "destination_fanout_count": 130,
    "sustained_mbps": 62
  },
  "action": "observe"
}
```

## 7. App Requirements

The native VPN runtime must:

- Avoid creating LAN-facing proxy/listener surfaces.
- Avoid shipping any "share VPN to LAN" or "router mode" feature.
- Respect Backend warnings and display localized messages without exposing
  internal risk signals.
- Keep VPN UI usable when the guard is in observe/warn mode.
- Never put raw referral codes, payout addresses, connect credentials, endpoint
  URLs, or risk payloads into Sentry breadcrumbs.

Platform-specific implementation is best effort. A rooted/admin-controlled
device may still route traffic outside the App's control; Backend/NodeAgent risk
actions handle that residual risk.

## 8. Admin Requirements

Admin should expose this under App Runtime / Security Settings:

| Route | Purpose |
| --- | --- |
| `/admin/settings/app-runtime` | Edit `nat_sharing_guard` policy alongside runtime governance |
| `/admin/logs` or future risk page | Show redacted guard events and actions |

Admin must show:

- Current mode and dry-run status.
- Thresholds and validation ranges.
- Recent aggregate actions by count, not raw destinations.
- Audit trail for policy changes.
- Clear warning that enforcement is best effort and privacy-preserving.

## 9. CI/CD Smoke

CI/CD should add a smoke task after Backend/Admin/NodeAgent/App implementation:

1. Read current NAT sharing guard policy.
2. Low-permission user cannot change policy.
3. Admin can preview or update thresholds in dry-run.
4. Synthetic NodeAgent event with high fanout is accepted.
5. Backend stores aggregate risk event only.
6. App-facing status returns warning/throttle only when policy mode allows it.
7. Secret/privacy scan confirms no raw IP list, domain list, payload, URL,
   credentials, node secret, email, phone, or wallet address appears.
8. Policy rollback restores previous mode.

## 10. Follow-Up Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-NAT-SHARING-GUARD-001` | `livemask-backend` | Policy storage, session risk scoring, Admin APIs, App warning/status response |
| `TASK-NODEAGENT-NAT-SHARING-GUARD-001` | `livemask-nodeagent` | Aggregate counters, redacted events, enforcement hooks |
| `TASK-APP-NAT-SHARING-GUARD-001` | `livemask-app` | Native runtime no-sharing posture, warning UI, no-Sentry leakage tests |
| `TASK-ADMIN-NAT-SHARING-GUARD-001` | `livemask-admin` | App runtime/security settings UI and redacted event views |
| `TASK-CICD-NAT-SHARING-GUARD-001` | `livemask-ci-cd` | End-to-end smoke and privacy leak scan |

## 11. Done Criteria

- Contract is linked from security, VPN, App runtime, NodeAgent, and task
  indexes.
- Backend and NodeAgent use aggregate counters only.
- App never intentionally exposes VPN sharing / LAN proxy mode.
- Admin can operate thresholds in dry-run before enforcement.
- CI/CD proves no sensitive traffic data leaks.
- Completion reports state clearly that the control is best-effort, not an
  absolute guarantee against rooted devices or external routers.
