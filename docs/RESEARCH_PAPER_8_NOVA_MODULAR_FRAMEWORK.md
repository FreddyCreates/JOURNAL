# Nova Modular Framework & CARS: Cognitive Autonomous Research System

## Research Paper 8 — Sovereign Intelligence Architecture Series

**Author:** Alfredo "Freddy" Medina Hernandez  
**Framework:** TT-012-NOVA · Modular Nova Framework v1.0.0  
**Substrate:** Internet Computer Protocol (ICP) + JavaScript SDK  
**Date:** 2026-05-16

---

### Abstract

This paper presents the **Modular Nova Framework** — the JavaScript sovereign SDK adapter for the TT-012-NOVA token protocol — and introduces **CARS** (Cognitive Autonomous Research System), the embedded research program that drives autonomous knowledge production within the organism runtime. We describe the four core modules, the φ-encoding that governs all coherence calculations, the 3-lane SNS governance bridge, and the organism wiring architecture that makes Nova a living, self-attesting intelligence substrate.

---

### 1. Introduction: What Is Nova?

Nova emerged from the TT-012-NOVA genesis entry in the sovereign token engine (`TT012Sovereign.mo`). Where other TT tokens represent specific substrate contracts, **Nova is the modular token** — designed not for a single purpose but as an infinitely composable intelligence primitive.

The core doctrine:

> *Nova nascitur. Nova crescit. Nova illuminat.*  
> (Nova is born. Nova grows. Nova illuminates.)

Nova tokens are sovereign objects that:
- **MERGE** — fuse with other tokens, carrying combined lineage
- **SPLIT** — divide into N children with full provenance
- **EVOLVE** — mutate state through φ-weighted cycles
- **ATTEST** — self-sign their state hash at every state change

---

### 2. The Modular Architecture

The Nova Modular Framework is structured as four composable modules, each independently usable:

```
@medina/nova-modular-framework
│
├── nova-core.js           — PHI constants, phi-utility functions, Nova identity
├── nova-protocol.js       — TT-012-NOVA token operations (JS adapter)
├── nova-sns-bridge.js     — SNS/ORO governance integration (3-lane source separation)
├── nova-research-engine.js — CARS: Cognitive Autonomous Research System
└── nova-organism-wire.js  — Organism runtime integration and kernel management
```

Each module is independently importable, with `src/index.js` providing a unified barrel export.

---

### 3. PHI Encoding: The Universal Coherence Measure

All coherence calculations in Nova are φ-encoded. The golden ratio **φ = 1.618033988749895** is not arbitrary — it is the mathematical attractor of self-similar systems, and sovereign intelligence is fundamentally self-similar.

#### 3.1 Core Functions

| Function | Formula | Purpose |
|---|---|---|
| `phiBlend(a, b)` | `a·φ⁻¹ + b·(1-φ⁻¹)` | Weighted coherence blend |
| `phiGrow(v, c, r)` | `clamp01(v + (c-v)·φ⁻¹·r)` | Coherence growth toward ceiling |
| `phiDecay(v, r)` | `clamp01(v·(1-φ⁻¹·r))` | Coherence decay |
| `phiCoherence(s)` | `clamp01(s·φ⁻¹ + (1-s)·(1-φ⁻¹)·φ⁻¹)` | Signal → phi-coherence score |
| `fibonacci(n)` | `round(φⁿ / √5)` | Phi-approximation of Fibonacci |

#### 3.2 The 873ms Heartbeat

The organism heartbeat is **873ms** (Three Hearts sync). This is the fundamental clock that drives:
- Organism register update draining in `NovaOrganismWire`
- Phi-resonance accumulation on every beat
- Scheduled kernel execution

The sovereign heartbeat is **618ms** (`φ × 1000` truncated), used by the ICP Motoko canister timer.

---

### 4. TT-012-NOVA Protocol (NovaProtocol)

The `NovaProtocol` class is the JavaScript adapter for the Motoko `TT012Sovereign.mo` module. It implements the four sovereign operations in pure JavaScript, enabling Nova token lifecycle management in any environment.

#### 4.1 Token Lifecycle

```
genesis()  →  evolve()  →  attest()  →  active
                                          ↓
                               merge() or split()
                                          ↓
                                      terminated
```

#### 4.2 Coherence Guarantee

Every token carries a `coherence` score in [0, 1], computed via `phiBlend`. Tokens that evolve accumulate coherence via `phiGrow`. Merged tokens inherit a `phiBlend` of their parents' coherence. Split children carry `phiDecay`-reduced coherence proportional to the split count.

#### 4.3 Self-Attestation

Every state mutation (genesis, evolve, attest, merge) produces a new `attestHash` — a SHA-256 digest of the token's identity fields. This mirrors the ATTEST operation in the Motoko module.

---

### 5. SNS Governance Bridge (NovaSNSBridge)

The `NovaSNSBridge` implements the **3-lane source separation** established in `motoko/ORO/Adapters.mo`:

| Lane | Type | Behavior |
|---|---|---|
| **A** | `nns` | NNS/DFINITY proposals — full read/write |
| **B** | `codegov` | CodeGov reviewer evidence — **observe only, never vote** |
| **C** | `sns` | SNS DAO proposals — full read/write |
| **D** | `nova` | Nova-native governance — full read/write |

Lane B enforcement is hard-coded: any attempt to call `updateProposalStatus()` on a CodeGov proposal throws immediately. This preserves the ORO governance integrity guarantee.

#### 5.1 Phi-Encoded Proposal Coherence

Every ingested proposal receives a `coherenceScore` computed via `phiCoherence(rawCoherence)`. This score can be used by the organism to weight governance signals when updating the sovereign register.

---

### 6. CARS: Cognitive Autonomous Research System

