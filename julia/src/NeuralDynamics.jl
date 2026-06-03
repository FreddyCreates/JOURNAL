#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  NEURAL DYNAMICS — KURAMOTO OSCILLATORS & HEBBIAN LEARNING AT SCALE                  ║
║  "Neuralis Vivens — Living Neural Dynamics"                                           ║
║                                                                                        ║
║  "Neurons pulsant. Synapses mutant. Intelligentia nascitur."                          ║
║  (Neurons pulse. Synapses change. Intelligence is born.)                              ║
║                                                                                        ║
║  BRAIN-ANALOG SYSTEMS:                                                                ║
║    • Kuramoto oscillator networks for synchronization                                 ║
║    • Hebbian learning: "Cells that fire together wire together"                       ║
║    • Dopamine/Oxytocin neurochemistry simulation                                      ║
║    • Emergent patterns from local rules                                               ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module NeuralDynamics

using LinearAlgebra
using Statistics
using Random

include("PhiResonance.jl")
using .PhiResonance: PHI, PHI_INVERSE, PHI_COMPLEMENT, TWO_PI, phi_weight

export Oscillator, OscillatorNetwork
export create_network, evolve!, kuramoto_step!, get_order_parameter
export HebbianNetwork, hebbian_learn!, spike_timing_dependent_plasticity!
export NeurochemistrySystem, fire_dopamine!, fire_oxytocin!, decay!
export MiniBrain, create_brain, think!, get_arousal, get_bonding
export EmergenceCascade, trigger_cascade!, cascade_complete?

# ════════════════════════════════════════════════════════════════════════════════
# NEURAL CONSTANTS
# ════════════════════════════════════════════════════════════════════════════════

"""Heartbeat interval in ms (φ × 382)"""
const HEARTBEAT_MS = 618

"""Three Hearts sync interval"""
const THREE_HEARTS_MS = 873

"""Default Kuramoto coupling constant"""
const DEFAULT_COUPLING_K = PHI

"""Hebbian learning rate"""
const HEBBIAN_LEARNING_RATE = 0.01 * PHI_INVERSE

"""STDP time constant (ms)"""
const STDP_TAU = 20.0 * PHI_INVERSE

# ════════════════════════════════════════════════════════════════════════════════
# KURAMOTO OSCILLATOR
# ════════════════════════════════════════════════════════════════════════════════

"""
    Oscillator

A Kuramoto oscillator with phase, frequency, and state.
"""
mutable struct Oscillator
    id::String
    phase::Float64          # θ ∈ [0, 2π)
    natural_frequency::Float64  # ω
    coherence::Float64      # Local coherence measure
    energy::Float64         # Energy level
    last_spike::Float64     # Time of last spike (phase crossing)
    spike_count::Int
end

"""Create an oscillator with φ-scaled parameters."""
function Oscillator(id::String; 
                    phase::Float64=rand() * TWO_PI,
                    frequency::Float64=TWO_PI / (HEARTBEAT_MS / 1000.0))
    Oscillator(id, phase, frequency, 1.0, 1.0, 0.0, 0)
end

"""
    OscillatorNetwork

A network of coupled Kuramoto oscillators.
"""
mutable struct OscillatorNetwork
    oscillators::Vector{Oscillator}
    coupling_matrix::Matrix{Float64}  # K_ij coupling strengths
    global_coupling::Float64          # K global constant
    order_parameter::Float64          # R
    mean_phase::Float64               # Ψ
    time::Float64
end

"""
    create_network(n::Int; coupling::Float64=DEFAULT_COUPLING_K) -> OscillatorNetwork

Create a network of n oscillators with uniform coupling.
"""
function create_network(n::Int; coupling::Float64=DEFAULT_COUPLING_K)
    oscillators = [Oscillator("OSC-$i") for i in 1:n]
    
    # φ-weighted coupling matrix (stronger between nearby indices)
    K = zeros(Float64, n, n)
    for i in 1:n
        for j in 1:n
            if i != j
                distance = abs(i - j)
                K[i, j] = coupling / n * PHI^(-distance / n)
            end
        end
    end
    
    OscillatorNetwork(oscillators, K, coupling, 0.0, 0.0, 0.0)
end

