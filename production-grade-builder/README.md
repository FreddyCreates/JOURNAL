# Production-Grade Builder

Reusable scaffolding engine for production-grade deliverable packets.

## What It Does

Scaffolds production-grade packets for any deliverable type with:
- `README.md` — purpose, usage, verification
- `PACKET_POLICY.md` — quality law for the deliverable
- `manifest.json` — machine-readable metadata
- `release_manifest.json` — release tracking
- `reports/` — build reports and scores
- `tools/quality_gate.py` — self-contained verification

## Supported Deliverable Types

| Kind | Description |
|------|-------------|
| `static-app` | Static HTML/CSS/JS applications |
| `python-service` | Python backend services |
| `node-service` | Node.js backend services |
| `benchmark-engine` | Benchmark/testing engines |
| `local-api` | Local API services |
| `ci-workflow` | CI/CD workflow definitions |
| `dataset` | Structured datasets |
| `manifest` | Registry manifests |
| `proof-pack` | Proof/evidence packets |
| `research-packet` | Research deliverables |
| `dashboard` | Dashboard interfaces |
| `docs` | Documentation packages |
| `deploy-scaffold` | Deployment scaffolds |
| `repo-surface` | Repository-level surfaces |

## Usage

```bash
# Scaffold a new deliverable
python3 production-grade-builder/tools/scaffold.py --kind python-service --name my-service --output ./output

# Run the generated quality gate
python3 ./output/my-service/tools/quality_gate.py
```

## Workflow

1. Choose the deliverable kind
2. Scaffold with the builder
3. Fill in real content
4. Run its quality gate
5. Export the production ZIP

## Verification

```bash
python3 production-grade-builder/tools/quality_gate.py
```
