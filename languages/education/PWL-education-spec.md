# PWL — Pattern Writing Language (Education Specification)

> Education tool specification for the language enabling students to author intelligence patterns, model templates, and reusable cognitive constructs.

## 1. Purpose

PWL (Pattern Writing Language) enables students and practitioners to:
- Author reusable intelligence patterns (cognitive templates)
- Compose patterns from primitive building blocks
- Test patterns against simulated organism environments
- Share patterns through a pattern library
- Bridge the gap between learning (SPL) and production (CDL/OCL)

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **Template-Based** | Patterns are parameterized templates, not fixed code |
| **Composable** | Small patterns combine into larger ones via composition operators |
| **Testable** | Built-in test harness for pattern validation |
| **Shareable** | Patterns have metadata for library publishing |
| **Visual Preview** | Patterns render visual previews before deployment |

## 3. Grammar (EBNF)

```ebnf
(* PWL Pattern Writing Grammar *)
program         = { definition } ;
definition      = pattern_def | template_def | composition_def
                | test_def | library_def ;

(* Pattern Definition *)
pattern_def     = "PATTERN" identifier "(" { param_decl "," } ")" "{"
                  "description:" string ";"
                  "category:" category_name ";"
                  "ring:" ring_name ";"
                  { pattern_step }
                  "}" ;
param_decl      = identifier ":" type_expr [ "=" default_value ] ;
category_name   = "COGNITIVE" | "STRUCTURAL" | "BEHAVIORAL"
                | "RESONANCE" | "GOVERNANCE" | "COMMUNICATION" ;

(* Pattern Steps *)
pattern_step    = "STEP" nat ":" step_action ";" ;
step_action     = "CREATE" entity_type param_list
                | "CONFIGURE" identifier "WITH" config_block
                | "CONNECT" identifier "TO" identifier "VIA" connection_type
                | "APPLY" pattern_ref "(" { expression "," } ")"
                | "ASSERT" condition
                | "EMIT" signal_expr ;
connection_type = "WIRE" | "RESONANCE" | "HEARTBEAT" | "DATA" ;

(* Template Definition *)
template_def    = "TEMPLATE" identifier "<" { type_param "," } ">" "{"
                  "base:" pattern_ref ";"
                  { override_stmt }
                  "}" ;
override_stmt   = "OVERRIDE" identifier "=" expression ";" ;

(* Composition *)
composition_def = "COMPOSE" identifier "=" composition_expr ";" ;
composition_expr = pattern_ref
                 | composition_expr "+" composition_expr    (* parallel *)
                 | composition_expr ">>" composition_expr   (* sequential *)
                 | composition_expr "|" composition_expr    (* choice *)
                 | "REPEAT(" composition_expr "," nat ")" ;

(* Test Definition *)
test_def        = "TEST" identifier "FOR" pattern_ref "{"
                  { test_stmt }
                  "EXPECT" expectation ";"
                  "}" ;
test_stmt       = "SETUP" ":" action_block ";"
                | "INPUT" ":" input_block ";"
                | "RUN" "FOR" duration ";" ;
expectation     = "STATE" identifier "==" value
                | "OUTPUT" "CONTAINS" string
                | "RESONANCE" ">=" float_literal
                | "NO_ERRORS" ;

(* Library Metadata *)
library_def     = "LIBRARY" identifier "{"
                  "version:" semver ";"
                  "author:" string ";"
                  "tags:" "[" { string "," } "]" ";"
                  "patterns:" "[" { pattern_ref "," } "]" ";"
                  "}" ;
```

## 4. Example

```pwl
(* A reusable heartbeat monitor pattern *)
PATTERN heartbeat_monitor(interval: Nat = 873, threshold: Float = 0.8) {
  description: "Monitors organism heartbeat and alerts on anomalies";
  category: BEHAVIORAL;
  ring: CORE;

  STEP 1: CREATE organism "target" WITH heartbeat interval;
  STEP 2: CREATE sensor "beat_sensor" WITH type SIGNAL;
  STEP 3: CONNECT "beat_sensor" TO "target" VIA HEARTBEAT;
  STEP 4: ASSERT beat_sensor.reading >= threshold;
  STEP 5: EMIT ALERT("heartbeat_anomaly") WHEN beat_sensor.reading < threshold;
}

(* Template specializing the monitor for sovereign organisms *)
TEMPLATE sovereign_monitor<T> {
  base: heartbeat_monitor;
  OVERRIDE interval = 618;
  OVERRIDE threshold = 0.95;
}

(* Compose monitoring + resonance patterns *)
COMPOSE full_health_check =
  heartbeat_monitor(873, 0.8)
  + resonance_checker(0.5)
  >> alert_dispatcher("ops_team");

(* Test the pattern *)
TEST heartbeat_test FOR heartbeat_monitor {
  SETUP: CREATE organism "test_org" WITH heartbeat 873;
  INPUT: PULSE "test_org" 10 times;
  RUN FOR 10 HEARTBEATS;
  EXPECT STATE beat_sensor.reading >= 0.8;
  EXPECT NO_ERRORS;
}

(* Publish to pattern library *)
LIBRARY health_patterns {
  version: "1.0.0";
  author: "Student Alpha";
  tags: ["health", "monitoring", "heartbeat"];
  patterns: [heartbeat_monitor, sovereign_monitor, full_health_check];
}
```

## 5. Compilation Path

```
PWL Source → PWL Parser → Pattern AST → Composition Resolver → CDL/OCL Output
                                              ↓
                                        Pattern Library
                                        (shareable templates)
```

PWL patterns compile to:
- CDL model definitions (for structural patterns)
- OCL lifecycle configurations (for behavioral patterns)
- RSL resonance specs (for resonance patterns)
- SPL exercises (for educational patterns)

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **SPL** | PWL is the next step after SPL mastery |
| **CDL** | PWL patterns compile to CDL model definitions |
| **OCL** | PWL behavioral patterns compile to OCL configurations |
| **RSL** | PWL resonance patterns compile to RSL specifications |
| **EDL** | EDL lesson plans include PWL pattern-writing exercises |
| **TSL** | TSL tutorials can walk through PWL pattern creation |
