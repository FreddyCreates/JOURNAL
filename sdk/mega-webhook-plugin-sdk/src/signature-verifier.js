import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SignatureVerifier {
  constructor(config = {}) { this.algorithm = config.algorithm ?? 'sha256'; this._verifications = []; }
  sign(payload, secret) { const body = typeof payload === 'string' ? payload : JSON.stringify(payload); const signature = crypto.createHmac(this.algorithm, secret).update(body).digest('hex'); return { signature, algorithm: this.algorithm }; }
  verify(payload, secret, providedSignature) { const { signature } = this.sign(payload, secret); const valid = signature === providedSignature; const record = { verificationId: crypto.randomUUID(), valid, algorithm: this.algorithm, phiIntegrity: valid ? PHI / (PHI + 1) : 0, timestamp: Date.now() }; this._verifications.push(record); return record; }
  getVerifications() { return [...this._verifications]; }
}
