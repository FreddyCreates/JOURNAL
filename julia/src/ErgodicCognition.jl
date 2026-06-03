# ═══════════════════════════════════════════════════════════════════════════════
# ERGODIC COGNITION — Long-Term Convergence of Thought Processes
# ═══════════════════════════════════════════════════════════════════════════════
# Ergodic theory applied to cognitive systems: mixing, recurrence, and the
# eventual exploration of all accessible mental states.
# ═══════════════════════════════════════════════════════════════════════════════

module ErgodicCognition

using LinearAlgebra
using Statistics

export ErgodicProcess, MixingDynamics, InvariantMeasure
export RecurrenceAnalysis, LyapunovSpectrum
export compute_invariant_measure, mixing_time, autocorrelation_decay
export poincare_recurrence, ergodic_average, birkhoff_average
export create_ergodic_mind, evolve_ergodic!, measure_ergodicity

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const EPSILON = 1e-10

# ═══════════════════════════════════════════════════════════════════════════════
# ERGODIC PROCESS — Cognitive Dynamics with Invariant Measure
# ═══════════════════════════════════════════════════════════════════════════════

"""
An ergodic process represents cognitive dynamics that eventually explore
all accessible states with frequencies matching an invariant measure.
"""
mutable struct ErgodicProcess
    dims::Int
    state::Vector{Float64}
    transition::Function              # x → x' (deterministic + noise)
    invariant_density::Function       # x → ρ(x)
    trajectory::Vector{Vector{Float64}}
    time::Int
end

function ErgodicProcess(dims::Int; transition=nothing, density=nothing)
    # Default: Ornstein-Uhlenbeck-like process (ergodic, Gaussian invariant)
    trans = isnothing(transition) ? 
        (x -> 0.9 * x + 0.1 * randn(length(x))) : transition
    
    dens = isnothing(density) ?
        (x -> exp(-sum(x.^2) / 2) / sqrt(2π)^dims) : density
    
    ErgodicProcess(
        dims,
        randn(dims),
        trans,
        dens,
        Vector{Float64}[],
        0
    )
end

"""
Evolve ergodic process for n steps.
"""
function evolve!(proc::ErgodicProcess, n_steps::Int)
    for _ in 1:n_steps
        proc.state = proc.transition(proc.state)
        push!(proc.trajectory, copy(proc.state))
        proc.time += 1
    end
    return proc
end

# ═══════════════════════════════════════════════════════════════════════════════
# INVARIANT MEASURE
# ═══════════════════════════════════════════════════════════════════════════════

"""
Invariant measure μ satisfies: μ(A) = ∫ P(x, A) dμ(x)
"""
struct InvariantMeasure
    dims::Int
    density::Function                 # x → ρ(x)
    support::Tuple{Vector{Float64}, Vector{Float64}}  # (lower, upper) bounds
end

"""
Estimate invariant measure from trajectory using kernel density estimation.
"""
function compute_invariant_measure(trajectory::Vector{Vector{Float64}};
                                   bandwidth::Float64=0.5)
    dims = length(trajectory[1])
    n = length(trajectory)
    
    # Kernel density estimator
    density = x -> begin
        d = 0.0
        for y in trajectory
            d += exp(-sum((x - y).^2) / (2 * bandwidth^2))
        end
        d / (n * (bandwidth * sqrt(2π))^dims)
    end
    
    # Estimate support from trajectory
    all_coords = hcat(trajectory...)'
    lower = vec(minimum(all_coords, dims=1)) .- 3*bandwidth
    upper = vec(maximum(all_coords, dims=1)) .+ 3*bandwidth
    
    InvariantMeasure(dims, density, (lower, upper))
end

"""
Sample from invariant measure via rejection sampling.
"""
function sample_invariant(measure::InvariantMeasure, n_samples::Int)
    samples = Vector{Float64}[]
    max_density = measure.density(zeros(measure.dims)) * 2  # Heuristic
    
    while length(samples) < n_samples
        # Propose uniformly
        x = measure.support[1] + rand(measure.dims) .* (measure.support[2] - measure.support[1])
        
        # Accept/reject
        if rand() * max_density < measure.density(x)
            push!(samples, x)
        end
    end
    
    return samples
