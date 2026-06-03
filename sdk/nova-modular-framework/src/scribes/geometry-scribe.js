/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  GEOMETRY SCRIBE — Nova Modular Framework Autonomous Scribe                             ║
 * ║  "Scriptor Geometricus — The Form Witness"                                               ║
 * ║                                                                                           ║
 * ║  Primitives : point · distance · midpoint · slope · line intersection                   ║
 * ║  Advances   : circle · triangle · golden rectangle · phi-spiral · ellipse               ║
 * ║  Phi-forms  : goldenRectangle · phiSpiral · goldenTriangle · vesicaPiscis               ║
 * ║                                                                                           ║
 * ║  The GeometryScribe autonomously records every geometric construction and measure        ║
 * ║  into its scroll, maintaining a phi-coherence score across all forms.                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'node:crypto';
import { PHI, PHI_INVERSE, PHI_ANGLE, TWO_PI, phiBlend } from '../nova-core.js';

// ================================================================== //
// PRIMITIVE GEOMETRY                                                  //
// ================================================================== //

/**
 * @typedef {{ x: number, y: number }} Point2D
 */

/**
 * Create a 2D point.
 * @param {number} x
 * @param {number} y
 * @returns {Point2D}
 */
export function point(x, y) { return { x, y }; }

/**
 * Euclidean distance between two 2D points — O(1)
 * @param {Point2D} a
 * @param {Point2D} b
 * @returns {number}
 */
export function distance(a, b) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/**
 * Midpoint of two 2D points — O(1)
 * @param {Point2D} a
 * @param {Point2D} b
 * @returns {Point2D}
 */
export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Slope of a line through two points — O(1)
 * Returns Infinity for vertical lines.
 * @param {Point2D} a
 * @param {Point2D} b
 * @returns {number}
 */
export function slope(a, b) {
  if (b.x === a.x) return Infinity;
  return (b.y - a.y) / (b.x - a.x);
}

/**
 * Dot product of two vectors (as Point2D) — O(1)
 * @param {Point2D} u
 * @param {Point2D} v
 * @returns {number}
 */
export function dot(u, v) { return u.x * v.x + u.y * v.y; }

/**
 * Cross product magnitude of two 2D vectors — O(1)
 * Positive: v is CCW from u; Negative: CW; Zero: collinear.
 * @param {Point2D} u
 * @param {Point2D} v
 * @returns {number}
 */
export function cross(u, v) { return u.x * v.y - u.y * v.x; }

/**
 * Angle between two vectors in radians — O(1)
 * @param {Point2D} u
 * @param {Point2D} v
 * @returns {number}
 */
export function angleBetween(u, v) {
  const d = dot(u, v);
  const mag = Math.sqrt(dot(u, u) * dot(v, v));
  if (mag === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, d / mag)));
}

// ================================================================== //
// CIRCLES                                                             //
// ================================================================== //

/**
 * @typedef {{ center: Point2D, radius: number }} Circle
 */

/**
 * Create a circle.
 * @param {Point2D} center
 * @param {number} radius
 * @returns {Circle}
 */
export function circle(center, radius) {
  if (radius < 0) throw new RangeError('Circle radius must be non-negative');
  return { center, radius };
}

/** Circle area: π r² — O(1) */
export function circleArea(c) { return Math.PI * c.radius ** 2; }

/** Circle perimeter (circumference): 2π r — O(1) */
export function circlePerimeter(c) { return TWO_PI * c.radius; }

/** Check if a point lies inside a circle (strictly) — O(1) */
export function pointInCircle(p, c) { return distance(p, c.center) < c.radius; }

// ================================================================== //
// TRIANGLES                                                           //
// ================================================================== //

/**
 * @typedef {{ a: Point2D, b: Point2D, c: Point2D }} Triangle
 */

/**
 * Create a triangle from three vertices.
 * @param {Point2D} a
 * @param {Point2D} b
 * @param {Point2D} c
 * @returns {Triangle}
 */
export function triangle(a, b, c) { return { a, b, c }; }

/**
 * Triangle perimeter — O(1)
 * @param {Triangle} t
 * @returns {number}
 */
export function trianglePerimeter(t) {
  return distance(t.a, t.b) + distance(t.b, t.c) + distance(t.c, t.a);
}

/**
 * Triangle area via cross-product (signed, absolute) — O(1)
 * @param {Triangle} t
 * @returns {number}
 */
