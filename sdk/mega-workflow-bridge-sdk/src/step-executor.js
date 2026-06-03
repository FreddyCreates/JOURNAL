import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class StepExecutor {
  constructor(config = {}) {
    this.timeout = config.timeout ?? 30000;
    this.retries = config.retries ?? 3;
    this._history = [];
  }

  async execute(step, context = {}) {
    const startTime = Date.now();
    let attempts = 0;
    let result = null;
    let error = null;
    while (attempts < this.retries) {
      attempts++;
      try {
        result = typeof step === 'function' ? step(context) : { ...step, executed: true };
        break;
      } catch (e) { error = e; }
    }
    if (!result && error) throw error;
    const duration = Date.now() - startTime;
    const phiScore = Math.min(1, (1 / attempts) * (PHI / (PHI + 1)));
    const record = { executionId: crypto.randomUUID(), attempts, duration, phiScore, success: !!result, timestamp: Date.now() };
    this._history.push(record);
    return { ...record, result };
  }

  getHistory() { return [...this._history]; }
  getSuccessRate() {
    if (this._history.length === 0) return 0;
    return this._history.filter(h => h.success).length / this._history.length;
  }
}
