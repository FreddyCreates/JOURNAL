/**
 * GML Parser - Greek Mathematics Language
 * 
 * ENCODED IDENTITY: GML.GREEK.MATH
 * 
 * A domain-specific language for Greek mathematical constants,
 * phi-based calculations, and harmonic balancing operations.
 * 
 * Features:
 * - All major Greek mathematical constants
 * - Phi-based golden ratio calculations
 * - Harmonic series and balancing
 * - Geometric proportions
 * - Number theory operations
 */

// ═══════════════════════════════════════════════════════════════════════════
// GREEK MATHEMATICAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

// Golden Ratio Family
const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_SQUARED = PHI * PHI;           // 2.618033988749895
const PHI_CUBED = PHI * PHI * PHI;       // 4.236067977499789
const PHI_COMPLEMENT = 1 - PHI_INVERSE;   // 0.381966011250105

// Fundamental Constants
const PI = 3.141592653589793;
const E = 2.718281828459045;
const SQRT_2 = 1.4142135623730951;
const SQRT_3 = 1.7320508075688772;
const SQRT_5 = 2.23606797749979;

// Greek Letter Constants
const ALPHA = 1;                          // First
const BETA = 2;                           // Second
const GAMMA = 0.5772156649015329;         // Euler-Mascheroni
const DELTA = 4.6692016091029906;         // Feigenbaum
const EPSILON = 0.001;                    // Small quantity
const ZETA = 1.2020569031595942;          // Apéry's (ζ(3))
const ETA = 0.5963473623231940;           // Dirichlet eta function
const THETA = PI / 4;                     // 45 degrees
const IOTA = 1;                           // Unity
const KAPPA = 0.9159655941772190;         // Catalan's constant
const LAMBDA = 1.303577269034296;         // Conway's constant
const MU = 1;                             // Möbius function
const NU = 1.4513692348833810;            // Ramanujan-Soldner
const XI = 1.1319882487943;               // First Feigenbaum
const OMICRON = 0;                        // Placeholder
const RHO = 1.3247179572447460;           // Plastic constant
const SIGMA = 5.670374419e-8;             // Stefan-Boltzmann
const TAU = 2 * PI;                       // Circle constant (2π)
const UPSILON = 1.2824271291006226;       // Glaisher-Kinkelin
const CHI = 0.4501585830860107;           // Meissel-Mertens
const PSI = 3.359885666243178;            // Reciprocal Fibonacci
const OMEGA = 0.5671432904097838;         // Omega constant

// Sacred Geometry Constants
const VESICA_PISCIS = SQRT_3;
const FLOWER_OF_LIFE = 6;
const SEED_OF_LIFE = 7;
const TREE_OF_LIFE = 10;
const METATRONS_CUBE = 13;
const PLATONIC_SOLIDS = 5;

// ═══════════════════════════════════════════════════════════════════════════
// FIBONACCI AND LUCAS SEQUENCES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Fibonacci sequence up to n terms
 */
function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  if (n === 2) return [0, 1];
  
  const seq = [0, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

/**
 * Get nth Fibonacci number using Binet's formula
 */
function fibonacciN(n) {
  return Math.round((Math.pow(PHI, n) - Math.pow(-PHI_INVERSE, n)) / SQRT_5);
}

/**
 * Generate Lucas sequence up to n terms
 */
function lucas(n) {
  if (n <= 0) return [];
  if (n === 1) return [2];
  if (n === 2) return [2, 1];
  
  const seq = [2, 1];
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2]);
  }
  return seq;
}

/**
 * Get nth Lucas number
 */
function lucasN(n) {
  return Math.round(Math.pow(PHI, n) + Math.pow(-PHI_INVERSE, n));
}

// ═══════════════════════════════════════════════════════════════════════════
// PHI-BASED BALANCING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Balance two values using golden ratio
 */
function phiBalance(a, b) {
  const total = a + b;
  return {
    major: total * PHI_INVERSE,
    minor: total * (1 - PHI_INVERSE),
    ratio: a / b,
    isGolden: Math.abs((a / b) - PHI) < EPSILON || Math.abs((b / a) - PHI) < EPSILON
  };
}

/**
 * Calculate golden spiral radius at angle theta
 */
function goldenSpiralRadius(theta, a = 1) {
  return a * Math.exp(theta * Math.log(PHI) / (PI / 2));
}

/**
 * Generate golden angle sequence (137.5077... degrees)
 */
