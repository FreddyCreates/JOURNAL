# ═══════════════════════════════════════════════════════════════════════════════
# NEURAL COUPLING ENGINE — Deep Mathematical Brain Dynamics
# ═══════════════════════════════════════════════════════════════════════════════
# Mathematical models of neural coupling, synchronization, and information flow.
# Not simulation — computation as neural process.
# ═══════════════════════════════════════════════════════════════════════════════

module NeuralCoupling

using LinearAlgebra
using Statistics

export Neuron, NeuralPopulation, CouplingMatrix
export WilsonCowanDynamics, FitzHughNagumo, HodgkinHuxley
export IzhikevichNeuron, LeakyIntegrateFire
export InformationFlow, TransferEntropy, GrangerCausality
export create_neural_substrate, simulate!, measure_information_flow

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS — Neural Mathematics
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2                    # Golden ratio
const TAU_MEMBRANE = 20.0                        # Membrane time constant (ms)
const V_REST = -65.0                             # Resting potential (mV)
const V_THRESHOLD = -55.0                        # Spike threshold (mV)
const V_RESET = -70.0                            # Reset potential (mV)
const TAU_SYNAPTIC = 5.0                         # Synaptic time constant (ms)

# ═══════════════════════════════════════════════════════════════════════════════
# NEURON MODELS — Different Levels of Abstraction
# ═══════════════════════════════════════════════════════════════════════════════

"""
Abstract neuron type.
"""
abstract type AbstractNeuron end

"""
Leaky Integrate-and-Fire neuron — simplest spiking model.
"""
mutable struct LeakyIntegrateFire <: AbstractNeuron
    id::Int
    V::Float64                             # Membrane potential
    V_rest::Float64                        # Resting potential
    V_threshold::Float64                   # Spike threshold
    V_reset::Float64                       # Reset potential
    τ::Float64                             # Membrane time constant
    R::Float64                             # Membrane resistance
    I_ext::Float64                         # External current
    spike::Bool                            # Just spiked?
    last_spike::Float64                    # Time of last spike
    refractory::Float64                    # Refractory period
end

function LeakyIntegrateFire(id::Int)
    LeakyIntegrateFire(
        id, V_REST, V_REST, V_THRESHOLD, V_RESET,
        TAU_MEMBRANE, 1.0, 0.0, false, -Inf, 2.0
    )
end

"""
Update LIF neuron state.
"""
function update!(neuron::LeakyIntegrateFire, I_syn::Float64, dt::Float64, t::Float64)
    neuron.spike = false
    
    # Check refractory period
    if t - neuron.last_spike < neuron.refractory
        return neuron
    end
    
    # Leaky integration
    dV = (-(neuron.V - neuron.V_rest) + neuron.R * (I_syn + neuron.I_ext)) / neuron.τ
    neuron.V += dt * dV
    
    # Spike?
    if neuron.V >= neuron.V_threshold
        neuron.spike = true
        neuron.V = neuron.V_reset
        neuron.last_spike = t
    end
    
    return neuron
end

"""
Izhikevich neuron — rich dynamics with few parameters.
"""
mutable struct IzhikevichNeuron <: AbstractNeuron
    id::Int
    v::Float64                             # Membrane potential
    u::Float64                             # Recovery variable
    a::Float64                             # Time scale of u
    b::Float64                             # Sensitivity of u to v
    c::Float64                             # After-spike reset of v
    d::Float64                             # After-spike reset of u
    I::Float64                             # Input current
    spike::Bool                            # Just spiked?
end

function IzhikevichNeuron(id::Int; type::Symbol=:regular_spiking)
    # Different neuron types
    (a, b, c, d) = if type == :regular_spiking
        (0.02, 0.2, -65.0, 8.0)
    elseif type == :fast_spiking
        (0.1, 0.2, -65.0, 2.0)
    elseif type == :chattering
        (0.02, 0.2, -50.0, 2.0)
    elseif type == :intrinsically_bursting
        (0.02, 0.2, -55.0, 4.0)
    else
        (0.02, 0.2, -65.0, 8.0)
    end
    
    IzhikevichNeuron(id, -65.0, -65.0 * b, a, b, c, d, 0.0, false)
