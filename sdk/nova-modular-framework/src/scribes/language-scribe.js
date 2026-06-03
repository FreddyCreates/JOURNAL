/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  LANGUAGE SCRIBE — Nova Modular Framework Autonomous Scribe                             ║
 * ║  "Scriptor Linguae — The Word Keeper"                                                    ║
 * ║                                                                                           ║
 * ║  Language primitives:                                                                     ║
 * ║    Token      — atom of meaning (identifier / literal / operator / delimiter / keyword)  ║
 * ║    Lexeme     — raw character sequence mapped to a token type                            ║
 * ║    Symbol     — named binding (name → type → value)                                      ║
 * ║    Grammar    — production rules (non-terminal → terminals/non-terminals)                ║
 * ║                                                                                           ║
 * ║  Language advances:                                                                       ║
 * ║    Lexer      — tokenize a raw string into a lexeme stream                               ║
 * ║    SymbolTable— hierarchical scope-aware binding store                                   ║
 * ║    PatternMatcher — regex-free structural pattern matching over token streams            ║
 * ║    PrimitiveDetector — classify any token as a language primitive type                  ║
 * ║                                                                                           ║
 * ║  The LanguageScribe autonomously records every token, symbol resolution, and              ║
 * ║  grammar pattern match into its scroll.                                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import crypto from 'node:crypto';
import { PHI_INVERSE, phiBlend } from '../nova-core.js';

// ================================================================== //
// TOKEN TYPES — Language Primitives                                   //
// ================================================================== //

/** All token primitive types */
export const TOKEN_TYPES = Object.freeze({
  IDENTIFIER:  'IDENTIFIER',
  KEYWORD:     'KEYWORD',
  LITERAL_NUM: 'LITERAL_NUM',
  LITERAL_STR: 'LITERAL_STR',
  LITERAL_BOOL:'LITERAL_BOOL',
  OPERATOR:    'OPERATOR',
  DELIMITER:   'DELIMITER',
  COMMENT:     'COMMENT',
  WHITESPACE:  'WHITESPACE',
  UNKNOWN:     'UNKNOWN',
});

/**
 * @typedef {Object} Token
 * @property {string} type   - One of TOKEN_TYPES
 * @property {string} lexeme - Raw source text
 * @property {number} pos    - Character offset in the source
 */

/**
 * Classify a single lexeme into its token type.
 * @param {string} lexeme
 * @returns {string}  One of TOKEN_TYPES
 */
export function classifyLexeme(lexeme) {
  if (lexeme === undefined || lexeme === null) return TOKEN_TYPES.UNKNOWN;
  const s = String(lexeme).trim();
  if (s === '') return TOKEN_TYPES.WHITESPACE;

  // Boolean literals
  if (s === 'true' || s === 'false') return TOKEN_TYPES.LITERAL_BOOL;

  // Numeric literals (integer, float, scientific notation)
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s)) return TOKEN_TYPES.LITERAL_NUM;

  // String literals (quoted)
  if (/^"[^"]*"$/.test(s) || /^'[^']*'$/.test(s)) return TOKEN_TYPES.LITERAL_STR;

  // Operators
  if (/^[+\-*/=<>!&|^%~]+$/.test(s) || ['==', '!=', '<=', '>=', '&&', '||', '->', '=>', '::', '..'].includes(s)) {
    return TOKEN_TYPES.OPERATOR;
  }

  // Delimiters
  if (/^[(){}\[\];,.:@#$]$/.test(s)) return TOKEN_TYPES.DELIMITER;

  // Comments
  if (s.startsWith('//') || s.startsWith('/*') || s.startsWith('#')) return TOKEN_TYPES.COMMENT;

  // Keywords (sovereign language set)
  const KEYWORDS = new Set([
    'if', 'else', 'while', 'for', 'return', 'function', 'let', 'const', 'var',
    'class', 'import', 'export', 'from', 'new', 'this', 'null', 'undefined',
    'typeof', 'instanceof', 'in', 'of', 'do', 'switch', 'case', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
    'phi', 'nova', 'sovereign', 'organism', 'kernel', 'scribe',
  ]);
  if (KEYWORDS.has(s)) return TOKEN_TYPES.KEYWORD;

  // Identifiers
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s)) return TOKEN_TYPES.IDENTIFIER;

  return TOKEN_TYPES.UNKNOWN;
}

