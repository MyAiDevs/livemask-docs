# TASK-CICD-NAT-SHARING-GUARD-001 - NAT Sharing Guard Smoke And Privacy Scan

> Status: Ready
> Repository: livemask-ci-cd
> Environment: dev-local / CI
> Parent: TASK-DOC-NAT-SHARING-GUARD-001
> Contract: docs/contracts/vpn/NAT_SHARING_GUARD_CONTRACT.md
> Issues: livemask-docs#22, livemask-ci-cd#3

## 1. Background

Once Backend, NodeAgent, App, and Admin implement their slices, CI/CD must prove
that the NAT sharing guard works end to end without leaking privacy-sensitive
traffic data.

## 2. Scope

### In Scope

- Discover existing smoke scripts before adding or wiring new scripts.
- Add smoke coverage for NAT sharing guard policy read/update/rollback.
- Verify low-permission users cannot change policy.
- Send a synthetic NodeAgent aggregate risk event.
- Verify Backend stores aggregate counters only.
- Verify App/Admin facing responses contain warning/throttle state only when
  policy mode allows it.
- Add privacy leak scan for raw IP lists, domains, URLs, payloads, credentials,
  email, phone, wallet, and node secrets.

### Out of Scope

- Implementing Backend, NodeAgent, App, or Admin feature code.
- Real packet capture or payload inspection.
- Resetting local databases or Docker volumes without explicit approval.
- Editing `../livemask-docs` from CI/CD.

## 3. Contracts

- API: Backend Admin/App/Internal endpoints implemented by follow-up tasks.
- Config: `nat_sharing_guard` policy.
- Events: synthetic privacy-safe risk events.
- Error Codes: Backend-defined NAT sharing codes.
- State Machines: observe/warn/throttle/revoke/rollback.

## 4. Cross-Repo Impact

| Repo | Impact | Must Modify | Validation |
| --- | --- | --- | --- |
| `livemask-ci-cd` | Primary smoke and privacy scan | Yes | Shell syntax, smoke run |
| `livemask-backend` | Smoke target | No | Runtime evidence |
| `livemask-nodeagent` | Synthetic event source or fixture | No | Runtime evidence |
| `livemask-app` | App-facing status target if runtime available | No | Optional smoke |
| `livemask-admin` | Admin settings/RBAC target | No | Runtime evidence |

## 5. Implementation Plan

- [ ] List existing `scripts/*.sh` and related workflows before editing.
- [ ] Enhance an existing relevant smoke script or create a new one only if no
  suitable script exists.
- [ ] Add PASS/SKIP/FAIL classification for unavailable runtimes.
- [ ] Add policy read/update/rollback checks.
- [ ] Add synthetic event ingest and privacy leak scan.
- [ ] Wire into staging smoke only after local script is stable.

## 6. Validation Plan

- [ ] `bash -n scripts/*.sh`
- [ ] `git diff --check`
- [ ] Local smoke or dry-run evidence.
- [ ] Privacy scan confirms no forbidden raw traffic/account/secret fields.

## 7. Risks

| Risk | Impact | Mitigation | Owner |
| --- | --- | --- | --- |
| Smoke assumes unavailable runtime data | Flaky CI | Use precise SKIP with reason for missing prerequisites | CI/CD |
| Privacy scan misses a forbidden field | Security gap | Maintain explicit forbidden-key list | CI/CD |
| Script references non-existent path | CI failure | Follow smoke script discovery rule first | CI/CD |

## 8. Rollback

- Rollback trigger: smoke blocks unrelated deploys incorrectly or leaks data in
  logs.
- Rollback steps: disable new smoke step or revert CI/CD merge.
- Rollback verification: existing smoke suite returns to prior PASS/SKIP state.

## 9. Completion Evidence

- Task branch:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- Smoke output:
- Privacy scan output:
- Docs handoff:

## 10. Follow-up

- Promote NAT sharing guard smoke from warning to required after all runtime
  repos have completed their implementation tasks.
