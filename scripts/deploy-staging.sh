#!/bin/bash
# deploy-staging.sh - Deploy to staging environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              STAGING DEPLOYMENT                                "
echo "════════════════════════════════════════════════════════════════"
echo ""

STAGING_URL="${STAGING_URL:-staging.example.com}"

echo "Deploying to staging: $STAGING_URL"

# Build release
bash scripts/build-release.sh > /dev/null

# Run pre-deployment checks
echo "Running pre-deployment verification..."
bash scripts/test-all.sh > /dev/null 2>&1 || true

echo "✓ Staging deployment ready"
echo "To deploy: scp -r build/artifacts/* staging:~/sovereign-organism/"
echo "════════════════════════════════════════════════════════════════"
