const PHI = 1.618033988749895;

/**
 * @typedef {Object} Precedent
 * @property {string} precedentId
 * @property {string} citation
 * @property {string} court
 * @property {number} year
 * @property {string} summary
 * @property {string} outcome
 * @property {string[]} keyPrinciples
 * @property {string} jurisdiction
 * @property {number} addedAt
 */

/**
 * LegalResearcher — AI legal research assistant for finding and analyzing
 * precedents. Supports keyword search, jurisdiction and year filtering,
 * phi-weighted relevance ranking, and structured research memo generation.
 */
export class LegalResearcher {
  /** @type {Map<string, Precedent>} */
  #precedents;

  /** @type {number} */
  #searchCount;

  /** @type {number} */
  #memoCount;

  constructor() {
    this.#precedents = new Map();
    this.#searchCount = 0;
    this.#memoCount = 0;
  }

  /**
   * Adds a legal precedent to the research database.
   *
   * Precedent data includes citation, court, year, summary, outcome,
   * and key principles for downstream search and ranking.
   *
   * @param {string} precedentId — unique identifier
   * @param {Object} data — precedent details
   * @param {string} data.citation — legal citation string
   * @param {string} data.court — court name
   * @param {number} data.year — decision year
   * @param {string} data.summary — case summary
   * @param {string} data.outcome — case outcome description
   * @param {string[]} data.keyPrinciples — established legal principles
   * @param {string} [data.jurisdiction] — jurisdiction code
   * @returns {{ precedentId: string, citation: string, addedAt: number }}
   */
  addPrecedent(precedentId, data) {
    if (this.#precedents.has(precedentId)) {
      throw new Error(`Precedent "${precedentId}" already exists.`);
    }

    const record = {
      precedentId,
      citation: data.citation,
      court: data.court,
      year: data.year,
      summary: data.summary,
      outcome: data.outcome,
      keyPrinciples: data.keyPrinciples ?? [],
      jurisdiction: data.jurisdiction ?? 'federal',
      addedAt: Date.now(),
    };

    this.#precedents.set(precedentId, record);
    return { precedentId, citation: record.citation, addedAt: record.addedAt };
  }

  /**
   * Searches precedents by keyword substring match.
   *
   * Matches against citation, court, summary, outcome, and key
   * principles fields. Case-insensitive.
   *
   * @param {string} query — search keyword
   * @returns {Precedent[]}
   */
  search(query) {
    this.#searchCount++;
    const q = query.toLowerCase();
    const results = [];

    for (const p of this.#precedents.values()) {
      const haystack = [
        p.citation, p.court, p.summary, p.outcome,
        ...p.keyPrinciples,
      ].join(' ').toLowerCase();

      if (haystack.includes(q)) {
        results.push({ ...p });
      }
    }

    return results;
  }

  /**
   * Filters precedents by jurisdiction.
   *
   * @param {string} jurisdiction — jurisdiction code to filter by
   * @returns {Precedent[]}
   */
  getByJurisdiction(jurisdiction) {
    const j = jurisdiction.toLowerCase();
    const results = [];
    for (const p of this.#precedents.values()) {
      if (p.jurisdiction.toLowerCase() === j) {
        results.push({ ...p });
      }
    }
    return results;
  }

  /**
   * Filters precedents by year range (inclusive).
   *
   * @param {number} startYear — start of range
   * @param {number} endYear — end of range
   * @returns {Precedent[]}
   */
  getByYear(startYear, endYear) {
    const results = [];
    for (const p of this.#precedents.values()) {
      if (p.year >= startYear && p.year <= endYear) {
        results.push({ ...p });
      }
    }
    return results.sort((a, b) => b.year - a.year);
  }

