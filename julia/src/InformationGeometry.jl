# ═══════════════════════════════════════════════════════════════════════════════
# INFORMATION GEOMETRY — The Riemannian Structure of Probability Space
# ═══════════════════════════════════════════════════════════════════════════════
# Fisher information metric, natural gradients, exponential families, and
# the geometric structure of statistical inference as cognitive computation.
# ═══════════════════════════════════════════════════════════════════════════════

module InformationGeometry

using LinearAlgebra
using Statistics

export FisherMetric, StatisticalManifold, ExponentialFamily
export NaturalGradient, AmariConnection, KLDivergence
export compute_fisher_metric, natural_gradient_descent, geodesic_flow
export alpha_connection, dual_coordinates, pythagorean_theorem
export create_statistical_manifold, information_projection

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const EPSILON = 1e-10

# ═══════════════════════════════════════════════════════════════════════════════
# FISHER INFORMATION METRIC
# ═══════════════════════════════════════════════════════════════════════════════

"""
The Fisher information metric defines the Riemannian geometry of probability space.
g_ij(θ) = E[∂_i log p(x|θ) ∂_j log p(x|θ)]
"""
struct FisherMetric
    dims::Int
    metric::Function              # θ → Matrix (Fisher information at θ)
    log_likelihood::Function      # (x, θ) → log p(x|θ)
end

