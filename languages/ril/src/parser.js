/**
 * RIL Parser - Repair & Integration Language
 * Handles conflict resolution and system repair
 */

export class RILParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const repairs = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'REPAIR')) {
        repairs.push(this.parseRepair());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', repairs, language: 'RIL', version: '1.0.0' };
  }

  parseRepair() {
    this.expect('KEYWORD', 'REPAIR');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const repair = {
      type: 'Repair',
      name,
      metadata: {},
      damage: {},
      diagnosis: [],
      strategy: [],
      actions: [],
      verification: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          repair.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'PRIORITY') {
          this.advance();
          this.expect('COLON');
          repair.metadata.priority = this.expect('IDENTIFIER').value;
        } else if (token.value === 'DAMAGE') {
          this.advance();
          repair.damage = this.parseDamage();
        } else if (token.value === 'DIAGNOSIS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            repair.diagnosis.push(this.parseStep());
          }
          this.expect('RBRACE');
        } else if (token.value === 'STRATEGY') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            repair.strategy.push(this.parseStep());
          }
          this.expect('RBRACE');
        } else if (token.value === 'ACTIONS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            repair.actions.push(this.parseAction());
          }
          this.expect('RBRACE');
        } else if (token.value === 'VERIFICATION') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            repair.verification.push(this.parseCheck());
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
    return repair;
  }

  parseDamage() {
    this.expect('LBRACE');
    const damage = { severity: null, affected: [], root_cause: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'SEVERITY') {
          this.advance();
          this.expect('COLON');
          damage.severity = this.expect('IDENTIFIER').value;
        } else if (token.value === 'AFFECTED') {
          this.advance();
          this.expect('COLON');
          damage.affected = this.parseList();
        } else if (token.value === 'ROOT_CAUSE') {
          this.advance();
          this.expect('COLON');
          damage.root_cause = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return damage;
  }

  parseStep() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const description = this.expect('STRING').value;
    return { name, description };
  }

  parseAction() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const action = { name, type: null, target: null, parameters: {} };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          action.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'TARGET') {
          this.advance();
          this.expect('COLON');
          action.target = this.expect('STRING').value;
        } else if (token.value === 'PARAMETERS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            const key = this.expect('IDENTIFIER').value;
            this.expect('COLON');
            const val = this.peek();
            if (val.type === 'STRING') {
              action.parameters[key] = this.advance().value;
            } else if (val.type === 'NUMBER') {
              action.parameters[key] = this.advance().value;
            } else {
              action.parameters[key] = this.expect('IDENTIFIER').value;
            }
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
    return action;
  }

  parseCheck() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const condition = this.expect('STRING').value;
    return { name, condition };
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
      'REPAIR', 'VERSION', 'PRIORITY', 'DAMAGE', 'DIAGNOSIS', 'STRATEGY',
      'ACTIONS', 'VERIFICATION', 'SEVERITY', 'AFFECTED', 'ROOT_CAUSE',
      'TYPE', 'TARGET', 'PARAMETERS'
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

export default RILParser;
