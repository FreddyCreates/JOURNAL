# ═══════════════════════════════════════════════════════════════════════════════
# SWARM ORCHESTRATION ENGINE — Multi-Agent Cognitive Coupling
# ═══════════════════════════════════════════════════════════════════════════════
# Emergent intelligence through swarm dynamics, stigmergy, and collective cognition.
# Not simulating swarms — BEING the swarm.
# ═══════════════════════════════════════════════════════════════════════════════

module SwarmOrchestration

using LinearAlgebra
using Statistics

export CognitiveAgent, SwarmField, SwarmMind
export Stigmergy, PheromoneTrail, ConsensusProtocol
export particle_swarm_cognition!, ant_colony_reasoning!, bee_algorithm_search!
export kuramoto_synchronize!, cross_frequency_coupling!, phase_amplitude_coupling!
export create_swarm_mind, orchestrate!, measure_synchrony, measure_coherence

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS — Swarm Mathematics
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2                    # Golden ratio
const PHI_INVERSE = 1 / PHI                      # Inverse phi
const TWO_PI = 2π                                # Full cycle
const SWARM_TEMPERATURE = 1.0                    # Default swarm temperature
const PHEROMONE_DECAY = 0.95                     # Stigmergic decay rate
const COUPLING_STRENGTH = 0.1                    # Default coupling constant

# ═══════════════════════════════════════════════════════════════════════════════
# COGNITIVE AGENT — Individual Mind in the Swarm
# ═══════════════════════════════════════════════════════════════════════════════

"""
A CognitiveAgent is a single thinking entity within a swarm.
Each agent has position (belief), velocity (cognitive momentum), and phase (oscillation).
"""
mutable struct CognitiveAgent
    id::Int
    position::Vector{Float64}              # Current belief state
    velocity::Vector{Float64}              # Cognitive momentum
    best_position::Vector{Float64}         # Personal best belief
    best_fitness::Float64                  # Fitness at personal best
    phase::Float64                         # Oscillation phase [0, 2π)
    frequency::Float64                     # Natural frequency
    amplitude::Float64                     # Oscillation amplitude
    coherence::Float64                     # Internal coherence
    activation::Float64                    # Current activation level
    neighbors::Vector{Int}                 # Connected agent IDs
    influence_weights::Vector{Float64}    # Weight of each neighbor's influence
    pheromone_deposit::Float64             # Stigmergic contribution
    memory::Vector{Vector{Float64}}        # History of positions
end