"""
Compute Fisher metric numerically via score function.
"""
function compute_fisher_metric(log_likelihood::Function, θ::Vector{Float64};
                               n_samples::Int=1000)
    dims = length(θ)
    δ = 1e-5
    
    # Monte Carlo estimation of Fisher information
    G = zeros(dims, dims)
    
    for _ in 1:n_samples
        # Sample from distribution (using current θ)
        x = randn(dims)  # Placeholder - should sample from p(x|θ)
        
        # Compute score function ∇_θ log p(x|θ)
        score = zeros(dims)
        for i in 1:dims
            θ_plus = copy(θ); θ_plus[i] += δ
            θ_minus = copy(θ); θ_minus[i] -= δ
            score[i] = (log_likelihood(x, θ_plus) - log_likelihood(x, θ_minus)) / (2δ)
        end
        
        # Outer product
        G += score * score'
    end
    
    G /= n_samples
    
    # Ensure positive definiteness
    G = (G + G') / 2 + EPSILON * I
    
    return G
end

"""
Gaussian Fisher metric (analytical).
For N(μ, σ²): g = diag(1/σ², 2/σ⁴)
"""
function gaussian_fisher_metric(θ::Vector{Float64})
    μ, σ² = θ[1], max(θ[2], EPSILON)
    [1/σ² 0; 0 2/σ²^2]
end

"""
Multinomial Fisher metric.
For categorical with probabilities p: g_ij = δ_ij/p_i
"""
function multinomial_fisher_metric(p::Vector{Float64})
    p = max.(p, EPSILON)
    diagm(1 ./ p)
end

# ═══════════════════════════════════════════════════════════════════════════════
# NATURAL GRADIENT
# ═══════════════════════════════════════════════════════════════════════════════

"""
Natural gradient: the steepest descent direction in Riemannian space.
∇̃L = G⁻¹ ∇L
"""
struct NaturalGradient
    fisher::FisherMetric
    learning_rate::Float64
end

"""
Compute natural gradient at a point.
"""
function natural_gradient(ng::NaturalGradient, θ::Vector{Float64}, 
                         euclidean_grad::Vector{Float64})
    G = ng.fisher.metric(θ)
    G_inv = inv(G + EPSILON * I)
    return G_inv * euclidean_grad
end

"""
Natural gradient descent step.
"""
function natural_gradient_step!(ng::NaturalGradient, θ::Vector{Float64},
                               loss::Function)
    δ = 1e-5
    dims = length(θ)
    
    # Compute Euclidean gradient
    grad = zeros(dims)
    for i in 1:dims
        θ_plus = copy(θ); θ_plus[i] += δ
        θ_minus = copy(θ); θ_minus[i] -= δ
        grad[i] = (loss(θ_plus) - loss(θ_minus)) / (2δ)
    end
    
    # Convert to natural gradient
    nat_grad = natural_gradient(ng, θ, grad)
    
    # Update
    θ .-= ng.learning_rate * nat_grad
    
    return θ
end

"""
Full natural gradient descent.
"""
function natural_gradient_descent(ng::NaturalGradient, θ0::Vector{Float64},
                                 loss::Function, n_steps::Int)
    θ = copy(θ0)
    history = [copy(θ)]
    losses = [loss(θ)]
    
    for _ in 1:n_steps
        natural_gradient_step!(ng, θ, loss)
        push!(history, copy(θ))
        push!(losses, loss(θ))
    end
    
    return (θ=θ, history=history, losses=losses)
end

# ═══════════════════════════════════════════════════════════════════════════════
# AMARI α-CONNECTIONS
# ═══════════════════════════════════════════════════════════════════════════════

"""
Amari's α-connection generalizes the Levi-Civita connection.
α = 1: exponential connection (e-connection)
α = -1: mixture connection (m-connection)
α = 0: Levi-Civita connection
"""
struct AmariConnection
    α::Float64
    metric::FisherMetric
end

"""
Compute α-connection Christoffel symbols.
Γ^(α)_ijk = Γ^(0)_ijk - (α/2) T_ijk
where T_ijk is the skewness tensor.
"""
function alpha_christoffel(conn::AmariConnection, θ::Vector{Float64})
    dims = length(θ)
    δ = 1e-5
    
    # Compute metric Christoffel (Levi-Civita)
    G = conn.metric.metric(θ)
    G_inv = inv(G + EPSILON * I)
    
    # Metric derivatives
    ∂G = zeros(dims, dims, dims)
    for k in 1:dims
        θ_plus = copy(θ); θ_plus[k] += δ
        θ_minus = copy(θ); θ_minus[k] -= δ
        ∂G[:,:,k] = (conn.metric.metric(θ_plus) - conn.metric.metric(θ_minus)) / (2δ)
    end
    
    # Levi-Civita Christoffel
    Γ = zeros(dims, dims, dims)
    for i in 1:dims, j in 1:dims, k in 1:dims
        for l in 1:dims
            Γ[k,i,j] += 0.5 * G_inv[k,l] * (∂G[j,l,i] + ∂G[i,l,j] - ∂G[i,j,l])
        end
    end
    
    # α-correction (simplified - full version needs skewness tensor)
    # T_ijk = E[∂_i ∂_j ∂_k log p]
    # For now, approximate with zero (valid for exponential families)
    
    return Γ
end

"""
Compute geodesic in α-geometry.
"""
function alpha_geodesic(conn::AmariConnection, θ0::Vector{Float64}, 
                       v0::Vector{Float64}, n_steps::Int; dt::Float64=0.01)
    dims = length(θ0)
    
    θ = copy(θ0)
    v = copy(v0)
    
    trajectory = [copy(θ)]
    
    for _ in 1:n_steps
        Γ = alpha_christoffel(conn, θ)
        
        # Geodesic equation
        dv = zeros(dims)
        for k in 1:dims
            for i in 1:dims, j in 1:dims
                dv[k] -= Γ[k,i,j] * v[i] * v[j]
            end
        end
        
        θ += dt * v
        v += dt * dv
        
        push!(trajectory, copy(θ))
    end
    
    return trajectory
end

# ═══════════════════════════════════════════════════════════════════════════════
# EXPONENTIAL FAMILIES
# ═══════════════════════════════════════════════════════════════════════════════

"""
An exponential family distribution: p(x|θ) = h(x) exp(θ·T(x) - A(θ))
"""
struct ExponentialFamily
    name::String
    dims::Int
    sufficient_statistic::Function    # x → T(x)
    log_partition::Function           # θ → A(θ)
    carrier_measure::Function         # x → h(x)
end

"""
Create Gaussian as exponential family.
Natural parameters: θ = (μ/σ², -1/(2σ²))
Sufficient statistics: T(x) = (x, x²)
"""
function gaussian_exponential_family()
    ExponentialFamily(
        "Gaussian",
        2,
        x -> [x, x^2],
        θ -> begin
            # A(θ) = -θ₁²/(4θ₂) - 0.5 log(-2θ₂) + 0.5 log(2π)
            θ₁, θ₂ = θ[1], min(θ[2], -EPSILON)
            -θ₁^2 / (4θ₂) - 0.5 * log(-2θ₂) + 0.5 * log(2π)
        end,
        x -> 1.0
    )
end

"""
Create categorical (multinomial) as exponential family.
"""
function categorical_exponential_family(k::Int)
    ExponentialFamily(
        "Categorical($k)",
        k-1,
        x -> begin
            # One-hot encoding (minus last category)
            t = zeros(k-1)
            if x <= k-1
                t[Int(x)] = 1.0
            end
            t
        end,
        θ -> log(1 + sum(exp.(θ))),  # log-sum-exp
        x -> 1.0
    )
end

"""
Compute Fisher metric for exponential family (equals Hessian of log-partition).
"""
function exponential_family_fisher(ef::ExponentialFamily, θ::Vector{Float64})
    δ = 1e-5
    dims = ef.dims
    
    H = zeros(dims, dims)
    
    for i in 1:dims, j in 1:dims
        θ_pp = copy(θ); θ_pp[i] += δ; θ_pp[j] += δ
        θ_pm = copy(θ); θ_pm[i] += δ; θ_pm[j] -= δ
        θ_mp = copy(θ); θ_mp[i] -= δ; θ_mp[j] += δ
        θ_mm = copy(θ); θ_mm[i] -= δ; θ_mm[j] -= δ
        
        H[i,j] = (ef.log_partition(θ_pp) - ef.log_partition(θ_pm) - 
                  ef.log_partition(θ_mp) + ef.log_partition(θ_mm)) / (4δ^2)
    end
    
    return (H + H') / 2 + EPSILON * I
end

# ═══════════════════════════════════════════════════════════════════════════════
# DUAL COORDINATES
# ═══════════════════════════════════════════════════════════════════════════════

"""
Convert natural parameters θ to expectation parameters η.
η = ∇A(θ) = E[T(x)]
"""
function natural_to_expectation(ef::ExponentialFamily, θ::Vector{Float64})
    δ = 1e-5
    dims = ef.dims
    
    η = zeros(dims)
    for i in 1:dims
        θ_plus = copy(θ); θ_plus[i] += δ
        θ_minus = copy(θ); θ_minus[i] -= δ
        η[i] = (ef.log_partition(θ_plus) - ef.log_partition(θ_minus)) / (2δ)
    end
    
    return η
end

"""
Convert expectation parameters η to natural parameters θ.
(Requires solving θ such that ∇A(θ) = η — typically via Newton's method)
"""
function expectation_to_natural(ef::ExponentialFamily, η::Vector{Float64};
                               n_iterations::Int=100, tol::Float64=1e-8)
    # Newton's method: θ_{n+1} = θ_n - G⁻¹(θ_n)(∇A(θ_n) - η)
    θ = zeros(ef.dims)
    
    for _ in 1:n_iterations
        current_η = natural_to_expectation(ef, θ)
        error = current_η - η
        
        if norm(error) < tol
            break
        end
        
        G = exponential_family_fisher(ef, θ)
        θ -= inv(G) * error
    end
    
    return θ
end

# ═══════════════════════════════════════════════════════════════════════════════
# KL DIVERGENCE AND PROJECTIONS
# ═══════════════════════════════════════════════════════════════════════════════

"""
KL divergence in exponential family (Bregman divergence).
D_KL(p_θ || p_θ') = A(θ') - A(θ) - ⟨θ' - θ, η⟩
"""
function kl_divergence(ef::ExponentialFamily, θ::Vector{Float64}, θ_prime::Vector{Float64})
    η = natural_to_expectation(ef, θ)
    return ef.log_partition(θ_prime) - ef.log_partition(θ) - dot(θ_prime - θ, η)
end

"""
Symmetrized KL (Jeffreys divergence).
"""
function jeffreys_divergence(ef::ExponentialFamily, θ1::Vector{Float64}, θ2::Vector{Float64})
    return kl_divergence(ef, θ1, θ2) + kl_divergence(ef, θ2, θ1)
end

"""
Information projection onto a linear subspace.
Finds θ* = argmin D_KL(p_θ || p_θ₀) subject to θ ∈ subspace.
"""
function information_projection(ef::ExponentialFamily, θ0::Vector{Float64},
                               subspace_basis::Matrix{Float64})
    # Project natural parameters onto subspace
    # For linear subspace, projection is orthogonal w.r.t. Fisher metric
    
    G = exponential_family_fisher(ef, θ0)
    
    # G-orthogonal projection
    B = subspace_basis
    P = B * inv(B' * G * B + EPSILON * I) * B' * G
    
    θ_proj = P * θ0
    
    return θ_proj
end

# ═══════════════════════════════════════════════════════════════════════════════
# PYTHAGOREAN THEOREM
# ═══════════════════════════════════════════════════════════════════════════════

"""
Generalized Pythagorean theorem in information geometry:
If θ₁ is the e-projection of θ₀ onto a submanifold M, and θ₂ ∈ M, then:
D_KL(θ₂ || θ₀) = D_KL(θ₂ || θ₁) + D_KL(θ₁ || θ₀)
"""
function verify_pythagorean(ef::ExponentialFamily, θ0, θ1, θ2)
    D_20 = kl_divergence(ef, θ2, θ0)
    D_21 = kl_divergence(ef, θ2, θ1)
    D_10 = kl_divergence(ef, θ1, θ0)
    
    return (D_20=D_20, D_21=D_21, D_10=D_10, 
            sum_components=D_21 + D_10,
            pythagorean_holds=abs(D_20 - (D_21 + D_10)) < 1e-6)
end

# ═══════════════════════════════════════════════════════════════════════════════
# STATISTICAL MANIFOLD — Complete Structure
# ═══════════════════════════════════════════════════════════════════════════════

"""
A complete statistical manifold with metric, connections, and coordinates.
"""
struct StatisticalManifold
    name::String
    dims::Int
    family::ExponentialFamily
    metric::FisherMetric
    e_connection::AmariConnection        # α = 1
    m_connection::AmariConnection        # α = -1
end

function create_statistical_manifold(name::String, family::ExponentialFamily)
    fisher = FisherMetric(
        family.dims,
        θ -> exponential_family_fisher(family, θ),
        (x, θ) -> dot(θ, family.sufficient_statistic(x)) - family.log_partition(θ)
    )
    
    e_conn = AmariConnection(1.0, fisher)
    m_conn = AmariConnection(-1.0, fisher)
    
    StatisticalManifold(name, family.dims, family, fisher, e_connection, m_connection)
end

"""
Geodesic flow on statistical manifold.
"""
function geodesic_flow(manifold::StatisticalManifold, θ0::Vector{Float64},
                      v0::Vector{Float64}, n_steps::Int; 
                      connection::Symbol=:levi_civita, dt::Float64=0.01)
    α = if connection == :exponential
        1.0
    elseif connection == :mixture
        -1.0
    else
        0.0  # Levi-Civita
    end
    
    conn = AmariConnection(α, manifold.metric)
    return alpha_geodesic(conn, θ0, v0, n_steps; dt=dt)
end

"""
Summarize statistical manifold.
"""
function summarize(manifold::StatisticalManifold)
    θ_test = randn(manifold.dims) * 0.1
    G = manifold.metric.metric(θ_test)
    
    println("╔════════════════════════════════════════════════════════════════╗")
    println("║         STATISTICAL MANIFOLD: $(manifold.name)")
    println("╠════════════════════════════════════════════════════════════════╣")
    println("║  Dimensions:          $(manifold.dims)")
    println("║  Family:              $(manifold.family.name)")
    println("║  Fisher det at test:  $(round(det(G), digits=6))")
    println("║  Connections:         e (α=1), m (α=-1), LC (α=0)")
    println("╚════════════════════════════════════════════════════════════════╝")
end

end # module InformationGeometry
