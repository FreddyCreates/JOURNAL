import crypto from 'node:crypto';

const PHI = 1.618033988749895;

/**
 * @typedef {{ chainId: string, rootTokenId: string, nodes: Map<string, ChainNode>, createdAt: number }} Chain
 * @typedef {{ tokenId: string, parentTokenId: string|null, linkHash: string, addedAt: number, depth: number }} ChainNode
 */

/**
 * TokenChain — links tokens into verifiable chains with parent-child
 * relationships. Each chain starts with a root token. Subsequent tokens
 * are appended with a phi-weighted link hash binding child to parent.
 */
export class TokenChain {
  /** @type {Map<string, Chain>} */
  #chains;

  /** @type {Map<string, string>} tokenId → chainId reverse index */
  #tokenIndex;

  /**
   * @param {Object} [config]
   */
  constructor(config = {}) {
    this.#chains = new Map();
    this.#tokenIndex = new Map();
  }

  /**
   * Creates a new token chain with the specified root token.
   *
   * @param {string} chainId — unique chain identifier
   * @param {string} rootTokenId — token ID for the chain root
   * @returns {{ chainId: string, rootTokenId: string, createdAt: number }}
   */
  createChain(chainId, rootTokenId) {
    if (!chainId || typeof chainId !== 'string') throw new Error('chainId must be a non-empty string');
    if (!rootTokenId || typeof rootTokenId !== 'string') throw new Error('rootTokenId must be a non-empty string');
    if (this.#chains.has(chainId)) throw new Error(`Chain "${chainId}" already exists`);
    if (this.#tokenIndex.has(rootTokenId)) {
      throw new Error(`Token "${rootTokenId}" is already part of chain "${this.#tokenIndex.get(rootTokenId)}"`);
    }

    const now = Date.now();
    const rootHash = this._computeLinkHash(rootTokenId, null, 0);
    const nodes = new Map();
    nodes.set(rootTokenId, {
      tokenId: rootTokenId,
      parentTokenId: null,
      linkHash: rootHash,
      addedAt: now,
      depth: 0,
    });

    this.#chains.set(chainId, { chainId, rootTokenId, nodes, createdAt: now });
    this.#tokenIndex.set(rootTokenId, chainId);

    return { chainId, rootTokenId, createdAt: now };
  }

  /**
   * Appends a token to an existing chain as a child of a specified parent.
   *
   * @param {string} chainId
   * @param {string} tokenId — new token to append
   * @param {string} parentTokenId — existing token in the chain
   * @returns {{ chainId: string, tokenId: string, depth: number, linkHash: string }}
   */
  append(chainId, tokenId, parentTokenId) {
    const chain = this._getChain(chainId);
    if (!tokenId || typeof tokenId !== 'string') throw new Error('tokenId must be a non-empty string');
    if (chain.nodes.has(tokenId)) throw new Error(`Token "${tokenId}" already exists in chain "${chainId}"`);
    if (this.#tokenIndex.has(tokenId)) throw new Error(`Token "${tokenId}" is already part of another chain`);

    const parent = chain.nodes.get(parentTokenId);
    if (!parent) {
      throw new Error(`Parent token "${parentTokenId}" not found in chain "${chainId}"`);
    }

    const depth = parent.depth + 1;
    const linkHash = this._computeLinkHash(tokenId, parent.linkHash, depth);
    const now = Date.now();

    chain.nodes.set(tokenId, {
      tokenId,
      parentTokenId,
      linkHash,
      addedAt: now,
      depth,
    });
    this.#tokenIndex.set(tokenId, chainId);

    return { chainId, tokenId, depth, linkHash };
  }

  /**
   * Verifies integrity of an entire chain by recomputing all link hashes.
   *
   * @param {string} chainId
   * @returns {{ valid: boolean, chainId: string, nodeCount: number, brokenLinks: string[], verifiedAt: number }}
   */
  verifyChain(chainId) {
    const chain = this._getChain(chainId);
    const brokenLinks = [];

    for (const node of chain.nodes.values()) {
      const parentHash = node.parentTokenId
        ? chain.nodes.get(node.parentTokenId)?.linkHash ?? null
        : null;

      const expected = this._computeLinkHash(node.tokenId, parentHash, node.depth);
      if (expected !== node.linkHash) {
        brokenLinks.push(node.tokenId);
      }
    }

    return {
      valid: brokenLinks.length === 0,
      chainId,
      nodeCount: chain.nodes.size,
      brokenLinks,
      verifiedAt: Date.now(),
    };
  }

  /**
   * Returns the lineage path from the token to the chain root.
   *
   * @param {string} tokenId
   * @returns {Array<{ tokenId: string, depth: number, linkHash: string }>}
   */
  getLineage(tokenId) {
    const chainId = this.#tokenIndex.get(tokenId);
    if (!chainId) {
      throw new Error(`Token "${tokenId}" not found in any chain`);
    }

    const chain = this.#chains.get(chainId);
    const lineage = [];
    let current = chain.nodes.get(tokenId);

    while (current) {
      lineage.push({
        tokenId: current.tokenId,
        depth: current.depth,
        linkHash: current.linkHash,
      });
      current = current.parentTokenId
        ? chain.nodes.get(current.parentTokenId)
        : null;
    }

    return lineage;
  }

  /**
   * Returns the maximum depth of a chain.
   *
   * @param {string} chainId
   * @returns {{ chainId: string, depth: number, nodeCount: number }}
   */
  getChainDepth(chainId) {
    const chain = this._getChain(chainId);
    let maxDepth = 0;
    for (const node of chain.nodes.values()) {
      if (node.depth > maxDepth) maxDepth = node.depth;
    }
    return { chainId, depth: maxDepth, nodeCount: chain.nodes.size };
  }

  /**
   * Returns aggregate statistics across all chains.
   *
   * @returns {{ totalChains: number, totalNodes: number, avgDepth: number, maxDepth: number, integrityScore: number }}
   */
  getChainStats() {
    let totalNodes = 0;
    let depthSum = 0;
    let maxDepth = 0;
    let validChains = 0;

    for (const [chainId, chain] of this.#chains) {
      const info = this.getChainDepth(chainId);
      totalNodes += info.nodeCount;
      depthSum += info.depth;
      if (info.depth > maxDepth) maxDepth = info.depth;

      const verification = this.verifyChain(chainId);
      if (verification.valid) validChains++;
    }

    const chainCount = this.#chains.size;
    const avgDepth = chainCount > 0 ? Math.round((depthSum / chainCount) * 100) / 100 : 0;
    const integrityRaw = chainCount > 0 ? (validChains / chainCount) * PHI : 0;
    const integrityScore = Math.round(Math.min(1, integrityRaw) * 10000) / 10000;

    return {
      totalChains: chainCount,
      totalNodes,
      avgDepth,
      maxDepth,
      integrityScore,
    };
  }

  /* ---- internal helpers ---- */

  /**
   * Retrieves a chain or throws.
   * @private
   * @param {string} chainId
   * @returns {Chain}
   */
  _getChain(chainId) {
    const chain = this.#chains.get(chainId);
    if (!chain) {
      throw new Error(`Chain "${chainId}" not found`);
    }
    return chain;
  }

  /**
   * Computes a phi-weighted link hash binding a token to its parent.
   * @private
   * @param {string} tokenId
   * @param {string|null} parentHash
   * @param {number} depth
   * @returns {string}
   */
  _computeLinkHash(tokenId, parentHash, depth) {
    const input = tokenId + (parentHash ?? 'ROOT') + String(depth);
    let h1 = 0x811c9dc5;
    let h2 = 0xcbf29ce4;
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      const phiFactor = Math.floor((c * PHI * (i + 1 + depth)) % 0xffffffff);
      h1 = ((h1 ^ c) * 0x01000193 + phiFactor) >>> 0;
      h2 = ((h2 ^ phiFactor) * 0x01000193 + c) >>> 0;
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }
}

export default TokenChain;
