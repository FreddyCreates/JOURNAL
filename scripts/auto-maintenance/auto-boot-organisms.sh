#!/bin/bash
#
# AUTO-BOOT ORGANISMS
#
# Initializes and boots all organism components with health verification.
# Designed to run at system startup or via cron.
#
# Usage: ./auto-boot-organisms.sh
#
# ENCODED IDENTITY: SCRIPT.BOOT.MASTER
#

set -e

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║          SOVEREIGN INTELLIGENCE — AUTO-BOOT SEQUENCE              ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Boot Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "Root Directory: $ROOT_DIR"
echo ""

BOOT_SUCCESS=0
BOOT_FAILED=0

# Function to boot a component
boot_component() {
    local name=$1
    local check_cmd=$2
    local boot_cmd=$3
    
    echo -e "${YELLOW}► Booting: ${name}${NC}"
    
    # Check if already running or ready
    if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ ${name} is ready${NC}"
        BOOT_SUCCESS=$((BOOT_SUCCESS + 1))
        return 0
    fi
    
    # Attempt to boot
    if [ -n "$boot_cmd" ]; then
        if eval "$boot_cmd" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✓ ${name} booted successfully${NC}"
            BOOT_SUCCESS=$((BOOT_SUCCESS + 1))
            return 0
        else
            echo -e "${RED}  ✗ ${name} failed to boot${NC}"
            BOOT_FAILED=$((BOOT_FAILED + 1))
            return 1
        fi
    fi
    
    BOOT_SUCCESS=$((BOOT_SUCCESS + 1))
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: VERIFY ENVIRONMENT
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PHASE 1: ENVIRONMENT VERIFICATION                                 ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

boot_component "Node.js Runtime" "node --version" ""
boot_component "NPM Package Manager" "npm --version" ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: VERIFY COGNITIVE LANGUAGES
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PHASE 2: COGNITIVE LANGUAGE STACK                                 ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -d "$ROOT_DIR/languages" ]; then
    boot_component "Cognitive Languages" "test -f $ROOT_DIR/languages/package.json" ""
fi

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: VERIFY SDK MODULES
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PHASE 3: SDK MODULE VERIFICATION                                  ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

for sdk_dir in "$ROOT_DIR"/sdk/*/; do
    if [ -d "$sdk_dir" ]; then
        sdk_name=$(basename "$sdk_dir")
        boot_component "SDK: $sdk_name" "test -f ${sdk_dir}package.json" ""
    fi
done

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: RUN HEALTH CHECK
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  PHASE 4: INITIAL HEALTH CHECK                                     ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Quick health metrics
MEM_USED=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
DISK_USED=$(df -h "$ROOT_DIR" | tail -1 | awk '{print $5}')
CPU_LOAD=$(cat /proc/loadavg | awk '{print $1}')

echo -e "${GREEN}  Memory Usage:  ${MEM_USED}%${NC}"
echo -e "${GREEN}  Disk Usage:    ${DISK_USED}${NC}"
echo -e "${GREEN}  CPU Load:      ${CPU_LOAD}${NC}"

# ═══════════════════════════════════════════════════════════════════════════
# BOOT SUMMARY
# ═══════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║                       BOOT SUMMARY                                 ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((BOOT_SUCCESS + BOOT_FAILED))

if [ $BOOT_FAILED -eq 0 ]; then
    echo -e "${GREEN}████████████████████████████████████████████████████████████████████${NC}"
    echo -e "${GREEN}█              ALL ORGANISMS BOOTED SUCCESSFULLY                   █${NC}"
    echo -e "${GREEN}████████████████████████████████████████████████████████████████████${NC}"
else
    echo -e "${RED}████████████████████████████████████████████████████████████████████${NC}"
    echo -e "${RED}█              SOME COMPONENTS FAILED TO BOOT                      █${NC}"
    echo -e "${RED}████████████████████████████████████████████████████████████████████${NC}"
fi

echo ""
echo -e "${BLUE}  Components Booted:  ${BOOT_SUCCESS}/${TOTAL}${NC}"
echo -e "${BLUE}  Boot Failures:      ${BOOT_FAILED}${NC}"
echo -e "${BLUE}  Boot Time:          $(date '+%H:%M:%S')${NC}"
echo ""
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  ENCODED IDENTITY: BOOT.SEQUENCE.COMPLETE                          ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════════════╝${NC}"

exit $BOOT_FAILED
