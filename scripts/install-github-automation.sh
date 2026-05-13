#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/install-github-automation.sh <target-repo-path> <repo-kind>

repo-kind:
  backend    -> installs Backend CI
  nodeagent  -> installs NodeAgent CI
  frontend   -> installs Frontend CI (admin / website / app if npm-based)
  ci-cd      -> installs staging smoke workflow
  generic    -> installs PR template and CODEOWNERS only

Examples:
  bash scripts/install-github-automation.sh ../livemask-backend backend
  bash scripts/install-github-automation.sh ../livemask-nodeagent nodeagent
  bash scripts/install-github-automation.sh ../livemask-admin frontend
  bash scripts/install-github-automation.sh ../livemask-website frontend
  bash scripts/install-github-automation.sh ../livemask-ci-cd ci-cd

Notes:
  - Existing files are not overwritten unless INSTALL_GITHUB_AUTOMATION_FORCE=1.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 2 ]]; then
  usage
  exit 0
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$(cd "$1" && pwd)"
KIND="$2"
FORCE="${INSTALL_GITHUB_AUTOMATION_FORCE:-0}"
TEMPLATE_ROOT="$ROOT/templates/github/child-repos"

copy_file() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  if [[ -e "$dst" && "$FORCE" != "1" ]]; then
    echo "skip existing: $dst"
    return
  fi
  cp "$src" "$dst"
  echo "installed: $dst"
}

copy_file "$TEMPLATE_ROOT/pull_request_template.md" "$TARGET/.github/pull_request_template.md"
copy_file "$TEMPLATE_ROOT/CODEOWNERS" "$TARGET/.github/CODEOWNERS"

case "$KIND" in
  backend)
    copy_file "$TEMPLATE_ROOT/workflows/backend-ci.yml" "$TARGET/.github/workflows/backend-ci.yml"
    ;;
  nodeagent)
    copy_file "$TEMPLATE_ROOT/workflows/nodeagent-ci.yml" "$TARGET/.github/workflows/nodeagent-ci.yml"
    ;;
  frontend)
    copy_file "$TEMPLATE_ROOT/workflows/frontend-ci.yml" "$TARGET/.github/workflows/frontend-ci.yml"
    ;;
  ci-cd)
    copy_file "$TEMPLATE_ROOT/workflows/ci-cd-staging-smoke.yml" "$TARGET/.github/workflows/staging-smoke.yml"
    ;;
  generic)
    ;;
  *)
    echo "Unknown repo-kind: $KIND" >&2
    usage
    exit 1
    ;;
esac

echo "GitHub automation templates installed in $TARGET"
