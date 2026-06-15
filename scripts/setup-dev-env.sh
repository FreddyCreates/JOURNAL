#!/bin/bash
# setup-dev-env.sh - Set up development environment

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

echo "════════════════════════════════════════════════════════════════"
echo "           DEVELOPMENT ENVIRONMENT SETUP                        "
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "Setting up development environment..."

# Check Python
echo "Checking Python..."
python --version || (echo "ERROR: Python not found" && exit 1)

# Install Python dependencies
echo "Installing Python development dependencies..."
pip install -e "src/python[dev]" > /dev/null

# Check Node
if command -v node &> /dev/null; then
    echo "Checking Node..."
    node --version
    npm --version
fi

# Check Git
echo "Configuring Git hooks..."
if [ -d ".git" ]; then
    mkdir -p .git/hooks
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."
bash scripts/lint-all.sh > /dev/null 2>&1 || exit 1
EOF
    chmod +x .git/hooks/pre-commit
    echo "  ✓ Pre-commit hook installed"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✓ Development environment ready"
echo "════════════════════════════════════════════════════════════════"
