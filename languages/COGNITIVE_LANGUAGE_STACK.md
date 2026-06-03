# Cognitive Language Stack

> Master specification mapping all 13 languages to their implementations, phases, and relationships within the Intelligence Organism architecture.

## Overview

The Cognitive Language Stack is a unified DSL (Domain-Specific Language) architecture that governs every layer of the Intelligence Organism — from contract law and cognitive processing to agent communication, organism control, and education. Each language is purpose-built for a specific domain, compiles to the organism substrate (Motoko/ICP or JavaScript runtime), and interoperates through a shared type system rooted in φ-resonance primitives.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COGNITIVE LANGUAGE STACK                          │
│                                                                     │
│  Phase 3 — Education    ┌─────┬─────┬─────┬─────┐                  │
│  (Student-Facing)       │ SPL │ EDL │ PWL │ TSL │                  │
│                         └──┬──┴──┬──┴──┬──┴──┬──┘                  │
│                            │     │     │     │                      │
│  Phase 2 — Parsers      ┌─┴───┬─┴───┬─┴───┬─┴───┐                 │
│  (Emerging)             │ CDL │ OCL │ ACL │ RSL  │                 │
│                         └──┬──┴──┬──┴──┬──┴──┬───┘                 │
│                            │     │     │     │                      │
│  Phase 1 — Core Specs   ┌─┴────┬┴────┬┴────┬┴───┬─────┐           │
│  (Formal)               │CPL-L │CPL-C│CPL-P│ TPL│ CIL │           │
│                         └──┬───┴──┬──┴──┬──┴──┬─┴──┬──┘           │
│                            │      │     │     │    │               │
│  Substrate               CPL   COGPRO   SL   Motoko  JS           │
│  (Existing)              TT012Sovereign.mo / ICP Runtime           │
└─────────────────────────────────────────────────────────────────────┘
```

## Language Registry — All 13 Languages

| # | Language | Full Name | Phase | Domain | Substrate Target | Status |
|---|----------|-----------|-------|--------|-----------------|--------|
| 1 | **CPL-L** | Contract Procurement Language — Legal | 1 | Legal contracts, obligations, covenant seals | Motoko (CPL in TT012Sovereign.mo) | Spec |
| 2 | **CPL-C** | Contract Procurement Language — Cognitive | 1 | Cognitive state expressions, COGPRO bindings | Motoko (COGPRO in TT012Sovereign.mo) | Spec |
| 3 | **CPL-P** | Contract Procurement Language — Procurement | 1 | Token procurement, resource acquisition, split/merge | Motoko (CPL contracts in TT012Sovereign.mo) | Spec |
| 4 | **TPL** | Token Processing Language | 1 | Token lifecycle: mint, merge, split, evolve, attest | Motoko (TT012Sovereign.mo operations) | Spec |
| 5 | **CIL** | Cognitive Instruction Language | 1 | Low-level cognitive instructions, register operations | Motoko / JS (organism state registers) | Spec |
| 6 | **CDL** | Cognitive Definition Language | 2 | Define cognitive models, schemas, and type hierarchies | JS (callable-registry.js categories) | Parser |
| 7 | **OCL** | Organism Control Language | 2 | Organism lifecycle, heartbeat control, kernel execution | JS (organism-runtime-sdk) | Parser |
| 8 | **ACL** | Agent Communication Language | 2 | Agent-to-agent messaging, council findings, wire protocol | JS/Motoko (ORO AgentFindings.mo) | Parser |
| 9 | **RSL** | Resonance Specification Language | 2 | φ-resonance patterns, cross-organism sync, spatial coordinates | JS (phi-resonance-sync-protocol.js) | Parser |
| 10 | **SPL** | Student Programming Language | 3 | Simplified organism programming for learners | JS (education runtime) | Education |
| 11 | **EDL** | Educational Definition Language | 3 | Lesson plans, curricula, knowledge graph definitions | JS (education runtime) | Education |
| 12 | **PWL** | Pattern Writing Language | 3 | Pattern templates, intelligence model authoring | JS (education runtime) | Education |
| 13 | **TSL** | Tutorial Specification Language | 3 | Interactive tutorials, step-by-step walkthroughs | JS (education runtime) | Education |

## Phase Dependency Map

```
Phase 1 (Core Specs)          Phase 2 (Parsers)           Phase 3 (Education)
────────────────────          ─────────────────           ───────────────────
CPL-L ──────────────────────→ CDL (uses CPL-L types)  ──→ SPL (simplified CDL)
CPL-C ──────────────────────→ OCL (uses CPL-C state)  ──→ EDL (teaches OCL)
CPL-P ──────────────────────→ ACL (uses CPL-P tokens) ──→ PWL (pattern authoring)
TPL  ───────────────────────→ RSL (uses TPL lifecycle) ─→ TSL (tutorial engine)
CIL  ───────────────(shared instruction set across all Phase 2 and 3 languages)
```

## Existing Implementation Mappings

### Substrate Languages (Already Implemented)

| Language | Implementation File | Key Constructs |
|----------|-------------------|----------------|
| **CPL** | `motoko/TT012Sovereign.mo` (line 65) | `LANG_CONTRACT = "CPL"` — covenant seals, contract IDs, split contracts |
| **COGPRO** | `motoko/TT012Sovereign.mo` (line 66) | `LANG_COGNITION = "COGPRO"` — cognitive state expressions (BORN, MERGED, SPLIT, EVOLVED) |
| **SL** | `motoko/TT012Sovereign.mo` (line 67) | `LANG_LAW = "SL"` — sovereign law IDs, governance rules |

### Protocol Mappings (Informing Phase 2 Parsers)

| Phase 2 Language | Existing Protocol | Protocol File |
|-----------------|-------------------|---------------|
| **CDL** | Blueprint Assembly | `protocols/blueprint-assembly-protocol.js` |
| **OCL** | Organism Lifecycle | `protocols/organism-lifecycle-protocol.js` |
| **ACL** | Edge Mesh Intelligence | `protocols/edge-mesh-intelligence-protocol.js` |
| **RSL** | Phi Resonance Sync | `protocols/phi-resonance-sync-protocol.js` |

### SDK Mappings (Informing Runtime Targets)

| Language | Target SDK | SDK Purpose |
|----------|-----------|-------------|
| CPL-L, CPL-P | `sovereign-encryption-sdk` | Encrypted contract operations |
| CPL-C, CIL | `sovereign-memory-sdk` | Cognitive state storage |
| TPL | `encryption-token-sdk` | Token processing substrate |
| CDL | `ai-model-engines` | Cognitive model definitions |
| OCL | `organism-runtime-sdk` | Organism lifecycle control |
| ACL | `intelligence-routing-sdk` | Agent routing and communication |
| RSL | `sensor-array-sdk` | Resonance sensing and sync |

## Shared Type System

All 13 languages share a common type system rooted in the organism's core primitives:

```
┌─────────────────────────────────────────────────┐
│              SHARED TYPE PRIMITIVES              │
├─────────────────────────────────────────────────┤
│  PhiCoordinate  = { θ, φ, ρ, ring, beat }      │
│  TokenId        = Text (hash-prefixed)           │
│  CovenantSeal   = Text ("SEAL::" prefixed)       │
│  CogState       = Text ("COGPRO::" prefixed)     │
│  LawId          = Text ("SL-NNN::" prefixed)     │
│  ContractId     = Text ("CPL::" prefixed)        │
│  Heartbeat      = Nat (873ms cycle)              │
│  PhiWeight      = Float (φ-derived)              │
│  Register       = Cognitive | Affective |        │
│                   Somatic | Sovereign            │
└─────────────────────────────────────────────────┘
```

## File Structure

```
languages/
├── COGNITIVE_LANGUAGE_STACK.md        ← This document (master overview)
├── specs/                              ← Phase 1: Formal specifications
│   ├── CPL-L-spec.md                   │  Contract Procurement Language — Legal
│   ├── CPL-C-spec.md                   │  Contract Procurement Language — Cognitive
│   ├── CPL-P-spec.md                   │  Contract Procurement Language — Procurement
│   ├── TPL-spec.md                     │  Token Processing Language
│   └── CIL-spec.md                     │  Cognitive Instruction Language
├── parsers/                            ← Phase 2: Parser implementations
│   ├── CDL-parser-spec.md              │  Cognitive Definition Language
│   ├── OCL-parser-spec.md              │  Organism Control Language
│   ├── ACL-parser-spec.md              │  Agent Communication Language
│   └── RSL-parser-spec.md              │  Resonance Specification Language
└── education/                          ← Phase 3: Student-facing tools
    ├── SPL-education-spec.md           │  Student Programming Language
    ├── EDL-education-spec.md           │  Educational Definition Language
    ├── PWL-education-spec.md           │  Pattern Writing Language
    └── TSL-education-spec.md           │  Tutorial Specification Language
```

## Cross-References

- **Architectural Laws**: `Architectural_Laws_Register.csv` — AL-037 through AL-040 govern the fracture→primitive→sovereign→organism pipeline that all 13 languages compile through
- **SDK Manifest**: `SDK_Model_Manifest.json` — Maps SDK modules to frontier models
- **Token Engine**: `motoko/TT012Sovereign.mo` — Reference implementation of CPL, COGPRO, and SL
- **ORO Governance**: `motoko/ORO/` — Agent council and governance intelligence (ACL target)
- **Protocols**: `protocols/` — 16 protocol implementations informing Phase 2 parser design
