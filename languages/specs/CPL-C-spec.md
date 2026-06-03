# CPL-C — Contract Procurement Language (Cognitive Layer)

> Formal specification for the cognitive sublanguage of CPL governing cognitive state expressions, COGPRO bindings, and register operations.

## 1. Purpose

CPL-C is the **cognitive layer** of the Contract Procurement Language. It defines the syntax and semantics for:
- Expressing cognitive states (BORN, MERGED, SPLIT, EVOLVED, ATTESTED)
- Binding cognitive state to contract lifecycle events
- Operating on the 4-register architecture (Cognitive, Affective, Somatic, Sovereign)
- Declaring φ-weighted cognitive transitions

## 2. Substrate Mapping

| Construct | TT012Sovereign.mo Reference | Line |
|-----------|---------------------------|------|
| Cognitive State | `cogpro_state = "COGPRO::..."` | Lines 120, 235, 285, 356, 395, 470, 541 |
| Phi Weight | `cogpro_phi_weight` | Lines 121, 236, 286 |
| Language Constant | `LANG_COGNITION = "COGPRO"` | Line 66 |
| State Enum | `#Born, #Active, #Merged, #Evolving, #Attesting, #Splitting` | Lines 670-676 |

## 3. Grammar (EBNF)

```ebnf
(* CPL-C Cognitive Grammar *)
program         = { statement } ;
statement       = state_decl | transition_decl | register_op | phi_binding ;

(* Cognitive State Declaration *)
state_decl      = "COGSTATE" identifier "=" state_expr ";" ;
state_expr      = "COGPRO::" state_name "::" context_expr ;
state_name      = "BORN" | "MERGED" | "SPLIT" | "EVOLVED" | "ATTESTED"
                | "DORMANT" | "RESONATING" | "PROCESSING" ;
context_expr    = identifier { "::" identifier } ;

(* Cognitive Transitions *)
transition_decl = "TRANSITION" identifier
                  "FROM" state_expr "TO" state_expr
                  "PHI_WEIGHT" phi_value
                  [ "WHEN" condition ] ";" ;
phi_value       = float_literal ;  (* 0.0 to 1.618... *)

(* Register Operations *)
register_op     = "REGISTER" register_name "." operation ";" ;
register_name   = "COGNITIVE" | "AFFECTIVE" | "SOMATIC" | "SOVEREIGN" ;
operation       = "SET(" expression ")"
                | "GET"
                | "PULSE(" heartbeat_count ")"
                | "RESONATE(" phi_coordinate ")" ;

(* Phi Bindings *)
phi_binding     = "BIND" identifier "TO" phi_coordinate
                  "WEIGHT" phi_value ";" ;
phi_coordinate  = "PHI(" theta "," phi "," rho "," ring "," beat ")" ;

(* Primitives *)
identifier      = letter { letter | digit | "_" } ;
float_literal   = digit { digit } "." digit { digit } ;
heartbeat_count = digit { digit } ;  (* multiples of 873ms *)
```

## 4. Example

```cpl-c
(* Token birth cognitive state *)
COGSTATE token_birth = COGPRO::BORN::FROM_MINT::genesis_batch;

(* Merge cognitive transition *)
TRANSITION merge_cognition
  FROM COGPRO::BORN::FROM_MINT::genesis_batch
  TO   COGPRO::MERGED::PARENTS_FUSED::lineage_combined
  PHI_WEIGHT 1.618
  WHEN parent_a.attested AND parent_b.attested;

(* Register operations during merge *)
REGISTER COGNITIVE.SET(merge_cognition);
REGISTER SOVEREIGN.PULSE(3);  (* 3 heartbeats = 2619ms *)

(* Bind merged state to phi-coordinate *)
BIND merged_state TO PHI(0.618, 1.618, 1.0, 3, 873) WEIGHT 0.618;
```

## 5. Compilation Target

CPL-C compiles to Motoko `cogpro_state` and `cogpro_phi_weight` fields in TT012Sovereign.mo record types. The compiler generates:
- COGPRO-prefixed state strings
- φ-weight Float values
- Register read/write operations on OrganismState (from organism-runtime-sdk)

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-L** | CPL-C state transitions are triggered by CPL-L contract lifecycle events |
| **CPL-P** | Procurement operations update cognitive state via CPL-C |
| **CIL** | CIL provides the low-level instruction set that CPL-C compiles to |
| **OCL** | OCL organism control interacts with CPL-C through register operations |
| **RSL** | RSL φ-resonance patterns use CPL-C phi_coordinate types |
