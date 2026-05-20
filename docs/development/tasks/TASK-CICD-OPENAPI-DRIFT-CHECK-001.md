# TASK-CICD-OPENAPI-DRIFT-CHECK-001 - CI/CD OpenAPI Drift Check

> Status: Ready
> Repository: livemask-ci-cd
> Environment: dev-local / CI
> Unblocked by: TASK-BACKEND-SWAGGER-API-DOCS-001 (`livemask-backend` dev `9de2f14`)
> Issues: livemask-docs#14, livemask-ci-cd#2

## 1. Background

`TASK-BACKEND-SWAGGER-API-DOCS-001` added Backend OpenAPI 3.0.3 documentation,
machine-readable JSON/YAML endpoints, and `scripts/validate-openapi.sh` with
route/API drift checks. CI/CD should now enforce that Backend API changes cannot
land or pass smoke without the OpenAPI contract staying aligned.

## 2. Scope

### In Scope

- Discover existing CI/CD Backend validation and smoke scripts before editing.
- Add a CI/CD check that runs Backend `scripts/validate-openapi.sh` against
  `livemask-backend` `dev` or configured `BACKEND_REF`.
- Ensure failure is clear when Backend routes and OpenAPI drift.
- Record PASS/SKIP/FAIL precisely:
  - PASS when validation script runs and passes;
  - SKIP only when backend repo/ref is intentionally unavailable in a local
    smoke context;
  - FAIL for validation errors, route drift, secret leaks, invalid JSON/YAML,
    or public Swagger UI exposure.
- Keep this independent from Admin Swagger UI implementation.

### Out of Scope

- Editing Backend OpenAPI files.
- Editing Admin Swagger UI.
- Deleting Docker volumes or resetting local runtime state.

## 3. Required Reading

- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- `../livemask-docs/docs/development/tasks/TASK-DOCS-CICD-SMOKE-SCRIPT-DISCOVERY-001.md`
- `../livemask-docs/docs/DEVELOPMENT.md`
- `livemask-ci-cd/.cursorrules`

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Provides `scripts/validate-openapi.sh` and OpenAPI artifacts. |
| `livemask-ci-cd` | Owns CI/smoke integration. |
| `livemask-docs` | Records completion evidence after report. |

## 5. Validation Plan

- Syntax check changed shell scripts/workflows.
- Run the new OpenAPI validation integration locally when backend checkout is
  available.
- Ensure CI workflow or smoke script reports the validation result clearly.
- `git diff --check`.
- Dev merge through `livemask-ci-cd/scripts/dev-merge-guard.sh`, validation
  rerun on CI/CD `dev`, and push `origin/dev`.

## 6. Completion Report Requirements

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- exact script/workflow changed;
- PASS/SKIP/FAIL evidence for Backend OpenAPI validation;
- whether the check ran against backend dev `9de2f14` or newer;
- remaining blockers or follow-up tasks.
