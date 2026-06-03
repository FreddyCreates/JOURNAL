/**
 * REL Parser - Relational Ecology Language
 * Handles relationship networks and social ecosystems
 */

export class RELParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const ecologies = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'ECOLOGY')) {
        ecologies.push(this.parseEcology());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', ecologies, language: 'REL', version: '1.0.0' };
  }

  parseEcology() {
    this.expect('KEYWORD', 'ECOLOGY');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const ecology = {
      type: 'Ecology',
      name,
      metadata: {},
      entities: [],
      relationships: [],
      dynamics: [],
      health: {}
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          ecology.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'ENTITIES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            ecology.entities.push(this.parseEntity());
          }
          this.expect('RBRACE');
        } else if (token.value === 'RELATIONSHIPS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            ecology.relationships.push(this.parseRelationship());
          }
          this.expect('RBRACE');
        } else if (token.value === 'DYNAMICS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            ecology.dynamics.push(this.parseDynamic());
          }
          this.expect('RBRACE');
        } else if (token.value === 'HEALTH') {
          this.advance();
          ecology.health = this.parseHealth();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return ecology;
  }

  parseEntity() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const entity = { name, type: null, attributes: {}, capacity: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          entity.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'CAPACITY') {
          this.advance();
          this.expect('COLON');
          entity.capacity = this.expect('NUMBER').value;
        } else if (token.value === 'ATTRIBUTES') {
          this.advance();
          this.expect('COLON');
          entity.attributes = this.parseAttributes();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return entity;
  }

  parseRelationship() {
    const from = this.expect('IDENTIFIER').value;
    this.expect('ARROW');
    const to = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const relationship = { from, to, type: null, strength: 1.0, bidirectional: false };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          relationship.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'STRENGTH') {
          this.advance();
          this.expect('COLON');
          relationship.strength = this.expect('NUMBER').value;
        } else if (token.value === 'BIDIRECTIONAL') {
          this.advance();
          this.expect('COLON');
          relationship.bidirectional = this.expect('IDENTIFIER').value === 'TRUE';
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return relationship;
  }

  parseDynamic() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const dynamic = { name, pattern: null, frequency: null, impact: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'PATTERN') {
          this.advance();
          this.expect('COLON');
          dynamic.pattern = this.expect('STRING').value;
        } else if (token.value === 'FREQUENCY') {
          this.advance();
          this.expect('COLON');
          dynamic.frequency = this.expect('IDENTIFIER').value;
        } else if (token.value === 'IMPACT') {
          this.advance();
          this.expect('COLON');
          dynamic.impact = this.expect('NUMBER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return dynamic;
  }

  parseHealth() {
    this.expect('LBRACE');
    const health = { diversity: null, resilience: null, connectivity: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'DIVERSITY') {
          this.advance();
          this.expect('COLON');
          health.diversity = this.expect('NUMBER').value;
        } else if (token.value === 'RESILIENCE') {
          this.advance();
          this.expect('COLON');
          health.resilience = this.expect('NUMBER').value;
        } else if (token.value === 'CONNECTIVITY') {
          this.advance();
          this.expect('COLON');
          health.connectivity = this.expect('NUMBER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return health;
  }

  parseAttributes() {
    const attrs = {};
    while (!this.check('RBRACE') && !this.check('KEYWORD')) {
      const key = this.expect('IDENTIFIER').value;
      this.expect('COLON');
      const val = this.peek();
      if (val.type === 'STRING') {
        attrs[key] = this.advance().value;
      } else if (val.type === 'NUMBER') {
        attrs[key] = this.advance().value;
      } else {
        attrs[key] = this.expect('IDENTIFIER').value;
      }
      if (this.check('COMMA')) this.advance();
    }
    return attrs;
  }

  tokenize(source) {
    const tokens = [];
    const keywords = [
      'ECOLOGY', 'VERSION', 'ENTITIES', 'RELATIONSHIPS', 'DYNAMICS', 'HEALTH',
      'TYPE', 'CAPACITY', 'ATTRIBUTES', 'STRENGTH', 'BIDIRECTIONAL',
      'PATTERN', 'FREQUENCY', 'IMPACT', 'DIVERSITY', 'RESILIENCE', 'CONNECTIVITY'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];
      if (/\s/.test(char)) { i++; continue; }
      if (char === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++;
        continue;
      }
      if (char === '-' && source[i + 1] === '>') {
        tokens.push({ type: 'ARROW', value: '->' });
        i += 2;
        continue;
      }
      if (char === '"') {
        let value = '';
        i++;
        while (i < source.length && source[i] !== '"') {
          if (source[i] === '\\') i++;
          value += source[i++];
        }
        i++;
        tokens.push({ type: 'STRING', value });
        continue;
      }
      if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(source[i + 1]))) {
        let value = '';
        if (char === '-') { value += char; i++; }
        while (i < source.length && /[0-9.]/.test(source[i])) value += source[i++];
        tokens.push({ type: 'NUMBER', value: parseFloat(value) });
        continue;
      }
      if (/[A-Za-z_]/.test(char)) {
        let value = '';
        while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) value += source[i++];
        const upper = value.toUpperCase();
        tokens.push(keywords.includes(upper) ? { type: 'KEYWORD', value: upper } : { type: 'IDENTIFIER', value });
        continue;
      }
      const ops = { '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', ',': 'COMMA' };
      if (ops[char]) { tokens.push({ type: ops[char], value: char }); i++; continue; }
      i++;
    }
    return tokens;
  }

  peek() { return this.tokens[this.position] || { type: 'EOF', value: null }; }
  previous() { return this.tokens[this.position - 1]; }
  advance() { if (!this.isAtEnd()) this.position++; return this.previous(); }
  check(type, value = null) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    return token.type === type && (value === null || token.value === value);
  }
  expect(type, value = null) {
    if (!this.check(type, value)) {
      const expected = value ? `${type}('${value}')` : type;
      throw new Error(`Expected ${expected}, got ${this.peek().type}`);
    }
    return this.advance();
  }
  isAtEnd() { return this.position >= this.tokens.length; }
}

export default RELParser;
