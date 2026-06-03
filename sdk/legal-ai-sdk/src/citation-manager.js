const PHI = 1.618033988749895;

/**
 * @typedef {Object} Citation
 * @property {string} citationId
 * @property {string} caseName
 * @property {string} volume
 * @property {string} reporter
 * @property {string} page
 * @property {number} year
 * @property {string} court
 * @property {string} [pinpoint]
 * @property {number} addedAt
 */

/**
 * @typedef {Object} CrossRef
 * @property {string} from
 * @property {string} to
 * @property {number} createdAt
 */

/**
 * CitationManager — legal citation management with formatting and
 * cross-referencing. Supports Bluebook, ALWD, APA, and Chicago
 * citation styles, batch formatting, and chain traversal for
 * building citation networks.
 */
export class CitationManager {
  /** @type {Map<string, Citation>} */
  #citations;

  /** @type {CrossRef[]} */
  #crossRefs;

  /** @type {string[]} */
  #validStyles;

  /** @type {number} */
  #formatCount;

  /** @type {number} */
  #searchCount;

  constructor() {
    this.#citations = new Map();
    this.#crossRefs = [];
    this.#validStyles = ['bluebook', 'alwd', 'apa', 'chicago'];
    this.#formatCount = 0;
    this.#searchCount = 0;
  }

  /**
   * Adds a citation to the manager.
   *
   * Citation data follows the standard legal citation components:
   * case name, volume, reporter, page, year, court, and optional pinpoint.
   *
   * @param {string} citationId — unique citation identifier
   * @param {Object} data — citation details
   * @param {string} data.case — case name
   * @param {string} data.volume — reporter volume
   * @param {string} data.reporter — reporter abbreviation
   * @param {string} data.page — starting page
   * @param {number} data.year — decision year
   * @param {string} data.court — court name
   * @param {string} [data.pinpoint] — pinpoint page reference
   * @returns {{ citationId: string, caseName: string, addedAt: number }}
   */
  addCitation(citationId, data) {
    if (this.#citations.has(citationId)) {
      throw new Error(`Citation "${citationId}" already exists.`);
    }

    const record = {
      citationId,
      caseName: data.case,
      volume: String(data.volume),
      reporter: data.reporter,
      page: String(data.page),
      year: data.year,
      court: data.court,
      pinpoint: data.pinpoint ?? null,
      addedAt: Date.now(),
    };

    this.#citations.set(citationId, record);
    return { citationId, caseName: record.caseName, addedAt: record.addedAt };
  }

  /**
   * Formats a citation in the specified style.
   *
   * Supported styles: 'bluebook', 'alwd', 'apa', 'chicago'.
   * Each produces the canonical formatting for legal briefs,
   * academic papers, or general publications.
   *
   * @param {string} citationId
   * @param {string} style — formatting style
   * @returns {{ citationId: string, style: string, formatted: string }}
   */
  format(citationId, style) {
    const c = this._getCitation(citationId);
    if (!this.#validStyles.includes(style)) {
      throw new Error(`Invalid style "${style}". Valid: ${this.#validStyles.join(', ')}`);
    }

    this.#formatCount++;
    const formatted = this._applyStyle(c, style);
    return { citationId, style, formatted };
  }

  /**
   * Batch formats multiple citations in the specified style.
   *
   * @param {string[]} citationIds — citations to format
   * @param {string} style — formatting style
   * @returns {Array<{ citationId: string, style: string, formatted: string }>}
   */
  batchFormat(citationIds, style) {
    if (!this.#validStyles.includes(style)) {
      throw new Error(`Invalid style "${style}". Valid: ${this.#validStyles.join(', ')}`);
    }

    return citationIds.map((id) => {
      const c = this._getCitation(id);
      this.#formatCount++;
      return { citationId: id, style, formatted: this._applyStyle(c, style) };
    });
  }

  /**
   * Creates a cross-reference between two citations.
   *
   * Cross-references form a directed graph enabling citation
   * chain traversal for comprehensive legal research.
   *
   * @param {string} citationIdA — source citation
   * @param {string} citationIdB — target citation
   * @returns {{ from: string, to: string, createdAt: number }}
   */
  crossReference(citationIdA, citationIdB) {
    this._getCitation(citationIdA);
    this._getCitation(citationIdB);

    const exists = this.#crossRefs.some((r) => r.from === citationIdA && r.to === citationIdB);
    if (exists) {
      throw new Error(`Cross-reference from "${citationIdA}" to "${citationIdB}" already exists.`);
    }

    const ref = { from: citationIdA, to: citationIdB, createdAt: Date.now() };
    this.#crossRefs.push(ref);
    return { ...ref };
  }

