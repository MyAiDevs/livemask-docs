# TASK-APP-RECONNECT-STABILITY-001 — App Reconnect Stability

> Status: Completed
> Repository: livemask-app
> Environment: dev-local

## 1. Background

App reconnect hints are Backend-owned signals. The App must not treat a hint as
connect configuration and must not immediately tear down a working tunnel before
it has fetched and validated fresh `connect_config`.

This task implements the App-side reconnect stability behavior for protocol
endpoint changes.

## 2. Implemented Scope

| File | Change |
| --- | --- |
| `lib/models/connect_models.dart` | Added `ReconnectHintsResponse` and `PolledReconnectHint` models with JSON, expiry, and deferral helpers. |
| `lib/api/connect_api_client.dart` | Added abstract `fetchConnectConfig()`. |
| `lib/api/connect_api_client.dart` | Added `fetchReconnectHints({String? sessionId})` to the abstract interface. |
| `lib/api/real_connect_api_client.dart` | Implemented `GET /api/v1/connect/config` and `GET /api/v1/reconnect-hints`. |
| `lib/api/mock_connect_api_client.dart` | Added mock implementations plus injectable reconnect hint helpers. |
| `lib/providers/connect_providers.dart` | Refactored reconnect into a three-step safe flow and added polling, deduplication, start/stop lifecycle, and non-disruptive error handling. |
| `test/connect_models_test.dart` | Added reconnect hint model tests for JSON, expiry, deferral, labels, and safe fields. |
| `test/mock_connect_api_client_test.dart` | Added `fetchConnectConfig()` and `fetchReconnectHints()` scenario tests. |
| `test/real_connect_api_client_test.dart` | Added real client reconnect hint request tests. |

## 3. Reconnect Stability Behavior

The App now follows a three-step reconnect method:

1. Fetch fresh `connect_config` after receiving a reconnect hint.
2. If the config is unsupported, skeleton, or engine-pending, restore the
   pre-hint state and keep the old tunnel/session active.
3. Only when the new config is ready, create a new session and start the native
   tunnel.

Safety behavior:

- Reconnect hint is treated as a signal only.
- Polled reconnect hints are fetched from `GET /api/v1/reconnect-hints`.
- Hint payloads are never trusted as connect configuration; the App always
  fetches a fresh `connect_config`.
- Processed hint IDs are deduplicated to prevent repeated reconnect attempts.
- Polling errors are swallowed and do not break the active connection.
- `fetchConnectConfig()` pulls config and does not create a new session.
- Old tunnel is not immediately disconnected.
- `unsupported`, `skeleton`, and `hysteria2 engine pending` states restore
  pre-hint UI/state.
- `fetchConnectConfig()` failure restores the pre-hint state.
- `createSession()` failure can show `reconnectFailed` because the old Backend
  session may already have been invalidated by design.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must provide `GET /api/v1/connect/config` with valid `connect_config` for real integration. |
| `livemask-nodeagent` | No direct dependency for this task; protocol assignment/apply remains separate. |
| `livemask-ci-cd` | Should add reconnect hint smoke once Backend endpoint is available. |
| `livemask-docs` | Records App reconnect stability completion and remaining Backend/CI dependencies. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-APP-RECONNECT-STABILITY-001` |
| Task branch commit | `6eefee4`; latest polling increment included in `TASK-APP-RECONNECT-STABILITY-001` |
| Dev merge commit | `17e83c9`; latest polling dev merge `5a433f9` |
| Remote dev ref | `5a433f9` |
| Validation | `flutter test` PASS (84/84 focused tests) for the original flow; latest polling validation PASS (`flutter test`, 592/592). `flutter analyze` has pre-existing info/warnings only, with 0 new issues from this task. |

Custom validation command:

```bash
flutter test test/reconnect_hint_test.dart test/connect_models_test.dart test/mock_connect_api_client_test.dart test/real_connect_api_client_test.dart
```

## 6. Remaining Dependencies

- Backend runtime dependency is resolved by
  `TASK-BACKEND-RECONNECT-HINT-RUNTIME-001` at Backend dev merge `1442e64`.
- CI/CD should add `TASK-CICD-RECONNECT-HINT-001` or fold reconnect hint checks
  into protocol stability runtime smoke.
- Real App + Backend integration should validate:
  poll hints -> fetch config -> safe pending or new session -> new tunnel start.

## 7. Done Criteria

- [x] App consumes Backend reconnect hints as signals only.
- [x] App polls `GET /api/v1/reconnect-hints`.
- [x] App fetches fresh connect config before reconnect.
- [x] Old tunnel/session state is preserved until the new config is safe.
- [x] Unsupported/app_pending/skeleton profiles do not blackhole the tunnel.
- [x] Focused reconnect tests pass.
- [x] Full App test suite passes after polling implementation.
- [x] App changes are merged to `dev`.

## 8. Incremental Update: Reconnect Hint Polling

Latest App dev merge `5a433f9` completes the polling side of this task. The
App now consumes Backend reconnect hints from `GET /api/v1/reconnect-hints`,
deduplicates processed hint IDs, and then runs the existing safe reconnect
flow by fetching a fresh `connect_config`.

| Area | Change |
| --- | --- |
| Models | Added `ReconnectHintsResponse` and `PolledReconnectHint` with JSON, expiry, deferral, and safety helpers. |
| API clients | Added `fetchReconnectHints({String? sessionId})` to abstract, real, and mock clients. |
| Provider | Added polling timer lifecycle, deduplication, safe polled reconnect execution, and non-disruptive error swallowing. |
| Tests | Added model, real client, and mock client coverage for reconnect hints. |

Evidence:

| Field | Value |
| --- | --- |
| Integration branch | `integration/task-app-reconnect-stability-001-task-TASK-APP-RECONNECT-STABILITY-001-20260520183945` (`e740710`) |
| Dev merge commit | `5a433f9` |
| Remote dev ref | `origin/dev` (`5a433f9`) |
| Validation | `flutter test` PASS (592/592); `flutter analyze` only reports pre-existing info/warnings with 0 new issues from this task |

No new UI surface was added; this increment is background polling and reconnect
control logic only.
