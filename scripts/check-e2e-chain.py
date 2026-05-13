#!/usr/bin/env python3
"""Check App -> NodeAgent -> API -> DB/Redis chain docs are wired."""

from __future__ import annotations

import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
CHAIN_DOC = ROOT / "docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md"
CONSISTENCY_DOC = ROOT / "docs/contracts/data-consistency.md"

REQUIRED_CHAIN_SNIPPETS = [
    "App Client",
    "NodeAgent",
    "Backend API",
    "PostgreSQL",
    "Redis",
    "H1",
    "H7",
    "DB 成功 Redis 失败",
    "Pub/Sub 丢失",
]

REQUIRED_CONSISTENCY_SNIPPETS = [
    "PostgreSQL 是业务事实源",
    "Redis 是实时状态",
    "DB First",
    "Redis First with TTL",
    "Outbox Pattern",
    "幂等键",
]


def check_file(path: pathlib.Path, snippets: list[str]) -> list[str]:
    failures: list[str] = []
    if not path.exists():
        return [f"missing {path.relative_to(ROOT)}"]
    text = path.read_text(encoding="utf-8")
    for snippet in snippets:
        if snippet not in text:
            failures.append(f"{path.relative_to(ROOT)} missing {snippet!r}")
    return failures


def main() -> int:
    failures = []
    failures.extend(check_file(CHAIN_DOC, REQUIRED_CHAIN_SNIPPETS))
    failures.extend(check_file(CONSISTENCY_DOC, REQUIRED_CONSISTENCY_SNIPPETS))

    docs_readme = (ROOT / "docs/README.md").read_text(encoding="utf-8")
    root_readme = (ROOT / "README.md").read_text(encoding="utf-8")
    contracts_readme = (ROOT / "docs/contracts/README.md").read_text(encoding="utf-8")

    if "APP_NODEAGENT_API_DB_REDIS_CHAIN.md" not in docs_readme:
        failures.append("docs/README.md does not mention E2E chain doc")
    if "APP_NODEAGENT_API_DB_REDIS_CHAIN.md" not in root_readme:
        failures.append("README.md does not mention E2E chain doc")
    if "data-consistency.md" not in contracts_readme:
        failures.append("contracts README does not mention data consistency contract")

    if failures:
        print("E2E chain check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("E2E chain wiring OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
