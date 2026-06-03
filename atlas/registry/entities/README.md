# Bot Fleet Entity Registry

**Atlas Registry** — Organism-class entities for the bot fleet

This directory contains entity definitions for all bots in the organism bot fleet. Each bot is treated as a first-class organism with:

- **Identity**: Unique atlas:// URI
- **Class**: Bot classification
- **Division**: Organizational grouping
- **Languages**: Cognitive languages the bot uses
- **Governance**: Pipeline connections for law enforcement

## Directory Structure

```
atlas/registry/entities/
├── organism-alpha-bot.json       # 👑 Fleet Commander
├── organism-build-bot.json       # 🧬 Extension packaging
├── organism-sdk-bot.json         # 📦 SDK packaging
├── organism-release-bot.json     # 🚀 Production releases
├── organism-test-bot.json        # 🧪 Cross-matrix testing
├── organism-protocol-bot.json    # 🔬 Protocol integrity
├── organism-neural-bot.json      # 🧠 Neural architecture
├── organism-sandcastle-bot.json  # 🏰 Sandboxed BTL
├── organism-visual-bot.json      # 📸 Visual regression
├── organism-sentinel-bot.json    # 🛡️ Security scanning
├── organism-deps-bot.json        # 🔄 Dependency health
├── organism-crawler-bot.json     # 🕷️ Organism mapping
├── organism-docs-bot.json        # 📚 Auto-documentation
├── organism-deploy-bot.json      # 🌐 ICP & Pages deployment
├── organism-learning-bot.json    # 🎓 Protocol evolution
└── organism-economy-bot.json     # 💰 Marketplace analytics
```

## Entity Schema

Each bot entity follows this schema:

```json
{
  "id": "atlas://bot/<bot-name>",
  "name": "<bot-name>",
  "class": "Bot",
  "division": "<Division Name>",
  "divisionId": "division-<roman-numeral>",
  "emoji": "<emoji>",
  "domain": "<primary-responsibility>",
  "triggers": ["<trigger-patterns>"],
  "languages": ["atlas://language/<lang-id>"],
  "governance_pipeline": "pipeline://governance/<pipeline-id>",
  "capabilities": ["<capability-list>"],
  "constraints": ["<constraint-list>"],
  "metadata": {
    "author": "Medina Sovereign Intelligence",
    "created": "<date>",
    "version": "<semver>",
    "criticality": "<level>"
  }
}
```

## Bot Divisions

### Division VII — Command & Control
- **organism-alpha-bot**: Fleet-wide coordination and governance

### Division I — Build & Package
- **organism-build-bot**: Extension packaging
- **organism-sdk-bot**: SDK packaging
- **organism-release-bot**: Production releases

### Division II — Validate & Test
- **organism-test-bot**: Cross-matrix testing
- **organism-protocol-bot**: Protocol integrity checks
- **organism-neural-bot**: Neural architecture validation
- **organism-sandcastle-bot**: Sandboxed build-test-land
- **organism-visual-bot**: Visual regression testing

### Division III — Secure & Monitor
- **organism-sentinel-bot**: Security scanning
- **organism-deps-bot**: Dependency health monitoring
- **organism-crawler-bot**: Organism discovery and mapping

### Division IV — Document & Report
- **organism-docs-bot**: Automated documentation generation

### Division V — Deploy & Operate
- **organism-deploy-bot**: ICP canister and Pages deployment

### Division VI — Learn & Evolve
- **organism-learning-bot**: Protocol evolution and learning
- **organism-economy-bot**: Marketplace analytics

## Usage

### Query by ID
```javascript
import { AtlasRegistry } from '../index.js';

const bot = AtlasRegistry.getEntity('atlas://bot/organism-alpha-bot');
```

### Query by Division
```javascript
const divisionBots = AtlasRegistry.getEntitiesByDivision('division-i');
```

### Query by Language
```javascript
const cplBots = AtlasRegistry.getEntitiesByLanguage('atlas://language/cpl-l');
```

### Get Governance Pipeline
```javascript
const pipeline = bot.governance_pipeline;
// "pipeline://governance/bot_cycle"
```

## Integration

Bot entities integrate with:

1. **OCL Charters**: `governance/organisms/bot-fleet.ocl`
2. **CPL-L Laws**: `governance/laws/bot-fleet-safety.cpl-l`
3. **CPL-P Pipelines**: `governance/pipelines/bot-governance.cpl-p`
4. **AFL Flows**: `languages/afl/examples/bot-fleet-orchestration.afl`
5. **ORO Agents**: Connected to ARCHON, VECTOR, LUMEN, FORGE

## Attribution

Atlas Bot Registry — Part of Medina Sovereign Intelligence
Author: Alfredo "Freddy" Medina Hernandez
