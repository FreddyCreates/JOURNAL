/**
 * SUBSTRATE-011: Cryptographic Lineage Protocol (CLP)
 * UNBREAKABLE — Embedded in organism substrate
 *
 * Every artifact, claim, decision, and mutation in the organism carries
 * a cryptographic lineage chain. Provenance is never lost.
 *
 * Engines wired: HashManifest + LineageTracker + CryptoCore
 * Ring: Memory Ring | Placement: Substrate foundation
 * Wire: substrate-wire/clp
 * Enforcement: IMMUTABLE
 */

import crypto from 'node:crypto';

const SUBSTRATE_SEAL = 'UNBREAKABLE::CLP::011';

class CryptographicLineageProtocol {
  #lineageTree;
  #roots;

  constructor() {
    this.#lineageTree = new Map();
    this.#roots = new Set();
    this.protocolId = 'SUBSTRATE-011';
    this.immutable = true;
    this.enforcement = 'UNBREAKABLE';
  }

  /**
   * Create a lineage root — the beginning of an artifact's history.
   */
  createRoot(artifactId, metadata) {
    const node = Object.freeze({
      artifactId,
      parentId: null,
      hash: this._hash(`ROOT:${artifactId}:${JSON.stringify(metadata)}:${Date.now()}`),
      metadata: Object.freeze({ ...metadata }),
      depth: 0,
      createdAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#lineageTree.set(artifactId, node);
    this.#roots.add(artifactId);
    return node;
  }

  /**
   * Derive a new artifact from an existing one. Creates a lineage link.
   */
  derive(newArtifactId, parentArtifactId, metadata) {
    const parent = this.#lineageTree.get(parentArtifactId);
    if (!parent) throw new Error(`Lineage parent ${parentArtifactId} not found`);

    const node = Object.freeze({
      artifactId: newArtifactId,
      parentId: parentArtifactId,
      parentHash: parent.hash,
      hash: this._hash(`DERIVE:${newArtifactId}:${parentArtifactId}:${parent.hash}:${Date.now()}`),
      metadata: Object.freeze({ ...metadata }),
      depth: parent.depth + 1,
      createdAt: Date.now(),
      seal: SUBSTRATE_SEAL
    });
    this.#lineageTree.set(newArtifactId, node);
    return node;
  }

  /**
   * Trace full ancestry of an artifact back to its root.
   */
  traceAncestry(artifactId) {
    const chain = [];
    let current = this.#lineageTree.get(artifactId);
    while (current) {
      chain.push(current);
      current = current.parentId ? this.#lineageTree.get(current.parentId) : null;
    }
    return chain;
  }

  /**
   * Verify lineage chain integrity.
   */
  verifyLineage(artifactId) {
    const chain = this.traceAncestry(artifactId);
    for (let i = 0; i < chain.length - 1; i++) {
      if (chain[i].parentHash !== chain[i + 1].hash) {
        return { valid: false, breakAt: chain[i].artifactId, seal: SUBSTRATE_SEAL };
      }
    }
    return { valid: true, depth: chain.length, root: chain[chain.length - 1]?.artifactId, seal: SUBSTRATE_SEAL };
  }

  _hash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

export { CryptographicLineageProtocol };
