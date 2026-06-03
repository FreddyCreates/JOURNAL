/**
 * @medina/ux-ai-multi-engine — UX Model Registry
 *
 * Registry of UX intelligence models organized into three categories:
 *   1. Component Models — AI models for UI component intelligence
 *   2. Interaction Models — AI models for user interaction patterns
 *   3. Layout Models — AI models for spatial/structural intelligence
 *
 * Each model has 5 intelligence capabilities and a phi-encoded priority score.
 *
 * @module @medina/ux-ai-multi-engine/ux-model-registry
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * @typedef {Object} UXModel
 * @property {string} modelId
 * @property {string} name
 * @property {string} category — 'component'|'interaction'|'layout'
 * @property {string[]} capabilities — 5 intelligence capabilities
 * @property {number} priorityScore — phi-encoded priority
 * @property {string} engineType — which engine type processes this model
 * @property {Object} metadata
 */

/** 10 Component Models */
const COMPONENT_MODELS = [
  { id: 'UXM-C01', name: 'ButtonIntelligence', capabilities: ['click-prediction', 'state-adaptation', 'hover-anticipation', 'accessibility-tune', 'micro-animation'] },
  { id: 'UXM-C02', name: 'FormCognition', capabilities: ['field-validation', 'auto-complete', 'error-prevention', 'flow-optimization', 'input-prediction'] },
  { id: 'UXM-C03', name: 'CardOrganizer', capabilities: ['content-ranking', 'density-adaptation', 'visual-hierarchy', 'lazy-generation', 'context-fusion'] },
  { id: 'UXM-C04', name: 'NavigationSense', capabilities: ['path-prediction', 'breadcrumb-intelligence', 'menu-adaptation', 'shortcut-learning', 'depth-optimization'] },
  { id: 'UXM-C05', name: 'ModalIntelligence', capabilities: ['timing-optimization', 'content-relevance', 'dismissal-prediction', 'focus-management', 'urgency-detection'] },
  { id: 'UXM-C06', name: 'TableMind', capabilities: ['sort-prediction', 'filter-learning', 'column-prioritization', 'pagination-anticipation', 'data-highlighting'] },
  { id: 'UXM-C07', name: 'SearchBrain', capabilities: ['query-completion', 'result-ranking', 'typo-correction', 'intent-detection', 'facet-suggestion'] },
  { id: 'UXM-C08', name: 'MediaSense', capabilities: ['load-optimization', 'format-selection', 'alt-generation', 'crop-intelligence', 'quality-adaptation'] },
  { id: 'UXM-C09', name: 'TooltipAwareness', capabilities: ['timing-intelligence', 'content-adaptation', 'placement-optimization', 'relevance-scoring', 'dismissal-learning'] },
  { id: 'UXM-C10', name: 'NotificationBrain', capabilities: ['priority-routing', 'timing-optimization', 'grouping-intelligence', 'action-prediction', 'fatigue-detection'] }
];

/** 10 Interaction Models */
const INTERACTION_MODELS = [
  { id: 'UXM-I01', name: 'ClickPatternAnalyzer', capabilities: ['rage-detection', 'double-click-handling', 'target-prediction', 'click-path-analysis', 'dead-zone-detection'] },
  { id: 'UXM-I02', name: 'ScrollIntelligence', capabilities: ['velocity-prediction', 'content-preload', 'anchor-detection', 'infinite-optimization', 'scroll-fatigue'] },
  { id: 'UXM-I03', name: 'GestureRecognition', capabilities: ['swipe-classification', 'pinch-detection', 'multi-touch-analysis', 'gesture-completion', 'intent-mapping'] },
  { id: 'UXM-I04', name: 'HoverAnalytics', capabilities: ['intent-prediction', 'dwell-analysis', 'path-tracking', 'attention-mapping', 'exit-prediction'] },
  { id: 'UXM-I05', name: 'KeyboardIntelligence', capabilities: ['shortcut-learning', 'typing-prediction', 'command-detection', 'accessibility-routing', 'input-optimization'] },
  { id: 'UXM-I06', name: 'VoiceInterface', capabilities: ['command-parsing', 'tone-analysis', 'intent-extraction', 'feedback-synthesis', 'noise-filtering'] },
  { id: 'UXM-I07', name: 'DragDropEngine', capabilities: ['target-prediction', 'snap-intelligence', 'reorder-optimization', 'collision-prevention', 'gesture-completion'] },
  { id: 'UXM-I08', name: 'FocusTracker', capabilities: ['tab-prediction', 'focus-trap-management', 'skip-detection', 'attention-routing', 'accessibility-compliance'] },
  { id: 'UXM-I09', name: 'IdleDetector', capabilities: ['timeout-prediction', 'engagement-scoring', 'away-detection', 'return-preparation', 'session-optimization'] },
  { id: 'UXM-I10', name: 'MultiDeviceSync', capabilities: ['state-transfer', 'context-continuation', 'device-adaptation', 'handoff-prediction', 'sync-optimization'] }
];

