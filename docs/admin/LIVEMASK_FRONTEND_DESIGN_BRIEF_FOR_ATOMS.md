# LiveMask Frontend Design Brief for Atoms

> This document is the design and implementation prompt for LiveMask frontend
> surfaces. It covers the Admin console and public Website. Use it with Atoms or
> another AI design tool before implementing `livemask-admin` or
> `livemask-website`.

## 1. Scope

LiveMask has two primary frontend surfaces outside the App:

| Repo | Surface | Purpose |
| --- | --- | --- |
| `livemask-admin` | Admin console | Operations, support, finance, node management, config management |
| `livemask-website` | Public website | Product story, pricing, downloads, trust, conversion |

Both should share brand language, but they should not have the same layout style.

- Admin should feel dense, operational, and efficient.
- Website should feel polished, trustworthy, and conversion-focused.

## 2. Shared Brand Direction

LiveMask visual language:

- secure
- calm
- premium
- privacy-aware
- network utility focused

Avoid:

- hacker/cyberpunk/neon visuals
- crypto trading aesthetics
- fake network maps that do not explain anything
- excessive gradients
- oversized decorative cards inside cards

Recommended brand elements:

| Element | Direction |
| --- | --- |
| Primary color | deep teal / cyan-green |
| Accent colors | success green, warning amber, danger red |
| Typography | clean, readable, practical |
| Icons | shield, globe, server, gauge, lock, alert, credit card |
| Motion | subtle status transitions only |

## 3. Admin Console Design

### 3.1 Admin Product Goal

The Admin console exists to let internal teams answer these questions quickly:

```text
Are users able to connect?
Which nodes are unhealthy?
Which payments need attention?
Which configs changed?
Who changed what?
What requires approval or escalation?
```

Admin is not a marketing surface. It should prioritize scanning, filtering,
comparison, action, audit, and repeated daily use.

### 3.2 Admin Navigation

Use a left sidebar and top utility bar.

Recommended primary navigation:

| Section | Purpose |
| --- | --- |
| Overview | Global health and business status |
| Users | User, subscription, entitlement |
| Nodes | Node inventory, health, degraded state |
| Config | Client and NodeAgent config versions |
| Payments | Orders, webhooks, refunds, failures |
| Feedback | App quick feedback and support queue |
| Audit | Admin actions and config change history |
| Settings | Roles, permissions, operational settings |

### 3.3 Admin Required Screens

#### Overview Dashboard

Required widgets:

- active users
- successful connections
- failed connection rate
- healthy node ratio
- degraded nodes
- payment success rate
- open feedback / appeals
- latest config version
- active alerts

Design:

- compact metric tiles
- time range selector
- region filter
- alert strip for critical issues
- no decorative hero section

#### Node Operations

Required table columns:

```text
Node
Region
Status
Latency
Load
Last report time
Config version
Protocol
Degraded reason
Actions
```

Actions:

- view details
- quarantine
- restore
- force config refresh
- view reports

States:

- healthy
- busy
- degraded
- offline
- quarantine
- stale report

#### Config Management

Required:

- current client config version
- current NodeAgent config version
- draft config
- validation result
- publish button
- rollback button
- change diff
- approval state
- audit trail

Design requirement:

- Config publish must look serious and controlled.
- Use confirmation dialog for publish and rollback.
- Show affected App / NodeAgent versions.

#### Payments

Required:

- order list
- payment status
- provider reference
- user
- plan
- amount
- chain/currency
- webhook history
- retry / manual review action

States:

- waiting
- confirming
- finished
- failed
- expired
- manual review

#### Feedback / Support Queue

Required:

- user feedback type
- node
- protocol
- error code
- app version
- config version
- description
- status
- assigned operator

Actions:

- assign
- mark resolved
- create node incident
- link to node detail

#### Audit

Required:

- actor
- action
- target
- before / after diff
- timestamp
- request id
- approval id
- IP / device context where appropriate

