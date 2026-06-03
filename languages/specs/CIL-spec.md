# CIL — Cognitive Instruction Language

> Formal specification for the low-level instruction set governing cognitive register operations, heartbeat synchronization, and organism state manipulation.

## 1. Purpose

CIL (Cognitive Instruction Language) is the **lowest-level language** in the Cognitive Language Stack. It defines the instruction set that all higher-level languages (CPL-L, CPL-C, CPL-P, TPL) compile to. CIL provides:
- Direct register read/write operations on the 4-register architecture
- Heartbeat synchronization primitives (873ms cycle)
- Memory addressing via φ-encoded coordinates
- Arithmetic with φ-weighted values
- Control flow (conditional, loop, call, return)
- Inter-organism messaging primitives

## 2. Substrate Mapping

| Construct | Implementation Reference | File |
|-----------|------------------------|------|
| 4-Register Architecture | OrganismState (Cognitive/Affective/Somatic/Sovereign) | organism-runtime-sdk |
| Evolution Cycle | 873ms cycle, `EVOLUTION_CYCLE_MS` | TT012Sovereign.mo, line 49 |
| Phi Constant | `PHI = 1.618...` | TT012Sovereign.mo, line 44 |
| Callable Registry | 820 callable functions | src/callable-registry.js |
| Terminal Stations | 16 AGIS terminal stations | src/terminals/agis-router.js |

## 3. Instruction Set

### 3.1 Register Operations

| Opcode | Mnemonic | Operands | Description |
|--------|----------|----------|-------------|
| `0x01` | `RLOAD` | `reg, addr` | Load value from memory into register |
| `0x02` | `RSTORE` | `reg, addr` | Store register value to memory |
| `0x03` | `RMOV` | `dst, src` | Copy value between registers |
| `0x04` | `RSET` | `reg, imm` | Set register to immediate value |
| `0x05` | `RGET` | `reg` | Push register value to stack |

### 3.2 Phi Arithmetic

| Opcode | Mnemonic | Operands | Description |
|--------|----------|----------|-------------|
| `0x10` | `PHIADD` | `dst, a, b` | φ-weighted addition: dst = a + b × φ |
| `0x11` | `PHIMUL` | `dst, a, b` | φ-weighted multiplication: dst = a × b × φ |
| `0x12` | `PHISCALE` | `dst, src, w` | Scale by φ-weight: dst = src × (φ^w) |
| `0x13` | `PHICOORD` | `dst, θ, φ, ρ, ring, beat` | Construct φ-coordinate |
| `0x14` | `PHIDIST` | `dst, c1, c2` | φ-distance between two coordinates |

### 3.3 Heartbeat Synchronization

| Opcode | Mnemonic | Operands | Description |
|--------|----------|----------|-------------|
| `0x20` | `HBEAT` | — | Wait for next heartbeat (873ms) |
| `0x21` | `HSYNC` | `count` | Wait for N heartbeats |
| `0x22` | `HPHASE` | `dst` | Get current heartbeat phase |
| `0x23` | `HTIMER` | `callback, beats` | Schedule callback after N beats |

### 3.4 Cognitive Operations

| Opcode | Mnemonic | Operands | Description |
|--------|----------|----------|-------------|
| `0x30` | `COGSET` | `state_expr` | Set cognitive state (COGPRO:: prefix) |
| `0x31` | `COGGET` | `dst` | Get current cognitive state |
| `0x32` | `COGTRANS` | `from, to, phi_w` | Cognitive transition with φ-weight |
| `0x33` | `COGPULSE` | `reg, beats` | Pulse register for N heartbeats |

### 3.5 Control Flow

| Opcode | Mnemonic | Operands | Description |
|--------|----------|----------|-------------|
| `0x40` | `JMP` | `addr` | Unconditional jump |
| `0x41` | `JEQ` | `a, b, addr` | Jump if equal |
| `0x42` | `JPHI` | `val, thresh, addr` | Jump if φ-weight exceeds threshold |
| `0x43` | `CALL` | `func_id` | Call callable function by registry ID |
| `0x44` | `RET` | — | Return from function |
| `0x45` | `LOOP` | `count, addr` | Loop N times |

### 3.6 Inter-Organism Communication

| Opcode | Mnemonic | Operands | Description |
|--------|----------|----------|-------------|
| `0x50` | `SEND` | `target, msg` | Send message to another organism |
| `0x51` | `RECV` | `dst` | Receive message (blocking) |
| `0x52` | `RESONATE` | `coord, strength` | Emit resonance at φ-coordinate |
| `0x53` | `SENSE` | `dst, sensor` | Read from edge sensor |

## 4. Register File

```
┌─────────────────────────────────────────────────┐
│              CIL REGISTER FILE                   │
├─────────────┬───────────────────────────────────┤
│  R0-R3      │ General purpose (cognitive scratch)│
│  C0         │ COGNITIVE register                 │
│  A0         │ AFFECTIVE register                 │
│  S0         │ SOMATIC register                   │
│  V0         │ SOVEREIGN register                 │
│  PC         │ Program counter                    │
│  SP         │ Stack pointer                      │
│  PHI        │ Current φ-weight (read-only)       │
│  BEAT       │ Current heartbeat count (read-only)│
└─────────────┴───────────────────────────────────┘
```

## 5. Example

```cil
; Initialize a token with cognitive state
RSET  R0, #GENESIS
COGSET COGPRO::BORN::FROM_MINT::genesis
PHISCALE R1, R0, 1.618

; Wait for 3 heartbeats before evolution
HSYNC 3

; Evolve: cognitive transition
COGTRANS COGPRO::BORN, COGPRO::EVOLVED, 0.618
PHIADD R2, R1, R0        ; R2 = R1 + R0 × φ

; Attest and resonate
COGSET COGPRO::ATTESTED::SELF_SIGNED
PHICOORD R3, 0.618, 1.618, 1.0, 3, 873
RESONATE R3, 0.9

; Call callable function #42 (from registry)
CALL 42
RET
```

## 6. Compilation Target

CIL is the lowest compilation target in the Cognitive Language Stack. It maps to:
- **Motoko**: Direct ICP canister operations via TT012Sovereign.mo
- **JavaScript**: organism-runtime-sdk OrganismState register operations
- **AGIS Router**: Terminal station dispatch via callable registry IDs

## 7. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-L** | CPL-L contract operations compile to CIL instruction sequences |
| **CPL-C** | CPL-C cognitive transitions compile to CIL COGSET/COGTRANS |
| **CPL-P** | CPL-P procurement operations compile to CIL CALL + register ops |
| **TPL** | TPL token operations compile to CIL instruction sequences |
| **All Phase 2** | Phase 2 parsers generate CIL as intermediate representation |
| **All Phase 3** | Phase 3 education languages interpret CIL for visualization |
