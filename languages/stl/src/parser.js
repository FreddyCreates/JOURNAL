/**
 * STL Parser - Story Language
 * Narrative structures and storytelling
 */

export class STLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const stories = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'STORY')) {
        stories.push(this.parseStory());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', stories, language: 'STL', version: '1.0.0' };
  }

  parseStory() {
    this.expect('KEYWORD', 'STORY');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const story = {
      type: 'Story',
      name,
      metadata: {},
      characters: [],
      plot: [],
      setting: {},
      themes: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          story.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'GENRE') {
          this.advance();
          this.expect('COLON');
          story.metadata.genre = this.expect('IDENTIFIER').value;
        } else if (token.value === 'CHARACTERS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            story.characters.push(this.parseCharacter());
          }
          this.expect('RBRACE');
        } else if (token.value === 'PLOT') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            story.plot.push(this.parseScene());
          }
          this.expect('RBRACE');
        } else if (token.value === 'SETTING') {
          this.advance();
          story.setting = this.parseSetting();
        } else if (token.value === 'THEMES') {
          this.advance();
          this.expect('COLON');
          story.themes = this.parseList();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return story;
  }

  parseCharacter() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const character = { name, role: null, motivation: null, arc: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'ROLE') {
          this.advance();
          this.expect('COLON');
          character.role = this.expect('IDENTIFIER').value;
        } else if (token.value === 'MOTIVATION') {
          this.advance();
          this.expect('COLON');
          character.motivation = this.expect('STRING').value;
        } else if (token.value === 'ARC') {
          this.advance();
          this.expect('COLON');
          character.arc = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return character;
  }

  parseScene() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const scene = { name, description: null, tension: null, outcome: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'DESCRIPTION') {
          this.advance();
          this.expect('COLON');
          scene.description = this.expect('STRING').value;
        } else if (token.value === 'TENSION') {
          this.advance();
          this.expect('COLON');
          scene.tension = this.expect('NUMBER').value;
        } else if (token.value === 'OUTCOME') {
          this.advance();
          this.expect('COLON');
          scene.outcome = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return scene;
  }

  parseSetting() {
    this.expect('LBRACE');
    const setting = { time: null, place: null, atmosphere: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TIME') {
          this.advance();
          this.expect('COLON');
          setting.time = this.expect('STRING').value;
        } else if (token.value === 'PLACE') {
          this.advance();
          this.expect('COLON');
          setting.place = this.expect('STRING').value;
        } else if (token.value === 'ATMOSPHERE') {
          this.advance();
          this.expect('COLON');
          setting.atmosphere = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return setting;
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
      'STORY', 'VERSION', 'GENRE', 'CHARACTERS', 'PLOT', 'SETTING', 'THEMES',
      'ROLE', 'MOTIVATION', 'ARC', 'DESCRIPTION', 'TENSION', 'OUTCOME',
      'TIME', 'PLACE', 'ATMOSPHERE'
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

export default STLParser;
