import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} EndpointRecord
 * @property {string} endpoint - Endpoint identifier or URL
 * @property {number} latency - Last measured latency in ms
 * @property {string} status - 'reachable' | 'degraded' | 'unreachable'
 * @property {number} lastProbeTime - Timestamp of last probe
 * @property {number} probeCount - Total probes issued
 * @property {number} failCount - Total failed probes
 * @property {Array<number>} latencyHistory - Recent latency samples
 */

/**
 * @typedef {Object} ProbeResult
 * @property {string} endpoint
 * @property {number} latency - Measured latency in ms
 * @property {string} status - 'reachable' | 'degraded' | 'unreachable'
 * @property {number} jitter - Phi-weighted jitter estimate
 * @property {number} timestamp
 * @property {string} probeId
 */

/**
 * @typedef {Object} BandwidthReport
 * @property {number} estimatedBps - Estimated bandwidth in bytes per second
 * @property {number} phiPayloadSize - Phi-scaled test payload size
 * @property {number} transferTime - Simulated transfer time in ms
 * @property {number} confidence - Confidence score (0–1)
 * @property {number} timestamp
 */

/**
 * @typedef {Object} TopologyNode
 * @property {string} endpoint
 * @property {string} status
 * @property {number} latency
 * @property {Array<string>} neighbors - Connected endpoints
 */

/**
 * @typedef {Object} HealthReport
 * @property {string} reportId
 * @property {number} timestamp
 * @property {number} totalEndpoints
 * @property {number} reachable
 * @property {number} degraded
 * @property {number} unreachable
 * @property {number} averageLatency
 * @property {number} healthScore - Overall health (0–1), phi-weighted
 * @property {Array<string>} partitions - Detected partition groups
 */

/**
 * NetworkSensor — monitors network latency, bandwidth, and connection health.
 *
 * Probes endpoints to measure latency and jitter, estimates bandwidth using
 * phi-scaled payloads, maps network topology, and detects partitions.
 */
export class NetworkSensor {
  /** @type {Map<string, EndpointRecord>} */
  #endpoints;

  /** @type {number} Maximum history size per endpoint */
  #maxHistory;

  constructor() {
    this.#endpoints = new Map();
    this.#maxHistory = 50;
  }

  /**
   * Probes an endpoint and returns latency, status, and jitter.
   * Latency is simulated with phi-weighted randomness.
   * @param {string} endpoint - Endpoint identifier or URL
   * @returns {ProbeResult}
   */
  probe(endpoint) {
    const now = Date.now();
    let record = this.#endpoints.get(endpoint);

    if (!record) {
      record = {
        endpoint,
        latency: 0,
        status: 'reachable',
        lastProbeTime: 0,
        probeCount: 0,
        failCount: 0,
        latencyHistory: [],
      };
      this.#endpoints.set(endpoint, record);
    }

    record.probeCount++;

    const baseLatency = 10 + Math.random() * 90;
    const phiJitter = (Math.random() - 0.5) * (baseLatency / PHI);
    const measuredLatency = Math.max(0, baseLatency + phiJitter);

    const failProbability = 1 / (PHI * PHI * PHI * 10);
    const failed = Math.random() < failProbability;

    if (failed) {
      record.failCount++;
      record.status = 'unreachable';
      record.latency = -1;
      record.lastProbeTime = now;

      return {
        endpoint,
        latency: -1,
        status: 'unreachable',
        jitter: 0,
        timestamp: now,
        probeId: crypto.randomUUID(),
      };
    }

    record.latency = measuredLatency;
    record.lastProbeTime = now;
    record.latencyHistory.push(measuredLatency);

    if (record.latencyHistory.length > this.#maxHistory) {
      record.latencyHistory.shift();
    }

    const jitter = this.#computeJitter(record.latencyHistory);
    const degradedThreshold = 100 / PHI;
    record.status = measuredLatency > degradedThreshold ? 'degraded' : 'reachable';

    return {
      endpoint,
      latency: Math.round(measuredLatency * 100) / 100,
      status: record.status,
      jitter: Math.round(jitter * 100) / 100,
      timestamp: now,
      probeId: crypto.randomUUID(),
    };
  }

  /**
   * Estimates bandwidth using phi-scaled test payloads.
   * Simulates transfer of progressively larger payloads scaled by φ.
   * @returns {BandwidthReport}
   */
  measureBandwidth() {
    const basePayloadSize = 1024;
    const phiPayloadSize = Math.round(basePayloadSize * PHI * PHI);

    const baseBps = 1_000_000 + Math.random() * 9_000_000;
    const phiVariation = baseBps * (1 / PHI) * (Math.random() - 0.5);
    const estimatedBps = Math.max(100_000, baseBps + phiVariation);

    const transferTime = (phiPayloadSize / estimatedBps) * 1000;

    const samples = [];
    for (let i = 0; i < 5; i++) {
      const size = Math.round(basePayloadSize * Math.pow(PHI, i));
      const time = (size / estimatedBps) * 1000;
      samples.push({ size, time });
    }

    let variance = 0;
    const avgTime = samples.reduce((s, x) => s + x.time, 0) / samples.length;
    for (const s of samples) {
      variance += Math.pow(s.time - avgTime, 2);
    }
    variance /= samples.length;
    const confidence = Math.max(0, Math.min(1, 1 - Math.sqrt(variance) / (avgTime * PHI)));

    return {
      estimatedBps: Math.round(estimatedBps),
      phiPayloadSize,
      transferTime: Math.round(transferTime * 100) / 100,
      confidence: Math.round(confidence * 10000) / 10000,
      timestamp: Date.now(),
    };
  }

