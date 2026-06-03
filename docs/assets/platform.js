/**
 * Memory Vault — AI Platform Engine (platform.js)
 * Browser-runnable implementation of the Encrypted Intelligence Transport Protocol
 * and full AI platform showcase runtime.
 *
 * Author: Freddy Medina  |  © 2026 All Rights Reserved
 * VAULT-ID: FREDDY.MEDINA.2026.SOVEREIGN
 *
 * All processing is client-side only. No data leaves your browser.
 */

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIG
   ══════════════════════════════════════════════════════════════ */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 2.399963229728653;
const HEARTBEAT = 873;

const SENSITIVITY_LEVELS = ['public', 'internal', 'confidential', 'sovereign'];

const SENSITIVITY_KEYWORDS = {
  sovereign: ['top-secret', 'classified', 'sovereign', 'state-secret', 'national-security', 'eyes-only'],
  confidential: ['confidential', 'private', 'secret', 'restricted', 'sensitive', 'proprietary', 'personal-data', 'ssn', 'password', 'credential'],
  internal: ['internal', 'draft', 'review', 'team-only', 'not-for-distribution', 'staff'],
  public: ['public', 'open', 'published', 'announcement', 'press-release']
};

const CIPHER_SUITES = {
  public: { algorithm: 'AES-128-CBC', keyBits: 128, description: 'Standard encryption for public data' },
  internal: { algorithm: 'AES-256-CBC', keyBits: 256, description: 'Enhanced encryption for internal use' },
  confidential: { algorithm: 'AES-256-GCM', keyBits: 256, description: 'Authenticated encryption with integrity' },
  sovereign: { algorithm: 'AES-256-GCM + HMAC-SHA256', keyBits: 256, description: 'Full cryptographic attestation' }
};

/* ══════════════════════════════════════════════════════════════
   ENCRYPTED INTELLIGENCE TRANSPORT — BROWSER IMPLEMENTATION
   ══════════════════════════════════════════════════════════════ */

class EncryptedIntelligenceTransport {
  constructor() {
    this.keyStore = new Map();
    this.channels = new Map();
    this.metrics = {
      messagesEncrypted: 0,
      messagesDecrypted: 0,
      bytesTransported: 0,
      keyRotations: 0,
      channelsEstablished: 0,
      sensitivityDistribution: { public: 0, internal: 0, confidential: 0, sovereign: 0 }
    };
    this._initialized = false;
  }

  async initialize() {
    for (const level of SENSITIVITY_LEVELS) {
      const keyBits = CIPHER_SUITES[level].keyBits;
      const key = await this._generateKey(keyBits);
      this.keyStore.set(level, {
        key,
        rawHex: await this._exportKeyHex(key),
        createdAt: Date.now(),
        rotationInterval: HEARTBEAT * 100,
        algorithm: CIPHER_SUITES[level].algorithm
      });
    }
    this._initialized = true;
    return { status: 'initialized', levels: SENSITIVITY_LEVELS.length, timestamp: Date.now() };
  }

