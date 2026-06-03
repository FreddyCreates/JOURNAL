/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  NOVA SCRIBE ORCHESTRATOR — Modular Nova Framework                                      ║
 * ║  "Magister Scriptorum — The Master of Scribes"                                           ║
 * ║                                                                                           ║
 * ║  Assembles and coordinates all autonomous scribes on the Nova organism heartbeat:        ║
 * ║    LogicScribe    — first logic evaluations                                              ║
 * ║    MathScribe     — arithmetic, modular, floor/ceil operations                          ║
 * ║    GeometryScribe — Euclidean constructions and phi-forms                                ║
 * ║    LanguageScribe — lexeme, token, symbol, pattern analysis                             ║
 * ║    RuntimeScribe  — execution profiling and O-complexity classification                 ║
 * ║                                                                                           ║
 * ║  On each heartbeat cycle the orchestrator:                                               ║
 * ║    1. Runs a primitive logic proof chain                                                 ║
 * ║    2. Computes a modular math expression                                                 ║
 * ║    3. Constructs a phi-form (spiral or golden rectangle)                                ║
 * ║    4. Tokenizes its own cycle report string                                              ║
 * ║    5. Profiles its own cycle execution time                                              ║
 * ║    6. Flushes all scribe manifests into the organism sovereign register                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'node:crypto';
import { PHI, PHI_INVERSE, NOVA_ID, NOVA_SOVEREIGN_ID, HEARTBEAT_MS, phiBlend, phiGrow, phiCoherence, novaStamp } from '../nova-core.js';

import { LogicScribe, AND, OR, NOT, XOR, IMPLIES, IFF, NAND, NOR, ALL, ANY, MAJORITY, ProofChain } from './logic-scribe.js';
import { MathScribe, O, mod, floorDiv, floorMod, gcd, lcm, modPow, sieveOfEratosthenes } from './math-scribe.js';
import { GeometryScribe, phiSpiral, goldenRectangle, vesicaPiscis, fibonacciArcs } from './geometry-scribe.js';
import { LanguageScribe, tokenize, filterNoise } from './language-scribe.js';
import { RuntimeScribe, classifyComplexity, measure } from './runtime-scribe.js';

// ================================================================== //
// ORCHESTRATOR                                                        //
// ================================================================== //

/**
 * @typedef {Object} OrchestratorCycleReport
 * @property {number} cycleNumber
 * @property {string} cycleId
 * @property {number} timestamp
 * @property {number} executionUs
 * @property {number} phiCoherence   - Global phi coherence across all scribes
 * @property {{ logic: Object, math: Object, geometry: Object, language: Object, runtime: Object }} scribes
 */

/**
 * NovaScribeOrchestrator — master coordinator of all autonomous scribes.
 *
 * Runs autonomous scribe cycles on each Nova heartbeat, coordinates
 * cross-scribe data flow, and surfaces unified manifests to the organism
 * sovereign register via queuedUpdates that can be consumed by NovaOrganismWire.
 */
export class NovaScribeOrchestrator {
  /** @type {string} */
  #orchestratorId;

  /** @type {LogicScribe} */
  #logic;

  /** @type {MathScribe} */
  #math;

  /** @type {GeometryScribe} */
  #geometry;

  /** @type {LanguageScribe} */
  #language;

  /** @type {RuntimeScribe} */
  #runtime;

  /** @type {number} */
  #cycleNumber;

  /** @type {Array<OrchestratorCycleReport>} */
  #cycleHistory;

  /** @type {Array<function>} */
  #cycleListeners;

  /** @type {number|null} */
  #intervalId;

  /** @type {number} */
  #globalCoherence;

  constructor() {
    this.#orchestratorId = `ORCH-${crypto.randomUUID()}`;
    this.#logic    = new LogicScribe('Orchestrator:LogicScribe');
    this.#math     = new MathScribe('Orchestrator:MathScribe');
    this.#geometry = new GeometryScribe('Orchestrator:GeometryScribe');
    this.#language = new LanguageScribe('Orchestrator:LanguageScribe');
    this.#runtime  = new RuntimeScribe('Orchestrator:RuntimeScribe');
    this.#cycleNumber = 0;
    this.#cycleHistory = [];
    this.#cycleListeners = [];
    this.#intervalId = null;
    this.#globalCoherence = PHI_INVERSE;
  }

  // ------------------------------------------------------------------ //
  // Accessors                                                           //
  // ------------------------------------------------------------------ //

