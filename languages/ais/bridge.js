/**
 * AIS BRIDGE — Cross-Language AI System Protocol for JavaScript
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * "Omnia Connectuntur" (All things are connected)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This module provides the bridge infrastructure for cross-language
 * communication between JavaScript, Julia, Haskell, and Rust components
 * of the Medina Sovereign Intelligence system.
 * 
 * Features:
 *   • Serializable message protocol
 *   • φ-weighted priority queuing
 *   • Language-agnostic type system
 *   • Async-first design
 * 
 * Attribution: Alfredo "Freddy" Medina Hernandez
 * Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + Math.sqrt(5)) / 2;          // φ ≈ 1.618033988749895
const PHI_INVERSE = PHI - 1;                  // φ⁻¹ ≈ 0.618033988749895
const PHI_SQUARED = PHI + 1;                  // φ² ≈ 2.618033988749895

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Supported programming languages
 */
const Language = Object.freeze({
  JavaScript: 'JavaScript',
  Julia: 'Julia',
  Haskell: 'Haskell',
  Rust: 'Rust',
  Motoko: 'Motoko',
  Python: 'Python',
  Unknown: 'Unknown'
});

/**
 * Message types for cross-language communication
 */
const MessageType = Object.freeze({
  Ping: 'Ping',           // Health check
  Pong: 'Pong',           // Health response
  Compute: 'Compute',     // Computation request
  Result: 'Result',       // Computation result
  Sync: 'Sync',           // Synchronization
  SyncAck: 'SyncAck',     // Sync acknowledgment
  PhiState: 'PhiState',   // φ-state update
  Error: 'Error'          // Error message
});

/**
 * Priority levels (φ-weighted)
 */
const Priority = Object.freeze({
  Critical: 'Critical',   // φ² weight
  High: 'High',           // φ weight
  Normal: 'Normal',       // 1.0 weight
  Low: 'Low',             // φ⁻¹ weight
  Background: 'Background' // φ⁻² weight
});

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convert priority to φ-based weight
 */
function priorityToWeight(priority) {
  switch (priority) {
    case Priority.Critical: return PHI_SQUARED;    // 2.618
    case Priority.High: return PHI;                // 1.618
    case Priority.Normal: return 1.0;
    case Priority.Low: return PHI_INVERSE;         // 0.618
    case Priority.Background: return PHI_INVERSE * PHI_INVERSE; // 0.382
    default: return 1.0;
  }
}

/**
 * Convert weight to priority
 */
function weightToPriority(weight) {
  if (weight > 2.0) return Priority.Critical;
  if (weight > 1.3) return Priority.High;
  if (weight > 0.8) return Priority.Normal;
  if (weight > 0.5) return Priority.Low;
  return Priority.Background;
}

/**
 * φ-normalization sigmoid
 */
function phiNormalize(x) {
  return 1.0 / (1.0 + Math.pow(PHI, -x));
}

/**
 * Generate unique message ID
 */
