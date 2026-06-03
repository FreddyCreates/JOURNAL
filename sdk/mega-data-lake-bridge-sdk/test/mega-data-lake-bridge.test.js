import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DataLakeConnector } from '../src/data-lake-connector.js';
import { PartitionManager } from '../src/partition-manager.js';
import { SchemaEvolver } from '../src/schema-evolver.js';
import { QueryFederation } from '../src/query-federation.js';
import { IngestionPipeline } from '../src/ingestion-pipeline.js';

describe('DataLakeConnector', () => {
  let lake; beforeEach(() => { lake = new DataLakeConnector(); });
  test('should register lake', () => { const r = lake.registerLake('main'); assert.ok(r.lakeId); });
  test('should write data', () => { const l = lake.registerLake('t'); const r = lake.write(l.lakeId, { x: 1 }); assert.ok(r.writeId); });
  test('should read data', () => { const l = lake.registerLake('t'); const r = lake.read(l.lakeId); assert.ok(r.readAt); });
  test('should throw on missing lake', () => { assert.throws(() => lake.write('missing', {}), /not found/); });
});
describe('PartitionManager', () => {
  let pm; beforeEach(() => { pm = new PartitionManager(); });
  test('should create partition', () => { const r = pm.create('date'); assert.ok(r.partitionId); });
  test('should assign data', () => { const p = pm.create('k'); const r = pm.assign(p.partitionId, { x: 1 }); assert.ok(r.size > 0); });
  test('should rebalance', () => { pm.create('a'); const r = pm.rebalance(); assert.strictEqual(r.partitions, 1); });
  test('should throw on max', () => { const p = new PartitionManager({ maxPartitions: 1 }); p.create('a'); assert.throws(() => p.create('b'), /Max partitions/); });
});
describe('SchemaEvolver', () => {
  let se; beforeEach(() => { se = new SchemaEvolver(); });
  test('should define schema', () => { const r = se.define({ name: 'string' }); assert.strictEqual(r.version, 1); });
  test('should evolve schema', () => { se.define({ a: 1 }); const r = se.evolve(s => ({ ...s, b: 2 })); assert.strictEqual(r.version, 2); });
  test('should rollback', () => { se.define({ v: 1 }); se.evolve(s => ({ ...s, v: 2 })); const r = se.rollback(); assert.strictEqual(r.version, 1); });
  test('should throw on no schema', () => { assert.throws(() => se.evolve(s => s), /No schema/); });
});
describe('QueryFederation', () => {
  let qf; beforeEach(() => { qf = new QueryFederation(); });
  test('should add source', () => { const r = qf.addSource('db', q => [q]); assert.strictEqual(r.sourceCount, 1); });
  test('should query source', () => { qf.addSource('db', q => ({ result: q })); const r = qf.query('db', 'SELECT 1'); assert.ok(r.result); });
  test('should federated query', () => { qf.addSource('a', () => [1]); qf.addSource('b', () => [2]); const r = qf.federatedQuery('*'); assert.strictEqual(r.sources.length, 2); });
  test('should throw on missing source', () => { assert.throws(() => qf.query('x', ''), /not found/); });
});
describe('IngestionPipeline', () => {
  let ip; beforeEach(() => { ip = new IngestionPipeline({ batchSize: 3 }); });
  test('should ingest record', () => { const r = ip.ingest({ a: 1 }); assert.strictEqual(r.buffered, 1); });
  test('should auto-flush at batch size', () => { ip.ingest({ a: 1 }); ip.ingest({ a: 2 }); const r = ip.ingest({ a: 3 }); assert.strictEqual(r.flushed, true); });
  test('should manual flush', () => { ip.ingest({ a: 1 }); const r = ip.flush(); assert.strictEqual(r.flushed, true); });
  test('should throw on null record', () => { assert.throws(() => ip.ingest(null), /Record required/); });
});
