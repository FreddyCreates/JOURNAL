#!/bin/bash
# test-javascript.sh - Run JavaScript/Node tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "                 JAVASCRIPT TEST SUITE                          "
echo "════════════════════════════════════════════════════════════════"
echo ""

# Find and run all npm test suites
test_count=0
pass_count=0
fail_count=0

for package_dir in languages/*/; do
    if [ -f "$package_dir/package.json" ] && grep -q '"test"' "$package_dir/package.json"; then
        cd "$package_dir"
        echo "Testing: $(basename $package_dir)"
        
        if npm test "$@" 2>&1 | tee /tmp/test_output.txt; then
            ((pass_count++))
        else
            ((fail_count++))
        fi
        ((test_count++))
        
        cd "$SCRIPT_DIR"
    fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Tests run: $test_count | Passed: $pass_count | Failed: $fail_count"
echo "════════════════════════════════════════════════════════════════"

[ $fail_count -eq 0 ]
