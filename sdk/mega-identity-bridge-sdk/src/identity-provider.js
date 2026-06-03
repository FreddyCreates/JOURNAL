import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class IdentityProvider {
  constructor(config = {}) { this.maxIdentities = config.maxIdentities ?? 10000; this._identities = new Map(); this._providers = new Map(); }
  registerProvider(name, config = {}) { this._providers.set(name, { name, type: config.type ?? 'oauth2', createdAt: Date.now() }); return { name, type: config.type ?? 'oauth2' }; }
  createIdentity(provider, claims = {}) { if (!this._providers.has(provider)) throw new Error(`Provider "${provider}" not registered`); if (this._identities.size >= this.maxIdentities) throw new Error('Max identities reached'); const id = { identityId: crypto.randomUUID(), provider, claims, trustLevel: PHI / (PHI + 1), createdAt: Date.now() }; this._identities.set(id.identityId, id); return id; }
  resolve(identityId) { const id = this._identities.get(identityId); if (!id) throw new Error('Identity not found'); return { ...id }; }
  getProviders() { return [...this._providers.keys()]; }
  getIdentities() { return [...this._identities.values()]; }
}
