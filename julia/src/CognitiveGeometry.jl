# ═══════════════════════════════════════════════════════════════════════════════
# COGNITIVE GEOMETRY — Mathematical Structure of Thought Space
# ═══════════════════════════════════════════════════════════════════════════════
# Differential geometry, topology, and fiber bundles as the mathematics of mind.
# Thought has curvature. Reasoning follows geodesics. Beliefs form manifolds.
# ═══════════════════════════════════════════════════════════════════════════════

module CognitiveGeometry

using LinearAlgebra
using Statistics

export CognitiveManifold, ThoughtTangent, BeliefBundle
export MetricTensor, RiemannCurvature, ChristoffelSymbols
export geodesic, parallel_transport, holonomy
export CognitiveFiberBundle, gauge_transform, connection_curvature
export create_cognitive_manifold, compute_geodesic, measure_curvature

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS — Geometric Cognition
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2                    # Golden ratio
const PLANCK_COGNITIVE = 1e-10                   # Minimum cognitive length

# ═══════════════════════════════════════════════════════════════════════════════
# METRIC TENSOR — How to Measure Distance in Thought Space
# ═══════════════════════════════════════════════════════════════════════════════

"""
The metric tensor g_μν defines how to measure distances in cognitive space.
Different metrics = different "shapes" of thought.
"""
struct MetricTensor
    dims::Int
    g::Function                            # (x) -> Matrix (metric at point x)
    name::Symbol                           # :euclidean, :hyperbolic, :spherical, :semantic
end

"""
Euclidean metric — flat thought space.
"""
function euclidean_metric(dims::Int)
    MetricTensor(dims, x -> Matrix{Float64}(I, dims, dims), :euclidean)
end

"""
Hyperbolic metric — negative curvature, thoughts diverge.
Poincaré disk model: ds² = 4(dx² + dy²) / (1 - |x|²)²
"""
function hyperbolic_metric(dims::Int)
    MetricTensor(dims, x -> begin
        r² = sum(x.^2)
        if r² >= 1
            r² = 0.999  # Stay in disk
        end
        scale = 4 / (1 - r²)^2
        scale * Matrix{Float64}(I, dims, dims)
    end, :hyperbolic)
end

"""
Spherical metric — positive curvature, thoughts converge.
"""
function spherical_metric(dims::Int)
    MetricTensor(dims, x -> begin
        r = norm(x)
        if r < PLANCK_COGNITIVE
            return Matrix{Float64}(I, dims, dims)
        end
        # Metric on n-sphere
        g = Matrix{Float64}(I, dims, dims)
        for i in 1:dims
            g[i,i] = 1 / (1 + r^2)
        end
        g
    end, :spherical)
end

"""
Semantic metric — metric learned from semantic similarity.
Nearby concepts have small distance.
"""
function semantic_metric(dims::Int, attractors::Vector{Vector{Float64}})
    MetricTensor(dims, x -> begin
        g = Matrix{Float64}(I, dims, dims)
        
        # Metric is scaled by distance to nearest attractor
        min_dist = minimum(norm(x - a) for a in attractors)
        scale = 1 / (1 + min_dist^2 / PHI^2)
        
        # Add anisotropy based on attractor directions
        for a in attractors
            dir = a - x
            d = norm(dir)
            if d > PLANCK_COGNITIVE
                dir = dir / d
                # Stretch metric in direction of attractors
                outer = dir * dir'
                g += scale * exp(-d / PHI) * outer
            end
        end
        
        g
    end, :semantic)
end

"""
Compute metric tensor at a point.
"""
function metric_at(m::MetricTensor, x::Vector{Float64})
    return m.g(x)
end

"""
Compute inner product with respect to metric.
"""
function inner_product(m::MetricTensor, x::Vector{Float64}, 
                      v::Vector{Float64}, w::Vector{Float64})
    g = metric_at(m, x)
    return dot(v, g * w)
end

"""
Compute norm with respect to metric.
"""
function metric_norm(m::MetricTensor, x::Vector{Float64}, v::Vector{Float64})
    return sqrt(max(0, inner_product(m, x, v, v)))
end

