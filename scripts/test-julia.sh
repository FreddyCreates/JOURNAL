#!/bin/bash
# test-julia.sh - Run Julia/THESIS tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                    JULIA TEST SUITE                            "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Julia is installed
if ! command -v julia &> /dev/null; then
    echo "ERROR: Julia is not installed"
    exit 1
fi

# Run Julia tests if they exist
if [ -d "julia/test" ]; then
    julia --project=julia -e 'using Pkg; Pkg.test()' "$@"
else
    echo "No Julia tests found in julia/test"
    exit 0
fi
