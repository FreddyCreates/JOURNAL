/**
 * HUMAN FEEDBACK SCHEMA
 * Records human overrides of bot decisions
 * Feeds into Meta Engine for governance law refinement
 */

/**
 * Human Override Event Schema
 * Triggered when a human operator overrides a bot decision
 */
export const HumanOverrideSchema = {
  // Override metadata
  override_id: 'string',           // unique override identifier
  timestamp: 'number',             // Unix timestamp
  operator: 'string',              // human://freddy or human://operator_name

  // Bot and cycle context
  bot_id: 'string',                // atlas://bot/<bot-name>
  cycle_id: 'string',              // governance cycle ID
  event_id: 'string',              // original bot event ID

  // Original bot decision
  original_decision: {
    law_id: 'string',              // CPL-L law that triggered
    rule: 'string',                // specific rule within law
    action: 'string',              // FORBID | REQUIRE | PERMIT
    target: 'string',              // what was affected (merge, release, deploy)
    severity: 'string',            // CRITICAL | HIGH | MEDIUM | LOW
    message: 'string',             // bot's reasoning
    risk_score: 'number'           // calculated risk 0.0 to 1.0
  },

  // Human decision
  human_decision: {
    action: 'string',              // APPROVE | REJECT | MODIFY | DEFER
    approved_despite_forbid: 'boolean', // true if human approved blocked action
    rationale: 'string',           // human's reasoning
    confidence: 'number',          // human's confidence 0.0 to 1.0
    notes: 'string'                // additional context
  },

  // Context
  context: {
    urgency: 'string',             // IMMEDIATE | HIGH | NORMAL | LOW
    business_justification: 'string',
    mitigations_applied: 'array',  // compensating controls
    reviewed_by: 'array',          // ['human://freddy', 'human://engineer']
    approval_chain: 'array'        // approval hierarchy
  },

  // Learning flags
  learning: {
    suggests_law_adjustment: 'boolean',
    pattern_identified: 'boolean',
    false_positive: 'boolean',     // bot was overly cautious
    false_negative: 'boolean'      // bot missed something
  }
};

/**
 * Example: Human Approves Blocked Release
 */
export const exampleApproveBlockedRelease = {
  override_id: 'override-2026-05-03-001',
  timestamp: Date.now(),
  operator: 'human://freddy',

  bot_id: 'atlas://bot/organism-release-bot',
  cycle_id: 'cycle-1714762800000-atlas://bot/organism-release-bot',
  event_id: 'evt-2026-05-03-003',

  original_decision: {
    law_id: 'NO_RELEASE_ON_RED',
    rule: 'health_dashboard_check',
    action: 'FORBID',
    target: 'release',
    severity: 'CRITICAL',
    message: 'System health is RED. Release blocked until stability restored.',
    risk_score: 0.75
  },

  human_decision: {
    action: 'APPROVE',
    approved_despite_forbid: true,
    rationale: 'Test failures are in non-critical experimental features. Core functionality is stable. Hotfix is urgently needed for production issue.',
    confidence: 0.9,
    notes: 'Reviewed with team lead. Experimental features will be fixed in follow-up PR.'
  },

  context: {
    urgency: 'IMMEDIATE',
    business_justification: 'Production critical bug affecting users. Hotfix must ship now.',
    mitigations_applied: [
      'Disabled experimental features via feature flags',
      'Verified core tests pass',
      'Rollback plan prepared'
    ],
    reviewed_by: ['human://freddy', 'human://engineering_lead'],
    approval_chain: ['engineering_lead', 'freddy']
  },

  learning: {
    suggests_law_adjustment: true,
    pattern_identified: true,
    false_positive: true,
    false_negative: false
  }
};

/**
 * Example: Human Rejects Bot Approval
 */
export const exampleRejectBotApproval = {
  override_id: 'override-2026-05-03-002',
  timestamp: Date.now(),
  operator: 'human://security_team',

  bot_id: 'atlas://bot/organism-sentinel-bot',
  cycle_id: 'cycle-1714763000000-atlas://bot/organism-sentinel-bot',
  event_id: 'evt-2026-05-03-005',

  original_decision: {
    law_id: 'DEPENDENCY_SAFETY',
    rule: 'vulnerability_check',
    action: 'PERMIT',
    target: 'merge',
    severity: 'LOW',
    message: 'No vulnerabilities detected. Merge approved.',
    risk_score: 0.1
  },

  human_decision: {
    action: 'REJECT',
    approved_despite_forbid: false,
    rationale: 'Dependency from untrusted source. Bot missed supply chain risk. Requires security review.',
    confidence: 0.95,
    notes: 'Bot vulnerability scanner did not flag supply chain risk. Law needs enhancement.'
  },

  context: {
    urgency: 'NORMAL',
    business_justification: 'Security best practice',
    mitigations_applied: [],
    reviewed_by: ['human://security_team'],
    approval_chain: ['security_team']
  },

  learning: {
    suggests_law_adjustment: true,
    pattern_identified: true,
    false_positive: false,
    false_negative: true
  }
};

