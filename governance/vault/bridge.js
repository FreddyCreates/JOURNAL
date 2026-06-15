import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PHI = 1.618033988749895;

/**
 * SovereignVaultBridge — runtime bridge that resolves token references
 * from the ledger against environment variables (injected by GitHub Actions
 * from repository secrets). Enforces access policies and produces audit events.
 */
export class SovereignVaultBridge {
  #ledger;
  #auditLog;

  constructor(ledgerPath) {
    const resolvedPath = ledgerPath || resolve(__dirname, 'ledger.json');
    this.#ledger = JSON.parse(readFileSync(resolvedPath, 'utf-8'));
    this.#auditLog = [];
  }

  /**
   * Returns the vault ledger metadata (no secrets).
   */
  getLedger() {
    return {
      vault_id: this.#ledger.vault_id,
      version: this.#ledger.version,
      token_count: this.#ledger.tokens.length,
      tokens: this.#ledger.tokens.map(t => ({
        token_id: t.token_id,
        alias: t.alias,
        provider: t.provider,
        scopes: t.scopes,
        status: t.status,
        access_policy: t.access_policy,
      })),
    };
  }

  /**
   * Resolves a token value at runtime from environment variables.
   * Enforces access policy before returning.
   *
   * @param {string} tokenId — the token_id from the ledger
   * @param {Object} context — caller context for policy evaluation
   * @param {string} context.caller — agent or user identifier
   * @param {string} context.operation — what the token will be used for
   * @returns {{ token: string, scopes: string[], restrictions: string[] }}
   */
  resolve(tokenId, context = {}) {
    const entry = this.#ledger.tokens.find(t => t.token_id === tokenId);
    if (!entry) {
      throw new Error(`[VAULT] Token "${tokenId}" not found in ledger`);
    }

    if (entry.status !== 'active') {
      throw new Error(`[VAULT] Token "${tokenId}" is ${entry.status} — cannot resolve`);
    }

    // Enforce access policy
    const policy = this.#ledger.access_policies[entry.access_policy];
    if (!policy) {
      throw new Error(`[VAULT] Unknown access policy "${entry.access_policy}"`);
    }

    if (policy.requires_human && !context.human_approved) {
      throw new Error(`[VAULT] Token "${tokenId}" requires human approval (policy: ${entry.access_policy})`);
    }

    // Rate limiting check
    const recentOps = this.#auditLog.filter(
      a => a.token_id === tokenId && (Date.now() - a.timestamp) < 3600000
    ).length;
    if (recentOps >= policy.max_operations_per_hour) {
      throw new Error(`[VAULT] Rate limit exceeded for "${tokenId}" (${policy.max_operations_per_hour}/hr)`);
    }

    // Resolve from environment
    const envKey = this._secretRefToEnv(entry.secret_ref);
    const value = process.env[envKey];
    if (!value) {
      throw new Error(`[VAULT] Secret "${envKey}" not found in environment. Ensure GitHub Secret is configured.`);
    }

    // Audit
    const auditEvent = {
      token_id: tokenId,
      caller: context.caller || 'unknown',
      operation: context.operation || 'resolve',
      timestamp: Date.now(),
      phi_hash: this._phiHash(`${tokenId}:${Date.now()}`),
    };
    this.#auditLog.push(auditEvent);

    return {
      token: value,
      scopes: entry.scopes,
      restrictions: entry.restrictions,
      capabilities: entry.capabilities,
    };
  }

  /**
   * Returns the audit log for a given token (or all tokens).
   */
  getAuditLog(tokenId) {
    if (tokenId) {
      return this.#auditLog.filter(a => a.token_id === tokenId);
    }
    return [...this.#auditLog];
  }

  /**
   * Lists available tokens by class.
   */
  listByClass(tokenClass) {
    const classEntry = this.#ledger.token_classes[tokenClass];
    if (!classEntry) {
      throw new Error(`[VAULT] Unknown token class "${tokenClass}"`);
    }
    return {
      class: tokenClass,
      description: classEntry.description,
      tokens: classEntry.tokens.map(id => {
        const entry = this.#ledger.tokens.find(t => t.token_id === id);
        return entry ? { token_id: id, alias: entry.alias, status: entry.status } : { token_id: id, status: 'unregistered' };
      }),
    };
  }

  /**
   * Converts a secret_ref like "secrets.MEDINASITECH" to env var "MEDINASITECH".
   * @private
   */
  _secretRefToEnv(secretRef) {
    return secretRef.replace(/^secrets\./, '');
  }

  /**
   * Phi-weighted hash for audit trail identifiers.
   * @private
   */
  _phiHash(input) {
    let h = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      h = ((h ^ c) * 0x01000193) >>> 0;
      h = (h + Math.floor(c * PHI * (i + 1))) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }
}

export default SovereignVaultBridge;
