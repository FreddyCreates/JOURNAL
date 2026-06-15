#!/bin/bash
# build-docker.sh - Build Docker images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                 DOCKER BUILD                                   "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi

if [ -f "src/python/deployment/docker-compose.yml" ]; then
    echo "Building Docker images..."
    docker-compose -f src/python/deployment/docker-compose.yml build
    echo "✓ Docker build complete"
else
    echo "No docker-compose.yml found"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
