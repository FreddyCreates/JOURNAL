# Bot Fleet Governance System

**Autonomous governance for CI/CD bot fleet using cognitive languages**

Part of **Medina Sovereign Intelligence** — A self-governing organism architecture

---

## Overview

The Bot Fleet Governance System treats each CI/CD bot as an **organism-class entity** with full governance integration. The system connects:

- **16 bots** across 7 divisions (Build, Test, Secure, Document, Deploy, Learn, Command)
- **CPL-L laws** defining safety rules and constraints
- **CPL-P pipelines** orchestrating governance cycles
- **OCL charters** specifying capabilities and drives
- **Meta Engine** for continuous learning and optimization
- **Human feedback** loop for decision refinement

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GOVERNANCE CYCLE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Bot Event (CI/CD)                                          │
│       ↓                                                     │
│  ┌──────────────────────────────────────────┐              │
│  │  BotGovernanceIntegrator                 │              │
│  │  ─────────────────────────                │              │
│  │  1. Collect Bot State                    │              │
│  │  2. Apply CPL-L Laws                     │              │
│  │  3. Route Escalations                    │              │
│  │  4. High Risk Path (if risk > 0.7)       │              │
│  │  5. Completion                           │              │
│  └──────────────────────────────────────────┘              │
│       ↓                                                     │
│  ┌──────────────────────────────────────────┐              │
│  │  Meta Engine                             │              │
│  │  ─────────────                            │              │
│  │  - Track law statistics                  │              │
│  │  - Detect patterns                       │              │
│  │  - Propose optimizations                 │              │
│  │  - Learn from overrides                  │              │
│  └──────────────────────────────────────────┘              │
│       ↓                                                     │
│  ┌──────────────────────────────────────────┐              │
│  │  Human Feedback (if escalated)           │              │
│  │  ─────────────────────────                │              │
│  │  - Override decisions                    │              │
│  │  - Provide rationale                     │              │
│  │  - Flag false positives/negatives        │              │
│  └──────────────────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Atlas Registry (`atlas/registry/`)

Entity registry for all 16 bots with atlas:// URI scheme.

**Bots by Division:**

- **Division VII** — Command & Control
  - `organism-alpha-bot` 👑 Fleet Commander

- **Division I** — Build & Package
  - `organism-build-bot` 🧬 Extension packaging
  - `organism-sdk-bot` 📦 SDK packaging
  - `organism-release-bot` 🚀 Production releases

- **Division II** — Validate & Test
  - `organism-test-bot` 🧪 Cross-matrix testing
  - `organism-protocol-bot` 🔬 Protocol integrity
  - `organism-neural-bot` 🧠 Neural architecture
  - `organism-sandcastle-bot` 🏰 Sandboxed BTL
  - `organism-visual-bot` 📸 Visual regression

- **Division III** — Secure & Monitor
  - `organism-sentinel-bot` 🛡️ Security scanning
  - `organism-deps-bot` 🔄 Dependency health
  - `organism-crawler-bot` 🕷️ Organism mapping

- **Division IV** — Document & Report
  - `organism-docs-bot` 📚 Auto-documentation

- **Division V** — Deploy & Operate
  - `organism-deploy-bot` 🌐 ICP & Pages deployment

- **Division VI** — Learn & Evolve
  - `organism-learning-bot` 🎓 Protocol evolution
  - `organism-economy-bot` 💰 Marketplace analytics

**Query API:**

```javascript
import AtlasRegistry from './atlas/registry/index.js';

// Get bot by ID
const bot = AtlasRegistry.getEntity('atlas://bot/organism-alpha-bot');

// Query by division
const buildBots = AtlasRegistry.getEntitiesByDivision('division-i');

// Query by language
const cplBots = AtlasRegistry.getEntitiesByLanguage('atlas://language/cpl-l');

// Get fleet summary
const summary = AtlasRegistry.getFleetSummary();
```

### 2. OCL Charter (`governance/organisms/bot-fleet.ocl`)

