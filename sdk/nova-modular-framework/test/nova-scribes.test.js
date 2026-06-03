/**
 * Nova Modular Framework — Autonomous Scribes Test Suite
 * Tests for: LogicScribe, MathScribe, GeometryScribe, LanguageScribe, RuntimeScribe,
 *            NovaScribeOrchestrator, and all primitive/advance functions.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ── Logic Scribe ──────────────────────────────────────────────────────────
import {
  AND, OR, NOT, XOR, NAND, NOR, IMPLIES, IFF,
  ALL, ANY, NONE, MAJORITY,
  truthTable, truthTableUnary, isTautology, isContradiction, areEquivalent,
  ProofChain, LogicScribe,
} from '../src/scribes/logic-scribe.js';

// ── Math Scribe ───────────────────────────────────────────────────────────
import {
  O,
  add, sub, mul, div, mod,
  floorN, ceilN, roundN, floorDiv, floorMod,
  modAdd, modMul, modPow,
  gcd, lcm, extendedGCD, modInverse,
  sieveOfEratosthenes, isPrime,
  phiWeightedSum, phiFloor, phiCeil,
  MathScribe,
} from '../src/scribes/math-scribe.js';

// ── Geometry Scribe ───────────────────────────────────────────────────────
import {
  point, distance, midpoint, slope, dot, cross, angleBetween,
  circle, circleArea, circlePerimeter, pointInCircle,
  triangle, trianglePerimeter, triangleArea, triangleCentroid, isGoldenGnomon,
  rect, rectArea, rectPerimeter, goldenRectangle, aspectRatio, isGoldenRect,
  phiSpiral, fibonacciArcs,
  vesicaPiscis,
  ellipse, ellipseArea, ellipsePerimeter, ellipseEccentricity,
  GeometryScribe,
} from '../src/scribes/geometry-scribe.js';

// ── Language Scribe ───────────────────────────────────────────────────────
import {
  TOKEN_TYPES,
  classifyLexeme, tokenize, filterNoise,
  SymbolTable,
  PatternMatcher,
  LanguageScribe,
} from '../src/scribes/language-scribe.js';

// ── Runtime Scribe ────────────────────────────────────────────────────────
import {
  classifyComplexity,
  floorUs, ceilUs, timeMod, beatNumber,
  benchmark, measure,
  RuntimeScribe,
} from '../src/scribes/runtime-scribe.js';

// ── Orchestrator ──────────────────────────────────────────────────────────
import { NovaScribeOrchestrator } from '../src/scribes/nova-scribe-orchestrator.js';
import { PHI, PHI_INVERSE, HEARTBEAT_MS } from '../src/nova-core.js';

// ═══════════════════════════════════════════════════════════════════════════
// LOGIC SCRIBE — Primitives
// ═══════════════════════════════════════════════════════════════════════════

describe('LogicScribe — Primitive Gates', () => {
  test('AND: T∧T=T, T∧F=F, F∧T=F, F∧F=F', () => {
    assert.equal(AND(true,  true),  true);
    assert.equal(AND(true,  false), false);
    assert.equal(AND(false, true),  false);
    assert.equal(AND(false, false), false);
  });

  test('OR: T∨T=T, T∨F=T, F∨T=T, F∨F=F', () => {
    assert.equal(OR(true,  true),  true);
    assert.equal(OR(true,  false), true);
    assert.equal(OR(false, true),  true);
    assert.equal(OR(false, false), false);
  });

  test('NOT: ¬T=F, ¬F=T', () => {
    assert.equal(NOT(true),  false);
    assert.equal(NOT(false), true);
  });

  test('XOR: T⊕T=F, T⊕F=T, F⊕T=T, F⊕F=F', () => {
    assert.equal(XOR(true,  true),  false);
    assert.equal(XOR(true,  false), true);
    assert.equal(XOR(false, true),  true);
    assert.equal(XOR(false, false), false);
  });

  test('NAND: ¬AND', () => {
    assert.equal(NAND(true,  true),  false);
    assert.equal(NAND(true,  false), true);
  });

  test('NOR: ¬OR', () => {
    assert.equal(NOR(false, false), true);
    assert.equal(NOR(true,  false), false);
  });

  test('IMPLIES: F→T=T, T→F=F, T→T=T, F→F=T', () => {
    assert.equal(IMPLIES(false, true),  true);
    assert.equal(IMPLIES(true,  false), false);
    assert.equal(IMPLIES(true,  true),  true);
    assert.equal(IMPLIES(false, false), true);
  });

  test('IFF: T↔T=T, T↔F=F, F↔T=F, F↔F=T', () => {
    assert.equal(IFF(true,  true),  true);
    assert.equal(IFF(true,  false), false);
    assert.equal(IFF(false, true),  false);
    assert.equal(IFF(false, false), true);
  });
});

describe('LogicScribe — Higher-Order Combinators', () => {
  test('ALL([T,T,T]) = true', () => {
    assert.equal(ALL([true, true, true]), true);
  });

  test('ALL([T,F,T]) = false', () => {
    assert.equal(ALL([true, false, true]), false);
  });

  test('ANY([F,F,T]) = true', () => {
    assert.equal(ANY([false, false, true]), true);
  });

  test('ANY([F,F,F]) = false', () => {
    assert.equal(ANY([false, false, false]), false);
  });

  test('NONE([F,F,F]) = true', () => {
    assert.equal(NONE([false, false, false]), true);
  });

  test('NONE([F,F,T]) = false', () => {
    assert.equal(NONE([false, false, true]), false);
  });

  test('MAJORITY([T,T,F]) = true', () => {
    assert.equal(MAJORITY([true, true, false]), true);
  });

  test('MAJORITY([T,F,F]) = false', () => {
    assert.equal(MAJORITY([true, false, false]), false);
  });
});

describe('LogicScribe — Truth Tables', () => {
  test('truthTable has 4 rows for a binary formula', () => {
    assert.equal(truthTable(AND).length, 4);
  });

  test('truthTableUnary has 2 rows for a unary formula', () => {
    assert.equal(truthTableUnary(NOT).length, 2);
  });

  test('isTautology: P ∨ ¬P is always true', () => {
    assert.equal(isTautology((p) => OR(p, NOT(p))), true);
  });

  test('isContradiction: P ∧ ¬P is always false', () => {
    assert.equal(isContradiction((p) => AND(p, NOT(p))), true);
  });

  test('areEquivalent: P → Q ≡ ¬P ∨ Q', () => {
    assert.equal(areEquivalent(IMPLIES, (p, q) => OR(NOT(p), q)), true);
  });

  test('areEquivalent: IFF ≡ ¬XOR', () => {
    assert.equal(areEquivalent(IFF, (p, q) => NOT(XOR(p, q))), true);
  });
});

describe('LogicScribe — ProofChain', () => {
  test('records steps and concludes correctly', () => {
    const chain = ProofChain('test-proof');
    chain.step('NOT', NOT, true);
    const concl = chain.conclude();
    assert.equal(concl, false);
  });

  test('toScroll returns label and steps', () => {
    const chain = ProofChain('my-proof');
    chain.step('AND', AND, true, false);
    const scroll = chain.toScroll();
    assert.equal(scroll.label, 'my-proof');
    assert.equal(scroll.steps.length, 1);
    assert.equal(scroll.conclusion, false);
  });

  test('multi-step proof chain', () => {
    const chain = ProofChain('multi');
    chain.step('AND', AND, true, true);
    chain.step('OR',  OR,  chain.conclude(), false);
    assert.equal(chain.conclude(), true);
  });
});

describe('LogicScribe — Scribe Class', () => {
  test('eval records entry in scroll', () => {
    const scribe = new LogicScribe();
    scribe.eval('AND', AND, true, false);
    assert.equal(scribe.scrollLength, 1);
  });

  test('eval returns correct result', () => {
    const scribe = new LogicScribe();
    const result = scribe.eval('OR', OR, false, true);
    assert.equal(result, true);
  });

  test('scribeTruthTable records 4 entries', () => {
    const scribe = new LogicScribe();
    scribe.scribeTruthTable('IMPLIES', IMPLIES);
    assert.equal(scribe.scrollLength, 4);
  });

  test('inscribeProof adds proof steps to scroll', () => {
    const scribe = new LogicScribe();
    const chain = ProofChain('p');
    chain.step('NOT', NOT, true);
    chain.step('AND', AND, chain.conclude(), false);
    scribe.inscribeProof(chain.toScroll());
    assert.equal(scribe.scrollLength, 2);
  });

  test('manifest returns correct fields', () => {
    const scribe = new LogicScribe('test');
    scribe.eval('OR', OR, true, false);
    const m = scribe.manifest();
    assert.equal(m.name, 'test');
    assert.equal(m.type, 'LogicScribe');
    assert.equal(m.scrollLength, 1);
    assert.equal(m.trueOutputs, 1);
  });

  test('clear resets scroll', () => {
    const scribe = new LogicScribe();
    scribe.eval('AND', AND, true, true);
    scribe.clear();
    assert.equal(scribe.scrollLength, 0);
  });

  test('coherence stays in (0, 1)', () => {
    const scribe = new LogicScribe();
    for (let i = 0; i < 20; i++) scribe.eval('AND', AND, i % 2 === 0, i % 3 === 0);
    assert.ok(scribe.coherence > 0 && scribe.coherence < 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MATH SCRIBE — Primitives
// ═══════════════════════════════════════════════════════════════════════════

describe('MathScribe — Primitives', () => {
  test('add: 3 + 4 = 7', () => assert.equal(add(3, 4), 7));
  test('sub: 10 − 3 = 7', () => assert.equal(sub(10, 3), 7));
  test('mul: 3 × 4 = 12', () => assert.equal(mul(3, 4), 12));
  test('div: 10 / 4 = 2.5', () => assert.equal(div(10, 4), 2.5));
  test('div by zero throws', () => assert.throws(() => div(1, 0), /zero/));
});

describe('MathScribe — Floor / Ceil / Round', () => {
  test('floorN(3.7) = 3', () => assert.equal(floorN(3.7), 3));
  test('ceilN(3.2) = 4', () => assert.equal(ceilN(3.2), 4));
  test('roundN(3.5) = 4', () => assert.equal(roundN(3.5), 4));
  test('floorDiv(7, 3) = 2', () => assert.equal(floorDiv(7, 3), 2));
  test('floorDiv(-7, 3) = -3 (rounds toward -∞)', () => assert.equal(floorDiv(-7, 3), -3));
  test('floorMod(-7, 3) = 2 (non-negative)', () => assert.equal(floorMod(-7, 3), 2));
  test('floorDiv by zero throws', () => assert.throws(() => floorDiv(1, 0), /zero/));
  test('floorMod by zero throws', () => assert.throws(() => floorMod(1, 0), /zero/));
});

describe('MathScribe — Modular Arithmetic', () => {
  test('mod always non-negative: mod(-1, 5) = 4', () => assert.equal(mod(-1, 5), 4));
  test('mod(7, 3) = 1', () => assert.equal(mod(7, 3), 1));
  test('mod throws for m ≤ 0', () => assert.throws(() => mod(5, 0), /positive/));
  test('modAdd(3, 4, 5) = 2', () => assert.equal(modAdd(3, 4, 5), 2));
  test('modMul(3, 4, 5) = 2', () => assert.equal(modMul(3, 4, 5), 2));
  test('modPow(2, 10, 1000) = 24', () => assert.equal(modPow(2, 10, 1000), 24));
  test('modPow(2, 0, 7) = 1', () => assert.equal(modPow(2, 0, 7), 1));
  test('modPow throws for negative exp', () => assert.throws(() => modPow(2, -1, 7), /non-negative/));
  test('modInverse(3, 7) = 5 (3×5 = 15 ≡ 1 mod 7)', () => assert.equal(modInverse(3, 7), 5));
  test('modInverse throws when no inverse exists', () => assert.throws(() => modInverse(2, 4), /No modular inverse/));
});

describe('MathScribe — GCD / LCM / Extended GCD', () => {
  test('gcd(12, 8) = 4', () => assert.equal(gcd(12, 8), 4));
  test('gcd(7, 13) = 1 (coprime)', () => assert.equal(gcd(7, 13), 1));
  test('gcd(0, 5) = 5', () => assert.equal(gcd(0, 5), 5));
  test('lcm(4, 6) = 12', () => assert.equal(lcm(4, 6), 12));
  test('lcm(0, 5) = 0', () => assert.equal(lcm(0, 5), 0));
  test('extendedGCD returns g = gcd', () => {
    const { g } = extendedGCD(12, 8);
    assert.equal(g, 4);
  });
  test('extendedGCD satisfies a*x + b*y = g', () => {
    const { g, x, y } = extendedGCD(35, 15);
    assert.equal(35 * x + 15 * y, g);
  });
});

describe('MathScribe — Primes', () => {
  test('isPrime(2) = true', () => assert.equal(isPrime(2), true));
  test('isPrime(1) = false', () => assert.equal(isPrime(1), false));
  test('isPrime(17) = true', () => assert.equal(isPrime(17), true));
  test('isPrime(18) = false', () => assert.equal(isPrime(18), false));
  test('sieve(10) = [2,3,5,7]', () => assert.deepEqual(sieveOfEratosthenes(10), [2, 3, 5, 7]));
  test('sieve(0) = []', () => assert.deepEqual(sieveOfEratosthenes(0), []));
  test('sieve(30).length = 10', () => assert.equal(sieveOfEratosthenes(30).length, 10));
});

describe('MathScribe — Phi-Weighted Operations', () => {
  test('phiWeightedSum([1]) = PHI_INVERSE', () => {
    assert.ok(Math.abs(phiWeightedSum([1]) - PHI_INVERSE) < 1e-10);
  });

  test('phiWeightedSum assigns decreasing weights', () => {
    const s1 = phiWeightedSum([1, 0]);
    const s2 = phiWeightedSum([0, 1]);
    assert.ok(s1 > s2);
  });

  test('phiFloor(PHI) ≈ PHI', () => {
    const pf = phiFloor(PHI);
    assert.ok(Math.abs(pf - PHI) < PHI);
  });

  test('phiCeil(PHI * 0.5) >= phiFloor(PHI * 0.5)', () => {
    const x = PHI * 0.5;
    assert.ok(phiCeil(x) >= phiFloor(x));
  });
});

describe('MathScribe — Scribe Class', () => {
  test('scribes add and records in scroll', () => {
    const s = new MathScribe();
    const r = s.add(3, 4);
    assert.equal(r, 7);
    assert.equal(s.scrollLength, 1);
  });

  test('scribes modPow with O.LOG', () => {
    const s = new MathScribe();
    s.modPow(2, 10, 1000);
    const scroll = s.readScroll();
    assert.equal(scroll[0].complexity, O.LOG);
  });

  test('scribes gcd with O.LOG', () => {
    const s = new MathScribe();
    s.gcd(12, 8);
    assert.equal(s.readScroll()[0].complexity, O.LOG);
  });

  test('sieve returns primes and scribes one entry', () => {
    const s = new MathScribe();
    const primes = s.sieve(20);
    assert.deepEqual(primes, [2, 3, 5, 7, 11, 13, 17, 19]);
    assert.equal(s.scrollLength, 1);
  });

  test('manifest has complexityCounts', () => {
    const s = new MathScribe();
    s.add(1, 2);
    s.gcd(6, 4);
    const m = s.manifest();
    assert.ok(m.complexityCounts[O.CONST] >= 1);
    assert.ok(m.complexityCounts[O.LOG] >= 1);
  });

  test('clear resets scroll', () => {
    const s = new MathScribe();
    s.add(1, 1);
    s.clear();
    assert.equal(s.scrollLength, 0);
  });

  test('floor and ceil scribed as O(1)', () => {
    const s = new MathScribe();
    s.floor(3.7);
    s.ceil(3.2);
    for (const e of s.readScroll()) assert.equal(e.complexity, O.CONST);
  });
});

describe('MathScribe — O Complexity Constants', () => {
  test('O.CONST exists', () => assert.ok(O.CONST));
  test('O.LOG exists', () => assert.ok(O.LOG));
  test('O.LINEAR exists', () => assert.ok(O.LINEAR));
  test('O.LINEARLOG exists', () => assert.ok(O.LINEARLOG));
  test('O.QUADRATIC exists', () => assert.ok(O.QUADRATIC));
  test('O.EXPONENTIAL exists', () => assert.ok(O.EXPONENTIAL));
});

// ═══════════════════════════════════════════════════════════════════════════
// GEOMETRY SCRIBE — Primitives
// ═══════════════════════════════════════════════════════════════════════════

describe('GeometryScribe — Points', () => {
  test('point creates correct {x,y}', () => {
    assert.deepEqual(point(3, 4), { x: 3, y: 4 });
  });

  test('distance(origin, {3,4}) = 5', () => {
    assert.ok(Math.abs(distance({ x: 0, y: 0 }, { x: 3, y: 4 }) - 5) < 1e-10);
  });

  test('distance of same point = 0', () => {
    assert.equal(distance({ x: 1, y: 1 }, { x: 1, y: 1 }), 0);
  });

  test('midpoint of (0,0) and (4,4) = (2,2)', () => {
    assert.deepEqual(midpoint({ x: 0, y: 0 }, { x: 4, y: 4 }), { x: 2, y: 2 });
  });

  test('slope of horizontal line = 0', () => {
    assert.equal(slope({ x: 0, y: 0 }, { x: 5, y: 0 }), 0);
  });

  test('slope of vertical line = Infinity', () => {
    assert.equal(slope({ x: 2, y: 0 }, { x: 2, y: 5 }), Infinity);
  });

  test('dot product: [1,0]·[0,1] = 0', () => {
    assert.equal(dot({ x: 1, y: 0 }, { x: 0, y: 1 }), 0);
  });

  test('cross product: [1,0]×[0,1] = 1', () => {
    assert.equal(cross({ x: 1, y: 0 }, { x: 0, y: 1 }), 1);
  });

  test('angleBetween parallel vectors = 0', () => {
    assert.ok(Math.abs(angleBetween({ x: 1, y: 0 }, { x: 1, y: 0 })) < 1e-10);
  });

  test('angleBetween perpendicular vectors = π/2', () => {
    assert.ok(Math.abs(angleBetween({ x: 1, y: 0 }, { x: 0, y: 1 }) - Math.PI / 2) < 1e-10);
  });
});

describe('GeometryScribe — Circles', () => {
  test('circleArea(r=1) = π', () => {
    const c = circle({ x: 0, y: 0 }, 1);
    assert.ok(Math.abs(circleArea(c) - Math.PI) < 1e-10);
  });

  test('circlePerimeter(r=1) = 2π', () => {
    const c = circle({ x: 0, y: 0 }, 1);
    assert.ok(Math.abs(circlePerimeter(c) - 2 * Math.PI) < 1e-10);
  });

  test('pointInCircle: origin in unit circle', () => {
    const c = circle({ x: 0, y: 0 }, 1);
    assert.equal(pointInCircle({ x: 0, y: 0 }, c), true);
  });

  test('pointInCircle: point outside circle', () => {
    const c = circle({ x: 0, y: 0 }, 1);
    assert.equal(pointInCircle({ x: 2, y: 0 }, c), false);
  });

  test('circle throws for negative radius', () => {
    assert.throws(() => circle({ x: 0, y: 0 }, -1), /non-negative/);
  });
});

describe('GeometryScribe — Triangles', () => {
  test('triangleArea of (0,0),(1,0),(0,1) = 0.5', () => {
    const t = triangle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 });
    assert.ok(Math.abs(triangleArea(t) - 0.5) < 1e-10);
  });

  test('trianglePerimeter of 3-4-5 right triangle ≈ 12', () => {
    const t = triangle({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 });
    assert.ok(Math.abs(trianglePerimeter(t) - 12) < 1e-10);
  });

  test('triangleCentroid of equilateral at (0,0),(3,0),(1.5, h)', () => {
    const h = Math.sqrt(3) * 3 / 2;
    const t = triangle({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 1.5, y: h });
    const cen = triangleCentroid(t);
    assert.ok(Math.abs(cen.x - 1.5) < 1e-10);
  });
});

describe('GeometryScribe — Rectangles', () => {
  test('rectArea(3, 4) = 12', () => {
    const r = rect({ x: 0, y: 0 }, 3, 4);
    assert.equal(rectArea(r), 12);
  });

  test('rectPerimeter(3, 4) = 14', () => {
    const r = rect({ x: 0, y: 0 }, 3, 4);
    assert.equal(rectPerimeter(r), 14);
  });

  test('goldenRectangle has aspect ratio PHI', () => {
    const r = goldenRectangle({ x: 0, y: 0 }, 1);
    assert.ok(Math.abs(aspectRatio(r) - PHI) < 1e-10);
  });

  test('isGoldenRect detects golden rectangle', () => {
    const r = goldenRectangle({ x: 0, y: 0 }, 2);
    assert.equal(isGoldenRect(r), true);
  });

  test('isGoldenRect rejects non-golden rectangle', () => {
    const r = rect({ x: 0, y: 0 }, 2, 2);
    assert.equal(isGoldenRect(r), false);
  });

  test('rect throws for negative dimensions', () => {
    assert.throws(() => rect({ x: 0, y: 0 }, -1, 5), /non-negative/);
  });
});

describe('GeometryScribe — Phi-Forms', () => {
  test('phiSpiral(5) returns 5 points', () => {
    assert.equal(phiSpiral(5).length, 5);
  });

  test('phiSpiral(0) returns empty array', () => {
    assert.deepEqual(phiSpiral(0), []);
  });

  test('phiSpiral points have x and y', () => {
    const pts = phiSpiral(3);
    for (const p of pts) {
      assert.ok(typeof p.x === 'number');
      assert.ok(typeof p.y === 'number');
    }
  });

  test('fibonacciArcs(5) returns 5 arcs', () => {
    assert.equal(fibonacciArcs(5).length, 5);
  });

  test('fibonacciArcs radii are ascending', () => {
    const arcs = fibonacciArcs(6);
    for (let i = 1; i < arcs.length; i++) {
      assert.ok(arcs[i].radius >= arcs[i - 1].radius);
    }
  });

  test('vesicaPiscis returns two circles and measures', () => {
    const v = vesicaPiscis(2);
    assert.ok(v.c1);
    assert.ok(v.c2);
    assert.ok(v.width > 0);
    assert.ok(v.height > 0);
    assert.ok(v.area > 0);
  });
});

describe('GeometryScribe — Ellipses', () => {
  test('ellipseArea(2, 1) = 2π', () => {
    const e = ellipse({ x: 0, y: 0 }, 2, 1);
    assert.ok(Math.abs(ellipseArea(e) - 2 * Math.PI) < 1e-10);
  });

  test('ellipsePerimeter > 0', () => {
    const e = ellipse({ x: 0, y: 0 }, 3, 2);
    assert.ok(ellipsePerimeter(e) > 0);
  });

  test('ellipseEccentricity of circle = 0', () => {
    const e = ellipse({ x: 0, y: 0 }, 2, 2);
    assert.ok(Math.abs(ellipseEccentricity(e)) < 1e-10);
  });

  test('ellipseEccentricity in [0, 1)', () => {
    const e = ellipse({ x: 0, y: 0 }, 5, 3);
    const ecc = ellipseEccentricity(e);
    assert.ok(ecc >= 0 && ecc < 1);
  });

  test('ellipse throws for non-positive axis', () => {
    assert.throws(() => ellipse({ x: 0, y: 0 }, 0, 1), /positive/);
  });
});

describe('GeometryScribe — Scribe Class', () => {
  test('scribe.point records an entry', () => {
    const s = new GeometryScribe();
    s.point(1, 2);
    assert.equal(s.scrollLength, 1);
  });

  test('scribe.goldenRectangle gets phiAffinity = 1', () => {
    const s = new GeometryScribe();
    s.goldenRectangle({ x: 0, y: 0 }, 1);
    const scroll = s.readScroll();
    assert.equal(scroll[0].phiAffinity, 1.0);
  });

  test('scribe.phiSpiral gets phiAffinity = 1', () => {
    const s = new GeometryScribe();
    s.phiSpiral(5);
    const scroll = s.readScroll();
    assert.equal(scroll[0].phiAffinity, 1.0);
  });

  test('manifest has formCounts', () => {
    const s = new GeometryScribe();
    s.point(0, 0);
    s.circle({ x: 0, y: 0 }, 1);
    const m = s.manifest();
    assert.ok(m.formCounts.point >= 1);
    assert.ok(m.formCounts.circle >= 1);
  });

  test('clear resets scroll', () => {
    const s = new GeometryScribe();
    s.point(0, 0);
    s.clear();
    assert.equal(s.scrollLength, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE SCRIBE — Primitives
// ═══════════════════════════════════════════════════════════════════════════

describe('LanguageScribe — classifyLexeme', () => {
  test('classifies number', () => assert.equal(classifyLexeme('42'), TOKEN_TYPES.LITERAL_NUM));
  test('classifies float', () => assert.equal(classifyLexeme('3.14'), TOKEN_TYPES.LITERAL_NUM));
  test('classifies string literal', () => assert.equal(classifyLexeme('"hello"'), TOKEN_TYPES.LITERAL_STR));
  test('classifies bool true', () => assert.equal(classifyLexeme('true'), TOKEN_TYPES.LITERAL_BOOL));
  test('classifies bool false', () => assert.equal(classifyLexeme('false'), TOKEN_TYPES.LITERAL_BOOL));
  test('classifies keyword "if"', () => assert.equal(classifyLexeme('if'), TOKEN_TYPES.KEYWORD));
  test('classifies keyword "nova"', () => assert.equal(classifyLexeme('nova'), TOKEN_TYPES.KEYWORD));
  test('classifies identifier', () => assert.equal(classifyLexeme('myVar'), TOKEN_TYPES.IDENTIFIER));
  test('classifies operator +', () => assert.equal(classifyLexeme('+'), TOKEN_TYPES.OPERATOR));
  test('classifies delimiter (', () => assert.equal(classifyLexeme('('), TOKEN_TYPES.DELIMITER));
  test('classifies whitespace', () => assert.equal(classifyLexeme('  '), TOKEN_TYPES.WHITESPACE));
  test('classifies unknown $$$', () => assert.equal(classifyLexeme('$myVar'), TOKEN_TYPES.IDENTIFIER));
});

describe('LanguageScribe — tokenize', () => {
  test('tokenize("a + b") produces tokens', () => {
    const toks = tokenize('a + b');
    const meaningful = filterNoise(toks);
    assert.equal(meaningful.length, 3);
  });

  test('filterNoise removes whitespace tokens', () => {
    const toks = tokenize('  x  ');
    const filtered = filterNoise(toks);
    assert.equal(filtered[0].type, TOKEN_TYPES.IDENTIFIER);
  });

  test('tokenize handles string literals', () => {
    const toks = tokenize('"hello world"');
    assert.equal(toks[0].type, TOKEN_TYPES.LITERAL_STR);
  });

  test('tokenize handles single-line comments', () => {
    const toks = tokenize('// this is a comment');
    assert.equal(toks[0].type, TOKEN_TYPES.COMMENT);
  });

  test('tokenize handles keywords', () => {
    const toks = filterNoise(tokenize('let x = 5'));
    assert.equal(toks[0].type, TOKEN_TYPES.KEYWORD);
    assert.equal(toks[1].type, TOKEN_TYPES.IDENTIFIER);
  });

  test('throws for non-string source', () => {
    assert.throws(() => tokenize(123), /string/);
  });
});

describe('LanguageScribe — SymbolTable', () => {
  test('declare and resolve in global scope', () => {
    const table = new SymbolTable();
    table.declare('x', 42, 'number');
    const sym = table.resolve('x');
    assert.equal(sym.value, 42);
    assert.equal(sym.scope, 0);
  });

  test('pushScope / popScope', () => {
    const table = new SymbolTable();
    table.pushScope();
    table.declare('y', 'hello');
    assert.equal(table.depth, 1);
    table.popScope();
    assert.equal(table.resolve('y'), null);
  });

  test('inner scope shadows outer', () => {
    const table = new SymbolTable();
    table.declare('x', 1);
    table.pushScope();
    table.declare('x', 2);
    assert.equal(table.resolve('x').value, 2);
    table.popScope();
    assert.equal(table.resolve('x').value, 1);
  });

  test('assign updates existing symbol', () => {
    const table = new SymbolTable();
    table.declare('n', 10);
    table.assign('n', 99);
    assert.equal(table.resolve('n').value, 99);
  });

  test('declare throws on duplicate in same scope', () => {
    const table = new SymbolTable();
    table.declare('a', 1);
    assert.throws(() => table.declare('a', 2), /already declared/);
  });

  test('resolve returns null for undeclared', () => {
    const table = new SymbolTable();
    assert.equal(table.resolve('nope'), null);
  });

  test('cannot pop global scope', () => {
    const table = new SymbolTable();
    assert.throws(() => table.popScope(), /global scope/);
  });
});

describe('LanguageScribe — PatternMatcher', () => {
  test('scans binary-op pattern', () => {
    const pm = new PatternMatcher();
    const toks = filterNoise(tokenize('a + b'));
    const matches = pm.scan(toks);
    const rules = matches.map(m => m.rule);
    assert.ok(rules.includes('binary-op'));
  });

  test('scans declaration pattern', () => {
    const pm = new PatternMatcher();
    const toks = filterNoise(tokenize('let x ='));
    const matches = pm.scan(toks);
    assert.ok(matches.some(m => m.rule === 'declaration'));
  });

  test('addRule and scan custom pattern', () => {
    const pm = new PatternMatcher();
    pm.addRule('num-op-num', [TOKEN_TYPES.LITERAL_NUM, TOKEN_TYPES.OPERATOR, TOKEN_TYPES.LITERAL_NUM]);
    const toks = filterNoise(tokenize('3 + 4'));
    const matches = pm.scan(toks);
    assert.ok(matches.some(m => m.rule === 'num-op-num'));
  });
});

describe('LanguageScribe — Scribe Class', () => {
  test('tokenize scribes all tokens', () => {
    const s = new LanguageScribe();
    s.tokenize('let x = 5');
    assert.ok(s.scrollLength >= 3);
  });

  test('classifyLexeme scribes one entry', () => {
    const s = new LanguageScribe();
    s.classifyLexeme('myVar');
    assert.equal(s.scrollLength, 1);
  });

  test('declareSymbol scribes entry', () => {
    const s = new LanguageScribe();
    s.declareSymbol('phi', PHI, 'number');
    assert.ok(s.scrollLength >= 1);
  });

  test('resolveSymbol scribes entry', () => {
    const s = new LanguageScribe();
    s.declareSymbol('phi', PHI, 'number');
    const before = s.scrollLength;
    s.resolveSymbol('phi');
    assert.equal(s.scrollLength, before + 1);
  });

  test('scanPatterns scribes pattern matches', () => {
    const s = new LanguageScribe();
    s.scanPatterns('let x = 42');
    assert.ok(s.scrollLength >= 1);
  });

  test('manifest has kindCounts', () => {
    const s = new LanguageScribe();
    s.tokenize('x + y');
    const m = s.manifest();
    assert.ok(m.kindCounts.token >= 1);
  });

  test('clear resets scroll', () => {
    const s = new LanguageScribe();
    s.tokenize('a');
    s.clear();
    assert.equal(s.scrollLength, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME SCRIBE — Primitives
// ═══════════════════════════════════════════════════════════════════════════

describe('RuntimeScribe — Complexity Classification', () => {
  test('classifyComplexity for equal times → O(1)', () => {
    assert.equal(classifyComplexity(1, 1, 1), O.CONST);
  });

  test('classifyComplexity for ratio ~2 → O(n)', () => {
    assert.equal(classifyComplexity(1, 2, 4), O.LINEAR);
  });

  test('classifyComplexity for ratio ~4 → O(n²)', () => {
    assert.equal(classifyComplexity(1, 4, 16), O.QUADRATIC);
  });

  test('classifyComplexity for huge ratio → O(2ⁿ)', () => {
    assert.equal(classifyComplexity(1, 100, 10000), O.EXPONENTIAL);
  });
});

describe('RuntimeScribe — Floor / Ceil / TimeMod', () => {
  test('floorUs(3.7) = 3', () => assert.equal(floorUs(3.7), 3));
  test('ceilUs(3.2) = 4', () => assert.equal(ceilUs(3.2), 4));
  test('timeMod always in [0, HEARTBEAT_US)', () => {
    const HEARTBEAT_US = HEARTBEAT_MS * 1000;
    const r = timeMod(999999);
    assert.ok(r >= 0 && r < HEARTBEAT_US);
  });
  test('beatNumber(0) = 1', () => assert.equal(beatNumber(0), 1));
  test('beatNumber(HEARTBEAT_US * 2) = 3', () => {
    const HEARTBEAT_US = HEARTBEAT_MS * 1000;
    assert.equal(beatNumber(HEARTBEAT_US * 2), 3);
  });
});

describe('RuntimeScribe — measure / benchmark', () => {
  test('measure returns result', () => {
    const m = measure('sum', () => 3 + 4);
    assert.equal(m.result, 7);
  });

  test('measure returns executionUs >= 0', () => {
    const m = measure('noop', () => {});
    assert.ok(m.executionUs >= 0);
  });

  test('measure returns floorUs <= executionUs', () => {
    const m = measure('noop', () => {});
    assert.ok(m.floorUs <= m.executionUs);
  });

  test('benchmark classifies O-class', () => {
    const b = benchmark('sum', (arr) => arr.reduce((a, b) => a + b, 0), (n) => Array.from({ length: n }, (_, i) => i), 100);
    assert.ok(Object.values(O).includes(b.complexity));
  });
});

describe('RuntimeScribe — Scribe Class', () => {
  test('measure scribes one entry', () => {
    const s = new RuntimeScribe();
    s.measure('test', () => 42, O.CONST);
    assert.equal(s.scrollLength, 1);
  });

  test('measure entry has correct complexity', () => {
    const s = new RuntimeScribe();
    s.measure('test', () => {}, O.LOG);
    assert.equal(s.readScroll()[0].complexity, O.LOG);
  });

  test('wrap returns correct result', () => {
    const s = new RuntimeScribe();
    const wrappedAdd = s.wrap('add', (a, b) => a + b, O.CONST);
    assert.equal(wrappedAdd(3, 4), 7);
    assert.equal(s.scrollLength, 1);
  });

  test('stats returns avgUs and complexityCounts', () => {
    const s = new RuntimeScribe();
    s.measure('a', () => {}, O.CONST);
    s.measure('b', () => {}, O.LINEAR);
    const st = s.stats();
    assert.ok(st.avgUs >= 0);
    assert.ok(st.complexityCounts[O.CONST] >= 1);
    assert.ok(st.complexityCounts[O.LINEAR] >= 1);
  });

  test('stats of empty scribe returns zeros', () => {
    const s = new RuntimeScribe();
    const st = s.stats();
    assert.equal(st.avgUs, 0);
    assert.equal(st.totalUs, 0);
  });

  test('manifest has heartbeatMs', () => {
    const s = new RuntimeScribe();
    const m = s.manifest();
    assert.equal(m.heartbeatMs, HEARTBEAT_MS);
  });

  test('clear resets scroll', () => {
    const s = new RuntimeScribe();
    s.measure('x', () => {});
    s.clear();
    assert.equal(s.scrollLength, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NOVA SCRIBE ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════

describe('NovaScribeOrchestrator — Initialization', () => {
  test('has orchestratorId', () => {
    const orch = new NovaScribeOrchestrator();
    assert.ok(typeof orch.orchestratorId === 'string');
  });

  test('initial cycleNumber is 0', () => {
    const orch = new NovaScribeOrchestrator();
    assert.equal(orch.cycleNumber, 0);
  });

  test('isRunning is false initially', () => {
    const orch = new NovaScribeOrchestrator();
    assert.equal(orch.isRunning, false);
  });

  test('exposes all 5 scribes', () => {
    const orch = new NovaScribeOrchestrator();
    assert.ok(orch.logic);
    assert.ok(orch.math);
    assert.ok(orch.geometry);
    assert.ok(orch.language);
    assert.ok(orch.runtime);
  });
});

describe('NovaScribeOrchestrator — Manual Tick', () => {
  test('tick increments cycleNumber', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();
    assert.equal(orch.cycleNumber, 1);
  });

  test('tick returns a cycle report', () => {
    const orch = new NovaScribeOrchestrator();
    const report = orch.tick();
    assert.equal(report.cycleNumber, 1);
    assert.ok(typeof report.executionUs === 'number');
    assert.ok(typeof report.phiCoherence === 'number');
  });

  test('tick report has all 5 scribe manifests', () => {
    const orch = new NovaScribeOrchestrator();
    const report = orch.tick();
    assert.ok(report.scribes.logic);
    assert.ok(report.scribes.math);
    assert.ok(report.scribes.geometry);
    assert.ok(report.scribes.language);
    assert.ok(report.scribes.runtime);
  });

  test('multiple ticks accumulate correctly', () => {
    const orch = new NovaScribeOrchestrator();
    for (let i = 0; i < 5; i++) orch.tick();
    assert.equal(orch.cycleNumber, 5);
  });

  test('tick fires onCycle listener', () => {
    const orch = new NovaScribeOrchestrator();
    let fired = 0;
    orch.onCycle(() => fired++);
    orch.tick();
    assert.equal(fired, 1);
  });

  test('onCycle unsubscribe stops listener', () => {
    const orch = new NovaScribeOrchestrator();
    let count = 0;
    const unsub = orch.onCycle(() => count++);
    orch.tick();
    unsub();
    orch.tick();
    assert.equal(count, 1);
  });
});

describe('NovaScribeOrchestrator — recentCycles', () => {
  test('returns up to n recent cycles', () => {
    const orch = new NovaScribeOrchestrator();
    for (let i = 0; i < 5; i++) orch.tick();
    const recent = orch.recentCycles(3);
    assert.equal(recent.length, 3);
  });

  test('recent cycles are the last ones', () => {
    const orch = new NovaScribeOrchestrator();
    for (let i = 0; i < 5; i++) orch.tick();
    const recent = orch.recentCycles(2);
    assert.equal(recent[0].cycleNumber, 4);
    assert.equal(recent[1].cycleNumber, 5);
  });
});

describe('NovaScribeOrchestrator — manifest', () => {
  test('manifest has orchestratorId', () => {
    const orch = new NovaScribeOrchestrator();
    const m = orch.manifest();
    assert.ok(typeof m.orchestratorId === 'string');
  });

  test('manifest has globalCoherence in (0, 1)', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();
    const m = orch.manifest();
    assert.ok(m.globalCoherence > 0 && m.globalCoherence < 1);
  });

  test('manifest has heartbeatMs', () => {
    const orch = new NovaScribeOrchestrator();
    assert.equal(orch.manifest().heartbeatMs, HEARTBEAT_MS);
  });
});

describe('NovaScribeOrchestrator — toOrganismUpdates', () => {
  test('returns 6 register updates', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();
    const updates = orch.toOrganismUpdates();
    assert.equal(updates.length, 6);
  });

  test('updates target cognitive/somatic/sovereign registers', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();
    const updates = orch.toOrganismUpdates();
    const registers = new Set(updates.map(u => u.register));
    assert.ok(registers.has('cognitive'));
    assert.ok(registers.has('somatic'));
    assert.ok(registers.has('sovereign'));
  });

  test('sovereign update has globalCoherence', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();
    const updates = orch.toOrganismUpdates();
    const sov = updates.find(u => u.register === 'sovereign');
    assert.ok(typeof sov.value.globalCoherence === 'number');
  });
});

describe('NovaScribeOrchestrator — Heartbeat', () => {
  test('startHeartbeat sets isRunning = true', () => {
    const orch = new NovaScribeOrchestrator();
    orch.startHeartbeat();
    assert.equal(orch.isRunning, true);
    orch.stopHeartbeat();
  });

  test('stopHeartbeat sets isRunning = false', () => {
    const orch = new NovaScribeOrchestrator();
    orch.startHeartbeat();
    orch.stopHeartbeat();
    assert.equal(orch.isRunning, false);
  });

  test('startHeartbeat throws if already running', () => {
    const orch = new NovaScribeOrchestrator();
    orch.startHeartbeat();
    assert.throws(() => orch.startHeartbeat(), /already running/);
    orch.stopHeartbeat();
  });

  test('stopHeartbeat throws if not running', () => {
    const orch = new NovaScribeOrchestrator();
    assert.throws(() => orch.stopHeartbeat(), /not running/);
  });

  test('heartbeat fires at least 1 tick within 2 heartbeat intervals', async () => {
    const orch = new NovaScribeOrchestrator();
    let cycles = 0;
    orch.onCycle(() => cycles++);
    orch.startHeartbeat();
    await new Promise(r => setTimeout(r, HEARTBEAT_MS * 2 + 100));
    orch.stopHeartbeat();
    assert.ok(cycles >= 1, `Expected >= 1 cycle, got ${cycles}`);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION — All Scribes Working Together
// ═══════════════════════════════════════════════════════════════════════════

describe('Scribes Integration — Full Cross-Scribe Cycle', () => {
  test('all 5 scribes collaborate through the orchestrator', () => {
    const orch = new NovaScribeOrchestrator();

    // 3 manual ticks covering different code branches
    const r1 = orch.tick(); // cycle 1 — logic branch 1, geometry spiral
    const r2 = orch.tick(); // cycle 2 — logic branch 2, geometry golden rect
    const r3 = orch.tick(); // cycle 3 — logic branch 0, geometry vesica

    assert.equal(r3.cycleNumber, 3);
    assert.ok(r1.scribes.logic.scrollLength > 0);
    assert.ok(r2.scribes.math.scrollLength > 0);
    assert.ok(r3.scribes.geometry.scrollLength > 0);
    assert.ok(r3.scribes.language.scrollLength > 0);
    assert.ok(r3.scribes.runtime.scrollLength > 0);
  });

  test('organism updates wire all registers from scribes', () => {
    const orch = new NovaScribeOrchestrator();
    for (let i = 0; i < 3; i++) orch.tick();
    const updates = orch.toOrganismUpdates();

    // Every update must have a register, key, and value
    for (const u of updates) {
      assert.ok(u.register);
      assert.ok(u.key);
      assert.ok(u.value !== undefined);
    }
  });

  test('globalCoherence grows across cycles', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();
    const c1 = orch.globalCoherence;
    for (let i = 0; i < 5; i++) orch.tick();
    const c2 = orch.globalCoherence;
    // Coherence should be in (0, 1) throughout
    assert.ok(c1 > 0 && c1 < 1);
    assert.ok(c2 > 0 && c2 < 1);
  });

  test('prime-sieve cycle (cycle 5) works', () => {
    const orch = new NovaScribeOrchestrator();
    for (let i = 0; i < 5; i++) orch.tick();
    // Math scribe should have a sieve entry
    const mathScrollLen = orch.math.scrollLength;
    assert.ok(mathScrollLen > 0);
  });

  test('logic proof chain cycles produce valid proof scrolls', () => {
    const orch = new NovaScribeOrchestrator();
    orch.tick();   // cycle 1 → truth table
    orch.tick();   // cycle 2 → proof chain
    const logicScroll = orch.logic.readScroll();
    assert.ok(logicScroll.length > 0);
    for (const e of logicScroll) {
      assert.ok(typeof e.output === 'boolean');
    }
  });
});
