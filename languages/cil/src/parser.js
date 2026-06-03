/**
 * CIL Parser - Cognitive Internal Language
 * @module cil-parser
 */

export class CILParser {
  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  parse(source) {
    this.tokens = this.tokenize(source);
    this.position = 0;

    const cognitiveSpaces = [];
    while (!this.isAtEnd()) {
      if (this.check('KEYWORD', 'COGNITIVE_SPACE')) {
        cognitiveSpaces.push(this.parseCognitiveSpace());
      } else {
        this.advance();
      }
    }

    return { type: 'Program', cognitiveSpaces, language: 'CIL', version: '1.0.0' };
  }

  parseCognitiveSpace() {
    this.expect('KEYWORD', 'COGNITIVE_SPACE');
    const name = this.expect('IDENTIFIER').value;
    this.expect('LBRACE');

    const space = {
      type: 'CognitiveSpace',
      name,
      metadata: {},
      dimensions: [],
      concepts: [],
      relations: [],
      operations: []
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'VERSION')) {
        this.advance();
        space.metadata.version = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'ENCODED_ID')) {
        this.advance();
        space.metadata.encodedId = this.expect('STRING').value;
      } else if (this.check('KEYWORD', 'TOPOLOGY')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        space.metadata.topology = token.value;
      } else if (this.check('KEYWORD', 'DIMENSIONALITY')) {
        this.advance();
        this.expect('COLON');
        space.metadata.dimensionality = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'DIMENSIONS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          space.dimensions.push(this.parseDimension());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'CONCEPTS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          space.concepts.push(this.parseConcept());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'RELATIONS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          space.relations.push(this.parseRelation());
        }
        this.expect('RBRACE');
      } else if (this.check('KEYWORD', 'OPERATIONS')) {
        this.advance();
        this.expect('LBRACE');
        while (!this.check('RBRACE')) {
          space.operations.push(this.parseOperation());
        }
        this.expect('RBRACE');
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return space;
  }

  parseDimension() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const dimension = { name, type: null, range: null, metric: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'TYPE')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        dimension.type = token.value;
      } else if (this.check('KEYWORD', 'RANGE')) {
        this.advance();
        this.expect('COLON');
        dimension.range = this.parseRange();
      } else if (this.check('KEYWORD', 'METRIC')) {
        this.advance();
        this.expect('COLON');
        dimension.metric = this.parseExpression();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return dimension;
  }

  parseConcept() {
    const name = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const concept = {
      name,
      coordinates: [],
      embedding: [],
      relations: [],
      activation: 0,
      decayRate: 0
    };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'COORDINATES')) {
        this.advance();
        this.expect('COLON');
        concept.coordinates = this.parseVector();
      } else if (this.check('KEYWORD', 'EMBEDDING')) {
        this.advance();
        this.expect('COLON');
        concept.embedding = this.parseVector();
      } else if (this.check('KEYWORD', 'RELATIONS')) {
        this.advance();
        this.expect('COLON');
        concept.relations = this.parseList();
      } else if (this.check('KEYWORD', 'ACTIVATION')) {
        this.advance();
        this.expect('COLON');
        concept.activation = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'DECAY_RATE')) {
        this.advance();
        this.expect('COLON');
        concept.decayRate = this.expect('NUMBER').value;
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return concept;
  }

  parseRelation() {
    const from = this.expect('IDENTIFIER').value;
    this.expect('ARROW');
    const to = this.expect('IDENTIFIER').value;
    this.expect('COLON');
    this.expect('LBRACE');

    const relation = { from, to, type: null, strength: 1.0, bidirectional: false, transitive: false };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'TYPE')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        relation.type = token.value;
      } else if (this.check('KEYWORD', 'STRENGTH')) {
        this.advance();
        this.expect('COLON');
        relation.strength = this.expect('NUMBER').value;
      } else if (this.check('KEYWORD', 'BIDIRECTIONAL')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        relation.bidirectional = token.value === 'TRUE';
      } else if (this.check('KEYWORD', 'TRANSITIVE')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        relation.transitive = token.value === 'TRUE';
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return relation;
  }

  parseOperation() {
    // Operation name can be keyword (REASON, etc.) or identifier
    const nameToken = this.peek();
    if (nameToken.type !== 'IDENTIFIER' && nameToken.type !== 'KEYWORD') {
      throw new Error(`Expected operation name, got ${nameToken.type}`);
    }
    const name = this.advance().value;
    this.expect('COLON');
    this.expect('LBRACE');

    const operation = { name, function: null, parameters: [], effect: null };

    while (!this.check('RBRACE')) {
      if (this.check('KEYWORD', 'FUNCTION')) {
        this.advance();
        this.expect('COLON');
        const token = this.advance(); // Allow KEYWORD or IDENTIFIER
        operation.function = token.value;
      } else if (this.check('KEYWORD', 'PARAMETERS')) {
        this.advance();
        this.expect('COLON');
        operation.parameters = this.parseList();
      } else if (this.check('KEYWORD', 'EFFECT')) {
        this.advance();
        this.expect('COLON');
        operation.effect = this.parseExpression();
      } else {
        this.advance();
      }
    }

    this.expect('RBRACE');
    return operation;
  }

  parseRange() {
    const tokens = [];
    while (!this.check('KEYWORD') && !this.check('RBRACE') && !this.isAtEnd()) {
      tokens.push(this.advance());
    }
    return { type: 'Range', tokens };
  }

  parseVector() {
    this.expect('LBRACKET');
    const values = [];
    while (!this.check('RBRACKET')) {
      const token = this.peek();
      if (token.type === 'NUMBER') {
        values.push(this.advance().value);
      } else if (token.type === 'IDENTIFIER' || token.type === 'KEYWORD') {
        values.push(this.advance().value);
      } else if (token.type === 'STRING') {
        values.push(this.advance().value);
      } else {
        this.advance(); // Skip unknown tokens
      }
      if (this.check('COMMA')) this.advance();
    }
    this.expect('RBRACKET');
    return values;
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
      'COGNITIVE_SPACE', 'VERSION', 'ENCODED_ID', 'TOPOLOGY', 'DIMENSIONALITY',
      'EUCLIDEAN', 'HYPERBOLIC', 'MANIFOLD', 'GRAPH',
      'DIMENSIONS', 'TYPE', 'RANGE', 'METRIC', 'CONTINUOUS', 'DISCRETE', 'CATEGORICAL', 'TEMPORAL',
      'CONCEPTS', 'COORDINATES', 'EMBEDDING', 'RELATIONS', 'ACTIVATION', 'DECAY_RATE',
      'IS_A', 'PART_OF', 'CAUSES', 'IMPLIES', 'CONTRADICTS', 'SIMILAR_TO',
      'OPERATIONS', 'FUNCTION', 'PARAMETERS', 'EFFECT',
      'ACTIVATE', 'PROPAGATE', 'INHIBIT', 'ASSOCIATE', 'DISSOCIATE', 'REASON',
      'TRUE', 'FALSE', 'STRENGTH', 'BIDIRECTIONAL', 'TRANSITIVE'
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

      if (/[0-9]/.test(char) || (char === '-' && /[0-9]/.test(source[i + 1]))) {
        let value = '';
        if (char === '-') {
          value += char;
          i++;
        }
        while (i < source.length && /[0-9.]/.test(source[i])) {
          value += source[i++];
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(value) });
        continue;
      }

      // Handle ->
      if (char === '-' && source[i + 1] === '>') {
        tokens.push({ type: 'ARROW', value: '->' });
        i += 2;
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
        '(': 'LPAREN', ')': 'RPAREN', '=': 'EQUALS', ';': 'SEMICOLON',
        '[': 'LBRACKET', ']': 'RBRACKET'
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

export default CILParser;