Organism Contract Language charter defining the bot fleet as a collective intelligence.

**Key Sections:**
- **CAPABILITIES**: What bots can do (build, test, deploy, secure, learn, coordinate)
- **CONSTRAINTS**: Safety and operational limits
- **DRIVES**: φ-weighted behavioral parameters (stability, safety, learning_rate)
- **REWARD_STRUCTURE**: Incentive system for bot behavior

### 3. CPL-L Laws (`governance/laws/bot-fleet-safety.cpl-l`)

Cognitive Policy Language defining 7 safety rules:

1. **BLOCK_SECRETS**: Forbid merge when secrets detected
2. **NO_RELEASE_ON_RED**: Forbid release when health is RED
3. **HIGH_RISK_BUILD_GUARD**: Require approval for risky builds
4. **DEPENDENCY_SAFETY**: Forbid merges with critical vulnerabilities
5. **TEST_INTEGRITY**: Forbid merge when tests fail
6. **DEPLOYMENT_GUARD**: Require approval for production deployments
7. **ALPHA_BOT_AUTHORITY**: Grant alpha-bot override capabilities

**Example Law:**

```cpl-l
RULE BLOCK_SECRETS {
  CLAUSE when_secret_detected {
    IF context.findings.contains("secret_leak")
    OR context.findings.contains("api_key_exposed")
    THEN {
      ACTION: FORBID
      TARGET: merge
      SEVERITY: CRITICAL
    }
    AND {
      ACTION: REQUIRE
      TARGET: human_review
      ARG: security_team
      ESCALATION: immediate
    }
  }
}
```

### 4. CPL-P Pipeline (`governance/pipelines/bot-governance.cpl-p`)

Cognitive Processing Language pipeline orchestrating the governance cycle.

**Stages:**
1. `collect_state` — Fetch bot entity, collect context, assess health
2. `apply_laws` — Load applicable laws, evaluate rules, extract actions
3. `route_escalations` — Calculate risk, determine escalation path, notify stakeholders
4. `conditional_branch` — High risk vs standard path
5. `high_risk_escalation` — Block and await human (if risk > 0.7)
6. `standard_completion` — Feed to Meta Engine, record in CIL/RIL

### 5. Bot Events (`governance/events/bot-event-schema.js`)

Structured event schema for all bot CI/CD operations.

**Event Types:**
- `ci_run_completed`
- `security_scan_completed`
- `release_created`
- `deployment_started`
- `dependency_update`
- `test_run_completed`

**Example Event:**

```javascript
{
  entity_id: 'atlas://bot/organism-sentinel-bot',
  event_id: 'evt-2026-05-03-002',
  timestamp: 1714762800000,
  op: 'security_scan_completed',
  context: {
    status: 'completed',
    risk_score: 0.95,
    findings: ['secret_leak', 'api_key_exposed'],
    health_dashboard: { overall: 'red' }
  }
}
```

### 6. Governance Integrator (`governance/runtime/bot-governance-integrator.js`)

Runtime integration connecting events → laws → pipelines → organism runtime.

**Key Methods:**
- `processEvent(botEvent)` — Main governance cycle
- `applyCPLLaws(botEvent, state)` — Evaluate CPL-L rules
- `routeEscalations(lawResults, context)` — Determine escalation path
- `calculateRiskScore(decisions, context)` — Risk assessment
- `recordInOrganismRuntime(cycle, botEvent)` — CIL/RIL logging

### 7. Meta Engine (`governance/meta/bot-fleet-meta-engine.js`)

Continuous learning system watching governance cycles.

**Features:**
- **Law statistics**: Track which laws trigger most frequently
- **Bot analytics**: Monitor escalation rates per bot
- **Pattern detection**: Identify recurring governance issues
- **Proposal generation**: Suggest law adjustments based on patterns
- **Human override learning**: Learn from operator decisions

**API:**

