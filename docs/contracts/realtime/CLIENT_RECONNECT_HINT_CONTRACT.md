# Client Reconnect Hint Contract

> Task: `TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001`
> Owner: Backend / App / NodeAgent / Admin / CI-CD / Docs
> Status: Ready with protocol stability gate
> Scope: Defines the cross-repo contract for notifying App clients about
> protocol/endpoint changes, triggering graceful reconnect, and ensuring the App
> pulls fresh `connect_config` before initiating a new connection.

Related mandatory contracts:

- [Protocol & Endpoint Template Contract](../protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md)
- [Hysteria2 Connect Config Contract](../vpn/HYSTERIA2_CONNECT_CONFIG_CONTRACT.md)
- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [NodeAgent Protocol Extension Architecture](../../nodeagent/NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md)
- [Protocol Endpoint Stability Gate](../../development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md)

---

## 1. Why This Exists

When a protocol rollout or endpoint change occurs on a node that an App client
is currently connected to, the App must be informed so it can:

1. Gracefully disconnect from the old endpoint/protocol.
2. Pull fresh `connect_config`.
3. Reconnect using the updated protocol or endpoint.

This contract answers:

- Who triggers the notification?
- How does the App receive it?
- What should the App do with the hint?
- How is the flow secure?

---

## 2. Core Principle: NodeAgent Does Not Notify App Directly

The single most important architectural rule:

```
NodeAgent must NOT notify App directly.
```

This remains true even if NodeAgent has a long-lived monitoring connection or a
local control API. The useful realtime mechanism is Backend -> App, triggered by
Backend's processing of NodeAgent events. NodeAgent has no App session authority
and must not fan out reconnect instructions.

### Why

- **Security**: NodeAgent operates with node-level secrets (node HMAC, private
  keys). These must never be used in App contexts. Direct notification would
  require sharing event semantics or a channel between two completely separate
  trust domains.
- **Loose coupling**: NodeAgent and App are independent clients of Backend.
  NodeAgent reports events to Backend. Backend decides when and how to inform
  App.
- **Trust boundary**: NodeAgent runs on node infrastructure (server/VPS). App
  runs on user devices. There is no direct trust relationship between them.
- **Scalability**: A single NodeAgent change may affect thousands of App
  sessions. NodeAgent should not be responsible for fanning out notifications.

### What NodeAgent Does Instead

```text
NodeAgent applies protocol profile/endpoint change
  -> NodeAgent performs health checks
  -> NodeAgent reports endpoint_ready (or failed) event to Backend
  -> Backend processes the event
  -> Backend updates connect_node_endpoints state
  -> Backend decides whether to notify connected App sessions
```

Backend must rate-limit, deduplicate, and audit reconnect hint creation. App
must treat the hint as a signal to refresh configuration, not as a replacement
for `connect_config`.

---

## 3. Communication Flow

### 3.1 End-to-End Sequence

```text
NodeAgent
  1. Pulls new protocol assignment from Backend
  2. Applies profile, validates, health-checks
  3. POST /internal/agent/protocol-events { event_type: "endpoint_ready", ... }
     -> Backend stores event, updates connect_node_endpoints

Backend
  4. Receives NodeAgent event
  5. Updates connect_node_endpoints: enabled=true, protocol=hysteria2, ...
  6. Checks template version, node capability, App support, and endpoint
     eligibility
  7. Determines which App sessions are connected to this node
  8. Creates idempotent reconnect hints with rate limits
  9. Pushes a "reconnect hint" to affected App sessions via realtime channel

App
  10. Receives reconnect hint event from Backend realtime channel
  11. Deduplicates by hint_id and validates expiry / delay
  12. Pulls fresh GET /api/v1/connect/config
  13. Keeps old tunnel until new config is fetched and supported
  14. Gracefully reconnects to the new endpoint using updated protocol
  15. Reports connection success/failure event to Backend
  16. Enters healthy connected state, or retries/falls back
```

### 3.2 Architecture Diagram

```text
+-----------+       +----------+       +-------+
| NodeAgent | ----> | Backend  | ----> |  App  |
|           | event |          | hint  |       |
|           |       |          |<------|       |
|           |<------|          | ack   |       |
+-----------+       +----------+       +-------+
                       |
                       v
                +------------------+
                | Admin / Observer |
                +------------------+
```

---

## 4. Backend -> App Realtime Reconnect Hint

### 4.1 Delivery Channel

The reconnect hint is delivered through the **existing App realtime channel**.
The channel mechanism is one of (in priority order):

| Channel | When to Use |
| --- | --- |
| **WebSocket** | App maintains a persistent WebSocket connection to Backend for real-time events. Preferred channel. |
| **Server-Sent Events (SSE)** | App uses SSE for unidirectional server push. Acceptable if WebSocket is not yet implemented. |
| **Long Polling** | Fallback when persistent connections are unavailable or the App is in background. |

The channel must be the same one used for other realtime events (session expiry,
payment notifications, etc.) to avoid adding a new connection type.

### 4.2 Event Schema

