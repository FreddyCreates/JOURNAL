/**
 * AIS Bridge Test Suite
 * =====================
 * Comprehensive tests for the cross-language AI System bridge
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  PHI, PHI_INVERSE, PHI_SQUARED,
  Language, MessageType, Priority,
  priorityToWeight, weightToPriority, phiNormalize,
  AISMessage, PhiQueue, LanguageBridge,
  getBridgeCapabilities, canCommunicate,
  handlePing, handleCompute, handleSync
} from '../ais/bridge.js';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - Constants', () => {
  test('PHI is approximately 1.618', () => {
    assert.ok(Math.abs(PHI - 1.618033988749895) < 1e-10);
  });

  test('PHI_INVERSE is approximately 0.618', () => {
    assert.ok(Math.abs(PHI_INVERSE - 0.618033988749895) < 1e-10);
  });

  test('PHI_SQUARED is approximately 2.618', () => {
    assert.ok(Math.abs(PHI_SQUARED - 2.618033988749895) < 1e-10);
  });

  test('PHI × PHI_INVERSE ≈ 1', () => {
    assert.ok(Math.abs(PHI * PHI_INVERSE - 1) < 1e-10);
  });

  test('PHI² = PHI + 1', () => {
    assert.ok(Math.abs(PHI * PHI - (PHI + 1)) < 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ENUMERATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - Enumerations', () => {
  test('Language enum has all expected values', () => {
    assert.strictEqual(Language.JavaScript, 'JavaScript');
    assert.strictEqual(Language.Julia, 'Julia');
    assert.strictEqual(Language.Haskell, 'Haskell');
    assert.strictEqual(Language.Rust, 'Rust');
    assert.strictEqual(Language.Motoko, 'Motoko');
    assert.strictEqual(Language.Python, 'Python');
    assert.strictEqual(Language.Unknown, 'Unknown');
  });

  test('MessageType enum has all expected values', () => {
    assert.strictEqual(MessageType.Ping, 'Ping');
    assert.strictEqual(MessageType.Pong, 'Pong');
    assert.strictEqual(MessageType.Compute, 'Compute');
    assert.strictEqual(MessageType.Result, 'Result');
    assert.strictEqual(MessageType.Sync, 'Sync');
    assert.strictEqual(MessageType.SyncAck, 'SyncAck');
    assert.strictEqual(MessageType.PhiState, 'PhiState');
    assert.strictEqual(MessageType.Error, 'Error');
  });

  test('Priority enum has all expected values', () => {
    assert.strictEqual(Priority.Critical, 'Critical');
    assert.strictEqual(Priority.High, 'High');
    assert.strictEqual(Priority.Normal, 'Normal');
    assert.strictEqual(Priority.Low, 'Low');
    assert.strictEqual(Priority.Background, 'Background');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - Utility Functions', () => {
  test('priorityToWeight returns correct φ-weights', () => {
    assert.ok(Math.abs(priorityToWeight(Priority.Critical) - PHI_SQUARED) < 1e-10);
    assert.ok(Math.abs(priorityToWeight(Priority.High) - PHI) < 1e-10);
    assert.strictEqual(priorityToWeight(Priority.Normal), 1.0);
    assert.ok(Math.abs(priorityToWeight(Priority.Low) - PHI_INVERSE) < 1e-10);
    assert.ok(Math.abs(priorityToWeight(Priority.Background) - PHI_INVERSE * PHI_INVERSE) < 1e-10);
  });

  test('weightToPriority converts weights correctly', () => {
    assert.strictEqual(weightToPriority(3.0), Priority.Critical);
    assert.strictEqual(weightToPriority(1.5), Priority.High);
    assert.strictEqual(weightToPriority(1.0), Priority.Normal);
    assert.strictEqual(weightToPriority(0.6), Priority.Low);
    assert.strictEqual(weightToPriority(0.3), Priority.Background);
  });

  test('phiNormalize returns values in [0, 1]', () => {
    const result0 = phiNormalize(0);
    assert.ok(result0 >= 0 && result0 <= 1);
    
    const resultPos = phiNormalize(10);
    assert.ok(resultPos > 0.9 && resultPos <= 1);
    
    const resultNeg = phiNormalize(-10);
    assert.ok(resultNeg >= 0 && resultNeg < 0.1);
  });

  test('phiNormalize(0) returns approximately 0.5', () => {
    const result = phiNormalize(0);
    assert.ok(result > 0.3 && result < 0.7);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - AISMessage', () => {
  test('Create message with defaults', () => {
    const msg = new AISMessage();
    assert.ok(msg.id.startsWith('msg-'));
    assert.strictEqual(msg.type, MessageType.Ping);
    assert.strictEqual(msg.source, Language.JavaScript);
    assert.strictEqual(msg.priority, Priority.Normal);
    assert.strictEqual(msg.phiWeight, 1.0);
  });

  test('Create message with custom values', () => {
    const msg = new AISMessage({
      id: 'test-001',
      type: MessageType.Compute,
      source: Language.JavaScript,
      target: Language.Julia,
      priority: Priority.High,
      payload: 'fibonacci(42)'
    });
    
    assert.strictEqual(msg.id, 'test-001');
    assert.strictEqual(msg.type, MessageType.Compute);
    assert.strictEqual(msg.target, Language.Julia);
    assert.strictEqual(msg.priority, Priority.High);
    assert.ok(Math.abs(msg.phiWeight - PHI) < 1e-10);
  });

  test('Create φ-weighted message', () => {
    const msg = AISMessage.createPhiWeighted({
      type: MessageType.PhiState,
      target: Language.Rust,
      importance: 2.0
    });
    
    assert.ok(msg.phiWeight > 0 && msg.phiWeight <= 1);
    assert.ok([Priority.Critical, Priority.High, Priority.Normal, Priority.Low, Priority.Background]
      .includes(msg.priority));
  });

  test('Serialize message to string', () => {
    const msg = new AISMessage({
      id: 'ser-001',
      type: MessageType.Ping,
      source: Language.JavaScript,
      target: Language.Haskell,
      payload: 'test-payload'
    });
    
    const serialized = msg.serialize();
    assert.ok(serialized.includes('AIS_MSG_V1'));
    assert.ok(serialized.includes('ID:ser-001'));
    assert.ok(serialized.includes('TYPE:Ping'));
    assert.ok(serialized.includes('SRC:JavaScript'));
    assert.ok(serialized.includes('TGT:Haskell'));
    assert.ok(serialized.includes('PAYLOAD:test-payload'));
    assert.ok(serialized.includes('END_MSG'));
  });

  test('Deserialize message from string', () => {
    const original = new AISMessage({
      id: 'deser-001',
      type: MessageType.Result,
      source: Language.Rust,
      target: Language.JavaScript,
      priority: Priority.Critical,
      payload: '{"result": 42}'
    });
    
    const serialized = original.serialize();
    const restored = AISMessage.deserialize(serialized);
    
    assert.ok(restored !== null);
    assert.strictEqual(restored.id, 'deser-001');
    assert.strictEqual(restored.type, MessageType.Result);
    assert.strictEqual(restored.source, Language.Rust);
    assert.strictEqual(restored.target, Language.JavaScript);
    assert.strictEqual(restored.payload, '{"result": 42}');
  });

  test('Deserialize invalid input returns null', () => {
    const result = AISMessage.deserialize('invalid message');
    assert.strictEqual(result, null);
  });

  test('toJSON returns correct object', () => {
    const msg = new AISMessage({
      id: 'json-001',
      type: MessageType.Sync,
      payload: 'sync-data'
    });
    
    const json = msg.toJSON();
    assert.strictEqual(json.id, 'json-001');
    assert.strictEqual(json.type, MessageType.Sync);
    assert.strictEqual(json.payload, 'sync-data');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRIORITY QUEUE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - PhiQueue', () => {
  test('Create empty queue', () => {
    const queue = new PhiQueue();
    assert.strictEqual(queue.length, 0);
    assert.strictEqual(queue.isEmpty(), true);
  });

  test('Enqueue maintains φ-weighted order', () => {
    const queue = new PhiQueue();
    
    queue.enqueue(new AISMessage({ id: 'low', priority: Priority.Low }));
    queue.enqueue(new AISMessage({ id: 'high', priority: Priority.High }));
    queue.enqueue(new AISMessage({ id: 'normal', priority: Priority.Normal }));
    queue.enqueue(new AISMessage({ id: 'critical', priority: Priority.Critical }));
    
    assert.strictEqual(queue.length, 4);
    
    // Dequeue in priority order (highest first)
    assert.strictEqual(queue.dequeue().id, 'critical');
    assert.strictEqual(queue.dequeue().id, 'high');
    assert.strictEqual(queue.dequeue().id, 'normal');
    assert.strictEqual(queue.dequeue().id, 'low');
  });

  test('Dequeue from empty queue returns null', () => {
    const queue = new PhiQueue();
    assert.strictEqual(queue.dequeue(), null);
  });

  test('Peek returns highest priority without removing', () => {
    const queue = new PhiQueue();
    queue.enqueue(new AISMessage({ id: 'peek-test', priority: Priority.Critical }));
    
    const peeked = queue.peek();
    assert.strictEqual(peeked.id, 'peek-test');
    assert.strictEqual(queue.length, 1);
  });

  test('Clear removes all messages', () => {
    const queue = new PhiQueue();
    queue.enqueue(new AISMessage({}));
    queue.enqueue(new AISMessage({}));
    
    queue.clear();
    assert.strictEqual(queue.length, 0);
  });

  test('toArray returns copy of messages', () => {
    const queue = new PhiQueue();
    queue.enqueue(new AISMessage({ id: 'msg1' }));
    queue.enqueue(new AISMessage({ id: 'msg2' }));
    
    const array = queue.toArray();
    assert.strictEqual(array.length, 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// LANGUAGE BRIDGE TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - Language Bridges', () => {
  test('getBridgeCapabilities returns expected bridges', () => {
    const bridges = getBridgeCapabilities();
    assert.ok(Array.isArray(bridges));
    assert.ok(bridges.length > 0);
    
    const jsJulia = bridges.find(b => b.name === 'js-julia');
    assert.ok(jsJulia);
    assert.strictEqual(jsJulia.source, Language.JavaScript);
    assert.strictEqual(jsJulia.target, Language.Julia);
    assert.strictEqual(jsJulia.bidirectional, true);
  });

  test('canCommunicate returns true for same language', () => {
    assert.strictEqual(canCommunicate(Language.JavaScript, Language.JavaScript), true);
    assert.strictEqual(canCommunicate(Language.Rust, Language.Rust), true);
  });

  test('canCommunicate returns true for supported bridges', () => {
    assert.strictEqual(canCommunicate(Language.JavaScript, Language.Julia), true);
    assert.strictEqual(canCommunicate(Language.JavaScript, Language.Rust), true);
    assert.strictEqual(canCommunicate(Language.JavaScript, Language.Haskell), true);
  });

  test('canCommunicate returns true for bidirectional bridges', () => {
    assert.strictEqual(canCommunicate(Language.Julia, Language.JavaScript), true);
    assert.strictEqual(canCommunicate(Language.Rust, Language.JavaScript), true);
  });

  test('LanguageBridge constructor creates valid bridge', () => {
    const bridge = new LanguageBridge({
      name: 'test-bridge',
      source: Language.JavaScript,
      target: Language.Python,
      supportedTypes: [MessageType.Ping, MessageType.Pong],
      bidirectional: true,
      latencyMs: 5
    });
    
    assert.strictEqual(bridge.name, 'test-bridge');
    assert.strictEqual(bridge.latencyMs, 5);
    assert.deepStrictEqual(bridge.supportedTypes, [MessageType.Ping, MessageType.Pong]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL HANDLER TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - Protocol Handlers', () => {
  test('handlePing returns Pong message', () => {
    const ping = new AISMessage({
      id: 'ping-001',
      type: MessageType.Ping,
      source: Language.Rust,
      target: Language.JavaScript
    });
    
    const pong = handlePing(ping);
    assert.strictEqual(pong.type, MessageType.Pong);
    assert.strictEqual(pong.source, Language.JavaScript);
    assert.strictEqual(pong.target, Language.Rust);
    assert.strictEqual(pong.id, 'ping-001-response');
    assert.strictEqual(pong.payload, 'pong');
  });

  test('handleCompute executes function and returns Result', () => {
    const compute = new AISMessage({
      id: 'compute-001',
      type: MessageType.Compute,
      source: Language.Julia,
      target: Language.JavaScript,
      payload: '42'
    });
    
    const result = handleCompute(compute, (payload) => parseInt(payload) * 2);
    assert.strictEqual(result.type, MessageType.Result);
    assert.strictEqual(result.payload, '84');
  });

  test('handleCompute returns Error on exception', () => {
    const compute = new AISMessage({
      id: 'compute-err',
      type: MessageType.Compute,
      payload: 'invalid'
    });
    
    const result = handleCompute(compute, () => {
      throw new Error('Computation failed');
    });
    
    assert.strictEqual(result.type, MessageType.Error);
    assert.ok(result.payload.includes('Computation failed'));
  });

  test('handleSync returns φ-weighted SyncAck', () => {
    const sync = new AISMessage({
      id: 'sync-001',
      type: MessageType.Sync,
      source: Language.Haskell,
      target: Language.JavaScript
    });
    
    const ack = handleSync(sync, 1.5);
    assert.strictEqual(ack.type, MessageType.SyncAck);
    assert.strictEqual(ack.source, Language.JavaScript);
    assert.strictEqual(ack.target, Language.Haskell);
    assert.strictEqual(ack.payload, '1.5');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('AIS Bridge - Integration Tests', () => {
  test('Full message round-trip', () => {
    // Create original message
    const original = new AISMessage({
      id: 'roundtrip-001',
      type: MessageType.Compute,
      source: Language.Julia,
      target: Language.JavaScript,
      priority: Priority.High,
      payload: 'fibonacci(20)'
    });
    
    // Serialize
    const serialized = original.serialize();
    
    // Deserialize
    const restored = AISMessage.deserialize(serialized);
    
    // Handle compute
    const result = handleCompute(restored, () => 6765);
    
    // Verify result
    assert.strictEqual(result.type, MessageType.Result);
    assert.strictEqual(result.target, Language.Julia);
    assert.strictEqual(result.payload, '6765');
  });

  test('Queue processes messages in φ-weighted order', () => {
    const queue = new PhiQueue();
    
    // Add messages of varying priorities
    queue.enqueue(new AISMessage({ id: 'bg', priority: Priority.Background }));
    queue.enqueue(new AISMessage({ id: 'crit', priority: Priority.Critical }));
    queue.enqueue(new AISMessage({ id: 'norm', priority: Priority.Normal }));
    
    // Process all with results
    const results = [];
    while (!queue.isEmpty()) {
      results.push(handlePing(queue.dequeue()).id);
    }
    
    // Verify order: Critical, Normal, Background
    assert.strictEqual(results[0], 'crit-response');
    assert.strictEqual(results[1], 'norm-response');
    assert.strictEqual(results[2], 'bg-response');
  });

  test('Multi-language message chain', () => {
    // JS -> Julia
    const jsToJulia = new AISMessage({
      id: 'chain-001',
      type: MessageType.Ping,
      source: Language.JavaScript,
      target: Language.Julia
    });
    
    // Julia responds
    const juliaResponse = handlePing(jsToJulia);
    assert.strictEqual(juliaResponse.source, Language.Julia);
    
    // Julia -> Rust
    const juliaToRust = new AISMessage({
      id: 'chain-002',
      type: MessageType.Compute,
      source: Language.Julia,
      target: Language.Rust,
      payload: juliaResponse.id
    });
    
    // Verify bridge compatibility
    assert.strictEqual(canCommunicate(Language.JavaScript, Language.Julia), true);
    assert.strictEqual(canCommunicate(Language.Julia, Language.Rust), true);
  });
});

console.log('AIS Bridge Test Suite Loaded');