# ═══════════════════════════════════════════════════════════════════════════════
# CHRISTOFFEL SYMBOLS — How Vectors Change as They Move
# ═══════════════════════════════════════════════════════════════════════════════

"""
Christoffel symbols Γ^k_ij encode how vectors rotate as they parallel transport.
"""
struct ChristoffelSymbols
    metric::MetricTensor
    Γ::Function                            # (x) -> 3D array [i,j,k]
end

"""
Compute Christoffel symbols numerically.
Γ^k_ij = (1/2) g^kl (∂_i g_jl + ∂_j g_il - ∂_l g_ij)
"""
function compute_christoffel(metric::MetricTensor)
    dims = metric.dims
    δ = 1e-6
    
    Γ_func = x -> begin
        Γ = zeros(dims, dims, dims)
        g = metric_at(metric, x)
        g_inv = inv(g)
        
        # Compute metric derivatives
        ∂g = zeros(dims, dims, dims)  # ∂g[i,j,k] = ∂_k g_ij
        for k in 1:dims
            x_plus = copy(x)
            x_minus = copy(x)
            x_plus[k] += δ
            x_minus[k] -= δ
            ∂g[:,:,k] = (metric_at(metric, x_plus) - metric_at(metric, x_minus)) / (2δ)
        end
        
        # Compute Christoffel symbols
        for i in 1:dims, j in 1:dims, k in 1:dims
            for l in 1:dims
                Γ[k,i,j] += 0.5 * g_inv[k,l] * (∂g[j,l,i] + ∂g[i,l,j] - ∂g[i,j,l])
            end
        end
        
        Γ
    end
    
    ChristoffelSymbols(metric, Γ_func)
end

# ═══════════════════════════════════════════════════════════════════════════════
# RIEMANN CURVATURE — Intrinsic Shape of Thought Space
# ═══════════════════════════════════════════════════════════════════════════════

"""
Riemann curvature tensor R^ρ_σμν measures how parallel transport around 
a loop fails to return to the starting vector.
"""
struct RiemannCurvature
    christoffel::ChristoffelSymbols
    R::Function                            # (x) -> 4D array [ρ,σ,μ,ν]
end

"""
Compute Riemann curvature tensor.
R^ρ_σμν = ∂_μ Γ^ρ_νσ - ∂_ν Γ^ρ_μσ + Γ^ρ_μλ Γ^λ_νσ - Γ^ρ_νλ Γ^λ_μσ
"""
function compute_riemann(christoffel::ChristoffelSymbols)
    dims = christoffel.metric.dims
    δ = 1e-6
    
    R_func = x -> begin
        Γ = christoffel.Γ(x)
        R = zeros(dims, dims, dims, dims)
        
        # Compute Christoffel derivatives
        ∂Γ = zeros(dims, dims, dims, dims)  # ∂Γ[k,i,j,l] = ∂_l Γ^k_ij
        for l in 1:dims
            x_plus = copy(x)
            x_minus = copy(x)
            x_plus[l] += δ
            x_minus[l] -= δ
            ∂Γ[:,:,:,l] = (christoffel.Γ(x_plus) - christoffel.Γ(x_minus)) / (2δ)
        end
        
        # Compute Riemann tensor
        for ρ in 1:dims, σ in 1:dims, μ in 1:dims, ν in 1:dims
            R[ρ,σ,μ,ν] = ∂Γ[ρ,ν,σ,μ] - ∂Γ[ρ,μ,σ,ν]
            for λ in 1:dims
                R[ρ,σ,μ,ν] += Γ[ρ,μ,λ] * Γ[λ,ν,σ] - Γ[ρ,ν,λ] * Γ[λ,μ,σ]
            end
        end
        
        R
    end
    
    RiemannCurvature(christoffel, R_func)
end

"""
Compute Ricci scalar curvature (total curvature).
"""
function ricci_scalar(riemann::RiemannCurvature, x::Vector{Float64})
    dims = riemann.christoffel.metric.dims
    R_tensor = riemann.R(x)
    g = metric_at(riemann.christoffel.metric, x)
    g_inv = inv(g)
    
    # Ricci tensor: R_μν = R^ρ_μρν
    Ricci = zeros(dims, dims)
    for μ in 1:dims, ν in 1:dims
        for ρ in 1:dims
            Ricci[μ,ν] += R_tensor[ρ,μ,ρ,ν]
        end
    end
    
    # Ricci scalar: R = g^μν R_μν
    R_scalar = 0.0
    for μ in 1:dims, ν in 1:dims
        R_scalar += g_inv[μ,ν] * Ricci[μ,ν]
    end
    
    return R_scalar
