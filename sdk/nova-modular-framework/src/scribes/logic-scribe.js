/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  LOGIC SCRIBE — Nova Modular Framework Autonomous Scribe                                ║
 * ║  "Scriptor Logicus — The First Reasoner"                                                 ║
 * ║                                                                                           ║
 * ║  Propositional calculus primitives and advances:                                          ║
 * ║    Primitives : AND · OR · NOT · XOR                                                     ║
 * ║    Advances   : IMPLIES · IFF · NAND · NOR · truth tables · tautology · proof chains     ║
 * ║                                                                                           ║
 * ║  The LogicScribe autonomously records every evaluation into its scroll (log),             ║
 * ║  building a live proof archive of all logical operations performed.                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'node:crypto';
import { PHI_INVERSE, phiBlend } from '../nova-core.js';

// ================================================================== //
// PRIMITIVE LOGIC GATES                                               //
// ================================================================== //

/** AND — P ∧ Q */
export const AND = (p, q) => Boolean(p) && Boolean(q);

/** OR — P ∨ Q */
export const OR = (p, q) => Boolean(p) || Boolean(q);

/** NOT — ¬P */
export const NOT = (p) => !Boolean(p);

/** XOR — P ⊕ Q (exclusive or) */
export const XOR = (p, q) => Boolean(p) !== Boolean(q);

// ================================================================== //
// ADVANCED CONNECTIVES                                                //
// ================================================================== //

/** NAND — ¬(P ∧ Q) */
export const NAND = (p, q) => !AND(p, q);

/** NOR — ¬(P ∨ Q) */
export const NOR = (p, q) => !OR(p, q);

/** IMPLIES — P → Q  (material implication: ¬P ∨ Q) */
export const IMPLIES = (p, q) => OR(NOT(p), q);

/** IFF — P ↔ Q  (biconditional: P iff Q) */
export const IFF = (p, q) => !XOR(p, q);

// ================================================================== //
// HIGHER-ORDER COMBINATORS                                            //
// ================================================================== //

/**
 * ALL — universal quantifier over an array of propositions.
 * Returns true iff every proposition is true (∀).
 * @param {boolean[]} props
 * @returns {boolean}
 */
export function ALL(props) {
  return props.every(Boolean);
}

/**
 * ANY — existential quantifier over an array of propositions.
 * Returns true iff at least one proposition is true (∃).
 * @param {boolean[]} props
 * @returns {boolean}
 */
export function ANY(props) {
  return props.some(Boolean);
}

/**
 * NONE — returns true iff no proposition is true.
 * @param {boolean[]} props
 * @returns {boolean}
 */
export function NONE(props) {
  return !props.some(Boolean);
}

/**
 * MAJORITY — returns true iff more than half the propositions are true.
 * @param {boolean[]} props
 * @returns {boolean}
 */
export function MAJORITY(props) {
  const trueCount = props.filter(Boolean).length;
  return trueCount > props.length / 2;
}

// ================================================================== //
// TRUTH TABLE GENERATOR                                               //
// ================================================================== //

/**
 * Generate a truth table for a binary formula.
 * @param {function(boolean, boolean): boolean} formula
 * @returns {Array<{p: boolean, q: boolean, result: boolean}>}
 */
export function truthTable(formula) {
  const rows = [];
  for (const p of [false, true]) {
    for (const q of [false, true]) {
      rows.push({ p, q, result: formula(p, q) });
    }
  }
  return rows;
}

/**
 * Generate a truth table for a unary formula.
 * @param {function(boolean): boolean} formula
 * @returns {Array<{p: boolean, result: boolean}>}
 */
export function truthTableUnary(formula) {
  return [false, true].map(p => ({ p, result: formula(p) }));
}

/**
 * Check if a binary formula is a tautology (true for all inputs).
 * @param {function(boolean, boolean): boolean} formula
 * @returns {boolean}
 */
export function isTautology(formula) {
  return truthTable(formula).every(row => row.result);
}

/**
 * Check if a binary formula is a contradiction (false for all inputs).
 * @param {function(boolean, boolean): boolean} formula
 * @returns {boolean}
 */
export function isContradiction(formula) {
  return truthTable(formula).every(row => !row.result);
}

/**
 * Check if two formulas are logically equivalent (same truth table output).
 * @param {function(boolean, boolean): boolean} f1
 * @param {function(boolean, boolean): boolean} f2
 * @returns {boolean}
 */
export function areEquivalent(f1, f2) {
  return truthTable(f1).every((row, i) => row.result === truthTable(f2)[i].result);
}

// ================================================================== //
// PROOF CHAIN                                                         //
// ================================================================== //

/**
 * @typedef {Object} ProofStep
 * @property {number} step
 * @property {string} rule        - Name of logic rule applied
 * @property {boolean[]} inputs
 * @property {boolean} output
 * @property {string} description
 */

/**
 * ProofChain — a sequence of logical derivation steps.
 * Each call to step() records the rule name, inputs, and output.
 * @param {string} label  Name of the proof
 * @returns {{ step: function, conclude: function, toScroll: function }}
 */
