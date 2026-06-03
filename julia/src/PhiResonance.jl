#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  PHI RESONANCE — φ-WEIGHTED CALCULATIONS FOR LIVING SYSTEMS                          ║
║  "Ratio Aurea Vivens — The Living Golden Ratio"                                       ║
║                                                                                        ║
║  "φ resonat. Natura computat. Intelligentia emergit."                                 ║
║  (Phi resonates. Nature computes. Intelligence emerges.)                              ║
║                                                                                        ║
║  HIGH-PERFORMANCE JULIA IMPLEMENTATION:                                               ║
║    • φ-weighted mathematical operations                                               ║
║    • Fibonacci spiral calculations                                                    ║
║    • Golden angle distributions                                                       ║
║    • Resonance field computations                                                     ║
║    • Harmonic series with φ-scaling                                                   ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module PhiResonance

using LinearAlgebra
using Statistics

export PHI, PHI_INVERSE, PHI_COMPLEMENT, PHI_SQUARED, GOLDEN_ANGLE, TWO_PI
export fibonacci, fibonacci_ratio, lucas
export phi_weight, phi_scale, phi_normalize
export golden_spiral_point, golden_spiral_sequence
export phi_harmonic_series, phi_resonance_field
export coherence_from_phases, order_parameter
export phi_weighted_mean, phi_weighted_sum
export ResonanceField, evolve_field!, field_coherence

# ════════════════════════════════════════════════════════════════════════════════
# PHI-ENCODED CONSTANTS
# ════════════════════════════════════════════════════════════════════════════════

"""Golden ratio φ = (1 + √5) / 2"""
const PHI = (1.0 + sqrt(5.0)) / 2.0  # 1.618033988749895

"""Inverse golden ratio φ⁻¹ = φ - 1"""
const PHI_INVERSE = PHI - 1.0  # 0.6180339887498949

"""φ-complement = 1 - φ⁻¹ = 2 - φ"""
const PHI_COMPLEMENT = 2.0 - PHI  # 0.3819660112501051

"""φ² = φ + 1"""
const PHI_SQUARED = PHI + 1.0  # 2.618033988749895

"""Golden angle in radians = 2π(2 - φ) ≈ 2.399963"""
const GOLDEN_ANGLE = 2π * PHI_COMPLEMENT

"""Two pi constant"""
const TWO_PI = 2π

# ════════════════════════════════════════════════════════════════════════════════
# FIBONACCI SEQUENCES
# ════════════════════════════════════════════════════════════════════════════════

"""
    fibonacci(n::Integer) -> BigInt

Compute the n-th Fibonacci number using matrix exponentiation.
F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
"""
function fibonacci(n::Integer)
    n < 0 && throw(ArgumentError("n must be non-negative"))
    n == 0 && return BigInt(0)
    n == 1 && return BigInt(1)
    
    # Matrix exponentiation: [[1,1],[1,0]]^n
    M = BigInt[1 1; 1 0]
    result = matrix_power(M, n)
    return result[1, 2]
end

"""
    fibonacci_ratio(n::Integer) -> Float64

Compute F(n+1)/F(n), which converges to φ.
"""
function fibonacci_ratio(n::Integer)
    n < 1 && return 1.0
    return Float64(fibonacci(n + 1)) / Float64(fibonacci(n))
end

"""
    lucas(n::Integer) -> BigInt

Compute the n-th Lucas number.
L(0) = 2, L(1) = 1, L(n) = L(n-1) + L(n-2)
"""
function lucas(n::Integer)
    n < 0 && throw(ArgumentError("n must be non-negative"))
    n == 0 && return BigInt(2)
    n == 1 && return BigInt(1)
    
    a, b = BigInt(2), BigInt(1)
    for _ in 2:n
        a, b = b, a + b
    end
    return b
end

# Matrix power helper
function matrix_power(M::Matrix{BigInt}, n::Integer)
    result = BigInt[1 0; 0 1]  # Identity
    base = copy(M)
    
    while n > 0
        if n & 1 == 1
            result = result * base
        end
        base = base * base
        n >>= 1
    end
    return result
end

# ════════════════════════════════════════════════════════════════════════════════
# PHI-WEIGHTED OPERATIONS
# ════════════════════════════════════════════════════════════════════════════════

