# Auth / RBAC Security Model

> Security companion for `docs/contracts/api/auth-rbac.md`.

## 1. Threats

| Threat | Control |
| --- | --- |
| Credential stuffing | Rate limit login/register, generic login failure, IP/device telemetry |
| Token theft | Short access token TTL, refresh token rotation, session revocation |
| Privilege escalation | Server-side permission checks, route namespace checks, audit logs |
| Cross-surface access | Separate `/admin`, `/sponsor`, `/ambassador`, and website/user routes |
| CSRF on Web | httpOnly cookie + CSRF token pair for cookie mode |
| Stale permissions | Token refresh must re-load current roles and permissions |
| Insider abuse | Audit all role changes and privileged writes |

## 2. Route Separation

Frontend route guards are not enough. Backend must enforce:

```text
/api/v1/*              user/app/website scope
/admin/api/v1/*        admin/sponsor/ambassador scope
/internal/agent/*      node identity scope
```

The same frontend application may render Admin, sponsor ambassador, and
promotion ambassador UI, but each route namespace must be checked against
`admin_namespaces`.

## 3. Token Storage Guidance

| Client | Recommended storage |
| --- | --- |
| iOS / Android / desktop App | platform secure storage |
| Website | httpOnly secure cookie plus CSRF token |
| Admin | httpOnly secure cookie plus CSRF token; stricter idle timeout |

## 4. Audit Requirements

Minimum audited actions:

- login success/failure summary
- logout
- refresh token reuse detection
- role assignment
- Admin user status changes
- config publish / rollback
- payment and settlement admin actions
- sponsor/ambassador payout actions

Audit logs must include actor, target, action, request ID, IP, user agent,
before/after values where applicable, and timestamp.
