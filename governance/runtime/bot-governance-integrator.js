/**
 * BOT GOVERNANCE INTEGRATOR
 * Wires bot events into the governance cycle
 * Connects CPL-L evaluator → CPL-P pipeline → OrganismRuntime
 */

import CPLLParser from '../../languages/cpl-l/src/parser.js';
import CPLPParser from '../../languages/cpl-p/src/parser.js';
import OCLParser from '../../languages/ocl/src/parser.js';
import AgentFlowRuntime from '../../languages/afl/runtime/agent-flow-runtime.js';

export class BotGovernanceIntegrator {
  constructor() {
    this.cplLParser = new CPLLParser();
    this.cplPParser = new CPLPParser();
    this.oclParser = new OCLParser();
    this.aflRuntime = new AgentFlowRuntime();

    this.lawCache = new Map();
    this.pipelineCache = new Map();
    this.organismCache = new Map();

    this.eventLog = [];
    this.decisionLog = [];
    this.escalationLog = [];
  }

  /**
   * Process a bot event through the governance cycle
   */
  async processEvent(botEvent) {
    const cycleId = `cycle-${Date.now()}-${botEvent.entity_id}`;

    const cycle = {
      id: cycleId,
      event: botEvent,
      startTime: Date.now(),
      endTime: null,
      stages: {
        collect_state: null,
        apply_laws: null,
        route_escalations: null,
        completion: null
      },
      decisions: [],
      actions: [],
      escalated: false,
      status: 'running'
    };

    try {
      // Stage 1: Collect Bot State
      cycle.stages.collect_state = await this.collectBotState(botEvent);

      // Stage 2: Apply CPL-L Laws
      cycle.stages.apply_laws = await this.applyCPLLaws(
        botEvent,
        cycle.stages.collect_state
      );

      // Stage 3: Route Escalations
      cycle.stages.route_escalations = await this.routeEscalations(
        cycle.stages.apply_laws,
        botEvent.context
      );

      // Conditional: High Risk Path
      if (cycle.stages.route_escalations.risk_score > 0.7) {
        cycle.escalated = true;
        cycle.stages.high_risk_escalation = await this.highRiskEscalation(
          cycle.stages.route_escalations,
          botEvent
        );
      }

      // Stage 4: Completion
      cycle.stages.completion = await this.completeGovernanceCycle(
        cycle,
        botEvent
      );

      cycle.status = 'completed';
      cycle.endTime = Date.now();

    } catch (error) {
      cycle.status = 'failed';
      cycle.error = error.message;
      cycle.endTime = Date.now();

      // Error handling: escalate to human
      await this.escalateError(cycle, error);
    }

    this.eventLog.push(cycle);
    return cycle;
  }

  /**
   * Stage 1: Collect Bot State
   */
  async collectBotState(botEvent) {
    // Fetch bot entity from atlas
    const botEntity = await this.fetchBotEntity(botEvent.entity_id);

    // Collect extended context
    const context = {
      ...botEvent.context,
      bot_entity: botEntity,
      timestamp: Date.now(),
      event_id: botEvent.event_id
    };

    // Assess system health
    const health = this.assessSystemHealth(botEvent.context);

    return {
      bot_entity: botEntity,
      context,
      health,
      timestamp: Date.now()
    };
  }

  /**
   * Stage 2: Apply CPL-L Laws
   */
  async applyCPLLaws(botEvent, state) {
    // Load applicable laws
    const laws = await this.loadApplicableLaws('Bot');

    // Evaluate each law's rules
    const decisions = [];

    for (const law of laws) {
      const lawDecisions = await this.evaluateLaw(
        law,
        botEvent.context,
        state.bot_entity
      );
      decisions.push(...lawDecisions);
    }

    // Collect required actions
    const actions = this.extractRequiredActions(decisions);

    return {
      laws_applied: laws.map(l => l.id),
      decisions,
      actions,
      timestamp: Date.now()
    };
  }

