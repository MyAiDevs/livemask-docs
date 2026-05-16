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
| Revenue | Sponsor nodes, ambassador commissions, payout traceback |
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

#### Sponsor Node / Ambassador Revenue Operations

Purpose:

- inspect sponsor node contribution, quality, traffic, payout readiness, and
  revenue history
- configure `sponsor_node_revenue_config`
- run or review revenue calculation jobs
- perform traceback recalculation after appeal, fraud review, late traffic data,
  or config correction
- inspect promotion ambassador invite quality, loyalty bonus, C2C commission,
  and monthly payout

This module is part of the same back-office product, but role surfaces must use
separate URI prefixes and permission boundaries.

Route boundaries:

| Surface | URI Prefix | Audience | Notes |
| --- | --- | --- | --- |
| System Admin | `/admin/system/*` | platform super admins | users, roles, global settings, security actions |
| Operations Admin | `/admin/ops/*` | operations and support | nodes, tickets, feedback, operational review |
| Finance Admin | `/admin/finance/*` | finance reviewers | payout review, revenue approval, exports |
| Sponsor Ambassador Portal | `/sponsor/*` | node sponsors / sponsor ambassadors | own nodes, traffic, revenue, appeals |
| Ambassador Portal | `/ambassador/*` | promotion ambassadors | own invites, commission, C2C contribution, payout status |

Do not put sponsor or ambassador self-service pages under `/admin/*`. If an
internal admin page needs to inspect a sponsor or ambassador, it should use an
admin-prefixed review route and enforce admin permissions.

Admin-side placement:

```text
/admin/finance/revenue
  -> Sponsor Nodes
  -> Sponsor Revenue
  -> Ambassador Revenue
  -> Revenue Config
  -> Traceback Jobs

/admin/ops/nodes
  -> Sponsors
  -> Node Appeals
```

Required sponsor overview columns:

```text
Sponsor
Active nodes
Healthy nodes
Traffic GB
Quality score
Tier bonus
Estimated revenue
Payout status
Last calculation
Actions
```

Required sponsor states:

| State | Meaning |
| --- | --- |
| healthy | Normal quality and payout eligible |
| degraded | Quality below normal but not blocked |
| blocked | Below `min_quality_for_payout` or under review |
| traceback_required | Appeal or data correction requires recalculation |
| stale | No recent node report or calculation is old |

Sponsor detail must show:

- identity summary, sponsor id, account, status, risk flag
- period selector
- traffic GB, active nodes, uptime, region spread
- quality composite score:
  - uptime score
  - network quality score
  - node count score
  - final score
- formula breakdown:

```text
revenue = traffic_gb / base_gb_per_unit * quality_score * tier_bonus
```

- node table with latency, uptime, traffic, status, last report
- revenue history
- appeal and traceback timeline

Revenue config must support:

- config key: `sponsor_node_revenue_config`
- Form / JSON / Impact Preview modes
- `base_gb_per_unit`
- `quality_weights.uptime_score`
- `quality_weights.network_quality_score`
- `quality_weights.node_count_score`
- `tier_rules`
- `min_quality_for_payout`
- `payout_cycle`
- `platform_share_rate`
- weight sum validation
- tier overlap validation
- publish confirmation with expected hash
- rollback
- before/after diff
- estimated impact on top sponsors

Revenue calculation jobs must show:

```text
Job id
Period start / end
Triggered by
Force recalc
Status
Sponsors processed
Sponsors blocked
Total payout
Error count
Started at
Finished at
```

Job actions:

- dry run
- run calculation
- rerun failed
- export result
- open audit log

Job states:

- queued
- running
- completed
- completed_with_warnings
- failed
- cancelled

Traceback flow:

```text
Select sponsor / node / ambassador
-> Select affected period
-> Choose reason
-> Preview affected records
-> Confirm recalculation
-> Review before/after result
```

Traceback evidence:

- source event id
- appeal id if applicable
- old quality score
- new quality score
- old revenue
- new revenue
- delta
- reviewer
- audit id

Danger controls:

- require typed confirmation for large negative or positive payout deltas
- show whether payout has already been paid
- block automatic update if payout is already settled and requires finance
  review

Ambassador revenue overview columns:

```text
Ambassador
Tier
Invited active users
Average invited user tier
Loyalty bonus factor
Consumption base
C2C commission
Estimated commission
Status
Last calculation
Actions
```

Ambassador detail must show:

- commission formula breakdown
- invited user quality distribution
- monthly commission trend
- C2C contribution records
- loyalty stats update history
- traceback history

Revenue operation design principles:

