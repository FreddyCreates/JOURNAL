/**
 * BOT FLEET GOVERNANCE - COMPLETE INTEGRATION EXAMPLE
 * Demonstrates the full governance cycle from bot event → law evaluation →
 * escalation → human override → meta learning
 */

import { BotGovernanceIntegrator } from '../runtime/bot-governance-integrator.js';
import BotFleetMetaEngine from '../meta/bot-fleet-meta-engine.js';
import { HumanFeedbackRecorder } from '../feedback/human-feedback-schema.js';
import { exampleSecurityScan, exampleReleaseBlocked } from '../events/bot-event-schema.js';
import AtlasRegistry from '../../atlas/registry/index.js';

/**
 * Initialize the governance system
 */
async function initializeGovernanceSystem() {
  console.log('🚀 Initializing Bot Fleet Governance System\n');

  const integrator = new BotGovernanceIntegrator();
  const metaEngine = new BotFleetMetaEngine();
  const feedbackRecorder = new HumanFeedbackRecorder();

  // Load bot registry
  AtlasRegistry.loadEntities();

  console.log('✅ Governance System Initialized');
  console.log(`   - Atlas Registry: ${AtlasRegistry.getAllEntities().length} bots loaded`);
  console.log(`   - Meta Engine: Active`);
  console.log(`   - Feedback System: Active\n`);

  return { integrator, metaEngine, feedbackRecorder };
}

/**
 * Example 1: Security Scan with Secret Detection
 * Bot blocks merge, escalates to human, human approves with mitigation
 */
async function exampleSecretDetection(integrator, metaEngine, feedbackRecorder) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 EXAMPLE 1: Secret Detection & Human Override');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Step 1: Bot event triggers
  console.log('1️⃣  Bot Event: organism-sentinel-bot completes security scan');
  console.log('   Findings: secret_leak, api_key_exposed');
  console.log('   Risk Score: 0.95\n');

  const cycle = await integrator.processEvent(exampleSecurityScan);

  console.log('2️⃣  CPL-L Laws Applied:');
  console.log(`   Law: BLOCK_SECRETS`);
  console.log(`   Action: FORBID merge`);
  console.log(`   Severity: CRITICAL`);
  console.log(`   Escalated: ${cycle.escalated}\n`);

  // Step 2: Meta Engine records
  metaEngine.recordCycle(cycle);

  console.log('3️⃣  Meta Engine recorded governance cycle');
  console.log(`   Cycle ID: ${cycle.id}`);
  console.log(`   Duration: ${cycle.endTime - cycle.startTime}ms\n`);

  // Step 3: Human reviews and overrides
  console.log('4️⃣  Human Review: human://freddy');
  console.log('   Decision: APPROVE (with mitigation)');
  console.log('   Rationale: Secret already rotated, commit amended\n');

  const override = {
    override_id: `override-${Date.now()}`,
    timestamp: Date.now(),
    operator: 'human://freddy',
    bot_id: exampleSecurityScan.entity_id,
    cycle_id: cycle.id,
    event_id: exampleSecurityScan.event_id,
    original_decision: cycle.stages.apply_laws.decisions[0],
    human_decision: {
      action: 'APPROVE',
      approved_despite_forbid: true,
      rationale: 'Secret was test API key, already rotated. Commit has been amended to remove exposure.',
      confidence: 0.95,
      notes: 'Added pre-commit hook to prevent future occurrences'
    },
    context: {
      urgency: 'HIGH',
      business_justification: 'Critical feature needed for release',
      mitigations_applied: [
        'Secret rotated',
        'Commit amended',
        'Pre-commit hook installed'
      ],
      reviewed_by: ['human://freddy', 'human://security_team'],
      approval_chain: ['security_team', 'freddy']
    },
    learning: {
      suggests_law_adjustment: false,
      pattern_identified: false,
      false_positive: false,
      false_negative: false
    }
  };

  feedbackRecorder.recordOverride(override);
  metaEngine.recordHumanOverride(override);

  console.log('5️⃣  Override recorded in feedback system');
  console.log(`   Override ID: ${override.override_id}`);
  console.log(`   Meta Engine learning enabled\n`);

  return { cycle, override };
}

/**
 * Example 2: Release Blocked on Red Health
 * Bot blocks release, human approves with justification
 */
