# TASK-ADMIN-NAT-SHARING-GUARD-001 - Admin NAT Sharing Guard Settings And Risk Events

> Status: Ready
> Repository: livemask-admin
> Environment: dev-local
> Parent: TASK-DOC-NAT-SHARING-GUARD-001
> Contract: docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md
> Issues: livemask-docs#21, livemask-admin#4

## 1. Background

Admins need a safe way to operate NAT sharing guard policy, inspect aggregate
risk events, and understand that enforcement is best effort and
privacy-preserving. The UI must never show raw destinations, payloads, domains,
URLs, or sensitive account data.

## 2. Scope

### In Scope

- Add or extend App Runtime / Security Settings UI for `nat_sharing_guard`.
- Support mode, dry-run, thresholds, action settings, validation ranges, and
  rollback/preview behavior.
- Show aggregate risk event counts and redacted event details.
- Add RBAC and audit-friendly UI states.
- Add tests for no secret/privacy leakage.

### Out of Scope

- Backend policy/scoring implementation.
- NodeAgent counter collection.
- App warning UI.
- Public unauthenticated access.
- Editing `../livemask-docs` from Admin.

## 3. Contracts

- API: Backend Admin policy/settings and risk event endpoints.
- Config: `nat_sharing_guard` schema.
- Events: redacted `nat_sharing_suspected` / action events.
- Error Codes: surface Backend error codes without exposing internals.
- State Machines: observe/warn/throttle/revoke and dry-run/rollback.

## 4. Cross-Repo Impact

| Repo | Impact | Must Modify | Validation |
| --- | --- | --- | --- |
| `livemask-admin` | Primary settings/event UI | Yes | Vitest, Next build |
| `livemask-backend` | Provides Admin APIs | No | Contract compatibility |
| `livemask-nodeagent` | Provides aggregate events through Backend | No | N/A |
| `livemask-app` | Receives policy effects later | No | N/A |
| `livemask-ci-cd` | Later smoke validates RBAC/leakage | No | Follow-up |

## 5. Implementation Plan

- [ ] Locate App Runtime / Security Settings surface.
- [ ] Add policy form with validation and dry-run defaults.
- [ ] Add redacted risk event list/summary.
- [ ] Add RBAC, loading/error/empty states, and audit copy.
- [ ] Add tests for permissions, form validation, and forbidden data leakage.

## 6. Validation Plan

- [ ] `npx vitest run`
- [ ] `npx next build`
- [ ] `git diff --check`
- [ ] UI/API tests prove no raw destination/domain/URL/payload/credential fields
  are rendered.

## 7. Risks

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Admin misconfigures aggressive enforcement | User impact | Dry-run default, preview, rollback, validation ranges | Admin |
| UI leaks sensitive risk data | Security breach | Render aggregate counts only and test forbidden keys | Admin |
| Missing RBAC | Unauthorized policy changes | Reuse settings/security permissions | Admin |

## 8. Rollback

- Rollback trigger: UI permits unsafe policy changes, leaks data, or breaks
  settings page.
- Rollback steps: hide the feature flag / route or revert Admin merge.
- Rollback verification: App Runtime settings still load and no NAT policy UI is
  exposed.

## 9. Completion Evidence

- Task branch:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- UI/RBAC evidence:
- Privacy evidence:
- Docs handoff:

## 10. Follow-up

- TASK-CICD-NAT-SHARING-GUARD-001