```json
{
  "event_type": "reconnect_hint",
  "hint_id": "hint_uuid",
  "reason": "protocol_rollout|endpoint_change|config_update|operator_maintenance",
  "current_node_id": "uuid-of-current-node",
  "suggested_action": "graceful_reconnect|reconnect_if_idle|reconnect_now",
  "ttl_seconds": 300,
  "issued_at": "2026-05-18T10:00:00Z",
  "expires_at": "2026-05-18T10:05:00Z"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `event_type` | string | Always `"reconnect_hint"`. |
| `hint_id` | uuid | Unique hint identifier for deduplication. |
| `reason` | string | Why the hint was issued. |
| `current_node_id` | uuid | The node the App is currently connected to. |
| `suggested_action` | string | Urgency level for the App. |
| `ttl_seconds` | integer | How long the hint is valid. |
| `issued_at` | timestamptz | When the hint was generated. |
| `expires_at` | timestamptz | After this time, the hint should be ignored. |

### 4.3 Reason Values

| Reason | Meaning |
| --- | --- |
| `protocol_rollout` | The protocol on the connected node has been updated. |
| `endpoint_change` | The public endpoint (IP, port) of the connected node has changed. |
| `config_update` | The node's configuration has been updated (non-breaking). |
| `operator_maintenance` | Operator-triggered maintenance notification. |

### 4.4 Suggested Action Values

| Action | Meaning | App Behavior |
| --- | --- | --- |
| `graceful_reconnect` | App should disconnect and reconnect as soon as convenient (e.g., after current request completes). | Graceful disconnect within a short window. |
| `reconnect_if_idle` | Reconnect only if the connection is idle (not transferring data). | Check connection state before acting. |
| `reconnect_now` | Immediate reconnect required (e.g., security-related change). | Disconnect immediately and reconnect. |

---

## 5. App Behavior: Graceful Reconnect

### 5.1 When App Receives a Reconnect Hint

```text
reconnect_hint received
  -> Validate hint_id not already processed (dedup)
  -> Check current_node_id matches this App's connected node
  -> Check expires_at not exceeded
  -> Evaluate suggested_action

  Case graceful_reconnect:
    -> Set flag: "pending disconnect"
    -> Wait for current transaction to complete (max N seconds)
    -> Initiate graceful disconnect
    -> Pull fresh connect_config

  Case reconnect_if_idle:
    -> Check if tunnel has active data transfer
    -> If idle: proceed with graceful disconnect
    -> If active: set a timer, check again later (max N seconds)

  Case reconnect_now:
    -> Initiate immediate disconnect (may interrupt active transfer)
    -> Pull fresh connect_config

After disconnect:
  -> GET /api/v1/connect/config
  -> Parse new config
  -> If new config is skeleton: enter enginePending state, do NOT connect
  -> If new config is valid: connect using new protocol/endpoint
  -> If connect succeeds:
       -> POST /api/v1/connect/events { event_type: "reconnected_ok", hint_id }
  -> If connect fails:
       -> Retry with backoff (max N attempts)
       -> POST /api/v1/connect/events { event_type: "reconnect_failed", hint_id, reason }
       -> Fall back to cached connect_config if available
       -> If all fallbacks fail: show "connection lost" with retry button
```

### 5.2 App State Machine

```text
connected
  -> reconnect_hint received
  -> disconnecting (graceful)
  -> fetching_new_config
  -> connecting (new protocol/endpoint)
  -> connected (new)

Failed during disconnecting:
  -> force_disconnect
  -> fetching_new_config

Failed during fetching_new_config:
  -> use_cached_config (if available and not expired)
  -> connecting (fallback)

Failed during connecting (new):
  -> retry with backoff (max N attempts)
  -> use_cached_config (fallback)
  -> disconnected (show user error, retry button)