- Every revenue number needs a path back to source metrics and period.
- Payout is gated, not casual.
- Quality and revenue must be shown together.
- Appeal outcomes must show before/after score and revenue impact.
- Revenue config changes must show diff, estimated impact, required approval,
  and rollback path.
- Avoid crypto exchange visuals, flashing numbers, candlestick visuals, and
  speculative profit language.

Revenue permissions:

| URI Prefix | Action | Permission |
| --- | --- | --- |
| `/admin/finance/*` | View all sponsor revenue | `revenue.read_all` |
| `/admin/finance/*` | Edit revenue config | `revenue.config.write` |
| `/admin/finance/*` | Publish revenue config | `revenue.config.publish` |
| `/admin/finance/*` | Run calculation | `revenue.calculate.run` |
| `/admin/finance/*` | Run traceback | `revenue.traceback.run` |
| `/admin/finance/*` | Approve payout adjustment | `revenue.adjustment.approve` |
| `/sponsor/*` | View own sponsor revenue | `sponsor.revenue.read_own` |
| `/sponsor/*` | Create own node appeal | `sponsor.appeal.create_own` |
| `/ambassador/*` | View own commission | `ambassador.commission.read_own` |
| `/ambassador/*` | View own invited users summary | `ambassador.invites.read_own` |

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
| `RevenueFormulaBreakdown` | normal, warning, blocked |
| `TracebackStepper` | draft, preview, confirming, completed, failed |
| `PayoutStatusBadge` | eligible, pending_review, blocked, traceback_required, paid |
| `RevenueConfigEditor` | form, json, impactPreview, validationError |

### 3.5 Admin Atoms Prompt

