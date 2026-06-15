#!/bin/bash
# deploy-production.sh - Deploy to production

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "             PRODUCTION DEPLOYMENT                              "
echo "════════════════════════════════════════════════════════════════"
echo ""

PRODUCTION_URL="${PRODUCTION_URL:-api.example.com}"

# Require confirmation
read -p "Deploy to PRODUCTION ($PRODUCTION_URL)? This cannot be undone. (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Deploying to production: $PRODUCTION_URL"

# Build release
bash scripts/build-release.sh > /dev/null

# Run all tests
bash scripts/test-all.sh > /dev/null 2>&1 || {
    echo "ERROR: Tests failed. Aborting deployment."
    exit 1
}

echo "✓ Production deployment verified and ready"
echo "Deploy using your deployment platform (e.g., GitOps, deployment tool, etc.)"
echo "════════════════════════════════════════════════════════════════"