function goldenAngleSequence(n) {
  const GOLDEN_ANGLE = PI * (3 - SQRT_5); // ~137.5° in radians
  const angles = [];
  for (let i = 0; i < n; i++) {
    angles.push((i * GOLDEN_ANGLE) % TAU);
  }
  return angles;
}

/**
 * Phi-weighted average
 */
function phiWeightedAverage(values) {
  if (values.length === 0) return 0;
  
  let weightSum = 0;
  let valueSum = 0;
  
  for (let i = 0; i < values.length; i++) {
    const weight = Math.pow(PHI_INVERSE, i);
    valueSum += values[i] * weight;
    weightSum += weight;
  }
  
  return valueSum / weightSum;
}

// ═══════════════════════════════════════════════════════════════════════════
// HARMONIC SERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate harmonic number H_n
 */
function harmonicNumber(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += 1 / i;
  }
  return sum;
}

/**
 * Calculate generalized harmonic number H_n,m
 */
function generalizedHarmonic(n, m) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += 1 / Math.pow(i, m);
  }
  return sum;
}

/**
 * Calculate Basel sum (ζ(2) = π²/6)
 */
function baselSum(n) {
  return generalizedHarmonic(n, 2);
}

/**
 * Calculate alternating harmonic series
 */
function alternatingHarmonic(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += Math.pow(-1, i + 1) / i;
  }
  return sum;
}

// ═══════════════════════════════════════════════════════════════════════════
// GEOMETRIC PROPORTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate golden rectangle dimensions
 */
function goldenRectangle(width) {
  return {
    width,
    height: width / PHI,
    area: width * (width / PHI),
    perimeter: 2 * (width + width / PHI)
  };
}

/**
 * Calculate Kepler triangle (sides 1, √φ, φ)
 */
function keplerTriangle(base = 1) {
  return {
    a: base,
    b: base * Math.sqrt(PHI),
    c: base * PHI,
    area: (base * base * Math.sqrt(PHI)) / 2
  };
}

/**
 * Calculate golden gnomon angles
 */
function goldenGnomon() {
  return {
    apex: 36,        // degrees
    base1: 72,       // degrees
    base2: 72,       // degrees
    ratio: PHI
  };
}

/**
 * Calculate golden triangle angles
 */