// ================================================================== //
// LEXER — Tokenize a raw source string                                //
// ================================================================== //

/**
 * Minimal lexer — splits a source string into tokens using whitespace,
 * operator, and delimiter boundaries. O(n) where n = source length.
 * @param {string} source
 * @returns {Token[]}
 */
export function tokenize(source) {
  if (typeof source !== 'string') throw new TypeError('Source must be a string');
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    // Skip whitespace (record it)
    if (/\s/.test(source[i])) {
      let ws = '';
      while (i < source.length && /\s/.test(source[i])) { ws += source[i++]; }
      tokens.push({ type: TOKEN_TYPES.WHITESPACE, lexeme: ws, pos: i - ws.length });
      continue;
    }
    // Single-line comment
    if (source.slice(i, i + 2) === '//') {
      let j = i;
      while (j < source.length && source[j] !== '\n') j++;
      tokens.push({ type: TOKEN_TYPES.COMMENT, lexeme: source.slice(i, j), pos: i });
      i = j;
      continue;
    }
    // String literal
    if (source[i] === '"' || source[i] === "'") {
      const quote = source[i];
      let j = i + 1;
      while (j < source.length && source[j] !== quote) j++;
      const lexeme = source.slice(i, j + 1);
      tokens.push({ type: TOKEN_TYPES.LITERAL_STR, lexeme, pos: i });
      i = j + 1;
      continue;
    }
    // Delimiter
    if (/[(){}\[\];,.:@#$]/.test(source[i])) {
      tokens.push({ type: TOKEN_TYPES.DELIMITER, lexeme: source[i], pos: i });
      i++;
      continue;
    }
    // Operator (multi-char first)
    const twoChar = source.slice(i, i + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '->', '=>', '::', '..'].includes(twoChar)) {
      tokens.push({ type: TOKEN_TYPES.OPERATOR, lexeme: twoChar, pos: i });
      i += 2;
      continue;
    }
    if (/[+\-*/=<>!&|^%~]/.test(source[i])) {
      tokens.push({ type: TOKEN_TYPES.OPERATOR, lexeme: source[i], pos: i });
      i++;
      continue;
    }
    // Number
    if (/\d/.test(source[i]) || (source[i] === '-' && /\d/.test(source[i + 1] ?? ''))) {
      let j = i;
      if (source[j] === '-') j++;
      while (j < source.length && /[\d.eE+\-]/.test(source[j])) j++;
      const lexeme = source.slice(i, j);
      tokens.push({ type: classifyLexeme(lexeme), lexeme, pos: i });
      i = j;
      continue;
    }
    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(source[i])) {
      let j = i;
      while (j < source.length && /[a-zA-Z0-9_$]/.test(source[j])) j++;
      const lexeme = source.slice(i, j);
      tokens.push({ type: classifyLexeme(lexeme), lexeme, pos: i });
      i = j;
      continue;
    }
    // Unknown
    tokens.push({ type: TOKEN_TYPES.UNKNOWN, lexeme: source[i], pos: i });
    i++;
  }
  return tokens;
}

/**
 * Filter whitespace and comments from a token stream — O(n)
 * @param {Token[]} tokens
 * @returns {Token[]}
 */
export function filterNoise(tokens) {
  return tokens.filter(t => t.type !== TOKEN_TYPES.WHITESPACE && t.type !== TOKEN_TYPES.COMMENT);
}

