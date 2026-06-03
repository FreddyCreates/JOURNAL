import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {Object} Envelope
 * @property {string} envelopeId
 * @property {string} kekId — KEK used to wrap the DEK
 * @property {string} wrappedDek — hex-encoded wrapped DEK
 * @property {string} ciphertext — hex-encoded encrypted data
 * @property {string} integrity — integrity hash of the envelope
 * @property {number} createdAt
 * @property {number} dataLength — original data length
 */

/**
 * @typedef {Object} EnvelopeMetrics
 * @property {number} envelopesCreated
 * @property {number} envelopesOpened
 * @property {number} rewraps
 * @property {number} verifications
 */

/**
 * EnvelopeEncryption — implements the envelope encryption pattern.
 * Data is encrypted with a one-time Data Encryption Key (DEK), and
 * the DEK itself is wrapped with a Key Encryption Key (KEK). This
 * allows key rotation without re-encrypting data.
 */
export class EnvelopeEncryption {
  /** @type {Map<string, Uint8Array>} */
  #keks;

  /** @type {EnvelopeMetrics} */
  #metrics;

  /** @type {number} */
  #dekLength;

  constructor(config = {}) {
    this.#keks = new Map();
    this.#dekLength = config.dekLength ?? 32;
    this.#metrics = { envelopesCreated: 0, envelopesOpened: 0, rewraps: 0, verifications: 0 };
  }

