# Python Integration Framework — Implementation Guide

## Overview

This document describes the Python integration framework for the Sovereign Organism platform. The framework provides production-grade backends for:

- Multi-model AI orchestration (φ-weighted routing)
- Constitutional law execution (CPL-L/CPL-P)
- Temporal memory vault with voting system
- Automatic paper generation and publication
- AI tool registry with self-describing APIs
- Cross-domain workflows (end-to-end verification)
- Deployment automation

## Module Architecture

```
src/python/
├── intelligence-router/      Multi-model orchestration, φ-weighted selection
├── governance-executor/      CPL-L parsing, law enforcement, audit trails
├── memory-authority/         Temporal vault, LRU cache, Zenodo persistence
├── deployed-app/             FastAPI backend, papers/journals/vault APIs
├── paper-engine/             Paper synthesis, HTML generation, Zenodo publishing
├── ai-tools/                 Tool registry, memory tokens, copilot bridge
├── ai-aware-tools/           Self-describing APIs, tool composition
├── cross-domain-uses/        Workflows, language interop, deployment
├── deployment/               Docker Compose, deployment guides
└── sovereign/                Integrated package entry point
```

## Quick Start

### Installation

```bash
# Install dependencies
pip install -e "src/python[dev]"

# Or with extras
pip install -e "src/python[dev,zenodo,jupyter]"
```

### Running the API Server

```bash
# Development mode
python -m uvicorn src.python.deployed_app:app --reload

# Or using the sovereign CLI
python -m sovereign.sovereign server --port 8000

# Production with Gunicorn
gunicorn src.python.deployed_app:app --workers 4
```

### Using Individual Components

```python
# Intelligence Router
from src.python.intelligence_router import IntelligenceRouter

router = IntelligenceRouter()
result = await router.route_query(
    query="Verify sovereign architecture",
    models=["gpt-4", "claude-3-opus"],
)

# Governance Executor
from src.python.governance_executor import GovernanceExecutor

executor = GovernanceExecutor()
result = await executor.enforce_law(
    law_name="sovereign-vault",
    context={"caller": "zenodo-agent"}
)

# Memory Authority
from src.python.memory_authority import MemoryVault, MemoryType

vault = MemoryVault()
memory_id = vault.store(
    content="Research finding",
    agent="THESIS",
    memory_type=MemoryType.FINDING,
    tags=["verification"]
)

# Paper Synthesizer
from src.python.paper_engine import PaperSynthesizer

synthesizer = PaperSynthesizer()
paper = await synthesizer.generate_paper(
    title="Sovereign Architecture",
    content="...",
    category="architecture",
    author_agent="AURO"
)

# AI Tool Registry
from src.python.ai_tools import AIToolRegistry

registry = AIToolRegistry()
tools = registry.get_tools(agent="AURO")
spec = registry.generate_openapi_spec()
```

## Integration Points

### With Existing Systems

#### Governance Integration
- **CPL-L Laws**: Located in `governance/laws/*.cpl-l`
- **CPL-P Pipelines**: Located in `governance/pipelines/*.cpl-p`
- **VaultClient**: Located in `governance/vault/client.js`
- **Enforcement Logs**: Stored in memory vault and file system

#### THESIS Verification
- **Julia CLI**: `julia/thesis.jl verify [input]`
- **Python Integration**: `CrossDomainWorkflow._call_thesis_verify()`
- **Results**: Stored as memory tokens and governance records

#### Paper System
- **Docs Directory**: `docs/papers/{category}/*.html`
- **Paper CSS**: `docs/assets/paper.css`
- **Zenodo API**: Via `paper-engine.publish_to_zenodo()`
- **SDKs**: All paper operations exposed via REST API

#### Memory System
- **File Persistence**: Optional storage at `src/python/memory-vault/`
- **Zenodo Archival**: Via Zenodo API tokens
- **Temporal Indexing**: Query by date ranges
- **Voting System**: Upvote/downvote with reasons

### Cross-Language Support

```python
# Julia THESIS Verification
result = await workflow._call_thesis_verify(claim, evidence_sources)

# Rust Substrate Protocols  
result = await workflow.call_rust_substrate("verify", params)

# Haskell Governance Evaluation
result = await workflow.call_haskell_governance(law_name, context)

# Node.js SDKs
# Access via HTTP API at /api/sdks/*
```

## Deployment

### Local Development

```bash
# Using Docker Compose
cd src/python/deployment
docker-compose up

# Or direct Python
python -m pip install -e ".[dev]"
python -m uvicorn deployed_app:app --reload
```

### Production Deployment

