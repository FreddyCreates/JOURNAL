import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class GatewayRouter {
  constructor() { this._routes = []; this._requests = []; }
  addRoute(method, path, handler) { if (typeof handler !== 'function') throw new TypeError('handler must be a function'); this._routes.push({ routeId: crypto.randomUUID(), method: method.toUpperCase(), path, handler }); return { method, path, routeCount: this._routes.length }; }
  match(method, path) { const route = this._routes.find(r => r.method === method.toUpperCase() && (r.path === path || path.startsWith(r.path + '/'))); if (!route) throw new Error(`No route for ${method} ${path}`); const record = { requestId: crypto.randomUUID(), routeId: route.routeId, method, path, phiMatch: PHI / (PHI + 1), timestamp: Date.now() }; this._requests.push(record); return { ...record, handler: route.handler }; }
  getRoutes() { return this._routes.map(r => ({ routeId: r.routeId, method: r.method, path: r.path })); }
  removeRoute(routeId) { this._routes = this._routes.filter(r => r.routeId !== routeId); }
}
