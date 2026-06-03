/**
 * @medina/ux-ai-multi-engine — Adaptive UX Runtime
 *
 * Real-time adaptive runtime that connects the UX Intelligence Engine
 * with the Multi-Engine Orchestrator. Manages:
 *   • A/B test allocation and scoring
 *   • User personalization profiles
 *   • Real-time UX mutations based on engagement signals
 *   • Phi-encoded convergence toward optimal UX states
 *
 * @module @medina/ux-ai-multi-engine/adaptive-ux-runtime
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const HEARTBEAT_MS = 873;

/**
 * @typedef {Object} ABTest
 * @property {string} testId
 * @property {string} name
 * @property {Object[]} variants
 * @property {Map<string, string>} allocations — userId → variantId
 * @property {Object} metrics
 * @property {string} status — 'running'|'concluded'|'paused'
 */

/**
 * @typedef {Object} PersonalizationProfile
 * @property {string} userId
 * @property {Object} preferences
 * @property {number} engagementScore
 * @property {Object[]} history
 * @property {number} lastUpdated
 */

class AdaptiveUXRuntime {
  /**
   * @param {Object} [config]
   * @param {number} [config.heartbeatMs=873]
   * @param {number} [config.convergenceRate=0.618]
   * @param {number} [config.abTestSignificance=0.95]
   * @param {number} [config.maxVariants=4]
   */
  constructor(config = {}) {
    this.heartbeatMs = config.heartbeatMs ?? HEARTBEAT_MS;
    this.convergenceRate = config.convergenceRate ?? PHI_INVERSE;
    this.abTestSignificance = config.abTestSignificance ?? 0.95;
    this.maxVariants = config.maxVariants ?? 4;

    /** @type {Map<string, ABTest>} */
    this.abTests = new Map();

    /** @type {Map<string, PersonalizationProfile>} */
    this.profiles = new Map();

    /** @type {Object[]} */
    this.mutations = [];

    /** @type {Object} */
    this.metrics = {
      totalTests: 0,
      activeTests: 0,
      concludedTests: 0,
      totalAllocations: 0,
      totalMutations: 0,
      totalProfiles: 0,
      averageEngagement: 0
    };

    /** @type {string} */
    this.status = 'idle';

    /** @type {number} */
    this.pulseCount = 0;
  }

  /* ================================================================== */
  /*  A/B Testing                                                         */
  /* ================================================================== */

  /**
   * Create a new A/B test.
   * @param {Object} test
   * @param {string} test.name
   * @param {Object[]} test.variants — [{ variantId, config }]
   * @param {number} [test.trafficPercent=100]
   * @returns {ABTest}
   */
  createTest(test) {
    if (!test.variants || test.variants.length < 2) {
      throw new Error('A/B test requires at least 2 variants');
    }
    if (test.variants.length > this.maxVariants) {
      throw new Error(`Maximum ${this.maxVariants} variants allowed`);
    }

    const testId = `ABT-${Date.now().toString(36).toUpperCase()}`;
    const abTest = {
      testId,
      name: test.name,
      variants: test.variants.map((v, i) => ({
        variantId: v.variantId ?? `V${i}`,
        config: v.config ?? {},
        impressions: 0,
        conversions: 0,
        engagementSum: 0
      })),
      allocations: new Map(),
      trafficPercent: test.trafficPercent ?? 100,
      status: 'running',
      createdAt: Date.now(),
      concludedAt: null,
      winner: null
    };

    this.abTests.set(testId, abTest);
    this.metrics.totalTests++;
    this.metrics.activeTests++;

    return {
      testId: abTest.testId,
      name: abTest.name,
      variants: abTest.variants.map(v => ({ variantId: v.variantId })),
      status: abTest.status
    };
  }

