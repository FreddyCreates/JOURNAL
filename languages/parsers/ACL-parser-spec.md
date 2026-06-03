# ACL — Agent Communication Language (Parser Specification)

> Parser specification for the language governing agent-to-agent messaging, council findings, wire protocols, and multi-agent coordination.

## 1. Purpose

ACL (Agent Communication Language) enables:
- Agent-to-agent message passing with typed payloads
- Council finding submissions and voting
- Encrypted intelligence wire creation
- Workforce task assignment and load balancing
- Multi-agent coordination protocols

## 2. Source Protocol Mapping

| ACL Concept | Existing Implementation | File |
|-------------|------------------------|------|
| Agent Findings | AgentFindings.mo | motoko/ORO/AgentFindings.mo |
| Agent Council | ORO index.mo (E11-E12) | motoko/ORO/index.mo |
| Intelligence Wires | IntelligenceWire | intelligence-routing-sdk |
| Workforce Routing | WorkforceRouter | intelligence-routing-sdk |
| Edge Mesh | Edge Mesh Intelligence Protocol | protocols/edge-mesh-intelligence-protocol.js |
| Encrypted Transport | Encrypted Intelligence Transport | protocols/encrypted-intelligence-transport.js |

## 3. Grammar (EBNF)

```ebnf
(* ACL Agent Communication Grammar *)
program         = { statement } ;
statement       = agent_decl | message_stmt | council_stmt
                | wire_stmt | task_stmt | coordination_stmt ;

(* Agent Declaration *)
agent_decl      = "AGENT" identifier "{"
                  "role:" role_name ";"
                  "capabilities:" "[" { identifier "," } "]" ";"
                  [ "division:" division_name ";" ]
                  [ "clearance:" clearance_level ";" ]
                  "}" ;
role_name       = "WORKER" | "REVIEWER" | "COORDINATOR" | "SOVEREIGN" ;
clearance_level = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "SOVEREIGN" ;

(* Message Passing *)
message_stmt    = "SEND" message_type "FROM" agent_ref "TO" agent_ref
                  "{" payload "}"
                  [ "ENCRYPTED" ] [ "PRIORITY" priority_level ] ";" ;
message_type    = "REQUEST" | "RESPONSE" | "FINDING" | "VOTE"
                | "ALERT" | "RESONANCE" | "COMMAND" ;
payload         = { field_assign } ;
field_assign    = identifier ":" expression ";" ;
priority_level  = "LOW" | "NORMAL" | "HIGH" | "CRITICAL" ;

(* Council Operations *)
council_stmt    = "COUNCIL" identifier "{"
                  { council_action }
                  "}" ;
council_action  = "SUBMIT_FINDING" finding_ref ";"
                | "VOTE" vote_type "ON" proposal_ref ";"
                | "DELIBERATE" topic "FOR" duration ";"
                | "REACH_CONSENSUS" "THRESHOLD" float_literal ";" ;
vote_type       = "ADOPT" | "REJECT" | "ABSTAIN" | "DEFER" ;

(* Intelligence Wires *)
wire_stmt       = "WIRE" identifier "{"
                  "from:" agent_ref ";"
                  "to:" agent_ref ";"
                  "encryption:" encryption_mode ";"
                  [ "bandwidth:" nat ";" ]
                  [ "protocol:" protocol_ref ";" ]
                  "}" ;
encryption_mode = "AES256" | "SOVEREIGN_SEAL" | "PHI_ENCRYPTED" | "PLAIN" ;

(* Task Assignment *)
task_stmt       = "ASSIGN" task_ref "TO" agent_ref
                  [ "WEIGHT" phi_value ]
                  [ "DEADLINE" duration ] ";" ;

(* Multi-Agent Coordination *)
coordination_stmt = "COORDINATE" identifier "{"
                    "agents:" "[" { agent_ref "," } "]" ";"
                    "protocol:" coordination_protocol ";"
                    [ "sync:" sync_mode ";" ]
                    "}" ;
coordination_protocol = "ROUND_ROBIN" | "PHI_WEIGHTED" | "CONSENSUS"
                      | "HIERARCHICAL" | "MESH" ;
sync_mode       = "HEARTBEAT_SYNC" | "EVENT_DRIVEN" | "CONTINUOUS" ;
```

## 4. Example

```acl
(* Declare agents *)
AGENT governance_analyzer {
  role: REVIEWER;
  capabilities: [proposal_analysis, risk_assessment, evidence_gathering];
  division: AI_DIVISION;
  clearance: INTERNAL;
}

AGENT council_coordinator {
  role: COORDINATOR;
  capabilities: [consensus_building, vote_tallying, finding_synthesis];
  division: GOVERNANCE;
  clearance: SOVEREIGN;
}

(* Submit a finding to the council *)
SEND FINDING FROM governance_analyzer TO council_coordinator {
  proposal_id: "NNS-12345";
  risk_level: "MEDIUM";
  evidence: "Proposal affects neuron_fleet staking distribution";
  recommendation: "REVIEW_EXTENDED";
} ENCRYPTED PRIORITY HIGH;

(* Council deliberation *)
COUNCIL governance_council {
  SUBMIT_FINDING finding_nns_12345;
  DELIBERATE "neuron_fleet_impact" FOR 5 HEARTBEATS;
  VOTE ADOPT ON proposal_nns_12345;
  REACH_CONSENSUS THRESHOLD 0.618;
}

(* Create encrypted wire between agents *)
WIRE intel_channel {
  from: governance_analyzer;
  to: council_coordinator;
  encryption: SOVEREIGN_SEAL;
  bandwidth: 1000;
  protocol: encrypted-intelligence-transport;
}

(* Multi-agent coordination *)
COORDINATE threat_response {
  agents: [governance_analyzer, council_coordinator, defense_agent];
  protocol: PHI_WEIGHTED;
  sync: HEARTBEAT_SYNC;
}
```

## 5. Parser Architecture

```
ACL Source → Lexer → Token Stream → Parser → AST → Agent Validator → CIL Output
                                                         ↓
                                                 Agent Registry
                                                 (ORO AgentFindings.mo)
                                                 (intelligence-routing-sdk)
```

The ACL parser generates:
- CIL SEND/RECV instructions for message passing
- Council finding records for ORO governance
- Wire configuration for encrypted transport
- Task assignment schedules for workforce routing

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-L** | ACL messages can carry CPL-L contract references |
| **CPL-P** | Agent procurement requests use ACL message passing |
| **CIL** | ACL compiles to CIL SEND/RECV/RESONATE instructions |
| **CDL** | ACL message schemas defined in CDL |
| **OCL** | OCL lifecycle events trigger ACL notifications |
| **RSL** | ACL resonance messages carry RSL patterns |
