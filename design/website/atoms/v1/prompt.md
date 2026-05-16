# Website Atoms Prompt v1

Source brief:

```text
docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md
```

Copy the prompt from section `4.5 Website Atoms Prompt` in the source brief into
Atoms.

The generated website design must include public login and registration flows:

```text
/login
/register
/forgot-password
/verify-email
/auth/callback
```

These routes are public website auth entry pages. They must not be designed as
internal `/admin/*`, sponsor `/sponsor/*`, ambassador `/ambassador/*`, account
`/account/*`, or billing `/billing/*` pages.

The generated website design must also include logged-in user portal flows:

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

Website users must be able to subscribe to a plan, renew, upgrade/downgrade,
review billing history, add devices, revoke devices, and see device-limit
warnings from the browser. Use the same subscription and device entitlement
concepts as the App; do not design a website-only entitlement model.

Website users must also be able to browse the C2C marketplace, create listings,
view listing details, track orders, inspect escrow/settlement states, view
wallet or points balance where applicable, and open disputes. Use /market/* for
user-facing C2C pages. Internal C2C review and fraud handling belongs under
/admin/ops/* or /admin/finance/*, not /market/*.

Save generated files into:

```text
design/website/atoms/v1/export/
design/website/atoms/v1/screenshots/
```
