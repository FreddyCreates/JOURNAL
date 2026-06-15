#!/bin/bash
# build-artifacts.sh - Build and collect all artifacts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "             BUILD ARTIFACTS COLLECTION                         "
echo "════════════════════════════════════════════════════════════════"
echo ""

ARTIFACTS_DIR="build/artifacts"
mkdir -p "$ARTIFACTS_DIR"

echo "Collecting build artifacts..."

# Collect Python builds
if [ -d "src/python/dist" ]; then
    echo "  Collecting Python packages..."
    cp -r src/python/dist/* "$ARTIFACTS_DIR/" 2>/dev/null || true
fi

# Collect Rust builds
if [ -d "rust/target/release" ]; then
    echo "  Collecting Rust binaries..."
    cp -r rust/target/release/* "$ARTIFACTS_DIR/" 2>/dev/null || true
fi

# Collect documentation
if [ -d "docs" ]; then
    echo "  Collecting documentation..."
    mkdir -p "$ARTIFACTS_DIR/docs"
    cp -r docs/* "$ARTIFACTS_DIR/docs/" 2>/dev/null || true
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Artifacts collected in: $ARTIFACTS_DIR"
ls -lh "$ARTIFACTS_DIR"
echo "════════════════════════════════════════════════════════════════"
