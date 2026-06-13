import { TokenGovernor } from './token-governor.js';
import { SalienceEngine } from './salience-engine.js';
import { CognitiveReturnScorer } from './cognitive-return-scorer.js';
import { CompressionAuditor } from './compression-auditor.js';
import { WasteDetector } from './waste-detector.js';
import { ReuseExtractor } from './reuse-extractor.js';
import { TokenValueFunction } from './token-value-function.js';

/**
 * Measurement Loop — runtime orchestrator for the 11-step tokenomic evaluation cycle.
 *
 * 1.  Classify the task
 * 2.  Estimate task risk and complexity
 * 3.  Rank salience targets
 * 4.  Allocate token budget
 * 5.  Recruit only necessary modules or agents
 * 6.  Generate the response or artifact
 * 7.  Audit compression quality
 * 8.  Score cognitive return
 * 9.  Detect wasted tokens
 * 10. Extract reusable rules or memory
 * 11. Update future token allocation policy
 *
 * Each step is invocable individually or the full loop can be run end-to-end.
 */
export class MeasurementLoop {
  constructor(config = {}) {
    this.governor = config.governor ?? new TokenGovernor(config.governorConfig);
    this.salience = config.salience ?? new SalienceEngine(config.salienceConfig);
    this.scorer = config.scorer ?? new CognitiveReturnScorer(config.scorerConfig);
    this.auditor = config.auditor ?? new CompressionAuditor(config.auditorConfig);
    this.detector = config.detector ?? new WasteDetector(config.detectorConfig);
    this.extractor = config.extractor ?? new ReuseExtractor(config.extractorConfig);
    this.tvf = config.tvf ?? new TokenValueFunction(config.tvfConfig);

    this._runs = [];
    this._policyUpdates = [];
  }

  /**
   * Step 1: Classify the task.
   * @param {object} task — { description, type?, context? }
   * @returns {object} classification result
   */
  classify(task) {
    if (!task || !task.description) throw new Error('task.description is required');

    const taskType = task.type ?? 'general';
    const classification = {
      step: 1,
      taskType,
      description: task.description,
      context: task.context ?? null,
      timestamp: Date.now()
    };
    return classification;
  }

  /**
   * Step 2: Estimate task risk and complexity.
   * @param {object} params — { taskType, factors: { stakes, ambiguity, dependencies, novelty } }
   * @returns {object} risk/complexity estimate
   */
  estimateRisk(params) {
    const { taskType, factors } = params;
    const stakes = Math.min(5, Math.max(0, factors?.stakes ?? 2));
    const ambiguity = Math.min(5, Math.max(0, factors?.ambiguity ?? 2));
    const dependencies = Math.min(5, Math.max(0, factors?.dependencies ?? 1));
    const novelty = Math.min(5, Math.max(0, factors?.novelty ?? 2));

    const riskScore = (stakes * 1.5 + ambiguity + dependencies * 0.8 + novelty) / 4;
    const complexity = (ambiguity + dependencies + novelty) / 3;

    return {
      step: 2,
      taskType,
      factors: { stakes, ambiguity, dependencies, novelty },
      riskScore,
      complexity,
      riskLevel: riskScore >= 4 ? 'critical' : riskScore >= 2.5 ? 'moderate' : 'low',
      timestamp: Date.now()
    };
  }

  /**
   * Step 3: Rank salience targets.
   * @param {Array<object>} items — salience items with urgency, risk, mission, etc.
   * @param {number} totalBudget
   * @returns {object} ranked items with budgets
   */
  rankSalience(items, totalBudget) {
    const allocated = this.salience.allocate(items, totalBudget);
    return {
      step: 3,
      items: allocated,
      totalBudget,
      topPriority: allocated.length > 0 ? allocated[0] : null,
      timestamp: Date.now()
    };
  }

  /**
   * Step 4: Allocate token budget.
   * @param {string} taskType
   * @param {string} [taskId]
   * @returns {object} allocation
   */
  allocateBudget(taskType, taskId) {
    const allocation = this.governor.allocate(taskType, taskId);
    return {
      step: 4,
      allocation,
      timestamp: Date.now()
    };
  }

