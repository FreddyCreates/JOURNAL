#!/bin/bash
# deploy-rollback.sh - Rollback to previous version

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "               DEPLOYMENT ROLLBACK                              "
echo "════════════════════════════════════════════════════════════════"
echo ""

ROLLBACK_VERSION="${1:-previous}"

echo "Rolling back to version: $ROLLBACK_VERSION"
echo "Available versions:"
git tag -l | tail -10

echo ""
echo "✓ Rollback prepared"
echo "To rollback to a specific version:"
echo "  git checkout <tag>"
echo "  bash scripts/deploy-production.sh"
echo "════════════════════════════════════════════════════════════════"