  /**
   * Returns the network topology map showing all endpoints and their neighbor connections.
   * Neighbors are determined by latency proximity using phi-scaled thresholds.
   * @returns {Array<TopologyNode>}
   */
  getTopology() {
    const endpoints = [...this.#endpoints.values()];
    const nodes = [];

    for (const record of endpoints) {
      const neighbors = [];

      for (const other of endpoints) {
        if (other.endpoint === record.endpoint) continue;
        if (other.latency < 0 || record.latency < 0) continue;

        const latencyDiff = Math.abs(record.latency - other.latency);
        const proximityThreshold = (record.latency + other.latency) / (2 * PHI);

        if (latencyDiff <= proximityThreshold) {
          neighbors.push(other.endpoint);
        }
      }

      nodes.push({
        endpoint: record.endpoint,
        status: record.status,
        latency: Math.round(record.latency * 100) / 100,
        neighbors,
      });
    }

    return nodes;
  }

  /**
   * Detects network partitions by finding disconnected subgraphs in the topology.
   * Uses BFS traversal to identify connected components.
   * @returns {Array<Array<string>>} Array of partition groups (connected components)
   */
  detectPartition() {
    const topology = this.getTopology();
    const adjacency = new Map();

    for (const node of topology) {
      adjacency.set(node.endpoint, new Set(node.neighbors));
    }

    const visited = new Set();
    const partitions = [];

    for (const node of topology) {
      if (visited.has(node.endpoint)) continue;

      const component = [];
      const queue = [node.endpoint];
      visited.add(node.endpoint);

      while (queue.length > 0) {
        const current = queue.shift();
        component.push(current);

        const neighbors = adjacency.get(current) || new Set();
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      partitions.push(component);
    }

    return partitions;
  }

  /**
   * Returns an overall network health report with phi-weighted scoring.
   * Health score is computed as: (reachable/total) * φ-weighted latency factor.
   * @returns {HealthReport}
   */
  getHealthReport() {
    const records = [...this.#endpoints.values()];
    const total = records.length;

    if (total === 0) {
      return {
        reportId: crypto.randomUUID(),
        timestamp: Date.now(),
        totalEndpoints: 0,
        reachable: 0,
        degraded: 0,
        unreachable: 0,
        averageLatency: 0,
        healthScore: 1,
        partitions: [],
      };
    }

    let reachable = 0;
    let degraded = 0;
    let unreachable = 0;
    let latencySum = 0;
    let validLatencyCount = 0;

    for (const r of records) {
      if (r.status === 'reachable') reachable++;
      else if (r.status === 'degraded') degraded++;
      else unreachable++;

      if (r.latency >= 0) {
        latencySum += r.latency;
        validLatencyCount++;
      }
    }

    const averageLatency = validLatencyCount > 0 ? latencySum / validLatencyCount : 0;
    const reachabilityScore = (reachable + degraded * (1 / PHI)) / total;
    const latencyFactor = Math.max(0, 1 - averageLatency / (100 * PHI));
    const healthScore = Math.round(reachabilityScore * latencyFactor * 10000) / 10000;

    const partitions = this.detectPartition().map(group => group.join(','));

    return {
      reportId: crypto.randomUUID(),
      timestamp: Date.now(),
      totalEndpoints: total,
      reachable,
      degraded,
      unreachable,
      averageLatency: Math.round(averageLatency * 100) / 100,
      healthScore: Math.max(0, Math.min(1, healthScore)),
      partitions,
    };
  }

  /**
   * Computes jitter as the phi-weighted moving average of latency differences.
   * @param {Array<number>} history
   * @returns {number}
   */
  #computeJitter(history) {
    if (history.length < 2) return 0;

    let weightedSum = 0;
    let weightTotal = 0;

    for (let i = 1; i < history.length; i++) {
      const diff = Math.abs(history[i] - history[i - 1]);
      const weight = Math.pow(1 / PHI, history.length - i);
      weightedSum += diff * weight;
      weightTotal += weight;
    }

    return weightTotal > 0 ? weightedSum / weightTotal : 0;
  }

  /**
   * Cleans up all endpoint records.
   */
  destroy() {
    this.#endpoints.clear();
  }
}

export default NetworkSensor;
