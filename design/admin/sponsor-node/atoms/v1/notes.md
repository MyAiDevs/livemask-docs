# Sponsor Node Revenue Operations - Design Notes v1

- Source brief: `docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md`
- Target repo: `livemask-admin`
- This is part of the same back-office product, not a new standalone frontend repo.
- Keep URI prefixes separated:
  - `/admin/finance/*` for internal finance/revenue admin.
  - `/admin/ops/*` for internal ops review.
  - `/sponsor/*` for sponsor ambassador self-service.
  - `/ambassador/*` for promotion ambassador self-service.
- Keep finance actions auditable and permission-gated.
- Avoid crypto exchange visuals and decorative dashboards.
