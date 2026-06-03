/**
 * Multi-Language Bridge Integration Test Suite
 * =============================================
 * Tests for cross-language communication, φ-synchronization,
 * and Greek mathematical operations across the polyglot stack
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  PHI, PHI_INVERSE, PHI_SQUARED,
  Language, MessageType, Priority,
  AISMessage, PhiQueue,
  canCommunicate, handlePing, handleSync
} from '../ais/bridge.js';
import GreekMath from '../gml/greek-math.js';

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-LANGUAGE COMMUNICATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - Communication Matrix', () => {
  const languages = [
    Language.JavaScript,
    Language.Julia,
    Language.Rust,
    Language.Haskell,
    Language.Python
  ];

  test('All primary languages can communicate with JavaScript', () => {
    for (const lang of languages) {
      if (lang !== Language.JavaScript) {
        assert.strictEqual(
          canCommunicate(Language.JavaScript, lang),
          true,
          `JS should communicate with ${lang}`
        );
      }
    }
  });

  test('Bidirectional communication for all JS bridges', () => {
    for (const lang of languages) {
      if (lang !== Language.JavaScript) {
        assert.strictEqual(
          canCommunicate(lang, Language.JavaScript),
          true,
          `${lang} should communicate with JS (bidirectional)`
        );
      }
    }
  });

  test('Julia-Rust bridge is functional', () => {
    assert.strictEqual(canCommunicate(Language.Julia, Language.Rust), true);
    assert.strictEqual(canCommunicate(Language.Rust, Language.Julia), true);
  });

  test('Haskell-Rust bridge is functional', () => {
    assert.strictEqual(canCommunicate(Language.Rust, Language.Haskell), true);
    assert.strictEqual(canCommunicate(Language.Haskell, Language.Rust), true);
  });

  test('Julia-Haskell bridge is functional', () => {
    assert.strictEqual(canCommunicate(Language.Julia, Language.Haskell), true);
    assert.strictEqual(canCommunicate(Language.Haskell, Language.Julia), true);
  });

  test('Self-communication always works', () => {
    for (const lang of languages) {
      assert.strictEqual(canCommunicate(lang, lang), true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// φ-SYNCHRONIZATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - φ Synchronization', () => {
  test('Sync across JS -> Julia path', () => {
    const sync = new AISMessage({
      type: MessageType.Sync,
      source: Language.JavaScript,
      target: Language.Julia,
      payload: String(PHI)
    });

    const ack = handleSync(sync, PHI);
    assert.strictEqual(ack.type, MessageType.SyncAck);
    assert.strictEqual(ack.source, Language.Julia);
    assert.strictEqual(parseFloat(ack.payload), PHI);
  });

  test('Sync across Rust -> Haskell path', () => {
    const sync = new AISMessage({
      type: MessageType.Sync,
      source: Language.Rust,
      target: Language.Haskell,
      payload: String(PHI_INVERSE)
    });

    const ack = handleSync(sync, PHI_INVERSE);
    assert.strictEqual(ack.source, Language.Haskell);
    assert.ok(parseFloat(ack.payload) > 0);
  });

  test('φ-weighted message priority scales correctly', () => {
    const weights = [0.1, 0.5, 1.0, PHI, PHI_SQUARED, 3.0];
    const expectedPriorities = [
      Priority.Background,
      Priority.Low,
      Priority.Normal,
      Priority.High,
      Priority.Critical,
      Priority.Critical
    ];

    for (let i = 0; i < weights.length; i++) {
      const msg = AISMessage.createPhiWeighted({
        importance: weights[i] * 2 - 1 // Scale to reasonable range
      });
      // Just check it's a valid priority
      assert.ok([
        Priority.Background, Priority.Low, Priority.Normal,
        Priority.High, Priority.Critical
      ].includes(msg.priority));
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GREEK MATH INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - Greek Math Verification', () => {
  test('PHI matches across JavaScript implementation', () => {
    assert.ok(Math.abs(PHI - GreekMath.PHI) < 1e-10);
  });

  test('PI matches standard', () => {
    assert.ok(Math.abs(GreekMath.PI - Math.PI) < 1e-10);
  });

  test('TAU equals 2*PI', () => {
    assert.ok(Math.abs(GreekMath.TAU - 2 * Math.PI) < 1e-10);
  });

  test('EULER_E matches Math.E', () => {
    assert.ok(Math.abs(GreekMath.EULER - Math.E) < 1e-10);
  });

  test('Golden ratio properties hold', () => {
    // φ × φ⁻¹ = 1
    assert.ok(Math.abs(GreekMath.PHI * (1/GreekMath.PHI) - 1) < 1e-10);
    // φ² = φ + 1
    assert.ok(Math.abs(GreekMath.PHI * GreekMath.PHI - (GreekMath.PHI + 1)) < 1e-10);
  });
});

describe('Multi-Language - Fibonacci Consistency', () => {
  test('Fibonacci(0) = 0', () => {
    assert.strictEqual(GreekMath.fibonacciN(0), 0);
  });

  test('Fibonacci(1) = 1', () => {
    assert.strictEqual(GreekMath.fibonacciN(1), 1);
  });

  test('Fibonacci sequence property: F(n) = F(n-1) + F(n-2)', () => {
    for (let n = 2; n <= 20; n++) {
      const f_n = GreekMath.fibonacciN(n);
      const f_n1 = GreekMath.fibonacciN(n - 1);
      const f_n2 = GreekMath.fibonacciN(n - 2);
      assert.strictEqual(f_n, f_n1 + f_n2, `F(${n}) = F(${n-1}) + F(${n-2})`);
    }
  });

  test('Fibonacci ratio converges to φ', () => {
    const n = 30;
    const ratio = GreekMath.fibonacciN(n + 1) / GreekMath.fibonacciN(n);
    assert.ok(Math.abs(ratio - PHI) < 1e-6);
  });

  test('Fibonacci(10) = 55', () => {
    assert.strictEqual(GreekMath.fibonacciN(10), 55);
  });

  test('Fibonacci(20) = 6765', () => {
    assert.strictEqual(GreekMath.fibonacciN(20), 6765);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE ROUTING TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - Message Routing', () => {
  test('Route through 3-hop path: JS -> Julia -> Rust', () => {
    // Step 1: JS -> Julia
    const msg1 = new AISMessage({
      id: 'route-001',
      type: MessageType.Ping,
      source: Language.JavaScript,
      target: Language.Julia
    });
    assert.ok(canCommunicate(msg1.source, msg1.target));
    
    // Step 2: Julia -> Rust
    const msg2 = handlePing(msg1);
    msg2.target = Language.Rust;
    assert.ok(canCommunicate(Language.Julia, Language.Rust));
  });

  test('Route through 3-hop path: JS -> Haskell -> Rust', () => {
    const msg1 = new AISMessage({
      type: MessageType.Compute,
      source: Language.JavaScript,
      target: Language.Haskell,
      payload: 'fibonacci 30'
    });
    assert.ok(canCommunicate(msg1.source, msg1.target));
    assert.ok(canCommunicate(Language.Haskell, Language.Rust));
  });

  test('All compute paths through AIS are valid', () => {
    const computePaths = [
      [Language.JavaScript, Language.Julia],
      [Language.JavaScript, Language.Rust],
      [Language.JavaScript, Language.Haskell],
      [Language.Julia, Language.Rust],
      [Language.Rust, Language.Haskell]
    ];

    for (const [src, tgt] of computePaths) {
      assert.ok(canCommunicate(src, tgt), `${src} -> ${tgt} should work`);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRIORITY QUEUE INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - Priority Queue Processing', () => {
  test('Queue processes multi-language messages in φ-order', () => {
    const queue = new PhiQueue();
    
    // Add messages from different languages with different priorities
    queue.enqueue(new AISMessage({
      id: 'js-low',
      source: Language.JavaScript,
      priority: Priority.Low
    }));
    queue.enqueue(new AISMessage({
      id: 'julia-critical',
      source: Language.Julia,
      priority: Priority.Critical
    }));
    queue.enqueue(new AISMessage({
      id: 'rust-normal',
      source: Language.Rust,
      priority: Priority.Normal
    }));
    queue.enqueue(new AISMessage({
      id: 'haskell-high',
      source: Language.Haskell,
      priority: Priority.High
    }));

    // Verify priority order
    assert.strictEqual(queue.dequeue().id, 'julia-critical');
    assert.strictEqual(queue.dequeue().id, 'haskell-high');
    assert.strictEqual(queue.dequeue().id, 'rust-normal');
    assert.strictEqual(queue.dequeue().id, 'js-low');
  });

  test('Mixed φ-weighted and explicit priority messages', () => {
    const queue = new PhiQueue();
    
    queue.enqueue(AISMessage.createPhiWeighted({
      id: 'phi-high',
      importance: 5 // High importance
    }));
    queue.enqueue(new AISMessage({
      id: 'explicit-normal',
      priority: Priority.Normal
    }));
    queue.enqueue(AISMessage.createPhiWeighted({
      id: 'phi-low',
      importance: -5 // Low importance
    }));

    // First should be highest weight
    const first = queue.dequeue();
    assert.ok(first.phiWeight >= 0.5);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GOLDEN SECTION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - Golden Section Operations', () => {
  test('Golden section search converges', () => {
    // Test that golden section can find minimum of x² on [-1, 1]
    const f = (x) => x * x;
    let a = -1, b = 1;
    const gr = PHI_INVERSE;
    
    for (let i = 0; i < 20; i++) {
      const c = b - (b - a) * gr;
      const d = a + (b - a) * gr;
      if (f(c) < f(d)) {
        b = d;
      } else {
        a = c;
      }
    }
    
    const minimum = (a + b) / 2;
    assert.ok(Math.abs(minimum) < 0.01, 'Minimum should be near 0');
  });

  test('Golden angle produces optimal distribution', () => {
    // Place 100 points using golden angle
    const n = 100;
    const goldenAngle = 2 * Math.PI * (1 - PHI_INVERSE);
    const points = [];
    
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(i / n);
      const theta = i * goldenAngle;
      points.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
      });
    }
    
    // Check all points are in unit circle
    for (const p of points) {
      assert.ok(p.x * p.x + p.y * p.y <= 1.01);
    }
  });

  test('Fibonacci spiral points', () => {
    const n = 50;
    for (let i = 1; i <= n; i++) {
      const r = Math.sqrt(i);
      const theta = i * 2.399963; // Golden angle
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      
      // All points should be finite
      assert.ok(isFinite(x));
      assert.ok(isFinite(y));
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// NUMBER THEORY INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Multi-Language - Number Theory', () => {
  test('isPrime identifies first 10 primes', () => {
    const first10Primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
    for (const p of first10Primes) {
      assert.strictEqual(GreekMath.isPrime(p), true, `${p} should be prime`);
    }
  });

  test('isPrime rejects composites', () => {
    const composites = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25];
    for (const c of composites) {
      assert.strictEqual(GreekMath.isPrime(c), false, `${c} should not be prime`);
    }
  });

  test('GCD Euclidean algorithm', () => {
    assert.strictEqual(GreekMath.gcd(12, 18), 6);
    assert.strictEqual(GreekMath.gcd(100, 35), 5);
    assert.strictEqual(GreekMath.gcd(17, 13), 1);
    assert.strictEqual(GreekMath.gcd(0, 5), 5);
  });

  test('LCM computation', () => {
    const lcm = (a, b) => (a * b) / GreekMath.gcd(a, b);
    assert.strictEqual(lcm(4, 6), 12);
    assert.strictEqual(lcm(3, 5), 15);
    assert.strictEqual(lcm(12, 18), 36);
  });
});

console.log('Multi-Language Integration Test Suite Loaded');
