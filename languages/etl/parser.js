/**
 * ETL Parser - Exam Testing Language
 * 
 * ENCODED IDENTITY: ETL.EXAM.TEST
 * 
 * A domain-specific language for defining examinations,
 * assessments, grading rubrics, and competency evaluations.
 * 
 * Syntax Example:
 * ```
 * examination SYSTEM_CERTIFICATION [ENCODED_ID: ETL-001] {
 *   passing_score: 0.618
 *   time_limit: 2h
 *   phi_grading: true
 *   
 *   section fundamentals {
 *     weight: 0.3
 *     
 *     question concept_understanding {
 *       type: MULTIPLE_CHOICE
 *       points: 10
 *       options: ["A", "B", "C", "D"]
 *       correct: "B"
 *       explanation: "Golden ratio properties"
 *     }
 *     
 *     question practical_application {
 *       type: CODE_EVALUATION
 *       points: 25
 *       rubric: {
 *         correctness: 50%
 *         efficiency: 30%
 *         style: 20%
 *       }
 *       timeout: 10m
 *     }
 *   }
 *   
 *   grading_curve {
 *     type: PHI_NORMALIZED
 *     adjustments: { bonus: 5%, curve_factor: 1.1 }
 *   }
 * }
 * ```
 */

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;

/**
 * Token types for ETL
 */
const TokenType = {
  // Keywords
  EXAMINATION: 'EXAMINATION',
  PASSING_SCORE: 'PASSING_SCORE',
  TIME_LIMIT: 'TIME_LIMIT',
  PHI_GRADING: 'PHI_GRADING',
  SECTION: 'SECTION',
  WEIGHT: 'WEIGHT',
  QUESTION: 'QUESTION',
  TYPE: 'TYPE',
  POINTS: 'POINTS',
  OPTIONS: 'OPTIONS',
  CORRECT: 'CORRECT',
  EXPLANATION: 'EXPLANATION',
  RUBRIC: 'RUBRIC',
  TIMEOUT: 'TIMEOUT',
  GRADING_CURVE: 'GRADING_CURVE',
  ADJUSTMENTS: 'ADJUSTMENTS',
  BONUS: 'BONUS',
  CURVE_FACTOR: 'CURVE_FACTOR',
  ENCODED_ID: 'ENCODED_ID',
  PREREQUISITE: 'PREREQUISITE',
  DIFFICULTY: 'DIFFICULTY',
  CATEGORY: 'CATEGORY',
  HINT: 'HINT',
  PARTIAL_CREDIT: 'PARTIAL_CREDIT',
  ANSWER_KEY: 'ANSWER_KEY',
  VALIDATION: 'VALIDATION',
  
  // Question Types
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER',
  ESSAY: 'ESSAY',
  CODE_EVALUATION: 'CODE_EVALUATION',
  PRACTICAL: 'PRACTICAL',
  MATCHING: 'MATCHING',
  FILL_BLANK: 'FILL_BLANK',
  
  // Grading Types
  PHI_NORMALIZED: 'PHI_NORMALIZED',
  LINEAR: 'LINEAR',
  SQRT_SCALED: 'SQRT_SCALED',
  PASS_FAIL: 'PASS_FAIL',
  
  // Difficulty Levels
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT',
  
  // Literals
  IDENTIFIER: 'IDENTIFIER',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  DURATION: 'DURATION',
  PERCENTAGE: 'PERCENTAGE',
  BOOLEAN: 'BOOLEAN',
  
  // Operators
  COLON: 'COLON',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  LBRACKET: 'LBRACKET',
  RBRACKET: 'RBRACKET',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  
  // Special
  EOF: 'EOF'
};

/**
 * ETL Lexer
 */
