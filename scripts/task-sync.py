#!/usr/bin/env python3
"""Synchronize a LiveMask TASK issue and dispatch unlocked repositories."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request


TASK_RE = re.compile(r"TASK-[A-Z0-9]+(?:-[A-Z0-9]+)*")
VALID_RESULTS = {"completed", "partial", "blocked"}
DOCS_REPO = "livemask-docs"
REPO_ALLOWLIST = {
    "livemask-docs",
    "livemask-backend",
    "livemask-nodeagent",
    "livemask-app",
    "livemask-admin",
    "livemask-website",
    "livemask-ci-cd",
}


def split_csv(value: str) -> list[str]:
    if not value:
        return []
    repos = [item.strip() for item in value.split(",") if item.strip()]
    invalid = [repo for repo in repos if repo not in REPO_ALLOWLIST]
    if invalid:
        raise ValueError(f"invalid repositories: {', '.join(invalid)}")
    return repos


class GitHub:
    def __init__(self, token: str, owner: str = "MyAiDevs") -> None:
        if not token:
            raise ValueError("GITHUB_TOKEN or LIVEMASK_BOT_TOKEN is required")
        self.token = token
        self.owner = owner

    def request(self, method: str, path: str, payload: dict | None = None) -> dict | list | None:
        url = path if path.startswith("https://") else f"https://api.github.com{path}"
        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
                "User-Agent": "livemask-task-sync",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                body = resp.read().decode("utf-8")
                if not body:
                    return None
                return json.loads(body)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"GitHub API {method} {url} failed: HTTP {exc.code} {body}") from exc

    def find_task_issue(self, task_id: str) -> int:
        query = urllib.parse.quote(f"repo:{self.owner}/livemask-docs is:issue in:title,body {task_id}")
        result = self.request("GET", f"/search/issues?q={query}")
        if not isinstance(result, dict):
            raise RuntimeError("unexpected GitHub search response")
        items = result.get("items", [])
        if not items:
            raise RuntimeError(f"no TASK issue found for {task_id}; create it in livemask-docs first")
        return int(items[0]["number"])

    def comment_issue(self, issue_number: int, body: str) -> None:
        self.request(
            "POST",
            f"/repos/{self.owner}/livemask-docs/issues/{issue_number}/comments",
            {"body": body},
        )

    def dispatch_repo(self, repo: str, event_type: str, payload: dict) -> None:
        self.request(
            "POST",
            f"/repos/{self.owner}/{repo}/dispatches",
            {"event_type": event_type, "client_payload": payload},
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--task-id", required=True)
    parser.add_argument("--result", required=True, choices=sorted(VALID_RESULTS))
    parser.add_argument("--summary", required=True)
    parser.add_argument("--verification", default="")
    parser.add_argument("--unlocked-repos", default="")
    parser.add_argument("--blocked-repos", default="")
    parser.add_argument("--next-steps", default="")
    parser.add_argument("--source", default="workflow_dispatch")
    parser.add_argument("--run-id", default=os.getenv("GITHUB_RUN_ID", ""))
    parser.add_argument("--sha", default=os.getenv("GITHUB_SHA", ""))
    return parser.parse_args()


def markdown_list(items: list[str]) -> str:
    if not items:
        return "- None"
    return "\n".join(f"- {item}" for item in items)


def build_comment(args: argparse.Namespace, unlocked: list[str], blocked: list[str]) -> str:
    return f"""## AI Task Sync

**TASK ID**: {args.task_id}
**Result**: {args.result}
**Source**: {args.source}
**Run ID**: {args.run_id or "N/A"}
**Commit**: {args.sha[:12] if args.sha else "N/A"}

### Summary
{args.summary}

### Verification
{args.verification or "Not provided"}

### Unlocked Repositories
{markdown_list(unlocked)}

### Blocked Repositories
{markdown_list(blocked)}

### Next Steps
{args.next_steps or "Not provided"}
"""


def child_dispatch_targets(unlocked: list[str]) -> list[str]:
    return [repo for repo in unlocked if repo != DOCS_REPO]


def require_bot_token_for_dispatch(targets: list[str]) -> str:
    bot_token = os.getenv("LIVEMASK_BOT_TOKEN", "")
    if targets and not bot_token:
        target_list = ", ".join(targets)
        raise RuntimeError(
            "LIVEMASK_BOT_TOKEN is required before syncing unlocked child repositories "
            f"({target_list}). The default GITHUB_TOKEN cannot create repository_dispatch "
            "events in other repositories. Configure the secret first, then rerun task sync."
        )
    return bot_token


def write_github_output(values: dict[str, str]) -> None:
    output_path = os.getenv("GITHUB_OUTPUT")
    if not output_path:
        return
    with open(output_path, "a", encoding="utf-8") as fh:
        for key, value in values.items():
            if "\n" in value:
                fh.write(f"{key}<<EOF\n{value}\nEOF\n")
            else:
                fh.write(f"{key}={value}\n")


def main() -> int:
    args = parse_args()
    task_match = TASK_RE.fullmatch(args.task_id)
    if not task_match:
        print(f"invalid task id: {args.task_id}", file=sys.stderr)
        return 2

    try:
        unlocked = split_csv(args.unlocked_repos)
        blocked = split_csv(args.blocked_repos)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    dispatch_targets = child_dispatch_targets(unlocked)
    try:
        bot_token = require_bot_token_for_dispatch(dispatch_targets)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    token = bot_token or os.getenv("GITHUB_TOKEN", "")
    gh = GitHub(token)

    issue_number = gh.find_task_issue(args.task_id)
    comment = build_comment(args, unlocked, blocked)
    gh.comment_issue(issue_number, comment)

    payload = {
        "task_id": args.task_id,
        "result": args.result,
        "source_repo": "livemask-docs",
        "target_branch": "dev",
        "source_run_id": args.run_id,
        "summary": args.summary,
        "verification": args.verification,
        "next_steps": args.next_steps,
    }
    for repo in dispatch_targets:
        gh.dispatch_repo(repo, "task-unlocked", payload)

    report_tasks = (
        f"TASK: {args.task_id}\n"
        f"Result: {args.result}\n"
        f"Unlocked: {', '.join(unlocked) if unlocked else 'None'}\n"
        f"Blocked: {', '.join(blocked) if blocked else 'None'}"
    )
    write_github_output(
        {
            "issue_number": str(issue_number),
            "report_title": f"LiveMask Task Sync: {args.task_id} {args.result}",
            "report_summary": args.summary,
            "report_tasks": report_tasks,
            "report_risks": f"Blocked repos: {', '.join(blocked) if blocked else 'None'}",
            "report_next_steps": args.next_steps or "Not provided",
        }
    )

    print(f"Synced {args.task_id} to issue #{issue_number}")
    if dispatch_targets:
        print(f"Dispatched task-unlocked to: {', '.join(dispatch_targets)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
