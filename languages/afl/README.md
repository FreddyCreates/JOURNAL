# AFL — Agent Flow Language

**Lingua Fluxus Agentum** (Agent Flow Language)

A domain-specific language for orchestrating AI agent internal workflows using Latin nomenclature, integrated with the ORO.GOV.TRACE architecture.

## Overview

AFL enables declarative specification of multi-agent workflows with:
- **Latin naming conventions** (NOMEN_LATINUM) for formal identification
- **Agent orchestration** (AGENTES) with capabilities (POTENTIAE) and connections (NEXUS)
- **Stage-based execution** (STADIA) with requirements (REQUISITA) and outputs (EXITUS)
- **Conditional transitions** (TRANSITIONES) with timing control (TEMPUS)

## Integration with ORO Architecture

AFL is designed to orchestrate the four ORO.GOV.TRACE agents:

| Agent Code | Latin Name | English Name | Role |
|------------|------------|--------------|------|
| **ARCHON** | INTEGRITAS_CUSTOS | Integrity Guardian | Payload analysis, claim verification |
| **VECTOR** | EXECUTIO_VESTIGATOR | Execution Investigator | Target identification, state tracking |
| **LUMEN** | CONTEXTUS_ILLUMINATOR | Context Illuminator | Precedent search, history linking |
| **FORGE** | VERIFICATIO_FABRICATOR | Verification Fabricator | Verification steps, evidence validation |

## Syntax

### FLUXUS (Flow Definition)

```afl
FLUXUS <name> {
  VERSION "<version>"
  NOMEN: <latin_identifier>

  AGENTES { ... }
  STADIA { ... }
  TRANSITIONES { ... }
}
```

### AGENTES (Agent Definitions)

```afl
AGENTES {
  <AGENT_NAME>: {
    NOMEN_LATINUM: <latin_name>
    MUNUS: <role>
    POTENTIAE: <capability_list>
    NEXUS: <connected_agents>
  }
}
```

### STADIA (Stage Definitions)

```afl
STADIA {
  <STAGE_NAME>: {
    NOMEN_LATINUM: <latin_name>
    ACTIONES: <action_list>
    REQUISITA: <requirement_list>
    EXITUS: <output_list>
  }
}
```

### TRANSITIONES (Transition Rules)

```afl
TRANSITIONES {
  <FROM_STAGE> -> <TO_STAGE>: {
    CONDITIO: "<condition_expression>"
    TEMPUS: <duration_ms>
  }
}
```

## Latin Terminology Reference

| Latin Term | English | Usage |
|------------|---------|-------|
| FLUXUS | Flow | Top-level workflow container |
| NOMEN | Name | Public identifier |
| NOMEN_LATINUM | Latin Name | Formal Latin designation |
| AGENTES | Agents | AI agents in the workflow |
| MUNUS | Role/Duty | Agent's primary function |
| POTENTIAE | Capabilities | Agent's skills/abilities |
| NEXUS | Connections | Inter-agent connections |
| STADIA | Stages | Execution stages |
| ACTIONES | Actions | Stage actions to perform |
| REQUISITA | Requirements | Stage prerequisites |
| EXITUS | Outputs | Stage outputs |
| TRANSITIONES | Transitions | Stage-to-stage flows |
| CONDITIO | Condition | Transition condition |
| TEMPUS | Time | Duration in milliseconds |

## Example: ORO Agent Council

