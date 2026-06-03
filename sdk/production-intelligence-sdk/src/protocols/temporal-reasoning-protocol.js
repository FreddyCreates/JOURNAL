/**
 * PROTO-232: TEMPORAL REASONING PROTOCOL — PRODUCTION GRADE
 * 
 * Commercial-grade temporal event processing and causal inference.
 * Enterprise-ready with multi-scale time handling and predictive modeling.
 * 
 * @module @medina/production-intelligence-sdk/protocols/temporal-reasoning
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 * @version 2.0.0
 */

import { PHI, PHI_INVERSE, TIME_SCALES } from '../core/phi-constants.js';

// ════════════════════════════════════════════════════════════════════════════════
// PROTOCOL METADATA
// ════════════════════════════════════════════════════════════════════════════════

export const PROTOCOL_ID = 'PROTO-232';
export const PROTOCOL_NAME = 'Temporal Reasoning Protocol';
export const PROTOCOL_VERSION = '2.0.0';
export const PROTOCOL_TIER = 'ENTERPRISE';

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL EVENT CLASS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Represents a temporal event with multi-scale properties
 */
export class TemporalEvent {
  /**
   * @param {Object} data - Event data
   * @param {Object} options - Event options
   */
  constructor(data, options = {}) {
    this.id = options.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    this.data = data;
    this.timestamp = options.timestamp || Date.now();
    this.duration = options.duration || 0;
    this.scale = options.scale || 'IMMEDIATE';
    this.causality = options.causality || [];
    this.effects = [];
    this.confidence = options.confidence || 1.0;
    this.metadata = options.metadata || {};
  }

  /**
   * Get the time range of this event
   * @returns {{start: number, end: number}} Time range
   */
  getTimeRange() {
    return {
      start: this.timestamp,
      end: this.timestamp + this.duration
    };
  }

  /**
   * Check if this event overlaps with a time range
   * @param {number} start - Range start
   * @param {number} end - Range end
   * @returns {boolean} True if overlapping
   */
  overlaps(start, end) {
    const range = this.getTimeRange();
    return range.start < end && range.end > start;
  }

  /**
   * Check if this event precedes another
   * @param {TemporalEvent} other - Other event
   * @returns {boolean} True if this precedes other
   */
  precedes(other) {
    return this.timestamp + this.duration <= other.timestamp;
  }

  /**
   * Check if this event follows another
   * @param {TemporalEvent} other - Other event
   * @returns {boolean} True if this follows other
   */
  follows(other) {
    return this.timestamp >= other.timestamp + other.duration;
  }

  /**
   * Add a causal link to another event
   * @param {string} eventId - Caused event ID
   * @param {number} strength - Causal strength [0, 1]
   */
  addEffect(eventId, strength = PHI_INVERSE) {
    this.effects.push({ eventId, strength });
  }

