# ════════════════════════════════════════════════════════════════════════════
# CYCLE ALLOCATOR — Sovereign Self-Funding Through φ-Mathematics
# ════════════════════════════════════════════════════════════════════════════
# Author   : Alfredo Medina Hernandez | MedinaSITech@outlook.com
# Formation: MERIDIAN-CYCLES-2026
#
# CORE PRINCIPLE: Organisms fund themselves. No external funding required.
#
# Generation formula:
#   base = coherence² × φ × generation_rate
#   compound = base × F(n)/F(n-1)  [approaches φ as n → ∞]
#   work_bonus = work_units × φ⁻¹
#   total = compound + work_bonus
#
# This is the actual funding mechanism, not a metaphor.
#
# Physics:
#   Base generation rate = φ⁻¹ cycles per operation
#   Compound rate → φ as Fibonacci advances
#   Decay rate = φ⁻² per neglect cycle
#
# Archetypes: ENGINE, PRIMORDIAL, INFRASTRUCTURE
# CPL Integration: Follows LEX CYCLE-001 (Sovereign Cycle Generation)
# ════════════════════════════════════════════════════════════════════════════

module CycleAllocator

export PHI, PHI_INV, PHI_INV_SQ, PHI_INV_4, PHI_SQ
export COHERENCE_GATE, DECAY_RATE, HEARTBEAT_MS
export AllocationRecord, GenerationEvent, CycleStatistics
export SovereignCycleAllocator
export create_sovereign_cycle_allocator
export generate_cycles!, allocate_cycles!, release_cycles!, burn_cycles!
export decay_cycles!, auto_generate!, get_statistics
export fibonacci_at, fibonacci_ratio, adjust_generation_rate!

using Dates

# ── φ SUBSTRATE CONSTANTS ────────────────────────────────────────────────────

"""Golden ratio — φ = (1 + √5) / 2"""
const PHI        = 1.6180339887498948482

"""Inverse golden ratio — φ⁻¹ = φ - 1 (coherence gate)"""
const PHI_INV    = 0.6180339887498948482

"""φ⁻² — decay rate"""
const PHI_INV_SQ = 0.3819660112501051518

"""φ⁻⁴ — glyph floor (PHI_INV raised to the 4th power)"""
const PHI_INV_4  = 0.2360679774997896

"""φ² — phi squared"""
const PHI_SQ     = 2.6180339887498948482

"""Coherence gate threshold"""
const COHERENCE_GATE = PHI_INV

"""Decay rate per neglect cycle"""
const DECAY_RATE = PHI_INV_SQ

"""
Heartbeat interval in milliseconds.
Derived from Three Hearts timing: 873ms ≈ φ × 539ms (the sovereign pulse).
This interval maintains organism coherence through φ-aligned timing.
"""
const HEARTBEAT_MS = 873

# Fibonacci constants — hardcoded for performance (avoid runtime computation)
# These are used as capacity hints and history limits; computing them repeatedly
# during high-frequency cycle operations would add unnecessary overhead.
const F_8  = 21   # fibonacci_at(8)
const F_12 = 144  # fibonacci_at(12)
const F_13 = 233  # fibonacci_at(13)

# ── ALLOCATION RECORD ────────────────────────────────────────────────────────

"""
Record of a cycle allocation event.

Fields:
- `timestamp`: Unix timestamp of allocation
- `amount`: Cycles allocated
- `purpose`: Purpose string describing the allocation
- `coherence_at`: Coherence level at time of allocation
- `released`: Whether cycles have been released
"""
struct AllocationRecord
    timestamp::Int64
    amount::Float64
    purpose::String
    coherence_at::Float64
    released::Bool
end

# ── GENERATION EVENT ─────────────────────────────────────────────────────────

"""
Record of a cycle generation event.

Fields:
- `timestamp`: Unix timestamp of generation
- `base_amount`: Base cycles generated (coherence² × φ × rate)
- `compound_amount`: Compounded amount (base × fib_ratio)
- `work_bonus`: Work bonus cycles
- `total_generated`: Total cycles generated this event
- `fib_state`: Current Fibonacci state (F(n-1), F(n))
- `coherence`: Coherence level at generation
"""
struct GenerationEvent
    timestamp::Int64
    base_amount::Float64
    compound_amount::Float64
    work_bonus::Float64
    total_generated::Float64
    fib_state::Tuple{Int,Int}
    coherence::Float64
end

# ── CYCLE STATISTICS ─────────────────────────────────────────────────────────

