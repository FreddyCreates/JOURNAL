<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/logo.svg">
  <img alt="Sovereign Organism" src="docs/assets/logo.svg" width="560">
</picture>

<br/>

[![CI](https://github.com/FreddyCreates/JOURNAL/actions/workflows/ci.yml/badge.svg)](https://github.com/FreddyCreates/JOURNAL/actions/workflows/ci.yml)
[![Protocol Validation](https://github.com/FreddyCreates/JOURNAL/actions/workflows/protocol-validation.yml/badge.svg)](https://github.com/FreddyCreates/JOURNAL/actions/workflows/protocol-validation.yml)
[![THESIS Verification](https://github.com/FreddyCreates/JOURNAL/actions/workflows/thesis-verify.yml/badge.svg)](https://github.com/FreddyCreates/JOURNAL/actions/workflows/thesis-verify.yml)
[![Organism Health](https://github.com/FreddyCreates/JOURNAL/actions/workflows/organism-health.yml/badge.svg)](https://github.com/FreddyCreates/JOURNAL/actions/workflows/organism-health.yml)
[![Governance](https://github.com/FreddyCreates/JOURNAL/actions/workflows/governance-enforcement.yml/badge.svg)](https://github.com/FreddyCreates/JOURNAL/actions/workflows/governance-enforcement.yml)
[![Pages](https://github.com/FreddyCreates/JOURNAL/actions/workflows/pages.yml/badge.svg)](https://github.com/FreddyCreates/JOURNAL/actions/workflows/pages.yml)
![Julia](https://img.shields.io/badge/Julia-1.9+-9558B2?logo=julia&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-stable-DEA584?logo=rust&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Protocols](https://img.shields.io/badge/protocols-29%20substrate%20%2B%2040%2B%20L3-6366f1)
![SDKs](https://img.shields.io/badge/SDKs-54%20packages-8b5cf6)
![Research Papers](https://img.shields.io/badge/papers-33%20published-f59e0b)
![Laws](https://img.shields.io/badge/laws-40%20constitutional-10b981)
![License](https://img.shields.io/badge/license-Proprietary-ef4444)

---

## What Is This?

**Sovereign Organism** is a complete intelligence platform — AI that owns itself.

It's not a library. It's not a framework. It's a living system: research, tools, services, and interfaces all in one place. You can read the research, use the tools, run the services, or just explore what sovereign AI looks like when it's built from scratch.

> **[🌐 Open the Live Platform →](https://freddycreates.github.io/JOURNAL/)**

---

## Who Is This For?

| You are... | Start here |
|---|---|
| 🧑 **Curious** — just want to see what this is | [Live Platform](https://freddycreates.github.io/JOURNAL/) — browse everything from your browser |
| 📖 **A reader** — want to understand the research | [Research Papers](https://freddycreates.github.io/JOURNAL/research.html) — 33 papers on sovereign AI |
| 🛠️ **A builder** — want to use the SDKs | [Getting Started (Developers)](#for-developers) — install and run locally |
| 🏢 **An organization** — want enterprise integration | [Enterprise](#enterprise-integration) — deployment guides and connectors |

---

## The Platform at a Glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOVEREIGN ORGANISM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📚 Research          33 published papers on AI architecture        │
│  🧠 Intelligence      Multi-model AI routing & orchestration        │
│  🛡️ Governance        Constitutional laws + automated enforcement   │
│  🔗 Protocols         29 substrate + 40 layer-3 verified protocols  │
│  📦 SDKs             54 production packages                         │
│  🌐 Platform          Live web interface — zero install needed      │
│  🔐 Security          Zero-knowledge proofs, sovereign encryption   │
│  ⚡ Runtime           873ms heartbeat, self-healing infrastructure   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Use It Now (No Install)

The fastest way to experience Sovereign Organism is through the live platform:

| Tool | What it does | Link |
|---|---|---|
| 🏠 **Home Portal** | Overview of the entire platform | [Open →](https://freddycreates.github.io/JOURNAL/) |
| 📄 **Research Library** | Browse 33 research papers with filters | [Open →](https://freddycreates.github.io/JOURNAL/research.html) |
| 📓 **Journal** | Live research journal and experiments | [Open →](https://freddycreates.github.io/JOURNAL/journal.html) |
| 🛡️ **Vault** | SHA-256 hashing & IP attestation tools | [Open →](https://freddycreates.github.io/JOURNAL/vault.html) |
| 📋 **Journals Library** | Categorized deep-dive journals | [Open →](https://freddycreates.github.io/JOURNAL/journals.html) |
| 🎯 **THESIS Verifier** | Claim verification system | [Open →](https://freddycreates.github.io/JOURNAL/thesis.html) |
| 🏛️ **CIVOS Prime** | Governance dashboard | [Open →](https://freddycreates.github.io/JOURNAL/civos-prime.html) |

Everything above runs in your browser. No account needed. No install. Just click.

---

## For Developers

### Quick Start

```bash
# Clone the repository
git clone https://github.com/FreddyCreates/JOURNAL.git
cd JOURNAL

# Run the full test suite
./run-all-tests.sh
```

### Language Runtimes

The platform uses multiple verified runtimes:

| Language | Purpose | Setup |
|---|---|---|
| **Julia 1.9+** | THESIS verification engine, formal proofs | `cd julia && julia thesis.jl verify .` |
| **Rust** | High-performance substrate protocols | `cd rust && cargo test` |
| **Node.js 20+** | SDK packages, protocol validation | `npm test` (in any SDK directory) |
| **Haskell** | Type-safe governance evaluation | `cd haskell && stack test` |
| **Mathematica** | Research computations, phi-encoding | `cd mathematica && wolfram -script run.wl` |
| **Motoko** | ICP canister deployments | `cd motoko && dfx build` |

### Run Verification Locally

```bash
# THESIS — verify claims against evidence
cd julia
julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate()'
julia thesis.jl verify .

# Rust — compile and test substrate core
cd rust
cargo test

# Governance — validate laws and pipelines
cd governance
npm test
```

---

## What Can It Do?

### 🧠 AI Orchestration
Route queries across GPT, Claude, Gemini, Llama, Mistral and more — the system picks the best model for each task automatically.

### 🛡️ Self-Healing
The organism detects faults, isolates them, rolls back to known-good state, and recovers — no human needed.

### 🔐 Sovereign Security
Zero-knowledge proofs, end-to-end encrypted agent communication, quantum-resistant algorithms.

### 📜 Automated Governance
40 constitutional laws enforced automatically. Multi-stage pipelines. Immutable audit trails.

### 🔗 Cross-Chain
Bridge operations across ICP, Ethereum, Solana, and Bitcoin with sovereign contract verification.

### 🌐 Mesh Federation
Connect multiple sovereign organisms into cooperative networks with reputation-based trust.

> **Full capability list →** [FEATURES.md](FEATURES.md) · **All use cases →** [USES.md](USES.md)

---

## Enterprise Integration

Deploy sovereign intelligence in your organization:

| Deployment | Description |
|---|---|
| **Alpha-Nexus** | Multi-tenant AI gateway for teams |
| **Alpha-Sovereign** | Private sovereign deployment (your infrastructure) |
| **Alpha-Cognitive** | Cognitive workflow automation |
| **Connectors** | Salesforce, SAP, Google, Slack, HubSpot, Stripe, Twilio, Shopify |

Enterprise modules live in [`enterprise/`](enterprise/) with deployment recipes in [`Platform_Playbooks_Manifest.json`](Platform_Playbooks_Manifest.json).

---

## Architecture

```
Fracture → Primitive → Sovereign SDK → Organism → Doctrine
```

Every external technology is broken down to its **primitive function**, rebuilt as a **sovereign module**, wired into the **living organism runtime**, and governed by **constitutional law**.

The system is layered:

| Layer | What | Count |
|---|---|---|
| **Substrate (L2)** | Unbreakable protocols — cannot be disabled | 29 |
| **Protocol (L3)** | Certified intelligence protocols | 40+ |
| **Governance** | Constitutional laws (CPL-L) + Pipelines (CPL-P) | 40 laws, 5+ pipelines |
| **SDK** | Production packages across all domains | 54 |
| **Runtime** | 873ms heartbeat, 4-register state, self-healing | Always on |

---

## Agents

Eight autonomous agents run the organism:

| Agent | Role |
|---|---|
| **THESIS** | Verification — proofs, claims, evidence mapping |
| **AURO** | Declaration — publications, documentation |
| **ORIGO** | Construction — building, deployment |
| **CODEX** | Execution — runtime orchestration |
| **CIVOS PRIME** | Governance — law enforcement, decisions |
| **NEXUS** | Integration — routing, bridging, federation |
| **SENTINEL** | Security — threat detection, isolation |
| **CHRONOS** | Temporal — timelines, rollback, persistence |

---

## CI / CD & Verification

Every push is verified by automated pipelines:

| Pipeline | What it checks |
|---|---|
| **CI** | Structure, protocols, governance, SDKs, Julia, Rust, docs |
| **Protocol Validation** | Syntax, exports, substrate integrity (29 protocols) |
| **THESIS Verification** | Formal proof verification, evidence mapping |
| **Organism Health** | Structural integrity, protocol coherence, federation |
| **Governance Enforcement** | Law validation, pipeline validation, charter integrity |
| **GitHub Pages** | Live platform deployment |

---

## Research

33 published research papers covering:

- Sovereign Intelligence Architecture
- Alpha Communication Protocols  
- Phi-Encoded Organisms
- Extreme Stress Testing
- Self-Healing Systems
- Quantum Coherence
- Swarm Intelligence
- Adversarial Resilience
- Neuro-Symbolic Fusion
- Morphogenetic Code Systems
- And 23 more...

> **[Browse all papers →](https://freddycreates.github.io/JOURNAL/research.html)**

---

## Project Structure

```
JOURNAL/
├── docs/                    # Live platform (GitHub Pages)
│   ├── index.html           # Home portal
│   ├── research.html        # Research paper browser
│   ├── journal.html         # Live journal
│   ├── vault.html           # Attestation tools
│   ├── thesis.html          # THESIS verification UI
│   ├── civos-prime.html     # Governance dashboard
│   └── assets/              # Styles, scripts, logo
├── protocols/               # 40+ Layer-3 intelligence protocols
│   └── substrate/           # 29 unbreakable substrate protocols
├── governance/              # Constitutional laws & pipelines
│   ├── laws/                # CPL-L constitutional laws
│   └── pipelines/           # CPL-P governance pipelines
├── sdk/                     # 54 production SDK packages
├── julia/                   # THESIS verification engine
├── rust/                    # High-performance substrate core
├── languages/               # 40+ cognitive language parsers
├── datasets/                # Training & evaluation datasets
├── enterprise/              # Enterprise deployment modules
├── haskell/                 # Type-safe governance evaluation
├── mathematica/             # Research computations
├── motoko/                  # ICP canister source
└── .github/workflows/       # 8 automated CI/CD pipelines
```

---

## Author

**Freddy Medina** · AI Researcher, Architect, Builder

- 𝕏 [@FreddyCreates](https://x.com/FreddyCreates)
- 🌐 [Live Platform](https://freddycreates.github.io/JOURNAL/)

---

<sub>© 2026 Freddy Medina. All Rights Reserved. `VAULT-ID: FREDDY.MEDINA.2026.SOVEREIGN`</sub>
