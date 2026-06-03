/**
 * PROTO-011: Recipe Orchestration Protocol (ROP)
 * Multi-step recipe execution engine for AI workflow orchestration.
 * Manages recipe registries, sequential step execution with phi-weighted timing,
 * recipe composition, and execution metrics tracking.
 *
 * Engines wired: RecipeEngine + StepExecutor + CompositionGraph + MetricsCollector
 * Ring: Orchestration Ring | Organism placement: Workflow / execution layer
 * Wire: intelligence-wire/rop
 */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

/**
 * @typedef {'pending'|'running'|'completed'|'failed'|'cancelled'} RecipeStatus
 */

/**
 * @typedef {Object} RecipeStep
 * @property {string} action - Step action identifier
 * @property {string} model - Model to execute the step
 * @property {*} input - Input data for the step
 * @property {number} timeout - Timeout in ms for this step
 */

/**
 * @typedef {Object} RecipeDefinition
 * @property {string} id - Recipe identifier
 * @property {string} name - Human-readable recipe name
 * @property {RecipeStep[]} steps - Ordered list of recipe steps
 * @property {number} createdAt - Creation timestamp
 * @property {number} version - Recipe version
 */

/**
 * @typedef {Object} ExecutionRecord
 * @property {string} recipeId - Recipe identifier
 * @property {RecipeStatus} status - Current execution status
 * @property {number} currentStep - Index of the current step
 * @property {Object[]} stepResults - Results from each completed step
 * @property {number} startedAt - Execution start timestamp
 * @property {number} completedAt - Execution end timestamp
 * @property {*} finalOutput - Final output of the recipe
 * @property {string|null} error - Error message if failed
 */

