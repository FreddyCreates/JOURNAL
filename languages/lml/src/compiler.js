/**
 * LML BOOTSTRAP COMPILER
 * Language Meta Language - Self-hosting compiler that generates parsers for all cognitive languages
 * Phase 0: Manual JavaScript implementation
 * @module @medina/lml-compiler
 */

export class LMLCompiler {
  constructor() {
    this.languages = new Map();
  }

  /**
   * Compile LML language definition to generate parser, validator, and compiler
   * @param {string} source - LML source code
   * @returns {Object} Generated artifacts
   */
  compile(source) {
    const ast = this.parse(source);
    const language = ast.languages[0];

    return {
      parser: this.generateParser(language),
      validator: this.generateValidator(language),
      compiler: this.generateCompiler(language),
      metadata: {
        name: language.name,
        version: language.metadata.VERSION,
        encodedId: language.metadata.ENCODED_ID
      }
    };
  }

  /**
   * Parse LML source into AST
   */
  parse(source) {
    const tokens = this.tokenize(source);
    this.tokens = tokens;
    this.position = 0;

    const languages = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'LANGUAGE')) {
        languages.push(this.parseLanguage());
      } else {
        this.advance();
      }
    }

    return { type: 'LMLProgram', languages };
  }

  /**
   * Tokenize LML source
   */
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

      // Skip whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // String literals
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

      // Multi-line strings
      if (source.slice(i, i + 3) === '"""') {
        let value = '';
        i += 3;
        while (i < source.length && source.slice(i, i + 3) !== '"""') {
          value += source[i++];
        }
        i += 3;
        tokens.push({ type: 'MULTILINE_STRING', value });
        continue;
      }

      // Identifiers and keywords
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

      // Operators
      const ops = { '{': 'LBRACE', '}': 'RBRACE', ':': 'COLON', '|': 'PIPE',
                    '(': 'LPAREN', ')': 'RPAREN', '*': 'STAR', '+': 'PLUS',
                    '?': 'QUESTION', '→': 'ARROW', '⟹': 'IMPLIES' };

      // Handle multi-char operators
      if (source.slice(i, i + 3) === '::=') {
        tokens.push({ type: 'PRODUCTION_OP', value: '::=' });
        i += 3;
        continue;
      }

      if (source.slice(i, i + 2) === ':=') {
        tokens.push({ type: 'ASSIGN', value: ':=' });
        i += 2;
        continue;
      }

      if (ops[char]) {
        tokens.push({ type: ops[char], value: char });
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }

  /**
   * Parse LANGUAGE definition
   */
  parseLanguage() {
    this.expect('KEYWORD', 'LANGUAGE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const language = {
      type: 'Language',
      name,
      metadata: {},
      grammar: { rules: [] },
      semantics: { rules: [] },
      types: {},
      compilation: { targets: [] }
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'NAME')) {
        this.advance();
        language.metadata.NAME = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        language.metadata.VERSION = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        language.metadata.ENCODED_ID = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'METADATA')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          // Allow keywords as identifiers in METADATA context
          let key;
          const token = this.peek();
          if (token.type === 'IDENTIFIER' || token.type === 'KEYWORD') {
            key = this.advance().value;
          } else {
            this.advance();
            continue;
          }
          this.expect('COLON');
          const value = this.expect('STRING').value;
          language.metadata[key] = value;
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'GRAMMAR')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          if (this.check('KEYWORD', 'RULE')) {
            this.advance();
            language.grammar.rules.push(this.parseGrammarRule());
          } else {
            this.advance();
          }
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'TYPES')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          if (this.check('IDENTIFIER')) {
            const key = this.advance().value;
            if (this.check('ASSIGN')) {
              this.advance(); // Skip :=
              const value = this.expect('STRING').value;
              language.types[key] = value;
            }
          } else {
            this.advance();
          }
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'SEMANTICS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          if (this.check('KEYWORD', 'ENFORCEMENT')) {
            this.advance();
            language.semantics.rules.push({
              type: 'enforcement',
              rule: this.expect('STRING').value
            });
          } else {
            this.advance();
          }
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'COMPILATION_TARGET')) {
        this.advance();
        const target = this.expect('KEYWORD').value;
        this.expect('LBRACE');
        const template = {};
        while (!this.check('RBRACE')) {
          if (this.check('KEYWORD', 'TEMPLATE')) {
            this.advance();
            template.code = this.expect('MULTILINE_STRING').value;
          } else {
            this.advance();
          }
        }
        this.expect('RBRACE');
        language.compilation.targets.push({ target, template });
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return language;
  }

  /**
   * Parse grammar rule
   */
  parseGrammarRule() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const productions = [];
    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'PRODUCTION')) {
        this.advance();
        productions.push(this.parseProduction());
      } else {
        this.advance();
      }
    }
    this.expect('RBRACE');

    return { name, productions };
  }

  /**
   * Parse production
   */
  parseProduction() {
    const alternatives = [];
    alternatives.push(this.parseSequence());

    while (this.check('PIPE')) {
      this.advance();
      alternatives.push(this.parseSequence());
    }

    return { type: 'Production', alternatives };
  }

  /**
   * Parse sequence
   */
  parseSequence() {
    const terms = [];
    while (!this.check('PIPE') && !this.check('RBRACE') && !this.isAtEnd()) {
      if (this.check('IDENTIFIER')) {
        const term = this.advance().value;
        let quantifier = null;
        if (this.check('STAR')) {
          quantifier = '*';
          this.advance();
        } else if (this.check('PLUS')) {
          quantifier = '+';
          this.advance();
        } else if (this.check('QUESTION')) {
          quantifier = '?';
          this.advance();
        }
        terms.push({ type: 'Term', value: term, quantifier });
      } else if (this.check('STRING')) {
        terms.push({ type: 'Literal', value: this.advance().value });
      } else if (this.check('LPAREN')) {
        this.advance();
        terms.push(this.parseProduction());
        this.expect('RPAREN');
      } else {
        break;
      }
    }
    return { type: 'Sequence', terms };
  }

  /**
   * Parse semantic rule
   */
  parseSemanticRule() {
    // Pattern ⟹ Action
    const pattern = this.parsePattern();
    this.expect('IMPLIES');
    const action = this.parseAction();
    return { pattern, action };
  }

  /**
   * Parse pattern (simplified)
   */
  parsePattern() {
    const tokens = [];
    while (!this.check('IMPLIES') && !this.isAtEnd()) {
      tokens.push(this.advance());
    }
    return { type: 'Pattern', tokens };
  }

  /**
   * Parse action (simplified)
   */
  parseAction() {
    const tokens = [];
    while (!this.check('KEYWORD') && !this.check('RBRACE') && !this.isAtEnd()) {
      tokens.push(this.advance());
    }
    return { type: 'Action', tokens };
  }

  /**
   * Parse compilation target
   */
  parseCompilationTarget() {
    this.expect('KEYWORD', 'TO');
    const target = this.expect('KEYWORD').value;
    this.expect('LBRACE');
    const rules = [];
    while (!this.check('RBRACE')) {
      rules.push(this.parseTransformRule());
    }
    this.expect('RBRACE');
    return { target, rules };
  }

  /**
   * Parse transform rule
   */
  parseTransformRule() {
    const from = this.expect('IDENTIFIER').value;
    this.expect('ARROW');
    const to = [];
    while (!this.check('IDENTIFIER') && !this.check('RBRACE') && !this.isAtEnd()) {
      to.push(this.advance());
    }
    return { from, to };
  }

  /* === Code Generation === */

  /**
   * Generate parser from grammar
   */
  generateParser(language) {
    const className = `${language.name}Parser`;

    let code = `/**
 * ${language.name} Parser
 * Auto-generated by LML Compiler
 * @module ${language.name.toLowerCase()}-parser
 */

export class ${className} {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const result = this.parseProgram();
    return {
      type: 'Program',
      language: '${language.name}',
      ...result
    };
  }

  tokenize(source) {
    // TODO: Generate tokenizer from grammar
    return [];
  }

`;

    // Generate parse methods for each grammar rule
    for (const rule of language.grammar.rules) {
      code += this.generateParseMethod(rule);
    }

    code += `
  /* === Helper methods === */

  peek() {
    return this.tokens[this.position] || { type: 'EOF', value: null };
  }

  advance() {
    if (!this.isAtEnd()) this.position++;
    return this.tokens[this.position - 1];
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
      throw new Error(\`Expected \${type}, got \${this.peek().type}\`);
    }
    return this.advance();
  }

  isAtEnd() {
    return this.position >= this.tokens.length;
  }
}

export default ${className};
`;

    return code;
  }

  /**
   * Generate parse method for a grammar rule
   */
  generateParseMethod(rule) {
    const methodName = `parse${rule.name}`;

    return `
  ${methodName}() {
    // Parse ${rule.name}
    const result = {};
    // TODO: Generate parsing logic from production
    return result;
  }
`;
  }

  /**
   * Generate validator from semantics
   */
  generateValidator(language) {
    return `/**
 * ${language.name} Validator
 * Auto-generated by LML Compiler
 */

export class ${language.name}Validator {
  validate(ast) {
    // TODO: Generate validation logic from semantic rules
    return { valid: true, errors: [] };
  }
}

export default ${language.name}Validator;
`;
  }

  /**
   * Generate compiler from compilation rules
   */
  generateCompiler(language) {
    let code = `/**
 * ${language.name} Compiler
 * Auto-generated by LML Compiler
 */

export class ${language.name}Compiler {
  constructor() {
    this.target = 'javascript';
  }

  compile(ast, target = 'javascript') {
    this.target = target;

    if (target === 'motoko') {
      return this.compileToMotoko(ast);
    } else if (target === 'javascript') {
      return this.compileToJavaScript(ast);
    }

    throw new Error(\`Unknown target: \${target}\`);
  }

  compileToMotoko(ast) {
    // TODO: Generate Motoko compilation logic
    return '// Motoko code';
  }

  compileToJavaScript(ast) {
    // TODO: Generate JavaScript compilation logic
    return '// JavaScript code';
  }
}

export default ${language.name}Compiler;
`;

    return code;
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
      throw new Error(`Expected ${expected}, got ${this.peek().type}`);
    }
    return this.advance();
  }

  isAtEnd() {
    return this.position >= this.tokens.length;
  }
}

export default LMLCompiler;
