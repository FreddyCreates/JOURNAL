/**
 * ATLAS REGISTRY
 * Query system for organism-class bot entities
 * Supports queries by ID, division, language, and capability
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AtlasRegistry {
  constructor() {
    this.entities = new Map();
    this.divisionIndex = new Map();
    this.languageIndex = new Map();
    this.capabilityIndex = new Map();
    this.loaded = false;
  }

  /**
   * Load all bot entities from the entities directory
   */
  loadEntities() {
    if (this.loaded) return;

    const entitiesDir = join(__dirname, 'entities');
    const files = readdirSync(entitiesDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = join(entitiesDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const entity = JSON.parse(content);

      // Store in main entity map
      this.entities.set(entity.id, entity);

      // Index by division
      if (!this.divisionIndex.has(entity.divisionId)) {
        this.divisionIndex.set(entity.divisionId, []);
      }
      this.divisionIndex.get(entity.divisionId).push(entity);

      // Index by language
      for (const lang of entity.languages || []) {
        if (!this.languageIndex.has(lang)) {
          this.languageIndex.set(lang, []);
        }
        this.languageIndex.get(lang).push(entity);
      }

      // Index by capability
      for (const cap of entity.capabilities || []) {
        if (!this.capabilityIndex.has(cap)) {
          this.capabilityIndex.set(cap, []);
        }
        this.capabilityIndex.get(cap).push(entity);
      }
    }

    this.loaded = true;
  }

  /**
   * Get entity by atlas:// URI
   */
  getEntity(id) {
    this.loadEntities();
    return this.entities.get(id);
  }

  /**
   * Get all entities
   */
  getAllEntities() {
    this.loadEntities();
    return Array.from(this.entities.values());
  }

  /**
   * Get entities by division ID
   */
  getEntitiesByDivision(divisionId) {
    this.loadEntities();
    return this.divisionIndex.get(divisionId) || [];
  }

  /**
   * Get entities by language URI
   */
  getEntitiesByLanguage(languageUri) {
    this.loadEntities();
    return this.languageIndex.get(languageUri) || [];
  }

  /**
   * Get entities by capability
   */
  getEntitiesByCapability(capability) {
    this.loadEntities();
    return this.capabilityIndex.get(capability) || [];
  }

  /**
   * Get entities by constraint
   */
  getEntitiesByConstraint(constraint) {
    this.loadEntities();
    return Array.from(this.entities.values()).filter(entity =>
      entity.constraints && entity.constraints.includes(constraint)
    );
  }

  /**
   * Get entities by criticality level
   */
  getEntitiesByCriticality(level) {
    this.loadEntities();
    return Array.from(this.entities.values()).filter(entity =>
      entity.metadata?.criticality === level
    );
  }

  /**
   * Get all division IDs
   */
  getDivisions() {
    this.loadEntities();
    return Array.from(this.divisionIndex.keys());
  }

  /**
   * Get all unique languages used by bots
   */
  getLanguages() {
    this.loadEntities();
    return Array.from(this.languageIndex.keys());
  }

  /**
   * Get all unique capabilities across bots
   */
  getCapabilities() {
    this.loadEntities();
    return Array.from(this.capabilityIndex.keys());
  }

  /**
   * Get bot count by division
   */
  getDivisionStats() {
    this.loadEntities();
    const stats = {};
    for (const [divisionId, bots] of this.divisionIndex.entries()) {
      stats[divisionId] = {
        count: bots.length,
        division: bots[0].division,
        bots: bots.map(b => b.name)
      };
    }
    return stats;
  }

  /**
   * Query entities with complex filters
   */
  query(filters) {
    this.loadEntities();
    let results = Array.from(this.entities.values());

    if (filters.division) {
      results = results.filter(e => e.divisionId === filters.division);
    }

    if (filters.language) {
      results = results.filter(e =>
        e.languages && e.languages.includes(filters.language)
      );
    }

    if (filters.capability) {
      results = results.filter(e =>
        e.capabilities && e.capabilities.includes(filters.capability)
      );
    }

    if (filters.constraint) {
      results = results.filter(e =>
        e.constraints && e.constraints.includes(filters.constraint)
      );
    }

    if (filters.criticality) {
      results = results.filter(e =>
        e.metadata?.criticality === filters.criticality
      );
    }

    if (filters.trigger) {
      results = results.filter(e =>
        e.triggers && e.triggers.some(t => t.includes(filters.trigger))
      );
    }

    return results;
  }

  /**
   * Get governance pipeline for entity
   */
  getGovernancePipeline(entityId) {
    const entity = this.getEntity(entityId);
    return entity?.governance_pipeline;
  }

  /**
   * Generate fleet summary report
   */
  getFleetSummary() {
    this.loadEntities();

    return {
      total_bots: this.entities.size,
      divisions: this.getDivisionStats(),
      languages_used: this.getLanguages().length,
      unique_capabilities: this.getCapabilities().length,
      criticality_breakdown: {
        critical: this.getEntitiesByCriticality('critical').length,
        high: this.getEntitiesByCriticality('high').length,
        medium: this.getEntitiesByCriticality('medium').length,
        low: this.getEntitiesByCriticality('low').length
      }
    };
  }
}

// Singleton instance
const registry = new AtlasRegistry();

export default registry;
