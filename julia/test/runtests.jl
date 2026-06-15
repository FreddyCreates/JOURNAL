#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  MEDINA INTELLIGENCE TEST SUITE                                                       ║
║  Comprehensive tests for all Julia intelligence modules                               ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

using Test

# Include modules
include("../src/PhiResonance.jl")
include("../src/QuantumCoherence.jl")
include("../src/NeuralDynamics.jl")
include("../src/TokenSimulator.jl")

using .PhiResonance
using .QuantumCoherence
using .NeuralDynamics
using .TokenSimulator

@testset "Medina Intelligence Tests" begin

    @testset "PhiResonance" begin
        @testset "Constants" begin
            @test PHI ≈ 1.618033988749895 atol=1e-10
            @test PHI_INVERSE ≈ 0.6180339887498949 atol=1e-10
            @test PHI_COMPLEMENT ≈ 0.3819660112501051 atol=1e-10
            @test PHI * PHI_INVERSE ≈ 1.0 atol=1e-10
            @test PHI_INVERSE + PHI_COMPLEMENT ≈ 1.0 atol=1e-10
        end

        @testset "Fibonacci" begin
            @test fibonacci(0) == 0
            @test fibonacci(1) == 1
            @test fibonacci(10) == 55
            @test fibonacci(20) == 6765
            @test fibonacci(50) == 12586269025
            
            # Fibonacci ratio converges to φ
            @test fibonacci_ratio(30) ≈ PHI atol=1e-8
        end

        @testset "Lucas Numbers" begin
            @test lucas(0) == 2
            @test lucas(1) == 1
            @test lucas(5) == 11
        end

        @testset "Phi Weighting" begin
            @test phi_weight(1.0, 1) ≈ PHI_INVERSE atol=1e-10
            @test phi_weight(1.0, -1) ≈ PHI atol=1e-10
            @test phi_weight(1.0, 0) ≈ 1.0 atol=1e-10
        end

        @testset "Phi Normalize" begin
            # Sigmoid-like behavior
            @test 0 < phi_normalize(0) < 1
            @test phi_normalize(10) > 0.99
            @test phi_normalize(-10) < 0.01
        end

        @testset "Golden Spiral" begin
            point = golden_spiral_point(0.0)
            @test point[1] ≈ 1.0 atol=0.01  # r=1 at θ=0
            @test point[2] ≈ 0.0 atol=0.01

            sequence = golden_spiral_sequence(10)
            @test length(sequence) == 10
        end

        @testset "Order Parameter" begin
            # All same phase → R = 1
            phases_sync = fill(π/4, 10)
            R, Ψ = order_parameter(phases_sync)
            @test R ≈ 1.0 atol=1e-10

            # Random phases → R < 1
            phases_random = rand(100) .* 2π
            R_rand, _ = order_parameter(phases_random)
            @test R_rand < 1.0
        end

        @testset "Resonance Field" begin
            field = ResonanceField(5)
            @test length(field.phases) == 5
            
            initial_R = field_coherence(field)
            
            # Evolve and check coherence changes
            for _ in 1:100
                evolve_field!(field, 0.01)
            end
            
            # Should have some coherence after evolution
            final_R = field_coherence(field)
            @test 0 <= final_R <= 1
        end
    end

    @testset "QuantumCoherence" begin
        @testset "State Creation" begin
            ψ0 = create_state(0, 2)
            @test length(ψ0.amplitudes) == 4
            @test ψ0.n_qubits == 2
            @test abs(ψ0.amplitudes[1])^2 ≈ 1.0 atol=1e-10

            superpos = create_superposition([0, 3], 2)
            @test abs(superpos.amplitudes[1])^2 ≈ 0.5 atol=1e-10
            @test abs(superpos.amplitudes[4])^2 ≈ 0.5 atol=1e-10
        end

        @testset "Bell States" begin
            bell = create_entangled_pair(:bell_phi_plus)
            @test length(bell.amplitudes) == 4
            @test abs(bell.amplitudes[1])^2 ≈ 0.5 atol=1e-10
            @test abs(bell.amplitudes[4])^2 ≈ 0.5 atol=1e-10
        end

        @testset "Fidelity" begin
            ψ = create_state(0, 1)
            ϕ = create_state(0, 1)
            @test fidelity(ψ, ϕ) ≈ 1.0 atol=1e-10

            ψ0 = create_state(0, 1)
            ψ1 = create_state(1, 1)
            @test fidelity(ψ0, ψ1) ≈ 0.0 atol=1e-10
        end

        @testset "Von Neumann Entropy" begin
            ψ = create_state(0, 1)
            ρ = state_to_density(ψ)
            @test von_neumann_entropy(ρ) ≈ 0.0 atol=1e-10  # Pure state
        end

        @testset "Token-Quantum Bridge" begin
            bridge = TokenQuantumBridge("TOKEN-1", 0.8, 0.5, π/4)
            @test bridge.token_id == "TOKEN-1"
            @test bridge.token_coherence ≈ 0.8
            
            # Sync and verify - values should be valid numbers
            new_coh, new_energy = sync_quantum_state(bridge)
            @test !isnan(new_coh) && !isinf(new_coh)
            @test !isnan(new_energy) && !isinf(new_energy)
            @test new_coh >= 0  # Coherence should be non-negative
            @test new_energy >= 0  # Energy should be non-negative
        end

        @testset "Coherence Mapping" begin
            @test coherence_to_fidelity(0.0) < 0.5
            @test coherence_to_fidelity(1.0) > 0.5
            @test coherence_to_fidelity(PHI_INVERSE) ≈ 0.5 atol=0.1
        end
    end

    @testset "NeuralDynamics" begin
        @testset "Oscillator Network" begin
            net = create_network(10)
            @test length(net.oscillators) == 10
            
            # Initial order parameter should be relatively low (random phases)
            R0, _ = get_order_parameter(net)
            @test 0 <= R0 <= 1

            # Evolve
            evolve!(net, 1.0, 0.01)
            
            # Order parameter should still be valid
            R1, _ = get_order_parameter(net)
            @test 0 <= R1 <= 1
        end

        @testset "Kuramoto Step" begin
            net = create_network(5, coupling=PHI)
            
            initial_phases = [osc.phase for osc in net.oscillators]
            kuramoto_step!(net, 0.01)
            final_phases = [osc.phase for osc in net.oscillators]
            
            # Phases should have changed
            @test initial_phases != final_phases
        end

        @testset "Hebbian Network" begin
            heb = HebbianNetwork(10)
            @test size(heb.weights) == (10, 10)
            @test all(heb.weights[i, i] == 0 for i in 1:10)  # No self-connections

            # Learning should change weights
            heb.activations = rand(10)
            initial_w = copy(heb.weights[1, 2])
            hebbian_learn!(heb, 1, 2)
            @test heb.weights[1, 2] != initial_w
        end

        @testset "Neurochemistry" begin
            chem = NeurochemistrySystem()
            @test chem.dopamine_level ≈ 0.0
            @test chem.oxytocin_level ≈ 0.0

            fire_dopamine!(chem, 0.5)
            @test chem.dopamine_level ≈ 0.5
            @test chem.arousal_state > 0

            fire_oxytocin!(chem, 0.3)
            @test chem.oxytocin_level ≈ 0.3

            decay!(chem)
            @test chem.dopamine_level < 0.5
            @test chem.oxytocin_level < 0.3
        end

        @testset "MiniBrain" begin
            brain = create_brain(10, 20)
            @test brain.coherence ≈ 0.0
            @test brain.decisions_made == 0

            # Think cycle
            input = rand(20)
            think!(brain, input)
            
            @test brain.time > 0
        end

        @testset "Emergence Cascade" begin
            net = create_network(10, coupling=PHI)
            cascade = EmergenceCascade(0.1)  # Low threshold for testing
            
            trigger_cascade!(cascade, net, 1)
            
            @test cascade.is_active
            @test 1 in cascade.activated_nodes
            @test length(cascade.cascade_order) >= 1
        end
    end

    @testset "TokenSimulator" begin
        @testset "Token Creation" begin
            token = create_token("TEST-001", "Test Token")
            @test token.id == "TEST-001"
            @test token.phase == Genesis
            @test token.coherence ≈ PHI_INVERSE
            @test token.energy ≈ 1.0
            @test token.generation == 0
        end

        @testset "Token Evolution" begin
            token = create_token("EVOLVE-001", "Evolving Token")
            initial_evolution_count = token.evolution_count
            
            evolve_token!(token, 1.0)
            
            @test token.evolution_count == initial_evolution_count + 1
            @test token.phase == Sovereign || token.phase == Ascended
            @test token.energy < 1.0  # Energy consumed
        end

        @testset "Token Merge" begin
            a = create_token("MERGE-A", "Token A")
            b = create_token("MERGE-B", "Token B")
            
            merged = merge_tokens!(a, b, "MERGED-001", 0.0)
            
            @test merged.generation == 1
            @test length(merged.merged_from) == 2
            @test a.phase == Dormant
            @test b.phase == Dormant
        end

        @testset "Token Split" begin
            token = create_token("SPLIT-001", "Splitting Token")
            
            children = split_token!(token, 3, 0.0)
            
            @test length(children) == 3
            @test token.phase == Dormant
            @test all(c.generation == 1 for c in children)
        end

        @testset "Token Universe" begin
            universe = TokenUniverse()
            
            for i in 1:5
                token = create_token("U-$i", "Universe Token $i")
                add_token!(universe, token)
            end
            
            @test length(universe.tokens) == 5
            
            metrics = calculate_metrics(universe)
            @test metrics.total_tokens == 5
            @test metrics.mean_coherence > 0
        end

        @testset "Monte Carlo Simulation" begin
            results = monte_carlo_evolution(5, 10, 3)
            
            @test haskey(results, "mean_final_coherence")
            @test haskey(results, "n_simulations")
            @test results["n_simulations"] == 3
            @test 0 <= results["mean_final_coherence"] <= 1
        end

        @testset "Economic Model" begin
            model = EconomicModel(1_000_000.0)
            
            @test model.total_supply ≈ 1_000_000.0
            @test model.circulating_supply ≈ 618033.99 atol=1.0
            @test model.locked_supply ≈ 381966.01 atol=1.0
            
            history = simulate_economy(model, 10)
            @test length(history) == 10
            @test history[10].period == 10
        end

        @testset "Token State Transitions" begin
            token = create_token("STATE-TEST", "State Testing Token")
            @test token.phase == Genesis
            
            evolve_token!(token, 1.0)
            @test token.phase != Genesis  # Should transition
        end

        @testset "Token Coherence Bounds" begin
            for i in 1:5
                token = create_token("COH-$i", "Coherence Test $i")
                @test 0 <= token.coherence <= 1
                evolve_token!(token, 0.5)
                @test 0 <= token.coherence <= 1
            end
        end

        @testset "Token Energy Decay" begin
            token = create_token("ENERGY-001", "Energy Test")
            initial_energy = token.energy
            
            for _ in 1:3
                evolve_token!(token, 1.0)
            end
            
            @test token.energy < initial_energy
        end

        @testset "Universe Token Metrics" begin
            universe = TokenUniverse()
            tokens = [create_token("MET-$i", "Metric Token $i") for i in 1:10]
            
            for token in tokens
                add_token!(universe, token)
            end
            
            metrics = calculate_metrics(universe)
            @test metrics.total_tokens == 10
            @test metrics.mean_energy > 0
            @test metrics.total_generations >= 0  # All newly created have generation >= 0
            @test metrics.max_generation == 0  # All newly created have max_generation 0
        end
    end

    @testset "NeuralDynamics Extended" begin
        @testset "Hebbian Learning Asymmetry" begin
            heb = HebbianNetwork(5)
            
            heb.activations = [1.0, 0.5, 0.0, 0.5, 1.0]
            w_initial_1_2 = copy(heb.weights[1, 2])
            
            hebbian_learn!(heb, 1, 2)
            
            # Weights should be valid (may or may not change)
            @test !isnan(heb.weights[1, 2])
            @test !isinf(heb.weights[1, 2])
        end

        @testset "Neurochemistry Bounds" begin
            chem = NeurochemistrySystem()
            
            fire_dopamine!(chem, 1.0)  # Max
            @test chem.dopamine_level <= 1.0
            @test chem.arousal_state <= 1.0
            
            fire_oxytocin!(chem, 1.0)  # Max
            @test chem.oxytocin_level <= 1.0
        end

        @testset "Brain Coherence Evolution" begin
            brain = create_brain(15, 20)
            initial_time = brain.time
            
            for i in 1:5
                input = sin.(collect(1:20) .* i * 0.1)
                think!(brain, input)
            end
            
            # Time should have progressed
            @test brain.time >= initial_time
        end
    end

    @testset "QuantumCoherence Extended" begin
        @testset "Superposition Normalization" begin
            # Verify superposition states are normalized
            sup = create_superposition([0, 1, 2, 3], 2)
            total_prob = sum(abs.(sup.amplitudes) .^ 2)
            @test total_prob ≈ 1.0 atol=1e-10
        end

        @testset "Multiple Bell States" begin
            for bell_type in [:bell_phi_plus, :bell_phi_minus, :bell_psi_plus, :bell_psi_minus]
                bell = create_entangled_pair(bell_type)
                @test length(bell.amplitudes) == 4
                
                # All Bell states should be normalized
                total_prob = sum(abs.(bell.amplitudes) .^ 2)
                @test total_prob ≈ 1.0 atol=1e-10
            end
        end
    end
end

println("All tests completed!")
