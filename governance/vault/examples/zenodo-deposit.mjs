#!/usr/bin/env node
/**
 * Example: Zenodo Deposit via Sovereign Vault
 * 
 * This example demonstrates how to use the Sovereign Vault to safely
 * manage Zenodo API tokens and perform deposits without exposing credentials.
 * 
 * Usage: node zenodo-deposit.mjs
 */

import { VaultClient } from '../client.js';

const client = new VaultClient();

/**
 * Example workflow: Display vault status and token info.
 */
async function exampleWorkflow() {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Sovereign Vault — Zenodo Integration Example');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check vault status
    const allTokens = client.listAll();
    const zenodoTokens = allTokens.filter(t => t.provider === 'zenodo');
    console.log(`✓ Vault initialized`);
    console.log(`  Total tokens available: ${allTokens.length}`);
    console.log(`  Zenodo tokens: ${zenodoTokens.length}`);
    console.log(`  Active Zenodo tokens: ${zenodoTokens.filter(t => t.status === 'active').length}\n`);

    // Check integration class
    const integrationClass = client.getClass('integration');
    console.log(`✓ Integration token class:`);
    console.log(`  Total: ${integrationClass.tokens.length}`);
    console.log(`  Tokens:`);
    integrationClass.tokens.forEach(t => {
      console.log(`    - ${t.token_id} (${t.status}): ${t.alias}`);
    });
    console.log();

    // Show Zenodo token metadata
    const zenodoMeta = client.getMetadata('MEDINASITECH');
    console.log(`✓ MEDINASITECH token metadata:`);
    console.log(`  Alias: ${zenodoMeta.alias}`);
    console.log(`  Provider: ${zenodoMeta.provider}`);
    console.log(`  Scopes: ${zenodoMeta.scopes.join(', ')}`);
    console.log(`  Capabilities: ${zenodoMeta.capabilities.join(', ')}`);
    console.log(`  Restrictions: ${zenodoMeta.restrictions.join(', ')}`);
    console.log(`  Access Policy: ${zenodoMeta.access_policy}`);
    console.log(`  Status: ${zenodoMeta.status}`);
    console.log();

    // Demo: Check if token can perform operations
    const canDeposit = zenodoMeta.capabilities.includes('create_deposit');
    const canPublish = !zenodoMeta.restrictions.includes('no_publish');

    console.log(`✓ Operation capabilities:`);
    console.log(`  Can create deposits: ${canDeposit ? '✓ YES' : '✗ NO'}`);
    console.log(`  Can publish: ${canPublish ? '✓ YES' : '✗ NO (requires human approval)'}`);
    console.log();

    // Show audit trail
    const auditLog = client.getAuditLog('MEDINASITECH');
    console.log(`✓ Audit trail:`);
    console.log(`  Total operations: ${auditLog.length}`);
    if (auditLog.length > 0) {
      console.log(`  Recent operations:`);
      auditLog.slice(-3).forEach(log => {
        console.log(`    - [${new Date(log.timestamp).toISOString()}] ${log.caller}: ${log.operation}`);
      });
    }
    console.log();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✓ To use this token in a workflow:');
    console.log();
    console.log('   import { VaultClient } from "./governance/vault/client.js";');
    console.log('   const vault = new VaultClient();');
    console.log('   const token = vault.get("MEDINASITECH", {');
    console.log('     caller: "my-zenodo-agent",');
    console.log('     operation: "create_deposit"');
    console.log('   });');
    console.log();
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run example
exampleWorkflow();