#### Option 1: Vercel
```bash
cd src/python
vercel deploy
```

Set environment variables:
- `ZENODO_TOKEN` — Zenodo deposit API token
- `GITHUB_TOKEN` — GitHub repo access
- `COPILOT_API_KEY` — Optional Copilot integration

#### Option 2: Railway
```bash
railway init
railway deploy
```

#### Option 3: Enterprise (Alpha-Sovereign)
Deploy entire stack privately:

```bash
# Set up secrets
export ZENODO_TOKEN=...
export COPILOT_TOKEN=...

# Deploy
docker-compose -f deployment/docker-compose.yml up
```

### CI/CD Integration

The framework integrates with existing GitHub Actions workflows:
- **Validation**: Python linting/testing on every PR
- **Deployment**: Automatic deployment on merge to main
- **Health Checks**: Container health monitoring

## Testing

```bash
# Run all tests
pytest src/python/tests/

# With coverage
pytest --cov=src.python src/python/tests/

# Specific module
pytest src/python/tests/test_intelligence_router.py

# Watch mode
pytest-watch src/python/tests/
```

## Architecture Patterns

### Intelligence Routing (φ-weighted)
- Model selection based on task complexity
- Cost-performance optimization
- Parallel execution with fallback
- Response normalization

### Governance Enforcement
- Law parsing and evaluation
- Multi-stage pipelines
- THESIS verification integration
- Immutable audit trails

### Memory Authority
- Temporal indexing (YYYY-MM-DD queries)
- LRU cache (1000 entries default)
- Voting system (upvote/downvote)
- Zenodo persistence (optional)

### Paper Generation
- Template-based synthesis
- Metadata auto-population
- Zenodo deposit API
- DOI minting

### AI Tools
- Self-describing APIs
- Agent attribution
- Capability declarations
- Tool composition

## Configuration

Create `.env` file in `src/python/`:

```bash
# Intelligence Router
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
GOOGLE_API_KEY=...

# Memory Vault
MEMORY_VAULT_PERSISTENCE_PATH=./memory-vault
MEMORY_VAULT_CACHE_SIZE=1000

# Paper Engine
ZENODO_TOKEN=...
ZENODO_API_URL=https://zenodo.org/api

# Governance
CPL_L_PATH=../../governance/laws
CPL_P_PATH=../../governance/pipelines

# Deployment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## Performance

### Benchmarks

- **Intelligence Router**: 100-500ms per query (parallel)
- **Governance Enforcement**: 10-50ms per law
- **Memory Vault**: <1ms per operation (LRU cache)
- **Paper Generation**: 100-300ms per paper
- **API Endpoints**: <50ms response time (cached)

### Optimization

- Use Redis for distributed caching
- Parallel model calls in intelligence router
- Lazy-load large documents
- Compress memory vault snapshots
- Index by agent/type/tag for fast search

## Security

### Credential Management
- All tokens via VaultClient
- GitHub Secrets integration
- No hardcoded credentials
- Rotating token support

### Data Encryption
- SHA-256 hashing for memory vault
- End-to-end encryption for transport
- Quantum-resistant algorithms (future)

### Governance
- CPL-L law enforcement
- Multi-stage approval pipelines
- Immutable audit trails (CIL)
- Agent role-based access

## Troubleshooting

### Common Issues

**ImportError: No module named 'sovereign'**
```bash
# Fix: Add to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/src/python"
```

**Julia subprocess fails**
```bash
# Fix: Ensure Julia is installed
julia --version

# And THESIS module is available
cd julia && julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate()'
```

**Memory vault eviction too aggressive**
```python
# Increase cache size
vault = MemoryVault(cache_size=5000)
```

**Paper generation fails**
```bash
# Check docs directory exists
ls docs/papers/

# And paper.css is readable
cat docs/assets/paper.css
```

## Contributing

Guidelines for extending the framework:

1. **New Intelligence Router Models**: Add to `MODELS` dict with `ModelCapabilities`
2. **New Governance Laws**: Create CPL-L file in `governance/laws/`
3. **New AI Tools**: Extend `AIAwareTool` base class
4. **New Workflows**: Add to `CrossDomainWorkflow` class
5. **New APIs**: Add route to `deployed_app.py`

## References

- [THESIS Verification](../governance/laws/thesis-verification.cpl-l)
- [Sovereign Vault](../governance/vault/ARCHITECTURE.md)
- [Constitutional Laws](../governance/laws/)
- [Governance Pipelines](../governance/pipelines/)
- [Project Structure](../README.md)

## License

Proprietary © 2026 Freddy Medina. All Rights Reserved.
