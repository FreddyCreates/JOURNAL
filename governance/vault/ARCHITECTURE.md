# Sovereign Vault System Architecture

## Complete System Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        SOVEREIGN VAULT SYSTEM                               │
│                  (Unified Credential Management Layer)                      │
└────────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────────┐
                           │  Ledger Metadata    │
                           │  (ledger.json)      │
                           │  ─────────────────  │
                           │  • Token IDs        │
                           │  • Scopes           │
                           │  • Policies         │
                           │  • Restrictions     │
                           │  • Classes          │
                           └──────────┬──────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
         ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐
         │   Bridge    │      │   Client    │      │  Governance │
         │  (bridge.js)│      │ (client.js) │      │   (Laws &   │
         │             │      │             │      │  Pipelines) │
         │ • Resolve   │      │ • get()     │      │             │
         │ • Audit     │      │ • has()     │      │ • Access    │
         │ • Rate-limit│      │ • list()    │      │   Control   │
         │             │      │ • getClass()│      │ • Audit     │
         └──────┬──────┘      └──────┬──────┘      │ • Lifecycle │
                │                    │             └──────┬──────┘
                │                    │                    │
                └────────────────────┼────────────────────┘
                                     │
                           ┌─────────▼─────────┐
                           │  GitHub Secrets   │
                           │  (Runtime Env)    │
                           │  ─────────────────│
                           │  • MEDINASITECH   │
                           │  • NPM_TOKEN      │
                           │  • GITHUB_TOKEN   │
                           │  • ...future...   │
                           └─────────┬─────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
         ┌────────▼────────┐ ┌──────▼─────┐  ┌────────▼───────┐
         │   Integration   │ │  Cognition │  │    Memory      │
         │    Tokens       │ │   Tokens   │  │    Tokens      │
         │ (4 active)      │ │  (Future)  │  │   (Future)     │
         ├─────────────────┤ ├────────────┤  ├────────────────┤
         │ • MEDINASITECH  │ │ •         │  │ •              │
         │ • COPILOT_...   │ │           │  │                │
         │ • NPM_TOKEN     │ │           │  │                │
         │ • GITHUB_TOKEN  │ │           │  │                │
         └────────────────┘ └────────────┘  └────────────────┘

         ┌──────────────────┐  ┌─────────────┐
         │     System       │  │ Enterprise  │
         │     Tokens       │  │  Connectors │
         │    (Future)      │  │  (Future)   │
         ├──────────────────┤  ├─────────────┤
         │ • Governance     │  │ • Salesforce│
         │ • Organism Fleet │  │ • SAP       │
         │ • Coordination   │  │ • HubSpot   │
         │                  │  │ • Stripe    │
         └──────────────────┘  │ • Google    │
                               │ • Shopify   │
                               │ • Slack     │
                               │ • Twilio    │
                               └─────────────┘
```

## Data Flow

### Token Resolution Flow

```
┌─────────┐
│ Request │
│ get()   │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  VaultClient.get(tokenId, context)                          │
│  ───────────────────────────────────────────────────────────│
│  1. Validate caller authentication                          │
│  2. Load ledger metadata                                    │
│  3. Look up token entry                                     │
│  4. Check token status (active/revoked/expired)             │
│  5. Evaluate access policy (human_gate?, rate_limit?)       │
│  6. Resolve secret_ref → environment variable               │
│  7. Create audit event (phi-hashed)                         │
│  8. Return token + scopes + restrictions + capabilities     │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────┐
│  Token Delivered     │
│  • Value             │
│  • Scopes            │
│  • Restrictions      │
│  • Capabilities      │
└──────────────────────┘
```

### Audit Trail

```
Resolution Request
     │
     ▼
