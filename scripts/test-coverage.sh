#!/bin/bash
# test-coverage.sh - Run tests with coverage reporting

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              COVERAGE ANALYSIS - ALL MODULES                   "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if pytest-cov is available
if ! python -m pytest --co -p pytest_cov &>/dev/null 2>&1; then
    echo "Installing pytest-cov..."
    pip install pytest-cov > /dev/null
fi

export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"

echo "Running tests with coverage..."
python -m pytest src/python/tests/ \
    --cov=src/python \
    --cov-report=html:coverage/html \
    --cov-report=term-missing \
    --cov-report=xml:coverage/coverage.xml \
    "$@"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Coverage report generated in coverage/html/index.html"
echo "════════════════════════════════════════════════════════════════"
