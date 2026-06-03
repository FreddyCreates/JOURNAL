const PHI = 1.618033988749895;
const PHI_INVERSE = 1 / PHI;

/**
 * BoundedMembrane — The architectural enforcement of the Memory Runtime Hypothesis.
 *
 * Theorem candidate (Bounded Authority Membrane):
 *   Long-horizon agents become more stable when generative processes cannot
 *   directly mutate canonical memory or public claims without mediated review.
 *
 * This module enforces the four-layer stack:
 *   NOVA_ROOT          → governance ceiling (read/write all)
 *   MEMORY_RUNTIME     → canonical store (read by all, write only via promotion)
 *   ACTIVE_STATE       → working memory (read/write by cognition)
 *   FOUNDATION_FLOOR   → compute layer (read only from above, write to ACTIVE_STATE only)
 *
 * It is the runtime boundary that prevents:
 *   - Imagination from becoming canonization
 *   - Synthesis from rewriting lineage
 *   - Generation from becoming truth
 */
export class BoundedMembrane {
  constructor() {
    /** @type {Map<string, Set<string>>} layer → registered component IDs */
    this._components = new Map([
      ['nova_root', new Set()],
      ['memory_runtime', new Set()],
      ['active_state', new Set()],
      ['foundation_floor', new Set()]
    ]);

    /** @type {Object[]} */
    this._violations = [];
    this._totalChecks = 0;
    this._totalBlocked = 0;
  }

  /**
   * Layer hierarchy (higher index = more authority).
   */
  static LAYERS = ['foundation_floor', 'active_state', 'memory_runtime', 'nova_root'];

  /**
   * Access rules: who can write to whom.
   * Key = target layer, Value = set of layers that can write to it.
   */
  static WRITE_RULES = {
    nova_root: new Set(['nova_root']),
    memory_runtime: new Set(['nova_root']),  // ONLY nova_root can write directly
    active_state: new Set(['nova_root', 'memory_runtime', 'active_state', 'foundation_floor']),
    foundation_floor: new Set(['nova_root', 'foundation_floor'])
  };

  /**
   * Read rules: who can read from whom.
   * All layers can read from layers at or below their level.
   */
  static READ_RULES = {
    nova_root: new Set(['nova_root', 'memory_runtime', 'active_state', 'foundation_floor']),
    memory_runtime: new Set(['memory_runtime', 'active_state', 'foundation_floor']),
    active_state: new Set(['active_state', 'foundation_floor']),
    foundation_floor: new Set(['foundation_floor'])
  };

  /**
   * Register a component at a specific layer.
   * @param {string} componentId
   * @param {string} layer
   */
  registerComponent(componentId, layer) {
    if (!this._components.has(layer)) {
      throw new Error(`Invalid layer: ${layer}. Valid: ${BoundedMembrane.LAYERS.join(', ')}`);
    }
    this._components.get(layer).add(componentId);
  }

  /**
   * Get the layer a component belongs to.
   * @param {string} componentId
   * @returns {string|null}
   */
  getComponentLayer(componentId) {
    for (const [layer, components] of this._components) {
      if (components.has(componentId)) return layer;
    }
    return null;
  }

  /**
   * Check if a write operation is permitted.
   * This is the CORE enforcement of the Bounded Authority Membrane.
   *
   * @param {string} sourceLayer - Layer attempting the write
   * @param {string} targetLayer - Layer being written to
   * @returns {{permitted: boolean, reason: string}}
   */
  checkWrite(sourceLayer, targetLayer) {
    this._totalChecks++;

    if (!BoundedMembrane.WRITE_RULES[targetLayer]) {
      this._totalBlocked++;
      return { permitted: false, reason: `Unknown target layer: ${targetLayer}` };
    }

    const permitted = BoundedMembrane.WRITE_RULES[targetLayer].has(sourceLayer);

    if (!permitted) {
      this._totalBlocked++;
      this._violations.push({
        type: 'write_violation',
        source: sourceLayer,
        target: targetLayer,
        timestamp: Date.now()
      });
      return {
        permitted: false,
        reason: `Layer '${sourceLayer}' cannot write to '${targetLayer}'. Only [${[...BoundedMembrane.WRITE_RULES[targetLayer]].join(', ')}] have write access.`
      };
    }

    return { permitted: true, reason: 'Write authorized' };
  }

  /**
   * Check if a read operation is permitted.
   * @param {string} sourceLayer - Layer attempting the read
   * @param {string} targetLayer - Layer being read from
   * @returns {{permitted: boolean, reason: string}}
   */
  checkRead(sourceLayer, targetLayer) {
    this._totalChecks++;

    if (!BoundedMembrane.READ_RULES[sourceLayer]) {
      return { permitted: false, reason: `Unknown source layer: ${sourceLayer}` };
    }

    const permitted = BoundedMembrane.READ_RULES[sourceLayer].has(targetLayer);

    if (!permitted) {
      return {
        permitted: false,
        reason: `Layer '${sourceLayer}' cannot read from '${targetLayer}'. Readable layers: [${[...BoundedMembrane.READ_RULES[sourceLayer]].join(', ')}]`
      };
    }

    return { permitted: true, reason: 'Read authorized' };
  }

  /**
   * Attempt a memory write — the full membrane check.
   * Combines component lookup + layer enforcement.
   * @param {string} sourceComponentId - Component attempting write
   * @param {string} targetLayer - Target memory layer
   * @returns {{permitted: boolean, reason: string, sourceLayer: string|null}}
   */
  attemptWrite(sourceComponentId, targetLayer) {
    const sourceLayer = this.getComponentLayer(sourceComponentId);

    if (!sourceLayer) {
      this._totalBlocked++;
      return { permitted: false, reason: `Component '${sourceComponentId}' not registered in any layer`, sourceLayer: null };
    }

    const result = this.checkWrite(sourceLayer, targetLayer);
    return { ...result, sourceLayer };
  }

  /**
   * Get violation history.
   * @returns {Object[]}
   */
  getViolations() {
    return [...this._violations];
  }

  /**
   * Get membrane metrics.
   * @returns {{totalChecks: number, totalBlocked: number, violations: number, blockRate: number}}
   */
  getMetrics() {
    return {
      totalChecks: this._totalChecks,
      totalBlocked: this._totalBlocked,
      violations: this._violations.length,
      blockRate: this._totalChecks > 0 ? this._totalBlocked / this._totalChecks : 0
    };
  }

  /**
   * Validate that the membrane is correctly configured —
   * ensures no component is registered in multiple layers.
   * @returns {{valid: boolean, conflicts: string[]}}
   */
  validate() {
    const seen = new Map();
    const conflicts = [];

    for (const [layer, components] of this._components) {
      for (const id of components) {
        if (seen.has(id)) {
          conflicts.push(`${id} registered in both '${seen.get(id)}' and '${layer}'`);
        } else {
          seen.set(id, layer);
        }
      }
    }

    return { valid: conflicts.length === 0, conflicts };
  }
}
