/**
 * ThresholdTrigger — fires actions when metrics cross configurable thresholds.
 *
 * Supports directional thresholds (above, below, cross), hysteresis bands
 * to prevent flapping, and phi-weighted exponential moving average smoothing
 * on raw metric values for stable threshold evaluation.
 */
export class ThresholdTrigger {
  /** @type {number} Golden ratio for smoothing calculations */
  static PHI = 1.618033988749895;

  /** @type {string[]} Valid threshold directions */
  static DIRECTIONS = ['above', 'below', 'cross'];

  /** @type {number} Default smoothing factor derived from phi: 1/PHI ≈ 0.618 */
  static SMOOTHING_ALPHA = 1 / ThresholdTrigger.PHI;

  /** @type {Map<string, {triggerId: string, metric: string, threshold: number, direction: string, action: function, hysteresis: number, armed: boolean, fireCount: number, lastFired: number}>} */
  #triggers;

  /** @type {Map<string, {raw: number, smoothed: number, previousSmoothed: number, updateCount: number, lastUpdate: number}>} */
  #metricValues;

  /** @type {Array<{triggerId: string, metric: string, value: number, threshold: number, direction: string, timestamp: number, cleared: boolean}>} */
  #alerts;

  constructor() {
    this.#triggers = new Map();
    this.#metricValues = new Map();
    this.#alerts = [];
  }

