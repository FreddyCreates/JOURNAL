import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class NotificationBridge {
  constructor() { this._providers = new Map(); this._deliveries = []; }
  registerProvider(name, sendFn) { if (typeof sendFn !== 'function') throw new TypeError('sendFn must be a function'); this._providers.set(name, sendFn); return { name, providerCount: this._providers.size }; }
  deliver(providerName, notification) { const fn = this._providers.get(providerName); if (!fn) throw new Error(`Provider "${providerName}" not found`); const result = fn(notification); const record = { deliveryId: crypto.randomUUID(), provider: providerName, phiReliability: PHI / (PHI + 1), timestamp: Date.now() }; this._deliveries.push(record); return { ...record, result }; }
  getProviders() { return [...this._providers.keys()]; }
  getDeliveries() { return [...this._deliveries]; }
}
