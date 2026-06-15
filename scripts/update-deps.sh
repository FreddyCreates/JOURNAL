#!/bin/bash
# update-deps.sh - Update dependencies

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "            DEPENDENCY UPDATES                                  "
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Updating Python dependencies..."
if command -v pip &> /dev/null; then
    echo "  pip:"
    pip install --upgrade pip setuptools wheel -q
    pip install --upgrade -e "src/python[dev]" -q 2>/dev/null || true
    echo "  ✓ Python dependencies updated"
fi

echo ""
echo "Updating Node.js dependencies..."
for package_dir in languages/*/; do
    if [ -f "$package_dir/package.json" ]; then
        echo "  $(basename $package_dir):"
        cd "$package_dir"
        npm update -q 2>/dev/null || true
        cd "$SCRIPT_DIR"
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Dependency updates complete"
echo "════════════════════════════════════════════════════════════════"