```javascript
import BotFleetMetaEngine from './governance/meta/bot-fleet-meta-engine.js';

const metaEngine = new BotFleetMetaEngine();

// Record cycle
metaEngine.recordCycle(cycle);

// Get reports
const lawReport = metaEngine.getLawReport();
const fleetHealth = metaEngine.getFleetHealthReport();
const proposals = metaEngine.getProposals();
```

### 8. Human Feedback (`governance/feedback/human-feedback-schema.js`)

System for recording human overrides of bot decisions.

**Override Actions:**
- `APPROVE` — Approve despite bot FORBID
- `REJECT` — Reject despite bot PERMIT
- `MODIFY` — Change bot decision parameters
- `DEFER` — Delay decision

**Example Override:**

```javascript
{
  override_id: 'override-2026-05-03-001',
  operator: 'human://freddy',
  bot_id: 'atlas://bot/organism-release-bot',
  original_decision: {
    law_id: 'NO_RELEASE_ON_RED',
    action: 'FORBID',
    severity: 'CRITICAL'
  },
  human_decision: {
    action: 'APPROVE',
    approved_despite_forbid: true,
    rationale: 'Test failures in non-critical features. Hotfix urgently needed.',
    confidence: 0.9
  },
  learning: {
    suggests_law_adjustment: true,
    false_positive: true
  }
}
```

## Usage

### Running the Complete Integration Example

```bash
node governance/examples/complete-integration-example.js
```

This demonstrates:
1. Bot event triggering governance cycle
2. CPL-L law evaluation
3. Risk-based escalation
4. Human override
5. Meta Engine learning
6. Comprehensive reporting

### Integrating with CI/CD

**1. Emit Bot Events from GitHub Actions:**

```yaml
# .github/workflows/test.yml
- name: Emit Bot Event
  run: |
    node scripts/emit-bot-event.js \
      --entity "atlas://bot/organism-test-bot" \
      --op "test_run_completed" \
      --context "${{ toJson(github) }}"
```

**2. Process Events in Governance Cycle:**

```javascript
import { BotGovernanceIntegrator } from './governance/runtime/bot-governance-integrator.js';

const integrator = new BotGovernanceIntegrator();

// Process incoming bot event
const cycle = await integrator.processEvent(botEvent);

// Check if blocked
if (cycle.escalated) {
  console.log('🚨 High risk operation blocked. Human review required.');
  process.exit(1);
}
```

**3. Handle Human Overrides:**

```javascript
import { HumanFeedbackRecorder } from './governance/feedback/human-feedback-schema.js';

const feedbackRecorder = new HumanFeedbackRecorder();

// Record human approval
feedbackRecorder.recordOverride({
  override_id: 'override-123',
  operator: 'human://freddy',
  bot_id: 'atlas://bot/organism-release-bot',
  human_decision: {
    action: 'APPROVE',
    rationale: 'Justified business reason'
  }
});
```

## Governance Cycle Flow

```
1. Bot Event Triggered
   (CI run completes, security scan finishes, release tagged)
         ↓
2. Collect Bot State
   (Fetch bot entity from atlas, collect context, assess health)
         ↓
3. Apply CPL-L Laws
   (Load applicable laws, evaluate rules, generate decisions)
         ↓
4. Route Escalations
   (Calculate risk score, determine escalation path)
         ↓
5. Conditional Branch
   ├─ Risk > 0.7 → High Risk Escalation (block, await human)
   └─ Risk ≤ 0.7 → Standard Completion (log, continue)
         ↓
6. Record in OrganismRuntime
   (Create CIL entry, create RIL entry if failed/escalated)
         ↓
7. Feed to Meta Engine
   (Track statistics, detect patterns, propose optimizations)
         ↓
8. Human Review (if escalated)
   (Override decision, provide rationale, flag for learning)
```

## Risk Scoring

Risk scores range from 0.0 (low risk) to 1.0 (critical risk).

**Factors:**
- Base context risk score
- Critical severity decisions (+0.15 each)
- FORBID actions (+0.1 each)
- Security findings (+0.2)

