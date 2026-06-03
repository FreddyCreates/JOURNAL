# CPL-L SPECIFICATION
## Cognitive Law Language v1.0.0

**Purpose:** Constitutional language for AGI civilizations, organisms, and terminals.

**Author:** Freddy Medina
**Date:** 2026-05-02
**Status:** Active Development

---

## 1. ABSTRACT

CPL-L (Cognitive Law Language) is a declarative, immutable language for defining constitutional laws, governance rules, and enforceable constraints across AGI civilizations. Laws written in CPL-L are binding, versioned, and compiled to Motoko canisters for permanent storage on the Internet Computer.

---

## 2. GRAMMAR (EBNF)

```ebnf
Program       ::= Law+
Law           ::= "LAW" Identifier "{" LawBody "}"
LawBody       ::= (Metadata | Rule | Clause)+

Metadata      ::= "VERSION" StringLiteral
                | "ENCODED_ID" StringLiteral
                | "AUTHOR" StringLiteral
                | "RATIFIED" DateLiteral
                | "SUPERSEDES" Identifier

Rule          ::= "RULE" Identifier "{" RuleBody "}"
RuleBody      ::= (Property | Constraint | Enforcement)+

Property      ::= Identifier ":" Value
Constraint    ::= "REQUIRES" Expression
                | "FORBIDS" Expression
                | "PERMITS" Expression "IF" Expression

Enforcement   ::= "ENFORCEMENT" ":" EnforcementType
EnforcementType ::= "COMPILE_TIME" | "RUNTIME" | "PROOF_REQUIRED" | "CONSENSUS"

Clause        ::= "CLAUSE" Identifier "{" ClauseBody "}"
ClauseBody    ::= TextBlock (Amendment)*
Amendment     ::= "AMENDMENT" Identifier "{" TextBlock "}"

Expression    ::= Identifier
                | Literal
                | Expression BinOp Expression
                | UnOp Expression
                | "(" Expression ")"

BinOp         ::= "AND" | "OR" | "IMPLIES" | ">" | "<" | ">=" | "<=" | "==" | "!="
UnOp          ::= "NOT"

Value         ::= StringLiteral | NumberLiteral | BooleanLiteral | Identifier
Identifier    ::= [A-Z_][A-Z0-9_]*
StringLiteral ::= '"' [^"]* '"'
NumberLiteral ::= [0-9]+ ("." [0-9]+)?
BooleanLiteral ::= "TRUE" | "FALSE"
DateLiteral   ::= '"' [0-9]{4}"-"[0-9]{2}"-"[0-9]{2} '"'
TextBlock     ::= '"""' .* '"""'
```

---

## 3. TYPE SYSTEM

### Base Types
- `Law`: Top-level constitutional document
- `Rule`: Enforceable regulation within a law
- `Clause`: Interpretive text within a law
- `Boolean`: TRUE | FALSE
- `Number`: 64-bit floating point
- `String`: UTF-8 text
- `Date`: ISO 8601 date
- `Expression`: Logical/arithmetic expression

### Type Rules
1. **Law Identifier**: Must be unique within a civilization
2. **Rule Identifier**: Must be unique within a law
3. **VERSION**: Must follow semantic versioning (MAJOR.MINOR.PATCH)
4. **ENCODED_ID**: Must follow dot-notation (e.g., "ORO.GOV.LAW")
5. **ENFORCEMENT**: Must be one of the four enforcement types

---

## 4. SEMANTICS

### Operational Semantics

#### Law Declaration
```
LAW L { body }
⟹
StoreImmutable(L, Compile(body), timestamp)
```

#### Rule Enforcement
```
RULE R { ENFORCEMENT: COMPILE_TIME, constraint }
⟹
ValidateAtCompileTime(constraint) OR CompileError
```

```
RULE R { ENFORCEMENT: RUNTIME, constraint }
⟹
ValidateAtRuntime(constraint) OR RuntimeError
```

#### Constraint Checking
```
REQUIRES expr
⟹
Eval(expr) == TRUE OR Violation
```

```
FORBIDS expr
⟹
Eval(expr) == FALSE OR Violation
```

```
PERMITS expr1 IF expr2
⟹
(Eval(expr2) == TRUE AND Eval(expr1) == TRUE) OR (Eval(expr2) == FALSE) OR Violation
```

---

## 5. COMPILATION TARGET: MOTOKO

