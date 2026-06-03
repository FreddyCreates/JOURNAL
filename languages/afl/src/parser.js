/**
 * AFL Parser — Agent Flow Language
 * Internal agent orchestration with Latin nomenclature
 *
 * Integrates with ORO Governance Organism agents:
 * - ARCHON (Integrity Check)
 * - VECTOR (Execution Trace)
 * - LUMEN (Context Map)
 * - FORGE (Verification Lab)
 */

export class AFLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const flows = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'FLUXUS')) {
        flows.push(this.parseFluxus());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', flows, language: 'AFL', version: '1.0.0' };
  }

  parseFluxus() {
    this.expect('KEYWORD', 'FLUXUS');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const flow = {
      type: 'Fluxus',
      name,
      metadata: {},
      agents: [],
      stages: [],
      transitions: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          flow.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'NOMEN') {
          this.advance();
          this.expect('COLON');
          flow.metadata.latinName = this.expect('IDENTIFIER').value;
        } else if (token.value === 'AGENTES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            flow.agents.push(this.parseAgens());
          }
          this.expect('RBRACE');
        } else if (token.value === 'STADIA') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            flow.stages.push(this.parseStadium());
          }
          this.expect('RBRACE');
        } else if (token.value === 'TRANSITIONES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            flow.transitions.push(this.parseTransitio());
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
    return flow;
  }

  parseAgens() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const agent = {
      name,
      nomenLatinum: null,
      role: null,
      capabilities: [],
      connections: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'NOMEN_LATINUM') {
          this.advance();
          this.expect('COLON');
          agent.nomenLatinum = this.expect('IDENTIFIER').value;
        } else if (token.value === 'MUNUS') {
          this.advance();
          this.expect('COLON');
          agent.role = this.expect('IDENTIFIER').value;
        } else if (token.value === 'POTENTIAE') {
          this.advance();
          this.expect('COLON');
          agent.capabilities = this.parseList();
        } else if (token.value === 'NEXUS') {
          this.advance();
          this.expect('COLON');
          agent.connections = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return agent;
  }

  parseStadium() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const stage = {
      name,
      nomenLatinum: null,
      actions: [],
      requirements: [],
      outputs: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'NOMEN_LATINUM') {
          this.advance();
          this.expect('COLON');
          stage.nomenLatinum = this.expect('IDENTIFIER').value;
        } else if (token.value === 'ACTIONES') {
          this.advance();
          this.expect('COLON');
          stage.actions = this.parseList();
        } else if (token.value === 'REQUISITA') {
          this.advance();
          this.expect('COLON');
          stage.requirements = this.parseList();
        } else if (token.value === 'EXITUS') {
          this.advance();
          this.expect('COLON');
          stage.outputs = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return stage;
  }

  parseTransitio() {
    const from = this.expect('IDENTIFIER').value;
    this.expect('ARROW');
    const to = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const transition = {
      from,
      to,
      condition: null,
      duration: null
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'CONDITIO') {
          this.advance();
          this.expect('COLON');
          transition.condition = this.expect('STRING').value;
        } else if (token.value === 'TEMPUS') {
          this.advance();
          this.expect('COLON');
          transition.duration = this.expect('NUMBER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return transition;
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
      'FLUXUS', 'VERSION', 'NOMEN', 'AGENTES', 'STADIA', 'TRANSITIONES',
      'NOMEN_LATINUM', 'MUNUS', 'POTENTIAE', 'NEXUS', 'ACTIONES',
      'REQUISITA', 'EXITUS', 'CONDITIO', 'TEMPUS'
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

export default AFLParser;
