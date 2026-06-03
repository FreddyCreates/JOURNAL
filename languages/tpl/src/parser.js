/**
 * TPL PARSER
 * Terminal Protocol Language Parser
 * @module @medina/tpl-parser
 */

export class TPLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  /**
   * Parse TPL source code into AST
   * @param {string} source - TPL source code
   * @returns {Object} AST representation
   */
  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const protocols = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'PROTOCOL')) {
        protocols.push(this.parseProtocol());
      } else {
        this.advance();
      }
    }

    return {
      type: 'Program',
      protocols,
      language: 'TPL',
      version: '1.0.0'
    };
  }

  /**
   * Tokenize TPL source
   */
  tokenize(source) {
    const tokens = [];
    const keywords = [
      'PROTOCOL', 'CHANNEL', 'MESSAGE', 'HANDLER', 'VERSION', 'ENCODED_ID',
      'TRANSPORT', 'SECURITY', 'QOS', 'ON', 'RECEIVE', 'SEND', 'ERROR', 'TIMEOUT',
      'WEBSOCKET', 'HTTP', 'ICP_CALL', 'IPFS', 'PHANTOM',
      'PUBLIC', 'ENCRYPTED', 'SIGNED', 'ZERO_KNOWLEDGE',
      'BEST_EFFORT', 'AT_LEAST_ONCE', 'EXACTLY_ONCE',
      'REQUIRED', 'OPTIONAL', 'STRING', 'NUMBER', 'BOOLEAN', 'BYTES', 'JSON',
      'EMIT', 'CALL', 'LOG', 'VALIDATE', 'AGAINST', 'IF', 'THEN', 'END',
      'ARRAY', 'CANISTER_ID', 'AUTH_REQUIRED', 'ENCRYPTION_ALGORITHM', 'TIMEOUT'
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

      // String literals
      if (char === '"') {
        let value = '';
        i++;
        while (i < source.length && source[i] !== '"') {
          if (source[i] === '\\') {
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

      // Numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        while (i < source.length && /[0-9]/.test(source[i])) {
          value += source[i++];
        }
        // Handle units (ms, MB, etc)
        if (i < source.length && /[a-zA-Z]/.test(source[i])) {
          let unit = '';
          while (i < source.length && /[a-zA-Z]/.test(source[i])) {
            unit += source[i++];
          }
          tokens.push({ type: 'NUMBER_WITH_UNIT', value: parseFloat(value), unit });
        } else {
          tokens.push({ type: 'NUMBER', value: parseFloat(value) });
        }
        continue;
      }

      // Identifiers and keywords
      if (/[A-Za-z_]/.test(char)) {
        let value = '';
        while (i < source.length && /[A-Za-z0-9_-]/.test(source[i])) {
          value += source[i++];
        }
        const upper = value.toUpperCase();
        if (keywords.includes(upper)) {
          tokens.push({ type: 'KEYWORD', value: upper });
        } else {
          tokens.push({ type: 'IDENTIFIER', value });
        }
        continue;
      }

      // Operators and punctuation
      const ops = {
        '{': 'LBRACE', '}': 'RBRACE', '(': 'LPAREN', ')': 'RPAREN',
        ':': 'COLON', ',': 'COMMA', ';': 'SEMICOLON',
        '<': 'LT', '>': 'GT'
      };

      if (ops[char]) {
        tokens.push({ type: ops[char], value: char });
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }

  /**
   * Parse PROTOCOL declaration
   */
  parseProtocol() {
    this.expect('KEYWORD', 'PROTOCOL');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const metadata = {};
    const channels = [];
    const messages = [];
    const handlers = [];

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        metadata.version = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'CHANNEL')) {
        channels.push(this.parseChannel());
      } else if (this.check('KEYWORD', 'MESSAGE')) {
        messages.push(this.parseMessage());
      } else if (this.check('KEYWORD', 'HANDLER')) {
        handlers.push(this.parseHandler());
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return {
      type: 'Protocol',
      name,
      metadata,
      channels,
      messages,
      handlers
    };
  }

  /**
   * Parse CHANNEL declaration
   */
  parseChannel() {
    this.expect('KEYWORD', 'CHANNEL');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const properties = {};

    while (!this.check('RBRACE')) {
      // Property keys can be keywords (TRANSPORT, SECURITY, QOS) or identifiers
      if (this.check('IDENTIFIER') || this.check('KEYWORD')) {
        const key = this.advance().value;
        this.expect('COLON');
        const value = this.parseValue();
        properties[key] = value;
      } else if (this.check('KEYWORD')) {
        // Handle keywords as property names (e.g., TRANSPORT, SECURITY)
        const key = this.advance().value;
        this.expect('COLON');
        const value = this.parseValue();
        properties[key] = value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Channel', name, properties };
  }

  /**
   * Parse MESSAGE declaration
   */
  parseMessage() {
    this.expect('KEYWORD', 'MESSAGE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const fields = [];

    while (!this.check('RBRACE')) {
      if (this.check('IDENTIFIER')) {
        const fieldName = this.advance().value;
        this.expect('COLON');
        const fieldType = this.parseType();
        let required = false;
        if (this.check('KEYWORD', 'REQUIRED')) {
          required = true;
          this.advance();
        } else if (this.check('KEYWORD', 'OPTIONAL')) {
          this.advance();
        }
        fields.push({ name: fieldName, fieldType, required });
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Message', name, fields };
  }

  /**
   * Parse type
   */
  parseType() {
    if (this.check('KEYWORD', 'ARRAY')) {
      this.advance();
      this.expect('LT');
      const elementType = this.parseType();
      this.expect('GT');
      return { type: 'Array', elementType };
    }

    if (this.check('KEYWORD')) {
      return { type: 'Primitive', name: this.advance().value };
    }

    if (this.check('IDENTIFIER')) {
      return { type: 'Custom', name: this.advance().value };
    }

    return { type: 'Unknown' };
  }

  /**
   * Parse HANDLER declaration
   */
  parseHandler() {
    this.expect('KEYWORD', 'HANDLER');
    const name = this.expect('IDENTIFIER').value;
    this.expect('KEYWORD', 'ON');
    const event = this.expect('KEYWORD').value;
    this.expect('LBRACE');

    const actions = [];

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'EMIT') || this.check('KEYWORD', 'CALL') ||
          this.check('KEYWORD', 'LOG') || this.check('KEYWORD', 'VALIDATE')) {
        actions.push(this.parseAction());
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Handler', name, event, actions };
  }

  /**
   * Parse action
   */
  parseAction() {
    const actionType = this.advance().value;
    const args = [];

    while (!this.check('KEYWORD') && !this.check('RBRACE') && !this.isAtEnd()) {
      if (this.check('IDENTIFIER') || this.check('STRING')) {
        args.push(this.advance().value);
      } else {
        break;
      }
    }

    return { type: 'Action', actionType, args };
  }

  /**
   * Parse value
   */
  parseValue() {
    if (this.check('STRING')) {
      return { type: 'String', value: this.advance().value };
    }
    if (this.check('NUMBER')) {
      return { type: 'Number', value: this.advance().value };
    }
    if (this.check('NUMBER_WITH_UNIT')) {
      const token = this.advance();
      return { type: 'NumberWithUnit', value: token.value, unit: token.unit };
    }
    if (this.check('KEYWORD')) {
      return { type: 'Keyword', value: this.advance().value };
    }
    if (this.check('IDENTIFIER')) {
      return { type: 'Identifier', value: this.advance().value };
    }
    return { type: 'Unknown' };
  }

  /* === Helper methods === */

  peek() {
    return this.tokens[this.position] || { type: 'EOF', value: null };
  }

  advance() {
    if (!this.isAtEnd()) this.position++;
    return this.tokens[this.position - 1];
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

export default TPLParser;
