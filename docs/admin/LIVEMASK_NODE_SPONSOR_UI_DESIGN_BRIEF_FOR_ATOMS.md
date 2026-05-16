# LiveMask Node Sponsor UI Design Brief for Atoms

> This document is the dedicated Atoms design brief for Sponsor Node and
> Ambassador revenue operations. Use it before designing or implementing the
> `livemask-admin` pages that manage node sponsors, traffic contribution,
> quality scores, payout calculation, appeals, and revenue traceback.

## 1. Scope

This brief covers Admin-facing UI for:

| Area | Purpose |
| --- | --- |
| Sponsor Node overview | View sponsor contribution, node quality, traffic, and payout readiness |
| Sponsor detail | Inspect sponsor profile, active nodes, traffic trend, quality trend, and revenue history |
| Node quality and appeals | Review degraded nodes, appeal status, evidence, and quality score adjustments |
| Revenue configuration | Configure `sponsor_node_revenue_config` safely |
| Revenue calculation | Preview, run, and audit daily/weekly sponsor revenue calculation |
| Revenue traceback | Recalculate revenue after appeal, fraud review, or data correction |
| Ambassador contribution | View ambassador invite quality, tier, loyalty bonus, and commission trend |

This is not a public marketing UI. It is an operational finance and node
quality console inside the same back-office product used by Admin, Ops,
Sponsor Ambassador, Ambassador, Support, and Finance users.

Important security rule:

- These roles can share one back-office codebase and design system.
- They must not share the same URI namespace.
- System admin, operations, sponsor ambassador, ambassador, normal user, and
  subscription user surfaces must be separated by route prefix and permission
  boundary.
- UI navigation hiding is not a security boundary. Backend authz must enforce
  the same separation.

## 2. Product Goal

The UI must let an operator answer these questions in under one minute:

```text
Which sponsors are contributing healthy traffic?
Which sponsors or nodes are blocked from payout?
Why did this sponsor earn this amount?
What changed after an appeal or traceback recalculation?
Which ambassador revenue numbers are affected by user quality or C2C activity?
Can Finance approve payout safely?
```

The design must favor traceability over visual drama. Revenue screens should
feel controlled, auditable, and careful.

## 3. Primary Users

| Role | Need | Design Response |
| --- | --- | --- |
| Ops | Find unhealthy nodes and sponsor anomalies | Dense tables, filters, score badges, drill-down |
| Finance | Validate payout amount and payout readiness | Formula breakdown, status gates, export action |
| Support | Explain sponsor appeal result | Timeline, evidence, before/after score and revenue |
| Admin reviewer | Approve risky changes | Confirmation dialogs, diff view, audit trail |
| Product owner | Understand growth and quality trend | Compact charts with real metrics, not decorative charts |

## 4. Design Principles

1. **Every number needs a path back to source**
   Show formula inputs, period, source table/event, and last calculation time.

2. **Payout is gated, not casual**
   Use clear states such as `eligible`, `pending_review`, `blocked`,
   `traceback_required`, and `paid`.

3. **Quality and revenue are shown together**
   A sponsor should never see revenue without the quality score, traffic, and
   active node count that produced it.

4. **Appeal outcomes must be explainable**
   Show before/after quality score, affected period, reviewer, reason, and
   recalculation status.

5. **Config changes must be serious**
   Revenue config publish must show diff, estimated impact, required approval,
   and rollback path.

6. **Do not copy crypto exchange aesthetics**
   This is not a trading terminal. Avoid flashing numbers, candlestick visuals,
   aggressive dark-only palettes, and speculative profit language.

## 5. Navigation

Place this module under the back-office navigation, but keep route prefixes
separate by role surface.

Recommended URI boundaries:

| Surface | URI Prefix | Audience | Notes |
| --- | --- | --- | --- |
| System Admin | `/admin/system/*` | platform super admins | users, roles, global settings, security actions |
| Operations Admin | `/admin/ops/*` | operations and support | nodes, tickets, feedback, operational review |
| Finance Admin | `/admin/finance/*` | finance reviewers | payout review, revenue approval, exports |
| Sponsor Ambassador Portal | `/sponsor/*` | node sponsors / sponsor ambassadors | own nodes, own traffic, own revenue, own appeals |
| Ambassador Portal | `/ambassador/*` | promotion ambassadors | own invites, commission, C2C contribution, payout status |
| User Account Portal | `/account/*` | normal logged-in users | profile, security, devices |
| Subscription Portal | `/billing/*` | subscribed users | plan, renewal, invoice, payment status |

