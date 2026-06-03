import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class TopicRouter {
  constructor() { this._routes = new Map(); this._routeLog = []; }
  addRoute(pattern, destination) { this._routes.set(pattern, { pattern, destination, createdAt: Date.now() }); return { pattern, destination }; }
  route(topic) { let bestMatch = null; for (const [pattern, route] of this._routes) { if (topic.startsWith(pattern) || topic === pattern) { if (!bestMatch || pattern.length > bestMatch.pattern.length) bestMatch = route; } } if (!bestMatch) throw new Error(`No route for topic "${topic}"`); const record = { routeId: crypto.randomUUID(), topic, destination: bestMatch.destination, phiMatch: PHI / (PHI + 1), timestamp: Date.now() }; this._routeLog.push(record); return record; }
  getRoutes() { return [...this._routes.values()]; }
  removeRoute(pattern) { return this._routes.delete(pattern); }
}