  /**
   * Returns the chain of cross-referenced citations reachable from
   * the given citation using breadth-first traversal.
   *
   * Chain depth is capped at PHI * 10 ≈ 16 to prevent cycles.
   *
   * @param {string} citationId — starting citation
   * @returns {Array<{ citationId: string, caseName: string, depth: number }>}
   */
  getCitationChain(citationId) {
    this._getCitation(citationId);
    const visited = new Set([citationId]);
    const queue = [{ id: citationId, depth: 0 }];
    const chain = [];
    const maxDepth = Math.floor(PHI * 10);

    while (queue.length > 0) {
      const { id, depth } = queue.shift();

      if (depth > 0) {
        const c = this.#citations.get(id);
        chain.push({ citationId: id, caseName: c.caseName, depth });
      }

      if (depth < maxDepth) {
        const neighbors = this.#crossRefs
          .filter((r) => r.from === id)
          .map((r) => r.to);

        for (const nId of neighbors) {
          if (!visited.has(nId)) {
            visited.add(nId);
            queue.push({ id: nId, depth: depth + 1 });
          }
        }
      }
    }

    return chain;
  }

  /**
   * Searches citations by keyword across case name, reporter, and court.
   *
   * @param {string} query — search keyword (case-insensitive)
   * @returns {Citation[]}
   */
  search(query) {
    this.#searchCount++;
    const q = query.toLowerCase();
    const results = [];

    for (const c of this.#citations.values()) {
      const haystack = [c.caseName, c.reporter, c.court, c.volume, c.page]
        .join(' ').toLowerCase();
      if (haystack.includes(q)) {
        results.push({ ...c });
      }
    }

    return results;
  }

  /**
   * Validates a citation for format completeness.
   *
   * Checks that all essential fields are non-empty and that the year
   * is a valid number. Returns a phi-weighted completeness score.
   *
   * @param {string} citationId
   * @returns {{ valid: boolean, completeness: number, missingFields: string[] }}
   */
  validateCitation(citationId) {
    const c = this._getCitation(citationId);
    const requiredFields = ['caseName', 'volume', 'reporter', 'page', 'year', 'court'];
    const missing = [];

    for (const field of requiredFields) {
      const val = c[field];
      if (val === null || val === undefined || String(val).trim().length === 0) {
        missing.push(field);
      }
    }

    if (typeof c.year !== 'number' || c.year < 1600 || c.year > new Date().getFullYear() + 1) {
      if (!missing.includes('year')) missing.push('year');
    }

    const filled = requiredFields.length - missing.length;
    const raw = filled / requiredFields.length;
    const completeness = Math.round(raw * PHI * 6180) / 10000;

    return { valid: missing.length === 0, completeness: Math.min(1, completeness), missingFields: missing };
  }

  /**
   * Returns aggregate citation statistics.
   *
   * @returns {{ totalCitations: number, totalCrossRefs: number, formatCount: number, searchCount: number, byCourt: Object }}
   */
  getStats() {
    const byCourt = {};
    for (const c of this.#citations.values()) {
      byCourt[c.court] = (byCourt[c.court] ?? 0) + 1;
    }
    return {
      totalCitations: this.#citations.size,
      totalCrossRefs: this.#crossRefs.length,
      formatCount: this.#formatCount,
      searchCount: this.#searchCount,
      byCourt,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Retrieves a citation or throws if not found.
   * @private
   * @param {string} citationId
   * @returns {Citation}
   */
  _getCitation(citationId) {
    const c = this.#citations.get(citationId);
    if (!c) throw new Error(`Citation "${citationId}" not found.`);
    return c;
  }

  /**
   * Applies a formatting style to a citation record.
   * @private
   * @param {Citation} c
   * @param {string} style
   * @returns {string}
   */
  _applyStyle(c, style) {
    const pin = c.pinpoint ? `, ${c.pinpoint}` : '';

    switch (style) {
      case 'bluebook':
        return `${c.caseName}, ${c.volume} ${c.reporter} ${c.page}${pin} (${c.court} ${c.year}).`;
      case 'alwd':
        return `${c.caseName}, ${c.volume} ${c.reporter} ${c.page}${pin} (${c.court} ${c.year}).`;
      case 'apa':
        return `${c.caseName}, ${c.volume} ${c.reporter} ${c.page} (${c.year}).`;
      case 'chicago':
        return `${c.caseName}. ${c.volume} ${c.reporter} ${c.page}${pin}. ${c.court}, ${c.year}.`;
      default:
        return `${c.caseName}, ${c.volume} ${c.reporter} ${c.page} (${c.year}).`;
    }
  }
}

export default CitationManager;
