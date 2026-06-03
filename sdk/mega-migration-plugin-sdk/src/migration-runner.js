import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class MigrationRunner {
  constructor() { this._migrations = []; this._executed = []; }
  register(name, up, down) { if (typeof up !== 'function') throw new TypeError('up must be a function'); if (typeof down !== 'function') throw new TypeError('down must be a function'); this._migrations.push({ migrationId: crypto.randomUUID(), name, up, down, order: this._migrations.length }); return { name, order: this._migrations.length - 1 }; }
  runAll() { const results = []; for (const m of this._migrations) { if (this._executed.find(e => e.name === m.name)) continue; const result = m.up(); this._executed.push({ ...m, executedAt: Date.now() }); results.push({ name: m.name, result }); } return { executed: results.length, results, phiProgress: results.length / (this._migrations.length || 1) * (PHI / (PHI + 1)) }; }
  rollback(name) { const idx = this._executed.findIndex(e => e.name === name); if (idx === -1) throw new Error(`Migration "${name}" not executed`); const m = this._executed[idx]; const result = m.down(); this._executed.splice(idx, 1); return { name, rolledBack: true, result }; }
  getStatus() { return { total: this._migrations.length, executed: this._executed.length, pending: this._migrations.length - this._executed.length }; }
  getPending() { return this._migrations.filter(m => !this._executed.find(e => e.name === m.name)).map(m => m.name); }
}
