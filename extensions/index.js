/**
 * AI Intelligence Extensions — Organism Wire Index
 *
 * 20 multi-modal, multi-AI Edge extensions wired into the sovereign organism.
 * Each extension is a self-contained Manifest V3 directory with
 * background.js (engine), content.js (DOM UI), and manifest.json.
 *
 * This index maps every extension ID to its directory and metadata
 * for programmatic discovery and organism-level orchestration.
 *
 * @module extensions
 */

const EXTENSIONS = [
  { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', engines: ['GPT', 'Claude', 'Gemini'], ring: 'Interface Ring', wire: 'intelligence-wire/fusion' },
  { id: 'EXT-002', slug: 'cipher-shield', name: 'Cipher Shield', engines: ['Guards', 'GPT', 'Claude'], ring: 'Counsel Ring', wire: 'intelligence-wire/cipher' },
  { id: 'EXT-003', slug: 'polyglot-oracle', name: 'Polyglot Oracle', engines: ['Qwen', 'Gemini', 'Llama'], ring: 'Interface Ring', wire: 'intelligence-wire/polyglot' },
  { id: 'EXT-004', slug: 'vision-weaver', name: 'Vision Weaver', engines: ['DALL-E', 'SD', 'Midjourney', 'SAM'], ring: 'Geometry Ring', wire: 'intelligence-wire/vision' },
  { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', engines: ['Codex', 'CodeLlama', 'DeepSeek'], ring: 'Build Ring', wire: 'intelligence-wire/code' },
  { id: 'EXT-006', slug: 'memory-palace', name: 'Memory Palace', engines: ['Embeddings', 'Command R', 'Rerankers'], ring: 'Memory Ring', wire: 'intelligence-wire/memory' },
  { id: 'EXT-007', slug: 'sentinel-watch', name: 'Sentinel Watch', engines: ['Guards', 'GPT', 'Claude'], ring: 'Counsel Ring', wire: 'intelligence-wire/sentinel' },
  { id: 'EXT-008', slug: 'research-nexus', name: 'Research Nexus', engines: ['Perplexity', 'Claude', 'Embeddings'], ring: 'Transport Ring', wire: 'intelligence-wire/research' },
  { id: 'EXT-009', slug: 'voice-forge', name: 'Voice Forge', engines: ['Whisper', 'ElevenLabs', 'Suno'], ring: 'Native Capability Ring', wire: 'intelligence-wire/voice' },
  { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', engines: ['GPT', 'Claude', 'Embeddings', 'Rerankers'], ring: 'Memory Ring', wire: 'intelligence-wire/absorb' },
  { id: 'EXT-011', slug: 'video-architect', name: 'Video Architect', engines: ['Sora', 'Runway', 'Pika', 'Kling'], ring: 'Geometry Ring', wire: 'intelligence-wire/video' },
  { id: 'EXT-012', slug: 'logic-prover', name: 'Logic Prover', engines: ['Minerva-Llemma', 'GPT', 'AlphaCode'], ring: 'Proof Ring', wire: 'intelligence-wire/proof' },
  { id: 'EXT-013', slug: 'social-cortex', name: 'Social Cortex', engines: ['Grok', 'Inflection', 'GPT'], ring: 'Interface Ring', wire: 'intelligence-wire/social' },
  { id: 'EXT-014', slug: 'edge-runner', name: 'Edge Runner', engines: ['Phi', 'Gemma', 'DBRX'], ring: 'Sovereign Ring', wire: 'intelligence-wire/edge' },
  { id: 'EXT-015', slug: 'contract-forge', name: 'Contract Forge', engines: ['GPT', 'Claude', 'Guards'], ring: 'Counsel Ring', wire: 'intelligence-wire/contract' },
  { id: 'EXT-016', slug: 'organism-dashboard', name: 'Organism Dashboard', engines: ['Heartbeat', 'OrganismState', 'EdgeSensor'], ring: 'Sovereign Ring', wire: 'intelligence-wire/organism' },
  { id: 'EXT-017', slug: 'knowledge-cartographer', name: 'Knowledge Cartographer', engines: ['Embeddings', 'Command R', 'Florence'], ring: 'Memory Ring', wire: 'intelligence-wire/graph' },
  { id: 'EXT-018', slug: 'protocol-bridge', name: 'Protocol Bridge', engines: ['All Foundation Models'], ring: 'Transport Ring', wire: 'intelligence-wire/bridge' },
  { id: 'EXT-019', slug: 'creative-muse', name: 'Creative Muse', engines: ['SD', 'DALL-E', 'MusicGen', 'Suno'], ring: 'Geometry Ring', wire: 'intelligence-wire/muse' },
  { id: 'EXT-020', slug: 'sovereign-nexus', name: 'Sovereign Nexus', engines: ['All 40 Foundation Models', 'Kuramoto'], ring: 'Sovereign Ring', wire: 'intelligence-wire/nexus' },
  { id: 'EXT-021', slug: 'jarvis-side-panel', name: 'JARVIS', engines: ['All Engines', 'All SDKs', 'All Protocols', 'Motoko'], ring: 'Sovereign Ring', wire: 'intelligence-wire/jarvis' }
];

/**
 * Look up an extension by its ID (e.g. "EXT-001").
 * @param {string} id
 * @returns {Object|undefined}
 */
function getExtensionById(id) {
  return EXTENSIONS.find(e => e.id === id);
}

/**
 * Look up an extension by slug (directory name).
 * @param {string} slug
 * @returns {Object|undefined}
 */
function getExtensionBySlug(slug) {
  return EXTENSIONS.find(e => e.slug === slug);
}

/**
 * Filter extensions by organism ring.
 * @param {string} ring
 * @returns {Object[]}
 */
function getExtensionsByRing(ring) {
  return EXTENSIONS.filter(e => e.ring === ring);
}

/**
 * Filter extensions that wire a specific engine.
 * @param {string} engine
 * @returns {Object[]}
 */
function getExtensionsByEngine(engine) {
  return EXTENSIONS.filter(e => e.engines.some(eng => eng.toLowerCase().includes(engine.toLowerCase())));
}

export { EXTENSIONS, getExtensionById, getExtensionBySlug, getExtensionsByRing, getExtensionsByEngine };