Do not put sponsor or ambassador self-service pages under `/admin/*`. If an
internal admin page needs to inspect a sponsor or ambassador, it should use the
admin-prefixed review route and enforce admin permissions.

Admin-side module placement:

```text
/admin/finance/revenue
  -> Sponsor Nodes
  -> Sponsor Revenue
  -> Ambassador Revenue
  -> Revenue Config
  -> Traceback Jobs
```

If the Admin sidebar is still MVP-simple, use:

```text
/admin/ops/nodes
  -> Sponsors
/admin/finance/revenue
  -> Sponsor Payouts
  -> Ambassador Commissions
```

## 6. Required Screens

### 6.1 Sponsor Node Overview

Purpose:

- scan sponsor health and payout readiness
- find sponsors with degraded quality or abnormal traffic
- jump into detail, appeals, or revenue calculation

Required table columns:

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

Required filters:

- period
- region
- payout status
- quality score range
- active node count range
- appeal status

Required states:

| State | Meaning |
| --- | --- |
| healthy | Normal quality and payout eligible |
| degraded | Quality below normal but not blocked |
| blocked | Below `min_quality_for_payout` or under review |
| traceback_required | Appeal or data correction requires recalculation |
| stale | No recent node report or calculation is old |

### 6.2 Sponsor Detail

Purpose:

- explain sponsor performance and revenue formula
- inspect nodes and operational risk

Required sections:

- identity summary: sponsor id, account, status, risk flag
- period selector
- contribution summary: traffic GB, active nodes, uptime, region spread
- quality composite score:
  - uptime score
  - network quality score
  - node count score
  - final score
- revenue formula breakdown:

```text
revenue = traffic_gb / base_gb_per_unit * quality_score * tier_bonus
```

- node table with latency, uptime, traffic, status, last report
- revenue history chart
- appeal and traceback timeline

Design requirement:

- Formula breakdown must be readable without horizontal scrolling.
- Use a compact equation row plus expandable detail drawer.
- Do not hide blocked payout reason behind a tooltip only.

### 6.3 Revenue Config

Purpose:

- configure sponsor revenue rules safely
- support form-first editing and JSON review

Config key:

```text
sponsor_node_revenue_config
```

Required editable fields:

- `base_gb_per_unit`
- `quality_weights.uptime_score`
- `quality_weights.network_quality_score`
- `quality_weights.node_count_score`
- `tier_rules`
- `min_quality_for_payout`
- `payout_cycle`
- `platform_share_rate`

Required UI:

- segmented control: Form / JSON / Impact Preview
- weight sum validation
- tier overlap validation
- min/max node range validation
- publish confirmation with expected hash
- rollback button
- before/after diff
- estimated impact on top sponsors

Validation states:

| Error | UI behavior |
| --- | --- |
| Weight sum != 1.0 | Block publish and show exact sum |
| Tier ranges overlap | Highlight conflicting rows |
| Negative value | Inline field error |
| Hash conflict | Show reload and compare action |
| Backend validation failed | Show error code and response message |

### 6.4 Revenue Calculation Jobs

Purpose:

- run or review sponsor revenue calculation for a period
- show deterministic job output and errors

Required fields:

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

Required actions:

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

### 6.5 Traceback Jobs

Purpose:

- recalculate revenue after quality appeal, fraud review, late traffic data, or
  config correction

Required flow:

```text
Select sponsor / node / ambassador
-> Select affected period
-> Choose reason
-> Preview affected records
-> Confirm recalculation
-> Review before/after result
```

Required evidence:

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
- block automatic update if payout is already settled and requires finance review

### 6.6 Ambassador Revenue Overview

Purpose:

- inspect promotion quality, loyalty bonus, C2C commission, and monthly payout

Required table columns:

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

Required detail sections:

- commission formula breakdown
- invited user quality distribution
- monthly commission trend
- C2C contribution records
- loyalty stats update history
- traceback history

Design note:

- Keep ambassador revenue visually related to Sponsor Node revenue, but do not
  mix their formulas in the same card. Use tabs or separate pages.

## 7. Components

Use these component patterns:

