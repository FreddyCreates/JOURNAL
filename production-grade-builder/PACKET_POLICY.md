# Production-Grade Packet Policy

**Version:** 1.0.0  
**Scope:** All deliverables produced in this repository  
**Authority:** Root governance law

## The Production-Grade Law

Every deliverable — regardless of surface type — MUST satisfy:

1. **README.md** exists and describes purpose, usage, and verification steps
2. **PACKET_POLICY.md** exists and defines quality constraints for the deliverable
3. **manifest.json** exists with valid JSON containing: name, version, kind, created_at
4. **release_manifest.json** exists tracking release state
5. **tools/quality_gate.py** exists and passes without error (exit 0)
6. **reports/** directory exists with at least one build report

## Surface-Specific Requirements

### Static Apps
- `index.html` present
- No broken relative links in HTML files

### Python Services
- `requirements.txt` or `pyproject.toml` present
- Entry point file exists (e.g., `app.py`, `main.py`, or `__main__.py`)

### Node Services
- `package.json` present with name and version
- Entry point exists (e.g., `index.js`, `server.js`)

### APIs (local-api)
- OpenAPI spec or route manifest present
- Entry point file exists

### CI Workflows
- At least one `.yml` workflow file present
- Workflow references valid actions

### Datasets
- Data file present (CSV, JSON, or Parquet)
- Schema or data dictionary present

### Manifests
- Valid JSON/YAML manifest file
- Schema reference present

### Proof Packs
- Evidence files present
- Verification script or checksum file present

### Research Packets
- Paper or findings document present
- References/citations file present

### Dashboards
- Dashboard entry point (HTML or config)
- Data source reference present

### Docs
- At least one documentation file present
- Table of contents or index present

### Deploy Scaffolds
- Deployment configuration present (Dockerfile, terraform, k8s manifest, etc.)
- Environment template present

### Repo Surfaces
- Repository metadata files present
- Contributing guidelines present

## Enforcement

The quality gate (`tools/quality_gate.py`) checks all universal requirements.
Surface-specific checks are advisory and logged as warnings.

## Non-Negotiable

- No deliverable ships without passing its quality gate
- No deliverable ships without a manifest
- No deliverable ships without a README
