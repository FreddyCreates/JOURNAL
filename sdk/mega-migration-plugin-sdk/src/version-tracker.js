import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class VersionTracker {
  constructor() { this._versions = []; this._current = null; }
  record(version, description = '') { const entry = { versionId: crypto.randomUUID(), version, description, appliedAt: Date.now(), phiSequence: this._versions.length * (PHI / (PHI + 1)) }; this._versions.push(entry); this._current = version; return entry; }
  getCurrent() { return this._current; }
  getHistory() { return [...this._versions]; }
  isApplied(version) { return this._versions.some(v => v.version === version); }
}
