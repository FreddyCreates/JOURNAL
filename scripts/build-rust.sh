#!/bin/bash
# build-rust.sh - Build Rust crates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                   RUST BUILD                                   "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v cargo &> /dev/null; then
    echo "ERROR: Rust/Cargo is not installed"
    exit 1
fi

if [ -d "rust" ]; then
    cd rust
    echo "Building Rust crates..."
    cargo build --release
    echo "✓ Rust build complete"
else
    echo "No Rust directory found"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