  /**
   * Allocate a user to a test variant using phi-weighted hashing.
   * @param {string} testId
   * @param {string} userId
   * @returns {Object} — allocation result
   */
  allocateUser(testId, userId) {
    const test = this.abTests.get(testId);
    if (!test) return { error: 'Test not found' };
    if (test.status !== 'running') return { error: 'Test not running' };

    // Check if already allocated
    if (test.allocations.has(userId)) {
      const variantId = test.allocations.get(userId);
      return { testId, userId, variantId, cached: true };
    }

    // Phi-weighted allocation based on user hash
    const hash = this._hashString(userId + testId);
    const bucket = (hash % 1000) / 1000;
    const variantIndex = Math.floor(bucket * test.variants.length);
    const variant = test.variants[variantIndex];

    test.allocations.set(userId, variant.variantId);
    variant.impressions++;
    this.metrics.totalAllocations++;

    return { testId, userId, variantId: variant.variantId, cached: false };
  }

  /**
   * Record a conversion for a user in a test.
   * @param {string} testId
   * @param {string} userId
   * @param {number} [engagement=1]
   * @returns {Object}
   */
  recordConversion(testId, userId, engagement = 1) {
    const test = this.abTests.get(testId);
    if (!test) return { error: 'Test not found' };

    const variantId = test.allocations.get(userId);
    if (!variantId) return { error: 'User not allocated' };

    const variant = test.variants.find(v => v.variantId === variantId);
    if (variant) {
      variant.conversions++;
      variant.engagementSum += engagement;
    }

    return { testId, userId, variantId, conversions: variant?.conversions };
  }

  /**
   * Conclude a test — determine winner by conversion rate × phi-engagement.
   * @param {string} testId
   * @returns {Object}
   */
  concludeTest(testId) {
    const test = this.abTests.get(testId);
    if (!test) return { error: 'Test not found' };

    let bestVariant = null;
    let bestScore = -Infinity;

    for (const variant of test.variants) {
      const convRate = variant.impressions > 0 ? variant.conversions / variant.impressions : 0;
      const avgEngagement = variant.conversions > 0 ? variant.engagementSum / variant.conversions : 0;
      const score = convRate * PHI + avgEngagement * PHI_INVERSE;

      variant.score = score;
      variant.conversionRate = convRate;

      if (score > bestScore) {
        bestScore = score;
        bestVariant = variant;
      }
    }

    test.status = 'concluded';
    test.concludedAt = Date.now();
    test.winner = bestVariant ? bestVariant.variantId : null;

    this.metrics.activeTests--;
    this.metrics.concludedTests++;

    return {
      testId,
      winner: test.winner,
      variants: test.variants.map(v => ({
        variantId: v.variantId,
        impressions: v.impressions,
        conversions: v.conversions,
        conversionRate: v.conversionRate,
        score: v.score
      }))
    };
  }

  /**
   * Get test status.
   * @param {string} testId
   * @returns {Object|undefined}
   */
  getTestStatus(testId) {
    const test = this.abTests.get(testId);
    if (!test) return undefined;
    return {
      testId: test.testId,
      name: test.name,
      status: test.status,
      allocations: test.allocations.size,
      variants: test.variants.map(v => ({
        variantId: v.variantId,
        impressions: v.impressions,
        conversions: v.conversions
      })),
      winner: test.winner
    };
  }

  /* ================================================================== */
  /*  Personalization                                                     */
  /* ================================================================== */

