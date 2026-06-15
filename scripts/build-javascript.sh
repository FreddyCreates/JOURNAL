#!/bin/bash
# build-javascript.sh - Build JavaScript packages

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "               JAVASCRIPT BUILD                                 "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v npm &> /dev/null; then
    echo "ERROR: Node.js/npm is not installed"
    exit 1
fi

build_count=0

for package_dir in languages/*/; do
    if [ -f "$package_dir/package.json" ]; then
        package_name=$(basename "$package_dir")
        echo "Building $package_name..."
        
        cd "$package_dir"
        npm install
        
        if [ -f "package.json" ] && grep -q '"build"' "package.json"; then
            npm run build || true
        fi
        
        ((build_count++))
        cd "$SCRIPT_DIR"
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Built $build_count JavaScript packages"
echo "════════════════════════════════════════════════════════════════"