```

### 5.3 App Implementation Requirements

- Deduplicate reconnect hints by `hint_id`. Ignore hints already processed.
- Ignore hints whose `expires_at` has passed.
- Do not show a visible "reconnecting" UI element to the user if the switch is
  seamless. Only show UI if connectivity is actually lost.
- If the new `connect_config` has `is_skeleton=true`, do NOT attempt to connect.
  Enter `enginePending` state and inform the user when a real configuration
  becomes available.
- Cache the previous working `connect_config` for fallback use.
- Report `reconnected_ok` or `reconnect_failed` events to Backend for
  observability.

---

## 6. App Pulls Fresh Connect Config

### 6.1 API Endpoint

```http
GET /api/v1/connect/config
```

The existing connect config endpoint is the single source of truth. After a
reconnect hint, App must call this endpoint to obtain the updated configuration.

### 6.2 Response Handling

App must handle these scenarios when the new config differs from the old one:

| Change | App Handling |
| --- | --- |
| `server.endpoint` changed | Connect to new endpoint with existing protocol. |
| `client.protocol` changed | Use new protocol engine (e.g., switch from mixed to hysteria2). |
| `is_skeleton=true` | Do not connect. Enter `enginePending` state. |
| Config unchanged (same config_version) | No reconnect needed. Hint was stale or mis-issued. |

---

## 7. ACK / Event Reporting

After processing a reconnect hint, App must report the outcome to Backend.

### 7.1 Report Endpoint

```http
POST /api/v1/connect/events
```

Auth: existing user JWT.

Request:
```json
{
  "event_type": "reconnected_ok|reconnect_failed|reconnect_skipped|reconnect_timeout",
  "hint_id": "uuid",
  "previous_node_id": "uuid",
  "new_node_id": "uuid-or-null",
  "previous_protocol": "mixed",
  "new_protocol": "hysteria2-or-same",
  "config_version": 2,
  "duration_ms": 3200,
  "reason": null,
  "reported_at": "2026-05-18T10:00:08Z"
}
```

### 7.2 Backend Processing

On receiving a reconnect event:

1. If `reconnected_ok`: mark the hint as acknowledged, update App session
   state with new node/protocol association.
2. If `reconnect_failed`: increment failure counter for this rollout wave. If
   error threshold is exceeded, consider pausing the rollout.
3. If `reconnect_skipped`: hint expired or was irrelevant (e.g., App was already
   reconnecting for another reason).
4. If `reconnect_timeout`: App did not act in time.

---

## 8. Fallback Polling Mode

### 8.1 When Polling Is Used

Polling is the fallback when:

- The App does not maintain a persistent realtime connection (WebSocket/SSE).
- The realtime connection was lost and the App is in a reconnecting state.
- The App was in background and missed realtime events during suspension.

### 8.2 Polling Mechanism

```http
GET /api/v1/connect/hints/pending?since=2026-05-18T09:00:00Z
```

Response:
```json
{
  "hints": [
    {
      "hint_id": "uuid",
      "reason": "protocol_rollout",
      "current_node_id": "uuid",
      "suggested_action": "graceful_reconnect",
      "ttl_seconds": 300,
      "issued_at": "2026-05-18T10:00:00Z",
      "expires_at": "2026-05-18T10:05:00Z"
    }
  ]
}
```

### 8.3 Polling Rules

- Poll interval: every 60 seconds when no realtime connection is active.
- If App re-establishes a realtime connection, stop polling.
- Hints with expired `expires_at` are not returned.
- After processing a hint via polling, report the ACK event via
  `POST /api/v1/connect/events`.

---

## 9. Security Boundaries

### 9.1 Rules

| # | Boundary | Control |
| --- | --- | --- |
| 1 | **NodeAgent never notifies App** | NodeAgent has no App device knowledge, no realtime channel, no user session context. It reports only to Backend. |
| 2 | **Backend controls notification** | Backend validates the hint is relevant to the user session, deduplicates, and sends only through authenticated user channels. |
| 3 | **App validates hint** | App checks `hint_id` dedup, `expires_at`, `current_node_id` match before acting. |
| 4 | **No secrets in hints** | Reconnect hint payload contains no credentials, tokens, or connect_config data. It is a pure signal. |
| 5 | **App pulls, not pushed, secrets** | Even though the hint is delivered via realtime, the actual `connect_config` is always pulled via authenticated API. |
| 6 | **Authenticated reporting** | ACK events use the user's JWT, not the hint itself. |
| 7 | **Rate limit hints** | Backend must rate-limit reconnect hints per session to prevent flooding. At most 1 hint per 60 seconds per session. |

### 9.2 What the Hint Does NOT Contain

The reconnect hint intentionally does **not** contain:

- `connect_config` data (endpoints, credentials, TLS params).
- `NodeAgent` secrets, HMAC, or node identity tokens.
- Session tokens or user credentials.
- Full node metadata lists.

It is purely a signal: "something changed, please refresh."

---

## 10. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-RECONNECT-HINT-001` | `livemask-backend` | Backend reconnect hint generation, realtime push, polling API, rate limiting. |
| `TASK-APP-RECONNECT-HINT-001` | `livemask-app` | App reconnect hint receiver, graceful disconnect, connect_config refresh, ACK reporting. |
| `TASK-BACKEND-CONNECT-EVENTS-001` | `livemask-backend` | Backend connect event ingestion, ACK processing, error threshold aggregation. |
| `TASK-CICD-RECONNECT-HINT-001` | `livemask-ci-cd` | Smoke tests: hint push, App pull, ACK, fallback polling, no secret leakage. |

---

## 11. Done Criteria

- NodeAgent does not notify App directly. All communication goes through Backend.
- Backend generates reconnect hints when `connect_node_endpoints` changes due to
  protocol rollout.
- Backend delivers hints via existing realtime channel (WebSocket/SSE priority).
- App receives hints, deduplicates, validates, and acts based on `suggested_action`.
- App pulls fresh `connect_config` before reconnecting.
- App reports ACK/result events to Backend.
- Fallback polling mode works when realtime channel is unavailable.
- No secrets appear in hint payloads, events, or logs.
- Backend rate-limits hints per session.

---

## 12. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-05-18 | Initial version | TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 |
