import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {'action' | 'conditional' | 'parallel'} StepType
 */

/**
 * @typedef {Object} StepConfig
 * @property {string} [model] - AI model identifier
 * @property {number} [timeout] - Timeout in milliseconds
 * @property {number} [retries] - Number of retry attempts
 * @property {Record<string, string>} [inputMap] - Input field mappings
 * @property {Record<string, string>} [outputMap] - Output field mappings
 */

/**
 * @typedef {Object} RecipeStep
 * @property {string} stepId - Unique step identifier
 * @property {StepType} type - Step type
 * @property {string} [action] - Action name for action steps
 * @property {StepConfig} [config] - Step configuration
 * @property {string} [condition] - Condition expression for conditional steps
 * @property {string[]} [ifSteps] - Steps to execute if condition is true
 * @property {string[]} [elseSteps] - Steps to execute if condition is false
 * @property {string[]} [parallelStepIds] - Step IDs for parallel execution
 * @property {number} estimatedDuration - Phi-weighted estimated duration
 */

/**
 * @typedef {Object} Recipe
 * @property {string} recipeId - Unique recipe identifier
 * @property {string} name - Human-readable recipe name
 * @property {RecipeStep[]} steps - Ordered list of recipe steps
 * @property {number} totalSteps - Total number of steps
 * @property {number} estimatedDuration - Phi-weighted total estimated duration
 * @property {number} complexityScore - Phi-weighted complexity score
 * @property {number} createdAt - Creation timestamp
 * @property {string[]} tags - Recipe tags
 */

/**
 * RecipeBuilder — Fluent builder for constructing multi-step AI workflow recipes.
 *
 * Provides a chainable API for assembling recipe steps including actions,
 * conditional branches, and parallel execution groups. All timing estimates
 * use phi-weighted calculations for natural scaling.
 */
export class RecipeBuilder {
  /** @type {string|null} */
  #recipeId;

  /** @type {string|null} */
  #name;

  /** @type {RecipeStep[]} */
  #steps;

  /** @type {string[]} */
  #tags;

  /** @type {Set<string>} */
  #stepIds;

  /** @type {Set<string>} */
  #parallelGroups;

  constructor() {
    this.#recipeId = null;
    this.#name = null;
    this.#steps = [];
    this.#tags = [];
    this.#stepIds = new Set();
    this.#parallelGroups = new Set();
  }

  /**
   * Starts building a new recipe.
   * @param {string} recipeId - Unique recipe identifier
   * @param {string} name - Human-readable recipe name
   * @returns {RecipeBuilder} This builder for chaining
   */
  create(recipeId, name) {
    this.#recipeId = recipeId;
    this.#name = name;
    this.#steps = [];
    this.#tags = [];
    this.#stepIds = new Set();
    this.#parallelGroups = new Set();
    return this;
  }

  /**
   * Adds a workflow step to the recipe.
   * @param {string} stepId - Unique step identifier
   * @param {string} action - Action name to execute
   * @param {StepConfig} [config={}] - Step configuration
   * @returns {RecipeBuilder} This builder for chaining
   */
  addStep(stepId, action, config = {}) {
    if (this.#stepIds.has(stepId)) {
      throw new Error(`Duplicate step ID: ${stepId}`);
    }
    const baseTimeout = config.timeout || 5000;
    const retries = config.retries || 0;
    const estimatedDuration = baseTimeout * Math.pow(PHI, retries * 0.5);

    /** @type {RecipeStep} */
    const step = {
      stepId,
      type: 'action',
      action,
      config: {
        model: config.model || null,
        timeout: baseTimeout,
        retries,
        inputMap: config.inputMap || {},
        outputMap: config.outputMap || {},
      },
      estimatedDuration,
    };

    this.#steps.push(step);
    this.#stepIds.add(stepId);
    return this;
  }

  /**
   * Adds a conditional branching step.
   * @param {string} condition - Condition expression to evaluate
   * @param {string[]} ifSteps - Step IDs to execute when condition is true
   * @param {string[]} elseSteps - Step IDs to execute when condition is false
   * @returns {RecipeBuilder} This builder for chaining
   */
  addConditional(condition, ifSteps, elseSteps) {
    const condId = `cond_${crypto.randomUUID().slice(0, 8)}`;
    const branchCount = ifSteps.length + elseSteps.length;
    const estimatedDuration = branchCount * 1000 * Math.pow(PHI, 0.25);

    /** @type {RecipeStep} */
    const step = {
      stepId: condId,
      type: 'conditional',
      condition,
      ifSteps: [...ifSteps],
      elseSteps: [...elseSteps],
      estimatedDuration,
    };

    this.#steps.push(step);
    this.#stepIds.add(condId);
    return this;
  }

  /**
   * Marks a group of steps for parallel execution.
   * @param {string[]} stepIds - Step IDs to execute in parallel
   * @returns {RecipeBuilder} This builder for chaining
   */
  addParallel(stepIds) {
    const parallelId = `par_${crypto.randomUUID().slice(0, 8)}`;
    const maxDuration = stepIds.reduce((max, id) => {
      const step = this.#steps.find(s => s.stepId === id);
      return step ? Math.max(max, step.estimatedDuration) : max;
    }, 0);

    /** @type {RecipeStep} */
    const step = {
      stepId: parallelId,
      type: 'parallel',
      parallelStepIds: [...stepIds],
      estimatedDuration: maxDuration * (1 / PHI),
    };

    this.#steps.push(step);
    this.#stepIds.add(parallelId);
    stepIds.forEach(id => this.#parallelGroups.add(id));
    return this;
  }

  /**
   * Validates recipe integrity checking for dangling references and valid flow.
   * @returns {{ valid: boolean, errors: string[] }} Validation result
   */
  validate() {
    const errors = [];
    if (!this.#recipeId) errors.push('Recipe ID is required');
    if (!this.#name) errors.push('Recipe name is required');
    if (this.#steps.length === 0) errors.push('Recipe must have at least one step');

    for (const step of this.#steps) {
      if (step.type === 'conditional') {
        for (const ref of [...(step.ifSteps || []), ...(step.elseSteps || [])]) {
          if (!this.#stepIds.has(ref)) {
            errors.push(`Conditional step "${step.stepId}" references unknown step "${ref}"`);
          }
        }
      }
      if (step.type === 'parallel') {
        for (const ref of step.parallelStepIds || []) {
          if (!this.#stepIds.has(ref)) {
            errors.push(`Parallel group "${step.stepId}" references unknown step "${ref}"`);
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Finalizes and returns the recipe object with phi-weighted timing.
   * @returns {Recipe} The completed recipe
   * @throws {Error} If recipe validation fails
   */
  build() {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Invalid recipe: ${validation.errors.join('; ')}`);
    }

    const totalSteps = this.#steps.length;
    const estimatedDuration = this.#steps.reduce((sum, s) => sum + s.estimatedDuration, 0);
    const conditionalCount = this.#steps.filter(s => s.type === 'conditional').length;
    const parallelCount = this.#steps.filter(s => s.type === 'parallel').length;
    const complexityScore = (totalSteps * PHI) + (conditionalCount * PHI * PHI) + (parallelCount * PHI * PHI * PHI);

    return {
      recipeId: this.#recipeId,
      name: this.#name,
      steps: [...this.#steps],
      totalSteps,
      estimatedDuration,
      complexityScore: Math.round(complexityScore * 1000) / 1000,
      createdAt: Date.now(),
      tags: [...this.#tags],
    };
  }
}

export default RecipeBuilder;
