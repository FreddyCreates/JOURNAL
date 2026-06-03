/**
 * ATL Parser - Autonomous Testing Language
 * 
 * ENCODED IDENTITY: ATL.AUTONOMOUS.TEST
 * 
 * A domain-specific language for defining self-running tests,
 * continuous validation, and autonomous quality assurance.
 * 
 * Syntax Example:
 * ```
 * autonomous_suite SYSTEM_HEALTH [ENCODED_ID: ATL-001] {
 *   schedule: every 5m
 *   phi_threshold: 0.618
 *   
 *   probe health_check {
 *     target: /api/health
 *     method: GET
 *     expect: { status: 200, latency: <= 100ms }
 *     on_failure: { alert: "ops-channel", severity: HIGH }
 *   }
 *   
 *   continuous database_integrity {
 *     query: "SELECT count(*) FROM critical_data"
 *     expect: { result: > 0 }
 *     healing: { action: RESTART_SERVICE, max_attempts: 3 }
 *   }
 *   
 *   chaos_monkey random_failures {
 *     probability: 0.01
 *     targets: ["service-a", "service-b"]
 *     observe: { recovery_time: <= 30s }
 *   }
 * }
 * ```
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * Token types for ATL
 */
const TokenType = {
  // Keywords
  AUTONOMOUS_SUITE: 'AUTONOMOUS_SUITE',
  SCHEDULE: 'SCHEDULE',
  PHI_THRESHOLD: 'PHI_THRESHOLD',
  PROBE: 'PROBE',
  CONTINUOUS: 'CONTINUOUS',
  CHAOS_MONKEY: 'CHAOS_MONKEY',
  TARGET: 'TARGET',
  METHOD: 'METHOD',
  EXPECT: 'EXPECT',
  ON_FAILURE: 'ON_FAILURE',
  ON_SUCCESS: 'ON_SUCCESS',
  ALERT: 'ALERT',
  SEVERITY: 'SEVERITY',
  QUERY: 'QUERY',
  RESULT: 'RESULT',
  HEALING: 'HEALING',
  ACTION: 'ACTION',
  MAX_ATTEMPTS: 'MAX_ATTEMPTS',
  PROBABILITY: 'PROBABILITY',
  TARGETS: 'TARGETS',
  OBSERVE: 'OBSERVE',
  RECOVERY_TIME: 'RECOVERY_TIME',
  ENCODED_ID: 'ENCODED_ID',
  EVERY: 'EVERY',
  CRON: 'CRON',
  RETRY: 'RETRY',
  TIMEOUT: 'TIMEOUT',
  CIRCUIT_BREAKER: 'CIRCUIT_BREAKER',
  CANARY: 'CANARY',
  ROLLBACK: 'ROLLBACK',
  
  // Severity Levels
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
  
  // HTTP Methods
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  
  // Actions
  RESTART_SERVICE: 'RESTART_SERVICE',
  SCALE_UP: 'SCALE_UP',
  SCALE_DOWN: 'SCALE_DOWN',
  FAILOVER: 'FAILOVER',
  NOTIFY: 'NOTIFY',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  DURATION: 'DURATION',
  PERCENTAGE: 'PERCENTAGE',
  CRON_EXPR: 'CRON_EXPR',
  
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
  EOF: 'EOF'
};

/**
 * ATL Lexer
 */
class ATLLexer {
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
    const durationMatch = this.input.slice(this.pos).match(/^(ms|us|ns|[smhd])/);
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
    while (/[a-zA-Z0-9_\-\/]/.test(this.peek())) {
      value += this.advance();
    }
    
