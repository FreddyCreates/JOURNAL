# Memory Authority SDK

**Authority-governed memory for durable artificial cognition.**

Implements the **Memory Runtime Hypothesis**: durable intelligence requires runtime memory law. Generative processes (FOUNDATION_FLOOR) cannot directly mutate canonical memory (MEMORY_RUNTIME) without mediated review through the Bounded Authority Membrane.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  NOVA_ROOT — Lawful runtime authority               │
│  (read/write all layers, override capability)       │
├─────────────────────────────────────────────────────┤
│  MEMORY_RUNTIME — Canonical, append-only memory     │
│  (write: NOVA_ROOT only via promotion engine)       │
├─────────────────────────────────────────────────────┤
│  ACTIVE_STATE — Live cognition and synthesis        │
│  (working memory, drafts, candidates)               │
├─────────────────────────────────────────────────────┤
│  FOUNDATION_FLOOR — Heavy compute                   │
│  (NO direct write to MEMORY_RUNTIME)                │
└─────────────────────────────────────────────────────┘
```

## Modules

| Module | Purpose |
|--------|---------|
| `AuthorityGate` | Enforcement layer — evaluates resonance, evidence, class, and source before permitting passage |
| `ClaimRegister` | Append-only registry with integrity hashing, lineage tracking, source/class indexing |
| `PromotionEngine` | Manages claim lifecycle: hypothesis → draft → candidate → canonical |
| `BoundedMembrane` | Four-layer write/read enforcement — the architectural boundary itself |

## Claim Promotion Path

```
hypothesis → draft → candidate → canonical
   (FLOOR)   (ACTIVE)  (ACTIVE)    (MEMORY_RUNTIME)
```

Each step requires:
- **hypothesis → draft**: No evidence required, resonance threshold
- **draft → candidate**: 1+ evidence attachment, higher resonance
- **candidate → canonical**: 2+ evidence, AuthorityGate passage, highest resonance

## Key Principles

1. **Generation ≠ Truth** — Output from compute does not become canonical automatically
2. **Imagination ≠ Canonization** — Hypotheses must earn promotion through evidence
3. **Synthesis ≠ Lineage Rewrite** — Supersession preserves full history
4. **Safety requires friction** — Promotion cooldowns and denial limits are features

## Usage

```javascript
import { AuthorityGate, ClaimRegister, PromotionEngine, BoundedMembrane } from 'memory-authority-sdk';

// Initialize the authority stack
const membrane = new BoundedMembrane();
const register = new ClaimRegister();
const gate = new AuthorityGate({ resonanceFloor: 0.618 });
const engine = new PromotionEngine({ register, gate });

// Register components at their layers
membrane.registerComponent('llm-engine', 'foundation_floor');
membrane.registerComponent('memory-store', 'memory_runtime');

// Create a claim from a generative process
const claim = register.register({
  sourceId: 'llm-engine',
  content: 'The system demonstrates 99.7% uptime',
  evidencePosture: 'speculative'
});

// Attempt direct write — BLOCKED by membrane
const writeAttempt = membrane.attemptWrite('llm-engine', 'memory_runtime');
// → { permitted: false, reason: "Layer 'foundation_floor' cannot write to 'memory_runtime'" }

// Proper path: promote through the engine
engine.promote(claim.id, 'reviewer-1', 'Initial review passed');  // → draft
// ... attach evidence, build resonance ...
engine.promote(claim.id, 'reviewer-1', 'Evidence confirmed');     // → candidate
engine.promote(claim.id, 'reviewer-1', 'Gate passage approved');  // → canonical
```

## Protocol Integration

Wires into **PROTO-012: Memory Runtime Governance Protocol** (MRGP) which provides the full protocol-level implementation with heartbeat integration, cross-organism resonance, and organism lifecycle awareness.

## Tests

```bash
node --test test/*.test.js
```

30 tests covering:
- Authority gate enforcement (resonance, evidence, class, trust)
- Claim registration (append-only, indexing, integrity, lineage)
- Promotion lifecycle (path enforcement, denial limits, NOVA override)
- Bounded membrane (write rules, read rules, violations, metrics)

## Ring Affinity

**Memory Ring** — Integrates with `sovereign-memory-sdk` spatial store and memory lineage.

## Author

Freddy Medina — Memory Vault Research Platform