function CognitiveAgent(id::Int, dims::Int)
    pos = randn(dims) .* PHI_INVERSE
    CognitiveAgent(
        id,
        pos,
        randn(dims) .* 0.1,                # Small initial velocity
        copy(pos),                          # Initial best = current
        0.0,                                # Initial fitness
        rand() * TWO_PI,                   # Random initial phase
        1.0 + randn() * 0.1,               # Natural frequency ~1 Hz
        1.0,                                # Unit amplitude
        rand(),                             # Random initial coherence
        rand(),                             # Random initial activation
        Int[],                              # No neighbors yet
        Float64[],                          # No weights yet
        0.0,                                # No pheromone
        Vector{Float64}[]                   # Empty memory
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# STIGMERGY — Environmental Memory
# ═══════════════════════════════════════════════════════════════════════════════

"""
A PheromoneTrail represents indirect communication through the environment.
Thoughts leave traces that guide future thinking.
"""
mutable struct PheromoneTrail
    position::Vector{Float64}
    intensity::Float64
    age::Int
    depositor_id::Int
    quality::Float64                       # How good was this thought?
end

"""
Stigmergy implements environmental memory for the swarm.
"""
mutable struct Stigmergy
    trails::Vector{PheromoneTrail}
    decay_rate::Float64
    diffusion_rate::Float64
    grid_resolution::Float64
    pheromone_field::Dict{Tuple, Float64}  # Discretized field
end

function Stigmergy(; decay_rate=PHEROMONE_DECAY, diffusion_rate=0.1, resolution=0.1)
    Stigmergy(
        PheromoneTrail[],
        decay_rate,
        diffusion_rate,
        resolution,
        Dict{Tuple, Float64}()
    )
end

"""
Deposit pheromone at a location.
"""
function deposit!(stig::Stigmergy, agent::CognitiveAgent, quality::Float64)
    trail = PheromoneTrail(
        copy(agent.position),
        agent.pheromone_deposit * quality,
        0,
        agent.id,
        quality
    )
    push!(stig.trails, trail)
    
    # Update discretized field
    key = Tuple(round.(Int, agent.position ./ stig.grid_resolution))
    current = get(stig.pheromone_field, key, 0.0)
    stig.pheromone_field[key] = current + trail.intensity
end

"""
Update stigmergy — decay and diffuse.
"""
function update!(stig::Stigmergy)
    # Decay all trails
    for trail in stig.trails
        trail.intensity *= stig.decay_rate
        trail.age += 1
    end
    
    # Remove dead trails
    filter!(t -> t.intensity > 0.001, stig.trails)
    
    # Decay field
    for key in keys(stig.pheromone_field)
        stig.pheromone_field[key] *= stig.decay_rate
    end
    
    # Remove negligible field values
    filter!(kv -> kv.second > 0.001, stig.pheromone_field)
end

"""
Sample pheromone intensity at a location.
"""
function sample_pheromone(stig::Stigmergy, position::Vector{Float64})
    intensity = 0.0
    for trail in stig.trails
        dist = norm(position - trail.position)
        intensity += trail.intensity * exp(-dist^2 / (2 * PHI))
    end
    return intensity
end

# ═══════════════════════════════════════════════════════════════════════════════
# SWARM FIELD — The Collective Cognitive Landscape
# ═══════════════════════════════════════════════════════════════════════════════

"""
A SwarmField defines the fitness landscape and coupling topology.
"""
struct SwarmField
    dims::Int
    fitness::Function                      # Fitness function
    coupling_matrix::Matrix{Float64}      # Agent-to-agent coupling
    external_field::Vector{Float64}        # External influence
    topology::Symbol                       # :full, :ring, :smallworld, :scalefree
end

function SwarmField(dims::Int, n_agents::Int; topology::Symbol=:full)
    # Default fitness: negative quadratic bowl
    fitness = (x) -> -sum(x.^2)
    
    # Build coupling matrix based on topology
    coupling = zeros(n_agents, n_agents)
    
    if topology == :full
        coupling = ones(n_agents, n_agents) - I
    elseif topology == :ring
        for i in 1:n_agents
            coupling[i, mod1(i-1, n_agents)] = 1.0
            coupling[i, mod1(i+1, n_agents)] = 1.0
        end
    elseif topology == :smallworld
        # Watts-Strogatz small world
        k = min(4, n_agents - 1)  # Each node connected to k neighbors
        p = 0.3  # Rewiring probability
        for i in 1:n_agents
            for j in 1:k÷2
                coupling[i, mod1(i+j, n_agents)] = 1.0
                coupling[i, mod1(i-j, n_agents)] = 1.0
            end
        end
        # Rewire with probability p
        for i in 1:n_agents
            for j in 1:n_agents
                if coupling[i,j] == 1.0 && rand() < p
                    new_j = rand(1:n_agents)
                    if new_j != i && coupling[i, new_j] == 0.0
                        coupling[i, j] = 0.0
                        coupling[i, new_j] = 1.0
                    end
                end
            end
        end
    elseif topology == :scalefree
        # Barabási-Albert scale-free
        m = 2  # New edges per node
        for i in 3:n_agents
            degrees = vec(sum(coupling[1:i-1, 1:i-1], dims=2)) .+ 1
            probs = degrees / sum(degrees)
            targets = Int[]
            while length(targets) < m
                t = rand(1:i-1)
                if rand() < probs[t] && !(t in targets)
                    push!(targets, t)
                end
            end
            for t in targets
                coupling[i, t] = 1.0
                coupling[t, i] = 1.0
            end
        end
    end
    
    # Normalize coupling
    for i in 1:n_agents
        row_sum = sum(coupling[i, :])
        if row_sum > 0
            coupling[i, :] ./= row_sum
        end
    end
    
    SwarmField(dims, fitness, coupling, zeros(dims), topology)
end

# ═══════════════════════════════════════════════════════════════════════════════
# PARTICLE SWARM COGNITION — PSO as Thinking
# ═══════════════════════════════════════════════════════════════════════════════

"""
Particle Swarm Optimization as cognitive process.
Each particle IS a thought. The swarm IS thinking.
"""
function particle_swarm_cognition!(agents::Vector{CognitiveAgent}, field::SwarmField;
                                   w::Float64=0.729, c1::Float64=1.49445, c2::Float64=1.49445)
    n = length(agents)
    
    # Find global best
    global_best_idx = argmax([a.best_fitness for a in agents])
    global_best = agents[global_best_idx].best_position
    
    for agent in agents
        # Cognitive component (personal best)
        r1 = rand(field.dims)
        cognitive = c1 .* r1 .* (agent.best_position - agent.position)
        
        # Social component (global best)
        r2 = rand(field.dims)
        social = c2 .* r2 .* (global_best - agent.position)
        
        # Update velocity with inertia
        agent.velocity = w .* agent.velocity + cognitive + social
        
        # Update position
        agent.position += agent.velocity
        
        # Evaluate fitness
        fitness = field.fitness(agent.position)
        
        # Update personal best
        if fitness > agent.best_fitness
            agent.best_position = copy(agent.position)
            agent.best_fitness = fitness
        end
        
        # Record in memory
        push!(agent.memory, copy(agent.position))
    end
end

# ═══════════════════════════════════════════════════════════════════════════════
# ANT COLONY REASONING — ACO as Collective Thought
# ═══════════════════════════════════════════════════════════════════════════════

"""
Ant Colony Optimization as reasoning — following pheromone trails through thought space.
"""
function ant_colony_reasoning!(agents::Vector{CognitiveAgent}, field::SwarmField,
                               stig::Stigmergy; α::Float64=1.0, β::Float64=2.0)
    for agent in agents
        # Compute direction based on pheromone and heuristic
        n_directions = 10
        directions = [randn(field.dims) for _ in 1:n_directions]
        
        # Normalize directions
        directions = [d ./ norm(d) for d in directions]
        
        # Compute attractiveness of each direction
        attractiveness = zeros(n_directions)
        for (i, dir) in enumerate(directions)
            step = agent.position + 0.1 * dir
            
            # Pheromone component (τ^α)
            τ = max(sample_pheromone(stig, step), 0.001)
            
            # Heuristic component (η^β) — fitness gradient
            η = max(field.fitness(step) - field.fitness(agent.position) + 1, 0.001)
            
            attractiveness[i] = τ^α * η^β
        end
        
        # Normalize to probabilities
        probs = attractiveness ./ sum(attractiveness)
        
        # Sample direction
        cumprobs = cumsum(probs)
        r = rand()
        chosen = findfirst(c -> c >= r, cumprobs)
        chosen = isnothing(chosen) ? 1 : chosen
        
        # Move
        agent.position += 0.1 * directions[chosen]
        
        # Deposit pheromone based on fitness
        fitness = field.fitness(agent.position)
        quality = 1.0 / (1.0 + exp(-fitness))  # Sigmoid normalization
        agent.pheromone_deposit = quality
        deposit!(stig, agent, quality)
        
        push!(agent.memory, copy(agent.position))
    end
    
    # Update stigmergy
    update!(stig)
end

# ═══════════════════════════════════════════════════════════════════════════════
# BEE ALGORITHM — Exploitation and Exploration
# ═══════════════════════════════════════════════════════════════════════════════

"""
Artificial Bee Colony algorithm as search — balancing exploitation and exploration.
"""
function bee_algorithm_search!(agents::Vector{CognitiveAgent}, field::SwarmField;
                               limit::Int=20, employed_ratio::Float64=0.5)
    n = length(agents)
    n_employed = Int(floor(n * employed_ratio))
    
    # Employed bees phase — local search
    for i in 1:n_employed
        agent = agents[i]
        
        # Generate neighbor solution
        k = rand(1:field.dims)
        j = rand(setdiff(1:n, i))
        
        ϕ = 2 * rand() - 1
        new_pos = copy(agent.position)
        new_pos[k] = agent.position[k] + ϕ * (agent.position[k] - agents[j].position[k])
        
        # Greedy selection
        if field.fitness(new_pos) > field.fitness(agent.position)
            agent.position = new_pos
            agent.activation = 1.0  # Reset trial counter
        else
            agent.activation -= 1/limit
        end
    end
    
    # Calculate selection probabilities
    fitnesses = [field.fitness(agents[i].position) for i in 1:n_employed]
    min_fit = minimum(fitnesses)
    probs = (fitnesses .- min_fit .+ 0.1) ./ sum(fitnesses .- min_fit .+ 0.1)
    
    # Onlooker bees phase
    for i in n_employed+1:n
        # Select food source by probability
        cumprobs = cumsum(probs)
        r = rand()
        selected = findfirst(c -> c >= r, cumprobs)
        selected = isnothing(selected) ? 1 : selected
        
        # Generate neighbor solution
        k = rand(1:field.dims)
        j = rand(setdiff(1:n_employed, selected))
        
        ϕ = 2 * rand() - 1
        new_pos = copy(agents[selected].position)
        new_pos[k] += ϕ * (agents[selected].position[k] - agents[j].position[k])
        
        agents[i].position = new_pos
    end
    
    # Scout bees phase — abandon exhausted sources
    for agent in agents
        if agent.activation <= 0
            agent.position = randn(field.dims) .* PHI
            agent.activation = 1.0
        end
    end
    
    for agent in agents
        push!(agent.memory, copy(agent.position))
    end
end

# ═══════════════════════════════════════════════════════════════════════════════
# KURAMOTO SYNCHRONIZATION — Phase Locking of Thoughts
# ═══════════════════════════════════════════════════════════════════════════════

"""
Kuramoto model for synchronizing cognitive oscillators.
When thoughts synchronize, coherent cognition emerges.
"""
function kuramoto_synchronize!(agents::Vector{CognitiveAgent}, field::SwarmField;
                               K::Float64=COUPLING_STRENGTH, dt::Float64=0.1)
    n = length(agents)
    
    # Compute phase derivatives
    dθ = zeros(n)
    
    for i in 1:n
        agent = agents[i]
        
        # Natural frequency contribution
        dθ[i] = agent.frequency
        
        # Coupling contribution
        coupling_sum = 0.0
        for j in 1:n
            if i != j
                weight = field.coupling_matrix[i, j]
                coupling_sum += weight * sin(agents[j].phase - agent.phase)
            end
        end
        dθ[i] += K * coupling_sum
    end
    
    # Update phases
    for i in 1:n
        agents[i].phase = mod(agents[i].phase + dt * dθ[i], TWO_PI)
    end
end

"""
Measure synchronization order parameter (Kuramoto r).
r=1 means perfect synchronization, r=0 means no synchronization.
"""
function measure_synchrony(agents::Vector{CognitiveAgent})
    n = length(agents)
    
    # Complex order parameter
    Z = sum(exp(im * a.phase) for a in agents) / n
    
    r = abs(Z)           # Synchronization magnitude
    ψ = angle(Z)         # Mean phase
    
    return (r=r, ψ=ψ)
end

# ═══════════════════════════════════════════════════════════════════════════════
# CROSS-FREQUENCY COUPLING — Multi-Scale Synchronization
# ═══════════════════════════════════════════════════════════════════════════════

"""
Cross-frequency coupling between cognitive oscillators at different frequencies.
Models how slow rhythms modulate fast rhythms (like theta-gamma coupling in brain).
"""
function cross_frequency_coupling!(agents::Vector{CognitiveAgent}; 
                                   slow_idx::Vector{Int}, fast_idx::Vector{Int},
                                   coupling_strength::Float64=0.1)
    # Compute mean phase of slow oscillators
    slow_phase = mean(agents[i].phase for i in slow_idx)
    
    # Modulate amplitude of fast oscillators based on slow phase
    for i in fast_idx
        # Phase-amplitude coupling: amplitude peaks at slow phase = 0
        modulation = coupling_strength * cos(slow_phase)
        agents[i].amplitude = 1.0 + modulation
        
        # Also modulate frequency slightly
        agents[i].frequency *= (1.0 + 0.1 * modulation)
    end
end

"""
Phase-amplitude coupling — slow phase drives fast amplitude.
This is how the brain coordinates information flow across scales.
"""
function phase_amplitude_coupling!(agents::Vector{CognitiveAgent}, field::SwarmField;
                                   θ_freq::Float64=6.0,    # Theta ~6 Hz
                                   γ_freq::Float64=40.0,   # Gamma ~40 Hz
                                   coupling::Float64=0.5)
    # Separate agents into frequency bands
    θ_agents = filter(a -> abs(a.frequency - θ_freq) < 2, agents)
    γ_agents = filter(a -> abs(a.frequency - γ_freq) < 10, agents)
    
    if isempty(θ_agents) || isempty(γ_agents)
        return
    end
    
    # Compute theta phase
    θ_phase = mean(a.phase for a in θ_agents)
    
    # Modulate gamma amplitude
    for agent in γ_agents
        # Preferred phase: gamma strongest at theta peak
        phase_diff = mod(agent.phase - θ_phase + π, TWO_PI) - π
        
        # Von Mises-like modulation
        agent.amplitude = 1.0 + coupling * cos(phase_diff)
        
        # Gamma power peaks at theta trough (like in hippocampus)
        if abs(phase_diff) < π/4
            agent.activation *= (1.0 + 0.1 * coupling)
        end
    end
end

# ═══════════════════════════════════════════════════════════════════════════════
# CONSENSUS PROTOCOL — Reaching Agreement
# ═══════════════════════════════════════════════════════════════════════════════

"""
Consensus protocol for belief convergence.
"""
struct ConsensusProtocol
    rate::Float64                          # Convergence rate
    threshold::Float64                     # Agreement threshold
    method::Symbol                         # :average, :median, :leader
end

function ConsensusProtocol(; rate=0.1, threshold=0.01, method=:average)
    ConsensusProtocol(rate, threshold, method)
end

"""
Run consensus step — agents move toward agreement.
"""
function consensus_step!(agents::Vector{CognitiveAgent}, field::SwarmField,
                        protocol::ConsensusProtocol)
    n = length(agents)
    
    # Compute target position based on method
    target = if protocol.method == :average
        mean(a.position for a in agents)
    elseif protocol.method == :median
        # Component-wise median
        dims = length(agents[1].position)
        [median(a.position[d] for a in agents) for d in 1:dims]
    elseif protocol.method == :leader
        # Follow best agent
        best_idx = argmax([a.best_fitness for a in agents])
        agents[best_idx].position
    else
        mean(a.position for a in agents)
    end
    
    # Move agents toward consensus
    for i in 1:n
        agent = agents[i]
        
        # Weighted average with neighbors
        neighbor_contrib = zeros(length(agent.position))
        for j in 1:n
            if field.coupling_matrix[i, j] > 0
                neighbor_contrib += field.coupling_matrix[i, j] * 
                                   (agents[j].position - agent.position)
            end
        end
        
        # Global consensus pull
        global_contrib = protocol.rate * (target - agent.position)
        
        # Update
        agent.position += neighbor_contrib + global_contrib
    end
end

"""
Measure consensus level — how much do agents agree?
"""
function measure_coherence(agents::Vector{CognitiveAgent})
    n = length(agents)
    positions = [a.position for a in agents]
    
    # Compute centroid
    centroid = mean(positions)
    
    # Compute variance
    variance = mean(norm(p - centroid)^2 for p in positions)
    
    # Coherence = 1 / (1 + variance)
    coherence = 1.0 / (1.0 + variance)
    
    return (coherence=coherence, centroid=centroid, variance=variance)
end

# ═══════════════════════════════════════════════════════════════════════════════
# SWARM MIND — The Complete Multi-Agent Thinking System
# ═══════════════════════════════════════════════════════════════════════════════

"""
A SwarmMind is a complete multi-agent cognitive system.
"""
mutable struct SwarmMind
    name::String
    agents::Vector{CognitiveAgent}
    field::SwarmField
    stigmergy::Stigmergy
    consensus::ConsensusProtocol
    generation::Int
    synchrony::Float64
    coherence::Float64
    collective_fitness::Float64
    history::Vector{Dict}
end

function create_swarm_mind(name::String; n_agents::Int=20, dims::Int=10,
                          topology::Symbol=:smallworld)
    agents = [CognitiveAgent(i, dims) for i in 1:n_agents]
    field = SwarmField(dims, n_agents; topology=topology)
    stig = Stigmergy()
    consensus = ConsensusProtocol()
    
    # Initialize neighbor relationships
    for i in 1:n_agents
        agents[i].neighbors = findall(j -> field.coupling_matrix[i,j] > 0, 1:n_agents)
        agents[i].influence_weights = field.coupling_matrix[i, agents[i].neighbors]
    end
    
    SwarmMind(name, agents, field, stig, consensus, 0, 0.0, 0.0, 0.0, Dict[])
end

"""
Run one orchestration cycle — the swarm thinks together.
"""
function orchestrate!(mind::SwarmMind; 
                     method::Symbol=:hybrid,
                     sync_steps::Int=5,
                     consensus_steps::Int=3)
    mind.generation += 1
    
    # Phase 1: Local optimization
    if method == :pso || method == :hybrid
        particle_swarm_cognition!(mind.agents, mind.field)
    elseif method == :aco
        ant_colony_reasoning!(mind.agents, mind.field, mind.stigmergy)
    elseif method == :bee
        bee_algorithm_search!(mind.agents, mind.field)
    end
    
    # Phase 2: Synchronization
    for _ in 1:sync_steps
        kuramoto_synchronize!(mind.agents, mind.field)
    end
    
    # Phase 3: Cross-frequency coupling (if agents have varied frequencies)
    slow = filter(a -> a.frequency < 2, mind.agents)
    fast = filter(a -> a.frequency >= 2, mind.agents)
    if length(slow) > 0 && length(fast) > 0
        cross_frequency_coupling!(mind.agents; 
                                  slow_idx=[a.id for a in slow],
                                  fast_idx=[a.id for a in fast])
    end
    
    # Phase 4: Consensus
    for _ in 1:consensus_steps
        consensus_step!(mind.agents, mind.field, mind.consensus)
    end
    
    # Update metrics
    sync = measure_synchrony(mind.agents)
    mind.synchrony = sync.r
    
    coh = measure_coherence(mind.agents)
    mind.coherence = coh.coherence
    
    mind.collective_fitness = mean(a.best_fitness for a in mind.agents)
    
    # Record history
    push!(mind.history, Dict(
        :generation => mind.generation,
        :synchrony => mind.synchrony,
        :coherence => mind.coherence,
        :fitness => mind.collective_fitness,
        :centroid => coh.centroid
    ))
    
    return mind
end

"""
Run multiple orchestration cycles.
"""
function run_swarm!(mind::SwarmMind, n_cycles::Int; method::Symbol=:hybrid)
    for _ in 1:n_cycles
        orchestrate!(mind; method=method)
    end
    return mind
end

"""
Get the swarm's current collective belief.
"""
function collective_belief(mind::SwarmMind)
    measure_coherence(mind.agents).centroid
end

"""
Summarize swarm state.
"""
function summarize(mind::SwarmMind)
    println("╔════════════════════════════════════════════════════════════════╗")
    println("║         SWARM MIND: $(mind.name)")
    println("╠════════════════════════════════════════════════════════════════╣")
    println("║  Agents:              $(length(mind.agents))")
    println("║  Generation:          $(mind.generation)")
    println("║  Synchrony (r):       $(round(mind.synchrony, digits=4))")
    println("║  Coherence:           $(round(mind.coherence, digits=4))")
    println("║  Collective Fitness:  $(round(mind.collective_fitness, digits=4))")
    println("║  Topology:            $(mind.field.topology)")
    println("╚════════════════════════════════════════════════════════════════╝")
end

end # module SwarmOrchestration
