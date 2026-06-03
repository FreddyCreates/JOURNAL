import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { EntityCreator } from '../src/entity-creator.js';
import { LifecycleBootstrapper } from '../src/lifecycle-bootstrapper.js';
import { GenesisProtocol } from '../src/genesis-protocol.js';
import { BlueprintForge } from '../src/blueprint-forge.js';
import { IncubationChamber } from '../src/incubation-chamber.js';

const PHI = 1.618033988749895;

describe('EntityCreator', () => {
  let creator;
  beforeEach(() => { creator = new EntityCreator(); });

  test('should create with defaults', () => {
    assert.strictEqual(creator.maxEntities, 256);
    assert.ok(creator.autoNaming);
  });

  test('should create entity', () => {
    const r = creator.create({ type: 'agent', name: 'Nova' });
    assert.ok(r.entityId);
    assert.strictEqual(r.name, 'Nova');
    assert.strictEqual(r.type, 'agent');
    assert.strictEqual(r.status, 'nascent');
  });

  test('should auto-name entity', () => {
    const r = creator.create({});
    assert.ok(r.name.startsWith('entity-'));
  });

  test('should register template', () => {
    const r = creator.registerTemplate('bot', { type: 'bot', properties: { speed: 10 } });
    assert.strictEqual(r.name, 'bot');
  });

  test('should create from template', () => {
    creator.registerTemplate('worker', { type: 'worker', name: 'W1' });
    const r = creator.createFromTemplate('worker');
    assert.strictEqual(r.type, 'worker');
  });

  test('should throw for unknown template', () => {
    assert.throws(() => creator.createFromTemplate('fake'), /not found/);
  });

  test('should destroy entity', () => {
    const e = creator.create({});
    const r = creator.destroy(e.entityId);
    assert.ok(r.destroyedAt);
  });

  test('should get stats', () => {
    creator.create({});
    const s = creator.getStats();
    assert.strictEqual(s.totalCreated, 1);
  });
});

describe('LifecycleBootstrapper', () => {
  let boot;
  beforeEach(() => { boot = new LifecycleBootstrapper(); });

  test('should create with defaults', () => {
    assert.strictEqual(boot.stages.length, 5);
  });

  test('should bootstrap lifecycle', () => {
    const r = boot.bootstrap('entity-1');
    assert.ok(r.lifecycleId);
    assert.strictEqual(r.stage, 'genesis');
    assert.strictEqual(r.phiAge, 0);
  });

  test('should advance stage', () => {
    const lc = boot.bootstrap('e1');
    const r = boot.advance(lc.lifecycleId);
    assert.strictEqual(r.from, 'genesis');
    assert.strictEqual(r.to, 'infancy');
    assert.ok(r.phiAge > 0);
  });

  test('should throw at final stage', () => {
    const lc = boot.bootstrap('e1');
    for (let i = 0; i < 4; i++) boot.advance(lc.lifecycleId);
    assert.throws(() => boot.advance(lc.lifecycleId), /final stage/);
  });

  test('should get stage', () => {
    const lc = boot.bootstrap('e1');
    assert.strictEqual(boot.getStage(lc.lifecycleId), 'genesis');
  });

  test('should terminate', () => {
    const lc = boot.bootstrap('e1');
    const r = boot.terminate(lc.lifecycleId);
    assert.strictEqual(r.stage, 'terminated');
  });

  test('should get all lifecycles', () => {
    boot.bootstrap('a');
    boot.bootstrap('b');
    assert.strictEqual(boot.getAllLifecycles().length, 2);
  });
});