  /**
   * Serialize the event
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      id: this.id,
      data: this.data,
      timestamp: this.timestamp,
      duration: this.duration,
      scale: this.scale,
      causality: this.causality,
      effects: this.effects,
      confidence: this.confidence,
      metadata: this.metadata
    };
  }

  /**
   * Deserialize an event
   * @param {Object} data - Serialized data
   * @returns {TemporalEvent} Restored event
   */
  static deserialize(data) {
    const event = new TemporalEvent(data.data, {
      id: data.id,
      timestamp: data.timestamp,
      duration: data.duration,
      scale: data.scale,
      causality: data.causality,
      confidence: data.confidence,
      metadata: data.metadata
    });
    event.effects = data.effects || [];
    return event;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL WINDOW CLASS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Sliding/tumbling window for temporal aggregation
 */
export class TemporalWindow {
  /**
   * @param {Object} config - Window configuration
   */
  constructor(config = {}) {
    this.size = config.size || TIME_SCALES.ATTENTION * 1000; // ms
    this.slide = config.slide || this.size; // Tumbling by default
    this.type = config.type || 'sliding';
    this.events = [];
    this.windowStart = Date.now();
    this.aggregations = new Map();
  }

  /**
   * Add an event to the window
   * @param {TemporalEvent} event - Event to add
   * @returns {boolean} True if event was added
   */
  addEvent(event) {
    const now = Date.now();
    this._pruneOldEvents(now);
    
    if (event.timestamp >= this.windowStart) {
      this.events.push(event);
      this._updateAggregations(event);
      return true;
    }
    return false;
  }

  /**
   * Get events in current window
   * @returns {TemporalEvent[]} Events in window
   */
  getEvents() {
    this._pruneOldEvents(Date.now());
    return [...this.events];
  }

  /**
   * Get event count
   * @returns {number} Event count
   */
  count() {
    this._pruneOldEvents(Date.now());
    return this.events.length;
  }

  /**
   * Get aggregation by key
   * @param {string} key - Aggregation key
   * @returns {*} Aggregation value
   */
  getAggregation(key) {
    return this.aggregations.get(key);
  }

  /**
   * Set a custom aggregation function
   * @param {string} key - Aggregation key
   * @param {Function} fn - Aggregation function
   */
  setAggregationFunction(key, fn) {
    this.aggregations.set(key, { fn, value: null });
  }

  /**
   * Slide the window forward
   */
  slide() {
    this.windowStart += this.slide;
    this._pruneOldEvents(Date.now());
  }

  /**
   * Reset the window
   */
  reset() {
    this.events = [];
    this.windowStart = Date.now();
    this.aggregations.clear();
  }

  // Private methods

  _pruneOldEvents(now) {
    const cutoff = now - this.size;
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    if (this.windowStart < cutoff) {
      this.windowStart = cutoff;
    }
  }

  _updateAggregations(event) {
    for (const [key, agg] of this.aggregations) {
      if (typeof agg.fn === 'function') {
        agg.value = agg.fn(this.events, agg.value, event);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CAUSAL GRAPH CLASS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Directed acyclic graph for causal inference
 */
export class CausalGraph {
  constructor() {
    this.nodes = new Map(); // eventId -> TemporalEvent
    this.edges = new Map(); // eventId -> Set<{targetId, strength}>
    this.reverseEdges = new Map(); // eventId -> Set<{sourceId, strength}>
  }

  /**
   * Add an event node
   * @param {TemporalEvent} event - Event to add
   */
  addNode(event) {
    this.nodes.set(event.id, event);
    if (!this.edges.has(event.id)) {
      this.edges.set(event.id, new Set());
    }
    if (!this.reverseEdges.has(event.id)) {
      this.reverseEdges.set(event.id, new Set());
    }
  }

  /**
   * Add a causal edge
   * @param {string} causeId - Cause event ID
   * @param {string} effectId - Effect event ID
   * @param {number} strength - Causal strength
   * @returns {boolean} Success
   */
  addEdge(causeId, effectId, strength = PHI_INVERSE) {
    if (!this.nodes.has(causeId) || !this.nodes.has(effectId)) {
      return false;
    }

    // Check for cycles
    if (this._wouldCreateCycle(causeId, effectId)) {
      return false;
    }

    this.edges.get(causeId).add({ targetId: effectId, strength });
    this.reverseEdges.get(effectId).add({ sourceId: causeId, strength });
    
    // Update event objects
    const cause = this.nodes.get(causeId);
    cause.addEffect(effectId, strength);

    return true;
  }

  /**
   * Get direct causes of an event
   * @param {string} eventId - Event ID
   * @returns {Array<{event: TemporalEvent, strength: number}>} Causes
   */
  getCauses(eventId) {
    const reverse = this.reverseEdges.get(eventId);
    if (!reverse) return [];

    return Array.from(reverse).map(({ sourceId, strength }) => ({
      event: this.nodes.get(sourceId),
      strength
    })).filter(c => c.event);
  }

  /**
   * Get direct effects of an event
   * @param {string} eventId - Event ID
   * @returns {Array<{event: TemporalEvent, strength: number}>} Effects
   */
  getEffects(eventId) {
    const forward = this.edges.get(eventId);
    if (!forward) return [];

    return Array.from(forward).map(({ targetId, strength }) => ({
      event: this.nodes.get(targetId),
      strength
    })).filter(e => e.event);
  }

  /**
   * Get all ancestors (transitive causes) of an event
   * @param {string} eventId - Event ID
   * @returns {Set<string>} Ancestor event IDs
   */
  getAncestors(eventId) {
    const ancestors = new Set();
    const queue = [eventId];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const causes = this.getCauses(current);
      
      for (const { event } of causes) {
        if (!ancestors.has(event.id)) {
          ancestors.add(event.id);
          queue.push(event.id);
        }
      }
    }
    
    return ancestors;
  }

  /**
   * Get all descendants (transitive effects) of an event
   * @param {string} eventId - Event ID
   * @returns {Set<string>} Descendant event IDs
   */
  getDescendants(eventId) {
    const descendants = new Set();
    const queue = [eventId];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const effects = this.getEffects(current);
      
      for (const { event } of effects) {
        if (!descendants.has(event.id)) {
          descendants.add(event.id);
          queue.push(event.id);
        }
      }
    }
    
    return descendants;
  }

  /**
   * Compute causal strength between two events
   * @param {string} causeId - Cause event ID
   * @param {string} effectId - Effect event ID
   * @returns {number} Aggregate causal strength
   */
  computeCausalStrength(causeId, effectId) {
    // Use BFS to find all paths and aggregate strengths
    const paths = this._findAllPaths(causeId, effectId);
    if (paths.length === 0) return 0;

    // Aggregate path strengths using PHI-weighted combination
    let totalStrength = 0;
    for (const path of paths) {
      let pathStrength = 1;
      for (const strength of path.strengths) {
        pathStrength *= strength;
      }
      totalStrength += pathStrength * Math.pow(PHI_INVERSE, path.length - 1);
    }

    return Math.min(1, totalStrength);
  }

  /**
   * Get topological ordering of events
   * @returns {TemporalEvent[]} Topologically sorted events
   */
  topologicalSort() {
    const result = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (nodeId) => {
      if (temp.has(nodeId)) throw new Error('Cycle detected');
      if (visited.has(nodeId)) return;

      temp.add(nodeId);
      
      const effects = this.getEffects(nodeId);
      for (const { event } of effects) {
        visit(event.id);
      }
      
      temp.delete(nodeId);
      visited.add(nodeId);
      result.unshift(this.nodes.get(nodeId));
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    return result;
  }

  // Private methods

  _wouldCreateCycle(fromId, toId) {
    // Check if toId can reach fromId
    const descendants = this.getDescendants(toId);
    return descendants.has(fromId);
  }

  _findAllPaths(startId, endId, maxDepth = 10) {
    const paths = [];
    
    const dfs = (currentId, path, strengths, depth) => {
      if (depth > maxDepth) return;
      if (currentId === endId) {
        paths.push({ path: [...path], strengths: [...strengths], length: path.length });
        return;
      }

      const effects = this.getEffects(currentId);
      for (const { event, strength } of effects) {
        if (!path.includes(event.id)) {
          path.push(event.id);
          strengths.push(strength);
          dfs(event.id, path, strengths, depth + 1);
          path.pop();
          strengths.pop();
        }
      }
    };

    dfs(startId, [startId], [], 0);
    return paths;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// TEMPORAL REASONING PROTOCOL ENGINE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Production-grade Temporal Reasoning Protocol implementation
 */
export class TemporalReasoningProtocol {
  /**
   * @param {Object} config - Protocol configuration
   */
  constructor(config = {}) {
    this.protocolId = PROTOCOL_ID;
    this.version = PROTOCOL_VERSION;
    
    // Configuration
    this.config = {
      maxEvents: config.maxEvents || 10000,
      windowSize: config.windowSize || TIME_SCALES.EXTENDED * 1000,
      causalThreshold: config.causalThreshold || 0.1,
      enablePrediction: config.enablePrediction !== false,
      predictionHorizon: config.predictionHorizon || TIME_SCALES.STRATEGIC * 1000,
      ...config
    };

    // Core components
    this.events = new Map();
    this.causalGraph = new CausalGraph();
    this.windows = new Map();
    
    // Multi-scale tracking
    this.scaleBuffers = new Map();
    for (const [scale, duration] of Object.entries(TIME_SCALES)) {
      this.scaleBuffers.set(scale, new TemporalWindow({
        size: duration * 1000,
        type: 'sliding'
      }));
    }

    // Prediction models
    this.patterns = new Map();
    this.predictions = [];

    // Telemetry
    this.telemetry = {
      eventsProcessed: 0,
      causalLinksInferred: 0,
      predictionsGenerated: 0,
      patternsDetected: 0,
      windowSlides: 0
    };

    this.startedAt = Date.now();
  }

  /**
   * Record a new temporal event
   * @param {*} data - Event data
   * @param {Object} options - Event options
   * @returns {TemporalEvent} Created event
   */
  recordEvent(data, options = {}) {
    // Enforce max events
    if (this.events.size >= this.config.maxEvents) {
      this._pruneOldestEvents();
    }

    const event = new TemporalEvent(data, options);
    this.events.set(event.id, event);
    this.causalGraph.addNode(event);

    // Add to appropriate scale buffer
    const buffer = this.scaleBuffers.get(event.scale);
    if (buffer) {
      buffer.addEvent(event);
    }

    // Infer causal relationships
    this._inferCausality(event);

    // Detect patterns
    if (this.config.enablePrediction) {
      this._detectPatterns(event);
    }

    this.telemetry.eventsProcessed++;

    return event;
  }

  /**
   * Query events by time range
   * @param {number} start - Range start (ms)
   * @param {number} end - Range end (ms)
   * @param {Object} filters - Additional filters
   * @returns {TemporalEvent[]} Matching events
   */
  queryEvents(start, end, filters = {}) {
    const results = [];
    
    for (const event of this.events.values()) {
      if (event.overlaps(start, end)) {
        // Apply filters
        if (filters.scale && event.scale !== filters.scale) continue;
        if (filters.minConfidence && event.confidence < filters.minConfidence) continue;
        if (filters.dataFilter && !filters.dataFilter(event.data)) continue;
        
        results.push(event);
      }
    }

    // Sort by timestamp
    results.sort((a, b) => a.timestamp - b.timestamp);
    
    return results;
  }

  /**
   * Get causal chain leading to an event
   * @param {string} eventId - Target event ID
   * @param {number} depth - Maximum depth
   * @returns {Object} Causal chain structure
   */
  getCausalChain(eventId, depth = 5) {
    const event = this.events.get(eventId);
    if (!event) return null;

    const chain = {
      event: event.serialize(),
      causes: [],
      effects: []
    };

    // Get causes
    const causes = this.causalGraph.getCauses(eventId);
    for (const { event: causeEvent, strength } of causes) {
      if (depth > 1) {
        const subChain = this.getCausalChain(causeEvent.id, depth - 1);
        chain.causes.push({ ...subChain, strength });
      } else {
        chain.causes.push({
          event: causeEvent.serialize(),
          strength,
          causes: [],
          effects: []
        });
      }
    }

    // Get effects
    const effects = this.causalGraph.getEffects(eventId);
    for (const { event: effectEvent, strength } of effects) {
      chain.effects.push({
        event: effectEvent.serialize(),
        strength
      });
    }

    return chain;
  }

  /**
   * Add explicit causal relationship
   * @param {string} causeId - Cause event ID
   * @param {string} effectId - Effect event ID
   * @param {number} strength - Causal strength
   * @returns {boolean} Success
   */
  addCausalLink(causeId, effectId, strength = PHI_INVERSE) {
    const success = this.causalGraph.addEdge(causeId, effectId, strength);
    if (success) {
      this.telemetry.causalLinksInferred++;
    }
    return success;
  }

  /**
   * Generate predictions for future events
   * @param {number} horizon - Prediction horizon (ms)
   * @returns {Array} Predictions
   */
  predict(horizon = this.config.predictionHorizon) {
    if (!this.config.enablePrediction) return [];

    const now = Date.now();
    const predictions = [];

    // Pattern-based predictions
    for (const [patternId, pattern] of this.patterns) {
      const prediction = this._generatePrediction(pattern, now, horizon);
      if (prediction && prediction.confidence > this.config.causalThreshold) {
        predictions.push(prediction);
      }
    }

    // Sort by confidence
    predictions.sort((a, b) => b.confidence - a.confidence);

    this.predictions = predictions;
    this.telemetry.predictionsGenerated += predictions.length;

    return predictions;
  }

  /**
   * Create a named temporal window
   * @param {string} name - Window name
   * @param {Object} config - Window configuration
   * @returns {TemporalWindow} Created window
   */
  createWindow(name, config = {}) {
    const window = new TemporalWindow(config);
    this.windows.set(name, window);
    return window;
  }

  /**
   * Get a named window
   * @param {string} name - Window name
   * @returns {TemporalWindow|null} Window or null
   */
  getWindow(name) {
    return this.windows.get(name) || null;
  }

  /**
   * Get protocol status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      protocolId: this.protocolId,
      version: this.version,
      tier: PROTOCOL_TIER,
      uptime: Date.now() - this.startedAt,
      activeEvents: this.events.size,
      causalNodes: this.causalGraph.nodes.size,
      activeWindows: this.windows.size,
      patterns: this.patterns.size,
      telemetry: { ...this.telemetry },
      config: { ...this.config }
    };
  }

  /**
   * Export all data for persistence
   * @returns {Object} Exportable data
   */
  export() {
    const events = {};
    for (const [id, event] of this.events) {
      events[id] = event.serialize();
    }

    return {
      protocolId: this.protocolId,
      version: this.version,
      exportedAt: Date.now(),
      events,
      patterns: Object.fromEntries(this.patterns),
      telemetry: this.telemetry
    };
  }

  /**
   * Import data from persistence
   * @param {Object} data - Exported data
   */
  import(data) {
    for (const [id, eventData] of Object.entries(data.events)) {
      const event = TemporalEvent.deserialize(eventData);
      this.events.set(id, event);
      this.causalGraph.addNode(event);
    }

    // Rebuild causal edges
    for (const event of this.events.values()) {
      for (const { eventId, strength } of event.effects) {
        if (this.events.has(eventId)) {
          this.causalGraph.addEdge(event.id, eventId, strength);
        }
      }
    }

    if (data.patterns) {
      this.patterns = new Map(Object.entries(data.patterns));
    }
  }

  /**
   * Reset the protocol
   */
  reset() {
    this.events.clear();
    this.causalGraph = new CausalGraph();
    this.windows.clear();
    this.patterns.clear();
    this.predictions = [];
    
    // Reset scale buffers
    for (const buffer of this.scaleBuffers.values()) {
      buffer.reset();
    }

    this.telemetry = {
      eventsProcessed: 0,
      causalLinksInferred: 0,
      predictionsGenerated: 0,
      patternsDetected: 0,
      windowSlides: 0
    };
    
    this.startedAt = Date.now();
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PRIVATE METHODS
  // ══════════════════════════════════════════════════════════════════════════════

  _pruneOldestEvents() {
    // Remove oldest 10% of events
    const sortedEvents = Array.from(this.events.values())
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const toRemove = Math.ceil(sortedEvents.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.events.delete(sortedEvents[i].id);
    }
  }

  _inferCausality(newEvent) {
    // Look for potential causes in recent events
    const window = TIME_SCALES[newEvent.scale] * 1000 || TIME_SCALES.SHORT * 1000;
    const cutoff = newEvent.timestamp - window;

    for (const event of this.events.values()) {
      if (event.id === newEvent.id) continue;
      if (event.timestamp >= cutoff && event.timestamp < newEvent.timestamp) {
        // Calculate temporal proximity factor
        const timeDiff = newEvent.timestamp - event.timestamp;
        const proximityFactor = Math.exp(-timeDiff / window);
        
        // PHI-weighted causal strength
        const strength = proximityFactor * PHI_INVERSE;
        
        if (strength > this.config.causalThreshold) {
          this.addCausalLink(event.id, newEvent.id, strength);
        }
      }
    }
  }

  _detectPatterns(event) {
    // Simple sequence pattern detection
    const recentEvents = this.queryEvents(
      event.timestamp - TIME_SCALES.ATTENTION * 1000,
      event.timestamp
    );

    if (recentEvents.length >= 3) {
      const signature = recentEvents.slice(-3).map(e => 
        typeof e.data === 'object' ? JSON.stringify(e.data) : String(e.data)
      ).join('→');

      if (!this.patterns.has(signature)) {
        this.patterns.set(signature, {
          signature,
          events: recentEvents.slice(-3).map(e => e.id),
          count: 1,
          avgInterval: this._computeAvgInterval(recentEvents.slice(-3)),
          lastSeen: event.timestamp
        });
        this.telemetry.patternsDetected++;
      } else {
        const pattern = this.patterns.get(signature);
        pattern.count++;
        pattern.lastSeen = event.timestamp;
      }
    }
  }

  _computeAvgInterval(events) {
    if (events.length < 2) return 0;
    let totalInterval = 0;
    for (let i = 1; i < events.length; i++) {
      totalInterval += events[i].timestamp - events[i - 1].timestamp;
    }
    return totalInterval / (events.length - 1);
  }

  _generatePrediction(pattern, now, horizon) {
    if (pattern.count < 2) return null;

    const timeSinceLastSeen = now - pattern.lastSeen;
    const expectedNextTime = pattern.lastSeen + pattern.avgInterval;

    if (expectedNextTime > now && expectedNextTime <= now + horizon) {
      // Confidence decays with pattern age and increases with count
      const ageDecay = Math.exp(-timeSinceLastSeen / (TIME_SCALES.LONG * 1000));
      const countBoost = Math.min(1, pattern.count * 0.1);
      const confidence = ageDecay * countBoost * PHI_INVERSE;

      return {
        patternId: pattern.signature,
        predictedTime: expectedNextTime,
        confidence,
        basedOn: pattern.events,
        generatedAt: now
      };
    }

    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ════════════════════════════════════════════════════════════════════════════════

export default {
  PROTOCOL_ID,
  PROTOCOL_NAME,
  PROTOCOL_VERSION,
  PROTOCOL_TIER,
  TemporalEvent,
  TemporalWindow,
  CausalGraph,
  TemporalReasoningProtocol
};
