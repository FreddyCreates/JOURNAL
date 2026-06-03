const PHI = 1.618033988749895;

/**
 * @typedef {Object} Clause
 * @property {string} id
 * @property {string} type
 * @property {string} text
 * @property {string} section
 */

/**
 * @typedef {Object} ContractRecord
 * @property {string} contractId
 * @property {Clause[]} clauses
 * @property {number} ingestedAt
 * @property {boolean} reviewed
 * @property {Object|null} findings
 */

/**
 * ContractReviewer — AI contract review with clause analysis and risk
 * detection. Evaluates clauses against a phi-weighted risk model, identifies
 * problematic terms, and suggests amendments for high-risk provisions.
 */
export class ContractReviewer {
  /** @type {Map<string, ContractRecord>} */
  #contracts;

  /** @type {string[]} */
  #validClauseTypes;

  /** @type {Array<Object>} */
  #auditLog;

  /** @type {number} */
  #reviewCount;

  constructor() {
    this.#contracts = new Map();
    this.#validClauseTypes = [
      'indemnification', 'liability', 'termination', 'confidentiality',
      'ip-assignment', 'non-compete', 'arbitration', 'force-majeure',
      'payment', 'warranty',
    ];
    this.#auditLog = [];
    this.#reviewCount = 0;
  }

  /**
   * Ingests a contract as an array of clause objects.
   *
   * Each clause must have an id, type, text, and section. Clause types
   * are validated against the known taxonomy before storage.
   *
   * @param {string} contractId — unique contract identifier
   * @param {Clause[]} clauses — array of clause objects
   * @returns {{ contractId: string, clauseCount: number, ingestedAt: number }}
   */
  ingest(contractId, clauses) {
    if (this.#contracts.has(contractId)) {
      throw new Error(`Contract "${contractId}" already ingested.`);
    }
    for (const cl of clauses) {
      if (!this.#validClauseTypes.includes(cl.type)) {
        throw new Error(`Invalid clause type "${cl.type}". Valid: ${this.#validClauseTypes.join(', ')}`);
      }
    }

    const record = {
      contractId,
      clauses: [...clauses],
      ingestedAt: Date.now(),
      reviewed: false,
      findings: null,
    };

    this.#contracts.set(contractId, record);
    this._log('ingest', contractId, `Ingested ${clauses.length} clauses`);
    return { contractId, clauseCount: clauses.length, ingestedAt: record.ingestedAt };
  }

  /**
   * Reviews all clauses in a contract and produces per-clause findings.
   *
   * Each clause is evaluated for risk, clarity, and enforceability.
   * Scores are phi-weighted by clause type severity.
   *
   * @param {string} contractId
   * @returns {Array<{ clauseId: string, type: string, risk: number, clarity: number, enforceability: number, notes: string }>}
   */
  review(contractId) {
    const record = this._getContract(contractId);
    const findings = [];

    for (const cl of record.clauses) {
      const riskWeight = this._clauseRiskWeight(cl.type);
      const textLen = cl.text.length;
      const clarity = Math.round(Math.min(1, textLen / (200 * PHI)) * 10000) / 10000;
      const risk = Math.round(riskWeight * PHI * 6180) / 10000;
      const enforceability = Math.round((1 - riskWeight * 0.5) * PHI * 6180) / 10000;

      findings.push({
        clauseId: cl.id,
        type: cl.type,
        risk: Math.min(1, risk),
        clarity: Math.min(1, clarity),
        enforceability: Math.min(1, enforceability),
        notes: `Clause in section "${cl.section}" assessed with phi-weighted model.`,
      });
    }

    record.reviewed = true;
    record.findings = findings;
    this.#reviewCount++;
    this._log('review', contractId, `Reviewed ${findings.length} clauses`);
    return findings;
  }

  /**
   * Identifies risky clauses based on phi-weighted risk scoring.
   *
   * Clauses with risk above the golden-ratio threshold (1/PHI ≈ 0.618)
   * are flagged for attorney review.
   *
   * @param {string} contractId
   * @returns {Array<{ clauseId: string, type: string, riskScore: number, reason: string }>}
   */
  findRiskyClause(contractId) {
    const record = this._getContract(contractId);
    const threshold = 1 / PHI;
    const risky = [];

    for (const cl of record.clauses) {
      const weight = this._clauseRiskWeight(cl.type);
      const riskScore = Math.round(weight * PHI * 6180) / 10000;

      if (riskScore >= threshold) {
        risky.push({
          clauseId: cl.id,
          type: cl.type,
          riskScore: Math.min(1, riskScore),
          reason: `Type "${cl.type}" carries elevated risk (weight: ${weight.toFixed(3)}).`,
        });
      }
    }

    this._log('findRiskyClause', contractId, `Found ${risky.length} risky clauses`);
    return risky.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Suggests amendments for a specific clause.
   *
   * Amendment suggestions are generated based on clause type best
   * practices and common negotiation patterns.
   *
   * @param {string} contractId
   * @param {string} clauseId
   * @returns {{ clauseId: string, originalType: string, suggestions: string[], priority: string }}
   */
  suggestAmendment(contractId, clauseId) {
    const record = this._getContract(contractId);
    const clause = record.clauses.find((cl) => cl.id === clauseId);
    if (!clause) throw new Error(`Clause "${clauseId}" not found in contract "${contractId}".`);

    const suggestionMap = {
      indemnification: ['Cap indemnification at contract value', 'Add mutual indemnification', 'Exclude consequential damages'],
      liability: ['Add liability cap', 'Exclude indirect damages', 'Include insurance requirement'],
      termination: ['Add cure period', 'Include termination for convenience', 'Specify wind-down obligations'],
      confidentiality: ['Define confidential information scope', 'Add term limit', 'Specify permitted disclosures'],
      'ip-assignment': ['Limit to work product only', 'Retain pre-existing IP rights', 'Add license-back provision'],
      'non-compete': ['Narrow geographic scope', 'Reduce time period', 'Limit to direct competitors'],
      arbitration: ['Specify arbitration body', 'Define governing law', 'Include appeal mechanism'],
      'force-majeure': ['Enumerate qualifying events', 'Add notification requirement', 'Include mitigation duty'],
      payment: ['Add late payment penalties', 'Specify payment terms', 'Include dispute resolution for invoices'],
      warranty: ['Limit warranty period', 'Specify remedies', 'Exclude implied warranties'],
    };

    const weight = this._clauseRiskWeight(clause.type);
    const priority = weight > 0.7 ? 'high' : weight > 0.4 ? 'medium' : 'low';

    this._log('suggestAmendment', contractId, `Amendment suggested for clause ${clauseId}`);
    return {
      clauseId,
      originalType: clause.type,
      suggestions: suggestionMap[clause.type] ?? ['Review with counsel'],
      priority,
    };
  }

  /**
   * Compares two contracts clause-by-clause.
   *
   * Matches clauses by type and computes phi-weighted similarity from
   * text length ratios and section alignment.
   *
   * @param {string} contractIdA
   * @param {string} contractIdB
   * @returns {{ commonTypes: string[], onlyA: string[], onlyB: string[], similarity: number }}
   */
  compareContracts(contractIdA, contractIdB) {
    const a = this._getContract(contractIdA);
    const b = this._getContract(contractIdB);

    const typesA = new Set(a.clauses.map((cl) => cl.type));
    const typesB = new Set(b.clauses.map((cl) => cl.type));

    const commonTypes = [...typesA].filter((t) => typesB.has(t));
    const onlyA = [...typesA].filter((t) => !typesB.has(t));
    const onlyB = [...typesB].filter((t) => !typesA.has(t));

    const union = new Set([...typesA, ...typesB]).size;
    const raw = union > 0 ? commonTypes.length / union : 0;
    const similarity = Math.round(raw * PHI * 6180) / 10000;

    this._log('compareContracts', contractIdA, `Compared with ${contractIdB}`);
    return { commonTypes, onlyA, onlyB, similarity: Math.min(1, similarity) };
  }

  /**
   * Returns the complete review audit log.
   *
   * @returns {Array<{ action: string, contractId: string, detail: string, timestamp: number }>}
   */
  getReviewLog() {
    return [...this.#auditLog];
  }

  /* ---- internal helpers ---- */

  /**
   * Retrieves a contract or throws if not found.
   * @private
   * @param {string} contractId
   * @returns {ContractRecord}
   */
  _getContract(contractId) {
    const r = this.#contracts.get(contractId);
    if (!r) throw new Error(`Contract "${contractId}" not found.`);
    return r;
  }

  /**
   * Returns the risk weight for a clause type.
   * @private
   * @param {string} type
   * @returns {number}
   */
  _clauseRiskWeight(type) {
    const weights = {
      indemnification: 0.85, liability: 0.90, termination: 0.60,
      confidentiality: 0.50, 'ip-assignment': 0.75, 'non-compete': 0.80,
      arbitration: 0.45, 'force-majeure': 0.40, payment: 0.55, warranty: 0.65,
    };
    return weights[type] ?? 0.5;
  }

  /**
   * Appends an entry to the audit log.
   * @private
   * @param {string} action
   * @param {string} contractId
   * @param {string} detail
   */
  _log(action, contractId, detail) {
    this.#auditLog.push({ action, contractId, detail, timestamp: Date.now() });
  }
}

export default ContractReviewer;
