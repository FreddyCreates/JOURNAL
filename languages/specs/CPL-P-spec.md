# CPL-P — Contract Procurement Language (Procurement Layer)

> Formal specification for the procurement sublanguage of CPL governing token acquisition, resource allocation, split/merge operations, and cross-substrate pricing.

## 1. Purpose

CPL-P is the **procurement layer** of the Contract Procurement Language. It defines the syntax and semantics for:
- Token procurement and resource acquisition across substrates
- Split and merge operation declarations with provenance tracking
- Cross-substrate pricing (ICP, EDGE, CLOUD, PHANTOM)
- Supply chain and dependency declarations between tokens

## 2. Substrate Mapping

| Construct | Implementation Reference | File |
|-----------|------------------------|------|
| Split Operations | `split()` with child generation | TT012Sovereign.mo, line 312+ |
| Merge Operations | `merge()` with lineage fusion | TT012Sovereign.mo, line 220+ |
| Bridge Modes | 4 bridge modes (ICP/EDGE/CLOUD/PHANTOM) | src/cycles_bridge/main.mo |
| Token Accounts | 25 accounts, 8 sub-tokens | src/organism_token/main.mo |

## 3. Grammar (EBNF)

```ebnf
(* CPL-P Procurement Grammar *)
program         = { statement } ;
statement       = procurement_decl | split_decl | merge_decl | pricing_decl
                | supply_chain_decl ;

(* Procurement Declaration *)
procurement_decl = "PROCURE" quantity resource_type "FROM" source
                   "AT" price_expr
                   [ "GOVERNED_BY" contract_ref ] ";" ;
resource_type    = "TOKEN" | "CYCLES" | "COMPUTE" | "MEMORY" | "BANDWIDTH" ;
source           = substrate_source | agent_source | pool_source ;
substrate_source = "ICP" | "EDGE" | "CLOUD" | "PHANTOM" ;

(* Split Declaration *)
split_decl       = "SPLIT" token_ref "INTO" nat "CHILDREN"
                   "{" { child_spec } "}"
                   "PROVENANCE" provenance_mode ";" ;
child_spec       = "CHILD" identifier ":" allocation ";" ;
allocation       = percentage "OF" resource_type ;
provenance_mode  = "FULL_LINEAGE" | "HASH_ONLY" | "SEALED" ;

(* Merge Declaration *)
merge_decl       = "MERGE" token_ref "," token_ref { "," token_ref }
                   "INTO" identifier
                   "LINEAGE" lineage_mode ";" ;
lineage_mode     = "COMBINE" | "PRUNE" | "ARCHIVE" ;

(* Pricing *)
pricing_decl     = "PRICE" resource_type "ON" substrate_source
                   "=" price_expr ";" ;
price_expr       = amount unit [ "PER" unit_time ]
                 | "PHI_SCALED(" base_price ")" ;

(* Supply Chain *)
supply_chain_decl = "SUPPLY_CHAIN" identifier "{"
                    { dependency_link }
                    "}" ;
dependency_link   = identifier "->" identifier ":" resource_type quantity ";" ;

(* Primitives *)
quantity         = nat | float_literal ;
percentage       = float_literal "%" ;
nat              = digit { digit } ;
amount           = float_literal ;
unit             = "ICP" | "CYCLES" | "TOKEN" | "EDGE" ;
unit_time        = "HEARTBEAT" | "CYCLE" | "EPOCH" | "DAY" ;
```

## 4. Example

```cpl-p
(* Procure cycles from ICP substrate *)
PROCURE 1000000 CYCLES FROM ICP AT 0.001 ICP PER CYCLE
  GOVERNED_BY CPL::PROCUREMENT-CONTRACT::batch-42;

(* Split a token into 3 children with provenance *)
SPLIT token_0x7a3f INTO 3 CHILDREN {
  CHILD alpha: 50% OF TOKEN;
  CHILD beta:  30% OF TOKEN;
  CHILD gamma: 20% OF TOKEN;
}
PROVENANCE FULL_LINEAGE;

(* Merge two tokens with combined lineage *)
MERGE token_alpha, token_beta INTO token_unified LINEAGE COMBINE;

(* Cross-substrate pricing *)
PRICE COMPUTE ON EDGE = PHI_SCALED(0.001 ICP);
PRICE COMPUTE ON CLOUD = 0.002 ICP PER HEARTBEAT;

(* Supply chain for a governance operation *)
SUPPLY_CHAIN governance_vote {
  neuron_fleet -> ai_division: CYCLES 500000;
  ai_division -> organism_token: TOKEN 1;
  organism_token -> cycles_bridge: CYCLES 100000;
}
```

## 5. Compilation Target

CPL-P compiles to:
- Motoko `split()` / `merge()` function calls in TT012Sovereign.mo
- Cycles bridge configuration in src/cycles_bridge/main.mo
- Token allocation records in src/organism_token/main.mo

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-L** | Every procurement operation must reference a CPL-L legal contract |
| **CPL-C** | Procurement events trigger CPL-C cognitive state updates |
| **TPL** | TPL token operations are the execution target of CPL-P declarations |
| **ACL** | Agent procurement requests are communicated via ACL messages |
| **CDL** | CDL can define the cognitive model for procurement decision-making |
