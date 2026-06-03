import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 * @property {number} [z=0]
 */

/**
 * @typedef {Object} EntityRecord
 * @property {string} entityId
 * @property {Position} position
 * @property {number} registeredAt
 * @property {number} lastUpdated
 * @property {number} updateCount
 */

/**
 * @typedef {Object} NeighborResult
 * @property {string} entityId
 * @property {number} distance
 * @property {Position} position
 * @property {number} phiScaledDistance - Distance divided by φ for normalized comparison
 */

/**
 * @typedef {Object} Cluster
 * @property {string} clusterId
 * @property {Array<string>} members - Entity IDs in this cluster
 * @property {Position} centroid - Cluster center of mass
 * @property {number} radius - Max distance from centroid
 * @property {number} density - Members per unit area (phi-normalized)
 */

/**
 * ProximitySensor — detects proximity relationships between organism components.
 *
 * Registers entities with 2D/3D positions, computes phi-scaled distances,
 * finds nearest neighbors, detects spatial clusters using phi-threshold
 * density analysis, and generates distance matrices.
 */
export class ProximitySensor {
  /** @type {Map<string, EntityRecord>} */
  #entities;

  constructor() {
    this.#entities = new Map();
  }

  /**
   * Registers an entity with its spatial position.
   * @param {string} entityId - Unique entity identifier
   * @param {Position} position - Spatial coordinates {x, y, z?}
   * @throws {Error} If entity already exists or position is invalid
   */
  registerEntity(entityId, position) {
    if (this.#entities.has(entityId)) {
      throw new Error(`Entity "${entityId}" is already registered`);
    }
    this.#validatePosition(position);

    const now = Date.now();

    /** @type {EntityRecord} */
    const record = {
      entityId,
      position: { x: position.x, y: position.y, z: position.z ?? 0 },
      registeredAt: now,
      lastUpdated: now,
      updateCount: 0,
    };

    this.#entities.set(entityId, record);
  }

  /**
   * Updates an entity's spatial position.
   * @param {string} entityId
   * @param {Position} newPosition
   * @returns {{entityId: string, previousPosition: Position, newPosition: Position, displacement: number, timestamp: number}}
   * @throws {Error} If entity is not registered
   */
  updatePosition(entityId, newPosition) {
    const record = this.#getEntity(entityId);
    this.#validatePosition(newPosition);

    const previousPosition = { ...record.position };
    const normalizedPosition = { x: newPosition.x, y: newPosition.y, z: newPosition.z ?? 0 };
    const displacement = this.#euclideanDistance(previousPosition, normalizedPosition);

    record.position = normalizedPosition;
    record.lastUpdated = Date.now();
    record.updateCount++;

    return {
      entityId,
      previousPosition,
      newPosition: normalizedPosition,
      displacement: Math.round(displacement * 10000) / 10000,
      timestamp: record.lastUpdated,
    };
  }

  /**
   * Finds all entities within a given radius of the target entity.
   * Distances are phi-scaled for normalized comparison across dimensions.
   * @param {string} entityId
   * @param {number} radius - Search radius
   * @returns {Array<NeighborResult>}
   * @throws {Error} If entity is not registered
   */
  getNeighbors(entityId, radius) {
    const origin = this.#getEntity(entityId);

    if (typeof radius !== 'number' || radius <= 0) {
      throw new RangeError('Radius must be a positive number');
    }

    const phiRadius = radius * PHI;
    const neighbors = [];

    for (const record of this.#entities.values()) {
      if (record.entityId === entityId) continue;

      const distance = this.#euclideanDistance(origin.position, record.position);

      if (distance <= phiRadius) {
        neighbors.push({
          entityId: record.entityId,
          distance: Math.round(distance * 10000) / 10000,
          position: { ...record.position },
          phiScaledDistance: Math.round((distance / PHI) * 10000) / 10000,
        });
      }
    }

    neighbors.sort((a, b) => a.distance - b.distance);

    return neighbors;
  }

