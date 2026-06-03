import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class PhaseAligner {
  constructor(config = {}) {
    this.alignmentPrecision = config.alignmentPrecision ?? 0.001;
    this.maxPhaseShift = config.maxPhaseShift ?? (Math.PI * 2);
    this.phiLocking = config.phiLocking ?? true;
    this._signals = new Map();
    this._locks = new Map();
  }

  measure(signalA, signalB) {
    const phaseA = signalA.phase ?? 0;
    const phaseB = signalB.phase ?? 0;
    const phaseDiff = Math.abs(phaseA - phaseB) % (Math.PI * 2);
    const isAligned = phaseDiff < this.alignmentPrecision;
    const phiRatio = phaseDiff / (Math.PI * 2) * PHI;
    const quality = 1 - phaseDiff / Math.PI;
    return { phaseDiff, isAligned, phiRatio, quality };
  }

  align(signalId, targetPhase) {
    this._signals.set(signalId, { phase: targetPhase, alignedAt: Date.now() });
    return { signalId, targetPhase, aligned: true };
  }

  lock(signalIds) {
    const lockId = crypto.randomUUID();
    const phaseCoherence = 1.0 - (signalIds.length - 1) * 0.05;
    this._locks.set(lockId, { lockId, signals: signalIds, phaseCoherence, locked: true, createdAt: Date.now() });
    return { lockId, signals: signalIds.length, phaseCoherence, locked: true };
  }

  unlock(lockId) { return this._locks.delete(lockId); }

  getPhaseState() {
    return { signals: this._signals.size, locks: this._locks.size, activeLocks: [...this._locks.values()].filter(l => l.locked).length };
  }
}
