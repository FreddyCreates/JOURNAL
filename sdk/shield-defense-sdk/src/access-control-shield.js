import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} Role
 * @property {string} roleId
 * @property {Set<string>} permissions
 * @property {number} trustTier — 1 (lowest) to 5 (highest)
 * @property {string} createdAt
 */

/**
 * @typedef {Object} EntityAssignment
 * @property {string} entityId
 * @property {string} roleId
 * @property {number} baseTier
 * @property {number} elevatedTier
 * @property {number|null} elevationExpiresAt
 * @property {string} assignedAt
 */

/**
 * @typedef {Object} AccessLogEntry
 * @property {string} id
 * @property {string} entityId
 * @property {string} resource
 * @property {string} action
 * @property {boolean} granted
 * @property {number} effectiveTier
 * @property {number} timestamp
 */

/**
 * AccessControlShield — role-based access control with phi-weighted
 * trust tiers for organism security. Supports role registration,
 * entity assignment, permission checking, temporary trust elevation
 * with phi-decay, and audit trails.
 */
export class AccessControlShield {
  /** @type {Map<string, Role>} */
  #roles;

  /** @type {Map<string, EntityAssignment>} */
  #entities;

  /** @type {Array<AccessLogEntry>} */
  #accessLog;

  /** @type {number} */
  #elevationDurationMs;

  /**
   * @param {Object} [config]
   * @param {number} [config.elevationDurationMs=3600000] — base elevation duration (default 1h)
   */
  constructor(config = {}) {
    this.#roles = new Map();
    this.#entities = new Map();
    this.#accessLog = [];
    this.#elevationDurationMs = config.elevationDurationMs ?? 3600000;
  }

  /**
   * Registers a new role with a set of permissions and trust tier.
   *
   * Trust tiers range from 1 (basic access) to 5 (sovereign access).
   * Permissions are strings in the format "resource:action" (e.g. "data:read").
   *
   * @param {string} roleId — unique role identifier
   * @param {string[]} permissions — array of permission strings
   * @param {number} trustTier — trust tier level (1-5)
   * @returns {{ roleId: string, permissionCount: number, trustTier: number }}
   */
  registerRole(roleId, permissions, trustTier) {
    if (this.#roles.has(roleId)) {
      throw new Error(`Role "${roleId}" already exists`);
    }
    if (trustTier < 1 || trustTier > 5 || !Number.isInteger(trustTier)) {
      throw new Error(`Trust tier must be an integer between 1 and 5, got ${trustTier}`);
    }
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error('Permissions must be a non-empty array of strings');
    }

