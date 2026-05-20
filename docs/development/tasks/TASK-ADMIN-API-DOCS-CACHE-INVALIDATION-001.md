# TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001 - Admin API Docs Cache Invalidation And Runtime Diagnostics

> Status: Ready
> Repository: livemask-admin
> Environment: dev-local
> Priority: P1
> Module: swagger-api
> Created: 2026-05-21
> Issues: livemask-docs#15, livemask-admin#3
> Trigger: `/admin/api-docs` was reported as 404 while current Admin dev ref
> `656d4d9` returns HTTP 200 from terminal; `/admin/openapi.json` proxy was not
> reachable in local verification.

## 1. Background

`TASK-ADMIN-SWAGGER-API-DOCS-UI-001` added the authenticated Swagger UI at
`/admin/api-docs`. Local verification after the task showed:

- `GET http://127.0.0.1:3001/admin/api-docs` returns HTTP 200 and loads
  `app/admin/api-docs/page.tsx`;
- the rendered page is protected by `AuthGuard`;
- `GET http://127.0.0.1:3001/admin/openapi.json` failed with curl status `000`,
  indicating the Admin proxy could not reach Backend or `BACKEND_INTERNAL_URL`
  was wrong;
- the browser can still show a stale 404 if the active dev server is running an
  old Next build, stale `.next`, or a different repo/branch on port 3001.

This task must root out that ambiguity. API Docs must fail with precise,
actionable states: route missing, unauthenticated, Backend OpenAPI unavailable,
stale build/runtime mismatch, or success.

## 2. Scope

### In Scope

- Add deterministic cache-busting / stale-runtime detection for
  `/admin/api-docs`.
- Make the API Docs page and its OpenAPI fetch use no-store semantics where
  appropriate so old route payloads or proxy responses do not survive a dev
  branch update.
- Add an Admin-side diagnostic source that exposes the current Admin build/ref
  used by the running dev server without leaking secrets.
- Improve `/admin/api-docs` error states so Backend proxy failures are clearly
  labeled as OpenAPI backend/proxy unavailable, not confused with route 404.
- Add tests that prove:
  - `/admin/api-docs` route exists;
  - the route does not serve stale cached state after build/version change;
  - `/admin/openapi.json` proxy failure is rendered as an actionable error;
  - logged-out users still cannot view Swagger UI;
  - logged-in users can load API Docs when Backend OpenAPI is reachable.
- Add a local verification note or script command that Cursor can run to
  distinguish stale Admin dev server from Backend proxy failure.

### Out of Scope

- Editing Backend OpenAPI schema content.
- Exposing public unauthenticated Swagger UI from Backend.
- Replacing `TASK-CICD-OPENAPI-DRIFT-CHECK-001`.
- Editing `../livemask-docs` directly from the Admin runtime window.

## 3. Required Reading

- `../livemask-docs/docs/development/tasks/TASK-ADMIN-SWAGGER-API-DOCS-UI-001.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- `../livemask-docs/docs/development/tasks/TASK-CICD-OPENAPI-DRIFT-CHECK-001.md`
- `../livemask-docs/docs/DEVELOPMENT.md`
- Repo-local `.cursorrules`

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-admin` | Owns the route, cache behavior, UI diagnostics, tests, and build validation. |
| `livemask-backend` | Must already provide `/openapi.json`; no code change expected. |
| `livemask-ci-cd` | May later add API Docs route/proxy smoke if needed; not required in this task. |
| `livemask-docs` | Records completion evidence after the Admin report. |

## 5. Implementation Requirements

- Keep `/admin/api-docs` behind the existing `AuthGuard`.
- Do not expose bearer tokens, cookies, provider secrets, private keys, PEM
  material, protocol configs, payment payloads, or raw env values in diagnostics.
- Prefer a stable Admin runtime/build marker such as commit SHA, build time, or
  package version sourced from safe public env/build metadata.
- If Next route segment options are needed, split server route metadata from the
  client Swagger UI component instead of forcing unsupported exports from a
  `"use client"` page.
- Ensure OpenAPI fetch requests include appropriate cache controls, for example
  `cache: "no-store"` and request headers that avoid stale proxy responses.
- Make the error copy actionable and specific:
  - route exists but user is logged out;
  - route exists but Backend `/openapi.json` is unreachable;
  - route exists but spec is empty/invalid;
  - running Admin build/ref is not the expected one.
- Add a small diagnostic test or script command in the completion report:
  - `curl -I http://127.0.0.1:3001/admin/api-docs`
  - `curl -I http://127.0.0.1:3001/admin/openapi.json`
  - `curl -I http://127.0.0.1:8080/openapi.json`

## 6. Cursor Task Brief