"""
    kuramoto_step!(network::OscillatorNetwork, dt::Float64)

Evolve network by one timestep using Kuramoto model:
dθ_i/dt = ω_i + (K/N) Σ_j K_ij sin(θ_j - θ_i)
"""
function kuramoto_step!(network::OscillatorNetwork, dt::Float64)
    n = length(network.oscillators)
    new_phases = zeros(Float64, n)
    
    for i in 1:n
        osc_i = network.oscillators[i]
        coupling_sum = 0.0
        
        for j in 1:n
            if i != j
                osc_j = network.oscillators[j]
                coupling_sum += network.coupling_matrix[i, j] * sin(osc_j.phase - osc_i.phase)
            end
        end
        
        # Kuramoto equation
        dθ = osc_i.natural_frequency + coupling_sum
        new_phase = mod(osc_i.phase + dθ * dt, TWO_PI)
        new_phases[i] = new_phase
        
        # Check for spike (phase crossing 0)
        if new_phase < osc_i.phase && osc_i.phase > π
            osc_i.spike_count += 1
            osc_i.last_spike = network.time
        end
    end
    
    # Update all phases
    for i in 1:n
        network.oscillators[i].phase = new_phases[i]
    end
    
    # Update order parameter
    R, Ψ = compute_order_parameter(network)
    network.order_parameter = R
    network.mean_phase = Ψ
    network.time += dt
    
    return network
end

"""
    compute_order_parameter(network::OscillatorNetwork) -> Tuple{Float64, Float64}

Compute Kuramoto order parameter R·e^(iΨ) = (1/N) Σ e^(iθ_j)
"""
function compute_order_parameter(network::OscillatorNetwork)
    n = length(network.oscillators)
    n == 0 && return (0.0, 0.0)
    
    sum_cos = sum(cos(osc.phase) for osc in network.oscillators)
    sum_sin = sum(sin(osc.phase) for osc in network.oscillators)
    
    avg_cos = sum_cos / n
    avg_sin = sum_sin / n
    
    R = sqrt(avg_cos^2 + avg_sin^2)
    Ψ = atan(avg_sin, avg_cos)
    
    return (R, Ψ)
end

"""Alias for compute_order_parameter"""
get_order_parameter(network::OscillatorNetwork) = compute_order_parameter(network)

"""
    evolve!(network::OscillatorNetwork, duration::Float64, dt::Float64=0.001)

Evolve network for specified duration.
"""
function evolve!(network::OscillatorNetwork, duration::Float64, dt::Float64=0.001)
    steps = Int(ceil(duration / dt))
    for _ in 1:steps
        kuramoto_step!(network, dt)
    end
    return network
end

"""
    strengthen_coupling!(network::OscillatorNetwork, i::Int, j::Int, factor::Float64=PHI)

Strengthen the coupling between oscillators i and j.
"""
function strengthen_coupling!(network::OscillatorNetwork, i::Int, j::Int, factor::Float64=PHI)
    network.coupling_matrix[i, j] *= factor
    network.coupling_matrix[j, i] *= factor
    return network
end

# ════════════════════════════════════════════════════════════════════════════════
# HEBBIAN NETWORK
# ════════════════════════════════════════════════════════════════════════════════

"""
    HebbianNetwork

A network with Hebbian synaptic plasticity.
"Cells that fire together wire together."
"""
mutable struct HebbianNetwork
    n_neurons::Int
    weights::Matrix{Float64}      # Synaptic weight matrix
    activations::Vector{Float64}  # Current neuron activations
    spike_times::Vector{Float64}  # Last spike time per neuron
    learning_rate::Float64
    decay_rate::Float64
    time::Float64
end

"""Create a Hebbian network with n neurons."""
function HebbianNetwork(n::Int; learning_rate::Float64=HEBBIAN_LEARNING_RATE)
    # Initialize with small random weights
    weights = randn(n, n) * 0.01 * PHI_INVERSE
    # No self-connections
    for i in 1:n
        weights[i, i] = 0.0
    end
    
    HebbianNetwork(
        n,
        weights,
        zeros(Float64, n),
        fill(-Inf, n),  # No spikes yet
        learning_rate,
        PHI_COMPLEMENT / 1000.0,  # Decay rate
        0.0
    )
end

"""
    hebbian_learn!(network::HebbianNetwork, pre::Int, post::Int)

Apply Hebbian learning rule: Δw_ij = η × x_i × x_j
"""
function hebbian_learn!(network::HebbianNetwork, pre::Int, post::Int)
    if pre != post
        Δw = network.learning_rate * network.activations[pre] * network.activations[post]
        network.weights[pre, post] += Δw
        
        # Soft bounds with φ-scaling
        network.weights[pre, post] = clamp(network.weights[pre, post], -PHI, PHI)
    end
    return network
end

