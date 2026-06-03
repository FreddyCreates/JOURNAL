const PHI = 1.618033988749895;

/**
 * @typedef {Object} RateLimitConfig
 * @property {string} resourceId
 * @property {number} maxRate — maximum tokens per window
 * @property {number} windowMs — time window in milliseconds
 * @property {number} tokens — current available tokens
 * @property {number} lastRefillAt — timestamp of last token refill
 * @property {Map<string, ClientUsage>} clients — per-client usage tracking
 */

/**
 * @typedef {Object} ClientUsage
 * @property {string} clientId
 * @property {number} requestCount
 * @property {number} lastRequestAt
 * @property {number} throttledCount
 */

/**
 * @typedef {Object} AcquireResult
 * @property {boolean} allowed
 * @property {string} resourceId
 * @property {string} clientId
 * @property {number} remainingTokens
 * @property {number} retryAfterMs
 * @property {number} congestionLevel
 */

/**
 * RateLimiterShield — intelligent rate limiting with phi-weighted
 * throttling for organism resource protection. Tokens refill at
 * rate × PHI^(-congestion_level), naturally slowing under pressure
 * and recovering as load decreases.
 */
export class RateLimiterShield {
  /** @type {Map<string, RateLimitConfig>} */
  #resources;

  /** @type {number} */
  #totalRequests;

  /** @type {number} */
  #totalThrottled;

  constructor() {
    this.#resources = new Map();
    this.#totalRequests = 0;
    this.#totalThrottled = 0;
  }

