import crypto from 'node:crypto';
const PHI = 1.618033988749895;
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
export class StructuredLogger {
  constructor(config = {}) { this.level = config.level ?? 'info'; this.context = config.context ?? {}; this._logs = []; }
  log(level, message, meta = {}) { if (LEVELS[level] === undefined) throw new Error(`Invalid log level: ${level}`); if (LEVELS[level] < LEVELS[this.level]) return null; const entry = { logId: crypto.randomUUID(), level, message, meta: { ...this.context, ...meta }, phiWeight: LEVELS[level] / 4 * (PHI / (PHI + 1)), timestamp: Date.now() }; this._logs.push(entry); return entry; }
  debug(msg, meta) { return this.log('debug', msg, meta); }
  info(msg, meta) { return this.log('info', msg, meta); }
  warn(msg, meta) { return this.log('warn', msg, meta); }
  error(msg, meta) { return this.log('error', msg, meta); }
  fatal(msg, meta) { return this.log('fatal', msg, meta); }
  getLogs() { return [...this._logs]; }
  clear() { this._logs = []; }
}
