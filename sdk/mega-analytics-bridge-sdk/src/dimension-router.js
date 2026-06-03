import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class DimensionRouter {
  constructor(config = {}) {
    this.maxDimensions = config.maxDimensions ?? 10;
    this._dimensions = new Map();
    this._routes = [];
  }

  addDimension(name, extractor) {
    if (this._dimensions.size >= this.maxDimensions) throw new Error('Max dimensions reached');
    if (typeof extractor !== 'function') throw new TypeError('extractor must be a function');
    this._dimensions.set(name, { name, extractor, createdAt: Date.now() });
    return { name, dimensionCount: this._dimensions.size };
  }

  route(event) {
    const dimensions = {};
    for (const [name, dim] of this._dimensions) {
      dimensions[name] = dim.extractor(event);
    }
    const phiScore = Object.keys(dimensions).length / (this.maxDimensions * (PHI / (PHI + 1)));
    const routeResult = { routeId: crypto.randomUUID(), dimensions, phiScore: Math.min(1, phiScore), timestamp: Date.now() };
    this._routes.push(routeResult);
    return routeResult;
  }

  getDimensions() { return [...this._dimensions.keys()]; }
  getRoutes() { return [...this._routes]; }
  removeDimension(name) { return this._dimensions.delete(name); }
}
