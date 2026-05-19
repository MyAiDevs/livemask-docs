# Auth / Account / RBAC API Contract

> TASK-AUTH-001. This contract is the identity foundation for App, Website,
> Admin, payment, device management, C2C marketplace, points, and operations.

## 1. Goals

Provide one account and authorization model for:

- App login and authenticated API calls
- Website login, registration, subscription, devices, C2C, points, and support
- Admin console login and RBAC-protected operations
- Sponsor ambassador and promotion ambassador access inside the same Admin
  product, separated by role and route namespace

## 2. Route Namespace Rules

Public website and user portal routes must not share privileged Admin route
prefixes.

| Surface | Route namespace | Notes |
| --- | --- | --- |
| Public website auth | `/login`, `/register`, `/forgot-password`, `/verify-email`, `/auth/callback` | User-facing auth only |
| Website user portal | `/account/*`, `/billing/*`, `/devices/*`, `/market/*`, `/points/*`, `/support/*` | Authenticated end users |
| Admin system management | `/admin/*` | System administrator and operator roles |
| Sponsor ambassador console | `/sponsor/*` | Same Admin app, separate namespace and role gate |
| Promotion ambassador console | `/ambassador/*` | Same Admin app, separate namespace and role gate |
| Backend public/auth API | `/api/v1/auth/*` | Website/App caller |
| Backend user API | `/api/v1/me`, `/api/v1/account/*` | User JWT |
| Backend Admin API | `/admin/api/v1/*` | Admin JWT and RBAC |

Admin, sponsor, and ambassador surfaces may live in the same frontend
repository, but they must be route-separated and permission-separated.

## 3. Roles

MVP role names are stable strings.

| Role | Scope | Description |
| --- | --- | --- |
| `user` | Website / App | Normal end user, subscription, devices, C2C, points |
| `subscriber` | Website / App | User with active entitlement |
| `sponsor_ambassador` | Sponsor namespace | Sponsor node / sponsor revenue self-service |
| `promotion_ambassador` | Ambassador namespace | Referral and promotion revenue self-service |
| `support_agent` | Admin namespace | User support and ticket handling |
| `ops_operator` | Admin namespace | Node/config/operations management |
| `finance_operator` | Admin namespace | Payments, invoices, settlement review |
| `auditor` | Admin namespace | Read-only audit access |
| `admin` | Admin namespace | Full system administration |
| `super_admin` | Admin namespace | Break-glass owner; can manage roles |

## 4. Permission Groups

Backend must enforce permissions server-side. Frontend guards are user
experience only.

| Permission | Roles |
| --- | --- |
| `config:read` | `ops_operator`, `admin`, `super_admin`, `auditor` |
| `config:write` | `ops_operator`, `admin`, `super_admin` |
| `user:read` | `support_agent`, `ops_operator`, `admin`, `super_admin`, `auditor` |
| `user:write` | `support_agent`, `admin`, `super_admin` |
| `payment:read` | `finance_operator`, `admin`, `super_admin`, `auditor` |
| `payment:write` | `finance_operator`, `admin`, `super_admin` |
| `settings:read` | `ops_operator`, `admin`, `super_admin`, `auditor` |
| `settings:write` | `admin`, `super_admin` |
| `settings:verify` | `ops_operator`, `admin`, `super_admin` |
| `jobs:read` | `ops_operator`, `admin`, `super_admin`, `auditor` |
| `jobs:execute` | `ops_operator`, `admin`, `super_admin` |
| `jobs:write` | `admin`, `super_admin` |
| `logs:read` | `support_agent`, `ops_operator`, `admin`, `super_admin`, `auditor` |
| `audit:read` | `auditor`, `admin`, `super_admin` |
| `metrics:read` | `ops_operator`, `admin`, `super_admin`, `auditor` |
| `metrics:write` | `admin`, `super_admin` |
| `notifications:read` | `support_agent`, `ops_operator`, `admin`, `super_admin`, `auditor` |
| `notifications:write` | `ops_operator`, `admin`, `super_admin` |
| `notifications:execute` | `ops_operator`, `admin`, `super_admin` |
| `app_release:read` | `support_agent`, `ops_operator`, `admin`, `super_admin`, `auditor` |
| `app_release:write` | `admin`, `super_admin` |
| `app_release:upload` | `ops_operator`, `admin`, `super_admin`, CI service actor |
| `role:manage` | `super_admin` |
| `sponsor:self_read` | `sponsor_ambassador`, `admin`, `super_admin` |
| `sponsor:self_write` | `sponsor_ambassador`, `admin`, `super_admin` |
| `ambassador:self_read` | `promotion_ambassador`, `admin`, `super_admin` |
| `ambassador:self_write` | `promotion_ambassador`, `admin`, `super_admin` |
| `growth:read` | `support_agent`, `ops_operator`, `finance_operator`, `auditor`, `admin`, `super_admin` |
| `growth:write` | `ops_operator`, `finance_operator`, `admin`, `super_admin` |
| `settlement:read` | `finance_operator`, `auditor`, `admin`, `super_admin` |
| `settlement:write` | `finance_operator`, `admin`, `super_admin` |