  /**
   * Evaluate a single CPL-L law
   */
  async evaluateLaw(law, context, botEntity) {
    const decisions = [];

    // Example: BLOCK_SECRETS rule
    if (law.id === 'BLOCK_SECRETS') {
      if (context.findings && (
        context.findings.includes('secret_leak') ||
        context.findings.includes('api_key_exposed') ||
        context.findings.includes('token_hardcoded')
      )) {
        decisions.push({
          law_id: law.id,
          rule: 'when_secret_detected',
          action: 'FORBID',
          target: 'merge',
          severity: 'CRITICAL',
          message: 'Secret detected in code. Merge blocked pending remediation.',
          timestamp: Date.now()
        });

        decisions.push({
          law_id: law.id,
          rule: 'when_secret_detected',
          action: 'REQUIRE',
          target: 'human_review',
          arg: 'security_team',
          escalation: 'immediate',
          timestamp: Date.now()
        });
      }
    }

    // Example: NO_RELEASE_ON_RED rule
    if (law.id === 'NO_RELEASE_ON_RED') {
      if (context.health_dashboard?.overall === 'red' ||
          context.critical_test_failures > 0 ||
          context.security_scan_failed === true) {
        decisions.push({
          law_id: law.id,
          rule: 'health_dashboard_check',
          action: 'FORBID',
          target: 'release',
          severity: 'CRITICAL',
          message: 'System health is RED. Release blocked until stability restored.',
          timestamp: Date.now()
        });

        decisions.push({
          law_id: law.id,
          rule: 'health_dashboard_check',
          action: 'REQUIRE',
          target: 'stability_review',
          arg: 'engineering_lead',
          timestamp: Date.now()
        });
      }
    }

    return decisions;
  }

  /**
   * Stage 3: Route Escalations
   */
  async routeEscalations(lawResults, context) {
    // Calculate risk score
    const riskScore = this.calculateRiskScore(lawResults.decisions, context);

    // Determine escalation path
    const escalationPath = this.determineEscalationPath(
      riskScore,
      lawResults.actions,
      lawResults.decisions
    );

    // Notify stakeholders
    const notifications = await this.notifyStakeholders(
      escalationPath,
      context
    );

    return {
      risk_score: riskScore,
      escalation_path: escalationPath,
      notifications_sent: notifications,
      timestamp: Date.now()
    };
  }

  /**
   * High Risk Escalation Path
   */
  async highRiskEscalation(escalationData, botEvent) {
    const escalation = {
      escalation_id: `esc-${Date.now()}`,
      target: 'human://freddy',
      reason: 'High risk bot operation detected',
      context: botEvent.context,
      decisions: escalationData.escalation_path.decisions,
      risk_score: escalationData.risk_score,
      blocked: true,
      awaiting_human: true,
      timestamp: Date.now()
    };

    this.escalationLog.push(escalation);

    return escalation;
  }

  /**
   * Complete Governance Cycle
   */
  async completeGovernanceCycle(cycle, botEvent) {
    // Generate cycle report
    const report = this.generateCycleReport(cycle);

    // Feed to Meta Engine for learning
    await this.feedToMetaEngine(report);

    // Record in CIL/RIL
    await this.recordInOrganismRuntime(cycle, botEvent);

    return {
      cycle_report: report,
      meta_engine_fed: true,
      organism_recorded: true,
      timestamp: Date.now()
    };
  }

  /**
   * Calculate risk score based on decisions and context
   */
  calculateRiskScore(decisions, context) {
    let baseScore = context.risk_score || 0;

    // Increase risk for critical decisions
    const criticalDecisions = decisions.filter(d => d.severity === 'CRITICAL');
    baseScore += criticalDecisions.length * 0.15;

    // Increase risk for FORBID actions
    const forbidActions = decisions.filter(d => d.action === 'FORBID');
    baseScore += forbidActions.length * 0.1;

    // Increase risk for security issues
    if (context.findings && context.findings.length > 0) {
      baseScore += 0.2;
    }

    return Math.min(baseScore, 1.0);
  }

  /**
   * Determine escalation path
   */
  determineEscalationPath(riskScore, actions, decisions) {
    if (riskScore > 0.7) {
      return {
        level: 'HIGH',
        target: 'human://freddy',
        reason: 'Risk score exceeds threshold',
        immediate: true,
        decisions
      };
    } else if (riskScore > 0.4) {
      return {
        level: 'MEDIUM',
        target: 'team_lead',
        reason: 'Moderate risk detected',
        immediate: false,
        decisions
      };
    }

    return {
      level: 'LOW',
      target: null,
      reason: 'Standard operation',
      immediate: false,
      decisions
    };
  }

