# Quick Command Reference

## Essential Commands

### Setup

```bash
# First time setup
bash scripts/setup-dev-env.sh

# CI/CD setup
bash scripts/setup-ci.sh
```

### Development

```bash
# Format and lint code
bash scripts/lint-all.sh && bash scripts/format-code.sh

# Run tests locally
bash scripts/test-python.sh
bash scripts/test-all.sh

# Generate coverage report
bash scripts/test-coverage.sh
```

### Building

```bash
# Build Python
bash scripts/build-python.sh

# Build everything
bash scripts/build-all.sh

# Create release artifacts
bash scripts/build-release.sh
```

### Deployment

```bash
# Deploy locally
bash scripts/deploy-local.sh

# Deploy to staging
bash scripts/deploy-staging.sh

# Verify deployment
bash scripts/deploy-verify.sh
```

### Monitoring

```bash
# Check system health
bash scripts/health-check.sh

# Run security checks
bash scripts/check-security.sh

# Verify dependencies
bash scripts/verify-deps.sh
```

### Maintenance

```bash
# Backup
bash scripts/backup.sh

# Update dependencies
bash scripts/update-deps.sh

# Cleanup temporary files
bash scripts/cleanup.sh
```

## CLI Examples

```bash
# Run Intelligence Router
python src/python/organism_cli.py run router

# Run all tests with coverage
python src/python/organism_cli.py test --coverage

# Build Python package
python src/python/organism_cli.py build python

# Deploy to staging
python src/python/organism_cli.py deploy staging

# Monitor system
python src/python/organism_cli.py monitor

# Verify all components
python src/python/organism_cli.py verify all
```

## Continuous Integration

All workflows trigger on push and pull requests:

- **Python Tests** - `python-tests.yml`
- **Rust Tests** - `rust-tests.yml`
- **Julia Tests** - `julia-tests.yml`
- **Security Scan** - `security-scan.yml`
- **Build All** - `build-all.yml`

View workflow status: `.github/workflows/`

---

For complete documentation, see [BUILD_INFRASTRUCTURE.md](BUILD_INFRASTRUCTURE.md)
