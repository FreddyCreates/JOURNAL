#!/bin/bash
#
# UNIFIED TEST RUNNER
# Runs all tests across the sovereign intelligence repository
#
# Usage: ./run-all-tests.sh
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        SOVEREIGN INTELLIGENCE — UNIFIED TEST RUNNER               ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_TESTS=0
TOTAL_PASS=0
TOTAL_FAIL=0

# Function to run tests in a directory and capture results
run_tests() {
    local dir=$1
    local name=$2
    
    if [ -f "$dir/package.json" ] && grep -q '"test"' "$dir/package.json"; then
        echo -e "${YELLOW}▶ Running tests: ${name}${NC}"
        cd "$dir"
        
        # Run tests and capture output
        output=$(npm test 2>&1) || true
        
        # Extract test counts
        test_count=$(echo "$output" | grep "ℹ tests" | awk '{print $2}')
        pass_count=$(echo "$output" | grep "ℹ pass" | awk '{print $2}')
        fail_count=$(echo "$output" | grep "ℹ fail" | awk '{print $2}')
        
        if [ -n "$test_count" ]; then
            TOTAL_TESTS=$((TOTAL_TESTS + test_count))
            TOTAL_PASS=$((TOTAL_PASS + pass_count))
            TOTAL_FAIL=$((TOTAL_FAIL + fail_count))
            
            if [ "$fail_count" = "0" ]; then
                echo -e "${GREEN}  ✓ ${name}: ${pass_count}/${test_count} tests passed${NC}"
            else
                echo -e "${RED}  ✗ ${name}: ${pass_count}/${test_count} passed, ${fail_count} failed${NC}"
            fi
        else
            echo -e "${YELLOW}  ⚠ ${name}: Could not parse results${NC}"
        fi
        
        cd - > /dev/null
    else
        echo -e "  ○ ${name}: No tests configured"
    fi
}

ROOT_DIR=$(pwd)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                      COGNITIVE LANGUAGES                          ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_tests "$ROOT_DIR/languages" "Cognitive Languages"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                      GOVERNANCE PROTOCOLS                          ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
run_tests "$ROOT_DIR/governance" "Governance Protocols"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                           SDKs                                    ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Run SDK tests
for sdk_dir in "$ROOT_DIR"/sdk/*/; do
    sdk_name=$(basename "$sdk_dir")
    run_tests "$sdk_dir" "$sdk_name"
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                         FINAL SUMMARY                              ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $TOTAL_FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
fi

echo ""
echo -e "  Total Tests:  ${TOTAL_TESTS}"
echo -e "  ${GREEN}Passed:       ${TOTAL_PASS}${NC}"
echo -e "  ${RED}Failed:       ${TOTAL_FAIL}${NC}"
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════════${NC}"

exit $TOTAL_FAIL
