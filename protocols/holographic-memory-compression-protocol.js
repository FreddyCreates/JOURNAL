/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  HOLOGRAPHIC MEMORY COMPRESSION PROTOCOL — DISTRIBUTED LOSSLESS STATE ENCODING        ║
 * ║  "Memoria Holographica — Every Fragment Contains the Whole"                           ║
 * ║                                                                                        ║
 * ║  "Pars totum continet. Fragmentum memoriam servat. Nihil perit."                      ║
 * ║  (The part contains the whole. The fragment preserves memory. Nothing is lost.)       ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_COMPLEMENT = 0.381966011250105;

// ════════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC ENCODING TYPES
// ════════════════════════════════════════════════════════════════════════════════

const EncodingMode = {
  FULL_HOLOGRAM: 'FULL_HOLOGRAM',     // Complete state in each shard
  PARTIAL_HOLOGRAM: 'PARTIAL_HOLOGRAM', // Reconstructible from k-of-n shards
  INTERFERENCE: 'INTERFERENCE',       // Pattern-based encoding
  FOURIER: 'FOURIER',                 // Frequency domain encoding
};

const CompressionTier = {
  RAW: { ratio: 1.0, fidelity: 1.0, label: 'RAW' },
  LOSSLESS: { ratio: PHI_INVERSE, fidelity: 1.0, label: 'LOSSLESS' },
  NEAR_LOSSLESS: { ratio: PHI_COMPLEMENT, fidelity: 0.99, label: 'NEAR_LOSSLESS' },
  LOSSY_HIGH: { ratio: 0.25, fidelity: 0.95, label: 'LOSSY_HIGH' },
  LOSSY_LOW: { ratio: 0.1, fidelity: 0.85, label: 'LOSSY_LOW' },
};

const ShardState = {
  ACTIVE: 'ACTIVE',
  STALE: 'STALE',
  CORRUPTED: 'CORRUPTED',
  RECONSTRUCTING: 'RECONSTRUCTING',
  VERIFIED: 'VERIFIED',
};

// ════════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC SHARD
// ════════════════════════════════════════════════════════════════════════════════

class HolographicShard {
  constructor(shardIndex, totalShards, data) {
    this.shardId = `SHARD::${shardIndex}::${totalShards}::${Date.now()}`;
    this.shardIndex = shardIndex;
    this.totalShards = totalShards;
    this.data = data;
    this.hash = this.computeHash(data);
    this.state = ShardState.ACTIVE;
    this.redundancyLevel = Math.ceil(totalShards * PHI_COMPLEMENT);
    this.createdAt = Date.now();
    this.lastVerified = Date.now();
    this.accessCount = 0;
  }

