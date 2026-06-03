import crypto from 'node:crypto';
import { PHI, PHI_INVERSE, PHI_SQUARED, NOVA_SOVEREIGN_ID, phiBlend, phiGrow, phiDecay, fibonacci } from './nova-core.js';

// ================================================================== //
// CARS — COGNITIVE AUTONOMOUS RESEARCH SYSTEM                         //
// ================================================================== //

/**
 * @typedef {'hypothesis' | 'experiment' | 'analysis' | 'finding' | 'published'} StudyStatus
 */

/**
 * @typedef {Object} ResearchHypothesis
 * @property {string} hypothesisId
 * @property {string} statement
 * @property {number} confidence      - [0, 1] phi-weighted confidence score
 * @property {number} createdAt
 */

/**
 * @typedef {Object} ResearchStudy
 * @property {string} studyId
 * @property {string} title
 * @property {string} domain
 * @property {StudyStatus} status
 * @property {ResearchHypothesis[]} hypotheses
 * @property {string[]} findings
 * @property {number} phiResonance    - Accumulated phi-coherence across all experiments
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} CARSManifest
 * @property {string} system         - Always "CARS"
 * @property {string} fullName       - "Cognitive Autonomous Research System"
 * @property {string} sovereign
 * @property {number} studyCount
 * @property {number} publishedCount
 * @property {number} totalFindings
 * @property {number} phiIndex       - Average phi-resonance across all studies
 * @property {number} timestamp
 */

/**
 * NovaResearchEngine — the CARS (Cognitive Autonomous Research System) module.
 *
 * CARS manages autonomous research cycles within the Nova framework:
 *   1. Define a study domain and register hypotheses
 *   2. Run experiments that accumulate phi-weighted coherence scores
 *   3. Synthesize findings using Fibonacci-weighted analysis
 *   4. Publish results to the organism knowledge substrate
 *
 * Phi-encoding ensures that well-resonant research propagates forward
 * while low-coherence studies decay toward dormancy.
 */
export class NovaResearchEngine {
  /** @type {Map<string, ResearchStudy>} */
  #studies;

  /** @type {string} */
  #engineId;

  /** @type {Array<function>} */
  #publishListeners;

  constructor() {
    this.#engineId = crypto.randomUUID();
    this.#studies = new Map();
    this.#publishListeners = [];
  }

  /**
   * Engine identifier.
   * @returns {string}
   */
  get engineId() {
    return this.#engineId;
  }

  /**
   * Register a listener called whenever a study is published.
   * @param {function} fn  Receives ResearchStudy
   * @returns {function}  Unsubscribe
   */
  onPublish(fn) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    this.#publishListeners.push(fn);
    return () => { this.#publishListeners = this.#publishListeners.filter(l => l !== fn); };
  }

  /**
   * Create a new research study.
   * @param {string} title
   * @param {string} domain  Research domain (e.g., "phi-cognition", "sns-governance")
   * @returns {ResearchStudy}
   */
  createStudy(title, domain) {
    if (!title) throw new TypeError('Study title is required');
    if (!domain) throw new TypeError('Study domain is required');
    const studyId = `CARS-${crypto.randomUUID()}`;
    const now = Date.now();
    const study = {
      studyId,
      title,
      domain,
      status: 'hypothesis',
      hypotheses: [],
      findings: [],
      phiResonance: PHI_INVERSE,
      createdAt: now,
      updatedAt: now,
    };
    this.#studies.set(studyId, study);
    return { ...study, hypotheses: [], findings: [] };
  }

  /**
   * Add a hypothesis to a study.
   * @param {string} studyId
   * @param {string} statement
   * @param {{ confidence?: number }} [opts]
   * @returns {ResearchHypothesis}
   */
  addHypothesis(studyId, statement, opts = {}) {
    const study = this.#requireStudy(studyId);
    if (!statement) throw new TypeError('Hypothesis statement is required');
    const confidence = phiBlend(opts.confidence ?? 0.5, PHI_INVERSE);
    const hypothesis = {
      hypothesisId: crypto.randomUUID(),
      statement,
      confidence,
      createdAt: Date.now(),
    };
    study.hypotheses.push(hypothesis);
    study.updatedAt = Date.now();
    return { ...hypothesis };
  }

