# Sovereign Vault

The Sovereign Vault is the **unified credential management system** for the Medina Sovereign Intelligence platform. It serves as a single source of truth for all token types across all systems.

## Design Principles

1. **No secrets in code** — The vault ledger tracks *metadata only*. Actual token values live in GitHub Secrets and are injected at runtime.
2. **Unified credential layer** — Single system for all token types: integration (external APIs), cognition (agent operations), memory (persistence), system (platform governance), and enterprise (connectors).
3. **Access policies** — Each token has an access policy (agent_write, agent_read, human_gate, sovereign_only) governing who/what can use it and under what conditions.
4. **Audit trail** — All token usage is automatically logged with phi-hashed event signatures for integrity.
5. **Governance-enforced** — Vault access is governed by law (`sovereign-vault.cpl-l`) and pipeline (`sovereign-vault-ops.cpl-p`).
6. **Extensible** — New token types and classes can be added without modifying core vault code.

## Structure

```
governance/vault/
├── README.md                        ← You are here
├── INTEGRATION.md                   ← How to use the vault
├── ledger.json                      ← Token metadata registry (no secrets)
├── bridge.js                        ← Runtime bridge — resolves secret_ref → env vars
├── client.js                        ← VaultClient — ergonomic API for all systems
├── audit-schema.json                ← Schema for vault audit events
└── examples/
    ├── zenodo-deposit.mjs           ← Zenodo integration example
    └── enterprise-connector.mjs      ← Enterprise connector pattern
```

## Token Lifecycle

```
[Register] → ledger.json entry created with metadata
[Activate] → GitHub Secret created with actual value
[Bridge]   → Workflow/runtime resolves secret_ref → injects value
[Use]      → Agent operates with token under access policy
[Audit]    → Operation logged per audit-schema.json
[Revoke]   → Status set to "revoked", secret deleted
```

## Token Classes

| Class | Purpose | Tokens |
|-------|---------|--------|
| `integration` | External service APIs — Zenodo, NPM, GitHub, Stripe, etc. | 4 active |
| `cognition` | Cognitive agent operations — memory, reasoning, attention | Future |
| `memory` | Vault persistence — reads, writes, checkpoints | Future |
| `system` | Platform governance — organism coordination, enforcement | Future |
| `enterprise` | Enterprise connectors — Salesforce, SAP, HubSpot, etc. | Future |

## Quick Start

### Using VaultClient (JavaScript/Node.js)

```javascript
import { VaultClient } from './client.js';

const vault = new VaultClient();

// Get a token
const token = vault.get('MEDINASITECH', {
  caller: 'my-service',
  operation: 'create_deposit'
});

console.log(token.token);        // Actual token value
console.log(token.scopes);       // ['deposit:write']
console.log(token.restrictions); // ['no_publish']
```

### Using GitHub Actions

```yaml
- uses: ./.github/workflows/vault-bridge.yml
  with:
    token_id: MEDINASITECH
    operation: zenodo_deposit
```

## Adding a New Token

1. Add entry to `ledger.json` with metadata
2. Store actual secret in GitHub Settings → Secrets
3. Reference via `secret_ref` field
4. Assign an `access_policy`
5. Categorize under appropriate `token_class`

For detailed instructions, see `INTEGRATION.md`.
