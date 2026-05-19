# I18N CI/CD Smoke Cursor Handoff

> Task: `TASK-CICD-I18N-001`
> Repo: `livemask-ci-cd`
> Scope: End-to-end smoke coverage for internationalization — Backend message_key management, Admin zh-CN translations, Website hreflang/sitemap, App localization.

## 0. Mandatory Reading

Read before editing code:

1. `docs/contracts/i18n/I18N_LOCALIZATION_CONTRACT.md`
2. `ai-rules/v3.7/00-Core-Principles.md`
3. `ai-rules/v3.7/13-Multi-Repo-Development.md`
4. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- Work only in `livemask-ci-cd`.
- Do not edit Backend, Admin, Website, or App implementation from this window.
- Do not run `docker compose down` against the long-lived local dev runtime.
- Staging smoke must use isolated compose project, network, volumes and ports.
- Every response must be checked for secret leakage.

## 1. Script

`scripts/i18n-smoke.sh`

## 2. Required Smoke Steps

1. Wait for Backend health (max 60s).
2. Admin login with `admin@livemask.dev`.
3. **Backend message_key list**: `GET /api/v1/i18n/messages` — verify list and detail.
4. **Admin zh-CN translations**: `GET /admin/api/v1/i18n/zh-CN` — verify Chinese translations load.
5. **Website hreflang**: fetch homepage and verify `<link rel="alternate" hreflang="..." >` tags exist.
6. **Website sitemap**: fetch `/sitemap.xml` and verify multilingual `<loc>` entries.
7. **App localization by device locale**: `GET /api/v1/i18n/app?locale=zh-CN` — verify Chinese strings.
8. **App localization by specific locale**: `GET /api/v1/i18n/app?locale=en` — verify English strings.
9. **App fallback behavior**: `GET /api/v1/i18n/app?locale=ja` — verify fallback to default locale.
10. RBAC: no token → 401, user token → 403 on admin i18n endpoints.
11. Secret leak scan across all collected responses.

## 3. API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/i18n/messages` | Public | List all message keys |
| GET | `/api/v1/i18n/app` | Public | App localization by locale query |
| GET | `/admin/api/v1/i18n/{locale}` | Admin JWT | Admin locale translations |

## 4. Validation

```bash
bash -n scripts/i18n-smoke.sh
bash scripts/i18n-smoke.sh
git diff --check
```

## 5. Completion Report Requirements

- TASK ID
- Repo / branch / commit
- Scripts changed
- Exact step table with PASS / SKIP / FAIL
- Secret leak scan result
- Local runtime status
- Staging isolation status
- Which repos are now unblocked or still blocked