export function triangleArea(t) {
  const u = { x: t.b.x - t.a.x, y: t.b.y - t.a.y };
  const v = { x: t.c.x - t.a.x, y: t.c.y - t.a.y };
  return Math.abs(cross(u, v)) / 2;
}

/**
 * Triangle centroid — O(1)
 * @param {Triangle} t
 * @returns {Point2D}
 */
export function triangleCentroid(t) {
  return { x: (t.a.x + t.b.x + t.c.x) / 3, y: (t.a.y + t.b.y + t.c.y) / 3 };
}

/**
 * Check if a triangle is a golden gnomon (isoceles with ratio 1:1:φ sides).
 * Returns true if the longest side / shorter side ≈ φ.
 * @param {Triangle} t
 * @param {number} [epsilon=0.01]
 * @returns {boolean}
 */
export function isGoldenGnomon(t, epsilon = 0.01) {
  const sides = [distance(t.a, t.b), distance(t.b, t.c), distance(t.c, t.a)].sort((a, b) => a - b);
  return Math.abs(sides[2] / sides[0] - PHI) < epsilon;
}

// ================================================================== //
// RECTANGLES                                                          //
// ================================================================== //

/**
 * @typedef {{ origin: Point2D, width: number, height: number }} Rect
 */

/**
 * Create a rectangle.
 * @param {Point2D} origin  Top-left corner
 * @param {number} width
 * @param {number} height
 * @returns {Rect}
 */
export function rect(origin, width, height) {
  if (width < 0 || height < 0) throw new RangeError('Width and height must be non-negative');
  return { origin, width, height };
}

/** Rectangle area — O(1) */
export function rectArea(r) { return r.width * r.height; }

/** Rectangle perimeter — O(1) */
export function rectPerimeter(r) { return 2 * (r.width + r.height); }

/**
 * Golden rectangle — width and height in ratio 1:φ — O(1)
 * @param {Point2D} origin
 * @param {number} shortSide
 * @returns {Rect}
 */
export function goldenRectangle(origin, shortSide) {
  return rect(origin, shortSide * PHI, shortSide);
}

/**
 * Aspect ratio of a rectangle — O(1)
 * @param {Rect} r
 * @returns {number}
 */
export function aspectRatio(r) {
  if (r.height === 0) throw new RangeError('Height is zero');
  return r.width / r.height;
}

/**
 * Check if a rectangle is a golden rectangle — O(1)
 * @param {Rect} r
 * @param {number} [epsilon=0.01]
 * @returns {boolean}
 */
export function isGoldenRect(r, epsilon = 0.01) {
  if (r.height === 0) return false;
  const ratio = Math.max(r.width, r.height) / Math.min(r.width, r.height);
  return Math.abs(ratio - PHI) < epsilon;
}

// ================================================================== //
// PHI-SPIRAL (Logarithmic Golden Spiral)                              //
// ================================================================== //

/**
 * Generate n points along a phi-spiral (Fibonacci / golden spiral).
 * The radius grows by φ every 90° (π/2 radians).
 *
 * r(θ) = a · e^(b·θ)  where b = ln(φ) / (π/2)
 *
 * @param {number} n        Number of points
 * @param {number} [a=1]    Initial radius
 * @param {Point2D} [center={x:0,y:0}]  Center of spiral
 * @returns {Point2D[]}
 */
export function phiSpiral(n, a = 1, center = { x: 0, y: 0 }) {
  if (n < 1) return [];
  const b = Math.log(PHI) / (Math.PI / 2);
  const points = [];
  for (let i = 0; i < n; i++) {
    const theta = (PHI_ANGLE * i);   // advance by golden angle
    const r = a * Math.exp(b * theta);
    points.push({
      x: center.x + r * Math.cos(theta),
      y: center.y + r * Math.sin(theta),
    });
  }
  return points;
}

/**
 * Generate Fibonacci arc points — quarter-circle arcs with Fibonacci radii.
 * Returns the sequence of arc control points for n Fibonacci steps.
 * @param {number} steps  Number of Fibonacci arcs
 * @param {number} [unit=1]  Size of first Fibonacci unit
 * @returns {Array<{ radius: number, fibIndex: number }>}
 */
export function fibonacciArcs(steps, unit = 1) {
  const arcs = [];
  let a = unit, b = unit;
  for (let i = 0; i < steps; i++) {
    arcs.push({ radius: a, fibIndex: i + 1 });
    [a, b] = [b, a + b];
  }
  return arcs;
}

// ================================================================== //
// VESICA PISCIS                                                       //
// ================================================================== //