"""
    spike_timing_dependent_plasticity!(network::HebbianNetwork, neuron::Int, spike_time::Float64)

Apply STDP rule based on spike timing.
If pre spikes before post: strengthen (LTP)
If post spikes before pre: weaken (LTD)
"""
function spike_timing_dependent_plasticity!(network::HebbianNetwork, neuron::Int, spike_time::Float64)
    for other in 1:network.n_neurons
        if other != neuron && network.spike_times[other] > -Inf
            Δt = spike_time - network.spike_times[other]
            
            if Δt > 0  # other spiked first → strengthen other→neuron
                Δw = network.learning_rate * exp(-abs(Δt) / STDP_TAU)
                network.weights[other, neuron] += Δw
            else  # neuron spiked first → weaken other→neuron
                Δw = -network.learning_rate * PHI_INVERSE * exp(-abs(Δt) / STDP_TAU)
                network.weights[other, neuron] += Δw
            end
            
            network.weights[other, neuron] = clamp(network.weights[other, neuron], -PHI, PHI)
        end
    end
    
    network.spike_times[neuron] = spike_time
    return network
end

"""
    propagate!(network::HebbianNetwork, input::Vector{Float64})

Propagate input through network, updating activations.
"""
function propagate!(network::HebbianNetwork, input::Vector{Float64})
    # Decay current activations
    network.activations .*= (1.0 - network.decay_rate)
    
    # Add weighted input from other neurons + external input
    new_activation = network.weights' * network.activations + input
    
    # Activation function: φ-sigmoid
    network.activations = @. 1.0 / (1.0 + PHI^(-new_activation))
    
    network.time += 1.0
    return network
end

# ════════════════════════════════════════════════════════════════════════════════
# NEUROCHEMISTRY SYSTEM
# ════════════════════════════════════════════════════════════════════════════════

"""
    NeurochemistrySystem

Simulates dopamine (DA) and oxytocin (OX) dynamics.
DA: Reward, motivation, salience
OX: Bonding, trust, social coherence
"""
mutable struct NeurochemistrySystem
    dopamine_level::Float64
    oxytocin_level::Float64
    arousal_state::Float64
    bonding_level::Float64
    impulse_history::Vector{NamedTuple{(:type, :magnitude, :time), Tuple{Symbol, Float64, Float64}}}
    max_history::Int
    time::Float64
end

"""Create a neurochemistry system."""
function NeurochemistrySystem()
    NeurochemistrySystem(0.0, 0.0, 0.0, 0.0, [], 1000, 0.0)
end

"""
    fire_dopamine!(system::NeurochemistrySystem, impulse::Float64)

Fire a dopamine impulse into the system.
"""
function fire_dopamine!(system::NeurochemistrySystem, impulse::Float64)
    system.dopamine_level += impulse
    system.arousal_state = min(1.0, system.arousal_state + impulse * PHI_INVERSE)
    
    push!(system.impulse_history, (type=:DA, magnitude=impulse, time=system.time))
    _trim_history!(system)
    
    return system
end

"""
    fire_oxytocin!(system::NeurochemistrySystem, impulse::Float64)

Fire an oxytocin impulse into the system.
"""
function fire_oxytocin!(system::NeurochemistrySystem, impulse::Float64)
    system.oxytocin_level += impulse
    system.bonding_level = min(1.0, system.bonding_level + impulse * PHI_INVERSE)
    
    push!(system.impulse_history, (type=:OX, magnitude=impulse, time=system.time))
    _trim_history!(system)
    
    return system
end

"""
    decay!(system::NeurochemistrySystem, decay_factor::Float64=PHI_COMPLEMENT)

Decay neurochemistry levels over time.
"""
function decay!(system::NeurochemistrySystem, decay_factor::Float64=PHI_COMPLEMENT)
    system.dopamine_level *= (1.0 - decay_factor)
    system.oxytocin_level *= (1.0 - decay_factor)
    system.arousal_state *= (1.0 - decay_factor * PHI_INVERSE)
    system.bonding_level *= (1.0 - decay_factor * PHI_INVERSE)
    system.time += 1.0
    return system
end

function _trim_history!(system::NeurochemistrySystem)
    if length(system.impulse_history) > system.max_history
        system.impulse_history = system.impulse_history[end-system.max_history+1:end]
    end
end

# ════════════════════════════════════════════════════════════════════════════════
# MINI BRAIN
# ════════════════════════════════════════════════════════════════════════════════

"""
    MiniBrain

Integrated brain-analog system combining oscillators, Hebbian learning, and neurochemistry.
"""
mutable struct MiniBrain
    oscillators::OscillatorNetwork
    hebbian::HebbianNetwork
    chemistry::NeurochemistrySystem
    coherence::Float64
    decisions_made::Int
    time::Float64
