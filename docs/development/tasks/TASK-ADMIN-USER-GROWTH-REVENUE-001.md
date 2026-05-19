# TASK-ADMIN-USER-GROWTH-REVENUE-001 - Admin User Growth Revenue

> Owner: Admin / Growth / Backend / Docs
> Repo: `livemask-admin`
> Branch: `task/TASK-ADMIN-USER-GROWTH-REVENUE-001`
> Commit: `e675a64`
> Status: Completed dev-local
> Created: 2026-05-19

## 1. Background

Growth revenue management needs Admin visibility for referral reports, sponsor
reports, settlements, and revenue feedback. Admin must display Backend-derived
facts only and must not calculate earnings or expose raw payout identifiers.

## 2. Scope

Implemented pages:

- `/admin/growth`
- `/admin/growth/referrals`
- `/admin/growth/sponsors`
- `/admin/growth/settlements`
- `/admin/growth/feedback`

Implemented behavior:

- Growth overview hub with card navigation.
- Referral report table.
- Sponsor report table.
- Settlement management list with masked payout address.
- Revenue feedback card list.
- API integration for referral rules, ambassador rules, referral reports,
  sponsor reports, settlements, and revenue feedback.
- `growth:read` controls Growth pages.
- `settlement:read` controls settlement page.

## 3. Validation

Validation evidence from the Admin window:

```text
npx vitest run PASS
npx next build PASS
```

Security validation:

- Frontend does not calculate reward amounts.
- Full payout address is not displayed.
- Full email, phone, UUID, wallet, IM ID, node endpoint, IP, and node secret are
  not displayed.
- Currency copy uses USDT, not UDST.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Admin pages depend on Growth read APIs and RBAC permissions. |
| `livemask-app` | App user growth pages remain separate; Admin does not own user-facing payout setup. |
| `livemask-ci-cd` | Growth revenue smoke should verify Admin list pages, RBAC, and secret leak scans. |
| `livemask-docs` | User Growth handoff and MVP plan record completed Admin implementation. |

## 5. Remaining Risks

- Mutation-heavy Admin flows for rule editing remain separate follow-up work
  unless Backend exposes write APIs.
- End-to-end settlement execution still depends on Backend executor APIs and
  CI/CD smoke.

## 6. Done Criteria

- Growth Admin pages exist.
- API client covers required Growth endpoints.
- RBAC boundaries are documented.
- Sensitive fields remain masked.
- Validation evidence is recorded.
