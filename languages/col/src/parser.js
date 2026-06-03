/**
 * COL Parser - Collaborative Organism Language
 * Handles multi-organism collaboration protocols
 */

export class COLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const collaborations = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'COLLABORATION')) {
        collaborations.push(this.parseCollaboration());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', collaborations, language: 'COL', version: '1.0.0' };
  }

  parseCollaboration() {
    this.expect('KEYWORD', 'COLLABORATION');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const collaboration = {
      type: 'Collaboration',
      name,
      metadata: {},
      participants: [],
      objectives: [],
      protocols: [],
      outcomes: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          collaboration.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'DURATION') {
          this.advance();
          this.expect('COLON');
          collaboration.metadata.duration = this.expect('NUMBER').value;
        } else if (token.value === 'PARTICIPANTS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            collaboration.participants.push(this.parseParticipant());
          }
          this.expect('RBRACE');
        } else if (token.value === 'OBJECTIVES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            collaboration.objectives.push(this.parseObjective());
          }
          this.expect('RBRACE');
        } else if (token.value === 'PROTOCOLS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            collaboration.protocols.push(this.parseProtocol());
          }
          this.expect('RBRACE');
        } else if (token.value === 'OUTCOMES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            collaboration.outcomes.push(this.parseOutcome());
          }
          this.expect('RBRACE');
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return collaboration;
  }

  parseParticipant() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const participant = { name, role: null, contribution: [], commitment: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'ROLE') {
          this.advance();
          this.expect('COLON');
          participant.role = this.expect('STRING').value;
        } else if (token.value === 'CONTRIBUTION') {
          this.advance();
          this.expect('COLON');
          participant.contribution = this.parseList();
        } else if (token.value === 'COMMITMENT') {
          this.advance();
          this.expect('COLON');
          participant.commitment = this.expect('NUMBER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return participant;
  }

  parseObjective() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const objective = { name, description: null, priority: null, success_criteria: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'DESCRIPTION') {
          this.advance();
          this.expect('COLON');
          objective.description = this.expect('STRING').value;
        } else if (token.value === 'PRIORITY') {
          this.advance();
          this.expect('COLON');
          objective.priority = this.expect('IDENTIFIER').value;
        } else if (token.value === 'SUCCESS_CRITERIA') {
          this.advance();
          this.expect('COLON');
          objective.success_criteria = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return objective;
  }

  parseProtocol() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const protocol = { name, type: null, frequency: null, rules: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          protocol.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'FREQUENCY') {
          this.advance();
          this.expect('COLON');
          protocol.frequency = this.expect('IDENTIFIER').value;
        } else if (token.value === 'RULES') {
          this.advance();
          this.expect('COLON');
          protocol.rules = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return protocol;
  }

  parseOutcome() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const outcome = { name, status: null, impact: null, learnings: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'STATUS') {
          this.advance();
          this.expect('COLON');
          outcome.status = this.expect('IDENTIFIER').value;
        } else if (token.value === 'IMPACT') {
          this.advance();
          this.expect('COLON');
          outcome.impact = this.expect('NUMBER').value;
        } else if (token.value === 'LEARNINGS') {
          this.advance();
          this.expect('COLON');
          outcome.learnings = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return outcome;
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
      'COLLABORATION', 'VERSION', 'DURATION', 'PARTICIPANTS', 'OBJECTIVES',
      'PROTOCOLS', 'OUTCOMES', 'ROLE', 'CONTRIBUTION', 'COMMITMENT',
      'DESCRIPTION', 'PRIORITY', 'SUCCESS_CRITERIA', 'TYPE', 'FREQUENCY',
      'RULES', 'STATUS', 'IMPACT', 'LEARNINGS'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];
      if (/\s/.test(char)) { i++; continue; }
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

export default COLParser;
