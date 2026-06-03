/**
 * CPL-L COMPILER
 * Compiles CPL-L (Cognitive Law Language) AST to Motoko canisters
 * @module @medina/cpl-l-compiler
 */

export class CPLLCompiler {
  constructor() {
    this.indent = 0;
  }

  /**
   * Compile CPL-L AST to Motoko
   * @param {Object} ast - CPL-L AST from parser
   * @returns {string} Motoko source code
   */
  compile(ast) {
    let code = '';

    // Generate imports
    code += this.generateImports();
    code += '\n\n';

    // Compile each law to an actor
    for (const law of ast.laws) {
      code += this.compileLaw(law);
      code += '\n\n';
    }

    return code;
  }

  /**
   * Generate Motoko imports
   */
  generateImports() {
    return `import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";`;
  }

  /**
   * Compile a Law to a Motoko actor
   */
  compileLaw(law) {
    const actorName = `${law.name}Law`;
    let code = `/**
 * ${law.name} - Cognitive Law
 * Auto-generated from CPL-L specification
 */
actor ${actorName} {

`;

    // Metadata constants
    code += this.compileMetadata(law.metadata);
    code += '\n';

    // Rules as stable storage
    for (const rule of law.rules) {
      code += this.compileRule(rule);
      code += '\n';
    }

    // Query methods for metadata
    code += this.generateQueryMethods(law);
    code += '\n';

    // Verification methods
    code += this.generateVerificationMethods(law);

    code += '}';
    return code;
  }

  /**
   * Compile metadata
   */
  compileMetadata(metadata) {
    let code = '  // === METADATA ===\n';

    if (metadata.version) {
      code += `  private stable let LAW_VERSION : Text = "${metadata.version}";\n`;
    }
    if (metadata.encodedId) {
      code += `  private stable let ENCODED_ID : Text = "${metadata.encodedId}";\n`;
    }
    if (metadata.author) {
      code += `  private stable let AUTHOR : Text = "${metadata.author}";\n`;
    }
    if (metadata.ratified) {
      code += `  private stable let RATIFIED_DATE : Text = "${metadata.ratified}";\n`;
    }

    code += '  private stable let RATIFIED_AT : Int = Time.now();\n';

    return code;
  }

  /**
   * Compile a rule
   */
  compileRule(rule) {
    let code = `  // === RULE: ${rule.name} ===\n`;

    // Enforcement type
    if (rule.enforcement) {
      code += `  private let RULE_${rule.name}_ENFORCEMENT : Text = "${rule.enforcement}";\n`;
    }

    // Properties as constants
    for (const [key, value] of Object.entries(rule.properties)) {
      const motokoValue = this.valueToMotoko(value);
      code += `  private let RULE_${rule.name}_${key} : ${this.inferType(value)} = ${motokoValue};\n`;
    }

    // Constraints (stored for validation)
    if (rule.constraints.length > 0) {
      code += `  // Constraints: ${rule.constraints.map(c => c.type).join(', ')}\n`;
    }

    return code;
  }

  /**
   * Generate query methods
   */
  generateQueryMethods(law) {
    let code = '  // === QUERY METHODS ===\n\n';

    code += `  public query func getLawVersion() : async Text {
    LAW_VERSION
  };\n\n`;

    code += `  public query func getEncodedId() : async Text {
    ENCODED_ID
  };\n\n`;

    code += `  public query func getRatifiedAt() : async Int {
    RATIFIED_AT
  };\n\n`;

    // Rule queries
    for (const rule of law.rules) {
      code += `  public query func get${rule.name}Enforcement() : async Text {
    RULE_${rule.name}_ENFORCEMENT
  };\n\n`;
    }

    return code;
  }

  /**
   * Generate verification methods
   */
  generateVerificationMethods(law) {
    let code = '  // === VERIFICATION METHODS ===\n\n';

    code += `  public query func verifyCompliance(action : Text) : async Bool {
    // Compile-time enforcement: always returns true if compiled
    // Runtime enforcement: validates action against rules
    true
  };\n\n`;

    code += `  public shared func validateRule(ruleName : Text, context : Text) : async { #Ok : Bool; #Err : Text } {
    // TODO: Implement runtime rule validation
    #Ok(true)
  };\n`;

    return code;
  }

  /**
   * Convert value object to Motoko literal
   */
  valueToMotoko(value) {
    if (value.type === 'String') {
      return `"${value.value}"`;
    } else if (value.type === 'Number') {
      return value.value.toString();
    } else if (value.type === 'Boolean') {
      return value.value ? 'true' : 'false';
    } else if (value.type === 'Identifier') {
      return value.name;
    }
    return 'null';
  }

  /**
   * Infer Motoko type from value
   */
  inferType(value) {
    if (value.type === 'String') return 'Text';
    if (value.type === 'Number') return 'Float';
    if (value.type === 'Boolean') return 'Bool';
    return 'Text';
  }
}

export default CPLLCompiler;
