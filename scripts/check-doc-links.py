#!/usr/bin/env python3
"""Check local Markdown links."""

from __future__ import annotations

import pathlib
import re
import sys
import urllib.parse


ROOT = pathlib.Path(__file__).resolve().parents[1]
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
IGNORED_DIRS = {".git", ".local-dev", "__pycache__"}


def is_external(url: str) -> bool:
    return bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", url)) or url.startswith("mailto:")


def main() -> int:
    missing: list[tuple[pathlib.Path, str]] = []
    for path in ROOT.rglob("*.md"):
        if any(part in IGNORED_DIRS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            url = match.group(1).split("#", 1)[0].strip()
            if not url or is_external(url):
                continue
            target = (path.parent / urllib.parse.unquote(url)).resolve()
            try:
                target.relative_to(ROOT)
            except ValueError:
                continue
            if not target.exists():
                missing.append((path.relative_to(ROOT), url))

    if missing:
        print("Missing Markdown links:")
        for path, url in missing:
            print(f"- {path}: {url}")
        return 1

    print("Markdown links OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
