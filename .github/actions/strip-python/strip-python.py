#!/usr/bin/env python
#
# Copyright © 2023 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
"""Strip Python modules by replacing source code with byte code."""

from os import walk
from pathlib import Path
from itertools import chain
from argparse import ArgumentParser
import shlex
from typing import Iterable


parser = ArgumentParser()
parser.add_argument(
    "paths", nargs="*", default=["."], type=Path, help="Paths to include"
)
parser.add_argument("-t", "--tests", action="store_true", help="Remove test modules")
parser.add_argument(
    "-x", "--exclude", default=[], action="append", type=Path, help="Paths to exclude"
)
parser.add_argument(
    "-N",
    "--dry-run",
    action="store_true",
    help="Don't make any changes to files; just print what changes would be made",
)
parser.add_argument(
    "-v", "--verbose", action="store_true", help="Show commands executed"
)
args = parser.parse_args()

size_saved = count = 0


def shell_print(*args: Iterable[str]):
    """Echo a command properly quoated for a shell."""
    print(shlex.join(str(arg) for arg in args))


def is_relative_to(path: Path, parent: Path):
    try:
        path.relative_to(parent)
    except ValueError:
        return False
    return True


def should_include(path: Path):
    return not any(is_relative_to(path, parent) for parent in args.exclude)


for path in args.paths:
    if args.tests:
        for testdir in chain(path.glob("**/test"), path.glob("**/tests")):
            if testdir.is_dir():
                if args.verbose:
                    shell_print("rm", "-rf", testdir)
                # FIXME: use Path.walk in Python >= 3.12
                for root, dirs, files in walk(testdir, topdown=False):
                    root = Path(root)
                    for name in files:
                        testfile = root / name
                        if not args.dry_run:
                            count += 1
                            size_saved += testfile.stat().st_size
                            testfile.unlink()
                    if not args.dry_run:
                        for name in dirs:
                            (root / name).rmdir()
        for testfile in chain(path.glob("**/test_*.py"), path.glob("**/test_*.pyc")):
            if args.verbose:
                shell_print("rm", testfile)
            if not args.dry_run:
                count += 1
                size_saved += testfile.stat().st_size
                testfile.unlink()

    for pycache in path.glob("**/__pycache__"):
        if pycache.is_dir() and should_include(pycache):
            parent = pycache.parent
            rmdir = True
            for file in pycache.glob("*.pyc"):
                if should_include(file):
                    name, *_ = file.name.partition(".")
                    old_file = parent / f"{name}.py"
                    new_file = parent / f"{name}.pyc"

                    if args.verbose:
                        shell_print("rm", old_file)
                        shell_print("mv", file, new_file)
                    if not args.dry_run:
                        count += 1
                        size_saved += old_file.stat().st_size
                        old_file.unlink()
                        file.rename(new_file)
                else:
                    rmdir = False

            if rmdir:
                if args.verbose:
                    shell_print("rmdir", pycache)
                if not args.dry_run:
                    pycache.rmdir()

print("Stripped", count, "Python modules, saving", size_saved, "bytes")