function generateMessageId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `msg-${timestamp}-${random}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AIS MESSAGE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Core AIS message structure
 */
class AISMessage {
  constructor({
    id = generateMessageId(),
    type = MessageType.Ping,
    source = Language.JavaScript,
    target = Language.Unknown,
    priority = Priority.Normal,
    payload = '',
    timestamp = Date.now(),
    phiWeight = null
  } = {}) {
    this.id = id;
    this.type = type;
    this.source = source;
    this.target = target;
    this.priority = priority;
    this.payload = payload;
    this.timestamp = timestamp;
    this.phiWeight = phiWeight !== null ? phiWeight : priorityToWeight(priority);
  }

  /**
   * Create a φ-weighted message with automatic priority calculation
   */
  static createPhiWeighted({
    id = generateMessageId(),
    type = MessageType.Ping,
    source = Language.JavaScript,
    target = Language.Unknown,
    payload = '',
    timestamp = Date.now(),
    importance = 0
  } = {}) {
    const phiWeight = phiNormalize(importance);
    const priority = weightToPriority(phiWeight);
    return new AISMessage({
      id,
      type,
      source,
      target,
      priority,
      payload,
      timestamp,
      phiWeight
    });
  }

  /**
   * Serialize message to string
   */
  serialize() {
    return [
      'AIS_MSG_V1',
      `ID:${this.id}`,
      `TYPE:${this.type}`,
      `SRC:${this.source}`,
      `TGT:${this.target}`,
      `PRI:${this.priority}`,
      `TS:${this.timestamp}`,
      `PHI:${this.phiWeight}`,
      `PAYLOAD:${this.payload}`,
      'END_MSG'
    ].join('\n');
  }

  /**
   * Deserialize message from string
   */
  static deserialize(input) {
    const lines = input.split('\n');
    if (lines.length < 10 || lines[0] !== 'AIS_MSG_V1') {
      return null;
    }

    const extractField = (prefix) => {
      const line = lines.find(l => l.startsWith(prefix));
      return line ? line.slice(prefix.length) : '';
    };

    return new AISMessage({
      id: extractField('ID:'),
      type: extractField('TYPE:'),
      source: extractField('SRC:'),
      target: extractField('TGT:'),
      priority: extractField('PRI:'),
      payload: extractField('PAYLOAD:'),
      timestamp: parseInt(extractField('TS:'), 10) || Date.now(),
      phiWeight: parseFloat(extractField('PHI:')) || 1.0
    });
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      source: this.source,
      target: this.target,
      priority: this.priority,
      payload: this.payload,
      timestamp: this.timestamp,
      phiWeight: this.phiWeight
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHI-WEIGHTED PRIORITY QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * φ-weighted priority queue implementation
 */
class PhiQueue {
  constructor() {
    this.messages = [];
  }

  /**
   * Enqueue a message maintaining φ-weighted order
   */
  enqueue(message) {
    this.messages.push(message);
    this.messages.sort((a, b) => b.phiWeight - a.phiWeight);
    return this;
  }

  /**
   * Dequeue highest priority message
   */
  dequeue() {
    return this.messages.shift() || null;
  }

  /**
   * Peek at highest priority message without removing
   */
  peek() {
    return this.messages[0] || null;
  }

  /**
   * Get queue length
   */
  get length() {
    return this.messages.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty() {
    return this.messages.length === 0;
  }

  /**
   * Clear the queue
   */
  clear() {
    this.messages = [];
    return this;
  }

  /**
   * Get all messages as array
   */
  toArray() {
    return [...this.messages];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE BRIDGE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Language bridge capabilities
 */
class LanguageBridge {
  constructor({
    name,
    source,
    target,
    supportedTypes = [],
    bidirectional = true,
    latencyMs = 10
  }) {
    this.name = name;
    this.source = source;
    this.target = target;
    this.supportedTypes = supportedTypes;
    this.bidirectional = bidirectional;
    this.latencyMs = latencyMs;
  }
}

/**
 * Get all available bridge capabilities
 */
function getBridgeCapabilities() {
  return [
    new LanguageBridge({
      name: 'js-julia',
      source: Language.JavaScript,
      target: Language.Julia,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 15
    }),
    new LanguageBridge({
      name: 'js-rust',
      source: Language.JavaScript,
      target: Language.Rust,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck
      ],
      bidirectional: true,
      latencyMs: 3
    }),
    new LanguageBridge({
      name: 'js-haskell',
      source: Language.JavaScript,
      target: Language.Haskell,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 20
    }),
    new LanguageBridge({
      name: 'js-motoko',
      source: Language.JavaScript,
      target: Language.Motoko,
      supportedTypes: [
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 100
    }),
    new LanguageBridge({
      name: 'js-python',
      source: Language.JavaScript,
      target: Language.Python,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 10
    }),
    // Cross-language bridges (non-JS)
    new LanguageBridge({
      name: 'julia-rust',
      source: Language.Julia,
      target: Language.Rust,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 5
    }),
    new LanguageBridge({
      name: 'julia-haskell',
      source: Language.Julia,
      target: Language.Haskell,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 12
    }),
    new LanguageBridge({
      name: 'rust-haskell',
      source: Language.Rust,
      target: Language.Haskell,
      supportedTypes: [
        MessageType.Ping, MessageType.Pong,
        MessageType.Compute, MessageType.Result,
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 8
    }),
    new LanguageBridge({
      name: 'rust-motoko',
      source: Language.Rust,
      target: Language.Motoko,
      supportedTypes: [
        MessageType.Sync, MessageType.SyncAck,
        MessageType.PhiState
      ],
      bidirectional: true,
      latencyMs: 50
    })
  ];
}

/**
 * Check if two languages can communicate
 */
function canCommunicate(source, target) {
  if (source === target) return true;
  
  return getBridgeCapabilities().some(bridge => 
    (bridge.source === source && bridge.target === target) ||
    (bridge.bidirectional && bridge.source === target && bridge.target === source)
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Handle ping message
 */
function handlePing(message) {
  return new AISMessage({
    id: `${message.id}-response`,
    type: MessageType.Pong,
    source: message.target,
    target: message.source,
    priority: message.priority,
    payload: 'pong',
    timestamp: Date.now()
  });
}

/**
 * Handle compute request
 */
function handleCompute(message, computeFn) {
  try {
    const result = computeFn(message.payload);
    return new AISMessage({
      id: `${message.id}-result`,
      type: MessageType.Result,
      source: message.target,
      target: message.source,
      priority: message.priority,
      payload: JSON.stringify(result),
      timestamp: Date.now()
    });
  } catch (error) {
    return new AISMessage({
      id: `${message.id}-error`,
      type: MessageType.Error,
      source: message.target,
      target: message.source,
      priority: Priority.High,
      payload: error.message,
      timestamp: Date.now()
    });
  }
}

/**
 * Handle sync message
 */
function handleSync(message, phiState) {
  return AISMessage.createPhiWeighted({
    id: `${message.id}-ack`,
    type: MessageType.SyncAck,
    source: message.target,
    target: message.source,
    payload: String(phiState),
    timestamp: Date.now(),
    importance: phiState
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  // Constants
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  
  // Enums
  Language,
  MessageType,
  Priority,
  
  // Utilities
  priorityToWeight,
  weightToPriority,
  phiNormalize,
  generateMessageId,
  
  // Classes
  AISMessage,
  PhiQueue,
  LanguageBridge,
  
  // Bridge functions
  getBridgeCapabilities,
  canCommunicate,
  
  // Protocol handlers
  handlePing,
  handleCompute,
  handleSync
};

export default {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  Language,
  MessageType,
  Priority,
  priorityToWeight,
  weightToPriority,
  phiNormalize,
  generateMessageId,
  AISMessage,
  PhiQueue,
  LanguageBridge,
  getBridgeCapabilities,
  canCommunicate,
  handlePing,
  handleCompute,
  handleSync
};