/**
 * Example: Human Modifies Bot Decision
 */
export const exampleModifyDecision = {
  override_id: 'override-2026-05-03-003',
  timestamp: Date.now(),
  operator: 'human://freddy',

  bot_id: 'atlas://bot/organism-deploy-bot',
  cycle_id: 'cycle-1714763200000-atlas://bot/organism-deploy-bot',
  event_id: 'evt-2026-05-03-004',

  original_decision: {
    law_id: 'HIGH_RISK_DEPLOYMENT',
    rule: 'production_deployment_guard',
    action: 'REQUIRE',
    target: 'senior_approval',
    severity: 'HIGH',
    message: 'High risk deployment requires senior engineer approval.',
    risk_score: 0.85
  },

  human_decision: {
    action: 'MODIFY',
    approved_despite_forbid: false,
    rationale: 'Risk assessment too high. Deployment is canary with instant rollback. Reducing approval requirement.',
    confidence: 0.8,
    notes: 'Changed from senior approval to team lead approval. Canary deployment with 5% traffic.'
  },

  context: {
    urgency: 'HIGH',
    business_justification: 'Canary deployment reduces risk significantly',
    mitigations_applied: [
      'Canary deployment to 5% of traffic',
      'Automatic rollback on error rate increase',
      'Health monitoring dashboard active'
    ],
    reviewed_by: ['human://freddy', 'human://team_lead'],
    approval_chain: ['team_lead', 'freddy']
  },

  learning: {
    suggests_law_adjustment: true,
    pattern_identified: true,
    false_positive: true,
    false_negative: false
  }
};

/**
 * Human Feedback Recording API
 */
export class HumanFeedbackRecorder {
  constructor() {
    this.overrides = [];
    this.feedbackLog = [];
  }

  /**
   * Record human override
   */
  recordOverride(override) {
    // Validate schema
    if (!override.override_id || !override.bot_id || !override.original_decision || !override.human_decision) {
      throw new Error('Invalid override schema');
    }

    this.overrides.push({
      ...override,
      recorded_at: Date.now()
    });

    return {
      success: true,
      override_id: override.override_id
    };
  }

  /**
   * Record general feedback on bot behavior
   */
  recordFeedback(feedback) {
    this.feedbackLog.push({
      ...feedback,
      timestamp: Date.now()
    });
  }

  /**
   * Get overrides by bot
   */
  getOverridesByBot(botId) {
    return this.overrides.filter(o => o.bot_id === botId);
  }

  /**
   * Get overrides by law
   */
  getOverridesByLaw(lawId) {
    return this.overrides.filter(o => o.original_decision.law_id === lawId);
  }

  /**
   * Get overrides suggesting law adjustments
   */
  getOverridesSuggestingAdjustment() {
    return this.overrides.filter(o => o.learning.suggests_law_adjustment);
  }

  /**
   * Get false positives (bot too strict)
   */
  getFalsePositives() {
    return this.overrides.filter(o => o.learning.false_positive);
  }

  /**
   * Get false negatives (bot missed something)
   */
  getFalseNegatives() {
    return this.overrides.filter(o => o.learning.false_negative);
  }

  /**
   * Get override statistics
   */
  getStatistics() {
    return {
      total_overrides: this.overrides.length,
      approved_despite_forbid: this.overrides.filter(o =>
        o.human_decision.approved_despite_forbid
      ).length,
      suggests_adjustment: this.overrides.filter(o =>
        o.learning.suggests_law_adjustment
      ).length,
      false_positives: this.getFalsePositives().length,
      false_negatives: this.getFalseNegatives().length,
      by_operator: this.groupBy(this.overrides, 'operator'),
      by_bot: this.groupBy(this.overrides, 'bot_id')
    };
  }

  /**
   * Helper: Group by key
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = 0;
      result[group] += 1;
      return result;
    }, {});
  }

  /**
   * Get all overrides
   */
  getAllOverrides() {
    return this.overrides;
  }

  /**
   * Clear all overrides (for testing)
   */
  clear() {
    this.overrides = [];
    this.feedbackLog = [];
  }
}

export default {
  HumanOverrideSchema,
  exampleApproveBlockedRelease,
  exampleRejectBotApproval,
  exampleModifyDecision,
  HumanFeedbackRecorder
};
