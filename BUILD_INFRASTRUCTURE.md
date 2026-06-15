# Build Infrastructure Guide

This document describes the complete build infrastructure for the Sovereign Organism project, including scripts, CLI, workflows, and test suite.

## Table of Contents

1. [Quick Start](#quick-start)
2. [37 Runnable Scripts](#37-runnable-scripts)
3. [Unified CLI](#unified-cli)
4. [Test Suite](#test-suite)
5. [GitHub Actions Workflows](#github-actions-workflows)

## Quick Start

### Setup Development Environment

```bash
bash scripts/setup-dev-env.sh
```

### Run All Tests

```bash
bash scripts/test-all.sh
```

### Build All Components

```bash
bash scripts/build-all.sh
```

### Deploy Locally

```bash
bash scripts/deploy-local.sh
```

## 37 Runnable Scripts

All scripts are located in the `scripts/` directory and are organized by category.

### Testing Scripts (10)

| Script | Purpose |
|--------|---------|
| `test-python.sh` | Run Python tests with pytest |
| `test-julia.sh` | Run Julia/THESIS verification tests |
| `test-rust.sh` | Run Rust protocol tests |
| `test-javascript.sh` | Run JavaScript/Node.js tests |
| `test-haskell.sh` | Run Haskell tests |
| `test-all.sh` | Run all test suites |
| `test-coverage.sh` | Generate coverage reports |
| `test-protocols.sh` | Validate protocol definitions |
| `test-governance.sh` | Test governance layer |
| `test-integration.sh` | Run integration tests |

### Build Scripts (8)

| Script | Purpose |
|--------|---------|
| `build-python.sh` | Build Python package |
| `build-julia.sh` | Build Julia package |
| `build-rust.sh` | Build Rust crates |
| `build-javascript.sh` | Build JavaScript packages |
| `build-docker.sh` | Build Docker images |
| `build-all.sh` | Build all components |
| `build-release.sh` | Create release artifacts |
| `build-artifacts.sh` | Collect and package artifacts |

### Deployment Scripts (7)

| Script | Purpose |
|--------|---------|
| `deploy-local.sh` | Deploy locally with Docker Compose |
| `deploy-docker.sh` | Build and push Docker images |
| `deploy-kubernetes.sh` | Deploy to Kubernetes cluster |
| `deploy-staging.sh` | Deploy to staging environment |
| `deploy-production.sh` | Deploy to production |
| `deploy-rollback.sh` | Rollback to previous version |
| `deploy-verify.sh` | Verify deployment health |

### Utility Scripts (12)

| Script | Purpose |
|--------|---------|
| `setup-dev-env.sh` | Initialize development environment |
| `setup-ci.sh` | Setup CI/CD environment |
| `verify-deps.sh` | Verify all dependencies |
| `lint-all.sh` | Run all code linters |
| `format-code.sh` | Format all code files |
| `generate-docs.sh` | Generate documentation |
| `health-check.sh` | Check system health |
| `cleanup.sh` | Clean temporary files |
| `backup.sh` | Backup important data |
| `restore.sh` | Restore from backup |
| `check-security.sh` | Run security scans |
| `update-deps.sh` | Update dependencies |

## Unified CLI

The Sovereign Organism CLI (`src/python/organism_cli.py`) provides unified control over all subsystems.

### Installation

```bash
pip install -e "src/python[dev]"
```

### Usage

```bash
organism-cli [command] [options]
```

### Commands

#### Run Services

```bash
organism-cli run router          # Run Intelligence Router
organism-cli run api             # Run FastAPI service
organism-cli run memory          # Run Memory Authority
organism-cli run all             # Run all services
```

#### Testing

```bash
organism-cli test                # Run all tests
organism-cli test intelligence_router  # Test specific module
organism-cli test -v             # Verbose output
organism-cli test --coverage     # With coverage report
```

#### Building

```bash
organism-cli build               # Build all targets
organism-cli build python        # Build Python package
organism-cli build docs          # Build documentation
organism-cli build docker        # Build Docker images
```

#### Deployment

```bash
organism-cli deploy              # Deploy to staging
organism-cli deploy staging      # Deploy to staging
organism-cli deploy production   # Deploy to production
```

#### Verification

```bash
organism-cli verify              # Verify all components
organism-cli verify dependencies # Check dependencies
organism-cli verify config       # Verify configuration
organism-cli verify health       # Check system health
organism-cli verify security     # Run security checks
```

#### Monitoring

```bash
organism-cli monitor             # Monitor system health
organism-cli monitor --interval 10  # Monitor every 10 seconds
```

#### Admin Operations

```bash
organism-cli admin reset         # Reset system state
organism-cli admin backup        # Backup data
organism-cli admin restore       # Restore from backup
organism-cli admin cleanup       # Clean temporary files
```

## Test Suite

### Python Tests

Located in `src/python/tests/`:

- `conftest.py` - Pytest configuration and fixtures
- `test_intelligence_router.py` - Intelligence Router tests
- `test_memory_authority.py` - Memory Vault tests
- `test_governance_executor.py` - Governance tests
- `test_paper_engine.py` - Paper synthesis tests
- `test_ai_tools.py` - AI Tool Registry tests
- `test_deployed_app.py` - FastAPI app tests

### Running Tests

```bash
# Python tests
pytest src/python/tests/ -v

# With coverage
pytest src/python/tests/ --cov=src/python --cov-report=html

# Specific test file
pytest src/python/tests/test_intelligence_router.py

# Specific test
pytest src/python/tests/test_intelligence_router.py::TestIntelligenceRouter::test_router_initialization
```

### Test Organization

Tests follow pytest conventions:
- Tests are in `src/python/tests/`
- Fixtures are in `conftest.py`
- Test functions start with `test_`
- Test classes start with `Test`

## GitHub Actions Workflows

All workflows are in `.github/workflows/`:

### Existing Workflows (10)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push, PR | Main CI pipeline |
| `pages.yml` | push to main | Deploy to GitHub Pages |
| `thesis-verify.yml` | push | THESIS verification |
| `governance-enforcement.yml` | push | Governance validation |
| `vault-bridge.yml` | push, schedule | Vault operations |
| `vault-health.yml` | schedule | Vault health monitoring |
| `organism-health.yml` | schedule | System health check |
| `protocol-validation.yml` | push | Protocol verification |
| `npm-publish.yml` | release | Publish to npm |
| `create-platform-releases.yml` | push | Create releases |

### New Workflows (7)

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `python-tests.yml` | push, PR | Python test matrix |
| `julia-tests.yml` | push, PR | Julia/THESIS tests |
| `rust-tests.yml` | push, PR | Rust test matrix |
| `security-scan.yml` | push, PR, schedule | Security scanning |
| `build-all.yml` | push, PR | Full build pipeline |
| `deploy-staging.yml` | push develop | Deploy to staging |
| `deploy-production.yml` | push main, tags | Deploy to production |

### Workflow Features

- **Matrix Testing**: Multiple Python/Rust/Julia versions
- **Artifact Management**: Upload/download build artifacts
- **Coverage Reports**: Generate and upload coverage
- **Security Scanning**: Dependency checks, secret scanning
- **Deployment Gates**: Environment protection rules
- **Post-Deployment Verification**: Health checks after deploy

## Environment Variables

### Required for Deployment

```bash
STAGING_URL          # Staging environment URL
PRODUCTION_URL       # Production environment URL
DOCKER_REGISTRY      # Docker registry URL
K8S_NAMESPACE        # Kubernetes namespace
```

### Optional

```bash
API_URL              # API endpoint for health checks
CI                   # Set automatically in CI/CD
LOG_LEVEL            # Logging level (INFO, DEBUG, etc)
```

## Configuration

### Development Configuration

Create `organism.config.json`:

```json
{
  "services": {
    "router": {"port": 8000, "host": "localhost"},
    "api": {"port": 8001, "host": "localhost"},
    "memory": {"persistence": true}
  },
  "logging": {"level": "DEBUG"},
  "testing": {"coverage": true}
}
```

### Docker Compose

Located at `src/python/deployment/docker-compose.yml`

Services:
- FastAPI (port 8000)
- Redis (port 6379)
- PostgreSQL (port 5432)
- Julia (for THESIS)

## Best Practices

### Before Committing

```bash
bash scripts/lint-all.sh      # Run linters
bash scripts/format-code.sh   # Format code
bash scripts/test-python.sh   # Run tests
bash scripts/check-security.sh # Check security
```

### Before Deploying

```bash
bash scripts/verify-deps.sh   # Verify dependencies
bash scripts/test-all.sh      # Run all tests
bash scripts/build-release.sh # Build release
bash scripts/deploy-verify.sh # Final verification
```

### Monitoring

```bash
bash scripts/health-check.sh              # One-time check
bash scripts/organism-health-monitor.sh   # Continuous monitoring
```

## Troubleshooting

### Python Dependencies

```bash
bash scripts/update-deps.sh
pip install -e "src/python[dev]" --force-reinstall
```

### Docker Issues

```bash
bash scripts/cleanup.sh
docker-compose down -v
bash scripts/deploy-local.sh
```

### Missing Dependencies

```bash
bash scripts/verify-deps.sh
bash scripts/setup-dev-env.sh
```

## Contributing

When adding new scripts:

1. Place in appropriate category directory (`testing/`, `building/`, etc.)
2. Add `#!/bin/bash` shebang
3. Add documentation header
4. Make executable: `chmod +x script-name.sh`
5. Test locally before committing
6. Update this documentation

## Performance Optimization

### Parallel Testing

```bash
pytest src/python/tests/ -n auto  # Uses all CPU cores
```

### Caching in CI/CD

Workflows use caching for:
- Cargo registry and builds
- npm packages
- Docker layers
- pip packages

### Local Build Caching

Docker BuildKit is used for efficient builds:

```bash
DOCKER_BUILDKIT=1 docker build .
```

---

**Last Updated**: 2026-06-15
**Scripts Version**: 1.0.0
**Workflows Version**: 1.0.0
