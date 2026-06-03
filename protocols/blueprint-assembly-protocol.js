/**
 * PROTO-012: Blueprint Assembly Protocol (BAP)
 * Declarative blueprint system for assembling organism components.
 * Manages blueprint registration, dependency resolution via topological sort,
 * component assembly with phi-weighted initialization, and golden-angle placement.
 *
 * Engines wired: BlueprintRegistry + DependencyResolver + ComponentAssembler + PhiPlacer
 * Ring: Assembly Ring | Organism placement: Component / construction layer
 * Wire: intelligence-wire/bap
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * @typedef {'registered'|'resolving'|'assembling'|'assembled'|'failed'|'disassembled'} BlueprintStatus
 */

/**
 * @typedef {Object} ComponentDef
 * @property {string} id - Component identifier
 * @property {string} type - Component type
 * @property {Object} config - Component configuration
 * @property {Object|null} instance - Assembled instance
 */

/**
 * @typedef {Object} BlueprintDef
 * @property {string} id - Blueprint identifier
 * @property {string} name - Blueprint name
 * @property {ComponentDef[]} components - Component definitions
 * @property {Object<string, string[]>} dependencies - Adjacency list: componentId → [dependencyIds]
 * @property {BlueprintStatus} status - Current blueprint status
 * @property {string[]} assemblyOrder - Resolved assembly order
 * @property {number} createdAt - Creation timestamp
 * @property {number} assembledAt - Assembly completion timestamp
 */

class BlueprintAssemblyProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.maxComponents=500] - Maximum components per blueprint
   * @param {number} [config.initDelayBase=50] - Base initialization delay in ms
   * @param {boolean} [config.strictDeps=true] - Fail on missing dependencies
   */
  constructor(config = {}) {
    /** @type {Map<string, BlueprintDef>} */
    this.blueprints = new Map();
    this.maxComponents = config.maxComponents || 500;
    this.initDelayBase = config.initDelayBase || 50;
    this.strictDeps = config.strictDeps !== undefined ? config.strictDeps : true;
    this.assemblyCounter = 0;
    this.eventLog = [];
    this.metrics = {
      totalAssembled: 0,
      totalDisassembled: 0,
      totalComponentsCreated: 0,
      totalValidations: 0,
      avgAssemblyTimeMs: 0,
      totalAssemblyTimeMs: 0
    };
  }

  /* ─── Logging ─── */

  /**
   * Log an internal event.
   * @param {string} type - Event type
   * @param {string} detail - Event detail
   */
  _log(type, detail) {
    this.eventLog.push({ type, detail, timestamp: Date.now() });
    if (this.eventLog.length > 10000) {
      this.eventLog = this.eventLog.slice(-5000);
    }
  }

  /* ─── Blueprint Registration ─── */

  /**
   * Register a blueprint with components and a dependency graph.
   * @param {string} id - Unique blueprint identifier
   * @param {string} name - Human-readable name
   * @param {ComponentDef[]} components - Array of component definitions {id, type, config}
   * @param {Object<string, string[]>} dependencies - Adjacency list of dependencies
   * @returns {Object} - { id, name, componentCount, registered }
   */
  registerBlueprint(id, name, components, dependencies = {}) {
    if (this.blueprints.has(id)) {
      return { id, name, componentCount: 0, registered: false, error: 'Blueprint already exists' };
    }
    if (!Array.isArray(components) || components.length === 0) {
      return { id, name, componentCount: 0, registered: false, error: 'Components must be a non-empty array' };
    }
    if (components.length > this.maxComponents) {
      return { id, name, componentCount: 0, registered: false, error: `Exceeds max components (${this.maxComponents})` };
    }

    const normalizedComponents = components.map(c => ({
      id: c.id,
      type: c.type || 'generic',
      config: c.config || {},
      instance: null
    }));

    /** @type {BlueprintDef} */
    const blueprint = {
      id,
      name,
      components: normalizedComponents,
      dependencies: { ...dependencies },
      status: 'registered',
      assemblyOrder: [],
      createdAt: Date.now(),
      assembledAt: 0
    };

    this.blueprints.set(id, blueprint);
    this._log('register', `Blueprint "${name}" (${id}) registered with ${normalizedComponents.length} components`);
    return { id, name, componentCount: normalizedComponents.length, registered: true };
  }

  /* ─── Dependency Resolution (Topological Sort) ─── */

  /**
   * Perform topological sort on a blueprint's dependency graph.
   * Uses Kahn's algorithm for cycle detection.
   * @param {BlueprintDef} blueprint - Blueprint to resolve
   * @returns {Object} - { order: string[], hasCycle: boolean, missingDeps: string[] }
   */
  _topologicalSort(blueprint) {
    const componentIds = new Set(blueprint.components.map(c => c.id));
    const deps = blueprint.dependencies;
    const missingDeps = [];

    // Build in-degree map and adjacency
    const inDegree = {};
    const adjacency = {};
    for (const cid of componentIds) {
      inDegree[cid] = 0;
      adjacency[cid] = [];
    }

    for (const [cid, depList] of Object.entries(deps)) {
      if (!componentIds.has(cid)) continue;
      for (const dep of depList) {
        if (!componentIds.has(dep)) {
          missingDeps.push(dep);
          continue;
        }
        adjacency[dep].push(cid);
        inDegree[cid]++;
      }
    }

    // Kahn's algorithm
    const queue = [];
    for (const [cid, degree] of Object.entries(inDegree)) {
      if (degree === 0) queue.push(cid);
    }

    const order = [];
    while (queue.length > 0) {
      const node = queue.shift();
      order.push(node);
      for (const neighbor of adjacency[node]) {
        inDegree[neighbor]--;
        if (inDegree[neighbor] === 0) {
          queue.push(neighbor);
        }
      }
    }

    const hasCycle = order.length !== componentIds.size;
    return { order, hasCycle, missingDeps: [...new Set(missingDeps)] };
  }

  /* ─── Blueprint Validation ─── */

  /**
   * Validate a blueprint for circular dependencies and missing components.
   * @param {string} blueprintId - Blueprint to validate
   * @returns {Object} - { valid, hasCycle, missingDeps, componentCount }
   */
  validate(blueprintId) {
    const blueprint = this.blueprints.get(blueprintId);
    if (!blueprint) {
      return { valid: false, error: `Blueprint ${blueprintId} not found` };
    }

    this.metrics.totalValidations++;
    const result = this._topologicalSort(blueprint);

    const valid = !result.hasCycle && (result.missingDeps.length === 0 || !this.strictDeps);

    this._log('validate', `Blueprint "${blueprint.name}" validation: ${valid ? 'PASS' : 'FAIL'}`);
    return {
      valid,
      hasCycle: result.hasCycle,
      missingDeps: result.missingDeps,
      componentCount: blueprint.components.length,
      resolvedOrder: result.order
    };
  }

  /* ─── Golden-Angle Placement ─── */

  /**
   * Compute golden-angle based coordinates for component positioning.
   * Components are placed in a phyllotaxis spiral pattern.
   * @param {number} index - Component index
   * @param {number} total - Total number of components
   * @returns {Object} - { x, y, angle, radius }
   */
  _goldenAnglePlacement(index, total) {
    const radius = Math.sqrt(index + 1) * (100 / Math.sqrt(total));
    const angle = index * GOLDEN_ANGLE;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      angle: angle % (2 * Math.PI),
      radius
    };
  }

  /* ─── Assembly ─── */

  /**
   * Assemble a blueprint by resolving dependencies and instantiating components.
   * Components are initialized in dependency order with phi-weighted delays.
   * @param {string} blueprintId - Blueprint to assemble
   * @returns {Object} - { blueprintId, status, components, totalDelayMs }
   */
  assemble(blueprintId) {
    const blueprint = this.blueprints.get(blueprintId);
    if (!blueprint) {
      return { blueprintId, status: 'failed', error: `Blueprint ${blueprintId} not found` };
    }
    if (blueprint.status === 'assembled') {
      return { blueprintId, status: 'already-assembled', error: 'Blueprint is already assembled' };
    }

    blueprint.status = 'resolving';
    const sortResult = this._topologicalSort(blueprint);

    if (sortResult.hasCycle) {
      blueprint.status = 'failed';
      this._log('assemble-fail', `Blueprint "${blueprint.name}" has circular dependencies`);
      return { blueprintId, status: 'failed', error: 'Circular dependency detected' };
    }

    if (this.strictDeps && sortResult.missingDeps.length > 0) {
      blueprint.status = 'failed';
      this._log('assemble-fail', `Blueprint "${blueprint.name}" has missing dependencies: ${sortResult.missingDeps.join(', ')}`);
      return { blueprintId, status: 'failed', error: `Missing dependencies: ${sortResult.missingDeps.join(', ')}` };
    }

    blueprint.assemblyOrder = sortResult.order;
    blueprint.status = 'assembling';
    this._log('assemble-start', `Assembling blueprint "${blueprint.name}" in resolved order`);

    const componentMap = new Map(blueprint.components.map(c => [c.id, c]));
    const assembledComponents = [];
    let totalDelayMs = 0;
    const startTime = Date.now();

    for (let i = 0; i < sortResult.order.length; i++) {
      const cid = sortResult.order[i];
      const component = componentMap.get(cid);
      if (!component) continue;

      // Phi-weighted initialization delay
      const phiDelay = this.initDelayBase * Math.pow(PHI, -(i / sortResult.order.length));
      totalDelayMs += phiDelay;

      // Compute placement
      const placement = this._goldenAnglePlacement(i, sortResult.order.length);

      // Instantiate component
      component.instance = {
        id: component.id,
        type: component.type,
        config: component.config,
        placement,
        phiDelay,
        assembledAt: Date.now(),
        assemblyIndex: i
      };

      assembledComponents.push({
        id: component.id,
        type: component.type,
        placement,
        assemblyIndex: i,
        phiDelay
      });

      this.metrics.totalComponentsCreated++;
    }

    blueprint.status = 'assembled';
    blueprint.assembledAt = Date.now();
    const assemblyTimeMs = Date.now() - startTime;
    this.metrics.totalAssembled++;
    this.metrics.totalAssemblyTimeMs += assemblyTimeMs;
    this.metrics.avgAssemblyTimeMs = this.metrics.totalAssemblyTimeMs / this.metrics.totalAssembled;

    this._log('assemble-complete', `Blueprint "${blueprint.name}" assembled (${assembledComponents.length} components)`);

    return {
      blueprintId,
      status: 'assembled',
      components: assembledComponents,
      assemblyOrder: sortResult.order,
      totalDelayMs,
      assemblyTimeMs
    };
  }

  /* ─── Disassembly ─── */

  /**
   * Disassemble a blueprint in reverse assembly order.
   * @param {string} blueprintId - Blueprint to disassemble
   * @returns {Object} - { blueprintId, status, disassembledCount }
   */
  disassemble(blueprintId) {
    const blueprint = this.blueprints.get(blueprintId);
    if (!blueprint) {
      return { blueprintId, status: 'not-found', disassembledCount: 0 };
    }
    if (blueprint.status !== 'assembled') {
      return { blueprintId, status: blueprint.status, disassembledCount: 0, error: 'Not assembled' };
    }

    const reverseOrder = [...blueprint.assemblyOrder].reverse();
    const componentMap = new Map(blueprint.components.map(c => [c.id, c]));
    let disassembledCount = 0;

    for (const cid of reverseOrder) {
      const component = componentMap.get(cid);
      if (component && component.instance) {
        component.instance = null;
        disassembledCount++;
      }
    }

    blueprint.status = 'disassembled';
    blueprint.assemblyOrder = [];
    this.metrics.totalDisassembled++;
    this._log('disassemble', `Blueprint "${blueprint.name}" disassembled (${disassembledCount} components)`);

    return { blueprintId, status: 'disassembled', disassembledCount };
  }

  /* ─── Assembly Manifest ─── */

  /**
   * Get the full assembly manifest for a blueprint: component tree with order and placement.
   * @param {string} blueprintId - Blueprint identifier
   * @returns {Object} - { blueprintId, name, status, manifest }
   */
  getAssemblyManifest(blueprintId) {
    const blueprint = this.blueprints.get(blueprintId);
    if (!blueprint) {
      return { blueprintId, name: null, status: 'not-found', manifest: [] };
    }

    const componentMap = new Map(blueprint.components.map(c => [c.id, c]));
    const manifest = blueprint.assemblyOrder.map((cid, i) => {
      const component = componentMap.get(cid);
      const deps = blueprint.dependencies[cid] || [];
      return {
        id: cid,
        type: component ? component.type : 'unknown',
        assemblyIndex: i,
        dependencies: deps,
        placement: component && component.instance ? component.instance.placement : this._goldenAnglePlacement(i, blueprint.assemblyOrder.length),
        isAssembled: !!(component && component.instance)
      };
    });

    return {
      blueprintId,
      name: blueprint.name,
      status: blueprint.status,
      manifest,
      phiConstant: PHI,
      heartbeatInterval: HEARTBEAT
    };
  }

  /* ─── Diagnostics ─── */

  /**
   * Get assembly metrics.
   * @returns {Object} - Metrics snapshot
   */
  getMetrics() {
    return {
      totalBlueprints: this.blueprints.size,
      totalAssembled: this.metrics.totalAssembled,
      totalDisassembled: this.metrics.totalDisassembled,
      totalComponentsCreated: this.metrics.totalComponentsCreated,
      totalValidations: this.metrics.totalValidations,
      avgAssemblyTimeMs: this.metrics.avgAssemblyTimeMs,
      heartbeatInterval: HEARTBEAT,
      goldenAngle: GOLDEN_ANGLE
    };
  }

  /**
   * Get recent event log entries.
   * @param {number} [count=50] - Number of recent events
   * @returns {Object[]} - Recent events
   */
  getRecentEvents(count = 50) {
    return this.eventLog.slice(-count);
  }
}

export { BlueprintAssemblyProtocol };
export default BlueprintAssemblyProtocol;
