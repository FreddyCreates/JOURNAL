# TPL — Token Processing Language

> Formal specification for the language governing token lifecycle operations: mint, merge, split, evolve, and self-attest.

## 1. Purpose

TPL (Token Processing Language) defines the syntax and semantics for:
- Token minting with genesis provenance
- Merge operations (N tokens → 1 with combined lineage)
- Split operations (1 token → N children with provenance)
- Evolution cycles (φ-weighted state mutation)
- Self-attestation (tokens sign their own state hash)
- Token state queries and lifecycle management

## 2. Substrate Mapping

| Construct | TT012Sovereign.mo Reference | Line |
|-----------|---------------------------|------|
| Mint | `mint()` function | Line 195+ |
| Merge | `merge()` function | Line 220+ |
| Split | `split()` function | Line 312+ |
| Evolve | `evolve()` function | Line 420+ |
| Attest | `selfAttest()` function | Line 490+ |
| Token Type | `SovereignToken` record | Lines 90-135 |
| State Enum | `TokenState` variant | Lines 660-676 |
| Evolution Cycle | `EVOLUTION_CYCLE_MS = 873` | Line 49 |
| Phi | `PHI = 1.618...` | Line 44 |

## 3. Grammar (EBNF)

```ebnf
(* TPL Token Processing Grammar *)
program         = { statement } ;
statement       = mint_stmt | merge_stmt | split_stmt | evolve_stmt
                | attest_stmt | query_stmt | lifecycle_stmt ;

(* Mint *)
mint_stmt       = "MINT" identifier "{"
                  "origin:" origin_expr ";"
                  "phi_weight:" phi_value ";"
                  [ "contract:" contract_ref ";" ]
                  [ "law:" law_ref ";" ]
                  "}" ;
origin_expr     = "GENESIS" | "FROM_SPLIT(" token_ref ")" | "FROM_MERGE(" token_ref { "," token_ref } ")" ;

(* Merge *)
merge_stmt      = "MERGE" "(" token_ref "," token_ref { "," token_ref } ")"
                  "INTO" identifier
                  [ "STRATEGY" merge_strategy ] ";" ;
merge_strategy  = "COMBINE_LINEAGE" | "PRUNE_LINEAGE" | "PHI_WEIGHTED" ;

(* Split *)
split_stmt      = "SPLIT" token_ref "INTO" nat "{"
                  { "CHILD" identifier ":" allocation ";" }
                  "}" ;
allocation      = percentage | "PHI_RATIO" | "EQUAL" ;
percentage      = float_literal "%" ;

(* Evolve *)
evolve_stmt     = "EVOLVE" token_ref "{"
                  "cycles:" nat ";"
                  "phi_factor:" phi_value ";"
                  [ "mutation:" mutation_expr ";" ]
                  "}" ;
mutation_expr   = "STRENGTHEN(" float_literal ")"
                | "ADAPT(" environment_ref ")"
                | "RESONATE(" phi_coordinate ")" ;

(* Self-Attest *)
attest_stmt     = "ATTEST" token_ref [ "WITH" attestation_mode ] ";" ;
attestation_mode = "FULL_STATE" | "HASH_ONLY" | "COVENANT_SEAL" ;

(* Query *)
query_stmt      = "QUERY" token_ref "." property ";" ;
property        = "state" | "lineage" | "phi_weight" | "evolution_count"
                | "attestation_hash" | "children" | "parents" | "age" ;

(* Lifecycle *)
lifecycle_stmt  = "LIFECYCLE" token_ref ":"
                  state "->" state
                  [ "AFTER" duration ] ";" ;
state           = "BORN" | "ACTIVE" | "MERGED" | "SPLITTING"
                | "EVOLVING" | "ATTESTING" | "DORMANT" | "ARCHIVED" ;
duration        = nat ("HEARTBEATS" | "CYCLES" | "EPOCHS") ;

(* Primitives *)
token_ref       = identifier | "token_" hex_string ;
contract_ref    = "CPL::" identifier ;
law_ref         = "SL-" digits "::" identifier ;
phi_value       = float_literal ;
phi_coordinate  = "(" float "," float "," float "," nat "," nat ")" ;
nat             = digit { digit } ;
```

## 4. Example

```tpl
(* Mint a new sovereign token *)
MINT sovereign_alpha {
  origin: GENESIS;
  phi_weight: 1.618;
  contract: CPL::GENESIS-MINT::batch-001;
  law: SL-012::SOVEREIGN-TOKEN-GOVERNANCE;
}

(* Evolve the token over 5 cycles *)
EVOLVE sovereign_alpha {
  cycles: 5;
  phi_factor: 0.618;
  mutation: STRENGTHEN(0.1);
}

(* Self-attest current state *)
ATTEST sovereign_alpha WITH COVENANT_SEAL;

(* Split into two children *)
SPLIT sovereign_alpha INTO 2 {
  CHILD alpha_prime: 61.8%;
  CHILD alpha_minor: 38.2%;
}

(* Query lineage *)
QUERY alpha_prime.lineage;

(* Lifecycle transition *)
LIFECYCLE alpha_prime: BORN -> ACTIVE AFTER 3 HEARTBEATS;
```

## 5. Compilation Target

TPL compiles directly to Motoko function calls in TT012Sovereign.mo:
- `MINT` → `mint()` generating `SovereignToken` records
- `MERGE` → `merge()` with lineage combination
- `SPLIT` → `split()` with child allocation
- `EVOLVE` → `evolve()` with φ-weighted mutation
- `ATTEST` → `selfAttest()` with hash generation

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-L** | Every TPL operation can be governed by a CPL-L contract |
| **CPL-C** | TPL operations trigger CPL-C cognitive state transitions |
| **CPL-P** | CPL-P procurement declarations compile to TPL operations |
| **CIL** | TPL operations decompose into CIL register instructions |
| **RSL** | Token resonance patterns expressed in RSL reference TPL tokens |
