#!/bin/bash
# restore.sh - Restore from backup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              RESTORE FROM BACKUP                               "
echo "════════════════════════════════════════════════════════════════"
echo ""

BACKUP_DIR="${1:-.}"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERROR: Backup directory not found: $BACKUP_DIR"
    echo "Usage: $0 <backup_directory>"
    exit 1
fi

echo "Restoring from: $BACKUP_DIR"

# Restore documentation
if [ -d "$BACKUP_DIR/docs" ]; then
    echo "  Restoring documentation..."
    cp -r "$BACKUP_DIR/docs" .
fi

# Restore source code
if [ -d "$BACKUP_DIR/python" ]; then
    echo "  Restoring source code..."
    cp -r "$BACKUP_DIR/python" src/
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Restore complete"
echo "════════════════════════════════════════════════════════════════"
