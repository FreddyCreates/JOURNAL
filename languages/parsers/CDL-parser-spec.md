# CDL — Cognitive Definition Language (Parser Specification)

> Parser specification for the language used to define cognitive models, schemas, type hierarchies, and intelligence categories.

## 1. Purpose

CDL (Cognitive Definition Language) enables defining:
- Cognitive model schemas (the 115+ model species from Frontend_Frontier_100_Register.csv)
- Type hierarchies for intelligence categories
- Callable function signatures and category bindings
- Model-to-SDK wiring declarations

## 2. Source Protocol Mapping

| CDL Concept | Existing Implementation | File |
|-------------|------------------------|------|
| Model Definitions | 820 callable functions across 47 categories | src/callable-registry.js |
| Category System | Terminal station categories | src/terminals/agis-router.js |
| Blueprint Assembly | Blueprint Assembly Protocol | protocols/blueprint-assembly-protocol.js |
| Model Families | AI_Model_Families_Register.csv | Root directory |

## 3. Grammar (EBNF)

```ebnf
(* CDL Cognitive Definition Grammar *)
program           = { definition } ;
definition        = model_def | category_def | schema_def | wiring_def ;

(* Model Definition *)
model_def         = "MODEL" identifier ":" model_type "{"
                    { property_decl }
                    [ capabilities_block ]
                    [ constraints_block ]
                    "}" ;
model_type        = "COGNITIVE" | "AFFECTIVE" | "SOMATIC" | "SOVEREIGN"
                  | "COMPOSITE" | "PRIMITIVE" ;

(* Category Definition *)
category_def      = "CATEGORY" identifier "{"
                    "ring:" ring_name ";"
                    "station:" station_name ";"
                    { function_sig }
                    "}" ;
ring_name         = "MEMORY" | "INTERFACE" | "SOVEREIGN" | "EDGE" | "CORE" ;
station_name      = identifier ;  (* maps to AGIS terminal stations *)

(* Schema Definition *)
schema_def        = "SCHEMA" identifier "EXTENDS" identifier "{"
                    { field_decl }
                    "}" ;
field_decl        = identifier ":" type_expr [ "=" default_value ] ";" ;
type_expr         = primitive_type | identifier | "LIST(" type_expr ")"
                  | "MAP(" type_expr "," type_expr ")" ;
primitive_type    = "Text" | "Nat" | "Int" | "Float" | "Bool" | "PhiCoord" ;

(* Wiring Definition *)
wiring_def        = "WIRE" model_ref "TO" sdk_ref
                    [ "VIA" protocol_ref ] ";" ;

(* Property Declaration *)
property_decl     = identifier ":" type_expr "=" expression ";" ;

(* Capabilities *)
capabilities_block = "CAPABILITIES" "{" { identifier ";" } "}" ;

(* Constraints *)
constraints_block  = "CONSTRAINTS" "{"
                     { constraint_expr ";" }
                     "}" ;
constraint_expr    = "REQUIRES" identifier
                   | "EXCLUDES" identifier
                   | "PHI_MIN" float_literal
                   | "RING" ring_name ;
```

## 4. Example

```cdl
CATEGORY quantum_intelligence {
  ring: CORE;
  station: /quantum;

  function computeState(input: Text): QuantumState;
  function measureCollapse(state: QuantumState): Float;
  function entangle(a: QuantumState, b: QuantumState): EntangledPair;
}

MODEL hilbert_space_model : COGNITIVE {
  dimensions: Nat = 64;
  basis_vectors: LIST(Float) = [];
  phi_weight: Float = 1.618;

  CAPABILITIES {
    superposition;
    entanglement;
    measurement;
  }

  CONSTRAINTS {
    PHI_MIN 0.5;
    RING CORE;
    REQUIRES quantum_intelligence;
  }
}

SCHEMA QuantumState EXTENDS BaseState {
  amplitude: Float = 1.0;
  phase: Float = 0.0;
  collapsed: Bool = false;
}

WIRE hilbert_space_model TO @medina/organism-runtime-sdk
  VIA phi-resonance-sync-protocol;
```

## 5. Parser Architecture

```
CDL Source → Lexer → Token Stream → Parser → AST → Validator → CIL Output
                                                      ↓
                                              Schema Registry
                                              (callable-registry.js)
```

The CDL parser generates:
- CIL instruction sequences for model initialization
- Callable registry entries for new functions
- Schema validation rules for type checking

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-L** | CDL model definitions can be constrained by CPL-L contracts |
| **CIL** | CDL compiles to CIL instructions for model instantiation |
| **OCL** | OCL organism lifecycle references CDL model definitions |
| **ACL** | ACL message types are defined using CDL schemas |
| **SPL** | SPL provides simplified CDL syntax for student use |
