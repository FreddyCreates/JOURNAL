#!/bin/bash
# backup.sh - Backup important data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "              BACKUP                                            "
echo "════════════════════════════════════════════════════════════════"
echo ""

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup in: $BACKUP_DIR"

# Backup documentation
if [ -d "docs" ]; then
    echo "  Backing up documentation..."
    cp -r docs "$BACKUP_DIR/" 2>/dev/null || true
fi

# Backup configuration
echo "  Backing up configuration..."
find . -maxdepth 2 -name "*.config.*" -o -name "*.env*" -o -name "organism.*.json" | \
    xargs -I {} cp {} "$BACKUP_DIR/" 2>/dev/null || true

# Backup Python source
if [ -d "src/python" ]; then
    echo "  Backing up source code..."
    cp -r src/python "$BACKUP_DIR/" 2>/dev/null || true
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Backup complete: $BACKUP_DIR"
du -sh "$BACKUP_DIR"
echo "════════════════════════════════════════════════════════════════"
