#!/bin/bash
# test-haskell.sh - Run Haskell tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                   HASKELL TEST SUITE                           "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if cabal is installed
if ! command -v cabal &> /dev/null; then
    echo "ERROR: Cabal/Haskell is not installed"
    exit 1
fi

# Run Haskell tests if they exist
if [ -f "haskell/cabal.project" ] || [ -f "haskell/*.cabal" ]; then
    cd haskell
    cabal test all "$@"
else
    echo "No Haskell project found"
    exit 0
fi
