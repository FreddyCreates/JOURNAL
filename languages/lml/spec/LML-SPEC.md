# LML SPECIFICATION
## Language Meta Language v1.0.0

**Purpose:** Self-hosting meta-language that defines and generates all other cognitive languages.

**Author:** Freddy Medina
**Date:** 2026-05-02
**Status:** Active Development

---

## 1. ABSTRACT

LML (Language Meta Language) is the bootstrap language that defines the syntax, semantics, and compilation rules for all 40 cognitive languages. LML is self-hosting: LML itself is defined in LML.

---

## 2. GRAMMAR (EBNF)

```ebnf
LanguageDef   ::= "LANGUAGE" Identifier "{" LanguageBody "}"
LanguageBody  ::= Metadata Grammar Semantics CompilationRules

Grammar       ::= "GRAMMAR" "{" GrammarRule+ "}"
GrammarRule   ::= Identifier "::=" Production

Production    ::= Term ("|" Term)*
Term          ::= Identifier | StringLiteral | "(" Production ")" | Term "*" | Term "+" | Term "?"

Semantics     ::= "SEMANTICS" "{" SemanticRule+ "}"
SemanticRule  ::= Pattern "⟹" Action

CompilationRules ::= "COMPILE" "{" Target+ "}"
Target        ::= "TO" TargetType "{" TransformRule+ "}"
TargetType    ::= "MOTOKO" | "JAVASCRIPT" | "WASM"
```

---

## 3. EXAMPLE: DEFINING CPL-L IN LML

```lml
LANGUAGE CPL_L {
  VERSION "1.0.0"
  ENCODED_ID "LML.CPL_L"
  PURPOSE "Constitutional law language for AGI civilizations"

  GRAMMAR {
    Program ::= Law+
    Law ::= "LAW" Identifier "{" LawBody "}"
    LawBody ::= (Metadata | Rule | Clause)+
    Rule ::= "RULE" Identifier "{" RuleBody "}"
    RuleBody ::= (Property | Constraint | Enforcement)+
  }

  SEMANTICS {
    LAW L { body }
    ⟹
    StoreImmutable(L, Compile(body), timestamp)

    RULE R { ENFORCEMENT: COMPILE_TIME, constraint }
    ⟹
    ValidateAtCompileTime(constraint) OR CompileError
  }

  COMPILE {
    TO MOTOKO {
      Law → actor {name}Law { ... }
      Rule → private let rule_{name} = { ... }
      Constraint → public query func verify{name}() : async Bool { ... }
    }

    TO JAVASCRIPT {
      Law → class {name}Law { ... }
      Rule → validate{name}(context) { ... }
    }
  }
}
```

---

## 4. SELF-HOSTING: LML IN LML

```lml
LANGUAGE LML {
  VERSION "1.0.0"
  ENCODED_ID "LML.META"
  PURPOSE "Self-hosting meta-language"

  GRAMMAR {
    LanguageDef ::= "LANGUAGE" Identifier "{" LanguageBody "}"
    LanguageBody ::= Metadata Grammar Semantics CompilationRules
    Grammar ::= "GRAMMAR" "{" GrammarRule+ "}"
    GrammarRule ::= Identifier "::=" Production
  }

  SEMANTICS {
    LANGUAGE L { grammar, semantics, compile }
    ⟹
    GenerateParser(grammar)
    GenerateValidator(semantics)
    GenerateCompiler(compile)
  }

  COMPILE {
    TO JAVASCRIPT {
      LanguageDef → export class {name}Language { ... }
      Grammar → generate{name}Parser() { ... }
      CompilationRules → generate{name}Compiler() { ... }
    }
  }
}
```

---

## 5. USAGE: GENERATING NEW LANGUAGES

```javascript
import { LMLCompiler } from './languages/lml/src/compiler.js';

// Define a new language in LML
const newLangSpec = `
  LANGUAGE CustomLang {
    VERSION "1.0.0"
    GRAMMAR {
      Program ::= Statement+
      Statement ::= "DO" Identifier
    }
  }
`;

// Compile to generate parser, validator, compiler
const compiler = new LMLCompiler();
const generated = compiler.compile(newLangSpec);

// Output:
// - /languages/customlang/src/parser.js
// - /languages/customlang/src/validator.js
// - /languages/customlang/src/compiler.js
```

---

## 6. BOOTSTRAP PROCESS

1. **Phase 0:** Write LML compiler by hand (JavaScript)
2. **Phase 1:** Write LML specification in LML
3. **Phase 2:** Use hand-written compiler to compile LML spec
4. **Phase 3:** Generated LML compiler replaces hand-written one (self-hosting complete)
5. **Phase 4:** Use LML to generate all remaining 39 languages

---

**Status:** 🟡 Spec complete, 🟡 Manual compiler in progress, ⏳ Self-hosting bootstrap planned
