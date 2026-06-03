import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} ThermalZone
 * @property {string} zoneId - Unique zone identifier
 * @property {number} baseline - Baseline temperature in °C
 * @property {number} threshold - Alert threshold in °C
 * @property {number} current - Current temperature reading
 * @property {number} lastReadTime - Timestamp of last reading
 * @property {number} driftSeed - Seed for deterministic phi-drift
 * @property {number} readCount - Number of readings taken
 * @property {boolean} cooling - Whether cooldown is active
 * @property {number} cooldownStep - Current cooldown iteration
 */

/**
 * @typedef {Object} HeatMapEntry
 * @property {string} zoneId
 * @property {number} temperature
 * @property {number} baseline
 * @property {number} threshold
 * @property {number} delta - Distance from baseline
 * @property {number} saturation - Ratio of current to threshold (0–1+)
 * @property {string} status - 'nominal' | 'warm' | 'hot' | 'critical'
 */

/**
 * @typedef {Object} HotspotReport
 * @property {string} reportId
 * @property {number} timestamp
 * @property {Array<HeatMapEntry>} hotspots - Zones exceeding threshold
 * @property {number} maxTemperature
 * @property {string|null} hottestZone
 */

/**
 * ThermalSensor — monitors computational heat signatures across organism modules.
 *
 * Registers thermal zones with baselines and thresholds, simulates temperature
 * drift using phi-weighted oscillation, detects hotspots, and performs
 * phi-decay cooldown procedures.
 */
export class ThermalSensor {
  /** @type {Map<string, ThermalZone>} */
  #zones;

  constructor() {
    this.#zones = new Map();
  }

  /**
   * Registers a new thermal monitoring zone.
   * @param {string} zoneId - Unique zone identifier
   * @param {number} baseline - Baseline temperature in °C
   * @param {number} threshold - Alert threshold in °C
   * @throws {Error} If zone already exists or parameters are invalid
   */
  registerZone(zoneId, baseline, threshold) {
    if (this.#zones.has(zoneId)) {
      throw new Error(`Thermal zone "${zoneId}" is already registered`);
    }
    if (typeof baseline !== 'number' || typeof threshold !== 'number') {
      throw new TypeError('Baseline and threshold must be numbers');
    }
    if (threshold <= baseline) {
      throw new RangeError('Threshold must be greater than baseline');
    }

    /** @type {ThermalZone} */
    const zone = {
      zoneId,
      baseline,
      threshold,
      current: baseline,
      lastReadTime: Date.now(),
      driftSeed: Math.random() * Math.PI * 2,
      readCount: 0,
      cooling: false,
      cooldownStep: 0,
    };

    this.#zones.set(zoneId, zone);
  }

  /**
   * Reads the current temperature for a zone, applying phi-weighted thermal drift.
   * Each read advances the drift oscillation, simulating organic heat fluctuation.
   * @param {string} zoneId
   * @returns {{zoneId: string, temperature: number, delta: number, timestamp: number, readingId: string}}
   * @throws {Error} If zone is not registered
   */
  readTemperature(zoneId) {
    const zone = this.#zones.get(zoneId);
    if (!zone) {
      throw new Error(`Thermal zone "${zoneId}" not found`);
    }

    zone.readCount++;
    const now = Date.now();
    const elapsed = (now - zone.lastReadTime) / 1000;
    zone.lastReadTime = now;

    const phiOscillation = Math.sin(zone.driftSeed + zone.readCount / PHI);
    const range = zone.threshold - zone.baseline;
    const drift = phiOscillation * (range / PHI);

    if (zone.cooling) {
      const decayFactor = Math.pow(1 / PHI, zone.cooldownStep);
      const cooledDrift = drift * decayFactor;
      zone.current = zone.baseline + cooledDrift + (elapsed * 0.01);
      zone.cooldownStep++;

      if (Math.abs(zone.current - zone.baseline) < range * 0.05) {
        zone.cooling = false;
        zone.cooldownStep = 0;
        zone.current = zone.baseline;
      }
    } else {
      zone.current = zone.baseline + drift + (Math.random() * range * (1 / (PHI * PHI)));
    }

    const delta = zone.current - zone.baseline;

    return {
      zoneId,
      temperature: Math.round(zone.current * 1000) / 1000,
      delta: Math.round(delta * 1000) / 1000,
      timestamp: now,
      readingId: crypto.randomUUID(),
    };
  }

  /**
   * Returns a heat map of all registered zones with status classification.
   * Status levels: nominal (<50% of range), warm (50–80%), hot (80–100%), critical (>100%).
   * @returns {Array<HeatMapEntry>}
   */
  getHeatMap() {
    const entries = [];

    for (const zone of this.#zones.values()) {
      const range = zone.threshold - zone.baseline;
      const delta = zone.current - zone.baseline;
      const saturation = range > 0 ? delta / range : 0;

      let status = 'nominal';
      if (saturation >= 1.0) status = 'critical';
      else if (saturation >= 0.8) status = 'hot';
      else if (saturation >= 0.5) status = 'warm';

      entries.push({
        zoneId: zone.zoneId,
        temperature: Math.round(zone.current * 1000) / 1000,
        baseline: zone.baseline,
        threshold: zone.threshold,
        delta: Math.round(delta * 1000) / 1000,
        saturation: Math.round(saturation * 10000) / 10000,
        status,
      });
    }

    return entries;
  }

  /**
   * Detects hotspots — zones whose current temperature exceeds their threshold.
   * Returns a report including the hottest zone and max temperature.
   * @returns {HotspotReport}
   */
  detectHotspot() {
    const heatMap = this.getHeatMap();
    const hotspots = heatMap.filter(entry => entry.temperature >= entry.threshold);

    let maxTemperature = -Infinity;
    let hottestZone = null;

    for (const entry of hotspots) {
      if (entry.temperature > maxTemperature) {
        maxTemperature = entry.temperature;
        hottestZone = entry.zoneId;
      }
    }

    return {
      reportId: crypto.randomUUID(),
      timestamp: Date.now(),
      hotspots,
      maxTemperature: hotspots.length > 0 ? maxTemperature : 0,
      hottestZone,
    };
  }

  /**
   * Initiates a phi-decay cooldown procedure on the specified zone.
   * Each subsequent read decays the drift by 1/φ^step, converging toward baseline.
   * @param {string} zoneId
   * @returns {{zoneId: string, previousTemp: number, coolingInitiated: boolean, timestamp: number}}
   * @throws {Error} If zone is not registered
   */
  cooldown(zoneId) {
    const zone = this.#zones.get(zoneId);
    if (!zone) {
      throw new Error(`Thermal zone "${zoneId}" not found`);
    }

    const previousTemp = zone.current;
    zone.cooling = true;
    zone.cooldownStep = 1;

    return {
      zoneId,
      previousTemp: Math.round(previousTemp * 1000) / 1000,
      coolingInitiated: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Returns the number of registered thermal zones.
   * @returns {number}
   */
  get zoneCount() {
    return this.#zones.size;
  }

  /**
   * Unregisters a thermal zone.
   * @param {string} zoneId
   * @throws {Error} If zone is not registered
   */
  unregisterZone(zoneId) {
    if (!this.#zones.has(zoneId)) {
      throw new Error(`Thermal zone "${zoneId}" not found`);
    }
    this.#zones.delete(zoneId);
  }

  /**
   * Cleans up all registered zones.
   */
  destroy() {
    this.#zones.clear();
  }
}

export default ThermalSensor;
