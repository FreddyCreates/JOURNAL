/**
 * MYL Parser - Myth Language
 * Foundational narratives and civilizational myths
 */

export class MYLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const myths = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'MYTH')) {
        myths.push(this.parseMyth());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', myths, language: 'MYL', version: '1.0.0' };
  }

  parseMyth() {
    this.expect('KEYWORD', 'MYTH');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const myth = {
      type: 'Myth',
      name,
      metadata: {},
      archetype: null,
      narrative: {},
      themes: [],
      symbols: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          myth.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'ARCHETYPE') {
          this.advance();
          this.expect('COLON');
          myth.archetype = this.expect('IDENTIFIER').value;
        } else if (token.value === 'NARRATIVE') {
          this.advance();
          myth.narrative = this.parseNarrative();
        } else if (token.value === 'THEMES') {
          this.advance();
          this.expect('COLON');
          myth.themes = this.parseList();
        } else if (token.value === 'SYMBOLS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            myth.symbols.push(this.parseSymbol());
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
    return myth;
  }

  parseNarrative() {
    this.expect('LBRACE');
    const narrative = { beginning: null, conflict: null, transformation: null, resolution: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'BEGINNING') {
          this.advance();
          this.expect('COLON');
          narrative.beginning = this.expect('STRING').value;
        } else if (token.value === 'CONFLICT') {
          this.advance();
          this.expect('COLON');
          narrative.conflict = this.expect('STRING').value;
        } else if (token.value === 'TRANSFORMATION') {
          this.advance();
          this.expect('COLON');
          narrative.transformation = this.expect('STRING').value;
        } else if (token.value === 'RESOLUTION') {
          this.advance();
          this.expect('COLON');
          narrative.resolution = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return narrative;
  }

  parseSymbol() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    const meaning = this.expect('STRING').value;
    return { name, meaning };
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
      'MYTH', 'VERSION', 'ARCHETYPE', 'NARRATIVE', 'THEMES', 'SYMBOLS',
      'BEGINNING', 'CONFLICT', 'TRANSFORMATION', 'RESOLUTION'
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

export default MYLParser;