"""
Statistics snapshot of the cycle allocator.

Fields:
- `total_cycles`: Total available cycles
- `allocated_cycles`: Currently allocated cycles
- `available_cycles`: Unallocated cycles (total - allocated)
- `generated_cycles`: Total cycles ever generated
- `burned_cycles`: Cycles permanently consumed
- `compound_factor`: Current Fibonacci compound factor (→ φ)
- `fib_generation`: Current Fibonacci generation number
- `coherence`: Current coherence level
- `operation_count`: Number of operations performed
- `generation_rate`: Base generation rate
- `efficiency_ratio`: Generated / burned ratio
"""
struct CycleStatistics
    total_cycles::Float64
    allocated_cycles::Float64
    available_cycles::Float64
    generated_cycles::Float64
    burned_cycles::Float64
    compound_factor::Float64
    fib_generation::Int
    coherence::Float64
    operation_count::Int
    generation_rate::Float64
    efficiency_ratio::Float64
end

# ── SOVEREIGN CYCLE ALLOCATOR ────────────────────────────────────────────────

"""
    SovereignCycleAllocator

The core sovereign self-funding engine. Organisms using this allocator
generate their own computational cycles through coherent mathematical
operations, requiring no external funding.

The compound factor (fib_b / fib_a) approaches φ asymptotically due to
the fundamental property of Fibonacci sequences:
  lim(n→∞) F(n)/F(n-1) = φ

This means organisms naturally become more productive over time,
approaching the golden ratio efficiency.
"""
mutable struct SovereignCycleAllocator
    # Cycle balances
    total_cycles::Float64       # Total available
    allocated_cycles::Float64   # Currently allocated
    generated_cycles::Float64   # Total ever generated
    burned_cycles::Float64      # Cycles consumed

    # Generation parameters
    generation_rate::Float64    # Base rate (starts at φ⁻¹)
    compound_factor::Float64    # Current compound (→ φ)
    coherence::Float64          # Current coherence

    # Fibonacci state
    fib_a::Int                  # F(n-1)
    fib_b::Int                  # F(n)
    fib_generation::Int         # n

    # Tracking
    last_generation::Int64
    last_allocation::Int64
    operation_count::Int

    # History
    allocation_history::Vector{AllocationRecord}
    generation_history::Vector{GenerationEvent}
end

# ── CREATE ALLOCATOR ─────────────────────────────────────────────────────────

"""
    create_sovereign_cycle_allocator(initial_cycles::Float64) -> SovereignCycleAllocator

Create a new sovereign cycle allocator with the specified initial cycle balance.

The allocator starts at equilibrium (coherence = φ⁻¹) with Fibonacci state (1, 1).
Initial cycles are counted as generated.

# Arguments
- `initial_cycles`: Starting cycle balance

# Returns
- A new `SovereignCycleAllocator` instance
"""
function create_sovereign_cycle_allocator(initial_cycles::Float64)::SovereignCycleAllocator
    now_ms = Int64(round(datetime2unix(now()) * 1000))
    
    SovereignCycleAllocator(
        initial_cycles,      # total_cycles
        0.0,                 # allocated_cycles
        initial_cycles,      # generated_cycles (initial counts as generated)
        0.0,                 # burned_cycles
        
        PHI_INV,            # generation_rate
        1.0,                # compound_factor
        PHI_INV,            # coherence (start at equilibrium)
        
        1,                  # fib_a
        1,                  # fib_b
        2,                  # fib_generation
        
        now_ms,             # last_generation
        now_ms,             # last_allocation
        0,                  # operation_count
        
        AllocationRecord[],     # allocation_history
        GenerationEvent[]       # generation_history
    )
end

# ── GENERATE CYCLES — SOVEREIGN SELF-FUNDING ─────────────────────────────────

