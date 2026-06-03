import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class EvolutionaryPressure {
  constructor(config = {}) {
    this.pressureType = config.pressureType ?? 'adaptive';
    this.intensity = config.intensity ?? PHI;
    this.decayRate = config.decayRate ?? (1 / PHI);
    this._constraints = [];
    this._history = [];
  }

  apply(population) {
    const threshold = this.intensity / (this.intensity + 1);
    const survivors = population.filter(member => {
      const survivalScore = (member.fitness ?? Math.random()) * this.intensity;
      return survivalScore > threshold * this.intensity;
    });
    const result = { survivorCount: survivors.length, pressureIntensity: this.intensity, adaptationRate: survivors.length / (population.length || 1) };
    this._history.push({ ...result, timestamp: Date.now() });
    return result;
  }

  escalate() {
    this.intensity *= PHI;
    return { intensity: this.intensity };
  }

  relax() {
    this.intensity /= PHI;
    return { intensity: this.intensity };
  }

  getEnvironment() {
    return { pressureType: this.pressureType, intensity: this.intensity, constraints: this._constraints.length, historyLength: this._history.length };
  }

  addConstraint(constraint) {
    const id = crypto.randomUUID();
    this._constraints.push({ id, constraint, addedAt: Date.now() });
    return { constraintId: id };
  }

  getConstraints() { return [...this._constraints]; }
}
