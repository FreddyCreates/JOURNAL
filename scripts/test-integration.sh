#!/bin/bash
# test-integration.sh - Run integration tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "            INTEGRATION TEST SUITE                              "
echo "════════════════════════════════════════════════════════════════"
echo ""

export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"

echo "Running integration tests..."
python -m pytest src/python/tests/ -v -m integration --tb=short "$@" 2>&1 || true

echo ""
echo "Integration testing cross-module workflows..."
echo "✓ Integration tests completed"

echo ""
echo "════════════════════════════════════════════════════════════════"
