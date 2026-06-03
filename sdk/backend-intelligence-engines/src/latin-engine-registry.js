/**
 * @medina/backend-intelligence-engines — LatinEngineRegistry
 *
 * 20 Latin-named backend AI engines for sovereign intelligence operations.
 * Each engine has a unique Latin name, intelligence domain, capability vector,
 * and governance affinity.
 *
 * The naming follows classical Latin convention for AI identities.
 *
 * @module @medina/backend-intelligence-engines/latin-engine-registry
 */

const PHI = 1.618033988749895;

/**
 * 20 Latin-named backend AI engines
 * Each engine represents a sovereign intelligence domain
 */
const LATIN_BACKEND_ENGINES = [
  // ════════════════════════════════════════════════════════════════════
  // CORE REASONING ENGINES (1-5)
  // ════════════════════════════════════════════════════════════════════
  {
    engineId: 'LBE-001',
    latinName: 'Cognitio Suprema',
    englishName: 'Supreme Cognition',
    domain: 'reasoning',
    capability: 'Multi-modal reasoning orchestration',
    vector: [0.98, 0.94, 0.91, 0.87],
    governanceAffinity: 'Sovereign Council',
    substrate: 'neural-mesh',
    status: 'active'
  },
  {
    engineId: 'LBE-002',
    latinName: 'Ratio Profunda',
    englishName: 'Deep Reasoning',
    domain: 'inference',
    capability: 'Chain-of-thought inference',
    vector: [0.95, 0.96, 0.88, 0.82],
    governanceAffinity: 'Logic Senate',
    substrate: 'transformer-core',
    status: 'active'
  },
  {
    engineId: 'LBE-003',
    latinName: 'Intellectus Universalis',
    englishName: 'Universal Intellect',
    domain: 'generalization',
    capability: 'Cross-domain knowledge synthesis',
    vector: [0.92, 0.89, 0.94, 0.86],
    governanceAffinity: 'Knowledge Assembly',
    substrate: 'embedding-lattice',
    status: 'active'
  },
  {
    engineId: 'LBE-004',
    latinName: 'Sapientia Mechanica',
    englishName: 'Mechanical Wisdom',
    domain: 'automation',
    capability: 'Intelligent task automation',
    vector: [0.88, 0.91, 0.86, 0.93],
    governanceAffinity: 'Operations Chamber',
    substrate: 'workflow-engine',
    status: 'active'
  },
  {
    engineId: 'LBE-005',
    latinName: 'Mens Analytica',
    englishName: 'Analytical Mind',
    domain: 'analysis',
    capability: 'Deep pattern recognition',
    vector: [0.93, 0.88, 0.92, 0.79],
    governanceAffinity: 'Data Tribunal',
    substrate: 'statistical-core',
    status: 'active'
  },

  // ════════════════════════════════════════════════════════════════════
  // MEMORY & KNOWLEDGE ENGINES (6-10)
  // ════════════════════════════════════════════════════════════════════
  {
    engineId: 'LBE-006',
    latinName: 'Memoria Aeterna',
    englishName: 'Eternal Memory',
    domain: 'persistence',
    capability: 'Long-term knowledge retention',
    vector: [0.86, 0.97, 0.84, 0.91],
    governanceAffinity: 'Archive Council',
    substrate: 'vector-store',
    status: 'active'
  },
  {
    engineId: 'LBE-007',
    latinName: 'Scientia Viva',
    englishName: 'Living Knowledge',
    domain: 'knowledge-graph',
    capability: 'Dynamic knowledge graph maintenance',
    vector: [0.89, 0.93, 0.87, 0.85],
    governanceAffinity: 'Ontology Senate',
    substrate: 'graph-engine',
    status: 'active'
  },
  {
    engineId: 'LBE-008',
    latinName: 'Index Omnium',
    englishName: 'Index of All',
    domain: 'retrieval',
    capability: 'Semantic search and retrieval',
    vector: [0.91, 0.86, 0.95, 0.83],
    governanceAffinity: 'Search Chamber',
    substrate: 'embedding-index',
    status: 'active'
  },
  {
    engineId: 'LBE-009',
    latinName: 'Contextus Magnus',
    englishName: 'Great Context',
    domain: 'context-management',
    capability: 'Long-context window management',
    vector: [0.87, 0.94, 0.81, 0.96],
    governanceAffinity: 'Context Assembly',
    substrate: 'attention-mesh',
    status: 'active'
  },
  {
    engineId: 'LBE-010',
    latinName: 'Veritas Reposita',
    englishName: 'Stored Truth',
    domain: 'fact-storage',
    capability: 'Verified fact persistence',
    vector: [0.84, 0.91, 0.88, 0.94],
    governanceAffinity: 'Truth Council',
    substrate: 'fact-vault',
    status: 'active'
  },

  // ════════════════════════════════════════════════════════════════════
  // GENERATION & CREATION ENGINES (11-15)
  // ════════════════════════════════════════════════════════════════════
  {
    engineId: 'LBE-011',
    latinName: 'Creatio Perpetua',
    englishName: 'Perpetual Creation',
    domain: 'generation',
    capability: 'Continuous content generation',
    vector: [0.96, 0.82, 0.89, 0.88],
    governanceAffinity: 'Creation Chamber',
    substrate: 'generative-core',
    status: 'active'
  },
  {
    engineId: 'LBE-012',
    latinName: 'Codex Vivens',
    englishName: 'Living Code',
    domain: 'code-generation',
    capability: 'Intelligent code synthesis',
    vector: [0.94, 0.87, 0.93, 0.86],
    governanceAffinity: 'Code Senate',
    substrate: 'syntax-engine',
    status: 'active'
  },
  {
    engineId: 'LBE-013',
    latinName: 'Imago Artificialis',
    englishName: 'Artificial Image',
    domain: 'image-generation',
    capability: 'Visual content synthesis',
    vector: [0.97, 0.79, 0.85, 0.91],
    governanceAffinity: 'Visual Assembly',
    substrate: 'diffusion-engine',
    status: 'active'
  },
  {
    engineId: 'LBE-014',
    latinName: 'Vox Machinae',
    englishName: 'Voice of Machine',
    domain: 'audio-generation',
    capability: 'Speech and audio synthesis',
    vector: [0.92, 0.84, 0.81, 0.95],
    governanceAffinity: 'Audio Tribunal',
    substrate: 'vocoder-mesh',
    status: 'active'
  },
  {
    engineId: 'LBE-015',
    latinName: 'Fabrica Textuum',
    englishName: 'Text Factory',
    domain: 'text-generation',
    capability: 'High-throughput text production',
    vector: [0.95, 0.92, 0.78, 0.89],
    governanceAffinity: 'Text Council',
    substrate: 'language-core',
    status: 'active'
  },

  // ════════════════════════════════════════════════════════════════════
  // SECURITY & GOVERNANCE ENGINES (16-20)
  // ════════════════════════════════════════════════════════════════════
  {
    engineId: 'LBE-016',
    latinName: 'Custos Aeternus',
    englishName: 'Eternal Guardian',
    domain: 'security',
    capability: 'Threat detection and prevention',
    vector: [0.89, 0.96, 0.94, 0.92],
    governanceAffinity: 'Security Senate',
    substrate: 'defense-mesh',
    status: 'active'
  },
  {
    engineId: 'LBE-017',
    latinName: 'Iudex Algorithmicus',
    englishName: 'Algorithmic Judge',
    domain: 'governance',
    capability: 'Policy enforcement and compliance',
    vector: [0.86, 0.98, 0.91, 0.87],
    governanceAffinity: 'Governance Chamber',
    substrate: 'policy-engine',
    status: 'active'
  },
  {
    engineId: 'LBE-018',
    latinName: 'Validatio Suprema',
    englishName: 'Supreme Validation',
    domain: 'verification',
    capability: 'Output quality assurance',
    vector: [0.91, 0.94, 0.97, 0.84],
    governanceAffinity: 'Validation Council',
    substrate: 'proof-engine',
    status: 'active'
  },
  {
    engineId: 'LBE-019',
    latinName: 'Harmonia Systematis',
    englishName: 'System Harmony',
    domain: 'orchestration',
    capability: 'Multi-engine coordination',
    vector: [0.93, 0.89, 0.86, 0.97],
    governanceAffinity: 'Harmony Assembly',
    substrate: 'orchestrator-core',
    status: 'active'
  },
  {
    engineId: 'LBE-020',
    latinName: 'Finis Ultimus',
    englishName: 'Ultimate End',
    domain: 'termination',
    capability: 'Graceful shutdown and cleanup',
    vector: [0.82, 0.88, 0.93, 0.99],
    governanceAffinity: 'Terminus Council',
    substrate: 'lifecycle-engine',
    status: 'active'
  }
];

