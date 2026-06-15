#!/bin/bash
# cleanup.sh - Clean up temporary files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              CLEANUP                                           "
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Cleaning up temporary files..."

# Remove Python cache
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true

# Remove Python build artifacts
rm -rf build/ dist/ *.egg-info 2>/dev/null || true

# Remove coverage reports
rm -rf coverage/ .coverage 2>/dev/null || true

# Remove node_modules (optional)
# find . -type d -name node_modules -prune

echo "  ✓ Temporary files removed"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Cleanup complete"
echo "════════════════════════════════════════════════════════════════"