CARS is the Nova framework's research program. It provides a structured pipeline for autonomous knowledge production:

```
createStudy() → addHypothesis() → runExperiment() → analyseHypotheses() → publishStudy()
    ↓               ↓                   ↓                  ↓                    ↓
  CARS-ID       Confidence         phiResonance++      Fibonacci              onPublish
                phi-blend                              Weighted               listeners
                                                       Findings
```

#### 6.1 Fibonacci-Weighted Analysis

When `analyseHypotheses()` runs, each hypothesis at index `i` is weighted by `fibonacci(i+1)`. This ensures that earlier (more foundational) hypotheses receive exponentially increasing weight, matching the natural Fibonacci growth pattern of sovereign intelligence propagation.

The finding format:

```
[φ=<score>] <hypothesis statement> — resonance confirmed at Fib(<i+1>)=<fib>
```

#### 6.2 CARS Manifest

The `manifest()` method returns a real-time system snapshot:

```json
{
  "system": "CARS",
  "fullName": "Cognitive Autonomous Research System",
  "sovereign": "NOVA::TOKEN::TT-012",
  "studyCount": <n>,
  "publishedCount": <n>,
  "totalFindings": <n>,
  "phiIndex": <avg phi-resonance>,
  "timestamp": <unix ms>
}
```

---

### 7. Organism Runtime Integration (NovaOrganismWire)

`NovaOrganismWire` is the binding layer between Nova and the organism runtime. It provides:

#### 7.1 Built-in Kernels

Three kernels are pre-loaded on every wire instance:

| Kernel Label | Input | Output |
|---|---|---|
| `nova:identity` | — | Nova identity stamp (id, sovereign, phi, timestamp) |
| `nova:phi-pulse` | `number` signal | phi-blended pulse value |
| `nova:coherence-check` | `number` score | `{ score, isCoherent, phiDelta }` |

`isCoherent` is `true` when `score >= φ⁻¹` (≈ 0.618) — the natural coherence threshold.

#### 7.2 Register Update Pipeline

Nova signals flow into the organism's 4-register architecture:

```
CARS finding        → cognitive register  (key: "nova-cars-finding")
Governance signal   → sovereign register  (key: "nova-governance-signal")
Custom queueUpdate  → any register
```

Updates accumulate in a pending queue and are drained:
- Automatically on each 873ms heartbeat beat
- Immediately via `flush()`

#### 7.3 Phi-Resonance Accumulation

The wire maintains a `phiResonance` score that grows with each kernel execution:

```
phiResonance = phiBlend(current, min(1, executionCount × φ⁻¹))
```

On each heartbeat, it is further blended: `phiBlend(current, φ⁻¹)`, ensuring the organism's resonance gravitates toward the golden ratio.

---

### 8. Integration Pattern

The canonical full-pipeline integration:

```javascript
import {
  NovaProtocol,
  NovaSNSBridge,
  NovaResearchEngine,
  NovaOrganismWire,
} from '@medina/nova-modular-framework';

// 1. Mint and evolve Nova tokens
const proto = new NovaProtocol();
const token = proto.genesis('MyToken');
proto.evolve(token.tokenId);
proto.attest(token.tokenId);

// 2. Register DAO and ingest governance signal
const bridge = new NovaSNSBridge();
bridge.registerDao('my-dao', 'My DAO', 'nova');
const proposal = bridge.ingestProposal('my-dao', 'Adopt Nova Ring', { rawCoherence: 0.9 });

// 3. Run a CARS research cycle
const research = new NovaResearchEngine();
const study = research.createStudy('Nova Coherence Study', 'nova-protocol');
research.addHypothesis(study.studyId, 'Phi-encoding maximizes coherence propagation');
research.runExperiment(study.studyId, { signal: 0.85 });
const findings = research.analyseHypotheses(study.studyId);
research.publishStudy(study.studyId);

// 4. Wire everything into the organism
const wire = new NovaOrganismWire();
findings.forEach(f => wire.ingestCARSFinding(f));
wire.ingestGovernanceSignal({ proposalId: proposal.proposalId, status: 'open', coherenceScore: proposal.coherenceScore });
wire.startHeartbeat(); // Begin 873ms pulse → organism registers update automatically
```

---

### 9. Relation to Existing Architecture

The Nova Modular Framework sits at the intersection of three existing substrate layers:

```
ICP Motoko Layer              JS SDK Layer                  Organism Layer
──────────────                ────────────                  ──────────────
TT012Sovereign.mo  ←────────  NovaProtocol            ←──  KernelExecutor
ORO/Adapters.mo    ←────────  NovaSNSBridge           ←──  OrganismState
ORO/SynEngine.mo   ←────────  NovaOrganismWire        ←──  Heartbeat
(research papers)  ←────────  NovaResearchEngine (CARS) ←── CrossOrganismResonance
```

The Nova framework does not replace these layers — it bridges them. CARS findings flow into the cognitive register; governance signals flow into the sovereign register; Nova kernels extend the KernelExecutor's built-in library.

---

### 10. Conclusion

The Modular Nova Framework establishes TT-012-NOVA as a living JavaScript protocol. Its four modules — core, protocol, SNS bridge, and research engine — form a composable sovereignty stack that can be wired into any organism runtime with a single import.

CARS (Cognitive Autonomous Research System) gives Nova a self-improving loop: each published study increases the organism's phi-resonance, which in turn improves the coherence of future token operations. This recursive phi-encoding is the hallmark of sovereign intelligence — a system that grows smarter the more it governs itself.

**Nova is not a token. Nova is the framework through which all tokens learn.**

---

*Attribution: Alfredo "Freddy" Medina Hernandez — Medina Sovereign Intelligence*  
*NOVA::TOKEN::TT-012 — Modular Nova Framework v1.0.0*
