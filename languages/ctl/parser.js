/**
 * CTL Parser - Capability Testing Language
 * 
 * ENCODED IDENTITY: CTL.CAPABILITY.TEST
 * 
 * A domain-specific language for defining capability requirements,
 * testing capabilities, and validating system competencies.
 * 
 * Syntax Example:
 * ```
 * capability MEMORY_OPERATIONS [ENCODED_ID: CAP-001] {
 *   requires: ["heap_allocation", "gc_management"]
 *   level: ADVANCED
 *   
 *   test allocate_memory {
 *     input: { size: 1024, type: "buffer" }
 *     expect: { success: true, allocated: >= 1024 }
 *     timeout: 100ms
 *   }
 *   
 *   benchmark throughput {
 *     iterations: 10000
 *     target: >= 1000000 ops/sec
 *     variance: <= 5%
 *   }
 * }
 * ```
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * Token types for CTL
 */
const TokenType = {
  // Keywords
  CAPABILITY: 'CAPABILITY',
  REQUIRES: 'REQUIRES',
  LEVEL: 'LEVEL',
  TEST: 'TEST',
  BENCHMARK: 'BENCHMARK',
  INPUT: 'INPUT',
  EXPECT: 'EXPECT',
  TIMEOUT: 'TIMEOUT',
  ITERATIONS: 'ITERATIONS',
  TARGET: 'TARGET',
  VARIANCE: 'VARIANCE',
  ENCODED_ID: 'ENCODED_ID',
  DEPENDS: 'DEPENDS',
  PROVIDES: 'PROVIDES',
  ASSERTS: 'ASSERTS',
  VALIDATES: 'VALIDATES',
  
  // Capability Levels
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
  SOVEREIGN: 'SOVEREIGN',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  DURATION: 'DURATION',
  PERCENTAGE: 'PERCENTAGE',
  
  // Operators
  COLON: 'COLON',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  GTE: 'GTE',
  LTE: 'LTE',
  GT: 'GT',
  LT: 'LT',
  EQ: 'EQ',
  
  // Special
  COMMENT: 'COMMENT',
  EOF: 'EOF'
};

/**
 * CTL Lexer
 */
class CTLLexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
  }

  peek() {
    return this.input[this.pos] || '';
  }

  advance() {
    const char = this.input[this.pos++];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.advance();
    }
  }

  skipComment() {
    if (this.peek() === '/' && this.input[this.pos + 1] === '/') {
      while (this.peek() && this.peek() !== '\n') {
        this.advance();
      }
      return true;
    }
    if (this.peek() === '/' && this.input[this.pos + 1] === '*') {
      this.advance(); // /
      this.advance(); // *
      while (this.pos < this.input.length) {
        if (this.peek() === '*' && this.input[this.pos + 1] === '/') {
          this.advance();
          this.advance();
          break;
        }
        this.advance();
      }
      return true;
    }
    return false;
  }

  readString() {
    const quote = this.advance();
    let value = '';
    while (this.peek() && this.peek() !== quote) {
      if (this.peek() === '\\') {
        this.advance();
        value += this.advance();
      } else {
        value += this.advance();
      }
    }
    this.advance(); // closing quote
    return { type: TokenType.STRING, value };
  }

  readNumber() {
    let value = '';
    while (/[\d.]/.test(this.peek())) {
      value += this.advance();
    }
    
    // Check for duration suffix
    if (/[msu]/.test(this.peek())) {
      let unit = this.advance();
      if (unit === 'm' && this.peek() === 's') {
        unit += this.advance();
      }
      return { type: TokenType.DURATION, value: parseFloat(value), unit };
    }
    
    // Check for percentage
    if (this.peek() === '%') {
      this.advance();
      return { type: TokenType.PERCENTAGE, value: parseFloat(value) };
    }
    
    return { type: TokenType.NUMBER, value: parseFloat(value) };
  }

  readIdentifier() {
    let value = '';
    while (/[a-zA-Z0-9_-]/.test(this.peek())) {
      value += this.advance();
    }
    
    // Check for rate suffix (ops/sec, etc.)
    if (this.peek() === '/') {
      value += this.advance();
      while (/[a-zA-Z]/.test(this.peek())) {
        value += this.advance();
      }
    }
    
    const keywords = {
      'capability': TokenType.CAPABILITY,
      'requires': TokenType.REQUIRES,
      'level': TokenType.LEVEL,
      'test': TokenType.TEST,
      'benchmark': TokenType.BENCHMARK,
      'input': TokenType.INPUT,
      'expect': TokenType.EXPECT,
      'timeout': TokenType.TIMEOUT,
      'iterations': TokenType.ITERATIONS,
      'target': TokenType.TARGET,
      'variance': TokenType.VARIANCE,
      'ENCODED_ID': TokenType.ENCODED_ID,
      'depends': TokenType.DEPENDS,
      'provides': TokenType.PROVIDES,
      'asserts': TokenType.ASSERTS,
      'validates': TokenType.VALIDATES,
      'BASIC': TokenType.BASIC,
      'INTERMEDIATE': TokenType.INTERMEDIATE,
      'ADVANCED': TokenType.ADVANCED,
      'EXPERT': TokenType.EXPERT,
      'SOVEREIGN': TokenType.SOVEREIGN,
      'true': TokenType.IDENTIFIER,
      'false': TokenType.IDENTIFIER
    };
    
    return { type: keywords[value] || TokenType.IDENTIFIER, value };
  }

  nextToken() {
    this.skipWhitespace();
    while (this.skipComment()) {
      this.skipWhitespace();
    }

    if (this.pos >= this.input.length) {
      return { type: TokenType.EOF };
    }

    const char = this.peek();
    const line = this.line;
    const column = this.column;

    // String literals
    if (char === '"' || char === "'") {
      return { ...this.readString(), line, column };
    }

    // Numbers
    if (/\d/.test(char)) {
      return { ...this.readNumber(), line, column };
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      return { ...this.readIdentifier(), line, column };
    }

    // Operators
    this.advance();
    switch (char) {
      case ':': return { type: TokenType.COLON, line, column };
      case '{': return { type: TokenType.LBRACE, line, column };
      case '}': return { type: TokenType.RBRACE, line, column };
      case '[': return { type: TokenType.LBRACKET, line, column };
      case ']': return { type: TokenType.RBRACKET, line, column };
      case '(': return { type: TokenType.LPAREN, line, column };
      case ')': return { type: TokenType.RPAREN, line, column };
      case ',': return { type: TokenType.COMMA, line, column };
      case '>':
        if (this.peek() === '=') {
          this.advance();
          return { type: TokenType.GTE, line, column };
        }
        return { type: TokenType.GT, line, column };
      case '<':
        if (this.peek() === '=') {
          this.advance();
          return { type: TokenType.LTE, line, column };
        }
        return { type: TokenType.LT, line, column };
      case '=':
        if (this.peek() === '=') {
          this.advance();
        }
        return { type: TokenType.EQ, line, column };
      default:
        return { type: TokenType.IDENTIFIER, value: char, line, column };
    }
  }

  tokenize() {
    const tokens = [];
    let token;
    while ((token = this.nextToken()).type !== TokenType.EOF) {
      tokens.push(token);
    }
    tokens.push(token);
    return tokens;
  }
}

