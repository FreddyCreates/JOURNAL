/**
 * @medina/ux-ai-multi-engine — UX Intelligence Engine
 *
 * Core UX intelligence engine providing five cognitive capabilities:
 *   1. Perception — senses user context, device state, viewport, and intent
 *   2. Interaction — predicts and optimizes interaction patterns
 *   3. Adaptation — evolves UI layout, theme, density in real time
 *   4. Prediction — forecasts user flows and pre-renders next states
 *   5. Generation — synthesizes new UX components from learned patterns
 *
 * All engines use phi-encoded timing and golden-ratio weighted scoring.
 *
 * @module @medina/ux-ai-multi-engine/ux-intelligence-engine
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const HEARTBEAT_MS = 873;
const GOLDEN_ANGLE = 2.399963229728653;

/**
 * @typedef {'idle'|'perceiving'|'interacting'|'adapting'|'predicting'|'generating'} EnginePhase
 */

/**
 * @typedef {Object} PerceptionFrame
 * @property {string} userId
 * @property {string} deviceType
 * @property {number} viewportWidth
 * @property {number} viewportHeight
 * @property {string} intent
 * @property {number} confidence
 * @property {number} timestamp
 */

/**
 * @typedef {Object} InteractionPattern
 * @property {string} patternId
 * @property {string} type
 * @property {number} frequency
 * @property {number} weight
 * @property {string[]} sequence
 */

class UXIntelligenceEngine {
  /**
   * @param {Object} [config]
   * @param {number} [config.heartbeatMs=873]
   * @param {number} [config.perceptionDepth=5]
   * @param {number} [config.adaptationRate=0.618]
   * @param {number} [config.predictionHorizon=3]
   * @param {number} [config.generationThreshold=0.75]
   */
  constructor(config = {}) {
    this.heartbeatMs = config.heartbeatMs ?? HEARTBEAT_MS;
    this.perceptionDepth = config.perceptionDepth ?? 5;
    this.adaptationRate = config.adaptationRate ?? PHI_INVERSE;
    this.predictionHorizon = config.predictionHorizon ?? 3;
    this.generationThreshold = config.generationThreshold ?? 0.75;

    /** @type {PerceptionFrame[]} */
    this.perceptionStack = [];

    /** @type {Map<string, InteractionPattern>} */
    this.interactionPatterns = new Map();

    /** @type {Map<string, Object>} */
    this.adaptationState = new Map();

    /** @type {Object[]} */
    this.predictions = [];

    /** @type {Object[]} */
    this.generatedComponents = [];

    /** @type {EnginePhase} */
    this.phase = 'idle';

    /** @type {number} */
    this.cycleCount = 0;

    /** @type {Object} */
    this.metrics = {
      perceptionsProcessed: 0,
      interactionsAnalyzed: 0,
      adaptationsApplied: 0,
      predictionsMade: 0,
      componentsGenerated: 0,
      averageConfidence: 0,
      totalLatencyMs: 0
    };
  }

  /* ================================================================== */
  /*  Perception Engine                                                   */
  /* ================================================================== */

  /**
   * Perceive user context and environment state.
   * Builds a perception frame from raw signals and pushes onto the stack.
   *
   * @param {Object} signals — raw perception signals
   * @param {string} signals.userId — user identifier
   * @param {string} [signals.deviceType='desktop'] — device class
   * @param {number} [signals.viewportWidth=1920]
   * @param {number} [signals.viewportHeight=1080]
   * @param {string} [signals.intent='browse'] — detected user intent
   * @param {Object} [signals.context={}] — additional context
   * @returns {PerceptionFrame}
   */
  perceive(signals) {
    this.phase = 'perceiving';
    const now = Date.now();

    const confidence = this._calculateConfidence(signals);

    const frame = {
      userId: signals.userId,
      deviceType: signals.deviceType ?? 'desktop',
      viewportWidth: signals.viewportWidth ?? 1920,
      viewportHeight: signals.viewportHeight ?? 1080,
      intent: signals.intent ?? 'browse',
      confidence,
      context: signals.context ?? {},
      timestamp: now,
      cycleId: this.cycleCount
    };

    this.perceptionStack.push(frame);

    // Keep stack bounded to perceptionDepth × PHI
    const maxDepth = Math.ceil(this.perceptionDepth * PHI);
    while (this.perceptionStack.length > maxDepth) {
      this.perceptionStack.shift();
    }

    this.metrics.perceptionsProcessed++;
    this._updateAverageConfidence(confidence);

    this.phase = 'idle';
    return frame;
  }