Permission semantics:

| Permission Family | Meaning | Notes |
| --- | --- | --- |
| `jobs:*` | Admin Job Center definitions, runs, schedules, retry/cancel/run-now | Write/execute still requires owner-domain permission such as `geoip:write` when applicable |
| `logs:read` | Redacted technical logs, node latest logs, payment/notification log views | Does not grant raw secret, raw payload, or sensitive contact reveal |
| `audit:read` | Immutable audit log search | Auditors and admins only |
| `metrics:read` | Prometheus-derived summaries and Admin metric views | Does not grant direct browser access to Prometheus/NodeAgent |
| `metrics:write` | Observability sampling/client config changes | Used for App/Sentry safe client config settings |
| `notifications:*` | Provider settings, templates, delivery logs and dispatch actions | Contact reveal still requires separate sensitive-contact permission if introduced |
| `settings:*` | Safe system setting summaries, write-only secret updates, provider verification | Raw secrets are never returned even with `settings:read` |

## 5. Token Model

| Token | Storage | TTL | Audience | Notes |
| --- | --- | --- | --- | --- |
| Access token | App secure storage / Web memory or httpOnly cookie | 15 minutes | `app`, `website`, `admin` | JWT, short-lived |
| Refresh token | App secure storage / Web httpOnly cookie | 30 days | matching client type | Opaque token preferred; hash stored server-side |
| CSRF token | Web cookie/header pair | session | browser clients | Required when cookies are used |

JWT claims:

| Claim | Type | Required | Description |
| --- | --- | --- | --- |
| `sub` | uuid | yes | User ID |
| `session_id` | uuid | yes | Session ID |
| `roles` | string[] | yes | Role list |
| `permissions` | string[] | yes | Effective permissions |
| `aud` | string | yes | `app` / `website` / `admin` |
| `iat` | int | yes | Issued at |
| `exp` | int | yes | Expiry |

## 6. API Endpoints

### POST `/api/v1/auth/register`

- Caller: Website / App
- Auth: none
- Idempotency: `request_id`

Request:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `request_id` | string | yes | Idempotency key |
| `email` | string | yes | Lower-cased email |
| `password` | string | yes | Plain password over TLS only |
| `display_name` | string | no | User display name |
| `referral_code` | string | no | Promotion ambassador referral code |
| `client_type` | string | yes | `app` / `website` |

Response `201`:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | uuid | yes | Created user |
| `email_verification_required` | bool | yes | Whether email verification is required |
| `access_token` | string | conditional | Present when immediate login is allowed |
| `refresh_token` | string | conditional | Present for App; Web may use cookie |
| `expires_in` | int | conditional | Access token TTL seconds |

### POST `/api/v1/auth/login`

- Caller: Website / App / Admin
- Auth: none
- Idempotency: optional `request_id`

Request:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | Email |
| `password` | string | yes | Password |
| `client_type` | string | yes | `app` / `website` / `admin` |
| `mfa_code` | string | no | Future-compatible MFA |