end

"""
Update Izhikevich neuron.
"""
function update!(neuron::IzhikevichNeuron, I_syn::Float64, dt::Float64, t::Float64)
    neuron.spike = false
    
    I_total = I_syn + neuron.I
    
    # Izhikevich equations
    dv = 0.04 * neuron.v^2 + 5 * neuron.v + 140 - neuron.u + I_total
    du = neuron.a * (neuron.b * neuron.v - neuron.u)
    
    neuron.v += dt * dv
    neuron.u += dt * du
    
    # Spike?
    if neuron.v >= 30.0
        neuron.spike = true
        neuron.v = neuron.c
        neuron.u += neuron.d
    end
    
    return neuron
end

"""
FitzHugh-Nagumo neuron — simplified Hodgkin-Huxley.
"""
mutable struct FitzHughNagumo <: AbstractNeuron
    id::Int
    v::Float64                             # Fast variable (voltage-like)
    w::Float64                             # Slow variable (recovery)
    a::Float64                             # Time scale separation
    b::Float64                             # Activation threshold
    τ::Float64                             # Recovery time scale
    I::Float64                             # External current
    spike::Bool
end

function FitzHughNagumo(id::Int)
    FitzHughNagumo(id, 0.0, 0.0, 0.7, 0.8, 12.5, 0.0, false)
end

"""
Update FitzHugh-Nagumo neuron.
"""
function update!(neuron::FitzHughNagumo, I_syn::Float64, dt::Float64, t::Float64)
    neuron.spike = false
    
    v, w = neuron.v, neuron.w
    I_total = I_syn + neuron.I
    
    # FHN equations
    dv = v - v^3/3 - w + I_total
    dw = (v + neuron.a - neuron.b * w) / neuron.τ
    
    neuron.v += dt * dv
    neuron.w += dt * dw
    
    # Detect spike (crossing threshold from below)
    if neuron.v > 1.0 && !neuron.spike
        neuron.spike = true
    end
    
    return neuron
end

# ═══════════════════════════════════════════════════════════════════════════════
# WILSON-COWAN DYNAMICS — Population Rate Model
# ═══════════════════════════════════════════════════════════════════════════════

"""
Wilson-Cowan population dynamics — excitatory/inhibitory interactions.
"""
mutable struct WilsonCowanDynamics
    E::Float64                             # Excitatory activity
    I::Float64                             # Inhibitory activity
    τ_E::Float64                           # E time constant
    τ_I::Float64                           # I time constant
    w_EE::Float64                          # E→E weight
    w_EI::Float64                          # E→I weight  
    w_IE::Float64                          # I→E weight
    w_II::Float64                          # I→I weight
    θ_E::Float64                           # E threshold
    θ_I::Float64                           # I threshold
    P::Float64                             # External input to E
    Q::Float64                             # External input to I
end

function WilsonCowanDynamics()
    WilsonCowanDynamics(
        0.1, 0.1,                          # Initial activities
        10.0, 10.0,                         # Time constants
        12.0, 10.0, 10.0, 3.0,            # Weights
        2.0, 3.5,                           # Thresholds
        1.0, 0.0                            # External inputs
    )
end

"""
Sigmoid activation function.
"""
sigmoid(x; k::Float64=1.0) = 1.0 / (1.0 + exp(-k * x))

"""
Update Wilson-Cowan dynamics.
"""
function update!(wc::WilsonCowanDynamics, dt::Float64)
    E, I = wc.E, wc.I
    
    # Input to each population
    input_E = wc.w_EE * E - wc.w_IE * I + wc.P - wc.θ_E
    input_I = wc.w_EI * E - wc.w_II * I + wc.Q - wc.θ_I
    
    # Wilson-Cowan equations
    dE = (-E + (1 - E) * sigmoid(input_E)) / wc.τ_E
    dI = (-I + (1 - I) * sigmoid(input_I)) / wc.τ_I
    
    wc.E += dt * dE
    wc.I += dt * dI
    
    # Clamp to [0, 1]
    wc.E = clamp(wc.E, 0.0, 1.0)
    wc.I = clamp(wc.I, 0.0, 1.0)
    
    return wc
