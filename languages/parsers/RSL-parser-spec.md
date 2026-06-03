# RSL — Resonance Specification Language (Parser Specification)

> Parser specification for the language governing φ-resonance patterns, cross-organism synchronization, spatial coordinate systems, and harmonic field definitions.

## 1. Purpose

RSL (Resonance Specification Language) enables:
- Defining φ-resonance patterns with 5-axis spatial coordinates
- Cross-organism synchronization schedules
- Harmonic field topology specifications
- Resonance strength and decay models
- Phi-coordinate transformations and projections

## 2. Source Protocol Mapping

| RSL Concept | Existing Implementation | File |
|-------------|------------------------|------|
| Phi Resonance | Phi Resonance Sync Protocol | protocols/phi-resonance-sync-protocol.js |
| Spatial Coordinates | PhiCoordinateGenerator (θ/φ/ρ/ring/beat) | sovereign-memory-sdk |
| Dual-Layer Search | DualLayerSearch (semantic + phi-proximity) | sovereign-memory-sdk |
| Cross-Resonance | CrossOrganismResonance | organism-runtime-sdk |
| Sensor Array | SensorArray SDK | sdk/sensor-array-sdk |

## 3. Grammar (EBNF)

```ebnf
(* RSL Resonance Specification Grammar *)
program         = { definition } ;
definition      = pattern_def | field_def | sync_def | transform_def | decay_def ;

(* Resonance Pattern *)
pattern_def     = "PATTERN" identifier "{"
                  "origin:" phi_coordinate ";"
                  "frequency:" frequency_expr ";"
                  "amplitude:" float_literal ";"
                  [ "harmonics:" harmonic_list ";" ]
                  [ "decay:" decay_model ";" ]
                  "}" ;

(* Phi Coordinate *)
phi_coordinate  = "PHI(" theta "," phi "," rho "," ring "," beat ")" ;
theta           = float_literal ;  (* 0 to 2π — angular position *)
phi             = float_literal ;  (* 0 to π — elevation angle *)
rho             = float_literal ;  (* 0+ — radial distance *)
ring            = nat ;            (* ring index: 0=core, 1=memory, 2=interface, 3=sovereign *)
beat            = nat ;            (* heartbeat offset: multiples of 873ms *)

(* Frequency *)
frequency_expr  = float_literal "Hz"
                | "PHI_HARMONIC(" nat ")"     (* φ^n frequency *)
                | "HEARTBEAT_MULTIPLE(" nat ")" ;

(* Harmonic List *)
harmonic_list   = "[" harmonic { "," harmonic } "]" ;
harmonic        = "(" nat "," float_literal ")" ;  (* (harmonic_number, amplitude) *)

(* Field Definition *)
field_def       = "FIELD" identifier "{"
                  "topology:" topology_type ";"
                  "dimensions:" nat ";"
                  "bounds:" bounds_expr ";"
                  { field_property }
                  "}" ;
topology_type   = "TOROIDAL" | "SPHERICAL" | "HYPERBOLIC" | "FLAT" | "PHI_SPIRAL" ;
bounds_expr     = "(" float_literal ".." float_literal ")" { ","
                  "(" float_literal ".." float_literal ")" } ;

(* Synchronization *)
sync_def        = "SYNC" identifier "{"
                  "sources:" "[" { source_ref "," } "]" ";"
                  "mode:" sync_mode ";"
                  "phase_lock:" bool_literal ";"
                  [ "tolerance:" float_literal ";" ]
                  "}" ;
sync_mode       = "PHASE_LOCK" | "FREQUENCY_MATCH" | "AMPLITUDE_ALIGN"
                | "PHI_ENTANGLE" | "FREE_RESONANCE" ;

(* Coordinate Transform *)
transform_def   = "TRANSFORM" identifier ":"
                  phi_coordinate "->" phi_coordinate
                  "VIA" transform_type ";" ;
transform_type  = "ROTATE(" float_literal ")"
                | "SCALE(" float_literal ")"
                | "TRANSLATE(" float_literal "," float_literal "," float_literal ")"
                | "PHI_SPIRAL(" nat ")" ;

(* Decay Model *)
decay_def       = "DECAY" identifier ":"
                  decay_model ";" ;
decay_model     = "EXPONENTIAL(" float_literal ")"  (* half-life in heartbeats *)
                | "PHI_DECAY(" float_literal ")"     (* φ-weighted decay *)
                | "LINEAR(" float_literal ")"
                | "NONE" ;
```

## 4. Example

```rsl
(* Define a resonance pattern anchored in the core ring *)
PATTERN alpha_resonance {
  origin: PHI(0.618, 1.618, 1.0, 0, 0);
  frequency: PHI_HARMONIC(3);
  amplitude: 0.95;
  harmonics: [(1, 0.8), (2, 0.5), (3, 0.3), (5, 0.2)];
  decay: PHI_DECAY(0.618);
}

(* Define a resonance field with toroidal topology *)
FIELD organism_field {
  topology: PHI_SPIRAL;
  dimensions: 5;
  bounds: (0.0..6.283), (0.0..3.141), (0.0..100.0), (0..3), (0..EVOLUTION_CYCLE_MS);
  carrier_pattern: alpha_resonance;
  background_strength: 0.1;
}

(* Synchronize two organisms via phase-locked resonance *)
SYNC cross_organism_link {
  sources: [organism_alpha, organism_beta, organism_gamma];
  mode: PHI_ENTANGLE;
  phase_lock: true;
  tolerance: 0.01;
}

(* Transform coordinates from one ring to another *)
TRANSFORM ring_projection:
  PHI(0.618, 1.618, 1.0, 0, 0) -> PHI(0.618, 1.618, 2.0, 2, 0)
  VIA PHI_SPIRAL(2);

(* Decay model for memory ring resonance *)
DECAY memory_fade: PHI_DECAY(0.382);
```

## 5. Parser Architecture

```
RSL Source → Lexer → Token Stream → Parser → AST → Resonance Validator → CIL Output
                                                          ↓
                                                  Resonance Registry
                                                  (phi-resonance-sync-protocol.js)
                                                  (sovereign-memory-sdk)
```

The RSL parser generates:
- CIL PHICOORD/RESONATE/PHISCALE instructions
- Phi-coordinate configuration for spatial memory
- Sync schedules for cross-organism resonance
- Field topology parameters for sensor arrays

## 6. Relationship to Other Languages

| Language | Relationship |
|----------|-------------|
| **CPL-C** | CPL-C phi_coordinate type originates from RSL |
| **CIL** | RSL compiles to CIL phi-arithmetic and resonance instructions |
| **OCL** | OCL resonance commands reference RSL pattern definitions |
| **ACL** | ACL resonance messages carry RSL pattern payloads |
| **TPL** | Token evolution uses RSL resonance for φ-weighted mutation |
| **TSL** | TSL tutorials can visualize RSL patterns interactively |