Audit should be immutable from UI.

### 3.4 Admin Components

| Component | Required states |
| --- | --- |
| `MetricTile` | normal, warning, critical, loading |
| `StatusBadge` | healthy, busy, degraded, offline, quarantine |
| `DataTable` | loading, empty, filtered, error |
| `FilterBar` | default, active filters |
| `ConfigDiffViewer` | added, removed, changed |
| `ApprovalPanel` | draft, pending, approved, rejected |
| `AuditTimeline` | normal, expanded |
| `ActionDialog` | confirm, dangerous, success, failure |

### 3.5 Admin Atoms Prompt

```text
Design a high-fidelity admin console for LiveMask, a privacy VPN and secure network access platform.

The Admin console is for internal operations, support, finance, and DevOps. It should feel dense, efficient, trustworthy, and operational. Do not design a marketing dashboard or oversized hero page. Avoid cyberpunk, neon, hacker, crypto trading, or decorative visuals.

Use a left sidebar and top utility bar. Primary navigation:
Overview, Users, Nodes, Config, Payments, Feedback, Audit, Settings.

Required screens:
1. Overview dashboard
2. Node operations
3. Config management
4. Payments
5. Feedback / support queue
6. Audit log

Overview dashboard:
- active users
- successful connections
- failed connection rate
- healthy node ratio
- degraded nodes
- payment success rate
- open feedback
- latest config version
- active alerts
- time range selector and region filter

Node operations:
- table with node, region, status, latency, load, last report time, config version, protocol, degraded reason, actions
- status states: healthy, busy, degraded, offline, quarantine, stale report
- actions: view details, quarantine, restore, force config refresh, view reports

Config management:
- current client config version
- current NodeAgent config version
- draft config
- validation result
- change diff
- publish button
- rollback button
- approval state
- audit trail
- dangerous actions require confirmation

Payments:
- order list with status, provider reference, user, plan, amount, chain/currency, webhook history
- states: waiting, confirming, finished, failed, expired, manual review

Feedback:
- issue type, node, protocol, error code, app version, config version, user description, status, assigned operator
- actions: assign, mark resolved, create node incident, link to node detail

Audit:
- actor, action, target, before/after diff, timestamp, request id, approval id
- audit entries are immutable

Visual direction:
- premium internal operations tool
- deep teal primary color, neutral surfaces, high contrast text
- compact information layout
- clear tables and filters
- maximum 8px card radius
- no cards inside cards
- no decorative gradient backgrounds

Output reusable components:
MetricTile, StatusBadge, DataTable, FilterBar, ConfigDiffViewer, ApprovalPanel, AuditTimeline, ActionDialog.
```

## 4. Website Design

### 4.1 Website Goal

The website should convert visitors into App users while building trust.

Primary goals:

- explain LiveMask quickly
- show secure private access
- show pricing / plan entry
- provide download entry
- show trust, privacy, and support

The website should not expose internal technical complexity.

### 4.2 Website Navigation

Recommended:

```text
Product
Pricing
Download
Security
Support
Login
Create Account
Get LiveMask
```

Auth entry rules:

- Public website login entry uses `/login`.
- Public website registration entry uses `/register`.
- Password recovery uses `/forgot-password`.
- Email verification / magic link result pages use `/verify-email` or
  `/auth/callback`.
- These public account routes must not share URI prefixes with internal or
  role-specific consoles such as `/admin/*`, `/sponsor/*`, `/ambassador/*`,
  `/account/*`, or `/billing/*`.
- After successful login, route by role and entitlement:
  - normal user -> `/account/*`
  - subscription/billing user -> `/billing/*`
  - sponsor ambassador -> `/sponsor/*`
  - promotion ambassador -> `/ambassador/*`
  - internal admin/operator/finance -> `/admin/*`
- Website navigation hiding is not security. Backend auth and authorization
  must enforce destination access after login.