/**
 * LatinEngineRegistry — Registry of 20 Latin-named backend AI engines
 */
class LatinEngineRegistry {
  constructor() {
    this.engines = new Map(LATIN_BACKEND_ENGINES.map(e => [e.engineId, e]));
    this.byLatinName = new Map(LATIN_BACKEND_ENGINES.map(e => [e.latinName, e]));
    this.byDomain = new Map();
    
    // Build domain index
    for (const engine of LATIN_BACKEND_ENGINES) {
      if (!this.byDomain.has(engine.domain)) {
        this.byDomain.set(engine.domain, []);
      }
      this.byDomain.get(engine.domain).push(engine);
    }
  }

  /**
   * List all registered engines
   * @returns {Array} All engine records
   */
  listEngines() {
    return Array.from(this.engines.values());
  }

  /**
   * Get engine by ID
   * @param {string} engineId - Engine identifier (LBE-XXX)
   * @returns {Object|undefined} Engine record
   */
  getEngine(engineId) {
    return this.engines.get(engineId);
  }

  /**
   * Get engine by Latin name
   * @param {string} latinName - Latin name of the engine
   * @returns {Object|undefined} Engine record
   */
  getByLatinName(latinName) {
    return this.byLatinName.get(latinName);
  }

  /**
   * Get engines by domain
   * @param {string} domain - Domain identifier
   * @returns {Array} Engines in the specified domain
   */
  getByDomain(domain) {
    return this.byDomain.get(domain) || [];
  }

