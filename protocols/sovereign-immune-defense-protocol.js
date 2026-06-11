/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  SOVEREIGN IMMUNE DEFENSE PROTOCOL — ADAPTIVE THREAT DETECTION AND NEUTRALIZATION     ║
 * ║  "Immunitas Sovrana — Self-Defending Intelligence Against All Adversaries"            ║
 * ║                                                                                        ║
 * ║  "Corpus se defendit. Immunitas adaptatur. Hostis nullus intrat."                    ║
 * ║  (The body defends itself. Immunity adapts. No enemy enters.)                        ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// IMMUNE STATES
// ════════════════════════════════════════════════════════════════════════════════

const ImmuneState = {
  PATROL: 'PATROL',
  DETECTING: 'DETECTING',
  ALERTING: 'ALERTING',
  RESPONDING: 'RESPONDING',
  NEUTRALIZING: 'NEUTRALIZING',
  RECOVERING: 'RECOVERING',
  IMMUNIZED: 'IMMUNIZED',
};

const ThreatLevel = {
  BENIGN: 0,
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4,
  EXISTENTIAL: 5,
};

const DefenseType = {
  INNATE: 'INNATE',
  ADAPTIVE: 'ADAPTIVE',
  MEMORY: 'MEMORY',
  SWARM: 'SWARM',
  QUARANTINE: 'QUARANTINE',
};

// ════════════════════════════════════════════════════════════════════════════════
// ANTIBODY
// ════════════════════════════════════════════════════════════════════════════════

class Antibody {
  constructor(signature, defenseType = DefenseType.ADAPTIVE) {
    this.signature = signature;
    this.type = defenseType;
    this.strength = PHI_INVERSE;
    this.specificity = PHI_COMPLEMENT;
    this.activations = 0;
    this.createdAt = Date.now();
  }

  match(threatSignature) {
    const similarity = this._computeSimilarity(threatSignature);
    return similarity > this.specificity;
  }

  _computeSimilarity(threatSignature) {
    const a = this.signature;
    const b = threatSignature;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    return matches / maxLen;
  }

  activate() {
    this.activations++;
    this.strength *= PHI;
    if (this.strength > PHI * PHI) this.strength = PHI * PHI;
    return this.strength;
  }

  neutralize(threat) {
    const effectiveness = this.strength * (this.match(threat.signature) ? PHI : PHI_COMPLEMENT);
    threat.vitality -= effectiveness;
    return { neutralized: threat.vitality <= 0, effectiveness };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// SOVEREIGN IMMUNE ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class SovereignImmuneEngine {
  constructor(config = {}) {
    this.state = ImmuneState.PATROL;
    this.antibodies = [];
    this.threats = [];
    this.immuneMemory = new Map();
    this.alertThreshold = config.alertThreshold || ThreatLevel.MODERATE;
    this.responseHistory = [];
    this.healthScore = 1.0;
  }

  patrol(systemState) {
    this.state = ImmuneState.PATROL;
    const anomalies = this._detectAnomalies(systemState);
    if (anomalies.length > 0) {
      this.state = ImmuneState.DETECTING;
      return this._classifyThreats(anomalies);
    }
    return { threats: [], healthScore: this.healthScore };
  }

  _detectAnomalies(systemState) {
    const serialized = JSON.stringify(systemState);
    const anomalies = [];
    const patterns = this._extractPatterns(serialized);

    for (const pattern of patterns) {
      const normalScore = this._normalityScore(pattern);
      if (normalScore < PHI_INVERSE) {
        anomalies.push({ pattern, normalScore, timestamp: Date.now() });
      }
    }
    return anomalies;
  }

  _extractPatterns(data) {
    const patterns = [];
    const windowSize = 16;
    for (let i = 0; i < data.length - windowSize; i += windowSize) {
      patterns.push(data.slice(i, i + windowSize));
    }
    return patterns;
  }

  _normalityScore(pattern) {
    let hash = 0;
    for (let i = 0; i < pattern.length; i++) {
      hash = ((hash << 5) - hash + pattern.charCodeAt(i)) | 0;
    }
    return (Math.abs(hash) % 1000) / 1000;
  }

  _classifyThreats(anomalies) {
    const threats = anomalies.map(a => ({
      signature: a.pattern,
      level: a.normalScore < PHI_COMPLEMENT * 0.5 ? ThreatLevel.CRITICAL
           : a.normalScore < PHI_COMPLEMENT ? ThreatLevel.HIGH
           : ThreatLevel.MODERATE,
      vitality: 1.0,
      detectedAt: a.timestamp,
    }));

    this.threats.push(...threats);
    const maxLevel = Math.max(...threats.map(t => t.level));

    if (maxLevel >= this.alertThreshold) {
      this.state = ImmuneState.ALERTING;
    }

    return { threats, maxLevel, healthScore: this.healthScore };
  }

  respond() {
    if (this.threats.length === 0) return { neutralized: 0, remaining: 0 };

    this.state = ImmuneState.RESPONDING;
    let neutralized = 0;

    for (const threat of this.threats) {
      if (threat.vitality <= 0) continue;

      let antibody = this._findMatchingAntibody(threat);
      if (!antibody) {
        antibody = this._generateAntibody(threat);
      }

      this.state = ImmuneState.NEUTRALIZING;
      antibody.activate();
      const result = antibody.neutralize(threat);

      if (result.neutralized) {
        neutralized++;
        this._memorize(threat, antibody);
      }
    }

    this.threats = this.threats.filter(t => t.vitality > 0);
    this.healthScore = 1 - (this.threats.length * PHI_COMPLEMENT * 0.1);
    this.state = this.threats.length === 0 ? ImmuneState.RECOVERING : ImmuneState.RESPONDING;

    this.responseHistory.push({ neutralized, remaining: this.threats.length, timestamp: Date.now() });
    return { neutralized, remaining: this.threats.length };
  }

  _findMatchingAntibody(threat) {
    return this.antibodies.find(ab => ab.match(threat.signature));
  }

  _generateAntibody(threat) {
    const memoryMatch = this.immuneMemory.get(threat.signature);
    const type = memoryMatch ? DefenseType.MEMORY : DefenseType.ADAPTIVE;
    const antibody = new Antibody(threat.signature, type);
    if (memoryMatch) antibody.strength *= PHI;
    this.antibodies.push(antibody);
    return antibody;
  }

  _memorize(threat, antibody) {
    this.immuneMemory.set(threat.signature, {
      antibody: antibody.signature,
      strength: antibody.strength,
      memorizedAt: Date.now(),
    });
  }

  getImmuneReport() {
    return {
      state: this.state,
      healthScore: this.healthScore,
      antibodies: this.antibodies.length,
      activeThreats: this.threats.length,
      immuneMemory: this.immuneMemory.size,
      responsesTotal: this.responseHistory.length,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  SovereignImmuneEngine,
  Antibody,
  ImmuneState,
  ThreatLevel,
  DefenseType,
};

export default {
  PROTOCOL_ID: 'PROTO-SID-001',
  PROTOCOL_NAME: 'Sovereign Immune Defense Protocol',
  DOCTRINE: 'Corpus se defendit. Immunitas adaptatur. Hostis nullus intrat.',
  DOCTRINE_EN: 'The body defends itself. Immunity adapts. No enemy enters.',

  ImmuneState,
  ThreatLevel,
  DefenseType,
  Antibody,
  SovereignImmuneEngine,
};
