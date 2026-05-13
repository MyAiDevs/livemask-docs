#!/usr/bin/env python3
"""Check MVP implementation docs and real contracts exist."""

from __future__ import annotations

import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "docs/development/MVP_IMPLEMENTATION_PLAN.md",
    "docs/contracts/api/core-mvp.md",
    "docs/contracts/config/core-configs.md",
    "docs/contracts/events/core-events.md",
    "docs/data/redis-key-registry.md",
    "docs/data/DB_MIGRATION_PLAN.md",
    "docs/data/outbox-compensation.md",
    "docs/qa/P0_VALIDATION_MATRIX.md",
    "docs/operations/RELEASE_RUNBOOK.md",
    "docs/monitoring/ALERT_DASHBOARD_INDEX.md",
]

REQUIRED_TASKS = [
    "TASK-P0-03-config-center.md",
    "TASK-P1-01-usdt-payment.md",
    "TASK-P1-05-config-hot-reload.md",
    "TASK-P2-05-node-recommendation.md",
    "TASK-P3-01-connection-quality-report.md",
    "TASK-P3-02-quick-feedback.md",
    "TASK-P5-03-monitoring-alerting.md",
    "TASK-P5-04-deploy-runbook.md",
]

REQUIRED_SNIPPETS = {
    "docs/contracts/api/core-mvp.md": [
        "/api/v1/client/nodes/recommend",
        "/internal/agent/report",
        "/api/v1/payments/usdt/orders",
    ],
    "docs/contracts/config/core-configs.md": [
        "client.remote_config",
        "nodeagent.runtime_config",
        "payment.usdt_nowpayments",
    ],
    "docs/data/redis-key-registry.md": [
        "node:realtime:{node_id}",
        "outbox:stream:{domain}",
    ],
    "docs/operations/RELEASE_RUNBOOK.md": [
        "发布前检查",
        "回滚步骤",
    ],
}


def main() -> int:
    failures: list[str] = []

    for rel in REQUIRED_FILES:
        if not (ROOT / rel).exists():
            failures.append(f"missing MVP doc: {rel}")

    for name in REQUIRED_TASKS:
        if not (ROOT / "docs/development/tasks" / name).exists():
            failures.append(f"missing MVP task: {name}")

    for rel, snippets in REQUIRED_SNIPPETS.items():
        path = ROOT / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in snippets:
            if snippet not in text:
                failures.append(f"{rel}: missing snippet {snippet!r}")

    if failures:
        print("MVP readiness check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("MVP readiness OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
