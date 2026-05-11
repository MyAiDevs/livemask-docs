# 02 - Closed-Loop Validation Checklist

Before finishing any implementation, verify:

- [ ] App Client side has proper feedback/retry/compensation logic
- [ ] Backend has proper request validation, error handling, and state transition
- [ ] NodeAgent (if involved) has proper degraded mode handling and reporting
- [ ] Database changes have proper indexes, constraints, and audit fields
- [ ] Cross-layer data flow is consistent and traceable via TASK-XXXX

If any item is missing, the implementation is incomplete.