/**
 * @medina/production-intelligence-sdk — Adapters Index
 * 
 * UNIVERSAL ADAPTER BRIDGE
 * Protocol adapters for seamless integration across all systems
 * 
 * @module @medina/production-intelligence-sdk/adapters
 * @copyright Medina Intelligence Systems — All Rights Reserved
 * @license PROPRIETARY — Commercial Use License Required
 */

import { PHI, PHI_INVERSE, TIME_SCALES } from '../core/phi-constants.js';

// ════════════════════════════════════════════════════════════════════════════════
// PROTOCOL ADAPTERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ProtocolAdapter — Base adapter for protocol interoperability
 */
export class ProtocolAdapter {
  constructor(sourceProtocol, targetProtocol) {
    this.adapterId = `adapter_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.source = sourceProtocol;
    this.target = targetProtocol;
    this.transformations = [];
    this.metrics = { calls: 0, successes: 0, failures: 0, totalLatency: 0 };
  }

  addTransformation(name, fn) {
    this.transformations.push({ name, fn });
    return this;
  }

  async adapt(data) {
    const start = Date.now();
    try {
      let result = data;
      for (const { fn } of this.transformations) {
        result = await fn(result);
      }
      this.metrics.successes++;
      this.metrics.totalLatency += Date.now() - start;
      return { success: true, data: result };
    } catch (error) {
      this.metrics.failures++;
      return { success: false, error: error.message };
    } finally {
      this.metrics.calls++;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      avgLatency: this.metrics.calls > 0 ? this.metrics.totalLatency / this.metrics.calls : 0,
      successRate: this.metrics.calls > 0 ? this.metrics.successes / this.metrics.calls : 0
    };
  }
}

/**
 * QuantumToTemporalAdapter — Bridges quantum decisions to temporal events
 */
export class QuantumToTemporalAdapter extends ProtocolAdapter {
  constructor() {
    super('PROTO-231', 'PROTO-232');
    this.addTransformation('quantumMeasurementToEvent', (measurement) => ({
      type: 'quantum_decision',
      state: measurement.state,
      probability: measurement.probability,
      coherence: measurement.coherenceRemaining,
      timestamp: Date.now(),
      duration: TIME_SCALES.IMMEDIATE,
      salience: measurement.probability * PHI
    }));
  }
}

/**
 * TemporalToSwarmAdapter — Converts temporal patterns to swarm objectives
 */
export class TemporalToSwarmAdapter extends ProtocolAdapter {
  constructor() {
    super('PROTO-232', 'PROTO-233');
    this.addTransformation('temporalPatternToObjective', (pattern) => ({
      type: 'temporal_objective',
      dimensions: pattern.events?.length || 1,
      bounds: pattern.events?.map(() => ({ min: 0, max: 1 })) || [{ min: 0, max: 1 }],
      fitnessWeights: pattern.events?.map(e => e.salience || PHI_INVERSE) || [PHI_INVERSE]
    }));
  }
}

/**
 * SwarmToQuantumAdapter — Maps swarm consensus to quantum superposition
 */
export class SwarmToQuantumAdapter extends ProtocolAdapter {
  constructor() {
    super('PROTO-233', 'PROTO-231');
    this.addTransformation('swarmSolutionToSuperposition', (solution) => ({
      type: 'swarm_superposition',
      dimensions: solution.solution?.length || 8,
      amplitudes: solution.solution?.map(v => ({
        real: Math.cos(v * Math.PI),
        imag: Math.sin(v * Math.PI)
      })) || [],
      fitness: solution.fitness || 0
    }));
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// DATA FORMAT ADAPTERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * JSONAdapter — JSON serialization/deserialization
 */
export class JSONAdapter {
  constructor(options = {}) {
    this.pretty = options.pretty || false;
    this.reviver = options.reviver || null;
    this.replacer = options.replacer || null;
  }

  serialize(data) {
    try {
      return {
        success: true,
        data: this.pretty ? JSON.stringify(data, this.replacer, 2) : JSON.stringify(data, this.replacer)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  deserialize(json) {
    try {
      return { success: true, data: JSON.parse(json, this.reviver) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * BinaryAdapter — Binary encoding/decoding for high-performance
 */
export class BinaryAdapter {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
  }

  encode(data) {
    const json = JSON.stringify(data);
    const bytes = this.encoder.encode(json);
    return { success: true, data: bytes, size: bytes.length };
  }

  decode(bytes) {
    try {
      const json = this.decoder.decode(bytes);
      return { success: true, data: JSON.parse(json) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * CandidAdapter — ICP Candid interface adapter
 */
export class CandidAdapter {
  constructor(idl = null) {
    this.idl = idl;
  }

  toCandid(jsValue) {
    // Simplified Candid encoding simulation
    if (typeof jsValue === 'number') {
      return { type: Number.isInteger(jsValue) ? 'int' : 'float64', value: jsValue };
    }
    if (typeof jsValue === 'string') {
      return { type: 'text', value: jsValue };
    }
    if (typeof jsValue === 'boolean') {
      return { type: 'bool', value: jsValue };
    }
    if (Array.isArray(jsValue)) {
      return { type: 'vec', value: jsValue.map(v => this.toCandid(v)) };
    }
    if (typeof jsValue === 'object' && jsValue !== null) {
      return {
        type: 'record',
        value: Object.fromEntries(
          Object.entries(jsValue).map(([k, v]) => [k, this.toCandid(v)])
        )
      };
    }
    return { type: 'null', value: null };
  }

  fromCandid(candidValue) {
    if (!candidValue || !candidValue.type) return null;
    
    switch (candidValue.type) {
      case 'int':
      case 'nat':
      case 'float64':
        return candidValue.value;
      case 'text':
        return candidValue.value;
      case 'bool':
        return candidValue.value;
      case 'vec':
        return candidValue.value.map(v => this.fromCandid(v));
      case 'record':
        return Object.fromEntries(
          Object.entries(candidValue.value).map(([k, v]) => [k, this.fromCandid(v)])
        );
      default:
        return null;
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EVENT ADAPTERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * EventBusAdapter — Event-driven communication adapter
 */
export class EventBusAdapter {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 1000;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    const entry = { event, data, timestamp: Date.now() };
    this.history.push(entry);
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event handler error for ${event}:`, error);
        }
      }
    }

    // Also emit to wildcard listeners
    if (this.listeners.has('*')) {
      for (const callback of this.listeners.get('*')) {
        try {
          callback({ event, data });
        } catch (error) {
          console.error(`Wildcard handler error:`, error);
        }
      }
    }

    return entry;
  }

  getHistory(event = null, limit = 100) {
    let filtered = event ? this.history.filter(e => e.event === event) : this.history;
    return filtered.slice(-limit);
  }
}