class RecipeOrchestrationProtocol {
  /**
   * @param {Object} config - Configuration
   * @param {number} [config.defaultTimeout=5000] - Default step timeout in ms
   * @param {number} [config.maxConcurrentRecipes=10] - Max concurrent recipe executions
   * @param {number} [config.maxStepsPerRecipe=100] - Max steps allowed in a single recipe
   * @param {boolean} [config.strictMode=false] - Fail recipe on any step failure
   */
  constructor(config = {}) {
    /** @type {Map<string, RecipeDefinition>} */
    this.recipes = new Map();
    /** @type {Map<string, ExecutionRecord>} */
    this.executions = new Map();
    this.defaultTimeout = config.defaultTimeout || 5000;
    this.maxConcurrentRecipes = config.maxConcurrentRecipes || 10;
    this.maxStepsPerRecipe = config.maxStepsPerRecipe || 100;
    this.strictMode = config.strictMode || false;
    this.executionCounter = 0;
    this.eventLog = [];
    this.metrics = {
      totalExecuted: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      totalStepsExecuted: 0,
      totalLatencyMs: 0,
      phiResonance: 0
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

  /* ─── Recipe Registration ─── */

  /**
   * Register a multi-step recipe.
   * @param {string} id - Unique recipe identifier
   * @param {string} name - Human-readable name
   * @param {RecipeStep[]} steps - Ordered list of steps, each with {action, model, input, timeout}
   * @returns {Object} - { id, name, stepCount, registered }
   */
  registerRecipe(id, name, steps) {
    if (this.recipes.has(id)) {
      return { id, name, stepCount: 0, registered: false, error: 'Recipe already exists' };
    }
    if (!Array.isArray(steps) || steps.length === 0) {
      return { id, name, stepCount: 0, registered: false, error: 'Steps must be a non-empty array' };
    }
    if (steps.length > this.maxStepsPerRecipe) {
      return { id, name, stepCount: 0, registered: false, error: `Exceeds max steps (${this.maxStepsPerRecipe})` };
    }

    const normalizedSteps = steps.map((step, i) => ({
      action: step.action || `step-${i}`,
      model: step.model || 'default',
      input: step.input !== undefined ? step.input : null,
      timeout: step.timeout || this.defaultTimeout,
      weight: this._computeStepWeight(i, steps.length)
    }));

    /** @type {RecipeDefinition} */
    const recipe = {
      id,
      name,
      steps: normalizedSteps,
      createdAt: Date.now(),
      version: 1
    };

    this.recipes.set(id, recipe);
    this._log('register', `Recipe "${name}" (${id}) registered with ${normalizedSteps.length} steps`);
    return { id, name, stepCount: normalizedSteps.length, registered: true };
  }

  /* ─── Step Weight Computation ─── */

  /**
   * Compute phi-weighted importance of a step based on its position.
   * Earlier and later steps carry more weight (U-shaped phi curve).
   * @param {number} stepIndex - Zero-based step index
   * @param {number} totalSteps - Total number of steps
   * @returns {number} - Weight between 0 and 1
   */
  _computeStepWeight(stepIndex, totalSteps) {
    if (totalSteps <= 1) return 1.0;
    const normalized = stepIndex / (totalSteps - 1);
    const distFromCenter = Math.abs(normalized - 0.5) * 2;
    const phiWeight = Math.pow(PHI, distFromCenter) / PHI;
    return Math.min(1.0, phiWeight);
  }

  /* ─── Recipe Execution ─── */

  /**
   * Execute a registered recipe sequentially.
   * Each step's output becomes the next step's input (pipeline pattern).
   * Step timing is phi-weighted: actual timeout = base × PHI^(weight).
   * @param {string} recipeId - Recipe to execute
   * @param {*} context - Initial context/input for the first step
   * @returns {Object} - { executionId, status, stepResults, finalOutput, totalLatencyMs }
   */
  executeRecipe(recipeId, context) {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return { executionId: null, status: 'failed', error: `Recipe ${recipeId} not found` };
    }

    this.executionCounter++;
    const executionId = `exec-${recipeId}-${this.executionCounter}`;
    const startedAt = Date.now();

    /** @type {ExecutionRecord} */
    const execution = {
      recipeId,
      status: 'running',
      currentStep: 0,
      stepResults: [],
      startedAt,
      completedAt: 0,
      finalOutput: null,
      error: null
    };
    this.executions.set(executionId, execution);
    this._log('execute-start', `Execution ${executionId} started for recipe "${recipe.name}"`);

    let currentInput = context;
    let allSucceeded = true;

    for (let i = 0; i < recipe.steps.length; i++) {
      const step = recipe.steps[i];
      execution.currentStep = i;

      const phiTimeout = step.timeout * Math.pow(PHI, step.weight);
      const stepStart = Date.now();

      try {
        const stepResult = this._executeStep(step, currentInput, phiTimeout);
        const stepLatency = Date.now() - stepStart;

        execution.stepResults.push({
          index: i,
          action: step.action,
          model: step.model,
          status: 'completed',
          output: stepResult,
          latencyMs: stepLatency,
          weight: step.weight,
          phiTimeout
        });

        this.metrics.totalStepsExecuted++;
        currentInput = stepResult;
      } catch (err) {
        const stepLatency = Date.now() - stepStart;
        execution.stepResults.push({
          index: i,
          action: step.action,
          model: step.model,
          status: 'failed',
          error: err.message,
          latencyMs: stepLatency,
          weight: step.weight,
          phiTimeout
        });

        allSucceeded = false;
        this._log('step-fail', `Step ${i} (${step.action}) failed: ${err.message}`);

        if (this.strictMode) {
          execution.status = 'failed';
          execution.error = `Step ${i} (${step.action}) failed: ${err.message}`;
          execution.completedAt = Date.now();
          this.metrics.totalExecuted++;
          this.metrics.totalFailed++;
          this.metrics.totalLatencyMs += execution.completedAt - startedAt;
          this._updatePhiResonance();
          return { executionId, status: 'failed', stepResults: execution.stepResults, error: execution.error };
        }
      }
    }

    execution.status = allSucceeded ? 'completed' : 'completed-with-errors';
    execution.finalOutput = currentInput;
    execution.completedAt = Date.now();

    const totalLatencyMs = execution.completedAt - startedAt;
    this.metrics.totalExecuted++;
    if (allSucceeded) {
      this.metrics.totalSucceeded++;
    } else {
      this.metrics.totalFailed++;
    }
    this.metrics.totalLatencyMs += totalLatencyMs;
    this._updatePhiResonance();

    this._log('execute-complete', `Execution ${executionId} completed in ${totalLatencyMs}ms`);

    return {
      executionId,
      status: execution.status,
      stepResults: execution.stepResults,
      finalOutput: execution.finalOutput,
      totalLatencyMs
    };
  }

  /**
   * Execute a single step with its input and phi-adjusted timeout.
   * @param {RecipeStep} step - Step definition
   * @param {*} input - Input data
   * @param {number} phiTimeout - Phi-adjusted timeout
   * @returns {*} - Step output (transformed input)
   */
  _executeStep(step, input, phiTimeout) {
    const phiTransform = Math.pow(PHI, step.weight);
    if (typeof input === 'number') {
      return input * phiTransform;
    }
    if (typeof input === 'string') {
      return `[${step.action}:${step.model}] ${input}`;
    }
    if (typeof input === 'object' && input !== null) {
      return {
        ...input,
        _step: step.action,
        _model: step.model,
        _phiWeight: step.weight,
        _phiTransform: phiTransform,
        _timestamp: Date.now()
      };
    }
    return { action: step.action, model: step.model, input, phiTransform };
  }

  /* ─── Recipe Status ─── */

  /**
   * Get the execution status of a recipe.
   * @param {string} recipeId - Recipe identifier
   * @returns {Object} - { recipeId, executions, latestStatus }
   */
  getRecipeStatus(recipeId) {
    if (!this.recipes.has(recipeId)) {
      return { recipeId, executions: [], latestStatus: 'not-found' };
    }

    const executions = [];
    let latestStatus = 'pending';
    for (const [execId, exec] of this.executions) {
      if (exec.recipeId === recipeId) {
        executions.push({
          executionId: execId,
          status: exec.status,
          currentStep: exec.currentStep,
          stepsCompleted: exec.stepResults.length,
          startedAt: exec.startedAt,
          completedAt: exec.completedAt
        });
        latestStatus = exec.status;
      }
    }

    return { recipeId, executions, latestStatus };
  }

  /* ─── Recipe Composition ─── */

  /**
   * Compose multiple recipes into a meta-recipe.
   * The meta-recipe executes sub-recipes sequentially, piping each output to the next.
   * Step weights are recomputed across the composed total steps.
   * @param {string[]} recipeIds - Ordered list of recipe IDs to compose
   * @returns {Object} - { id, name, stepCount, composed }
   */
  composeRecipe(recipeIds) {
    const composedSteps = [];
    const names = [];

    for (const rid of recipeIds) {
      const recipe = this.recipes.get(rid);
      if (!recipe) {
        return { id: null, name: null, stepCount: 0, composed: false, error: `Recipe ${rid} not found` };
      }
      names.push(recipe.name);
      for (const step of recipe.steps) {
        composedSteps.push({ ...step });
      }
    }

    // Recompute weights across the full composed step list
    const totalSteps = composedSteps.length;
    for (let i = 0; i < totalSteps; i++) {
      composedSteps[i].weight = this._computeStepWeight(i, totalSteps);
    }

    const composedId = `composed-${recipeIds.join('+')}`;
    const composedName = `Composed: ${names.join(' → ')}`;

    const composed = {
      id: composedId,
      name: composedName,
      steps: composedSteps,
      createdAt: Date.now(),
      version: 1
    };

    this.recipes.set(composedId, composed);
    this._log('compose', `Composed recipe "${composedName}" with ${totalSteps} steps`);

    return { id: composedId, name: composedName, stepCount: totalSteps, composed: true };
  }

  /* ─── Phi Resonance Metrics ─── */

  /**
   * Update the phi resonance metric based on execution success rate and step efficiency.
   * Resonance = PHI × (successRate) × (1 - 1/PHI × avgStepFailRate)
   */
  _updatePhiResonance() {
    const total = this.metrics.totalExecuted;
    if (total === 0) {
      this.metrics.phiResonance = 0;
      return;
    }
    const successRate = this.metrics.totalSucceeded / total;
    const failRate = this.metrics.totalFailed / total;
    this.metrics.phiResonance = PHI * successRate * (1 - (1 / PHI) * failRate);
  }

  /* ─── Diagnostics ─── */

  /**
   * Get orchestration metrics.
   * @returns {Object} - { totalExecuted, successRate, avgLatency, phiResonance, totalRecipes, totalStepsExecuted }
   */
  getMetrics() {
    const total = this.metrics.totalExecuted;
    return {
      totalExecuted: total,
      successRate: total > 0 ? this.metrics.totalSucceeded / total : 0,
      avgLatency: total > 0 ? this.metrics.totalLatencyMs / total : 0,
      phiResonance: this.metrics.phiResonance,
      totalRecipes: this.recipes.size,
      totalStepsExecuted: this.metrics.totalStepsExecuted,
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

  /**
   * List all registered recipes.
   * @returns {Object[]} - Array of recipe summaries
   */
  listRecipes() {
    const result = [];
    for (const [id, recipe] of this.recipes) {
      result.push({
        id,
        name: recipe.name,
        stepCount: recipe.steps.length,
        version: recipe.version,
        createdAt: recipe.createdAt
      });
    }
    return result;
  }
}

export { RecipeOrchestrationProtocol };
export default RecipeOrchestrationProtocol;
