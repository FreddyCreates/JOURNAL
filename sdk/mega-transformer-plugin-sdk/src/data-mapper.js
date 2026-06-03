import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class DataMapper {
  constructor() { this._mappings = new Map(); this._transforms = []; }
  define(sourcePath, targetPath, transform = null) { this._mappings.set(sourcePath, { targetPath, transform }); return { sourcePath, targetPath, mappingCount: this._mappings.size }; }
  map(source) { const result = {}; for (const [srcPath, { targetPath, transform }] of this._mappings) { let value = srcPath.split('.').reduce((obj, key) => obj?.[key], source); if (transform) value = transform(value); const parts = targetPath.split('.'); let current = result; for (let i = 0; i < parts.length - 1; i++) { current[parts[i]] = current[parts[i]] ?? {}; current = current[parts[i]]; } current[parts[parts.length - 1]] = value; } const record = { mappingId: crypto.randomUUID(), fieldsMapper: this._mappings.size, phiFidelity: PHI / (PHI + 1) }; this._transforms.push(record); return { ...record, result }; }
  getMappings() { return [...this._mappings.keys()]; }
  clear() { this._mappings.clear(); }
}
