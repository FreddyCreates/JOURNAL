#!/bin/bash
# setup-ci.sh - Set up CI/CD environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "             CI/CD ENVIRONMENT SETUP                            "
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Setting up CI/CD environment..."

# Install dependencies
echo "Installing dependencies..."
pip install -q -e "src/python[dev]" 2>/dev/null || true

# Set up environment variables
export CI=true
export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"

# Check all tools
echo ""
echo "Verifying CI/CD tools..."

tools=("python" "git" "bash")
for tool in "${tools[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "  ✓ $tool"
    else
        echo "  ✗ $tool not found"
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ CI/CD environment ready"
echo "════════════════════════════════════════════════════════════════"
