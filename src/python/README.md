# Sovereign Organism — Python Integration Framework

Python backend engine for the Sovereign Organism platform. Provides production-grade integration between research, governance, intelligence routing, and deployment systems.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│          SOVEREIGN ORGANISM — PYTHON LAYER                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  intelligence-router/      Multi-model AI orchestration    │
│  governance-executor/      CPL-L/CPL-P execution engine    │
│  memory-authority/         Temporal memory vault           │
│  deployed-app/             FastAPI live platform           │
│  paper-engine/             Automatic paper generation      │
│  ai-tools/                 AI integration & memory tokens   │
│  ai-aware-tools/           Self-describing APIs            │
│  cross-domain-uses/        Multi-domain workflows          │
│  deployment/               Docker, Kubernetes, deployment  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Install dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/

# Start development server
python -m sovereign.deployed_app.main --reload

# Run intelligence router
python -m sovereign.intelligence_router.cli verify-routing
```

## Modules

### Intelligence Router
Multi-model AI orchestration engine using async patterns. Routes queries across GPT, Claude, Gemini, Llama, Mistral with φ-weighted selection.

```python
from sovereign.intelligence_router import IntelligenceRouter

router = IntelligenceRouter()
response = await router.route_query(
    query="Verify sovereign architecture",
    models=["gpt-4", "claude-3", "gemini-pro"],
    phi_weights={"gpt-4": 0.4, "claude-3": 0.35, "gemini-pro": 0.25}
)
```

### Governance Executor
Parses and executes CPL-L (constitutional laws) and CPL-P (governance pipelines).

```python
from sovereign.governance_executor import GovernanceExecutor

executor = GovernanceExecutor()
result = await executor.enforce_law(
    law_name="sovereign-vault",
    context={"caller": "zenodo-deposit-agent"}
)
```

### Memory Authority SDK
Production memory vault with temporal indexing, cryptographic hashing, and Zenodo persistence.

```python
from sovereign.memory_authority import MemoryVault

vault = MemoryVault()
memory_id = vault.store(
    content="Research finding",
    agent="THESIS",
    timestamp="2026-06-14T01:19:07Z",
    tags=["verification", "claim"]
)
```

### Paper Engine
Automatic generation of research papers from THESIS verification results and governance seals.

```python
from sovereign.paper_engine import PaperSynthesizer

synthesizer = PaperSynthesizer()
paper = await synthesizer.generate_paper(
    thesis_result=verification_result,
    category="architecture",
    author_agent="AURO"
)
```

## Integration Points

### VaultClient Integration
All modules integrate with the Sovereign Vault for credential management:

```python
from sovereign.vault import VaultClient

vault = VaultClient(ledger_path="../governance/vault/ledger.json")
zenodo_token = vault.get("MEDINASITECH", caller="paper-publisher")
```

### Cross-Language Support
- **Julia**: Call THESIS verification via subprocess
- **Rust**: Substrate protocol calls via HTTP API
- **Node.js**: SDK integration via npm packages
- **Haskell**: Governance evaluation via subprocess
- **Motoko**: ICP canister interactions

### THESIS Verification
```python
from sovereign.cross_domain_uses import verify_with_thesis

result = await verify_with_thesis(
    claim="Architecture is sovereign",
    evidence_paths=["docs/papers/architecture/"],
    timeout=300
)
```

## Testing

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=sovereign tests/

# Run specific module tests
pytest tests/test_intelligence_router.py
```

## Deployment

### Local Development
```bash
# Using Docker Compose
docker-compose up

# Or direct installation
pip install -e ".[dev]"
python -m sovereign.deployed_app.main
```

### Production
- FastAPI deployed on Vercel/Netlify/Railway
- Real-time sync with GitHub repo
- Caching layer for performance
- Enterprise deployments: Alpha-Sovereign, Alpha-Nexus, Alpha-Cognitive

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md)
- [AI Tools Registry](docs/AI_TOOLS.md)
- [Memory Token System](docs/MEMORY_TOKENS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Integration Patterns](docs/INTEGRATION_PATTERNS.md)

## License

Proprietary. Copyright © 2026 Freddy Medina. All Rights Reserved.
