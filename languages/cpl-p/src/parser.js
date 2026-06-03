/**
 * CPL-P Parser - Cognitive Processing Language
 * @module cpl-p-parser
 */

export class CPLPParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const pipelines = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'PIPELINE')) {
        pipelines.push(this.parsePipeline());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', pipelines, language: 'CPL-P', version: '1.0.0' };
  }

  parsePipeline() {
    this.expect('KEYWORD', 'PIPELINE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const pipeline = {
      type: 'Pipeline',
      name,
      metadata: {},
      input: {},
      stages: [],
      output: {},
      errorHandlers: []
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        pipeline.metadata.version = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        pipeline.metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'DETERMINISTIC')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        pipeline.metadata.deterministic = token.value === 'TRUE';
      } else if (this.check('KEYWORD', 'IDEMPOTENT')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        pipeline.metadata.idempotent = token.value === 'TRUE';
      } else if (this.check('KEYWORD', 'INPUT')) {
        this.advance();
        pipeline.input = this.parseInputOutput();
      } else if (this.check('KEYWORD', 'STAGES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          pipeline.stages.push(this.parseStage());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'OUTPUT')) {
        this.advance();
        pipeline.output = this.parseInputOutput();
      } else if (this.check('KEYWORD', 'ON_ERROR')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          pipeline.errorHandlers.push(this.parseErrorHandler());
        }
        this.expect('RBRACE');
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return pipeline;
  }

  parseInputOutput() {
    this.expect('LBRACE');
    const io = { schema: null, validation: null, required: [] };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'SCHEMA')) {
        this.advance();
        this.expect('COLON');
        io.schema = this.parseTypeSpec();
      } else if (this.check('KEYWORD', 'VALIDATION')) {
        this.advance();
        this.expect('COLON');
        io.validation = this.parseExpression();
      } else if (this.check('KEYWORD', 'REQUIRED')) {
        this.advance();
        this.expect('COLON');
        io.required = this.parseList();
      } else if (this.check('KEYWORD', 'DESTINATION')) {
        this.advance();
        this.expect('COLON');
        io.destination = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'FORMAT')) {
        this.advance();
        this.expect('COLON');
        io.format = this.expect('STRING').value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return io;
  }

  parseStage() {
    // Stage name can be keyword (VALIDATE, etc.) or identifier
    const nameToken = this.peek();
    if (nameToken.type !== 'IDENTIFIER' && nameToken.type !== 'KEYWORD') {
      throw new Error(`Expected stage name, got ${nameToken.type}`);
    }
    const name = this.advance().value;
    this.expect('COLON');
    this.expect('LBRACE');

    const stage = {
      name,
      type: null,
      transform: null,
      filter: null,
      aggregate: null,
      parallel: false,
      timeout: null,
      retry: null
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'TYPE')) {
        this.advance();
        this.expect('COLON');
        // Type value can be keyword (VALIDATE, MAP, REDUCE, etc.)
        const typeToken = this.peek();
        if (typeToken.type !== 'IDENTIFIER' && typeToken.type !== 'KEYWORD') {
          throw new Error(`Expected type value, got ${typeToken.type}`);
        }
        stage.type = this.advance().value;
      } else if (this.check('KEYWORD', 'TRANSFORM')) {
        this.advance();
        this.expect('COLON');
        stage.transform = this.parseExpression();
      } else if (this.check('KEYWORD', 'FILTER')) {
        this.advance();
        this.expect('COLON');
        stage.filter = this.parseExpression();
      } else if (this.check('KEYWORD', 'AGGREGATE')) {
        this.advance();
        this.expect('COLON');
        stage.aggregate = this.parseExpression();
      } else if (this.check('KEYWORD', 'PARALLEL')) {
        this.advance();
        this.expect('COLON');
        // PARALLEL value can be TRUE/FALSE keyword or identifier
        const parallelToken = this.peek();
        if (parallelToken.type !== 'IDENTIFIER' && parallelToken.type !== 'KEYWORD') {
          throw new Error(`Expected boolean value, got ${parallelToken.type}`);
        }
        stage.parallel = this.advance().value === 'TRUE';
      } else if (this.check('KEYWORD', 'TIMEOUT')) {
        this.advance();
        this.expect('COLON');
        stage.timeout = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'RETRY')) {
        this.advance();
        this.expect('COLON');
        stage.retry = this.parseRetryPolicy();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return stage;
  }

  parseRetryPolicy() {
    this.expect('LBRACE');
    const policy = { maxAttempts: 3, backoff: 'LINEAR' };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'MAX_ATTEMPTS')) {
        this.advance();
        this.expect('COLON');
        policy.maxAttempts = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'BACKOFF')) {
        this.advance();
        this.expect('COLON');
        // BACKOFF value can be keyword (EXPONENTIAL, LINEAR) or identifier
        const backoffToken = this.peek();
        if (backoffToken.type !== 'IDENTIFIER' && backoffToken.type !== 'KEYWORD') {
          throw new Error(`Expected backoff type, got ${backoffToken.type}`);
        }
        policy.backoff = this.advance().value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return policy;
  }

  parseErrorHandler() {
    // Error type can be keyword or identifier
    const errorToken = this.peek();
    if (errorToken.type !== 'IDENTIFIER' && errorToken.type !== 'KEYWORD') {
      throw new Error(`Expected error type, got ${errorToken.type}`);
    }
    const errorType = this.advance().value;
    this.expect('COLON');
    const handler = this.parseBlock();
    return { errorType, handler };
  }

  parseTypeSpec() {
    const tokens = [];
    while (!this.check('KEYWORD') && !this.check('RBRACE') && !this.isAtEnd()) {
      tokens.push(this.advance());
    }
    return { type: 'TypeSpec', tokens };
  }

  parseExpression() {
    const tokens = [];
    let depth = 0;
    while (!this.isAtEnd()) {
      if (this.peek().type === 'LBRACE') depth++;
      if (this.peek().type === 'RBRACE') {
        if (depth === 0) break;
        depth--;
      }
      if (this.check('KEYWORD') && depth === 0) break;
      tokens.push(this.advance());
    }
    return { type: 'Expression', tokens };
  }

  parseBlock() {
    this.expect('LBRACE');
    const statements = [];
    while (!this.check('RBRACE')) {
      statements.push(this.advance());
    }
    this.expect('RBRACE');
    return { type: 'Block', statements };
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
      'PIPELINE', 'VERSION', 'ENCODED_ID', 'DETERMINISTIC', 'IDEMPOTENT',
      'INPUT', 'OUTPUT', 'SCHEMA', 'VALIDATION', 'REQUIRED', 'DESTINATION', 'FORMAT',
      'STAGES', 'TYPE', 'TRANSFORM', 'FILTER', 'AGGREGATE', 'PARALLEL', 'TIMEOUT', 'RETRY',
      'MAP', 'REDUCE', 'VALIDATE', 'ENRICH', 'ROUTE',
      'MAX_ATTEMPTS', 'BACKOFF', 'LINEAR', 'EXPONENTIAL',
      'ON_ERROR', 'TRUE', 'FALSE'
    ];

    let i = 0;
    while (i < source.length) {
      const char = source[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

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
        if (keywords.includes(upper)) {
          tokens.push({ type: 'KEYWORD', value: upper });
        } else {
          tokens.push({ type: 'IDENTIFIER', value });
        }
        continue;
      }

      const ops = {
        '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', ',': 'COMMA',
        '(': 'LPAREN', ')': 'RPAREN', '=': 'EQUALS', ';': 'SEMICOLON'
      };

      if (ops[char]) {
        tokens.push({ type: ops[char], value: char });
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }

  /* === Helper methods === */

  peek() {
    return this.tokens[this.position] || { type: 'EOF', value: null };
  }

  previous() {
    return this.tokens[this.position - 1];
  }

  advance() {
    if (!this.isAtEnd()) this.position++;
    return this.previous();
  }

  check(type, value = null) {
    if (this.isAtEnd()) return false;
    const token = this.peek();
    if (token.type !== type) return false;
    if (value !== null && token.value !== value) return false;
    return true;
  }

  expect(type, value = null) {
    if (!this.check(type, value)) {
      const expected = value ? `${type}('${value}')` : type;
      const got = this.peek();
      throw new Error(`Expected ${expected}, got ${got.type}('${got.value}') at position ${this.position}`);
    }
    return this.advance();
  }

  isAtEnd() {
    return this.position >= this.tokens.length;
  }
}

export default CPLPParser;
