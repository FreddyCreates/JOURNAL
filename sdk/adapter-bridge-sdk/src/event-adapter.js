import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/** @typedef {'pubsub' | 'observer' | 'callback' | 'promise'} BusType */

/**
 * @typedef {Object} EventLogEntry
 * @property {string} eventId
 * @property {string} busId
 * @property {string} event
 * @property {unknown} data
 * @property {number} handlersNotified
 * @property {number} timestamp
 */

/**
 * @typedef {Object} EventMetrics
 * @property {number} totalBuses
 * @property {number} totalEmissions
 * @property {number} totalDeliveries
 * @property {number} deliveryRatio
 * @property {number} phiThroughputScore
 * @property {Array<{busId: string, emitted: number, delivered: number}>} perBus
 */

/**
 * EventAdapter — adapts between different event systems (pub/sub, observer,
 * callback, promise). Registers typed event buses, emits and subscribes to
 * events, bridges events across buses with name mapping, and tracks
 * phi-weighted throughput metrics.
 */
export class EventAdapter {
  /** @type {Map<string, Object>} */
  #buses;
  /** @type {Map<string, Object>} */
  #bridges;
  /** @type {number} */
  #maxLogSize;

  constructor() {
    this.#buses = new Map();
    this.#bridges = new Map();
    this.#maxLogSize = 1000;
  }