export function ProofChain(label = 'Unnamed Proof') {
  const steps = [];
  return {
    /**
     * Record one derivation step.
     * @param {string} rule
     * @param {function} connective
     * @param  {...boolean} inputs
     * @returns {boolean} The output of the connective
     */
    step(rule, connective, ...inputs) {
      const output = connective(...inputs);
      steps.push({
        step: steps.length + 1,
        rule,
        inputs: [...inputs],
        output,
        description: `${rule}(${inputs.join(', ')}) → ${output}`,
      });
      return output;
    },
    /**
     * Finalize the proof and return whether the last step is true.
     * @returns {boolean}
     */
    conclude() {
      return steps.length > 0 ? steps[steps.length - 1].output : false;
    },
    /**
     * Return the full proof scroll.
     * @returns {{ label: string, steps: ProofStep[], conclusion: boolean }}
     */
    toScroll() {
      return {
        label,
        steps: steps.map(s => ({ ...s })),
        conclusion: this.conclude(),
      };
    },
  };
}

// ================================================================== //
// LOGIC SCRIBE — Autonomous Autonomous Observer & Recorder            //
// ================================================================== //

/**
 * @typedef {Object} LogicEntry
 * @property {string} entryId
 * @property {string} operation   - Gate or combinator name
 * @property {boolean[]} inputs
 * @property {boolean} output
 * @property {number} phiWeight   - Phi-weighted confidence score [0, 1]
 * @property {number} timestamp
 */

/**
 * LogicScribe — autonomous scribe that records all logical evaluations.
 *
 * Every primitive/advance gate evaluation is observed and inscribed
 * in the scribe's scroll. The scribe maintains a running phi-coherence
 * score across all recorded entries.
 */
export class LogicScribe {
  /** @type {string} */
  #scribeId;

  /** @type {string} */
  #name;

  /** @type {LogicEntry[]} */
  #scroll;

  /** @type {number} */
  #coherence;

  constructor(name = 'LogicScribe') {
    this.#scribeId = `SCRIBE-LOGIC-${crypto.randomUUID()}`;
    this.#name = name;
    this.#scroll = [];
    this.#coherence = PHI_INVERSE;
  }

  get scribeId() { return this.#scribeId; }
  get name() { return this.#name; }
  get coherence() { return this.#coherence; }
  get scrollLength() { return this.#scroll.length; }

  /**
   * Evaluate a logic connective and scribe the result.
   * @param {string} operation  Gate name (e.g. 'AND', 'IMPLIES')
   * @param {function} connective
   * @param  {...boolean} inputs
   * @returns {boolean}
   */
  eval(operation, connective, ...inputs) {
    const output = connective(...inputs);
    const trueInputs = inputs.filter(Boolean).length;
    const inputCoherence = inputs.length > 0 ? trueInputs / inputs.length : 0;
    const phiWeight = phiBlend(inputCoherence, Number(output));
    this.#coherence = phiBlend(this.#coherence, phiWeight);
    this.#scroll.push({
      entryId: crypto.randomUUID(),
      operation,
      inputs: [...inputs],
      output,
      phiWeight,
      timestamp: Date.now(),
    });
    return output;
  }

  /**
   * Run a complete truth table evaluation and scribe all rows.
   * @param {string} formulaName
   * @param {function(boolean, boolean): boolean} formula
   * @returns {Array<{p: boolean, q: boolean, result: boolean}>}
   */
  scribeTruthTable(formulaName, formula) {
    const table = truthTable(formula);
    for (const row of table) {
      this.eval(formulaName, (p, q) => row.result, row.p, row.q);
    }
    return table;
  }

  /**
   * Inscribe a proof chain into the scribe's scroll.
   * @param {{ label: string, steps: ProofStep[], conclusion: boolean }} proofScroll
   */
  inscribeProof(proofScroll) {
    for (const step of proofScroll.steps) {
      this.#scroll.push({
        entryId: crypto.randomUUID(),
        operation: `PROOF:${proofScroll.label}:${step.rule}`,
        inputs: step.inputs,
        output: step.output,
        phiWeight: phiBlend(PHI_INVERSE, Number(step.output)),
        timestamp: Date.now(),
      });
    }
    this.#coherence = phiBlend(this.#coherence, Number(proofScroll.conclusion));
  }

  /**
   * Return the full scroll (read-only copies).
   * @returns {LogicEntry[]}
   */
  readScroll() {
    return this.#scroll.map(e => ({ ...e }));
  }

  /**
   * Return a summary manifest.
   * @returns {Object}
   */
  manifest() {
    const trueOutputs = this.#scroll.filter(e => e.output).length;
    return {
      scribeId: this.#scribeId,
      name: this.#name,
      type: 'LogicScribe',
      scrollLength: this.#scroll.length,
      trueOutputs,
      falseOutputs: this.#scroll.length - trueOutputs,
      coherence: this.#coherence,
    };
  }

  /** Reset the scroll. */
  clear() { this.#scroll = []; this.#coherence = PHI_INVERSE; }
}
