/**
 * CHL Parser - Chaos engineering
 */
export class CHLParser {
  constructor() { this.tokens = []; this.position = 0; }
  parse(source) {
    this.tokens = this.tokenize(source); this.position = 0;
    const items = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'CHAOS')) items.push(this.parseCHAOS());
      else this.advance();
    }
    return { type: 'Program', items, language: 'CHL', version: '1.0.0' };
  }
  parseCHAOS() {
    this.expect('KEYWORD', 'CHAOS');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');
    const item = { type: 'CHAOS', name, metadata: {} };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD' && token.value === 'VERSION') {
        this.advance(); item.metadata.version = this.expect('STRING').value;
      } else this.advance();
    }
    this.expect('RBRACE'); return item;
  }
  tokenize(source) {
    const tokens = [], keywords = ['CHAOS', 'VERSION'];
    let i = 0;
    while (i < source.length) {
      const char = source[i];
      if (/\s/.test(char)) { i++; continue; }
      if (char === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
      if (char === '"') { let value = ''; i++; while (i < source.length && source[i] !== '"') { if (source[i] === '\\') i++; value += source[i++]; } i++; tokens.push({ type: 'STRING', value }); continue; }
      if (/[0-9]/.test(char)) { let value = ''; while (i < source.length && /[0-9.]/.test(source[i])) value += source[i++]; tokens.push({ type: 'NUMBER', value: parseFloat(value) }); continue; }
      if (/[A-Za-z_]/.test(char)) { let value = ''; while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) value += source[i++]; const upper = value.toUpperCase(); tokens.push(keywords.includes(upper) ? { type: 'KEYWORD', value: upper } : { type: 'IDENTIFIER', value }); continue; }
      const ops = { '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', ',': 'COMMA' };
      if (ops[char]) { tokens.push({ type: ops[char], value: char }); i++; continue; }
      i++;
    }
    return tokens;
  }
  peek() { return this.tokens[this.position] || { type: 'EOF', value: null }; }
  previous() { return this.tokens[this.position - 1]; }
  advance() { if (!this.isAtEnd()) this.position++; return this.previous(); }
  check(type, value = null) { if (this.isAtEnd()) return false; const token = this.peek(); return token.type === type && (value === null || token.value === value); }
  expect(type, value = null) { if (!this.check(type, value)) throw new Error(`Expected ${value ? type + '(' + value + ')' : type}, got ${this.peek().type}`); return this.advance(); }
  isAtEnd() { return this.position >= this.tokens.length; }
}
export default CHLParser;