  /**
   * Configures rate limiting for a resource.
   *
   * The resource starts with a full token bucket. Tokens are consumed
   * on each acquire() call and refilled over time using the phi-weighted
   * refill algorithm.
   *
   * @param {string} resourceId — unique resource identifier
   * @param {number} maxRate — maximum number of tokens per window
   * @param {number} windowMs — time window duration in milliseconds
   * @returns {{ resourceId: string, maxRate: number, windowMs: number, tokens: number }}
   */
  configure(resourceId, maxRate, windowMs) {
    if (maxRate <= 0) {
      throw new Error(`maxRate must be positive, got ${maxRate}`);
    }
    if (windowMs <= 0) {
      throw new Error(`windowMs must be positive, got ${windowMs}`);
    }

    this.#resources.set(resourceId, {
      resourceId,
      maxRate,
      windowMs,
      tokens: maxRate,
      lastRefillAt: Date.now(),
      clients: new Map(),
    });

    return { resourceId, maxRate, windowMs, tokens: maxRate };
  }

  /**
   * Attempts to acquire a rate token for the specified resource.
   *
   * Tokens are refilled before each acquisition check. The refill rate
   * is adjusted by PHI^(-congestionLevel) where congestion is derived
   * from recent throttle ratio. If no tokens are available, the request
   * is throttled and a retry-after time is computed.
   *
   * @param {string} resourceId — the resource to access
   * @param {string} clientId — the requesting client
   * @returns {AcquireResult}
   */
  acquire(resourceId, clientId) {
    const resource = this.#resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource "${resourceId}" not configured. Call configure() first.`);
    }

    this.#totalRequests++;
    this._refillTokens(resource);

    let client = resource.clients.get(clientId);
    if (!client) {
      client = { clientId, requestCount: 0, lastRequestAt: 0, throttledCount: 0 };
      resource.clients.set(clientId, client);
    }

    client.requestCount++;
    client.lastRequestAt = Date.now();

    const congestionLevel = this._computeCongestion(resource);

    if (resource.tokens >= 1) {
      resource.tokens -= 1;
      return {
        allowed: true,
        resourceId,
        clientId,
        remainingTokens: Math.floor(resource.tokens),
        retryAfterMs: 0,
        congestionLevel: Math.round(congestionLevel * 10000) / 10000,
      };
    }

    client.throttledCount++;
    this.#totalThrottled++;

    const refillRate = resource.maxRate * Math.pow(PHI, -congestionLevel);
    const timeForOneToken = refillRate > 0 ? resource.windowMs / refillRate : resource.windowMs;

    return {
      allowed: false,
      resourceId,
      clientId,
      remainingTokens: 0,
      retryAfterMs: Math.ceil(timeForOneToken),
      congestionLevel: Math.round(congestionLevel * 10000) / 10000,
    };
  }

  /**
   * Returns current usage statistics for a resource.
   *
   * @param {string} resourceId
   * @returns {{ resourceId: string, tokens: number, maxRate: number, congestion: number, clientCount: number, clients: Array<ClientUsage> }}
   */
  getUsage(resourceId) {
    const resource = this.#resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource "${resourceId}" not configured`);
    }

    this._refillTokens(resource);
    const congestion = this._computeCongestion(resource);

    const clients = [...resource.clients.values()].map((c) => ({
      clientId: c.clientId,
      requestCount: c.requestCount,
      lastRequestAt: c.lastRequestAt,
      throttledCount: c.throttledCount,
    }));

    return {
      resourceId,
      tokens: Math.floor(resource.tokens),
      maxRate: resource.maxRate,
      congestion: Math.round(congestion * 10000) / 10000,
      clientCount: resource.clients.size,
      clients,
    };
  }

  /**
   * Returns a throttle report for all configured resources.
   *
   * The report includes per-resource congestion levels and a global
   * phi-weighted pressure score that reflects overall system load.
   *
   * @returns {{ resources: Array<Object>, globalPressure: number, totalRequests: number, totalThrottled: number }}
   */
  getThrottleReport() {
    const resources = [];
    let pressureSum = 0;
    let weightSum = 0;

    for (const resource of this.#resources.values()) {
      this._refillTokens(resource);
      const congestion = this._computeCongestion(resource);
      const tokenRatio = resource.tokens / resource.maxRate;
      const weight = resource.maxRate * PHI;

      pressureSum += congestion * weight;
      weightSum += weight;

      resources.push({
        resourceId: resource.resourceId,
        tokens: Math.floor(resource.tokens),
        maxRate: resource.maxRate,
        congestion: Math.round(congestion * 10000) / 10000,
        tokenUtilization: Math.round((1 - tokenRatio) * 10000) / 10000,
        clientCount: resource.clients.size,
      });
    }

    const globalPressure = weightSum > 0
      ? Math.round((pressureSum / weightSum) * 10000) / 10000
      : 0;

    return {
      resources,
      globalPressure,
      totalRequests: this.#totalRequests,
      totalThrottled: this.#totalThrottled,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Refills tokens based on elapsed time and phi-weighted congestion.
   *
   * Tokens refill at: maxRate × PHI^(-congestionLevel) per window.
   * This naturally throttles refill under heavy load and accelerates
   * recovery as congestion drops.
   *
   * @private
   * @param {RateLimitConfig} resource
   */
  _refillTokens(resource) {
    const now = Date.now();
    const elapsed = now - resource.lastRefillAt;
    if (elapsed <= 0) return;

    const congestion = this._computeCongestion(resource);
    const adjustedRate = resource.maxRate * Math.pow(PHI, -congestion);
    const tokensToAdd = (elapsed / resource.windowMs) * adjustedRate;

    resource.tokens = Math.min(resource.maxRate, resource.tokens + tokensToAdd);
    resource.lastRefillAt = now;
  }

  /**
   * Computes congestion level from throttle ratio across all clients.
   *
   * Congestion ranges from 0 (no throttling) to ~3 (extreme pressure).
   * It is computed as the log-phi of the throttle ratio plus 1.
   *
   * @private
   * @param {RateLimitConfig} resource
   * @returns {number}
   */
  _computeCongestion(resource) {
    let totalRequests = 0;
    let totalThrottled = 0;

    for (const client of resource.clients.values()) {
      totalRequests += client.requestCount;
      totalThrottled += client.throttledCount;
    }

    if (totalRequests === 0) return 0;

    const throttleRatio = totalThrottled / totalRequests;
    return Math.log(1 + throttleRatio * (PHI * PHI)) / Math.log(PHI);
  }
}

export default RateLimiterShield;
