# CPL-L — Contract Procurement Language (Legal Layer)

> Formal specification for the legal sublanguage of CPL governing contract creation, obligation tracking, and covenant seal management.

## 1. Purpose

CPL-L is the **legal layer** of the Contract Procurement Language. It defines the syntax and semantics for:
- Creating legally-binding contract identifiers
- Declaring obligations between parties (tokens, agents, organisms)
- Sealing contracts with cryptographic covenant seals
- Tracking contract lifecycle states (draft → active → fulfilled → archived)

## 2. Substrate Mapping

| Construct | TT012Sovereign.mo Reference | Line |
|-----------|---------------------------|------|
| Contract ID | `cpl_contract_id = "CPL::..."` | Lines 111, 232, 353, 514, 539 |
| Covenant Seal | `cpl_covenant_seal = "SEAL::..."` | Lines 112, 282, 354, 556 |
| Split Contract | `cpl_split_contract = "CPL::SPLIT-CONTRACT::..."` | Line 412 |
| Language Constant | `LANG_CONTRACT = "CPL"` | Line 65 |

## 3. Grammar (EBNF)

```ebnf
(* CPL-L Legal Grammar *)
program         = { statement } ;
statement       = contract_decl | obligation_decl | seal_stmt | lifecycle_stmt ;

(* Contract Declaration *)
contract_decl   = "CONTRACT" contract_id "{" { clause } "}" ;
contract_id     = "CPL::" identifier [ "::" identifier ] ;
clause          = obligation_clause | condition_clause | seal_clause ;

(* Obligations *)
obligation_decl = "OBLIGATION" identifier ":" party "MUST" action
                  [ "BEFORE" timestamp ] [ "OR" penalty ] ";" ;
party           = token_ref | agent_ref | organism_ref ;
action          = "TRANSFER" amount "TO" party
                | "EXECUTE" function_ref
                | "ATTEST" state_hash
                | "FULFILL" contract_id ;

(* Covenant Seals *)
seal_stmt       = "SEAL" contract_id "WITH" hash_expr ";" ;
hash_expr       = "HASH(" expression ")" | literal_hash ;

(* Lifecycle *)
lifecycle_stmt  = "TRANSITION" contract_id "FROM" state "TO" state
                  [ "WHEN" condition ] ";" ;
state           = "DRAFT" | "ACTIVE" | "FULFILLED" | "DISPUTED" | "ARCHIVED" ;

(* Primitives *)
identifier      = letter { letter | digit | "_" | "-" } ;
amount          = number [ "." number ] unit ;
unit            = "ICP" | "CYCLES" | "TOKEN" | "EDGE" ;
timestamp       = iso8601_datetime ;
literal_hash    = '"' hex_string '"' ;
```

## 4. Example

```cpl-l
CONTRACT CPL::MERGE-AGREEMENT::merge-7a3f {
  OBLIGATION parent_a: token_0x7a3f MUST TRANSFER 1.0 TOKEN TO merged_entity;
  OBLIGATION parent_b: token_0xb2c1 MUST TRANSFER 1.0 TOKEN TO merged_entity;
  OBLIGATION merged_entity: token_merged MUST ATTEST HASH(parent_a.lineage + parent_b.lineage);

  SEAL CPL::MERGE-AGREEMENT::merge-7a3f WITH HASH(parent_a.hash + parent_b.hash);

  TRANSITION CPL::MERGE-AGREEMENT::merge-7a3f FROM DRAFT TO ACTIVE
    WHEN parent_a.confirmed AND parent_b.confirmed;
  TRANSITION CPL::MERGE-AGREEMENT::merge-7a3f FROM ACTIVE TO FULFILLED
    WHEN merged_entity.attested;
}
```

## 5. Compilation Target

CPL-L compiles to Motoko `MergeRecord` / `SplitRecord` / `EvolutionRecord` types in TT012Sovereign.mo. The compiler generates:
- `cpl_contract_id` field values
- `cpl_covenant_seal` field values
- Lifecycle transition guards as Motoko pattern matches

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-C** | CPL-L contracts trigger CPL-C cognitive state transitions |
| **CPL-P** | CPL-L governs the legal framework; CPL-P handles resource procurement within it |
| **TPL** | TPL token operations reference CPL-L contracts as governance wrappers |
| **SL** | CPL-L contract clauses can reference SL law IDs for governance rules |
| **CDL** | CDL cognitive definitions can be constrained by CPL-L contracts |
