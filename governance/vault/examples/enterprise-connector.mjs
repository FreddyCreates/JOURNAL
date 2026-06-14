#!/usr/bin/env node
/**
 * Example: Enterprise Connector with Sovereign Vault
 * 
 * Demonstrates how to integrate the Sovereign Vault with enterprise
 * connectors (Salesforce, SAP, HubSpot, etc.) for secure credential management.
 */

import { VaultClient } from '../client.js';

const client = new VaultClient();

/**
 * Abstract base pattern for vault-integrated connectors.
 */
class VaultIntegratedConnector {
  constructor(tokenId, connectorName) {
    this.tokenId = tokenId;
    this.connectorName = connectorName;
    this.vault = client;
  }

  /**
   * Get the connector's API credential from the vault.
   */
  getCredential(operation = 'default') {
    return this.vault.get(this.tokenId, {
      caller: this.connectorName,
      operation
    });
  }

  /**
   * Check if this connector's token is available and active.
   */
  isAvailable() {
    return this.vault.has(this.tokenId);
  }

  /**
   * Display connector status.
   */
  displayStatus() {
    const meta = this.vault.getMetadata(this.tokenId);
    if (!meta) {
      console.log(`  ✗ ${this.connectorName}: Token not registered`);
      return;
    }
    const status = meta.status === 'active' ? '✓' : '✗';
    console.log(`  ${status} ${this.connectorName} (${meta.provider})`);
    console.log(`      Alias: ${meta.alias}`);
    console.log(`      Scopes: ${meta.scopes.join(', ')}`);
    console.log(`      Policy: ${meta.access_policy}`);
    console.log(`      Status: ${meta.status}`);
  }
}

/**
 * Example connectors ready for registration.
 */
const exampleConnectors = [
  { tokenId: 'SALESFORCE_API_KEY', name: 'Salesforce CRM' },
  { tokenId: 'SAP_ENTERPRISE_KEY', name: 'SAP Enterprise' },
  { tokenId: 'HUBSPOT_API_KEY', name: 'HubSpot CRM' },
  { tokenId: 'STRIPE_API_KEY', name: 'Stripe Payment' },
  { tokenId: 'GOOGLE_SERVICE_ACCOUNT', name: 'Google Cloud' },
  { tokenId: 'SHOPIFY_API_KEY', name: 'Shopify' },
  { tokenId: 'SLACK_BOT_TOKEN', name: 'Slack' },
  { tokenId: 'TWILIO_AUTH_TOKEN', name: 'Twilio' },
];

async function displayExample() {
  try {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Sovereign Vault — Enterprise Connector Pattern');
    console.log('═══════════════════════════════════════════════════════\n');

    // Show enterprise token class
    const enterpriseClass = client.getClass('enterprise');
    console.log(`✓ Enterprise Token Class`);
    console.log(`  Registered: ${enterpriseClass.tokens.length}`);
    if (enterpriseClass.tokens.length === 0) {
      console.log(`  (None yet — register your first enterprise connector!)`);
    }
    console.log();

    // Show available token categories
    console.log(`✓ All Token Classes:`);
    const classes = ['integration', 'cognition', 'memory', 'system', 'enterprise'];
    for (const cls of classes) {
      const clsInfo = client.getClass(cls);
      const count = clsInfo.tokens.length;
      console.log(`  - ${cls}: ${count} token(s)`);
    }
    console.log();

    // Show integration tokens currently registered
    const integration = client.getClass('integration');
    console.log(`✓ Currently Registered Integration Tokens:`);
    integration.tokens.forEach(t => {
      const connector = new VaultIntegratedConnector(t.token_id, t.alias);
      connector.displayStatus();
    });
    console.log();

    // Show example connectors ready to be registered
    console.log(`✓ Example Enterprise Connectors (Ready to Register):`);
    exampleConnectors.forEach(({ tokenId, name }) => {
      const connector = new VaultIntegratedConnector(tokenId, name);
      connector.displayStatus();
    });
    console.log();

    console.log('═══════════════════════════════════════════════════════');
    console.log('✓ To register a new enterprise connector:');
    console.log();
    console.log('  1. Add entry to governance/vault/ledger.json:');
    console.log('     {');
    console.log('       "token_id": "SALESFORCE_API_KEY",');
    console.log('       "alias": "Salesforce CRM API",');
    console.log('       "provider": "salesforce",');
    console.log('       "scopes": ["read:accounts", "write:accounts"],');
    console.log('       "secret_ref": "secrets.SALESFORCE_API_KEY",');
    console.log('       "status": "active",');
    console.log('       "access_policy": "agent_write"');
    console.log('     }');
    console.log();
    console.log('  2. Create GitHub Secret: Settings → Secrets → SALESFORCE_API_KEY');
    console.log();
    console.log('  3. Add to "enterprise" token class in ledger.json');
    console.log();
    console.log('  4. Use in connector:');
    console.log();
    console.log('     class SalesforceConnector extends VaultIntegratedConnector {');
    console.log('       constructor() {');
    console.log('         super("SALESFORCE_API_KEY", "salesforce-connector");');
    console.log('       }');
    console.log();
    console.log('       async authenticate() {');
    console.log('         const cred = this.getCredential("authenticate");');
    console.log('         return this.login(cred.token);');
    console.log('       }');
    console.log('     }');
    console.log();
    console.log('═══════════════════════════════════════════════════════');

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

// Run example
displayExample();
