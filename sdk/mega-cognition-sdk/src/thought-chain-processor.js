import crypto from 'node:crypto';

const PHI = 1.618033988749895;

export class ThoughtChainProcessor {
  constructor(config = {}) {
    this.maxChainDepth = config.maxChainDepth ?? 12;
    this.phiDecay = config.phiDecay ?? PHI;
    this.resonanceThreshold = config.resonanceThreshold ?? 0.618;
    this._chains = new Map();
  }

  createChain(seed) {
    const chainId = crypto.randomUUID();
    const node = { id: crypto.randomUUID(), concept: seed, depth: 0, resonance: 1.0, timestamp: Date.now() };
    const chain = { chainId, seed, nodes: [node], status: 'active' };
    this._chains.set(chainId, chain);
    return { ...chain };
  }

  extendChain(chainId, concept) {
    const chain = this._chains.get(chainId);
    if (!chain) throw new Error(`Chain ${chainId} not found`);
    if (chain.status === 'complete') throw new Error(`Chain ${chainId} is complete`);
    const depth = chain.nodes.length;
    if (depth >= this.maxChainDepth) throw new Error('Max chain depth reached');
    const resonance = Math.pow(this.phiDecay, -depth);
    const node = { id: crypto.randomUUID(), concept, depth, resonance, timestamp: Date.now() };
    chain.nodes.push(node);
    return { ...node };
  }

  getChain(chainId) {
    const chain = this._chains.get(chainId);
    return chain ? { ...chain, nodes: [...chain.nodes] } : undefined;
  }

  evaluateChain(chainId) {
    const chain = this._chains.get(chainId);
    if (!chain) throw new Error(`Chain ${chainId} not found`);
    const depth = chain.nodes.length;
    const totalResonance = chain.nodes.reduce((sum, n) => sum + n.resonance, 0);
    const coherenceScore = totalResonance / (depth * PHI);
    return { chainId, depth, totalResonance, coherenceScore, isCoherent: coherenceScore > this.resonanceThreshold };
  }

  completeChain(chainId) {
    const chain = this._chains.get(chainId);
    if (!chain) throw new Error(`Chain ${chainId} not found`);
    chain.status = 'complete';
    return { chainId, status: 'complete', finalDepth: chain.nodes.length };
  }
}
