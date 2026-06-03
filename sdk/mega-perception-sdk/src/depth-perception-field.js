import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class DepthPerceptionField {
  constructor(config = {}) {
    this.dimensions = config.dimensions ?? 3;
    this.fieldResolution = config.fieldResolution ?? 64;
    this.phiLayering = config.phiLayering ?? true;
    this._points = new Map();
  }

  mapPoint(coordinates, value) {
    const pointId = crypto.randomUUID();
    const depth = coordinates.reduce((sum, c, i) => sum + c * Math.pow(PHI, -i), 0);
    const fieldStrength = value * Math.pow(PHI, -Math.abs(depth));
    const entry = { pointId, coordinates: [...coordinates], value, depth, fieldStrength, timestamp: Date.now() };
    this._points.set(pointId, entry);
    return { pointId, coordinates: entry.coordinates, depth, fieldStrength };
  }

  getDepthAt(coordinates) {
    const key = coordinates.join(',');
    for (const point of this._points.values()) {
      if (point.coordinates.join(',') === key) return { depth: point.depth, value: point.value, fieldStrength: point.fieldStrength };
    }
    return null;
  }

  getFieldSlice(dimension, value) {
    const results = [];
    for (const point of this._points.values()) {
      if (dimension < point.coordinates.length && Math.abs(point.coordinates[dimension] - value) < 1.0 / this.fieldResolution) {
        results.push({ ...point });
      }
    }
    return results;
  }

  computeGradient(pointIdA, pointIdB) {
    const a = this._points.get(pointIdA);
    const b = this._points.get(pointIdB);
    if (!a || !b) return null;
    const distance = Math.sqrt(a.coordinates.reduce((sum, c, i) => sum + Math.pow(c - (b.coordinates[i] ?? 0), 2), 0));
    const depthDiff = b.depth - a.depth;
    const gradient = distance > 0 ? (depthDiff / distance) * PHI : 0;
    return { gradient, distance, depthDifference: depthDiff, phiWeighted: gradient * PHI };
  }

  getFieldState() {
    const points = [...this._points.values()];
    const avgDepth = points.length > 0 ? points.reduce((s, p) => s + p.depth, 0) / points.length : 0;
    return { pointCount: points.length, dimensions: this.dimensions, avgDepth, resolution: this.fieldResolution };
  }
}
