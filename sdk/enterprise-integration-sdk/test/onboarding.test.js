/**
 * Enterprise Integration SDK - Onboarding Tests
 * Tests for CompanyOnboarding class across all three modes
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CompanyOnboarding } from '../src/onboarding.js';

// ════════════════════════════════════════════════════════════════════════════
// CONSTRUCTOR TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - Constructor initializes correctly', () => {
  const onboarding = new CompanyOnboarding();
  assert.ok(onboarding._sessions instanceof Map);
  assert.strictEqual(onboarding._sessions.size, 0);
});

// ════════════════════════════════════════════════════════════════════════════
// EXPRESS MODE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - Express mode requires minimal fields', () => {
  const onboarding = new CompanyOnboarding();
  const result = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com'
  }, 'express');
  
  assert.ok(result.sessionId);
  assert.strictEqual(result.mode, 'express');
  assert.strictEqual(result.steps.length, 3);
  assert.deepStrictEqual(result.steps, ['basic_info', 'api_credentials', 'confirmation']);
});

test('CompanyOnboarding - Express mode throws on missing companyName', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.beginOnboarding({ adminEmail: 'admin@test.com' }, 'express');
  }, /Missing required fields/);
});

test('CompanyOnboarding - Express mode throws on missing adminEmail', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.beginOnboarding({ companyName: 'Test Corp' }, 'express');
  }, /Missing required fields/);
});

// ════════════════════════════════════════════════════════════════════════════
// STANDARD MODE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - Standard mode requires full profile', () => {
  const onboarding = new CompanyOnboarding();
  const result = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com',
    industry: 'Tech',
    size: '50-100',
    address: '123 Main St'
  }, 'standard');
  
  assert.ok(result.sessionId);
  assert.strictEqual(result.mode, 'standard');
  assert.strictEqual(result.steps.length, 6);
});

test('CompanyOnboarding - Standard mode throws on missing industry', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.beginOnboarding({
      companyName: 'Test Corp',
      adminEmail: 'admin@test.com',
      size: '50-100',
      address: '123 Main St'
    }, 'standard');
  }, /Missing required fields.*industry/);
});

test('CompanyOnboarding - Default mode is standard', () => {
  const onboarding = new CompanyOnboarding();
  const result = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com',
    industry: 'Tech',
    size: '50-100',
    address: '123 Main St'
  });
  
  assert.strictEqual(result.mode, 'standard');
});

// ════════════════════════════════════════════════════════════════════════════
// SOVEREIGN MODE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - Sovereign mode requires doctrine alignment', () => {
  const onboarding = new CompanyOnboarding();
  const result = onboarding.beginOnboarding({
    companyName: 'Sovereign Corp',
    adminEmail: 'admin@sovereign.com',
    industry: 'AI',
    size: '100-500',
    address: '456 AI Blvd',
    doctrineAcceptance: true,
    jurisdictionId: 'ICP-001'
  }, 'sovereign');
  
  assert.ok(result.sessionId);
  assert.strictEqual(result.mode, 'sovereign');
  assert.strictEqual(result.steps.length, 8);
  assert.ok(result.steps.includes('doctrine_alignment'));
  assert.ok(result.steps.includes('sovereignty_audit'));
});

test('CompanyOnboarding - Sovereign mode throws on missing doctrine', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.beginOnboarding({
      companyName: 'Test Corp',
      adminEmail: 'admin@test.com',
      industry: 'Tech',
      size: '50-100',
      address: '123 Main St',
      jurisdictionId: 'ICP-001'
    }, 'sovereign');
  }, /doctrineAcceptance/);
});

// ════════════════════════════════════════════════════════════════════════════
// INVALID MODE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - Invalid mode throws error', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.beginOnboarding({
      companyName: 'Test Corp',
      adminEmail: 'admin@test.com'
    }, 'invalid-mode');
  }, /Invalid onboarding mode/);
});

// ════════════════════════════════════════════════════════════════════════════
// STEP COMPLETION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - completeStep marks step as completed', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId } = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com'
  }, 'express');
  
  const result = onboarding.completeStep(sessionId, 'basic_info', { verified: true });
  
  assert.strictEqual(result.sessionId, sessionId);
  assert.strictEqual(result.step, 'basic_info');
  assert.strictEqual(result.status, 'completed');
  assert.ok(result.remainingSteps.length < 3);
});

test('CompanyOnboarding - completeStep throws for invalid session', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.completeStep('invalid-session-id', 'basic_info');
  }, /not found/);
});

test('CompanyOnboarding - completeStep throws for invalid step', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId } = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com'
  }, 'express');
  
  assert.throws(() => {
    onboarding.completeStep(sessionId, 'invalid_step');
  }, /does not exist/);
});

test('CompanyOnboarding - completeStep throws for already completed step', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId } = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com'
  }, 'express');
  
  onboarding.completeStep(sessionId, 'basic_info');
  
  assert.throws(() => {
    onboarding.completeStep(sessionId, 'basic_info');
  }, /already completed/);
});

// ════════════════════════════════════════════════════════════════════════════
// FINALIZATION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - finalize creates company record', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId, steps } = onboarding.beginOnboarding({
    companyName: 'Final Corp',
    adminEmail: 'admin@final.com'
  }, 'express');
  
  // Complete all steps
  for (const step of steps) {
    onboarding.completeStep(sessionId, step, { stepData: step });
  }
  
  const result = onboarding.finalize(sessionId);
  
  assert.ok(result.companyId);
  assert.strictEqual(result.companyName, 'Final Corp');
  assert.strictEqual(result.mode, 'express');
  assert.strictEqual(result.status, 'completed');
  assert.ok(result.record);
  assert.ok(result.completedAt);
});

test('CompanyOnboarding - finalize throws for invalid session', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.finalize('invalid-session-id');
  }, /not found/);
});

test('CompanyOnboarding - finalize throws for incomplete steps', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId } = onboarding.beginOnboarding({
    companyName: 'Test Corp',
    adminEmail: 'admin@test.com'
  }, 'express');
  
  onboarding.completeStep(sessionId, 'basic_info');
  // Not completing all steps
  
  assert.throws(() => {
    onboarding.finalize(sessionId);
  }, /incomplete steps/);
});

test('CompanyOnboarding - completeStep throws for finalized session', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId, steps } = onboarding.beginOnboarding({
    companyName: 'Final Corp',
    adminEmail: 'admin@final.com'
  }, 'express');
  
  for (const step of steps) {
    onboarding.completeStep(sessionId, step);
  }
  onboarding.finalize(sessionId);
  
  // Session is now completed
  assert.throws(() => {
    onboarding.completeStep(sessionId, 'basic_info');
  }, /already completed/);
});

// ════════════════════════════════════════════════════════════════════════════
// STATUS TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - getStatus returns progress', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId } = onboarding.beginOnboarding({
    companyName: 'Status Corp',
    adminEmail: 'admin@status.com'
  }, 'express');
  
  const status = onboarding.getStatus(sessionId);
  
  assert.strictEqual(status.sessionId, sessionId);
  assert.strictEqual(status.mode, 'express');
  assert.strictEqual(status.status, 'in_progress');
  assert.strictEqual(status.progress.total, 3);
  assert.strictEqual(status.progress.completed, 0);
  assert.strictEqual(status.progress.percentComplete, 0);
  assert.deepStrictEqual(status.completedSteps, []);
});

test('CompanyOnboarding - getStatus tracks completed steps', () => {
  const onboarding = new CompanyOnboarding();
  const { sessionId } = onboarding.beginOnboarding({
    companyName: 'Status Corp',
    adminEmail: 'admin@status.com'
  }, 'express');
  
  onboarding.completeStep(sessionId, 'basic_info');
  const status = onboarding.getStatus(sessionId);
  
  assert.strictEqual(status.progress.completed, 1);
  assert.strictEqual(status.progress.remaining, 2);
  assert.ok(status.progress.percentComplete > 0);
  assert.ok(status.completedSteps.includes('basic_info'));
});

test('CompanyOnboarding - getStatus throws for invalid session', () => {
  const onboarding = new CompanyOnboarding();
  assert.throws(() => {
    onboarding.getStatus('invalid-session-id');
  }, /not found/);
});

// ════════════════════════════════════════════════════════════════════════════
// FULL WORKFLOW TESTS
// ════════════════════════════════════════════════════════════════════════════

test('CompanyOnboarding - Full express onboarding workflow', () => {
  const onboarding = new CompanyOnboarding();
  
  // Begin
  const { sessionId, steps } = onboarding.beginOnboarding({
    companyName: 'Workflow Corp',
    adminEmail: 'admin@workflow.com'
  }, 'express');
  
  // Check initial status
  let status = onboarding.getStatus(sessionId);
  assert.strictEqual(status.progress.percentComplete, 0);
  
  // Complete all steps
  for (const step of steps) {
    onboarding.completeStep(sessionId, step, { verified: true });
  }
  
  // Check completion status
  status = onboarding.getStatus(sessionId);
  assert.strictEqual(status.progress.percentComplete, 100);
  
  // Finalize
  const result = onboarding.finalize(sessionId);
  assert.ok(result.companyId);
  assert.strictEqual(result.status, 'completed');
});

test('CompanyOnboarding - Multiple concurrent sessions', () => {
  const onboarding = new CompanyOnboarding();
  
  const session1 = onboarding.beginOnboarding({
    companyName: 'Corp A',
    adminEmail: 'admin@a.com'
  }, 'express');
  
  const session2 = onboarding.beginOnboarding({
    companyName: 'Corp B',
    adminEmail: 'admin@b.com'
  }, 'express');
  
  assert.notStrictEqual(session1.sessionId, session2.sessionId);
  
  // Complete different steps in each
  onboarding.completeStep(session1.sessionId, 'basic_info');
  onboarding.completeStep(session2.sessionId, 'api_credentials');
  
  const status1 = onboarding.getStatus(session1.sessionId);
  const status2 = onboarding.getStatus(session2.sessionId);
  
  assert.ok(status1.completedSteps.includes('basic_info'));
  assert.ok(status2.completedSteps.includes('api_credentials'));
});
