import { CognitiveReturnScorer } from './cognitive-return-scorer.js';

/**
 * Benchmark Harness — runs tokenomic vs. non-tokenomic comparisons.
 * 
 * Score = DQ + ACT + RISK + REUSE + ACCURACY − WASTE
 * TokenomicGain = (Score_B / Tokens_B) − (Score_A / Tokens_A)
 * 
 * If System B gives equal or better score with fewer tokens, Tokenomics is working.
 */
export class BenchmarkHarness {
  constructor(config = {}) {
    this.taskTypes = config.taskTypes ?? [
      'invoice', 'estimating', 'cashflow', 'research',
      'architecture', 'red-team', 'memory'
    ];
    this._runs = [];
    this._scorer = new CognitiveReturnScorer();
  }

  /**
   * Run a single benchmark comparison.
   * @param {object} params
   * @param {string} params.taskType — category of task
   * @param {string} params.description — what was the task
   * @param {object} params.systemA — { scores: {...}, tokens: number } (non-tokenomic)
   * @param {object} params.systemB — { scores: {...}, tokens: number } (tokenomic)
   * @returns {object} benchmark result
   */
  run(params) {
    const { taskType, description, systemA, systemB } = params;

    if (!taskType) throw new Error('taskType is required');
    if (!systemA || !systemB) throw new Error('Both systemA and systemB are required');

    const comparison = this._scorer.compare(
      systemA.scores, systemA.tokens,
      systemB.scores, systemB.tokens
    );

    const result = {
      taskType,
      description: description ?? '',
      systemA: { tokens: systemA.tokens, ...comparison.systemA },
      systemB: { tokens: systemB.tokens, ...comparison.systemB },
      tokenomicGain: comparison.tokenomicGain,
      isImprovement: comparison.isImprovement,
      percentImprovement: comparison.percentImprovement,
      tokensSaved: systemA.tokens - systemB.tokens,
      verdict: comparison.isImprovement ? 'TOKENOMICS_WINS' : 'BASELINE_WINS',
      timestamp: Date.now()
    };

    this._runs.push(result);
    return result;
  }

  /**
   * Run a batch of benchmarks.
   */
  runBatch(benchmarks) {
    return benchmarks.map(b => this.run(b));
  }

  /**
   * Get aggregate results across all runs.
   */
  getSummary() {
    if (this._runs.length === 0) return { runs: 0 };

    const wins = this._runs.filter(r => r.isImprovement).length;
    const avgGain = this._runs.reduce((sum, r) => sum + r.tokenomicGain, 0) / this._runs.length;
    const avgTokensSaved = this._runs.reduce((sum, r) => sum + r.tokensSaved, 0) / this._runs.length;

    const byType = {};
    for (const run of this._runs) {
      if (!byType[run.taskType]) byType[run.taskType] = { wins: 0, total: 0, gains: [] };
      byType[run.taskType].total += 1;
      if (run.isImprovement) byType[run.taskType].wins += 1;
      byType[run.taskType].gains.push(run.tokenomicGain);
    }

    return {
      runs: this._runs.length,
      tokenomicWins: wins,
      winRate: wins / this._runs.length,
      averageGain: avgGain,
      averageTokensSaved: Math.round(avgTokensSaved),
      byTaskType: byType
    };
  }

  /**
   * Get all run results.
   */
  getHistory() {
    return [...this._runs];
  }

  /**
   * Reset the harness.
   */
  reset() {
    this._runs = [];
    this._scorer.reset();
  }
}