```markdown
## Cursor Task Brief

TASK ID: TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001
Parent / Epic TASK: TASK-ADMIN-SWAGGER-API-DOCS-UI-001
Target repo: livemask-admin
Branch: task/TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001
Priority: P1
Environment: dev-local

### Why
- `/admin/api-docs` was reported as 404 even though current Admin dev ref
  `656d4d9` returns HTTP 200 from terminal.
- We need to eliminate stale Next build/dev-server/cache ambiguity and clearly
  distinguish route 404 from Backend OpenAPI proxy failure.

### Must Read First
- `../livemask-docs/docs/development/tasks/TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001.md`
- `../livemask-docs/docs/development/tasks/TASK-ADMIN-SWAGGER-API-DOCS-UI-001.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- Repo-local `.cursorrules`

### In Scope
- Add cache-busting/no-store behavior for API Docs route and OpenAPI fetch.
- Add safe build/ref diagnostics for the running Admin app.
- Improve API Docs error states so Backend proxy failures are explicit.
- Add route/proxy/runtime tests and local curl verification evidence.

### Out of Scope / Do Not Touch
- Do not edit Backend OpenAPI schema.
- Do not expose Backend public Swagger UI.
- Do not edit `../livemask-docs` from the Admin repo.

### Expected Files / Areas
- `src/app/admin/api-docs/**`
- `src/lib/swagger-api.ts`
- `next.config.ts` only if headers/rewrites need cache-control adjustment.
- Existing Admin test files or new focused tests for API Docs diagnostics.

### Contract / API Rules
- Swagger UI remains Admin-authenticated only.
- `/admin/openapi.json` remains same-origin proxy to Backend `/openapi.json`.
- Backend API add/change/delete still requires OpenAPI alignment in Backend.

### Validation Required On Task Branch
- `npx vitest run`
- `npx next build`
- `git diff --check`
- Local diagnostics:
  - `curl -I http://127.0.0.1:3001/admin/api-docs`
  - `curl -I http://127.0.0.1:3001/admin/openapi.json`
  - `curl -I http://127.0.0.1:8080/openapi.json`

### Dev Merge Requirement
- Merge through `livemask-ci-cd/scripts/dev-merge-guard.sh` or equivalent guard
  evidence.
- Re-run validation on `dev`.
- Push `origin/dev`.

### Completion Report Must Include
- TASK ID
- Repository / Branch / Commit
- Task Branch / Commit
- Dev Merge Commit
- Remote dev Ref
- Exact route/proxy curl results
- Tests and validation on `dev`
- Whether the observed issue was stale Admin build, wrong port, or Backend proxy
  unavailable
- Docs handoff evidence

### Docs Handoff
- Docs update owner: `livemask-docs`
- Runtime repo must not edit `../livemask-docs`
- Task ledger update needed: yes
- GitHub Issue sync needed: yes
```

## 7. Acceptance Criteria

- [ ] Browser and curl can distinguish route existence from Backend OpenAPI
  proxy availability.
- [ ] Stale Admin build/dev-server state is detectable through a safe diagnostic
  marker.
- [ ] API Docs OpenAPI fetches are not served from stale client/proxy cache.
- [ ] Logged-out users cannot view Swagger UI.
- [ ] Logged-in Admin users can view Swagger UI when Backend OpenAPI is
  reachable.
- [ ] Failure states are actionable and do not look like a generic 404.
- [ ] Task branch is merged to Admin `dev`, validated on `dev`, and pushed to
  `origin/dev`.

## 8. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Diagnostics leak env or token data | Security regression | Only expose safe build metadata; never print tokens, cookies, secrets, or raw env. |
| Fix only hides Backend outage | False success | Keep `/admin/openapi.json` failure visible and test it separately. |
| Unsupported Next route config in client page | Build failure | Split server route wrapper from client Swagger UI component if route metadata is needed. |
| CI passes but local dev server remains stale | User confusion | Completion report must include explicit restart/cache-clearing note and curl evidence from the running dev server. |

## 9. Rollback

- Rollback trigger: Admin build fails, AuthGuard bypass occurs, diagnostics leak
  sensitive data, or `/admin/api-docs` becomes inaccessible on fresh dev.
- Rollback steps: revert the task branch merge from `livemask-admin` `dev` using
  a normal revert commit, then rerun Admin tests/build and route curl checks.
- Rollback verification: `/admin/api-docs` remains protected and either loads
  the previous API Docs UI or shows the previous safe error state.

## 10. Completion Evidence

- PR:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- Route/proxy curl evidence:
- Browser screenshot/logs:
- Docs handoff:

## 11. Follow-up

- Optional CI/CD task: add authenticated Admin API Docs route/proxy smoke to
  local/staging smoke once this Admin diagnostic behavior is stable.
