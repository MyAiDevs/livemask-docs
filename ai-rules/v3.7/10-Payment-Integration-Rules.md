# 10 - Payment Integration Rules

Payment work must be idempotent, auditable, and reversible at the business state level.

- Every payment callback, webhook, and manual correction must have an idempotency key or equivalent uniqueness guard.
- Payment provider secrets must be stored only as secret references or runtime secrets.
- Payment state machines must define pending, confirmed, failed, expired, refunded, and disputed behavior before implementation.
- Never mark payment work complete without DB consistency, retry, audit, and reconciliation notes.
- Admin actions that change payment state must be permission-gated and audited.
- Completion reports must state impact on Backend, Admin, App, and CI/CD smoke.

