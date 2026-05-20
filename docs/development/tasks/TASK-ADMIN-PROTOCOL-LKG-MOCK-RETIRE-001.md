# TASK-ADMIN-PROTOCOL-LKG-MOCK-RETIRE-001 — Admin Protocol LKG Real Data Cutover

> Status: Completed
> Repository: livemask-admin
> Environment: dev-local

## 1. Background

`TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001` completed Backend support for real
protocol LKG and rollback fields. Admin Protocol Stability UI already renders
LKG/rollback sections, but it still has mock fallback data for those fields.

This task cuts Admin over to the real Backend LKG/rollback API fields and keeps
mock fallback only for 404/501 development mode.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/development/tasks/TASK-ADMIN-PROTOCOL-STABILITY-001.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001.md`

## 3. Implementation Scope

Admin must consume these Backend fields as real data:

| Backend API | Fields |
| --- | --- |
| `GET /admin/api/v1/protocol-templates` | `lkg_version`, `lkg_at` |
| `GET /admin/api/v1/protocol-templates/{id}` | `lkg_version`, `lkg_at` |
| `GET /admin/api/v1/protocol-templates/{id}/eligibility` | `capability_eligibility[].lkg_version` |
| `GET /admin/api/v1/protocol-assignments` | `lkg_info`, `lkg_status`, `lkg_rollback_available`, `rollback_to_version`, `rollback_to_template_version`, `previous_assignment_id` |
| `GET /admin/api/v1/protocol-assignments/{id}` | Same assignment LKG/rollback fields |

Expected implementation:

1. Update protocol API response typing if Admin still lacks any Backend field.
2. Ensure list/detail pages render Backend LKG/rollback fields when present.
3. Keep mock fallback only for 404/501 real API absence.
4. Do not fallback on 401/403.
5. Add or update tests proving:
   - real response with LKG renders without mock data;
   - no-LKG response renders empty/null state cleanly;
   - `lkg_rollback_available=false` hides or disables rollback affordances;
   - 401/403 do not use mock fallback.
6. Remove or clearly isolate mock-only LKG assumptions that can mask real API
   shape regressions.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Already provides real LKG/rollback fields at dev merge `9a06111`. |
| `livemask-admin` | Primary implementation repo. |
| `livemask-ci-cd` | Can validate Admin real data after this cutover. |
| `livemask-docs` | Records completion report and dev merge evidence after Cursor finishes. |

## 5. Validation

Run on merged `dev` before completion:

```bash
npx vitest run
npx next build
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- validation output;
- which Admin pages now use real LKG/rollback fields;
- remaining mock fallback locations, if any, and why they remain.

## 7. Completion Evidence

Completed on `livemask-admin` and merged to `dev`.

| Field | Value |
| --- | --- |
| Task branch commit | `0ab0e4c` |
| Dev merge commit | `4b46435` |
| Remote dev ref | `origin/dev` (`4b46435`) |
| Validation | `npx vitest run` 207/207 PASS, `npx next build` PASS, `git diff --check` clean |

Implemented:

- `src/lib/dashboard-api.ts` `tryReal` now propagates 401/403 and does not
  fallback to mock on authentication or authorization failures.
- Added `protocol-template-lkg-api.test.ts` with 42 tests covering real LKG
  passthrough (`viaMock=false`), no-LKG null/empty states, rollback fields,
  404/501 read fallback, 401/403 propagation, and mutation no-mock-success
  behavior.
- Added `dashboard-api-auth.test.ts` with 7 tests proving dashboard endpoints
  propagate 401/403.
- Extended `mock-badge.test.tsx` to verify `MockBadge` disappears when
  `viaMock=false` or `viaMock` is absent.

Final mock rule:

- Read endpoints may fallback only for 404/501 or network/dev absence.
- 401/403 never fallback.
- Mutations never simulate success.
