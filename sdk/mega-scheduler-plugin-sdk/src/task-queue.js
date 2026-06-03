import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TaskQueue {
  constructor(config = {}) { this.concurrency = config.concurrency ?? 5; this._queue = []; this._running = 0; this._completed = []; }
  enqueue(task, priority = 0) { const entry = { taskId: crypto.randomUUID(), task, priority, status: 'queued', enqueuedAt: Date.now() }; this._queue.push(entry); this._queue.sort((a, b) => b.priority - a.priority); return { taskId: entry.taskId, position: this._queue.indexOf(entry) }; }
  dequeue() { if (this._queue.length === 0) throw new Error('Queue is empty'); if (this._running >= this.concurrency) throw new Error('Max concurrency reached'); const entry = this._queue.shift(); this._running++; entry.status = 'running'; return { taskId: entry.taskId, task: entry.task }; }
  complete(taskId) { this._running = Math.max(0, this._running - 1); this._completed.push({ taskId, completedAt: Date.now(), phiThroughput: PHI / (PHI + 1) }); return { taskId, completed: true }; }
  size() { return this._queue.length; }
  getRunning() { return this._running; }
}
