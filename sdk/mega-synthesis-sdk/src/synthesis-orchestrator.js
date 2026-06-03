import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class SynthesisOrchestrator {
  constructor(config = {}) {
    this.pipeline = config.pipeline ?? ['gather', 'analyze', 'fuse', 'crystallize', 'validate'];
    this.phiPacing = config.phiPacing ?? true;
    this.autoAdvance = config.autoAdvance ?? false;
    this._sessions = new Map();
  }

  start(goal) {
    const sessionId = crypto.randomUUID();
    const session = { sessionId, goal, stage: this.pipeline[0], stageIndex: 0, startedAt: Date.now(), history: [], output: null };
    this._sessions.set(sessionId, session);
    return { sessionId, goal, stage: session.stage, startedAt: session.startedAt };
  }

  advance(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    if (session.stageIndex >= this.pipeline.length - 1) throw new Error('Pipeline complete');
    const from = session.stage;
    session.stageIndex++;
    session.stage = this.pipeline[session.stageIndex];
    session.history.push({ from, to: session.stage, advancedAt: Date.now() });
    return { sessionId, from, to: session.stage, stageIndex: session.stageIndex };
  }

  getSession(sessionId) {
    const s = this._sessions.get(sessionId);
    return s ? { ...s, history: [...s.history] } : undefined;
  }

  getSessions() { return [...this._sessions.values()].map(s => ({ sessionId: s.sessionId, goal: s.goal, stage: s.stage })); }

  complete(sessionId) {
    const session = this._sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    session.stage = 'complete';
    session.output = { completedAt: Date.now(), stagesCompleted: session.stageIndex + 1 };
    return { sessionId, status: 'complete', output: session.output };
  }

  getMetrics() {
    const sessions = [...this._sessions.values()];
    const completed = sessions.filter(s => s.stage === 'complete').length;
    return { totalSessions: sessions.length, completed, inProgress: sessions.length - completed, pipelineStages: this.pipeline.length };
  }
}
