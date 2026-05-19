# TASK-BACKEND-USER-GROWTH-REVENUE-001

> Status: Done dev-local
> Owner: Backend / Product / Finance / Growth
> Contract: `docs/contracts/users/USER_GROWTH_REVENUE_CONTRACT.md`
> Date: 2026-05-19

## 1. Background

This task implements the Backend MVP for user payout methods, referral links,
promotion/sponsor reward rules, revenue reports, settlement reports, and
revenue anomaly feedback.

## 2. Scope

Implemented:

- `internal/growth` domain package.
- Schema creation for:
  - `user_payout_methods`
  - `referral_codes`
  - `growth_reward_rules`
  - `growth_earnings_ledger`
  - `growth_settlement_reports`
  - `growth_revenue_feedback`
- Default reward rule seed rows for promotion and sponsor ambassadors.
- User APIs:
  - `GET/POST /api/v1/me/payout-methods`
  - `GET /api/v1/me/referral-link`
  - `GET /api/v1/me/referral-report`
  - `GET /api/v1/me/sponsor-report`
  - `GET /api/v1/me/settlement-reports`
  - `GET/POST /api/v1/me/revenue-feedback`
- Admin APIs:
  - `GET /admin/api/v1/growth/referral-rules`
  - `GET /admin/api/v1/growth/ambassador-rules`
  - `GET /admin/api/v1/growth/reports/referrals`
  - `GET /admin/api/v1/growth/reports/sponsors`
  - `GET /admin/api/v1/growth/settlements`
  - `GET /admin/api/v1/growth/revenue-feedback`
- RBAC permissions:
  - `growth:read`
  - `growth:write`
  - `settlement:read`
  - `settlement:write`

Out of scope:

- Real payout execution.
- Rule editing UI/API mutation.
- Job Service scheduled aggregation.
- Website referral attribution.
- Admin/App frontend pages.

## 3. Implementation Summary

Backend files:

- `internal/growth/db.go`
- `internal/growth/types.go`
- `internal/growth/redact.go`
- `internal/growth/store.go`
- `internal/growth/service.go`
- `internal/growth/handler.go`
- `internal/growth/service_test.go`
- `internal/auth/types.go`
- `main.go`

MVP behavior:

- USDT payout method is accepted.
- Alipay, WeChat Pay, and bank card are rejected with
  `PAYOUT_METHOD_RESERVED`.
- Referral code is lazily created and stable per user.
- Feedback descriptions are redacted before storage/display.
- Report endpoints return safe empty states until ledger data exists.

## 4. Cross-Repo Impact

| Repo / Role | Status | Notes |
| --- | --- | --- |
| Backend | Done dev-local | Schema, service, APIs, RBAC, tests, runtime verification complete. |
| Admin | Unlocked | Implement Growth pages, rule/report/settlement/feedback review. |
| App | Unlocked | Implement payout method, referral sharing, report views, feedback form. |
| Website | Unlocked | Implement `/register?ref=` attribution. |
| Job Service | Unlocked | Implement scheduled ledger aggregation and settlement generation. |
| CI/CD | Unlocked | Add smoke for payout/referral/reports/feedback/RBAC/redaction. |

## 5. Validation Evidence

Commands:

```text
go test ./internal/growth ./internal/auth
PASS

go test ./...
PASS

go build ./...
PASS

git diff --check -- internal/auth/types.go internal/growth main.go
PASS
```

Dev-local runtime:

```text
bash scripts/local-dev.sh sync --services backend --no-pull
PASS
```

HTTP verification:

| Check | Result |
| --- | --- |
| Create USDT payout | `200` |
| Alipay reserved payout | `400 PAYOUT_METHOD_RESERVED` |
| List payout methods | `200` |
| Get referral link | `200` |
| Get referral report | `200` |
| Get sponsor report | `200` |
| Get settlement reports | `200` |
| Create revenue feedback | `201`, email/token redacted |
| Admin referral rules | `200` |
| Admin ambassador rules | `200` |
| Admin settlements | `200` |
| Admin feedback | `200` |

## 6. Rollback

Rollback is code-only for the MVP because schemas are additive and created with
`CREATE TABLE IF NOT EXISTS`.

If rollback is required:

1. Remove the `growth` setup and routes from `main.go`.
2. Remove `internal/growth`.
3. Remove the new RBAC permissions from `internal/auth/types.go`.
4. Keep database tables in place unless an explicit data cleanup task is
   approved.

## 7. Done Criteria

- Backend schema and APIs exist.
- Default rules are seeded.
- USDT payout works.
- Reserved payout methods are explicitly blocked.
- Reports and feedback endpoints return stable safe responses.
- Docs and MVP plan are updated.
