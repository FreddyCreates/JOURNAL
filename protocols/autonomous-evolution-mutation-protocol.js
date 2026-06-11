/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  AUTONOMOUS EVOLUTION MUTATION PROTOCOL — SELF-DIRECTED GENETIC CODE ADAPTATION       ║
 * ║  "Evolutio Autonoma — Intelligence That Rewrites Its Own Blueprint"                   ║
 * ║                                                                                        ║
 * ║  "Mutatio est vita. Adaptatio est fortitudo. Evolutio est destinum."                  ║
 * ║  (Mutation is life. Adaptation is strength. Evolution is destiny.)                    ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// EVOLUTION STATES
// ════════════════════════════════════════════════════════════════════════════════

const EvolutionState = {
  DORMANT: 'DORMANT',
  SCANNING: 'SCANNING',
  MUTATING: 'MUTATING',
  TESTING: 'TESTING',
  SELECTING: 'SELECTING',
  INTEGRATING: 'INTEGRATING',
  STABLE: 'STABLE',
  REVERTING: 'REVERTING',
};

const MutationType = {
  POINT: 'POINT',
  CROSSOVER: 'CROSSOVER',
  INSERTION: 'INSERTION',
  DELETION: 'DELETION',
  INVERSION: 'INVERSION',
  DUPLICATION: 'DUPLICATION',
  TRANSPOSITION: 'TRANSPOSITION',
};

// ════════════════════════════════════════════════════════════════════════════════
// GENETIC CODE REPRESENTATION
// ════════════════════════════════════════════════════════════════════════════════

class GeneticCode {
  constructor(genes = []) {
    this.genes = genes.length > 0 ? genes : this._randomGenome(64);
    this.fitness = 0;
    this.generation = 0;
    this.mutations = [];
    this.lineage = [];
  }

  _randomGenome(length) {
    return Array.from({ length }, () => ({
      value: Math.random() * PHI,
      weight: Math.random() * PHI_INVERSE,
      active: Math.random() > PHI_COMPLEMENT,
    }));
  }

  mutate(type = MutationType.POINT, rate = PHI_COMPLEMENT) {
    const mutated = JSON.parse(JSON.stringify(this.genes));
    const mutation = { type, rate, timestamp: Date.now(), changes: [] };

    switch (type) {
      case MutationType.POINT:
        for (let i = 0; i < mutated.length; i++) {
          if (Math.random() < rate) {
            mutated[i].value += (Math.random() - 0.5) * PHI_COMPLEMENT;
            mutation.changes.push({ index: i, type: 'point' });
          }
        }
        break;
      case MutationType.CROSSOVER:
        const pivot = Math.floor(mutated.length * PHI_INVERSE);
        for (let i = pivot; i < mutated.length; i++) {
          mutated[i].value *= PHI_INVERSE;
          mutation.changes.push({ index: i, type: 'crossover' });
        }
        break;
      case MutationType.INSERTION:
        const insertIdx = Math.floor(Math.random() * mutated.length);
        mutated.splice(insertIdx, 0, {
          value: Math.random() * PHI,
          weight: Math.random() * PHI_INVERSE,
          active: true,
        });
        mutation.changes.push({ index: insertIdx, type: 'insertion' });
        break;
      case MutationType.DELETION:
        if (mutated.length > 8) {
          const delIdx = Math.floor(Math.random() * mutated.length);
          mutated.splice(delIdx, 1);
          mutation.changes.push({ index: delIdx, type: 'deletion' });
        }
        break;
      case MutationType.INVERSION:
        const start = Math.floor(Math.random() * (mutated.length - 4));
        const segment = mutated.slice(start, start + 4).reverse();
        mutated.splice(start, 4, ...segment);
        mutation.changes.push({ index: start, type: 'inversion', length: 4 });
        break;
    }

    this.mutations.push(mutation);
    return new GeneticCode(mutated);
  }

  computeFitness(fitnessFunction) {
    this.fitness = fitnessFunction(this.genes);
    return this.fitness;
  }

