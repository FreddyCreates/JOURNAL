import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class GatewayBridge {
  constructor() { this._gateways = new Map(); this._proxies = []; }
  registerGateway(name, config = {}) { this._gateways.set(name, { name, baseUrl: config.baseUrl ?? '', createdAt: Date.now() }); return { name, registered: true }; }
  proxy(sourceGateway, targetGateway, request) { if (!this._gateways.has(sourceGateway)) throw new Error(`Gateway "${sourceGateway}" not found`); if (!this._gateways.has(targetGateway)) throw new Error(`Gateway "${targetGateway}" not found`); const record = { proxyId: crypto.randomUUID(), source: sourceGateway, target: targetGateway, phiLatency: PHI / (PHI + 1), timestamp: Date.now() }; this._proxies.push(record); return { ...record, request }; }
  getGateways() { return [...this._gateways.keys()]; }
  getProxies() { return [...this._proxies]; }
}
