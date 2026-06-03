import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class AutonomyBoundary {
  constructor(config = {}) {
    this.innerRadius = config.innerRadius ?? 1.0;
    this.outerRadius = config.outerRadius ?? PHI;
    this.boundaryType = config.boundaryType ?? 'phi-sphere';
    this.permeability = config.permeability ?? 0.5;
    this._constraints = [];
    this._transgressions = [];
  }

  define(constraints) {
    this._constraints = Array.isArray(constraints) ? [...constraints] : [constraints];
    return { constraintCount: this._constraints.length, innerRadius: this.innerRadius, outerRadius: this.outerRadius, type: this.boundaryType };
  }

  checkBounds(action) {
    const magnitude = typeof action === 'number' ? action : (action.magnitude ?? Math.random() * PHI * 2);
    const distance = Math.abs(magnitude - (this.innerRadius + this.outerRadius) / 2);
    const inBounds = magnitude >= this.innerRadius && magnitude <= this.outerRadius;
    const phiAlignment = 1 - Math.abs(magnitude / this.outerRadius - (1 / PHI));
    const transgressLevel = inBounds ? 0 : distance / this.outerRadius;
    if (!inBounds) this._transgressions.push({ action, distance, timestamp: Date.now() });
    return { inBounds, distance, phiAlignment, transgressLevel };
  }

  expand(factor = PHI) {
    this.outerRadius *= factor;
    this.innerRadius *= factor;
    return { innerRadius: this.innerRadius, outerRadius: this.outerRadius };
  }

  contract(factor = PHI) {
    this.outerRadius /= factor;
    this.innerRadius /= factor;
    return { innerRadius: this.innerRadius, outerRadius: this.outerRadius };
  }

  getBoundary() { return { innerRadius: this.innerRadius, outerRadius: this.outerRadius, type: this.boundaryType, permeability: this.permeability, constraints: this._constraints.length }; }
  getTransgressionLog() { return [...this._transgressions]; }
}
