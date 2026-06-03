/**
 * AI Model Engines - Family Registry Tests
 * Tests for the 40 AI model family registry
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { FamilyRegistry } from '../src/family-registry.js';

// ════════════════════════════════════════════════════════════════════════════
// REGISTRY INITIALIZATION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - Constructor initializes correctly', () => {
  const registry = new FamilyRegistry();
  assert.ok(registry.families instanceof Map);
  assert.ok(registry.count() >= 40);
});

test('FamilyRegistry - count returns correct family count', () => {
  const registry = new FamilyRegistry();
  assert.strictEqual(registry.count(), 40);
});

// ════════════════════════════════════════════════════════════════════════════
// FAMILY RETRIEVAL TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - getFamily returns correct family by ID', () => {
  const registry = new FamilyRegistry();
  const family = registry.getFamily('AIF-001');
  assert.ok(family);
  assert.strictEqual(family.name, 'GPT');
  assert.strictEqual(family.parentOrg, 'OpenAI');
});

test('FamilyRegistry - getFamily returns undefined for invalid ID', () => {
  const registry = new FamilyRegistry();
  const family = registry.getFamily('AIF-999');
  assert.strictEqual(family, undefined);
});

test('FamilyRegistry - getFamilyByName returns correct family', () => {
  const registry = new FamilyRegistry();
  const family = registry.getFamilyByName('Claude');
  assert.ok(family);
  assert.strictEqual(family.id, 'AIF-002');
  assert.strictEqual(family.parentOrg, 'Anthropic');
});

test('FamilyRegistry - getFamilyByName is case-insensitive', () => {
  const registry = new FamilyRegistry();
  const family1 = registry.getFamilyByName('GPT');
  const family2 = registry.getFamilyByName('gpt');
  assert.deepStrictEqual(family1, family2);
});

test('FamilyRegistry - getFamilyByName returns undefined for unknown name', () => {
  const registry = new FamilyRegistry();
  const family = registry.getFamilyByName('NonExistentModel');
  assert.strictEqual(family, undefined);
});

test('FamilyRegistry - listFamilies returns all families', () => {
  const registry = new FamilyRegistry();
  const families = registry.listFamilies();
  assert.strictEqual(families.length, 40);
});

// ════════════════════════════════════════════════════════════════════════════
// FAMILY DATA VALIDATION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - All families have required fields', () => {
  const registry = new FamilyRegistry();
  const requiredFields = [
    'id', 'name', 'parentOrg', 'alphaModel', 'alphaVersion',
    'intelligenceClass', 'primaryCapability', 'secondaryCapabilities',
    'parameterClass', 'contextWindow', 'modality', 'ringAffinity',
    'organismPlacement', 'routingPriority', 'wireProtocol', 'engineStatus'
  ];
  
  for (const family of registry.listFamilies()) {
    for (const field of requiredFields) {
      assert.ok(field in family, `Family ${family.id} missing field: ${field}`);
    }
  }
});

test('FamilyRegistry - All family IDs follow AIF-XXX format', () => {
  const registry = new FamilyRegistry();
  for (const family of registry.listFamilies()) {
    assert.ok(/^AIF-\d{3}$/.test(family.id), `Invalid ID format: ${family.id}`);
  }
});

test('FamilyRegistry - All families have secondaryCapabilities array', () => {
  const registry = new FamilyRegistry();
  for (const family of registry.listFamilies()) {
    assert.ok(Array.isArray(family.secondaryCapabilities), `${family.id} secondaryCapabilities is not array`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// RING AFFINITY TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - listByRing returns families for Interface Ring', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByRing('Interface Ring');
  assert.ok(families.length > 0);
  for (const family of families) {
    assert.strictEqual(family.ringAffinity.toLowerCase(), 'interface ring');
  }
});

test('FamilyRegistry - listByRing is case-insensitive', () => {
  const registry = new FamilyRegistry();
  const families1 = registry.listByRing('Interface Ring');
  const families2 = registry.listByRing('interface ring');
  assert.deepStrictEqual(families1, families2);
});

test('FamilyRegistry - listByRing returns empty array for unknown ring', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByRing('Nonexistent Ring');
  assert.deepStrictEqual(families, []);
});

// ════════════════════════════════════════════════════════════════════════════
// PRIORITY TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - listByPriority returns P0 families', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByPriority('P0');
  assert.ok(families.length > 0);
  for (const family of families) {
    assert.strictEqual(family.routingPriority, 'P0');
  }
});

test('FamilyRegistry - listByPriority is case-insensitive', () => {
  const registry = new FamilyRegistry();
  const families1 = registry.listByPriority('P0');
  const families2 = registry.listByPriority('p0');
  assert.deepStrictEqual(families1, families2);
});

// ════════════════════════════════════════════════════════════════════════════
// CAPABILITY TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - listByCapability finds reasoning models', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByCapability('reasoning');
  assert.ok(families.length > 0);
});

test('FamilyRegistry - listByCapability searches primary and secondary', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByCapability('code generation');
  assert.ok(families.length > 0);
});

test('FamilyRegistry - listByCapability is case-insensitive', () => {
  const registry = new FamilyRegistry();
  const families1 = registry.listByCapability('REASONING');
  const families2 = registry.listByCapability('reasoning');
  assert.deepStrictEqual(families1, families2);
});

// ════════════════════════════════════════════════════════════════════════════
// ORGANIZATION TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - listByOrg returns OpenAI families', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByOrg('OpenAI');
  assert.ok(families.length > 0);
  for (const family of families) {
    assert.ok(family.parentOrg.toLowerCase().includes('openai'));
  }
});

test('FamilyRegistry - listByOrg returns Anthropic families', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByOrg('Anthropic');
  assert.ok(families.length > 0);
});

test('FamilyRegistry - listByOrg is case-insensitive', () => {
  const registry = new FamilyRegistry();
  const families1 = registry.listByOrg('Google');
  const families2 = registry.listByOrg('google');
  assert.deepStrictEqual(families1, families2);
});

// ════════════════════════════════════════════════════════════════════════════
// MODALITY TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - listByModality finds text models', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByModality('Text');
  assert.ok(families.length > 0);
});

test('FamilyRegistry - listByModality finds vision models', () => {
  const registry = new FamilyRegistry();
  const families = registry.listByModality('Vision');
  assert.ok(families.length > 0);
});

test('FamilyRegistry - listByModality is case-insensitive', () => {
  const registry = new FamilyRegistry();
  const families1 = registry.listByModality('Text');
  const families2 = registry.listByModality('text');
  assert.deepStrictEqual(families1, families2);
});

// ════════════════════════════════════════════════════════════════════════════
// ALPHA MODELS TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - listAlphas returns compact alpha model list', () => {
  const registry = new FamilyRegistry();
  const alphas = registry.listAlphas();
  assert.strictEqual(alphas.length, 40);
  for (const alpha of alphas) {
    assert.ok('id' in alpha);
    assert.ok('alphaModel' in alpha);
    assert.ok('alphaVersion' in alpha);
  }
});

test('FamilyRegistry - listAlphas includes GPT-4o', () => {
  const registry = new FamilyRegistry();
  const alphas = registry.listAlphas();
  const gpt = alphas.find(a => a.alphaModel === 'GPT-4o');
  assert.ok(gpt);
  assert.strictEqual(gpt.id, 'AIF-001');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECIFIC MODEL TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - GPT (AIF-001) has correct metadata', () => {
  const registry = new FamilyRegistry();
  const gpt = registry.getFamily('AIF-001');
  assert.strictEqual(gpt.name, 'GPT');
  assert.strictEqual(gpt.parentOrg, 'OpenAI');
  assert.strictEqual(gpt.routingPriority, 'P0');
  assert.strictEqual(gpt.ringAffinity, 'Interface Ring');
});

test('FamilyRegistry - Claude (AIF-002) has correct metadata', () => {
  const registry = new FamilyRegistry();
  const claude = registry.getFamily('AIF-002');
  assert.strictEqual(claude.name, 'Claude');
  assert.strictEqual(claude.parentOrg, 'Anthropic');
  assert.strictEqual(claude.routingPriority, 'P0');
});

test('FamilyRegistry - Gemini (AIF-003) has correct metadata', () => {
  const registry = new FamilyRegistry();
  const gemini = registry.getFamily('AIF-003');
  assert.strictEqual(gemini.name, 'Gemini');
  assert.strictEqual(gemini.parentOrg, 'Google DeepMind');
  assert.strictEqual(gemini.routingPriority, 'P0');
});

test('FamilyRegistry - Llama (AIF-004) has correct metadata', () => {
  const registry = new FamilyRegistry();
  const llama = registry.getFamily('AIF-004');
  assert.strictEqual(llama.name, 'Llama');
  assert.strictEqual(llama.parentOrg, 'Meta');
  assert.strictEqual(llama.ringAffinity, 'Sovereign Ring');
});

// ════════════════════════════════════════════════════════════════════════════
// COVERAGE TESTS
// ════════════════════════════════════════════════════════════════════════════

test('FamilyRegistry - Contains frontier models (1-10)', () => {
  const registry = new FamilyRegistry();
  for (let i = 1; i <= 10; i++) {
    const id = `AIF-${i.toString().padStart(3, '0')}`;
    assert.ok(registry.getFamily(id), `Missing family: ${id}`);
  }
});

test('FamilyRegistry - Contains specialized models (11-20)', () => {
  const registry = new FamilyRegistry();
  for (let i = 11; i <= 20; i++) {
    const id = `AIF-${i.toString().padStart(3, '0')}`;
    assert.ok(registry.getFamily(id), `Missing family: ${id}`);
  }
});

test('FamilyRegistry - Contains extended models (21-30)', () => {
  const registry = new FamilyRegistry();
  for (let i = 21; i <= 30; i++) {
    const id = `AIF-${i.toString().padStart(3, '0')}`;
    assert.ok(registry.getFamily(id), `Missing family: ${id}`);
  }
});

test('FamilyRegistry - Contains domain-specific models (31-40)', () => {
  const registry = new FamilyRegistry();
  for (let i = 31; i <= 40; i++) {
    const id = `AIF-${i.toString().padStart(3, '0')}`;
    assert.ok(registry.getFamily(id), `Missing family: ${id}`);
  }
});
