/**
 * WFL Parser - Work-Flow Language
 * Handles workflow definitions and task orchestration
 */

export class WFLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const workflows = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'WORKFLOW')) {
        workflows.push(this.parseWorkflow());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', workflows, language: 'WFL', version: '1.0.0' };
  }

  parseWorkflow() {
    this.expect('KEYWORD', 'WORKFLOW');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const workflow = {
      type: 'Workflow',
      name,
      metadata: {},
      inputs: [],
      stages: [],
      outputs: []
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          workflow.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'DESCRIPTION') {
          this.advance();
          this.expect('COLON');
          workflow.metadata.description = this.expect('STRING').value;
        } else if (token.value === 'INPUTS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            workflow.inputs.push(this.parseInput());
          }
          this.expect('RBRACE');
        } else if (token.value === 'STAGES') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            workflow.stages.push(this.parseStage());
          }
          this.expect('RBRACE');
        } else if (token.value === 'OUTPUTS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            workflow.outputs.push(this.parseOutput());
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
    return workflow;
  }

  parseInput() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const input = { name, type: null, required: true, default_value: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          input.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'REQUIRED') {
          this.advance();
          this.expect('COLON');
          input.required = this.expect('IDENTIFIER').value === 'TRUE';
        } else if (token.value === 'DEFAULT') {
          this.advance();
          this.expect('COLON');
          const val = this.peek();
          if (val.type === 'STRING') input.default_value = this.advance().value;
          else if (val.type === 'NUMBER') input.default_value = this.advance().value;
          else input.default_value = this.expect('IDENTIFIER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return input;
  }

  parseStage() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const stage = { name, tasks: [], dependencies: [], parallel: false };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TASKS') {
          this.advance();
          this.expect('COLON');
          stage.tasks = this.parseList();
        } else if (token.value === 'DEPENDENCIES') {
          this.advance();
          this.expect('COLON');
          stage.dependencies = this.parseList();
        } else if (token.value === 'PARALLEL') {
          this.advance();
          this.expect('COLON');
          stage.parallel = this.expect('IDENTIFIER').value === 'TRUE';
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return stage;
  }

  parseOutput() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const output = { name, type: null, source: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'TYPE') {
          this.advance();
          this.expect('COLON');
          output.type = this.expect('IDENTIFIER').value;
        } else if (token.value === 'SOURCE') {
          this.advance();
          this.expect('COLON');
          output.source = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return output;
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
      'WORKFLOW', 'VERSION', 'DESCRIPTION', 'INPUTS', 'STAGES', 'OUTPUTS',
      'TYPE', 'REQUIRED', 'DEFAULT', 'TASKS', 'DEPENDENCIES', 'PARALLEL', 'SOURCE'
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

export default WFLParser;
