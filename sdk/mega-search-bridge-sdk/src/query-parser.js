import crypto from 'node:crypto';
const PHI = 1.618033988749895;
export class QueryParser {
  constructor() { this._operators = new Map([['AND', 'and'], ['OR', 'or'], ['NOT', 'not']]); }
  parse(query) { if (typeof query !== 'string' || query.length === 0) throw new Error('Query must be a non-empty string'); const tokens = query.split(/\s+/); const clauses = []; let currentOp = 'and'; for (const token of tokens) { if (this._operators.has(token.toUpperCase())) { currentOp = this._operators.get(token.toUpperCase()); } else { clauses.push({ term: token.toLowerCase(), operator: currentOp }); currentOp = 'and'; } } return { original: query, clauses, termCount: clauses.length, phiComplexity: Math.min(1, clauses.length / 10 * (PHI / (PHI + 1))) }; }
  addOperator(keyword, type) { this._operators.set(keyword.toUpperCase(), type); return { keyword, type }; }
}