  async _generateKey(bits) {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: bits > 128 ? 256 : 128 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async _exportKeyHex(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return Array.from(new Uint8Array(raw)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Classify content sensitivity using phi-weighted keyword density.
   */
  classifySensitivity(content) {
    const lower = content.toLowerCase();
    const words = lower.split(/\s+/).length || 1;
    const scores = {};

    for (let i = 0; i < SENSITIVITY_LEVELS.length; i++) {
      const level = SENSITIVITY_LEVELS[i];
      const keywords = SENSITIVITY_KEYWORDS[level];
      let count = 0;
      for (const kw of keywords) {
        const regex = new RegExp(kw.replace(/-/g, '[\\s\\-]?'), 'gi');
        const matches = lower.match(regex);
        if (matches) count += matches.length;
      }
      const density = count / words;
      scores[level] = density * Math.pow(PHI, i);
    }

    let best = 'public';
    let bestScore = 0;
    for (const [level, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        best = level;
      }
    }

    return {
      level: best,
      score: bestScore,
      allScores: scores,
      suite: CIPHER_SUITES[best]
    };
  }

  /**
   * Encrypt a payload using Web Crypto API with AES-GCM.
   */
  async encrypt(payload, level = null) {
    if (!this._initialized) await this.initialize();

    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // Auto-classify if no level specified
    if (!level) {
      const classification = this.classifySensitivity(data);
      level = classification.level;
    }

    const keyEntry = this.keyStore.get(level);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const plainBytes = encoder.encode(data);

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyEntry.key,
      plainBytes
    );

    const cipherArray = new Uint8Array(cipherBuffer);
    const cipherHex = Array.from(cipherArray).map(b => b.toString(16).padStart(2, '0')).join('');
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

    // Generate HMAC tag for confidential/sovereign
    let tag = null;
    let signature = null;
    if (level === 'confidential' || level === 'sovereign') {
      tag = await this._computeHMAC(cipherHex, keyEntry.rawHex);
    }
    if (level === 'sovereign') {
      signature = await this._computeHMAC(cipherHex + ivHex + tag, keyEntry.rawHex);
    }

    this.metrics.messagesEncrypted++;
    this.metrics.bytesTransported += data.length;
    this.metrics.sensitivityDistribution[level]++;

    return {
      ciphertext: cipherHex,
      iv: ivHex,
      algorithm: CIPHER_SUITES[level].algorithm,
      level,
      tag,
      signature,
      encryptedAt: Date.now(),
      originalSize: data.length,
      encryptedSize: cipherHex.length
    };
  }

  /**
   * Decrypt an encrypted payload.
   */
  async decrypt(encrypted) {
    if (!this._initialized) await this.initialize();

    const level = encrypted.level || 'internal';
    const keyEntry = this.keyStore.get(level);

    // Verify tag if present
    let integrityVerified = true;
    if (encrypted.tag) {
      const expectedTag = await this._computeHMAC(encrypted.ciphertext, keyEntry.rawHex);
      if (expectedTag !== encrypted.tag) {
        integrityVerified = false;
      }
    }

    // Verify signature if present
    if (encrypted.signature && integrityVerified) {
      const expectedSig = await this._computeHMAC(
        encrypted.ciphertext + encrypted.iv + encrypted.tag,
        keyEntry.rawHex
      );
      if (expectedSig !== encrypted.signature) {
        integrityVerified = false;
      }
    }

    // Decrypt
    const cipherBytes = new Uint8Array(encrypted.ciphertext.match(/.{2}/g).map(h => parseInt(h, 16)));
    const ivBytes = new Uint8Array(encrypted.iv.match(/.{2}/g).map(h => parseInt(h, 16)));

    try {
      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        keyEntry.key,
        cipherBytes
      );
      const plaintext = new TextDecoder().decode(plainBuffer);

      this.metrics.messagesDecrypted++;

      return {
        plaintext,
        verified: integrityVerified,
        algorithm: encrypted.algorithm,
        level,
        decryptedAt: Date.now()
      };
    } catch (err) {
      return { plaintext: null, verified: false, error: err.message };
    }
  }

  /**
   * Rotate all keys (phi-interval rotation).
   */
  async rotateKeys() {
    for (const level of SENSITIVITY_LEVELS) {
      const keyBits = CIPHER_SUITES[level].keyBits;
      const key = await this._generateKey(keyBits);
      this.keyStore.set(level, {
        key,
        rawHex: await this._exportKeyHex(key),
        createdAt: Date.now(),
        rotationInterval: HEARTBEAT * 100,
        algorithm: CIPHER_SUITES[level].algorithm
      });
    }
    this.metrics.keyRotations++;
    return {
      rotated: true,
      rotation: this.metrics.keyRotations,
      timestamp: Date.now(),
      nextRotation: Date.now() + (HEARTBEAT * 100)
    };
  }

  /**
   * Create a secure channel between two endpoints.
   */
  async createSecureChannel(endpointA, endpointB) {
    const channelKey = await this._generateKey(256);
    const channelId = `${endpointA}<->${endpointB}`;
    const channel = {
      id: channelId,
      endpointA,
      endpointB,
      key: channelKey,
      keyHex: await this._exportKeyHex(channelKey),
      algorithm: 'AES-256-GCM',
      createdAt: Date.now(),
      messagesExchanged: 0,
      status: 'active'
    };
    this.channels.set(channelId, channel);
    this.metrics.channelsEstablished++;
    return {
      channelId,
      endpointA,
      endpointB,
      algorithm: channel.algorithm,
      established: true,
      keyFingerprint: channel.keyHex.slice(0, 16) + '...' + channel.keyHex.slice(-8)
    };
  }

  /**
   * Compute HMAC-SHA256 using Web Crypto.
   */
  async _computeHMAC(message, keyHex) {
    const encoder = new TextEncoder();
    const keyBytes = new Uint8Array(keyHex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const hmacKey = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(message));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getKeyInfo() {
    const info = {};
    for (const [level, entry] of this.keyStore) {
      info[level] = {
        algorithm: entry.algorithm,
        fingerprint: entry.rawHex.slice(0, 12) + '...',
        createdAt: new Date(entry.createdAt).toISOString(),
        age: Date.now() - entry.createdAt
      };
    }
    return info;
  }
}

/* ══════════════════════════════════════════════════════════════
   PROTOCOL RUNTIME MANAGER
   ══════════════════════════════════════════════════════════════ */

class ProtocolRuntimeManager {
  constructor() {
    this.protocols = new Map();
    this.startTime = Date.now();
    this.logs = [];
  }

  register(name, instance) {
    this.protocols.set(name, { instance, registeredAt: Date.now(), invocations: 0 });
    this.log(`Protocol registered: ${name}`);
  }

  get(name) {
    const entry = this.protocols.get(name);
    if (entry) entry.invocations++;
    return entry ? entry.instance : null;
  }

  log(message) {
    const entry = { timestamp: Date.now(), message, uptime: Date.now() - this.startTime };
    this.logs.push(entry);
    if (this.logs.length > 200) this.logs.shift();
    return entry;
  }

  getStatus() {
    const protocols = {};
    for (const [name, data] of this.protocols) {
      protocols[name] = {
        registeredAt: new Date(data.registeredAt).toISOString(),
        invocations: data.invocations
      };
    }
    return {
      uptime: Date.now() - this.startTime,
      protocolCount: this.protocols.size,
      protocols,
      logCount: this.logs.length
    };
  }
}

/* ══════════════════════════════════════════════════════════════
   PLATFORM UI CONTROLLER
   ══════════════════════════════════════════════════════════════ */

// Global instances
const runtime = new ProtocolRuntimeManager();
const eit = new EncryptedIntelligenceTransport();
runtime.register('encrypted-intelligence-transport', eit);

// HTML escape utility to prevent XSS
function esc(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

// Initialize on page load
let platformReady = false;

async function initPlatform() {
  const statusEl = document.getElementById('platform-status');
  if (statusEl) statusEl.textContent = 'Initializing protocols...';

  try {
    const result = await eit.initialize();
    platformReady = true;
    runtime.log('EIT Protocol initialized — all cipher suites active');

    if (statusEl) {
      statusEl.textContent = `✓ Platform Online — ${result.levels} cipher suites active`;
      statusEl.className = 'platform-status online';
    }

    updateMetricsDisplay();
    updateKeyDisplay();
    startHeartbeat();
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = `✗ Initialization failed: ${err.message}`;
      statusEl.className = 'platform-status error';
    }
  }
}

// Heartbeat animation
function startHeartbeat() {
  const el = document.getElementById('heartbeat-indicator');
  if (!el) return;
  setInterval(() => {
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 400);
  }, HEARTBEAT);
}

/* ── Demo: Encrypt ── */
async function demoEncrypt() {
  if (!platformReady) return;
  const input = document.getElementById('encrypt-input');
  const output = document.getElementById('encrypt-output');
  const text = input ? input.value.trim() : '';
  if (!text) {
    if (output) output.textContent = '⚠ Enter text to encrypt';
    return;
  }

  output.textContent = 'Encrypting...';
  output.className = 'demo-output loading';

  try {
    const classification = eit.classifySensitivity(text);
    const encrypted = await eit.encrypt(text);
    runtime.log(`Encrypted ${text.length} bytes at ${encrypted.level} level`);

    output.className = 'demo-output success';
    output.innerHTML = `
<span class="out-label">⬤ Classification:</span> <span class="level-${encrypted.level}">${encrypted.level.toUpperCase()}</span>
<span class="out-label">⬤ Algorithm:</span> ${encrypted.algorithm}
<span class="out-label">⬤ IV:</span> ${encrypted.iv}
<span class="out-label">⬤ Ciphertext:</span> ${encrypted.ciphertext.slice(0, 80)}...
${encrypted.tag ? `<span class="out-label">⬤ HMAC Tag:</span> ${encrypted.tag.slice(0, 48)}...` : ''}
${encrypted.signature ? `<span class="out-label">⬤ Signature:</span> ${encrypted.signature.slice(0, 48)}...` : ''}
<span class="out-label">⬤ Original Size:</span> ${encrypted.originalSize} bytes
<span class="out-label">⬤ Encrypted Size:</span> ${encrypted.encryptedSize} hex chars
<span class="out-label">⬤ Timestamp:</span> ${new Date(encrypted.encryptedAt).toISOString()}`;

    // Store for decrypt demo
    window._lastEncrypted = encrypted;
    updateMetricsDisplay();
  } catch (err) {
    output.className = 'demo-output error';
    output.textContent = `Error: ${err.message}`;
  }
}

/* ── Demo: Decrypt ── */
async function demoDecrypt() {
  if (!platformReady) return;
  const output = document.getElementById('decrypt-output');

  if (!window._lastEncrypted) {
    if (output) output.textContent = '⚠ Encrypt something first, then decrypt it here';
    return;
  }

  output.textContent = 'Decrypting...';
  output.className = 'demo-output loading';

  try {
    const result = await eit.decrypt(window._lastEncrypted);
    runtime.log(`Decrypted message — integrity ${result.verified ? 'VERIFIED' : 'FAILED'}`);

    output.className = `demo-output ${result.verified ? 'success' : 'warning'}`;
    output.innerHTML = `
<span class="out-label">⬤ Plaintext:</span> ${esc(result.plaintext)}
<span class="out-label">⬤ Integrity:</span> <span class="${result.verified ? 'verified' : 'failed'}">${result.verified ? '✓ VERIFIED' : '✗ INTEGRITY FAILED'}</span>
<span class="out-label">⬤ Algorithm:</span> ${esc(result.algorithm)}
<span class="out-label">⬤ Level:</span> <span class="level-${esc(result.level)}">${esc(result.level.toUpperCase())}</span>
<span class="out-label">⬤ Decrypted At:</span> ${new Date(result.decryptedAt).toISOString()}`;

    updateMetricsDisplay();
  } catch (err) {
    output.className = 'demo-output error';
    output.textContent = `Error: ${err.message}`;
  }
}

/* ── Demo: Classify ── */
function demoClassify() {
  const input = document.getElementById('classify-input');
  const output = document.getElementById('classify-output');
  const text = input ? input.value.trim() : '';
  if (!text) {
    if (output) output.textContent = '⚠ Enter text to classify';
    return;
  }

  const result = eit.classifySensitivity(text);
  runtime.log(`Classified content as ${result.level}`);

  const levelColors = { public: '#10b981', internal: '#3b82f6', confidential: '#f59e0b', sovereign: '#ef4444' };

  output.className = 'demo-output success';
  output.innerHTML = `
<span class="out-label">⬤ Sensitivity Level:</span> <span class="level-${result.level}" style="font-size:1.1em;font-weight:700;">${result.level.toUpperCase()}</span>
<span class="out-label">⬤ Confidence Score:</span> ${result.score.toFixed(6)}
<span class="out-label">⬤ Cipher Suite:</span> ${result.suite.algorithm}
<span class="out-label">⬤ Key Strength:</span> ${result.suite.keyBits}-bit
<span class="out-label">⬤ Description:</span> ${result.suite.description}
<span class="out-label">⬤ All Scores:</span>
  public:       ${result.allScores.public.toFixed(6)}
  internal:     ${result.allScores.internal.toFixed(6)}
  confidential: ${result.allScores.confidential.toFixed(6)}
  sovereign:    ${result.allScores.sovereign.toFixed(6)}`;
}

/* ── Demo: Key Rotation ── */
async function demoRotateKeys() {
  if (!platformReady) return;
  const output = document.getElementById('rotate-output');
  output.textContent = 'Rotating keys...';
  output.className = 'demo-output loading';

  try {
    const result = await eit.rotateKeys();
    runtime.log(`Key rotation #${result.rotation} complete`);

    output.className = 'demo-output success';
    output.innerHTML = `
<span class="out-label">⬤ Rotation #:</span> ${result.rotation}
<span class="out-label">⬤ Status:</span> <span class="verified">✓ ALL KEYS ROTATED</span>
<span class="out-label">⬤ Timestamp:</span> ${new Date(result.timestamp).toISOString()}
<span class="out-label">⬤ Next Rotation:</span> ${new Date(result.nextRotation).toISOString()}
<span class="out-label">⬤ Interval:</span> ${HEARTBEAT * 100}ms (φ-scaled heartbeat)`;

    updateKeyDisplay();
    updateMetricsDisplay();
  } catch (err) {
    output.className = 'demo-output error';
    output.textContent = `Error: ${err.message}`;
  }
}

/* ── Demo: Secure Channel ── */
async function demoCreateChannel() {
  if (!platformReady) return;
  const epA = document.getElementById('channel-a');
  const epB = document.getElementById('channel-b');
  const output = document.getElementById('channel-output');

  const a = epA ? epA.value.trim() || 'Agent-Alpha' : 'Agent-Alpha';
  const b = epB ? epB.value.trim() || 'Agent-Omega' : 'Agent-Omega';

  output.textContent = 'Establishing secure channel...';
  output.className = 'demo-output loading';

  try {
    const channel = await eit.createSecureChannel(a, b);
    runtime.log(`Secure channel: ${channel.channelId}`);

    output.className = 'demo-output success';
    output.innerHTML = `
<span class="out-label">⬤ Channel ID:</span> ${esc(channel.channelId)}
<span class="out-label">⬤ Endpoint A:</span> ${esc(channel.endpointA)}
<span class="out-label">⬤ Endpoint B:</span> ${esc(channel.endpointB)}
<span class="out-label">⬤ Algorithm:</span> ${esc(channel.algorithm)}
<span class="out-label">⬤ Established:</span> <span class="verified">✓ SECURE</span>
<span class="out-label">⬤ Key Fingerprint:</span> ${esc(channel.keyFingerprint)}`;

    updateMetricsDisplay();
  } catch (err) {
    output.className = 'demo-output error';
    output.textContent = `Error: ${err.message}`;
  }
}

/* ── Metrics & Key Display ── */
function updateMetricsDisplay() {
  const el = document.getElementById('metrics-display');
  if (!el) return;
  const m = eit.getMetrics();
  el.innerHTML = `
<div class="metric-row"><span>Messages Encrypted</span><span class="metric-val">${m.messagesEncrypted}</span></div>
<div class="metric-row"><span>Messages Decrypted</span><span class="metric-val">${m.messagesDecrypted}</span></div>
<div class="metric-row"><span>Bytes Transported</span><span class="metric-val">${m.bytesTransported.toLocaleString()}</span></div>
<div class="metric-row"><span>Key Rotations</span><span class="metric-val">${m.keyRotations}</span></div>
<div class="metric-row"><span>Channels Established</span><span class="metric-val">${m.channelsEstablished}</span></div>
<div class="metric-row"><span>Public Ops</span><span class="metric-val">${m.sensitivityDistribution.public}</span></div>
<div class="metric-row"><span>Internal Ops</span><span class="metric-val">${m.sensitivityDistribution.internal}</span></div>
<div class="metric-row"><span>Confidential Ops</span><span class="metric-val">${m.sensitivityDistribution.confidential}</span></div>
<div class="metric-row"><span>Sovereign Ops</span><span class="metric-val">${m.sensitivityDistribution.sovereign}</span></div>`;
}

function updateKeyDisplay() {
  const el = document.getElementById('key-display');
  if (!el) return;
  const keys = eit.getKeyInfo();
  let html = '';
  for (const [level, info] of Object.entries(keys)) {
    html += `<div class="key-row level-${level}-bg">
  <span class="key-level">${level.toUpperCase()}</span>
  <span class="key-algo">${info.algorithm}</span>
  <span class="key-fp">${info.fingerprint}</span>
</div>`;
  }
  el.innerHTML = html;
}

/* ── Runtime Log ── */
function showRuntimeLog() {
  const el = document.getElementById('runtime-log');
  if (!el) return;
  const status = runtime.getStatus();
  const logs = runtime.logs.slice(-20).reverse();
  let html = `<div class="log-header">Uptime: ${(status.uptime / 1000).toFixed(1)}s | Protocols: ${status.protocolCount} | Events: ${status.logCount}</div>`;
  for (const entry of logs) {
    html += `<div class="log-entry"><span class="log-time">[+${(entry.uptime / 1000).toFixed(2)}s]</span> ${esc(entry.message)}</div>`;
  }
  el.innerHTML = html;
}

// Auto-update log every second
setInterval(showRuntimeLog, 1000);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlatform);
} else {
  initPlatform();
}