"""
    generate_cycles!(allocator::SovereignCycleAllocator, current_coherence::Float64, work_units::Float64) -> Float64

Generate cycles through coherent mathematical operations.
This is the core sovereign funding mechanism.

# Formula
- `base = coherence² × φ × generation_rate`
- `compound = base × (fib_b / fib_a)`  [→ φ as generation increases]
- `work_bonus = work_units × φ⁻¹`
- `total = compound + work_bonus`

The compound factor (fib_b/fib_a) approaches φ asymptotically due to
the fundamental property of Fibonacci sequences:
  lim(n→∞) F(n)/F(n-1) = φ

This means organisms naturally become more productive over time,
approaching the golden ratio efficiency.

# Arguments
- `allocator`: The cycle allocator
- `current_coherence`: Current coherence level (0.0 to 1.0)
- `work_units`: Amount of useful work performed

# Returns
- Total cycles generated
"""
function generate_cycles!(
    allocator::SovereignCycleAllocator,
    current_coherence::Float64,
    work_units::Float64
)::Float64
    # Update coherence
    allocator.coherence = current_coherence
    
    # Advance Fibonacci state
    new_fib = allocator.fib_a + allocator.fib_b
    allocator.fib_a = allocator.fib_b
    allocator.fib_b = new_fib
    allocator.fib_generation += 1
    
    # Compound factor approaches φ
    fa = Float64(allocator.fib_a)
    fb = Float64(allocator.fib_b)
    allocator.compound_factor = fb / fa
    
    # Base generation from coherence
    # Higher coherence → more cycles (quadratic relationship)
    base = current_coherence^2 * PHI * allocator.generation_rate
    
    # Compound with Fibonacci ratio
    compound = base * allocator.compound_factor
    
    # Work bonus — doing useful work generates cycles
    work_bonus = work_units * PHI_INV
    
    # Total generated this cycle
    total = compound + work_bonus
    
    # Update balances
    allocator.generated_cycles += total
    allocator.total_cycles += total
    allocator.operation_count += 1
    allocator.last_generation = Int64(round(datetime2unix(now()) * 1000))
    
    # Record generation event
    event = GenerationEvent(
        allocator.last_generation,
        base,
        compound,
        work_bonus,
        total,
        (allocator.fib_a, allocator.fib_b),
        current_coherence
    )
    
    push!(allocator.generation_history, event)
    
    # Prune history if too long
    if length(allocator.generation_history) > F_13
        popfirst!(allocator.generation_history)
    end
    
    total
end

# ── ALLOCATE CYCLES ──────────────────────────────────────────────────────────

"""
    allocate_cycles!(allocator::SovereignCycleAllocator, required::Float64, purpose::String) -> Tuple{Float64, Float64}

Allocate cycles for a specific purpose.

# Arguments
- `allocator`: The cycle allocator
- `required`: Required cycle amount
- `purpose`: Purpose description

# Returns
- Tuple of (allocated_amount, remaining_available)
"""
function allocate_cycles!(
    allocator::SovereignCycleAllocator,
    required::Float64,
    purpose::String
)::Tuple{Float64, Float64}
    available = allocator.total_cycles - allocator.allocated_cycles
    
    allocated = if available >= required
        required
    else
        available  # Partial allocation
    end
    
    if allocated > 0.0
        allocator.allocated_cycles += allocated
        allocator.last_allocation = Int64(round(datetime2unix(now()) * 1000))
        
        # Record allocation
        record = AllocationRecord(
            allocator.last_allocation,
            allocated,
            purpose,
            allocator.coherence,
            false
        )
        
        push!(allocator.allocation_history, record)
        
        # Prune history
        if length(allocator.allocation_history) > F_13
            popfirst!(allocator.allocation_history)
        end
    end
    
    remaining = allocator.total_cycles - allocator.allocated_cycles
    (allocated, remaining)
end

# ── RELEASE CYCLES ───────────────────────────────────────────────────────────

"""
    release_cycles!(allocator::SovereignCycleAllocator, amount::Float64)

Release allocated cycles back to the pool.

# Arguments
- `allocator`: The cycle allocator
- `amount`: Amount of cycles to release
"""
function release_cycles!(allocator::SovereignCycleAllocator, amount::Float64)
    if allocator.allocated_cycles >= amount
        allocator.allocated_cycles -= amount
    else
        allocator.allocated_cycles = 0.0
    end
    nothing
end

# ── BURN CYCLES ──────────────────────────────────────────────────────────────

"""
    burn_cycles!(allocator::SovereignCycleAllocator, amount::Float64) -> Bool

Consume cycles permanently (remove from circulation).

# Arguments
- `allocator`: The cycle allocator
- `amount`: Amount of cycles to burn

# Returns
- `true` if burn was successful, `false` if insufficient available cycles
"""
function burn_cycles!(allocator::SovereignCycleAllocator, amount::Float64)::Bool
    available = allocator.total_cycles - allocator.allocated_cycles
    
    if available >= amount
        allocator.total_cycles -= amount
        allocator.burned_cycles += amount
        true
    else
        false
    end
end

# ── DECAY CYCLES ─────────────────────────────────────────────────────────────

"""
    decay_cycles!(allocator::SovereignCycleAllocator, neglect_periods::Int) -> Float64

Apply decay to unused cycles (incentivizes active use).
Decay rate = φ⁻² per neglect period.

# Arguments
- `allocator`: The cycle allocator
- `neglect_periods`: Number of periods of neglect

# Returns
- Amount of cycles decayed
"""
function decay_cycles!(allocator::SovereignCycleAllocator, neglect_periods::Int)::Float64
    if neglect_periods == 0
        return 0.0
    end
    
    # Decay factor = (φ⁻²)^n
    decay_factor = PHI_INV_SQ ^ neglect_periods
    
    # Calculate decay amount
    unallocated = allocator.total_cycles - allocator.allocated_cycles
    decay_amount = unallocated * (1.0 - decay_factor)
    
    # Apply decay
    allocator.total_cycles -= decay_amount
    
    decay_amount
