import crypto from 'node:crypto';
import { PHI, PHI_INVERSE, NOVA_SOVEREIGN_ID, HEARTBEAT_MS, phiBlend, phiCoherence } from './nova-core.js';

/**
 * @typedef {'nns' | 'sns' | 'codegov' | 'nova'} LaneType
 */

/**
 * @typedef {Object} SnsProposal
 * @property {string} proposalId
 * @property {string} title
 * @property {string} daoId
 * @property {number} timestamp
 * @property {'open' | 'adopted' | 'rejected' | 'executed'} status
 * @property {number} coherenceScore  - Nova phi-weighted coherence [0, 1]
 */

/**
 * @typedef {Object} SnsDao
 * @property {string} daoId
 * @property {string} name
 * @property {LaneType} lane
 * @property {number} registeredAt
 */

/**
 * NovaSNSBridge — SNS governance integration for the Nova framework.
 *
 * Implements the 3-lane source separation from ORO/Adapters.mo:
 *   Lane A (nns)     — NNS/DFINITY proposals
 *   Lane B (codegov) — CodeGov reviewer evidence (observe only, never vote)
 *   Lane C (sns)     — SNS DAO proposals
 *   Lane D (nova)    — Nova-native governance proposals
 *
 * The bridge maintains a proposal registry, assigns phi-encoded coherence
 * scores, and surfaces governance signals to the organism runtime.
 */
export class NovaSNSBridge {
  /** @type {Map<string, SnsDao>} */
  #daos;

  /** @type {Map<string, SnsProposal>} */
  #proposals;

  /** @type {string} */
  #bridgeId;

  /** @type {number} */
  #lastSyncTimestamp;

  /** @type {Array<function>} */
  #proposalListeners;

  constructor() {
    this.#bridgeId = crypto.randomUUID();
    this.#daos = new Map();
    this.#proposals = new Map();
    this.#lastSyncTimestamp = 0;
    this.#proposalListeners = [];

    this.#seedKnownDaos();
  }

  /**
   * Bridge identifier.
   * @returns {string}
   */
  get bridgeId() {
    return this.#bridgeId;
  }

  /**
   * Register a listener to be called when a new proposal is ingested.
   * @param {function} fn  Callback receiving SnsProposal
   * @returns {function}  Unsubscribe function
   */
  onProposal(fn) {
    if (typeof fn !== 'function') throw new TypeError('Listener must be a function');
    this.#proposalListeners.push(fn);
    return () => {
      this.#proposalListeners = this.#proposalListeners.filter(l => l !== fn);
    };
  }

  /**
   * Register a DAO with a governance lane.
   * @param {string} daoId
   * @param {string} name
   * @param {LaneType} lane
   * @returns {SnsDao}
   */
  registerDao(daoId, name, lane) {
    const validLanes = ['nns', 'sns', 'codegov', 'nova'];
    if (!validLanes.includes(lane)) {
      throw new Error(`Invalid lane: "${lane}". Must be one of: ${validLanes.join(', ')}`);
    }
    if (this.#daos.has(daoId)) {
      throw new Error(`DAO "${daoId}" is already registered`);
    }
    const dao = { daoId, name, lane, registeredAt: Date.now() };
    this.#daos.set(daoId, dao);
    return { ...dao };
  }

  /**
   * Ingest a governance proposal from a registered DAO.
   * Assigns a phi-encoded coherence score automatically.
   * @param {string} daoId
   * @param {string} title
   * @param {{ rawCoherence?: number }} [opts]
   * @returns {SnsProposal}
   */
  ingestProposal(daoId, title, opts = {}) {
    const dao = this.#daos.get(daoId);
    if (!dao) throw new Error(`DAO "${daoId}" is not registered`);

    const proposalId = `NOVA-PROP-${crypto.randomUUID()}`;
    const rawCoherence = opts.rawCoherence ?? 0.5;
    const coherenceScore = phiCoherence(rawCoherence);
    const now = Date.now();

    /** @type {SnsProposal} */
    const proposal = {
      proposalId,
      title,
      daoId,
      timestamp: now,
      status: 'open',
      coherenceScore,
    };

    this.#proposals.set(proposalId, proposal);
    this.#lastSyncTimestamp = now;
    this.#notifyListeners(proposal);
    return { ...proposal };
  }

  /**
   * Update the status of a proposal.
   * Note: Lane B (codegov) proposals are read-only — status cannot be changed.
   * @param {string} proposalId
   * @param {'adopted' | 'rejected' | 'executed'} newStatus
   * @returns {SnsProposal}
   */
  updateProposalStatus(proposalId, newStatus) {
    const proposal = this.#requireProposal(proposalId);
    const dao = this.#daos.get(proposal.daoId);
    if (dao?.lane === 'codegov') {
      throw new Error('Lane B (codegov) proposals are read-only — observe only, never vote');
    }
    const validStatuses = ['adopted', 'rejected', 'executed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: "${newStatus}"`);
    }
    proposal.status = newStatus;
    return { ...proposal };
  }

  /**
   * Returns all proposals for a given DAO.
   * @param {string} daoId
   * @returns {SnsProposal[]}
   */
  getProposalsByDao(daoId) {
    return Array.from(this.#proposals.values())
      .filter(p => p.daoId === daoId)
      .map(p => ({ ...p }));
  }

  /**
   * Returns all registered DAOs.
   * @returns {SnsDao[]}
   */
  listDaos() {
    return Array.from(this.#daos.values()).map(d => ({ ...d }));
  }

  /**
   * Returns all proposals across all DAOs.
   * @returns {SnsProposal[]}
   */
  listProposals() {
    return Array.from(this.#proposals.values()).map(p => ({ ...p }));
  }

  /**
   * Bridge status summary.
   * @returns {Object}
   */
  status() {
    return {
      bridgeId: this.#bridgeId,
      sovereign: NOVA_SOVEREIGN_ID,
      daoCount: this.#daos.size,
      proposalCount: this.#proposals.size,
      lastSyncTimestamp: this.#lastSyncTimestamp,
      heartbeatMs: HEARTBEAT_MS,
      phi: PHI,
    };
  }

  // ------------------------------------------------------------------ //
  // Private helpers                                                      //
  // ------------------------------------------------------------------ //

  /**
   * Seed a representative set of known ICP governance DAOs.
   */
  #seedKnownDaos() {
    const known = [
      { id: 'rrkah-fqaaa-aaaaa-aaaaq-cai', name: 'NNS Governance', lane: 'nns' },
      { id: 'codegov-reviewer-lane', name: 'CodeGov Reviewers', lane: 'codegov' },
      { id: 'nova-governance', name: 'Nova Governance', lane: 'nova' },
    ];
    for (const { id, name, lane } of known) {
      this.#daos.set(id, { daoId: id, name, lane: /** @type {LaneType} */ (lane), registeredAt: Date.now() });
    }
  }

  /**
   * @param {string} proposalId
   * @returns {SnsProposal}
   */
  #requireProposal(proposalId) {
    const p = this.#proposals.get(proposalId);
    if (!p) throw new Error(`Proposal "${proposalId}" not found`);
    return p;
  }

  /**
   * @param {SnsProposal} proposal
   */
  #notifyListeners(proposal) {
    for (const fn of this.#proposalListeners) {
      try { fn({ ...proposal }); } catch { /* listener errors are non-fatal */ }
    }
  }
}
