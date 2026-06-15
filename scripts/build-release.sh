#!/bin/bash
# build-release.sh - Build release artifacts

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "               RELEASE BUILD                                    "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Get version from git tag or fallback
VERSION=$(git describe --tags --always 2>/dev/null || echo "dev")
BUILD_DIR="build/release-$VERSION"

mkdir -p "$BUILD_DIR"

echo "Building release artifacts for version: $VERSION"

# Build Python distributions
if [ -d "src/python" ]; then
    cd src/python
    python -m pip install -q build
    python -m build -d "$BUILD_DIR"
    cd "$SCRIPT_DIR"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Release artifacts built in: $BUILD_DIR"
echo "════════════════════════════════════════════════════════════════"
