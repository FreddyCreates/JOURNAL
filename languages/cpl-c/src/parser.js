/**
 * CPL-C Parser - Cognitive Contract Language
 * @module cpl-c-parser
 */

export class CPLCParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const contracts = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'CONTRACT')) {
        contracts.push(this.parseContract());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', contracts, language: 'CPL-C', version: '1.0.0' };
  }

  parseContract() {
    this.expect('KEYWORD', 'CONTRACT');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const contract = {
      type: 'Contract',
      name,
      metadata: {},
      parties: [],
      terms: [],
      conditions: [],
      actions: [],
      events: []
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        contract.metadata.version = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        contract.metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'JURISDICTION')) {
        this.advance();
        contract.metadata.jurisdiction = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'TIMESTAMP')) {
        this.advance();
        contract.metadata.timestamp = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'PARTIES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          contract.parties.push(this.parseParty());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'TERMS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          contract.terms.push(this.parseTerm());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'CONDITIONS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          contract.conditions.push(this.parseCondition());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'ACTIONS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          contract.actions.push(this.parseAction());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'EVENTS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          contract.events.push(this.parseEvent());
        }
        this.expect('RBRACE');
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return contract;
  }

  parseParty() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const party = { name, principal: null, role: null, capabilities: [] };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'PRINCIPAL')) {
        this.advance();
        this.expect('COLON');
        party.principal = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ROLE')) {
        this.advance();
        this.expect('COLON');
        party.role = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'CAPABILITIES')) {
        this.advance();
        this.expect('COLON');
        party.capabilities = this.parseList();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return party;
  }

  parseTerm() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const term = { name, obligation: null, deadline: null, penalty: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'OBLIGATION')) {
        this.advance();
        this.expect('COLON');
        term.obligation = this.parseExpression();
      } else if (this.check('KEYWORD', 'DEADLINE')) {
        this.advance();
        this.expect('COLON');
        term.deadline = this.peek().value;
        this.advance();
      } else if (this.check('KEYWORD', 'PENALTY')) {
        this.advance();
        this.expect('COLON');
        term.penalty = this.parseExpression();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return term;
  }

  parseCondition() {
    const condType = this.advance().value; // PRE, POST, INVARIANT
    this.expect('COLON');
    const expression = this.parseExpression();
    return { type: condType, expression };
  }

  parseAction() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const action = { name, requires: null, ensures: null, modifies: [], body: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'REQUIRES')) {
        this.advance();
        this.expect('COLON');
        action.requires = this.parseExpression();
      } else if (this.check('KEYWORD', 'ENSURES')) {
        this.advance();
        this.expect('COLON');
        action.ensures = this.parseExpression();
      } else if (this.check('KEYWORD', 'MODIFIES')) {
        this.advance();
        this.expect('COLON');
        action.modifies = this.parseList();
      } else if (this.check('KEYWORD', 'BODY')) {
        this.advance();
        this.expect('COLON');
        action.body = this.parseBlock();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return action;
  }

  parseEvent() {
    this.expect('KEYWORD', 'ON');
    const token = this.advance(); // Allow KEYWORD or IDENTIFIER
    const eventType = token.value;
    this.expect('COLON');
    const block = this.parseBlock();
    return { type: 'Event', eventType, handler: block };
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
      tokens.push(this.advance());
    }
    return { type: 'Expression', tokens };
  }

  parseBlock() {
    this.expect('LBRACE');
    const statements = [];
    while (!this.check('RBRACE')) {
      statements.push(this.advance());
    }
    this.expect('RBRACE');
    return { type: 'Block', statements };
  }

  parseList() {
    const items = [];
    while (!this.check('RBRACE') && !this.isAtEnd()) {
      items.push(this.expect('IDENTIFIER').value);
      if (this.check('COMMA')) this.advance();
      else break;
    }
    return items;
  }

  tokenize(source) {
    const tokens = [];
    const keywords = [
      'CONTRACT', 'VERSION', 'ENCODED_ID', 'JURISDICTION', 'TIMESTAMP',
      'PARTIES', 'PRINCIPAL', 'ROLE', 'CAPABILITIES',
      'TERMS', 'OBLIGATION', 'DEADLINE', 'PENALTY', 'PERPETUAL',
      'CONDITIONS', 'PRE', 'POST', 'INVARIANT',
      'ACTIONS', 'REQUIRES', 'ENSURES', 'MODIFIES', 'BODY',
      'EVENTS', 'ON', 'BREACH', 'FULFILL', 'EXPIRE', 'MODIFY'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Comments
      if (char === '/' && source[i + 1] === '/') {
        while (i < source.length && source[i] !== '\n') i++;
        continue;
      }

      // String literals
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
          tokens.push({ type: 'IDENTIFIER', value });
        }
        continue;
      }

      // Operators
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

export default CPLCParser;
