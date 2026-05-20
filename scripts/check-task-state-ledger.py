#!/usr/bin/env python3
"""Validate the machine-readable LiveMask task state ledger."""

from __future__ import annotations

import json
import pathlib
import re
import sys
from typing import Any


ROOT = pathlib.Path(__file__).resolve().parents[1]
LEDGER = ROOT / "docs/development/task-state-ledger.json"
TASK_RE = re.compile(r"^TASK-[A-Z0-9]+(?:-[A-Z0-9]+)*$")
SHA_RE = re.compile(r"^[0-9a-f]{7,40}$")
DONE_STATUSES = {"completed", "completed_with_skip", "deferred", "cancelled"}
OPEN_STATUSES = {
    "draft",
    "ready",
    "in_progress",
    "implemented",
    "verified",
    "partial",
    "blocked",
    "evidence_missing",
}


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def require_string(obj: dict[str, Any], key: str, context: str, failures: list[str]) -> str:
    value = obj.get(key)
    if not isinstance(value, str):
        fail(f"{context}: {key} must be a string", failures)
        return ""
    return value


def require_list(obj: dict[str, Any], key: str, context: str, failures: list[str]) -> list[Any]:
    value = obj.get(key)
    if not isinstance(value, list):
        fail(f"{context}: {key} must be a list", failures)
        return []
    return value


def validate_sha(value: str, key: str, context: str, failures: list[str]) -> None:
    if value and not SHA_RE.fullmatch(value):
        fail(f"{context}: {key} must be a 7-40 char git SHA when present", failures)


def main() -> int:
    failures: list[str] = []
    if not LEDGER.exists():
        print(f"missing {LEDGER.relative_to(ROOT)}", file=sys.stderr)
        return 1

    try:
        data = json.loads(LEDGER.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"invalid JSON in {LEDGER.relative_to(ROOT)}: {exc}", file=sys.stderr)
        return 1

    statuses = set(require_list(data, "status_values", "ledger", failures))
    repos = set(require_list(data, "repos", "ledger", failures))
    modules = require_list(data, "modules", "ledger", failures)
    seen_tasks: set[str] = set()
    referenced_tasks: list[tuple[str, str]] = []

    for module in modules:
        if not isinstance(module, dict):
            fail("module entries must be objects", failures)
            continue
        module_id = require_string(module, "module_id", "module", failures)
        context = f"module {module_id or '<missing>'}"
        overall_status = require_string(module, "overall_status", context, failures)
        owner_repo = require_string(module, "owner_repo", context, failures)
        if overall_status and overall_status not in statuses:
            fail(f"{context}: invalid overall_status {overall_status}", failures)
        if owner_repo and owner_repo not in repos:
            fail(f"{context}: owner_repo {owner_repo} is not in ledger repos", failures)
        tasks = require_list(module, "tasks", context, failures)
        if not tasks:
            fail(f"{context}: must list at least one task", failures)
        task_statuses: list[str] = []

        for task in tasks:
            if not isinstance(task, dict):
                fail(f"{context}: task entries must be objects", failures)
                continue
            task_id = require_string(task, "task_id", context, failures)
            task_context = f"{context} task {task_id or '<missing>'}"
            if task_id:
                if not TASK_RE.fullmatch(task_id):
                    fail(f"{task_context}: invalid TASK ID", failures)
                if task_id in seen_tasks:
                    fail(f"{task_context}: duplicate task_id in ledger", failures)
                seen_tasks.add(task_id)
            repo = require_string(task, "repo", task_context, failures)
            status = require_string(task, "status", task_context, failures)
            task_doc = require_string(task, "task_doc", task_context, failures)
            dev_merge_commit = require_string(task, "dev_merge_commit", task_context, failures)
            remote_dev_ref = require_string(task, "remote_dev_ref", task_context, failures)
            blocked_by = require_list(task, "blocked_by", task_context, failures)
            unlocks = require_list(task, "unlocks", task_context, failures)

            if repo and repo not in repos:
                fail(f"{task_context}: repo {repo} is not in ledger repos", failures)
            if status and status not in statuses:
                fail(f"{task_context}: invalid status {status}", failures)
            if status:
                task_statuses.append(status)
            if task_doc:
                path = ROOT / task_doc
                if not path.exists():
                    fail(f"{task_context}: task_doc does not exist: {task_doc}", failures)
                elif task_id and task_id not in path.read_text(encoding="utf-8"):
                    fail(f"{task_context}: task_doc does not mention task_id", failures)
            validate_sha(dev_merge_commit, "dev_merge_commit", task_context, failures)
            validate_sha(remote_dev_ref, "remote_dev_ref", task_context, failures)

            if status == "completed":
                if not task.get("validation"):
                    fail(f"{task_context}: completed tasks must include validation", failures)
                if repo != "livemask-docs" and (not dev_merge_commit or not remote_dev_ref):
                    fail(
                        f"{task_context}: completed runtime tasks must include dev_merge_commit "
                        "and remote_dev_ref",
                        failures,
                    )
            for dep in blocked_by + unlocks:
                if not isinstance(dep, str) or not TASK_RE.fullmatch(dep):
                    fail(f"{task_context}: dependency/unlock must be TASK ID: {dep!r}", failures)
                else:
                    referenced_tasks.append((task_context, dep))

        if overall_status == "completed":
            open_tasks = [
                status
                for status in task_statuses
                if status not in DONE_STATUSES
            ]
            if open_tasks:
                fail(
                    f"{context}: overall_status completed but module has open task statuses: "
                    + ", ".join(sorted(set(open_tasks))),
                    failures,
                )

        if overall_status in OPEN_STATUSES and task_statuses and all(
            status in DONE_STATUSES for status in task_statuses
        ):
            fail(
                f"{context}: overall_status {overall_status} but all listed tasks are closed; "
                "mark module completed or add open gaps as ready/blocked tasks",
                failures,
            )

    for context, task_id in referenced_tasks:
        if task_id not in seen_tasks:
            fail(f"{context}: references TASK not present in ledger: {task_id}", failures)

    if failures:
        print("Task state ledger check failed:")
        for item in failures:
            print(f"- {item}")
        return 1

    print("Task state ledger OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
