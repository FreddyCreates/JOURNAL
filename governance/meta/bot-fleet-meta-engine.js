/**
 * META ENGINE - BOT FLEET MONITOR
 * Watches governance cycles, tracks patterns, proposes optimizations
 * Integrates with BotGovernanceIntegrator for continuous learning
 */

import AtlasRegistry from '../../atlas/registry/index.js';

export class BotFleetMetaEngine {
  constructor() {
    this.registry = AtlasRegistry;

    // Statistics tracking
    this.lawStats = new Map();         // law_id → { triggered, blocked, escalated }
    this.pipelineStats = new Map();    // pipeline_id → { runs, success, failed, avg_duration }
    this.botStats = new Map();         // bot_id → { cycles, escalations, human_overrides }
    this.escalationPatterns = [];     // Pattern history for learning
    this.humanOverrides = [];         // Track human decision overrides

    // Learning parameters
    this.learningEnabled = true;
    this.proposalThreshold = 10;      // Minimum pattern occurrences before proposal

    // Proposal queue
    this.proposals = [];
  }

  /**
   * Record governance cycle completion
   */
  recordCycle(cycle) {
    const botId = cycle.event.entity_id;

    // Update bot statistics
    if (!this.botStats.has(botId)) {
      this.botStats.set(botId, {
        cycles: 0,
        escalations: 0,
        human_overrides: 0,
        total_duration_ms: 0,
        avg_duration_ms: 0,
        risk_scores: [],
        decisions_made: 0
      });
    }

    const stats = this.botStats.get(botId);
    stats.cycles += 1;
    stats.escalations += cycle.escalated ? 1 : 0;
    stats.total_duration_ms += (cycle.endTime - cycle.startTime);
    stats.avg_duration_ms = stats.total_duration_ms / stats.cycles;
    stats.risk_scores.push(cycle.stages.route_escalations?.risk_score || 0);
    stats.decisions_made += cycle.stages.apply_laws?.decisions.length || 0;

    // Update law statistics
    if (cycle.stages.apply_laws?.decisions) {
      for (const decision of cycle.stages.apply_laws.decisions) {
        this.recordLawTrigger(decision);
      }
    }

    // Track escalation patterns
    if (cycle.escalated) {
      this.escalationPatterns.push({
        bot_id: botId,
        risk_score: cycle.stages.route_escalations.risk_score,
        decisions: cycle.stages.apply_laws.decisions,
        context: cycle.event.context,
        timestamp: cycle.endTime
      });
    }

    // Check for learning opportunities
    if (this.learningEnabled) {
      this.detectPatterns();
    }
  }

  /**
   * Record law trigger
   */
  recordLawTrigger(decision) {
    const lawId = decision.law_id;

    if (!this.lawStats.has(lawId)) {
      this.lawStats.set(lawId, {
        triggered: 0,
        forbid_count: 0,
        require_count: 0,
        permit_count: 0,
        critical_count: 0,
        escalations: 0,
        bots_affected: new Set()
      });
    }

    const stats = this.lawStats.get(lawId);
    stats.triggered += 1;

    if (decision.action === 'FORBID') stats.forbid_count += 1;
    if (decision.action === 'REQUIRE') stats.require_count += 1;
    if (decision.action === 'PERMIT') stats.permit_count += 1;
    if (decision.severity === 'CRITICAL') stats.critical_count += 1;
    if (decision.escalation) stats.escalations += 1;
  }

  /**
   * Record human override of bot decision
   */
  recordHumanOverride(override) {
    this.humanOverrides.push({
      bot_id: override.bot_id,
      cycle_id: override.cycle_id,
      original_decision: override.original_decision,
      human_decision: override.human_decision,
      rationale: override.rationale,
      operator: override.operator,
      timestamp: Date.now()
    });

    // Update bot stats
    const stats = this.botStats.get(override.bot_id);
    if (stats) {
      stats.human_overrides += 1;
    }

    // Learn from override
    this.learnFromOverride(override);
  }

  /**
   * Detect patterns in escalations and propose optimizations
   */
  detectPatterns() {
    // Pattern 1: Frequent escalations for same law
    for (const [lawId, stats] of this.lawStats.entries()) {
      if (stats.escalations > this.proposalThreshold) {
        this.proposeOptimization({
          type: 'LAW_TOO_STRICT',
          law_id: lawId,
          evidence: `Law ${lawId} has triggered ${stats.escalations} escalations`,
          suggestion: `Consider adjusting thresholds or adding PERMIT clauses`,
          confidence: 0.8,
          timestamp: Date.now()
        });
      }
    }

    // Pattern 2: Bot consistently escalates
    for (const [botId, stats] of this.botStats.entries()) {
      const escalationRate = stats.cycles > 0 ? stats.escalations / stats.cycles : 0;

      if (escalationRate > 0.5 && stats.cycles > 5) {
        this.proposeOptimization({
          type: 'BOT_HIGH_ESCALATION',
          bot_id: botId,
          evidence: `Bot ${botId} escalates ${(escalationRate * 100).toFixed(1)}% of cycles`,
          suggestion: `Review bot constraints or operational patterns`,
          confidence: 0.75,
          timestamp: Date.now()
        });
      }
    }

    // Pattern 3: Frequent human overrides indicate misalignment
    if (this.humanOverrides.length > this.proposalThreshold) {
      const recentOverrides = this.humanOverrides.slice(-20);
      const overridePatterns = this.groupBy(recentOverrides, 'bot_id');

      for (const [botId, overrides] of Object.entries(overridePatterns)) {
        if (overrides.length > 3) {
          this.proposeOptimization({
            type: 'FREQUENT_HUMAN_OVERRIDE',
            bot_id: botId,
            evidence: `${overrides.length} recent human overrides for bot ${botId}`,
            suggestion: `Review and adjust governance laws for this bot`,
            confidence: 0.85,
            timestamp: Date.now()
          });
        }
      }
    }
  }

