# 02 - Closed-Loop Validation Checklist

Before finishing any implementation, verify:

- [ ] App Client side has proper feedback, retry, and compensation logic
- [ ] Backend has proper request validation, error handling, idempotency, and state transition
- [ ] NodeAgent, if involved, has proper degraded mode handling and reporting
- [ ] Database changes have proper indexes, constraints, migrations, and audit fields
- [ ] Cross-layer data flow is consistent and traceable via `TASK-XXXX`
- [ ] Documentation records impact, rollback, and validation evidence

If any item is missing, the implementation is incomplete.
