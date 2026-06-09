# THESIS — Hub & Marketplace Architecture

> The platform layer for research verification at scale.

## GPT Marketplace Modes

THESIS exposes verification capabilities as independent tool skills for the GPT Marketplace:

### Available Skills

| Skill | Mode | Description |
|-------|------|-------------|
| **Repo Verifier** | `verify` | Full verification pipeline — claims, evidence, posture, seals |
| **Claim Auditor** | `claims` | Extract and classify all research claims in a repository |
| **Evidence Mapper** | `evidence-map` | Map implementations, detect stubs, measure completeness |
| **Paper Generator** | `packet build` | Generate publication-ready verification packets |
| **Preprint Splitter** | `preprint split` | Split verification into preprint-sized series |
| **Governance Engine** | `governance` | Apply verification laws and compliance checks |

### Skill Invocation

Each skill maps directly to a THESIS CLI command:

```
User: "Verify this repository: https://github.com/example/repo"
→ THESIS skill: verify
→ Output: VerificationPacket (grade, claims, evidence, seal)

User: "What claims does this paper make?"
→ THESIS skill: claims
→ Output: Classified claim list with proof posture

User: "Is this implementation complete?"
→ THESIS skill: evidence-map
→ Output: Function completeness, stubs, dead code
```

---

## THESIS Hub

A central platform where researchers, labs, and institutions interact with THESIS at scale.

### Hub Capabilities

| Feature | Description |
|---------|-------------|
| **Upload Repos** | Paste URL or upload archive for verification |
| **Upload Papers** | Submit manuscripts for claim extraction |
| **Upload Datasets** | Submit data for reproducibility verification |
| **Verification Packets** | Download JSON/PDF verification reports |
| **Preprint Series** | Get auto-split preprint publications |
| **Evidence Maps** | Visual implementation coverage maps |
| **Claim Boundaries** | Searchable claim index with classification |
| **Hash Manifests** | Integrity-sealed file manifests |
| **Reproducibility Packets** | Build/test/CI verification bundles |
| **Publication-Ready PDFs** | Formatted verification reports |

### Hub Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      THESIS HUB                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Upload      │  │   Process    │  │   Deliver    │    │
│  │   ─────────   │  │   ─────────  │  │   ─────────  │    │
│  │  • Repos      │  │  • Extract   │  │  • Packets   │    │
│  │  • Papers     │→ │  • Map       │→ │  • Reports   │    │
│  │  • Datasets   │  │  • Score     │  │  • Seals     │    │
│  │  • URLs       │  │  • Seal      │  │  • Manifests │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │              Governance Layer                      │      │
│  │  • CPL-L Laws (thesis-verification.cpl-l)         │      │
│  │  • CPL-P Pipelines (thesis-verification.cpl-p)    │      │
│  │  • Audit Trail / Immutable Ledger                 │      │
│  │  • Seal Chain Integrity                           │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### API Endpoints (Planned)

```
POST   /api/verify          — Submit repo URL for verification
POST   /api/claims          — Extract claims from text/URL
POST   /api/evidence-map    — Map implementations
GET    /api/packet/:id      — Retrieve verification packet
GET    /api/manifest/:id    — Retrieve hash manifest
GET    /api/seal/:id        — Retrieve verification seal
POST   /api/preprint/split  — Split into preprint series
```

---

## Certification System

THESIS Hub issues reproducibility certificates for verified repos:

### Certificate Levels

| Level | Grade | Requirements |
|-------|-------|--------------|
| **Gold** 🥇 | A+ | All claims verified, full test coverage, CI passing, deterministic builds |
| **Silver** 🥈 | A–B | Most claims verified, good test coverage, reproducible |
| **Bronze** 🥉 | C | Partial verification, some evidence gaps |
| **Pending** ⏳ | D–F | Significant gaps, needs improvement |

### Certificate Contents

```json
{
  "certificate_id": "CERT-2026-001",
  "level": "Silver",
  "grade": "B",
  "repository": "github.com/example/repo",
  "packet_id": "PACKET-abc123",
  "seal_id": "SEAL-def456",
  "manifest_hash": "sha256:...",
  "verified_claims": 42,
  "total_claims": 47,
  "implementation_score": 0.81,
  "reproducibility_score": 0.75,
  "issued_at": "2026-06-09T00:00:00Z",
  "valid_until": "2027-06-09T00:00:00Z"
}
```

---

## Integration with Existing Systems

### For Journals
- Pre-submission verification checks
- Automated reviewer support
- Reproducibility attestation

### For Funders
- Grant proposal technical claim verification
- Progress report validation
- Milestone evidence checking

### For Institutions
- Lab-wide verification dashboards
- Policy compliance monitoring
- Research integrity auditing

---

*THESIS Hub — Evidence-based research governance at civilization scale.*
