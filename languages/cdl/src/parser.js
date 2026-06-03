/**
 * CDL Parser - Cognitive Doctrine Language
 * @module cdl-parser
 */

export class CDLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const doctrines = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'DOCTRINE')) {
        doctrines.push(this.parseDoctrine());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', doctrines, language: 'CDL', version: '1.0.0' };
  }

  parseDoctrine() {
    this.expect('KEYWORD', 'DOCTRINE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const doctrine = {
      type: 'Doctrine',
      name,
      metadata: {},
      axioms: [],
      principles: [],
      values: [],
      virtues: [],
      prohibitions: [],
      priorities: []
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        doctrine.metadata.version = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        doctrine.metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'IMMUTABLE')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        doctrine.metadata.immutable = token.value === 'TRUE';
      } else if (this.check('KEYWORD', 'INHERITABLE')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        doctrine.metadata.inheritable = token.value === 'TRUE';
      } else if (this.check('KEYWORD', 'AXIOMS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          doctrine.axioms.push(this.parseAxiom());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'PRINCIPLES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          doctrine.principles.push(this.parsePrinciple());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'VALUES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          doctrine.values.push(this.parseValue());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'VIRTUES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          doctrine.virtues.push(this.parseVirtue());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'PROHIBITIONS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          doctrine.prohibitions.push(this.parseProhibition());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'PRIORITIES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          doctrine.priorities.push(this.parsePriority());
        }
        this.expect('RBRACE');
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return doctrine;
  }

  parseAxiom() {
    // Axiom name can be keyword (FOUNDATION, etc.) or identifier
    const nameToken = this.peek();
    if (nameToken.type !== 'IDENTIFIER' && nameToken.type !== 'KEYWORD') {
      throw new Error(`Expected axiom name, got ${nameToken.type}`);
    }
    const name = this.advance().value;
    this.expect('COLON');
    this.expect('LBRACE');

    const axiom = { name, statement: null, foundation: false, consequences: [] };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'STATEMENT')) {
        this.advance();
        this.expect('COLON');
        axiom.statement = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'FOUNDATION')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        axiom.foundation = token.value === 'TRUE';
      } else if (this.check('KEYWORD', 'CONSEQUENCES')) {
        this.advance();
        this.expect('COLON');
        axiom.consequences = this.parseList();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return axiom;
  }

  parsePrinciple() {
    // Principle name can be keyword or identifier
    const nameToken = this.peek();
    if (nameToken.type !== 'IDENTIFIER' && nameToken.type !== 'KEYWORD') {
      throw new Error(`Expected principle name, got ${nameToken.type}`);
    }
    const name = this.advance().value;
    this.expect('COLON');
    this.expect('LBRACE');

    const principle = { name, description: null, priority: 0, appliesTo: [], contradicts: [] };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'DESCRIPTION')) {
        this.advance();
        this.expect('COLON');
        principle.description = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'PRIORITY')) {
        this.advance();
        this.expect('COLON');
        principle.priority = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'APPLIES_TO')) {
        this.advance();
        this.expect('COLON');
        principle.appliesTo = this.parseList();
      } else if (this.check('KEYWORD', 'CONTRADICTS')) {
        this.advance();
        this.expect('COLON');
        principle.contradicts = this.parseList();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return principle;
  }

  parseValue() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const value = { name, weight: 0, domain: null, measurement: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'WEIGHT')) {
        this.advance();
        this.expect('COLON');
        value.weight = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'DOMAIN')) {
        this.advance();
        this.expect('COLON');
        value.domain = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'MEASUREMENT')) {
        this.advance();
        this.expect('COLON');
        value.measurement = this.parseExpression();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return value;
  }

  parseVirtue() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const virtue = { name, definition: null, cultivatedBy: [], opposedBy: [], rewards: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'DEFINITION')) {
        this.advance();
        this.expect('COLON');
        virtue.definition = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'CULTIVATED_BY')) {
        this.advance();
        this.expect('COLON');
        virtue.cultivatedBy = this.parseList();
      } else if (this.check('KEYWORD', 'OPPOSED_BY')) {
        this.advance();
        this.expect('COLON');
        virtue.opposedBy = this.parseList();
      } else if (this.check('KEYWORD', 'REWARDS')) {
        this.advance();
        this.expect('COLON');
        virtue.rewards = this.parseExpression();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return virtue;
  }

  parseProhibition() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const prohibition = { name, forbidden: null, severity: null, exception: null, consequence: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'FORBIDDEN')) {
        this.advance();
        this.expect('COLON');
        prohibition.forbidden = this.parseExpression();
      } else if (this.check('KEYWORD', 'SEVERITY')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        prohibition.severity = token.value;
      } else if (this.check('KEYWORD', 'EXCEPTION')) {
        this.advance();
        this.expect('COLON');
        prohibition.exception = this.parseExpression();
      } else if (this.check('KEYWORD', 'CONSEQUENCE')) {
        this.advance();
        this.expect('COLON');
        prohibition.consequence = this.parseExpression();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return prohibition;
  }

  parsePriority() {
    const level = this.expect('NUMBER').value;
    this.expect('COLON');
    const principle = this.expect('IDENTIFIER').value;
    return { level, principle };
  }

  parseExpression() {
    const tokens = [];
    let depth = 0;
    while (!this.isAtEnd()) {
      if (this.peek().type === 'LBRACE') depth++;
      if (this.peek().type === 'RBRACE') {
        if (depth === 0) break;
        depth--;
      }
      if (this.check('KEYWORD') && depth === 0) break;
      tokens.push(this.advance());
    }
    return { type: 'Expression', tokens };
  }

  parseList() {
    const items = [];
    while (!this.check('RBRACE') && !this.check('KEYWORD') && !this.isAtEnd()) {
      items.push(this.expect('IDENTIFIER').value);
      if (this.check('COMMA')) this.advance();
      else break;
    }
    return items;
  }

  tokenize(source) {
    const tokens = [];
    const keywords = [
      'DOCTRINE', 'VERSION', 'ENCODED_ID', 'IMMUTABLE', 'INHERITABLE',
      'AXIOMS', 'STATEMENT', 'FOUNDATION', 'CONSEQUENCES',
      'PRINCIPLES', 'DESCRIPTION', 'PRIORITY', 'APPLIES_TO', 'CONTRADICTS',
      'VALUES', 'WEIGHT', 'DOMAIN', 'MEASUREMENT',
      'VIRTUES', 'DEFINITION', 'CULTIVATED_BY', 'OPPOSED_BY', 'REWARDS',
      'PROHIBITIONS', 'FORBIDDEN', 'SEVERITY', 'EXCEPTION', 'CONSEQUENCE',
      'ABSOLUTE', 'STRONG', 'MODERATE', 'WEAK',
      'PRIORITIES', 'TRUE', 'FALSE'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (char === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++;
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

      if (/[0-9]/.test(char)) {
        let value = '';
        while (i < source.length && /[0-9.]/.test(source[i])) {
          value += source[i++];
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(value) });
        continue;
      }

      if (/[A-Za-z_]/.test(char)) {
        let value = '';
        while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) {
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

      const ops = {
        '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', ',': 'COMMA',
        '(': 'LPAREN', ')': 'RPAREN', '=': 'EQUALS', ';': 'SEMICOLON'
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
      const got = this.peek();
      throw new Error(`Expected ${expected}, got ${got.type}('${got.value}') at position ${this.position}`);
    }
    return this.advance();
  }

  isAtEnd() {
    return this.position >= this.tokens.length;
  }
}

export default CDLParser;