class ETLLexer {
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
      'examination': TokenType.EXAMINATION,
      'passing_score': TokenType.PASSING_SCORE,
      'time_limit': TokenType.TIME_LIMIT,
      'phi_grading': TokenType.PHI_GRADING,
      'section': TokenType.SECTION,
      'weight': TokenType.WEIGHT,
      'question': TokenType.QUESTION,
      'type': TokenType.TYPE,
      'points': TokenType.POINTS,
      'options': TokenType.OPTIONS,
      'correct': TokenType.CORRECT,
      'explanation': TokenType.EXPLANATION,
      'rubric': TokenType.RUBRIC,
      'timeout': TokenType.TIMEOUT,
      'grading_curve': TokenType.GRADING_CURVE,
      'adjustments': TokenType.ADJUSTMENTS,
      'bonus': TokenType.BONUS,
      'curve_factor': TokenType.CURVE_FACTOR,
      'ENCODED_ID': TokenType.ENCODED_ID,
      'prerequisite': TokenType.PREREQUISITE,
      'difficulty': TokenType.DIFFICULTY,
      'category': TokenType.CATEGORY,
      'hint': TokenType.HINT,
      'partial_credit': TokenType.PARTIAL_CREDIT,
      'answer_key': TokenType.ANSWER_KEY,
      'validation': TokenType.VALIDATION,
      'MULTIPLE_CHOICE': TokenType.MULTIPLE_CHOICE,
      'TRUE_FALSE': TokenType.TRUE_FALSE,
      'SHORT_ANSWER': TokenType.SHORT_ANSWER,
      'ESSAY': TokenType.ESSAY,
      'CODE_EVALUATION': TokenType.CODE_EVALUATION,
      'PRACTICAL': TokenType.PRACTICAL,
      'MATCHING': TokenType.MATCHING,
      'FILL_BLANK': TokenType.FILL_BLANK,
      'PHI_NORMALIZED': TokenType.PHI_NORMALIZED,
      'LINEAR': TokenType.LINEAR,
      'SQRT_SCALED': TokenType.SQRT_SCALED,
      'PASS_FAIL': TokenType.PASS_FAIL,
      'BEGINNER': TokenType.BEGINNER,
      'INTERMEDIATE': TokenType.INTERMEDIATE,
      'ADVANCED': TokenType.ADVANCED,
      'EXPERT': TokenType.EXPERT,
      'true': TokenType.BOOLEAN,
      'false': TokenType.BOOLEAN,
      'correctness': TokenType.IDENTIFIER,
      'efficiency': TokenType.IDENTIFIER,
      'style': TokenType.IDENTIFIER
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
 * ETL Parser
 */
class ETLParser {
  constructor(input) {
    this.lexer = new ETLLexer(input);
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
    const examinations = [];
    
    while (this.peek().type !== TokenType.EOF) {
      if (this.peek().type === TokenType.EXAMINATION) {
        examinations.push(this.parseExamination());
      } else {
        this.advance();
      }
    }
    
    return {
      type: 'ETLProgram',
      examinations,
      metadata: {
        phi: PHI,
        phiInverse: PHI_INVERSE,
        encodedIdentity: 'ETL.EXAM.TEST'
      }
    };
  }

