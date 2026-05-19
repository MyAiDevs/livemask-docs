# TASK-DOC-USER-GROWTH-REVENUE-001

> Status: Ready
> Owner: Docs / Product / Backend / Admin / App / Website / Job Service / CI-CD
> Contract: `docs/contracts/users/USER_GROWTH_REVENUE_CONTRACT.md`

## 1. Background

LiveMask needs a complete user growth and revenue loop:

- User payout destination, with USDT as MVP default.
- Referral link generation and attribution.
- Promotion ambassador reward rules.
- Sponsor ambassador reward rules.
- Invitation revenue reports.
- Sponsor revenue reports and anomaly feedback.
- Settlement reports for Finance and user-facing read views.

## 2. Scope

This task defines the cross-repo contract and unlocks implementation tasks.

In scope:

- Payout method model with USDT enabled and Alipay/WeChat/bank card reserved.
- Referral code and referral link rules.
- Growth reward rules.
- Earnings ledger and settlement report models.
- Revenue anomaly feedback model and API.
- Backend/Admin/App/Website/Job Service/CI-CD task split.

Out of scope:

- Actual provider payout execution.
- Compliance/KYC workflow for bank/Alipay/WeChat.
- Automatic payment provider reconciliation beyond report inputs.

## 3. Implementation Tasks

| Task | Repo | Scope | Status |
| --- | --- | --- | --- |
| `TASK-BACKEND-USER-GROWTH-REVENUE-001` | `livemask-backend` | Schema, service, user APIs, Admin read APIs, default rules | Ready |
| `TASK-ADMIN-USER-GROWTH-REVENUE-001` | `livemask-admin` | Growth pages, payout methods, referral/sponsor reports, settlements, feedback review | Done: branch `task/TASK-ADMIN-USER-GROWTH-REVENUE-001`, commit `e675a64` |
| `TASK-APP-USER-GROWTH-REVENUE-001` | `livemask-app` | Profile payout method, referral sharing, report views, feedback form | Ready |
| `TASK-WEBSITE-REFERRAL-LANDING-001` | `livemask-website` | `/register?ref=` attribution and landing behavior | Done: branch `task/TASK-WEBSITE-REFERRAL-LANDING-001`, commit `c778c5d` |
| `TASK-JOBS-GROWTH-SETTLEMENT-001` | `livemask-job-service` | Periodic report generation and settlement aggregation | Done: branch `task/TASK-JOBS-GROWTH-SETTLEMENT-001`, commit `46f67ad`; Backend executor APIs still required |
| `TASK-CICD-USER-GROWTH-REVENUE-001` | `livemask-ci-cd` | End-to-end smoke and secret leak scan | Ready |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| Backend | New `growth` domain tables and APIs. |
| Admin | New Users & Growth pages and Finance settlement review surfaces. |
| App | Profile payout setup and ambassador report UX. |
| Website | Referral landing and attribution from `ref` query parameter. |
| Job Service | Scheduled ledger aggregation and settlement report jobs. |
| CI/CD | Smoke covering payout, referral, reports, feedback, RBAC, and redaction. |

## 5. Validation Plan

- Backend unit/API tests for payout validation and reserved methods.
- Backend tests for referral code stability.
- Admin tests for report empty states and RBAC.
- App tests for localized payout/referral/feedback forms.
- Website smoke for `/register?ref=CODE` preserving attribution.
- CI/CD smoke verifies no full payout details or secret-like values leak.

## 6. Rollback

Docs-only rollback reverts this task file and the linked contract. Runtime
implementation tasks must have their own rollback notes for schema/API changes.

## 7. Done Criteria

- Contract exists and is linked from MVP plan, task index, and user docs.
- Backend implementation task has clear API and schema targets.
- Downstream Admin/App/Website/Job Service/CI-CD tasks are named and scoped.