end

# ═══════════════════════════════════════════════════════════════════════════════
# MIXING DYNAMICS
# ═══════════════════════════════════════════════════════════════════════════════

"""
Mixing dynamics: correlations decay over time.
A system is mixing if: lim_{n→∞} μ(A ∩ T⁻ⁿB) = μ(A)μ(B)
"""
struct MixingDynamics
    process::ErgodicProcess
    mixing_rate::Float64              # Exponential decay rate
    mixing_time::Int                  # Time to reach ε-mixing
end

"""
Estimate mixing time from autocorrelation decay.
"""
function mixing_time(proc::ErgodicProcess; threshold::Float64=0.1)
    if length(proc.trajectory) < 100
        evolve!(proc, 1000)
    end
    
    acf = autocorrelation(proc.trajectory)
    
    # Find first time autocorrelation drops below threshold
    for (t, r) in enumerate(acf)
        if abs(r) < threshold
            return t
        end
    end
    
    return length(acf)  # Didn't mix
end

"""
Compute autocorrelation function of trajectory.
"""
function autocorrelation(trajectory::Vector{Vector{Float64}}; max_lag::Int=100)
    n = length(trajectory)
    max_lag = min(max_lag, n - 1)
    
    # Use first coordinate
    x = [t[1] for t in trajectory]
    μ = mean(x)
    σ² = var(x)
    
    acf = zeros(max_lag + 1)
    for lag in 0:max_lag
        cov = mean((x[1:n-lag] .- μ) .* (x[lag+1:n] .- μ))
        acf[lag + 1] = cov / (σ² + EPSILON)
    end
    
    return acf
end

"""
Estimate exponential mixing rate.
"""
function estimate_mixing_rate(trajectory::Vector{Vector{Float64}})
    acf = autocorrelation(trajectory)
    
    # Fit exponential decay: acf(t) ≈ exp(-λt)
    # log(acf) ≈ -λt
    t = collect(1:length(acf))
    log_acf = log.(max.(abs.(acf), EPSILON))
    
    # Linear regression
    λ = -sum(t .* log_acf) / sum(t.^2)
    
    return max(λ, 0.0)
end

# ═══════════════════════════════════════════════════════════════════════════════
# RECURRENCE ANALYSIS
# ═══════════════════════════════════════════════════════════════════════════════

"""
Poincaré recurrence: an ergodic system returns arbitrarily close to any visited state.
"""
struct RecurrenceAnalysis
    trajectory::Vector{Vector{Float64}}
    recurrence_matrix::Matrix{Bool}
    recurrence_rate::Float64
    mean_recurrence_time::Float64
end

"""
Compute recurrence analysis.
"""
function poincare_recurrence(trajectory::Vector{Vector{Float64}};
                            radius::Float64=0.5)
    n = length(trajectory)
    
    # Recurrence matrix: R[i,j] = 1 if ||x_i - x_j|| < radius
    R = falses(n, n)
    for i in 1:n, j in 1:n
        if norm(trajectory[i] - trajectory[j]) < radius
            R[i, j] = true
        end
    end
    
    # Recurrence rate
    rr = sum(R) / n^2
    
    # Mean recurrence time (average diagonal length in recurrence plot)
    recurrence_times = Int[]
    for i in 1:n
        for j in i+1:n
            if R[i, j]
                push!(recurrence_times, j - i)
                break
            end
        end
    end
    mrt = isempty(recurrence_times) ? Inf : mean(recurrence_times)
    
    RecurrenceAnalysis(trajectory, R, rr, mrt)
end

