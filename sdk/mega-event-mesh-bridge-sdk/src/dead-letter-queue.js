import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class DeadLetterQueue {
  constructor(config = {}) { this.maxRetries = config.maxRetries ?? 3; this._queue = []; this._processed = []; }
  enqueue(event, reason) { const entry = { dlqId: crypto.randomUUID(), event, reason, retries: 0, enqueuedAt: Date.now() }; this._queue.push(entry); return { dlqId: entry.dlqId, reason }; }
  retry(dlqId, handler) { const entry = this._queue.find(e => e.dlqId === dlqId); if (!entry) throw new Error('Entry not found'); if (entry.retries >= this.maxRetries) throw new Error('Max retries exceeded'); entry.retries++; try { const result = handler(entry.event); this._queue = this._queue.filter(e => e.dlqId !== dlqId); this._processed.push({ ...entry, result, processedAt: Date.now() }); return { success: true, result }; } catch (e) { return { success: false, error: e.message, retriesLeft: this.maxRetries - entry.retries }; } }
  getQueue() { return [...this._queue]; }
  getProcessed() { return [...this._processed]; }
  size() { return this._queue.length; }
}
