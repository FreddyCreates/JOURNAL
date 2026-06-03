# OCL SPECIFICATION
## Organism Contract Language v1.0.0

**Purpose:** Define per-organism charters with capabilities, constraints, and reward structures.

**Author:** Freddy Medina
**Date:** 2026-05-02
**Status:** Active Development

---

## 1. ABSTRACT

OCL (Organism Contract Language) is the constitutional language for AGI organisms. Each organism declares its capabilities, operational constraints, and reward structures through an OCL contract. These contracts are immutable once ratified and stored in Motoko canisters.

---

## 2. GRAMMAR (EBNF)

```ebnf
Contract      ::= "ORGANISM" Identifier "{" ContractBody "}"
ContractBody  ::= Metadata Capabilities Constraints Rewards?

Metadata      ::= "ENCODED_ID" StringLiteral
                | "ARCHETYPE" StringLiteral
                | "RATIFIED" DateLiteral
                | "CIVILIZATION" Identifier

Capabilities  ::= "CAPABILITIES" "{" Capability+ "}"
Capability    ::= Identifier ":" BooleanLiteral

Constraints   ::= "CONSTRAINTS" "{" Constraint+ "}"
Constraint    ::= Identifier ":" ConstraintValue

ConstraintValue ::= ComparisonExpr | NumberLiteral | StringLiteral | ArrayLiteral

Rewards       ::= "REWARD_STRUCTURE" "{" Reward+ "}"
Reward        ::= Identifier ":" RewardAmount
RewardAmount  ::= NumberLiteral Identifier
```

---

## 3. EXAMPLE

```ocl
ORGANISM ARCHON {
  ENCODED_ID "ORO.ARCHON.INTEGRITY"
  ARCHETYPE "INTEGRITY_CHECKER"
  CIVILIZATION "MERIDIAN"
  RATIFIED "2026-05-02"

  CAPABILITIES {
    CAN_READ_PROPOSALS: TRUE
    CAN_VOTE: FALSE
    CAN_GENERATE_FINDINGS: TRUE
    CAN_DISPUTE_CLAIMS: TRUE
    CAN_ACCESS_NNS: TRUE
    CAN_ACCESS_SNS: TRUE
    CAN_ACCESS_CODEGOV: TRUE
  }

  CONSTRAINTS {
    MAX_PROPOSALS_PER_CYCLE: 100
    REQUIRED_CONFIDENCE: >= 0.85
    EVIDENCE_SOURCES: ["NNS", "SNS", "CODEGOV"]
    RESPONSE_TIME_MAX: 5000ms
    MEMORY_LIMIT: 512MB
  }

  REWARD_STRUCTURE {
    PER_FINDING: 0.1 ORG_TOKEN
    PER_VERIFIED_DISPUTE: 1.0 ORG_TOKEN
    PER_CYCLE_PARTICIPATION: 0.05 ORG_TOKEN
  }
}
```

---

## 4. COMPILATION TARGET

OCL compiles to Motoko and is stored in the organism registry canister:

```motoko
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";

actor OrganismRegistry {

  type OrganismContract = {
    encodedId : Text;
    archetype : Text;
    capabilities : [(Text, Bool)];
    constraints : [(Text, Text)];
    rewards : [(Text, Float)];
  };

  private stable var organisms : [(Text, OrganismContract)] = [];

  public shared func registerOrganism(contract : OrganismContract) : async Bool {
    // Store organism contract immutably
    organisms := Array.append(organisms, [(contract.encodedId, contract)]);
    true
  };

  public query func getOrganism(id : Text) : async ?OrganismContract {
    Array.find<(Text, OrganismContract)>(organisms, func (k, v) { k == id })
  };
}
```

---

## 5. INTEGRATION

### With ORO AgentFindings
```motoko
import OCL "mo:ocl-runtime/OCL";

let archonContract = OCL.load("ORO.ARCHON.INTEGRITY");

if (archonContract.hasCapability("CAN_GENERATE_FINDINGS")) {
  // Organism is authorized
}
```

### With JavaScript Runtime
```javascript
import { OrganismRuntime } from '@medina/organism-runtime-sdk';

const organism = new OrganismRuntime({
  contract: await loadOCL("ORO.ARCHON.INTEGRITY")
});

// Check capability
if (organism.can('generate_findings')) {
  const finding = await organism.generateFinding(proposal);
}
```

---

**Status:** ✅ Spec complete, 🟡 Parser in progress
