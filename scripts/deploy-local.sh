#!/bin/bash
# deploy-local.sh - Deploy locally (Docker Compose)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "               LOCAL DEPLOYMENT (DOCKER COMPOSE)               "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: docker-compose is not installed"
    exit 1
fi

echo "Starting services with Docker Compose..."
docker-compose -f src/python/deployment/docker-compose.yml up -d

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Services started. Access at:"
echo "  - FastAPI:   http://localhost:8000"
echo "  - Redis:     localhost:6379"
echo "  - PostgreSQL: localhost:5432"
echo "════════════════════════════════════════════════════════════════"
