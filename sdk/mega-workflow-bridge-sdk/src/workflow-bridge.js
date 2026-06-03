import crypto from 'node:crypto';
const PHI = 1.618033988749895;

export class WorkflowBridge {
  constructor() {
    this._connectors = new Map();
    this._translations = [];
  }

  registerConnector(name, adapter) {
    if (typeof adapter !== 'object' || !adapter.toWorkflow || !adapter.fromWorkflow) throw new Error('Adapter must have toWorkflow and fromWorkflow methods');
    this._connectors.set(name, adapter);
    return { name, registered: true, connectorCount: this._connectors.size };
  }

  translate(sourceName, targetName, workflowDef) {
    const source = this._connectors.get(sourceName);
    if (!source) throw new Error(`Connector "${sourceName}" not found`);
    const target = this._connectors.get(targetName);
    if (!target) throw new Error(`Connector "${targetName}" not found`);
    const intermediate = source.toWorkflow(workflowDef);
    const result = target.fromWorkflow(intermediate);
    const phiFidelity = PHI / (PHI + 1);
    const record = { translationId: crypto.randomUUID(), source: sourceName, target: targetName, phiFidelity, timestamp: Date.now() };
    this._translations.push(record);
    return { ...record, result };
  }

  getConnectors() { return [...this._connectors.keys()]; }
  getTranslations() { return [...this._translations]; }
}
