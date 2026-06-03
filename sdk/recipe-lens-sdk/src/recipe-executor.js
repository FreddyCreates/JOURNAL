import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {'pending' | 'running' | 'paused' | 'completed' | 'failed'} ExecutionStatus
 */

/**
 * @typedef {Object} StepResult
 * @property {string} stepId - Step identifier
 * @property {ExecutionStatus} status - Step execution status
 * @property {unknown} output - Step output data
 * @property {number} startedAt - Start timestamp
 * @property {number} completedAt - Completion timestamp
 * @property {number} duration - Execution duration in ms
 * @property {number} attempt - Retry attempt number
 * @property {string|null} error - Error message if failed
 */

/**
 * @typedef {Object} ExecutionState
 * @property {string} executionId - Unique execution identifier
 * @property {string} recipeId - Recipe being executed
 * @property {ExecutionStatus} status - Overall execution status
 * @property {number} currentStepIndex - Index of current step
 * @property {StepResult[]} log - Step-by-step execution log
 * @property {Record<string, unknown>} context - Execution context/state
 * @property {number} startedAt - Execution start timestamp
 * @property {number|null} completedAt - Execution completion timestamp
 */

/**
 * RecipeExecutor — Executes recipes step-by-step with state tracking and error recovery.
 *
 * Manages execution lifecycle including pause/resume capabilities and
 * phi-weighted timeout escalation for intelligent retry behavior.
 * Each execution maintains its own isolated state and context.
 */
export class RecipeExecutor {
  /** @type {Map<string, ExecutionState>} */
  #executions;

  /** @type {Map<string, Function>} */
  #actionHandlers;

  constructor() {
    this.#executions = new Map();
    this.#actionHandlers = new Map();
  }

  /**
   * Registers an action handler for a named action.
   * @param {string} actionName - Action name to handle
   * @param {Function} handler - Async function(context, config) => result
   */
  registerHandler(actionName, handler) {
    this.#actionHandlers.set(actionName, handler);
  }

  /**
   * Executes a full recipe with the given context.
   * @param {import('./recipe-builder.js').Recipe} recipe - Recipe to execute
   * @param {Record<string, unknown>} [context={}] - Initial execution context
   * @returns {Promise<ExecutionState>} Final execution state
   */
  async execute(recipe, context = {}) {
    const executionId = crypto.randomUUID();
    /** @type {ExecutionState} */
    const state = {
      executionId,
      recipeId: recipe.recipeId,
      status: 'running',
      currentStepIndex: 0,
      log: [],
      context: { ...context },
      startedAt: Date.now(),
      completedAt: null,
    };

    this.#executions.set(executionId, state);

    try {
      for (let i = 0; i < recipe.steps.length; i++) {
        if (state.status === 'paused') {
          await this.#waitForResume(executionId);
        }
        if (state.status === 'failed') break;

        state.currentStepIndex = i;
        const step = recipe.steps[i];
        const result = await this.executeStep(step, state.context);
        state.log.push(result);

        if (result.status === 'failed') {
          state.status = 'failed';
          break;
        }

        if (result.output !== undefined) {
          state.context[step.stepId] = result.output;
        }
      }

      if (state.status === 'running') {
        state.status = 'completed';
      }
    } catch (err) {
      state.status = 'failed';
      state.log.push({
        stepId: '__executor_error',
        status: 'failed',
        output: null,
        startedAt: Date.now(),
        completedAt: Date.now(),
        duration: 0,
        attempt: 0,
        error: err.message,
      });
    }

    state.completedAt = Date.now();
    return state;
  }

