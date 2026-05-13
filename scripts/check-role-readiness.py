#!/usr/bin/env python3
"""Check every development role has a readiness entry and README."""

from __future__ import annotations

import pathlib
import sys


ROOT = pathlib.Path(__file__).resolve().parents[1]
READINESS = ROOT / "docs/development/ROLE_READINESS_ASSESSMENT.md"
REQUIRED = {
    "Product": "docs/product/README.md",
    "App Client": "docs/app/README.md",
    "NodeAgent": "docs/nodeagent/README.md",
    "Backend / API": "docs/backend/README.md",
    "Database / Redis": "docs/data/README.md",
    "Admin / Frontend": "docs/admin/README.md",
    "Payment": "docs/payment/README.md",
    "Security": "docs/security/README.md",
    "Operations / DevOps": "docs/operations/README.md",
    "Monitoring / SRE": "docs/monitoring/README.md",
    "QA": "docs/qa/README.md",
    "Support / Business Ops": "docs/support/README.md",
}


def main() -> int:
    failures: list[str] = []

    if not READINESS.exists():
        failures.append("missing docs/development/ROLE_READINESS_ASSESSMENT.md")
        readiness_text = ""
    else:
        readiness_text = READINESS.read_text(encoding="utf-8")

    for role, rel in REQUIRED.items():
        if not (ROOT / rel).exists():
            failures.append(f"missing role README for {role}: {rel}")
        if role not in readiness_text:
            failures.append(f"readiness assessment missing role: {role}")
        if rel not in readiness_text and role not in {"Security"}:
            failures.append(f"readiness assessment missing README path for {role}: {rel}")

    if failures:
        print("Role readiness check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("Role readiness OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
