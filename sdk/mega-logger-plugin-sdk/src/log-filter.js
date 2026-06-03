const PHI = 1.618033988749895;
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
export class LogFilter {
  constructor(config = {}) { this.minLevel = config.minLevel ?? 'debug'; this._patterns = []; this._stats = { passed: 0, filtered: 0 }; }
  addPattern(pattern) { this._patterns.push(pattern); return { patternCount: this._patterns.length }; }
  filter(log) { if (LEVELS[log.level] < LEVELS[this.minLevel]) { this._stats.filtered++; return { passed: false, reason: 'below_min_level' }; } for (const pattern of this._patterns) { if (log.message && log.message.includes(pattern)) { this._stats.filtered++; return { passed: false, reason: 'pattern_match', pattern }; } } this._stats.passed++; return { passed: true, phiSignal: PHI / (PHI + 1) }; }
  getStats() { return { ...this._stats }; }
}