// ================================================================== //
// SYMBOL TABLE — Hierarchical Scope-aware Binding Store              //
// ================================================================== //

/**
 * @typedef {Object} Symbol
 * @property {string} name
 * @property {string} valueType   - 'number' | 'string' | 'boolean' | 'function' | 'object' | 'unknown'
 * @property {unknown} value
 * @property {number} scope       - Scope depth (0 = global)
 * @property {number} declaredAt
 */

/**
 * SymbolTable — hierarchical scope-aware binding store.
 * Supports nested scopes with lexical shadowing.
 */
export class SymbolTable {
  /** @type {Array<Map<string, Symbol>>} */
  #scopes;

  constructor() {
    this.#scopes = [new Map()]; // global scope
  }

  /** Push a new scope frame. */
  pushScope() { this.#scopes.push(new Map()); }

  /** Pop the current scope frame. Returns dropped bindings. */
  popScope() {
    if (this.#scopes.length <= 1) throw new Error('Cannot pop global scope');
    return this.#scopes.pop();
  }

  /** Current scope depth. */
  get depth() { return this.#scopes.length - 1; }

  /**
   * Declare a symbol in the current scope.
   * @param {string} name
   * @param {unknown} value
   * @param {string} [valueType]
   * @returns {Symbol}
   */
  declare(name, value, valueType) {
    const scope = this.#scopes[this.#scopes.length - 1];
    if (scope.has(name)) throw new Error(`Symbol "${name}" already declared in current scope`);
    const sym = {
      name,
      valueType: valueType ?? typeof value,
      value,
      scope: this.depth,
      declaredAt: Date.now(),
    };
    scope.set(name, sym);
    return { ...sym };
  }

  /**
   * Resolve a symbol by walking up the scope chain.
   * @param {string} name
   * @returns {Symbol | null}
   */
  resolve(name) {
    for (let i = this.#scopes.length - 1; i >= 0; i--) {
      if (this.#scopes[i].has(name)) return { ...this.#scopes[i].get(name) };
    }
    return null;
  }

  /**
   * Assign a new value to an existing symbol.
   * @param {string} name
   * @param {unknown} value
   */
  assign(name, value) {
    for (let i = this.#scopes.length - 1; i >= 0; i--) {
      if (this.#scopes[i].has(name)) {
        const sym = this.#scopes[i].get(name);
        sym.value = value;
        sym.valueType = typeof value;
        return;
      }
    }
    throw new Error(`Symbol "${name}" not declared`);
  }

  /** Return all symbols visible in current scope (flattened, inner wins). */
  visibleSymbols() {
    const seen = new Map();
    for (const scope of this.#scopes) {
      for (const [name, sym] of scope) {
        if (!seen.has(name)) seen.set(name, { ...sym });
      }
    }
    return Array.from(seen.values());
  }
}

// ================================================================== //
// PATTERN MATCHER — Structural Pattern Matching Over Token Streams    //
// ================================================================== //

/**
 * @typedef {Object} PatternRule
 * @property {string} name
 * @property {string[]} sequence  - Ordered list of TOKEN_TYPES expected
 */

/**
 * PatternMatcher — matches sequences of token types against registered patterns.
 * Uses a sliding-window scan over the token stream — O(n × k) where k = max pattern length.
 */
export class PatternMatcher {
  /** @type {Map<string, PatternRule>} */
  #rules;

  constructor() {
    this.#rules = new Map();
    this.#seedPrimitivePatterns();
  }

  /**
   * Register a named pattern rule.
   * @param {string} name
   * @param {string[]} typeSequence
   */
  addRule(name, typeSequence) {
    this.#rules.set(name, { name, sequence: typeSequence });
  }

  /**
   * Scan a token stream for all rule matches.
   * @param {Token[]} tokens  (should be noise-filtered)
   * @returns {Array<{ rule: string, startPos: number, matchedTokens: Token[] }>}
   */
  scan(tokens) {
    const matches = [];
    for (const rule of this.#rules.values()) {
      const seq = rule.sequence;
      for (let i = 0; i <= tokens.length - seq.length; i++) {
        let match = true;
        for (let j = 0; j < seq.length; j++) {
          if (tokens[i + j].type !== seq[j]) { match = false; break; }
        }
        if (match) {
          matches.push({
            rule: rule.name,
            startPos: tokens[i].pos,
            matchedTokens: tokens.slice(i, i + seq.length),
          });
        }
      }
    }
    return matches;
  }

  /** Pre-seed common language primitive patterns. */
  #seedPrimitivePatterns() {
    this.addRule('assignment',       [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.OPERATOR, TOKEN_TYPES.LITERAL_NUM]);
    this.addRule('assignment-str',   [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.OPERATOR, TOKEN_TYPES.LITERAL_STR]);
    this.addRule('assignment-bool',  [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.OPERATOR, TOKEN_TYPES.LITERAL_BOOL]);
    this.addRule('call',             [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.DELIMITER]);
    this.addRule('declaration',      [TOKEN_TYPES.KEYWORD, TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.OPERATOR]);
    this.addRule('binary-op',        [TOKEN_TYPES.IDENTIFIER, TOKEN_TYPES.OPERATOR, TOKEN_TYPES.IDENTIFIER]);
    this.addRule('literal-expr',     [TOKEN_TYPES.LITERAL_NUM, TOKEN_TYPES.OPERATOR, TOKEN_TYPES.LITERAL_NUM]);
  }
}

// ================================================================== //
// LANGUAGE SCRIBE — Autonomous Observer & Recorder                   //
// ================================================================== //

/**
 * @typedef {Object} LanguageEntry
 * @property {string} entryId
 * @property {'token' | 'symbol' | 'pattern' | 'lexeme'} kind
 * @property {string} description
 * @property {unknown} data
 * @property {number} phiWeight
 * @property {number} timestamp
 */

/**
 * LanguageScribe — autonomous scribe for language analysis.
 *
 * Tokenizes source strings, records every token, symbol declaration/resolution,
 * and pattern match into the scroll. Maintains a phi-weighted coherence score
 * based on the ratio of meaningful tokens (non-noise) to total tokens.
 */
export class LanguageScribe {
  /** @type {string} */
  #scribeId;

  /** @type {string} */
  #name;

  /** @type {LanguageEntry[]} */
  #scroll;

  /** @type {number} */
  #coherence;

  /** @type {SymbolTable} */
  #symbols;

  /** @type {PatternMatcher} */
  #matcher;

  constructor(name = 'LanguageScribe') {
    this.#scribeId = `SCRIBE-LANG-${crypto.randomUUID()}`;
    this.#name = name;
    this.#scroll = [];
    this.#coherence = PHI_INVERSE;
    this.#symbols = new SymbolTable();
    this.#matcher = new PatternMatcher();
  }

  get scribeId() { return this.#scribeId; }
  get name() { return this.#name; }
  get coherence() { return this.#coherence; }
  get scrollLength() { return this.#scroll.length; }
  get symbolTable() { return this.#symbols; }
  get patternMatcher() { return this.#matcher; }

  /**
   * Tokenize a source string and scribe all tokens.
   * @param {string} source
   * @returns {Token[]}
   */
  tokenize(source) {
    const tokens = tokenize(source);
    const meaningful = filterNoise(tokens);
    const meaningfulRatio = tokens.length > 0 ? meaningful.length / tokens.length : 0;
    this.#coherence = phiBlend(this.#coherence, meaningfulRatio);

    for (const token of tokens) {
      const phi = token.type === TOKEN_TYPES.WHITESPACE || token.type === TOKEN_TYPES.COMMENT
        ? PHI_INVERSE * 0.5
        : phiBlend(PHI_INVERSE, token.type === TOKEN_TYPES.UNKNOWN ? 0 : 1);
      this.#scroll.push({
        entryId: crypto.randomUUID(),
        kind: 'token',
        description: `${token.type}("${token.lexeme}")`,
        data: { ...token },
        phiWeight: phi,
        timestamp: Date.now(),
      });
    }
    return tokens;
  }

  /**
   * Classify and scribe a single lexeme.
   * @param {string} lexeme
   * @returns {string}  Token type
   */
  classifyLexeme(lexeme) {
    const type = classifyLexeme(lexeme);
    const phi = type === TOKEN_TYPES.UNKNOWN ? 0 : PHI_INVERSE;
    this.#scroll.push({
      entryId: crypto.randomUUID(),
      kind: 'lexeme',
      description: `classify("${lexeme}") → ${type}`,
      data: { lexeme, type },
      phiWeight: phi,
      timestamp: Date.now(),
    });
    return type;
  }

  /**
   * Declare a symbol and scribe the binding.
   * @param {string} name
   * @param {unknown} value
   * @param {string} [valueType]
   * @returns {Symbol}
   */
  declareSymbol(name, value, valueType) {
    const sym = this.#symbols.declare(name, value, valueType);
    this.#scroll.push({
      entryId: crypto.randomUUID(),
      kind: 'symbol',
      description: `declare("${name}": ${sym.valueType})`,
      data: { ...sym },
      phiWeight: PHI_INVERSE,
      timestamp: Date.now(),
    });
    return sym;
  }

  /**
   * Resolve a symbol and scribe the lookup result.
   * @param {string} name
   * @returns {Symbol | null}
   */
  resolveSymbol(name) {
    const sym = this.#symbols.resolve(name);
    this.#scroll.push({
      entryId: crypto.randomUUID(),
      kind: 'symbol',
      description: sym ? `resolve("${name}") → found @ scope ${sym.scope}` : `resolve("${name}") → NOT FOUND`,
      data: sym ? { ...sym } : null,
      phiWeight: sym ? PHI_INVERSE : 0,
      timestamp: Date.now(),
    });
    return sym;
  }

  /**
   * Scan a source for pattern matches and scribe all results.
   * @param {string} source
   * @returns {Array<{ rule: string, startPos: number, matchedTokens: Token[] }>}
   */
  scanPatterns(source) {
    const tokens = filterNoise(tokenize(source));
    const matches = this.#matcher.scan(tokens);
    for (const m of matches) {
      this.#scroll.push({
        entryId: crypto.randomUUID(),
        kind: 'pattern',
        description: `pattern("${m.rule}") @ pos ${m.startPos}`,
        data: { rule: m.rule, startPos: m.startPos, lexemes: m.matchedTokens.map(t => t.lexeme) },
        phiWeight: PHI_INVERSE,
        timestamp: Date.now(),
      });
    }
    this.#coherence = phiBlend(this.#coherence, matches.length > 0 ? 1 : PHI_INVERSE);
    return matches;
  }

  /**
   * Return the full scroll (read-only copies).
   * @returns {LanguageEntry[]}
   */
  readScroll() {
    return this.#scroll.map(e => ({ ...e }));
  }

  /**
   * Summary manifest.
   * @returns {Object}
   */
  manifest() {
    const kindCounts = {};
    for (const e of this.#scroll) {
      kindCounts[e.kind] = (kindCounts[e.kind] ?? 0) + 1;
    }
    return {
      scribeId: this.#scribeId,
      name: this.#name,
      type: 'LanguageScribe',
      scrollLength: this.#scroll.length,
      coherence: this.#coherence,
      kindCounts,
      symbolCount: this.#symbols.visibleSymbols().length,
    };
  }

  /** Reset the scroll (keeps symbol table and pattern rules). */
  clear() { this.#scroll = []; this.#coherence = PHI_INVERSE; }
}
