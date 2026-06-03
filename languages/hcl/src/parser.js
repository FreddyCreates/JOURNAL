/**
 * HCL Parser - Habitat Configuration Language
 * Environmental configurations and habitat specifications
 */

export class HCLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const habitats = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'HABITAT')) {
        habitats.push(this.parseHabitat());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', habitats, language: 'HCL', version: '1.0.0' };
  }

  parseHabitat() {
    this.expect('KEYWORD', 'HABITAT');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const habitat = {
      type: 'Habitat',
      name,
      metadata: {},
      environment: {},
      resources: {},
      constraints: [],
      inhabitants: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          habitat.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'ENVIRONMENT') {
          this.advance();
          habitat.environment = this.parseEnvironment();
        } else if (token.value === 'RESOURCES') {
          this.advance();
          habitat.resources = this.parseResources();
        } else if (token.value === 'CONSTRAINTS') {
          this.advance();
          this.expect('COLON');
          habitat.constraints = this.parseList();
        } else if (token.value === 'INHABITANTS') {
          this.advance();
          this.expect('COLON');
          habitat.inhabitants = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return habitat;
  }

  parseEnvironment() {
    this.expect('LBRACE');
    const env = { temperature: null, visibility: null, accessibility: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TEMPERATURE') {
          this.advance();
          this.expect('COLON');
          env.temperature = this.expect('IDENTIFIER').value;
        } else if (token.value === 'VISIBILITY') {
          this.advance();
          this.expect('COLON');
          env.visibility = this.expect('IDENTIFIER').value;
        } else if (token.value === 'ACCESSIBILITY') {
          this.advance();
          this.expect('COLON');
          env.accessibility = this.expect('IDENTIFIER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return env;
  }

  parseResources() {
    this.expect('LBRACE');
    const resources = { compute: null, storage: null, bandwidth: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'COMPUTE') {
          this.advance();
          this.expect('COLON');
          resources.compute = this.expect('NUMBER').value;
        } else if (token.value === 'STORAGE') {
          this.advance();
          this.expect('COLON');
          resources.storage = this.expect('NUMBER').value;
        } else if (token.value === 'BANDWIDTH') {
          this.advance();
          this.expect('COLON');
          resources.bandwidth = this.expect('NUMBER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return resources;
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
      'HABITAT', 'VERSION', 'ENVIRONMENT', 'RESOURCES', 'CONSTRAINTS', 'INHABITANTS',
      'TEMPERATURE', 'VISIBILITY', 'ACCESSIBILITY', 'COMPUTE', 'STORAGE', 'BANDWIDTH'
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

export default HCLParser;