  /**
   * Registers a new event bus of the specified type.
   * @param {string} busId - Unique bus identifier
   * @param {BusType} type - Bus type: 'pubsub', 'observer', 'callback', or 'promise'
   * @throws {Error} If busId already exists or type is invalid
   */
  registerBus(busId, type) {
    if (typeof busId !== 'string' || busId.length === 0) {
      throw new Error('busId must be a non-empty string');
    }
    if (this.#buses.has(busId)) {
      throw new Error(`Event bus "${busId}" is already registered`);
    }

    const validTypes = ['pubsub', 'observer', 'callback', 'promise'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid bus type "${type}". Valid types: ${validTypes.join(', ')}`);
    }

    this.#buses.set(busId, {
      busId,
      type,
      handlers: new Map(),
      log: [],
      totalEmitted: 0,
      totalDelivered: 0,
      createdAt: Date.now(),
    });
  }

  /**
   * Emits an event on the specified bus, notifying all subscribed handlers.
   * Also forwards the event through any bridges connected to this bus.
   * @param {string} busId - Target bus identifier
   * @param {string} event - Event name
   * @param {unknown} data - Event payload
   * @returns {number} Number of handlers notified
   * @throws {Error} If bus is not registered
   */
  emit(busId, event, data) {
    const bus = this.#buses.get(busId);
    if (!bus) {
      throw new Error(`Event bus "${busId}" is not registered`);
    }

    bus.totalEmitted++;
    const handlers = bus.handlers.get(event) || [];
    let notified = 0;
    for (const handler of handlers) {
      try {
        handler(data, { event, busId, timestamp: Date.now() });
        notified++;
      } catch (err) {
        console.error(`[EventAdapter] Handler error on bus "${busId}" event "${event}":`, err);
      }
    }
    bus.totalDelivered += notified;
    const logEntry = { eventId: crypto.randomUUID(), busId, event, data: structuredClone(data), handlersNotified: notified, timestamp: Date.now() };
    bus.log.push(logEntry);
    if (bus.log.length > this.#maxLogSize) bus.log.splice(0, bus.log.length - this.#maxLogSize);

    this.#forwardThroughBridges(busId, event, data);

    return notified;
  }

  /**
   * Subscribes a handler to an event on the specified bus.
   * @param {string} busId - Target bus identifier
   * @param {string} event - Event name to listen for
   * @param {function} handler - Callback receiving (data, meta)
   * @returns {function} Unsubscribe function
   * @throws {Error} If bus is not registered or handler is not a function
   */
  subscribe(busId, event, handler) {
    const bus = this.#buses.get(busId);
    if (!bus) throw new Error(`Event bus "${busId}" is not registered`);
    if (typeof handler !== 'function') throw new TypeError('handler must be a function');
    if (!bus.handlers.has(event)) bus.handlers.set(event, []);
    bus.handlers.get(event).push(handler);
    return () => {
      const list = bus.handlers.get(event);
      if (!list) return;
      const idx = list.indexOf(handler);
      if (idx !== -1) list.splice(idx, 1);
    };
  }

  /**
   * Bridges events between two buses with an event name mapping.
   * When a mapped event fires on the source bus, it is re-emitted on the
   * target bus under the mapped name.
   * @param {string} sourceBus - Source bus identifier
   * @param {string} targetBus - Target bus identifier
   * @param {Record<string, string>} eventMap - Source event name → target event name
   * @returns {BridgeMapping}
   * @throws {Error} If either bus is not registered
   */
  bridge(sourceBus, targetBus, eventMap) {
    if (!this.#buses.has(sourceBus)) throw new Error(`Source bus "${sourceBus}" is not registered`);
    if (!this.#buses.has(targetBus)) throw new Error(`Target bus "${targetBus}" is not registered`);
    if (!eventMap || typeof eventMap !== 'object') throw new TypeError('eventMap must be a non-null object');
    const bridgeKey = `${sourceBus}->${targetBus}`;
    const mapping = { bridgeId: crypto.randomUUID(), sourceBus, targetBus, eventMap: { ...eventMap }, eventsForwarded: 0, createdAt: Date.now() };
    this.#bridges.set(bridgeKey, mapping);
    return structuredClone(mapping);
  }

  /**
   * Returns the event history log for a bus.
   * @param {string} busId
   * @returns {Array<EventLogEntry>}
   */
  getEventLog(busId) {
    const bus = this.#buses.get(busId);
    if (!bus) throw new Error(`Event bus "${busId}" is not registered`);
    return structuredClone(bus.log);
  }

  /**
   * Returns phi-weighted event throughput metrics across all buses.
   * @returns {EventMetrics}
   */
  getMetrics() {
    const perBus = [];
    let totalEmissions = 0;
    let totalDeliveries = 0;

    for (const bus of this.#buses.values()) {
      totalEmissions += bus.totalEmitted;
      totalDeliveries += bus.totalDelivered;
      perBus.push({
        busId: bus.busId,
        emitted: bus.totalEmitted,
        delivered: bus.totalDelivered,
      });
    }

    const deliveryRatio = totalEmissions > 0 ? totalDeliveries / totalEmissions : 0;
    const busSaturation = Math.min(1, this.#buses.size / 10);
    const phiThroughputScore = ((deliveryRatio * PHI + busSaturation) / (PHI + 1))
      * (PHI / (PHI + 1));

    return {
      totalBuses: this.#buses.size,
      totalEmissions,
      totalDeliveries,
      deliveryRatio,
      phiThroughputScore,
      perBus,
    };
  }

  /**
   * Forwards an event through all bridges originating from the given bus.
   * @param {string} sourceBusId
   * @param {string} event
   * @param {unknown} data
   */
  #forwardThroughBridges(sourceBusId, event, data) {
    for (const mapping of this.#bridges.values()) {
      if (mapping.sourceBus !== sourceBusId) continue;

      const targetEvent = mapping.eventMap[event];
      if (!targetEvent) continue;

      const targetBus = this.#buses.get(mapping.targetBus);
      if (!targetBus) continue;

      const handlers = targetBus.handlers.get(targetEvent) || [];
      for (const handler of handlers) {
        try {
          handler(data, { event: targetEvent, busId: targetBus.busId, timestamp: Date.now() });
          targetBus.totalDelivered++;
        } catch (err) {
          console.error(`[EventAdapter] Bridge handler error on "${targetBus.busId}":`, err);
        }
      }

      targetBus.totalEmitted++;
      mapping.eventsForwarded++;
    }
  }
}

export default EventAdapter;