end

# ═══════════════════════════════════════════════════════════════════════════════
# GEODESICS — Shortest Paths in Thought Space
# ═══════════════════════════════════════════════════════════════════════════════

"""
A thought tangent vector represents direction of cognitive flow.
"""
struct ThoughtTangent
    point::Vector{Float64}                 # Base point
    vector::Vector{Float64}                # Tangent vector
end

"""
Compute geodesic from initial point in direction of initial velocity.
Geodesics are "straight lines" in curved space — the paths thoughts 
naturally follow.
"""
function compute_geodesic(christoffel::ChristoffelSymbols,
                         x0::Vector{Float64}, v0::Vector{Float64},
                         n_steps::Int; dt::Float64=0.01)
    dims = christoffel.metric.dims
    
    # State: [position, velocity]
    x = copy(x0)
    v = copy(v0)
    
    trajectory = [copy(x)]
    velocities = [copy(v)]
    
    for _ in 1:n_steps
        Γ = christoffel.Γ(x)
        
        # Geodesic equation: d²x^k/dt² + Γ^k_ij dx^i/dt dx^j/dt = 0
        # Becomes: dv^k/dt = -Γ^k_ij v^i v^j
        dv = zeros(dims)
        for k in 1:dims
            for i in 1:dims, j in 1:dims
                dv[k] -= Γ[k,i,j] * v[i] * v[j]
            end
        end
        
        # Update
        x += dt * v
        v += dt * dv
        
        push!(trajectory, copy(x))
        push!(velocities, copy(v))
    end
    
    return (trajectory=trajectory, velocities=velocities)
end

"""
Shoot a geodesic from one point toward another.
"""
function geodesic_shooting(christoffel::ChristoffelSymbols,
                          x_start::Vector{Float64}, x_target::Vector{Float64},
                          n_steps::Int; n_iterations::Int=100, dt::Float64=0.01)
    # Initial guess: straight line direction
    v = (x_target - x_start) / (n_steps * dt)
    
    for iter in 1:n_iterations
        # Shoot geodesic
        result = compute_geodesic(christoffel, x_start, v, n_steps; dt=dt)
        x_final = result.trajectory[end]
        
        # Error
        error = norm(x_final - x_target)
        if error < 1e-6
            return result
        end
        
        # Adjust velocity (simple gradient descent)
        gradient = (x_target - x_final) / (n_steps * dt)
        v += 0.1 * gradient
    end
    
    return compute_geodesic(christoffel, x_start, v, n_steps; dt=dt)
end

# ═══════════════════════════════════════════════════════════════════════════════
# PARALLEL TRANSPORT — Moving Vectors Along Paths
# ═══════════════════════════════════════════════════════════════════════════════

"""
Parallel transport vector v along a path.
The vector stays "parallel" according to the connection.
"""
function parallel_transport(christoffel::ChristoffelSymbols,
                           path::Vector{Vector{Float64}},
                           v0::Vector{Float64})
    dims = length(v0)
    v = copy(v0)
    transported = [copy(v)]
    
    for i in 1:length(path)-1
        x = path[i]
        dx = path[i+1] - path[i]
        Γ = christoffel.Γ(x)
        
        # Parallel transport: dv^k + Γ^k_ij v^j dx^i = 0
        dv = zeros(dims)
        for k in 1:dims
            for i in 1:dims, j in 1:dims
                dv[k] -= Γ[k,i,j] * v[j] * dx[i]
            end
        end
        
        v += dv
        push!(transported, copy(v))
    end
    
    return transported
end

