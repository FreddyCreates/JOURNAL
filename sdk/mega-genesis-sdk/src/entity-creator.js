import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class EntityCreator {
  constructor(config = {}) {
    this.maxEntities = config.maxEntities ?? 256;
    this.genesisMode = config.genesisMode ?? 'phi-seeded';
    this.autoNaming = config.autoNaming ?? true;
    this._templates = new Map();
    this._entities = new Map();
  }

  create(blueprint = {}) {
    if (this._entities.size >= this.maxEntities) throw new Error('Max entities reached');
    const entityId = crypto.randomUUID();
    const name = blueprint.name ?? (this.autoNaming ? `entity-${entityId.slice(0, 8)}` : 'unnamed');
    const phiSignature = crypto.createHash('sha256').update(entityId).digest('hex').slice(0, 16);
    const entity = { entityId, name, type: blueprint.type ?? 'generic', createdAt: Date.now(), phiSignature, status: 'nascent', properties: blueprint.properties ?? {} };
    this._entities.set(entityId, entity);
    return { ...entity };
  }

  createFromTemplate(templateName, overrides = {}) {
    const template = this._templates.get(templateName);
    if (!template) throw new Error(`Template ${templateName} not found`);
    return this.create({ ...template, ...overrides });
  }

  registerTemplate(name, template) {
    this._templates.set(name, template);
    return { name, type: template.type ?? 'generic', registered: Date.now() };
  }

  getEntity(entityId) { return this._entities.get(entityId) ?? null; }
  getEntities() { return [...this._entities.values()]; }

  destroy(entityId) {
    const entity = this._entities.get(entityId);
    if (!entity) throw new Error(`Entity ${entityId} not found`);
    this._entities.delete(entityId);
    return { entityId, name: entity.name, destroyedAt: Date.now() };
  }

  getStats() { return { totalCreated: this._entities.size, templates: this._templates.size, capacity: this.maxEntities }; }
}
