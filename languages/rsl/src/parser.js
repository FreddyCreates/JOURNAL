/**
 * RSL Parser - Realm Structure Language
 * Virtual world structures and spatial definitions
 */

export class RSLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const realms = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'REALM')) {
        realms.push(this.parseRealm());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', realms, language: 'RSL', version: '1.0.0' };
  }

  parseRealm() {
    this.expect('KEYWORD', 'REALM');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const realm = {
      type: 'Realm',
      name,
      metadata: {},
      zones: [],
      connections: [],
      rules: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          realm.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'CAPACITY') {
          this.advance();
          this.expect('COLON');
          realm.metadata.capacity = this.expect('NUMBER').value;
        } else if (token.value === 'ZONES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            realm.zones.push(this.parseZone());
          }
          this.expect('RBRACE');
        } else if (token.value === 'CONNECTIONS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            realm.connections.push(this.parseConnection());
          }
          this.expect('RBRACE');
        } else if (token.value === 'RULES') {
          this.advance();
          this.expect('COLON');
          realm.rules = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return realm;
  }

  parseZone() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const zone = { name, type: null, capacity: null, properties: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          zone.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'CAPACITY') {
          this.advance();
          this.expect('COLON');
          zone.capacity = this.expect('NUMBER').value;
        } else if (token.value === 'PROPERTIES') {
          this.advance();
          this.expect('COLON');
          zone.properties = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return zone;
  }

  parseConnection() {
    const from = this.expect('IDENTIFIER').value;
    this.expect('ARROW');
    const to = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const type = this.expect('IDENTIFIER').value;
    return { from, to, type };
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
      'REALM', 'VERSION', 'CAPACITY', 'ZONES', 'CONNECTIONS', 'RULES',
      'TYPE', 'PROPERTIES'
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

export default RSLParser;
