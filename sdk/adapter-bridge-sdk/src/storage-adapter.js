import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} StorageDriver
 * @property {function(string): unknown} get
 * @property {function(string, unknown): void} set
 * @property {function(string): boolean} delete
 * @property {function(): Array<string>} list
 */

/**
 * @typedef {Object} SyncReport
 * @property {Array<string>} backendIds
 * @property {number} keysProcessed
 * @property {number} conflictsResolved
 * @property {number} phiConsistencyScore
 * @property {number} durationMs
 * @property {string} syncId
 */

/**
 * StorageAdapter — adapts between different storage backends with a unified
 * key-value interface. Registers backend drivers, provides get/put/delete
 * operations, migrates data between backends with key filtering, reports
 * capacity metrics, and synchronizes across multiple backends using
 * phi-weighted conflict resolution.
 */
export class StorageAdapter {
  /** @type {Map<string, BackendRecord>} */
  #backends;

  constructor() {
    this.#backends = new Map();
  }

  /**
   * Registers a storage backend with its driver implementation.
   * @param {string} backendId - Unique backend identifier
   * @param {StorageDriver} driver - Driver implementing get/set/delete/list
   * @throws {Error} If backendId already exists or driver is invalid
   */
  registerBackend(backendId, driver) {
    if (typeof backendId !== 'string' || backendId.length === 0) {
      throw new Error('backendId must be a non-empty string');
    }
    if (this.#backends.has(backendId)) {
      throw new Error(`Backend "${backendId}" is already registered`);
    }
    if (!driver || typeof driver !== 'object') {
      throw new TypeError('driver must be an object');
    }

    const requiredMethods = ['get', 'set', 'delete', 'list'];
    for (const method of requiredMethods) {
      if (typeof driver[method] !== 'function') {
        throw new TypeError(`driver.${method} must be a function`);
      }
    }

    this.#backends.set(backendId, {
      backendId,
      driver,
      reads: 0,
      writes: 0,
      deletes: 0,
      registeredAt: Date.now(),
    });
  }

  /**
   * Stores a value in the specified backend.
   * @param {string} backendId
   * @param {string} key
   * @param {unknown} value
   */
  put(backendId, key, value) {
    const backend = this.#backends.get(backendId);
    if (!backend) throw new Error(`Backend "${backendId}" is not registered. Available: ${[...this.#backends.keys()].join(', ')}`);
    backend.driver.set(key, value);
    backend.writes++;
  }

  /**
   * Retrieves a value from the specified backend.
   * @param {string} backendId
   * @param {string} key
   * @returns {unknown}
   */
  get(backendId, key) {
    const backend = this.#backends.get(backendId);
    if (!backend) throw new Error(`Backend "${backendId}" is not registered. Available: ${[...this.#backends.keys()].join(', ')}`);
    backend.reads++;
    return backend.driver.get(key);
  }

  /**
   * Migrates data from one backend to another with optional key filtering.
   * @param {string} sourceBackend
   * @param {string} targetBackend
   * @param {string} [keyPattern='.*'] - Regex pattern to filter keys
   * @returns {{sourceBackend: string, targetBackend: string, keysMigrated: number, keysSkipped: number, durationMs: number, migrationId: string}}
   */
  migrate(sourceBackend, targetBackend, keyPattern = '.*') {
    const source = this.#backends.get(sourceBackend);
    if (!source) throw new Error(`Source backend "${sourceBackend}" is not registered`);
    const target = this.#backends.get(targetBackend);
    if (!target) throw new Error(`Target backend "${targetBackend}" is not registered`);
    const startTime = performance.now();
    const regex = new RegExp(keyPattern);
    const allKeys = source.driver.list();
    let keysMigrated = 0;
    let keysSkipped = 0;
    for (const key of allKeys) {
      if (!regex.test(key)) { keysSkipped++; continue; }
      target.driver.set(key, source.driver.get(key));
      source.reads++;
      target.writes++;
      keysMigrated++;
    }
    return { sourceBackend, targetBackend, keysMigrated, keysSkipped, durationMs: performance.now() - startTime, migrationId: crypto.randomUUID() };
  }

  /**
   * Returns capacity and performance metrics for a backend.
   * @param {string} backendId
   * @returns {{backendId: string, keyCount: number, totalOperations: number, readWriteRatio: number, phiEfficiencyScore: number}}
   */
  getCapacity(backendId) {
    const backend = this.#backends.get(backendId);
    if (!backend) throw new Error(`Backend "${backendId}" is not registered`);

    const keyCount = backend.driver.list().length;
    const totalOperations = backend.reads + backend.writes + backend.deletes;
    const readWriteRatio = backend.writes > 0
      ? backend.reads / backend.writes
      : backend.reads > 0 ? Infinity : 0;

    const opsNorm = Math.min(1, totalOperations / 1000);
    const keyNorm = Math.min(1, keyCount / 100);
    const phiEfficiencyScore = ((opsNorm * PHI + keyNorm) / (PHI + 1))
      * (PHI / (PHI + 1));

    return {
      backendId,
      keyCount,
      totalOperations,
      readWriteRatio,
      phiEfficiencyScore,
    };
  }

  /**
   * Synchronizes data across multiple backends using phi-weighted conflict
   * resolution. When the same key exists in multiple backends, the value
   * from the backend with the highest phi-weighted operation score wins.
   * @param {Array<string>} backendIds - List of backend identifiers to synchronize
   * @returns {SyncReport}
   * @throws {Error} If fewer than 2 backends or any backend is not registered
   */
  sync(backendIds) {
    if (!Array.isArray(backendIds) || backendIds.length < 2) throw new Error('sync requires at least 2 backend identifiers');
    const backends = backendIds.map((id) => {
      const b = this.#backends.get(id);
      if (!b) throw new Error(`Backend "${id}" is not registered`);
      return b;
    });
    const startTime = performance.now();
    const allKeysSet = new Set();
    const backendKeyMaps = new Map();
    for (const backend of backends) {
      const keys = backend.driver.list();
      const keyMap = new Map();
      for (const key of keys) { allKeysSet.add(key); keyMap.set(key, backend.driver.get(key)); backend.reads++; }
      backendKeyMaps.set(backend.backendId, keyMap);
    }
    let keysProcessed = 0;
    let conflictsResolved = 0;
    for (const key of allKeysSet) {
      keysProcessed++;
      const owners = [];
      for (const backend of backends) {
        const keyMap = backendKeyMaps.get(backend.backendId);
        if (keyMap.has(key)) {
          const score = (backend.reads + backend.writes + backend.deletes) * (PHI / (PHI + 1));
          owners.push({ backend, value: keyMap.get(key), score });
        }
      }
      if (owners.length <= 1) {
        const winner = owners[0];
        for (const b of backends) { if (b.backendId !== winner.backend.backendId) { b.driver.set(key, winner.value); b.writes++; } }
        continue;
      }
      conflictsResolved++;
      owners.sort((a, b) => b.score - a.score);
      const winnerValue = owners[0].value;
      for (const b of backends) {
        if (!Object.is(backendKeyMaps.get(b.backendId).get(key), winnerValue)) { b.driver.set(key, winnerValue); b.writes++; }
      }
    }

    const durationMs = performance.now() - startTime;
    const consistencyRatio = keysProcessed > 0
      ? (keysProcessed - conflictsResolved) / keysProcessed
      : 1;
    const phiConsistencyScore = consistencyRatio * (PHI / (PHI + (1 - consistencyRatio)));

    return {
      backendIds: [...backendIds],
      keysProcessed,
      conflictsResolved,
      phiConsistencyScore,
      durationMs,
      syncId: crypto.randomUUID(),
    };
  }
}

export default StorageAdapter;
