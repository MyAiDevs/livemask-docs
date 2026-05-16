#!/usr/bin/env bash
set -euo pipefail

repos=(
  livemask-docs
  livemask-backend
  livemask-nodeagent
  livemask-app
  livemask-admin
  livemask-website
  livemask-ci-cd
)

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

for repo in "${repos[@]}"; do
  repo_dir="${root_dir}/${repo}"
  if [[ ! -d "${repo_dir}/.git" ]]; then
    echo "skip ${repo}: not cloned at ${repo_dir}"
    continue
  fi

  echo "== ${repo} =="
  git -C "${repo_dir}" fetch origin main dev || git -C "${repo_dir}" fetch origin main
  if git -C "${repo_dir}" show-ref --verify --quiet refs/heads/dev; then
    git -C "${repo_dir}" checkout dev
  elif git -C "${repo_dir}" show-ref --verify --quiet refs/remotes/origin/dev; then
    git -C "${repo_dir}" checkout -b dev origin/dev
  else
    git -C "${repo_dir}" checkout -b dev origin/main
    git -C "${repo_dir}" push -u origin dev
  fi
  git -C "${repo_dir}" pull --ff-only origin dev
done
