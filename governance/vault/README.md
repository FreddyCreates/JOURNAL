# Sovereign Vault

The Sovereign Vault is the credential ledger for the Medina Sovereign Intelligence architecture.

## Design Principles

1. **No secrets in code** — The vault ledger tracks *metadata only*. Actual token values live in GitHub Secrets and are injected at runtime.
2. **Access policies** — Each token has an access policy governing who/what can use it and under what conditions.
3. **Audit trail** — All token usage through the vault bridge is logged.
4. **Token classes** — Tokens are categorized (cognition, memory, integration) for governance enforcement.
5. **Governance-enforced** — Vault access is governed by `governance/laws/sovereign-vault.cpl-l`.

## Structure

```
governance/vault/
├── README.md           ← You are here
├── ledger.json         ← Token metadata registry (no secrets)
├── bridge.js           ← Runtime bridge — resolves secret_ref → env vars
└── audit-schema.json   ← Schema for vault audit events
```

## Token Lifecycle

```
[Register] → ledger.json entry created with metadata
[Activate] → GitHub Secret created with actual value
[Bridge]   → Workflow/runtime resolves secret_ref → injects value
[Use]      → Agent operates with token under access policy
[Audit]    → Operation logged per audit-schema
[Revoke]   → Status set to "revoked", secret deleted
```

## Adding a New Token

1. Add entry to `ledger.json` with appropriate metadata
2. Store actual secret value in GitHub Settings → Secrets
3. Reference via `secret_ref` field (e.g., `"secrets.MY_TOKEN"`)
4. Assign an `access_policy` from the available policies
5. Categorize under appropriate `token_class`

## Token Classes

| Class | Purpose |
|-------|---------|
| `cognition` | Cognitive agent operations — memory, reasoning, attention |
| `memory` | Vault persistence — reads, writes, checkpoints |
| `integration` | External services — Zenodo, ICP, IPFS |