```afl
FLUXUS ORO_AGENT_COUNCIL {
  VERSION "1.0.0"
  NOMEN: CONSILIUM_AGENTUM_ORO

  AGENTES {
    ARCHON: {
      NOMEN_LATINUM: INTEGRITAS_CUSTOS
      MUNUS: INTEGRITY_CHECK
      POTENTIAE: payload_analysis, claim_verification, mismatch_detection
      NEXUS: VECTOR, LUMEN
    }

    VECTOR: {
      NOMEN_LATINUM: EXECUTIO_VESTIGATOR
      MUNUS: EXECUTION_TRACE
      POTENTIAE: target_identification, method_resolution, state_tracking
      NEXUS: ARCHON, FORGE
    }

    LUMEN: {
      NOMEN_LATINUM: CONTEXTUS_ILLUMINATOR
      MUNUS: CONTEXT_MAP
      POTENTIAE: precedent_search, forum_analysis, history_linking
      NEXUS: ARCHON, FORGE
    }

    FORGE: {
      NOMEN_LATINUM: VERIFICATIO_FABRICATOR
      MUNUS: VERIFICATION_LAB
      POTENTIAE: verification_steps, hash_checks, evidence_validation
      NEXUS: VECTOR, LUMEN
    }
  }

  STADIA {
    INGESTA_PROPOSITIO: {
      NOMEN_LATINUM: ACCEPTIO_PRIMARIA
      ACTIONES: fetch_from_nns, parse_proposal, extract_metadata
      REQUISITA: valid_proposal_id
      EXITUS: proposal_record
    }

    ANALYSIS_INTEGRITAS: {
      NOMEN_LATINUM: EXAMINATIO_INTEGRITATIS
      ACTIONES: compare_payload_claim, identify_discrepancies
      REQUISITA: proposal_record
      EXITUS: integrity_findings
    }

    SYNTHESIS_FINALIS: {
      NOMEN_LATINUM: COMPOSITIO_CONCLUSIVA
      ACTIONES: consolidate_findings, assess_risk, generate_summary
      REQUISITA: integrity_findings, execution_trace, context_map
      EXITUS: effect_trace_record
    }
  }

  TRANSITIONES {
    INGESTA_PROPOSITIO -> ANALYSIS_INTEGRITAS: {
      CONDITIO: "proposal_record.status == VALID"
      TEMPUS: 100
    }

    ANALYSIS_INTEGRITAS -> SYNTHESIS_FINALIS: {
      CONDITIO: "integrity_findings.critical_issues == FALSE"
      TEMPUS: 300
    }
  }
}
```

## Usage

### Parsing AFL

```javascript
import AFLParser from './languages/afl/src/parser.js';

const parser = new AFLParser();
const ast = parser.parse(aflSourceCode);
```

### Executing Flows

```javascript
import AgentFlowRuntime from './languages/afl/runtime/agent-flow-runtime.js';

const runtime = new AgentFlowRuntime();

// Execute from source
const result = await runtime.executeFlow(aflSourceCode, context);

// Execute ORO Council directly
const councilResult = await runtime.executeOROCouncil(proposalContext);
```

### Registering Custom Agents

```javascript
runtime.registerAgent('MY_AGENT', {
  nomenLatinum: 'MEA_AGENS',
  munus: 'CUSTOM_TASK',
  potentiae: ['skill1', 'skill2'],
  execute: async (context) => {
    // Agent logic
    return { result: 'completed' };
  }
});
```

## Integration with SYN Engine

AFL flows can be triggered by the ORO SYN Engine's 24-hour cycle:

1. **E11 — Agent Council Engine** calls `runtime.executeOROCouncil()`
2. Agents run in parallel: ARCHON, VECTOR, LUMEN, FORGE
3. Findings are synthesized and stored in AgentFindings canister
4. Results feed into E12 (Public Summary) and E15 (Export)

## File Structure

```
languages/afl/
├── src/
│   └── parser.js          # AFL parser
├── runtime/
│   └── agent-flow-runtime.js  # Flow execution engine
├── examples/
│   ├── oro_agent_council.afl  # ORO 4-agent orchestration
│   └── syn_engine_flow.afl    # SYN Engine 15-engine flow
└── README.md              # This file
```

## Verification

```bash
# Parse an AFL file
node -e "import('./src/parser.js').then(m => {
  const p = new m.AFLParser();
  const ast = p.parse(fs.readFileSync('examples/oro_agent_council.afl', 'utf8'));
  console.log(JSON.stringify(ast, null, 2));
});"

# Execute a flow
node -e "import('./runtime/agent-flow-runtime.js').then(m => {
  const r = new m.AgentFlowRuntime();
  r.executeFlow(fs.readFileSync('examples/oro_agent_council.afl', 'utf8'))
    .then(result => console.log(result));
});"
```

## Attribution

AFL (Agent Flow Language) — Part of the 40 Cognitive Languages framework

**Encoded Identity:** ORO.GOV.TRACE
**Public Name:** EffectTrace
**Internal Name:** ORO Governance Organism

*"Propositio mutat. Nos recordamur. Veritas manet."*
*(Proposals change. We remember. Truth remains.)*

Created for the Medina Sovereign Intelligence architecture.
Author: Alfredo "Freddy" Medina Hernandez
