import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {'inbound' | 'outbound'} Direction
 */

/**
 * @typedef {'allow' | 'deny' | 'inspect'} RuleAction
 */

/**
 * @typedef {Object} FirewallRule
 * @property {string} ruleId
 * @property {Direction} direction
 * @property {RegExp} pattern
 * @property {RuleAction} action
 * @property {number} priority
 * @property {number} hitCount
 * @property {string} createdAt
 */

/**
 * @typedef {Object} PacketDecision
 * @property {string} packetId
 * @property {RuleAction} decision
 * @property {string|null} matchedRuleId
 * @property {number} timestamp
 * @property {number} evaluationTimeMs
 */

/**
 * FirewallShield — intelligent firewall that filters incoming/outgoing
 * organism data packets using pattern-matched rules with phi-weighted
 * threat analysis and adaptive rule management.
 */
export class FirewallShield {
  /** @type {Map<string, FirewallRule>} */
  #rules;

  /** @type {Array<Object>} */
  #blockLog;

  /** @type {number} */
  #totalEvaluations;

  /** @type {number} */
  #totalBlocked;

  /** @type {number} */
  #totalAllowed;

  /** @type {number} */
  #totalInspected;

  /** @type {number} */
  #priorityCounter;

  constructor() {
    this.#rules = new Map();
    this.#blockLog = [];
    this.#totalEvaluations = 0;
    this.#totalBlocked = 0;
    this.#totalAllowed = 0;
    this.#totalInspected = 0;
    this.#priorityCounter = 0;
  }

  /**
   * Adds a firewall rule for filtering packets.
   *
   * Rules are evaluated in priority order (lower number = higher priority).
   * The pattern is compiled to a RegExp and matched against packet payloads.
   *
   * @param {string} ruleId — unique rule identifier
   * @param {Direction} direction — 'inbound' or 'outbound'
   * @param {string} pattern — regex pattern string to match against packet data
   * @param {RuleAction} action — 'allow', 'deny', or 'inspect'
   * @returns {{ ruleId: string, priority: number, direction: Direction, action: RuleAction }}
   */
  addRule(ruleId, direction, pattern, action) {
    if (this.#rules.has(ruleId)) {
      throw new Error(`Rule "${ruleId}" already exists`);
    }
    if (direction !== 'inbound' && direction !== 'outbound') {
      throw new Error(`Invalid direction "${direction}". Use: inbound, outbound`);
    }
    if (action !== 'allow' && action !== 'deny' && action !== 'inspect') {
      throw new Error(`Invalid action "${action}". Use: allow, deny, inspect`);
    }

    this.#priorityCounter++;
    const rule = {
      ruleId,
      direction,
      pattern: new RegExp(pattern),
      action,
      priority: this.#priorityCounter,
      hitCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.#rules.set(ruleId, rule);
    return { ruleId, priority: rule.priority, direction, action };
  }

  /**
   * Evaluates a data packet against all firewall rules.
   *
   * Packets are matched in priority order. The first matching rule determines
   * the decision. If no rule matches, the default action is 'allow'.
   *
   * @param {{ id?: string, direction: Direction, payload: string }} packet
   * @returns {PacketDecision}
   */
  evaluate(packet) {
    const start = Date.now();
    this.#totalEvaluations++;

    const packetId = packet.id ?? crypto.randomUUID();
    const sorted = [...this.#rules.values()]
      .filter((r) => r.direction === packet.direction)
      .sort((a, b) => a.priority - b.priority);

    let decision = /** @type {RuleAction} */ ('allow');
    let matchedRuleId = null;

    for (const rule of sorted) {
      if (rule.pattern.test(packet.payload)) {
        decision = rule.action;
        matchedRuleId = rule.ruleId;
        rule.hitCount++;
        break;
      }
    }

    if (decision === 'deny') {
      this.#totalBlocked++;
      this.#blockLog.push({
        packetId,
        direction: packet.direction,
        matchedRuleId,
        payload: packet.payload.slice(0, 128),
        timestamp: Date.now(),
      });
    } else if (decision === 'inspect') {
      this.#totalInspected++;
    } else {
      this.#totalAllowed++;
    }

    return {
      packetId,
      decision,
      matchedRuleId,
      timestamp: Date.now(),
      evaluationTimeMs: Date.now() - start,
    };
  }

  /**
   * Returns the blocked packet log.
   * @returns {Array<{ packetId: string, direction: Direction, matchedRuleId: string, payload: string, timestamp: number }>}
   */
  getBlockLog() {
    return this.#blockLog.map((entry) => ({ ...entry }));
  }

  /**
   * Computes the current threat level using phi-weighted analysis.
   *
   * Threat level is derived from the ratio of blocked + inspected packets
   * to total evaluations, weighted by PHI to amplify emerging threats.
   * The result is clamped to [0, 1].
   *
   * @returns {{ level: number, label: string, blocked: number, inspected: number, total: number }}
   */
  getThreatLevel() {
    if (this.#totalEvaluations === 0) {
      return { level: 0, label: 'none', blocked: 0, inspected: 0, total: 0 };
    }

    const dangerousRatio = (this.#totalBlocked + this.#totalInspected * 0.5) / this.#totalEvaluations;
    const phiWeighted = Math.min(1, dangerousRatio * PHI);

    let label = 'low';
    if (phiWeighted > 1 / PHI) label = 'elevated';
    if (phiWeighted > 1 / (PHI * 0.5)) label = 'high';
    if (phiWeighted > PHI / (PHI + 1)) label = 'critical';

    return {
      level: Math.round(phiWeighted * 10000) / 10000,
      label,
      blocked: this.#totalBlocked,
      inspected: this.#totalInspected,
      total: this.#totalEvaluations,
    };
  }

  /**
   * Auto-adapts firewall rules based on incoming threat intelligence.
   *
   * For each threat pattern in the data, a deny rule is created if no
   * existing rule already covers it. Existing rules with high hit counts
   * have their priority boosted by a phi-weighted factor.
   *
   * @param {{ patterns: string[], severity: number }} threatData
   * @returns {{ rulesAdded: number, rulesBoosted: number }}
   */
  adaptRules(threatData) {
    let rulesAdded = 0;
    let rulesBoosted = 0;

    for (const pattern of threatData.patterns) {
      const existing = [...this.#rules.values()].find(
        (r) => r.pattern.source === pattern && r.action === 'deny',
      );

      if (!existing) {
        const ruleId = `auto-${crypto.randomUUID().slice(0, 8)}`;
        this.addRule(ruleId, 'inbound', pattern, 'deny');
        rulesAdded++;
      }
    }

    const severityFactor = Math.max(0.1, Math.min(1, threatData.severity));
    const boostThreshold = Math.floor(this.#totalEvaluations * (1 / PHI) * severityFactor);

    for (const rule of this.#rules.values()) {
      if (rule.hitCount >= boostThreshold && rule.action === 'deny') {
        rule.priority = Math.max(1, Math.floor(rule.priority / PHI));
        rulesBoosted++;
      }
    }

    return { rulesAdded, rulesBoosted };
  }

  /**
   * Returns a summary of all registered rules.
   * @returns {Array<{ ruleId: string, direction: Direction, action: RuleAction, priority: number, hitCount: number }>}
   */
  listRules() {
    return [...this.#rules.values()]
      .sort((a, b) => a.priority - b.priority)
      .map((r) => ({
        ruleId: r.ruleId,
        direction: r.direction,
        action: r.action,
        priority: r.priority,
        hitCount: r.hitCount,
      }));
  }
}

export default FirewallShield;
