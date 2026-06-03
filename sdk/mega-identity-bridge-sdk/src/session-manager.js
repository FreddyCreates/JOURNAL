import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SessionManager {
  constructor(config = {}) { this.ttl = config.ttl ?? 3600000; this._sessions = new Map(); }
  create(identityId, metadata = {}) { const session = { sessionId: crypto.randomUUID(), identityId, metadata, createdAt: Date.now(), expiresAt: Date.now() + this.ttl, active: true }; this._sessions.set(session.sessionId, session); return { sessionId: session.sessionId, expiresAt: session.expiresAt }; }
  validate(sessionId) { const s = this._sessions.get(sessionId); if (!s) throw new Error('Session not found'); if (!s.active || Date.now() > s.expiresAt) return { valid: false, reason: 'expired' }; return { valid: true, identityId: s.identityId, phiTrust: PHI / (PHI + 1) }; }
  revoke(sessionId) { const s = this._sessions.get(sessionId); if (!s) throw new Error('Session not found'); s.active = false; return { sessionId, revoked: true }; }
  getActive() { return [...this._sessions.values()].filter(s => s.active && Date.now() <= s.expiresAt); }
}