```text
Design a high-fidelity admin console for LiveMask, a privacy VPN and secure network access platform.

The Admin console is for internal operations, support, finance, and DevOps. It should feel dense, efficient, trustworthy, and operational. Do not design a marketing dashboard or oversized hero page. Avoid cyberpunk, neon, hacker, crypto trading, or decorative visuals.

Use a left sidebar and top utility bar. Primary navigation:
Overview, Users, Nodes, Config, Payments, Revenue, Feedback, Audit, Settings.

Required screens:
1. Overview dashboard
2. Node operations
3. Config management
4. Payments
5. Sponsor Node Revenue Operations
6. Ambassador Revenue Overview
7. Traceback Jobs
8. Feedback / support queue
9. Audit log

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

Revenue:
- sponsor node overview with sponsor, active nodes, healthy nodes, traffic GB, quality score, tier bonus, estimated revenue, payout status, last calculation, actions
- sponsor detail with formula: revenue = traffic_gb / base_gb_per_unit * quality_score * tier_bonus
- revenue config editor for sponsor_node_revenue_config with Form / JSON / Impact Preview modes
- revenue calculation jobs with dry run, run calculation, rerun failed, export, audit log
- traceback jobs for appeal/data/config correction with before/after score and revenue delta
- ambassador revenue overview with tier, invited active users, loyalty bonus, C2C commission, estimated commission, status
- states: healthy, degraded, blocked, traceback_required, stale, queued, running, completed, completed_with_warnings, failed
- every revenue number must be traceable to source metrics and period
- sensitive actions require confirmation and audit visibility
- keep route boundaries separate: /admin/finance/* for internal revenue admin, /admin/ops/* for operational review, /sponsor/* for sponsor self-service, /ambassador/* for ambassador self-service

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
MetricTile, StatusBadge, DataTable, FilterBar, ConfigDiffViewer, ApprovalPanel, AuditTimeline, ActionDialog, RevenueFormulaBreakdown, TracebackStepper, PayoutStatusBadge, RevenueConfigEditor.
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

Website account and subscription rule:

- Except for actual VPN connection control, every user-facing App capability
  must have an equivalent Website user-portal capability.
- VPN-only capabilities are: connect/disconnect VPN, live tunnel status,
  protocol switching, active node switching, and NetworkExtension/client
  diagnostics that require device runtime access.
- The App is not the only subscription entry.
- Logged-in website users must also be able to subscribe to a plan, renew,
  review billing state, and manage allowed devices from the web user portal.
- Subscription and payment pages live under `/billing/*`.
- Device management lives under `/account/devices/*`.
- C2C marketplace pages live under `/market/*`.
- Website subscription state must use the same backend source of truth as the
  App. Do not create a website-only entitlement state.
- Website C2C marketplace state must use the same backend order, escrow,
  points, payment, and risk-control source of truth as the App and Backend.

App-to-Website parity map:

| App capability | Website route | Required on Website | Notes |
| --- | --- | --- | --- |
| Login / register | `/login`, `/register` | Yes | Same auth backend |
| Profile / account | `/account/*` | Yes | Account profile, language, security |
| Subscription / plan | `/billing/*` | Yes | Subscribe, renew, upgrade/downgrade |
| Payment / order history | `/billing/history` | Yes | Same payment/order state |
| Device management | `/account/devices/*` | Yes | Add/revoke devices, device limit |
| Support / feedback | `/support`, `/account/support` | Yes | Feedback, tickets, help paths |
| Diagnostics records | `/account/diagnostics` | Partial | Historical reports only, not live tunnel diagnostics |
| C2C marketplace | `/market/*` | Yes | Listings, orders, escrow, disputes |
| Points economy | `/points/*` | Yes when module is active | Balance, transactions, earn/spend paths |
| Ambassador revenue | `/ambassador/*` | Yes when role enabled | Own invites, commission, C2C commission |
| Sponsor node revenue | `/sponsor/*` | Yes when role enabled | Own nodes, traffic, revenue, appeals |
| Notifications | `/account/notifications` | Yes | Preferences and message history |
| VPN connect/disconnect | App only | No | Requires client runtime |
| Active node switching | App only | No | Website may show docs/status, not control tunnel |

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

#### Account Portal

Purpose:

- let logged-in users manage account security and devices from the website

Routes:

```text
/account
/account/security
/account/devices
/account/devices/add
```

Required:

- current account profile summary
- security status and recent login/device context
- registered device list
- add device entry
- revoke device action
- device limit warning based on current subscription
- device trust / last active / platform / app version where available
- empty state for no registered devices

Device management requirements:

- Adding a device must respect the user's active plan device limit.
- If limit is reached, show upgrade or revoke-device path.
- Revoking the current device must require confirmation.
- Device list must not expose sensitive device secrets.
- Device changes must be auditable by backend.

#### Billing / Subscription Portal

Purpose:

- let website users subscribe, renew, upgrade, downgrade, and review billing
  status without requiring the App

Routes:

```text
/billing
/billing/plans
/billing/checkout
/billing/success
/billing/failure
/billing/history
```

Required:

- current subscription status
- plan cards sourced from the same plan model as the App
- monthly / annual plan selection
- payment method entry placeholder
- checkout confirmation
- success and failure states
- renewal / expiration state
- upgrade / downgrade path
- invoice or order history
- restore / refresh subscription state action

Subscription requirements:

- Web and App subscription status must converge to the same backend
  entitlement.
- The website must not show a plan as active before backend confirms payment or
  subscription activation.
- Checkout failure must preserve the selected plan and provide retry.
- Upgrade/downgrade copy must explain when the change takes effect.
- If payment provider is not ready, use disabled provider cards with clear
  `coming soon` or `staging only` state, not fake success.

#### C2C Marketplace Portal

Purpose:

- let logged-in website users browse, create, buy, sell, and track C2C market
  orders from the browser
- expose market state clearly without bypassing backend escrow, payment, points,
  or risk controls

Routes:

```text
/market
/market/listings
/market/listings/new
/market/listings/:listing_id
/market/orders
/market/orders/:order_id
/market/wallet
/market/disputes
```

Required:

- marketplace overview with available listings
- buy / sell tabs
- listing detail with price, amount, limits, seller status, and risk notices
- create listing flow
- order detail timeline
- payment / escrow state panel
- points or balance summary if C2C uses points
- dispute / appeal entry
- empty, blocked, risk review, and suspended-account states

C2C state requirements:

- Do not show an order as completed until backend confirms final settlement.
- Do not allow frontend-only balance mutation.
- Listings must show availability, limit, and lock/escrow state from backend.
- Buyer and seller actions must be idempotent and auditable by backend.
- Suspicious listings or users must show review/blocked states.
- Disputes must route to backend case records, not local-only UI state.

Route boundary:

- User-facing market pages use `/market/*`.
- Internal review and fraud operations use `/admin/ops/*` or
  `/admin/finance/*`, never `/market/*`.
- Ambassador C2C commission views use `/ambassador/*`, not `/market/*`.

#### Points Portal

Purpose:

- let website users review and use points economy features when the module is
  enabled

Routes:

```text
/points
/points/history
/points/earn
/points/spend
```

Required:

- current points balance
- transaction history
- earning sources
- spend paths for subscription or marketplace where supported
- expired / frozen / pending states
- adjustment and dispute references when applicable

#### Support / Diagnostics Portal

Purpose:

- provide web equivalents for App support, feedback, and historical diagnostic
  review

Routes:

```text
/support
/support/tickets
/support/tickets/:ticket_id
/account/diagnostics
/account/notifications
```

Required:

- create support request
- list own tickets
- ticket detail timeline
- attach App diagnostic report id where available
- view historical diagnostic reports sent from App
- notification preferences and message history

Boundary:

- Website can show historical diagnostics and support flows.
- Website must not pretend to run live client tunnel diagnostics that require
  App runtime access.

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
- Logged-in website users can subscribe, renew, upgrade/downgrade, review
  billing history, and manage devices from the website. Subscription pages use
  /billing/* and device management uses /account/devices/*.
- Website users can access the C2C marketplace from /market/* for listings,
  orders, wallet/balance, and disputes. Internal C2C review must stay under
  /admin/ops/* or /admin/finance/*.
- Apart from actual VPN connection/runtime controls, every App user feature
  must have a Website equivalent: account, subscription, devices, support,
  historical diagnostics, points, C2C, ambassador, sponsor, and notifications.

Required pages/sections:
1. Home
2. Pricing
3. Download
4. Security / Privacy
5. Support / FAQ
6. Login
7. Register
8. Forgot Password / Email Verification
9. Account Portal
10. Billing / Subscription Portal
11. C2C Marketplace Portal
12. Points Portal
13. Support / Diagnostics Portal

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

Account Portal:
- /account profile summary
- /account/security security and recent login state
- /account/devices device list
- /account/devices/add add-device flow
- revoke device confirmation
- device limit warning based on subscription plan
- upgrade/revoke path when device limit is reached

Billing / Subscription Portal:
- /billing current subscription summary
- /billing/plans plan cards
- /billing/checkout checkout confirmation
- /billing/success activation success
- /billing/failure retry state
- /billing/history invoice/order history
- upgrade, downgrade, renew, restore/refresh subscription state
- never show active entitlement before backend confirms activation

C2C Marketplace Portal:
- /market overview
- /market/listings buy/sell listings
- /market/listings/new create listing
- /market/listings/:listing_id listing detail
- /market/orders order list
- /market/orders/:order_id order timeline and escrow state
- /market/wallet points/balance summary if applicable
- /market/disputes dispute and appeal entry
- risk review, blocked, suspended, empty, and settlement-pending states
- never show completed settlement before backend confirms it

Points Portal:
- /points balance summary
- /points/history transaction history
- /points/earn earning sources
- /points/spend subscription or marketplace spend paths
- expired, frozen, pending, adjusted, disputed states

Support / Diagnostics Portal:
- /support help entry
- /support/tickets ticket list
- /support/tickets/:ticket_id ticket timeline
- /account/diagnostics historical App diagnostic reports
- /account/notifications notification preferences and history
- do not design live VPN tunnel diagnostics on Website

Visual direction:
- light-first, premium, high contrast
- deep teal primary color
- restrained accents
- no decorative card nesting
- no giant generic gradient hero
- sections should be full-width bands or clean constrained layouts
- mobile responsive

Output reusable components:
HeroProductVisual, PlanCard, DownloadCard, SecurityFeature, FAQAccordion, StatusBanner, CTASection, AuthForm, AuthStatePanel, DeviceList, DeviceLimitBanner, SubscriptionSummary, CheckoutStatePanel, MarketListingTable, OrderTimeline, EscrowStatePanel, DisputeEntry, PointsBalanceCard, SupportTicketList, DiagnosticReportList, NotificationPreferencePanel.
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
- support web subscription purchase, renewal, upgrade/downgrade, billing
  history, and device management
- support web C2C marketplace browsing, listing creation, order tracking,
  escrow state, and dispute entry
- support web account, support, historical diagnostics, points, ambassador,
  sponsor, and notification flows when those modules are active
- keep web subscription and App subscription backed by the same entitlement
  source of truth
- keep web C2C state backed by the same backend marketplace, payment, points,
  escrow, and risk-control state machines as the App
- do not implement VPN runtime controls on Website; those remain App-only
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
- [ ] Website users can subscribe or renew from `/billing/*`.
- [ ] Website users can add and revoke devices from `/account/devices/*`.
- [ ] Device limit reached state offers upgrade or revoke-device path.
- [ ] Web and App subscription status use the same backend entitlement state.
- [ ] Website users can browse C2C listings and track orders from `/market/*`.
- [ ] C2C order, escrow, settlement, and dispute states are represented without
      frontend-only state changes.
- [ ] Every non-VPN App user feature has a Website route or documented future
      route.
- [ ] Website does not expose fake VPN connect/disconnect or live tunnel
      controls.
- [ ] No impossible privacy claims.
- [ ] Mobile layout is complete.

Shared:

- [ ] Brand is consistent with App design.
- [ ] Accessibility and contrast are acceptable.
- [ ] Components are reusable.
- [ ] Empty/loading/error states are designed.
