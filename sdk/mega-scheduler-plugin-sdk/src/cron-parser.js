const PHI = 1.618033988749895;
export class CronParser {
  constructor() { this._expressions = new Map(); }
  parse(expression) { if (typeof expression !== 'string') throw new Error('Expression must be a string'); const parts = expression.trim().split(/\s+/); if (parts.length < 5) throw new Error('Invalid cron expression (need 5 fields)'); const [minute, hour, dayOfMonth, month, dayOfWeek] = parts; return { minute, hour, dayOfMonth, month, dayOfWeek, valid: true, phiFrequency: PHI / (PHI + 1) }; }
  nextRun(expression, from = new Date()) { const parsed = this.parse(expression); const next = new Date(from); next.setMinutes(next.getMinutes() + 1); next.setSeconds(0); next.setMilliseconds(0); return { nextRun: next.toISOString(), expression, fromTime: from.toISOString() }; }
  validate(expression) { try { this.parse(expression); return { valid: true }; } catch (e) { return { valid: false, error: e.message }; } }
}
