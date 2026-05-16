# 12 - Production Automation and SLO Rules

Production automation must be gated, observable, and rollback-ready.

- Daily development happens on `dev`; `main` is staging / pre-release only.
- Production can be triggered only by GitHub Release / `v*` tag.
- `task-unlocked` and `docs-contract-changed` are development coordination events, not deployment events.
- Staging smoke must pass before creating a production release.
- Production gates must report result to Lark and include repository, ref, actor, commit, and failure summary.
- SLO-affecting work must define success signals, alert thresholds, and rollback steps.
- If deployment scripts are placeholders, they must say so clearly and must not claim production deployment completed.

