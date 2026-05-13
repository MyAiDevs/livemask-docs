#!/usr/bin/env python3
"""Check role handoff documentation is wired into task and PR flows."""

from __future__ import annotations

import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
REQUIRED_FILES = [
    "docs/development/ROLE_HANDOFF_CHAINS.md",
    "docs/development/ROLE_CLOSURE_AUDIT.md",
    "docs/development/tasks/TASK-TEMPLATE.md",
    "templates/PR_DESCRIPTION_TEMPLATE.md",
]
REQUIRED_SNIPPETS = {
    "docs/development/tasks/TASK-TEMPLATE.md": [
        "## 5. Role Handoff Chain",
        "Handoff Evidence",
        "Blocker",
    ],
    "templates/PR_DESCRIPTION_TEMPLATE.md": [
        "## Role Handoff",
        "Evidence",
        "Status",
    ],
    "docs/development/ROLE_CLOSURE_AUDIT.md": [
        "ROLE_HANDOFF_CHAINS.md",
        "交接物",
        "阻断条件",
        "回流路径",
    ],
    "docs/development/RISK_REGISTER.md": [
        "RISK-HANDOFF-001",
        "受影响角色已完成交接确认",
    ],
}


def main() -> int:
    failures: list[str] = []

    for rel in REQUIRED_FILES:
        if not (ROOT / rel).exists():
            failures.append(f"missing required handoff file: {rel}")

    for rel, snippets in REQUIRED_SNIPPETS.items():
        path = ROOT / rel
        if not path.exists():
            failures.append(f"missing file for snippet check: {rel}")
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in snippets:
            if snippet not in text:
                failures.append(f"{rel}: missing snippet {snippet!r}")

    if failures:
        print("Role handoff check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("Role handoff wiring OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
