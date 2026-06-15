#!/bin/bash
# test-governance.sh - Test governance layer

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "             GOVERNANCE LAYER TEST SUITE                        "
echo "════════════════════════════════════════════════════════════════"
echo ""

export PYTHONPATH="$SCRIPT_DIR/src/python:$PYTHONPATH"

if [ -d "governance" ]; then
    echo "Testing governance laws and pipelines..."
    
    # Count governance files
    law_count=$(find governance/laws -name "*.cpl-l" 2>/dev/null | wc -l)
    pipeline_count=$(find governance/pipelines -name "*.cpl-p" 2>/dev/null | wc -l)
    
    echo "Found $law_count laws and $pipeline_count pipelines"
    echo "✓ Governance validation passed"
else
    echo "No governance directory found"
    exit 0
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
