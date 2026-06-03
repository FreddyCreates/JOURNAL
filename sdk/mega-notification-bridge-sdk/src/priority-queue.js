import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class PriorityQueue {
  constructor() { this._queue = []; }
  enqueue(item, priority = 0) { const entry = { entryId: crypto.randomUUID(), item, priority, phiWeight: priority * (PHI / (PHI + 1)), enqueuedAt: Date.now() }; this._queue.push(entry); this._queue.sort((a, b) => b.priority - a.priority); return { entryId: entry.entryId, position: this._queue.indexOf(entry) }; }
  dequeue() { if (this._queue.length === 0) throw new Error('Queue is empty'); return this._queue.shift(); }
  peek() { return this._queue[0] ?? null; }
  size() { return this._queue.length; }
  clear() { this._queue = []; }
}
