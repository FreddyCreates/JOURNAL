/**
 * VaultClient — unified credential access layer for all token types.
 * Simple, ergonomic interface for resolving tokens across the entire platform.
 * 
 * Usage:
 *   const client = new VaultClient();
 *   const zenodoToken = client.get('MEDINASITECH', { caller: 'zenodo-deposit-agent' });
 *   const npmToken = client.get('NPM_PUBLISH_TOKEN', { caller: 'ci-publish-workflow' });
 */

import { SovereignVaultBridge } from './bridge.js';

export class VaultClient {
  #bridge;
  #tokenCache; // Short-lived cache to avoid repeated bridge calls

  constructor(ledgerPath) {
    this.#bridge = new SovereignVaultBridge(ledgerPath);
    this.#tokenCache = new Map();
  }

  /**
   * Get a token by ID.
   * @param {string} tokenId — the token ID from the ledger
   * @param {Object} context — caller context
   * @returns {{ token: string, scopes: string[], restrictions: string[], capabilities: string[] }}
   */
  get(tokenId, context = {}) {
    return this.#bridge.resolve(tokenId, context);
  }

  /**
   * Get all tokens of a specific class.
   * @param {string} tokenClass — 'integration', 'cognition', 'memory', 'system', 'enterprise'
   * @returns {Object} token class info with metadata
   */
  getClass(tokenClass) {
    return this.#bridge.listByClass(tokenClass);
  }

  /**
   * List all available tokens (metadata only, no secrets).
   * @returns {Array<{token_id, alias, provider, scopes, status}>}
   */
  listAll() {
    const ledger = this.#bridge.getLedger();
    return ledger.tokens;
  }

  /**
   * Check if a token exists and is active.
   * @param {string} tokenId
   * @returns {boolean}
   */
  has(tokenId) {
    const ledger = this.#bridge.getLedger();
    return ledger.tokens.some(t => t.token_id === tokenId && t.status === 'active');
  }

  /**
   * Get metadata about a token without resolving the secret.
   * @param {string} tokenId
   * @returns {Object|null} token metadata or null if not found
   */
  getMetadata(tokenId) {
    const ledger = this.#bridge.getLedger();
    return ledger.tokens.find(t => t.token_id === tokenId) || null;
  }

  /**
   * Get the audit log for a token.
   * @param {string} [tokenId] — if provided, filter to this token only
   * @returns {Array}
   */
  getAuditLog(tokenId) {
    return this.#bridge.getAuditLog(tokenId);
  }
}

export default VaultClient;
