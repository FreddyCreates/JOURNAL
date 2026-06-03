import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class RetryQueue {
  constructor(config = {}) { this.maxRetries = config.maxRetries ?? 5; this.backoffBase = config.backoffBase ?? 1000; this._queue = []; this._dead = []; }
  enqueue(delivery) { const entry = { retryId: crypto.randomUUID(), delivery, attempts: 0, nextRetry: Date.now() + this.backoffBase, enqueuedAt: Date.now() }; this._queue.push(entry); return { retryId: entry.retryId, nextRetry: entry.nextRetry }; }
  retry(retryId, handler) { const entry = this._queue.find(e => e.retryId === retryId); if (!entry) throw new Error('Retry entry not found'); entry.attempts++; try { const result = handler(entry.delivery); this._queue = this._queue.filter(e => e.retryId !== retryId); return { success: true, attempts: entry.attempts, result }; } catch (e) { if (entry.attempts >= this.maxRetries) { this._queue = this._queue.filter(e2 => e2.retryId !== retryId); this._dead.push(entry); return { success: false, dead: true, attempts: entry.attempts }; } entry.nextRetry = Date.now() + this.backoffBase * Math.pow(PHI, entry.attempts); return { success: false, dead: false, nextRetry: entry.nextRetry, attempts: entry.attempts }; } }
  getQueue() { return this._queue.map(e => ({ retryId: e.retryId, attempts: e.attempts })); }
  getDead() { return [...this._dead]; }
  size() { return this._queue.length; }
}
