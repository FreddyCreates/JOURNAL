/**
 * LML Parser - Language Meta Language
 * Parses LML language definitions
 */
export class LMLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const languages = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'LANGUAGE')) {
        languages.push(this.parseLanguage());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', languages, language: 'LML', version: '1.0.0' };
  }

  parseLanguage() {
    this.expect('KEYWORD', 'LANGUAGE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const metadata = {};
    const grammar = [];
    const semantics = [];
    const types = [];

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'NAME')) {
        this.advance();
        metadata.NAME = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        metadata.VERSION = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        metadata.ENCODED_ID = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'PURPOSE')) {
        this.advance();
        metadata.PURPOSE = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'TARGET')) {
        this.advance();
        metadata.TARGET = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'STACK')) {
        this.advance();
        metadata.STACK = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'PRIORITY')) {
        this.advance();
        metadata.PRIORITY = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'GRAMMAR')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          grammar.push(this.parseGrammarRule());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'SEMANTICS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          semantics.push(this.parseSemanticRule());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'TYPES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          types.push(this.parseType());
        }
        this.expect('RBRACE');
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');

    return { type: 'Language', name, metadata, grammar, semantics, types };
  }

  parseGrammarRule() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const production = this.parseProduction();
    return { type: 'GrammarRule', name, production };
  }

  parseProduction() {
    const elements = [];
    while (!this.check('RBRACE') && !this.check('IDENTIFIER') && !this.isAtEnd()) {
      const token = this.peek();
      if (token.type === 'STRING' || token.type === 'KEYWORD' || token.type === 'IDENTIFIER') {
        elements.push(this.advance().value);
      } else {
        break;
      }
    }
    return { type: 'Production', elements };
  }

  parseSemanticRule() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const rules = {};
    while (!this.check('RBRACE')) {
      const key = this.advance().value;
      this.expect('COLON');
      const value = this.advance().value;
      rules[key] = value;
    }
    this.expect('RBRACE');
    return { type: 'SemanticRule', name, rules };
  }

  parseType() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const typeSpec = this.advance().value;
    return { type: 'TypeDef', name, spec: typeSpec };
  }

  tokenize(source) {
    const tokens = [];
    const keywords = [
      'LANGUAGE', 'NAME', 'VERSION', 'ENCODED_ID', 'PURPOSE', 'TARGET', 'STACK',
      'PRIORITY', 'METADATA', 'GRAMMAR', 'SEMANTICS', 'TYPES', 'ENFORCEMENT',
      'COMPILATION_TARGET', 'TEMPLATE', 'MOTOKO', 'JAVASCRIPT', 'WASM', 'RULE',
      'PRODUCTION', 'TRUE', 'FALSE', 'STRING', 'NUMBER', 'BOOLEAN'
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
        tokens.push(keywords.includes(upper)
          ? { type: 'KEYWORD', value: upper }
          : { type: 'IDENTIFIER', value });
        continue;
      }

      const ops = { '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', ',': 'COMMA', ';': 'SEMICOLON' };
      if (ops[char]) {
        tokens.push({ type: ops[char], value: char });
        i++;
        continue;
      }

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
      throw new Error(`Expected ${value ? type + '(' + value + ')' : type}, got ${this.peek().type}`);
    }
    return this.advance();
  }
  isAtEnd() { return this.position >= this.tokens.length; }
}

export default LMLParser;
