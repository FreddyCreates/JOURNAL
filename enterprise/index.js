/**
 * MEDINA Enterprise Deployment Suite
 *
 * Three Alpha Enterprise Houses for comprehensive AI deployment:
 *
 * 1. ALPHA-NEXUS     — Multi-Model AI Workstation
 * 2. ALPHA-SOVEREIGN — Governance & Compliance Platform
 * 3. ALPHA-COGNITIVE — Research & Intelligence Platform
 *
 * @module @medina/enterprise
 */

// Re-export all enterprise houses
export { AlphaNexus, default as Nexus } from './alpha-nexus/src/workstation.js';
export { AlphaSovereign, default as Sovereign } from './alpha-sovereign/src/platform.js';
export { AlphaCognitive, default as Cognitive } from './alpha-cognitive/src/platform.js';

// Constants
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 1 / PHI;
export const HEARTBEAT_MS = 618;

/**
 * Enterprise House Registry
 */
export const ENTERPRISE_HOUSES = {
  'ALPHA-NEXUS': {
    id: 'ALPHA-NEXUS',
    name: 'Multi-Model AI Workstation',
    description: '40 Model Families. 10 Multimodal Clusters. One Unified Workstation.',
    features: [
      '40 AI model families with fallback chains',
      '10 multimodal intelligence clusters',
      'Brain-analog cognitive processing',
      'Cross-organism resonance communication'
    ],
    entryPoint: './alpha-nexus/src/workstation.js'
  },
  'ALPHA-SOVEREIGN': {
    id: 'ALPHA-SOVEREIGN',
    name: 'Governance & Compliance Platform',
    description: '15 Engines. 24-Hour Cycles. Complete Governance Autonomy.',
    features: [
      '15-engine governance pipeline',
      '3-lane source separation (NNS/CodeGov/SNS)',
      '10 Alpha Protocol Laws',
      'Immutable EffectTrace audit system'
    ],
    entryPoint: './alpha-sovereign/src/platform.js'
  },
  'ALPHA-COGNITIVE': {
    id: 'ALPHA-COGNITIVE',
    name: 'Research & Intelligence Platform',
    description: 'Stochastic Cognition. Monte Carlo Thinking. First-Principles AI.',
    features: [
      'Thought particle systems',
      'Cognitive field energy landscapes',
      'MCMC sampling engines (MH, HMC, Importance)',
      'Swarm cognition for parallel exploration'
    ],
    entryPoint: './alpha-cognitive/src/platform.js'
  }
};

/**
 * Get an enterprise house by ID
 * @param {string} houseId
 */
export function getEnterpriseHouse(houseId) {
  return ENTERPRISE_HOUSES[houseId] || null;
}

/**
 * List all enterprise houses
 */
export function listEnterpriseHouses() {
  return Object.values(ENTERPRISE_HOUSES);
}

/**
 * Enterprise deployment manifest
 */
export const DEPLOYMENT_MANIFEST = {
  version: '1.0.0',
  timestamp: Date.now(),
  houses: Object.keys(ENTERPRISE_HOUSES),
  alphaSystemsSelected: [
    {
      id: 'ALPHA-I',
      name: 'AlphaTierEngine',
      protocols: ['PROTO-227', 'PROTO-228', 'PROTO-229', 'PROTO-230'],
      score: 94,
      deployedIn: 'ALPHA-NEXUS'
    },
    {
      id: 'ALPHA-II',
      name: 'ORO SynEngine',
      protocols: ['ORO.GOV.TRACE'],
      score: 91,
      deployedIn: 'ALPHA-SOVEREIGN'
    },
    {
      id: 'ALPHA-III',
      name: 'Monte Carlo Cognitive Engine',
      protocols: ['MCMC', 'HMC', 'PSO'],
      score: 89,
      deployedIn: 'ALPHA-COGNITIVE'
    }
  ]
};

export default {
  ENTERPRISE_HOUSES,
  DEPLOYMENT_MANIFEST,
  getEnterpriseHouse,
  listEnterpriseHouses
};
