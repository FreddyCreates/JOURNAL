/**
 * WTL Parser - Workflow Testing Language
 * 
 * ENCODED IDENTITY: WTL.WORKFLOW.TEST
 * 
 * A domain-specific language for defining workflow tests,
 * state machine validation, and process flow assertions.
 * 
 * Syntax Example:
 * ```
 * workflow ORDER_FULFILLMENT [ENCODED_ID: WFL-001] {
 *   initial_state: PENDING
 *   phi_weight: 1.618
 *   
 *   state PENDING {
 *     on PAYMENT_RECEIVED -> PROCESSING
 *     on CANCEL -> CANCELLED
 *     timeout: 24h -> EXPIRED
 *   }
 *   
 *   state PROCESSING {
 *     on ITEM_SHIPPED -> SHIPPED
 *     on OUT_OF_STOCK -> BACKORDERED
 *     invariant: inventory_available == true
 *   }
 *   
 *   test happy_path {
 *     scenario: [PENDING -> PROCESSING -> SHIPPED -> DELIVERED]
 *     assert: { total_time: <= 7d, state_count: == 4 }
 *   }
 *   
 *   test failure_recovery {
 *     inject_fault: { at_state: PROCESSING, fault: NETWORK_ERROR }
 *     expect_recovery: { max_retries: 3, final_state: SHIPPED }
 *   }
 * }
 * ```
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * Token types for WTL
 */
const TokenType = {
  // Keywords
  WORKFLOW: 'WORKFLOW',
  INITIAL_STATE: 'INITIAL_STATE',
  PHI_WEIGHT: 'PHI_WEIGHT',
  STATE: 'STATE',
  ON: 'ON',
  TIMEOUT: 'TIMEOUT',
  INVARIANT: 'INVARIANT',
  GUARD: 'GUARD',
  ACTION: 'ACTION',
  TEST: 'TEST',
  SCENARIO: 'SCENARIO',
  ASSERT: 'ASSERT',
  INJECT_FAULT: 'INJECT_FAULT',
  EXPECT_RECOVERY: 'EXPECT_RECOVERY',
  AT_STATE: 'AT_STATE',
  FAULT: 'FAULT',
  MAX_RETRIES: 'MAX_RETRIES',
  FINAL_STATE: 'FINAL_STATE',
  ENCODED_ID: 'ENCODED_ID',
  PARALLEL: 'PARALLEL',
  FORK: 'FORK',
  JOIN: 'JOIN',
  SUBPROCESS: 'SUBPROCESS',
  COMPENSATE: 'COMPENSATE',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  DURATION: 'DURATION',
  BOOLEAN: 'BOOLEAN',
  
  // Operators
  ARROW: 'ARROW',
  COLON: 'COLON',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  EQ: 'EQ',
  NEQ: 'NEQ',
  GTE: 'GTE',
  LTE: 'LTE',
  GT: 'GT',
  LT: 'LT',
  AND: 'AND',
  OR: 'OR',
  
  // Special
  EOF: 'EOF'
};

/**
 * WTL Lexer
 */
