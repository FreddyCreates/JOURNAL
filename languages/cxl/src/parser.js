/**
 * CXL Parser - Craft Expression Language
 * Handles creative work and craftsmanship definitions
 */

export class CXLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const crafts = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'CRAFT')) {
        crafts.push(this.parseCraft());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', crafts, language: 'CXL', version: '1.0.0' };
  }

  parseCraft() {
    this.expect('KEYWORD', 'CRAFT');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const craft = {
      type: 'Craft',
      name,
      metadata: {},
      materials: [],
      techniques: [],
      process: [],
      quality: {}
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          craft.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'DOMAIN') {
          this.advance();
          this.expect('COLON');
          craft.metadata.domain = this.expect('IDENTIFIER').value;
        } else if (token.value === 'MATERIALS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            craft.materials.push(this.parseMaterial());
          }
          this.expect('RBRACE');
        } else if (token.value === 'TECHNIQUES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            craft.techniques.push(this.parseTechnique());
          }
          this.expect('RBRACE');
        } else if (token.value === 'PROCESS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            craft.process.push(this.parseStep());
          }
          this.expect('RBRACE');
        } else if (token.value === 'QUALITY') {
          this.advance();
          craft.quality = this.parseQuality();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return craft;
  }

  parseMaterial() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const material = { name, type: null, properties: [], source: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          material.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'PROPERTIES') {
          this.advance();
          this.expect('COLON');
          material.properties = this.parseList();
        } else if (token.value === 'SOURCE') {
          this.advance();
          this.expect('COLON');
          material.source = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return material;
  }

  parseTechnique() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const technique = { name, skill_level: null, description: null, tools: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'SKILL_LEVEL') {
          this.advance();
          this.expect('COLON');
          technique.skill_level = this.expect('IDENTIFIER').value;
        } else if (token.value === 'DESCRIPTION') {
          this.advance();
          this.expect('COLON');
          technique.description = this.expect('STRING').value;
        } else if (token.value === 'TOOLS') {
          this.advance();
          this.expect('COLON');
          technique.tools = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return technique;
  }

  parseStep() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const step = { name, action: null, duration: null, attention: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'ACTION') {
          this.advance();
          this.expect('COLON');
          step.action = this.expect('STRING').value;
        } else if (token.value === 'DURATION') {
          this.advance();
          this.expect('COLON');
          step.duration = this.expect('NUMBER').value;
        } else if (token.value === 'ATTENTION') {
          this.advance();
          this.expect('COLON');
          step.attention = this.expect('IDENTIFIER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return step;
  }

  parseQuality() {
    this.expect('LBRACE');
    const quality = { standards: [], validation: [], mastery_level: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'STANDARDS') {
          this.advance();
          this.expect('COLON');
          quality.standards = this.parseList();
        } else if (token.value === 'VALIDATION') {
          this.advance();
          this.expect('COLON');
          quality.validation = this.parseList();
        } else if (token.value === 'MASTERY_LEVEL') {
          this.advance();
          this.expect('COLON');
          quality.mastery_level = this.expect('IDENTIFIER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return quality;
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
      'CRAFT', 'VERSION', 'DOMAIN', 'MATERIALS', 'TECHNIQUES', 'PROCESS', 'QUALITY',
      'TYPE', 'PROPERTIES', 'SOURCE', 'SKILL_LEVEL', 'DESCRIPTION', 'TOOLS',
      'ACTION', 'DURATION', 'ATTENTION', 'STANDARDS', 'VALIDATION', 'MASTERY_LEVEL'
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

export default CXLParser;
