import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class WebhookRegistry {
  constructor(config = {}) { this.maxWebhooks = config.maxWebhooks ?? 500; this._webhooks = new Map(); }
  register(url, events = [], config = {}) { if (this._webhooks.size >= this.maxWebhooks) throw new Error('Max webhooks reached'); if (!url || typeof url !== 'string') throw new Error('URL required'); const webhook = { webhookId: crypto.randomUUID(), url, events: [...events], secret: config.secret ?? crypto.randomUUID(), active: true, createdAt: Date.now() }; this._webhooks.set(webhook.webhookId, webhook); return { webhookId: webhook.webhookId, url, events }; }
  unregister(webhookId) { if (!this._webhooks.has(webhookId)) throw new Error('Webhook not found'); this._webhooks.delete(webhookId); return { webhookId, unregistered: true }; }
  findByEvent(event) { return [...this._webhooks.values()].filter(w => w.active && (w.events.length === 0 || w.events.includes(event))); }
  getAll() { return [...this._webhooks.values()].map(w => ({ webhookId: w.webhookId, url: w.url, events: w.events, active: w.active })); }
  disable(webhookId) { const w = this._webhooks.get(webhookId); if (!w) throw new Error('Webhook not found'); w.active = false; return { webhookId, active: false }; }
}
