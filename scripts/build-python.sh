#!/bin/bash
# build-python.sh - Build Python package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                   PYTHON BUILD                                 "
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Installing Python dependencies..."
pip install -e "src/python[dev]"

echo ""
echo "Building Python package..."
cd src/python
python -m pip install -q build
python -m build

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Python build complete"
echo "════════════════════════════════════════════════════════════════"
