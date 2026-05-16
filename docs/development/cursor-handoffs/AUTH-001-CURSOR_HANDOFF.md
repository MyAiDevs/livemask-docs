# TASK-AUTH-001 Cursor Handoff

Use this file to start Cursor windows for parallel development.

## Backend Window Prompt

```text
You are working in livemask-backend on branch dev.

Repository boundary:
- You may write Go Backend code, DB schema/migrations, Backend tests.
- Do not modify livemask-admin, livemask-website, livemask-app, or livemask-nodeagent from this window.

Task:
Implement TASK-AUTH-001 Account/Auth/RBAC Backend foundation.

Read first:
- ../livemask-docs/docs/development/tasks/TASK-AUTH-001-account-auth-rbac-closed-loop.md
- ../livemask-docs/docs/contracts/api/auth-rbac.md
- ../livemask-docs/docs/security/AUTH_RBAC_SECURITY_MODEL.md
- ../livemask-docs/docs/contracts/api/core-mvp.md

Required:
- Use dev branch only.
- Implement users, roles, user_roles, sessions, audit_logs logical schema.
- Implement register/login/refresh/logout/me/admin-me.
- Implement RBAC middleware for /admin/api/v1/*.
- Implement GET /admin/api/v1/users and POST /admin/api/v1/users/{user_id}/roles.
- Add tests for password hash, token claims, refresh rotation, permission checks, and integration flow.
- Update livemask-ci-cd/scripts/api-smoke-cases.tsv only after endpoints exist.

Completion report must include:
- Commit hash
- Test output
- Local runtime output
- API smoke output
- Cross-repo unlock status for Admin/Website/App
```

## Admin Window Prompt

```text
You are working in livemask-admin on branch dev.

Repository boundary:
- You may write TypeScript/React/Next.js/shadcn Admin frontend code only.
- You may implement API clients and mocks that call Backend contracts.
- You must not create or modify Go files, go.mod, go.sum, DB migrations, Backend handlers/services/repositories, or Backend runtime code in this repository.
- If Backend changes are needed, report them as blockers for the livemask-backend window.

Task:
Implement TASK-AUTH-001 Admin login and RBAC route guard.

Read first:
- ../livemask-docs/docs/development/tasks/TASK-AUTH-001-account-auth-rbac-closed-loop.md
- ../livemask-docs/docs/contracts/api/auth-rbac.md
- ../livemask-docs/docs/security/AUTH_RBAC_SECURITY_MODEL.md
- ../livemask-docs/design/frontend-suite/atoms/v1/export/

Required:
- Add login page.
- Add auth provider/store.
- Protect /admin/*, /sponsor/*, /ambassador/*.
- Add 401 logout handling and 403 no-permission screen.
- Hide/show navigation by permissions, but do not rely on frontend-only security.
- Keep config center page protected by config:read/config:write.

Completion report must include:
- Commit hash
- npm run build output
- Screens/routes implemented
- Backend dependency status
- Cross-repo unlock status
```

## Website Window Prompt

```text
You are working in livemask-website on branch dev.

Repository boundary:
- You may write Website/user-portal frontend code only.
- You may implement API clients and mocks that call Backend contracts.
- You must not create or modify Go files, go.mod, go.sum, DB migrations, Backend handlers/services/repositories, or Admin-only runtime code in this repository.
- If Backend changes are needed, report them as blockers for the livemask-backend window.

Task:
Implement TASK-AUTH-001 public website auth entry and user portal shell.

Read first:
- ../livemask-docs/docs/development/tasks/TASK-AUTH-001-account-auth-rbac-closed-loop.md
- ../livemask-docs/docs/contracts/api/auth-rbac.md
- ../livemask-docs/docs/website/README.md
- ../livemask-docs/design/frontend-suite/atoms/v1/export/

Required:
- Add /login, /register, /forgot-password, /verify-email, /auth/callback.
- Add authenticated /account shell.
- Add entry placeholders for subscription, devices, C2C market, points, and support.
- Do not put public website pages under /admin/*, /sponsor/*, or /ambassador/*.
- Implement API client shape against auth-rbac.md, mock only when Backend is not ready.

Completion report must include:
- Commit hash
- Build output
- Route list
- Backend dependency status
- Cross-repo unlock status
```

## App Window Prompt

```text
You are working in livemask-app on branch dev.

Repository boundary:
- You may write Flutter/Dart App code only.
- You may implement API clients, secure storage, mocks, and App tests.
- You must not create or modify Go Backend files, DB migrations, Admin/Website frontend code, or NodeAgent runtime code in this repository.
- If Backend changes are needed, report them as blockers for the livemask-backend window.

Task:
Implement TASK-AUTH-001 App authenticated API foundation.

Read first:
- ../livemask-docs/docs/development/tasks/TASK-AUTH-001-account-auth-rbac-closed-loop.md
- ../livemask-docs/docs/contracts/api/auth-rbac.md
- ../livemask-docs/docs/app/LIVEMASK_APP_DESIGN_BRIEF_FOR_ATOMS.md
- ../livemask-docs/design/app/atoms/v2/export/

Required:
- Add login/logout service.
- Store tokens in platform secure storage.
- Add refresh-on-401 once and avoid infinite retry loops.
- Add /api/v1/me bootstrap.
- Make remote config and future user APIs share the authenticated API client.
- If Backend is not ready, implement interfaces and tests with mock client.

Completion report must include:
- Commit hash
- Test output
- Screens/states implemented
- Backend dependency status
- Cross-repo unlock status
```