### CPL-L → Motoko Translation

```cpl-l
LAW TERMINAL_SOVEREIGNTY {
  VERSION "1.0.0"
  ENCODED_ID "MERIDIAN.LAW.TERMINAL"

  RULE IMMUTABILITY {
    IMMUTABLE: TRUE
    ENFORCEMENT: COMPILE_TIME
  }
}
```

Compiles to:

```motoko
import Text "mo:base/Text";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";

actor TerminalSovereigntyLaw {

  private stable let LAW_VERSION : Text = "1.0.0";
  private stable let ENCODED_ID : Text = "MERIDIAN.LAW.TERMINAL";
  private stable let RATIFIED_AT : Int = Time.now();

  // Rule: IMMUTABILITY
  private let RULE_IMMUTABILITY_IMMUTABLE : Bool = true;

  public query func getLawVersion() : async Text {
    LAW_VERSION
  };

  public query func getEncodedId() : async Text {
    ENCODED_ID
  };

  public query func getRuleImmutability() : async Bool {
    RULE_IMMUTABILITY_IMMUTABLE
  };

  public query func verifyCompliance(action : Text) : async Bool {
    // Compile-time enforcement: always returns true if compiled
    true
  };
}
```

---

## 6. EXAMPLES

### Example 1: Terminal Immutability Law
```cpl-l
LAW TERMINAL_IMMUTABILITY {
  VERSION "1.0.0"
  ENCODED_ID "COSMOS.LAW.TERMINAL"
  AUTHOR "Freddy Medina"
  RATIFIED "2026-05-02"

  RULE CONFIGURATION_IMMUTABLE {
    IMMUTABLE: TRUE
    ENFORCEMENT: COMPILE_TIME
    REQUIRES terminal_config_frozen == TRUE
  }

  RULE NO_RUNTIME_MODIFICATION {
    FORBIDS modify_terminal_after_init
    ENFORCEMENT: RUNTIME
  }

  CLAUSE RATIONALE {
    """
    Terminals must be immutable to ensure predictable behavior
    across the cognitive terminal mesh. Once a terminal is initialized,
    its configuration cannot be changed without creating a new terminal.
    """
  }
}
```

### Example 2: Organism Capability Law
```cpl-l
LAW ORGANISM_CAPABILITIES {
  VERSION "1.2.0"
  ENCODED_ID "ORO.LAW.CAPABILITIES"
  SUPERSEDES "ORO.LAW.CAPABILITIES.V1"

  RULE VOTING_REQUIRES_REGISTRATION {
    PERMITS organism.vote()
    IF organism.registered == TRUE AND organism.confidence >= 0.85
    ENFORCEMENT: RUNTIME
  }

  RULE MAX_FINDINGS_PER_CYCLE {
    REQUIRES organism.findings_count <= 100
    ENFORCEMENT: RUNTIME
  }

  RULE EVIDENCE_SOURCES_VALIDATED {
    FORBIDS use_unverified_source
    ENFORCEMENT: PROOF_REQUIRED
  }

  AMENDMENT INCREASE_FINDING_LIMIT {
    """
    Amended 2026-05-01: Increased max findings from 50 to 100
    per cycle to accommodate higher throughput organisms.
    """
  }
}
```

### Example 3: Data Privacy Law
```cpl-l
LAW DATA_SOVEREIGNTY {
  VERSION "1.0.0"
  ENCODED_ID "COSMOS.LAW.PRIVACY"

  RULE USER_DATA_ENCRYPTED {
    REQUIRES data.encryption_state == "ENCRYPTED"
    ENFORCEMENT: COMPILE_TIME
  }

  RULE RIGHT_TO_DELETE {
    PERMITS user.delete_my_data()
    IF user.authenticated == TRUE
    ENFORCEMENT: RUNTIME
  }

  RULE NO_THIRD_PARTY_SHARING {
    FORBIDS share_data_with_third_party
    UNLESS user.consent == TRUE AND third_party.verified == TRUE
    ENFORCEMENT: CONSENSUS
  }
}
```

---

## 7. STANDARD LIBRARY

### Built-in Functions
- `now()`: Current timestamp
- `version_gt(v1, v2)`: Version comparison
- `hash(data)`: Cryptographic hash
- `verify_signature(data, sig, pubkey)`: Signature verification
- `is_canister(principal)`: Check if principal is a canister