end

# ═══════════════════════════════════════════════════════════════════════════════
# COUPLING MATRIX — Connection Topology
# ═══════════════════════════════════════════════════════════════════════════════

"""
Coupling matrix defining synaptic connections.
"""
struct CouplingMatrix
    weights::Matrix{Float64}              # Connection weights
    delays::Matrix{Float64}               # Transmission delays
    plasticity::Matrix{Float64}           # Plasticity eligibility
    topology::Symbol                       # :random, :smallworld, :scalefree
end

"""
Create coupling matrix with specified topology.
"""
function CouplingMatrix(n::Int; topology::Symbol=:random, 
                       density::Float64=0.1, strength::Float64=1.0)
    weights = zeros(n, n)
    delays = zeros(n, n)
    plasticity = ones(n, n)
    
    if topology == :random
        for i in 1:n, j in 1:n
            if i != j && rand() < density
                weights[i, j] = strength * randn()
                delays[i, j] = rand() * 10.0
            end
        end
    elseif topology == :smallworld
        # Watts-Strogatz
        k = max(2, Int(floor(density * n)))
        p = 0.3
        
        # Ring lattice
        for i in 1:n
            for j in 1:k÷2
                weights[i, mod1(i+j, n)] = strength
                weights[i, mod1(i-j, n)] = strength
            end
        end
        
        # Rewire
        for i in 1:n, j in 1:n
            if weights[i, j] != 0 && rand() < p
                new_j = rand(1:n)
                if new_j != i && weights[i, new_j] == 0
                    weights[i, j] = 0.0
                    weights[i, new_j] = strength
                end
            end
        end
    elseif topology == :scalefree
        # Barabási-Albert
        m = max(1, Int(floor(density * 5)))
        
        # Start with complete graph of m+1 nodes
        for i in 1:m+1, j in 1:m+1
            if i != j
                weights[i, j] = strength
            end
        end
        
        # Add nodes with preferential attachment
        for i in m+2:n
            degrees = vec(sum(weights .!= 0, dims=2))
            probs = (degrees .+ 1) / sum(degrees .+ 1)
            
            targets = Int[]
            while length(targets) < m
                t = rand(1:i-1)
                if rand() < probs[t] && !(t in targets)
                    push!(targets, t)
                end
            end
            
            for t in targets
                weights[i, t] = strength
                weights[t, i] = strength * rand()
            end
        end
    end
    
    CouplingMatrix(weights, delays, plasticity, topology)
end

# ═══════════════════════════════════════════════════════════════════════════════
# NEURAL POPULATION — Collection of Neurons
# ═══════════════════════════════════════════════════════════════════════════════

"""
A population of coupled neurons.
"""
mutable struct NeuralPopulation
    neurons::Vector{<:AbstractNeuron}
    coupling::CouplingMatrix
    spike_buffer::Matrix{Float64}         # Spike history for delays
    buffer_idx::Int                        # Current buffer position
    activity::Vector{Float64}              # Recent activity
    t::Float64                             # Current time
end

function NeuralPopulation(n::Int; neuron_type::Symbol=:lif, 
                         topology::Symbol=:random, density::Float64=0.1)
    neurons = if neuron_type == :lif
        [LeakyIntegrateFire(i) for i in 1:n]
    elseif neuron_type == :izhikevich
        [IzhikevichNeuron(i) for i in 1:n]
    elseif neuron_type == :fhn
        [FitzHughNagumo(i) for i in 1:n]
    else
        [LeakyIntegrateFire(i) for i in 1:n]
    end
    
    coupling = CouplingMatrix(n; topology=topology, density=density)
    
    # Spike buffer for transmission delays (100 time steps)
    buffer_size = 100
    spike_buffer = zeros(n, buffer_size)
    
    NeuralPopulation(neurons, coupling, spike_buffer, 1, zeros(n), 0.0)
