#!/usr/bin/env python3
"""
Quality Gate — Production-Grade Packet Verification

Checks that this deliverable meets the production-grade law.
Exit 0 = pass, Exit 1 = fail.
"""

import json
import os
import sys

PACKET_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REQUIRED_FILES = [
    "README.md",
    "PACKET_POLICY.md",
    "manifest.json",
    "release_manifest.json",
]

REQUIRED_DIRS = [
    "tools",
    "reports",
]


def check_file(name):
    path = os.path.join(PACKET_ROOT, name)
    if not os.path.isfile(path):
        return False, f"MISSING: {name}"
    if os.path.getsize(path) == 0:
        return False, f"EMPTY: {name}"
    return True, f"OK: {name}"


def check_dir(name):
    path = os.path.join(PACKET_ROOT, name)
    if not os.path.isdir(path):
        return False, f"MISSING DIR: {name}"
    return True, f"OK DIR: {name}"


def check_manifest():
    path = os.path.join(PACKET_ROOT, "manifest.json")
    try:
        with open(path, "r") as f:
            data = json.load(f)
        for key in ("name", "version", "kind", "created_at"):
            if key not in data:
                return False, f"manifest.json missing key: {key}"
        return True, "manifest.json valid"
    except (json.JSONDecodeError, FileNotFoundError) as e:
        return False, f"manifest.json error: {e}"


def check_reports():
    reports_dir = os.path.join(PACKET_ROOT, "reports")
    if not os.path.isdir(reports_dir):
        return False, "reports/ directory missing"
    files = os.listdir(reports_dir)
    if not files:
        return False, "reports/ directory is empty"
    return True, f"reports/ contains {len(files)} file(s)"


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

    ok, msg = check_manifest()
    results.append((ok, msg))
    if not ok:
        passed = False

    ok, msg = check_reports()
    results.append((ok, msg))
    if not ok:
        passed = False

    print("=" * 50)
    print("QUALITY GATE RESULTS")
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