describe('GenesisProtocol', () => {
  let protocol;
  beforeEach(() => { protocol = new GenesisProtocol(); });

  test('should initiate genesis', () => {
    const r = protocol.initiate({ type: 'agent', name: 'X' });
    assert.ok(r.genesisId);
    assert.strictEqual(r.phase, 'initiated');
    assert.ok(r.phiSignature);
  });

  test('should validate valid spec', () => {
    const g = protocol.initiate({ type: 'bot', name: 'Y' });
    const r = protocol.validate(g.genesisId);
    assert.ok(r.valid);
    assert.strictEqual(r.errors.length, 0);
  });

  test('should validate invalid spec', () => {
    const g = protocol.initiate({ name: 'no-type' });
    const r = protocol.validate(g.genesisId);
    assert.strictEqual(r.valid, false);
  });

  test('should execute genesis', () => {
    const g = protocol.initiate({ type: 'x', name: 'n' });
    protocol.validate(g.genesisId);
    const r = protocol.execute(g.genesisId);
    assert.ok(r.entityId);
  });

  test('should throw executing failed genesis', () => {
    const g = protocol.initiate({});
    protocol.validate(g.genesisId);
    assert.throws(() => protocol.execute(g.genesisId), /failed/);
  });

  test('should get history', () => {
    protocol.initiate({ type: 'a' });
    assert.strictEqual(protocol.getHistory().length, 1);
  });

  test('should add rule', () => {
    const r = protocol.addRule({ name: 'must-have-type' });
    assert.strictEqual(r.ruleCount, 1);
  });
});

describe('BlueprintForge', () => {
  let forge;
  beforeEach(() => { forge = new BlueprintForge(); });

  test('should create with defaults', () => {
    assert.strictEqual(forge.forgeTemperature, PHI);
  });

  test('should forge blueprint', () => {
    const r = forge.forge(['speed', 'strength']);
    assert.ok(r.blueprintId);
    assert.strictEqual(r.requirements.length, 2);
    assert.ok(r.complexity > 0);
  });

  test('should refine blueprint', () => {
    const bp = forge.forge(['x']);
    const r = forge.refine(bp.blueprintId, 'improve');
    assert.strictEqual(r.refined, 1);
  });

  test('should validate blueprint', () => {
    const bp = forge.forge(['a']);
    const r = forge.validate(bp.blueprintId);
    assert.ok(typeof r.valid === 'boolean');
  });

  test('should decompose blueprint', () => {
    const bp = forge.forge(['a', 'b', 'c']);
    const r = forge.decompose(bp.blueprintId);
    assert.strictEqual(r.length, 3);
  });

  test('should throw for too complex', () => {
    const f = new BlueprintForge({ maxComplexity: 5 });
    assert.throws(() => f.forge(['a', 'b', 'c', 'd']), /complex/);
  });

  test('should get all blueprints', () => {
    forge.forge(['x']);
    assert.strictEqual(forge.getBlueprints().length, 1);
  });
});

describe('IncubationChamber', () => {
  let chamber;
  beforeEach(() => { chamber = new IncubationChamber(); });

  test('should create with defaults', () => {
    assert.strictEqual(chamber.capacity, 32);
    assert.strictEqual(chamber.incubationCycles, 7);
  });

  test('should incubate entity', () => {
    const r = chamber.incubate('entity-1');
    assert.ok(r.chamberId);
    assert.strictEqual(r.cycle, 0);
    assert.strictEqual(r.readiness, 0);
  });

  test('should nurture', () => {
    const ch = chamber.incubate('e1');
    const r = chamber.nurture(ch.chamberId);
    assert.strictEqual(r.cycle, 1);
    assert.ok(r.readiness > 0);
  });

  test('should check readiness', () => {
    const ch = chamber.incubate('e1');
    const r = chamber.checkReadiness(ch.chamberId);
    assert.strictEqual(r.ready, false);
    assert.strictEqual(r.readiness, 0);
  });

  test('should release when ready', () => {
    const ch = chamber.incubate('e1');
    for (let i = 0; i < 20; i++) chamber.nurture(ch.chamberId);
    const r = chamber.release(ch.chamberId);
    assert.ok(r.released);
  });

  test('should not release when not ready', () => {
    const ch = chamber.incubate('e1');
    const r = chamber.release(ch.chamberId);
    assert.strictEqual(r.released, false);
  });

  test('should get occupancy', () => {
    chamber.incubate('a');
    chamber.incubate('b');
    const o = chamber.getOccupancy();
    assert.strictEqual(o.occupied, 2);
    assert.strictEqual(o.available, 30);
  });

  test('should throw at capacity', () => {
    const small = new IncubationChamber({ capacity: 1 });
    small.incubate('a');
    assert.throws(() => small.incubate('b'), /capacity/);
  });
});
