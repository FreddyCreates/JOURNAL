import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SchedulerPlugin {
  constructor(config = {}) { this.name = config.name ?? 'scheduler'; this._timers = new Map(); this._executions = []; }
  scheduleOnce(name, delayMs, fn) { if (typeof fn !== 'function') throw new TypeError('fn must be a function'); const timer = { timerId: crypto.randomUUID(), name, delayMs, fn, type: 'once' }; this._timers.set(timer.timerId, timer); return { timerId: timer.timerId, name }; }
  executeNow(timerId) { const timer = this._timers.get(timerId); if (!timer) throw new Error('Timer not found'); const result = timer.fn(); this._executions.push({ timerId, executedAt: Date.now(), phiPrecision: PHI / (PHI + 1) }); if (timer.type === 'once') this._timers.delete(timerId); return { timerId, result }; }
  cancel(timerId) { return this._timers.delete(timerId); }
  getTimers() { return [...this._timers.values()].map(t => ({ timerId: t.timerId, name: t.name })); }
  getExecutions() { return [...this._executions]; }
}
