#!/usr/bin/env python3
"""Validate LiveMask active task leases and detect edit collisions."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys
from typing import Any


ROOT = pathlib.Path(__file__).resolve().parents[1]
LEASES = ROOT / "docs/development/task-leases.json"
TASK_RE = re.compile(r"^TASK-[A-Z0-9]+(?:-[A-Z0-9]+)*$")
REPO_RE = re.compile(r"^livemask-(docs|backend|nodeagent|app|admin|website|job-service|ci-cd)$")
ACTIVE_STATUS = "active"
INACTIVE_STATUSES = {"ended", "expired", "abandoned"}


def parse_time(value: str, context: str, failures: list[str]) -> dt.datetime | None:
    if not value:
        return None
    normalized = value.replace("Z", "+00:00")
    try:
        parsed = dt.datetime.fromisoformat(normalized)
    except ValueError:
        failures.append(f"{context}: invalid ISO timestamp: {value}")
        return None
    if parsed.tzinfo is None:
        failures.append(f"{context}: timestamp must include timezone: {value}")
        return None
    return parsed


def normalize_path(value: str) -> str:
    cleaned = value.strip().replace("\\", "/")
    while cleaned.startswith("./"):
        cleaned = cleaned[2:]
    return cleaned.rstrip("/")


def path_overlaps(left: str, right: str) -> bool:
    left = normalize_path(left)
    right = normalize_path(right)
    if not left or not right:
        return False
    if left == "*" or right == "*":
        return True
    if left == right:
        return True
    return left.startswith(f"{right}/") or right.startswith(f"{left}/")


def load_json(path: pathlib.Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def active_leases(data: dict[str, Any], now: dt.datetime, failures: list[str]) -> list[dict[str, Any]]:
    leases = data.get("leases", [])
    if not isinstance(leases, list):
        failures.append("leases must be a list")
        return []

    active: list[dict[str, Any]] = []
    for index, lease in enumerate(leases):
        context = f"lease[{index}]"
        if not isinstance(lease, dict):
            failures.append(f"{context}: must be an object")
            continue

        task_id = lease.get("task_id", "")
        repo = lease.get("repo", "")
        branch = lease.get("branch", "")
        expected_files = lease.get("expected_files", [])
        lease_owner = lease.get("lease_owner", "")
        status = lease.get("status", "")
        started_at = parse_time(str(lease.get("started_at", "")), f"{context}.started_at", failures)
        expires_at = parse_time(str(lease.get("expires_at", "")), f"{context}.expires_at", failures)
        ended_at = parse_time(str(lease.get("ended_at", "")), f"{context}.ended_at", failures)

        if not isinstance(task_id, str) or not TASK_RE.fullmatch(task_id):
            failures.append(f"{context}: task_id must be a TASK ID")
        if not isinstance(repo, str) or not REPO_RE.fullmatch(repo):
            failures.append(f"{context}: repo must be a known livemask repo")
        if not isinstance(branch, str) or not branch:
            failures.append(f"{context}: branch is required")
        if not isinstance(lease_owner, str) or not lease_owner:
            failures.append(f"{context}: lease_owner is required")
        if status not in {ACTIVE_STATUS, *INACTIVE_STATUSES}:
            failures.append(f"{context}: invalid status {status!r}")
        if not isinstance(expected_files, list) or not expected_files:
            failures.append(f"{context}: expected_files must be a non-empty list")
        else:
            for item in expected_files:
                if not isinstance(item, str) or not normalize_path(item):
                    failures.append(f"{context}: expected_files entries must be non-empty strings")

        for key in ("depends_on", "blocked_by"):
            value = lease.get(key, [])
            if not isinstance(value, list):
                failures.append(f"{context}: {key} must be a list")
                continue
            for dep in value:
                if not isinstance(dep, str) or not TASK_RE.fullmatch(dep):
                    failures.append(f"{context}: {key} entries must be TASK IDs")

        if started_at and expires_at and expires_at <= started_at:
            failures.append(f"{context}: expires_at must be after started_at")
        if ended_at and started_at and ended_at < started_at:
            failures.append(f"{context}: ended_at must not be before started_at")
        if status in INACTIVE_STATUSES and not ended_at:
            failures.append(f"{context}: inactive leases must include ended_at")

        if status == ACTIVE_STATUS and expires_at and expires_at > now:
            active.append(lease)

    return active


def detect_collisions(active: list[dict[str, Any]], failures: list[str]) -> None:
    for left_index, left in enumerate(active):
        for right_index in range(left_index + 1, len(active)):
            right = active[right_index]
            if left.get("task_id") == right.get("task_id"):
                continue
            if left.get("repo") != right.get("repo"):
                continue
            left_files = [normalize_path(item) for item in left.get("expected_files", [])]
            right_files = [normalize_path(item) for item in right.get("expected_files", [])]
            for left_file in left_files:
                for right_file in right_files:
                    if path_overlaps(left_file, right_file):
                        failures.append(
                            "active lease collision: "
                            f"{left.get('task_id')} and {right.get('task_id')} both touch "
                            f"{left.get('repo')}:{left_file} vs {right_file}"
                        )


def validate(data: dict[str, Any], *, now: dt.datetime | None = None) -> list[str]:
    failures: list[str] = []
    now = now or dt.datetime.now(dt.timezone.utc)

    if data.get("schema_version") != 1:
        failures.append("schema_version must be 1")
    if not isinstance(data.get("updated_at"), str) or not data.get("updated_at"):
        failures.append("updated_at is required")
    status_values = data.get("status_values", [])
    if sorted(status_values) != sorted([ACTIVE_STATUS, *INACTIVE_STATUSES]):
        failures.append("status_values must contain active, ended, expired, abandoned")

    active = active_leases(data, now, failures)
    detect_collisions(active, failures)
    return failures


def sample_data(overlap: bool) -> dict[str, Any]:
    second_file = "docs/contracts/api/example.md" if not overlap else "docs/development"
    return {
        "schema_version": 1,
        "updated_at": "2026-05-21",
        "purpose": "sample",
        "status_values": ["active", "ended", "expired", "abandoned"],
        "leases": [
            {
                "task_id": "TASK-DOCS-LEASE-REGISTRY-001",
                "repo": "livemask-docs",
                "branch": "task/TASK-DOCS-LEASE-REGISTRY-001",
                "expected_files": ["docs/development/task-leases.json"],
                "lease_owner": "sample-a",
                "started_at": "2026-05-21T00:00:00Z",
                "expires_at": "2026-05-22T00:00:00Z",
                "ended_at": "",
                "depends_on": [],
                "blocked_by": [],
                "status": "active",
            },
            {
                "task_id": "TASK-DOCS-AUTO-AUDIT-CENTER-001",
                "repo": "livemask-docs",
                "branch": "task/TASK-DOCS-AUTO-AUDIT-CENTER-001",
                "expected_files": [second_file],
                "lease_owner": "sample-b",
                "started_at": "2026-05-21T00:00:00Z",
                "expires_at": "2026-05-22T00:00:00Z",
                "ended_at": "",
                "depends_on": [],
                "blocked_by": [],
                "status": "active",
            },
        ],
    }


def sample_expired_overlap() -> dict[str, Any]:
    data = sample_data(overlap=True)
    data["leases"][1]["expires_at"] = "2026-05-21T01:00:00Z"
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate task lease registry.")
    parser.add_argument("--file", default=str(LEASES), help="Lease registry JSON file.")
    parser.add_argument("--self-test", action="store_true", help="Run pass/fail collision examples.")
    args = parser.parse_args()

    if args.self_test:
        now = dt.datetime(2026, 5, 21, 12, 0, tzinfo=dt.timezone.utc)
        non_overlap = validate(sample_data(overlap=False), now=now)
        overlap = validate(sample_data(overlap=True), now=now)
        expired_overlap = validate(sample_expired_overlap(), now=now)
        if non_overlap:
            print("Non-overlap sample failed unexpectedly:")
            for item in non_overlap:
                print(f"- {item}")
            return 1
        if expired_overlap:
            print("Expired overlap sample failed unexpectedly:")
            for item in expired_overlap:
                print(f"- {item}")
            return 1
        if not any("active lease collision" in item for item in overlap):
            print("Overlap sample did not detect collision")
            return 1
        print("Task lease self-test OK")
        return 0

    path = pathlib.Path(args.file)
    if not path.is_absolute():
        path = ROOT / path
    if not path.exists():
        print(f"missing lease registry: {path}", file=sys.stderr)
        return 1
    try:
        data = load_json(path)
    except json.JSONDecodeError as exc:
        print(f"invalid JSON in {path}: {exc}", file=sys.stderr)
        return 1

    failures = validate(data)
    if failures:
        print("Task lease check failed:")
        for item in failures:
            print(f"- {item}")
        return 1
    print("Task lease check OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