end

# ── AUTO-GENERATE ────────────────────────────────────────────────────────────

"""
    auto_generate!(allocator::SovereignCycleAllocator, min_balance::Float64) -> Float64

Automatically generate cycles if balance is low.

# Arguments
- `allocator`: The cycle allocator
- `min_balance`: Minimum balance threshold

# Returns
- Amount of cycles generated (0.0 if balance was sufficient)
"""
function auto_generate!(allocator::SovereignCycleAllocator, min_balance::Float64)::Float64
    available = allocator.total_cycles - allocator.allocated_cycles
    
    if available < min_balance
        # Generate enough to reach min balance plus buffer
        deficit = min_balance - available
        work_needed = deficit / PHI_INV  # Reverse work bonus calculation
        
        # Generate with current coherence
        generated = generate_cycles!(allocator, allocator.coherence, work_needed)
        generated
    else
        0.0
    end
end

# ── GET STATISTICS ───────────────────────────────────────────────────────────

"""
    get_statistics(allocator::SovereignCycleAllocator) -> CycleStatistics

Get current statistics snapshot from the allocator.

# Arguments
- `allocator`: The cycle allocator

# Returns
- `CycleStatistics` struct with current state
"""
function get_statistics(allocator::SovereignCycleAllocator)::CycleStatistics
    available = allocator.total_cycles - allocator.allocated_cycles
    efficiency = if allocator.burned_cycles > 0.0
        allocator.generated_cycles / allocator.burned_cycles
    else
        allocator.generated_cycles  # Infinite efficiency if nothing burned
    end
    
    CycleStatistics(
        allocator.total_cycles,
        allocator.allocated_cycles,
        available,
        allocator.generated_cycles,
        allocator.burned_cycles,
        allocator.compound_factor,
        allocator.fib_generation,
        allocator.coherence,
        allocator.operation_count,
        allocator.generation_rate,
        efficiency
    )
end

# ── FIBONACCI UTILITIES ──────────────────────────────────────────────────────

"""
    fibonacci_at(n::Int) -> Int

Calculate the nth Fibonacci number.

# Arguments
- `n`: Index in Fibonacci sequence (0-indexed)

# Returns
- F(n)
"""
function fibonacci_at(n::Int)::Int
    if n <= 1
        return n
    end
    
    a = 0
    b = 1
    
    for _ in 2:n
        a, b = b, a + b
    end
    
    b
end

"""
    fibonacci_ratio(n::Int) -> Float64

Calculate the ratio F(n) / F(n-1), which approaches φ as n → ∞.
Uses single-pass iteration to compute both F(n) and F(n-1) efficiently.

# Arguments
- `n`: Index in Fibonacci sequence

# Returns
- F(n) / F(n-1), or 1.0 if n ≤ 1
"""
function fibonacci_ratio(n::Int)::Float64
    if n <= 1
        return 1.0
    end
    
    # Single-pass computation: compute F(n-1) and F(n) together
    a = 0  # F(i-1)
    b = 1  # F(i)
    
    for _ in 2:n
        a, b = b, a + b
    end
    
    # At this point: a = F(n-1), b = F(n)
    Float64(b) / Float64(a)
end

# ── COHERENCE-BASED GENERATION RATE ──────────────────────────────────────────

"""
    adjust_generation_rate!(allocator::SovereignCycleAllocator, avg_coherence::Float64)

Adjust generation rate based on sustained coherence.

Higher sustained coherence → higher base rate:
- Rate = φ⁻¹ × (1 + (coherence - φ⁻¹) × φ)
- At coherence = φ⁻¹: rate = φ⁻¹
- At coherence = 1.0: rate ≈ 1.0

# Arguments
- `allocator`: The cycle allocator
- `avg_coherence`: Average coherence over measurement period
"""
function adjust_generation_rate!(allocator::SovereignCycleAllocator, avg_coherence::Float64)
    # Higher sustained coherence → higher base rate
    adjustment = (avg_coherence - PHI_INV) * PHI
    new_rate = PHI_INV * (1.0 + adjustment)
    
    # Clamp to reasonable range [φ⁻², 1.0]
    allocator.generation_rate = clamp(new_rate, PHI_INV_SQ, 1.0)
    
    nothing
end

end # module CycleAllocator
