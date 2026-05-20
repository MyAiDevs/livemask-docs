# TASK-APP-RECONNECT-RUNTIME-REAL-BACKEND-001 — App Reconnect Runtime Real Backend Cutover

> Status: Completed
> Repository: livemask-app
> Environment: dev-local
> Issues: livemask-docs#11, livemask-app#1

## 1. Background

App reconnect polling and safe reconnect logic are implemented in
`TASK-APP-RECONNECT-STABILITY-001`. Backend runtime APIs are now available via
`TASK-BACKEND-RECONNECT-HINT-RUNTIME-001`.

This task verifies the App against real Backend reconnect runtime APIs and
removes or isolates any reconnect placeholder/mock behavior that can hide
runtime integration failures.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/development/tasks/TASK-APP-RECONNECT-STABILITY-001.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-RECONNECT-HINT-RUNTIME-001.md`
- `../livemask-docs/docs/development/tasks/TASK-NODEAGENT-PROTOCOL-STABILITY-001.md`

## 3. Implementation Scope

1. Verify `RealConnectApiClient.fetchReconnectHints()` matches Backend response:
   `{"hints":[{"hint_id","reason","reconnect_after_ms","expires_at"}]}`.
2. Verify `RealConnectApiClient.fetchConnectConfig()` passes
   `session_id=<sessionID>` and parses `ConnectConfigView`.
3. Ensure mock reconnect hints are only used in explicit mock/dev mode.
4. Ensure App never trusts reconnect hint payload as config.
5. Add or update tests for:
   - real reconnect hint envelope parsing;
   - empty hint list;
   - secret fields ignored if accidentally present;
   - connect config request includes `session_id`;
   - polling errors do not break active connection.
6. Run Android-first validation:
   - `flutter analyze`
   - `flutter test`
   - Android debug build or emulator run when runtime is available.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must run dev ref `1442e64` or newer for real reconnect runtime APIs. |
| `livemask-app` | Primary implementation and validation repo. |
| `livemask-ci-cd` | Can rely on App real client behavior when reconnect runtime smoke is added. |
| `livemask-docs` | Records App completion report and remaining platform validation status. |

## 5. Validation

Run on merged `dev` before completion:

```bash
flutter analyze
flutter test
git diff --check
```

If Android runtime is available:

```bash
flutter build apk --debug
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- validation output;
- whether mock reconnect data remains and under which mode;
- Android-first runtime/build evidence;
- any remaining Backend/CI runtime blocker.

## 7. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-APP-RECONNECT-RUNTIME-REAL-BACKEND-001` |
| Task branch commit | `09e69c9` |
| Dev merge commit | `e797875` |
| Remote dev ref | `origin/dev` (`e797875`) |
| Validation | `flutter analyze --no-fatal-warnings --no-fatal-infos` PASS with 0 errors and no new issues; `flutter test` PASS 597/597; `git diff --check` PASS; `dev-merge-guard` PASS on integration and dev |
| Docs issues | `livemask-docs#11`, `livemask-app#1` |

Implemented App behavior:

- `ConnectApiClient.fetchConnectConfig()` accepts optional `sessionId`.
- `RealConnectApiClient` sends `session_id=<sessionId>` only when non-empty.
- `MockConnectApiClient` accepts the optional parameter for compatibility.
- Reconnect flows pass `state.sessionId` in `_executeReconnect()` and
  `_executePolledReconnect()`.
- App continues to treat reconnect hints as signals only and never trusts hint
  payloads as config.
- Mock reconnect data remains isolated to `AUTH_CLIENT_MODE=mock` through
  `AppConfig.useMockAuthClient`; real/CI mode uses `RealConnectApiClient`.

Unlocked next task:

- `TASK-CICD-RECONNECT-HINT-RUNTIME-SMOKE-001`
