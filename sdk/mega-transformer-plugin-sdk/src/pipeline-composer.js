import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class PipelineComposer {
  constructor() { this._steps = []; }
  add(name, fn) { if (typeof fn !== 'function') throw new TypeError('fn must be a function'); this._steps.push({ name, fn }); return { name, position: this._steps.length - 1 }; }
  compose() { const steps = [...this._steps]; return (input) => { let data = input; for (const step of steps) data = step.fn(data); return { result: data, stepsApplied: steps.length, phiFlow: PHI / (PHI + 1) }; }; }
  getSteps() { return this._steps.map(s => s.name); }
  clear() { this._steps = []; }
}
