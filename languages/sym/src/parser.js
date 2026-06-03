/**
 * SYM Parser - Symbol Language
 * Symbolic representations and semantic meanings
 */

export class SYMParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const symbols = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'SYMBOL')) {
        symbols.push(this.parseSymbol());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', symbols, language: 'SYM', version: '1.0.0' };
  }

  parseSymbol() {
    this.expect('KEYWORD', 'SYMBOL');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const symbol = {
      type: 'Symbol',
      name,
      metadata: {},
      representation: null,
      meanings: [],
      contexts: [],
      associations: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          symbol.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'REPRESENTATION') {
          this.advance();
          this.expect('COLON');
          symbol.representation = this.expect('STRING').value;
        } else if (token.value === 'MEANINGS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            symbol.meanings.push(this.parseMeaning());
          }
          this.expect('RBRACE');
        } else if (token.value === 'CONTEXTS') {
          this.advance();
          this.expect('COLON');
          symbol.contexts = this.parseList();
        } else if (token.value === 'ASSOCIATIONS') {
          this.advance();
          this.expect('COLON');
          symbol.associations = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return symbol;
  }

  parseMeaning() {
    const level = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const interpretation = this.expect('STRING').value;
    return { level, interpretation };
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
      'SYMBOL', 'VERSION', 'REPRESENTATION', 'MEANINGS', 'CONTEXTS', 'ASSOCIATIONS'
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

export default SYMParser;