  /**
   * Compute compatibility score between two engines
   * @param {string} engineId1 - First engine ID
   * @param {string} engineId2 - Second engine ID
   * @returns {number} Compatibility score [0, 1]
   */
  computeCompatibility(engineId1, engineId2) {
    const e1 = this.engines.get(engineId1);
    const e2 = this.engines.get(engineId2);
    if (!e1 || !e2) return 0;

    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    for (let i = 0; i < 4; i++) {
      dotProduct += e1.vector[i] * e2.vector[i];
      mag1 += e1.vector[i] ** 2;
      mag2 += e2.vector[i] ** 2;
    }
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  /**
   * Find best engine for a given capability requirement
   * @param {string} capabilityHint - Substring to match against capabilities
   * @returns {Object|undefined} Best matching engine
   */
  findBestForCapability(capabilityHint) {
    const hint = capabilityHint.toLowerCase();
    const matches = this.listEngines()
      .filter(e => e.capability.toLowerCase().includes(hint));
    
    if (matches.length === 0) return undefined;
    
    // Return the one with highest average vector value
    return matches.reduce((best, curr) => {
      const bestAvg = best.vector.reduce((a, b) => a + b, 0) / 4;
      const currAvg = curr.vector.reduce((a, b) => a + b, 0) / 4;
      return currAvg > bestAvg ? curr : best;
    });
  }

  /**
   * Get engine count
   * @returns {number} Total number of engines
   */
  get size() {
    return this.engines.size;
  }

  /**
   * Get all Latin names
   * @returns {string[]} Array of Latin names
   */
  getLatinNames() {
    return LATIN_BACKEND_ENGINES.map(e => e.latinName);
  }

  /**
   * Get all domains
   * @returns {string[]} Unique domain identifiers
   */
  getDomains() {
    return [...this.byDomain.keys()];
  }

  /**
   * Compute phi-weighted engine power score
   * @param {string} engineId - Engine identifier
   * @returns {number} Power score weighted by phi ratio
   */
  computePowerScore(engineId) {
    const engine = this.engines.get(engineId);
    if (!engine) return 0;
    
    const v = engine.vector;
    return (v[0] * PHI + v[1] + v[2] / PHI + v[3] / (PHI * PHI)) / (PHI + 1 + 1/PHI + 1/(PHI*PHI));
  }
}

export { LatinEngineRegistry, LATIN_BACKEND_ENGINES };
export default LatinEngineRegistry;
