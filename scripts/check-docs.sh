#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python3 "$ROOT/scripts/check-doc-links.py"
python3 "$ROOT/scripts/check-task-traceability.py"
python3 "$ROOT/scripts/check-ai-rule-links.py"
git -C "$ROOT" diff --check

echo "Documentation checks OK"
