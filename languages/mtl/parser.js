/**
 * MTL Parser - Memory Testing Language
 * 
 * ENCODED IDENTITY: MTL.MEMORY.TEST
 * 
 * A domain-specific language for defining memory operations,
 * testing memory behavior, and validating memory patterns.
 * 
 * Syntax Example:
 * ```
 * memory_space HEAP_ARENA [ENCODED_ID: MEM-001] {
 *   capacity: 1GB
 *   alignment: 64
 *   strategy: FIBONACCI_ALLOCATION
 *   
 *   region working_set {
 *     size: 256MB
 *     access: READ_WRITE
 *     persistence: VOLATILE
 *   }
 *   
 *   test allocation_pattern {
 *     allocate: { count: 1000, size: 1KB..4KB }
 *     measure: [latency, fragmentation, utilization]
 *     assert: { fragmentation: <= 15%, latency_p99: <= 10ms }
 *   }
 *   
 *   gc_policy {
 *     trigger: utilization >= 80%
 *     algorithm: GENERATIONAL
 *     target_pause: <= 5ms
 *   }
 * }
 * ```
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * Token types for MTL
 */
const TokenType = {
  // Keywords
  MEMORY_SPACE: 'MEMORY_SPACE',
  REGION: 'REGION',
  CAPACITY: 'CAPACITY',
  ALIGNMENT: 'ALIGNMENT',
  STRATEGY: 'STRATEGY',
  SIZE: 'SIZE',
  ACCESS: 'ACCESS',
  PERSISTENCE: 'PERSISTENCE',
  TEST: 'TEST',
  ALLOCATE: 'ALLOCATE',
  DEALLOCATE: 'DEALLOCATE',
  MEASURE: 'MEASURE',
  ASSERT: 'ASSERT',
  GC_POLICY: 'GC_POLICY',
  TRIGGER: 'TRIGGER',
  ALGORITHM: 'ALGORITHM',
  TARGET_PAUSE: 'TARGET_PAUSE',
  ENCODED_ID: 'ENCODED_ID',
  COUNT: 'COUNT',
  PATTERN: 'PATTERN',
  POOL: 'POOL',
  CACHE: 'CACHE',
  BUFFER: 'BUFFER',
  
  // Strategies
  FIBONACCI_ALLOCATION: 'FIBONACCI_ALLOCATION',
  BUDDY_SYSTEM: 'BUDDY_SYSTEM',
  SLAB_ALLOCATOR: 'SLAB_ALLOCATOR',
  PHI_WEIGHTED: 'PHI_WEIGHTED',
  
  // Access Modes
  READ_ONLY: 'READ_ONLY',
  WRITE_ONLY: 'WRITE_ONLY',
  READ_WRITE: 'READ_WRITE',
  EXECUTE: 'EXECUTE',
  
  // Persistence
  VOLATILE: 'VOLATILE',
  PERSISTENT: 'PERSISTENT',
  CACHED: 'CACHED',
  
  // GC Algorithms
  GENERATIONAL: 'GENERATIONAL',
  MARK_SWEEP: 'MARK_SWEEP',
  REFERENCE_COUNTING: 'REFERENCE_COUNTING',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  SIZE_LITERAL: 'SIZE_LITERAL',
  PERCENTAGE: 'PERCENTAGE',
  DURATION: 'DURATION',
  RANGE: 'RANGE',
  
  // Operators
  COLON: 'COLON',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  DOTDOT: 'DOTDOT',
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
 * MTL Lexer
 */
class MTLLexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
  }

  peek() {
    return this.input[this.pos] || '';
  }

  peekAhead(n = 1) {
    return this.input[this.pos + n] || '';
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
    if (this.peek() === '/' && this.peekAhead() === '/') {
      while (this.peek() && this.peek() !== '\n') {
        this.advance();
      }
      return true;
    }
    if (this.peek() === '/' && this.peekAhead() === '*') {
      this.advance();
      this.advance();
      while (this.pos < this.input.length) {
        if (this.peek() === '*' && this.peekAhead() === '/') {
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
    this.advance();
    return { type: TokenType.STRING, value };
  }

  readNumber() {
    let value = '';
    while (/[\d.]/.test(this.peek())) {
      value += this.advance();
    }
    
    // Check for size suffix (KB, MB, GB, TB)
    const sizeMatch = this.input.slice(this.pos).match(/^([KMGT]B)/i);
    if (sizeMatch) {
      for (let i = 0; i < sizeMatch[1].length; i++) {
        this.advance();
      }
      return { type: TokenType.SIZE_LITERAL, value: parseFloat(value), unit: sizeMatch[1].toUpperCase() };
    }
    
    // Check for duration suffix
    const durationMatch = this.input.slice(this.pos).match(/^(ms|us|ns|s)/);
    if (durationMatch) {
      for (let i = 0; i < durationMatch[1].length; i++) {
        this.advance();
      }
      return { type: TokenType.DURATION, value: parseFloat(value), unit: durationMatch[1] };
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
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }
    
    const keywords = {
      'memory_space': TokenType.MEMORY_SPACE,
      'region': TokenType.REGION,
      'capacity': TokenType.CAPACITY,
      'alignment': TokenType.ALIGNMENT,
      'strategy': TokenType.STRATEGY,
      'size': TokenType.SIZE,
      'access': TokenType.ACCESS,
      'persistence': TokenType.PERSISTENCE,
      'test': TokenType.TEST,
      'allocate': TokenType.ALLOCATE,
      'deallocate': TokenType.DEALLOCATE,
      'measure': TokenType.MEASURE,
      'assert': TokenType.ASSERT,
      'gc_policy': TokenType.GC_POLICY,
      'trigger': TokenType.TRIGGER,
      'algorithm': TokenType.ALGORITHM,
      'target_pause': TokenType.TARGET_PAUSE,
      'ENCODED_ID': TokenType.ENCODED_ID,
      'count': TokenType.COUNT,
      'pattern': TokenType.PATTERN,
      'pool': TokenType.POOL,
      'cache': TokenType.CACHE,
      'buffer': TokenType.BUFFER,
      'FIBONACCI_ALLOCATION': TokenType.FIBONACCI_ALLOCATION,
      'BUDDY_SYSTEM': TokenType.BUDDY_SYSTEM,
      'SLAB_ALLOCATOR': TokenType.SLAB_ALLOCATOR,
      'PHI_WEIGHTED': TokenType.PHI_WEIGHTED,
      'READ_ONLY': TokenType.READ_ONLY,
      'WRITE_ONLY': TokenType.WRITE_ONLY,
      'READ_WRITE': TokenType.READ_WRITE,
      'EXECUTE': TokenType.EXECUTE,
      'VOLATILE': TokenType.VOLATILE,
      'PERSISTENT': TokenType.PERSISTENT,
      'CACHED': TokenType.CACHED,
      'GENERATIONAL': TokenType.GENERATIONAL,
      'MARK_SWEEP': TokenType.MARK_SWEEP,
      'REFERENCE_COUNTING': TokenType.REFERENCE_COUNTING
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

    if (char === '"' || char === "'") {
      return { ...this.readString(), line, column };
    }

    if (/\d/.test(char)) {
      return { ...this.readNumber(), line, column };
    }

    if (/[a-zA-Z_]/.test(char)) {
      return { ...this.readIdentifier(), line, column };
    }

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
      case '.':
        if (this.peek() === '.') {
          this.advance();
          return { type: TokenType.DOTDOT, line, column };
        }
        return { type: TokenType.IDENTIFIER, value: '.', line, column };
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
 * MTL Parser
 */
class MTLParser {
  constructor(input) {
    this.lexer = new MTLLexer(input);
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
    const memorySpaces = [];
    
    while (this.peek().type !== TokenType.EOF) {
      if (this.peek().type === TokenType.MEMORY_SPACE) {
        memorySpaces.push(this.parseMemorySpace());
      } else {
        this.advance();
      }
    }
    
    return {
      type: 'MTLProgram',
      memorySpaces,
      metadata: {
        phi: PHI,
        phiInverse: PHI_INVERSE,
        encodedIdentity: 'MTL.MEMORY.TEST'
      }
    };
  }

  parseMemorySpace() {
    this.expect(TokenType.MEMORY_SPACE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let encodedId = null;
    if (this.peek().type === TokenType.LBRACKET) {
      encodedId = this.parseEncodedId();
    }
    
    this.expect(TokenType.LBRACE);
    
    const space = {
      type: 'MemorySpace',
      name,
      encodedId,
      capacity: null,
      alignment: 8,
      strategy: 'FIBONACCI_ALLOCATION',
      regions: [],
      tests: [],
      gcPolicy: null,
      pools: [],
      caches: [],
      buffers: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.CAPACITY:
          this.advance();
          this.expect(TokenType.COLON);
          space.capacity = this.parseSize();
          break;
        case TokenType.ALIGNMENT:
          this.advance();
          this.expect(TokenType.COLON);
          space.alignment = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.STRATEGY:
          this.advance();
          this.expect(TokenType.COLON);
          space.strategy = this.advance().value;
          break;
        case TokenType.REGION:
          space.regions.push(this.parseRegion());
          break;
        case TokenType.TEST:
          space.tests.push(this.parseTest());
          break;
        case TokenType.GC_POLICY:
          space.gcPolicy = this.parseGCPolicy();
          break;
        case TokenType.POOL:
          space.pools.push(this.parsePool());
          break;
        case TokenType.CACHE:
          space.caches.push(this.parseCache());
          break;
        case TokenType.BUFFER:
          space.buffers.push(this.parseBuffer());
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return space;
  }

  parseEncodedId() {
    this.expect(TokenType.LBRACKET);
    this.expect(TokenType.ENCODED_ID);
    this.expect(TokenType.COLON);
    // ID can have hyphens, so collect until RBRACKET
    let id = '';
    while (this.peek().type !== TokenType.RBRACKET && this.peek().type !== TokenType.EOF) {
      const token = this.advance();
      id += token.value !== undefined ? token.value : '';
    }
    this.expect(TokenType.RBRACKET);
    return id.trim();
  }

  parseSize() {
    const token = this.advance();
    if (token.type === TokenType.SIZE_LITERAL) {
      return { value: token.value, unit: token.unit };
    }
    return { value: token.value, unit: 'B' };
  }

  parseRegion() {
    this.expect(TokenType.REGION);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const region = {
      type: 'Region',
      name,
      size: null,
      access: 'READ_WRITE',
      persistence: 'VOLATILE'
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.SIZE:
          this.advance();
          this.expect(TokenType.COLON);
          region.size = this.parseSize();
          break;
        case TokenType.ACCESS:
          this.advance();
          this.expect(TokenType.COLON);
          region.access = this.advance().value;
          break;
        case TokenType.PERSISTENCE:
          this.advance();
          this.expect(TokenType.COLON);
          region.persistence = this.advance().value;
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return region;
  }

  parseTest() {
    this.expect(TokenType.TEST);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const test = {
      type: 'MemoryTest',
      name,
      allocate: null,
      deallocate: null,
      measure: [],
      assertions: {}
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.ALLOCATE:
          this.advance();
          this.expect(TokenType.COLON);
          test.allocate = this.parseAllocation();
          break;
        case TokenType.DEALLOCATE:
          this.advance();
          this.expect(TokenType.COLON);
          test.deallocate = this.parseDeallocation();
          break;
        case TokenType.MEASURE:
          this.advance();
          this.expect(TokenType.COLON);
          test.measure = this.parseIdentifierArray();
          break;
        case TokenType.ASSERT:
          this.advance();
          this.expect(TokenType.COLON);
          test.assertions = this.parseAssertions();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return test;
  }

  parseAllocation() {
    this.expect(TokenType.LBRACE);
    const allocation = { count: 1, size: null, pattern: 'sequential' };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      if (token.type === TokenType.COUNT || token.value === 'count') {
        this.advance();
        this.expect(TokenType.COLON);
        allocation.count = this.expect(TokenType.NUMBER).value;
      } else if (token.type === TokenType.SIZE || token.value === 'size') {
        this.advance();
        this.expect(TokenType.COLON);
        allocation.size = this.parseSizeRange();
      } else if (token.type === TokenType.PATTERN || token.value === 'pattern') {
        this.advance();
        this.expect(TokenType.COLON);
        allocation.pattern = this.advance().value;
      } else {
        this.advance();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return allocation;
  }

  parseDeallocation() {
    this.expect(TokenType.LBRACE);
    const deallocation = { pattern: 'fifo', count: 'all' };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      deallocation[key] = this.advance().value;
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return deallocation;
  }

  parseSizeRange() {
    const first = this.parseSize();
    
    if (this.peek().type === TokenType.DOTDOT) {
      this.advance();
      const second = this.parseSize();
      return { type: 'range', min: first, max: second };
    }
    
    return first;
  }

  parseIdentifierArray() {
    const items = [];
    this.expect(TokenType.LBRACKET);
    
    while (this.peek().type !== TokenType.RBRACKET) {
      items.push(this.advance().value);
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACKET);
    return items;
  }

  parseAssertions() {
    const assertions = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      assertions[key] = this.parseComparison();
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return assertions;
  }

  parseComparison() {
    const op = this.advance().type;
    const token = this.advance();
    
    return {
      operator: op,
      value: token.value,
      unit: token.unit || null
    };
  }

  parseGCPolicy() {
    this.expect(TokenType.GC_POLICY);
    this.expect(TokenType.LBRACE);
    
    const policy = {
      type: 'GCPolicy',
      trigger: null,
      algorithm: 'GENERATIONAL',
      targetPause: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.TRIGGER:
          this.advance();
          this.expect(TokenType.COLON);
          policy.trigger = this.parseTriggerCondition();
          break;
        case TokenType.ALGORITHM:
          this.advance();
          this.expect(TokenType.COLON);
          policy.algorithm = this.advance().value;
          break;
        case TokenType.TARGET_PAUSE:
          this.advance();
          this.expect(TokenType.COLON);
          policy.targetPause = this.parseComparison();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return policy;
  }

  parseTriggerCondition() {
    const metric = this.advance().value;
    const op = this.advance().type;
    const token = this.advance();
    
    return {
      metric,
      operator: op,
      value: token.value,
      unit: token.unit || null
    };
  }

  parsePool() {
    this.expect(TokenType.POOL);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const pool = { type: 'Pool', name, blockSize: null, blockCount: null };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'block_size') {
        pool.blockSize = this.parseSize();
      } else if (key === 'block_count') {
        pool.blockCount = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return pool;
  }

  parseCache() {
    this.expect(TokenType.CACHE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const cache = { type: 'Cache', name, size: null, lineSize: null, associativity: null };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'size') {
        cache.size = this.parseSize();
      } else if (key === 'line_size') {
        cache.lineSize = this.parseSize();
      } else if (key === 'associativity') {
        cache.associativity = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return cache;
  }

  parseBuffer() {
    this.expect(TokenType.BUFFER);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const buffer = { type: 'Buffer', name, size: null, type: 'ring' };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'size') {
        buffer.size = this.parseSize();
      } else if (key === 'type') {
        buffer.bufferType = this.advance().value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return buffer;
  }
}

/**
 * Parse MTL source code
 */
function parse(source) {
  const parser = new MTLParser(source);
  return parser.parse();
}

export { parse, MTLParser, MTLLexer, TokenType };
export default { parse, MTLParser, MTLLexer, TokenType };