/**
 * CTL Parser
 */
class CTLParser {
  constructor(input) {
    this.lexer = new CTLLexer(input);
    this.tokens = this.lexer.tokenize();
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || { type: TokenType.EOF };
  }

  advance() {
    return this.tokens[this.pos++];
  }

  expect(type) {
    const token = this.advance();
    if (token.type !== type) {
      throw new Error(`Expected ${type} but got ${token.type} at line ${token.line}`);
    }
    return token;
  }

  parse() {
    const capabilities = [];
    
    while (this.peek().type !== TokenType.EOF) {
      if (this.peek().type === TokenType.CAPABILITY) {
        capabilities.push(this.parseCapability());
      } else {
        this.advance();
      }
    }
    
    return {
      type: 'CTLProgram',
      capabilities,
      metadata: {
        phi: PHI,
        phiInverse: PHI_INVERSE,
        encodedIdentity: 'CTL.CAPABILITY.TEST'
      }
    };
  }

  parseCapability() {
    this.expect(TokenType.CAPABILITY);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let encodedId = null;
    if (this.peek().type === TokenType.LBRACKET) {
      encodedId = this.parseEncodedId();
    }
    
    this.expect(TokenType.LBRACE);
    
    const capability = {
      type: 'Capability',
      name,
      encodedId,
      requires: [],
      level: 'BASIC',
      depends: [],
      provides: [],
      tests: [],
      benchmarks: [],
      validations: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.REQUIRES:
          this.advance();
          this.expect(TokenType.COLON);
          capability.requires = this.parseStringArray();
          break;
        case TokenType.LEVEL:
          this.advance();
          this.expect(TokenType.COLON);
          capability.level = this.advance().value;
          break;
        case TokenType.DEPENDS:
          this.advance();
          this.expect(TokenType.COLON);
          capability.depends = this.parseStringArray();
          break;
        case TokenType.PROVIDES:
          this.advance();
          this.expect(TokenType.COLON);
          capability.provides = this.parseStringArray();
          break;
        case TokenType.TEST:
          capability.tests.push(this.parseTest());
          break;
        case TokenType.BENCHMARK:
          capability.benchmarks.push(this.parseBenchmark());
          break;
        case TokenType.VALIDATES:
          capability.validations.push(this.parseValidation());
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return capability;
  }

  parseEncodedId() {
    this.expect(TokenType.LBRACKET);
    this.expect(TokenType.ENCODED_ID);
    this.expect(TokenType.COLON);
    const id = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.RBRACKET);
    return id;
  }

