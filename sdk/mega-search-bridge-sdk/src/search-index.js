import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class SearchIndex {
  constructor(config = {}) { this.name = config.name ?? 'default'; this._documents = new Map(); this._invertedIndex = new Map(); }
  index(doc) { if (!doc || !doc.id) throw new Error('Document must have an id'); this._documents.set(doc.id, { ...doc, indexedAt: Date.now() }); const text = JSON.stringify(doc).toLowerCase(); const tokens = text.match(/[a-z0-9]+/g) || []; for (const token of tokens) { if (!this._invertedIndex.has(token)) this._invertedIndex.set(token, new Set()); this._invertedIndex.get(token).add(doc.id); } return { id: doc.id, indexed: true, tokens: tokens.length }; }
  search(query) { const terms = query.toLowerCase().match(/[a-z0-9]+/g) || []; const scores = new Map(); for (const term of terms) { const docs = this._invertedIndex.get(term) || new Set(); for (const docId of docs) { scores.set(docId, (scores.get(docId) ?? 0) + 1); } } const results = [...scores.entries()].map(([id, score]) => ({ id, score: score * (PHI / (PHI + 1)), document: this._documents.get(id) })).sort((a, b) => b.score - a.score); return { query, total: results.length, results: results.slice(0, 20) }; }
  getDocument(id) { return this._documents.get(id) ?? null; }
  getSize() { return this._documents.size; }
  delete(id) { this._documents.delete(id); return { id, deleted: true }; }
}