Response `200`:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user` | object | yes | Current user summary |
| `access_token` | string | yes | JWT access token |
| `refresh_token` | string | conditional | App response; Web may use cookie |
| `expires_in` | int | yes | Access token TTL seconds |

Admin login must reject users without any Admin/sponsor/ambassador role.

### POST `/api/v1/auth/refresh`

- Caller: Website / App / Admin
- Auth: refresh token or refresh cookie
- Idempotency: N/A

Request:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `refresh_token` | string | conditional | Required for App token mode |
| `client_type` | string | yes | `app` / `website` / `admin` |

Response `200`: same token fields as login.

Refresh token rotation is required. Reusing an already-rotated refresh token
must revoke the session family.

### POST `/api/v1/auth/logout`

- Caller: Website / App / Admin
- Auth: access token or refresh cookie
- Idempotency: N/A

Response `200`:

```json
{ "ok": true }
```

### GET `/api/v1/me`

- Caller: Website / App / Admin
- Auth: User JWT / Admin JWT

Response:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | uuid | yes | User ID |
| `email` | string | yes | Email |
| `display_name` | string | no | Display name |
| `roles` | string[] | yes | Effective roles |
| `permissions` | string[] | yes | Effective permissions |
| `subscription_status` | string | no | `none` / `active` / `expired` / `paused` |
| `created_at` | string | yes | Account creation time |

### GET `/admin/api/v1/auth/me`

- Caller: Admin frontend
- Auth: Admin JWT

Response: same as `/api/v1/me`, plus:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `admin_namespaces` | string[] | yes | Allowed route namespaces: `admin`, `sponsor`, `ambassador` |

### GET `/admin/api/v1/users`

- Caller: Admin frontend
- Auth: `user:read`
- Pagination: cursor or page/limit

MVP response must include user ID, email, roles, subscription status, created
time, last login time, and disabled status.

### POST `/admin/api/v1/users/{user_id}/roles`

- Caller: Admin frontend
- Auth: `role:manage`
- Idempotency: `request_id`

Request:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `request_id` | string | yes | Idempotency key |
| `roles` | string[] | yes | Full replacement role list |
| `reason` | string | yes | Audit reason |

Response:

```json
{ "ok": true }
```

## 7. Error Codes

| Code | HTTP | User visible | Required client behavior |
| --- | --- | --- | --- |
| `AUTH_INVALID_CREDENTIALS` | 401 | yes | Show generic login failure |
| `AUTH_TOKEN_EXPIRED` | 401 | no | Try refresh once |
| `AUTH_REFRESH_REVOKED` | 401 | yes | Clear session and require login |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | yes | Show verification flow |
| `AUTH_MFA_REQUIRED` | 403 | yes | Future-compatible MFA step |
| `AUTH_FORBIDDEN` | 403 | yes | Show no-permission page |
| `AUTH_ROUTE_NAMESPACE_DENIED` | 403 | yes | Block cross-namespace access |
| `AUTH_RATE_LIMITED` | 429 | yes | Backoff and show retry later |
| `AUTH_WEAK_PASSWORD` | 400 | yes | Show password policy |
| `AUTH_DUPLICATE_EMAIL` | 409 | yes | Show account exists |

## 8. Database Minimum Tables

Backend may refine names, but must cover these logical entities:

| Entity | Required fields |
| --- | --- |
| `users` | `id`, `email`, `password_hash`, `display_name`, `status`, `email_verified_at`, `created_at`, `updated_at` |
| `roles` | `id`, `role_key`, `description` |
| `user_roles` | `user_id`, `role_key`, `created_at`, `created_by`, `reason` |
| `sessions` | `id`, `user_id`, `client_type`, `refresh_token_hash`, `refresh_family_id`, `revoked_at`, `expires_at`, `created_at`, `last_used_at` |
| `audit_logs` | actor, action, target, request_id, ip, user_agent, before, after, created_at |

## 9. Security Requirements

- Passwords must be hashed with bcrypt/argon2id. Never store plaintext.
- Login and register endpoints require rate limiting.
- Admin APIs require server-side permission checks.
- Role changes must write audit logs.
- Refresh token rotation is mandatory.
- Web cookie mode must use httpOnly, secure, sameSite, and CSRF protection.
- App token storage must use platform secure storage.
- Error messages must not reveal whether an email exists, except registration
  duplicate email flow.

## 10. Validation

- Register -> login -> `/api/v1/me` -> refresh -> logout.
- Invalid password returns `AUTH_INVALID_CREDENTIALS`.
- Expired access token refreshes once.
- Revoked refresh token forces logout.
- Admin route rejects normal `user`.
- `/sponsor/*` rejects `promotion_ambassador`.
- `/ambassador/*` rejects `sponsor_ambassador`.
- `role:manage` is required for role assignment.
- Audit log exists for role change and admin user action.
