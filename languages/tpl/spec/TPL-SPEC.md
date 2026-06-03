# TPL SPECIFICATION
## Terminal Protocol Language v1.0.0

**Purpose:** Protocol language for terminal-to-terminal communication in the Cognitive Terminal Mesh.

**Author:** Freddy Medina
**Date:** 2026-05-02
**Status:** Active Development

---

## 1. ABSTRACT

TPL (Terminal Protocol Language) defines how terminals communicate with each other, with Atlas, and with organisms in the cognitive mesh. It provides message routing, channel multiplexing, encryption, and compliance verification.

---

## 2. GRAMMAR (EBNF)

```ebnf
Protocol      ::= "PROTOCOL" Identifier "{" ProtocolBody "}"
ProtocolBody  ::= (Metadata | Channel | Message | Handler)+

Channel       ::= "CHANNEL" Identifier "{" ChannelBody "}"
ChannelBody   ::= (Transport | Security | QoS)+

Transport     ::= "TRANSPORT" ":" TransportType
TransportType ::= "WEBSOCKET" | "HTTP" | "ICP_CALL" | "IPFS" | "PHANTOM"

Security      ::= "SECURITY" ":" SecurityLevel
SecurityLevel ::= "PUBLIC" | "ENCRYPTED" | "SIGNED" | "ZERO_KNOWLEDGE"

QoS           ::= "QOS" ":" QoSLevel
QoSLevel      ::= "BEST_EFFORT" | "AT_LEAST_ONCE" | "EXACTLY_ONCE"

Message       ::= "MESSAGE" Identifier "{" MessageBody "}"
MessageBody   ::= (Field | Validation)+

Field         ::= Identifier ":" Type ("REQUIRED" | "OPTIONAL")?
Type          ::= "STRING" | "NUMBER" | "BOOLEAN" | "BYTES" | "JSON" | Identifier

Handler       ::= "HANDLER" Identifier "ON" EventType "{" HandlerBody "}"
EventType     ::= "RECEIVE" | "SEND" | "ERROR" | "TIMEOUT"
HandlerBody   ::= Action+
Action        ::= "EMIT" Identifier | "CALL" Identifier | "LOG" StringLiteral
```

---

## 3. EXAMPLES

### Example 1: Terminal-to-Terminal Protocol
```tpl
PROTOCOL TERMINAL_MESH {
  VERSION "1.0.0"
  ENCODED_ID "TPL.TERMINAL.MESH"

  CHANNEL COMMAND_WIRE {
    TRANSPORT: WEBSOCKET
    SECURITY: ENCRYPTED
    QOS: EXACTLY_ONCE
    ENCRYPTION_ALGORITHM: "AES-256-GCM"
    AUTH_REQUIRED: TRUE
  }

  CHANNEL BROADCAST {
    TRANSPORT: IPFS
    SECURITY: PUBLIC
    QOS: BEST_EFFORT
  }

  MESSAGE COMMAND {
    action: STRING REQUIRED
    target: STRING REQUIRED
    params: JSON OPTIONAL
    timestamp: NUMBER REQUIRED
    signature: BYTES REQUIRED
  }

  MESSAGE RESPONSE {
    status: STRING REQUIRED
    result: JSON OPTIONAL
    error: STRING OPTIONAL
  }

  HANDLER COMMAND_RECEIVED ON RECEIVE {
    VALIDATE message AGAINST law_compliance
    CALL organism.execute(message.action)
    EMIT RESPONSE
  }

  HANDLER ERROR ON ERROR {
    LOG "Terminal error occurred"
    EMIT ERROR_NARRATIVE
  }
}
```

### Example 2: Atlas Communication Protocol
```tpl
PROTOCOL ATLAS_REGISTRY {
  VERSION "1.0.0"
  ENCODED_ID "TPL.ATLAS.REGISTRY"

  CHANNEL REGISTRATION {
    TRANSPORT: ICP_CALL
    SECURITY: SIGNED
    QOS: EXACTLY_ONCE
    CANISTER_ID: "rrkah-fqaaa-aaaaa-aaaaq-cai"
  }

  MESSAGE REGISTER_TERMINAL {
    terminal_id: STRING REQUIRED
    capabilities: JSON REQUIRED
    laws_enforced: ARRAY<STRING> REQUIRED
    doctrine: CDL REQUIRED
  }

  MESSAGE REGISTRY_CONFIRMATION {
    terminal_id: STRING REQUIRED
    atlas_id: STRING REQUIRED
    federation_token: BYTES REQUIRED
  }
}
```

### Example 3: Organism Invocation Protocol
```tpl
PROTOCOL ORGANISM_INVOCATION {
  VERSION "1.0.0"
  ENCODED_ID "TPL.ORGANISM.INVOKE"

  CHANNEL COGNITIVE_PIPELINE {
    TRANSPORT: HTTP
    SECURITY: ZERO_KNOWLEDGE
    QOS: AT_LEAST_ONCE
    TIMEOUT: 5000ms
  }

  MESSAGE INVOKE_ORGANISM {
    organism_id: STRING REQUIRED
    operation: CPL_P REQUIRED
    context: JSON OPTIONAL
  }

  MESSAGE ORGANISM_RESULT {
    finding: JSON REQUIRED
    confidence: NUMBER REQUIRED
    trace: ARRAY<STRING> OPTIONAL
  }

  HANDLER INVOKE ON SEND {
    CALL verify_organism_contract(message.organism_id)
    EMIT message TO COGNITIVE_PIPELINE
  }

  HANDLER RESULT ON RECEIVE {
    IF message.confidence >= 0.85 THEN
      EMIT FINDING_CONFIRMED
    ELSE
      EMIT FINDING_UNCERTAIN
    END
  }
}
```

---

## 4. INTEGRATION POINTS

### With Intelligence Routing SDK
```javascript
import { IntelligenceWire } from '@medina/intelligence-routing-sdk';
import { TPLProtocol } from '@medina/tpl-runtime';

const protocol = new TPLProtocol('/protocols/terminal_mesh.tpl');
const wire = new IntelligenceWire({
  protocol,
  endpoint: 'wss://terminal.medina.systems'
});

await wire.send({
  action: 'process_thought',
  target: 'ARCHON',
  params: { proposal_id: '12345' }
});
```

### With ORO Canisters
```motoko
// Terminal registration via TPL
import TPL "mo:tpl-runtime/TPL";

actor Terminal {
  let atlasProtocol = TPL.load("TPL.ATLAS.REGISTRY");

  public shared func registerWithAtlas() : async Text {
    let message = {
      terminal_id = "TERMINAL_001";
      capabilities = ["CPL_P", "CDL"];
      laws_enforced = ["COSMOS.LAW.TERMINAL"];
      doctrine = loadDoctrine();
    };

    await atlasProtocol.send("REGISTRATION", message)
  };
}
```

---

## STATUS

- ✅ Grammar defined
- ✅ Examples created
- 🟡 Parser implementation in progress
- 🟡 Runtime implementation in progress
- ⏳ Integration with intelligence-routing-sdk planned

---

**Next:** Implement TPL parser in `/languages/tpl/src/parser.js`