    this.#roles.set(roleId, {
      roleId,
      permissions: new Set(permissions),
      trustTier,
      createdAt: new Date().toISOString(),
    });

    return { roleId, permissionCount: permissions.length, trustTier };
  }

  /**
   * Assigns a role to an entity (user, service, or organism component).
   *
   * The entity inherits the role's trust tier as its base tier.
   * If the entity already has a role, it is reassigned.
   *
   * @param {string} entityId — unique entity identifier
   * @param {string} roleId — the role to assign
   * @returns {{ entityId: string, roleId: string, trustTier: number }}
   */
  assignRole(entityId, roleId) {
    const role = this.#roles.get(roleId);
    if (!role) {
      throw new Error(`Role "${roleId}" not found. Register it first.`);
    }

    this.#entities.set(entityId, {
      entityId,
      roleId,
      baseTier: role.trustTier,
      elevatedTier: role.trustTier,
      elevationExpiresAt: null,
      assignedAt: new Date().toISOString(),
    });

    return { entityId, roleId, trustTier: role.trustTier };
  }

  /**
   * Checks if an entity can perform an action on a resource.
   *
   * Permission is checked against the entity's assigned role. If the
   * entity has a temporary elevation, the elevated tier is used. Access
   * attempts are logged for audit purposes.
   *
   * @param {string} entityId — the entity requesting access
   * @param {string} resource — the resource being accessed
   * @param {string} action — the action being performed
   * @returns {{ granted: boolean, entityId: string, resource: string, action: string, effectiveTier: number, reason: string }}
   */
  checkAccess(entityId, resource, action) {
    const entity = this.#entities.get(entityId);
    if (!entity) {
      const logEntry = this._logAccess(entityId, resource, action, false, 0);
      return {
        granted: false,
        entityId,
        resource,
        action,
        effectiveTier: 0,
        reason: `Entity "${entityId}" has no assigned role`,
      };
    }

    const role = this.#roles.get(entity.roleId);
    if (!role) {
      const logEntry = this._logAccess(entityId, resource, action, false, 0);
      return {
        granted: false,
        entityId,
        resource,
        action,
        effectiveTier: 0,
        reason: `Role "${entity.roleId}" no longer exists`,
      };
    }

    this._decayElevation(entity);
    const effectiveTier = entity.elevatedTier;
    const permissionKey = `${resource}:${action}`;
    const wildcardKey = `${resource}:*`;
    const hasPermission = role.permissions.has(permissionKey) || role.permissions.has(wildcardKey);
    const granted = hasPermission && effectiveTier >= 1;

    this._logAccess(entityId, resource, action, granted, effectiveTier);

    const reason = granted
      ? `Permitted by role "${entity.roleId}" at tier ${effectiveTier}`
      : `Denied — ${hasPermission ? 'insufficient tier' : 'no matching permission'}`;

    return { granted, entityId, resource, action, effectiveTier, reason };
  }

  /**
   * Temporarily elevates an entity's trust tier.
   *
   * The elevation decays over time using phi-weighted decay:
   * effectiveTier = baseTier + (elevatedTier - baseTier) × PHI^(-elapsed/duration)
   *
   * @param {string} entityId — the entity to elevate
   * @param {number} newTier — the elevated trust tier (must be > current base tier, max 5)
   * @returns {{ entityId: string, previousTier: number, elevatedTier: number, expiresAt: number, decayModel: string }}
   */
  elevate(entityId, newTier) {
    const entity = this.#entities.get(entityId);
    if (!entity) {
      throw new Error(`Entity "${entityId}" not found. Assign a role first.`);
    }
    if (newTier < entity.baseTier || newTier > 5) {
      throw new Error(`Elevated tier must be between ${entity.baseTier} and 5, got ${newTier}`);
    }

    const previousTier = entity.elevatedTier;
    entity.elevatedTier = newTier;
    entity.elevationExpiresAt = Date.now() + this.#elevationDurationMs;

    return {
      entityId,
      previousTier,
      elevatedTier: newTier,
      expiresAt: entity.elevationExpiresAt,
      decayModel: `tier = ${entity.baseTier} + ${newTier - entity.baseTier} × PHI^(-t/${this.#elevationDurationMs}ms)`,
    };
  }

  /**
   * Returns the full access attempt log.
   *
   * @returns {AccessLogEntry[]}
   */
  getAccessLog() {
    return this.#accessLog.map((entry) => ({ ...entry }));
  }

  /**
   * Audits all access patterns for suspicious activity.
   *
   * Suspicious patterns include:
   * - High denial rates (> 1/PHI of attempts denied)
   * - Rapid-fire access attempts from a single entity
   * - Access attempts during active elevation (potential privilege abuse)
   *
   * @returns {{ suspicious: Array<Object>, totalEntries: number, denialRate: number, riskScore: number }}
   */
  audit() {
    const suspicious = [];
    const entityStats = new Map();

    for (const entry of this.#accessLog) {
      let stats = entityStats.get(entry.entityId);
      if (!stats) {
        stats = { granted: 0, denied: 0, timestamps: [], elevated: 0 };
        entityStats.set(entry.entityId, stats);
      }
      if (entry.granted) stats.granted++;
      else stats.denied++;
      stats.timestamps.push(entry.timestamp);
      if (entry.effectiveTier > (this.#entities.get(entry.entityId)?.baseTier ?? 0)) {
        stats.elevated++;
      }
    }

    let totalDenied = 0;
    let totalEntries = this.#accessLog.length;

    for (const [entityId, stats] of entityStats) {
      const total = stats.granted + stats.denied;
      const denialRate = total > 0 ? stats.denied / total : 0;
      totalDenied += stats.denied;

      if (denialRate > 1 / PHI) {
        suspicious.push({
          entityId,
          type: 'high_denial_rate',
          denialRate: Math.round(denialRate * 10000) / 10000,
          attempts: total,
        });
      }

      if (stats.timestamps.length >= 3) {
        const sorted = stats.timestamps.slice().sort((a, b) => a - b);
        for (let i = 2; i < sorted.length; i++) {
          const burst = sorted[i] - sorted[i - 2];
          if (burst < 100) {
            suspicious.push({
              entityId,
              type: 'rapid_fire',
              burstWindowMs: burst,
              attempts: stats.timestamps.length,
            });
            break;
          }
        }
      }

      if (stats.elevated > total * (1 / PHI)) {
        suspicious.push({
          entityId,
          type: 'excessive_elevation',
          elevatedAttempts: stats.elevated,
          totalAttempts: total,
        });
      }
    }

    const globalDenialRate = totalEntries > 0 ? totalDenied / totalEntries : 0;
    const riskScore = Math.min(1, globalDenialRate * PHI + suspicious.length * (1 / (PHI * PHI)));

    return {
      suspicious,
      totalEntries,
      denialRate: Math.round(globalDenialRate * 10000) / 10000,
      riskScore: Math.round(riskScore * 10000) / 10000,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Applies phi-weighted decay to an entity's elevated tier.
   * @private
   * @param {EntityAssignment} entity
   */
  _decayElevation(entity) {
    if (entity.elevationExpiresAt === null) return;

    const now = Date.now();
    if (now >= entity.elevationExpiresAt) {
      entity.elevatedTier = entity.baseTier;
      entity.elevationExpiresAt = null;
      return;
    }

    const elapsed = now - (entity.elevationExpiresAt - this.#elevationDurationMs);
    const decayFactor = Math.pow(PHI, -(elapsed / this.#elevationDurationMs));
    const boost = (entity.elevatedTier - entity.baseTier) * decayFactor;
    entity.elevatedTier = Math.max(entity.baseTier, Math.round((entity.baseTier + boost) * 100) / 100);
  }

  /**
   * Logs an access attempt.
   * @private
   * @param {string} entityId
   * @param {string} resource
   * @param {string} action
   * @param {boolean} granted
   * @param {number} effectiveTier
   * @returns {AccessLogEntry}
   */
  _logAccess(entityId, resource, action, granted, effectiveTier) {
    const entry = {
      id: crypto.randomUUID(),
      entityId,
      resource,
      action,
      granted,
      effectiveTier,
      timestamp: Date.now(),
    };
    this.#accessLog.push(entry);
    return entry;
  }
}

export default AccessControlShield;
