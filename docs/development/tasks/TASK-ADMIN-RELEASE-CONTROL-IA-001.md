# TASK-ADMIN-RELEASE-CONTROL-IA-001 - Admin Release Control IA

> Owner: Admin / App Release / NodeAgent / Docs
> Repo: `livemask-admin`
> Branch: `task/TASK-ADMIN-RELEASE-CONTROL-IA-001`
> Commit: `fea9f48`
> Status: partial / evidence_missing (task branch not merged to dev)
> Created: 2026-05-19

## 1. Background

App Release and NodeAgent Release are separate release domains, but operators
need one obvious Release Control entry in Admin. The IA must keep shared
navigation without mixing permissions, APIs, data models, or audit events.

## 2. Scope

Implemented behavior:

- Sidebar adds a `Releases` item with Rocket icon.
- `/admin/releases` overview page provides App / NodeAgent tabs.
- App Release uses `app_release:*` permissions.
- NodeAgent Release uses `node:read` permission.
- Deep links remain available:
  - `/admin/app/releases`
  - `/admin/nodeagent/releases`
- `src/components/ui/tabs.tsx` added for the shared overview.

## 3. Validation

Validation evidence from the Admin window:

```text
npx vitest run PASS
npx next build PASS
```

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | No API merge is allowed; App Release and NodeAgent Release remain separate Backend domains. |
| `livemask-admin` | Release Control IA is complete and preserves canonical deep links. |
| `livemask-ci-cd` | Release-control smoke should verify both tabs are permission-gated correctly. |
| `livemask-docs` | Admin IA contract and App Release handoff record the shared menu/page rule. |

## 5. Remaining Risks

- Real status values depend on Backend App Release and NodeAgent Release APIs.
- CI/CD smoke still needs to cover permissions for mixed App/NodeAgent release
  access.

## 6. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-admin` |
| **Task branch** | `task/TASK-ADMIN-RELEASE-CONTROL-IA-001` |
| **Task branch commit** | `fea9f48` |
| **Dev merge commit** | **Evidence missing** — task branch not merged to `livemask-admin` dev |
| **Remote dev ref** | **Evidence missing** |
| **Validation** | `npx vitest run` PASS, `npx next build` PASS |
| **Evidence status** | **missing** — pending Admin window dev merge |
| **Last verified at** | 2026-05-19 (dev-local on task branch only) |
| **Runtime repo evidence** | pending external repo audit — requires `livemask-admin` window to verify dev merge |

## 7. Done Criteria

- Shared `/admin/releases` route exists.
- App and NodeAgent release deep links are preserved.
- Permissions remain separated.
- Validation evidence is recorded.
- Backend/CI-CD follow-ups are explicit.
