#!/usr/bin/env python3
"""Audit the LiveMask docs-side task center.

This script is intentionally offline by default. It audits repo-native files
only, so any AI tool or CI runner can reproduce the same result without hidden
memory, GitHub credentials, or network access.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib
import re
import sys
from dataclasses import asdict, dataclass
from typing import Any


ROOT = pathlib.Path(__file__).resolve().parents[1]
LEDGER = ROOT / "docs/development/task-state-ledger.json"
DEFAULT_LOG = ROOT / ".local-dev/logs/auto-task-center.log"
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


@dataclass(frozen=True)
class Finding:
    severity: str
    rule_id: str
    message: str
    task_id: str = ""
    module_id: str = ""
    repo: str = ""
    evidence: str = ""


def rel(path: pathlib.Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def add(
    findings: list[Finding],
    severity: str,
    rule_id: str,
    message: str,
    *,
    task_id: str = "",
    module_id: str = "",
    repo: str = "",
    evidence: str = "",
) -> None:
    findings.append(
        Finding(
            severity=severity,
            rule_id=rule_id,
            message=message,
            task_id=task_id,
            module_id=module_id,
            repo=repo,
            evidence=evidence,
        )
    )


def load_ledger(gates: list[Finding]) -> dict[str, Any] | None:
    if not LEDGER.exists():
        add(
            gates,
            "gate",
            "AUDIT-GATE-LEDGER-001",
            "Task state ledger is missing.",
            evidence=rel(LEDGER),
        )
        return None
    try:
        return json.loads(LEDGER.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        add(
            gates,
            "gate",
            "AUDIT-GATE-LEDGER-002",
            "Task state ledger is not valid JSON.",
            evidence=f"{rel(LEDGER)}:{exc.lineno}:{exc.colno}",
        )
        return None


def audit_ledger(data: dict[str, Any]) -> dict[str, Any]:
    gates: list[Finding] = []
    warnings: list[Finding] = []
    suggestions: list[Finding] = []
    modules = data.get("modules", [])
    repos = set(data.get("repos", []))
    statuses = set(data.get("status_values", []))
    seen_tasks: set[str] = set()
    task_status: dict[str, str] = {}
    task_repo: dict[str, str] = {}
    dependencies: list[tuple[str, str, str]] = []
    ready_queue: list[dict[str, str]] = []

    if not isinstance(modules, list) or not modules:
        add(gates, "gate", "AUDIT-GATE-LEDGER-003", "Ledger must contain modules.")
        modules = []

    for module in modules:
        if not isinstance(module, dict):
            add(gates, "gate", "AUDIT-GATE-LEDGER-004", "Every module entry must be an object.")
            continue
        module_id = str(module.get("module_id", ""))
        overall_status = str(module.get("overall_status", ""))
        owner_repo = str(module.get("owner_repo", ""))
        tasks = module.get("tasks", [])
        open_gaps = module.get("open_gaps", [])

        if overall_status not in statuses:
            add(
                gates,
                "gate",
                "AUDIT-GATE-MODULE-001",
                "Module has an invalid overall_status.",
                module_id=module_id,
                evidence=overall_status,
            )
        if owner_repo and owner_repo not in repos:
            add(
                gates,
                "gate",
                "AUDIT-GATE-MODULE-002",
                "Module owner_repo is not listed in ledger repos.",
                module_id=module_id,
                repo=owner_repo,
            )
        if not isinstance(tasks, list) or not tasks:
            add(
                gates,
                "gate",
                "AUDIT-GATE-MODULE-003",
                "Module must contain at least one task.",
                module_id=module_id,
            )
            tasks = []

        module_task_statuses: list[str] = []
        for task in tasks:
            if not isinstance(task, dict):
                add(
                    gates,
                    "gate",
                    "AUDIT-GATE-TASK-001",
                    "Every task entry must be an object.",
                    module_id=module_id,
                )
                continue

            task_id = str(task.get("task_id", ""))
            repo = str(task.get("repo", ""))
            status = str(task.get("status", ""))
            task_doc = str(task.get("task_doc", ""))
            dev_merge_commit = str(task.get("dev_merge_commit", ""))
            remote_dev_ref = str(task.get("remote_dev_ref", ""))
            validation = str(task.get("validation", ""))
            issue = str(task.get("issue", ""))
            blocked_by = task.get("blocked_by", [])
            unlocks = task.get("unlocks", [])
            module_task_statuses.append(status)

            if not TASK_RE.fullmatch(task_id):
                add(
                    gates,
                    "gate",
                    "AUDIT-GATE-TASK-002",
                    "Task ID is invalid.",
                    task_id=task_id,
                    module_id=module_id,
                )
            elif task_id in seen_tasks:
                add(
                    gates,
                    "gate",
                    "AUDIT-GATE-TASK-003",
                    "Task ID is duplicated in ledger.",
                    task_id=task_id,
                    module_id=module_id,
                )
            else:
                seen_tasks.add(task_id)
                task_status[task_id] = status
                task_repo[task_id] = repo

            if repo not in repos:
                add(
                    gates,
                    "gate",
                    "AUDIT-GATE-TASK-004",
                    "Task repo is not listed in ledger repos.",
                    task_id=task_id,
                    module_id=module_id,
                    repo=repo,
                )
            if status not in statuses:
                add(
                    gates,
                    "gate",
                    "AUDIT-GATE-TASK-005",
                    "Task status is not listed in ledger status_values.",
                    task_id=task_id,
                    module_id=module_id,
                    evidence=status,
                )

            if task_doc:
                path = ROOT / task_doc
                if not path.exists():
                    add(
                        gates,
                        "gate",
                        "AUDIT-GATE-TASK-006",
                        "Task doc path does not exist.",
                        task_id=task_id,
                        module_id=module_id,
                        evidence=task_doc,
                    )
                else:
                    text = path.read_text(encoding="utf-8")
                    if task_id and task_id not in text:
                        add(
                            gates,
                            "gate",
                            "AUDIT-GATE-TASK-007",
                            "Task doc does not mention its TASK ID.",
                            task_id=task_id,
                            module_id=module_id,
                            evidence=task_doc,
                        )

            for key, value in (
                ("dev_merge_commit", dev_merge_commit),
                ("remote_dev_ref", remote_dev_ref),
            ):
                if value and not SHA_RE.fullmatch(value):
                    add(
                        gates,
                        "gate",
                        "AUDIT-GATE-TASK-008",
                        f"{key} must be a 7-40 char git SHA when present.",
                        task_id=task_id,
                        module_id=module_id,
                        evidence=value,
                    )

            if status == "completed":
                if not validation:
                    add(
                        gates,
                        "gate",
                        "AUDIT-GATE-COMPLETE-001",
                        "Completed task is missing validation evidence.",
                        task_id=task_id,
                        module_id=module_id,
                        repo=repo,
                    )
                if repo != "livemask-docs":
                    if not dev_merge_commit or not remote_dev_ref:
                        add(
                            gates,
                            "gate",
                            "AUDIT-GATE-COMPLETE-002",
                            "Completed runtime task is missing dev merge or remote dev evidence.",
                            task_id=task_id,
                            module_id=module_id,
                            repo=repo,
                        )
                    elif dev_merge_commit != remote_dev_ref:
                        add(
                            gates,
                            "gate",
                            "AUDIT-GATE-COMPLETE-003",
                            "Completed runtime task dev merge commit does not match remote dev ref.",
                            task_id=task_id,
                            module_id=module_id,
                            repo=repo,
                            evidence=f"{dev_merge_commit} != {remote_dev_ref}",
                        )

            if status in {"ready", "in_progress"}:
                ready_queue.append(
                    {
                        "task_id": task_id,
                        "repo": repo,
                        "status": status,
                        "module_id": module_id,
                    }
                )
            if status == "ready" and not blocked_by:
                add(
                    suggestions,
                    "suggestion",
                    "AUDIT-SUGGEST-DISPATCH-001",
                    "Ready task has no blockers and can be considered for dispatch.",
                    task_id=task_id,
                    module_id=module_id,
                    repo=repo,
                )
            if status in {"blocked", "evidence_missing"}:
                add(
                    warnings,
                    "warning",
                    "AUDIT-WARN-OPEN-001",
                    f"Task remains {status}; dispatcher should keep it out of completed summaries.",
                    task_id=task_id,
                    module_id=module_id,
                    repo=repo,
                )
            if not issue:
                add(
                    warnings,
                    "warning",
                    "AUDIT-WARN-ISSUE-001",
                    "Task has no Issue reference in ledger.",
                    task_id=task_id,
                    module_id=module_id,
                    repo=repo,
                )

            for dep in blocked_by:
                if isinstance(dep, str):
                    dependencies.append((task_id, "blocked_by", dep))
            for dep in unlocks:
                if isinstance(dep, str):
                    dependencies.append((task_id, "unlocks", dep))

        if overall_status == "completed":
            open_statuses = sorted({s for s in module_task_statuses if s not in DONE_STATUSES})
            if open_statuses:
                add(
                    gates,
                    "gate",
                    "AUDIT-GATE-MODULE-004",
                    "Module is completed but still contains open task statuses.",
                    module_id=module_id,
                    evidence=", ".join(open_statuses),
                )
        if overall_status in OPEN_STATUSES and module_task_statuses and all(
            status in DONE_STATUSES for status in module_task_statuses
        ):
            add(
                gates,
                "gate",
                "AUDIT-GATE-MODULE-005",
                "Module is open but all listed tasks are closed.",
                module_id=module_id,
            )
        if overall_status in OPEN_STATUSES and isinstance(open_gaps, list):
            for gap in open_gaps:
                add(
                    suggestions,
                    "suggestion",
                    "AUDIT-SUGGEST-GAP-001",
                    str(gap),
                    module_id=module_id,
                )

    for source_task, dep_type, target_task in dependencies:
        if not TASK_RE.fullmatch(target_task):
            add(
                gates,
                "gate",
                "AUDIT-GATE-DEPENDENCY-001",
                f"{dep_type} entry is not a TASK ID.",
                task_id=source_task,
                evidence=target_task,
            )
            continue
        if target_task not in seen_tasks:
            add(
                gates,
                "gate",
                "AUDIT-GATE-DEPENDENCY-002",
                f"{dep_type} references a task that is not present in ledger.",
                task_id=source_task,
                evidence=target_task,
            )

    return {
        "schema_version": 1,
        "audit_scope": "repo-native-offline",
        "summary": {
            "gate_count": len(gates),
            "warning_count": len(warnings),
            "suggestion_count": len(suggestions),
            "task_count": len(seen_tasks),
            "module_count": len(modules),
        },
        "gates": [asdict(item) for item in gates],
        "warnings": [asdict(item) for item in warnings],
        "suggestions": [asdict(item) for item in suggestions],
        "next_task_queue": sorted(ready_queue, key=lambda item: (item["status"], item["module_id"], item["task_id"])),
    }


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def write_audit_log(report: dict[str, Any], *, log_file: pathlib.Path, argv: list[str], exit_code: int) -> None:
    log_file.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "logged_at": utc_now(),
        "tool": "audit-task-center",
        "argv": argv,
        "cwd": str(pathlib.Path.cwd()),
        "exit_code": exit_code,
        "summary": report.get("summary", {}),
        "report": report,
    }
    with log_file.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(entry, ensure_ascii=False, sort_keys=True))
        handle.write("\n")


def render_text(report: dict[str, Any], *, verbose: bool = False) -> str:
    summary = report["summary"]
    lines = [
        "Auto audit center report",
        f"- scope: {report['audit_scope']}",
        f"- generated_at: {report['generated_at']}",
        f"- log_file: {report['log_file']}",
        f"- modules: {summary['module_count']}",
        f"- tasks: {summary['task_count']}",
        f"- gates: {summary['gate_count']}",
        f"- warnings: {summary['warning_count']}",
        f"- suggestions: {summary['suggestion_count']}",
    ]

    for key, title in (("gates", "Gate Findings"),):
        findings = report[key]
        if not findings:
            continue
        lines.append("")
        lines.append(title)
        for item in findings:
            subject = item.get("task_id") or item.get("module_id") or "ledger"
            evidence = f" [{item['evidence']}]" if item.get("evidence") else ""
            lines.append(f"- {item['rule_id']} {subject}: {item['message']}{evidence}")

    for key, title in (
        ("warnings", "Warnings"),
        ("suggestions", "Suggestions"),
    ):
        findings = report[key]
        if not findings:
            continue
        lines.append("")
        lines.append(title)
        if not verbose:
            by_rule: dict[str, int] = {}
            for item in findings:
                by_rule[item["rule_id"]] = by_rule.get(item["rule_id"], 0) + 1
            for rule_id, count in sorted(by_rule.items()):
                lines.append(f"- {rule_id}: {count}")
            lines.append(f"- run with --verbose or --format json for full {key}")
            continue
        for item in findings:
            subject = item.get("task_id") or item.get("module_id") or "ledger"
            evidence = f" [{item['evidence']}]" if item.get("evidence") else ""
            lines.append(f"- {item['rule_id']} {subject}: {item['message']}{evidence}")

    queue = report.get("next_task_queue", [])
    if queue:
        lines.append("")
        lines.append("Next Task Queue")
        for item in queue:
            lines.append(f"- {item['status']} {item['task_id']} ({item['repo']}, {item['module_id']})")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit LiveMask task center state.")
    parser.add_argument("--format", choices=("text", "json"), default="text")
    parser.add_argument(
        "--log-file",
        default=str(DEFAULT_LOG.relative_to(ROOT)),
        help="Append audit records to this JSONL log file. Defaults to .local-dev/logs/auto-task-center.log.",
    )
    parser.add_argument("--no-log", action="store_true", help="Do not append an audit record.")
    parser.add_argument("--verbose", action="store_true", help="Show full warning and suggestion details in text output.")
    args = parser.parse_args()

    initial_gates: list[Finding] = []
    data = load_ledger(initial_gates)
    if data is None:
        report = {
            "schema_version": 1,
            "audit_scope": "repo-native-offline",
            "summary": {
                "gate_count": len(initial_gates),
                "warning_count": 0,
                "suggestion_count": 0,
                "task_count": 0,
                "module_count": 0,
            },
            "gates": [asdict(item) for item in initial_gates],
            "warnings": [],
            "suggestions": [],
            "next_task_queue": [],
        }
    else:
        report = audit_ledger(data)

    log_file = pathlib.Path(args.log_file)
    if not log_file.is_absolute():
        log_file = ROOT / log_file
    exit_code = 1 if report["summary"]["gate_count"] else 0
    report["generated_at"] = utc_now()
    report["log_file"] = rel(log_file)

    if not args.no_log:
        try:
            write_audit_log(report, log_file=log_file, argv=sys.argv[1:], exit_code=exit_code)
        except OSError as exc:
            print(f"failed to write audit log {rel(log_file)}: {exc}", file=sys.stderr)
            return 1

    if args.format == "json":
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        print(render_text(report, verbose=args.verbose))

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
