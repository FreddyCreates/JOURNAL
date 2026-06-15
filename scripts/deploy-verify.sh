#!/bin/bash
# deploy-verify.sh - Verify deployment health

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "            DEPLOYMENT VERIFICATION                             "
echo "════════════════════════════════════════════════════════════════"
echo ""

API_URL="${API_URL:-http://localhost:8000}"

echo "Verifying deployment at: $API_URL"
echo ""

# Check API health
echo "Checking API endpoint..."
if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo "  ✓ API is healthy"
else
    echo "  ✗ API is not responding"
    exit 1
fi

# Check services
echo "Checking services..."
if [ "$(docker ps -q 2>/dev/null | wc -l)" -gt 0 ]; then
    echo "  ✓ Docker services running"
else
    echo "  ⚠ No Docker services detected"
fi

# Check database
echo "Checking database..."
if command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -c "SELECT 1" > /dev/null 2>&1; then
        echo "  ✓ PostgreSQL is accessible"
    else
        echo "  ⚠ PostgreSQL not accessible"
    fi
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Deployment verification complete"
echo "════════════════════════════════════════════════════════════════"