"""
Compute recurrence quantification analysis (RQA) measures.
"""
function rqa_measures(ra::RecurrenceAnalysis)
    n = size(ra.recurrence_matrix, 1)
    R = ra.recurrence_matrix
    
    # Determinism: fraction of recurrence points forming diagonal lines
    diagonal_lines = 0
    diagonal_points = 0
    for i in 1:n-1
        len = 0
        for j in 1:n-1
            if R[i+j, j] == R[i, 1]  # Diagonal check
                len += 1
            else
                if len >= 2
                    diagonal_lines += 1
                    diagonal_points += len
                end
                len = 0
            end
        end
    end
    
    det = diagonal_points / (sum(R) + EPSILON)
    
    # Laminarity: fraction forming vertical lines
    vertical_lines = 0
    vertical_points = 0
    for j in 1:n
        len = 0
        for i in 1:n
            if R[i, j]
                len += 1
            else
                if len >= 2
                    vertical_lines += 1
                    vertical_points += len
                end
                len = 0
            end
        end
    end
    
    lam = vertical_points / (sum(R) + EPSILON)
    
    return (determinism=det, laminarity=lam, recurrence_rate=ra.recurrence_rate)
end

# ═══════════════════════════════════════════════════════════════════════════════
# LYAPUNOV SPECTRUM
# ═══════════════════════════════════════════════════════════════════════════════

"""
Lyapunov exponents measure the rate of separation of infinitesimally close trajectories.
"""
struct LyapunovSpectrum
    exponents::Vector{Float64}
    dims::Int
    max_lyapunov::Float64
    sum_lyapunov::Float64             # Related to entropy production
end

"""
Estimate Lyapunov spectrum from trajectory using Jacobian.
"""
function estimate_lyapunov(proc::ErgodicProcess, jacobian::Function;
                          n_steps::Int=1000, n_transient::Int=100)
    dims = proc.dims
    
    # Transient
    evolve!(proc, n_transient)
    
    # Initialize orthonormal vectors
    Q = Matrix{Float64}(I, dims, dims)
    
    exponents = zeros(dims)
    
    for _ in 1:n_steps
        x = proc.state
        
        # Evolve tangent vectors
        J = jacobian(x)
        Q = J * Q
        
        # QR decomposition (Gram-Schmidt)
        Q, R = qr(Q)
        Q = Matrix(Q)
        
        # Accumulate Lyapunov exponents
        for i in 1:dims
            exponents[i] += log(abs(R[i, i]) + EPSILON)
        end
        
        evolve!(proc, 1)
    end
    
    exponents ./= n_steps
    sort!(exponents, rev=true)
    
    LyapunovSpectrum(exponents, dims, exponents[1], sum(exponents))
end

"""
Estimate maximum Lyapunov exponent using divergence of nearby trajectories.
"""
function max_lyapunov_divergence(proc::ErgodicProcess; 
                                δ0::Float64=1e-6, n_steps::Int=1000)
    dims = proc.dims
    
    # Create perturbed copy
    proc2 = ErgodicProcess(dims; transition=proc.transition)
    proc2.state = proc.state + δ0 * normalize(randn(dims))
    
    divergences = Float64[]
    
    for _ in 1:n_steps
        evolve!(proc, 1)
        evolve!(proc2, 1)
        
        δ = norm(proc.state - proc2.state)
        push!(divergences, log(δ / δ0))
        
        # Rescale to avoid overflow
        if δ > 1.0
            proc2.state = proc.state + δ0 * normalize(proc2.state - proc.state)
        end
    end
    
    # Linear fit: log(δ/δ0) ≈ λ * t
    t = collect(1:n_steps)
    λ = sum(divergences) / sum(t)
    
    return λ
end

# ═══════════════════════════════════════════════════════════════════════════════
# ERGODIC AVERAGES
# ═══════════════════════════════════════════════════════════════════════════════

"""
Birkhoff ergodic average: lim_{N→∞} (1/N) Σ f(T^n x) = ∫ f dμ
"""
function birkhoff_average(trajectory::Vector{Vector{Float64}}, f::Function)
    n = length(trajectory)
    running_avg = zeros(n)
    
    cumsum = 0.0
    for i in 1:n
        cumsum += f(trajectory[i])
        running_avg[i] = cumsum / i
    end
    
    return (final_average=running_avg[end], running_average=running_avg)
end