async function exampleReleaseOnRed(integrator, metaEngine, feedbackRecorder) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 EXAMPLE 2: Release Blocked on Red & Human Approval');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1️⃣  Bot Event: organism-release-bot attempts release');
  console.log('   Health: RED (4 test failures)');
  console.log('   Risk Score: 0.75\n');

  const cycle = await integrator.processEvent(exampleReleaseBlocked);

  console.log('2️⃣  CPL-L Laws Applied:');
  console.log(`   Law: NO_RELEASE_ON_RED`);
  console.log(`   Action: FORBID release`);
  console.log(`   Severity: CRITICAL`);
  console.log(`   Escalated: ${cycle.escalated}\n`);

  metaEngine.recordCycle(cycle);

  console.log('3️⃣  Meta Engine recorded governance cycle\n');

  // Human override
  console.log('4️⃣  Human Review: human://freddy');
  console.log('   Decision: APPROVE');
  console.log('   Rationale: Test failures in experimental features only\n');

  const override = {
    override_id: `override-${Date.now()}`,
    timestamp: Date.now(),
    operator: 'human://freddy',
    bot_id: exampleReleaseBlocked.entity_id,
    cycle_id: cycle.id,
    event_id: exampleReleaseBlocked.event_id,
    original_decision: cycle.stages.apply_laws.decisions[0],
    human_decision: {
      action: 'APPROVE',
      approved_despite_forbid: true,
      rationale: 'Test failures are in non-critical experimental features. Core functionality is stable. Hotfix urgently needed.',
      confidence: 0.9,
      notes: 'Disabled experimental features via feature flags. Will fix in follow-up.'
    },
    context: {
      urgency: 'IMMEDIATE',
      business_justification: 'Production critical bug affecting users',
      mitigations_applied: [
        'Disabled experimental features',
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

  feedbackRecorder.recordOverride(override);
  metaEngine.recordHumanOverride(override);

  console.log('5️⃣  Override recorded - suggests law adjustment\n');

  return { cycle, override };
}

/**
 * Generate governance system report
 */
function generateReport(metaEngine, feedbackRecorder) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 GOVERNANCE SYSTEM REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Law statistics
  console.log('📜 Law Statistics:');
  const lawReport = metaEngine.getLawReport();
  lawReport.forEach(law => {
    console.log(`   ${law.law_id}:`);
    console.log(`      Triggered: ${law.triggered}`);
    console.log(`      FORBID actions: ${law.forbid_count}`);
    console.log(`      Escalations: ${law.escalations}`);
    console.log(`      Escalation rate: ${(law.escalation_rate * 100).toFixed(1)}%`);
  });
  console.log();

  // Fleet health
  console.log('🏥 Fleet Health:');
  const health = metaEngine.getFleetHealthReport();
  console.log(`   Total Cycles: ${health.total_cycles}`);
  console.log(`   Total Escalations: ${health.total_escalations}`);
  console.log(`   Total Overrides: ${health.total_overrides}`);
  console.log(`   Avg Risk Score: ${health.avg_risk_score.toFixed(2)}`);
  console.log();

  console.log('🤖 Bot Performance:');
  health.bots.forEach(bot => {
    console.log(`   ${bot.bot_id}:`);
    console.log(`      Cycles: ${bot.cycles}`);
    console.log(`      Escalation Rate: ${(bot.escalation_rate * 100).toFixed(1)}%`);
    console.log(`      Human Overrides: ${bot.human_overrides}`);
  });
  console.log();

  // Proposals
  console.log('💡 Meta Engine Proposals:');
  const proposals = metaEngine.getProposals();
  if (proposals.length === 0) {
    console.log('   No proposals yet (need more data)\n');
  } else {
    proposals.forEach(p => {
      console.log(`   [${p.confidence}] ${p.type}`);
      console.log(`      ${p.suggestion}`);
      console.log(`      Evidence: ${p.evidence}`);
    });
    console.log();
  }

  // Feedback statistics
  console.log('👥 Human Feedback:');
  const feedbackStats = feedbackRecorder.getStatistics();
  console.log(`   Total Overrides: ${feedbackStats.total_overrides}`);
  console.log(`   Approved Despite FORBID: ${feedbackStats.approved_despite_forbid}`);
  console.log(`   Suggests Adjustment: ${feedbackStats.suggests_adjustment}`);
  console.log(`   False Positives: ${feedbackStats.false_positives}`);
  console.log(`   False Negatives: ${feedbackStats.false_negatives}`);
  console.log();

  // Atlas Registry summary
  console.log('🗺️  Atlas Registry:');
  const fleetSummary = AtlasRegistry.getFleetSummary();
  console.log(`   Total Bots: ${fleetSummary.total_bots}`);
  console.log(`   Languages Used: ${fleetSummary.languages_used}`);
  console.log(`   Unique Capabilities: ${fleetSummary.unique_capabilities}`);
  console.log(`   Criticality:`);
  console.log(`      Critical: ${fleetSummary.criticality_breakdown.critical}`);
  console.log(`      High: ${fleetSummary.criticality_breakdown.high}`);
  console.log(`      Medium: ${fleetSummary.criticality_breakdown.medium}`);
  console.log(`      Low: ${fleetSummary.criticality_breakdown.low}`);
  console.log();
}

/**
 * Main execution
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   BOT FLEET GOVERNANCE - INTEGRATION DEMONSTRATION    ║');
  console.log('║   Medina Sovereign Intelligence                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Initialize
  const { integrator, metaEngine, feedbackRecorder } = await initializeGovernanceSystem();

  // Run examples
  await exampleSecretDetection(integrator, metaEngine, feedbackRecorder);
  await exampleReleaseOnRed(integrator, metaEngine, feedbackRecorder);

  // Generate report
  generateReport(metaEngine, feedbackRecorder);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Governance Integration Complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎯 Next Steps:');
  console.log('   1. Wire GitHub Actions to emit bot events');
  console.log('   2. Connect governance integrator to CI/CD workflows');
  console.log('   3. Set up human review dashboard');
  console.log('   4. Enable Meta Engine continuous learning');
  console.log('   5. Create alerts for high-risk escalations\n');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  initializeGovernanceSystem,
  exampleSecretDetection,
  exampleReleaseOnRed,
  generateReport
};