  get orchestratorId()   { return this.#orchestratorId; }
  get cycleNumber()      { return this.#cycleNumber; }
  get globalCoherence()  { return this.#globalCoherence; }
  get isRunning()        { return this.#intervalId !== null; }
  get logic()            { return this.#logic; }
  get math()             { return this.#math; }
  get geometry()         { return this.#geometry; }
  get language()         { return this.#language; }
  get runtime()          { return this.#runtime; }

  // ------------------------------------------------------------------ //
  // Heartbeat lifecycle                                                  //
  // ------------------------------------------------------------------ //

  /**
   * Start the autonomous scribe cycle on the 873ms Nova heartbeat.
   * @throws {Error} if already running
   */
  startHeartbeat() {
    if (this.#intervalId !== null) throw new Error('Orchestrator heartbeat is already running');
    this.#intervalId = setInterval(() => this.tick(), HEARTBEAT_MS);
  }

  /**
   * Stop the autonomous scribe cycle.
   * @throws {Error} if not running
   */
  stopHeartbeat() {
    if (this.#intervalId === null) throw new Error('Orchestrator heartbeat is not running');
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  /**
   * Register a listener called after each autonomous cycle completes.
   * @param {function} fn  Receives OrchestratorCycleReport
   * @returns {function}  Unsubscribe function
   */
  onCycle(fn) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    this.#cycleListeners.push(fn);
    return () => { this.#cycleListeners = this.#cycleListeners.filter(l => l !== fn); };
  }

  // ------------------------------------------------------------------ //
  // Manual tick (also called by the heartbeat interval)                //
  // ------------------------------------------------------------------ //

  /**
   * Execute one full autonomous scribe cycle manually.
   * @returns {OrchestratorCycleReport}
   */
  tick() {
    this.#cycleNumber++;
    const cycleId = `CYCLE-${this.#cycleNumber}-${crypto.randomUUID().slice(0, 8)}`;
    const t0 = performance.now();

    // 1. LOGIC — Run a proof chain using all primitive connectives
    this.#runLogicCycle();

    // 2. MATH — Modular arithmetic + floor/ceil operations
    this.#runMathCycle();

    // 3. GEOMETRY — Phi-form construction (alternates spiral / rect / vesica)
    this.#runGeometryCycle();

    // 4. LANGUAGE — Tokenize the cycle identity string
    this.#runLanguageCycle(cycleId);

    // 5. RUNTIME — Profile this tick's own execution (meta-timing)
    const executionUs = (performance.now() - t0) * 1000;
    this.#runtime.measure(`cycle-${this.#cycleNumber}`, () => executionUs, O.LINEAR);

    // 6. Aggregate global coherence across all scribes
    this.#globalCoherence = this.#aggregateCoherence();

    /** @type {OrchestratorCycleReport} */
    const report = {
      cycleNumber: this.#cycleNumber,
      cycleId,
      timestamp: Date.now(),
      executionUs,
      phiCoherence: this.#globalCoherence,
      scribes: {
        logic:    this.#logic.manifest(),
        math:     this.#math.manifest(),
        geometry: this.#geometry.manifest(),
        language: this.#language.manifest(),
        runtime:  this.#runtime.manifest(),
      },
    };

    this.#cycleHistory.push(report);
    this.#notifyCycle(report);
    return report;
  }

  // ------------------------------------------------------------------ //
  // Individual scribe cycle routines                                    //
  // ------------------------------------------------------------------ //

  /** Run one logic evaluation cycle. */
  #runLogicCycle() {
    const cycle = this.#cycleNumber;

    // Alternate between truth-table evaluation and proof chain
    if (cycle % 3 === 1) {
      // Truth table for IMPLIES
      this.#logic.scribeTruthTable('IMPLIES', IMPLIES);
    } else if (cycle % 3 === 2) {
      // Proof chain: derive IFF from primitives
      const chain = ProofChain(`cycle-${cycle}-iff-derivation`);
      const a = (cycle % 2 === 0);
      const b = (cycle % 3 !== 0);
      chain.step('NOT-A',   NOT,     a);
      chain.step('OR',      OR,      chain.conclude(), b);
      chain.step('NOT-B',   NOT,     b);
      chain.step('OR-rev',  OR,      a, chain.conclude());
      chain.step('IFF',     AND,     chain.conclude(), chain.conclude());
      this.#logic.inscribeProof(chain.toScroll());
    } else {
      // Quantifier evaluation: ALL / ANY / MAJORITY
      const props = [cycle % 2 === 0, cycle % 3 === 0, cycle % 5 === 0, cycle % 7 === 0];
      this.#logic.eval('ALL',      ALL,      props);
      this.#logic.eval('ANY',      ANY,      props);
      this.#logic.eval('MAJORITY', MAJORITY, props);
    }
  }

  /** Run one math computation cycle. */
  #runMathCycle() {
    const n = this.#cycleNumber;
    const m = 97;  // prime modulus

    this.#math.mod(n * 3 + 7, m);
    this.#math.floorDiv(n * PHI | 0, 3);
    this.#math.floorMod(n * 11, 7);
    this.#math.gcd(n * 6 + 1, n * 4 + 3);
    this.#math.modPow(2, n, m);
    this.#math.phiFloor(n * PHI);
    this.#math.phiCeil(n * PHI);

    // Every 5th cycle, run a prime sieve
    if (n % 5 === 0) {
      this.#math.sieve(n * 10 + 50);
    }
  }

  /** Run one geometry construction cycle. */
  #runGeometryCycle() {
    const n = this.#cycleNumber;
    const mode = n % 3;

    if (mode === 0) {
      // Phi spiral with n+3 points
      this.#geometry.phiSpiral(n + 3);
    } else if (mode === 1) {
      // Golden rectangle with short side = cycle number
      this.#geometry.goldenRectangle({ x: 0, y: 0 }, n);
    } else {
      // Vesica piscis
      this.#geometry.vesicaPiscis(n + 1);
      // + Fibonacci arcs
      this.#geometry.fibonacciArcs(Math.min(n + 2, 10));
    }

    // Always record a distance measurement (Nova spiral radius progression)
    const pt1 = { x: 0, y: 0 };
    const pt2 = { x: n * PHI_INVERSE, y: n * (1 - PHI_INVERSE) };
    this.#geometry.distance(pt1, pt2);
  }

  /** Run one language analysis cycle. */
  #runLanguageCycle(cycleId) {
    // Tokenize a self-describing cycle report string
    const source = `nova cycle ${this.#cycleNumber} id = "${cycleId}" phi = ${PHI} sovereign`;
    this.#language.tokenize(source);

    // Declare the cycle in the symbol table (if not already declared)
    if (!this.#language.symbolTable.resolve(`cycle_${this.#cycleNumber}`)) {
      this.#language.declareSymbol(`cycle_${this.#cycleNumber}`, this.#cycleNumber, 'number');
    }

    // Scan for language patterns in a sample governance expression
    const govExpr = `let result = modPow(2 , ${this.#cycleNumber}, 97)`;
    this.#language.scanPatterns(govExpr);
  }

  /** Aggregate phi-coherence across all scribes using phi-blend chain. */
  #aggregateCoherence() {
    const scores = [
      this.#logic.coherence,
      this.#math.coherence,
      this.#geometry.coherence,
      this.#language.coherence,
      this.#runtime.coherence,
    ];
    return scores.reduce((acc, s) => phiBlend(acc, s), PHI_INVERSE);
  }

  /**
   * Notify all cycle listeners.
   * @param {OrchestratorCycleReport} report
   */
  #notifyCycle(report) {
    for (const fn of this.#cycleListeners) {
      try { fn({ ...report }); } catch { /* non-fatal */ }
    }
  }

  // ------------------------------------------------------------------ //
  // Public API                                                          //
  // ------------------------------------------------------------------ //

  /**
   * Return the last N cycle reports.
   * @param {number} [n=10]
   * @returns {OrchestratorCycleReport[]}
   */
  recentCycles(n = 10) {
    return this.#cycleHistory.slice(-n).map(r => ({ ...r }));
  }

  /**
   * Combined manifest from all scribes + orchestrator identity.
   * @returns {Object}
   */
  manifest() {
    return {
      orchestratorId: this.#orchestratorId,
      identity: NOVA_ID,
      sovereign: NOVA_SOVEREIGN_ID,
      cycleNumber: this.#cycleNumber,
      isRunning: this.isRunning,
      globalCoherence: this.#globalCoherence,
      heartbeatMs: HEARTBEAT_MS,
      scribes: {
        logic:    this.#logic.manifest(),
        math:     this.#math.manifest(),
        geometry: this.#geometry.manifest(),
        language: this.#language.manifest(),
        runtime:  this.#runtime.manifest(),
      },
    };
  }

  /**
   * Format the orchestrator state as organism register updates for NovaOrganismWire.
   * Returns an array of { register, key, value } objects.
   * @returns {Array<{ register: string, key: string, value: unknown }>}
   */
  toOrganismUpdates() {
    const m = this.manifest();
    return [
      { register: 'cognitive',  key: 'nova:scribe:logic',    value: m.scribes.logic },
      { register: 'cognitive',  key: 'nova:scribe:language', value: m.scribes.language },
      { register: 'somatic',    key: 'nova:scribe:math',     value: m.scribes.math },
      { register: 'somatic',    key: 'nova:scribe:geometry', value: m.scribes.geometry },
      { register: 'somatic',    key: 'nova:scribe:runtime',  value: m.scribes.runtime },
      { register: 'sovereign',  key: 'nova:scribe:manifest', value: { orchestratorId: m.orchestratorId, globalCoherence: m.globalCoherence, cycleNumber: m.cycleNumber } },
    ];
  }
}