function goldenTriangle() {
  return {
    apex: 36,        // degrees
    base1: 72,       // degrees
    base2: 72,       // degrees
    ratio: PHI
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// NUMBER THEORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if number is perfect (sum of divisors = number)
 */
function isPerfect(n) {
  let sum = 0;
  for (let i = 1; i < n; i++) {
    if (n % i === 0) sum += i;
  }
  return sum === n;
}

/**
 * Get first n perfect numbers
 */
function perfectNumbers(n) {
  const result = [];
  let num = 2;
  while (result.length < n) {
    if (isPerfect(num)) result.push(num);
    num++;
  }
  return result;
}

/**
 * Check if number is triangular
 */
function isTriangular(n) {
  const test = (Math.sqrt(8 * n + 1) - 1) / 2;
  return test === Math.floor(test);
}

/**
 * Get nth triangular number
 */
function triangularN(n) {
  return (n * (n + 1)) / 2;
}

/**
 * Check if number is pentagonal
 */
function isPentagonal(n) {
  const test = (Math.sqrt(24 * n + 1) + 1) / 6;
  return test === Math.floor(test);
}

/**
 * Get nth pentagonal number
 */
function pentagonalN(n) {
  return (n * (3 * n - 1)) / 2;
}

/**
 * Check if number is hexagonal
 */
function isHexagonal(n) {
  const test = (Math.sqrt(8 * n + 1) + 1) / 4;
  return test === Math.floor(test);
}

/**
 * Get nth hexagonal number
 */
function hexagonalN(n) {
  return n * (2 * n - 1);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKENIZER AND PARSER
// ═══════════════════════════════════════════════════════════════════════════

const TokenType = {
  // Keywords
  CONSTANT: 'CONSTANT',
  SEQUENCE: 'SEQUENCE',
  BALANCE: 'BALANCE',
  HARMONIC: 'HARMONIC',
  GEOMETRIC: 'GEOMETRIC',
  NUMBER_THEORY: 'NUMBER_THEORY',
  CALCULATE: 'CALCULATE',
  ENCODED_ID: 'ENCODED_ID',
  
  // Constants
  PHI: 'PHI',
  PI: 'PI',
  E: 'E',
  TAU: 'TAU',
  GAMMA: 'GAMMA',
  
  // Functions
  FIBONACCI: 'FIBONACCI',
  LUCAS: 'LUCAS',
  GOLDEN: 'GOLDEN',
  SPIRAL: 'SPIRAL',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  
  // Operators
  COLON: 'COLON',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  POWER: 'POWER',
  
  EOF: 'EOF'
};

class GMLLexer {
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
    return false;
  }

  readNumber() {
    let value = '';
    while (/[\d.]/.test(this.peek())) {
      value += this.advance();
    }
    return { type: TokenType.NUMBER, value: parseFloat(value) };
  }

  readIdentifier() {
    let value = '';
    while (/[a-zA-Z0-9_]/.test(this.peek())) {
      value += this.advance();
    }
    
    const keywords = {
      'constant': TokenType.CONSTANT,
      'sequence': TokenType.SEQUENCE,
      'balance': TokenType.BALANCE,
      'harmonic': TokenType.HARMONIC,
      'geometric': TokenType.GEOMETRIC,
      'number_theory': TokenType.NUMBER_THEORY,
      'calculate': TokenType.CALCULATE,
      'ENCODED_ID': TokenType.ENCODED_ID,
      'phi': TokenType.PHI,
      'pi': TokenType.PI,
      'e': TokenType.E,
      'tau': TokenType.TAU,
      'gamma': TokenType.GAMMA,
      'fibonacci': TokenType.FIBONACCI,
      'lucas': TokenType.LUCAS,
      'golden': TokenType.GOLDEN,
      'spiral': TokenType.SPIRAL
    };
    
    return { type: keywords[value] || TokenType.IDENTIFIER, value };
  }

  readString() {
    const quote = this.advance();
    let value = '';
    while (this.peek() && this.peek() !== quote) {
      value += this.advance();
    }
    this.advance();
    return { type: TokenType.STRING, value };
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

    if (/\d/.test(char)) {
      return { ...this.readNumber(), line, column };
    }

    if (/[a-zA-Z_]/.test(char)) {
      return { ...this.readIdentifier(), line, column };
    }

    if (char === '"' || char === "'") {
      return { ...this.readString(), line, column };
    }

    this.advance();
    const operators = {
      ':': TokenType.COLON,
      '{': TokenType.LBRACE,
      '}': TokenType.RBRACE,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      ',': TokenType.COMMA,
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '^': TokenType.POWER
    };

    return { type: operators[char] || TokenType.IDENTIFIER, value: char, line, column };
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

class GMLParser {
  constructor(input) {
    this.lexer = new GMLLexer(input);
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
      throw new Error(`Expected ${type} but got ${token.type}`);
    }
    return token;
  }

  parse() {
    const definitions = [];
    
    while (this.peek().type !== TokenType.EOF) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.CONSTANT:
          definitions.push(this.parseConstant());
          break;
        case TokenType.SEQUENCE:
          definitions.push(this.parseSequence());
          break;
        case TokenType.BALANCE:
          definitions.push(this.parseBalance());
          break;
        case TokenType.HARMONIC:
          definitions.push(this.parseHarmonic());
          break;
        case TokenType.GEOMETRIC:
          definitions.push(this.parseGeometric());
          break;
        case TokenType.CALCULATE:
          definitions.push(this.parseCalculation());
          break;
        default:
          this.advance();
      }
    }
    
    return {
      type: 'GMLProgram',
      definitions,
      metadata: {
        phi: PHI,
        phiInverse: PHI_INVERSE,
        encodedIdentity: 'GML.GREEK.MATH'
      }
    };
  }

  parseConstant() {
    this.expect(TokenType.CONSTANT);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let encodedId = null;
    if (this.peek().type === TokenType.LBRACKET) {
      encodedId = this.parseEncodedId();
    }
    
    this.expect(TokenType.LBRACE);
    
    const constant = {
      type: 'Constant',
      name,
      encodedId,
      value: null,
      description: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'value') {
        constant.value = this.parseExpression();
      } else if (key === 'description') {
        constant.description = this.expect(TokenType.STRING).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return constant;
  }

  parseSequence() {
    this.expect(TokenType.SEQUENCE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const sequence = {
      type: 'Sequence',
      name,
      generator: null,
      count: 10
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'generator') {
        sequence.generator = this.advance().value;
      } else if (key === 'count') {
        sequence.count = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return sequence;
  }

  parseBalance() {
    this.expect(TokenType.BALANCE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const balance = {
      type: 'Balance',
      name,
      values: [],
      method: 'phi'
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'values') {
        balance.values = this.parseArray();
      } else if (key === 'method') {
        balance.method = this.advance().value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return balance;
  }

  parseHarmonic() {
    this.expect(TokenType.HARMONIC);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const harmonic = {
      type: 'Harmonic',
      name,
      terms: 100,
      order: 1
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'terms') {
        harmonic.terms = this.expect(TokenType.NUMBER).value;
      } else if (key === 'order') {
        harmonic.order = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return harmonic;
  }

  parseGeometric() {
    this.expect(TokenType.GEOMETRIC);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const geometric = {
      type: 'Geometric',
      name,
      shape: 'rectangle',
      dimension: 1
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'shape') {
        geometric.shape = this.advance().value;
      } else if (key === 'dimension') {
        geometric.dimension = this.expect(TokenType.NUMBER).value;
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return geometric;
  }

  parseCalculation() {
    this.expect(TokenType.CALCULATE);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const calculation = {
      type: 'Calculation',
      name,
      expression: null,
      inputs: []
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      
      if (key === 'expression') {
        calculation.expression = this.parseExpression();
      } else if (key === 'inputs') {
        calculation.inputs = this.parseArray();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return calculation;
  }

  parseEncodedId() {
    this.expect(TokenType.LBRACKET);
    this.expect(TokenType.ENCODED_ID);
    this.expect(TokenType.COLON);
    let id = '';
    while (this.peek().type !== TokenType.RBRACKET && this.peek().type !== TokenType.EOF) {
      id += this.advance().value;
    }
    this.expect(TokenType.RBRACKET);
    return id.trim();
  }

  parseExpression() {
    const token = this.peek();
    
    if (token.type === TokenType.NUMBER) {
      return this.advance().value;
    }
    
    if (token.type === TokenType.PHI) {
      this.advance();
      return PHI;
    }
    
    if (token.type === TokenType.PI) {
      this.advance();
      return PI;
    }
    
    if (token.type === TokenType.E) {
      this.advance();
      return E;
    }
    
    if (token.type === TokenType.TAU) {
      this.advance();
      return TAU;
    }
    
    if (token.type === TokenType.GAMMA) {
      this.advance();
      return GAMMA;
    }
    
    return this.advance().value;
  }

  parseArray() {
    const items = [];
    this.expect(TokenType.LBRACKET);
    
    while (this.peek().type !== TokenType.RBRACKET) {
      items.push(this.parseExpression());
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACKET);
    return items;
  }
}

/**
 * Parse GML source code
 */
function parse(source) {
  const parser = new GMLParser(source);
  return parser.parse();
}

export {
  // Constants
  PHI, PHI_INVERSE, PHI_SQUARED, PHI_CUBED, PHI_COMPLEMENT,
  PI, E, SQRT_2, SQRT_3, SQRT_5,
  ALPHA, BETA, GAMMA, DELTA, EPSILON, ZETA, ETA, THETA,
  IOTA, KAPPA, LAMBDA, MU, NU, XI, OMICRON, RHO,
  SIGMA, TAU, UPSILON, CHI, PSI, OMEGA,
  VESICA_PISCIS, FLOWER_OF_LIFE, SEED_OF_LIFE, TREE_OF_LIFE,
  METATRONS_CUBE, PLATONIC_SOLIDS,
  
  // Functions
  fibonacci, fibonacciN, lucas, lucasN,
  phiBalance, goldenSpiralRadius, goldenAngleSequence, phiWeightedAverage,
  harmonicNumber, generalizedHarmonic, baselSum, alternatingHarmonic,
  goldenRectangle, keplerTriangle, goldenGnomon, goldenTriangle,
  isPerfect, perfectNumbers, isTriangular, triangularN,
  isPentagonal, pentagonalN, isHexagonal, hexagonalN,
  
  // Parser
  parse, GMLParser, GMLLexer, TokenType
};

export default {
  PHI, PHI_INVERSE, PHI_SQUARED, PHI_CUBED, PHI_COMPLEMENT,
  PI, E, SQRT_2, SQRT_3, SQRT_5, TAU, GAMMA,
  fibonacci, fibonacciN, lucas, lucasN,
  phiBalance, goldenSpiralRadius, goldenAngleSequence, phiWeightedAverage,
  harmonicNumber, generalizedHarmonic, baselSum, alternatingHarmonic,
  goldenRectangle, keplerTriangle, goldenGnomon, goldenTriangle,
  isPerfect, perfectNumbers, isTriangular, triangularN,
  isPentagonal, pentagonalN, isHexagonal, hexagonalN,
  parse, GMLParser, GMLLexer, TokenType
};
