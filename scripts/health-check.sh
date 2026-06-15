#!/bin/bash
# health-check.sh - Check system health

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              SYSTEM HEALTH CHECK                               "
echo "════════════════════════════════════════════════════════════════"
echo ""

check_service() {
    local service=$1
    local port=$2
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "  ✓ $service on port $port"
        return 0
    else
        echo "  ○ $service on port $port (not running)"
        return 1
    fi
}

echo "Checking local services..."
check_service "FastAPI" 8000 || true
check_service "API Secondary" 8001 || true
check_service "Redis" 6379 || true
check_service "PostgreSQL" 5432 || true

echo ""
echo "Checking disk space..."
df -h | awk 'NR==1 || NR>1 {printf "  %s\n", $0}'

echo ""
echo "Checking memory usage..."
free -h | awk 'NR==1 || NR==2 {printf "  %s\n", $0}'

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Health check complete"
echo "════════════════════════════════════════════════════════════════"
