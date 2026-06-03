/**
 * OCL PARSER
 * Organism Contract Language Parser
 * @module @medina/ocl-parser
 */

export class OCLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const organisms = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'ORGANISM')) {
        organisms.push(this.parseOrganism());
      } else {
        this.advance();
      }
    }

    return {
      type: 'Program',
      organisms,
      language: 'OCL',
      version: '1.0.0'
    };
  }

  tokenize(source) {
    const tokens = [];
    const keywords = [
      'ORGANISM', 'ENCODED_ID', 'ARCHETYPE', 'CIVILIZATION', 'RATIFIED',
      'CAPABILITIES', 'CONSTRAINTS', 'REWARD_STRUCTURE',
      'CAN_READ_PROPOSALS', 'CAN_VOTE', 'CAN_GENERATE_FINDINGS',
      'CAN_DISPUTE_CLAIMS', 'CAN_ACCESS_NNS', 'CAN_ACCESS_SNS',
      'MAX_PROPOSALS_PER_CYCLE', 'REQUIRED_CONFIDENCE', 'EVIDENCE_SOURCES',
      'TRUE', 'FALSE'
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

      const ops = { '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', ',': 'COMMA',
                    '[': 'LBRACKET', ']': 'RBRACKET', '>': 'GT', '<': 'LT', '=': 'EQUALS' };

      if (source.slice(i, i + 2) === '>=') {
        tokens.push({ type: 'GTE', value: '>=' });
        i += 2;
        continue;
      }

      if (ops[char]) {
        tokens.push({ type: ops[char], value: char });
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }

  parseOrganism() {
    this.expect('KEYWORD', 'ORGANISM');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const metadata = {};
    const capabilities = {};
    const constraints = {};
    const rewards = {};

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ARCHETYPE')) {
        this.advance();
        metadata.archetype = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'CIVILIZATION')) {
        this.advance();
        metadata.civilization = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'RATIFIED')) {
        this.advance();
        metadata.ratified = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'CAPABILITIES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          // Capability names may be keywords (CAN_VOTE, etc.)
          const token = this.peek();
          if (token.type !== 'IDENTIFIER' && token.type !== 'KEYWORD') {
            throw new Error(`Expected capability name, got ${token.type}`);
          }
          const cap = this.advance().value;
          this.expect('COLON');
          const value = this.expect('KEYWORD').value === 'TRUE';
          capabilities[cap] = value;
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'CONSTRAINTS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          // Constraint names may be keywords (MAX_PROPOSALS_PER_CYCLE, etc.)
          const constraintToken = this.peek();
          if (constraintToken.type !== 'IDENTIFIER' && constraintToken.type !== 'KEYWORD') {
            throw new Error(`Expected constraint name, got ${constraintToken.type}`);
          }
          const constraint = this.advance().value;
          this.expect('COLON');
          const value = this.parseConstraintValue();
          constraints[constraint] = value;
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'REWARD_STRUCTURE')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          // Reward names may be keywords
          const rewardToken = this.peek();
          if (rewardToken.type !== 'IDENTIFIER' && rewardToken.type !== 'KEYWORD') {
            throw new Error(`Expected reward name, got ${rewardToken.type}`);
          }
          const reward = this.advance().value;
          this.expect('COLON');
          const amount = this.expect('NUMBER').value;
          // Token type can be keyword or identifier
          const tokenTypeToken = this.peek();
          if (tokenTypeToken.type !== 'IDENTIFIER' && tokenTypeToken.type !== 'KEYWORD') {
            throw new Error(`Expected token type, got ${tokenTypeToken.type}`);
          }
          const token = this.advance().value;
          rewards[reward] = { amount, token };
        }
        this.expect('RBRACE');
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return {
      type: 'Organism',
      name,
      metadata,
      capabilities,
      constraints,
      rewards
    };
  }

  parseConstraintValue() {
    if (this.check('GTE')) {
      this.advance();
      return { operator: '>=', value: this.expect('NUMBER').value };
    }
    if (this.check('NUMBER')) {
      return { value: this.advance().value };
    }
    if (this.check('STRING')) {
      return { value: this.advance().value };
    }
    if (this.check('LBRACKET')) {
      this.advance();
      const items = [];
      while (!this.check('RBRACKET')) {
        items.push(this.expect('STRING').value);
        if (this.check('COMMA')) this.advance();
      }
      this.expect('RBRACKET');
      return { value: items };
    }
    return { value: null };
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

export default OCLParser;