**Escalation Thresholds:**
- **> 0.7**: HIGH (escalate to human://freddy immediately)
- **0.4 - 0.7**: MEDIUM (notify team lead)
- **< 0.4**: LOW (standard operation)

## Meta Learning

The Meta Engine learns from:

1. **Law trigger patterns** — Which laws fire most frequently
2. **Bot escalation rates** — Which bots escalate most often
3. **Human override patterns** — When humans disagree with bots
4. **False positives** — Bot too strict
5. **False negatives** — Bot missed something

**Proposals Generated:**
- `LAW_TOO_STRICT` — Law triggers too many escalations
- `BOT_HIGH_ESCALATION` — Bot escalates too frequently
- `FREQUENT_HUMAN_OVERRIDE` — Humans often override bot
- `LAW_ADJUSTMENT_NEEDED` — Pattern of similar overrides detected

## Integration with Existing Systems

### ORO.GOV.TRACE Agents

Bot fleet connects to ORO governance organism:

- **ARCHON** — Strategic governance oversight
- **VECTOR** — Direction and priority management
- **LUMEN** — Insight and pattern recognition
- **FORGE** — Implementation and execution

### Cognitive Languages

Bot fleet uses:

- **OCL** — Organism contracts
- **CPL-L** — Policy laws
- **CPL-P** — Pipeline processing
- **AFL** — Agent flow orchestration
- **CIL** — Cognitive internal state
- **RIL** — Repair and integration
- **ERR** — Error handling
- **BTL** — Build-test-land
- **NAL** — Neural architecture
- **MDL** — Mapping and discovery
- **PSL** — Protocol specification
- **IML** — Infrastructure management
- **EML** — Economic modeling

## File Structure

```
atlas/
└── registry/
    ├── index.js                          # Query API
    └── entities/
        ├── README.md
        ├── organism-alpha-bot.json       # Fleet commander
        ├── organism-build-bot.json       # Extension build
        ├── organism-sdk-bot.json         # SDK packaging
        ├── organism-release-bot.json     # Releases
        ├── organism-test-bot.json        # Testing
        ├── organism-protocol-bot.json    # Protocol checks
        ├── organism-neural-bot.json      # Neural validation
        ├── organism-sandcastle-bot.json  # Sandboxed BTL
        ├── organism-visual-bot.json      # Visual regression
        ├── organism-sentinel-bot.json    # Security
        ├── organism-deps-bot.json        # Dependencies
        ├── organism-crawler-bot.json     # Discovery
        ├── organism-docs-bot.json        # Documentation
        ├── organism-deploy-bot.json      # Deployment
        ├── organism-learning-bot.json    # Learning
        └── organism-economy-bot.json     # Analytics

governance/
├── organisms/
│   └── bot-fleet.ocl                    # OCL charter
├── laws/
│   └── bot-fleet-safety.cpl-l           # CPL-L laws
├── pipelines/
│   └── bot-governance.cpl-p             # CPL-P pipeline
├── events/
│   └── bot-event-schema.js              # Event definitions
├── runtime/
│   └── bot-governance-integrator.js     # Integration runtime
├── meta/
│   └── bot-fleet-meta-engine.js         # Learning engine
├── feedback/
│   └── human-feedback-schema.js         # Override system
└── examples/
    └── complete-integration-example.js  # Full demo
```

## Attribution

**Author**: Alfredo "Freddy" Medina Hernandez
**Organization**: Medina Sovereign Intelligence
**Date**: 2026-05-03
**Version**: 1.0.0

Part of the 40 Cognitive Languages project and ORO organism architecture.

---

**Next Steps:**

1. Wire GitHub Actions to emit bot events
2. Connect governance integrator to CI/CD workflows
3. Set up human review dashboard
4. Enable Meta Engine continuous learning
5. Create alerts for high-risk escalations
6. Deploy governance system to production

---

*The bots are now governed. The laws are defined. The cycle is complete.*