### 4.3 Website Required Pages

#### Home

Hero requirements:

- first viewport must clearly show LiveMask brand
- use product/app visual, not abstract SVG-only art
- headline should be literal product/category, not vague slogan
- show primary CTA: Get LiveMask
- show secondary CTA: View Pricing / See Security

Suggested headline:

```text
LiveMask Secure VPN
```

Supporting copy:

```text
Private, reliable network access with smart node selection, clear diagnostics,
and a calm app experience.
```

#### Pricing

Required:

- free / trial if applicable
- monthly plan
- annual plan
- benefits
- payment methods
- FAQ
- refund/support note

#### Download

Required:

- iOS
- Android
- desktop placeholder if future
- version
- release notes link
- checksum / verification placeholder for desktop

#### Security / Privacy

Required:

- no browsing history in diagnostics
- encrypted local storage
- dynamic config
- certificate pinning
- clear privacy position

Do not claim impossible guarantees such as "100% anonymous".

#### Support

Required:

- connection troubleshooting
- payment help
- feedback path
- status page link placeholder
- contact/support entry

#### Login

Purpose:

- let existing users enter the LiveMask account flow safely
- route users to the correct post-login surface based on role and entitlement

Route:

```text
/login
```

Required:

- email / password login
- optional magic link or verification-code login placeholder
- remember device checkbox only if supported by backend
- forgot password link
- create account link
- clear error states for invalid credentials, locked account, rate limit, and
  network failure
- privacy/security reassurance without long legal copy

Post-login routing:

| User type | Destination |
| --- | --- |
| normal account user | `/account/*` |
| subscription/billing user | `/billing/*` |
| sponsor ambassador | `/sponsor/*` |
| promotion ambassador | `/ambassador/*` |
| internal admin / ops / finance | `/admin/*` |

Design requirements:

- Login should be calm, compact, and trustworthy.
- Do not use a marketing hero layout for the form.
- Do not expose whether an email exists unless backend explicitly supports
  that behavior.
- Show rate-limit and security messages without panic.

#### Register

Purpose:

- let new users create a LiveMask account and move toward download, plan, or
  onboarding

Route:

```text
/register
```

Required:

- email registration
- password creation or verification-code registration, depending on backend
  contract
- terms / privacy acknowledgement
- optional referral or invite code field
- login link
- clear states for duplicate account, weak password, invalid invite code,
  verification required, and network failure
- success state that sends user to email verification, app download, or account
  onboarding

Design requirements:

- Registration should feel lightweight.
- Do not place payment fields directly on the first registration screen.
- If plan selection is needed, link to Pricing or `/billing/*` after account
  creation.

#### Forgot Password / Verification

Routes:

```text
/forgot-password
/verify-email
/auth/callback
```

Required:

- request reset link / code
- reset confirmation
- expired link state
- already verified state
- safe generic messaging
- return to login action

### 4.4 Website Components

| Component | Purpose |
| --- | --- |
| `HeroProductVisual` | App screenshot / product visual |
| `PlanCard` | pricing |
| `DownloadCard` | platform downloads |
| `SecurityFeature` | trust explanation |
| `FAQAccordion` | support |
| `StatusBanner` | operational status |
| `CTASection` | conversion |
| `AuthForm` | login and registration |
| `AuthStatePanel` | verification, rate limit, expired link, success |

### 4.5 Website Atoms Prompt