┌─────────────────────────────────────────┐
│  Create Audit Event                      │
│  {                                       │
│    token_id: "MEDINASITECH",             │
│    caller: "zenodo-agent",               │
│    operation: "create_deposit",          │
│    timestamp: 1686234567000,             │
│    phi_hash: "a1b2c3d4",                 │
│    policy_applied: "agent_write"         │
│  }                                       │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Audit Log (Memory) │
│  [events...]        │
│  (Retrievable via   │
│  getAuditLog())     │
└─────────────────────┘
```

## Token Lifecycle

```
┌──────────┐
│ Register │  Add entry to ledger.json with metadata
└─────┬────┘
      │
      ▼
┌──────────┐
│ Activate │  Create GitHub Secret with actual value
└─────┬────┘
      │
      ▼
┌───────────────┐
│ Bridge Inject │  secret_ref → environment variable (at runtime)
└─────┬─────────┘
      │
      ▼
┌───────┐
│ Usage │  Agent resolves token via VaultClient.get()
└─────┬─┘
      │
      ▼
┌────────┐
│ Audit  │  Operation logged with phi-hash signature
└─────┬──┘
      │
      ▼
┌────────┐
│ Revoke │  Set status: "revoked", delete GitHub Secret
└────────┘
```

## Access Policies

| Policy | Human Required | Audit | Rate Limit | Use Case |
|--------|---|---|---|---|
| `agent_write` | No | Yes | 60/hr | Agents writing to external services |
| `agent_read` | No | No | 1000/hr | Agents reading from external services |
| `human_gate` | Yes | Yes | 10/hr | Operations requiring approval |
| `sovereign_only` | Yes | Yes | 5/hr | Owner-only operations |

## Integration Patterns

### Pattern 1: Direct VaultClient Usage

```javascript
import { VaultClient } from './governance/vault/client.js';

const vault = new VaultClient();
const token = vault.get('MY_TOKEN', { 
  caller: 'my-service', 
  operation: 'read_data' 
});

// Use token...
```

### Pattern 2: Workflow via GitHub Actions Bridge

```yaml
- uses: ./.github/workflows/vault-bridge.yml
  with:
    token_id: MY_TOKEN
    operation: deploy_service
```

### Pattern 3: Enterprise Connector

```javascript
class MyConnector extends VaultIntegratedConnector {
  constructor() {
    super('MY_SERVICE_TOKEN', 'my-connector');
  }
  
  async authenticate() {
    const cred = this.getCredential('authenticate');
    return this.login(cred.token);
  }
}
```

## Health Monitoring

The Vault Health Dashboard (`.github/workflows/vault-health.yml`) runs every 6 hours and:

- ✓ Validates ledger JSON structure
- ✓ Counts tokens by status (active/revoked)
- ✓ Lists tokens by class and provider
- ✓ Checks secret availability in GitHub Actions
- ✓ Reports overall vault health

## Future Extensions

### Cognition Tokens

```json
{
  "token_id": "MEMORY_ACCESS_TOKEN",
  "class": "cognition",
  "provider": "internal",
  "scopes": ["memory:read", "memory:write"],
  "capabilities": ["recall_facts", "store_beliefs"]
}
```

### System Tokens

```json
{
  "token_id": "GOVERNANCE_ENFORCEMENT_TOKEN",
  "class": "system",
  "provider": "internal",
  "scopes": ["law:enforce", "pipeline:execute"],
  "capabilities": ["validate_merge", "block_deploy"]
}
```

### Enterprise Connectors (Examples)

```json
{
  "token_id": "SALESFORCE_API_KEY",
  "class": "enterprise",
  "provider": "salesforce",
  "scopes": ["read:accounts", "write:leads"]
},
{
  "token_id": "SAP_ENTERPRISE_KEY",
  "class": "enterprise",
  "provider": "sap",
  "scopes": ["read:finance", "write:orders"]
}
```

---

**For implementation details**, see:
- `governance/vault/README.md` — Overview
- `governance/vault/INTEGRATION.md` — Integration guide
- `governance/vault/ledger.json` — Token registry
- `governance/laws/sovereign-vault.cpl-l` — Governance law
- `governance/pipelines/sovereign-vault-ops.cpl-p` — Operations pipeline
