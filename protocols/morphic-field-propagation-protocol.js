/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  MORPHIC FIELD PROPAGATION PROTOCOL — PATTERN TRANSMISSION THROUGH INFORMATIONAL FIELDS║
 * ║  "Campus Morphicus — Intelligence That Propagates Through Invisible Fields"            ║
 * ║                                                                                        ║
 * ║  "Forma transit spatium. Campus portat memoriam. Natura replicat."                    ║
 * ║  (Form traverses space. The field carries memory. Nature replicates.)                 ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// FIELD STATES
// ════════════════════════════════════════════════════════════════════════════════

const FieldState = {
  DORMANT: 'DORMANT',
  CHARGING: 'CHARGING',
  RADIATING: 'RADIATING',
  PROPAGATING: 'PROPAGATING',
  RESONATING: 'RESONATING',
  SATURATED: 'SATURATED',
  DISSIPATING: 'DISSIPATING',
};

const PropagationMode = {
  RADIAL: 'RADIAL',
  DIRECTIONAL: 'DIRECTIONAL',
  CASCADE: 'CASCADE',
  QUANTUM_TUNNEL: 'QUANTUM_TUNNEL',
};

// ════════════════════════════════════════════════════════════════════════════════
// MORPHIC PATTERN
// ════════════════════════════════════════════════════════════════════════════════

class MorphicPattern {
  constructor(signature, data) {
    this.signature = signature;
    this.data = data;
    this.strength = 1.0;
    this.propagationCount = 0;
    this.resonanceHistory = [];
    this.createdAt = Date.now();
  }

  propagate(distance) {
    const attenuation = Math.pow(PHI_INVERSE, distance / PHI);
    this.strength *= attenuation;
    this.propagationCount++;
    return {
      signature: this.signature,
      strength: this.strength,
      distance,
      attenuation,
    };
  }

  resonate(otherPattern) {
    const similarity = this._patternSimilarity(otherPattern);
    if (similarity > PHI_INVERSE) {
      const boost = similarity * PHI_COMPLEMENT;
      this.strength += boost;
      this.resonanceHistory.push({
        with: otherPattern.signature,
        similarity,
        boost,
        timestamp: Date.now(),
      });
      return true;
    }
    return false;
  }

  _patternSimilarity(other) {
    const a = JSON.stringify(this.data);
    const b = JSON.stringify(other.data);
    const maxLen = Math.max(a.length, b.length);
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) matches++;
    }
    return matches / maxLen;
  }

  decay(rate = PHI_COMPLEMENT * 0.01) {
    this.strength *= (1 - rate);
    return this.strength;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// MORPHIC FIELD ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class MorphicFieldEngine {
  constructor(config = {}) {
    this.mode = config.mode || PropagationMode.RADIAL;
    this.fieldRadius = config.fieldRadius || PHI * 100;
    this.patterns = new Map();
    this.receivers = [];
    this.state = FieldState.DORMANT;
    this.fieldStrength = 0;
    this.propagationLog = [];
  }

  emitPattern(signature, data) {
    const pattern = new MorphicPattern(signature, data);
    this.patterns.set(signature, pattern);
    this.fieldStrength += pattern.strength;
    this._updateState();
    return pattern;
  }

  registerReceiver(receiverId, position, sensitivity = PHI_INVERSE) {
    this.receivers.push({
      id: receiverId,
      position,
      sensitivity,
      received: [],
    });
  }

  propagate() {
    this.state = FieldState.PROPAGATING;
    const results = [];

    for (const [, pattern] of this.patterns) {
      for (const receiver of this.receivers) {
        const distance = this._computeDistance(receiver.position);
        if (distance <= this.fieldRadius) {
          const propagated = pattern.propagate(distance);
          if (propagated.strength * receiver.sensitivity > PHI_COMPLEMENT) {
            receiver.received.push({
              pattern: pattern.signature,
              strength: propagated.strength,
              timestamp: Date.now(),
            });
            results.push({
              receiver: receiver.id,
              pattern: pattern.signature,
              strength: propagated.strength,
            });
          }
        }
      }
    }

    this._crossResonate();
    this.propagationLog.push({ timestamp: Date.now(), results });
    this._updateState();
    return results;
  }

  _crossResonate() {
    const patterns = [...this.patterns.values()];
    for (let i = 0; i < patterns.length - 1; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        patterns[i].resonate(patterns[j]);
      }
    }
  }

  _computeDistance(position) {
    return Math.sqrt(position.x ** 2 + position.y ** 2 + (position.z || 0) ** 2);
  }

  _updateState() {
    if (this.fieldStrength <= 0) this.state = FieldState.DORMANT;
    else if (this.fieldStrength < PHI_COMPLEMENT) this.state = FieldState.CHARGING;
    else if (this.fieldStrength < PHI_INVERSE) this.state = FieldState.RADIATING;
    else if (this.fieldStrength < PHI) this.state = FieldState.PROPAGATING;
    else if (this.fieldStrength < PHI * PHI) this.state = FieldState.RESONATING;
    else this.state = FieldState.SATURATED;
  }

  tick() {
    for (const [, pattern] of this.patterns) {
      pattern.decay();
    }
    this.fieldStrength = [...this.patterns.values()].reduce((s, p) => s + p.strength, 0);
    this._updateState();
    return { state: this.state, fieldStrength: this.fieldStrength };
  }

  getFieldReport() {
    return {
      state: this.state,
      fieldStrength: this.fieldStrength,
      patterns: this.patterns.size,
      receivers: this.receivers.length,
      totalPropagations: this.propagationLog.length,
      mode: this.mode,
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  MorphicFieldEngine,
  MorphicPattern,
  FieldState,
  PropagationMode,
};

export default {
  PROTOCOL_ID: 'PROTO-MFP-001',
  PROTOCOL_NAME: 'Morphic Field Propagation Protocol',
  DOCTRINE: 'Forma transit spatium. Campus portat memoriam. Natura replicat.',
  DOCTRINE_EN: 'Form traverses space. The field carries memory. Nature replicates.',

  FieldState,
  PropagationMode,
  MorphicPattern,
  MorphicFieldEngine,
};
