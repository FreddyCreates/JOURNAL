import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class TaskScheduler {
  constructor(config = {}) {
    this.algorithm = config.algorithm ?? 'phi-priority';
    this.maxConcurrent = config.maxConcurrent ?? 16;
    this.timeQuantum = config.timeQuantum ?? 873;
    this._queue = [];
    this._running = [];
    this._completed = [];
  }

  schedule(task) {
    const taskId = crypto.randomUUID();
    const priority = (task.urgency ?? 1) * (task.importance ?? 1) * PHI;
    const entry = { taskId, task, priority, status: 'queued', scheduledAt: Date.now() };
    this._queue.push(entry);
    this._queue.sort((a, b) => b.priority - a.priority);
    const queuePosition = this._queue.indexOf(entry);
    return { taskId, priority, estimatedStart: Date.now() + queuePosition * this.timeQuantum, queuePosition };
  }

  execute(taskId) {
    const idx = this._queue.findIndex(t => t.taskId === taskId);
    if (idx === -1) throw new Error(`Task ${taskId} not in queue`);
    if (this._running.length >= this.maxConcurrent) throw new Error('Max concurrent tasks reached');
    const task = this._queue.splice(idx, 1)[0];
    task.status = 'executing';
    task.startedAt = Date.now();
    this._running.push(task);
    return { taskId, status: 'executing', startedAt: task.startedAt };
  }

  complete(taskId, result) {
    const idx = this._running.findIndex(t => t.taskId === taskId);
    if (idx === -1) throw new Error(`Task ${taskId} not running`);
    const task = this._running.splice(idx, 1)[0];
    task.status = 'completed';
    task.completedAt = Date.now();
    task.result = result;
    this._completed.push(task);
    return { taskId, status: 'completed', duration: task.completedAt - task.startedAt, result };
  }

  getQueue() { return this._queue.map(t => ({ ...t })); }
  getRunning() { return this._running.map(t => ({ ...t })); }

  getMetrics() {
    const durations = this._completed.map(t => t.completedAt - t.startedAt);
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
    return { queued: this._queue.length, running: this._running.length, completed: this._completed.length, avgDuration, utilization: this._running.length / this.maxConcurrent };
  }
}
