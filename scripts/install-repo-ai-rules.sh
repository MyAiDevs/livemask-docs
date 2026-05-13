#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/install-repo-ai-rules.sh <target-repo-path> [repo-name]

Example:
  bash scripts/install-repo-ai-rules.sh ../livemask-backend livemask-backend

What it does:
  - Copies Cursor rules template to <target>/.cursorrules
  - Copies Copilot instructions to <target>/.github/copilot-instructions.md
  - Copies AI rule sync status template to <target>/AI_RULE_SYNC_STATUS.md
  - Copies sync-ai-rules.sh to <target>/scripts/sync-ai-rules.sh

Notes:
  - It does not overwrite existing files unless INSTALL_AI_RULES_FORCE=1.
  - It assumes livemask-docs is available as docs/ submodule or docs directory in the target repo.
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" || $# -lt 1 ]]; then
  usage
  exit 0
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$(cd "$1" && pwd)"
REPO_NAME="${2:-$(basename "$TARGET")}"
FORCE="${INSTALL_AI_RULES_FORCE:-0}"

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

copy_file "$ROOT/templates/repositories/.cursorrules.template" "$TARGET/.cursorrules"
copy_file "$ROOT/templates/repositories/.github/copilot-instructions.md.template" "$TARGET/.github/copilot-instructions.md"
copy_file "$ROOT/templates/repositories/AI_RULE_SYNC_STATUS.md" "$TARGET/AI_RULE_SYNC_STATUS.md"
copy_file "$ROOT/templates/repositories/scripts/sync-ai-rules.sh" "$TARGET/scripts/sync-ai-rules.sh"
chmod +x "$TARGET/scripts/sync-ai-rules.sh"

if [[ "$FORCE" == "1" || ! -s "$TARGET/AI_RULE_SYNC_STATUS.md" ]]; then
  :
else
  tmp="$(mktemp)"
  sed "s/^- 仓库：.*/- 仓库：$REPO_NAME/" "$TARGET/AI_RULE_SYNC_STATUS.md" > "$tmp"
  mv "$tmp" "$TARGET/AI_RULE_SYNC_STATUS.md"
fi

echo
echo "AI rule templates installed for $REPO_NAME."
echo "Next:"
echo "  1. Ensure livemask-docs is mounted at $TARGET/docs"
echo "  2. Run in target repo: bash scripts/sync-ai-rules.sh"
echo "  3. Commit .cursorrules, .github/copilot-instructions.md, AI_RULE_SYNC_STATUS.md, scripts/sync-ai-rules.sh"