  /**
   * Step 5: Recruit only necessary modules.
   * @param {object} params — { taskType, riskLevel, complexity }
   * @returns {object} module recruitment plan
   */
  recruitModules(params) {
    const { taskType, riskLevel, complexity } = params;

    const modules = ['token-governor', 'salience-engine', 'cognitive-return-scorer'];

    if (riskLevel === 'critical' || riskLevel === 'moderate') {
      modules.push('waste-detector');
    }
    if (complexity >= 2) {
      modules.push('compression-auditor');
    }
    if (taskType === 'memory' || taskType === 'research' || taskType === 'architecture') {
      modules.push('reuse-extractor');
    }

    return {
      step: 5,
      taskType,
      riskLevel,
      complexity,
      recruitedModules: modules,
      moduleCount: modules.length,
      timestamp: Date.now()
    };
  }

  /**
   * Step 7: Audit compression quality.
   * @param {object} params — { originalTokens, compressedTokens, informationRetained, actionClarity, riskPreserved }
   * @returns {object} audit result
   */
  auditCompression(params) {
    const audit = this.auditor.audit(params);
    return { step: 7, ...audit };
  }

  /**
   * Step 8: Score cognitive return.
   * @param {object} scores — dimension scores
   * @param {number} totalTokens
   * @returns {object} cognitive return score
   */
  scoreCognitiveReturn(scores, totalTokens) {
    const result = this.scorer.score(scores, totalTokens);
    return { step: 8, ...result };
  }

  /**
   * Step 9: Detect wasted tokens.
   * @param {object} params — { totalTokens, findings }
   * @returns {object} waste detection
   */
  detectWaste(params) {
    const result = this.detector.detect(params);
    return { step: 9, ...result };
  }

  /**
   * Step 10: Extract reusable rules or memory.
   * @param {object} params — { content, type, source, reuseScore, tags }
   * @returns {object} extraction result
   */
  extractReuse(params) {
    const result = this.extractor.extract(params);
    return { step: 10, ...result };
  }

  /**
   * Step 11: Update future token allocation policy.
   * @param {object} params — { taskType, crpt, wasteRatio, compressionPassed }
   * @returns {object} policy update
   */
  updatePolicy(params) {
    const { taskType, crpt, wasteRatio, compressionPassed } = params;
    const currentBudget = this.governor.getBudget(taskType);
    let newBudget = currentBudget;
    let action = 'no-change';

    if (wasteRatio > 0.4) {
      newBudget = Math.round(currentBudget * 0.85);
      action = 'reduce';
    } else if (crpt > 0.05 && compressionPassed === false) {
      newBudget = Math.round(currentBudget * 1.1);
      action = 'increase';
    }

    if (newBudget !== currentBudget && newBudget > 50) {
      this.governor.setBudget(taskType, newBudget);
    }

    const update = {
      step: 11,
      taskType,
      previousBudget: currentBudget,
      newBudget: newBudget > 50 ? newBudget : currentBudget,
      action,
      reason: action === 'reduce' ? 'High waste ratio' : action === 'increase' ? 'Good CRPT but failed compression' : 'Metrics acceptable',
      timestamp: Date.now()
    };

    this._policyUpdates.push(update);
    return update;
  }