  /**
   * Learn from human override
   */
  learnFromOverride(override) {
    // Meta learning: When humans consistently override,
    // it suggests laws need adjustment

    const pattern = {
      bot_id: override.bot_id,
      decision_type: override.original_decision.action,
      law_id: override.original_decision.law_id,
      human_chose: override.human_decision,
      timestamp: Date.now()
    };

    // Check if this pattern repeats
    const similar = this.humanOverrides.filter(h =>
      h.bot_id === override.bot_id &&
      h.original_decision.law_id === override.original_decision.law_id
    );

    if (similar.length >= 3) {
      this.proposeOptimization({
        type: 'LAW_ADJUSTMENT_NEEDED',
        law_id: override.original_decision.law_id,
        bot_id: override.bot_id,
        evidence: `Humans have overridden this law ${similar.length} times`,
        suggestion: `Consider revising ${override.original_decision.law_id} to align with human judgment`,
        confidence: 0.9,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Propose optimization
   */
  proposeOptimization(proposal) {
    // Check if proposal already exists
    const exists = this.proposals.some(p =>
      p.type === proposal.type &&
      p.law_id === proposal.law_id &&
      p.bot_id === proposal.bot_id
    );

    if (!exists) {
      this.proposals.push(proposal);
    }
  }

  /**
   * Get law statistics report
   */
  getLawReport() {
    const report = [];

    for (const [lawId, stats] of this.lawStats.entries()) {
      report.push({
        law_id: lawId,
        triggered: stats.triggered,
        forbid_count: stats.forbid_count,
        require_count: stats.require_count,
        critical_count: stats.critical_count,
        escalations: stats.escalations,
        escalation_rate: stats.triggered > 0 ? stats.escalations / stats.triggered : 0
      });
    }

    return report.sort((a, b) => b.triggered - a.triggered);
  }

  /**
   * Get bot fleet health report
   */
  getFleetHealthReport() {
    const report = {
      total_bots: this.botStats.size,
      total_cycles: 0,
      total_escalations: 0,
      total_overrides: this.humanOverrides.length,
      avg_risk_score: 0,
      bots: []
    };

    let totalRiskScores = 0;
    let riskScoreCount = 0;

    for (const [botId, stats] of this.botStats.entries()) {
      report.total_cycles += stats.cycles;
      report.total_escalations += stats.escalations;

      const avgRisk = stats.risk_scores.length > 0
        ? stats.risk_scores.reduce((a, b) => a + b, 0) / stats.risk_scores.length
        : 0;

      totalRiskScores += avgRisk;
      riskScoreCount += 1;

      report.bots.push({
        bot_id: botId,
        cycles: stats.cycles,
        escalations: stats.escalations,
        escalation_rate: stats.cycles > 0 ? stats.escalations / stats.cycles : 0,
        human_overrides: stats.human_overrides,
        avg_duration_ms: stats.avg_duration_ms,
        avg_risk_score: avgRisk
      });
    }

    report.avg_risk_score = riskScoreCount > 0 ? totalRiskScores / riskScoreCount : 0;
    report.bots.sort((a, b) => b.escalation_rate - a.escalation_rate);

    return report;
  }

  /**
   * Get pending proposals
   */
  getProposals() {
    return this.proposals.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get human override history
   */
  getOverrideHistory(filters = {}) {
    let overrides = [...this.humanOverrides];

    if (filters.bot_id) {
      overrides = overrides.filter(o => o.bot_id === filters.bot_id);
    }

    if (filters.law_id) {
      overrides = overrides.filter(o =>
        o.original_decision.law_id === filters.law_id
      );
    }

    if (filters.since) {
      overrides = overrides.filter(o => o.timestamp >= filters.since);
    }

    return overrides.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get escalation pattern analysis
   */
  getEscalationAnalysis() {
    const analysis = {
      total_escalations: this.escalationPatterns.length,
      by_bot: {},
      by_risk_level: {
        high: 0,    // > 0.7
        medium: 0,  // 0.4 - 0.7
        low: 0      // < 0.4
      },
      common_triggers: new Map()
    };

    for (const pattern of this.escalationPatterns) {
      // Group by bot
      if (!analysis.by_bot[pattern.bot_id]) {
        analysis.by_bot[pattern.bot_id] = 0;
      }
      analysis.by_bot[pattern.bot_id] += 1;

      // Group by risk level
      if (pattern.risk_score > 0.7) analysis.by_risk_level.high += 1;
      else if (pattern.risk_score > 0.4) analysis.by_risk_level.medium += 1;
      else analysis.by_risk_level.low += 1;

      // Track common triggers
      for (const decision of pattern.decisions) {
        const key = `${decision.law_id}:${decision.action}`;
        const count = analysis.common_triggers.get(key) || 0;
        analysis.common_triggers.set(key, count + 1);
      }
    }

    // Convert common triggers to array
    analysis.common_triggers = Array.from(analysis.common_triggers.entries())
      .map(([key, count]) => ({ trigger: key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return analysis;
  }

  /**
   * Helper: Group array by key
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  }

  /**
   * Reset all statistics (for testing)
   */
  reset() {
    this.lawStats.clear();
    this.pipelineStats.clear();
    this.botStats.clear();
    this.escalationPatterns = [];
    this.humanOverrides = [];
    this.proposals = [];
  }
}

export default BotFleetMetaEngine;
