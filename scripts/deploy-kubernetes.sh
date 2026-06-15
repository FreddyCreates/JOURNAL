#!/bin/bash
# deploy-kubernetes.sh - Deploy to Kubernetes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "             KUBERNETES DEPLOYMENT                              "
echo "════════════════════════════════════════════════════════════════"
echo ""

if ! command -v kubectl &> /dev/null; then
    echo "ERROR: kubectl is not installed"
    exit 1
fi

NAMESPACE="${K8S_NAMESPACE:-sovereign-organism}"
IMAGE="${DOCKER_REGISTRY:-ghcr.io/freddycreates}/sovereign-organism:latest"

echo "Deploying to Kubernetes cluster..."
echo "Namespace: $NAMESPACE"
echo "Image: $IMAGE"

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo ""
echo "✓ Kubernetes deployment prepared"
echo "Note: Create appropriate deployment manifests before applying"
echo "════════════════════════════════════════════════════════════════"
