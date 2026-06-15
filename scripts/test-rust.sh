#!/bin/bash
# test-rust.sh - Run Rust tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                    RUST TEST SUITE                             "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "ERROR: Rust/Cargo is not installed"
    exit 1
fi

# Run Rust tests
if [ -d "rust" ]; then
    cd rust
    cargo test --all --verbose "$@"
else
    echo "No Rust project found"
    exit 0
fi
