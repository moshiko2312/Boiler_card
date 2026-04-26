#!/usr/bin/env python3
"""
Create a clean HACS release zip from repository sources.

Included in package:
  - custom_components/boiler_manager/**
  - hacs.json
  - README.md
"""

from __future__ import annotations

import argparse
import shutil
import sys
import zipfile
from pathlib import Path


INCLUDE_FILES = ("hacs.json", "README.md")
INCLUDE_DIRS = ("custom_components/boiler_manager",)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build HACS release package zip.")
    parser.add_argument(
        "--output",
        default="dist/boiler_manager_hacs.zip",
        help="Output zip path (default: dist/boiler_manager_hacs.zip)",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Delete output file first if it exists.",
    )
    return parser.parse_args()


def add_file(zf: zipfile.ZipFile, repo_root: Path, rel_path: str) -> None:
    full = repo_root / rel_path
    if not full.exists():
        raise FileNotFoundError(f"Required file not found: {rel_path}")
    zf.write(full, arcname=rel_path)


def add_dir_tree(zf: zipfile.ZipFile, repo_root: Path, rel_dir: str) -> None:
    root = repo_root / rel_dir
    if not root.exists():
        raise FileNotFoundError(f"Required directory not found: {rel_dir}")
    for path in sorted(root.rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(repo_root).as_posix()
        zf.write(path, arcname=rel)


def main() -> int:
    args = parse_args()
    repo_root = Path(__file__).resolve().parents[1]
    out_path = repo_root / args.output
    out_path.parent.mkdir(parents=True, exist_ok=True)

    if args.clean and out_path.exists():
        out_path.unlink()

    temp_path = out_path.with_suffix(out_path.suffix + ".tmp")
    if temp_path.exists():
        temp_path.unlink()

    try:
        with zipfile.ZipFile(temp_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
            for rel_file in INCLUDE_FILES:
                add_file(zf, repo_root, rel_file)
            for rel_dir in INCLUDE_DIRS:
                add_dir_tree(zf, repo_root, rel_dir)

        shutil.move(str(temp_path), str(out_path))
        print(f"[package] created: {out_path.relative_to(repo_root)}")
        return 0
    except Exception as exc:  # noqa: BLE001
        if temp_path.exists():
            temp_path.unlink()
        print(f"[package] failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
