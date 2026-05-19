# TASK-ADMIN-APP-RELEASE-001 - Admin App Release Management

> Owner: Admin / App Release / Backend / CI-CD / Docs
> Repo: `livemask-admin`
> Branch: `task/TASK-ADMIN-APP-RELEASE-001`
> Commit: `5729c2a`
> Status: partial / evidence_missing (task branch not merged to dev)
> Created: 2026-05-19

## 1. Background

Admin must manage App releases through Backend APIs instead of hardcoded Website
download links or direct Job Service calls. App Release is separate from
NodeAgent Release, but both can be discovered under the shared Release Control
information architecture.

## 2. Scope

Implemented files:

- `src/types/app-release.ts`
- `src/lib/app-release-api.ts`
- `src/lib/app-release-mock.ts`
- `src/hooks/use-app-release.ts`
- `src/app/admin/app/releases/page.tsx`
- `src/app/admin/app/releases/[releaseId]/page.tsx`

Implemented behavior:

- App Release list page with status filters.
- Expand/collapse release details.
- Confirmation dialogs for mutations.
- Release detail page with metadata cards, artifact list, and timeline.
- API client uses real-first behavior: 404/501 read fallback may use mock;
  401/403 never fall back; mutations do not use mock success.
- `app_release:read` and `app_release:write` RBAC.
- zh-CN default UI and `MockBadge` for fallback surfaces.

## 3. Validation

Validation evidence from the Admin window:

```text
npx vitest run PASS
npx next build PASS
```

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must provide real App Release Admin APIs for list/detail/create/publish/pause/revoke. |
| `livemask-job-service` | App Release job executors are available but require Backend executor APIs for end-to-end flow. |
| `livemask-ci-cd` | Release-control smoke should verify Admin App Release routes, RBAC, and no storage secret leakage. |
| `livemask-docs` | App Release handoff, MVP plan, and Admin README record completed Admin UI. |

## 5. Remaining Risks

- Mock fallback remains for unimplemented read endpoints and must stay visibly
  marked.
- Real publish/revoke behavior requires Backend and CI/CD release-control
  smoke before end-to-end completion.

## 6. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-admin` |
| **Task branch** | `task/TASK-ADMIN-APP-RELEASE-001` |
| **Task branch commit** | `5729c2a` |
| **Dev merge commit** | **Evidence missing** — task branch not merged to `livemask-admin` dev |
| **Remote dev ref** | **Evidence missing** |
| **Validation** | `npx vitest run` PASS, `npx next build` PASS |
| **Evidence status** | **missing** — pending Admin window dev merge |
| **Last verified at** | 2026-05-19 (dev-local on task branch only) |
| **Runtime repo evidence** | pending external repo audit — requires `livemask-admin` window to verify dev merge |

## 7. Done Criteria

- App Release Admin list and detail pages exist.
- API client follows Admin BFF and mock fallback rules.
- RBAC and confirmation behavior are implemented.
- Validation evidence is recorded.
- Backend/CI-CD follow-ups are explicit.
