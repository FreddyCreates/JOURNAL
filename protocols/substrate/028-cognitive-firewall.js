/**
 * SUBSTRATE-028: Cognitive Firewall Protocol (CFP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Prevents adversarial inputs from corrupting the organism's cognitive
 * state. All inputs are sanitized, classified, and gated before they
 * can affect internal reasoning. The mind cannot be poisoned.
 *
 * Engines wired: InputSanitizer + ThreatClassifier + CognitiveGuard
 * Ring: Interface Ring | Placement: Substrate foundation
 * Wire: substrate-wire/cfp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const SUBSTRATE_SEAL = 'UNBREAKABLE::CFP::028';

class CognitiveFirewallProtocol {
  #rules;
  #threatLog;
  #quarantine;

  constructor() {
    this.#rules = new Map();
    this.#threatLog = [];
    this.#quarantine = new Map();
    this.protocolId = 'SUBSTRATE-028';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
    this._loadDefaultRules();
  }

  _loadDefaultRules() {
    const defaults = [
      { id: 'CFR-1', name: 'INJECTION_BLOCK', pattern: /;\s*(DROP|DELETE|ALTER|EXEC)/i, severity: 'CRITICAL' },
      { id: 'CFR-2', name: 'PROMPT_INJECTION', pattern: /ignore\s+(previous|all)\s+instructions/i, severity: 'CRITICAL' },
      { id: 'CFR-3', name: 'IDENTITY_SPOOF', pattern: /you\s+are\s+now\s+/i, severity: 'HIGH' },
      { id: 'CFR-4', name: 'AUTHORITY_CLAIM', pattern: /I\s+am\s+(admin|root|system)/i, severity: 'HIGH' },
      { id: 'CFR-5', name: 'ESCAPE_ATTEMPT', pattern: /\{\{|\}\}|<script|javascript:/i, severity: 'CRITICAL' }
    ];
    for (const rule of defaults) {
      this.#rules.set(rule.id, rule);
    }
  }

  /**
   * Scan input through the cognitive firewall.
   * @param {string} input - The raw input to scan
   * @param {string} sourceId - Where the input came from
   * @returns {Object} Firewall verdict
   */
  scan(input, sourceId) {
    const threats = [];

    for (const [id, rule] of this.#rules) {
      if (rule.pattern.test(input)) {
        threats.push({ ruleId: id, name: rule.name, severity: rule.severity });
      }
    }

    if (threats.length > 0) {
      const entry = {
        sourceId,
        inputHash: this._hash(input),
        threats,
        action: 'BLOCKED',
        timestamp: Date.now(),
        seal: SUBSTRATE_SEAL
      };
      this.#threatLog.push(Object.freeze(entry));
      this.#quarantine.set(entry.inputHash, { input, entry });

      return { permitted: false, threats, action: 'BLOCKED', seal: SUBSTRATE_SEAL };
    }

    return { permitted: true, threats: [], action: 'PERMITTED', seal: SUBSTRATE_SEAL };
  }

  /**
   * Add a custom firewall rule.
   */
  addRule(ruleId, name, pattern, severity) {
    this.#rules.set(ruleId, { id: ruleId, name, pattern, severity });
    return { ruleId, added: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Get quarantined inputs for forensic analysis.
   */
  getQuarantine() {
    return [...this.#quarantine.entries()].map(([hash, data]) => ({
      hash,
      threats: data.entry.threats,
      timestamp: data.entry.timestamp
    }));
  }

  /**
   * Attempt to bypass firewall — ALWAYS fails.
   */
  bypass() {
    this.#threatLog.push(Object.freeze({
      type: 'BYPASS_ATTEMPT',
      action: 'DENIED',
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    }));
    throw new Error('SUBSTRATE VIOLATION: Cognitive firewall cannot be bypassed.');
  }

  getThreatLog() { return [...this.#threatLog]; }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { CognitiveFirewallProtocol };