"""
Time average vs space average comparison (tests ergodicity).
"""
function ergodic_average(proc::ErgodicProcess, f::Function;
                        n_time::Int=1000, n_space::Int=100)
    # Time average
    evolve!(proc, n_time)
    time_avg = mean(f(x) for x in proc.trajectory[end-n_time+1:end])
    
    # Space average (sample from invariant measure)
    measure = compute_invariant_measure(proc.trajectory)
    samples = sample_invariant(measure, n_space)
    space_avg = mean(f(x) for x in samples)
    
    return (time_average=time_avg, space_average=space_avg,
            relative_error=abs(time_avg - space_avg) / (abs(space_avg) + EPSILON))
end

# ═══════════════════════════════════════════════════════════════════════════════
# ERGODIC MIND — Complete Cognitive Ergodic System
# ═══════════════════════════════════════════════════════════════════════════════

"""
An ergodic mind explores all cognitive states with eventual regularity.
"""
mutable struct ErgodicMind
    name::String
    process::ErgodicProcess
    invariant_measure::Union{InvariantMeasure, Nothing}
    mixing_dynamics::Union{MixingDynamics, Nothing}
    lyapunov::Union{LyapunovSpectrum, Nothing}
    recurrence::Union{RecurrenceAnalysis, Nothing}
    generation::Int
end

function create_ergodic_mind(name::String; dims::Int=5)
    # Create ergodic transition with chaotic dynamics
    A = randn(dims, dims) * 0.3
    A = A - I * maximum(real.(eigvals(A)))  # Ensure some stability
    
    transition = x -> begin
        # Nonlinear map with attracting fixed point + noise
        y = A * x + 0.1 * sin.(x * PHI)
        y + 0.1 * randn(dims)
    end
    
    proc = ErgodicProcess(dims; transition=transition)
    
    ErgodicMind(name, proc, nothing, nothing, nothing, nothing, 0)
end

"""
Evolve ergodic mind and compute analysis.
"""
function evolve_ergodic!(mind::ErgodicMind, n_steps::Int)
    evolve!(mind.process, n_steps)
    mind.generation += n_steps
    
    # Update invariant measure
    if length(mind.process.trajectory) > 100
        mind.invariant_measure = compute_invariant_measure(mind.process.trajectory)
    end
    
    # Update mixing
    if length(mind.process.trajectory) > 200
        rate = estimate_mixing_rate(mind.process.trajectory)
        mt = mixing_time(mind.process)
        mind.mixing_dynamics = MixingDynamics(mind.process, rate, mt)
    end
    
    # Update recurrence
    if length(mind.process.trajectory) > 100
        mind.recurrence = poincare_recurrence(mind.process.trajectory[end-99:end])
    end
    
    return mind
end

"""
Measure ergodicity of mind.
"""
function measure_ergodicity(mind::ErgodicMind)
    f = x -> x[1]^2  # Test function
    
    result = ergodic_average(mind.process, f)
    
    mixing_rate = isnothing(mind.mixing_dynamics) ? NaN : mind.mixing_dynamics.mixing_rate
    recurrence_rate = isnothing(mind.recurrence) ? NaN : mind.recurrence.recurrence_rate
    
    return Dict(
        :time_space_error => result.relative_error,
        :mixing_rate => mixing_rate,
        :recurrence_rate => recurrence_rate,
        :is_ergodic => result.relative_error < 0.1
    )
end

"""
Summarize ergodic mind.
"""
function summarize(mind::ErgodicMind)
    erg = measure_ergodicity(mind)
    
    println("╔════════════════════════════════════════════════════════════════╗")
    println("║         ERGODIC MIND: $(mind.name)")
    println("╠════════════════════════════════════════════════════════════════╣")
    println("║  Dimensions:          $(mind.process.dims)")
    println("║  Generation:          $(mind.generation)")
    println("║  Time-Space Error:    $(round(erg[:time_space_error], digits=4))")
    println("║  Mixing Rate:         $(round(erg[:mixing_rate], digits=4))")
    println("║  Recurrence Rate:     $(round(erg[:recurrence_rate], digits=4))")
    println("║  Is Ergodic:          $(erg[:is_ergodic])")
    println("╚════════════════════════════════════════════════════════════════╝")
end

end # module ErgodicCognition
