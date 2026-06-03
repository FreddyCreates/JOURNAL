# TSL — Tutorial Specification Language (Education Specification)

> Education tool specification for the language defining interactive tutorials, step-by-step walkthroughs, and guided learning experiences across the Cognitive Language Stack.

## 1. Purpose

TSL (Tutorial Specification Language) enables:
- Defining step-by-step interactive tutorials with embedded code execution
- Creating guided walkthroughs of any Phase 1-3 language
- Building adaptive tutorials that respond to student progress
- Embedding visual feedback, hints, and error recovery
- Generating web-based tutorial interfaces from declarative specs

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **Step-by-Step** | Every tutorial is a sequence of discrete, completable steps |
| **Interactive** | Students write and execute code within the tutorial |
| **Adaptive** | Hints and difficulty adjust based on student performance |
| **Multi-Language** | A single tutorial can span multiple CLS languages |
| **Exportable** | TSL tutorials export to HTML/JS for web delivery |

## 3. Grammar (EBNF)

```ebnf
(* TSL Tutorial Specification Grammar *)
program         = { definition } ;
definition      = tutorial_def | step_def | hint_def | branch_def ;

(* Tutorial Definition *)
tutorial_def    = "TUTORIAL" identifier "{"
                  "title:" string ";"
                  "language:" language_ref { "," language_ref } ";"
                  "difficulty:" difficulty_level ";"
                  "estimated_time:" duration ";"
                  [ "prerequisites:" "[" { identifier "," } "]" ";" ]
                  "steps:" "[" { step_ref "," } "]" ";"
                  "}" ;
difficulty_level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" ;

(* Step Definition *)
step_def        = "STEP" identifier "{"
                  "title:" string ";"
                  "instruction:" content_block ";"
                  [ "code_template:" code_block ";" ]
                  [ "expected_output:" output_spec ";" ]
                  [ "validation:" validation_rule ";" ]
                  [ "hints:" "[" { hint_ref "," } "]" ";" ]
                  [ "on_success:" action_block ";" ]
                  [ "on_failure:" action_block ";" ]
                  "}" ;

(* Content Blocks *)
content_block   = "TEXT(" string ")"
                | "MARKDOWN(" string ")"
                | "CODE_SAMPLE(" language_ref "," string ")"
                | "VISUAL(" visual_type ")" ;

(* Code Block *)
code_block      = "EDITABLE(" language_ref "," string ")"   (* student can edit *)
                | "READONLY(" language_ref "," string ")"    (* display only *)
                | "BLANK(" language_ref ")" ;                (* empty editor *)

(* Validation *)
validation_rule = "OUTPUT_MATCHES(" string ")"
                | "STATE_EQUALS(" identifier "," value ")"
                | "CODE_CONTAINS(" string ")"
                | "NO_ERRORS"
                | "CUSTOM(" function_ref ")" ;

(* Output Specification *)
output_spec     = "TEXT(" string ")"
                | "VISUAL(" visual_type ")"
                | "STATE(" state_spec ")" ;

(* Hint Definition *)
hint_def        = "HINT" identifier "{"
                  "trigger:" hint_trigger ";"
                  "content:" content_block ";"
                  [ "cost:" nat ";" ]        (* hints can cost points *)
                  "}" ;
hint_trigger    = "AFTER_ATTEMPTS(" nat ")"
                | "AFTER_TIME(" duration ")"
                | "ON_ERROR(" error_pattern ")"
                | "ON_REQUEST" ;

(* Adaptive Branching *)
branch_def      = "BRANCH" identifier "{"
                  "condition:" branch_condition ";"
                  "if_true:" "[" { step_ref "," } "]" ";"
                  "if_false:" "[" { step_ref "," } "]" ";"
                  "}" ;
branch_condition = "SCORE" ">=" nat
                 | "ATTEMPTS" "<=" nat
                 | "TIME" "<=" duration
                 | "MASTERED(" concept_ref ")" ;

(* Language References *)
language_ref    = "SPL" | "CDL" | "OCL" | "ACL" | "RSL"
                | "TPL" | "CPL-L" | "CPL-C" | "CPL-P" | "CIL"
                | "EDL" | "PWL" | "TSL" ;
```

## 4. Example

```tsl
HINT mint_hint_1 {
  trigger: AFTER_ATTEMPTS(2);
  content: TEXT("Remember: MINT creates a new token. Try: MINT token \"my_token\" WITH phi 1.618");
  cost: 1;
}

HINT mint_hint_2 {
  trigger: AFTER_ATTEMPTS(4);
  content: CODE_SAMPLE(SPL, "MINT token 'my_token' WITH phi 1.618");
  cost: 2;
}

STEP create_organism {
  title: "Create Your First Organism";
  instruction: MARKDOWN("# Welcome!\nLet's create your first organism. An organism has 4 registers and a heartbeat.\n\nType `CREATE organism 'hello'` to begin.");
  code_template: BLANK(SPL);
  expected_output: VISUAL(ORGANISM_DIAGRAM);
  validation: CODE_CONTAINS("CREATE organism");
  hints: [create_hint_1, create_hint_2];
  on_success: TEXT("Great! You've spawned your first organism!");
  on_failure: TEXT("Not quite. Try using the CREATE command.");
}

STEP mint_token {
  title: "Mint a Token";
  instruction: TEXT("Now let's create a sovereign token with a phi-weight of 1.618.");
  code_template: EDITABLE(SPL, "MINT token '__' WITH phi ___");
  expected_output: VISUAL(TOKEN_DISPLAY);
  validation: OUTPUT_MATCHES("Token minted");
  hints: [mint_hint_1, mint_hint_2];
}

BRANCH skill_check {
  condition: SCORE >= 80;
  if_true: [advanced_evolution, advanced_resonance];
  if_false: [review_basics, practice_minting];
}

TUTORIAL first_organism {
  title: "Your First Intelligent Organism";
  language: SPL, OCL;
  difficulty: BEGINNER;
  estimated_time: 30 MINUTES;
  prerequisites: [];
  steps: [
    create_organism,
    set_registers,
    mint_token,
    skill_check,
    evolve_token,
    final_challenge
  ];
}
```

## 5. Compilation Path

```
TSL Source → TSL Parser → Tutorial Graph → Adaptive Engine → HTML/JS Output
                                                ↓
                                          Progress Tracker
                                          (student state)
```

TSL tutorials compile to:
- HTML/JS interactive web pages
- SPL sandbox environments for code execution
- Progress tracking databases
- Adaptive hint delivery systems

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **SPL** | TSL tutorials embed SPL code editors for student interaction |
| **EDL** | EDL lesson plans compile to TSL tutorials |
| **PWL** | TSL can walk through PWL pattern creation step-by-step |
| **All Phase 1-2** | TSL can create tutorials for any language in the stack |
| **CIL** | Advanced TSL tutorials can show CIL instruction output |