"""
    phi_weight(x, level::Int=1) -> Float64

Apply φ-weighting to a value. Higher levels apply more φ scaling.
Level 1: x × φ⁻¹
Level 2: x × φ⁻²
Level -1: x × φ
"""
function phi_weight(x::Real, level::Int=1)
    return x * PHI^(-level)
end

"""
    phi_scale(values::Vector, ascending::Bool=true) -> Vector{Float64}

Scale a vector of values with φ-weighted factors.
If ascending, earlier values get lower weights (φ⁻ⁿ).
If descending, earlier values get higher weights (φⁿ).
"""
function phi_scale(values::AbstractVector, ascending::Bool=true)
    n = length(values)
    weights = [PHI^(ascending ? -i : (n-i)) for i in 1:n]
    return Float64.(values) .* weights
end

"""
    phi_normalize(x) -> Float64

Normalize a value to [0, 1] using φ-based sigmoid.
σ_φ(x) = 1 / (1 + φ^(-x))
"""
function phi_normalize(x::Real)
    return 1.0 / (1.0 + PHI^(-x))
end

"""
    phi_weighted_mean(values::Vector, base_weight::Float64=PHI_INVERSE) -> Float64

Compute φ-weighted mean where weight_i = base_weight^i
"""
function phi_weighted_mean(values::AbstractVector, base_weight::Float64=PHI_INVERSE)
    n = length(values)
    n == 0 && return 0.0
    
    weights = [base_weight^i for i in 0:(n-1)]
    total_weight = sum(weights)
    
    return sum(Float64.(values) .* weights) / total_weight
end

"""
    phi_weighted_sum(values::Vector) -> Float64

Compute sum with φ-inverse decay: Σ(v_i × φ⁻ⁱ)
"""
function phi_weighted_sum(values::AbstractVector)
    return sum(Float64(v) * PHI_INVERSE^(i-1) for (i, v) in enumerate(values))
end

# ════════════════════════════════════════════════════════════════════════════════
# GOLDEN SPIRAL GEOMETRY
# ════════════════════════════════════════════════════════════════════════════════

"""
    golden_spiral_point(θ::Real) -> Tuple{Float64, Float64}

Compute (x, y) on golden spiral: r = φ^(2θ/π)
"""
function golden_spiral_point(θ::Real)
    r = PHI^(2θ / π)
    x = r * cos(θ)
    y = r * sin(θ)
    return (x, y)
end

"""
    golden_spiral_sequence(n::Int, start_θ::Float64=0.0, step::Float64=GOLDEN_ANGLE)

Generate n points along golden spiral, starting at start_θ with angular step.
Default step is golden angle for optimal packing.
"""
function golden_spiral_sequence(n::Int, start_θ::Float64=0.0, step::Float64=GOLDEN_ANGLE)
    points = Vector{Tuple{Float64, Float64}}(undef, n)
    θ = start_θ
    for i in 1:n
        points[i] = golden_spiral_point(θ)
        θ += step
    end
    return points
end

"""
    sunflower_pattern(n::Int, radius::Float64=1.0) -> Vector{Tuple{Float64, Float64}}

Generate n points in sunflower/Fibonacci spiral pattern for optimal 2D packing.
Uses Vogel's model with golden angle.
"""
function sunflower_pattern(n::Int, radius::Float64=1.0)
    points = Vector{Tuple{Float64, Float64}}(undef, n)
    for i in 1:n
        r = radius * sqrt(i / n)  # Sqrt for uniform density
        θ = i * GOLDEN_ANGLE
        points[i] = (r * cos(θ), r * sin(θ))
    end
    return points
end

# ════════════════════════════════════════════════════════════════════════════════
# HARMONIC SERIES & RESONANCE
# ════════════════════════════════════════════════════════════════════════════════

"""
    phi_harmonic_series(n::Int, base_freq::Float64=1.0) -> Vector{Float64}

Generate φ-scaled harmonic series: [f, f×φ, f×φ², ...]
"""
function phi_harmonic_series(n::Int, base_freq::Float64=1.0)
    return [base_freq * PHI^(i-1) for i in 1:n]
end

