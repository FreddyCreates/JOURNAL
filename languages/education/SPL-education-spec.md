# SPL — Student Programming Language (Education Specification)

> Education tool specification for the simplified organism programming language designed for learners to experiment with cognitive constructs.

## 1. Purpose

SPL (Student Programming Language) is a **beginner-friendly** subset of the Cognitive Language Stack designed to:
- Teach cognitive programming concepts without full complexity
- Provide immediate visual feedback for every operation
- Safely sandbox all operations (no real token/resource manipulation)
- Gradually introduce CDL, OCL, and CIL concepts through guided levels

## 2. Design Principles

| Principle | Description |
|-----------|-------------|
| **Immediate Feedback** | Every statement produces visible output or state change |
| **Safe Sandbox** | No real tokens, cycles, or governance operations |
| **Progressive Disclosure** | Concepts unlock as students advance through levels |
| **Visual-First** | State changes rendered as visual diagrams automatically |
| **Error-Friendly** | Errors explain what went wrong and suggest fixes |

## 3. Language Levels

### Level 1 — Hello Organism
```spl
CREATE organism "my_first_organism"
SET heartbeat 873
PULSE 3 times
SHOW state
```

### Level 2 — Registers
```spl
CREATE organism "learner"
SET cognitive TO "curious"
SET affective TO "excited"
SET somatic TO "healthy"
SET sovereign TO "autonomous"
PULSE 1 time
SHOW registers
```

### Level 3 — Tokens
```spl
MINT token "my_token" WITH phi 1.618
EVOLVE "my_token" FOR 3 cycles
SHOW "my_token" lineage
SPLIT "my_token" INTO 2 EQUAL
SHOW all tokens
```

### Level 4 — Communication
```spl
CREATE agent "alice" AS WORKER
CREATE agent "bob" AS REVIEWER
SEND "hello" FROM "alice" TO "bob"
SHOW messages
```

### Level 5 — Resonance
```spl
CREATE pattern "wave" AT (0.5, 1.0, 1.0)
SET frequency TO PHI_HARMONIC 2
SET amplitude TO 0.8
EMIT "wave"
SHOW field
```

## 4. Simplified Grammar

```ebnf
(* SPL Student Grammar — All levels *)
program       = { statement } ;
statement     = create_stmt | set_stmt | action_stmt | show_stmt ;

create_stmt   = "CREATE" entity_type name_string [ create_opts ] ;
entity_type   = "organism" | "token" | "agent" | "pattern" ;
create_opts   = "WITH" { option } | "AS" role | "AT" coordinate ;

set_stmt      = "SET" property "TO" value ;

action_stmt   = "PULSE" nat "times"
              | "MINT" "token" name_string "WITH" "phi" float
              | "EVOLVE" name_string "FOR" nat "cycles"
              | "SPLIT" name_string "INTO" nat split_mode
              | "MERGE" name_string "," name_string "INTO" name_string
              | "SEND" message "FROM" name_string "TO" name_string
              | "EMIT" name_string ;

show_stmt     = "SHOW" show_target ;
show_target   = "state" | "registers" | "lineage" | "messages"
              | "field" | "all" entity_type ;

split_mode    = "EQUAL" | "PHI_RATIO" ;
name_string   = '"' identifier '"' ;
```

## 5. Visual Output System

Every SPL statement generates a visual output:

| Statement | Visual Output |
|-----------|--------------|
| `CREATE organism` | Animated organism spawn with 4 register gauges |
| `SET register` | Register gauge fills with color and label |
| `PULSE` | Heartbeat animation (873ms per pulse) |
| `MINT token` | Token appears with φ-weight indicator |
| `EVOLVE` | Token morphs through evolution states |
| `SPLIT` | Token divides with animated provenance lines |
| `SEND` | Message particle travels between agent icons |
| `SHOW field` | Resonance field rendered as heat map |

## 6. Compilation Path

```
SPL Source → SPL Parser → SPL AST → Safety Validator → Visual Renderer
                                          ↓
                                    CIL (sandboxed)
                                    (no real substrate ops)
```

## 7. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CDL** | SPL Level 2+ introduces simplified CDL model concepts |
| **OCL** | SPL Level 1 teaches OCL organism basics |
| **ACL** | SPL Level 4 introduces ACL agent communication |
| **RSL** | SPL Level 5 introduces RSL resonance patterns |
| **CIL** | Advanced SPL students can view CIL output of their programs |
| **EDL** | EDL lesson plans reference SPL exercises |