  /**
   * Registers a threshold trigger for a specific metric.
   * @param {string} triggerId - Unique trigger identifier
   * @param {string} metric - Metric name to monitor
   * @param {number} threshold - Threshold value
   * @param {string} direction - Direction: 'above'|'below'|'cross'
   * @param {function} action - Action to execute when threshold is crossed
   * @returns {{triggerId: string, metric: string, threshold: number, direction: string}}
   */
  register(triggerId, metric, threshold, direction, action) {
    if (!ThresholdTrigger.DIRECTIONS.includes(direction)) {
      throw new Error(`Invalid direction "${direction}". Valid: ${ThresholdTrigger.DIRECTIONS.join(', ')}`);
    }
    if (typeof action !== 'function') {
      throw new TypeError('Action must be a function');
    }
    if (typeof threshold !== 'number' || Number.isNaN(threshold)) {
      throw new TypeError('Threshold must be a valid number');
    }
    if (this.#triggers.has(triggerId)) {
      throw new Error(`Trigger "${triggerId}" is already registered`);
    }

    this.#triggers.set(triggerId, {
      triggerId,
      metric,
      threshold,
      direction,
      action,
      hysteresis: 0,
      armed: true,
      fireCount: 0,
      lastFired: 0,
    });

    if (!this.#metricValues.has(metric)) {
      this.#metricValues.set(metric, {
        raw: 0,
        smoothed: 0,
        previousSmoothed: 0,
        updateCount: 0,
        lastUpdate: 0,
      });
    }

    return { triggerId, metric, threshold, direction };
  }

  /**
   * Updates a metric value with phi-weighted exponential moving average smoothing,
   * then checks all registered triggers for that metric.
   * @param {string} metric - Metric name
   * @param {number} value - New raw value
   * @returns {{metric: string, raw: number, smoothed: number, triggeredCount: number, triggers: Array<{triggerId: string, fired: boolean}>}}
   */
  update(metric, value) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TypeError('Metric value must be a valid number');
    }

    let metricState = this.#metricValues.get(metric);
    if (!metricState) {
      metricState = { raw: value, smoothed: value, previousSmoothed: value, updateCount: 0, lastUpdate: 0 };
      this.#metricValues.set(metric, metricState);
    }

    metricState.previousSmoothed = metricState.smoothed;
    metricState.raw = value;
    metricState.updateCount++;
    metricState.lastUpdate = Date.now();

    // Phi-weighted EMA: smoothed = α * raw + (1 - α) * previousSmoothed
    const alpha = ThresholdTrigger.SMOOTHING_ALPHA;
    metricState.smoothed = alpha * value + (1 - alpha) * metricState.previousSmoothed;

    const triggerResults = [];
    let triggeredCount = 0;

    for (const trigger of this.#triggers.values()) {
      if (trigger.metric !== metric) continue;

      const crossed = this.#checkThresholdCrossing(
        trigger,
        metricState.previousSmoothed,
        metricState.smoothed
      );

      if (crossed && trigger.armed) {
        trigger.fireCount++;
        trigger.lastFired = Date.now();
        triggeredCount++;

        this.#alerts.push({
          triggerId: trigger.triggerId,
          metric,
          value: metricState.smoothed,
          threshold: trigger.threshold,
          direction: trigger.direction,
          timestamp: Date.now(),
          cleared: false,
        });

        if (trigger.hysteresis > 0) {
          trigger.armed = false;
        }

        try {
          trigger.action({
            triggerId: trigger.triggerId,
            metric,
            value: metricState.smoothed,
            rawValue: value,
            threshold: trigger.threshold,
            direction: trigger.direction,
            timestamp: Date.now(),
          });
        } catch (err) {
          console.error(`[ThresholdTrigger] Error in trigger "${trigger.triggerId}":`, err);
        }

        triggerResults.push({ triggerId: trigger.triggerId, fired: true });
      } else {
        this.#checkHysteresisRearm(trigger, metricState.smoothed);
        triggerResults.push({ triggerId: trigger.triggerId, fired: false });
      }
    }

    return { metric, raw: value, smoothed: metricState.smoothed, triggeredCount, triggers: triggerResults };
  }

  /**
   * Returns all active (uncleared) alerts.
   * @returns {Array<{triggerId: string, metric: string, value: number, threshold: number, direction: string, timestamp: number}>}
   */
  getAlerts() {
    return this.#alerts.filter(a => !a.cleared).map(({ cleared: _c, ...rest }) => rest);
  }

  /**
   * Clears an alert by index.
   * @param {number} index - Alert index from getAlerts()
   */
  clearAlert(index) {
    const active = this.#alerts.filter(a => !a.cleared);
    if (index >= 0 && index < active.length) {
      active[index].cleared = true;
    }
  }

  /**
   * Sets a hysteresis band to prevent trigger flapping.
   * Once fired, the trigger will not re-fire until the metric moves outside
   * the hysteresis band (threshold ± band) and back.
   * @param {string} triggerId - Trigger identifier
   * @param {number} band - Hysteresis band width (applied symmetrically)
   */
  setHysteresis(triggerId, band) {
    const trigger = this.#triggers.get(triggerId);
    if (!trigger) {
      throw new Error(`Trigger "${triggerId}" not found`);
    }
    if (typeof band !== 'number' || band < 0) {
      throw new TypeError('Hysteresis band must be a non-negative number');
    }

    trigger.hysteresis = band;
  }

  /**
   * Returns trigger fire statistics.
   * @returns {{totalTriggers: number, totalFires: number, byMetric: Object<string, {triggers: number, fires: number, currentSmoothed: number}>}}
   */
  getMetrics() {
    let totalFires = 0;
    const byMetric = {};

    for (const trigger of this.#triggers.values()) {
      totalFires += trigger.fireCount;

      if (!byMetric[trigger.metric]) {
        const metricState = this.#metricValues.get(trigger.metric);
        byMetric[trigger.metric] = {
          triggers: 0,
          fires: 0,
          currentSmoothed: metricState ? metricState.smoothed : 0,
        };
      }
      byMetric[trigger.metric].triggers++;
      byMetric[trigger.metric].fires += trigger.fireCount;
    }

    return { totalTriggers: this.#triggers.size, totalFires, byMetric };
  }

  /**
   * Checks whether a threshold crossing occurred between previous and current smoothed values.
   * @param {{threshold: number, direction: string, hysteresis: number}} trigger
   * @param {number} previous
   * @param {number} current
   * @returns {boolean}
   */
  #checkThresholdCrossing(trigger, previous, current) {
    const { threshold, direction } = trigger;

    switch (direction) {
      case 'above':
        return previous <= threshold && current > threshold;
      case 'below':
        return previous >= threshold && current < threshold;
      case 'cross':
        return (previous <= threshold && current > threshold) ||
               (previous >= threshold && current < threshold);
      default:
        return false;
    }
  }

  /**
   * Re-arms a trigger if the metric has moved outside the hysteresis band.
   * @param {{threshold: number, hysteresis: number, armed: boolean, direction: string}} trigger
   * @param {number} currentSmoothed
   */
  #checkHysteresisRearm(trigger, currentSmoothed) {
    if (trigger.armed || trigger.hysteresis === 0) return;

    const { threshold, hysteresis, direction } = trigger;
    const lower = threshold - hysteresis;
    const upper = threshold + hysteresis;

    switch (direction) {
      case 'above':
        if (currentSmoothed < lower) trigger.armed = true;
        break;
      case 'below':
        if (currentSmoothed > upper) trigger.armed = true;
        break;
      case 'cross':
        if (currentSmoothed < lower || currentSmoothed > upper) trigger.armed = true;
        break;
    }
  }
}

export default ThresholdTrigger;
