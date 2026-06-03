# OCL — Organism Control Language (Parser Specification)

> Parser specification for the language governing organism lifecycle, heartbeat control, kernel execution, and runtime management.

## 1. Purpose

OCL (Organism Control Language) enables:
- Organism lifecycle management (spawn, run, pause, hibernate, terminate)
- Heartbeat configuration and synchronization
- Kernel loading and sandboxed execution
- Edge sensor configuration and monitoring
- Cross-organism resonance coordination

## 2. Source Protocol Mapping

| OCL Concept | Existing Implementation | File |
|-------------|------------------------|------|
| Organism Lifecycle | Organism Lifecycle Protocol | protocols/organism-lifecycle-protocol.js |
| Heartbeat (873ms) | OrganismState.Heartbeat | organism-runtime-sdk |
| Kernel Execution | KernelExecutor | organism-runtime-sdk |
| Edge Sensing | EdgeSensor | organism-runtime-sdk |
| Cross-Resonance | CrossOrganismResonance | organism-runtime-sdk |
| 4-Register State | OrganismState | organism-runtime-sdk |

## 3. Grammar (EBNF)

```ebnf
(* OCL Organism Control Grammar *)
program         = { statement } ;
statement       = organism_decl | lifecycle_cmd | heartbeat_cmd
                | kernel_cmd | sensor_cmd | resonance_cmd ;

(* Organism Declaration *)
organism_decl   = "ORGANISM" identifier "{"
                  "registers:" register_config ";"
                  "heartbeat:" heartbeat_config ";"
                  [ "sensors:" sensor_list ";" ]
                  [ "kernels:" kernel_list ";" ]
                  "}" ;

(* Register Configuration *)
register_config = "{" "cognitive:" type_expr ","
                      "affective:" type_expr ","
                      "somatic:" type_expr ","
                      "sovereign:" type_expr "}" ;

(* Heartbeat Configuration *)
heartbeat_config = nat "ms" [ "PHI_LOCKED" ] ;

(* Lifecycle Commands *)
lifecycle_cmd   = "SPAWN" identifier [ "FROM" template_ref ]
               | "RUN" identifier [ "FOR" duration ]
               | "PAUSE" identifier [ "UNTIL" condition ]
               | "HIBERNATE" identifier
               | "TERMINATE" identifier [ "GRACEFUL" | "IMMEDIATE" ]
               | "CLONE" identifier "AS" identifier ;

(* Heartbeat Commands *)
heartbeat_cmd   = "HEARTBEAT" identifier "{"
                  { beat_action }
                  "}" ;
beat_action     = "ON_BEAT" nat ":" action_block ";"
               | "EVERY" nat "BEATS" ":" action_block ";"
               | "ON_PHASE" phase_name ":" action_block ";" ;
phase_name      = "SYSTOLE" | "DIASTOLE" | "SYNC" ;

(* Kernel Commands *)
kernel_cmd      = "KERNEL" identifier "{"
                  "code:" code_ref ";"
                  "sandbox:" sandbox_mode ";"
                  [ "timeout:" duration ";" ]
                  [ "resources:" resource_limits ";" ]
                  "}" ;
sandbox_mode    = "FULL" | "PARTIAL" | "NONE" ;

(* Sensor Commands *)
sensor_cmd      = "SENSE" sensor_type "FROM" identifier
                  "INTO" register_name
                  [ "THRESHOLD" float_literal ] ";" ;
sensor_type     = "TEMPERATURE" | "NETWORK" | "RESOURCE" | "SIGNAL" | "CUSTOM" ;

(* Resonance Commands *)
resonance_cmd   = "RESONATE" identifier "WITH" identifier
                  "AT" phi_coordinate
                  "STRENGTH" float_literal ";" ;
```

## 4. Example

```ocl
(* Declare an organism with full configuration *)
ORGANISM sovereign_alpha {
  registers: {
    cognitive: QuantumState,
    affective: EmotionVector,
    somatic: PhysicalState,
    sovereign: GovernanceRecord
  };
  heartbeat: 873ms PHI_LOCKED;
  sensors: [TEMPERATURE, NETWORK, RESOURCE];
  kernels: [governance_kernel, evolution_kernel];
}

(* Spawn and run *)
SPAWN sovereign_alpha FROM template_sovereign;
RUN sovereign_alpha FOR 100 HEARTBEATS;

(* Heartbeat-driven actions *)
HEARTBEAT sovereign_alpha {
  ON_BEAT 1: SENSE NETWORK FROM edge_sensor INTO somatic;
  EVERY 3 BEATS: KERNEL evolution_kernel { code: evolve.cil; sandbox: FULL; };
  ON_PHASE SYNC: RESONATE sovereign_alpha WITH peer_beta AT (0.618, 1.618, 1.0, 3, 873) STRENGTH 0.9;
}

(* Edge sensing with threshold *)
SENSE RESOURCE FROM cpu_monitor INTO somatic THRESHOLD 0.8;

(* Cross-organism resonance *)
RESONATE sovereign_alpha WITH sovereign_beta
  AT (0.618, 1.618, 1.0, 3, 873) STRENGTH 0.95;
```

## 5. Parser Architecture

```
OCL Source → Lexer → Token Stream → Parser → AST → Lifecycle Validator → CIL Output
                                                          ↓
                                                  Organism Registry
                                                  (organism-runtime-sdk)
```

The OCL parser generates:
- CIL instruction sequences for lifecycle operations
- Heartbeat timer configurations
- Kernel sandbox configurations
- Sensor polling schedules

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-C** | OCL organism state maps to CPL-C cognitive register operations |
| **CIL** | OCL compiles to CIL heartbeat and register instructions |
| **CDL** | OCL references CDL model definitions for register types |
| **ACL** | OCL lifecycle events trigger ACL agent notifications |
| **RSL** | OCL resonance commands use RSL pattern specifications |
| **EDL** | EDL teaches OCL concepts to students |
