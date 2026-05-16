#!/usr/bin/env bash
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "${DOCS_DIR}/.." && pwd)"
RUNTIME_SCRIPT="${ROOT_DIR}/livemask-ci-cd/scripts/runtime.sh"
APP_SCRIPT="${ROOT_DIR}/livemask-app/scripts/local-app.sh"

command="${1:-}"
if [[ -z "${command}" ]]; then
  command="help"
else
  shift || true
fi

services="backend"
runtime_args=(--mode local)
passthrough=()
run_app=false
app_target="macos"

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
      services="backend"
      run_app=true
      app_target="macos"
      shift
      ;;
    --app-web)
      services="backend"
      run_app=true
      app_target="web"
      shift
      ;;
    --nodeagent)
      services="backend,nodeagent"
      shift
      ;;
    --all)
      services="backend,admin,website,nodeagent"
      run_app=true
      app_target="macos"
      shift
      ;;
    --app-target)
      run_app=true
      app_target="$2"
      shift 2
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
    if [[ "${run_app}" == "true" ]]; then
      if [[ ! -x "${APP_SCRIPT}" ]]; then
        chmod +x "${APP_SCRIPT}" 2>/dev/null || true
      fi
      bash "${APP_SCRIPT}" "${command}" --target "${app_target}"
    fi
    echo
    echo "Backend:   http://127.0.0.1:${LIVEMASK_BACKEND_HTTP_PORT:-18080}"
    echo "Admin:     http://127.0.0.1:${LIVEMASK_ADMIN_PORT:-3001} (when --admin/--all)"
    echo "Website:   http://127.0.0.1:${LIVEMASK_WEBSITE_PORT:-3002} (when --website/--all)"
    echo "App macOS: local Flutter process (when --app/--all)"
    echo "App Web:   http://127.0.0.1:${LIVEMASK_APP_WEB_PORT:-3003} (when --app-web or --app-target web)"
    echo "NodeAgent: http://127.0.0.1:${LIVEMASK_NODEAGENT_PORT:-19090} (when --nodeagent/--all)"
    ;;
  stop)
    bash "${APP_SCRIPT}" stop --target macos 2>/dev/null || true
    bash "${APP_SCRIPT}" stop --target web 2>/dev/null || true
    if [[ ${#passthrough[@]} -gt 0 ]]; then
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all "${passthrough[@]}"
    else
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all
    fi
    ;;
  status)
    if [[ ${#passthrough[@]} -gt 0 ]]; then
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all "${passthrough[@]}"
    else
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all
    fi
    echo
    echo "App local process:"
    bash "${APP_SCRIPT}" status 2>/dev/null || echo "app local status unavailable"
    ;;
  logs)
    if [[ "${run_app}" == "true" ]]; then
      bash "${APP_SCRIPT}" logs --target "${app_target}"
    elif [[ ${#passthrough[@]} -gt 0 ]]; then
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all "${passthrough[@]}"
    else
      bash "${RUNTIME_SCRIPT}" "${command}" "${runtime_args[@]}" --services all
    fi
    ;;
  pull|help|-h|--help)
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
