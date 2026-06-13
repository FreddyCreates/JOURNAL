#!/usr/bin/env python3
"""
Quality Gate — Production-Grade Builder Self-Verification

Checks that the builder itself meets the production-grade law.
Exit 0 = pass, Exit 1 = fail.
"""

import json
import os
import sys

BUILDER_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REQUIRED_FILES = [
    "README.md",
    "PACKET_POLICY.md",
    "profiles/registry.json",
    "schema/manifest_schema.json",
    "tools/scaffold.py",
    "tools/quality_gate.py",
]

REQUIRED_DIRS = [
    "profiles",
    "tools",
    "schema",
    "examples",
]


def check_file(name):
    path = os.path.join(BUILDER_ROOT, name)
    if not os.path.isfile(path):
        return False, f"MISSING: {name}"
    if os.path.getsize(path) == 0:
        return False, f"EMPTY: {name}"
    return True, f"OK: {name}"


def check_dir(name):
    path = os.path.join(BUILDER_ROOT, name)
    if not os.path.isdir(path):
        return False, f"MISSING DIR: {name}"
    return True, f"OK DIR: {name}"


def check_profiles():
    path = os.path.join(BUILDER_ROOT, "profiles", "registry.json")
    try:
        with open(path, "r") as f:
            data = json.load(f)
        profiles = data.get("profiles", {})
        if len(profiles) < 10:
            return False, f"profiles/registry.json has only {len(profiles)} profiles (need 10+)"
        return True, f"profiles/registry.json has {len(profiles)} profiles"
    except (json.JSONDecodeError, FileNotFoundError) as e:
        return False, f"profiles/registry.json error: {e}"


def check_schema():
    path = os.path.join(BUILDER_ROOT, "schema", "manifest_schema.json")
    try:
        with open(path, "r") as f:
            data = json.load(f)
        if "properties" not in data:
            return False, "schema/manifest_schema.json missing 'properties'"
        return True, "schema/manifest_schema.json valid"
    except (json.JSONDecodeError, FileNotFoundError) as e:
        return False, f"schema/manifest_schema.json error: {e}"


def check_scaffold_importable():
    """Verify scaffold.py has no syntax errors."""
    scaffold_path = os.path.join(BUILDER_ROOT, "tools", "scaffold.py")
    try:
        with open(scaffold_path, "r") as f:
            code = f.read()
        compile(code, scaffold_path, "exec")
        return True, "tools/scaffold.py compiles without error"
    except SyntaxError as e:
        return False, f"tools/scaffold.py syntax error: {e}"


def main():
    results = []
    passed = True

    for f in REQUIRED_FILES:
        ok, msg = check_file(f)
        results.append((ok, msg))
        if not ok:
            passed = False

    for d in REQUIRED_DIRS:
        ok, msg = check_dir(d)
        results.append((ok, msg))
        if not ok:
            passed = False

    ok, msg = check_profiles()
    results.append((ok, msg))
    if not ok:
        passed = False

    ok, msg = check_schema()
    results.append((ok, msg))
    if not ok:
        passed = False

    ok, msg = check_scaffold_importable()
    results.append((ok, msg))
    if not ok:
        passed = False

    print("=" * 50)
    print("PRODUCTION-GRADE BUILDER — QUALITY GATE")
    print("=" * 50)
    for ok, msg in results:
        status = "PASS" if ok else "FAIL"
        print(f"  [{status}] {msg}")
    print("=" * 50)

    if passed:
        print("RESULT: ALL CHECKS PASSED")
        sys.exit(0)
    else:
        print("RESULT: GATE FAILED")
        sys.exit(1)


if __name__ == "__main__":
    main()