/**
 * Vesica Piscis — the intersection region of two equal circles sharing radii.
 * Returns the two centers, radius, width, and height of the vesica.
 * @param {number} radius
 * @returns {{ c1: Circle, c2: Circle, width: number, height: number, area: number }}
 */
export function vesicaPiscis(radius) {
  const c1 = circle({ x: -radius / 2, y: 0 }, radius);
  const c2 = circle({ x:  radius / 2, y: 0 }, radius);
  const height = radius * Math.sqrt(3);
  const width = radius;
  // Area of vesica: (π/3 - √3/4) * 2 * r² * 2 (approximate)
  const area = (2 * radius ** 2) * (Math.PI / 3 - Math.sqrt(3) / 4) * 2;
  return { c1, c2, width, height, area };
}

// ================================================================== //
// ELLIPSE                                                             //
// ================================================================== //

/**
 * @typedef {{ center: Point2D, a: number, b: number }} Ellipse  — a=semi-major, b=semi-minor
 */

/**
 * Create an ellipse.
 * @param {Point2D} center
 * @param {number} a  Semi-major axis
 * @param {number} b  Semi-minor axis
 * @returns {Ellipse}
 */
export function ellipse(center, a, b) {
  if (a <= 0 || b <= 0) throw new RangeError('Ellipse axes must be positive');
  return { center, a, b };
}

/** Ellipse area: π a b — O(1) */
export function ellipseArea(e) { return Math.PI * e.a * e.b; }

/**
 * Ellipse perimeter (Ramanujan approximation) — O(1)
 * @param {Ellipse} e
 * @returns {number}
 */
