# TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001 - Admin Growth Notification Regression

> Owner: Admin / Growth Notification / Docs
> Repo: `livemask-admin`
> Branch: `task/TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001`
> Commit: `74fdb6a`
> Status: Completed dev-local
> Created: 2026-05-19

## 1. Background

The Growth Notification Admin page was implemented earlier. This regression
confirms the page remains safe and aligned with the Backend-derived reward
notification contract: masked identifiers, USDT copy, preview safety, and RBAC.

## 2. Scope

Verified / implemented areas:

- `src/types/growth-notification.ts`
- `src/lib/growth-notification-api.ts`
- `src/lib/growth-notification-mock.ts`
- `src/app/admin/growth/notifications/page.tsx`
- `src/app/admin/growth/notifications/_components/notification-preview-dialog.tsx`

Regression behavior:

- zh/en labels are present.
- User identifiers are masked.
- Amount copy uses USDT.
- API client has an independent mock production guard.
- Preview dialog renders safe masked parameters.
- `growth:read` controls page visibility.
- No `UDST` typo is present.

## 3. Validation

Validation evidence from the Admin window:

```text
npx vitest run PASS
npx next build PASS
```

Global prohibition checks:

- No frontend earnings calculation.
- No full email, phone, UUID, wallet, IM ID, node endpoint, IP, or node secret.
- No direct Job Service calls; Admin uses Backend BFF via `adminFetch`.
- No real payout, Alipay, WeChat, or bank card enablement.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Admin page consumes Growth Notification list and preview APIs. |
| `livemask-app` | App prompt UI remains separate and user-facing. |
| `livemask-ci-cd` | Growth reward notification smoke should verify Admin list/preview/RBAC and secret leakage. |
| `livemask-docs` | Growth Notification task and User Growth handoff record regression evidence. |

## 5. Remaining Risks

- Real data depends on Backend seeded or runtime-created notification rows.
- CI/CD smoke still needs to verify Admin page/API against a running stack.

## 6. Done Criteria

- Admin Growth Notification page regression is documented.
- Masking, USDT copy, RBAC, and mock fallback behavior are documented.
- Validation evidence is recorded.
- CI/CD follow-up is explicit.
