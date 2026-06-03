/**
 * @medina/nova-modular-framework — Scribes barrel export
 *
 * Autonomous scribes grounded in first logic, math, geometry, language primitives,
 * and runtime complexity tracking — all modular, all phi-encoded.
 */

// Logic Scribe
export {
  AND, OR, NOT, XOR, NAND, NOR, IMPLIES, IFF,
  ALL, ANY, NONE, MAJORITY,
  truthTable, truthTableUnary, isTautology, isContradiction, areEquivalent,
  ProofChain,
  LogicScribe,
} from './logic-scribe.js';

// Math Scribe
export {
  O,
  add, sub, mul, div, mod,
  floorN, ceilN, roundN, floorDiv, floorMod,
  modAdd, modMul, modPow,
  gcd, lcm, extendedGCD, modInverse,
  sieveOfEratosthenes, isPrime,
  phiWeightedSum, phiFloor, phiCeil,
  MathScribe,
} from './math-scribe.js';

// Geometry Scribe
export {
  point, distance, midpoint, slope, dot, cross, angleBetween,
  circle, circleArea, circlePerimeter, pointInCircle,
  triangle, trianglePerimeter, triangleArea, triangleCentroid, isGoldenGnomon,
  rect, rectArea, rectPerimeter, goldenRectangle, aspectRatio, isGoldenRect,
  phiSpiral, fibonacciArcs,
  vesicaPiscis,
  ellipse, ellipseArea, ellipsePerimeter, ellipseEccentricity,
  GeometryScribe,
} from './geometry-scribe.js';

// Language Scribe
export {
  TOKEN_TYPES,
  classifyLexeme, tokenize, filterNoise,
  SymbolTable,
  PatternMatcher,
  LanguageScribe,
} from './language-scribe.js';

// Runtime Scribe
export {
  classifyComplexity,
  floorUs, ceilUs, timeMod, beatNumber,
  benchmark, measure,
  RuntimeScribe,
} from './runtime-scribe.js';

// Master Orchestrator
export { NovaScribeOrchestrator } from './nova-scribe-orchestrator.js';
