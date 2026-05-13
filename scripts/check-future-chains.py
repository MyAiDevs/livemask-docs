#!/usr/bin/env python3
"""Check future module chain docs exist and include closure sections."""

from __future__ import annotations

import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
BASE = ROOT / "docs/architecture/future-chains"
FILES = [
    "points-economy-chain.md",
    "c2c-trading-chain.md",
    "multi-payment-chain.md",
    "admin-approval-audit-chain.md",
    "ios-networkextension-chain.md",
    "ambassador-revenue-traceback-chain.md",
]
REQUIRED_SNIPPETS = [
    "## 1.",
    "假设审计",
    "验证矩阵",
    "回滚",
]


def main() -> int:
    failures: list[str] = []
    if not (BASE / "README.md").exists():
        failures.append("missing future-chains README.md")

    for filename in FILES:
        path = BASE / filename
        if not path.exists():
            failures.append(f"missing future chain: {filename}")
            continue
        text = path.read_text(encoding="utf-8")
        for snippet in REQUIRED_SNIPPETS:
            if snippet not in text:
                failures.append(f"{filename}: missing {snippet!r}")

    root_readme = (ROOT / "README.md").read_text(encoding="utf-8")
    docs_readme = (ROOT / "docs/README.md").read_text(encoding="utf-8")
    if "future-chains/README.md" not in root_readme:
        failures.append("README.md does not link future chains")
    if "future-chains/README.md" not in docs_readme:
        failures.append("docs/README.md does not link future chains")

    if failures:
        print("Future chains check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("Future module chains OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
