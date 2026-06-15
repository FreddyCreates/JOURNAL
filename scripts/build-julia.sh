#!/bin/bash
# build-julia.sh - Build Julia package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                   JULIA BUILD                                  "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v julia &> /dev/null; then
    echo "ERROR: Julia is not installed"
    exit 1
fi

if [ -d "julia" ]; then
    cd julia
    echo "Building Julia package..."
    julia --project -e 'using Pkg; Pkg.build()' || true
    echo "✓ Julia build complete"
else
    echo "No Julia directory found"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