class WTLLexer {
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
    if (this.peek() === '#') {
      while (this.peek() && this.peek() !== '\n') {
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
    
    // Check for duration suffix
    const durationMatch = this.input.slice(this.pos).match(/^([smhd])/);
    if (durationMatch) {
      const unit = this.advance();
      return { type: TokenType.DURATION, value: parseFloat(value), unit };
    }
    
    return { type: TokenType.NUMBER, value: parseFloat(value) };
  }

  readIdentifier() {
    let value = '';
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }
    
    const keywords = {
      'workflow': TokenType.WORKFLOW,
      'initial_state': TokenType.INITIAL_STATE,
      'phi_weight': TokenType.PHI_WEIGHT,
      'state': TokenType.STATE,
      'on': TokenType.ON,
      'timeout': TokenType.TIMEOUT,
      'invariant': TokenType.INVARIANT,
      'guard': TokenType.GUARD,
      'action': TokenType.ACTION,
      'test': TokenType.TEST,
      'scenario': TokenType.SCENARIO,
      'assert': TokenType.ASSERT,
      'inject_fault': TokenType.INJECT_FAULT,
      'expect_recovery': TokenType.EXPECT_RECOVERY,
      'at_state': TokenType.AT_STATE,
      'fault': TokenType.FAULT,
      'max_retries': TokenType.MAX_RETRIES,
      'final_state': TokenType.FINAL_STATE,
      'ENCODED_ID': TokenType.ENCODED_ID,
      'parallel': TokenType.PARALLEL,
      'fork': TokenType.FORK,
      'join': TokenType.JOIN,
      'subprocess': TokenType.SUBPROCESS,
      'compensate': TokenType.COMPENSATE,
      'true': TokenType.BOOLEAN,
      'false': TokenType.BOOLEAN,
      'and': TokenType.AND,
      'or': TokenType.OR
    };
    
    if (keywords[value]) {
      return { type: keywords[value], value };
    }
    
    return { type: TokenType.IDENTIFIER, value };
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
      case '-':
        if (this.peek() === '>') {
          this.advance();
          return { type: TokenType.ARROW, line, column };
        }
        return { type: TokenType.IDENTIFIER, value: '-', line, column };
      case '=':
        if (this.peek() === '=') {
          this.advance();
          return { type: TokenType.EQ, line, column };
        }
        return { type: TokenType.EQ, line, column };
      case '!':
        if (this.peek() === '=') {
          this.advance();
          return { type: TokenType.NEQ, line, column };
        }
        return { type: TokenType.IDENTIFIER, value: '!', line, column };
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
      case '&':
        if (this.peek() === '&') {
          this.advance();
          return { type: TokenType.AND, line, column };
        }
        return { type: TokenType.IDENTIFIER, value: '&', line, column };
      case '|':
        if (this.peek() === '|') {
          this.advance();
          return { type: TokenType.OR, line, column };
        }
        return { type: TokenType.IDENTIFIER, value: '|', line, column };
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
 * WTL Parser
 */
class WTLParser {
  constructor(input) {
    this.lexer = new WTLLexer(input);
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
    const workflows = [];
    
    while (this.peek().type !== TokenType.EOF) {
      if (this.peek().type === TokenType.WORKFLOW) {
        workflows.push(this.parseWorkflow());
      } else {
        this.advance();
      }
    }
    
    return {
      type: 'WTLProgram',
      workflows,
      metadata: {
        phi: PHI,
        phiInverse: PHI_INVERSE,
        encodedIdentity: 'WTL.WORKFLOW.TEST'
      }
    };
  }

  parseWorkflow() {
    this.expect(TokenType.WORKFLOW);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let encodedId = null;
    if (this.peek().type === TokenType.LBRACKET) {
      encodedId = this.parseEncodedId();
    }
    
    this.expect(TokenType.LBRACE);
    
    const workflow = {
      type: 'Workflow',
      name,
      encodedId,
      initialState: null,
      phiWeight: PHI,
      states: [],
      tests: [],
      subprocesses: [],
      parallelBranches: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.INITIAL_STATE:
          this.advance();
          this.expect(TokenType.COLON);
          workflow.initialState = this.expect(TokenType.IDENTIFIER).value;
          break;
        case TokenType.PHI_WEIGHT:
          this.advance();
          this.expect(TokenType.COLON);
          workflow.phiWeight = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.STATE:
          workflow.states.push(this.parseState());
          break;
        case TokenType.TEST:
          workflow.tests.push(this.parseTest());
          break;
        case TokenType.SUBPROCESS:
          workflow.subprocesses.push(this.parseSubprocess());
          break;
        case TokenType.PARALLEL:
          workflow.parallelBranches.push(this.parseParallel());
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return workflow;
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

  parseState() {
    this.expect(TokenType.STATE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const state = {
      type: 'State',
      name,
      transitions: [],
      timeout: null,
      invariants: [],
      guards: [],
      actions: [],
      compensation: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.ON:
          state.transitions.push(this.parseTransition());
          break;
        case TokenType.TIMEOUT:
          state.timeout = this.parseTimeout();
          break;
        case TokenType.INVARIANT:
          this.advance();
          this.expect(TokenType.COLON);
          state.invariants.push(this.parseCondition());
          break;
        case TokenType.GUARD:
          this.advance();
          this.expect(TokenType.COLON);
          state.guards.push(this.parseCondition());
          break;
        case TokenType.ACTION:
          this.advance();
          this.expect(TokenType.COLON);
          state.actions.push(this.advance().value);
          break;
        case TokenType.COMPENSATE:
          this.advance();
          this.expect(TokenType.COLON);
          state.compensation = this.advance().value;
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return state;
  }

  parseTransition() {
    this.expect(TokenType.ON);
    const event = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.ARROW);
    const target = this.expect(TokenType.IDENTIFIER).value;
    
    return {
      type: 'Transition',
      event,
      target
    };
  }

  parseTimeout() {
    this.expect(TokenType.TIMEOUT);
    this.expect(TokenType.COLON);
    const duration = this.advance();
    this.expect(TokenType.ARROW);
    const target = this.expect(TokenType.IDENTIFIER).value;
    
    return {
      type: 'Timeout',
      duration: { value: duration.value, unit: duration.unit },
      target
    };
  }

  parseCondition() {
    const left = this.advance().value;
    const op = this.advance().type;
    const right = this.advance();
    
    return {
      left,
      operator: op,
      right: right.type === TokenType.BOOLEAN ? right.value === 'true' : right.value
    };
  }

  parseTest() {
    this.expect(TokenType.TEST);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const test = {
      type: 'WorkflowTest',
      name,
      scenario: null,
      assertions: {},
      faultInjection: null,
      expectedRecovery: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.SCENARIO:
          this.advance();
          this.expect(TokenType.COLON);
          test.scenario = this.parseScenario();
          break;
        case TokenType.ASSERT:
          this.advance();
          this.expect(TokenType.COLON);
          test.assertions = this.parseAssertions();
          break;
        case TokenType.INJECT_FAULT:
          this.advance();
          this.expect(TokenType.COLON);
          test.faultInjection = this.parseFaultInjection();
          break;
        case TokenType.EXPECT_RECOVERY:
          this.advance();
          this.expect(TokenType.COLON);
          test.expectedRecovery = this.parseExpectedRecovery();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return test;
  }

  parseScenario() {
    const states = [];
    this.expect(TokenType.LBRACKET);
    
    while (this.peek().type !== TokenType.RBRACKET) {
      states.push(this.advance().value);
      if (this.peek().type === TokenType.ARROW) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACKET);
    return states;
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

  parseFaultInjection() {
    const injection = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      if (token.type === TokenType.AT_STATE) {
        this.advance();
        this.expect(TokenType.COLON);
        injection.atState = this.advance().value;
      } else if (token.type === TokenType.FAULT) {
        this.advance();
        this.expect(TokenType.COLON);
        injection.fault = this.advance().value;
      } else {
        this.advance();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return injection;
  }

  parseExpectedRecovery() {
    const recovery = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      if (token.type === TokenType.MAX_RETRIES) {
        this.advance();
        this.expect(TokenType.COLON);
        recovery.maxRetries = this.expect(TokenType.NUMBER).value;
      } else if (token.type === TokenType.FINAL_STATE) {
        this.advance();
        this.expect(TokenType.COLON);
        recovery.finalState = this.advance().value;
      } else {
        this.advance();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return recovery;
  }

  parseSubprocess() {
    this.expect(TokenType.SUBPROCESS);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const subprocess = {
      type: 'Subprocess',
      name,
      states: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      if (this.peek().type === TokenType.STATE) {
        subprocess.states.push(this.parseState());
      } else {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return subprocess;
  }

  parseParallel() {
    this.expect(TokenType.PARALLEL);
    this.expect(TokenType.LBRACE);
    
    const parallel = {
      type: 'Parallel',
      branches: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      if (this.peek().type === TokenType.FORK) {
        parallel.branches.push(this.parseFork());
      } else {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return parallel;
  }

  parseFork() {
    this.expect(TokenType.FORK);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const fork = {
      type: 'Fork',
      name,
      states: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      fork.states.push(this.advance().value);
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return fork;
  }
}

/**
 * Parse WTL source code
 */
function parse(source) {
  const parser = new WTLParser(source);
  return parser.parse();
}

export { parse, WTLParser, WTLLexer, TokenType };
export default { parse, WTLParser, WTLLexer, TokenType };