  computeHash(data) {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return `SH${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  verify() {
    const currentHash = this.computeHash(this.data);
    const valid = currentHash === this.hash;
    this.state = valid ? ShardState.VERIFIED : ShardState.CORRUPTED;
    this.lastVerified = Date.now();
    return valid;
  }

  access() {
    this.accessCount++;
    return this.data;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC ENCODER
// ════════════════════════════════════════════════════════════════════════════════

class HolographicEncoder {
  constructor(mode = EncodingMode.PARTIAL_HOLOGRAM) {
    this.mode = mode;
    this.compressionTier = CompressionTier.LOSSLESS;
  }

  encode(data, shardCount = 5) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);

    switch (this.mode) {
      case EncodingMode.FULL_HOLOGRAM:
        return this.encodeFullHologram(serialized, shardCount);
      case EncodingMode.PARTIAL_HOLOGRAM:
        return this.encodePartialHologram(serialized, shardCount);
      case EncodingMode.INTERFERENCE:
        return this.encodeInterference(serialized, shardCount);
      case EncodingMode.FOURIER:
        return this.encodeFourier(serialized, shardCount);
      default:
        return this.encodePartialHologram(serialized, shardCount);
    }
  }

  encodeFullHologram(data, shardCount) {
    // Each shard contains the full data (maximum redundancy)
    const shards = [];
    for (let i = 0; i < shardCount; i++) {
      shards.push(new HolographicShard(i, shardCount, data));
    }
    return shards;
  }

  encodePartialHologram(data, shardCount) {
    // Split data with overlap so k-of-n can reconstruct
    const minShards = Math.ceil(shardCount * PHI_INVERSE); // Need 61.8% to reconstruct
    const chunkSize = Math.ceil(data.length / minShards);
    const shards = [];

    for (let i = 0; i < shardCount; i++) {
      // Each shard gets overlapping chunks
      const startChunks = [];
      for (let j = 0; j < minShards; j++) {
        const chunkIdx = (i + j) % shardCount;
        const start = chunkIdx * chunkSize;
        const end = Math.min(start + chunkSize, data.length);
        startChunks.push({ idx: chunkIdx, content: data.slice(start, end) });
      }
      shards.push(new HolographicShard(i, shardCount, {
        chunks: startChunks,
        metadata: { totalLength: data.length, chunkSize, minShards },
      }));
    }

    return shards;
  }

  encodeInterference(data, shardCount) {
    // XOR-based interference pattern encoding
    const shards = [];
    const bytes = Array.from(data).map(c => c.charCodeAt(0));
    const chunkSize = Math.ceil(bytes.length / (shardCount - 1));

    // Data shards
    for (let i = 0; i < shardCount - 1; i++) {
      const chunk = bytes.slice(i * chunkSize, (i + 1) * chunkSize);
      shards.push(new HolographicShard(i, shardCount, chunk));
    }

    // Parity shard (XOR of all data shards)
    const parity = new Array(chunkSize).fill(0);
    for (let i = 0; i < shardCount - 1; i++) {
      const chunk = bytes.slice(i * chunkSize, (i + 1) * chunkSize);
      for (let j = 0; j < chunk.length; j++) {
        parity[j] ^= chunk[j];
      }
    }
    shards.push(new HolographicShard(shardCount - 1, shardCount, parity));

    return shards;
  }

  encodeFourier(data, shardCount) {
    // Simplified DFT-inspired encoding
    const values = Array.from(data).map(c => c.charCodeAt(0));
    const N = values.length;
    const shards = [];

    for (let k = 0; k < shardCount; k++) {
      const freqComponent = { real: [], imaginary: [] };
      const freqStart = Math.floor(k * N / shardCount);
      const freqEnd = Math.floor((k + 1) * N / shardCount);

      for (let n = freqStart; n < freqEnd; n++) {
        let re = 0, im = 0;
        for (let t = 0; t < N; t++) {
          const angle = 2 * Math.PI * n * t / N;
          re += values[t] * Math.cos(angle);
          im -= values[t] * Math.sin(angle);
        }
        freqComponent.real.push(re / N);
        freqComponent.imaginary.push(im / N);
      }

      shards.push(new HolographicShard(k, shardCount, {
        frequencies: freqComponent,
        range: [freqStart, freqEnd],
        totalLength: N,
      }));
    }

    return shards;
  }

  decode(shards) {
    if (shards.length === 0) return null;

    switch (this.mode) {
      case EncodingMode.FULL_HOLOGRAM:
        return this.decodeFullHologram(shards);
      case EncodingMode.PARTIAL_HOLOGRAM:
        return this.decodePartialHologram(shards);
      case EncodingMode.INTERFERENCE:
        return this.decodeInterference(shards);
      case EncodingMode.FOURIER:
        return this.decodeFourier(shards);
      default:
        return this.decodeFullHologram(shards);
    }
  }

  decodeFullHologram(shards) {
    // Any single shard is sufficient
    const validShard = shards.find(s => s.verify());
    return validShard ? validShard.access() : null;
  }

  decodePartialHologram(shards) {
    const validShards = shards.filter(s => s.verify());
    if (validShards.length === 0) return null;

    const metadata = validShards[0].data.metadata;
    const reconstructed = new Array(metadata.totalLength).fill(null);

    validShards.forEach(shard => {
      shard.data.chunks.forEach(chunk => {
        const start = chunk.idx * metadata.chunkSize;
        for (let i = 0; i < chunk.content.length; i++) {
          reconstructed[start + i] = chunk.content[i];
        }
      });
    });

    return reconstructed.join('');
  }

  decodeInterference(shards) {
    const validShards = shards.filter(s => s.verify());
    if (validShards.length < shards[0].totalShards - 1) return null;

    // Reconstruct from data shards (skip parity)
    const dataShards = validShards.filter(s => s.shardIndex < s.totalShards - 1);
    const bytes = [];
    dataShards.sort((a, b) => a.shardIndex - b.shardIndex);
    dataShards.forEach(s => bytes.push(...s.access()));

    return bytes.map(b => String.fromCharCode(b)).join('');
  }

  decodeFourier(shards) {
    const validShards = shards.filter(s => s.verify()).sort((a, b) => a.shardIndex - b.shardIndex);
    if (validShards.length === 0) return null;

    const N = validShards[0].data.totalLength;
    const values = new Array(N).fill(0);

    validShards.forEach(shard => {
      const { frequencies, range } = shard.access();
      for (let n = range[0]; n < range[1]; n++) {
        const freqIdx = n - range[0];
        for (let t = 0; t < N; t++) {
          const angle = 2 * Math.PI * n * t / N;
          values[t] += frequencies.real[freqIdx] * Math.cos(angle) -
                       frequencies.imaginary[freqIdx] * Math.sin(angle);
        }
      }
    });

    return values.map(v => String.fromCharCode(Math.round(v))).join('');
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC MEMORY STORE
// ════════════════════════════════════════════════════════════════════════════════

class HolographicMemoryStore {
  constructor(shardCount = 7, mode = EncodingMode.PARTIAL_HOLOGRAM) {
    this.shardCount = shardCount;
    this.encoder = new HolographicEncoder(mode);
    this.entries = new Map();
    this.totalStored = 0;
    this.totalCompressed = 0;
    this.verificationLog = [];
  }

  store(key, data) {
    const shards = this.encoder.encode(data, this.shardCount);
    this.entries.set(key, {
      shards,
      storedAt: Date.now(),
      originalSize: JSON.stringify(data).length,
      accessCount: 0,
    });
    this.totalStored++;
    return { key, shardCount: shards.length };
  }

  retrieve(key) {
    const entry = this.entries.get(key);
    if (!entry) return null;

    entry.accessCount++;
    return this.encoder.decode(entry.shards);
  }

  verify(key) {
    const entry = this.entries.get(key);
    if (!entry) return { valid: false, reason: 'NOT_FOUND' };

    const results = entry.shards.map(s => ({ shardId: s.shardId, valid: s.verify() }));
    const validCount = results.filter(r => r.valid).length;
    const integrity = validCount / entry.shards.length;

    const verification = {
      key,
      integrity,
      validShards: validCount,
      totalShards: entry.shards.length,
      canReconstruct: integrity >= PHI_INVERSE,
      timestamp: Date.now(),
    };

    this.verificationLog.push(verification);
    return verification;
  }

  getCompressionRatio() {
    let totalOriginal = 0;
    let totalCompressed = 0;

    this.entries.forEach(entry => {
      totalOriginal += entry.originalSize;
      totalCompressed += entry.shards.reduce((sum, s) =>
        sum + JSON.stringify(s.data).length, 0);
    });

    return totalOriginal > 0 ? totalCompressed / totalOriginal : 1;
  }

  getStatus() {
    return {
      entryCount: this.entries.size,
      shardCount: this.shardCount,
      compressionRatio: this.getCompressionRatio(),
      mode: this.encoder.mode,
      recentVerifications: this.verificationLog.slice(-10),
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════════════════════════

export {
  EncodingMode,
  CompressionTier,
  ShardState,
  HolographicShard,
  HolographicEncoder,
  HolographicMemoryStore,
};

export default {
  PROTOCOL_ID: 'PROTO-HMC-001',
  PROTOCOL_NAME: 'Holographic Memory Compression Protocol',
  DOCTRINE: 'Pars totum continet. Fragmentum memoriam servat. Nihil perit.',
  DOCTRINE_EN: 'The part contains the whole. The fragment preserves memory. Nothing is lost.',

  EncodingMode,
  CompressionTier,
  ShardState,
  HolographicShard,
  HolographicEncoder,
  HolographicMemoryStore,
};