"""
Compute holonomy — the rotation accumulated by parallel transport around a loop.
Non-zero holonomy = curvature.
"""
function holonomy(christoffel::ChristoffelSymbols, loop::Vector{Vector{Float64}})
    dims = christoffel.metric.dims
    
    # Transport identity vectors around loop
    rotation = Matrix{Float64}(I, dims, dims)
    
    for d in 1:dims
        e = zeros(dims)
        e[d] = 1.0
        
        transported = parallel_transport(christoffel, loop, e)
        rotation[:, d] = transported[end]
    end
    
    return rotation
end

# ═══════════════════════════════════════════════════════════════════════════════
# FIBER BUNDLES — Internal Structure at Each Point
# ═══════════════════════════════════════════════════════════════════════════════

"""
A CognitiveFiberBundle associates internal structure (fiber) to each point
in cognitive space. Like attaching a "mental state space" to each belief.
"""
struct CognitiveFiberBundle
    base_dims::Int                         # Dimension of base space (beliefs)
    fiber_dims::Int                        # Dimension of fiber (mental states)
    connection::Function                   # (x) -> Matrix (Lie algebra valued)
    gauge_group::Symbol                    # :U1, :SU2, :SO3
end

function CognitiveFiberBundle(base_dims::Int, fiber_dims::Int; 
                             gauge_group::Symbol=:U1)
    # Connection 1-form A_μ
    connection = x -> begin
        A = zeros(ComplexF64, fiber_dims, fiber_dims, base_dims)
        
        # Simple harmonic connection
        for μ in 1:base_dims
            for i in 1:fiber_dims, j in 1:fiber_dims
                if i == j
                    A[i,j,μ] = 0.1 * x[mod1(μ, length(x))] * im
                elseif abs(i-j) == 1
                    A[i,j,μ] = 0.05 * exp(im * sum(x) / PHI)
                end
            end
        end
        A
    end
    
    CognitiveFiberBundle(base_dims, fiber_dims, connection, gauge_group)
end

"""
Apply gauge transformation — change internal representation without 
changing physics.
"""
function gauge_transform(bundle::CognitiveFiberBundle, x::Vector{Float64},
                        state::Vector{ComplexF64}, g::Matrix{ComplexF64})
    # Transform state: ψ' = g ψ
    new_state = g * state
    
    # Transform connection: A' = g A g⁻¹ + g dg⁻¹
    A = bundle.connection(x)
    g_inv = inv(g)
    
    new_A = zeros(ComplexF64, size(A))
    for μ in 1:bundle.base_dims
        new_A[:,:,μ] = g * A[:,:,μ] * g_inv
        # Note: dg term would require derivative of gauge parameter
    end
    
    return (state=new_state, connection=new_A)
end

"""
Compute connection curvature (field strength).
F_μν = ∂_μ A_ν - ∂_ν A_μ + [A_μ, A_ν]
"""
function connection_curvature(bundle::CognitiveFiberBundle, x::Vector{Float64})
    δ = 1e-6
    A = bundle.connection(x)
    dims = bundle.base_dims
    fiber = bundle.fiber_dims
    
    F = zeros(ComplexF64, fiber, fiber, dims, dims)
    
    # Compute derivatives of connection
    ∂A = zeros(ComplexF64, fiber, fiber, dims, dims)
    for ν in 1:dims
        x_plus = copy(x)
        x_minus = copy(x)
        x_plus[ν] += δ
        x_minus[ν] -= δ
        
        A_plus = bundle.connection(x_plus)
        A_minus = bundle.connection(x_minus)
        
        for μ in 1:dims
            ∂A[:,:,μ,ν] = (A_plus[:,:,μ] - A_minus[:,:,μ]) / (2δ)
        end
    end
    
    # Compute field strength
    for μ in 1:dims, ν in 1:dims
        F[:,:,μ,ν] = ∂A[:,:,ν,μ] - ∂A[:,:,μ,ν]
        F[:,:,μ,ν] += A[:,:,μ] * A[:,:,ν] - A[:,:,ν] * A[:,:,μ]
    end
    
    return F
end

# ═══════════════════════════════════════════════════════════════════════════════
# BELIEF BUNDLE — Beliefs + States Over Them
# ═══════════════════════════════════════════════════════════════════════════════

