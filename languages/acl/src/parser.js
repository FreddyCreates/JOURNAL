/**
 * ACL PARSER
 * Atlas Configuration Language Parser
 * @module @medina/acl-parser
 */

export class ACLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const ontologies = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'ONTOLOGY')) {
        ontologies.push(this.parseOntology());
      } else {
        this.advance();
      }
    }

    return {
      type: 'Program',
      ontologies,
      language: 'ACL',
      version: '1.0.0'
    };
  }

  tokenize(source) {
    const tokens = [];
    const keywords = [
      'ONTOLOGY', 'VERSION', 'ENCODED_ID', 'ARCHETYPE', 'RELATIONSHIP',
      'GOVERNANCE', 'TRAIT', 'CAPABILITY', 'CONSTRAINT',
      'FROM', 'TO', 'TYPE', 'GOVERNS', 'CONTAINS', 'INFLUENCES', 'DERIVES_FROM',
      'REQUIRES', 'CONSENSUS_THRESHOLD', 'DISPUTE_RESOLUTION',
      'MAJORITY_VOTE', 'ALL_AGENTS_REGISTERED', 'TRUE', 'FALSE'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (char === '"') {
        let value = '';
        i++;
        while (i < source.length && source[i] !== '"') {
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
          tokens.push({ type: 'IDENTIFIER', value: upper });
        }
        continue;
      }

      const ops = { '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON' };
      if (ops[char]) {
        tokens.push({ type: ops[char], value: char });
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }

  parseOntology() {
    this.expect('KEYWORD', 'ONTOLOGY');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const metadata = {};
    const archetypes = [];
    const relationships = [];
    const governance = [];

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        metadata.version = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ARCHETYPE')) {
        archetypes.push(this.parseArchetype());
      } else if (this.check('KEYWORD', 'RELATIONSHIP')) {
        relationships.push(this.parseRelationship());
      } else if (this.check('KEYWORD', 'GOVERNANCE')) {
        governance.push(this.parseGovernance());
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return {
      type: 'Ontology',
      name,
      metadata,
      archetypes,
      relationships,
      governance
    };
  }

  parseArchetype() {
    this.expect('KEYWORD', 'ARCHETYPE');
    // Archetype name might be tokenized as keyword (e.g., INTEGRITY_CHECKER)
    const token = this.peek();
    if (token.type !== 'IDENTIFIER' && token.type !== 'KEYWORD') {
      throw new Error(`Expected archetype name, got ${token.type}`);
    }
    const name = this.advance().value;
    this.expect('LBRACE');

    const traits = {};
    const capabilities = {};
    const constraints = {};

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'TRAIT')) {
        this.advance();
        // Trait name can be keyword or identifier
        const traitToken = this.peek();
        if (traitToken.type !== 'IDENTIFIER' && traitToken.type !== 'KEYWORD') {
          throw new Error(`Expected trait name, got ${traitToken.type}`);
        }
        const traitName = this.advance().value;
        this.expect('COLON');
        const value = this.expect('STRING').value;
        traits[traitName] = value;
      } else if (this.check('KEYWORD', 'CAPABILITY')) {
        this.advance();
        // Capability name can be keyword or identifier
        const capToken = this.peek();
        if (capToken.type !== 'IDENTIFIER' && capToken.type !== 'KEYWORD') {
          throw new Error(`Expected capability name, got ${capToken.type}`);
        }
        const capName = this.advance().value;
        this.expect('COLON');
        const value = this.expect('KEYWORD').value === 'TRUE';
        capabilities[capName] = value;
      } else if (this.check('KEYWORD', 'CONSTRAINT')) {
        this.advance();
        const constName = this.expect('IDENTIFIER').value;
        this.expect('COLON');
        const value = this.expect('NUMBER').value;
        constraints[constName] = value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Archetype', name, traits, capabilities, constraints };
  }

  parseRelationship() {
    this.expect('KEYWORD', 'RELATIONSHIP');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    let from = null, to = null, relType = null;

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'FROM')) {
        this.advance();
        from = this.expect('IDENTIFIER').value;
      } else if (this.check('KEYWORD', 'TO')) {
        this.advance();
        to = this.expect('IDENTIFIER').value;
      } else if (this.check('KEYWORD', 'TYPE')) {
        this.advance();
        relType = this.expect('KEYWORD').value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Relationship', name, from, to, relationType: relType };
  }

  parseGovernance() {
    this.expect('KEYWORD', 'GOVERNANCE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const rules = {};

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD') || this.check('IDENTIFIER')) {
        const key = this.advance().value;
        this.expect('COLON');
        const value = this.parseValue();
        rules[key] = value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Governance', name, rules };
  }

  parseValue() {
    if (this.check('STRING')) {
      return this.advance().value;
    }
    if (this.check('NUMBER')) {
      return this.advance().value;
    }
    if (this.check('KEYWORD')) {
      return this.advance().value;
    }
    if (this.check('IDENTIFIER')) {
      return this.advance().value;
    }
    return null;
  }

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
      throw new Error(`Expected ${type}, got ${this.peek().type}`);
    }
    return this.advance();
  }

  isAtEnd() {
    return this.position >= this.tokens.length;
  }
}

export default ACLParser;