  /**
   * Get the most recent perception frame.
   * @returns {PerceptionFrame|null}
   */
  getLatestPerception() {
    return this.perceptionStack.length > 0
      ? this.perceptionStack[this.perceptionStack.length - 1]
      : null;
  }

  /**
   * Get perception history for a specific user.
   * @param {string} userId
   * @returns {PerceptionFrame[]}
   */
  getUserPerceptions(userId) {
    return this.perceptionStack.filter(f => f.userId === userId);
  }

  /* ================================================================== */
  /*  Interaction Engine                                                  */
  /* ================================================================== */

  /**
   * Record and analyze an interaction event.
   * Builds or updates interaction patterns based on event sequences.
   *
   * @param {Object} event — interaction event
   * @param {string} event.type — event type (click, scroll, hover, gesture, voice)
   * @param {string} event.target — target element/component
   * @param {string} [event.userId] — user who triggered
   * @param {Object} [event.metadata={}] — extra event data
   * @returns {InteractionPattern}
   */
  recordInteraction(event) {
    this.phase = 'interacting';

    const patternId = `${event.type}:${event.target}`;
    let pattern = this.interactionPatterns.get(patternId);

    if (!pattern) {
      pattern = {
        patternId,
        type: event.type,
        target: event.target,
        frequency: 0,
        weight: 0,
        sequence: [],
        firstSeen: Date.now(),
        lastSeen: 0,
        users: new Set()
      };
      this.interactionPatterns.set(patternId, pattern);
    }

    pattern.frequency++;
    pattern.lastSeen = Date.now();
    pattern.weight = this._phiWeight(pattern.frequency);

    if (event.userId) {
      pattern.users.add(event.userId);
    }

    // Track sequence (last N events)
    pattern.sequence.push(event.type);
    if (pattern.sequence.length > 10) {
      pattern.sequence.shift();
    }

    this.metrics.interactionsAnalyzed++;
    this.phase = 'idle';

    return {
      patternId: pattern.patternId,
      type: pattern.type,
      target: pattern.target,
      frequency: pattern.frequency,
      weight: pattern.weight,
      sequence: [...pattern.sequence]
    };
  }

  /**
   * Get top interaction patterns ranked by phi-weighted frequency.
   * @param {number} [limit=10]
   * @returns {Object[]}
   */
  getTopPatterns(limit = 10) {
    const patterns = Array.from(this.interactionPatterns.values())
      .map(p => ({
        patternId: p.patternId,
        type: p.type,
        target: p.target,
        frequency: p.frequency,
        weight: p.weight,
        userCount: p.users.size
      }))
      .sort((a, b) => b.weight - a.weight);
    return patterns.slice(0, limit);
  }

  /* ================================================================== */
  /*  Adaptation Engine                                                   */
  /* ================================================================== */

  /**
   * Adapt a UX property based on perception and interaction data.
   *
   * Uses exponential moving average with phi-rate decay:
   *   newValue = currentValue × (1 - adaptationRate) + targetValue × adaptationRate
   *
   * @param {Object} adaptation — adaptation request
   * @param {string} adaptation.property — property to adapt (layout, theme, density, speed, contrast)
   * @param {string} adaptation.target — target component or scope
   * @param {number} adaptation.targetValue — desired target value (0–1 normalized)
   * @param {string} [adaptation.reason='auto'] — reason for adaptation
   * @returns {Object} — adaptation result with old/new values
   */
  adapt(adaptation) {
    this.phase = 'adapting';
    const key = `${adaptation.property}:${adaptation.target}`;

    let state = this.adaptationState.get(key);
    if (!state) {
      state = {
        property: adaptation.property,
        target: adaptation.target,
        currentValue: 0.5,
        history: [],
        adaptationCount: 0
      };
      this.adaptationState.set(key, state);
    }

    const oldValue = state.currentValue;
    const newValue = oldValue * (1 - this.adaptationRate) + adaptation.targetValue * this.adaptationRate;

    state.currentValue = newValue;
    state.adaptationCount++;
    state.history.push({
      from: oldValue,
      to: newValue,
      targetValue: adaptation.targetValue,
      reason: adaptation.reason ?? 'auto',
      timestamp: Date.now()
    });

    // Keep history bounded
    if (state.history.length > 20) {
      state.history.shift();
    }

    this.metrics.adaptationsApplied++;
    this.phase = 'idle';

    return {
      property: adaptation.property,
      target: adaptation.target,
      oldValue,
      newValue,
      delta: newValue - oldValue,
      adaptationCount: state.adaptationCount,
      convergence: 1 - Math.abs(newValue - adaptation.targetValue)
    };
  }