end

"""
Compute synaptic input to each neuron.
"""
function compute_synaptic_input(pop::NeuralPopulation, dt::Float64)
    n = length(pop.neurons)
    I_syn = zeros(n)
    
    for i in 1:n
        for j in 1:n
            if pop.coupling.weights[j, i] != 0
                # Get delayed spike
                delay_steps = max(1, Int(floor(pop.coupling.delays[j, i] / dt)))
                buffer_pos = mod1(pop.buffer_idx - delay_steps, size(pop.spike_buffer, 2))
                
                # Synaptic current
                I_syn[i] += pop.coupling.weights[j, i] * pop.spike_buffer[j, buffer_pos]
            end
        end
    end
    
    return I_syn
end

"""
Update neural population.
"""
function update!(pop::NeuralPopulation, dt::Float64)
    pop.t += dt
    
    # Compute synaptic inputs
    I_syn = compute_synaptic_input(pop, dt)
    
    # Update each neuron
    for (i, neuron) in enumerate(pop.neurons)
        update!(neuron, I_syn[i], dt, pop.t)
        
        # Record spike in buffer
        pop.spike_buffer[i, pop.buffer_idx] = neuron.spike ? 1.0 : 0.0
        
        # Update activity (exponential moving average)
        α = dt / TAU_SYNAPTIC
        pop.activity[i] = (1 - α) * pop.activity[i] + α * (neuron.spike ? 1.0 : 0.0)
    end
    
    # Advance buffer
    pop.buffer_idx = mod1(pop.buffer_idx + 1, size(pop.spike_buffer, 2))
    
    return pop
end

# ═══════════════════════════════════════════════════════════════════════════════
# INFORMATION FLOW — Transfer Entropy and Causality
# ═══════════════════════════════════════════════════════════════════════════════

"""
Information flow metrics.
"""
struct InformationFlow
    source::Int
    target::Int
    transfer_entropy::Float64              # Directed information flow
    mutual_information::Float64            # Shared information
    granger_causality::Float64            # Linear causality
end

"""
Compute transfer entropy from source to target.
TE(X→Y) = H(Y_t | Y_past) - H(Y_t | Y_past, X_past)
"""
function transfer_entropy(source_signal::Vector{Float64}, 
                         target_signal::Vector{Float64};
                         k::Int=1, l::Int=1, bins::Int=8)
    n = length(source_signal) - max(k, l)
    
    # Discretize signals
    source_binned = discretize(source_signal, bins)
    target_binned = discretize(target_signal, bins)
    
    # Build probability distributions
    # P(Y_t, Y_past, X_past), P(Y_past, X_past), P(Y_t, Y_past), P(Y_past)
    
    counts_yyx = Dict{Tuple, Int}()
    counts_yx = Dict{Tuple, Int}()
    counts_yy = Dict{Tuple, Int}()
    counts_y = Dict{Tuple, Int}()
    
    for t in max(k, l)+1:length(target_binned)
        y_t = target_binned[t]
        y_past = Tuple(target_binned[t-i] for i in 1:k)
        x_past = Tuple(source_binned[t-i] for i in 1:l)
        
        key_yyx = (y_t, y_past, x_past)
        key_yx = (y_past, x_past)
        key_yy = (y_t, y_past)
        key_y = y_past
        
        counts_yyx[key_yyx] = get(counts_yyx, key_yyx, 0) + 1
        counts_yx[key_yx] = get(counts_yx, key_yx, 0) + 1
        counts_yy[key_yy] = get(counts_yy, key_yy, 0) + 1
        counts_y[key_y] = get(counts_y, key_y, 0) + 1
    end
    
    # Compute transfer entropy
    te = 0.0
    total = sum(values(counts_yyx))
    
    for (key, count) in counts_yyx
        y_t, y_past, x_past = key
        
        p_yyx = count / total
        p_yx = counts_yx[(y_past, x_past)] / total
        p_yy = counts_yy[(y_t, y_past)] / total
        p_y = counts_y[y_past] / total
        
        if p_yyx > 0 && p_yx > 0 && p_yy > 0 && p_y > 0
            te += p_yyx * log2((p_yyx * p_y) / (p_yy * p_yx))
        end
    end
    
    return max(0.0, te)
