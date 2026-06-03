import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class NotificationHub {
  constructor(config = {}) { this.maxPending = config.maxPending ?? 10000; this._notifications = []; this._sent = []; }
  create(recipient, message, options = {}) { if (this._notifications.length >= this.maxPending) throw new Error('Max pending notifications reached'); const notif = { notifId: crypto.randomUUID(), recipient, message, priority: options.priority ?? 'normal', channel: options.channel ?? 'default', status: 'pending', createdAt: Date.now() }; this._notifications.push(notif); return notif; }
  send(notifId) { const idx = this._notifications.findIndex(n => n.notifId === notifId); if (idx === -1) throw new Error('Notification not found'); const notif = this._notifications.splice(idx, 1)[0]; notif.status = 'sent'; notif.sentAt = Date.now(); notif.phiDelivery = PHI / (PHI + 1); this._sent.push(notif); return notif; }
  getPending() { return [...this._notifications]; }
  getSent() { return [...this._sent]; }
}