"""
    phi_resonance_field(x::Vector, y::Vector, sources::Vector{Tuple{Float64, Float64, Float64}})

Compute φ-weighted resonance field at grid points (x, y).
Each source is (sx, sy, amplitude).
Field strength decays as 1/r^φ from each source.
"""
function phi_resonance_field(x::AbstractVector, y::AbstractVector, 
                             sources::Vector{Tuple{Float64, Float64, Float64}})
    nx, ny = length(x), length(y)
    field = zeros(Float64, nx, ny)
    
    for (sx, sy, amp) in sources
        for j in 1:ny
            for i in 1:nx
                r = sqrt((x[i] - sx)^2 + (y[j] - sy)^2)
                r = max(r, 0.01)  # Avoid singularity
                field[i, j] += amp / r^PHI
            end
        end
    end
    
    return field
end

# ════════════════════════════════════════════════════════════════════════════════
# OSCILLATOR SYNCHRONIZATION (KURAMOTO-INSPIRED)
# ════════════════════════════════════════════════════════════════════════════════

"""
    coherence_from_phases(phases::Vector{Float64}) -> Float64

Compute coherence (order parameter magnitude R) from oscillator phases.
R = |⟨e^(iθ)⟩| = sqrt(⟨cos θ⟩² + ⟨sin θ⟩²)
"""
function coherence_from_phases(phases::AbstractVector{<:Real})
    n = length(phases)
    n == 0 && return 0.0
    
    avg_cos = mean(cos.(phases))
    avg_sin = mean(sin.(phases))
    
    return sqrt(avg_cos^2 + avg_sin^2)
end

"""
    order_parameter(phases::Vector{Float64}) -> Tuple{Float64, Float64}

Compute Kuramoto order parameter R·e^(iΨ).
Returns (R, Ψ) where R is coherence and Ψ is mean phase.
"""
function order_parameter(phases::AbstractVector{<:Real})
    n = length(phases)
    n == 0 && return (0.0, 0.0)
    
    avg_cos = mean(cos.(phases))
    avg_sin = mean(sin.(phases))
    
    R = sqrt(avg_cos^2 + avg_sin^2)
    Ψ = atan(avg_sin, avg_cos)
    
    return (R, Ψ)
end

# ════════════════════════════════════════════════════════════════════════════════
# RESONANCE FIELD TYPE
# ════════════════════════════════════════════════════════════════════════════════

"""
    ResonanceField

A living resonance field with φ-coupled oscillators.
"""
mutable struct ResonanceField
    phases::Vector{Float64}
    frequencies::Vector{Float64}
    coherences::Vector{Float64}
    coupling_matrix::Matrix{Float64}
    coupling_constant::Float64
    
    function ResonanceField(n::Int; coupling::Float64=PHI)
        phases = 2π * rand(n)
        frequencies = fill(2π / (PHI * 1000), n)  # φ-scaled base frequency
        coherences = ones(n)
        
        # φ-weighted coupling matrix
        K = zeros(n, n)
        for i in 1:n
            for j in 1:n
                if i != j
                    K[i, j] = coupling / n
                end
            end
        end
        
        new(phases, frequencies, coherences, K, coupling)
    end
end

"""
    evolve_field!(field::ResonanceField, dt::Float64)

Evolve the resonance field by timestep dt using Kuramoto dynamics.
dθ_i/dt = ω_i + Σ_j K_ij sin(θ_j - θ_i)
"""
function evolve_field!(field::ResonanceField, dt::Float64)
    n = length(field.phases)
    new_phases = similar(field.phases)
    
    for i in 1:n
        coupling_sum = 0.0
        for j in 1:n
            if i != j
                coupling_sum += field.coupling_matrix[i, j] * sin(field.phases[j] - field.phases[i])
            end
        end
        
        dθ = field.frequencies[i] + coupling_sum
        new_phases[i] = mod(field.phases[i] + dθ * dt, 2π)
    end
    
    field.phases .= new_phases
    return field
end

"""
    field_coherence(field::ResonanceField) -> Float64

Compute the global coherence of the resonance field.
"""
function field_coherence(field::ResonanceField)
    return coherence_from_phases(field.phases)
end

"""
    strengthen_bond!(field::ResonanceField, i::Int, j::Int, factor::Float64=PHI)

Strengthen the resonance bond between oscillators i and j by factor.
"""
function strengthen_bond!(field::ResonanceField, i::Int, j::Int, factor::Float64=PHI)
    field.coupling_matrix[i, j] *= factor
    field.coupling_matrix[j, i] *= factor
    return field
end

end # module PhiResonance
