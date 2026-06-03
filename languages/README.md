# COGNITIVE LANGUAGE UNIVERSE - QUICK START

## Installation

```bash
# Clone the repository
git clone https://github.com/FreddyCreates/front-end-is-all-intelligence-.git
cd front-end-is-all-intelligence-

# No dependencies required - pure JavaScript/Motoko
```

## Usage

### 1. Execute a Law

```bash
# Run CPL-L law
node languages/cli.js exec cpl-l languages/cpl-l/examples/terminal_sovereignty.cpl-l

# Output:
# ✅ Execution successful
# {
#   "type": "CPL-L Execution",
#   "lawsRegistered": 1,
#   "results": [...]
# }
```

### 2. Compile to Motoko

```bash
node languages/cli.js compile cpl-l languages/cpl-l/examples/terminal_sovereignty.cpl-l

# Generates Motoko actor code ready for ICP deployment
```

### 3. Verify Compliance

```bash
node languages/cli.js verify languages/cpl-l/examples/terminal_sovereignty.cpl-l "modify_terminal"

# Output:
# ❌ Action violates law
# or
# ✅ Action is compliant
```

### 4. Interactive REPL

```bash
node languages/cli.js repl cpl-l

# cpl-l> LAW TEST { VERSION "1.0.0" }
# ✅ Law compiled successfully
```

### 5. Generate New Languages

```bash
# Use LML to generate a new language
node languages/cli.js generate specs/my_language.lml

# Generates parser, validator, and compiler automatically
```

## Examples

### CPL-L (Cognitive Law Language)

```cpl-l
LAW TERMINAL_SOVEREIGNTY {
  VERSION "1.0.0"
  ENCODED_ID "COSMOS.LAW.TERMINAL"

  RULE TERMINAL_IS_IMMUTABLE {
    IMMUTABLE: TRUE
    ENFORCEMENT: COMPILE_TIME
  }

  RULE ORGANISM_MUST_DECLARE_DOCTRINE {
    REQUIRES organism_has_doctrine == TRUE
    ENFORCEMENT: RUNTIME
  }
}
```

### OCL (Organism Contract Language)

```ocl
ORGANISM ARCHON {
  ENCODED_ID "ORO.ARCHON.INTEGRITY"
  ARCHETYPE "INTEGRITY_CHECKER"

  CAPABILITIES {
    CAN_GENERATE_FINDINGS: TRUE
    CAN_VOTE: FALSE
  }

  CONSTRAINTS {
    MAX_PROPOSALS_PER_CYCLE: 100
    REQUIRED_CONFIDENCE: >= 0.85
  }

  REWARD_STRUCTURE {
    PER_FINDING: 0.1 ORG_TOKEN
  }
}
```

### TPL (Terminal Protocol Language)

```tpl
PROTOCOL TERMINAL_MESH {
  VERSION "1.0.0"

  CHANNEL COMMAND_WIRE {
    TRANSPORT: WEBSOCKET
    SECURITY: ENCRYPTED
    QOS: EXACTLY_ONCE
  }

  MESSAGE COMMAND {
    action: STRING REQUIRED
    target: STRING REQUIRED
    timestamp: NUMBER REQUIRED
  }

  HANDLER COMMAND_RECEIVED ON RECEIVE {
    VALIDATE message AGAINST law_compliance
    CALL organism.execute
    EMIT RESPONSE
  }
}
```

## JavaScript API

```javascript
import { CognitiveRuntime } from './languages/runtime.js';

const runtime = new CognitiveRuntime();

// Execute a law
const result = await runtime.execute('cpl-l', lawSource);

// Query loaded law
const law = runtime.queryLaw('TERMINAL_SOVEREIGNTY');

// Check organism capability
const canVote = runtime.organismCan('ARCHON', 'CAN_VOTE');

// Verify compliance
const compliance = await runtime.verifyCompliance(
  'TERMINAL_SOVEREIGNTY',
  'modify_terminal'
);
```

## Run Tests

```bash
node --test languages/test/integration.test.js
```

## Architecture

```
languages/
├── cpl-l/           # Cognitive Law Language
│   ├── src/
│   │   ├── parser.js     ✅ Complete
│   │   └── compiler.js   ✅ Complete
│   ├── spec/
│   └── examples/
├── tpl/             # Terminal Protocol Language
│   ├── src/
│   │   └── parser.js     ✅ Complete
│   └── examples/
├── ocl/             # Organism Contract Language
│   ├── src/
│   │   └── parser.js     ✅ Complete
│   └── examples/
├── acl/             # Atlas Configuration Language
│   ├── src/
│   │   └── parser.js     ✅ Complete
│   └── examples/
├── lml/             # Language Meta Language
│   └── src/
│       └── compiler.js   ✅ Complete (Bootstrap)
├── runtime.js       # Unified runtime
├── cli.js           # Command-line interface
└── index.js         # Central registry
```

## Status

- **9 Languages Operational**: CPL-L, TPL, OCL, ACL, LML, CPL-C, CPL-P, CIL, CDL
- **9 Parsers Complete**: All P0 languages + 4 new core languages
- **2 Compilers Complete**: CPL-L → Motoko, LML → All
- **Runtime: Operational**: Full execution engine
- **CLI: Operational**: Complete tooling

## Next Steps

1. **Deploy to ICP**: Compile laws to Motoko and deploy canisters
2. **Generate More Languages**: Use LML to create CPL-C, CPL-P, CDL, etc.
3. **Integration**: Wire to ORO canisters and SDKs
4. **Testing**: Expand test coverage across all languages

## Documentation

- [Cognitive Cosmos](./docs/cognitive-language-stack/COGNITIVE_COSMOS.md) - Complete architecture
- [Language Registry](./languages/LANGUAGE_REGISTRY.md) - All 40 languages
- [The Book](./docs/cognitive-language-stack/book/THE_COGNITIVE_COSMOS.md) - 12 chapters

## License

Proprietary - Freddy Medina

## Repository

https://github.com/FreddyCreates/front-end-is-all-intelligence-
