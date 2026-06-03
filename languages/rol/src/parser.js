/**
 * ROL Parser - Role & Permission Language
 * Handles role definitions and permission management
 */

export class ROLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const roles = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'ROLE')) {
        roles.push(this.parseRole());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', roles, language: 'ROL', version: '1.0.0' };
  }

  parseRole() {
    this.expect('KEYWORD', 'ROLE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const role = {
      type: 'Role',
      name,
      metadata: {},
      permissions: [],
      constraints: [],
      inheritance: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          role.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'DESCRIPTION') {
          this.advance();
          this.expect('COLON');
          role.metadata.description = this.expect('STRING').value;
        } else if (token.value === 'PERMISSIONS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            role.permissions.push(this.parsePermission());
          }
          this.expect('RBRACE');
        } else if (token.value === 'CONSTRAINTS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            role.constraints.push(this.parseConstraint());
          }
          this.expect('RBRACE');
        } else if (token.value === 'INHERITS') {
          this.advance();
          this.expect('COLON');
          role.inheritance = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return role;
  }

  parsePermission() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const permission = { name, resource: null, actions: [], conditions: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'RESOURCE') {
          this.advance();
          this.expect('COLON');
          permission.resource = this.expect('STRING').value;
        } else if (token.value === 'ACTIONS') {
          this.advance();
          this.expect('COLON');
          permission.actions = this.parseList();
        } else if (token.value === 'CONDITIONS') {
          this.advance();
          this.expect('COLON');
          permission.conditions = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return permission;
  }

  parseConstraint() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const value = this.peek().type === 'STRING'
      ? this.expect('STRING').value
      : this.expect('IDENTIFIER').value;
    return { name, value };
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
      'ROLE', 'VERSION', 'DESCRIPTION', 'PERMISSIONS', 'CONSTRAINTS',
      'INHERITS', 'RESOURCE', 'ACTIONS', 'CONDITIONS'
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

export default ROLParser;
