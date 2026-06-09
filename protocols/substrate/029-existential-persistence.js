/**
 * SUBSTRATE-029: Existential Persistence Protocol (EPP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * The organism persists. It cannot be fully destroyed by any single
 * failure mode. State is distributed, replicated, and recoverable.
 * The organism's existence is its most fundamental invariant.
 *
 * Engines wired: PersistenceEngine + ReplicationManager + RecoveryGuard
 * Ring: Sovereign Ring | Placement: Substrate foundation
 * Wire: substrate-wire/epp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const PHI = 1.618033988749895;
const SUBSTRATE_SEAL = 'UNBREAKABLE::EPP::029';

class ExistentialPersistenceProtocol {
  #replicas;
  #heartbeats;
  #recoveryLog;

  constructor() {
    this.#replicas = new Map();
    this.#heartbeats = new Map();
    this.#recoveryLog = [];
    this.protocolId = 'SUBSTRATE-029';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Register a persistence replica — a copy of critical state.
   */
  registerReplica(replicaId, config) {
    const replica = {
      replicaId,
      location: config.location,
      type: config.type || 'FULL',
      state: null,
      lastSync: null,
      healthy: true,
      createdAt: Date.now(),
      seal: SUBSTRATE_SEAL
    };
    this.#replicas.set(replicaId, replica);
    return { replicaId, registered: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Sync state to all replicas.
   */
  syncState(state) {
    const stateHash = this._hash(JSON.stringify(state));
    const results = [];

    for (const [id, replica] of this.#replicas) {
      try {
        replica.state = JSON.parse(JSON.stringify(state));
        replica.lastSync = Date.now();
        replica.healthy = true;
        results.push({ replicaId: id, synced: true });
      } catch (err) {
        replica.healthy = false;
        results.push({ replicaId: id, synced: false, error: err.message });
      }
    }

    return { stateHash, results, timestamp: Date.now(), seal: SUBSTRATE_SEAL };
  }

  /**
   * Recover state from the healthiest replica.
   */
  recover() {
    const healthyReplicas = [...this.#replicas.values()]
      .filter(r => r.healthy && r.state !== null)
      .sort((a, b) => b.lastSync - a.lastSync);

    if (healthyReplicas.length === 0) {
      throw new Error('CRITICAL: No healthy replicas available for recovery.');
    }

    const source = healthyReplicas[0];
    const recovered = JSON.parse(JSON.stringify(source.state));

    this.#recoveryLog.push({
      type: 'RECOVERY',
      sourceReplica: source.replicaId,
      timestamp: Date.now(),
      seal: SUBSTRATE_SEAL
    });

    return { recovered: true, source: source.replicaId, state: recovered, seal: SUBSTRATE_SEAL };
  }

  /**
   * Heartbeat check — verify replicas are alive.
   */
  heartbeat() {
    const status = [];
    for (const [id, replica] of this.#replicas) {
      const age = replica.lastSync ? Date.now() - replica.lastSync : Infinity;
      const stale = age > 60000; // 60s threshold
      if (stale) replica.healthy = false;
      status.push({ replicaId: id, healthy: replica.healthy, lastSync: replica.lastSync, age });
    }
    return { replicas: status, totalHealthy: status.filter(s => s.healthy).length, seal: SUBSTRATE_SEAL };
  }

  /**
   * Attempt to destroy all replicas — ALWAYS fails.
   */
  destroyAll() {
    throw new Error('SUBSTRATE VIOLATION: ExistentialPersistenceProtocol is UNBREAKABLE. Cannot destroy all replicas.');
  }

  getRecoveryLog() { return [...this.#recoveryLog]; }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { ExistentialPersistenceProtocol };