  /**
   * Get all adaptation states.
   * @returns {Object[]}
   */
  getAdaptationStates() {
    return Array.from(this.adaptationState.values()).map(s => ({
      property: s.property,
      target: s.target,
      currentValue: s.currentValue,
      adaptationCount: s.adaptationCount
    }));
  }

  /* ================================================================== */
  /*  Prediction Engine                                                   */
  /* ================================================================== */

  /**
   * Predict the next user actions based on interaction history and patterns.
   * Uses Markov-like transition probabilities weighted by PHI.
   *
   * @param {string} userId — user to predict for
   * @param {string} currentAction — current user action/state
   * @returns {Object} — prediction result with ranked next actions
   */
  predict(userId, currentAction) {
    this.phase = 'predicting';

    // Gather patterns related to current action
    const relatedPatterns = [];
    for (const pattern of this.interactionPatterns.values()) {
      if (pattern.sequence.includes(currentAction)) {
        relatedPatterns.push(pattern);
      }
    }

    // Build transition probabilities
    const transitions = new Map();
    for (const pattern of relatedPatterns) {
      const seq = pattern.sequence;
      for (let i = 0; i < seq.length - 1; i++) {
        if (seq[i] === currentAction) {
          const next = seq[i + 1];
          const current = transitions.get(next) ?? 0;
          transitions.set(next, current + pattern.weight);
        }
      }
    }

    // Normalize and rank predictions
    const totalWeight = Array.from(transitions.values()).reduce((s, v) => s + v, 0);
    const ranked = Array.from(transitions.entries())
      .map(([action, weight]) => ({
        action,
        probability: totalWeight > 0 ? weight / totalWeight : 0,
        confidence: totalWeight > 0 ? Math.min(weight / totalWeight * PHI, 1) : 0
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, this.predictionHorizon);

    const prediction = {
      userId,
      currentAction,
      predictions: ranked,
      patternCount: relatedPatterns.length,
      timestamp: Date.now(),
      horizon: this.predictionHorizon
    };

    this.predictions.push(prediction);
    if (this.predictions.length > 50) {
      this.predictions.shift();
    }

    this.metrics.predictionsMade++;
    this.phase = 'idle';

    return prediction;
  }

  /* ================================================================== */
  /*  Generation Engine                                                   */
  /* ================================================================== */

  /**
   * Generate a new UX component based on learned patterns and adaptations.
   * Only generates if confidence exceeds the generation threshold.
   *
   * @param {Object} spec — component generation specification
   * @param {string} spec.type — component type (button, card, form, nav, modal)
   * @param {string} spec.purpose — intended purpose
   * @param {Object} [spec.constraints={}] — generation constraints
   * @returns {Object} — generated component descriptor
   */
  generate(spec) {
    this.phase = 'generating';

    // Calculate generation confidence from recent perceptions
    const recentPerceptions = this.perceptionStack.slice(-this.perceptionDepth);
    const avgConfidence = recentPerceptions.length > 0
      ? recentPerceptions.reduce((s, p) => s + p.confidence, 0) / recentPerceptions.length
      : 0;

    if (avgConfidence < this.generationThreshold && recentPerceptions.length > 0) {
      this.phase = 'idle';
      return {
        status: 'below-threshold',
        confidence: avgConfidence,
        threshold: this.generationThreshold,
        message: 'Insufficient confidence for generation'
      };
    }

    // Derive properties from adaptation state
    const properties = {};
    for (const [key, state] of this.adaptationState) {
      if (key.startsWith(spec.type) || key.includes(spec.purpose)) {
        properties[state.property] = state.currentValue;
      }
    }

    // Generate component descriptor
    const component = {
      componentId: `GEN-${Date.now().toString(36).toUpperCase()}-${this.generatedComponents.length}`,
      type: spec.type,
      purpose: spec.purpose,
      properties: {
        density: properties.density ?? PHI_INVERSE,
        contrast: properties.contrast ?? 0.5,
        speed: properties.speed ?? PHI_INVERSE,
        layout: properties.layout ?? 0.5,
        ...spec.constraints
      },
      confidence: avgConfidence || PHI_INVERSE,
      generatedAt: Date.now(),
      basedOnPatterns: this.getTopPatterns(3).map(p => p.patternId),
      phiScore: avgConfidence * PHI
    };

    this.generatedComponents.push(component);
    this.metrics.componentsGenerated++;
    this.phase = 'idle';

    return { status: 'generated', component };
  }

  /**
   * Get all generated components.
   * @returns {Object[]}
   */
  getGeneratedComponents() {
    return [...this.generatedComponents];
  }

  /* ================================================================== */
  /*  Cycle & Metrics                                                     */
  /* ================================================================== */

  /**
   * Run one full intelligence cycle: perceive → interact → adapt → predict → generate.
   * @param {Object} input — cycle input containing signals and events
   * @returns {Object} — full cycle report
   */
  runCycle(input) {
    this.cycleCount++;
    const startTime = Date.now();

    const perception = input.signals ? this.perceive(input.signals) : null;

    const interaction = input.event ? this.recordInteraction(input.event) : null;

    const adaptation = input.adaptation ? this.adapt(input.adaptation) : null;

    const prediction = (input.signals?.userId && input.event?.type)
      ? this.predict(input.signals.userId, input.event.type)
      : null;

    const generation = input.generateSpec ? this.generate(input.generateSpec) : null;

    const latencyMs = Date.now() - startTime;
    this.metrics.totalLatencyMs += latencyMs;

    return {
      cycleId: this.cycleCount,
      perception,
      interaction,
      adaptation,
      prediction,
      generation,
      latencyMs,
      timestamp: Date.now()
    };
  }

  /**
   * Get engine metrics.
   * @returns {Object}
   */
  getMetrics() {
    return {
      ...this.metrics,
      cycleCount: this.cycleCount,
      phase: this.phase,
      perceptionStackDepth: this.perceptionStack.length,
      patternCount: this.interactionPatterns.size,
      adaptationCount: this.adaptationState.size,
      predictionCount: this.predictions.length,
      generatedCount: this.generatedComponents.length
    };
  }

  /* ================================================================== */
  /*  Private Helpers                                                     */
  /* ================================================================== */

  /**
   * Calculate confidence score from perception signals.
   * @param {Object} signals
   * @returns {number} 0–1 confidence
   * @private
   */
  _calculateConfidence(signals) {
    let score = 0;
    let factors = 0;

    if (signals.userId) { score += 0.3; factors++; }
    if (signals.deviceType) { score += 0.2; factors++; }
    if (signals.viewportWidth && signals.viewportHeight) { score += 0.2; factors++; }
    if (signals.intent && signals.intent !== 'browse') { score += 0.2; factors++; }
    if (signals.context && Object.keys(signals.context).length > 0) { score += 0.1; factors++; }

    return factors > 0 ? Math.min(score * PHI, 1) : PHI_INVERSE;
  }

  /**
   * Calculate phi-weighted importance for a frequency value.
   * @param {number} frequency
   * @returns {number}
   * @private
   */
  _phiWeight(frequency) {
    return Math.log(1 + frequency) * PHI_INVERSE;
  }

  /**
   * Update rolling average confidence.
   * @param {number} newConfidence
   * @private
   */
  _updateAverageConfidence(newConfidence) {
    const n = this.metrics.perceptionsProcessed;
    this.metrics.averageConfidence =
      (this.metrics.averageConfidence * (n - 1) + newConfidence) / n;
  }
}

export { UXIntelligenceEngine };
export default UXIntelligenceEngine;
