/**
 * CognitiveLanguageRegistry Tests
 * Tests for the central language registry
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CognitiveLanguageRegistry } from '../index.js';

test('Registry - getAllLanguages returns 40 languages', () => {
  const languages = CognitiveLanguageRegistry.getAllLanguages();
  assert.strictEqual(languages.length, 40);
});

test('Registry - getLanguage returns language by ID', () => {
  const cplL = CognitiveLanguageRegistry.getLanguage('cpl-l');
  
  assert(cplL !== null);
  assert.strictEqual(cplL.name, 'Cognitive Law Language');
  assert.strictEqual(cplL.priority, 'P0');
});

test('Registry - getLanguage returns null for unknown ID', () => {
  const unknown = CognitiveLanguageRegistry.getLanguage('unknown-lang');
  assert.strictEqual(unknown, null);
});

test('Registry - getByStack returns languages by stack', () => {
  const coreLaw = CognitiveLanguageRegistry.getByStack('core-law');
  
  assert.strictEqual(coreLaw.length, 4);
  assert(coreLaw.some(l => l.id === 'cpl-l'));
  assert(coreLaw.some(l => l.id === 'cpl-c'));
  assert(coreLaw.some(l => l.id === 'ocl'));
  assert(coreLaw.some(l => l.id === 'cpl-p'));
});

test('Registry - getByStack returns inner-mind stack', () => {
  const innerMind = CognitiveLanguageRegistry.getByStack('inner-mind');
  
  assert.strictEqual(innerMind.length, 6);
  assert(innerMind.some(l => l.id === 'cil'));
  assert(innerMind.some(l => l.id === 'cdl'));
});

test('Registry - getByStack returns relational stack', () => {
  const relational = CognitiveLanguageRegistry.getByStack('relational');
  
  assert.strictEqual(relational.length, 3);
  assert(relational.some(l => l.id === 'rel'));
  assert(relational.some(l => l.id === 'col'));
  assert(relational.some(l => l.id === 'rol'));
});

test('Registry - getByStack returns work-creation stack', () => {
  const workCreation = CognitiveLanguageRegistry.getByStack('work-creation');
  
  assert.strictEqual(workCreation.length, 3);
  assert(workCreation.some(l => l.id === 'wfl'));
  assert(workCreation.some(l => l.id === 'cxl'));
  assert(workCreation.some(l => l.id === 'exl'));
});

test('Registry - getByStack returns empty for unknown stack', () => {
  const unknown = CognitiveLanguageRegistry.getByStack('unknown-stack');
  assert.strictEqual(unknown.length, 0);
});

test('Registry - getByPriority returns P0 languages', () => {
  const p0 = CognitiveLanguageRegistry.getByPriority('P0');
  
  assert(p0.length > 0);
  assert(p0.every(l => l.priority === 'P0'));
  assert(p0.some(l => l.id === 'cpl-l'));
});

test('Registry - getByPriority returns P1 languages', () => {
  const p1 = CognitiveLanguageRegistry.getByPriority('P1');
  
  assert(p1.length > 0);
  assert(p1.every(l => l.priority === 'P1'));
});

test('Registry - getByPriority returns P2 languages', () => {
  const p2 = CognitiveLanguageRegistry.getByPriority('P2');
  
  assert(p2.length > 0);
  assert(p2.every(l => l.priority === 'P2'));
});

test('Registry - getByStatus returns active languages', () => {
  const active = CognitiveLanguageRegistry.getByStatus('active');
  
  assert(active.length > 0);
  assert(active.every(l => l.status === 'active'));
  assert(active.some(l => l.id === 'cpl-l'));
});

test('Registry - getByStatus returns planned languages', () => {
  const planned = CognitiveLanguageRegistry.getByStatus('planned');
  
  assert(planned.length > 0);
  assert(planned.every(l => l.status === 'planned'));
});

test('Registry - getByStatus returns in-progress languages', () => {
  const inProgress = CognitiveLanguageRegistry.getByStatus('in-progress');
  
  assert(inProgress.length > 0);
  assert(inProgress.every(l => l.status === 'in-progress'));
});

test('Registry - parse uses correct parser for CPL-L', () => {
  const source = `
    LAW TEST_LAW {
      VERSION "1.0.0"
    }
  `;

  const ast = CognitiveLanguageRegistry.parse('cpl-l', source);
  
  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'CPL-L');
  assert.strictEqual(ast.laws.length, 1);
});

test('Registry - parse uses correct parser for OCL', () => {
  const source = `
    ORGANISM TEST_ORG {
      ENCODED_ID "TEST"
    }
  `;

  const ast = CognitiveLanguageRegistry.parse('ocl', source);
  
  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'OCL');
  assert.strictEqual(ast.organisms.length, 1);
});

test('Registry - parse uses correct parser for TPL', () => {
  const source = `
    PROTOCOL TEST_PROTO {
      VERSION "1.0.0"
    }
  `;

  const ast = CognitiveLanguageRegistry.parse('tpl', source);
  
  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.language, 'TPL');
  assert.strictEqual(ast.protocols.length, 1);
});

test('Registry - parse throws for unknown language', () => {
  const source = `test`;

  assert.throws(() => {
    CognitiveLanguageRegistry.parse('unknown', source);
  }, /Unknown language/);
});

test('Registry - all languages have parser', () => {
  const languages = CognitiveLanguageRegistry.getAllLanguages();
  
  for (const lang of languages) {
    assert(lang.parser !== undefined, `Language ${lang.id} should have a parser`);
  }
});

test('Registry - all languages have name', () => {
  const languages = CognitiveLanguageRegistry.getAllLanguages();
  
  for (const lang of languages) {
    assert(lang.name !== undefined, `Language ${lang.id} should have a name`);
    assert(lang.name.length > 0, `Language ${lang.id} name should not be empty`);
  }
});

test('Registry - all languages have priority', () => {
  const languages = CognitiveLanguageRegistry.getAllLanguages();
  const validPriorities = ['P0', 'P1', 'P2'];
  
  for (const lang of languages) {
    assert(validPriorities.includes(lang.priority), 
      `Language ${lang.id} should have valid priority`);
  }
});

test('Registry - all languages have status', () => {
  const languages = CognitiveLanguageRegistry.getAllLanguages();
  const validStatuses = ['active', 'planned', 'in-progress'];
  
  for (const lang of languages) {
    assert(validStatuses.includes(lang.status), 
      `Language ${lang.id} should have valid status`);
  }
});
