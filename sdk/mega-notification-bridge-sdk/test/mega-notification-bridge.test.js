import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { NotificationHub } from '../src/notification-hub.js';
import { ChannelManager } from '../src/channel-manager.js';
import { PreferenceStore } from '../src/preference-store.js';
import { PriorityQueue } from '../src/priority-queue.js';
import { NotificationBridge } from '../src/notification-bridge.js';

describe('NotificationHub', () => {
  let hub; beforeEach(() => { hub = new NotificationHub(); });
  test('should create notification', () => { const r = hub.create('user1', 'Hello'); assert.ok(r.notifId); });
  test('should send notification', () => { const n = hub.create('u', 'msg'); const r = hub.send(n.notifId); assert.strictEqual(r.status, 'sent'); });
  test('should throw on missing', () => { assert.throws(() => hub.send('x'), /not found/); });
  test('should track pending', () => { hub.create('u', 'a'); assert.strictEqual(hub.getPending().length, 1); });
});
describe('ChannelManager', () => {
  let cm; beforeEach(() => { cm = new ChannelManager(); });
  test('should register', () => { const r = cm.register('email', { type: 'email' }); assert.strictEqual(r.type, 'email'); });
  test('should disable', () => { cm.register('sms'); const r = cm.disable('sms'); assert.strictEqual(r.enabled, false); });
  test('should get active', () => { cm.register('a'); cm.register('b'); cm.disable('b'); assert.strictEqual(cm.getActive().length, 1); });
});
describe('PreferenceStore', () => {
  let ps; beforeEach(() => { ps = new PreferenceStore(); });
  test('should set prefs', () => { const r = ps.set('u1', { quiet: true }); assert.strictEqual(r.stored, true); });
  test('should get prefs', () => { ps.set('u1', { theme: 'dark' }); const r = ps.get('u1'); assert.strictEqual(r.preferences.theme, 'dark'); });
  test('should check notification permission', () => { ps.set('u1', { mutedChannels: ['sms'] }); assert.strictEqual(ps.shouldNotify('u1', 'sms', 'normal'), false); });
});
describe('PriorityQueue', () => {
  let pq; beforeEach(() => { pq = new PriorityQueue(); });
  test('should enqueue', () => { const r = pq.enqueue('task', 5); assert.ok(r.entryId); });
  test('should dequeue highest priority', () => { pq.enqueue('low', 1); pq.enqueue('high', 10); const r = pq.dequeue(); assert.strictEqual(r.item, 'high'); });
  test('should throw on empty dequeue', () => { assert.throws(() => pq.dequeue(), /empty/); });
  test('should peek', () => { pq.enqueue('x', 5); assert.strictEqual(pq.peek().item, 'x'); });
});
describe('NotificationBridge', () => {
  let nb; beforeEach(() => { nb = new NotificationBridge(); });
  test('should register provider', () => { const r = nb.registerProvider('firebase', n => ({ sent: true })); assert.strictEqual(r.providerCount, 1); });
  test('should deliver', () => { nb.registerProvider('p', n => ({ ok: true })); const r = nb.deliver('p', { msg: 'hi' }); assert.strictEqual(r.result.ok, true); });
  test('should throw on missing provider', () => { assert.throws(() => nb.deliver('x', {}), /not found/); });
});
