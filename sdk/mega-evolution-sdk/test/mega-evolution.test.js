import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GeneticOptimizer } from '../src/genetic-optimizer.js';
import { MutationEngine } from '../src/mutation-engine.js';
import { FitnessEvaluator } from '../src/fitness-evaluator.js';
import { PopulationManager } from '../src/population-manager.js';
import { EvolutionaryPressure } from '../src/evolutionary-pressure.js';

const PHI = 1.618033988749895;

describe('GeneticOptimizer', () => {
  let optimizer;
  beforeEach(() => { optimizer = new GeneticOptimizer(); });

  test('should create with defaults', () => {
    assert.strictEqual(optimizer.populationSize, 64);
    assert.strictEqual(optimizer.maxGenerations, 100);
  });

  test('should initialize population', () => {
    const result = optimizer.initialize([0, 0, 0, 0, 0]);
    assert.strictEqual(result.size, 64);
    assert.strictEqual(result.genomeLength, 5);
    assert.strictEqual(result.generation, 0);
  });

  test('should evolve one generation', () => {
    optimizer.initialize([0, 0, 0]);
    const result = optimizer.evolve();
    assert.strictEqual(result.generation, 1);
    assert.ok(result.bestFitness >= result.worstFitness);
  });

  test('should get best genome', () => {
    optimizer.initialize([0, 0]);
    const best = optimizer.getBest();
    assert.ok(best.genome);
    assert.ok(best.fitness > 0);
  });

  test('should get population', () => {
    optimizer.initialize([0]);
    assert.strictEqual(optimizer.getPopulation().length, 64);
  });

  test('should get stats', () => {
    optimizer.initialize([0, 0]);
    optimizer.evolve();
    const stats = optimizer.getStats();
    assert.strictEqual(stats.generations, 1);
  });

  test('should not converge early', () => {
    optimizer.initialize([0, 0]);
    assert.strictEqual(optimizer.isConverged(), false);
  });

  test('should throw if evolving without init', () => {
    assert.throws(() => optimizer.evolve(), /not initialized/);
  });
});

describe('MutationEngine', () => {
  let engine;
  beforeEach(() => { engine = new MutationEngine(); });

  test('should create with default strategies', () => {
    assert.strictEqual(engine.strategies.length, 4);
  });

  test('should mutate with point strategy', () => {
    const result = engine.mutate([0.5, 0.5, 0.5], 'point');
    assert.strictEqual(result.original.length, 3);
    assert.strictEqual(result.mutated.length, 3);
    assert.strictEqual(result.strategy, 'point');
  });

  test('should mutate with swap strategy', () => {
    const result = engine.mutate([0.1, 0.9, 0.5], 'swap');
    assert.strictEqual(result.strategy, 'swap');
  });

  test('should mutate with inversion', () => {
    const result = engine.mutate([0.1, 0.2, 0.3, 0.4, 0.5], 'inversion');
    assert.strictEqual(result.strategy, 'inversion');
    assert.ok(result.changeCount > 0);
  });

  test('should mutate with phi-shift', () => {
    const result = engine.mutate([0.3, 0.6], 'phi-shift');
    assert.strictEqual(result.changeCount, 2);
  });

  test('should throw for unknown strategy', () => {
    assert.throws(() => engine.mutate([1], 'unknown'), /Unknown/);
  });

  test('should adapt rate', () => {
    const newRate = engine.adaptRate([0.1, 0.2, 0.3, 0.4, 0.5]);
    assert.ok(newRate > 0);
  });

  test('should get stats', () => {
    engine.mutate([0.5], 'point');
    const stats = engine.getStats();
    assert.strictEqual(stats.totalMutations, 1);
  });
});

describe('FitnessEvaluator', () => {
  let evaluator;
  beforeEach(() => { evaluator = new FitnessEvaluator(); });

  test('should create with default objectives', () => {
    assert.strictEqual(evaluator.getObjectives().length, 3);
  });

  test('should evaluate genome', () => {
    const result = evaluator.evaluate([0.5, 0.8, 0.3]);
    assert.ok(result.fitness >= 0);
    assert.ok(result.phiHarmony >= 0);
    assert.ok(result.objectives.performance !== undefined);
  });

  test('should compare genomes', () => {
    const result = evaluator.compareGenomes([0.9, 0.9], [0.1, 0.1]);
    assert.ok(result.winner === 'a' || result.winner === 'b');
  });

  test('should get pareto front', () => {
    const pop = [[0.9, 0.1], [0.1, 0.9], [0.5, 0.5]];
    const pareto = evaluator.getPareto(pop);
    assert.ok(pareto.length > 0);
  });

  test('should set objective', () => {
    evaluator.setObjective('speed', 2.0);
    assert.strictEqual(evaluator.getObjectives().length, 4);
  });
});

describe('PopulationManager', () => {
  let manager;
  beforeEach(() => { manager = new PopulationManager(); });

  test('should create with defaults', () => {
    assert.strictEqual(manager.capacity, 128);
  });

  test('should add member', () => {
    const result = manager.add([0.5, 0.5], 0.8);
    assert.ok(result.memberId);
    assert.strictEqual(result.fitness, 0.8);
  });

  test('should select members', () => {
    manager.add([0.5], 0.8);
    manager.add([0.3], 0.6);
    const selected = manager.select(2);
    assert.strictEqual(selected.length, 2);
  });

  test('should cull population', () => {
    manager.add([0.1], 0.1);
    manager.add([0.9], 0.9);
    manager.add([0.5], 0.5);
    const removed = manager.cull(0.5);
    assert.ok(removed > 0);
  });

  test('should get diversity', () => {
    manager.add([0.1], 0.5);
    manager.add([0.9], 0.7);
    const d = manager.getDiversity();
    assert.ok(d >= 0);
  });

  test('should reset', () => {
    manager.add([1], 1);
    manager.reset();
    assert.strictEqual(manager.getSize(), 0);
  });
});

describe('EvolutionaryPressure', () => {
  let pressure;
  beforeEach(() => { pressure = new EvolutionaryPressure(); });

  test('should create with defaults', () => {
    assert.strictEqual(pressure.pressureType, 'adaptive');
    assert.strictEqual(pressure.intensity, PHI);
  });

  test('should apply pressure', () => {
    const pop = [{ fitness: 0.9 }, { fitness: 0.5 }, { fitness: 0.1 }];
    const result = pressure.apply(pop);
    assert.ok(result.survivorCount <= 3);
    assert.ok(result.pressureIntensity > 0);
  });

  test('should escalate', () => {
    const before = pressure.intensity;
    pressure.escalate();
    assert.ok(pressure.intensity > before);
  });

  test('should relax', () => {
    const before = pressure.intensity;
    pressure.relax();
    assert.ok(pressure.intensity < before);
  });

  test('should get environment', () => {
    const env = pressure.getEnvironment();
    assert.strictEqual(env.pressureType, 'adaptive');
  });

  test('should add constraint', () => {
    const result = pressure.addConstraint({ type: 'resource', limit: 100 });
    assert.ok(result.constraintId);
    assert.strictEqual(pressure.getConstraints().length, 1);
  });
});
