import crypto from 'node:crypto';

/**
 * Token Governor — controls max token budget by task type.
 * Sets budget caps and enforces allocation limits per task classification.
 */
export class TokenGovernor {
  constructor(config = {}) {
    this.defaultBudget = config.defaultBudget ?? 1000;
    this.taskBudgets = new Map(Object.entries(config.taskBudgets ?? {
      invoice: 400,
      estimating: 600,
      cashflow: 500,
      research: 1200,
      architecture: 1000,
      'red-team': 800,
      memory: 300
    }));
    this._allocations = new Map();
  }

  /**
   * Get the token budget for a given task type.
   */
  getBudget(taskType) {
    return this.taskBudgets.get(taskType) ?? this.defaultBudget;
  }

  /**
   * Set a custom budget for a task type.
   */
  setBudget(taskType, budget) {
    if (typeof budget !== 'number' || budget <= 0) {
      throw new Error('Budget must be a positive number');
    }
    this.taskBudgets.set(taskType, budget);
  }

  /**
   * Allocate tokens for a specific task instance.
   * Returns an allocation record with remaining budget tracking.
   */
  allocate(taskType, taskId) {
    const id = taskId ?? crypto.randomUUID();
    const budget = this.getBudget(taskType);
    const allocation = {
      allocationId: id,
      taskType,
      totalBudget: budget,
      spent: 0,
      remaining: budget,
      status: 'active',
      createdAt: Date.now()
    };
    this._allocations.set(id, allocation);
    return { ...allocation };
  }

  /**
   * Spend tokens against an allocation.
   * Returns updated allocation or throws if budget exceeded.
   */
  spend(allocationId, tokens) {
    const alloc = this._allocations.get(allocationId);
    if (!alloc) throw new Error(`Allocation ${allocationId} not found`);
    if (alloc.status !== 'active') throw new Error(`Allocation ${allocationId} is ${alloc.status}`);
    if (tokens > alloc.remaining) {
      alloc.status = 'exceeded';
      throw new Error(`Budget exceeded: tried to spend ${tokens}, remaining ${alloc.remaining}`);
    }
    alloc.spent += tokens;
    alloc.remaining -= tokens;
    if (alloc.remaining === 0) alloc.status = 'exhausted';
    return { ...alloc };
  }

  /**
   * Close an allocation and return final state.
   */
  close(allocationId) {
    const alloc = this._allocations.get(allocationId);
    if (!alloc) throw new Error(`Allocation ${allocationId} not found`);
    alloc.status = 'closed';
    return {
      ...alloc,
      efficiency: alloc.spent > 0 ? alloc.spent / alloc.totalBudget : 0
    };
  }

  /**
   * Get all registered task types and their budgets.
   */
  getTaskTypes() {
    return Object.fromEntries(this.taskBudgets);
  }
}
