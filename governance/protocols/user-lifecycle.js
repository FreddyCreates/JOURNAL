/**
 * User Lifecycle Governance Protocol
 * 
 * Governs user identity, roles, permissions, consent, data sovereignty,
 * onboarding, offboarding, and inter-user interactions within the organism.
 * 
 * Protocol ID: GOV-USER-001
 * Layer: Governance Macro
 * Authority: CIVOS PRIME + SENTINEL
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

export class UserLifecycleProtocol {
  constructor() {
    this.id = 'GOV-USER-001';
    this.name = 'User Lifecycle Governance Protocol';
    this.version = '1.0.0';
    this.status = 'ACTIVE';
    this.users = new Map();
    this.roles = new Map();
    this.auditLog = [];
  }

  /**
   * Register a new user in the governance system
   */
  registerUser(userId, profile = {}) {
    if (this.users.has(userId)) {
      return { success: false, reason: 'User already exists' };
    }
    const user = {
      id: userId,
      status: 'pending',
      roles: [],
      permissions: [],
      registeredAt: new Date().toISOString(),
      consentGiven: false,
      dataSovereignty: 'user-owned',
      trustScore: 0,
      activityLog: [],
      ...profile,
    };
    this.users.set(userId, user);
    this._audit('USER_REGISTERED', userId);
    return { success: true, user };
  }

  /**
   * Activate a user (post-consent)
   */
  activateUser(userId) {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    if (!user.consentGiven) return { success: false, reason: 'Consent not given' };
    user.status = 'active';
    user.activatedAt = new Date().toISOString();
    user.trustScore = PHI_INV * 0.5; // Initial trust at 50% of φ⁻¹
    this._audit('USER_ACTIVATED', userId);
    return { success: true, user };
  }

  /**
   * Record user consent
   */
  giveConsent(userId, scope = 'full') {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    user.consentGiven = true;
    user.consentScope = scope;
    user.consentAt = new Date().toISOString();
    this._audit('CONSENT_GIVEN', userId, { scope });
    return { success: true };
  }

  /**
   * Assign role to user
   */
  assignRole(userId, roleName) {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    if (user.status !== 'active') return { success: false, reason: 'User not active' };
    if (!user.roles.includes(roleName)) {
      user.roles.push(roleName);
    }
    this._audit('ROLE_ASSIGNED', userId, { role: roleName });
    return { success: true, roles: user.roles };
  }

  /**
   * Revoke role from user
   */
  revokeRole(userId, roleName) {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    user.roles = user.roles.filter(r => r !== roleName);
    this._audit('ROLE_REVOKED', userId, { role: roleName });
    return { success: true, roles: user.roles };
  }

  /**
   * Check if user has permission (role-based)
   */
  hasPermission(userId, permission) {
    const user = this.users.get(userId);
    if (!user || user.status !== 'active') return false;
    return user.permissions.includes(permission) || user.roles.includes('admin');
  }

  /**
   * Suspend user (governance action)
   */
  suspendUser(userId, reason) {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    user.status = 'suspended';
    user.suspendedAt = new Date().toISOString();
    user.suspensionReason = reason;
    this._audit('USER_SUSPENDED', userId, { reason });
    return { success: true };
  }

  /**
   * Offboard user (data sovereignty preserved)
   */
  offboardUser(userId) {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    user.status = 'offboarded';
    user.offboardedAt = new Date().toISOString();
    user.dataSovereignty = 'export-pending';
    this._audit('USER_OFFBOARDED', userId);
    return { success: true, exportRequired: true };
  }

  /**
   * Update trust score based on activity
   */
  updateTrust(userId, delta) {
    const user = this.users.get(userId);
    if (!user) return { success: false, reason: 'User not found' };
    user.trustScore = Math.max(0, Math.min(1, user.trustScore + delta));
    this._audit('TRUST_UPDATED', userId, { delta, newScore: user.trustScore });
    return { success: true, trustScore: user.trustScore };
  }

  /**
   * Get user governance status
   */
  getStatus(userId) {
    const user = this.users.get(userId);
    if (!user) return null;
    return {
      id: user.id,
      status: user.status,
      roles: user.roles,
      trustScore: user.trustScore,
      dataSovereignty: user.dataSovereignty,
      consentGiven: user.consentGiven,
    };
  }

  /**
   * Calculate system-wide user health
   */
  getSystemHealth() {
    const total = this.users.size;
    if (total === 0) return { score: 1.0, status: 'empty' };
    const active = [...this.users.values()].filter(u => u.status === 'active').length;
    const ratio = active / total;
    return {
      score: ratio,
      status: ratio >= PHI_INV ? 'healthy' : 'degraded',
      total,
      active,
      suspended: [...this.users.values()].filter(u => u.status === 'suspended').length,
    };
  }

  _audit(action, userId, meta = {}) {
    this.auditLog.push({
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...meta,
    });
  }
}

export default UserLifecycleProtocol;
