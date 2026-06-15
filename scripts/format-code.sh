#!/bin/bash
# format-code.sh - Format all code files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              CODE FORMATTING                                   "
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Formatting Python code..."
if command -v black &> /dev/null; then
    black src/python/ languages/ -q 2>/dev/null || true
fi

echo "Formatting JSON files..."
for json_file in $(find . -name "*.json" -type f ! -path "./.git/*" ! -path "./node_modules/*" 2>/dev/null); do
    if command -v jq &> /dev/null; then
        jq . "$json_file" > "$json_file.tmp" && mv "$json_file.tmp" "$json_file"
    fi
done

echo "Sorting imports in Python files..."
if command -v isort &> /dev/null; then
    isort src/python/ -q 2>/dev/null || true
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Code formatting complete"
echo "════════════════════════════════════════════════════════════════"
