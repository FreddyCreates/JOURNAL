/**
 * Sovereign AI API Client
 * 
 * JavaScript client for accessing the Third-Party AI API
 * to retrieve papers, journals, and manage digital fingerprints.
 * 
 * Usage:
 *   const client = new SovereignAIClient();
 *   const papers = await client.searchPapers({ query: 'sovereignty' });
 */

class SovereignAIClient {
  constructor(baseUrl = 'https://freddycreates.github.io/JOURNAL') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.cacheExpiry = 3600000; // 1 hour
  }

  /**
   * Search across all resources
   */
  async search(options = {}) {
    const {
      query = '',
      resourceTypes = null,
      limit = 100,
      useCache = true
    } = options;

    const cacheKey = `search:${query}:${resourceTypes}:${limit}`;
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const params = new URLSearchParams({
      query,
      limit: Math.min(limit, 500)
    });
    if (resourceTypes) params.append('resource_types', resourceTypes);

    const response = await fetch(`${this.baseUrl}/api/ai/search?${params}`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Search papers
   */
  async searchPapers(options = {}) {
    const {
      query = '',
      category = null,
      tags = null,
      author = null,
      limit = 50,
      useCache = true
    } = options;

    const cacheKey = `papers:${query}:${category}:${tags}:${author}:${limit}`;
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const params = new URLSearchParams({
      query,
      limit: Math.min(limit, 500)
    });
    if (category) params.append('category', category);
    if (tags) params.append('tags', Array.isArray(tags) ? tags.join(',') : tags);
    if (author) params.append('author', author);

    const response = await fetch(`${this.baseUrl}/api/ai/papers/search?${params}`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Search journals
   */
  async searchJournals(options = {}) {
    const {
      query = '',
      category = null,
      tags = null,
      limit = 50,
      useCache = true
    } = options;

    const cacheKey = `journals:${query}:${category}:${tags}:${limit}`;
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const params = new URLSearchParams({
      query,
      limit: Math.min(limit, 500)
    });
    if (category) params.append('category', category);
    if (tags) params.append('tags', Array.isArray(tags) ? tags.join(',') : tags);

    const response = await fetch(`${this.baseUrl}/api/ai/journals/search?${params}`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Get all fingerprints
   */
  async getFingerprints(options = {}) {
    const {
      resourceType = null,
      limit = 500,
      useCache = true
    } = options;

    const cacheKey = `fingerprints:${resourceType}:${limit}`;
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const params = new URLSearchParams({
      limit: Math.min(limit, 5000)
    });
    if (resourceType) params.append('resource_type', resourceType);

    const response = await fetch(`${this.baseUrl}/api/ai/fingerprints?${params}`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Get specific fingerprint
   */
  async getFingerprint(resourceId) {
    const cacheKey = `fingerprint:${resourceId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/ai/fingerprints/${resourceId}`);
    const data = await response.json();

    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  /**
   * Verify resource integrity
   */
  async verifyResource(resourceId, contentHash) {
    const params = new URLSearchParams({
      resource_id: resourceId,
      content_hash: contentHash
    });

    const response = await fetch(
      `${this.baseUrl}/api/ai/fingerprints/verify?${params}`,
      { method: 'POST' }
    );

    return await response.json();
  }

  /**
   * Get comprehensive index
   */
  async getIndex(useCache = true) {
    const cacheKey = 'index';
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/ai/index`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Get manifest for bulk indexing
   */
  async getManifest(useCache = true) {
    const cacheKey = 'manifest';
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/ai/manifest`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Get paper with fingerprint
   */
  async getPaper(paperId) {
    const cacheKey = `paper:${paperId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/ai/papers/${paperId}`);
    const data = await response.json();

    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  /**
   * Get journal with fingerprint
   */
  async getJournal(journalId) {
    const cacheKey = `journal:${journalId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/ai/journals/${journalId}`);
    const data = await response.json();

    this.cache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  }

  /**
   * Get API statistics
   */
  async getStats(useCache = true) {
    const cacheKey = 'stats';
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/ai/stats`);
    const data = await response.json();

    if (useCache) {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SovereignAIClient;
}
