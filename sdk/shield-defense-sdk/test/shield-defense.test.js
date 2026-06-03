/**
 * Shield Defense SDK Test Suite
 * 
 * Comprehensive tests for FirewallShield, RateLimiterShield, EncryptionShield,
 * AccessControlShield, IntegrityShield, and AnomalyShield
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { FirewallShield } from '../src/firewall-shield.js';
import { RateLimiterShield } from '../src/rate-limiter-shield.js';
import { EncryptionShield } from '../src/encryption-shield.js';
import { AccessControlShield } from '../src/access-control-shield.js';
import { IntegrityShield } from '../src/integrity-shield.js';
import { AnomalyShield } from '../src/anomaly-shield.js';

const PHI = 1.618033988749895;

// ═══════════════════════════════════════════════════════════════════════════
// FIREWALL SHIELD
// ═══════════════════════════════════════════════════════════════════════════

describe('FirewallShield', () => {
  let firewall;

  beforeEach(() => {
    firewall = new FirewallShield();
  });

  describe('addRule', () => {
    test('should add inbound rule', () => {
      const result = firewall.addRule('block-sql', 'inbound', 'SELECT.*FROM', 'deny');
      
      assert.strictEqual(result.ruleId, 'block-sql');
      assert.strictEqual(result.direction, 'inbound');
      assert.strictEqual(result.action, 'deny');
    });

    test('should add outbound rule', () => {
      const result = firewall.addRule('allow-api', 'outbound', 'api\\.', 'allow');
      
      assert.strictEqual(result.direction, 'outbound');
    });

    test('should throw for duplicate rule', () => {
      firewall.addRule('rule1', 'inbound', '.*', 'allow');
      assert.throws(
        () => firewall.addRule('rule1', 'inbound', '.*', 'deny'),
        /already exists/
      );
    });

    test('should throw for invalid direction', () => {
      assert.throws(
        () => firewall.addRule('bad', 'sideways', '.*', 'allow'),
        /Invalid direction/
      );
    });

    test('should throw for invalid action', () => {
      assert.throws(
        () => firewall.addRule('bad', 'inbound', '.*', 'maybe'),
        /Invalid action/
      );
    });
  });

  describe('evaluate', () => {
    test('should allow packet by default', () => {
      const result = firewall.evaluate({
        direction: 'inbound',
        payload: 'Hello, World!'
      });

      assert.strictEqual(result.decision, 'allow');
    });

    test('should deny matching packet', () => {
      firewall.addRule('block-badword', 'inbound', 'malicious', 'deny');

      const result = firewall.evaluate({
        direction: 'inbound',
        payload: 'This contains malicious content'
      });

      assert.strictEqual(result.decision, 'deny');
      assert.strictEqual(result.matchedRuleId, 'block-badword');
    });

    test('should inspect matching packet', () => {
      firewall.addRule('inspect-upload', 'outbound', 'upload', 'inspect');

      const result = firewall.evaluate({
        direction: 'outbound',
        payload: 'upload file to server'
      });

      assert.strictEqual(result.decision, 'inspect');
    });

    test('should evaluate rules in priority order', () => {
      firewall.addRule('broad-allow', 'inbound', '.*', 'allow');
      firewall.addRule('specific-deny', 'inbound', 'secret', 'deny');

      // First rule (broad-allow) should match first
      const result = firewall.evaluate({
        direction: 'inbound',
        payload: 'secret data'
      });

      assert.strictEqual(result.decision, 'allow');
    });
  });

  describe('removeRule', () => {
    test('should remove existing rule', () => {
      firewall.addRule('temp', 'inbound', '.*', 'deny');
      const removed = firewall.removeRule('temp');

      assert.strictEqual(removed, true);
    });

    test('should return false for unknown rule', () => {
      const removed = firewall.removeRule('nonexistent');
      assert.strictEqual(removed, false);
    });
  });

  describe('getMetrics', () => {
    test('should track evaluation metrics', () => {
      firewall.addRule('blocker', 'inbound', 'bad', 'deny');

      firewall.evaluate({ direction: 'inbound', payload: 'good' });
      firewall.evaluate({ direction: 'inbound', payload: 'bad' });
      firewall.evaluate({ direction: 'inbound', payload: 'good again' });

      const metrics = firewall.getMetrics();

      assert.strictEqual(metrics.totalEvaluations, 3);
      assert.strictEqual(metrics.totalBlocked, 1);
      assert.strictEqual(metrics.totalAllowed, 2);
    });
  });

  describe('getBlockLog', () => {
    test('should log blocked packets', () => {
      firewall.addRule('block-test', 'inbound', 'blocked', 'deny');
      firewall.evaluate({ direction: 'inbound', payload: 'blocked packet' });

      const log = firewall.getBlockLog();

      assert.strictEqual(log.length, 1);
      assert.ok(log[0].payload.includes('blocked'));
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITER SHIELD
// ═══════════════════════════════════════════════════════════════════════════

describe('RateLimiterShield', () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiterShield();
  });

  describe('registerBucket', () => {
    test('should register rate limit bucket', () => {
      limiter.registerBucket('api-calls', { limit: 100, windowMs: 60000 });

      const info = limiter.getBucketInfo('api-calls');
      assert.strictEqual(info.limit, 100);
    });
  });

  describe('check', () => {
    test('should allow requests within limit', () => {
      limiter.registerBucket('test', { limit: 5, windowMs: 1000 });

      const result = limiter.check('test', 'client-1');

      assert.strictEqual(result.allowed, true);
    });

    test('should block requests exceeding limit', () => {
      limiter.registerBucket('strict', { limit: 3, windowMs: 10000 });

      limiter.check('strict', 'client');
      limiter.check('strict', 'client');
      limiter.check('strict', 'client');
      const result = limiter.check('strict', 'client');

      assert.strictEqual(result.allowed, false);
    });

    test('should track remaining quota', () => {
      limiter.registerBucket('quota', { limit: 10, windowMs: 60000 });

      limiter.check('quota', 'user');
      limiter.check('quota', 'user');
      const result = limiter.check('quota', 'user');

      assert.strictEqual(result.remaining, 7);
    });
  });

  describe('consume', () => {
    test('should consume multiple tokens', () => {
      limiter.registerBucket('batch', { limit: 100, windowMs: 60000 });

      const result = limiter.consume('batch', 'client', 50);

      assert.strictEqual(result.allowed, true);
      assert.strictEqual(result.remaining, 50);
    });

    test('should reject when not enough tokens', () => {
      limiter.registerBucket('small', { limit: 10, windowMs: 60000 });

      const result = limiter.consume('small', 'client', 15);

      assert.strictEqual(result.allowed, false);
    });
  });

  describe('getMetrics', () => {
    test('should return rate limiter metrics', () => {
      limiter.registerBucket('m1', { limit: 100, windowMs: 60000 });
      limiter.check('m1', 'c1');
      limiter.check('m1', 'c2');

      const metrics = limiter.getMetrics();

      assert.ok('totalRequests' in metrics);
      assert.ok('totalAllowed' in metrics);
      assert.ok('totalBlocked' in metrics);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ENCRYPTION SHIELD
// ═══════════════════════════════════════════════════════════════════════════

describe('EncryptionShield', () => {
  let encryption;

  beforeEach(() => {
    encryption = new EncryptionShield();
  });

  describe('generateKey', () => {
    test('should generate encryption key', () => {
      const key = encryption.generateKey('my-key', { algorithm: 'aes-256-gcm' });

      assert.ok(key.keyId === 'my-key');
      assert.ok(key.algorithm);
    });
  });

  describe('encrypt', () => {
    test('should encrypt data', () => {
      encryption.generateKey('encrypt-key');
      
      const result = encryption.encrypt('encrypt-key', 'secret message');

      assert.ok(result.ciphertext);
      assert.ok(result.iv);
      assert.notStrictEqual(result.ciphertext, 'secret message');
    });
  });

  describe('decrypt', () => {
    test('should decrypt data', () => {
      encryption.generateKey('round-trip');
      
      const encrypted = encryption.encrypt('round-trip', 'hello world');
      const decrypted = encryption.decrypt('round-trip', encrypted);

      assert.strictEqual(decrypted, 'hello world');
    });
  });

  describe('rotateKey', () => {
    test('should rotate encryption key', () => {
      encryption.generateKey('rotatable');
      const oldKey = encryption.getKeyInfo('rotatable');

      encryption.rotateKey('rotatable');
      const newKey = encryption.getKeyInfo('rotatable');

      assert.ok(newKey.rotatedAt > oldKey.createdAt);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ACCESS CONTROL SHIELD
// ═══════════════════════════════════════════════════════════════════════════

describe('AccessControlShield', () => {
  let acl;

  beforeEach(() => {
    acl = new AccessControlShield();
  });

  describe('registerRole', () => {
    test('should register role', () => {
      acl.registerRole('admin', { permissions: ['read', 'write', 'delete'] });

      const role = acl.getRole('admin');
      assert.deepStrictEqual(role.permissions, ['read', 'write', 'delete']);
    });
  });

  describe('assignRole', () => {
    test('should assign role to subject', () => {
      acl.registerRole('user', { permissions: ['read'] });
      acl.assignRole('user-123', 'user');

      const roles = acl.getSubjectRoles('user-123');
      assert.ok(roles.includes('user'));
    });
  });

  describe('can', () => {
    test('should check permission', () => {
      acl.registerRole('editor', { permissions: ['read', 'write'] });
      acl.assignRole('user-1', 'editor');

      assert.strictEqual(acl.can('user-1', 'read'), true);
      assert.strictEqual(acl.can('user-1', 'write'), true);
      assert.strictEqual(acl.can('user-1', 'delete'), false);
    });
  });

  describe('enforce', () => {
    test('should allow permitted action', () => {
      acl.registerRole('viewer', { permissions: ['read'] });
      acl.assignRole('user', 'viewer');

      const result = acl.enforce('user', 'read', 'document-1');
      assert.strictEqual(result.allowed, true);
    });

    test('should deny unpermitted action', () => {
      acl.registerRole('guest', { permissions: [] });
      acl.assignRole('guest-user', 'guest');

      const result = acl.enforce('guest-user', 'write', 'document-1');
      assert.strictEqual(result.allowed, false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRITY SHIELD
// ═══════════════════════════════════════════════════════════════════════════

describe('IntegrityShield', () => {
  let integrity;

  beforeEach(() => {
    integrity = new IntegrityShield();
  });

  describe('hash', () => {
    test('should generate hash', () => {
      const hash = integrity.hash('my data');

      assert.ok(typeof hash === 'string');
      assert.ok(hash.length > 0);
    });

    test('should generate consistent hashes', () => {
      const h1 = integrity.hash('same data');
      const h2 = integrity.hash('same data');

      assert.strictEqual(h1, h2);
    });

    test('should generate different hashes for different data', () => {
      const h1 = integrity.hash('data 1');
      const h2 = integrity.hash('data 2');

      assert.notStrictEqual(h1, h2);
    });
  });

  describe('sign', () => {
    test('should sign data', () => {
      const signature = integrity.sign('message to sign');

      assert.ok(signature.signature);
      assert.ok(signature.timestamp);
    });
  });

  describe('verify', () => {
    test('should verify valid signature', () => {
      const sig = integrity.sign('original message');
      const valid = integrity.verify('original message', sig);

      assert.strictEqual(valid, true);
    });

    test('should reject tampered data', () => {
      const sig = integrity.sign('original');
      const valid = integrity.verify('modified', sig);

      assert.strictEqual(valid, false);
    });
  });

  describe('checkIntegrity', () => {
    test('should detect data modification', () => {
      integrity.seal('doc-1', 'original content');
      
      const check = integrity.checkIntegrity('doc-1', 'modified content');

      assert.strictEqual(check.intact, false);
    });

    test('should confirm unmodified data', () => {
      integrity.seal('doc-2', 'preserved content');
      
      const check = integrity.checkIntegrity('doc-2', 'preserved content');

      assert.strictEqual(check.intact, true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ANOMALY SHIELD
// ═══════════════════════════════════════════════════════════════════════════

describe('AnomalyShield', () => {
  let anomaly;

  beforeEach(() => {
    anomaly = new AnomalyShield();
  });

  describe('train', () => {
    test('should train on baseline data', () => {
      anomaly.train('metric-1', [10, 11, 12, 10, 11, 9, 10, 12, 11, 10]);

      const model = anomaly.getModel('metric-1');
      assert.ok(model);
      assert.ok(model.mean);
      assert.ok(model.stdDev);
    });
  });

  describe('detect', () => {
    test('should detect anomaly', () => {
      anomaly.train('normal', [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);

      const normal = anomaly.detect('normal', 10);
      const abnormal = anomaly.detect('normal', 100);

      assert.strictEqual(normal.isAnomaly, false);
      assert.strictEqual(abnormal.isAnomaly, true);
    });

    test('should return anomaly score', () => {
      anomaly.train('scored', [50, 51, 49, 50, 50, 51, 49, 50, 51, 50]);

      const result = anomaly.detect('scored', 150);

      assert.ok('score' in result);
      assert.ok(result.score > 0);
    });
  });

  describe('getAnomalies', () => {
    test('should return recent anomalies', () => {
      anomaly.train('tracked', [5, 5, 5, 5, 5]);

      anomaly.detect('tracked', 5);
      anomaly.detect('tracked', 100);
      anomaly.detect('tracked', 5);
      anomaly.detect('tracked', -50);

      const anomalies = anomaly.getAnomalies();

      assert.strictEqual(anomalies.length, 2);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Integration', () => {
  test('should combine firewall with rate limiter', () => {
    const firewall = new FirewallShield();
    const rateLimiter = new RateLimiterShield();

    firewall.addRule('allow-all', 'inbound', '.*', 'allow');
    rateLimiter.registerBucket('api', { limit: 100, windowMs: 60000 });

    const fwResult = firewall.evaluate({ direction: 'inbound', payload: 'request' });
    let rlResult = { allowed: false };

    if (fwResult.decision === 'allow') {
      rlResult = rateLimiter.check('api', 'client');
    }

    assert.strictEqual(fwResult.decision, 'allow');
    assert.strictEqual(rlResult.allowed, true);
  });

  test('should combine encryption with integrity', () => {
    const encryption = new EncryptionShield();
    const integrity = new IntegrityShield();

    encryption.generateKey('secure');
    
    const message = 'sensitive data';
    const encrypted = encryption.encrypt('secure', message);
    const signature = integrity.sign(encrypted.ciphertext);

    // Verify and decrypt
    const verified = integrity.verify(encrypted.ciphertext, signature);
    assert.strictEqual(verified, true);

    const decrypted = encryption.decrypt('secure', encrypted);
    assert.strictEqual(decrypted, message);
  });

  test('should combine access control with anomaly detection', () => {
    const acl = new AccessControlShield();
    const anomaly = new AnomalyShield();

    acl.registerRole('user', { permissions: ['read'] });
    acl.assignRole('user-1', 'user');
    anomaly.train('access-rate', [5, 6, 5, 7, 5, 6, 5, 4, 6, 5]);

    // Normal access
    const allowed = acl.can('user-1', 'read');
    const normal = anomaly.detect('access-rate', 6);

    assert.strictEqual(allowed, true);
    assert.strictEqual(normal.isAnomaly, false);
  });
});
