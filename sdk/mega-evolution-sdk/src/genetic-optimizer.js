import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class GeneticOptimizer {
  constructor(config = {}) {
    this.populationSize = config.populationSize ?? 64;
    this.mutationRate = config.mutationRate ?? (1 / PHI);
    this.crossoverRate = config.crossoverRate ?? (PHI - 1);
    this.elitismRatio = config.elitismRatio ?? (1 / Math.pow(PHI, 2));
    this.maxGenerations = config.maxGenerations ?? 100;
    this._population = [];
    this._generation = 0;
    this._fitnessHistory = [];
  }

  initialize(genomeTemplate) {
    const length = Array.isArray(genomeTemplate) ? genomeTemplate.length : 10;
    this._population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const genome = Array.from({ length }, () => Math.random());
      this._population.push({ id: crypto.randomUUID(), genome, fitness: this._computeFitness(genome) });
    }
    this._population.sort((a, b) => b.fitness - a.fitness);
    this._generation = 0;
    return { populationId: crypto.randomUUID(), size: this.populationSize, genomeLength: length, generation: 0 };
  }

  evolve() {
    if (this._population.length === 0) throw new Error('Population not initialized');
    this._generation++;
    const eliteCount = Math.max(1, Math.floor(this.populationSize * this.elitismRatio));
    const newPop = this._population.slice(0, eliteCount);
    let mutations = 0, crossovers = 0;

    while (newPop.length < this.populationSize) {
      const parentA = this._tournamentSelect();
      const parentB = this._tournamentSelect();
      let child = [...parentA.genome];
      if (Math.random() < this.crossoverRate) {
        const point = Math.floor(Math.random() * child.length);
        child = [...child.slice(0, point), ...parentB.genome.slice(point)];
        crossovers++;
      }
      for (let i = 0; i < child.length; i++) {
        if (Math.random() < this.mutationRate) { child[i] = Math.random(); mutations++; }
      }
      newPop.push({ id: crypto.randomUUID(), genome: child, fitness: this._computeFitness(child) });
    }

    this._population = newPop.sort((a, b) => b.fitness - a.fitness);
    const best = this._population[0].fitness;
    const avg = this._population.reduce((s, p) => s + p.fitness, 0) / this._population.length;
    const worst = this._population[this._population.length - 1].fitness;
    this._fitnessHistory.push(best);
    return { generation: this._generation, bestFitness: best, avgFitness: avg, worstFitness: worst, mutations, crossovers };
  }

  _tournamentSelect() {
    const a = this._population[Math.floor(Math.random() * this._population.length)];
    const b = this._population[Math.floor(Math.random() * this._population.length)];
    return a.fitness >= b.fitness ? a : b;
  }

  _computeFitness(genome) {
    return genome.reduce((sum, g, i) => sum + g * Math.pow(PHI, -i), 0) / genome.length;
  }

  getBest() {
    return this._population[0] ? { ...this._population[0] } : null;
  }

  getPopulation() {
    return this._population.map(p => ({ ...p }));
  }

  getStats() {
    const stagnation = this._fitnessHistory.length > 5 ?
      (Math.abs(this._fitnessHistory[this._fitnessHistory.length - 1] - this._fitnessHistory[this._fitnessHistory.length - 5]) < Math.pow(PHI, -10) ? 5 : 0) : 0;
    return { generations: this._generation, improvements: this._fitnessHistory.length, stagnationCount: stagnation };
  }

  isConverged() {
    if (this._fitnessHistory.length < 5) return false;
    const recent = this._fitnessHistory.slice(-5);
    const diff = Math.abs(recent[recent.length - 1] - recent[0]);
    return diff < Math.pow(PHI, -10);
  }
}
