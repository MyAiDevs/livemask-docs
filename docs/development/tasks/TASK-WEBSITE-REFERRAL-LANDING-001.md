# TASK-WEBSITE-REFERRAL-LANDING-001 - Referral Landing Attribution

> Owner: Website / Growth / Docs / QA
> Repo: `livemask-website`
> Branch: `task/TASK-WEBSITE-REFERRAL-LANDING-001`
> Commit: `c778c5d`
> Status: Completed dev-local
> Created: 2026-05-19

## 1. Background

The public Website is the entry point for invitation-based user acquisition.
Referral attribution must be preserved from public links into registration while
remaining privacy-safe: the Website can carry a referral code, but it must not
show inviter identity, earnings, payout data, or Admin-only growth information.

## 2. Scope

Completed behavior:

- `RegisterPage` reads `?ref=CODE`.
- Referral code is sanitized to uppercase alphanumeric before use.
- Sanitized code is auto-filled into the invitation code input.
- A lightweight zh-CN / en-US prompt tells the user they are registering through
  an invitation link.
- Inviter identity is never displayed.
- The `ref` value is treated only as an attribution code, not as a redirect URL.

## 3. Validation

Validation evidence from the Website window:

```text
tsc -b PASS
npm run build PASS
git diff --check PASS
```

Security validation:

- No full user identity is rendered from a referral code.
- No referral code is used as a URL.
- No open redirect behavior is introduced.
- Public Website routes do not expose Admin-only growth pages.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Registration APIs should continue accepting `referral_code` where supported by the user growth contract. |
| `livemask-ci-cd` | Growth revenue smoke should verify `/register?ref=CODE` attribution is preserved and sanitized. |
| `livemask-docs` | User Growth handoff and MVP plan record the completed Website attribution path. |

## 5. Remaining Risks

- CI/CD does not yet have a dedicated browser smoke for the Website referral
  registration path.
- Backend-side referral conversion accounting remains owned by the growth
  revenue Backend tasks and must not be inferred by Website UI.

## 6. Done Criteria

- Referral code query support is implemented.
- Sanitization and no-open-redirect behavior are documented.
- zh-CN and en-US user-facing prompt behavior is documented.
- Validation evidence is recorded.
- Downstream CI/CD follow-up is explicit.