    const keywords = {
      'autonomous_suite': TokenType.AUTONOMOUS_SUITE,
      'schedule': TokenType.SCHEDULE,
      'phi_threshold': TokenType.PHI_THRESHOLD,
      'probe': TokenType.PROBE,
      'continuous': TokenType.CONTINUOUS,
      'chaos_monkey': TokenType.CHAOS_MONKEY,
      'target': TokenType.TARGET,
      'method': TokenType.METHOD,
      'expect': TokenType.EXPECT,
      'on_failure': TokenType.ON_FAILURE,
      'on_success': TokenType.ON_SUCCESS,
      'alert': TokenType.ALERT,
      'severity': TokenType.SEVERITY,
      'query': TokenType.QUERY,
      'result': TokenType.RESULT,
      'healing': TokenType.HEALING,
      'action': TokenType.ACTION,
      'max_attempts': TokenType.MAX_ATTEMPTS,
      'probability': TokenType.PROBABILITY,
      'targets': TokenType.TARGETS,
      'observe': TokenType.OBSERVE,
      'recovery_time': TokenType.RECOVERY_TIME,
      'ENCODED_ID': TokenType.ENCODED_ID,
      'every': TokenType.EVERY,
      'cron': TokenType.CRON,
      'retry': TokenType.RETRY,
      'timeout': TokenType.TIMEOUT,
      'circuit_breaker': TokenType.CIRCUIT_BREAKER,
      'canary': TokenType.CANARY,
      'rollback': TokenType.ROLLBACK,
      'LOW': TokenType.LOW,
      'MEDIUM': TokenType.MEDIUM,
      'HIGH': TokenType.HIGH,
      'CRITICAL': TokenType.CRITICAL,
      'GET': TokenType.GET,
      'POST': TokenType.POST,
      'PUT': TokenType.PUT,
      'DELETE': TokenType.DELETE,
      'PATCH': TokenType.PATCH,
      'RESTART_SERVICE': TokenType.RESTART_SERVICE,
      'SCALE_UP': TokenType.SCALE_UP,
      'SCALE_DOWN': TokenType.SCALE_DOWN,
      'FAILOVER': TokenType.FAILOVER,
      'NOTIFY': TokenType.NOTIFY,
      'status': TokenType.IDENTIFIER,
      'latency': TokenType.IDENTIFIER
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

    if (/[a-zA-Z_\/]/.test(char)) {
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
 * ATL Parser
 */
class ATLParser {
  constructor(input) {
    this.lexer = new ATLLexer(input);
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
    const suites = [];
    
    while (this.peek().type !== TokenType.EOF) {
      if (this.peek().type === TokenType.AUTONOMOUS_SUITE) {
        suites.push(this.parseAutonomousSuite());
      } else {
        this.advance();
      }
    }
    
    return {
      type: 'ATLProgram',
      suites,
      metadata: {
        phi: PHI,
        phiInverse: PHI_INVERSE,
        encodedIdentity: 'ATL.AUTONOMOUS.TEST'
      }
    };
  }

  parseAutonomousSuite() {
    this.expect(TokenType.AUTONOMOUS_SUITE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let encodedId = null;
    if (this.peek().type === TokenType.LBRACKET) {
      encodedId = this.parseEncodedId();
    }
    
    this.expect(TokenType.LBRACE);
    
    const suite = {
      type: 'AutonomousSuite',
      name,
      encodedId,
      schedule: null,
      phiThreshold: PHI_INVERSE,
      probes: [],
      continuous: [],
      chaosMonkeys: [],
      canaries: [],
      circuitBreakers: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.SCHEDULE:
          this.advance();
          this.expect(TokenType.COLON);
          suite.schedule = this.parseSchedule();
          break;
        case TokenType.PHI_THRESHOLD:
          this.advance();
          this.expect(TokenType.COLON);
          suite.phiThreshold = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.PROBE:
          suite.probes.push(this.parseProbe());
          break;
        case TokenType.CONTINUOUS:
          suite.continuous.push(this.parseContinuous());
          break;
        case TokenType.CHAOS_MONKEY:
          suite.chaosMonkeys.push(this.parseChaosMonkey());
          break;
        case TokenType.CANARY:
          suite.canaries.push(this.parseCanary());
          break;
        case TokenType.CIRCUIT_BREAKER:
          suite.circuitBreakers.push(this.parseCircuitBreaker());
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return suite;
  }

  parseEncodedId() {
    this.expect(TokenType.LBRACKET);
    this.expect(TokenType.ENCODED_ID);
    this.expect(TokenType.COLON);
    const id = this.advance().value;
    this.expect(TokenType.RBRACKET);
    return id;
  }

  parseSchedule() {
    if (this.peek().type === TokenType.EVERY) {
      this.advance();
      const duration = this.advance();
      return { type: 'interval', value: duration.value, unit: duration.unit };
    } else if (this.peek().type === TokenType.CRON) {
      this.advance();
      const expr = this.expect(TokenType.STRING).value;
      return { type: 'cron', expression: expr };
    }
    return null;
  }

  parseProbe() {
    this.expect(TokenType.PROBE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const probe = {
      type: 'Probe',
      name,
      target: null,
      method: 'GET',
      expect: null,
      onFailure: null,
      onSuccess: null,
      retry: null,
      timeout: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.TARGET:
          this.advance();
          this.expect(TokenType.COLON);
          probe.target = this.advance().value;
          break;
        case TokenType.METHOD:
          this.advance();
          this.expect(TokenType.COLON);
          probe.method = this.advance().value;
          break;
        case TokenType.EXPECT:
          this.advance();
          this.expect(TokenType.COLON);
          probe.expect = this.parseExpectations();
          break;
        case TokenType.ON_FAILURE:
          this.advance();
          this.expect(TokenType.COLON);
          probe.onFailure = this.parseHandler();
          break;
        case TokenType.ON_SUCCESS:
          this.advance();
          this.expect(TokenType.COLON);
          probe.onSuccess = this.parseHandler();
          break;
        case TokenType.RETRY:
          this.advance();
          this.expect(TokenType.COLON);
          probe.retry = this.parseRetry();
          break;
        case TokenType.TIMEOUT:
          this.advance();
          this.expect(TokenType.COLON);
          const t = this.advance();
          probe.timeout = { value: t.value, unit: t.unit };
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return probe;
  }

  parseExpectations() {
    const expectations = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      const token = this.peek();
      if (token.type === TokenType.GTE || token.type === TokenType.LTE ||
          token.type === TokenType.GT || token.type === TokenType.LT ||
          token.type === TokenType.EQ) {
        const op = this.advance().type;
        const val = this.advance();
        expectations[key] = { 
          operator: op, 
          value: val.value,
          unit: val.unit || null
        };
      } else {
        expectations[key] = this.advance().value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return expectations;
  }

  parseHandler() {
    const handler = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      if (token.type === TokenType.ALERT || token.value === 'alert') {
        this.advance();
        this.expect(TokenType.COLON);
        handler.alert = this.expect(TokenType.STRING).value;
      } else if (token.type === TokenType.SEVERITY || token.value === 'severity') {
        this.advance();
        this.expect(TokenType.COLON);
        handler.severity = this.advance().value;
      } else if (token.type === TokenType.ACTION || token.value === 'action') {
        this.advance();
        this.expect(TokenType.COLON);
        handler.action = this.advance().value;
      } else {
        this.advance();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return handler;
  }

  parseRetry() {
    const retry = { count: 3, delay: null };
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'count') {
        retry.count = this.expect(TokenType.NUMBER).value;
      } else if (key === 'delay') {
        const d = this.advance();
        retry.delay = { value: d.value, unit: d.unit };
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return retry;
  }

  parseContinuous() {
    this.expect(TokenType.CONTINUOUS);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const continuous = {
      type: 'Continuous',
      name,
      query: null,
      expect: null,
      healing: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.QUERY:
          this.advance();
          this.expect(TokenType.COLON);
          continuous.query = this.expect(TokenType.STRING).value;
          break;
        case TokenType.EXPECT:
          this.advance();
          this.expect(TokenType.COLON);
          continuous.expect = this.parseExpectations();
          break;
        case TokenType.HEALING:
          this.advance();
          this.expect(TokenType.COLON);
          continuous.healing = this.parseHealing();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return continuous;
  }

  parseHealing() {
    const healing = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      if (token.type === TokenType.ACTION || token.value === 'action') {
        this.advance();
        this.expect(TokenType.COLON);
        healing.action = this.advance().value;
      } else if (token.type === TokenType.MAX_ATTEMPTS || token.value === 'max_attempts') {
        this.advance();
        this.expect(TokenType.COLON);
        healing.maxAttempts = this.expect(TokenType.NUMBER).value;
      } else {
        this.advance();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return healing;
  }

  parseChaosMonkey() {
    this.expect(TokenType.CHAOS_MONKEY);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const chaosMonkey = {
      type: 'ChaosMonkey',
      name,
      probability: 0.01,
      targets: [],
      observe: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.PROBABILITY:
          this.advance();
          this.expect(TokenType.COLON);
          chaosMonkey.probability = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.TARGETS:
          this.advance();
          this.expect(TokenType.COLON);
          chaosMonkey.targets = this.parseStringArray();
          break;
        case TokenType.OBSERVE:
          this.advance();
          this.expect(TokenType.COLON);
          chaosMonkey.observe = this.parseExpectations();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return chaosMonkey;
  }

  parseStringArray() {
    const items = [];
    this.expect(TokenType.LBRACKET);
    
    while (this.peek().type !== TokenType.RBRACKET) {
      if (this.peek().type === TokenType.STRING) {
        items.push(this.advance().value);
      } else {
        items.push(this.advance().value);
      }
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACKET);
    return items;
  }

  parseCanary() {
    this.expect(TokenType.CANARY);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const canary = {
      type: 'Canary',
      name,
      baseline: null,
      comparison: null,
      threshold: PHI_INVERSE
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'baseline') {
        canary.baseline = this.advance().value;
      } else if (key === 'comparison') {
        canary.comparison = this.advance().value;
      } else if (key === 'threshold') {
        canary.threshold = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return canary;
  }

  parseCircuitBreaker() {
    this.expect(TokenType.CIRCUIT_BREAKER);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const circuitBreaker = {
      type: 'CircuitBreaker',
      name,
      failureThreshold: 5,
      resetTimeout: null,
      halfOpenRequests: 1
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'failure_threshold') {
        circuitBreaker.failureThreshold = this.expect(TokenType.NUMBER).value;
      } else if (key === 'reset_timeout') {
        const t = this.advance();
        circuitBreaker.resetTimeout = { value: t.value, unit: t.unit };
      } else if (key === 'half_open_requests') {
        circuitBreaker.halfOpenRequests = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return circuitBreaker;
  }
}

/**
 * Parse ATL source code
 */
function parse(source) {
  const parser = new ATLParser(source);
  return parser.parse();
}

export { parse, ATLParser, ATLLexer, TokenType };
export default { parse, ATLParser, ATLLexer, TokenType };
