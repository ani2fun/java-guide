#!/usr/bin/env python3
"""Make citations clickable and open Sources links in a new tab.

For every lesson with a `## 📚 Sources` section:
  * body `<abbr title="T">[N]</abbr>`  ->  `<a href=URL target=_blank ...><abbr ...>[N]</abbr></a>`
  * Sources entry `<URL>`              ->  `<a href=URL target=_blank ...>URL</a>`

Idempotent. `--check` exits 1 if any lesson would change (writes nothing).
Run from anywhere: python3 _tooling/link_sources.py [--check]
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REL = 'target="_blank" rel="noopener noreferrer"'
HEADING = re.compile(r"^## 📚 Sources\s*$", re.M)
ENTRY = re.compile(r"^(\d+)\. (.*)$")
AUTOLINK = re.compile(r"<(https?://[^>\s]+)>\s*$")
ANCHORED = re.compile(r'<a href="(https?://[^"]+)" ' + re.escape(REL) + r">\1</a>\s*$")
CITE = re.compile(r'(?<!">)<abbr title="([^"]*)">\[(\d+)\]</abbr>')


def lessons():
    for p in sorted(ROOT.rglob("*.md")):
        parts = p.relative_to(ROOT).parts
        if any(s.startswith(("_", ".")) for s in parts) or "node_modules" in parts:
            continue
        yield p


def split_sources(text):
    m = HEADING.search(text)
    if not m:
        return None
    rest = text[m.end():]
    cut = re.search(r"^(---|<div|## )", rest, re.M)
    end = m.end() + (cut.start() if cut else len(rest))
    return m.start(), m.end(), end


def process(text):
    span = split_sources(text)
    if span is None:
        return text
    head_start, head_end, end = span
    body, heading_and_list, tail = text[:head_start], text[head_start:end], text[end:]

    urls = {}
    out_lines = []
    for line in heading_and_list.split("\n"):
        m = ENTRY.match(line)
        if m:
            n = int(m.group(1))
            a = AUTOLINK.search(line)
            if a:
                url = a.group(1)
                urls[n] = url
                line = line[: a.start()] + f'<a href="{url}" {REL}>{url}</a>'
            else:
                a = ANCHORED.search(line)
                if a:
                    urls[n] = a.group(1)
        out_lines.append(line)

    def wrap(m):
        n = int(m.group(2))
        if n not in urls:
            return m.group(0)
        return f'<a href="{urls[n]}" {REL}>{m.group(0)}</a>'

    in_fence = False
    new_body = []
    for line in body.split("\n"):
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
        new_body.append(line if in_fence else CITE.sub(wrap, line))

    return "\n".join(new_body) + "\n".join(out_lines) + tail


def main():
    check = "--check" in sys.argv
    changed = []
    for p in lessons():
        old = p.read_text(encoding="utf-8")
        new = process(old)
        if new != old:
            changed.append(p.relative_to(ROOT))
            if not check:
                p.write_text(new, encoding="utf-8")
    verb = "would change" if check else "updated"
    print(f"{verb} {len(changed)} lesson(s)")
    for c in changed:
        print("  ", c)
    return 1 if (check and changed) else 0


if __name__ == "__main__":
    sys.exit(main())