export function ellipsePerimeter(e) {
  const h = ((e.a - e.b) / (e.a + e.b)) ** 2;
  return Math.PI * (e.a + e.b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/**
 * Eccentricity of an ellipse — O(1)
 * @param {Ellipse} e
 * @returns {number}  In [0, 1)
 */
export function ellipseEccentricity(e) {
  const major = Math.max(e.a, e.b);
  const minor = Math.min(e.a, e.b);
  return Math.sqrt(1 - (minor / major) ** 2);
}

// ================================================================== //
// GEOMETRY SCRIBE — Autonomous Observer & Recorder                   //
// ================================================================== //

/**
 * @typedef {Object} GeometryEntry
 * @property {string} entryId
 * @property {string} construction  - Name of the geometric construction
 * @property {string} form          - 'point' | 'circle' | 'triangle' | 'rect' | 'spiral' | 'ellipse' | 'measure'
 * @property {unknown} result       - The constructed object or measure
 * @property {number} phiAffinity   - How close this form is to phi-ideal [0, 1]
 * @property {number} timestamp
 */

/**
 * GeometryScribe — autonomous scribe that records all geometric constructions and measures.
 *
 * Every call to a construction or measurement method inscribes the result,
 * its form type, and its phi-affinity score into the scroll.
 */
export class GeometryScribe {
  /** @type {string} */
  #scribeId;

  /** @type {string} */
  #name;

  /** @type {GeometryEntry[]} */
  #scroll;

  /** @type {number} */
  #coherence;

  constructor(name = 'GeometryScribe') {
    this.#scribeId = `SCRIBE-GEOM-${crypto.randomUUID()}`;
    this.#name = name;
    this.#scroll = [];
    this.#coherence = PHI_INVERSE;
  }

  get scribeId() { return this.#scribeId; }
  get name() { return this.#name; }
  get coherence() { return this.#coherence; }
  get scrollLength() { return this.#scroll.length; }

  /**
   * Inscribe any geometric result.
   * @param {string} construction
   * @param {string} form
   * @param {unknown} result
   * @param {number} [phiAffinity=PHI_INVERSE]
   */
  #inscribe(construction, form, result, phiAffinity = PHI_INVERSE) {
    this.#coherence = phiBlend(this.#coherence, phiAffinity);
    this.#scroll.push({
      entryId: crypto.randomUUID(),
      construction,
      form,
      result,
      phiAffinity,
      timestamp: Date.now(),
    });
  }

  // ------------------------------------------------------------------ //
  // Scribed construction methods                                         //
  // ------------------------------------------------------------------ //

  /** Scribed point */
  point(x, y) {
    const p = point(x, y);
    this.#inscribe('point', 'point', p, PHI_INVERSE);
    return p;
  }

  /** Scribed distance measurement */
  distance(a, b) {
    const d = distance(a, b);
    this.#inscribe('distance', 'measure', d, phiBlend(PHI_INVERSE, 1 / (1 + d)));
    return d;
  }

  /** Scribed midpoint */
  midpoint(a, b) {
    const m = midpoint(a, b);
    this.#inscribe('midpoint', 'point', m, PHI_INVERSE);
    return m;
  }

  /** Scribed slope */
  slope(a, b) {
    const s = slope(a, b);
    this.#inscribe('slope', 'measure', s, PHI_INVERSE);
    return s;
  }

  /** Scribed circle */
  circle(center, radius) {
    const c = circle(center, radius);
    const affinity = phiBlend(PHI_INVERSE, 1 / (1 + Math.abs(radius - PHI)));
    this.#inscribe('circle', 'circle', c, affinity);
    return c;
  }

  /** Scribed circle area */
  circleArea(c) {
    const a = circleArea(c);
    this.#inscribe('circleArea', 'measure', a, PHI_INVERSE);
    return a;
  }

  /** Scribed circle perimeter */
  circlePerimeter(c) {
    const p = circlePerimeter(c);
    this.#inscribe('circlePerimeter', 'measure', p, PHI_INVERSE);
    return p;
  }

  /** Scribed triangle */
  triangle(a, b, c) {
    const t = triangle(a, b, c);
    const golden = isGoldenGnomon(t) ? 1 : PHI_INVERSE;
    this.#inscribe('triangle', 'triangle', t, golden);
    return t;
  }

  /** Scribed triangle area */
  triangleArea(t) {
    const a = triangleArea(t);
    this.#inscribe('triangleArea', 'measure', a, PHI_INVERSE);
    return a;
  }

  /** Scribed triangle perimeter */
  trianglePerimeter(t) {
    const p = trianglePerimeter(t);
    this.#inscribe('trianglePerimeter', 'measure', p, PHI_INVERSE);
    return p;
  }

  /** Scribed golden rectangle */
  goldenRectangle(origin, shortSide) {
    const r = goldenRectangle(origin, shortSide);
    this.#inscribe('goldenRectangle', 'rect', r, 1.0);
    return r;
  }

  /** Scribed rectangle (any) */
  rect(origin, w, h) {
    const r = rect(origin, w, h);
    const isGolden = isGoldenRect(r) ? 1 : PHI_INVERSE;
    this.#inscribe('rect', 'rect', r, isGolden);
    return r;
  }

  /** Scribed phi-spiral */
  phiSpiral(n, a = 1, center = { x: 0, y: 0 }) {
    const pts = phiSpiral(n, a, center);
    this.#inscribe('phiSpiral', 'spiral', pts, 1.0);
    return pts;
  }

  /** Scribed Fibonacci arcs */
  fibonacciArcs(steps, unit = 1) {
    const arcs = fibonacciArcs(steps, unit);
    this.#inscribe('fibonacciArcs', 'spiral', arcs, 1.0);
    return arcs;
  }

  /** Scribed vesica piscis */
  vesicaPiscis(radius) {
    const v = vesicaPiscis(radius);
    this.#inscribe('vesicaPiscis', 'circle', v, PHI_INVERSE);
    return v;
  }

  /** Scribed ellipse */
  ellipse(center, a, b) {
    const e = ellipse(center, a, b);
    const affinity = phiBlend(PHI_INVERSE, 1 / (1 + Math.abs(a / b - PHI)));
    this.#inscribe('ellipse', 'ellipse', e, affinity);
    return e;
  }

  /** Scribed ellipse area */
  ellipseArea(e) {
    const a = ellipseArea(e);
    this.#inscribe('ellipseArea', 'measure', a, PHI_INVERSE);
    return a;
  }

  /**
   * Return the full scroll (read-only copies).
   * @returns {GeometryEntry[]}
   */
  readScroll() {
    return this.#scroll.map(e => ({ ...e }));
  }

  /**
   * Summary manifest.
   * @returns {Object}
   */
  manifest() {
    const forms = {};
    for (const e of this.#scroll) {
      forms[e.form] = (forms[e.form] ?? 0) + 1;
    }
    return {
      scribeId: this.#scribeId,
      name: this.#name,
      type: 'GeometryScribe',
      scrollLength: this.#scroll.length,
      coherence: this.#coherence,
      formCounts: forms,
      phi: PHI,
    };
  }

  /** Reset the scroll. */
  clear() { this.#scroll = []; this.#coherence = PHI_INVERSE; }
}
