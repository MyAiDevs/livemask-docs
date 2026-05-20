#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$ROOT/scripts/check-doc-links.py"
python3 "$ROOT/scripts/check-task-traceability.py"
python3 "$ROOT/scripts/check-task-state-ledger.py"
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
test -f "$ROOT/docs/operations/GITHUB_ACTIONS_RUNNER_ARCHITECTURE.md"
test -f "$ROOT/docs/development/AI_PROJECT_STATUS_ONBOARDING.md"
test -f "$ROOT/docs/development/CODEX_TASK_DISPATCHER_ROLE.md"
test -f "$ROOT/docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md"
test -f "$ROOT/docs/development/task-state-ledger.json"
test -f "$ROOT/design/README.md"
test -f "$ROOT/design/app/atoms/v1/handoff.md"
test -f "$ROOT/design/admin/atoms/v1/handoff.md"
test -f "$ROOT/design/website/atoms/v1/handoff.md"
git -C "$ROOT" diff --check

echo "Documentation checks OK"
