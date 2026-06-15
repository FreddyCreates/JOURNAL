# Vault Integration Guide

How to integrate the Sovereign Vault with any system in the platform.

## Quick Start

### For NPM/Node.js Projects

```javascript
import { VaultClient } from '../../../governance/vault/client.js';

const vault = new VaultClient();

// Get a token
const zenodoToken = vault.get('MEDINASITECH', {
  caller: 'my-service',
  operation: 'zenodo_deposit'
});

console.log(zenodoToken.token);        // Actual token value
console.log(zenodoToken.scopes);       // ['deposit:write']
console.log(zenodoToken.restrictions); // ['no_publish']
```

### For GitHub Actions Workflows

```yaml
name: My Workflow
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      # Call vault-bridge workflow to resolve a token
      - uses: ./.github/workflows/vault-bridge.yml
        with:
          token_id: MEDINASITECH
          operation: zenodo_deposit
```

## Token Classes

### `integration`
External service tokens: Zenodo, NPM, GitHub, Stripe, HubSpot, Salesforce, etc.

```javascript
const intTokens = vault.getClass('integration');
// {
//   class: 'integration',
//   description: '...',
//   tokens: [
//     { token_id: 'MEDINASITECH', alias: '...', status: 'active' },
//     { token_id: 'NPM_PUBLISH_TOKEN', alias: '...', status: 'active' },
//     ...
//   ]
// }
```

### `cognition`
Cognitive agent tokens: memory, reasoning, attention budget tracking.

```javascript
const cogTokens = vault.getClass('cognition');
```

### `memory`
Memory persistence tokens: vault reads, ledger writes, checkpoints.

```javascript
const memTokens = vault.getClass('memory');
```

### `system`
Platform-level tokens: governance enforcement, organism fleet coordination.

```javascript
const sysTokens = vault.getClass('system');
```

### `enterprise`
Enterprise connector tokens: Salesforce, SAP, HubSpot, Stripe, Google, etc.

```javascript
const entTokens = vault.getClass('enterprise');
```

## Registering a New Token

### 1. Add to Ledger

Edit `governance/vault/ledger.json`:

```json
{
  "token_id": "MY_SERVICE_API_KEY",
  "alias": "My Service API Key",
  "provider": "my-service",
  "scopes": ["read:data", "write:data"],
  "capabilities": ["read_objects", "write_objects"],
  "restrictions": ["rate_limit:100/hr"],
  "secret_ref": "secrets.MY_SERVICE_API_KEY",
  "status": "active",
  "access_policy": "agent_write",
  "notes": "Token for accessing My Service API"
}
```

### 2. Add GitHub Secret

Go to **Settings → Secrets and variables → Actions** and create a new secret named `MY_SERVICE_API_KEY`.

### 3. Update Token Class

Add the token ID to the appropriate class in `ledger.json`:

```json
"enterprise": {
  "description": "...",
  "tokens": ["...", "MY_SERVICE_API_KEY"]
}
```

### 4. Use It

```javascript
const client = new VaultClient();
const apiKey = client.get('MY_SERVICE_API_KEY', {
  caller: 'my-service-connector',
  operation: 'read_data'
});
```

## Access Policies

| Policy | Human Required | Audit | Rate Limit |
|--------|---|---|---|
| `agent_write` | No | Yes | 60/hr |
| `agent_read` | No | No | 1000/hr |
| `human_gate` | Yes | Yes | 10/hr |
| `sovereign_only` | Yes | Yes | 5/hr |

## Audit Trail

All token resolutions are automatically logged:

```javascript
const logs = vault.getAuditLog('MEDINASITECH');
// [
//   {
//     token_id: 'MEDINASITECH',
//     caller: 'zenodo-deposit-agent',
//     operation: 'create_deposit',
//     timestamp: 1686234567000,
//     phi_hash: 'a1b2c3d4'
//   },
//   ...
// ]
```

## Enterprise Connector Pattern

### BaseConnector Integration

```javascript
import { VaultClient } from '../../../governance/vault/client.js';

export class SalesforceConnector extends BaseConnector {
  constructor(config = {}) {
    super(config);
    this.vault = new VaultClient();
  }

  async connect() {
    // Get token from vault instead of config
    const credential = this.vault.get('SALESFORCE_API_KEY', {
      caller: 'salesforce-connector',
      operation: 'authenticate'
    });

    this.config.apiKey = credential.token;
    this.connected = true;
  }

  async authenticate() {
    // Implementation with vault-managed token
    const token = this.vault.get('SALESFORCE_API_KEY', {
      caller: 'salesforce-connector',
      operation: 'authenticate'
    });
    return this._authenticate(token.token);
  }
}
```

## Health Check

Check vault status:

```javascript
const vaultLedger = vault.listAll();
console.log(`Available tokens: ${vaultLedger.length}`);
console.log(`Active tokens: ${vaultLedger.filter(t => t.status === 'active').length}`);
```

## Troubleshooting

### "Token not found in ledger"
Check that the token ID exists in `governance/vault/ledger.json` under the correct token class.

### "Secret not found in environment"
Ensure the GitHub Secret is created with the name specified in `secret_ref` (e.g., if `secret_ref: "secrets.MY_TOKEN"`, create a GitHub Secret named `MY_TOKEN`).

### "Rate limit exceeded"
Token has hit its hourly operation limit for the current access policy. Wait for the cooldown period.

### "Access policy violation"
If the error says "requires human approval", the token has a `human_gate` or `sovereign_only` policy and needs explicit approval to use.

---

For more details, see `governance/vault/README.md` and `governance/laws/sovereign-vault.cpl-l`.
