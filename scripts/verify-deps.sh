#!/bin/bash
# verify-deps.sh - Verify all dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "            DEPENDENCY VERIFICATION                             "
echo "════════════════════════════════════════════════════════════════"
echo ""

missing=0

check_cmd() {
    if command -v "$1" &> /dev/null; then
        version=$("$1" --version 2>&1 | head -1 || echo "installed")
        echo "  ✓ $1: $version"
    else
        echo "  ✗ $1: NOT FOUND"
        ((missing++))
    fi
}

echo "Python ecosystem:"
check_cmd python
check_cmd pip
check_cmd pytest

echo ""
echo "Node.js ecosystem (optional):"
check_cmd node || true
check_cmd npm || true

echo ""
echo "Language toolchains (optional):"
check_cmd julia || true
check_cmd cargo || true
check_cmd ghc || true

echo ""
echo "Docker ecosystem (optional):"
check_cmd docker || true
check_cmd docker-compose || true
check_cmd kubectl || true

echo ""
echo "════════════════════════════════════════════════════════════════"
if [ $missing -eq 0 ]; then
    echo "✓ All required dependencies are installed"
else
    echo "⚠ Missing $missing dependencies"
fi
echo "════════════════════════════════════════════════════════════════"
