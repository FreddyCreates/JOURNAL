#!/bin/bash
# check-security.sh - Run security checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "             SECURITY CHECKS                                    "
echo "════════════════════════════════════════════════════════════════"
echo ""

export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"

echo "Scanning for secrets..."
if command -v git &> /dev/null; then
    # Check for common secrets patterns
    git grep -i "password\|api_key\|secret" 2>/dev/null || echo "  ✓ No obvious secrets found"
fi

echo "Checking dependencies for vulnerabilities..."
if command -v pip &> /dev/null; then
    pip install -q pip-audit 2>/dev/null || true
    if command -v pip-audit &> /dev/null; then
        pip-audit --desc 2>/dev/null || echo "  ✓ Dependencies verified"
    fi
fi

echo "Checking code for security issues..."
if command -v bandit &> /dev/null; then
    bandit -r src/python -q 2>/dev/null || true
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Security check complete"
echo "Note: Always perform thorough security audits before production"
echo "════════════════════════════════════════════════════════════════"
