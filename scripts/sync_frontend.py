#!/usr/bin/env python3
"""
One-way frontend sync workflow.

Source of truth:
  custom_components/boiler_manager/frontend/

Mirror target:
  www/boiler-card/
"""

from __future__ import annotations

import argparse
import filecmp
import shutil
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sync custom_components/boiler_manager/frontend -> www/boiler-card"
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Check mode only (exit 1 when drift exists).",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print unchanged files too.",
    )
    return parser.parse_args()


def iter_source_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        # Keep runtime assets/modules in sync; skip frontend local docs helper.
        if path.name == "README.md":
            continue
        files.append(path)
    return files


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parents[1]
    src_dir = repo_root / "custom_components" / "boiler_manager" / "frontend"
    dst_dir = repo_root / "www" / "boiler-card"

    if not src_dir.exists():
        print(f"[sync] source not found: {src_dir}", file=sys.stderr)
        return 2
    if not dst_dir.exists():
        print(f"[sync] destination not found: {dst_dir}", file=sys.stderr)
        return 2

    changed = 0
    for src in iter_source_files(src_dir):
        rel = src.relative_to(src_dir)
        dst = dst_dir / rel
        dst.parent.mkdir(parents=True, exist_ok=True)

        same = dst.exists() and filecmp.cmp(src, dst, shallow=False)
        if same:
            if args.verbose:
                print(f"[same] {rel}")
            continue

        changed += 1
        if args.check:
            print(f"[drift] {rel}")
            continue

        shutil.copy2(src, dst)
        print(f"[copy] {rel}")

    if args.check:
        if changed:
            print(f"[sync] drift detected in {changed} file(s).", file=sys.stderr)
            return 1
        print("[sync] mirror is in sync.")
        return 0

    print(f"[sync] completed. updated {changed} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
