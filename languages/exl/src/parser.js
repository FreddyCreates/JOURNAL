/**
 * EXL Parser - Execution Language
 * Handles executable task definitions and runtime specifications
 */

export class EXLParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const executions = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'EXECUTE')) {
        executions.push(this.parseExecution());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', executions, language: 'EXL', version: '1.0.0' };
  }

  parseExecution() {
    this.expect('KEYWORD', 'EXECUTE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const execution = {
      type: 'Execution',
      name,
      metadata: {},
      resources: {},
      steps: [],
      error_handling: [],
      monitoring: {}
    };

    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'VERSION') {
          this.advance();
          execution.metadata.version = this.expect('STRING').value;
        } else if (token.value === 'TIMEOUT') {
          this.advance();
          this.expect('COLON');
          execution.metadata.timeout = this.expect('NUMBER').value;
        } else if (token.value === 'RESOURCES') {
          this.advance();
          execution.resources = this.parseResources();
        } else if (token.value === 'STEPS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            execution.steps.push(this.parseStep());
          }
          this.expect('RBRACE');
        } else if (token.value === 'ERROR_HANDLING') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            execution.error_handling.push(this.parseErrorHandler());
          }
          this.expect('RBRACE');
        } else if (token.value === 'MONITORING') {
          this.advance();
          execution.monitoring = this.parseMonitoring();
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return execution;
  }

  parseResources() {
    this.expect('LBRACE');
    const resources = { cpu: null, memory: null, cycles: null, storage: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'CPU') {
          this.advance();
          this.expect('COLON');
          resources.cpu = this.expect('NUMBER').value;
        } else if (token.value === 'MEMORY') {
          this.advance();
          this.expect('COLON');
          resources.memory = this.expect('NUMBER').value;
        } else if (token.value === 'CYCLES') {
          this.advance();
          this.expect('COLON');
          resources.cycles = this.expect('NUMBER').value;
        } else if (token.value === 'STORAGE') {
          this.advance();
          this.expect('COLON');
          resources.storage = this.expect('NUMBER').value;
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

  parseStep() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const step = { name, command: null, args: {}, retry: null, dependencies: [] };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'COMMAND') {
          this.advance();
          this.expect('COLON');
          step.command = this.expect('STRING').value;
        } else if (token.value === 'ARGS') {
          this.advance();
          this.expect('LBRACE');
          while (!this.check('RBRACE')) {
            const key = this.expect('IDENTIFIER').value;
            this.expect('COLON');
            const val = this.peek();
            if (val.type === 'STRING') step.args[key] = this.advance().value;
            else if (val.type === 'NUMBER') step.args[key] = this.advance().value;
            else step.args[key] = this.expect('IDENTIFIER').value;
          }
          this.expect('RBRACE');
        } else if (token.value === 'RETRY') {
          this.advance();
          this.expect('COLON');
          step.retry = this.expect('NUMBER').value;
        } else if (token.value === 'DEPENDENCIES') {
          this.advance();
          this.expect('COLON');
          step.dependencies = this.parseList();
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

  parseErrorHandler() {
    const error_type = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');
    const handler = { error_type, strategy: null, fallback: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'STRATEGY') {
          this.advance();
          this.expect('COLON');
          handler.strategy = this.expect('IDENTIFIER').value;
        } else if (token.value === 'FALLBACK') {
          this.advance();
          this.expect('COLON');
          handler.fallback = this.expect('STRING').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return handler;
  }

  parseMonitoring() {
    this.expect('LBRACE');
    const monitoring = { metrics: [], alerts: [], logging_level: null };
    while (!this.check('RBRACE')) {
      const token = this.peek();
      if (token.type === 'KEYWORD') {
        if (token.value === 'METRICS') {
          this.advance();
          this.expect('COLON');
          monitoring.metrics = this.parseList();
        } else if (token.value === 'ALERTS') {
          this.advance();
          this.expect('COLON');
          monitoring.alerts = this.parseList();
        } else if (token.value === 'LOGGING_LEVEL') {
          this.advance();
          this.expect('COLON');
          monitoring.logging_level = this.expect('IDENTIFIER').value;
        } else {
          this.advance();
        }
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');
    return monitoring;
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
      'EXECUTE', 'VERSION', 'TIMEOUT', 'RESOURCES', 'STEPS', 'ERROR_HANDLING',
      'MONITORING', 'CPU', 'MEMORY', 'CYCLES', 'STORAGE', 'COMMAND', 'ARGS',
      'RETRY', 'DEPENDENCIES', 'STRATEGY', 'FALLBACK', 'METRICS', 'ALERTS',
      'LOGGING_LEVEL'
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

export default EXLParser;
