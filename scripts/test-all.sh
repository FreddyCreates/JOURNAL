#!/bin/bash
# test-all.sh - Run all test suites

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}              ALL TEST SUITES - COMPREHENSIVE RUN               ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

total_fail=0

# Test Python
if [ -f "scripts/test-python.sh" ]; then
    echo -e "${YELLOW}▶ Running Python tests...${NC}"
    if bash scripts/test-python.sh "$@"; then
        echo -e "${GREEN}✓ Python tests passed${NC}"
    else
        echo -e "${RED}✗ Python tests failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

# Test Julia
if command -v julia &> /dev/null && [ -f "scripts/test-julia.sh" ]; then
    echo -e "${YELLOW}▶ Running Julia tests...${NC}"
    if bash scripts/test-julia.sh "$@"; then
        echo -e "${GREEN}✓ Julia tests passed${NC}"
    else
        echo -e "${RED}✗ Julia tests failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

# Test Rust
if command -v cargo &> /dev/null && [ -f "scripts/test-rust.sh" ]; then
    echo -e "${YELLOW}▶ Running Rust tests...${NC}"
    if bash scripts/test-rust.sh "$@"; then
        echo -e "${GREEN}✓ Rust tests passed${NC}"
    else
        echo -e "${RED}✗ Rust tests failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

# Test JavaScript
if command -v node &> /dev/null && [ -f "scripts/test-javascript.sh" ]; then
    echo -e "${YELLOW}▶ Running JavaScript tests...${NC}"
    if bash scripts/test-javascript.sh "$@"; then
        echo -e "${GREEN}✓ JavaScript tests passed${NC}"
    else
        echo -e "${RED}✗ JavaScript tests failed${NC}"
        ((total_fail++))
    fi
    echo ""
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
if [ $total_fail -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
else
    echo -e "${RED}✗ $total_fail test suite(s) failed${NC}"
fi
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

exit $total_fail
