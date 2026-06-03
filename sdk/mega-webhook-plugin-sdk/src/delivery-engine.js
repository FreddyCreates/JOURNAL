import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class DeliveryEngine {
  constructor() { this._deliveries = []; this._pending = []; }
  deliver(webhookId, url, payload) { const delivery = { deliveryId: crypto.randomUUID(), webhookId, url, payload, status: 'delivered', phiReliability: PHI / (PHI + 1), deliveredAt: Date.now() }; this._deliveries.push(delivery); return delivery; }
  markFailed(deliveryId, reason) { const delivery = this._deliveries.find(d => d.deliveryId === deliveryId); if (!delivery) throw new Error('Delivery not found'); delivery.status = 'failed'; delivery.failReason = reason; return { deliveryId, status: 'failed', reason }; }
  getDeliveries(webhookId) { return this._deliveries.filter(d => d.webhookId === webhookId); }
  getStats() { const total = this._deliveries.length; const failed = this._deliveries.filter(d => d.status === 'failed').length; return { total, delivered: total - failed, failed, successRate: total > 0 ? (total - failed) / total : 0 }; }
}
