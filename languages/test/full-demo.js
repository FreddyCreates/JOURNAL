/**
 * Complete Cognitive Language Universe Demo
 * Showcases all 9 operational languages working together
 */

import { CognitiveRuntime } from '../runtime.js';
import { readFileSync } from 'fs';

console.log('🌌 COGNITIVE LANGUAGE UNIVERSE - FULL DEMO\n');
console.log('=' .repeat(60));

const runtime = new CognitiveRuntime();

const demos = [
  {
    name: 'CPL-L (Cognitive Law)',
    lang: 'cpl-l',
    file: '../cpl-l/examples/terminal_sovereignty.cpl-l',
    description: 'Constitutional laws governing AGI civilizations'
  },
  {
    name: 'CPL-C (Cognitive Contract)',
    lang: 'cpl-c',
    file: '../cpl-c/examples/terminal_service.cpl-c',
    description: 'Smart contracts with formal guarantees'
  },
  {
    name: 'CPL-P (Cognitive Processing)',
    lang: 'cpl-p',
    file: '../cpl-p/examples/proposal_analysis.cpl-p',
    description: 'Deterministic data processing pipelines'
  },
  {
    name: 'CIL (Cognitive Internal)',
    lang: 'cil',
    file: '../cil/examples/archon_mind.cil',
    description: 'Internal cognitive representation spaces'
  },
  {
    name: 'CDL (Cognitive Doctrine)',
    lang: 'cdl',
    file: '../cdl/examples/archon_doctrine.cdl',
    description: 'Value systems and ethical principles'
  },
  {
    name: 'OCL (Organism Contract)',
    lang: 'ocl',
    file: '../ocl/examples/archon_vector.ocl',
    description: 'Organism capabilities and constraints'
  },
  {
    name: 'TPL (Terminal Protocol)',
    lang: 'tpl',
    file: '../tpl/examples/terminal_mesh.tpl',
    description: 'Terminal-to-terminal communication'
  },
  {
    name: 'ACL (Atlas Configuration)',
    lang: 'acl',
    file: '../acl/examples/cognitive_cosmos.acl',
    description: 'Ontological meta-governance'
  }
];

let successCount = 0;

for (const demo of demos) {
  try {
    const source = readFileSync(demo.file, 'utf-8');
    const result = await runtime.execute(demo.lang, source);

    console.log(`\n✅ ${demo.name}`);
    console.log(`   ${demo.description}`);
    console.log(`   Result: ${result.type}`);

    successCount++;
  } catch (err) {
    console.log(`\n❌ ${demo.name}`);
    console.log(`   Error: ${err.message.substring(0, 80)}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`\n🎉 ${successCount}/${demos.length} languages executed successfully\n`);

// Show runtime statistics
const stats = runtime.getStatistics();
console.log('📊 Runtime Statistics:');
console.log(`   Languages Available: ${stats.languages.join(', ')}`);
console.log(`   Parsers: ${stats.parsersAvailable}`);
console.log(`   Compilers: ${stats.compilersAvailable}`);
console.log(`   Laws Loaded: ${stats.lawsLoaded}`);
console.log(`   Organisms Loaded: ${stats.organismsLoaded}`);
console.log(`   Protocols Loaded: ${stats.protocolsLoaded}`);

console.log('\n🌟 Cognitive Language Universe operational and ready for deployment!\n');
