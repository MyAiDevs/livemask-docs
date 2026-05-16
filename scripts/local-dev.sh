#!/usr/bin/env bash
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "${DOCS_DIR}/.." && pwd)"
RUNTIME_SCRIPT="${ROOT_DIR}/livemask-ci-cd/scripts/runtime.sh"

command="${1:-}"
if [[ -z "${command}" ]]; then
  command="help"
else
  shift || true
fi

services="backend"
runtime_args=(--mode local)
passthrough=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --admin)
      services="backend,admin"
      shift
      ;;
    --website)
      services="backend,website"
      shift
      ;;
    --app)
      services="backend,app"
      shift
      ;;
    --nodeagent)
      services="backend,nodeagent"
      shift
      ;;
    --all)
      services="all"
      shift
      ;;
    --auto-reload|--env-file|--compose|--pull|--no-deps)
      passthrough+=("$1")
      if [[ "$1" == "--env-file" || "$1" == "--compose" ]]; then
        passthrough+=("$2")
        shift 2
      else
        shift
      fi
      ;;
    *)
      passthrough+=("$1")
      shift
      ;;
  esac
done

case "${command}" in
  start|restart)
    if [[ ${#passthrough[@]} -gt 0 ]]; then
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services "${services}" "${passthrough[@]}"
    else
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services "${services}"
    fi
    echo
    echo "Backend:   http://127.0.0.1:${LIVEMASK_BACKEND_HTTP_PORT:-18080}"
    echo "Admin:     http://127.0.0.1:${LIVEMASK_ADMIN_PORT:-3001} (when --admin/--all)"
    echo "Website:   http://127.0.0.1:${LIVEMASK_WEBSITE_PORT:-3002} (when --website/--all)"
    echo "App Web:   http://127.0.0.1:${LIVEMASK_APP_WEB_PORT:-3003} (when --app/--all)"
    echo "NodeAgent: http://127.0.0.1:${LIVEMASK_NODEAGENT_PORT:-19090} (when --nodeagent/--all)"
    ;;
  stop|status|logs|pull|help|-h|--help)
    if [[ ${#passthrough[@]} -gt 0 ]]; then
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all "${passthrough[@]}"
    else
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all
    fi
    ;;
  *)
    echo "Unknown command: ${command}" >&2
    bash "${RUNTIME_SCRIPT}" help
    exit 2
    ;;
esac
