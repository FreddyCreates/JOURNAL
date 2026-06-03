import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TelemetryPlugin {
  constructor(config = {}) { this.name = config.name ?? 'telemetry'; this._hooks = new Map(); this._events = []; }
  registerHook(event, handler) { if (typeof handler !== 'function') throw new TypeError('handler must be a function'); if (!this._hooks.has(event)) this._hooks.set(event, []); this._hooks.get(event).push(handler); return { event, hookCount: this._hooks.get(event).length }; }
  emit(event, data = {}) { const handlers = this._hooks.get(event) || []; for (const h of handlers) h(data); const record = { eventId: crypto.randomUUID(), event, handlersTriggered: handlers.length, phiSignal: PHI / (PHI + 1), timestamp: Date.now() }; this._events.push(record); return record; }
  getEvents() { return [...this._events]; }
  getHooks() { return [...this._hooks.keys()]; }
}