  parseStringArray() {
    const items = [];
    this.expect(TokenType.LBRACKET);
    
    while (this.peek().type !== TokenType.RBRACKET) {
      if (this.peek().type === TokenType.STRING) {
        items.push(this.advance().value);
      } else if (this.peek().type === TokenType.IDENTIFIER) {
        items.push(this.advance().value);
      }
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACKET);
    return items;
  }

  parseTest() {
    this.expect(TokenType.TEST);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const test = {
      type: 'Test',
      name,
      input: null,
      expect: null,
      timeout: null,
      assertions: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.INPUT:
          this.advance();
          this.expect(TokenType.COLON);
          test.input = this.parseObject();
          break;
        case TokenType.EXPECT:
          this.advance();
          this.expect(TokenType.COLON);
          test.expect = this.parseExpectation();
          break;
        case TokenType.TIMEOUT:
          this.advance();
          this.expect(TokenType.COLON);
          test.timeout = this.parseDuration();
          break;
        case TokenType.ASSERTS:
          this.advance();
          this.expect(TokenType.COLON);
          test.assertions = this.parseStringArray();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return test;
  }

  parseBenchmark() {
    this.expect(TokenType.BENCHMARK);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const benchmark = {
      type: 'Benchmark',
      name,
      iterations: 1000,
      target: null,
      variance: null,
      warmup: 100
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.ITERATIONS:
          this.advance();
          this.expect(TokenType.COLON);
          benchmark.iterations = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.TARGET:
          this.advance();
          this.expect(TokenType.COLON);
          benchmark.target = this.parseComparison();
          break;
        case TokenType.VARIANCE:
          this.advance();
          this.expect(TokenType.COLON);
          benchmark.variance = this.parseComparison();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return benchmark;
  }

  parseValidation() {
    this.expect(TokenType.VALIDATES);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const validation = {
      type: 'Validation',
      name,
      conditions: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      if (this.peek().type === TokenType.ASSERTS) {
        this.advance();
        this.expect(TokenType.COLON);
        validation.conditions = this.parseStringArray();
      } else {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return validation;
  }

  parseObject() {
    const obj = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      
      const valueToken = this.peek();
      if (valueToken.type === TokenType.NUMBER) {
        obj[key] = this.advance().value;
      } else if (valueToken.type === TokenType.STRING) {
        obj[key] = this.advance().value;
      } else if (valueToken.type === TokenType.IDENTIFIER) {
        const val = this.advance().value;
        obj[key] = val === 'true' ? true : val === 'false' ? false : val;
      } else if (valueToken.type === TokenType.LBRACE) {
        obj[key] = this.parseObject();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return obj;
  }

  parseExpectation() {
    const expectation = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.expect(TokenType.IDENTIFIER).value;
      this.expect(TokenType.COLON);
      
      const token = this.peek();
      if (token.type === TokenType.GTE || token.type === TokenType.LTE ||
          token.type === TokenType.GT || token.type === TokenType.LT) {
        const op = this.advance().type;
        const val = this.advance().value;
        expectation[key] = { operator: op, value: val };
      } else if (token.type === TokenType.NUMBER) {
        expectation[key] = this.advance().value;
      } else if (token.type === TokenType.STRING) {
        expectation[key] = this.advance().value;
      } else if (token.type === TokenType.IDENTIFIER) {
        const val = this.advance().value;
        expectation[key] = val === 'true' ? true : val === 'false' ? false : val;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return expectation;
  }

  parseComparison() {
    const op = this.advance().type;
    const token = this.advance();
    
    if (token.type === TokenType.PERCENTAGE) {
      return { operator: op, value: token.value, unit: 'percent' };
    } else if (token.type === TokenType.NUMBER) {
      // Check for rate
      if (this.peek().type === TokenType.IDENTIFIER && this.peek().value.includes('/')) {
        const unit = this.advance().value;
        return { operator: op, value: token.value, unit };
      }
      return { operator: op, value: token.value };
    }
    
    return { operator: op, value: token.value };
  }

  parseDuration() {
    const token = this.advance();
    if (token.type === TokenType.DURATION) {
      return { value: token.value, unit: token.unit };
    }
    return { value: token.value, unit: 'ms' };
  }
}

/**
 * Parse CTL source code
 */
function parse(source) {
  const parser = new CTLParser(source);
  return parser.parse();
}

export { parse, CTLParser, CTLLexer, TokenType };
export default { parse, CTLParser, CTLLexer, TokenType };