end

"""
    create_brain(n_oscillators::Int, n_neurons::Int) -> MiniBrain

Create an integrated mini-brain.
"""
function create_brain(n_oscillators::Int=10, n_neurons::Int=20)
    osc = create_network(n_oscillators)
    heb = HebbianNetwork(n_neurons)
    chem = NeurochemistrySystem()
    
    MiniBrain(osc, heb, chem, 0.0, 0, 0.0)
end

"""
    think!(brain::MiniBrain, input::Vector{Float64}, dt::Float64=0.001)

Process input through the brain for one think cycle.
"""
function think!(brain::MiniBrain, input::Vector{Float64}, dt::Float64=0.001)
    # Evolve oscillators
    kuramoto_step!(brain.oscillators, dt)
    
    # Get oscillator coherence to modulate Hebbian network
    R, _ = get_order_parameter(brain.oscillators)
    
    # Scale input by oscillator coherence
    scaled_input = input .* R
    
    # Propagate through Hebbian network
    if length(scaled_input) == brain.hebbian.n_neurons
        propagate!(brain.hebbian, scaled_input)
    else
        # Resize input if necessary
        resized_input = zeros(brain.hebbian.n_neurons)
        for (i, v) in enumerate(scaled_input)
            if i <= brain.hebbian.n_neurons
                resized_input[i] = v
            end
        end
        propagate!(brain.hebbian, resized_input)
    end
    
    # Check for "decisions" (high activation patterns)
    max_activation = maximum(brain.hebbian.activations)
    if max_activation > PHI_INVERSE
        brain.decisions_made += 1
        fire_dopamine!(brain.chemistry, max_activation * PHI_INVERSE)
    end
    
    # Update coherence
    brain.coherence = R
    brain.time += dt
    
    # Decay chemistry
    decay!(brain.chemistry, PHI_COMPLEMENT * dt)
    
    return brain
end

"""Get current arousal level."""
get_arousal(brain::MiniBrain) = brain.chemistry.arousal_state

"""Get current bonding level."""
get_bonding(brain::MiniBrain) = brain.chemistry.bonding_level

# ════════════════════════════════════════════════════════════════════════════════
# EMERGENCE CASCADE
# ════════════════════════════════════════════════════════════════════════════════

"""
    EmergenceCascade

A cascade of emergent behavior triggered by threshold crossing.
Models sudden phase transitions in neural networks.
"""
mutable struct EmergenceCascade
    threshold::Float64
    cascade_strength::Float64
    activated_nodes::Set{Int}
    cascade_order::Vector{Int}
    is_active::Bool
    completion_ratio::Float64
end

"""Create an emergence cascade."""
function EmergenceCascade(threshold::Float64=PHI_INVERSE)
    EmergenceCascade(threshold, 0.0, Set{Int}(), Int[], false, 0.0)
end

"""
    trigger_cascade!(cascade::EmergenceCascade, network::OscillatorNetwork, trigger_node::Int)

Trigger an emergence cascade from the specified node.
"""
function trigger_cascade!(cascade::EmergenceCascade, network::OscillatorNetwork, trigger_node::Int)
    n = length(network.oscillators)
    trigger_node < 1 || trigger_node > n && return cascade
    
    cascade.is_active = true
    push!(cascade.activated_nodes, trigger_node)
    push!(cascade.cascade_order, trigger_node)
    
    # Propagate cascade through strongly coupled nodes
    to_check = [trigger_node]
    
    while !isempty(to_check)
        current = popfirst!(to_check)
        
        for j in 1:n
            if j ∉ cascade.activated_nodes
                coupling = network.coupling_matrix[current, j]
                
                # Activate if coupling exceeds threshold
                if coupling > cascade.threshold
                    push!(cascade.activated_nodes, j)
                    push!(cascade.cascade_order, j)
                    push!(to_check, j)
                    
                    # Strengthen the coupling that triggered activation
                    strengthen_coupling!(network, current, j, PHI_INVERSE + 1.0)
                end
            end
        end
    end
    
    cascade.completion_ratio = length(cascade.activated_nodes) / n
    cascade.cascade_strength = network.order_parameter * cascade.completion_ratio
    
    return cascade
end

"""Check if cascade has completed (reached stable state)."""
iscascadecomplete(cascade::EmergenceCascade) = cascade.completion_ratio > PHI_INVERSE

end # module NeuralDynamics
