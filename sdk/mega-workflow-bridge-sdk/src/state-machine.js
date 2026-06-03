import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class StateMachine {
  constructor(config = {}) {
    this.initialState = config.initialState ?? 'idle';
    this._currentState = this.initialState;
    this._transitions = new Map();
    this._history = [{ state: this.initialState, timestamp: Date.now() }];
  }

  addTransition(from, event, to, guard = null) {
    const key = `${from}:${event}`;
    this._transitions.set(key, { from, event, to, guard });
    return { from, event, to, registered: true };
  }

  send(event, payload = {}) {
    const key = `${this._currentState}:${event}`;
    const transition = this._transitions.get(key);
    if (!transition) throw new Error(`No transition from "${this._currentState}" on "${event}"`);
    if (transition.guard && !transition.guard(payload)) throw new Error('Guard condition failed');
    const prev = this._currentState;
    this._currentState = transition.to;
    const phiFlow = 1 - Math.abs(this._history.length - PHI * Math.floor(this._history.length / PHI)) / PHI;
    const entry = { transitionId: crypto.randomUUID(), from: prev, to: this._currentState, event, phiFlow: Math.abs(phiFlow), timestamp: Date.now() };
    this._history.push({ state: this._currentState, timestamp: Date.now() });
    return entry;
  }

  getState() { return this._currentState; }
  getHistory() { return [...this._history]; }
  reset() { this._currentState = this.initialState; this._history = [{ state: this.initialState, timestamp: Date.now() }]; }
}
