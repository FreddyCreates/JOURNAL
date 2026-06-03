# EDL — Educational Definition Language (Education Specification)

> Education tool specification for defining lesson plans, curricula, knowledge graph structures, and learning pathways through the Cognitive Language Stack.

## 1. Purpose

EDL (Educational Definition Language) enables educators and content creators to:
- Define structured lesson plans with prerequisites and objectives
- Create curricula that map learning pathways through the 13 languages
- Build knowledge graphs connecting concepts across phases
- Define assessment criteria and progress milestones
- Generate interactive tutorials (compiled to TSL)

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **Declarative Curricula** | Lessons are declared, not coded — the runtime handles sequencing |
| **Prerequisite Graphs** | Automatic validation that prerequisites are met before advancing |
| **Multi-Path Learning** | Students can choose from multiple valid paths through material |
| **Assessment-Embedded** | Every lesson includes built-in checkpoints and exercises |
| **Language-Aware** | EDL knows which CLS language each concept belongs to |

## 3. Grammar (EBNF)

```ebnf
(* EDL Educational Definition Grammar *)
program         = { definition } ;
definition      = lesson_def | curriculum_def | concept_def
                | assessment_def | pathway_def ;

(* Lesson Definition *)
lesson_def      = "LESSON" identifier "{"
                  "title:" string ";"
                  "language:" language_ref ";"
                  "level:" nat ";"
                  "objectives:" "[" { string "," } "]" ";"
                  [ "prerequisites:" "[" { identifier "," } "]" ";" ]
                  { section }
                  "}" ;
section         = "SECTION" identifier "{"
                  "content:" content_block ";"
                  [ "exercise:" exercise_block ";" ]
                  [ "checkpoint:" checkpoint_block ";" ]
                  "}" ;

(* Curriculum Definition *)
curriculum_def  = "CURRICULUM" identifier "{"
                  "name:" string ";"
                  "phases:" "[" { phase_ref "," } "]" ";"
                  "duration:" duration ";"
                  { lesson_ref }
                  "}" ;

(* Concept Definition *)
concept_def     = "CONCEPT" identifier "{"
                  "name:" string ";"
                  "language:" language_ref ";"
                  "depends_on:" "[" { identifier "," } "]" ";"
                  "description:" string ";"
                  [ "examples:" "[" { code_example "," } "]" ";" ]
                  "}" ;

(* Assessment *)
assessment_def  = "ASSESSMENT" identifier "{"
                  "type:" assessment_type ";"
                  "concepts:" "[" { identifier "," } "]" ";"
                  "criteria:" "[" { criterion "," } "]" ";"
                  [ "exercises:" "[" { exercise_ref "," } "]" ";" ]
                  "}" ;
assessment_type = "QUIZ" | "PROJECT" | "PEER_REVIEW" | "CHECKPOINT" ;

(* Learning Pathway *)
pathway_def     = "PATHWAY" identifier "{"
                  "name:" string ";"
                  "entry:" identifier ";"
                  "milestones:" "[" { milestone "," } "]" ";"
                  "}" ;
milestone       = "MILESTONE" identifier "AFTER" "[" { identifier "," } "]" ;

(* Content Blocks *)
content_block   = "TEXT(" string ")"
                | "CODE(" language_ref "," string ")"
                | "VISUAL(" visual_type "," parameters ")"
                | "INTERACTIVE(" spl_program ")" ;
visual_type     = "DIAGRAM" | "ANIMATION" | "GRAPH" | "FIELD_MAP" ;

(* Language References *)
language_ref    = "CPL-L" | "CPL-C" | "CPL-P" | "TPL" | "CIL"
                | "CDL" | "OCL" | "ACL" | "RSL"
                | "SPL" | "EDL" | "PWL" | "TSL" ;
```

## 4. Example

```edl
CONCEPT phi_resonance {
  name: "Phi Resonance and Spatial Coordinates";
  language: RSL;
  depends_on: [heartbeat_basics, register_model];
  description: "Understanding φ-encoded coordinates and cross-organism resonance";
  examples: [
    CODE(RSL, "PATTERN wave { origin: PHI(0.618, 1.618, 1.0, 0, 0); frequency: PHI_HARMONIC(3); }"),
    CODE(SPL, "CREATE pattern 'wave' AT (0.618, 1.618, 1.0)")
  ];
}

LESSON intro_resonance {
  title: "Introduction to Resonance Patterns";
  language: RSL;
  level: 3;
  objectives: [
    "Understand 5-axis phi coordinates",
    "Create simple resonance patterns",
    "Observe cross-organism synchronization"
  ];
  prerequisites: [intro_organism, intro_registers];

  SECTION coordinates {
    content: TEXT("Every point in the organism field is addressed by a 5-axis phi coordinate: θ (angle), φ (elevation), ρ (distance), ring (layer), and beat (time).");
    exercise: INTERACTIVE(
      CREATE pattern "test" AT (0.5, 1.0, 1.0)
      EMIT "test"
      SHOW field
    );
    checkpoint: ASSESSMENT coord_quiz;
  }
}

CURRICULUM cognitive_fundamentals {
  name: "Cognitive Language Stack Fundamentals";
  phases: [PHASE_1, PHASE_2, PHASE_3];
  duration: 40 HOURS;
  LESSON intro_organism;
  LESSON intro_registers;
  LESSON intro_tokens;
  LESSON intro_resonance;
  LESSON intro_agents;
}

PATHWAY fast_track {
  name: "Fast Track to Organism Programming";
  entry: intro_organism;
  milestones: [
    MILESTONE register_mastery AFTER [intro_registers, register_exercises],
    MILESTONE token_mastery AFTER [intro_tokens, token_exercises],
    MILESTONE full_stack AFTER [register_mastery, token_mastery, intro_agents]
  ];
}
```

## 5. Compilation Path

```
EDL Source → EDL Parser → Curriculum Graph → Dependency Validator → TSL Output
                                                    ↓
                                            Knowledge Graph
                                            (for adaptive learning)
```

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **SPL** | EDL lesson exercises are written in SPL |
| **TSL** | EDL lessons compile to TSL interactive tutorials |
| **PWL** | EDL references PWL for pattern-writing exercises |
| **All Phase 1-2** | EDL can define lessons for any Phase 1 or Phase 2 language |
