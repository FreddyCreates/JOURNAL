/**
 * @medina/nova-modular-framework — v1.0.0
 *
 * Modular Nova Framework — TT-012-NOVA protocol adapter, SNS governance bridge,
 * CARS (Cognitive Autonomous Research System), and organism runtime integration.
 *
 * @module @medina/nova-modular-framework
 */

export {
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  PHI_COMPLEMENT,
  PHI_ANGLE,
  TWO_PI,
  NOVA_ID,
  NOVA_NAME,
  NOVA_FULL_NAME,
  NOVA_SOVEREIGN_ID,
  HEARTBEAT_MS,
  SOVEREIGN_HEARTBEAT_MS,
  NOVA_VERSION,
  phiBlend,
  clamp01,
  phiGrow,
  phiDecay,
  fibonacci,
  phiCoherence,
  novaStamp,
} from './nova-core.js';

export { NovaProtocol } from './nova-protocol.js';
export { NovaSNSBridge } from './nova-sns-bridge.js';
export { NovaResearchEngine } from './nova-research-engine.js';
export { NovaOrganismWire } from './nova-organism-wire.js';

// Autonomous Scribes — first logic, math, geometry, language, runtime
export {
  AND, OR, NOT, XOR, NAND, NOR, IMPLIES, IFF,
  ALL, ANY, NONE, MAJORITY,
  truthTable, truthTableUnary, isTautology, isContradiction, areEquivalent,
  ProofChain,
  LogicScribe,
} from './scribes/logic-scribe.js';

export {
  O,
  add, sub, mul, div, mod,
  floorN, ceilN, roundN, floorDiv, floorMod,
  modAdd, modMul, modPow,
  gcd, lcm, extendedGCD, modInverse,
  sieveOfEratosthenes, isPrime,
  phiWeightedSum, phiFloor, phiCeil,
  MathScribe,
} from './scribes/math-scribe.js';

export {
  point, distance, midpoint, slope, dot, cross, angleBetween,
  circle, circleArea, circlePerimeter, pointInCircle,
  triangle, trianglePerimeter, triangleArea, triangleCentroid, isGoldenGnomon,
  rect, rectArea, rectPerimeter, goldenRectangle, aspectRatio, isGoldenRect,
  phiSpiral, fibonacciArcs,
  vesicaPiscis,
  ellipse, ellipseArea, ellipsePerimeter, ellipseEccentricity,
  GeometryScribe,
} from './scribes/geometry-scribe.js';

export {
  TOKEN_TYPES,
  classifyLexeme, tokenize, filterNoise,
  SymbolTable,
  PatternMatcher,
  LanguageScribe,
} from './scribes/language-scribe.js';

export {
  classifyComplexity,
  floorUs, ceilUs, timeMod, beatNumber,
  benchmark, measure,
  RuntimeScribe,
} from './scribes/runtime-scribe.js';

export { NovaScribeOrchestrator } from './scribes/nova-scribe-orchestrator.js';
