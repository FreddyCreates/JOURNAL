#!/bin/bash
#
# ORGANISM HEALTH MONITOR
#
# Continuously monitors system health and triggers self-healing
# when thresholds are exceeded.
#
# Usage: ./organism-health-monitor.sh [--interval SECONDS]
#
# ENCODED IDENTITY: SCRIPT.HEALTH.MONITOR
#

set -e

PHI="1.618033988749895"
PHI_INVERSE="0.618033988749895"
INTERVAL=${1:-30}  # Default: check every 30 seconds

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          ORGANISM HEALTH MONITOR — φ-Encoded Guardian             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Monitoring interval: ${INTERVAL}s"
echo "φ-threshold: ${PHI_INVERSE}"
echo ""

# Health check function
check_organism_health() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[${timestamp}] Running health check...${NC}"
    
    # Check 1: Memory usage
    local mem_used=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
    local mem_threshold=80
    
    # Check 2: CPU load (1-minute average)
    local cpu_load=$(cat /proc/loadavg | awk '{print $1}')
    local cpu_cores=$(nproc)
    local cpu_normalized=$(echo "scale=2; $cpu_load / $cpu_cores" | bc)
    
    # Check 3: Disk usage
    local disk_used=$(df -h "$ROOT_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    # Calculate overall health score (φ-weighted)
    local mem_score=$(echo "scale=4; 1 - ($mem_used / 100)" | bc)
    local cpu_score=$(echo "scale=4; 1 - $cpu_normalized" | bc)
    local disk_score=$(echo "scale=4; 1 - ($disk_used / 100)" | bc)
    
    # φ-weighted aggregate (memory:φ, cpu:1, disk:φ⁻¹)
    local health_score=$(echo "scale=4; ($mem_score * $PHI + $cpu_score + $disk_score * $PHI_INVERSE) / ($PHI + 1 + $PHI_INVERSE)" | bc)
    
    # Determine status
    local status="OPTIMAL"
    local color=$GREEN
    
    if (( $(echo "$health_score < 0.3" | bc -l) )); then
        status="CRITICAL"
        color=$RED
    elif (( $(echo "$health_score < 0.5" | bc -l) )); then
        status="STRESSED"
        color=$YELLOW
    elif (( $(echo "$health_score < $PHI_INVERSE" | bc -l) )); then
        status="STABLE"
        color=$BLUE
    fi
    
    echo -e "${color}┌──────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${color}│  STATUS: ${status}                                             ${NC}"
    echo -e "${color}├──────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${color}│  Health Score:    ${health_score}  (target > φ⁻¹ = ${PHI_INVERSE})${NC}"
    echo -e "${color}│  Memory:          ${mem_used}% (score: ${mem_score})${NC}"
    echo -e "${color}│  CPU Load:        ${cpu_load} / ${cpu_cores} cores (score: ${cpu_score})${NC}"
    echo -e "${color}│  Disk:            ${disk_used}% (score: ${disk_score})${NC}"
    echo -e "${color}└──────────────────────────────────────────────────────────────────┘${NC}"
    
    # Trigger healing if needed
    if [ "$status" = "CRITICAL" ]; then
        echo -e "${RED}⚠ CRITICAL: Initiating self-healing protocol...${NC}"
        trigger_self_healing
    elif [ "$status" = "STRESSED" ]; then
        echo -e "${YELLOW}⚠ STRESSED: Generating recommendations...${NC}"
        generate_recommendations
    fi
    
    echo ""
}

# Self-healing function
trigger_self_healing() {
    echo "  → Clearing temporary files..."
    find "$ROOT_DIR" -name "*.tmp" -type f -mtime +1 -delete 2>/dev/null || true
    find /tmp -user $(whoami) -type f -mtime +1 -delete 2>/dev/null || true
    
    echo "  → Clearing node_modules caches..."
    npm cache clean --force 2>/dev/null || true
    
    echo "  → Self-healing complete."
}

# Recommendations function
generate_recommendations() {
    echo "  Recommendations:"
    echo "  • Consider reducing concurrency"
    echo "  • Monitor for memory leaks"
    echo "  • Check for runaway processes"
}

# Main loop
echo "Starting continuous monitoring..."
echo "(Press Ctrl+C to stop)"
echo ""

while true; do
    check_organism_health
    sleep $INTERVAL
done