| Component | Use |
| --- | --- |
| Data table | Main sponsor, node, ambassador, and job lists |
| Detail drawer | Sponsor/node/ambassador quick inspection |
| Confirmation dialog | Publish config, run payout, run traceback |
| Diff viewer | Revenue config and traceback before/after |
| Stepper | Traceback recalculation flow |
| Badge | payout status, quality status, job status |
| Compact chart | trend only, not decoration |
| JSON editor | advanced config review |
| Segmented control | Form / JSON / Preview |

Avoid nested cards. Use full-width operational sections, tables, drawers, and
modals.

## 8. Metrics and Labels

Use precise labels:

| Metric | Display |
| --- | --- |
| Traffic | `GB`, one decimal when needed |
| Revenue | `U` or `USDT`, two decimals |
| Quality score | `0.00 - 1.00` plus text state |
| Uptime | percentage |
| Node count | integer |
| Period | explicit date range |
| Hash | short hash in table, full hash in detail |

Do not use vague labels such as `profit`, `score`, or `good` without context.

## 9. Error and Empty States

Required empty states:

- no sponsor nodes in selected period
- no calculation jobs yet
- no appeals or traceback records
- no ambassador activity

Required error states:

- backend unavailable
- calculation job failed
- config hash conflict
- payout already settled
- insufficient permission
- stale source data

Each error state must include a next action:

- retry
- reload source data
- open audit log
- create review task
- contact finance reviewer

## 10. Permissions and Audit

Sensitive actions must be designed as route-prefix and permission-gated:

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

Audit fields to show after actions:

- actor
- action
- target
- before / after
- reason
- request id
- created at

## 11. Atoms Prompt

Use this prompt in Atoms:

```text
Design a dense, production-ready Admin module for LiveMask named Sponsor Node
Revenue Operations.

The UI is for the same LiveMask back-office product, but different role
surfaces must use different URI prefixes. System admin uses /admin/system/*,
operations uses /admin/ops/*, finance/revenue admin uses /admin/finance/*,
sponsor ambassador self-service uses /sponsor/*, promotion ambassador
self-service uses /ambassador/*, normal user account uses /account/*, and
subscription/billing uses /billing/*. Do not mix these surfaces under the same
URI namespace. Navigation hiding is not security; every action must also be
permission-gated.

It manages sponsor node contribution, quality scores, payout readiness,
revenue configuration, calculation jobs, traceback recalculation, and
ambassador commission overview.

Style: operational SaaS admin console, compact, calm, high-trust, not a
marketing page. Avoid crypto exchange visuals, neon cyberpunk styling, and
decorative dashboards. Use tables, filters, drawers, diffs, confirmation
dialogs, compact charts, and status badges.

Required screens:
1. Sponsor Node Overview with filters, quality score, traffic, estimated
   revenue, payout status, and actions.
2. Sponsor Detail with formula breakdown:
   revenue = traffic_gb / base_gb_per_unit * quality_score * tier_bonus.
3. Revenue Config editor for sponsor_node_revenue_config with Form / JSON /
   Impact Preview modes, validation, diff, publish, rollback.
4. Revenue Calculation Jobs with dry run, run calculation, rerun failed, export,
   and audit log.
5. Traceback Jobs stepper for appeal/data/config correction recalculation,
   including before/after score and revenue delta.
6. Ambassador Revenue Overview with tier, invited active users, loyalty bonus,
   C2C commission, estimated commission, status, and detail drawer.

Use clear states: healthy, degraded, blocked, traceback_required, stale,
queued, running, completed, completed_with_warnings, failed.

Every revenue number must be traceable to source metrics and period. Sensitive
actions require confirmation and audit visibility.
```

## 12. Developer Handoff

Atoms exports should be placed under:

```text
design/admin/sponsor-node/atoms/v1/export/
```

Screenshots should be placed under:

```text
design/admin/sponsor-node/atoms/v1/screenshots/
```

Implementation target:

```text
livemask-admin
```

Related backend/domain documents:

- `docs/business/LiveMask_收益模型优化建议_v3.6.md`
- `docs/contracts/future/ambassador-revenue-traceback-chain.md`
- `docs/archive/LiveMask_流量与收益可视化体系_最终方案_v3.6.md`
- `docs/archive/LiveMask_节点申诉接口Go实现_v3.6.md`