"""
A BeliefBundle represents the full cognitive state: where in belief space,
plus internal mental state at that location.
"""
mutable struct BeliefBundle
    position::Vector{Float64}              # Position in belief space
    fiber_state::Vector{ComplexF64}        # Internal mental state
    bundle::CognitiveFiberBundle
    history::Vector{Tuple{Vector{Float64}, Vector{ComplexF64}}}
end

function BeliefBundle(bundle::CognitiveFiberBundle)
    pos = randn(bundle.base_dims) .* PHI_INVERSE
    state = normalize(randn(ComplexF64, bundle.fiber_dims))
    
    BeliefBundle(pos, state, bundle, Tuple{Vector{Float64}, Vector{ComplexF64}}[])
end

"""
Transport belief along a path, parallel transporting the fiber state.
"""
function transport!(belief::BeliefBundle, path::Vector{Vector{Float64}})
    for i in 1:length(path)-1
        # Move in base space
        dx = path[i+1] - belief.position
        belief.position = path[i+1]
        
        # Parallel transport fiber state
        A = belief.bundle.connection(belief.position)
        
        # Wilson line: exp(-i A_μ dx^μ)
        transport_op = Matrix{ComplexF64}(I, belief.bundle.fiber_dims, belief.bundle.fiber_dims)
        for μ in 1:belief.bundle.base_dims
            if μ <= length(dx)
                transport_op -= im * A[:,:,μ] * dx[μ]
            end
        end
        
        belief.fiber_state = transport_op * belief.fiber_state
        belief.fiber_state = normalize(belief.fiber_state)
        
        push!(belief.history, (copy(belief.position), copy(belief.fiber_state)))
    end
end

# ═══════════════════════════════════════════════════════════════════════════════
# COGNITIVE MANIFOLD — Complete Geometric Structure
# ═══════════════════════════════════════════════════════════════════════════════

"""
A CognitiveManifold is the complete geometric structure of thought space.
"""
struct CognitiveManifold
    name::String
    dims::Int
    metric::MetricTensor
    christoffel::ChristoffelSymbols
    riemann::RiemannCurvature
    bundle::CognitiveFiberBundle
end

function create_cognitive_manifold(name::String; dims::Int=5,
                                   metric_type::Symbol=:semantic,
                                   n_attractors::Int=3)
    # Create metric
    metric = if metric_type == :euclidean
        euclidean_metric(dims)
    elseif metric_type == :hyperbolic
        hyperbolic_metric(dims)
    elseif metric_type == :spherical
        spherical_metric(dims)
    elseif metric_type == :semantic
        attractors = [randn(dims) .* PHI for _ in 1:n_attractors]
        semantic_metric(dims, attractors)
    else
        euclidean_metric(dims)
    end
    
    christoffel = compute_christoffel(metric)
    riemann = compute_riemann(christoffel)
    bundle = CognitiveFiberBundle(dims, 2)
    
    CognitiveManifold(name, dims, metric, christoffel, riemann, bundle)
end

"""
Measure curvature at a point.
"""
function measure_curvature(manifold::CognitiveManifold, x::Vector{Float64})
    R = ricci_scalar(manifold.riemann, x)
    
    return Dict(
        :ricci_scalar => R,
        :metric_determinant => det(metric_at(manifold.metric, x)),
        :curvature_type => R > 0 ? :positive : R < 0 ? :negative : :flat
    )
end

"""
Summarize cognitive manifold.
"""
function summarize(manifold::CognitiveManifold)
    # Sample curvature at origin
    x0 = zeros(manifold.dims)
    curv = measure_curvature(manifold, x0)
    
    println("╔════════════════════════════════════════════════════════════════╗")
    println("║         COGNITIVE MANIFOLD: $(manifold.name)")
    println("╠════════════════════════════════════════════════════════════════╣")
    println("║  Dimensions:          $(manifold.dims)")
    println("║  Metric type:         $(manifold.metric.name)")
    println("║  Fiber dimensions:    $(manifold.bundle.fiber_dims)")
    println("║  Gauge group:         $(manifold.bundle.gauge_group)")
    println("║  Curvature at origin: $(round(curv[:ricci_scalar], digits=4))")
    println("║  Curvature type:      $(curv[:curvature_type])")
    println("╚════════════════════════════════════════════════════════════════╝")
end

end # module CognitiveGeometry
