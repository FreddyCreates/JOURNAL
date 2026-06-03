/**
 * CPL-L Parser — Cognitive Law Language
 * Parses CPL-L source code into an Abstract Syntax Tree (AST)
 * @module @medina/cpl-l-parser
 */

export class CPLLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  /**
   * Parse CPL-L source code into AST
   * @param {string} source - CPL-L source code
   * @returns {Object} AST representation
   */
  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const laws = [];
    while (!this.isAtEnd()) {
      laws.push(this.parseLaw());
    }

    return {
      type: 'Program',
      laws,
      language: 'CPL-L',
      version: '1.0.0'
    };
  }

  /**
   * Tokenize CPL-L source into tokens
   * @param {string} source
   * @returns {Array<Object>} tokens
   */
  tokenize(source) {
    const tokens = [];
    const keywords = [
      'LAW', 'RULE', 'CLAUSE', 'VERSION', 'ENCODED_ID', 'AUTHOR', 'RATIFIED',
      'SUPERSEDES', 'ENFORCEMENT', 'REQUIRES', 'FORBIDS', 'PERMITS',
      'IF', 'UNLESS', 'AND', 'OR', 'NOT', 'IMPLIES', 'TRUE', 'FALSE',
      'COMPILE_TIME', 'RUNTIME', 'PROOF_REQUIRED', 'CONSENSUS',
      'AMENDMENT', 'MIGRATION', 'IMMUTABLE'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Skip comments
      if (char === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++;
        continue;
      }

      // String literals (including triple-quoted)
      if (char === '"') {
        if (source.slice(i, i + 3) === '"""') {
          // Triple-quoted string
          let value = '';
          i += 3;
          while (i < source.length && source.slice(i, i + 3) !== '"""') {
            value += source[i++];
          }
          i += 3;
          tokens.push({ type: 'TEXT_BLOCK', value });
          continue;
        } else {
          // Regular string
          let value = '';
          i++;
          while (i < source.length && source[i] !== '"') {
            if (source[i] === '\\' && i + 1 < source.length) {
              i++;
              value += source[i++];
            } else {
              value += source[i++];
            }
          }
          i++;
          tokens.push({ type: 'STRING', value });
          continue;
        }
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        while (i < source.length && /[0-9.]/.test(source[i])) {
          value += source[i++];
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(value) });
        continue;
      }

      // Identifiers and keywords
      if (/[A-Za-z_]/.test(char)) {
        let value = '';
        while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) {
          value += source[i++];
        }
        const upper = value.toUpperCase();
        if (keywords.includes(upper)) {
          tokens.push({ type: 'KEYWORD', value: upper });
        } else {
          tokens.push({ type: 'IDENTIFIER', value: upper });
        }
        continue;
      }

      // Operators and punctuation
      const ops = {
        '{': 'LBRACE',
        '}': 'RBRACE',
        '(': 'LPAREN',
        ')': 'RPAREN',
        ':': 'COLON',
        ',': 'COMMA',
        ';': 'SEMICOLON',
        '=': 'EQUALS',
        '>': 'GT',
        '<': 'LT',
        '!': 'NOT',
        '.': 'DOT'
      };

      if (ops[char]) {
        // Handle multi-character operators
        if (char === '=' && source[i + 1] === '=') {
          tokens.push({ type: 'DOUBLE_EQUALS', value: '==' });
          i += 2;
        } else if (char === '!' && source[i + 1] === '=') {
          tokens.push({ type: 'NOT_EQUALS', value: '!=' });
          i += 2;
        } else if (char === '>' && source[i + 1] === '=') {
          tokens.push({ type: 'GTE', value: '>=' });
          i += 2;
        } else if (char === '<' && source[i + 1] === '=') {
          tokens.push({ type: 'LTE', value: '<=' });
          i += 2;
        } else {
          tokens.push({ type: ops[char], value: char });
          i++;
        }
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${i}`);
    }

    return tokens;
  }

  /**
   * Parse a LAW declaration
   */
  parseLaw() {
    this.expect('KEYWORD', 'LAW');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const metadata = {};
    const rules = [];
    const clauses = [];

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        this.expect('STRING');
        metadata.version = this.previous().value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        this.expect('STRING');
        metadata.encodedId = this.previous().value;
      } else if (this.check('KEYWORD', 'AUTHOR')) {
        this.advance();
        this.expect('STRING');
        metadata.author = this.previous().value;
      } else if (this.check('KEYWORD', 'RATIFIED')) {
        this.advance();
        this.expect('STRING');
        metadata.ratified = this.previous().value;
      } else if (this.check('KEYWORD', 'SUPERSEDES')) {
        this.advance();
        this.expect('STRING');
        metadata.supersedes = this.previous().value;
      } else if (this.check('KEYWORD', 'RULE')) {
        rules.push(this.parseRule());
      } else if (this.check('KEYWORD', 'CLAUSE')) {
        clauses.push(this.parseClause());
      } else {
        throw new Error(`Unexpected token in LAW body: ${this.peek().type}`);
      }
    }

    this.expect('RBRACE');

    return {
      type: 'Law',
      name,
      metadata,
      rules,
      clauses
    };
  }

  /**
   * Parse a RULE declaration
   */
  parseRule() {
    this.expect('KEYWORD', 'RULE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const properties = {};
    const constraints = [];
    let enforcement = null;

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'ENFORCEMENT')) {
        this.advance();
        this.expect('COLON');
        enforcement = this.expect('KEYWORD').value;
      } else if (this.check('KEYWORD', 'REQUIRES')) {
        this.advance();
        constraints.push({
          type: 'REQUIRES',
          expression: this.parseExpression()
        });
      } else if (this.check('KEYWORD', 'FORBIDS')) {
        this.advance();
        constraints.push({
          type: 'FORBIDS',
          expression: this.parseExpression()
        });
      } else if (this.check('KEYWORD', 'PERMITS')) {
        this.advance();
        const action = this.parseExpression();
        let condition = null;
        if (this.check('KEYWORD', 'IF') || this.check('KEYWORD', 'UNLESS')) {
          const condType = this.advance().value;
          condition = this.parseExpression();
          constraints.push({
            type: 'PERMITS',
            action,
            condition,
            conditionType: condType
          });
        } else {
          constraints.push({
            type: 'PERMITS',
            action
          });
        }
      } else if (this.check('IDENTIFIER') || this.check('KEYWORD', 'IMMUTABLE')) {
        // Property: KEY: VALUE (IMMUTABLE is a keyword but also used as property name)
        const key = this.advance().value;
        this.expect('COLON');
        const value = this.parseValue();
        properties[key] = value;
      } else {
        throw new Error(`Unexpected token in RULE body: ${this.peek().type}`);
      }
    }

    this.expect('RBRACE');

    return {
      type: 'Rule',
      name,
      enforcement,
      properties,
      constraints
    };
  }

  /**
   * Parse a CLAUSE declaration
   */
  parseClause() {
    this.expect('KEYWORD', 'CLAUSE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const text = this.expect('TEXT_BLOCK').value;
    const amendments = [];

    while (!this.check('RBRACE') && this.check('KEYWORD', 'AMENDMENT')) {
      this.advance();
      const amendmentName = this.expect('IDENTIFIER').value;
      this.expect('LBRACE');
      const amendmentText = this.expect('TEXT_BLOCK').value;
      this.expect('RBRACE');
      amendments.push({ name: amendmentName, text: amendmentText });
    }

    this.expect('RBRACE');

    return {
      type: 'Clause',
      name,
      text,
      amendments
    };
  }

  /**
   * Parse an expression
   */
  parseExpression() {
    return this.parseLogicalOr();
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();

    while (this.check('KEYWORD', 'OR')) {
      this.advance();
      const right = this.parseLogicalAnd();
      left = { type: 'BinaryOp', op: 'OR', left, right };
    }

    return left;
  }

  parseLogicalAnd() {
    let left = this.parseComparison();

    while (this.check('KEYWORD', 'AND')) {
      this.advance();
      const right = this.parseComparison();
      left = { type: 'BinaryOp', op: 'AND', left, right };
    }

    return left;
  }

  parseComparison() {
    let left = this.parsePrimary();

    const compOps = ['DOUBLE_EQUALS', 'NOT_EQUALS', 'GT', 'LT', 'GTE', 'LTE'];
    while (compOps.includes(this.peek().type)) {
      const op = this.advance().value;
      const right = this.parsePrimary();
      left = { type: 'BinaryOp', op, left, right };
    }

    return left;
  }

  parsePrimary() {
    if (this.check('KEYWORD', 'NOT')) {
      this.advance();
      return { type: 'UnaryOp', op: 'NOT', operand: this.parsePrimary() };
    }

    if (this.check('LPAREN')) {
      this.advance();
      const expr = this.parseExpression();
      this.expect('RPAREN');
      return expr;
    }

    if (this.check('IDENTIFIER')) {
      let node = { type: 'Identifier', name: this.advance().value };
      // Handle member access (e.g., user.action, organism.registered)
      while (this.check('DOT')) {
        this.advance();
        const member = this.expect('IDENTIFIER').value;
        node = { type: 'MemberAccess', object: node, member };
      }
      return node;
    }

    if (this.check('STRING')) {
      return { type: 'String', value: this.advance().value };
    }

    if (this.check('NUMBER')) {
      return { type: 'Number', value: this.advance().value };
    }

    if (this.check('KEYWORD', 'TRUE') || this.check('KEYWORD', 'FALSE')) {
      return { type: 'Boolean', value: this.advance().value === 'TRUE' };
    }

    throw new Error(`Unexpected token in expression: ${this.peek().type}`);
  }

  /**
   * Parse a value (used for properties)
   */
  parseValue() {
    if (this.check('STRING')) {
      return { type: 'String', value: this.advance().value };
    }
    if (this.check('NUMBER')) {
      return { type: 'Number', value: this.advance().value };
    }
    if (this.check('KEYWORD', 'TRUE')) {
      this.advance();
      return { type: 'Boolean', value: true };
    }
    if (this.check('KEYWORD', 'FALSE')) {
      this.advance();
      return { type: 'Boolean', value: false };
    }
    if (this.check('IDENTIFIER')) {
      return { type: 'Identifier', name: this.advance().value };
    }

    throw new Error(`Expected value, got ${this.peek().type}`);
  }

  /* === Helper methods === */

  peek() {
    return this.tokens[this.position] || { type: 'EOF', value: null };
  }

  previous() {
    return this.tokens[this.position - 1];
  }

  advance() {
    if (!this.isAtEnd()) this.position++;
    return this.previous();
  }

  check(type, value = null) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== null && token.value !== value) return false;
    return true;
  }

  expect(type, value = null) {
    if (!this.check(type, value)) {
      const expected = value ? `${type}('${value}')` : type;
      throw new Error(`Expected ${expected}, got ${this.peek().type}`);
    }
    return this.advance();
  }

  isAtEnd() {
    return this.position >= this.tokens.length;
  }
}

export default CPLLParser;
