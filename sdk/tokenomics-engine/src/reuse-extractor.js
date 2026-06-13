import crypto from 'node:crypto';

/**
 * Reuse Extractor — pulls out rules/templates/memory from successful interactions.
 * 
 * When an output scores high on reuseValue, this module extracts the
 * reusable artifact (rule, template, pattern, or memory) for storage.
 */
export class ReuseExtractor {
  constructor(config = {}) {
    this.minReuseScore = config.minReuseScore ?? 3;
    this._artifacts = new Map();
  }

  /**
   * Extract a reusable artifact from a high-value output.
   * @param {object} params
   * @param {string} params.content — the reusable rule/template/pattern text
   * @param {string} params.type — 'rule' | 'template' | 'pattern' | 'memory'
   * @param {string} params.source — what interaction it came from
   * @param {number} params.reuseScore — 0–5 how reusable is it
   * @param {Array<string>} [params.tags] — categorization tags
   * @returns {object} extracted artifact or null if below threshold
   */
  extract(params) {
    const { content, type, source, reuseScore, tags } = params;

    if (!content) throw new Error('content is required');
    if (!type) throw new Error('type is required');

    const score = reuseScore ?? 0;
    if (score < this.minReuseScore) {
      return { extracted: false, reason: `Score ${score} below threshold ${this.minReuseScore}` };
    }

    const artifact = {
      artifactId: crypto.randomUUID(),
      content,
      type,
      source: source ?? 'unknown',
      reuseScore: score,
      tags: tags ?? [],
      usageCount: 0,
      createdAt: Date.now()
    };

    this._artifacts.set(artifact.artifactId, artifact);
    return { extracted: true, artifact: { ...artifact } };
  }

  /**
   * Record that an artifact was reused.
   */
  recordUsage(artifactId) {
    const artifact = this._artifacts.get(artifactId);
    if (!artifact) throw new Error(`Artifact ${artifactId} not found`);
    artifact.usageCount += 1;
    artifact.lastUsedAt = Date.now();
    return { ...artifact };
  }

  /**
   * Search artifacts by type or tags.
   */
  search(query = {}) {
    let results = [...this._artifacts.values()];
    if (query.type) results = results.filter(a => a.type === query.type);
    if (query.tag) results = results.filter(a => a.tags.includes(query.tag));
    if (query.minScore) results = results.filter(a => a.reuseScore >= query.minScore);
    return results.sort((a, b) => b.reuseScore - a.reuseScore);
  }

  /**
   * Get all stored artifacts.
   */
  getAll() {
    return [...this._artifacts.values()];
  }

  /**
   * Get artifact count.
   */
  count() {
    return this._artifacts.size;
  }

  /**
   * Get most-reused artifacts.
   */
  getMostReused(limit = 5) {
    return [...this._artifacts.values()]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
}
