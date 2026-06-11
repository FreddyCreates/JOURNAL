/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  ENTROPIC DECAY RESISTANCE PROTOCOL — ANTI-ENTROPY PERSISTENCE ENGINE                 ║
 * ║  "Resistentia Entropica — Defying Disorder Through Sovereign Order"                   ║
 * ║                                                                                        ║
 * ║  "Ordo vincit chaos. Structura perseverat. Entropia cedit."                           ║
 * ║  (Order conquers chaos. Structure persists. Entropy yields.)                          ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// ENTROPY STATES
// ════════════════════════════════════════════════════════════════════════════════

const EntropyState = {
  ORDERED: 'ORDERED',
  STABLE: 'STABLE',
  DEGRADING: 'DEGRADING',
  CRITICAL: 'CRITICAL',
  RESISTING: 'RESISTING',
  RESTORING: 'RESTORING',
  HEAT_DEATH: 'HEAT_DEATH',
};

const ResistanceStrategy = {
  REDUNDANCY: 'REDUNDANCY',
  CRYSTALLIZATION: 'CRYSTALLIZATION',
  NEGENTROPY_INJECTION: 'NEGENTROPY_INJECTION',
  PATTERN_REINFORCEMENT: 'PATTERN_REINFORCEMENT',
  TEMPORAL_ANCHORING: 'TEMPORAL_ANCHORING',
};

// ════════════════════════════════════════════════════════════════════════════════
// ENTROPY METER
// ════════════════════════════════════════════════════════════════════════════════

class EntropyMeter {
  constructor() {
    this.measurements = [];
    this.currentEntropy = 0;
    this.maxEntropy = Math.log2(256) * PHI;
  }

  measure(data) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    const entropy = this._shannonEntropy(serialized);
    const normalized = entropy / this.maxEntropy;
    this.measurements.push({ entropy: normalized, timestamp: Date.now() });
    this.currentEntropy = normalized;
    return normalized;
  }

  _shannonEntropy(str) {
    const freq = {};
    for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
    const len = str.length;
    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  getEntropyTrend(window = 10) {
    const recent = this.measurements.slice(-window);
    if (recent.length < 2) return 0;
    const first = recent[0].entropy;
    const last = recent[recent.length - 1].entropy;
    return last - first;
  }

  getState() {
    if (this.currentEntropy < PHI_COMPLEMENT * 0.5) return EntropyState.ORDERED;
    if (this.currentEntropy < PHI_COMPLEMENT) return EntropyState.STABLE;
    if (this.currentEntropy < PHI_INVERSE) return EntropyState.DEGRADING;
    if (this.currentEntropy < PHI_INVERSE * 1.5) return EntropyState.CRITICAL;
    return EntropyState.HEAT_DEATH;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DECAY RESISTANCE ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class DecayResistanceEngine {
  constructor(config = {}) {
    this.meter = new EntropyMeter();
    this.strategy = config.strategy || ResistanceStrategy.PATTERN_REINFORCEMENT;
    this.redundancyFactor = config.redundancyFactor || 3;
    this.resistanceThreshold = config.resistanceThreshold || PHI_COMPLEMENT;
    this.patterns = new Map();
    this.anchors = [];
    this.repairLog = [];
    this.state = EntropyState.ORDERED;
  }

  registerPattern(patternId, data) {
    const checksum = this._checksum(data);
    this.patterns.set(patternId, {
      data,
      checksum,
      copies: Array(this.redundancyFactor).fill(null).map(() => JSON.parse(JSON.stringify(data))),
      registeredAt: Date.now(),
      repairCount: 0,
    });
    return { patternId, checksum };
  }

  _checksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash.toString(16);
  }

  monitor() {
    const results = [];
    for (const [patternId, pattern] of this.patterns) {
      const currentChecksum = this._checksum(pattern.data);
      if (currentChecksum !== pattern.checksum) {
        results.push({ patternId, corrupted: true });
        this._repair(patternId);
      } else {
        results.push({ patternId, corrupted: false });
      }
    }

    const overallEntropy = this.meter.measure(JSON.stringify([...this.patterns.values()]));
    this.state = this.meter.getState();

    if (overallEntropy > this.resistanceThreshold) {
      this._activateResistance();
    }

    return { state: this.state, entropy: overallEntropy, patterns: results };
  }

  _repair(patternId) {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return false;

    const validCopy = pattern.copies.find(c => this._checksum(c) === pattern.checksum);
    if (validCopy) {
      pattern.data = JSON.parse(JSON.stringify(validCopy));
      pattern.repairCount++;
      this.repairLog.push({
        patternId,
        strategy: ResistanceStrategy.REDUNDANCY,
        timestamp: Date.now(),
        success: true,
      });
      return true;
    }

    this.repairLog.push({
      patternId,
      strategy: this.strategy,
      timestamp: Date.now(),
      success: false,
    });
    return false;
  }

  _activateResistance() {
    this.state = EntropyState.RESISTING;
    switch (this.strategy) {
      case ResistanceStrategy.REDUNDANCY:
        this._increaseRedundancy();
        break;
      case ResistanceStrategy.CRYSTALLIZATION:
        this._crystallize();
        break;
      case ResistanceStrategy.NEGENTROPY_INJECTION:
        this._injectNegentropy();
        break;
      case ResistanceStrategy.PATTERN_REINFORCEMENT:
        this._reinforcePatterns();
        break;
      case ResistanceStrategy.TEMPORAL_ANCHORING:
        this._anchorTemporally();
        break;
    }
  }

  _increaseRedundancy() {
    for (const [, pattern] of this.patterns) {
      pattern.copies.push(JSON.parse(JSON.stringify(pattern.data)));
    }
  }

  _crystallize() {
    for (const [, pattern] of this.patterns) {
      pattern.checksum = this._checksum(pattern.data);
      pattern.copies = pattern.copies.map(() => JSON.parse(JSON.stringify(pattern.data)));
    }
  }

  _injectNegentropy() {
    for (const [patternId, pattern] of this.patterns) {
      pattern.checksum = this._checksum(pattern.data);
      this.repairLog.push({
        patternId,
        strategy: ResistanceStrategy.NEGENTROPY_INJECTION,
        timestamp: Date.now(),
        success: true,
      });
    }
  }

  _reinforcePatterns() {
    for (const [, pattern] of this.patterns) {
      const fresh = JSON.parse(JSON.stringify(pattern.data));
      pattern.copies.unshift(fresh);
      if (pattern.copies.length > this.redundancyFactor * 2) {
        pattern.copies.pop();
      }
    }
  }

  _anchorTemporally() {
    this.anchors.push({
      timestamp: Date.now(),
      snapshot: new Map([...this.patterns].map(([k, v]) => [k, JSON.parse(JSON.stringify(v.data))])),
    });
  }

  getResistanceReport() {
    return {
      state: this.state,
      entropy: this.meter.currentEntropy,
      trend: this.meter.getEntropyTrend(),
      patterns: this.patterns.size,
      repairs: this.repairLog.length,
      anchors: this.anchors.length,
      strategy: this.strategy,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  DecayResistanceEngine,
  EntropyMeter,
  EntropyState,
  ResistanceStrategy,
};

export default {
  PROTOCOL_ID: 'PROTO-EDR-001',
  PROTOCOL_NAME: 'Entropic Decay Resistance Protocol',
  DOCTRINE: 'Ordo vincit chaos. Structura perseverat. Entropia cedit.',
  DOCTRINE_EN: 'Order conquers chaos. Structure persists. Entropy yields.',

  EntropyState,
  ResistanceStrategy,
  EntropyMeter,
  DecayResistanceEngine,
};
