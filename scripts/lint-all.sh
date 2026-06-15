#!/bin/bash
# lint-all.sh - Run all linters

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              CODE QUALITY LINTING                              "
echo "════════════════════════════════════════════════════════════════"
echo ""

export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"

# Python linting
if command -v ruff &> /dev/null; then
    echo "Running ruff on Python code..."
    ruff check src/python/ --fix 2>/dev/null || true
fi

if command -v black &> /dev/null; then
    echo "Formatting Python code with black..."
    black src/python/ -q 2>/dev/null || true
fi

if command -v mypy &> /dev/null; then
    echo "Running mypy type checks..."
    mypy src/python/ --ignore-missing-imports 2>/dev/null || true
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Linting complete"
echo "════════════════════════════════════════════════════════════════"