  /**
   * Detects spatial clusters using a phi-threshold density-based approach.
   * Two entities are in the same cluster if their distance is within the
   * phi-scaled mean nearest-neighbor distance.
   * @returns {Array<Cluster>}
   */
  detectClusters() {
    const entities = [...this.#entities.values()];
    const N = entities.length;

    if (N < 2) {
      if (N === 1) {
        return [{
          clusterId: crypto.randomUUID(),
          members: [entities[0].entityId],
          centroid: { ...entities[0].position },
          radius: 0,
          density: Infinity,
        }];
      }
      return [];
    }

    const meanNNDist = this.#computeMeanNearestNeighborDistance(entities);
    const clusterThreshold = meanNNDist * PHI;

    const visited = new Set();
    const clusters = [];

    for (const entity of entities) {
      if (visited.has(entity.entityId)) continue;

      const cluster = [];
      const queue = [entity];
      visited.add(entity.entityId);

      while (queue.length > 0) {
        const current = queue.shift();
        cluster.push(current);

        for (const other of entities) {
          if (visited.has(other.entityId)) continue;

          const dist = this.#euclideanDistance(current.position, other.position);
          if (dist <= clusterThreshold) {
            visited.add(other.entityId);
            queue.push(other);
          }
        }
      }

      const centroid = this.#computeCentroid(cluster);
      let maxRadius = 0;

      for (const member of cluster) {
        const dist = this.#euclideanDistance(centroid, member.position);
        if (dist > maxRadius) maxRadius = dist;
      }

      const area = Math.max(0.001, Math.PI * maxRadius * maxRadius);
      const density = cluster.length / (area / (PHI * PHI));

      clusters.push({
        clusterId: crypto.randomUUID(),
        members: cluster.map(e => e.entityId),
        centroid: {
          x: Math.round(centroid.x * 10000) / 10000,
          y: Math.round(centroid.y * 10000) / 10000,
          z: Math.round(centroid.z * 10000) / 10000,
        },
        radius: Math.round(maxRadius * 10000) / 10000,
        density: Math.round(density * 10000) / 10000,
      });
    }

    return clusters;
  }

  /**
   * Returns a distance matrix of all pairwise Euclidean distances between entities.
   * @returns {{entityIds: Array<string>, matrix: Array<Array<number>>, timestamp: number}}
   */
  getDistanceMatrix() {
    const entities = [...this.#entities.values()];
    const entityIds = entities.map(e => e.entityId);
    const N = entities.length;

    const matrix = [];

    for (let i = 0; i < N; i++) {
      const row = [];
      for (let j = 0; j < N; j++) {
        if (i === j) {
          row.push(0);
        } else {
          const dist = this.#euclideanDistance(entities[i].position, entities[j].position);
          row.push(Math.round(dist * 10000) / 10000);
        }
      }
      matrix.push(row);
    }

    return {
      entityIds,
      matrix,
      timestamp: Date.now(),
    };
  }

  /**
   * Computes Euclidean distance between two positions (2D or 3D).
   * @param {Position} a
   * @param {Position} b
   * @returns {number}
   */
  #euclideanDistance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z ?? 0) - (b.z ?? 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Computes the centroid (center of mass) of a set of entity records.
   * @param {Array<EntityRecord>} entities
   * @returns {Position}
   */
  #computeCentroid(entities) {
    let sx = 0, sy = 0, sz = 0;

    for (const e of entities) {
      sx += e.position.x;
      sy += e.position.y;
      sz += e.position.z ?? 0;
    }

    const n = entities.length;
    return { x: sx / n, y: sy / n, z: sz / n };
  }

  /**
   * Computes the mean nearest-neighbor distance across all entities.
   * @param {Array<EntityRecord>} entities
   * @returns {number}
   */
  #computeMeanNearestNeighborDistance(entities) {
    let totalMinDist = 0;

    for (const entity of entities) {
      let minDist = Infinity;

      for (const other of entities) {
        if (other.entityId === entity.entityId) continue;
        const dist = this.#euclideanDistance(entity.position, other.position);
        if (dist < minDist) minDist = dist;
      }

      if (minDist < Infinity) totalMinDist += minDist;
    }

    return totalMinDist / entities.length;
  }

  /**
   * Validates that a position object has valid numeric x and y coordinates.
   * @param {Position} position
   * @throws {TypeError} If position is invalid
   */
  #validatePosition(position) {
    if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
      throw new TypeError('Position must have numeric x and y properties');
    }
    if (position.z !== undefined && typeof position.z !== 'number') {
      throw new TypeError('Position z must be a number if provided');
    }
  }

  /**
   * Retrieves an entity record or throws.
   * @param {string} entityId
   * @returns {EntityRecord}
   */
  #getEntity(entityId) {
    const record = this.#entities.get(entityId);
    if (!record) {
      throw new Error(`Entity "${entityId}" not found`);
    }
    return record;
  }

  /**
   * Unregisters an entity.
   * @param {string} entityId
   */
  unregisterEntity(entityId) {
    if (!this.#entities.has(entityId)) {
      throw new Error(`Entity "${entityId}" not found`);
    }
    this.#entities.delete(entityId);
  }

  /**
   * Cleans up all entities.
   */
  destroy() {
    this.#entities.clear();
  }
}

export default ProximitySensor;
