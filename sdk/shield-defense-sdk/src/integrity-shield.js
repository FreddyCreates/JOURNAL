const PHI = 1.618033988749895;

/**
 * @typedef {Object} IntegritySeal
 * @property {string} hash
 * @property {number} timestamp
 * @property {number} dataLength
 * @property {number} phiFingerprint
 */

/**
 * @typedef {Object} MonitoredRegister
 * @property {string} registerId
 * @property {*} data
 * @property {IntegritySeal} seal
 * @property {*} backup
 * @property {number} checkCount
 * @property {number} failureCount
 * @property {string} status — 'intact' | 'compromised' | 'healed'
 * @property {number} lastCheckedAt
 */

/**
 * IntegrityShield — data integrity verification using phi-weighted
 * checksums. Monitors organism data registers for unauthorized
 * modifications and provides self-healing capabilities.
 */
export class IntegrityShield {
  /** @type {Map<string, MonitoredRegister>} */
  #registers;

  /** @type {number} */
  #totalSeals;

  /** @type {number} */
  #totalVerifications;

  /** @type {number} */
  #totalFailures;

  constructor() {
    this.#registers = new Map();
    this.#totalSeals = 0;
    this.#totalVerifications = 0;
    this.#totalFailures = 0;
  }

  /**
   * Computes an integrity seal (hash) for the given data.
   *
   * The seal combines a standard DJB2 hash with a phi-weighted
   * fingerprint that captures the structural signature of the data.
   * This dual-hash approach detects both content and structural changes.
   *
   * @param {*} data — any JSON-serializable data
   * @returns {IntegritySeal}
   */
  seal(data) {
    const serialized = JSON.stringify(data);
    const hash = this._djb2Hash(serialized);
    const phiFingerprint = this._phiFingerprint(serialized);

    this.#totalSeals++;

    return {
      hash,
      timestamp: Date.now(),
      dataLength: serialized.length,
      phiFingerprint,
    };
  }

  /**
   * Verifies data against its integrity seal.
   *
   * Both the standard hash and phi-fingerprint must match for the
   * data to be considered intact.
   *
   * @param {*} data — the data to verify
   * @param {IntegritySeal} sealValue — the seal to verify against
   * @returns {{ valid: boolean, hashMatch: boolean, phiMatch: boolean, verifiedAt: number }}
   */
  verify(data, sealValue) {
    const serialized = JSON.stringify(data);
    const currentHash = this._djb2Hash(serialized);
    const currentPhi = this._phiFingerprint(serialized);

    this.#totalVerifications++;

    const hashMatch = currentHash === sealValue.hash;
    const phiMatch = currentPhi === sealValue.phiFingerprint;
    const valid = hashMatch && phiMatch;

    if (!valid) {
      this.#totalFailures++;
    }

    return { valid, hashMatch, phiMatch, verifiedAt: Date.now() };
  }

  /**
   * Registers data for continuous integrity monitoring.
   *
   * A backup copy and integrity seal are stored so that subsequent
   * checks can detect modifications and self-healing can restore
   * the original data.
   *
   * @param {string} registerId — unique identifier for this monitored register
   * @param {*} data — the data to monitor
   * @returns {{ registerId: string, seal: IntegritySeal, status: string }}
   */
  monitor(registerId, data) {
    const sealValue = this.seal(data);
    const backup = JSON.parse(JSON.stringify(data));

    this.#registers.set(registerId, {
      registerId,
      data,
      seal: sealValue,
      backup,
      checkCount: 0,
      failureCount: 0,
      status: 'intact',
      lastCheckedAt: Date.now(),
    });

    return { registerId, seal: sealValue, status: 'intact' };
  }

  /**
   * Returns an integrity report for all monitored registers.
   *
   * Each register is re-verified against its stored seal. The report
   * includes per-register status and an overall phi-weighted integrity
   * score. The score weights recent failures more heavily using
   * PHI^(-failureCount) decay.
   *
   * @returns {{ registers: Array<Object>, overallScore: number, totalChecks: number, totalFailures: number }}
   */
  getIntegrityReport() {
    const registerReports = [];
    let weightedSum = 0;
    let weightTotal = 0;

    for (const reg of this.#registers.values()) {
      const verification = this.verify(reg.data, reg.seal);
      reg.checkCount++;
      reg.lastCheckedAt = Date.now();

      if (!verification.valid) {
        reg.failureCount++;
        reg.status = 'compromised';
      }

      const weight = Math.pow(PHI, -(reg.failureCount));
      const score = verification.valid ? 1 : 0;
      weightedSum += score * weight;
      weightTotal += weight;

      registerReports.push({
        registerId: reg.registerId,
        status: reg.status,
        valid: verification.valid,
        checkCount: reg.checkCount,
        failureCount: reg.failureCount,
        lastCheckedAt: reg.lastCheckedAt,
        weight: Math.round(weight * 10000) / 10000,
      });
    }

    const overallScore = weightTotal > 0
      ? Math.round((weightedSum / weightTotal) * 10000) / 10000
      : 1;

    return {
      registers: registerReports,
      overallScore,
      totalChecks: this.#totalVerifications,
      totalFailures: this.#totalFailures,
    };
  }

  /**
   * Attempts to restore integrity of a compromised register from backup.
   *
   * If the register is compromised, the backed-up data and seal are
   * restored and a fresh seal is generated for the restored data.
   *
   * @param {string} registerId — the register to heal
   * @returns {{ registerId: string, healed: boolean, previousStatus: string, newSeal: IntegritySeal | null }}
   */
  selfHeal(registerId) {
    const reg = this.#registers.get(registerId);
    if (!reg) {
      throw new Error(`Register "${registerId}" not found`);
    }

    const previousStatus = reg.status;
    if (previousStatus === 'intact') {
      return { registerId, healed: false, previousStatus, newSeal: null };
    }

    const restoredData = JSON.parse(JSON.stringify(reg.backup));
    const newSeal = this.seal(restoredData);

    reg.data = restoredData;
    reg.seal = newSeal;
    reg.status = 'healed';
    reg.failureCount = Math.max(0, reg.failureCount - 1);

    return { registerId, healed: true, previousStatus, newSeal };
  }

  /**
   * Returns the count of all monitored registers grouped by status.
   * @returns {{ intact: number, compromised: number, healed: number, total: number }}
   */
  getStatusSummary() {
    let intact = 0;
    let compromised = 0;
    let healed = 0;

    for (const reg of this.#registers.values()) {
      if (reg.status === 'intact') intact++;
      else if (reg.status === 'compromised') compromised++;
      else if (reg.status === 'healed') healed++;
    }

    return { intact, compromised, healed, total: this.#registers.size };
  }

  /* ---- internal helpers ---- */

  /**
   * DJB2 hash producing an 8-character hex string.
   * @private
   * @param {string} str
   * @returns {string}
   */
  _djb2Hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  /**
   * Phi-weighted fingerprint capturing structural data signature.
   *
   * Each character's code is weighted by PHI^(position mod 8) to create
   * a position-sensitive fingerprint that detects reorderings.
   *
   * @private
   * @param {string} str
   * @returns {number}
   */
  _phiFingerprint(str) {
    let fingerprint = 0;
    for (let i = 0; i < str.length; i++) {
      fingerprint += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return Math.round(fingerprint * 10000) / 10000;
  }
}

export default IntegrityShield;
