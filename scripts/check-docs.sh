#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$ROOT/scripts/check-doc-links.py"
python3 "$ROOT/scripts/check-task-traceability.py"
python3 "$ROOT/scripts/check-ai-rule-links.py"
python3 "$ROOT/scripts/check-role-handoff.py"
python3 "$ROOT/scripts/check-e2e-chain.py"
python3 "$ROOT/scripts/check-role-readiness.py"
python3 "$ROOT/scripts/check-mvp-readiness.py"
python3 "$ROOT/scripts/check-future-chains.py"
test -x "$ROOT/scripts/install-repo-ai-rules.sh"
test -x "$ROOT/scripts/install-github-automation.sh"
test -f "$ROOT/.github/workflows/docs-check.yml"
test -f "$ROOT/.github/workflows/dispatch-affected-repos.yml"
test -f "$ROOT/.github/ISSUE_TEMPLATE/task.yml"
test -f "$ROOT/.github/CODEOWNERS"
git -C "$ROOT" diff --check

echo "Documentation checks OK"