/**
 * StreamAdapter — Streaming data adapter
 */
export class StreamAdapter {
  constructor(config = {}) {
    this.bufferSize = config.bufferSize || 1000;
    this.buffer = [];
    this.subscribers = new Set();
    this.metrics = { received: 0, processed: 0, dropped: 0 };
  }

  push(data) {
    this.metrics.received++;
    
    if (this.buffer.length >= this.bufferSize) {
      this.buffer.shift();
      this.metrics.dropped++;
    }
    
    this.buffer.push({ data, timestamp: Date.now() });
    
    for (const subscriber of this.subscribers) {
      try {
        subscriber(data);
        this.metrics.processed++;
      } catch (error) {
        // Continue to other subscribers
      }
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getBuffer(count = 100) {
    return this.buffer.slice(-count);
  }

  getMetrics() {
    return { ...this.metrics, bufferSize: this.buffer.length };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// ADAPTER REGISTRY
// ════════════════════════════════════════════════════════════════════════════════

/**
 * AdapterRegistry — Central registry for all adapters
 */
export class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.chains = new Map();
  }

  register(name, adapter) {
    this.adapters.set(name, adapter);
    return this;
  }

  get(name) {
    return this.adapters.get(name);
  }

  createChain(name, adapterNames) {
    const adapters = adapterNames.map(n => this.adapters.get(n)).filter(Boolean);
    this.chains.set(name, adapters);
    return this;
  }

  async executeChain(chainName, data) {
    const chain = this.chains.get(chainName);
    if (!chain) throw new Error(`Chain ${chainName} not found`);

    let result = data;
    for (const adapter of chain) {
      if (typeof adapter.adapt === 'function') {
        const adapted = await adapter.adapt(result);
        if (!adapted.success) {
          return { success: false, error: adapted.error, stoppedAt: adapter.adapterId };
        }
        result = adapted.data;
      }
    }
    return { success: true, data: result };
  }

  listAdapters() {
    return Array.from(this.adapters.keys());
  }

  listChains() {
    return Array.from(this.chains.keys());
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  // Protocol adapters
  QuantumToTemporalAdapter,
  TemporalToSwarmAdapter,
  SwarmToQuantumAdapter,
  
  // Format adapters
  JSONAdapter,
  BinaryAdapter,
  CandidAdapter,
  
  // Event adapters
  EventBusAdapter,
  StreamAdapter,
  
  // Registry
  AdapterRegistry
};

export default {
  ProtocolAdapter,
  QuantumToTemporalAdapter,
  TemporalToSwarmAdapter,
  SwarmToQuantumAdapter,
  JSONAdapter,
  BinaryAdapter,
  CandidAdapter,
  EventBusAdapter,
  StreamAdapter,
  AdapterRegistry
};
