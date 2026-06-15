#!/bin/bash
# deploy-docker.sh - Build and push Docker images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                DOCKER IMAGE DEPLOYMENT                         "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed"
    exit 1
fi

REGISTRY="${DOCKER_REGISTRY:-ghcr.io/freddycreates}"
VERSION=$(git describe --tags --always 2>/dev/null || echo "latest")

echo "Building Docker images (version: $VERSION)..."

docker-compose -f src/python/deployment/docker-compose.yml build

echo "Tagging images for registry: $REGISTRY"

docker tag sovereign-organism:latest "$REGISTRY/sovereign-organism:$VERSION"
docker tag sovereign-organism:latest "$REGISTRY/sovereign-organism:latest"

echo ""
echo "Run 'docker push' to push images to registry"
echo "════════════════════════════════════════════════════════════════"
