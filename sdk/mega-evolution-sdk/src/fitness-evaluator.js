const PHI = 1.618033988749895;

export class FitnessEvaluator {
  constructor(config = {}) {
    this._objectives = new Map();
    const objectives = config.objectives ?? ['performance', 'efficiency', 'resilience'];
    objectives.forEach((o, i) => this._objectives.set(o, Math.pow(PHI, -i)));
    this.phiWeighting = config.phiWeighting ?? true;
    this.normalization = config.normalization ?? true;
  }

  evaluate(genome) {
    const objectives = {};
    let fitness = 0;
    let i = 0;
    for (const [name, weight] of this._objectives) {
      const score = genome.reduce((s, g, idx) => s + g * Math.pow(PHI, -(idx + i)), 0) / genome.length;
      objectives[name] = Math.min(1.0, Math.abs(score));
      fitness += objectives[name] * weight;
      i++;
    }
    fitness /= this._objectives.size || 1;
    const phiHarmony = 1 - Math.abs(fitness - (1 / PHI));
    return { fitness, objectives, phiHarmony, rank: null };
  }

  compareGenomes(a, b) {
    const evalA = this.evaluate(a);
    const evalB = this.evaluate(b);
    const dominates = evalA.fitness > evalB.fitness;
    return { aFitness: evalA.fitness, bFitness: evalB.fitness, winner: dominates ? 'a' : 'b', difference: Math.abs(evalA.fitness - evalB.fitness) };
  }

  getPareto(population) {
    const evaluated = population.map(g => ({ genome: g, ...this.evaluate(g) }));
    return evaluated.filter((ind, _, all) =>
      !all.some(other => other.fitness > ind.fitness && other !== ind)
    );
  }

  setObjective(name, weight) { this._objectives.set(name, weight); }
  getObjectives() { return [...this._objectives.entries()].map(([name, weight]) => ({ name, weight })); }
}
