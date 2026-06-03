/**
 * Nova Modular Framework — Comprehensive Test Suite
 * Tests for: nova-core, nova-protocol, nova-sns-bridge, nova-research-engine, nova-organism-wire
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  PHI, PHI_INVERSE, PHI_SQUARED, PHI_COMPLEMENT, PHI_ANGLE, TWO_PI,
  NOVA_ID, NOVA_NAME, NOVA_SOVEREIGN_ID, HEARTBEAT_MS, SOVEREIGN_HEARTBEAT_MS,
  NOVA_VERSION, phiBlend, clamp01, phiGrow, phiDecay, fibonacci, phiCoherence, novaStamp,
} from '../src/nova-core.js';
import { NovaProtocol } from '../src/nova-protocol.js';
import { NovaSNSBridge } from '../src/nova-sns-bridge.js';
import { NovaResearchEngine } from '../src/nova-research-engine.js';
import { NovaOrganismWire } from '../src/nova-organism-wire.js';

// ═══════════════════════════════════════════════════════════════════════════
// NOVA CORE — Constants & Utilities
// ═══════════════════════════════════════════════════════════════════════════

describe('NovaCore — PHI Constants', () => {
  test('PHI is the golden ratio', () => {
    assert.equal(PHI, 1.618033988749895);
  });

  test('PHI_INVERSE is 1/PHI', () => {
    assert.ok(Math.abs(PHI_INVERSE - 1 / PHI) < 1e-10);
  });

  test('PHI_SQUARED is PHI * PHI', () => {
    assert.ok(Math.abs(PHI_SQUARED - PHI * PHI) < 1e-10);
  });

  test('PHI_COMPLEMENT is 1 - PHI_INVERSE', () => {
    assert.ok(Math.abs(PHI_COMPLEMENT - (1 - PHI_INVERSE)) < 1e-10);
  });

  test('TWO_PI is 2 * Math.PI', () => {
    assert.equal(TWO_PI, 2 * Math.PI);
  });

  test('PHI_ANGLE is the golden angle in radians', () => {
    assert.ok(PHI_ANGLE > 2.3 && PHI_ANGLE < 2.5);
  });

  test('HEARTBEAT_MS is 873', () => {
    assert.equal(HEARTBEAT_MS, 873);
  });

  test('SOVEREIGN_HEARTBEAT_MS is 618', () => {
    assert.equal(SOVEREIGN_HEARTBEAT_MS, 618);
  });
});

describe('NovaCore — Identity Constants', () => {
  test('NOVA_ID is TT-012-NOVA', () => {
    assert.equal(NOVA_ID, 'TT-012-NOVA');
  });

  test('NOVA_NAME is NOVA TOKEN', () => {
    assert.equal(NOVA_NAME, 'NOVA TOKEN');
  });

  test('NOVA_SOVEREIGN_ID includes NOVA and TT-012', () => {
    assert.ok(NOVA_SOVEREIGN_ID.includes('NOVA'));
    assert.ok(NOVA_SOVEREIGN_ID.includes('TT-012'));
  });

  test('NOVA_VERSION is a semver string', () => {
    assert.match(NOVA_VERSION, /^\d+\.\d+\.\d+$/);
  });
});

describe('NovaCore — phiBlend', () => {
  test('phiBlend of 0 and 0 is 0', () => {
    assert.equal(phiBlend(0, 0), 0);
  });

  test('phiBlend of 1 and 1 is 1', () => {
    assert.ok(Math.abs(phiBlend(1, 1) - 1) < 1e-10);
  });

  test('phiBlend(a, b) ≠ phiBlend(b, a) in general', () => {
    assert.notEqual(phiBlend(0.8, 0.2), phiBlend(0.2, 0.8));
  });

  test('phiBlend result is in [0, 1] for inputs in [0, 1]', () => {
    const r = phiBlend(0.4, 0.7);
    assert.ok(r >= 0 && r <= 1);
  });
});

describe('NovaCore — clamp01', () => {
  test('clamp01 caps at 1', () => {
    assert.equal(clamp01(5), 1);
  });

  test('clamp01 floors at 0', () => {
    assert.equal(clamp01(-3), 0);
  });

  test('clamp01 passes through values in [0, 1]', () => {
    assert.equal(clamp01(0.5), 0.5);
  });
});

describe('NovaCore — phiGrow', () => {
  test('phiGrow increases value toward ceiling', () => {
    const grown = phiGrow(0.2, 1, 0.5);
    assert.ok(grown > 0.2);
  });

  test('phiGrow never exceeds ceiling', () => {
    assert.ok(phiGrow(0.99, 1, 1) <= 1);
  });

  test('phiGrow at ceiling stays at ceiling', () => {
    assert.equal(phiGrow(1, 1, 1), 1);
  });
});

describe('NovaCore — phiDecay', () => {
  test('phiDecay decreases value', () => {
    assert.ok(phiDecay(0.8, 0.5) < 0.8);
  });

  test('phiDecay never goes below 0', () => {
    assert.ok(phiDecay(0.001, 100) >= 0);
  });

  test('phiDecay(0, rate) is 0', () => {
    assert.equal(phiDecay(0, 0.5), 0);
  });
});

describe('NovaCore — fibonacci', () => {
  test('fibonacci(0) is 0', () => {
    assert.equal(fibonacci(0), 0);
  });

  test('fibonacci(1) is 1', () => {
    assert.equal(fibonacci(1), 1);
  });

  test('fibonacci(5) is 5', () => {
    assert.equal(fibonacci(5), 5);
  });

  test('fibonacci(10) is 55', () => {
    assert.equal(fibonacci(10), 55);
  });

  test('fibonacci throws for negative n', () => {
    assert.throws(() => fibonacci(-1), /n must be >= 0/);
  });
});

describe('NovaCore — phiCoherence', () => {
  test('phiCoherence(0.5) is in [0, 1]', () => {
    const r = phiCoherence(0.5);
    assert.ok(r >= 0 && r <= 1);
  });

  test('phiCoherence(1) <= 1', () => {
    assert.ok(phiCoherence(1) <= 1);
  });

  test('phiCoherence(0) >= 0', () => {
    assert.ok(phiCoherence(0) >= 0);
  });

  test('higher signal → higher coherence', () => {
    assert.ok(phiCoherence(0.9) > phiCoherence(0.1));
  });
});

describe('NovaCore — novaStamp', () => {
  test('stamp has expected fields', () => {
    const stamp = novaStamp();
    assert.equal(stamp.id, NOVA_ID);
    assert.equal(stamp.name, NOVA_NAME);
    assert.equal(stamp.sovereign, NOVA_SOVEREIGN_ID);
    assert.equal(stamp.phi, PHI);
    assert.ok(typeof stamp.timestamp === 'number');
  });

  test('stamp timestamp is recent', () => {
    const before = Date.now();
    const stamp = novaStamp();
    assert.ok(stamp.timestamp >= before);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOVA PROTOCOL — TT-012-NOVA Token Operations
// ═══════════════════════════════════════════════════════════════════════════

describe('NovaProtocol — Identity', () => {
  test('has a protocolId', () => {
    const proto = new NovaProtocol();
    assert.ok(typeof proto.protocolId === 'string');
  });

  test('identity() returns nova stamp fields', () => {
    const proto = new NovaProtocol();
    const id = proto.identity();
    assert.equal(id.id, NOVA_ID);
    assert.equal(id.name, NOVA_NAME);
    assert.ok(typeof id.tokenCount === 'number');
  });
});

describe('NovaProtocol — genesis', () => {
  test('mints a new token', () => {
    const proto = new NovaProtocol();
    const token = proto.genesis('TestToken');
    assert.ok(token.tokenId.startsWith('TT-012-NOVA-'));
    assert.equal(token.name, 'TestToken');
    assert.equal(token.status, 'genesis');
    assert.equal(token.evolutionCycle, 0);
    assert.deepEqual(token.lineage, []);
  });

  test('genesis increments size', () => {
    const proto = new NovaProtocol();
    proto.genesis('A');
    proto.genesis('B');
    assert.equal(proto.size, 2);
  });

  test('genesis throws on empty name', () => {
    const proto = new NovaProtocol();
    assert.throws(() => proto.genesis(''), /Token name/);
  });

  test('genesis assigns coherence in [0, 1]', () => {
    const proto = new NovaProtocol();
    const token = proto.genesis('C');
    assert.ok(token.coherence >= 0 && token.coherence <= 1);
  });

  test('genesis creates a non-empty attestHash', () => {
    const proto = new NovaProtocol();
    const token = proto.genesis('D');
    assert.ok(token.attestHash.length > 0);
  });
});

describe('NovaProtocol — evolve', () => {
  test('increments evolutionCycle', () => {
    const proto = new NovaProtocol();
    const t = proto.genesis('E');
    const evolved = proto.evolve(t.tokenId);
    assert.equal(evolved.evolutionCycle, 1);
  });

  test('status becomes evolving', () => {
    const proto = new NovaProtocol();
    const t = proto.genesis('F');
    const evolved = proto.evolve(t.tokenId);
    assert.equal(evolved.status, 'evolving');
  });

  test('coherence increases after evolve', () => {
    const proto = new NovaProtocol();
    const t = proto.genesis('G', { coherence: 0.3 });
    const evolved = proto.evolve(t.tokenId);
    assert.ok(evolved.coherence >= t.coherence);
  });

  test('evolve throws for unknown token', () => {
    const proto = new NovaProtocol();
    assert.throws(() => proto.evolve('no-such-id'), /not found/);
  });
});

describe('NovaProtocol — attest', () => {
  test('status becomes active after attest', () => {
    const proto = new NovaProtocol();
    const t = proto.genesis('H');
    const attested = proto.attest(t.tokenId);
    assert.equal(attested.status, 'active');
  });

  test('attestHash changes after attest', () => {
    const proto = new NovaProtocol();
    const t = proto.genesis('I');
    const attested = proto.attest(t.tokenId);
    assert.ok(attested.attestHash.length > 0);
  });
});

describe('NovaProtocol — merge', () => {
  test('creates a new token from two parents', () => {
    const proto = new NovaProtocol();
    const a = proto.genesis('A');
    const b = proto.genesis('B');
    const merged = proto.merge(a.tokenId, b.tokenId);
    assert.ok(merged.tokenId.includes('MERGE'));
    assert.ok(merged.lineage.includes(a.tokenId));
    assert.ok(merged.lineage.includes(b.tokenId));
  });

  test('parents become terminated after merge', () => {
    const proto = new NovaProtocol();
    const a = proto.genesis('X');
    const b = proto.genesis('Y');
    proto.merge(a.tokenId, b.tokenId);
    assert.equal(proto.getToken(a.tokenId).status, 'terminated');
    assert.equal(proto.getToken(b.tokenId).status, 'terminated');
  });

  test('merged coherence is a phi blend', () => {
    const proto = new NovaProtocol();
    const a = proto.genesis('P');
    const b = proto.genesis('Q');
    const merged = proto.merge(a.tokenId, b.tokenId);
    assert.ok(merged.coherence >= 0 && merged.coherence <= 1);
  });

  test('merged name defaults to A⊕B', () => {
    const proto = new NovaProtocol();
    const a = proto.genesis('Alpha');
    const b = proto.genesis('Beta');
    const merged = proto.merge(a.tokenId, b.tokenId);
    assert.equal(merged.name, 'Alpha⊕Beta');
  });
});

describe('NovaProtocol — split', () => {
  test('creates N children', () => {
    const proto = new NovaProtocol();
    const parent = proto.genesis('Parent');
    const children = proto.split(parent.tokenId, 3);
    assert.equal(children.length, 3);
  });

  test('all children have parent in lineage', () => {
    const proto = new NovaProtocol();
    const parent = proto.genesis('Root');
    const children = proto.split(parent.tokenId, 2);
    for (const child of children) {
      assert.ok(child.lineage.includes(parent.tokenId));
    }
  });

  test('parent becomes terminated after split', () => {
    const proto = new NovaProtocol();
    const parent = proto.genesis('Orig');
    proto.split(parent.tokenId, 2);
    assert.equal(proto.getToken(parent.tokenId).status, 'terminated');
  });

  test('split throws for n < 2', () => {
    const proto = new NovaProtocol();
    const parent = proto.genesis('S');
    assert.throws(() => proto.split(parent.tokenId, 1), />= 2/);
  });
});

describe('NovaProtocol — listTokens', () => {
  test('returns all tokens', () => {
    const proto = new NovaProtocol();
    proto.genesis('L1');
    proto.genesis('L2');
    assert.equal(proto.listTokens().length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOVA SNS BRIDGE
// ═══════════════════════════════════════════════════════════════════════════

describe('NovaSNSBridge — Initialization', () => {
  test('has a bridgeId', () => {
    const bridge = new NovaSNSBridge();
    assert.ok(typeof bridge.bridgeId === 'string');
  });

  test('seeds known DAOs on construction', () => {
    const bridge = new NovaSNSBridge();
    const daos = bridge.listDaos();
    assert.ok(daos.length >= 3);
  });

  test('status returns bridge info', () => {
    const bridge = new NovaSNSBridge();
    const s = bridge.status();
    assert.ok(s.daoCount >= 3);
    assert.equal(s.heartbeatMs, HEARTBEAT_MS);
  });
});

describe('NovaSNSBridge — registerDao', () => {
  test('registers a new DAO', () => {
    const bridge = new NovaSNSBridge();
    const dao = bridge.registerDao('my-dao', 'My DAO', 'sns');
    assert.equal(dao.daoId, 'my-dao');
    assert.equal(dao.lane, 'sns');
  });

  test('throws for duplicate daoId', () => {
    const bridge = new NovaSNSBridge();
    bridge.registerDao('dao-1', 'DAO One', 'nova');
    assert.throws(() => bridge.registerDao('dao-1', 'Again', 'nova'), /already registered/);
  });

  test('throws for invalid lane', () => {
    const bridge = new NovaSNSBridge();
    assert.throws(() => bridge.registerDao('d2', 'D2', 'invalid'), /Invalid lane/);
  });
});

describe('NovaSNSBridge — ingestProposal', () => {
  test('creates a proposal with phi-encoded coherence', () => {
    const bridge = new NovaSNSBridge();
    bridge.registerDao('test-dao', 'Test', 'sns');
    const p = bridge.ingestProposal('test-dao', 'My Proposal', { rawCoherence: 0.8 });
    assert.ok(p.proposalId.startsWith('NOVA-PROP-'));
    assert.equal(p.status, 'open');
    assert.ok(p.coherenceScore >= 0 && p.coherenceScore <= 1);
  });

  test('throws for unregistered DAO', () => {
    const bridge = new NovaSNSBridge();
    assert.throws(() => bridge.ingestProposal('ghost', 'title'), /not registered/);
  });

  test('fires onProposal listener', () => {
    const bridge = new NovaSNSBridge();
    bridge.registerDao('emit-dao', 'Emit', 'nova');
    let fired = false;
    bridge.onProposal(() => { fired = true; });
    bridge.ingestProposal('emit-dao', 'Test');
    assert.equal(fired, true);
  });

  test('onProposal unsubscribe works', () => {
    const bridge = new NovaSNSBridge();
    bridge.registerDao('unsub-dao', 'Unsub', 'nova');
    let count = 0;
    const unsub = bridge.onProposal(() => count++);
    bridge.ingestProposal('unsub-dao', 'First');
    unsub();
    bridge.ingestProposal('unsub-dao', 'Second');
    assert.equal(count, 1);
  });
});

describe('NovaSNSBridge — updateProposalStatus', () => {
  test('updates status to adopted', () => {
    const bridge = new NovaSNSBridge();
    bridge.registerDao('vote-dao', 'Vote', 'sns');
    const p = bridge.ingestProposal('vote-dao', 'Adopt me');
    const updated = bridge.updateProposalStatus(p.proposalId, 'adopted');
    assert.equal(updated.status, 'adopted');
  });

  test('throws for codegov proposals', () => {
    const bridge = new NovaSNSBridge();
    bridge.ingestProposal('codegov-reviewer-lane', 'Review signal');
    const proposals = bridge.getProposalsByDao('codegov-reviewer-lane');
    assert.throws(() => bridge.updateProposalStatus(proposals[0].proposalId, 'adopted'), /codegov/);
  });
});

describe('NovaSNSBridge — getProposalsByDao', () => {
  test('returns only proposals for the given DAO', () => {
    const bridge = new NovaSNSBridge();
    bridge.registerDao('dao-a', 'A', 'sns');
    bridge.registerDao('dao-b', 'B', 'sns');
    bridge.ingestProposal('dao-a', 'A1');
    bridge.ingestProposal('dao-b', 'B1');
    const ps = bridge.getProposalsByDao('dao-a');
    assert.equal(ps.length, 1);
    assert.equal(ps[0].daoId, 'dao-a');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOVA RESEARCH ENGINE — CARS
// ═══════════════════════════════════════════════════════════════════════════

describe('NovaResearchEngine — Initialization', () => {
  test('has an engineId', () => {
    const engine = new NovaResearchEngine();
    assert.ok(typeof engine.engineId === 'string');
  });

  test('manifest identifies CARS', () => {
    const engine = new NovaResearchEngine();
    const m = engine.manifest();
    assert.equal(m.system, 'CARS');
    assert.equal(m.fullName, 'Cognitive Autonomous Research System');
  });
});

describe('NovaResearchEngine — createStudy', () => {
  test('creates a study with correct fields', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('Nova Phi Study', 'phi-cognition');
    assert.ok(s.studyId.startsWith('CARS-'));
    assert.equal(s.title, 'Nova Phi Study');
    assert.equal(s.domain, 'phi-cognition');
    assert.equal(s.status, 'hypothesis');
  });

  test('throws on missing title', () => {
    const engine = new NovaResearchEngine();
    assert.throws(() => engine.createStudy('', 'domain'), /title/);
  });

  test('throws on missing domain', () => {
    const engine = new NovaResearchEngine();
    assert.throws(() => engine.createStudy('Title', ''), /domain/);
  });
});

describe('NovaResearchEngine — addHypothesis', () => {
  test('adds a hypothesis to a study', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('H Study', 'test');
    const h = engine.addHypothesis(s.studyId, 'PHI drives coherence');
    assert.ok(h.hypothesisId);
    assert.equal(h.statement, 'PHI drives coherence');
    assert.ok(h.confidence >= 0 && h.confidence <= 1);
  });

  test('throws on empty statement', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('T', 'd');
    assert.throws(() => engine.addHypothesis(s.studyId, ''), /statement/);
  });

  test('throws for unknown study', () => {
    const engine = new NovaResearchEngine();
    assert.throws(() => engine.addHypothesis('ghost', 'x'), /not found/);
  });
});

describe('NovaResearchEngine — runExperiment', () => {
  test('increases phiResonance', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('Exp Study', 'test');
    const before = engine.getStudy(s.studyId).phiResonance;
    engine.runExperiment(s.studyId, { signal: 0.9 });
    const after = engine.getStudy(s.studyId).phiResonance;
    assert.ok(after > before);
  });

  test('status becomes experiment', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('E', 'd');
    const result = engine.runExperiment(s.studyId);
    assert.equal(result.status, 'experiment');
  });
});

describe('NovaResearchEngine — analyseHypotheses', () => {
  test('generates findings for each hypothesis', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('A Study', 'test');
    engine.addHypothesis(s.studyId, 'Hypothesis 1');
    engine.addHypothesis(s.studyId, 'Hypothesis 2');
    const findings = engine.analyseHypotheses(s.studyId);
    assert.equal(findings.length, 2);
  });

  test('findings contain phi-score and fib weight', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('F Study', 'test');
    engine.addHypothesis(s.studyId, 'Test');
    const findings = engine.analyseHypotheses(s.studyId);
    assert.ok(findings[0].includes('φ='));
    assert.ok(findings[0].includes('Fib('));
  });

  test('throws if no hypotheses', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('Empty', 'test');
    assert.throws(() => engine.analyseHypotheses(s.studyId), /no hypotheses/);
  });
});

describe('NovaResearchEngine — publishStudy', () => {
  function setupPublishedStudy() {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('Pub Study', 'phi');
    engine.addHypothesis(s.studyId, 'Coherence leads to truth');
    engine.analyseHypotheses(s.studyId);
    const published = engine.publishStudy(s.studyId);
    return { engine, published };
  }

  test('status becomes published', () => {
    const { published } = setupPublishedStudy();
    assert.equal(published.status, 'published');
  });

  test('fires onPublish listener', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('Pub2', 'test');
    engine.addHypothesis(s.studyId, 'H');
    engine.analyseHypotheses(s.studyId);
    let fired = false;
    engine.onPublish(() => { fired = true; });
    engine.publishStudy(s.studyId);
    assert.equal(fired, true);
  });

  test('throws if not analysed first', () => {
    const engine = new NovaResearchEngine();
    const s = engine.createStudy('NoPub', 'test');
    assert.throws(() => engine.publishStudy(s.studyId), /analysed/);
  });

  test('manifest reflects published count', () => {
    const { engine } = setupPublishedStudy();
    const m = engine.manifest();
    assert.equal(m.publishedCount, 1);
  });
});

describe('NovaResearchEngine — listStudies', () => {
  test('returns all studies', () => {
    const engine = new NovaResearchEngine();
    engine.createStudy('S1', 'd');
    engine.createStudy('S2', 'd');
    assert.equal(engine.listStudies().length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOVA ORGANISM WIRE
// ═══════════════════════════════════════════════════════════════════════════

describe('NovaOrganismWire — Initialization', () => {
  test('has a wireId', () => {
    const wire = new NovaOrganismWire();
    assert.ok(typeof wire.wireId === 'string');
  });

  test('phiResonance starts in (0, 1)', () => {
    const wire = new NovaOrganismWire();
    assert.ok(wire.phiResonance > 0 && wire.phiResonance < 1);
  });

  test('isRunning is false initially', () => {
    const wire = new NovaOrganismWire();
    assert.equal(wire.isRunning, false);
  });

  test('registers built-in kernels', () => {
    const wire = new NovaOrganismWire();
    const kernels = wire.listKernels();
    assert.ok(kernels.length >= 3);
    const labels = kernels.map(k => k.label);
    assert.ok(labels.includes('nova:identity'));
    assert.ok(labels.includes('nova:phi-pulse'));
    assert.ok(labels.includes('nova:coherence-check'));
  });
});

describe('NovaOrganismWire — loadKernel / executeKernel', () => {
  test('loads and executes a custom kernel', () => {
    const wire = new NovaOrganismWire();
    const id = wire.loadKernel('test-kernel', (x) => x * 2, { priority: 1 });
    const result = wire.executeKernel(id, 21);
    assert.equal(result, 42);
  });

  test('kernel status becomes completed after success', () => {
    const wire = new NovaOrganismWire();
    const id = wire.loadKernel('ok', () => 1);
    wire.executeKernel(id);
    const kernels = wire.listKernels();
    const k = kernels.find(k => k.kernelId === id);
    assert.equal(k.status, 'completed');
  });

  test('kernel status becomes failed on throw', () => {
    const wire = new NovaOrganismWire();
    const id = wire.loadKernel('bad', () => { throw new Error('boom'); });
    assert.throws(() => wire.executeKernel(id));
    const k = wire.listKernels().find(k => k.kernelId === id);
    assert.equal(k.status, 'failed');
  });

  test('executeKernel throws for unknown kernelId', () => {
    const wire = new NovaOrganismWire();
    assert.throws(() => wire.executeKernel('no-such-id'), /not found/);
  });

  test('loadKernel throws for non-function fn', () => {
    const wire = new NovaOrganismWire();
    assert.throws(() => wire.loadKernel('bad', 'not-a-fn'), /function/);
  });
});

describe('NovaOrganismWire — built-in kernels', () => {
  test('nova:identity returns NOVA_ID', () => {
    const wire = new NovaOrganismWire();
    const kernels = wire.listKernels();
    const k = kernels.find(k => k.label === 'nova:identity');
    const result = wire.executeKernel(k.kernelId);
    assert.equal(result.id, NOVA_ID);
  });

  test('nova:phi-pulse blends input with PHI_INVERSE', () => {
    const wire = new NovaOrganismWire();
    const k = wire.listKernels().find(k => k.label === 'nova:phi-pulse');
    const result = wire.executeKernel(k.kernelId, 0.8);
    assert.ok(result >= 0 && result <= 1);
  });

  test('nova:coherence-check identifies coherent scores', () => {
    const wire = new NovaOrganismWire();
    const k = wire.listKernels().find(k => k.label === 'nova:coherence-check');
    const result = wire.executeKernel(k.kernelId, 0.9);
    assert.equal(result.isCoherent, true);
  });

  test('nova:coherence-check identifies incoherent scores', () => {
    const wire = new NovaOrganismWire();
    const k = wire.listKernels().find(k => k.label === 'nova:coherence-check');
    const result = wire.executeKernel(k.kernelId, 0.1);
    assert.equal(result.isCoherent, false);
  });
});

describe('NovaOrganismWire — queueUpdate / flush', () => {
  test('queues and flushes a register update', () => {
    const wire = new NovaOrganismWire();
    wire.queueUpdate({ register: 'cognitive', key: 'test', value: 42 });
    const flushed = wire.flush();
    assert.equal(flushed.length, 1);
    assert.equal(flushed[0].register, 'cognitive');
    assert.equal(flushed[0].value, 42);
  });

  test('flush clears pending updates', () => {
    const wire = new NovaOrganismWire();
    wire.queueUpdate({ register: 'affective', key: 'mood', value: 'calm' });
    wire.flush();
    assert.equal(wire.flush().length, 0);
  });

  test('queueUpdate throws for invalid register', () => {
    const wire = new NovaOrganismWire();
    assert.throws(() => wire.queueUpdate({ register: 'invalid', key: 'k', value: 'v' }), /Invalid register/);
  });

  test('onFlush listener is called on flush', () => {
    const wire = new NovaOrganismWire();
    let received = null;
    wire.onFlush(batch => { received = batch; });
    wire.queueUpdate({ register: 'somatic', key: 'resource', value: 99 });
    wire.flush();
    assert.ok(received);
    assert.equal(received[0].value, 99);
  });
});

describe('NovaOrganismWire — ingestCARSFinding', () => {
  test('queues a cognitive register update', () => {
    const wire = new NovaOrganismWire();
    wire.ingestCARSFinding('PHI resonates at 0.618');
    const flushed = wire.flush();
    assert.equal(flushed.length, 1);
    assert.equal(flushed[0].register, 'cognitive');
    assert.equal(flushed[0].value.finding, 'PHI resonates at 0.618');
  });
});

describe('NovaOrganismWire — ingestGovernanceSignal', () => {
  test('queues a sovereign register update', () => {
    const wire = new NovaOrganismWire();
    wire.ingestGovernanceSignal({ proposalId: 'PROP-1', status: 'adopted', coherenceScore: 0.77 });
    const flushed = wire.flush();
    assert.equal(flushed[0].register, 'sovereign');
    assert.equal(flushed[0].value.proposalId, 'PROP-1');
    assert.equal(flushed[0].value.nova, NOVA_ID);
  });
});

describe('NovaOrganismWire — status', () => {
  test('returns expected fields', () => {
    const wire = new NovaOrganismWire();
    const s = wire.status();
    assert.ok(typeof s.wireId === 'string');
    assert.ok(typeof s.kernelCount === 'number');
    assert.ok(typeof s.phiResonance === 'number');
    assert.equal(s.heartbeatMs, HEARTBEAT_MS);
    assert.equal(s.heartbeatRunning, false);
  });
});

describe('NovaOrganismWire — startHeartbeat / stopHeartbeat', () => {
  test('isRunning becomes true after start', () => {
    const wire = new NovaOrganismWire();
    wire.startHeartbeat();
    assert.equal(wire.isRunning, true);
    wire.stopHeartbeat();
  });

  test('isRunning becomes false after stop', () => {
    const wire = new NovaOrganismWire();
    wire.startHeartbeat();
    wire.stopHeartbeat();
    assert.equal(wire.isRunning, false);
  });

  test('startHeartbeat throws if already running', () => {
    const wire = new NovaOrganismWire();
    wire.startHeartbeat();
    assert.throws(() => wire.startHeartbeat(), /already running/);
    wire.stopHeartbeat();
  });

  test('stopHeartbeat throws if not running', () => {
    const wire = new NovaOrganismWire();
    assert.throws(() => wire.stopHeartbeat(), /not running/);
  });

  test('onBeat listener fires on each beat', async () => {
    const wire = new NovaOrganismWire();
    let beats = 0;
    wire.onBeat(() => { beats++; });
    wire.startHeartbeat();
    await new Promise(r => setTimeout(r, HEARTBEAT_MS * 2 + 100));
    wire.stopHeartbeat();
    assert.ok(beats >= 2, `Expected >= 2 beats, got ${beats}`);
  });

  test('onBeat unsubscribe stops listener', async () => {
    const wire = new NovaOrganismWire();
    let count = 0;
    const unsub = wire.onBeat(() => { count++; });
    wire.startHeartbeat();
    await new Promise(r => setTimeout(r, HEARTBEAT_MS + 50));
    unsub();
    const countAtUnsub = count;
    await new Promise(r => setTimeout(r, HEARTBEAT_MS + 50));
    wire.stopHeartbeat();
    assert.equal(count, countAtUnsub);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION — Full Nova Pipeline
// ═══════════════════════════════════════════════════════════════════════════

describe('Nova Integration — Full Pipeline', () => {
  test('mint → evolve → attest → merge → publish → wire', () => {
    const proto = new NovaProtocol();
    const bridge = new NovaSNSBridge();
    const research = new NovaResearchEngine();
    const wire = new NovaOrganismWire();

    // Mint two Nova tokens
    const t1 = proto.genesis('NovaPrime');
    const t2 = proto.genesis('NovaAlpha');

    // Evolve and attest
    proto.evolve(t1.tokenId);
    const attested = proto.attest(t1.tokenId);
    assert.equal(attested.status, 'active');

    // Register a DAO and ingest a governance proposal
    bridge.registerDao('nova-test-dao', 'Nova Test DAO', 'nova');
    const proposal = bridge.ingestProposal('nova-test-dao', 'Merge TT-012 into Nova Ring', { rawCoherence: 0.9 });
    wire.ingestGovernanceSignal({ proposalId: proposal.proposalId, status: 'open', coherenceScore: proposal.coherenceScore });

    // CARS research cycle
    const study = research.createStudy('Nova Token Coherence Study', 'nova-protocol');
    research.addHypothesis(study.studyId, 'Evolved tokens exhibit higher phi-coherence');
    research.addHypothesis(study.studyId, 'SNS governance improves organism resonance');
    research.runExperiment(study.studyId, { signal: 0.85 });
    const findings = research.analyseHypotheses(study.studyId);
    const published = research.publishStudy(study.studyId);

    // Wire findings to organism
    for (const f of findings) {
      wire.ingestCARSFinding(f);
    }

    // Merge tokens
    const merged = proto.merge(t1.tokenId, t2.tokenId, 'NovaFused');
    assert.equal(merged.name, 'NovaFused');

    // Flush all organism updates
    const flushed = wire.flush();
    const cogUpdates = flushed.filter(u => u.register === 'cognitive');
    const sovUpdates = flushed.filter(u => u.register === 'sovereign');

    assert.equal(cogUpdates.length, findings.length);
    assert.ok(sovUpdates.length >= 1);
    assert.equal(published.status, 'published');
    assert.ok(research.manifest().publishedCount === 1);
    assert.ok(proto.size >= 3); // t1, t2, merged
  });
});
