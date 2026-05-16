# LiveMask Website Design

This directory stores public website design artifacts.

Primary design brief:

```text
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

Current design version:

```text
design/website/atoms/v1
```

Website auth routes that must be represented in design:

```text
/login
/register
/forgot-password
/verify-email
/auth/callback
```

Do not place public login/registration pages under `/admin/*`, `/sponsor/*`,
`/ambassador/*`, `/account/*`, or `/billing/*`.

Website account and subscription routes that must be represented in design:

```text
/account
/account/security
/account/devices
/account/devices/add
/billing
/billing/plans
/billing/checkout
/billing/success
/billing/failure
/billing/history
/market
/market/listings
/market/listings/new
/market/listings/:listing_id
/market/orders
/market/orders/:order_id
/market/wallet
/market/disputes
```

The website must support subscription purchase/renewal and device management
from the browser. These flows must use the same backend entitlement and device
limit source of truth as the App.

The website must also support the user-facing C2C marketplace from `/market/*`.
It must use the same backend marketplace, escrow, payment, points, and
risk-control state machines as the App and Backend. Internal review remains
under `/admin/ops/*` or `/admin/finance/*`.