end

"""
Discretize signal into bins.
"""
function discretize(signal::Vector{Float64}, n_bins::Int)
    min_val, max_val = extrema(signal)
    range = max_val - min_val + 1e-10
    
    binned = [Int(floor((x - min_val) / range * n_bins)) + 1 for x in signal]
    binned = clamp.(binned, 1, n_bins)
    
    return binned
end

"""
Compute Granger causality (F-statistic).
"""
function granger_causality(source_signal::Vector{Float64},
                          target_signal::Vector{Float64};
                          max_lag::Int=5)
    n = length(target_signal) - max_lag
    
    # Build design matrices
    # Restricted model: Y_t ~ Y_past
    # Full model: Y_t ~ Y_past + X_past
    
    Y = target_signal[max_lag+1:end]
    
    # Restricted model
    X_restricted = hcat([target_signal[max_lag+1-i:end-i] for i in 1:max_lag]...)
    
    # Full model
    X_full = hcat(X_restricted, 
                  [source_signal[max_lag+1-i:end-i] for i in 1:max_lag]...)
    
    # OLS estimates
    β_restricted = X_restricted \ Y
    β_full = X_full \ Y
    
    # Residuals
    ε_restricted = Y - X_restricted * β_restricted
    ε_full = Y - X_full * β_full
    
    # RSS
    RSS_restricted = sum(ε_restricted.^2)
    RSS_full = sum(ε_full.^2)
    
    # F-statistic
    p = max_lag  # Additional parameters
    F = ((RSS_restricted - RSS_full) / p) / (RSS_full / (n - 2*max_lag))
    
    return max(0.0, F)
end

"""
Compute mutual information between signals.
"""
function mutual_information(signal1::Vector{Float64}, signal2::Vector{Float64};
                           bins::Int=8)
    n = length(signal1)
    
    binned1 = discretize(signal1, bins)
    binned2 = discretize(signal2, bins)
    
    # Joint and marginal distributions
    joint_counts = Dict{Tuple{Int,Int}, Int}()
    counts1 = Dict{Int, Int}()
    counts2 = Dict{Int, Int}()
    
    for i in 1:n
        b1, b2 = binned1[i], binned2[i]
        joint_counts[(b1, b2)] = get(joint_counts, (b1, b2), 0) + 1
        counts1[b1] = get(counts1, b1, 0) + 1
        counts2[b2] = get(counts2, b2, 0) + 1
    end
    
    # Compute MI
    mi = 0.0
    for ((b1, b2), count) in joint_counts
        p_joint = count / n
        p1 = counts1[b1] / n
        p2 = counts2[b2] / n
        
        if p_joint > 0 && p1 > 0 && p2 > 0
            mi += p_joint * log2(p_joint / (p1 * p2))
        end
    end
    
    return max(0.0, mi)
end

# ═══════════════════════════════════════════════════════════════════════════════
# NEURAL SUBSTRATE — Complete System
# ═══════════════════════════════════════════════════════════════════════════════

"""
A complete neural substrate for computation.
"""
mutable struct NeuralSubstrate
    name::String
    populations::Vector{NeuralPopulation}
    inter_pop_coupling::Matrix{Float64}
    wilson_cowan::WilsonCowanDynamics
    history::Dict{Symbol, Vector{Float64}}
    t::Float64
end

