const PHI = 1.618033988749895;

/**
 * @typedef {Object} CaseRecord
 * @property {string} caseId
 * @property {string} title
 * @property {string} type
 * @property {string[]} parties
 * @property {string[]} facts
 * @property {string} jurisdiction
 * @property {string} filingDate
 * @property {number} registeredAt
 * @property {boolean} analyzed
 * @property {Object|null} analysis
 */

/**
 * CaseAnalyzer — AI-powered legal case analysis engine.
 * Evaluates case strength, risks, and opportunities using phi-weighted
 * scoring across multiple dimensions. Supports comparison against
 * precedent cases and timeline generation for litigation planning.
 */
export class CaseAnalyzer {
  /** @type {Map<string, CaseRecord>} */
  #cases;

  /** @type {string[]} */
  #validTypes;

  /** @type {number} */
  #analysisCount;

  constructor() {
    this.#cases = new Map();
    this.#validTypes = [
      'civil', 'criminal', 'corporate', 'ip',
      'employment', 'family', 'real-estate', 'immigration',
    ];
    this.#analysisCount = 0;
  }

  /**
   * Registers a new case for analysis.
   *
   * Validates case type against known categories and stores all
   * provided metadata for downstream analysis steps.
   *
   * @param {string} caseId — unique case identifier
   * @param {Object} details — case details
   * @param {string} details.title — case title
   * @param {string} details.type — case type
   * @param {string[]} details.parties — involved parties
   * @param {string[]} details.facts — key facts of the case
   * @param {string} details.jurisdiction — filing jurisdiction
   * @param {string} details.filingDate — ISO date string
   * @returns {{ caseId: string, type: string, registeredAt: number }}
   */
  registerCase(caseId, details) {
    if (this.#cases.has(caseId)) {
      throw new Error(`Case "${caseId}" is already registered.`);
    }
    if (!this.#validTypes.includes(details.type)) {
      throw new Error(`Invalid case type "${details.type}". Valid: ${this.#validTypes.join(', ')}`);
    }

    const record = {
      caseId,
      title: details.title,
      type: details.type,
      parties: details.parties ?? [],
      facts: details.facts ?? [],
      jurisdiction: details.jurisdiction ?? 'unknown',
      filingDate: details.filingDate ?? new Date().toISOString(),
      registeredAt: Date.now(),
      analyzed: false,
      analysis: null,
    };

    this.#cases.set(caseId, record);
    return { caseId, type: record.type, registeredAt: record.registeredAt };
  }

  /**
   * Analyzes a registered case using phi-weighted scoring.
   *
   * Strength is derived from fact density and party count, then
   * adjusted by the golden ratio. Risks, opportunities, and
   * recommended strategies are generated based on case type.
   *
   * @param {string} caseId
   * @returns {{ strength: number, risks: string[], opportunities: string[], recommendedStrategy: string }}
   */
  analyze(caseId) {
    const c = this._getCase(caseId);

    const factScore = Math.min(1, c.facts.length / (10 * PHI));
    const partyScore = Math.min(1, c.parties.length / (4 * PHI));
    const strength = Math.round(((factScore + partyScore) / 2) * PHI * 6180) / 10000;

    const riskMap = {
      civil: ['Adverse ruling', 'Discovery burden'],
      criminal: ['Conviction risk', 'Evidence suppression'],
      corporate: ['Shareholder liability', 'Regulatory scrutiny'],
      ip: ['Invalidation risk', 'Prior art challenges'],
      employment: ['Class action escalation', 'Whistleblower claims'],
      family: ['Custody complications', 'Asset concealment'],
      'real-estate': ['Title defects', 'Zoning disputes'],
      immigration: ['Deportation risk', 'Visa denial'],
    };

    const opportunityMap = {
      civil: ['Settlement leverage', 'Summary judgment potential'],
      criminal: ['Plea negotiation', 'Procedural dismissal'],
      corporate: ['Merger arbitrage', 'Regulatory safe harbor'],
      ip: ['Licensing revenue', 'Injunction leverage'],
      employment: ['Mediation advantage', 'Policy reform'],
      family: ['Collaborative resolution', 'Mediation savings'],
      'real-estate': ['Quiet title action', 'Easement negotiation'],
      immigration: ['Humanitarian relief', 'Status adjustment'],
    };

    const strategyMap = {
      civil: 'Pursue early mediation with structured discovery',
      criminal: 'Aggressive pre-trial motions with plea fallback',
      corporate: 'Regulatory engagement with parallel negotiation',
      ip: 'Portfolio-based enforcement with licensing offers',
      employment: 'Internal resolution with compliance documentation',
      family: 'Collaborative law with minimal litigation exposure',
      'real-estate': 'Title insurance with boundary survey evidence',
      immigration: 'Multi-track filing with administrative appeals',
    };

    const analysis = {
      strength: Math.min(1, strength),
      risks: riskMap[c.type] ?? [],
      opportunities: opportunityMap[c.type] ?? [],
      recommendedStrategy: strategyMap[c.type] ?? 'Consult specialist counsel',
    };

    c.analyzed = true;
    c.analysis = analysis;
    this.#analysisCount++;

    return analysis;
  }

  /**
   * Compares a case against precedent cases by phi-weighted similarity.
   *
   * Similarity is computed from overlapping facts, type match, and
   * jurisdiction alignment, each weighted by successive powers of phi.
   *
   * @param {string} caseId
   * @param {string[]} precedentIds
   * @returns {Array<{ precedentId: string, similarity: number }>}
   */
  compareCase(caseId, precedentIds) {
    const target = this._getCase(caseId);
    const results = [];

    for (const pId of precedentIds) {
      const p = this._getCase(pId);

      const typeMatch = target.type === p.type ? 1 : 0;
      const jurisdictionMatch = target.jurisdiction === p.jurisdiction ? 1 : 0;
      const factOverlap = this._factOverlap(target.facts, p.facts);

      const raw = (factOverlap * PHI * PHI + typeMatch * PHI + jurisdictionMatch) / (PHI * PHI + PHI + 1);
      const similarity = Math.round(raw * 10000) / 10000;

      results.push({ precedentId: pId, similarity: Math.min(1, similarity) });
    }

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Returns a timeline of key events for the case.
   *
   * Events are synthesized from registration, filing, and analysis
   * dates with phi-interval projected milestones.
   *
   * @param {string} caseId
   * @returns {Array<{ date: string, event: string }>}
   */
  getTimeline(caseId) {
    const c = this._getCase(caseId);
    const events = [];

    events.push({ date: c.filingDate, event: 'Case filed' });
    events.push({ date: new Date(c.registeredAt).toISOString(), event: 'Case registered for analysis' });

    const filingMs = new Date(c.filingDate).getTime();
    const phiDays = [30, 60, 90, 180].map((d) => Math.round(d * PHI));
    const labels = ['Initial review deadline', 'Discovery phase', 'Motions deadline', 'Trial preparation'];

    for (let i = 0; i < phiDays.length; i++) {
      const ms = filingMs + phiDays[i] * 86400000;
      events.push({ date: new Date(ms).toISOString(), event: labels[i] });
    }

    if (c.analyzed) {
      events.push({ date: new Date().toISOString(), event: 'Analysis completed' });
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Assesses risk across financial, reputational, and regulatory dimensions.
   *
   * Each dimension is scored using a phi-weighted formula that accounts
   * for case type severity, fact count, and party complexity.
   *
   * @param {string} caseId
   * @returns {{ financial: number, reputational: number, regulatory: number, overall: number }}
   */
  assessRisk(caseId) {
    const c = this._getCase(caseId);
    const typeWeights = {
      civil: 0.5, criminal: 0.9, corporate: 0.7, ip: 0.6,
      employment: 0.55, family: 0.3, 'real-estate': 0.45, immigration: 0.65,
    };
    const w = typeWeights[c.type] ?? 0.5;

    const factPressure = Math.min(1, c.facts.length / 10);
    const partyPressure = Math.min(1, c.parties.length / 6);

    const financial = Math.round(w * factPressure * PHI * 6180) / 10000;
    const reputational = Math.round(w * partyPressure * PHI * 6180) / 10000;
    const regulatory = Math.round(w * ((factPressure + partyPressure) / 2) * PHI * 6180) / 10000;
    const overall = Math.round(((financial + reputational + regulatory) / 3) * 10000) / 10000;

    return {
      financial: Math.min(1, financial),
      reputational: Math.min(1, reputational),
      regulatory: Math.min(1, regulatory),
      overall: Math.min(1, overall),
    };
  }

  /**
   * Returns aggregate analysis statistics.
   *
   * @returns {{ totalCases: number, analyzedCases: number, analysisCount: number, casesByType: Object }}
   */
  getCaseStats() {
    const casesByType = {};
    let analyzedCases = 0;
    for (const c of this.#cases.values()) {
      casesByType[c.type] = (casesByType[c.type] ?? 0) + 1;
      if (c.analyzed) analyzedCases++;
    }
    return {
      totalCases: this.#cases.size,
      analyzedCases,
      analysisCount: this.#analysisCount,
      casesByType,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Retrieves a case or throws if not found.
   * @private
   * @param {string} caseId
   * @returns {CaseRecord}
   */
  _getCase(caseId) {
    const c = this.#cases.get(caseId);
    if (!c) throw new Error(`Case "${caseId}" not found.`);
    return c;
  }

  /**
   * Computes overlap ratio between two fact arrays.
   * @private
   * @param {string[]} a
   * @param {string[]} b
   * @returns {number}
   */
  _factOverlap(a, b) {
    if (a.length === 0 && b.length === 0) return 1;
    if (a.length === 0 || b.length === 0) return 0;
    const setB = new Set(b.map((f) => f.toLowerCase()));
    const matches = a.filter((f) => setB.has(f.toLowerCase())).length;
    return matches / Math.max(a.length, b.length);
  }
}

export default CaseAnalyzer;
