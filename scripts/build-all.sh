#!/bin/bash
# build-all.sh - Build all components

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              COMPLETE BUILD - ALL COMPONENTS                   ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

total_fail=0

# Build Python
if [ -f "scripts/build-python.sh" ]; then
    echo -e "${YELLOW}▶ Building Python...${NC}"
    if bash scripts/build-python.sh; then
        echo -e "${GREEN}✓ Python build passed${NC}"
    else
        echo -e "${RED}✗ Python build failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

# Build JavaScript
if [ -f "scripts/build-javascript.sh" ] && command -v npm &> /dev/null; then
    echo -e "${YELLOW}▶ Building JavaScript...${NC}"
    if bash scripts/build-javascript.sh; then
        echo -e "${GREEN}✓ JavaScript build passed${NC}"
    else
        echo -e "${RED}✗ JavaScript build failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

# Build Rust
if [ -f "scripts/build-rust.sh" ] && command -v cargo &> /dev/null; then
    echo -e "${YELLOW}▶ Building Rust...${NC}"
    if bash scripts/build-rust.sh; then
        echo -e "${GREEN}✓ Rust build passed${NC}"
    else
        echo -e "${RED}✗ Rust build failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
if [ $total_fail -eq 0 ]; then
    echo -e "${GREEN}✓ ALL BUILDS PASSED${NC}"
else
    echo -e "${RED}✗ $total_fail build(s) failed${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

exit $total_fail
