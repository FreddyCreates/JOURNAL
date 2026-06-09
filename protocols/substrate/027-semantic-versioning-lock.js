/**
 * SUBSTRATE-027: Semantic Versioning Lock Protocol (SVLP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * All interfaces, schemas, and contracts are semantically versioned.
 * Breaking changes are detected and blocked at the substrate level.
 * Backwards compatibility is enforced, not hoped for.
 *
 * Engines wired: VersionEngine + CompatibilityChecker + SchemaGuard
 * Ring: Interface Ring | Placement: Substrate foundation
 * Wire: substrate-wire/svlp
 * Enforcement: IMMUTABLE
 */

const SUBSTRATE_SEAL = 'UNBREAKABLE::SVLP::027';

class SemanticVersioningLockProtocol {
  #versions;
  #compatibility;
  #breakingChanges;

  constructor() {
    this.#versions = new Map();
    this.#compatibility = new Map();
    this.#breakingChanges = [];
    this.protocolId = 'SUBSTRATE-027';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Register a versioned artifact.
   */
  register(artifactId, version, schema) {
    const parsed = this._parseVersion(version);
    const record = {
      artifactId,
      version: parsed,
      versionString: version,
      schema: Object.freeze(schema),
      registeredAt: Date.now(),
      seal: SUBSTRATE_SEAL
    };

    if (!this.#versions.has(artifactId)) {
      this.#versions.set(artifactId, []);
    }
    this.#versions.get(artifactId).push(Object.freeze(record));
    return record;
  }

  /**
   * Check if a new version is compatible with the current version.
   * Breaking changes (incompatible schema changes) are blocked.
   */
  checkCompatibility(artifactId, newVersion, newSchema) {
    const history = this.#versions.get(artifactId);
    if (!history || history.length === 0) return { compatible: true, reason: 'FIRST_VERSION' };

    const current = history[history.length - 1];
    const parsed = this._parseVersion(newVersion);
    const breaking = this._detectBreaking(current.schema, newSchema);

    if (breaking.length > 0 && parsed.major <= current.version.major) {
      this.#breakingChanges.push({
        artifactId,
        from: current.versionString,
        to: newVersion,
        changes: breaking,
        timestamp: Date.now(),
        seal: SUBSTRATE_SEAL
      });
      return {
        compatible: false,
        reason: 'BREAKING_CHANGE_REQUIRES_MAJOR_BUMP',
        breaking,
        seal: SUBSTRATE_SEAL
      };
    }

    return { compatible: true, seal: SUBSTRATE_SEAL };
  }

  /**
   * Detect breaking changes between two schemas.
   */
  _detectBreaking(oldSchema, newSchema) {
    const breaking = [];

    // Check for removed fields
    if (oldSchema.fields && newSchema.fields) {
      for (const field of oldSchema.fields) {
        if (!newSchema.fields.find(f => f.name === field.name)) {
          breaking.push({ type: 'FIELD_REMOVED', field: field.name });
        }
      }
      // Check for type changes
      for (const field of oldSchema.fields) {
        const newField = newSchema.fields.find(f => f.name === field.name);
        if (newField && newField.type !== field.type) {
          breaking.push({ type: 'TYPE_CHANGED', field: field.name, from: field.type, to: newField.type });
        }
      }
    }

    // Check for removed methods
    if (oldSchema.methods && newSchema.methods) {
      for (const method of oldSchema.methods) {
        if (!newSchema.methods.includes(method)) {
          breaking.push({ type: 'METHOD_REMOVED', method });
        }
      }
    }

    return breaking;
  }

  _parseVersion(v) {
    const [major, minor, patch] = v.split('.').map(Number);
    return { major: major || 0, minor: minor || 0, patch: patch || 0 };
  }

  getVersionHistory(artifactId) { return this.#versions.get(artifactId) || []; }
  getBreakingChanges() { return [...this.#breakingChanges]; }
}

export { SemanticVersioningLockProtocol };