  /**
   * Create or update a user's personalization profile.
   * @param {string} userId
   * @param {Object} preferences — UX preferences
   * @returns {PersonalizationProfile}
   */
  setProfile(userId, preferences) {
    let profile = this.profiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        preferences: {},
        engagementScore: 0.5,
        history: [],
        createdAt: Date.now(),
        lastUpdated: 0
      };
      this.profiles.set(userId, profile);
      this.metrics.totalProfiles++;
    }

    // Merge preferences with phi-weighted decay
    for (const [key, value] of Object.entries(preferences)) {
      const existing = profile.preferences[key];
      if (existing !== undefined && typeof existing === 'number' && typeof value === 'number') {
        profile.preferences[key] = existing * (1 - this.convergenceRate) + value * this.convergenceRate;
      } else {
        profile.preferences[key] = value;
      }
    }

    profile.lastUpdated = Date.now();
    profile.history.push({ preferences: { ...preferences }, timestamp: Date.now() });

    if (profile.history.length > 20) {
      profile.history.shift();
    }

    return { ...profile, history: profile.history.length };
  }

  /**
   * Get a user's personalization profile.
   * @param {string} userId
   * @returns {Object|undefined}
   */
  getProfile(userId) {
    const profile = this.profiles.get(userId);
    if (!profile) return undefined;
    return {
      userId: profile.userId,
      preferences: { ...profile.preferences },
      engagementScore: profile.engagementScore,
      historyLength: profile.history.length,
      lastUpdated: profile.lastUpdated
    };
  }

  /**
   * Update engagement score for a user.
   * @param {string} userId
   * @param {number} delta — engagement change (-1 to +1)
   * @returns {Object}
   */
  updateEngagement(userId, delta) {
    const profile = this.profiles.get(userId);
    if (!profile) return { error: 'Profile not found' };

    profile.engagementScore = Math.max(0, Math.min(1, profile.engagementScore + delta * PHI_INVERSE));
    profile.lastUpdated = Date.now();

    // Recalculate average engagement
    const allScores = Array.from(this.profiles.values()).map(p => p.engagementScore);
    this.metrics.averageEngagement = allScores.reduce((s, v) => s + v, 0) / allScores.length;

    return { userId, engagementScore: profile.engagementScore };
  }

  /* ================================================================== */
  /*  UX Mutations                                                        */
  /* ================================================================== */

  /**
   * Apply a UX mutation based on intelligence data.
   * @param {Object} mutation
   * @param {string} mutation.target — target component/scope
   * @param {string} mutation.property — property to mutate
   * @param {*} mutation.value — new value
   * @param {string} [mutation.reason='auto']
   * @param {string} [mutation.userId]
   * @returns {Object}
   */
  applyMutation(mutation) {
    const record = {
      mutationId: `MUT-${this.mutations.length + 1}`,
      target: mutation.target,
      property: mutation.property,
      value: mutation.value,
      reason: mutation.reason ?? 'auto',
      userId: mutation.userId ?? null,
      appliedAt: Date.now(),
      pulse: this.pulseCount
    };

    this.mutations.push(record);
    this.metrics.totalMutations++;

    // Keep bounded
    if (this.mutations.length > 100) {
      this.mutations.shift();
    }

    return record;
  }

  /**
   * Get recent mutations.
   * @param {number} [limit=10]
   * @returns {Object[]}
   */
  getRecentMutations(limit = 10) {
    return this.mutations.slice(-limit);
  }

  /* ================================================================== */
  /*  Runtime Pulse                                                       */
  /* ================================================================== */

  /**
   * Execute one runtime pulse — processes profiles, tests, and mutations.
   * @returns {Object}
   */
  pulse() {
    this.pulseCount++;
    this.status = 'running';

    const report = {
      pulse: this.pulseCount,
      timestamp: Date.now(),
      activeTests: this.metrics.activeTests,
      totalProfiles: this.metrics.totalProfiles,
      recentMutations: this.mutations.length,
      averageEngagement: this.metrics.averageEngagement
    };

    return report;
  }

  /**
   * Get runtime metrics.
   * @returns {Object}
   */
  getMetrics() {
    return { ...this.metrics, pulseCount: this.pulseCount, status: this.status };
  }

  /* ================================================================== */
  /*  Helpers                                                             */
  /* ================================================================== */

  /**
   * Simple string hash for deterministic allocation.
   * @param {string} str
   * @returns {number}
   * @private
   */
  _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export { AdaptiveUXRuntime };
export default AdaptiveUXRuntime;
