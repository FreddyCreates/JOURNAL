/**
 * @medina/backend-intelligence-engines — TemporalReasoningProtocol
 *
 * PROTO-232: Temporal Reasoning Protocol
 * Models time-aware cognition with causal inference, temporal abstraction,
 * and predictive processing using phi-encoded time scales.
 *
 * Brain analog: Hippocampal time cells + Prefrontal temporal integration
 *
 * @module @medina/backend-intelligence-engines/temporal-reasoning-protocol
 */

// ════════════════════════════════════════════════════════════════════════════
// PHI-ENCODED CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;
const PHI_SQUARED = PHI * PHI;
const PHI_CUBED = PHI * PHI * PHI;

// Phi-scaled time constants (in milliseconds)
const TIME_SCALES = {
  IMMEDIATE: 100,                    // ~100ms - immediate perception
  SHORT: 100 * PHI,                  // ~162ms - working memory window
  MEDIUM: 100 * PHI_SQUARED,         // ~262ms - attention span
  LONG: 100 * PHI_CUBED,             // ~424ms - deliberation
  EXTENDED: 100 * PHI ** 4,          // ~686ms - planning horizon
  EPISODIC: 100 * PHI ** 5,          // ~1.1s - episodic memory
  NARRATIVE: 100 * PHI ** 6,         // ~1.8s - narrative integration
  STRATEGIC: 100 * PHI ** 7          // ~2.9s - strategic thinking
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPORAL EVENT REPRESENTATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * TemporalEvent represents a time-stamped cognitive event
 */
class TemporalEvent {
  constructor(data, timestamp = Date.now()) {
    this.id = `evt_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;
    this.data = data;
    this.timestamp = timestamp;
    this.duration = data.duration || 0;
    this.causalLinks = new Set();
    this.effects = new Set();
    this.confidence = data.confidence || 1.0;
    this.salience = data.salience || PHI_INVERSE;
  }

  /**
   * Check if this event overlaps with another in time
   * @param {TemporalEvent} other - Other event
   * @returns {boolean} Whether events overlap
   */
  overlaps(other) {
    const thisEnd = this.timestamp + this.duration;
    const otherEnd = other.timestamp + other.duration;
    return this.timestamp < otherEnd && other.timestamp < thisEnd;
  }

  /**
   * Check if this event precedes another
   * @param {TemporalEvent} other - Other event
   * @returns {boolean} Whether this event precedes other
   */
  precedes(other) {
    return this.timestamp + this.duration <= other.timestamp;
  }

  /**
   * Calculate temporal distance to another event
   * @param {TemporalEvent} other - Other event
   * @returns {number} Temporal distance in ms
   */
  temporalDistance(other) {
    return Math.abs(this.timestamp - other.timestamp);
  }

  /**
   * Add a causal link to another event
   * @param {string} eventId - ID of caused event
   * @param {number} strength - Causal strength [0,1]
   */
  addCausalLink(eventId, strength = PHI_INVERSE) {
    this.causalLinks.add({ eventId, strength, createdAt: Date.now() });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPORAL MEMORY BUFFER
// ════════════════════════════════════════════════════════════════════════════

/**
 * TemporalMemoryBuffer maintains a time-ordered sequence of events
 * with phi-scaled decay and consolidation
 */
class TemporalMemoryBuffer {
  constructor(config = {}) {
    this.maxSize = config.maxSize || 1000;
    this.decayRate = config.decayRate || PHI_INVERSE / 1000; // per ms
    this.consolidationThreshold = config.consolidationThreshold || PHI_INVERSE;
    
    this.events = [];
    this.eventIndex = new Map();
    this.lastConsolidation = Date.now();
  }

  /**
   * Add an event to the buffer
   * @param {TemporalEvent} event - Event to add
   */
  add(event) {
    this.events.push(event);
    this.eventIndex.set(event.id, event);
    
    // Maintain size limit with phi-weighted removal
    while (this.events.length > this.maxSize) {
      const removed = this.events.shift();
      this.eventIndex.delete(removed.id);
    }

    // Sort by timestamp
    this.events.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {TemporalEvent|undefined} The event
   */
  get(eventId) {
    return this.eventIndex.get(eventId);
  }

  /**
   * Query events in a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {TemporalEvent[]} Events in range
   */
  queryRange(startTime, endTime) {
    return this.events.filter(e => 
      e.timestamp >= startTime && e.timestamp <= endTime
    );
  }

  /**
   * Get recent events within a time scale
   * @param {string} scale - Time scale name from TIME_SCALES
   * @returns {TemporalEvent[]} Recent events
   */
  getRecent(scale = 'MEDIUM') {
    const window = TIME_SCALES[scale] || TIME_SCALES.MEDIUM;
    const cutoff = Date.now() - window;
    return this.events.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Apply temporal decay to event salience
   */
  applyDecay() {
    const now = Date.now();
    
    for (const event of this.events) {
      const age = now - event.timestamp;
      const decayFactor = Math.exp(-this.decayRate * age);
      event.salience *= decayFactor;
    }

    // Remove events below threshold
    this.events = this.events.filter(e => e.salience > 0.01);
    this.eventIndex = new Map(this.events.map(e => [e.id, e]));
  }

  /**
   * Consolidate similar events into abstractions
   * @returns {Object[]} Consolidated patterns
   */
  consolidate() {
    const now = Date.now();
    const patterns = [];
    
    // Group events by similarity
    const groups = this._clusterEvents();
    
    for (const group of groups) {
      if (group.length >= 3) { // Minimum for pattern
        const pattern = {
          id: `pat_${now}_${Math.random().toString(36).slice(2, 6)}`,
          eventCount: group.length,
          timeSpan: {
            start: Math.min(...group.map(e => e.timestamp)),
            end: Math.max(...group.map(e => e.timestamp + e.duration))
          },
          averageSalience: group.reduce((sum, e) => sum + e.salience, 0) / group.length,
          consolidatedAt: now
        };
        patterns.push(pattern);
      }
    }

    this.lastConsolidation = now;
    return patterns;
  }

  _clusterEvents() {
    // Simple clustering by temporal proximity
    const clusters = [];
    let currentCluster = [];
    
    for (let i = 0; i < this.events.length; i++) {
      if (currentCluster.length === 0) {
        currentCluster.push(this.events[i]);
      } else {
        const lastEvent = currentCluster[currentCluster.length - 1];
        const gap = this.events[i].timestamp - (lastEvent.timestamp + lastEvent.duration);
        
        if (gap < TIME_SCALES.SHORT) {
          currentCluster.push(this.events[i]);
        } else {
          if (currentCluster.length > 0) {
            clusters.push(currentCluster);
          }
          currentCluster = [this.events[i]];
        }
      }
    }
    
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }
    
    return clusters;
  }

  /**
   * Get buffer statistics
   * @returns {Object} Buffer stats
   */
  getStats() {
    const now = Date.now();
    const ages = this.events.map(e => now - e.timestamp);
    
    return {
      eventCount: this.events.length,
      oldestEvent: ages.length > 0 ? Math.max(...ages) : 0,
      newestEvent: ages.length > 0 ? Math.min(...ages) : 0,
      averageAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
      averageSalience: this.events.length > 0 
        ? this.events.reduce((sum, e) => sum + e.salience, 0) / this.events.length 
        : 0,
      lastConsolidation: this.lastConsolidation
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// CAUSAL INFERENCE ENGINE
// ════════════════════════════════════════════════════════════════════════════

/**
 * CausalInferenceEngine infers causal relationships between events
 */
class CausalInferenceEngine {
  constructor(config = {}) {
    this.temporalWindow = config.temporalWindow || TIME_SCALES.LONG;
    this.minCooccurrence = config.minCooccurrence || 3;
    this.causalThreshold = config.causalThreshold || PHI_INVERSE;
    
    this.causalGraph = new Map();
    this.cooccurrenceMatrix = new Map();
  }

  /**
   * Record a potential causal relationship
   * @param {TemporalEvent} cause - Potential cause event
   * @param {TemporalEvent} effect - Potential effect event
   */
  recordCooccurrence(cause, effect) {
    if (!cause.precedes(effect)) return;
    
    const gap = effect.timestamp - (cause.timestamp + cause.duration);
    if (gap > this.temporalWindow) return;

    const key = `${cause.data.type || 'unknown'}->${effect.data.type || 'unknown'}`;
    
    if (!this.cooccurrenceMatrix.has(key)) {
      this.cooccurrenceMatrix.set(key, {
        count: 0,
        totalGap: 0,
        instances: []
      });
    }

    const record = this.cooccurrenceMatrix.get(key);
    record.count++;
    record.totalGap += gap;
    record.instances.push({
      causeId: cause.id,
      effectId: effect.id,
      gap,
      timestamp: Date.now()
    });

    // Limit instance history
    if (record.instances.length > 100) {
      record.instances = record.instances.slice(-100);
    }
  }

  /**
   * Infer causal relationships from cooccurrence data
   * @returns {Object[]} Inferred causal relationships
   */
  inferCausality() {
    const relationships = [];

    for (const [key, record] of this.cooccurrenceMatrix) {
      if (record.count >= this.minCooccurrence) {
        const [causeType, effectType] = key.split('->');
        const avgGap = record.totalGap / record.count;
        
        // Calculate causal strength using phi-weighted formula
        const temporalConsistency = 1 / (1 + Math.log(1 + this._gapVariance(record.instances)));
        const frequency = Math.min(1, record.count / (this.minCooccurrence * PHI_SQUARED));
        const causalStrength = (temporalConsistency * PHI + frequency) / (1 + PHI);

        if (causalStrength >= this.causalThreshold) {
          relationships.push({
            cause: causeType,
            effect: effectType,
            strength: causalStrength,
            averageDelay: avgGap,
            occurrences: record.count,
            confidence: temporalConsistency
          });

          // Update causal graph
          if (!this.causalGraph.has(causeType)) {
            this.causalGraph.set(causeType, new Map());
          }
          this.causalGraph.get(causeType).set(effectType, causalStrength);
        }
      }
    }

    return relationships.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Predict likely effects given a cause
   * @param {string} causeType - Type of cause event
   * @returns {Object[]} Predicted effects with probabilities
   */
  predictEffects(causeType) {
    const effects = this.causalGraph.get(causeType);
    if (!effects) return [];

    return Array.from(effects.entries())
      .map(([effectType, strength]) => ({
        effect: effectType,
        probability: strength,
        expectedDelay: this._getExpectedDelay(causeType, effectType)
      }))
      .sort((a, b) => b.probability - a.probability);
  }

  /**
   * Explain an effect by finding likely causes
   * @param {string} effectType - Type of effect event
   * @returns {Object[]} Potential causes with probabilities
   */
  explainEffect(effectType) {
    const causes = [];

    for (const [causeType, effects] of this.causalGraph) {
      if (effects.has(effectType)) {
        causes.push({
          cause: causeType,
          probability: effects.get(effectType),
          expectedDelay: this._getExpectedDelay(causeType, effectType)
        });
      }
    }

    return causes.sort((a, b) => b.probability - a.probability);
  }

  _gapVariance(instances) {
    if (instances.length < 2) return 0;
    const gaps = instances.map(i => i.gap);
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    return gaps.reduce((sum, g) => sum + (g - mean) ** 2, 0) / gaps.length;
  }

  _getExpectedDelay(causeType, effectType) {
    const key = `${causeType}->${effectType}`;
    const record = this.cooccurrenceMatrix.get(key);
    return record ? record.totalGap / record.count : TIME_SCALES.MEDIUM;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPORAL REASONING PROTOCOL
// ════════════════════════════════════════════════════════════════════════════

/**
 * TemporalReasoningProtocol manages time-aware cognitive processing
 * Implements PROTO-232 for the organism substrate
 */
class TemporalReasoningProtocol {
  constructor(config = {}) {
    this.protocolId = 'PROTO-232';
    this.name = 'Temporal Reasoning Protocol';
    this.version = '1.0.0';

    this.config = {
      bufferSize: config.bufferSize || 1000,
      decayRate: config.decayRate || PHI_INVERSE / 1000,
      predictionHorizon: config.predictionHorizon || TIME_SCALES.STRATEGIC,
      ...config
    };

    this.memoryBuffer = new TemporalMemoryBuffer({
      maxSize: this.config.bufferSize,
      decayRate: this.config.decayRate
    });

    this.causalEngine = new CausalInferenceEngine();
    
    this.metrics = {
      eventsProcessed: 0,
      predictionsGenerated: 0,
      causalInferences: 0,
      averagePredictionAccuracy: 0
    };

    this.pendingPredictions = new Map();
  }

  /**
   * Process a new temporal event
   * @param {Object} eventData - Event data
   * @returns {TemporalEvent} The processed event
   */
  processEvent(eventData) {
    const event = new TemporalEvent(eventData);
    this.memoryBuffer.add(event);
    this.metrics.eventsProcessed++;

    // Check for causal relationships with recent events
    const recentEvents = this.memoryBuffer.getRecent('LONG');
    for (const recentEvent of recentEvents) {
      if (recentEvent.id !== event.id && recentEvent.precedes(event)) {
        this.causalEngine.recordCooccurrence(recentEvent, event);
      }
    }

    // Validate pending predictions
    this._validatePredictions(event);

    return event;
  }

  /**
   * Generate predictions for future events
   * @param {string} eventType - Type of triggering event
   * @returns {Object[]} Predictions
   */
  predict(eventType) {
    const predictions = this.causalEngine.predictEffects(eventType);
    
    for (const pred of predictions) {
      const predictionId = `pred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      this.pendingPredictions.set(predictionId, {
        ...pred,
        predictedAt: Date.now(),
        expectedTime: Date.now() + pred.expectedDelay,
        validated: false
      });
    }

    this.metrics.predictionsGenerated += predictions.length;
    return predictions;
  }

  /**
   * Explain why an event occurred
   * @param {string} eventType - Type of event to explain
   * @returns {Object} Explanation with causes and confidence
   */
  explain(eventType) {
    const causes = this.causalEngine.explainEffect(eventType);
    
    return {
      event: eventType,
      likelyCauses: causes,
      confidence: causes.length > 0 ? causes[0].probability : 0,
      explanation: causes.length > 0 
        ? `${eventType} was likely caused by ${causes[0].cause} (${(causes[0].probability * 100).toFixed(1)}% confidence)`
        : `No known causes for ${eventType}`
    };
  }

  /**
   * Perform temporal abstraction over a time range
   * @param {number} startTime - Start of range
   * @param {number} endTime - End of range
   * @returns {Object} Temporal abstraction
   */
  abstract(startTime, endTime) {
    const events = this.memoryBuffer.queryRange(startTime, endTime);
    
    if (events.length === 0) {
      return { summary: 'No events in range', events: [] };
    }

    // Group by type
    const byType = new Map();
    for (const event of events) {
      const type = event.data.type || 'unknown';
      if (!byType.has(type)) {
        byType.set(type, []);
      }
      byType.get(type).push(event);
    }

    // Calculate statistics
    const typeStats = Array.from(byType.entries()).map(([type, typeEvents]) => ({
      type,
      count: typeEvents.length,
      averageSalience: typeEvents.reduce((sum, e) => sum + e.salience, 0) / typeEvents.length,
      timeSpan: {
        first: Math.min(...typeEvents.map(e => e.timestamp)),
        last: Math.max(...typeEvents.map(e => e.timestamp))
      }
    }));

    return {
      timeRange: { start: startTime, end: endTime },
      duration: endTime - startTime,
      eventCount: events.length,
      typeBreakdown: typeStats,
      dominantType: typeStats.sort((a, b) => b.count - a.count)[0]?.type,
      averageSalience: events.reduce((sum, e) => sum + e.salience, 0) / events.length
    };
  }

  /**
   * Infer causal structure from accumulated data
   * @returns {Object[]} Causal relationships
   */
  inferCausalStructure() {
    const relationships = this.causalEngine.inferCausality();
    this.metrics.causalInferences++;
    return relationships;
  }

  /**
   * Get temporal context for decision making
   * @param {string} scale - Time scale
   * @returns {Object} Temporal context
   */
  getTemporalContext(scale = 'MEDIUM') {
    const recentEvents = this.memoryBuffer.getRecent(scale);
    const bufferStats = this.memoryBuffer.getStats();
    
    return {
      scale,
      windowMs: TIME_SCALES[scale],
      recentEventCount: recentEvents.length,
      recentEventTypes: [...new Set(recentEvents.map(e => e.data.type || 'unknown'))],
      bufferStats,
      pendingPredictions: this.pendingPredictions.size,
      metrics: this.metrics
    };
  }

  /**
   * Apply temporal decay to memory
   */
  decay() {
    this.memoryBuffer.applyDecay();
  }

  /**
   * Consolidate memory patterns
   * @returns {Object[]} Consolidated patterns
   */
  consolidate() {
    return this.memoryBuffer.consolidate();
  }

  _validatePredictions(event) {
    const eventType = event.data.type || 'unknown';
    const now = Date.now();

    for (const [predId, prediction] of this.pendingPredictions) {
      if (prediction.validated) continue;
      
      // Check if prediction matches and is within time window
      if (prediction.effect === eventType) {
        const timeDiff = Math.abs(now - prediction.expectedTime);
        const tolerance = prediction.expectedDelay * PHI_INVERSE;
        
        if (timeDiff <= tolerance) {
          prediction.validated = true;
          prediction.actualTime = now;
          prediction.accuracy = 1 - (timeDiff / tolerance);
          
          // Update accuracy metric
          const totalPredictions = this.metrics.predictionsGenerated;
          this.metrics.averagePredictionAccuracy = 
            (this.metrics.averagePredictionAccuracy * (totalPredictions - 1) + prediction.accuracy) / totalPredictions;
        }
      }

      // Remove old unvalidated predictions
      if (now - prediction.predictedAt > this.config.predictionHorizon) {
        this.pendingPredictions.delete(predId);
      }
    }
  }

  /**
   * Get protocol metrics
   * @returns {Object} Protocol metrics
   */
  getMetrics() {
    return {
      protocolId: this.protocolId,
      name: this.name,
      version: this.version,
      ...this.metrics,
      bufferStats: this.memoryBuffer.getStats(),
      timeScales: TIME_SCALES
    };
  }

  /**
   * Reset the protocol
   */
  reset() {
    this.memoryBuffer = new TemporalMemoryBuffer({
      maxSize: this.config.bufferSize,
      decayRate: this.config.decayRate
    });
    this.causalEngine = new CausalInferenceEngine();
    this.pendingPredictions.clear();
    this.metrics = {
      eventsProcessed: 0,
      predictionsGenerated: 0,
      causalInferences: 0,
      averagePredictionAccuracy: 0
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════

export {
  TemporalEvent,
  TemporalMemoryBuffer,
  CausalInferenceEngine,
  TemporalReasoningProtocol,
  TIME_SCALES,
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  PHI_CUBED
};