  /**
   * Ranks precedents by relevance to a case context using phi-weighted scoring.
   *
   * Scoring factors include keyword match density, principle overlap,
   * recency bias, and jurisdiction alignment — each weighted by
   * successive powers of the golden ratio.
   *
   * @param {string} query — search terms
   * @param {Object} caseContext — context for relevance scoring
   * @param {string} [caseContext.jurisdiction] — target jurisdiction
   * @param {number} [caseContext.year] — target year for recency bias
   * @param {string[]} [caseContext.principles] — key principles to match
   * @returns {Array<{ precedentId: string, citation: string, relevanceScore: number }>}
   */
  rankRelevance(query, caseContext = {}) {
    this.#searchCount++;
    const q = query.toLowerCase();
    const ranked = [];

    for (const p of this.#precedents.values()) {
      const haystack = [p.citation, p.court, p.summary, p.outcome, ...p.keyPrinciples].join(' ').toLowerCase();

      const words = q.split(/\s+/).filter(Boolean);
      const matchCount = words.filter((w) => haystack.includes(w)).length;
      const keywordScore = words.length > 0 ? matchCount / words.length : 0;

      let principleScore = 0;
      if (caseContext.principles && caseContext.principles.length > 0) {
        const pSet = new Set(p.keyPrinciples.map((k) => k.toLowerCase()));
        const matches = caseContext.principles.filter((cp) => pSet.has(cp.toLowerCase())).length;
        principleScore = matches / caseContext.principles.length;
      }

      let recencyScore = 0;
      if (caseContext.year) {
        const gap = Math.abs(caseContext.year - p.year);
        recencyScore = 1 / (1 + gap / PHI);
      }

      const jurisdictionScore = caseContext.jurisdiction &&
        p.jurisdiction.toLowerCase() === caseContext.jurisdiction.toLowerCase() ? 1 : 0;

      const raw = (
        keywordScore * PHI * PHI * PHI +
        principleScore * PHI * PHI +
        recencyScore * PHI +
        jurisdictionScore
      ) / (PHI * PHI * PHI + PHI * PHI + PHI + 1);

      const relevanceScore = Math.round(raw * 10000) / 10000;

      if (relevanceScore > 0) {
        ranked.push({ precedentId: p.precedentId, citation: p.citation, relevanceScore });
      }
    }

    return ranked.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Generates a structured research memo for a topic.
   *
   * The memo includes an introduction, analysis of cited precedents,
   * key principles synthesis, and a conclusion — all assembled from
   * the provided precedent IDs.
   *
   * @param {string} topic — research topic
   * @param {string[]} precedentIds — precedents to include
   * @returns {{ topic: string, generatedAt: number, sections: Object }}
   */
  generateResearchMemo(topic, precedentIds) {
    const cited = [];
    for (const id of precedentIds) {
      const p = this.#precedents.get(id);
      if (!p) throw new Error(`Precedent "${id}" not found.`);
      cited.push(p);
    }

    const principleSet = new Set();
    const caseAnalyses = cited.map((p) => {
      p.keyPrinciples.forEach((k) => principleSet.add(k));
      return {
        citation: p.citation,
        court: p.court,
        year: p.year,
        outcome: p.outcome,
        relevance: `Supports analysis of "${topic}" through ${p.keyPrinciples.length} established principles.`,
      };
    });

    const sections = {
      introduction: `This memorandum examines "${topic}" by analyzing ${cited.length} relevant precedent(s).`,
      caseAnalyses,
      keyPrinciples: [...principleSet],
      conclusion: `Based on ${cited.length} precedent(s) establishing ${principleSet.size} principle(s), ` +
        `the legal position on "${topic}" is supported by a phi-confidence factor of ` +
        `${(Math.min(1, cited.length / (5 * PHI)) * PHI).toFixed(4)}.`,
    };

    this.#memoCount++;
    return { topic, generatedAt: Date.now(), sections };
  }

  /**
   * Returns aggregate research statistics.
   *
   * @returns {{ totalPrecedents: number, searchCount: number, memoCount: number, byJurisdiction: Object, yearRange: Object }}
   */
  getStats() {
    const byJurisdiction = {};
    let minYear = Infinity;
    let maxYear = -Infinity;

    for (const p of this.#precedents.values()) {
      byJurisdiction[p.jurisdiction] = (byJurisdiction[p.jurisdiction] ?? 0) + 1;
      if (p.year < minYear) minYear = p.year;
      if (p.year > maxYear) maxYear = p.year;
    }

    return {
      totalPrecedents: this.#precedents.size,
      searchCount: this.#searchCount,
      memoCount: this.#memoCount,
      byJurisdiction,
      yearRange: this.#precedents.size > 0 ? { min: minYear, max: maxYear } : { min: null, max: null },
    };
  }
}

export default LegalResearcher;
