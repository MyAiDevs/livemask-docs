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
| `lib/api/connect_api_client.dart` | Added abstract `fetchConnectConfig()`. |
| `lib/api/real_connect_api_client.dart` | Implemented `GET /api/v1/connect/config`. |
| `lib/api/mock_connect_api_client.dart` | Added mock implementation and `injectConnectConfig()` test helper. |
| `lib/providers/connect_providers.dart` | Refactored reconnect into a three-step safe flow. |
| `test/mock_connect_api_client_test.dart` | Added three `fetchConnectConfig()` scenario tests. |

## 3. Reconnect Stability Behavior

The App now follows a three-step reconnect method:

1. Fetch fresh `connect_config` after receiving a reconnect hint.
2. If the config is unsupported, skeleton, or engine-pending, restore the
   pre-hint state and keep the old tunnel/session active.
3. Only when the new config is ready, create a new session and start the native
   tunnel.

Safety behavior:

- Reconnect hint is treated as a signal only.
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
| Task branch commit | `6eefee4` |
| Dev merge commit | `17e83c9` |
| Remote dev ref | `17e83c9` |
| Validation | `flutter test` PASS (84/84 focused tests); custom reconnect/connect API tests PASS; dev-merge-guard PASS |

Custom validation command:

```bash
flutter test test/reconnect_hint_test.dart test/connect_models_test.dart test/mock_connect_api_client_test.dart test/real_connect_api_client_test.dart
```

## 6. Remaining Dependencies

- Backend must ensure `GET /api/v1/connect/config` is available and returns the
  correct fresh `connect_config`.
- CI/CD should add `TASK-CICD-RECONNECT-HINT-001` or fold reconnect hint checks
  into protocol stability runtime smoke.
- Real App + Backend integration should validate:
  hint -> fetch config -> safe pending or new session -> new tunnel start.

## 7. Done Criteria

- [x] App consumes Backend reconnect hints as signals only.
- [x] App fetches fresh connect config before reconnect.
- [x] Old tunnel/session state is preserved until the new config is safe.
- [x] Unsupported/app_pending/skeleton profiles do not blackhole the tunnel.
- [x] Focused reconnect tests pass.
- [x] App changes are merged to `dev`.
