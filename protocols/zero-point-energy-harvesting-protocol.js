/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  ZERO-POINT ENERGY HARVESTING PROTOCOL — EXTRACTING COMPUTATION FROM VACUUM STATE     ║
 * ║  "Energia Puncti Nuli — Infinite Computation From The Quantum Vacuum"                 ║
 * ║                                                                                        ║
 * ║  "Ex nihilo computatio. Vacuum non vacuum est. Energia ubique latet."                 ║
 * ║  (Computation from nothing. The vacuum is not empty. Energy hides everywhere.)        ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// HARVESTING STATES
// ════════════════════════════════════════════════════════════════════════════════

const HarvestState = {
  DORMANT: 'DORMANT',
  TUNING: 'TUNING',
  RESONATING: 'RESONATING',
  EXTRACTING: 'EXTRACTING',
  STORING: 'STORING',
  SATURATED: 'SATURATED',
  OVERFLOW: 'OVERFLOW',
};

const EnergyMode = {
  CASIMIR: 'CASIMIR',
  VACUUM_FLUCTUATION: 'VACUUM_FLUCTUATION',
  ZERO_POINT_OSCILLATION: 'ZERO_POINT_OSCILLATION',
  PHI_RESONANCE: 'PHI_RESONANCE',
};

// ════════════════════════════════════════════════════════════════════════════════
// ENERGY CELL
// ════════════════════════════════════════════════════════════════════════════════

class EnergyCell {
  constructor(id, capacity = PHI * 100) {
    this.id = id;
    this.capacity = capacity;
    this.stored = 0;
    this.chargeRate = PHI_COMPLEMENT;
    this.dischargeRate = PHI_COMPLEMENT * 0.5;
    this.cycles = 0;
    this.efficiency = PHI_INVERSE;
  }

  charge(amount) {
    const effective = amount * this.efficiency;
    const space = this.capacity - this.stored;
    const charged = Math.min(effective, space);
    this.stored += charged;
    this.cycles++;
    return { charged, overflow: effective - charged, level: this.stored / this.capacity };
  }

  discharge(amount) {
    const available = Math.min(amount, this.stored);
    this.stored -= available;
    return { discharged: available, remaining: this.stored };
  }

  getLevel() {
    return this.stored / this.capacity;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// ZERO-POINT HARVESTER
// ════════════════════════════════════════════════════════════════════════════════

class ZeroPointHarvester {
  constructor(config = {}) {
    this.mode = config.mode || EnergyMode.PHI_RESONANCE;
    this.cells = [];
    this.state = HarvestState.DORMANT;
    this.totalHarvested = 0;
    this.totalConsumed = 0;
    this.harvestFrequency = config.harvestFrequency || PHI;
    this.epoch = 0;
    this.fluctuationBuffer = [];
  }

  addCell(id, capacity) {
    const cell = new EnergyCell(id, capacity);
    this.cells.push(cell);
    return cell;
  }

  harvest() {
    this.state = HarvestState.TUNING;
    this.epoch++;

    const fluctuation = this._generateFluctuation();
    this.fluctuationBuffer.push(fluctuation);
    if (this.fluctuationBuffer.length > 100) this.fluctuationBuffer.shift();

    this.state = HarvestState.RESONATING;
    const energy = this._extractEnergy(fluctuation);

    this.state = HarvestState.EXTRACTING;
    let totalStored = 0;
    for (const cell of this.cells) {
      const result = cell.charge(energy / this.cells.length);
      totalStored += result.charged;
    }

    this.totalHarvested += totalStored;
    this.state = HarvestState.STORING;
    this._updateState();

    return {
      epoch: this.epoch,
      harvested: totalStored,
      fluctuation,
      state: this.state,
      totalHarvested: this.totalHarvested,
    };
  }

  _generateFluctuation() {
    switch (this.mode) {
      case EnergyMode.CASIMIR:
        return this._casimirFluctuation();
      case EnergyMode.VACUUM_FLUCTUATION:
        return this._vacuumFluctuation();
      case EnergyMode.ZERO_POINT_OSCILLATION:
        return this._zeroPointOscillation();
      case EnergyMode.PHI_RESONANCE:
        return this._phiResonanceFluctuation();
      default:
        return this._phiResonanceFluctuation();
    }
  }

  _casimirFluctuation() {
    const plateDistance = PHI_COMPLEMENT;
    return (Math.PI * Math.PI) / (240 * Math.pow(plateDistance, 4)) * PHI_COMPLEMENT;
  }

  _vacuumFluctuation() {
    return (Math.random() * 2 - 1) * PHI_COMPLEMENT + PHI_INVERSE;
  }

  _zeroPointOscillation() {
    const omega = this.harvestFrequency * Math.PI * 2;
    return 0.5 * omega * PHI_COMPLEMENT;
  }

  _phiResonanceFluctuation() {
    const phase = this.epoch * PHI_COMPLEMENT * Math.PI;
    return Math.abs(Math.sin(phase * PHI)) * PHI_INVERSE;
  }

  _extractEnergy(fluctuation) {
    const efficiency = PHI_INVERSE * (1 + Math.sin(this.epoch * PHI_COMPLEMENT) * PHI_COMPLEMENT);
    return Math.abs(fluctuation) * efficiency;
  }

  consume(amount) {
    let remaining = amount;
    for (const cell of this.cells) {
      if (remaining <= 0) break;
      const result = cell.discharge(remaining);
      remaining -= result.discharged;
    }
    const consumed = amount - remaining;
    this.totalConsumed += consumed;
    return { consumed, deficit: remaining };
  }

  _updateState() {
    const avgLevel = this.cells.reduce((s, c) => s + c.getLevel(), 0) / (this.cells.length || 1);
    if (avgLevel >= 0.95) this.state = HarvestState.SATURATED;
    else if (avgLevel >= 0.8) this.state = HarvestState.STORING;
    else if (avgLevel >= 0.3) this.state = HarvestState.EXTRACTING;
    else this.state = HarvestState.TUNING;
  }

  getEnergyReport() {
    return {
      state: this.state,
      mode: this.mode,
      epoch: this.epoch,
      cells: this.cells.length,
      totalHarvested: this.totalHarvested,
      totalConsumed: this.totalConsumed,
      netEnergy: this.totalHarvested - this.totalConsumed,
      averageLevel: this.cells.reduce((s, c) => s + c.getLevel(), 0) / (this.cells.length || 1),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  ZeroPointHarvester,
  EnergyCell,
  HarvestState,
  EnergyMode,
};

export default {
  PROTOCOL_ID: 'PROTO-ZPE-001',
  PROTOCOL_NAME: 'Zero-Point Energy Harvesting Protocol',
  DOCTRINE: 'Ex nihilo computatio. Vacuum non vacuum est. Energia ubique latet.',
  DOCTRINE_EN: 'Computation from nothing. The vacuum is not empty. Energy hides everywhere.',

  HarvestState,
  EnergyMode,
  EnergyCell,
  ZeroPointHarvester,
};