  parseExamination() {
    this.expect(TokenType.EXAMINATION);
    const name = this.expect(TokenType.IDENTIFIER).value;
    
    let encodedId = null;
    if (this.peek().type === TokenType.LBRACKET) {
      encodedId = this.parseEncodedId();
    }
    
    this.expect(TokenType.LBRACE);
    
    const examination = {
      type: 'Examination',
      name,
      encodedId,
      passingScore: PHI_INVERSE,
      timeLimit: null,
      phiGrading: true,
      sections: [],
      gradingCurve: null,
      prerequisites: [],
      answerKey: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.PASSING_SCORE:
          this.advance();
          this.expect(TokenType.COLON);
          examination.passingScore = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.TIME_LIMIT:
          this.advance();
          this.expect(TokenType.COLON);
          const t = this.advance();
          examination.timeLimit = { value: t.value, unit: t.unit };
          break;
        case TokenType.PHI_GRADING:
          this.advance();
          this.expect(TokenType.COLON);
          examination.phiGrading = this.advance().value === 'true';
          break;
        case TokenType.SECTION:
          examination.sections.push(this.parseSection());
          break;
        case TokenType.GRADING_CURVE:
          examination.gradingCurve = this.parseGradingCurve();
          break;
        case TokenType.PREREQUISITE:
          this.advance();
          this.expect(TokenType.COLON);
          examination.prerequisites = this.parseStringArray();
          break;
        case TokenType.ANSWER_KEY:
          this.advance();
          this.expect(TokenType.COLON);
          examination.answerKey = this.parseAnswerKey();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return examination;
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

  parseSection() {
    this.expect(TokenType.SECTION);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const section = {
      type: 'Section',
      name,
      weight: 1.0,
      questions: [],
      timeLimit: null,
      shuffleQuestions: false
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.WEIGHT:
          this.advance();
          this.expect(TokenType.COLON);
          section.weight = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.QUESTION:
          section.questions.push(this.parseQuestion());
          break;
        case TokenType.TIME_LIMIT:
          this.advance();
          this.expect(TokenType.COLON);
          const t = this.advance();
          section.timeLimit = { value: t.value, unit: t.unit };
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return section;
  }

  parseQuestion() {
    this.expect(TokenType.QUESTION);
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.LBRACE);
    
    const question = {
      type: 'Question',
      name,
      questionType: 'MULTIPLE_CHOICE',
      points: 1,
      options: [],
      correct: null,
      explanation: null,
      rubric: null,
      timeout: null,
      difficulty: 'INTERMEDIATE',
      category: null,
      hints: [],
      partialCredit: false,
      validation: null
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.TYPE:
          this.advance();
          this.expect(TokenType.COLON);
          question.questionType = this.advance().value;
          break;
        case TokenType.POINTS:
          this.advance();
          this.expect(TokenType.COLON);
          question.points = this.expect(TokenType.NUMBER).value;
          break;
        case TokenType.OPTIONS:
          this.advance();
          this.expect(TokenType.COLON);
          question.options = this.parseStringArray();
          break;
        case TokenType.CORRECT:
          this.advance();
          this.expect(TokenType.COLON);
          question.correct = this.advance().value;
          break;
        case TokenType.EXPLANATION:
          this.advance();
          this.expect(TokenType.COLON);
          question.explanation = this.expect(TokenType.STRING).value;
          break;
        case TokenType.RUBRIC:
          this.advance();
          this.expect(TokenType.COLON);
          question.rubric = this.parseRubric();
          break;
        case TokenType.TIMEOUT:
          this.advance();
          this.expect(TokenType.COLON);
          const t = this.advance();
          question.timeout = { value: t.value, unit: t.unit };
          break;
        case TokenType.DIFFICULTY:
          this.advance();
          this.expect(TokenType.COLON);
          question.difficulty = this.advance().value;
          break;
        case TokenType.CATEGORY:
          this.advance();
          this.expect(TokenType.COLON);
          question.category = this.advance().value;
          break;
        case TokenType.HINT:
          this.advance();
          this.expect(TokenType.COLON);
          question.hints.push(this.expect(TokenType.STRING).value);
          break;
        case TokenType.PARTIAL_CREDIT:
          this.advance();
          this.expect(TokenType.COLON);
          question.partialCredit = this.advance().value === 'true';
          break;
        case TokenType.VALIDATION:
          this.advance();
          this.expect(TokenType.COLON);
          question.validation = this.advance().value;
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return question;
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

  parseRubric() {
    const rubric = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const key = this.advance().value;
      this.expect(TokenType.COLON);
      const token = this.advance();
      rubric[key] = token.type === TokenType.PERCENTAGE 
        ? { value: token.value, unit: 'percent' }
        : token.value;
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return rubric;
  }

  parseGradingCurve() {
    this.expect(TokenType.GRADING_CURVE);
    this.expect(TokenType.LBRACE);
    
    const curve = {
      type: 'GradingCurve',
      curveType: 'PHI_NORMALIZED',
      adjustments: {}
    };
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      switch (token.type) {
        case TokenType.TYPE:
          this.advance();
          this.expect(TokenType.COLON);
          curve.curveType = this.advance().value;
          break;
        case TokenType.ADJUSTMENTS:
          this.advance();
          this.expect(TokenType.COLON);
          curve.adjustments = this.parseAdjustments();
          break;
        default:
          this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return curve;
  }

  parseAdjustments() {
    const adjustments = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const token = this.peek();
      
      if (token.type === TokenType.BONUS || token.value === 'bonus') {
        this.advance();
        this.expect(TokenType.COLON);
        const val = this.advance();
        adjustments.bonus = { value: val.value, unit: val.type === TokenType.PERCENTAGE ? 'percent' : null };
      } else if (token.type === TokenType.CURVE_FACTOR || token.value === 'curve_factor') {
        this.advance();
        this.expect(TokenType.COLON);
        adjustments.curveFactor = this.expect(TokenType.NUMBER).value;
      } else {
        this.advance();
      }
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return adjustments;
  }

  parseAnswerKey() {
    const answerKey = {};
    this.expect(TokenType.LBRACE);
    
    while (this.peek().type !== TokenType.RBRACE) {
      const questionId = this.advance().value;
      this.expect(TokenType.COLON);
      answerKey[questionId] = this.advance().value;
      
      if (this.peek().type === TokenType.COMMA) {
        this.advance();
      }
    }
    
    this.expect(TokenType.RBRACE);
    return answerKey;
  }
}

/**
 * Parse ETL source code
 */
function parse(source) {
  const parser = new ETLParser(source);
  return parser.parse();
}

export { parse, ETLParser, ETLLexer, TokenType };
export default { parse, ETLParser, ETLLexer, TokenType };
