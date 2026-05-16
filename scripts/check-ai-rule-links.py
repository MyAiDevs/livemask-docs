#!/usr/bin/env python3
"""Check required AI rule files exist and are linked from the summary."""

from __future__ import annotations

import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
RULE_DIR = ROOT / "ai-rules/v3.7"
SUMMARY = RULE_DIR / "MultiWindow_Development_Rules_Summary_v3.7.md"
REQUIRED = [
    "00-Core-Principles.md",
    "02-Closed-Loop-Validation.md",
    "04-Multi-Repo-Linkage.md",
    "13-Multi-Repo-Development.md",
    "14-Code-Comment-Traceability.md",
    "15-MultiWindow-Consistency-Checklist.md",
    "16-Task-Completion-Report.md",
]


def main() -> int:
    failures: list[str] = []
    summary = SUMMARY.read_text(encoding="utf-8") if SUMMARY.exists() else ""

    for filename in REQUIRED:
        if not (RULE_DIR / filename).exists():
            failures.append(f"missing ai rule: {filename}")
        if filename not in summary:
            failures.append(f"summary does not link: {filename}")

    if failures:
        print("AI rule check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("AI rule links OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