/** 10 Layout Models */
const LAYOUT_MODELS = [
  { id: 'UXM-L01', name: 'GridIntelligence', capabilities: ['responsive-prediction', 'density-optimization', 'gap-adaptation', 'column-intelligence', 'breakpoint-anticipation'] },
  { id: 'UXM-L02', name: 'FlexboxBrain', capabilities: ['direction-optimization', 'wrap-prediction', 'alignment-intelligence', 'growth-calculation', 'shrink-optimization'] },
  { id: 'UXM-L03', name: 'SpacingEngine', capabilities: ['rhythm-detection', 'density-adaptation', 'whitespace-optimization', 'margin-collapse', 'padding-intelligence'] },
  { id: 'UXM-L04', name: 'TypographyScale', capabilities: ['size-adaptation', 'line-height-optimization', 'font-selection', 'readability-scoring', 'hierarchy-detection'] },
  { id: 'UXM-L05', name: 'ColorHarmony', capabilities: ['contrast-optimization', 'palette-generation', 'mood-detection', 'accessibility-compliance', 'theme-adaptation'] },
  { id: 'UXM-L06', name: 'AnimationTiming', capabilities: ['easing-selection', 'duration-optimization', 'stagger-intelligence', 'motion-reduction', 'performance-balancing'] },
  { id: 'UXM-L07', name: 'ZIndexManager', capabilities: ['layer-optimization', 'overlap-prevention', 'context-stacking', 'modal-management', 'tooltip-layering'] },
  { id: 'UXM-L08', name: 'ViewportOptimizer', capabilities: ['fold-detection', 'content-prioritization', 'above-fold-optimization', 'scroll-depth-prediction', 'viewport-adaptation'] },
  { id: 'UXM-L09', name: 'AccessibilityEngine', capabilities: ['aria-generation', 'contrast-enforcement', 'focus-visible-management', 'screen-reader-optimization', 'semantic-structure'] },
  { id: 'UXM-L10', name: 'PerformanceSense', capabilities: ['render-prediction', 'paint-optimization', 'layout-shift-prevention', 'hydration-intelligence', 'bundle-optimization'] }
];

class UXModelRegistry {
  constructor() {
    /** @type {Map<string, UXModel>} */
    this.models = new Map();

    /** @type {Map<string, Set<string>>} category → modelIds */
    this.categoryIndex = new Map();

    /** @type {Map<string, Set<string>>} capability → modelIds */
    this.capabilityIndex = new Map();

    this._initializeModels();
  }

  /**
   * Initialize all 30 UX models with phi-encoded priority scores.
   * @private
   */
  _initializeModels() {
    const allModels = [
      ...COMPONENT_MODELS.map(m => ({ ...m, category: 'component', engineType: 'perception' })),
      ...INTERACTION_MODELS.map(m => ({ ...m, category: 'interaction', engineType: 'interaction' })),
      ...LAYOUT_MODELS.map(m => ({ ...m, category: 'layout', engineType: 'adaptation' }))
    ];

    allModels.forEach((m, index) => {
      const priorityScore = (index + 1) * PHI_INVERSE / allModels.length;
      const model = {
        modelId: m.id,
        name: m.name,
        category: m.category,
        capabilities: m.capabilities,
        priorityScore,
        engineType: m.engineType,
        phiWeight: PHI / (index + 1),
        registeredAt: Date.now(),
        metadata: {}
      };

      this.models.set(m.id, model);

      // Category index
      if (!this.categoryIndex.has(m.category)) {
        this.categoryIndex.set(m.category, new Set());
      }
      this.categoryIndex.get(m.category).add(m.id);

      // Capability index
      for (const cap of m.capabilities) {
        if (!this.capabilityIndex.has(cap)) {
          this.capabilityIndex.set(cap, new Set());
        }
        this.capabilityIndex.get(cap).add(m.id);
      }
    });
  }

  /* ================================================================== */
  /*  Query Methods                                                       */
  /* ================================================================== */

  /**
   * Get a model by ID.
   * @param {string} modelId
   * @returns {UXModel|undefined}
   */
  getModel(modelId) {
    return this.models.get(modelId);
  }

  /**
   * List all models.
   * @returns {UXModel[]}
   */
  listModels() {
    return Array.from(this.models.values());
  }

  /**
   * Get models by category.
   * @param {string} category — 'component'|'interaction'|'layout'
   * @returns {UXModel[]}
   */
  getByCategory(category) {
    const ids = this.categoryIndex.get(category);
    if (!ids) return [];
    return Array.from(ids).map(id => this.models.get(id)).filter(Boolean);
  }

  /**
   * Find models that have a specific capability.
   * @param {string} capability
   * @returns {UXModel[]}
   */
  findByCapability(capability) {
    const ids = this.capabilityIndex.get(capability);
    if (!ids) return [];
    return Array.from(ids).map(id => this.models.get(id)).filter(Boolean);
  }

  /**
   * Search models by name (partial match, case-insensitive).
   * @param {string} query
   * @returns {UXModel[]}
   */
  search(query) {
    const lower = query.toLowerCase();
    return Array.from(this.models.values())
      .filter(m => m.name.toLowerCase().includes(lower) || m.modelId.toLowerCase().includes(lower));
  }

  /**
   * Get top N models by priority score.
   * @param {number} [n=5]
   * @returns {UXModel[]}
   */
  getTopModels(n = 5) {
    return Array.from(this.models.values())
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, n);
  }

  /**
   * Get all unique capabilities across all models.
   * @returns {string[]}
   */
  listCapabilities() {
    return Array.from(this.capabilityIndex.keys());
  }

  /**
   * Get all categories.
   * @returns {string[]}
   */
  listCategories() {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Get registry statistics.
   * @returns {Object}
   */
  getStats() {
    return {
      totalModels: this.models.size,
      categories: Object.fromEntries(
        Array.from(this.categoryIndex.entries()).map(([k, v]) => [k, v.size])
      ),
      totalCapabilities: this.capabilityIndex.size,
      averagePriority: Array.from(this.models.values()).reduce((s, m) => s + m.priorityScore, 0) / this.models.size
    };
  }
}

export { UXModelRegistry, COMPONENT_MODELS, INTERACTION_MODELS, LAYOUT_MODELS };
export default UXModelRegistry;
