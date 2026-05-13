#!/usr/bin/env python3
"""Check TASK references around TODOs and task docs."""

from __future__ import annotations

import pathlib
import re
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
TASK_RE = re.compile(r"TASK-[A-Z0-9]+(?:-[A-Z0-9]+)*")
TODO_RE = re.compile(r"\bTODO\b|待办", re.IGNORECASE)
TODO_REGISTRY = ROOT / "docs/development/LiveMask_TODO闭环登记表_v3.7.md"


def registered_todo_sources() -> set[str]:
    if not TODO_REGISTRY.exists():
        return set()
    text = TODO_REGISTRY.read_text(encoding="utf-8")
    return set(re.findall(r"`([^`]+\.md)`", text))


def main() -> int:
    failures: list[str] = []
    registered_sources = registered_todo_sources()

    task_docs = sorted((ROOT / "docs/development/tasks").glob("TASK-*.md"))
    if not task_docs:
        failures.append("docs/development/tasks has no TASK docs")

    for path in ROOT.rglob("*.md"):
        rel = path.relative_to(ROOT)
        text = path.read_text(encoding="utf-8")
        if TODO_RE.search(text) and "TASK-" not in text and str(rel) not in registered_sources:
            failures.append(f"{rel}: TODO-like text without TASK reference")

    for path in task_docs:
        text = path.read_text(encoding="utf-8")
        if not TASK_RE.search(text):
            failures.append(f"{path.relative_to(ROOT)}: missing TASK id")
        for heading in ["## 1. Background", "## 4. Cross-Repo Impact"]:
            if heading not in text and path.name != "TASK-TEMPLATE.md":
                failures.append(f"{path.relative_to(ROOT)}: missing {heading}")

    if failures:
        print("Traceability check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("Task traceability OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
