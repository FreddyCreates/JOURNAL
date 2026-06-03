/**
 * RecipeCatalog — stores, searches, and manages recipe library.
 * @module @medina/recipe-lens-sdk/recipe-catalog
 */

const PHI = 1.618033988749895;

/**
 * @typedef {Object} CatalogEntry
 * @property {string} id
 * @property {string} name
 * @property {string[]} tags
 * @property {string} description
 * @property {Object} recipe
 * @property {number} executionCount
 * @property {number} addedAt
 */

export class RecipeCatalog {
  /** @type {Map<string, CatalogEntry>} */
  #entries;

  constructor() {
    this.#entries = new Map();
  }

  /**
   * Add a recipe to the catalog.
   * @param {Object} recipe - Recipe object (must have id, name)
   * @param {Object} [meta={}] - Extra metadata { tags, description }
   * @returns {{ id: string, added: boolean }}
   */
  add(recipe, meta = {}) {
    if (!recipe || !recipe.id) throw new Error('Recipe must have an id');
    const entry = {
      id: recipe.id,
      name: recipe.name || recipe.id,
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      description: meta.description || '',
      recipe,
      executionCount: 0,
      addedAt: Date.now()
    };
    this.#entries.set(recipe.id, entry);
    return { id: recipe.id, added: true };
  }

  /**
   * Retrieve a recipe by ID.
   * @param {string} recipeId
   * @returns {CatalogEntry|undefined}
   */
  get(recipeId) {
    return this.#entries.get(recipeId);
  }

  /**
   * Search recipes by substring match on name, description, or tags.
   * @param {string} query
   * @returns {CatalogEntry[]}
   */
  search(query) {
    const q = query.toLowerCase();
    const results = [];
    for (const entry of this.#entries.values()) {
      const haystack = [entry.name, entry.description, ...entry.tags].join(' ').toLowerCase();
      if (haystack.includes(q)) {
        results.push(entry);
      }
    }
    return results;
  }

  /**
   * List recipes by tag.
   * @param {string} tag
   * @returns {CatalogEntry[]}
   */
  listByTag(tag) {
    const t = tag.toLowerCase();
    return [...this.#entries.values()].filter(e => e.tags.some(tg => tg.toLowerCase() === t));
  }

  /**
   * Return most-executed recipes.
   * @param {number} [count=5]
   * @returns {CatalogEntry[]}
   */
  getPopular(count = 5) {
    return [...this.#entries.values()]
      .sort((a, b) => b.executionCount - a.executionCount)
      .slice(0, count);
  }

  /**
   * Record an execution for a recipe.
   * @param {string} recipeId
   */
  recordExecution(recipeId) {
    const entry = this.#entries.get(recipeId);
    if (entry) entry.executionCount++;
  }

  /**
   * Export the catalog as a serializable object.
   * @returns {Object}
   */
  export() {
    const items = [];
    for (const entry of this.#entries.values()) {
      items.push({ ...entry });
    }
    return { version: '1.0.0', phi: PHI, exportedAt: Date.now(), items };
  }

  /**
   * Import a previously exported catalog.
   * @param {Object} data
   * @returns {{ imported: number }}
   */
  import(data) {
    if (!data || !Array.isArray(data.items)) throw new Error('Invalid catalog data');
    let count = 0;
    for (const item of data.items) {
      if (item.id) {
        this.#entries.set(item.id, item);
        count++;
      }
    }
    return { imported: count };
  }

  /**
   * Get catalog size.
   * @returns {number}
   */
  get size() {
    return this.#entries.size;
  }

  /**
   * Get catalog stats with phi-weighted popularity score.
   * @returns {Object}
   */
  getStats() {
    let totalExec = 0;
    for (const e of this.#entries.values()) totalExec += e.executionCount;
    return {
      totalRecipes: this.#entries.size,
      totalExecutions: totalExec,
      avgExecutions: this.#entries.size > 0 ? totalExec / this.#entries.size : 0,
      popularityIndex: Math.log(1 + totalExec) * PHI
    };
  }
}

export default RecipeCatalog;
