#!/bin/bash
# test-python.sh - Run Python tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                    PYTHON TEST SUITE                           "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Install dev dependencies if needed
if ! python -m pytest --version &>/dev/null; then
    echo "Installing pytest..."
    pip install -e "src/python[dev]" > /dev/null
fi

# Run pytest
export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"
python -m pytest src/python/tests/ -v --tb=short "$@"

exit_code=$?
echo ""
echo "════════════════════════════════════════════════════════════════"
exit $exit_code
