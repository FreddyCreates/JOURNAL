const PHI = 1.618033988749895;

/**
 * @typedef {Object} Template
 * @property {string} templateId
 * @property {string} type
 * @property {string[]} sections
 * @property {string[]} requiredFields
 * @property {string} jurisdiction
 * @property {number} registeredAt
 */

/**
 * @typedef {Object} Draft
 * @property {string} draftId
 * @property {string} templateId
 * @property {string} type
 * @property {Object} context
 * @property {Map<string, string>} sectionContent
 * @property {string[]} allSections
 * @property {string[]} requiredFields
 * @property {number} createdAt
 * @property {number} lastModifiedAt
 */

/**
 * DocumentDrafter — AI-assisted legal document drafting with templates
 * and assembly. Supports registration of document templates, section-by-
 * section drafting, validation, and export in multiple output formats.
 */
export class DocumentDrafter {
  /** @type {Map<string, Template>} */
  #templates;

  /** @type {Map<string, Draft>} */
  #drafts;

  /** @type {string[]} */
  #validDocTypes;

  /** @type {number} */
  #draftCount;

  /** @type {number} */
  #exportCount;

  constructor() {
    this.#templates = new Map();
    this.#drafts = new Map();
    this.#validDocTypes = [
      'motion', 'brief', 'complaint', 'answer', 'discovery-request',
      'settlement', 'contract', 'memorandum', 'affidavit',
    ];
    this.#draftCount = 0;
    this.#exportCount = 0;
  }

  /**
   * Registers a document template.
   *
   * Templates define the structure, required fields, and jurisdiction
   * for a specific document type. Each section becomes a fillable
   * slot in the resulting draft.
   *
   * @param {string} templateId — unique template identifier
   * @param {Object} config — template configuration
   * @param {string} config.type — document type
   * @param {string[]} config.sections — ordered list of section names
   * @param {string[]} config.requiredFields — fields that must appear in context
   * @param {string} [config.jurisdiction] — applicable jurisdiction
   * @returns {{ templateId: string, type: string, sectionCount: number, registeredAt: number }}
   */
  registerTemplate(templateId, config) {
    if (this.#templates.has(templateId)) {
      throw new Error(`Template "${templateId}" already registered.`);
    }
    if (!this.#validDocTypes.includes(config.type)) {
      throw new Error(`Invalid document type "${config.type}". Valid: ${this.#validDocTypes.join(', ')}`);
    }

    const template = {
      templateId,
      type: config.type,
      sections: [...config.sections],
      requiredFields: [...(config.requiredFields ?? [])],
      jurisdiction: config.jurisdiction ?? 'general',
      registeredAt: Date.now(),
    };

    this.#templates.set(templateId, template);
    return { templateId, type: template.type, sectionCount: template.sections.length, registeredAt: template.registeredAt };
  }

  /**
   * Drafts a document from a template and context data.
   *
   * Context values populate the template's required fields. Sections
   * are initialized as empty and must be filled using fillSection().
   * A unique draft ID is generated using phi-based hashing.
   *
   * @param {string} templateId — template to use
   * @param {Object} context — key-value context data
   * @returns {{ draftId: string, templateId: string, type: string, sections: string[], createdAt: number }}
   */
  draft(templateId, context) {
    const tmpl = this.#templates.get(templateId);
    if (!tmpl) throw new Error(`Template "${templateId}" not found.`);

    for (const field of tmpl.requiredFields) {
      if (!(field in context)) {
        throw new Error(`Missing required field "${field}" in context.`);
      }
    }

    const draftId = `draft-${templateId}-${Math.floor(Date.now() * PHI) % 1000000}`;
    const sectionContent = new Map();
    for (const sec of tmpl.sections) {
      sectionContent.set(sec, '');
    }

    const now = Date.now();
    this.#drafts.set(draftId, {
      draftId,
      templateId,
      type: tmpl.type,
      context: { ...context },
      sectionContent,
      allSections: [...tmpl.sections],
      requiredFields: [...tmpl.requiredFields],
      createdAt: now,
      lastModifiedAt: now,
    });

    this.#draftCount++;
    return { draftId, templateId, type: tmpl.type, sections: [...tmpl.sections], createdAt: now };
  }

  /**
   * Fills a specific section with content.
   *
   * @param {string} draftId — target draft
   * @param {string} sectionId — section name to fill
   * @param {string} content — section content text
   * @returns {{ draftId: string, sectionId: string, contentLength: number, updatedAt: number }}
   */
  fillSection(draftId, sectionId, content) {
    const d = this._getDraft(draftId);
    if (!d.sectionContent.has(sectionId)) {
      throw new Error(`Section "${sectionId}" not found in draft "${draftId}".`);
    }

    d.sectionContent.set(sectionId, content);
    d.lastModifiedAt = Date.now();
    return { draftId, sectionId, contentLength: content.length, updatedAt: d.lastModifiedAt };
  }

  /**
   * Returns the current state of a draft including all sections.
   *
   * @param {string} draftId
   * @returns {{ draftId: string, type: string, context: Object, sections: Object, createdAt: number, lastModifiedAt: number }}
   */
  getDraft(draftId) {
    const d = this._getDraft(draftId);
    const sections = {};
    for (const [key, val] of d.sectionContent) {
      sections[key] = val;
    }
    return {
      draftId: d.draftId,
      type: d.type,
      context: { ...d.context },
      sections,
      createdAt: d.createdAt,
      lastModifiedAt: d.lastModifiedAt,
    };
  }

  /**
   * Validates draft completeness and structure.
   *
   * Checks that all sections are filled and all required context
   * fields are present. Returns a phi-weighted completeness score.
   *
   * @param {string} draftId
   * @returns {{ valid: boolean, completeness: number, emptySections: string[], missingFields: string[] }}
   */
  validateDraft(draftId) {
    const d = this._getDraft(draftId);
    const emptySections = [];
    let filledCount = 0;

    for (const [sec, content] of d.sectionContent) {
      if (content.trim().length === 0) {
        emptySections.push(sec);
      } else {
        filledCount++;
      }
    }

    const missingFields = d.requiredFields.filter((f) => !(f in d.context));
    const sectionRatio = d.allSections.length > 0 ? filledCount / d.allSections.length : 0;
    const fieldRatio = d.requiredFields.length > 0
      ? (d.requiredFields.length - missingFields.length) / d.requiredFields.length
      : 1;

    const raw = (sectionRatio * PHI + fieldRatio) / (PHI + 1);
    const completeness = Math.round(raw * 10000) / 10000;
    const valid = emptySections.length === 0 && missingFields.length === 0;

    return { valid, completeness, emptySections, missingFields };
  }

  /**
   * Exports a draft in the specified format.
   *
   * Supported formats: 'text' (plain text), 'structured' (JSON object),
   * 'outline' (hierarchical outline).
   *
   * @param {string} draftId
   * @param {'text'|'structured'|'outline'} format — output format
   * @returns {{ draftId: string, format: string, output: string|Object, exportedAt: number }}
   */
  exportDraft(draftId, format = 'text') {
    const d = this._getDraft(draftId);
    const validFormats = ['text', 'structured', 'outline'];
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format "${format}". Valid: ${validFormats.join(', ')}`);
    }

    let output;

    if (format === 'text') {
      const lines = [`DOCUMENT: ${d.type.toUpperCase()}`, `Jurisdiction: ${d.context.jurisdiction ?? 'N/A'}`, ''];
      for (const sec of d.allSections) {
        lines.push(`--- ${sec.toUpperCase()} ---`);
        lines.push(d.sectionContent.get(sec) || '[EMPTY]');
        lines.push('');
      }
      output = lines.join('\n');
    } else if (format === 'structured') {
      const sections = {};
      for (const [key, val] of d.sectionContent) {
        sections[key] = val;
      }
      output = { type: d.type, context: { ...d.context }, sections };
    } else {
      const items = d.allSections.map((sec, i) => {
        const content = d.sectionContent.get(sec) || '[EMPTY]';
        const preview = content.length > 80 ? content.slice(0, 80) + '...' : content;
        return `${i + 1}. ${sec}: ${preview}`;
      });
      output = items.join('\n');
    }

    this.#exportCount++;
    return { draftId, format, output, exportedAt: Date.now() };
  }

  /**
   * Returns aggregate drafting statistics.
   *
   * @returns {{ totalTemplates: number, totalDrafts: number, draftCount: number, exportCount: number, templatesByType: Object }}
   */
  getDraftingStats() {
    const templatesByType = {};
    for (const t of this.#templates.values()) {
      templatesByType[t.type] = (templatesByType[t.type] ?? 0) + 1;
    }
    return {
      totalTemplates: this.#templates.size,
      totalDrafts: this.#drafts.size,
      draftCount: this.#draftCount,
      exportCount: this.#exportCount,
      templatesByType,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Retrieves a draft or throws if not found.
   * @private
   * @param {string} draftId
   * @returns {Draft}
   */
  _getDraft(draftId) {
    const d = this.#drafts.get(draftId);
    if (!d) throw new Error(`Draft "${draftId}" not found.`);
    return d;
  }
}

export default DocumentDrafter;
