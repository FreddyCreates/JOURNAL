/**
 * SPL Parser - Skill Progression Language
 * Tracks learning paths and skill development
 */
export class SPLParser {
  constructor() { this.tokens = []; this.position = 0; }
  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;
    const skills = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'SKILL')) skills.push(this.parseSkill());
      else this.advance();
    }
    return { type: 'Program', skills, language: 'SPL', version: '1.0.0' };
  }
  parseSkill() {
    this.expect('KEYWORD', 'SKILL');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');
    const skill = { type: 'Skill', name, metadata: {}, levels: [], prerequisites: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') { this.advance(); skill.metadata.version = this.expect('STRING').value; }
        else if (token.value === 'DOMAIN') { this.advance(); this.expect('COLON'); skill.metadata.domain = this.expect('IDENTIFIER').value; }
        else if (token.value === 'LEVELS') { this.advance(); this.expect('COLON'); skill.levels = this.parseList(); }
        else if (token.value === 'PREREQUISITES') { this.advance(); this.expect('COLON'); skill.prerequisites = this.parseList(); }
        else this.advance();
      } else this.advance();
    }
    this.expect('RBRACE');
    return skill;
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
    const keywords = ['SKILL', 'VERSION', 'DOMAIN', 'LEVELS', 'PREREQUISITES'];
    let i = 0;
    while (i < source.length) {
      const char = source[i];
      if (/\s/.test(char)) { i++; continue; }
      if (char === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue; }
      if (char === '"') {
        let value = ''; i++;
        while (i < source.length && source[i] !== '"') { if (source[i] === '\\') i++; value += source[i++]; }
        i++; tokens.push({ type: 'STRING', value }); continue;
      }
      if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(source[i + 1]))) {
        let value = '';
        if (char === '-') { value += char; i++; }
        while (i < source.length && /[0-9.]/.test(source[i])) value += source[i++];
        tokens.push({ type: 'NUMBER', value: parseFloat(value) }); continue;
      }
      if (/[A-Za-z_]/.test(char)) {
        let value = '';
        while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) value += source[i++];
        const upper = value.toUpperCase();
        tokens.push(keywords.includes(upper) ? { type: 'KEYWORD', value: upper } : { type: 'IDENTIFIER', value }); continue;
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
export default SPLParser;