  /**
   * Run an experiment on a study.
   * Each experiment accumulates phi-weighted coherence toward the study's phi-resonance.
   * @param {string} studyId
   * @param {{ signal?: number }} [opts]  signal in [0, 1] representing experiment quality
   * @returns {{ studyId: string, phiResonance: number, status: StudyStatus }}
   */
  runExperiment(studyId, opts = {}) {
    const study = this.#requireStudy(studyId);
    const signal = Math.min(1, Math.max(0, opts.signal ?? 0.5));
    study.phiResonance = phiGrow(study.phiResonance, 1, signal);
    study.status = 'experiment';
    study.updatedAt = Date.now();
    return { studyId, phiResonance: study.phiResonance, status: study.status };
  }

  /**
   * Analyse hypotheses and generate findings using Fibonacci-weighted synthesis.
   * @param {string} studyId
   * @returns {string[]}  Generated finding statements
   */
  analyseHypotheses(studyId) {
    const study = this.#requireStudy(studyId);
    if (study.hypotheses.length === 0) {
      throw new Error('Cannot analyse a study with no hypotheses');
    }
    study.status = 'analysis';
    const findings = study.hypotheses.map((h, i) => {
      const fibWeight = fibonacci(i + 1);
      const phiWeight = study.phiResonance * PHI_INVERSE;
      const score = phiBlend(h.confidence, phiWeight) * fibWeight;
      return `[φ=${score.toFixed(4)}] ${h.statement} — resonance confirmed at Fib(${i + 1})=${fibWeight}`;
    });
    study.findings = findings;
    study.status = 'finding';
    study.updatedAt = Date.now();
    return [...findings];
  }

  /**
   * Publish a study, making its findings available to the organism.
   * @param {string} studyId
   * @returns {ResearchStudy}
   */
  publishStudy(studyId) {
    const study = this.#requireStudy(studyId);
    if (study.findings.length === 0) {
      throw new Error('Study must be analysed before publishing');
    }
    study.status = 'published';
    study.phiResonance = phiGrow(study.phiResonance, 1, PHI_INVERSE);
    study.updatedAt = Date.now();
    const snapshot = this.#studySnapshot(study);
    this.#notifyPublish(snapshot);
    return snapshot;
  }

  /**
   * Retrieve a study (read-only copy).
   * @param {string} studyId
   * @returns {ResearchStudy}
   */
  getStudy(studyId) {
    return this.#studySnapshot(this.#requireStudy(studyId));
  }

  /**
   * List all studies.
   * @returns {ResearchStudy[]}
   */
  listStudies() {
    return Array.from(this.#studies.values()).map(s => this.#studySnapshot(s));
  }

  /**
   * CARS system manifest.
   * @returns {CARSManifest}
   */
  manifest() {
    const studies = Array.from(this.#studies.values());
    const published = studies.filter(s => s.status === 'published');
    const totalFindings = studies.reduce((sum, s) => sum + s.findings.length, 0);
    const phiIndex = studies.length > 0
      ? studies.reduce((sum, s) => sum + s.phiResonance, 0) / studies.length
      : 0;
    return {
      system: 'CARS',
      fullName: 'Cognitive Autonomous Research System',
      sovereign: NOVA_SOVEREIGN_ID,
      studyCount: studies.length,
      publishedCount: published.length,
      totalFindings,
      phiIndex,
      timestamp: Date.now(),
    };
  }

  // ------------------------------------------------------------------ //
  // Private helpers                                                      //
  // ------------------------------------------------------------------ //

  /**
   * @param {string} studyId
   * @returns {ResearchStudy}
   */
  #requireStudy(studyId) {
    const s = this.#studies.get(studyId);
    if (!s) throw new Error(`Study "${studyId}" not found`);
    return s;
  }

  /**
   * @param {ResearchStudy} study
   * @returns {ResearchStudy}
   */
  #studySnapshot(study) {
    return {
      ...study,
      hypotheses: study.hypotheses.map(h => ({ ...h })),
      findings: [...study.findings],
    };
  }

  /**
   * @param {ResearchStudy} study
   */
  #notifyPublish(study) {
    for (const fn of this.#publishListeners) {
      try { fn({ ...study }); } catch { /* non-fatal */ }
    }
  }
}
