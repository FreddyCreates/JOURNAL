import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class IncubationChamber {
  constructor(config = {}) {
    this.capacity = config.capacity ?? 32;
    this.incubationCycles = config.incubationCycles ?? 7;
    this.phiNurturing = config.phiNurturing ?? true;
    this.autoRelease = config.autoRelease ?? false;
    this._chambers = new Map();
  }

  incubate(entityId) {
    if (this._chambers.size >= this.capacity) throw new Error('Chamber at capacity');
    const chamberId = crypto.randomUUID();
    const entry = { chamberId, entityId, cycle: 0, maxCycles: this.incubationCycles, readiness: 0, phiGrowth: 0, startedAt: Date.now() };
    this._chambers.set(chamberId, entry);
    return { chamberId, entityId, cycle: 0, maxCycles: this.incubationCycles, readiness: 0, phiGrowth: 0 };
  }

  nurture(chamberId) {
    const ch = this._chambers.get(chamberId);
    if (!ch) throw new Error(`Chamber ${chamberId} not found`);
    ch.cycle++;
    const increment = (1 / ch.maxCycles) * PHI / (PHI + 1);
    ch.readiness = Math.min(1.0, ch.readiness + increment);
    ch.phiGrowth = ch.readiness * PHI;
    return { chamberId, cycle: ch.cycle, readiness: ch.readiness, phiGrowth: ch.phiGrowth };
  }

  checkReadiness(chamberId) {
    const ch = this._chambers.get(chamberId);
    if (!ch) throw new Error(`Chamber ${chamberId} not found`);
    const ready = ch.readiness >= 0.9;
    const cyclesRemaining = Math.max(0, ch.maxCycles - ch.cycle);
    const phiMaturity = ch.readiness * PHI / (PHI + 1);
    return { ready, readiness: ch.readiness, cyclesRemaining, phiMaturity };
  }

  release(chamberId) {
    const ch = this._chambers.get(chamberId);
    if (!ch) throw new Error(`Chamber ${chamberId} not found`);
    const released = ch.readiness >= 0.9;
    if (released) this._chambers.delete(chamberId);
    return { released, entityId: ch.entityId, finalReadiness: ch.readiness, incubationTime: Date.now() - ch.startedAt };
  }

  getChamber(chamberId) { return this._chambers.get(chamberId) ?? null; }

  getOccupancy() {
    return { total: this.capacity, occupied: this._chambers.size, available: this.capacity - this._chambers.size };
  }
}