  /**
   * Executes a single recipe step with phi-weighted retry escalation.
   * @param {import('./recipe-builder.js').RecipeStep} step - Step to execute
   * @param {Record<string, unknown>} context - Current execution context
   * @returns {Promise<StepResult>} Step execution result
   */
  async executeStep(step, context) {
    const startedAt = Date.now();
    const maxRetries = step.config?.retries || 0;
    const baseTimeout = step.config?.timeout || 5000;
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const timeout = baseTimeout * Math.pow(PHI, attempt);
        const output = await this.#runAction(step, context, timeout);
        const completedAt = Date.now();

        return {
          stepId: step.stepId,
          status: 'completed',
          output,
          startedAt,
          completedAt,
          duration: completedAt - startedAt,
          attempt,
          error: null,
        };
      } catch (err) {
        lastError = err;
        const backoff = Math.pow(PHI, attempt + 1) * 100;
        await this.#sleep(backoff);
      }
    }

    const completedAt = Date.now();
    return {
      stepId: step.stepId,
      status: 'failed',
      output: null,
      startedAt,
      completedAt,
      duration: completedAt - startedAt,
      attempt: maxRetries,
      error: lastError?.message || 'Unknown error',
    };
  }

  /**
   * Pauses an active execution.
   * @param {string} executionId - Execution to pause
   * @returns {boolean} True if successfully paused
   */
  pause(executionId) {
    const state = this.#executions.get(executionId);
    if (!state || state.status !== 'running') return false;
    state.status = 'paused';
    return true;
  }

  /**
   * Resumes a paused execution.
   * @param {string} executionId - Execution to resume
   * @returns {boolean} True if successfully resumed
   */
  resume(executionId) {
    const state = this.#executions.get(executionId);
    if (!state || state.status !== 'paused') return false;
    state.status = 'running';
    return true;
  }

  /**
   * Returns execution progress information.
   * @param {string} executionId - Execution to query
   * @returns {{ percentComplete: number, currentStep: string|null, status: ExecutionStatus }|null}
   */
  getProgress(executionId) {
    const state = this.#executions.get(executionId);
    if (!state) return null;

    const totalSteps = state.log.length + (state.status === 'running' ? 1 : 0);
    const completedSteps = state.log.filter(l => l.status === 'completed').length;
    const percentComplete = totalSteps > 0
      ? Math.round((completedSteps / Math.max(totalSteps, 1)) * 100 * PHI) / PHI
      : 0;

    return {
      percentComplete: Math.min(percentComplete, 100),
      currentStep: state.log.length > 0 ? state.log[state.log.length - 1].stepId : null,
      status: state.status,
    };
  }

  /**
   * Returns the step-by-step execution log.
   * @param {string} executionId - Execution to query
   * @returns {StepResult[]|null} Execution log or null if not found
   */
  getExecutionLog(executionId) {
    const state = this.#executions.get(executionId);
    return state ? [...state.log] : null;
  }

  /**
   * Runs an action step through the registered handler.
   * @param {import('./recipe-builder.js').RecipeStep} step
   * @param {Record<string, unknown>} context
   * @param {number} timeout
   * @returns {Promise<unknown>}
   */
  async #runAction(step, context, timeout) {
    if (step.type === 'conditional') {
      return this.#evaluateConditional(step, context);
    }

    const handler = this.#actionHandlers.get(step.action);
    if (!handler) {
      return { action: step.action, status: 'no_handler', stepId: step.stepId };
    }

    const result = await Promise.race([
      handler(context, step.config),
      this.#sleep(timeout).then(() => {
        throw new Error(`Step "${step.stepId}" timed out after ${timeout}ms`);
      }),
    ]);

    return result;
  }

  /**
   * Evaluates a conditional step.
   * @param {import('./recipe-builder.js').RecipeStep} step
   * @param {Record<string, unknown>} context
   * @returns {{ branch: string, selectedSteps: string[] }}
   */
  #evaluateConditional(step, context) {
    const conditionMet = Boolean(context[step.condition]);
    return {
      branch: conditionMet ? 'if' : 'else',
      selectedSteps: conditionMet ? step.ifSteps : step.elseSteps,
    };
  }

  /**
   * Waits for an execution to resume from paused state.
   * @param {string} executionId
   * @returns {Promise<void>}
   */
  async #waitForResume(executionId) {
    while (true) {
      const state = this.#executions.get(executionId);
      if (!state || state.status !== 'paused') break;
      await this.#sleep(100);
    }
  }

  /**
   * Async sleep utility.
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default RecipeExecutor;