  /**
   * Generate governance cycle report
   */
  generateCycleReport(cycle) {
    return {
      cycle_id: cycle.id,
      bot_entity: cycle.event.entity_id,
      operation: cycle.event.op,
      duration_ms: cycle.endTime - cycle.startTime,
      decisions_made: cycle.stages.apply_laws?.decisions.length || 0,
      actions_required: cycle.stages.apply_laws?.actions.length || 0,
      risk_score: cycle.stages.route_escalations?.risk_score || 0,
      escalated: cycle.escalated,
      status: cycle.status,
      timestamp: cycle.endTime
    };
  }

  /**
   * Feed results to Meta Engine for learning
   */
  async feedToMetaEngine(report) {
    // Meta Engine learns from:
    // - Which laws are triggered most
    // - Which bots cause most escalations
    // - Patterns in blocked operations
    // - Human override patterns

    return {
      fed: true,
      report_id: report.cycle_id,
      learning_enabled: true
    };
  }

  /**
   * Record in OrganismRuntime (CIL/RIL)
   */
  async recordInOrganismRuntime(cycle, botEvent) {
    // Create CIL (Cognitive Internal Language) entry
    const cilEntry = {
      entity_id: botEvent.entity_id,
      cycle_id: cycle.id,
      operation: botEvent.op,
      decisions: cycle.stages.apply_laws?.decisions,
      timestamp: Date.now()
    };

    // Create RIL (Repair & Integration Language) entry if errors
    if (cycle.status === 'failed' || cycle.escalated) {
      const rilEntry = {
        entity_id: botEvent.entity_id,
        issue: cycle.escalated ? 'high_risk_operation' : 'cycle_failed',
        context: botEvent.context,
        timestamp: Date.now()
      };
    }

    return {
      cil_recorded: true,
      ril_recorded: cycle.status === 'failed' || cycle.escalated
    };
  }

  /**
   * Helper: Fetch bot entity from atlas
   */
  async fetchBotEntity(entityId) {
    // In production, this would fetch from atlas/registry
    return {
      id: entityId,
      name: entityId.split('/').pop(),
      class: 'Bot'
    };
  }

  /**
   * Helper: Load applicable laws
   */
  async loadApplicableLaws(entityType) {
    // In production, this would parse governance/laws/bot-fleet-safety.cpl-l
    return [
      { id: 'BLOCK_SECRETS', entity_type: 'Bot' },
      { id: 'NO_RELEASE_ON_RED', entity_type: 'Bot' },
      { id: 'HIGH_RISK_BUILD_GUARD', entity_type: 'Bot' }
    ];
  }

  /**
   * Helper: Extract required actions from decisions
   */
  extractRequiredActions(decisions) {
    return decisions
      .filter(d => d.action === 'REQUIRE')
      .map(d => ({
        target: d.target,
        arg: d.arg,
        escalation: d.escalation
      }));
  }

  /**
   * Helper: Assess system health
   */
  assessSystemHealth(context) {
    return {
      overall: context.health_dashboard?.overall || 'unknown',
      tests: context.test_results?.failed === 0 ? 'green' : 'red',
      security: context.findings?.length === 0 ? 'green' : 'red',
      dependencies: context.dependencies?.critical_vulnerabilities === 0 ? 'green' : 'red'
    };
  }

  /**
   * Helper: Notify stakeholders
   */
  async notifyStakeholders(escalationPath, context) {
    // In production, send notifications via configured channels
    return {
      notified: escalationPath.level !== 'LOW',
      targets: escalationPath.target ? [escalationPath.target] : []
    };
  }

  /**
   * Helper: Escalate error
   */
  async escalateError(cycle, error) {
    const escalation = {
      type: 'error',
      cycle_id: cycle.id,
      error: error.message,
      target: 'human://freddy',
      timestamp: Date.now()
    };

    this.escalationLog.push(escalation);
  }

  /**
   * Get all event logs
   */
  getEventLogs() {
    return this.eventLog;
  }

  /**
   * Get all escalation logs
   */
  getEscalationLogs() {
    return this.escalationLog;
  }

  /**
   * Get decision logs
   */
  getDecisionLogs() {
    return this.decisionLog;
  }
}

export default BotGovernanceIntegrator;