function create_neural_substrate(name::String; 
                                n_populations::Int=3,
                                neurons_per_pop::Int=50,
                                neuron_type::Symbol=:lif)
    populations = [NeuralPopulation(neurons_per_pop; 
                                    neuron_type=neuron_type,
                                    topology=:smallworld) 
                   for _ in 1:n_populations]
    
    # Inter-population coupling (hierarchical)
    inter_coupling = zeros(n_populations, n_populations)
    for i in 1:n_populations
        for j in 1:n_populations
            if i != j
                inter_coupling[i, j] = 0.1 * exp(-abs(i-j) / PHI)
            end
        end
    end
    
    wc = WilsonCowanDynamics()
    
    history = Dict(
        :excitatory => Float64[],
        :inhibitory => Float64[],
        :population_rates => Float64[],
        :synchrony => Float64[]
    )
    
    NeuralSubstrate(name, populations, inter_coupling, wc, history, 0.0)
end

"""
Simulate neural substrate.
"""
function simulate!(substrate::NeuralSubstrate, duration::Float64; dt::Float64=0.1)
    n_steps = Int(ceil(duration / dt))
    
    for _ in 1:n_steps
        substrate.t += dt
        
        # Update Wilson-Cowan (global dynamics)
        update!(substrate.wilson_cowan, dt)
        
        # Update each population
        for (i, pop) in enumerate(substrate.populations)
            # Add inter-population input
            for (j, other_pop) in enumerate(substrate.populations)
                if i != j
                    coupling = substrate.inter_pop_coupling[j, i]
                    mean_activity = mean(other_pop.activity)
                    
                    # Add to external current of all neurons
                    for neuron in pop.neurons
                        if neuron isa LeakyIntegrateFire
                            neuron.I_ext += coupling * mean_activity * 10
                        elseif neuron isa IzhikevichNeuron
                            neuron.I += coupling * mean_activity * 5
                        elseif neuron isa FitzHughNagumo
                            neuron.I += coupling * mean_activity * 0.5
                        end
                    end
                end
            end
            
            # Add Wilson-Cowan modulation
            for neuron in pop.neurons
                if neuron isa LeakyIntegrateFire
                    neuron.I_ext += substrate.wilson_cowan.E * 5
                end
            end
            
            update!(pop, dt)
        end
        
        # Record history
        push!(substrate.history[:excitatory], substrate.wilson_cowan.E)
        push!(substrate.history[:inhibitory], substrate.wilson_cowan.I)
        
        total_rate = mean(mean(pop.activity) for pop in substrate.populations)
        push!(substrate.history[:population_rates], total_rate)
    end
    
    return substrate
end

"""
Measure information flow between populations.
"""
function measure_information_flow(substrate::NeuralSubstrate)
    n_pops = length(substrate.populations)
    flows = InformationFlow[]
    
    for i in 1:n_pops
        for j in 1:n_pops
            if i != j
                # Use population activities
                source = [mean(substrate.populations[i].activity) + randn() * 0.01 
                         for _ in 1:100]
                target = [mean(substrate.populations[j].activity) + randn() * 0.01 
                         for _ in 1:100]
                
                te = transfer_entropy(source, target)
                mi = mutual_information(source, target)
                gc = granger_causality(source, target)
                
                push!(flows, InformationFlow(i, j, te, mi, gc))
            end
        end
    end
    
    return flows
end

"""
Summarize neural substrate.
"""
function summarize(substrate::NeuralSubstrate)
    println("╔════════════════════════════════════════════════════════════════╗")
    println("║         NEURAL SUBSTRATE: $(substrate.name)")
    println("╠════════════════════════════════════════════════════════════════╣")
    println("║  Populations:         $(length(substrate.populations))")
    println("║  Neurons per pop:     $(length(substrate.populations[1].neurons))")
    println("║  Time:                $(round(substrate.t, digits=2)) ms")
    println("║  E activity:          $(round(substrate.wilson_cowan.E, digits=4))")
    println("║  I activity:          $(round(substrate.wilson_cowan.I, digits=4))")
    if length(substrate.history[:population_rates]) > 0
        println("║  Mean firing rate:    $(round(mean(substrate.history[:population_rates]), digits=4))")
    end
    println("╚════════════════════════════════════════════════════════════════╝")
end

end # module NeuralCoupling