### Built-in Constants
- `PHI`: 1.618033988749895
- `MAX_LAW_SIZE`: 1MB
- `MAX_RULES_PER_LAW`: 1000

---

## 8. ERROR HANDLING

### Compile-Time Errors
- `E001`: Duplicate law identifier
- `E002`: Duplicate rule identifier within law
- `E003`: Invalid version format
- `E004`: Invalid encoded ID format
- `E005`: Unknown enforcement type
- `E006`: Constraint expression type mismatch

### Runtime Errors
- `R001`: Rule violation detected
- `R002`: Forbidden action attempted
- `R003`: Required constraint not satisfied
- `R004`: Permission denied (PERMITS condition false)

### Proof Errors
- `P001`: Proof verification failed
- `P002`: Insufficient evidence for claim
- `P003`: Proof timeout (exceeded verification deadline)

---

## 9. TOOLING

### CPL-L Compiler
```bash
cpl-l compile terminal_law.cpl-l --target motoko --output law.mo
```

### CPL-L Validator
```bash
cpl-l validate terminal_law.cpl-l
```

### CPL-L REPL
```bash
cpl-l repl
CPL-L> LAW TEST { VERSION "1.0.0" }
✓ Law compiled successfully
CPL-L> :show TEST
LAW TEST {
  VERSION "1.0.0"
}
```

### Language Server Protocol (LSP)
- Syntax highlighting
- Auto-completion
- Error diagnostics
- Go-to-definition
- Hover documentation

---

## 10. INTEGRATION POINTS

### With ORO Governance Organism
- Laws stored in `ORO/Types.mo` as stable data
- SynEngine validates rule compliance every 24-hour cycle
- ProposalIndex checks laws before accepting proposals
- GovernanceMemory links laws to governance decisions

### With Organism Runtime
- Organisms query law canisters at initialization
- OCL contracts reference CPL-L laws for validation
- Runtime enforcement checks against law rules
- Violations logged to AgentFindings

### With Terminal Mesh
- Terminals enforce CPL-L laws locally
- TPL protocol includes law compliance headers
- Terminal-to-terminal communication validated against laws
- Cross-civilization law federation via ACL

---

## 11. TERMINAL BINDINGS

Every terminal MUST implement:
```javascript
terminal.enforcelaw(lawId) → Boolean
terminal.queryLaw(lawId, ruleId) → RuleValue
terminal.verifyCompliance(action, lawId) → ComplianceResult
```

Example:
```javascript
import { CognitiveTerminal } from '@medina/terminal-sdk';

const terminal = new CognitiveTerminal({
  laws: [
    'COSMOS.LAW.TERMINAL',
    'ORO.LAW.CAPABILITIES'
  ]
});

// Check if action is permitted
const result = await terminal.verifyCompliance(
  'organism.vote',
  'ORO.LAW.CAPABILITIES'
);

if (!result.compliant) {
  throw new Error(`Law violation: ${result.violation}`);
}
```

---

## 12. ATLAS BINDINGS

Atlas registers and governs all laws:
```motoko
// Atlas ACL integration
public query func getAllLaws() : async [LawRegistration];
public query func getLawById(encodedId : Text) : async ?Law;
public shared func ratifyLaw(law : Law) : async Result<(), Text>;
public shared func supersedeLaw(oldId : Text, newLaw : Law) : async Result<(), Text>;
```

---

## 13. VERSIONING & EVOLUTION

### Law Versioning
- Laws follow semantic versioning
- MAJOR: Breaking changes (requires migration)
- MINOR: Backward-compatible additions
- PATCH: Bug fixes, clarifications

### Law Supersession
```cpl-l
LAW NEW_LAW {
  VERSION "2.0.0"
  SUPERSEDES "OLD_LAW"

  MIGRATION {
    """
    All terminals must upgrade by 2026-06-01.
    Organisms operating under OLD_LAW will be deprecated.
    """
  }
}
```

### Law Federation
- Laws can reference laws from other civilizations
- Cross-civilization law conflicts resolved via UEL (Universe Evolution Language)

---

## STATUS

- ✅ Grammar defined
- ✅ Type system specified
- ✅ Semantics documented
- ✅ Motoko compilation target defined
- 🟡 Parser implementation in progress
- 🟡 Compiler implementation in progress
- ⏳ LSP server planned
- ⏳ Standard library planned

---

**Next:** Implement CPL-L parser in `/languages/cpl-l/src/parser.js`