  /**
   * Registers a Key Encryption Key for wrapping/unwrapping DEKs.
   *
   * @param {string} kekId — unique KEK identifier
   * @param {Uint8Array} [keyBytes] — KEK bytes (auto-generated if omitted)
   * @returns {{ kekId: string, keyLength: number }}
   */
  registerKek(kekId, keyBytes) {
    if (this.#keks.has(kekId)) throw new Error(`KEK "${kekId}" already registered.`);
    const kek = keyBytes ?? this._generateBytes(kekId + crypto.randomUUID(), this.#dekLength);
    this.#keks.set(kekId, kek);
    return { kekId, keyLength: kek.length };
  }

  /**
   * Creates an encrypted envelope.
   *
   * A random DEK is generated, the data is encrypted with the DEK using
   * phi-XOR, and the DEK is wrapped (encrypted) with the specified KEK.
   *
   * @param {string} data — plaintext data to encrypt
   * @param {string} kekId — KEK to wrap the DEK with
   * @returns {Envelope}
   */
  createEnvelope(data, kekId) {
    const kek = this.#keks.get(kekId);
    if (!kek) throw new Error(`KEK "${kekId}" not found.`);

    const dek = this._generateBytes(crypto.randomUUID(), this.#dekLength);
    const dataBytes = new TextEncoder().encode(data);
    const ciphertextBytes = this._phiXor(dataBytes, dek);
    const wrappedDekBytes = this._phiXor(dek, kek);
    const envelopeId = crypto.randomUUID();
    const integrity = this._computeIntegrity(wrappedDekBytes, ciphertextBytes);

    this.#metrics.envelopesCreated++;
    return {
      envelopeId,
      kekId,
      wrappedDek: this._bytesToHex(wrappedDekBytes),
      ciphertext: this._bytesToHex(ciphertextBytes),
      integrity,
      createdAt: Date.now(),
      dataLength: data.length,
    };
  }

  /**
   * Opens (decrypts) an envelope.
   *
   * The DEK is unwrapped using the KEK, then the data is decrypted
   * with the recovered DEK.
   *
   * @param {Envelope} envelope
   * @param {string} kekId — KEK to unwrap the DEK
   * @returns {{ plaintext: string, envelopeId: string, timestamp: number }}
   */
  openEnvelope(envelope, kekId) {
    const kek = this.#keks.get(kekId);
    if (!kek) throw new Error(`KEK "${kekId}" not found.`);

    const wrappedDek = this._hexToBytes(envelope.wrappedDek);
    const dek = this._phiXor(wrappedDek, kek);
    const ciphertextBytes = this._hexToBytes(envelope.ciphertext);
    const plaintextBytes = this._phiXor(ciphertextBytes, dek);

    this.#metrics.envelopesOpened++;
    return {
      plaintext: new TextDecoder().decode(plaintextBytes),
      envelopeId: envelope.envelopeId,
      timestamp: Date.now(),
    };
  }

  /**
   * Re-wraps the DEK with a new KEK without decrypting the data payload.
   *
   * This enables key rotation: the data ciphertext stays the same, but
   * the DEK is unwrapped from the old KEK and re-wrapped with the new one.
   *
   * @param {Envelope} envelope
   * @param {string} oldKekId — current KEK
   * @param {string} newKekId — new KEK to re-wrap with
   * @returns {Envelope}
   */
  rewrapEnvelope(envelope, oldKekId, newKekId) {
    const oldKek = this.#keks.get(oldKekId);
    if (!oldKek) throw new Error(`Old KEK "${oldKekId}" not found.`);
    const newKek = this.#keks.get(newKekId);
    if (!newKek) throw new Error(`New KEK "${newKekId}" not found.`);

    const wrappedDek = this._hexToBytes(envelope.wrappedDek);
    const dek = this._phiXor(wrappedDek, oldKek);
    const reWrappedDek = this._phiXor(dek, newKek);
    const ciphertextBytes = this._hexToBytes(envelope.ciphertext);
    const integrity = this._computeIntegrity(reWrappedDek, ciphertextBytes);

    this.#metrics.rewraps++;
    return {
      envelopeId: envelope.envelopeId,
      kekId: newKekId,
      wrappedDek: this._bytesToHex(reWrappedDek),
      ciphertext: envelope.ciphertext,
      integrity,
      createdAt: envelope.createdAt,
      dataLength: envelope.dataLength,
    };
  }

  /**
   * Returns envelope metadata without decrypting the payload.
   *
   * @param {Envelope} envelope
   * @returns {{ envelopeId: string, kekId: string, dataLength: number, createdAt: number, wrappedDekLength: number }}
   */
  getEnvelopeMetadata(envelope) {
    return {
      envelopeId: envelope.envelopeId,
      kekId: envelope.kekId,
      dataLength: envelope.dataLength,
      createdAt: envelope.createdAt,
      wrappedDekLength: envelope.wrappedDek.length / 2,
    };
  }

  /**
   * Verifies the integrity of an envelope by recomputing its hash.
   *
   * @param {Envelope} envelope
   * @returns {{ valid: boolean, envelopeId: string, computedIntegrity: string }}
   */
  verifyEnvelope(envelope) {
    const wrappedDek = this._hexToBytes(envelope.wrappedDek);
    const ciphertextBytes = this._hexToBytes(envelope.ciphertext);
    const computed = this._computeIntegrity(wrappedDek, ciphertextBytes);
    this.#metrics.verifications++;
    return { valid: computed === envelope.integrity, envelopeId: envelope.envelopeId, computedIntegrity: computed };
  }

  /**
   * Returns cumulative envelope operation metrics.
   *
   * @returns {EnvelopeMetrics}
   */
  getMetrics() {
    return { ...this.#metrics };
  }

  /* ---- internal helpers ---- */

  /** @private */
  _phiXor(data, key) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const ki = Math.floor((i * PHI) % key.length);
      const rotationOffset = Math.floor((i / PHI) % 256);
      out[i] = data[i] ^ ((key[ki] + rotationOffset) % 256);
    }
    return out;
  }

  /** @private */
  _computeIntegrity(wrappedDek, ciphertext) {
    let h = 0;
    for (let i = 0; i < wrappedDek.length; i++) h = ((h << 5) - h + wrappedDek[i]) | 0;
    for (let i = 0; i < ciphertext.length; i++) h = ((h << 5) - h + ciphertext[i]) | 0;
    return Math.abs(h).toString(16).padStart(8, '0');
  }

  /** @private */
  _generateBytes(seed, length) {
    const bytes = new Uint8Array(length);
    const h = this._hashString(seed);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(((h * PHI * (i + 1)) % 256 + 256) % 256);
    }
    return bytes;
  }

  /** @private */
  _hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  /** @private */
  _bytesToHex(bytes) {
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /** @private */
  _hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    return bytes;
  }
}

export default EnvelopeEncryption;
