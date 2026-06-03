import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SearchIndex } from '../src/search-index.js';
import { RelevanceScorer } from '../src/relevance-scorer.js';
import { FacetEngine } from '../src/facet-engine.js';
import { QueryParser } from '../src/query-parser.js';
import { SearchBridge } from '../src/search-bridge.js';

describe('SearchIndex', () => {
  let idx; beforeEach(() => { idx = new SearchIndex(); });
  test('should index document', () => { const r = idx.index({ id: '1', title: 'hello world' }); assert.strictEqual(r.indexed, true); });
  test('should search', () => { idx.index({ id: '1', title: 'hello world' }); const r = idx.search('hello'); assert.strictEqual(r.total, 1); });
  test('should throw on no id', () => { assert.throws(() => idx.index({}), /must have an id/); });
  test('should delete', () => { idx.index({ id: '1', title: 'test' }); idx.delete('1'); assert.strictEqual(idx.getSize(), 0); });
  test('should rank by relevance', () => { idx.index({ id: '1', title: 'hello hello' }); idx.index({ id: '2', title: 'world' }); const r = idx.search('hello'); assert.strictEqual(r.results[0].id, '1'); });
});
describe('RelevanceScorer', () => {
  let rs; beforeEach(() => { rs = new RelevanceScorer(); });
  test('should score document', () => { const r = rs.score({ title: 'hello world' }, 'hello'); assert.ok(r.score > 0); });
  test('should return 0 for no match', () => { const r = rs.score({ title: 'abc' }, 'xyz'); assert.strictEqual(r.matchCount, 0); });
  test('should boost fields', () => { rs.setBoost('title', 2); const r = rs.score({ title: 'hello' }, 'hello'); assert.ok(r.score > 0); });
});
describe('FacetEngine', () => {
  let fe; beforeEach(() => { fe = new FacetEngine(); });
  test('should define facet', () => { const r = fe.defineFacet('color', d => d.color); assert.strictEqual(r.facetCount, 1); });
  test('should compute facets', () => { fe.defineFacet('type', d => d.type); const r = fe.compute([{ type: 'a' }, { type: 'a' }, { type: 'b' }]); assert.strictEqual(r.type.buckets.a, 2); });
  test('should remove facet', () => { fe.defineFacet('x', d => d.x); fe.removeFacet('x'); assert.strictEqual(fe.getFacets().length, 0); });
});
describe('QueryParser', () => {
  let qp; beforeEach(() => { qp = new QueryParser(); });
  test('should parse simple query', () => { const r = qp.parse('hello world'); assert.strictEqual(r.termCount, 2); });
  test('should parse operators', () => { const r = qp.parse('hello AND world'); assert.strictEqual(r.clauses[1].operator, 'and'); });
  test('should throw on empty', () => { assert.throws(() => qp.parse(''), /non-empty/); });
});
describe('SearchBridge', () => {
  let sb; beforeEach(() => { sb = new SearchBridge(); });
  test('should register engine', () => { const r = sb.registerEngine('elastic', q => [q]); assert.strictEqual(r.engineCount, 1); });
  test('should search', () => { sb.registerEngine('e', q => [{ q }]); const r = sb.search('e', 'test'); assert.strictEqual(r[0].q, 'test'); });
  test('should federated search', () => { sb.registerEngine('a', q => [1]); sb.registerEngine('b', q => [2]); const r = sb.federatedSearch('x'); assert.strictEqual(r.engines.length, 2); });
  test('should throw on missing engine', () => { assert.throws(() => sb.search('x', ''), /not found/); });
});