```text
Design a polished public website for LiveMask Secure VPN.

The website should feel premium, calm, trustworthy, and conversion-focused. Avoid cyberpunk, neon, hacker visuals, crypto aesthetics, generic SaaS gradients, or abstract-only hero art.

Use a real product/app visual in the hero. The first viewport must clearly communicate the product name and category: "LiveMask Secure VPN".

Navigation:
Product, Pricing, Download, Security, Support, Login, Create Account, Get LiveMask.

Public auth route boundaries:
- /login for existing users.
- /register for new users.
- /forgot-password for password recovery.
- /verify-email and /auth/callback for verification or magic-link results.
- Do not place these pages under /admin, /sponsor, /ambassador, /account, or
  /billing.
- After successful login, route users by role: /account for normal users,
  /billing for subscription users, /sponsor for sponsor ambassadors,
  /ambassador for promotion ambassadors, and /admin for internal staff.

Required pages/sections:
1. Home
2. Pricing
3. Download
4. Security / Privacy
5. Support / FAQ
6. Login
7. Register
8. Forgot Password / Email Verification

Home hero:
- headline: LiveMask Secure VPN
- supporting copy about private reliable network access, smart node selection, clear diagnostics, and calm app experience
- primary CTA: Get LiveMask
- secondary CTA: View Pricing or See Security
- use App screenshot/product visual

Pricing:
- monthly and annual plan cards
- benefits
- payment method area
- FAQ
- refund/support note

Download:
- iOS, Android, desktop placeholder
- version and release notes
- checksum/verification placeholder for desktop

Security:
- no browsing history in diagnostics
- encrypted local storage
- dynamic config
- certificate pinning
- privacy-first diagnostics
- avoid impossible claims like 100% anonymous

Support:
- connection troubleshooting
- payment help
- feedback path
- status page placeholder
- contact/support entry

Login:
- email/password form
- optional magic link or verification-code placeholder
- forgot password link
- create account link
- error states: invalid credentials, locked account, rate limit, network failure
- role-aware post-login routing

Register:
- email registration
- password or verification-code registration placeholder
- terms and privacy acknowledgement
- optional referral/invite code
- login link
- states: duplicate account, weak password, invalid invite code, verification
  required, network failure, success

Forgot Password / Verification:
- request reset link/code
- expired link state
- already verified state
- return to login action

Visual direction:
- light-first, premium, high contrast
- deep teal primary color
- restrained accents
- no decorative card nesting
- no giant generic gradient hero
- sections should be full-width bands or clean constrained layouts
- mobile responsive

Output reusable components:
HeroProductVisual, PlanCard, DownloadCard, SecurityFeature, FAQAccordion, StatusBanner, CTASection, AuthForm, AuthStatePanel.
```

## 5. Frontend Development Rules

For `livemask-admin`:

- optimize for repeated internal use
- tables must support loading, empty, error, and filtered states
- dangerous actions require confirmation
- every config/payment/admin action must expose audit context
- Admin UI must not hide backend validation errors

For `livemask-website`:

- optimize for clarity and conversion
- use real product visuals as soon as App design is available
- avoid unsupported claims
- keep pricing, download, and support easy to find
- provide visible login and registration entries
- keep public auth pages outside `/admin/*`, `/sponsor/*`, `/ambassador/*`,
  `/account/*`, and `/billing/*`
- mobile layout is mandatory

## 6. Acceptance Checklist

Admin:

- [ ] Operators can identify degraded nodes quickly.
- [ ] Config publish and rollback are controlled and auditable.
- [ ] Payment failures have manual review paths.
- [ ] Feedback queue links to node and diagnostic context.
- [ ] Audit log is readable and immutable from UI.

Website:

- [ ] First viewport clearly says LiveMask Secure VPN.
- [ ] CTA to download/get LiveMask is obvious.
- [ ] Pricing and security sections are easy to scan.
- [ ] Login and Create Account entries are visible in navigation.
- [ ] `/login`, `/register`, `/forgot-password`, `/verify-email`, and
      `/auth/callback` states are designed.
- [ ] Public auth pages route users to the correct role-specific URI after
      login.
- [ ] No impossible privacy claims.
- [ ] Mobile layout is complete.

Shared:

- [ ] Brand is consistent with App design.
- [ ] Accessibility and contrast are acceptable.
- [ ] Components are reusable.
- [ ] Empty/loading/error states are designed.