  /**
   * Run the full 11-step measurement loop.
   * Steps 5–6 are advisory (generation happens externally).
   *
   * @param {object} params — full loop parameters
   * @param {object} params.task — { description, type, context }
   * @param {object} params.riskFactors — { stakes, ambiguity, dependencies, novelty }
   * @param {Array<object>} params.salienceItems — items to rank
   * @param {object} params.output — { originalTokens, compressedTokens, informationRetained, actionClarity, riskPreserved }
   * @param {object} params.scores — { decisionQuality, actionability, riskControl, reuseValue, learningGain, waste }
   * @param {number} params.totalTokens — tokens used for CR scoring
   * @param {object} params.wasteFindings — { findings: [...] }
   * @param {object} [params.reuseCandidate] — { content, type, source, reuseScore, tags }
   * @returns {object} full loop result
   */
  run(params) {
    const { task, riskFactors, salienceItems, output, scores, totalTokens, wasteFindings, reuseCandidate } = params;

    // Step 1: Classify
    const classification = this.classify(task);

    // Step 2: Estimate risk
    const riskEstimate = this.estimateRisk({
      taskType: classification.taskType,
      factors: riskFactors
    });

    // Step 3: Rank salience
    const budget = this.governor.getBudget(classification.taskType);
    const salienceRanking = this.rankSalience(salienceItems ?? [], budget);

    // Step 4: Allocate budget
    const allocation = this.allocateBudget(classification.taskType);

    // Step 5: Recruit modules
    const recruitment = this.recruitModules({
      taskType: classification.taskType,
      riskLevel: riskEstimate.riskLevel,
      complexity: riskEstimate.complexity
    });

    // Step 6: Generate (external — not modeled here)
    const generation = { step: 6, status: 'external', note: 'Generation happens outside the measurement loop' };

    // Step 7: Audit compression
    let compressionAudit = null;
    if (output && output.originalTokens && output.compressedTokens) {
      compressionAudit = this.auditCompression(output);
    }

    // Step 8: Score cognitive return
    const crScore = this.scoreCognitiveReturn(scores, totalTokens);

    // Step 9: Detect waste
    let wasteDetection = null;
    if (wasteFindings && wasteFindings.findings) {
      wasteDetection = this.detectWaste({
        totalTokens,
        findings: wasteFindings.findings
      });
    }

    // Step 10: Extract reuse
    let reuseResult = null;
    if (reuseCandidate && reuseCandidate.content) {
      reuseResult = this.extractReuse(reuseCandidate);
    }

    // Step 11: Update policy
    const policyUpdate = this.updatePolicy({
      taskType: classification.taskType,
      crpt: crScore.crpt,
      wasteRatio: wasteDetection?.wasteRatio ?? 0,
      compressionPassed: compressionAudit?.passed ?? true
    });

    const fullResult = {
      classification,
      riskEstimate,
      salienceRanking,
      allocation,
      recruitment,
      generation,
      compressionAudit,
      cognitiveReturn: crScore,
      wasteDetection,
      reuseExtraction: reuseResult,
      policyUpdate,
      summary: {
        taskType: classification.taskType,
        crpt: crScore.crpt,
        tokenValue: crScore.tokenValue,
        wasteRatio: wasteDetection?.wasteRatio ?? 0,
        compressionPassed: compressionAudit?.passed ?? null,
        budgetAction: policyUpdate.action,
        modulesRecruited: recruitment.moduleCount
      },
      timestamp: Date.now()
    };

    this._runs.push(fullResult);
    return fullResult;
  }

  /**
   * Get all loop run history.
   */
  getHistory() {
    return [...this._runs];
  }

  /**
   * Get policy update history.
   */
  getPolicyHistory() {
    return [...this._policyUpdates];
  }

  /**
   * Get aggregate statistics across all runs.
   */
  getStats() {
    if (this._runs.length === 0) return { runs: 0 };

    const avgCrpt = this._runs.reduce((s, r) => s + r.summary.crpt, 0) / this._runs.length;
    const avgWaste = this._runs.reduce((s, r) => s + r.summary.wasteRatio, 0) / this._runs.length;
    const policyChanges = this._policyUpdates.filter(p => p.action !== 'no-change').length;

    return {
      runs: this._runs.length,
      averageCRPT: avgCrpt,
      averageWasteRatio: avgWaste,
      policyChanges,
      runsPerType: this._runs.reduce((acc, r) => {
        acc[r.summary.taskType] = (acc[r.summary.taskType] ?? 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Reset all state.
   */
  reset() {
    this._runs = [];
    this._policyUpdates = [];
    this.scorer.reset();
  }
}