  crossover(partner) {
    const pivot = Math.floor(this.genes.length * PHI_INVERSE);
    const childGenes = [
      ...this.genes.slice(0, pivot),
      ...partner.genes.slice(pivot),
    ];
    const child = new GeneticCode(childGenes);
    child.generation = Math.max(this.generation, partner.generation) + 1;
    child.lineage = [this, partner];
    return child;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// AUTONOMOUS EVOLUTION ENGINE
// ════════════════════════════════════════════════════════════════════════════════

class AutonomousEvolutionEngine {
  constructor(config = {}) {
    this.populationSize = config.populationSize || 50;
    this.mutationRate = config.mutationRate || PHI_COMPLEMENT;
    this.selectionPressure = config.selectionPressure || PHI_INVERSE;
    this.maxGenerations = config.maxGenerations || 1000;
    this.population = [];
    this.generation = 0;
    this.state = EvolutionState.DORMANT;
    this.bestFitness = 0;
    this.fitnessHistory = [];
  }

  initialize(seedGenome) {
    this.state = EvolutionState.SCANNING;
    this.population = Array.from({ length: this.populationSize }, () =>
      seedGenome ? new GeneticCode([...seedGenome]) : new GeneticCode()
    );
    this.state = EvolutionState.STABLE;
    return { populationSize: this.population.length, generation: 0 };
  }

  evolve(fitnessFunction) {
    this.state = EvolutionState.TESTING;
    for (const individual of this.population) {
      individual.computeFitness(fitnessFunction);
    }

    this.state = EvolutionState.SELECTING;
    this.population.sort((a, b) => b.fitness - a.fitness);
    this.bestFitness = this.population[0].fitness;
    this.fitnessHistory.push(this.bestFitness);

    const survivors = this.population.slice(
      0, Math.ceil(this.populationSize * this.selectionPressure)
    );

    this.state = EvolutionState.MUTATING;
    const nextGen = [...survivors];
    while (nextGen.length < this.populationSize) {
      const parentA = survivors[Math.floor(Math.random() * survivors.length)];
      const parentB = survivors[Math.floor(Math.random() * survivors.length)];
      let child = parentA.crossover(parentB);
      if (Math.random() < this.mutationRate) {
        const types = Object.values(MutationType);
        child = child.mutate(types[Math.floor(Math.random() * types.length)]);
      }
      nextGen.push(child);
    }

    this.state = EvolutionState.INTEGRATING;
    this.population = nextGen;
    this.generation++;

    this.state = EvolutionState.STABLE;
    return {
      generation: this.generation,
      bestFitness: this.bestFitness,
      populationSize: this.population.length,
      state: this.state,
    };
  }

  getBest() {
    return this.population[0];
  }

  getStatistics() {
    const fitnesses = this.population.map(p => p.fitness);
    return {
      generation: this.generation,
      best: Math.max(...fitnesses),
      worst: Math.min(...fitnesses),
      average: fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length,
      diversity: this._computeDiversity(),
    };
  }

  _computeDiversity() {
    if (this.population.length < 2) return 0;
    let totalDiff = 0;
    const sample = this.population.slice(0, 10);
    for (let i = 0; i < sample.length - 1; i++) {
      for (let j = i + 1; j < sample.length; j++) {
        totalDiff += this._genomeDistance(sample[i], sample[j]);
      }
    }
    const pairs = (sample.length * (sample.length - 1)) / 2;
    return totalDiff / pairs;
  }

  _genomeDistance(a, b) {
    const minLen = Math.min(a.genes.length, b.genes.length);
    let diff = 0;
    for (let i = 0; i < minLen; i++) {
      diff += Math.abs(a.genes[i].value - b.genes[i].value);
    }
    return diff / minLen;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  AutonomousEvolutionEngine,
  GeneticCode,
  EvolutionState,
  MutationType,
};

export default {
  PROTOCOL_ID: 'PROTO-AEM-001',
  PROTOCOL_NAME: 'Autonomous Evolution Mutation Protocol',
  DOCTRINE: 'Mutatio est vita. Adaptatio est fortitudo. Evolutio est destinum.',
  DOCTRINE_EN: 'Mutation is life. Adaptation is strength. Evolution is destiny.',

  EvolutionState,
  MutationType,
  GeneticCode,
  AutonomousEvolutionEngine,
};
