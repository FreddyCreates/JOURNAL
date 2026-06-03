/**
 * BOT EVENT SCHEMA
 * Defines event structure for bot CI/CD operations
 * Feeds into CPL-L evaluator and CPL-P pipeline
 */

export const BotEventSchema = {
  // Event metadata
  entity_id: 'string',        // atlas://bot/<bot-name>
  event_id: 'string',         // unique event identifier
  timestamp: 'number',        // Unix timestamp
  op: 'string',              // operation type

  // Operation types
  operations: {
    ci_run_started: 'CI workflow initiated',
    ci_run_completed: 'CI workflow finished',
    build_succeeded: 'Build completed successfully',
    build_failed: 'Build failed',
    test_run_completed: 'Test suite finished',
    security_scan_completed: 'Security scan finished',
    deployment_started: 'Deployment initiated',
    deployment_completed: 'Deployment finished',
    dependency_update: 'Dependencies updated',
    release_created: 'Release tagged',
    human_override: 'Human overrode bot decision'
  },

  // Context object structure
  context: {
    // Build context
    status: 'string',          // success, failed, pending
    matrix: 'array',           // ['node18', 'node20', 'node22']
    failures: 'number',        // count of failures

    // Risk assessment
    risk_score: 'number',      // 0.0 to 1.0
    risk_factors: 'array',     // ['breaking_change', 'core_infrastructure']

    // Health dashboard
    health_dashboard: 'object', // { overall: 'red|yellow|green', ... }

    // Test results
    test_results: 'object',    // { total, passed, failed, flaky_count }
    test_coverage: 'number',   // 0.0 to 1.0

    // Security scan
    findings: 'array',         // ['secret_leak', 'vulnerability']
    scan_results: 'object',    // { vulnerabilities, suspicious_patterns }
    confidence: 'number',      // 0.0 to 1.0

    // Dependencies
    dependencies: 'object',    // { critical_vulnerabilities, days_behind_latest }

    // Changes
    changes: 'object',         // { files_changed, breaking_changes }

    // Deployment
    deployment: 'object',      // { target, canister_upgrade, rollback_plan }

    // Release
    release_type: 'string',    // 'major', 'minor', 'patch'

    // Metadata
    triggered_by: 'string',    // user or automated
    branch: 'string',          // git branch
    commit: 'string'           // git commit hash
  }
};

/**
 * Example Bot Event - CI Run Completed
 */
export const exampleCICompleted = {
  entity_id: 'atlas://bot/organism-test-bot',
  event_id: 'evt-2026-05-03-001',
  timestamp: Date.now(),
  op: 'ci_run_completed',

  context: {
    status: 'failed',
    matrix: ['node18', 'node20', 'node22'],
    failures: 3,
    risk_score: 0.8,
    health_dashboard: {
      overall: 'red',
      tests: 'red',
      security: 'green',
      dependencies: 'yellow'
    },
    test_results: {
      total: 494,
      passed: 491,
      failed: 3,
      flaky_count: 2
    },
    test_coverage: 0.85,
    findings: [],
    changes: {
      files_changed: 12,
      breaking_changes: 0
    },
    triggered_by: 'push',
    branch: 'main',
    commit: 'abc123def'
  }
};

/**
 * Example Bot Event - Security Scan with Secret Detection
 */
export const exampleSecurityScan = {
  entity_id: 'atlas://bot/organism-sentinel-bot',
  event_id: 'evt-2026-05-03-002',
  timestamp: Date.now(),
  op: 'security_scan_completed',

  context: {
    status: 'completed',
    risk_score: 0.95,
    health_dashboard: {
      overall: 'red',
      security: 'red'
    },
    findings: ['secret_leak', 'api_key_exposed'],
    scan_results: {
      vulnerabilities: 0,
      suspicious_patterns: 1,
      secrets_found: 2
    },
    confidence: 0.92,
    changes: {
      files_changed: 3,
      files_with_secrets: ['config/api.js']
    },
    triggered_by: 'push',
    branch: 'feature/api-integration',
    commit: 'xyz789abc'
  }
};

/**
 * Example Bot Event - Release Blocked on Red
 */
export const exampleReleaseBlocked = {
  entity_id: 'atlas://bot/organism-release-bot',
  event_id: 'evt-2026-05-03-003',
  timestamp: Date.now(),
  op: 'release_created',

  context: {
    status: 'blocked',
    risk_score: 0.75,
    health_dashboard: {
      overall: 'red',
      tests: 'red',
      security: 'green',
      dependencies: 'green'
    },
    test_results: {
      total: 494,
      passed: 490,
      failed: 4,
      flaky_count: 5
    },
    critical_test_failures: 4,
    security_scan_failed: false,
    test_coverage: 0.88,
    release_type: 'minor',
    changes: {
      breaking_changes: 0
    },
    triggered_by: 'tag:v2.1.0',
    branch: 'main',
    commit: 'release-commit-123'
  }
};

/**
 * Example Bot Event - High Risk Deployment
 */
export const exampleHighRiskDeployment = {
  entity_id: 'atlas://bot/organism-deploy-bot',
  event_id: 'evt-2026-05-03-004',
  timestamp: Date.now(),
  op: 'deployment_started',

  context: {
    status: 'pending_approval',
    risk_score: 0.85,
    health_dashboard: {
      overall: 'yellow'
    },
    deployment: {
      target: 'icp_mainnet',
      canister_upgrade: true,
      rollback_plan: null
    },
    review: {
      senior_approved: false
    },
    changes: {
      files_changed: 45,
      includes: ['core_infrastructure']
    },
    triggered_by: 'workflow_dispatch',
    branch: 'release/v3.0.0',
    commit: 'major-upgrade-abc'
  }
};

export default {
  BotEventSchema,
  exampleCICompleted,
  exampleSecurityScan,
  exampleReleaseBlocked,
  exampleHighRiskDeployment
};
