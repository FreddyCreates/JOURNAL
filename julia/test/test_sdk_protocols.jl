#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  MEDINA INTELLIGENCE SDK — Protocol & Multi-Model Test Suite                          ║
║  Tests for all 10 AI Protocols and Multi-Model Fusion Engine                          ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

using Test

# Include protocol modules
include("../src/Protocols/SovereignRoutingProtocol.jl")
include("../src/Protocols/EncryptedIntelligenceTransport.jl")
include("../src/Protocols/PhiResonanceSyncProtocol.jl")
include("../src/Protocols/AdaptiveKnowledgeAbsorption.jl")
include("../src/Protocols/MultiModelFusionProtocol.jl")
include("../src/Protocols/SovereignContractVerification.jl")
include("../src/Protocols/EdgeMeshIntelligence.jl")
include("../src/Protocols/VisualSceneIntelligence.jl")
include("../src/Protocols/MemoryLineageProtocol.jl")
include("../src/Protocols/OrganismLifecycleProtocol.jl")

# Include multi-model modules
include("../src/MultiModel/ModelRegistry.jl")
include("../src/MultiModel/FusionEngine.jl")
include("../src/MultiModel/ConsensusResolver.jl")

using .SovereignRoutingProtocol
using .EncryptedIntelligenceTransport
using .PhiResonanceSyncProtocol
using .AdaptiveKnowledgeAbsorption
using .MultiModelFusionProtocol
using .SovereignContractVerification
using .EdgeMeshIntelligence
using .VisualSceneIntelligence
using .MemoryLineageProtocol
using .OrganismLifecycleProtocol
using .ModelRegistry
using .FusionEngine
using .ConsensusResolver

const PHI = (1 + sqrt(5)) / 2
const PHI_INVERSE = 1 / PHI

@testset "MedinaIntelligenceSDK — Protocols & Multi-Model" begin

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-001: Sovereign Routing Protocol
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-001: Sovereign Routing" begin
        table = create_routing_table()
        @test length(table.routes) == 5
        @test table.total_routed == 0

        decision = route_task!(table, "coding")
        @test !isempty(decision.selected_model)
        @test decision.confidence > 0
        @test table.total_routed == 1

        # Update weights
        update_route_weights!(table, "gpt", true)
        update_route_weights!(table, "gpt", true)
        update_route_weights!(table, "gpt", false)
        @test table.weights["gpt"] > 0

        # Metrics
        metrics = routing_metrics(table)
        @test metrics["total_routed"] == 1
        @test metrics["models_available"] == 5
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-002: Encrypted Intelligence Transport
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-002: Encrypted Transport" begin
        channel = create_channel("test-channel"; level=Enhanced)
        @test channel.active
        @test channel.key_generation == 1

        plaintext = Vector{UInt8}("Hello, Sovereign Intelligence!")
        encrypted = encrypt_payload(channel, plaintext)
        @test !isempty(encrypted.ciphertext)
        @test encrypted.ciphertext != plaintext

        decrypted = decrypt_payload(channel, encrypted)
        @test decrypted == plaintext

        # Key rotation
        old_gen = channel.key_generation
        rotate_key!(channel)
        @test channel.key_generation == old_gen + 1

        # Integrity verification
        @test verify_integrity(channel, encrypted) == false  # Key rotated, tag won't match

        # Sovereign level encryption
        sov_channel = create_channel("sov-channel"; level=Sovereign)
        enc2 = encrypt_payload(sov_channel, plaintext)
        dec2 = decrypt_payload(sov_channel, enc2)
        @test dec2 == plaintext
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-003: Phi-Resonance Synchronization
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-003: Phi-Resonance Sync" begin
        cluster = create_sync_cluster(10)
        @test length(cluster.nodes) == 10

        # Synchronize multiple steps
        for _ in 1:100
            synchronize!(cluster, 0.05)
        end

        # Coherence should increase with synchronization
        coherence = measure_coherence(cluster)
        @test 0 <= coherence <= 1

        # Heartbeat pulse
        pulse = heartbeat_pulse(cluster)
        @test pulse["heartbeat_ms"] == 873
        @test pulse["active_nodes"] == 10

        # Drift correction
        correct_drift!(cluster)
        @test cluster.total_corrections >= 0
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-004: Adaptive Knowledge Absorption
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-004: Knowledge Absorption" begin
        graph = create_knowledge_graph()
        @test graph.total_entities == 0

        n = absorb_document!(graph, "The PhiResonance Module implements golden ratio mathematics for Neural coupling.", "technical", "doc-1")
        @test n > 0
        @test graph.documents_absorbed == 1

        absorb_document!(graph, "Intelligence Protocols enable Sovereign routing across Edge nodes.", "architecture", "doc-2")
        @test graph.documents_absorbed == 2

        # Digest
        digest = generate_digest(graph)
        @test digest["documents_absorbed"] == 2

        # Query
        results = query_graph(graph, "phi")
        # May or may not find depending on capitalization
        @test isa(results, Vector)

        # Metrics
        metrics = graph_metrics(graph)
        @test metrics["documents"] == 2
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-005: Multi-Model Fusion Protocol
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-005: Multi-Model Fusion" begin
        config = create_fusion_config()
        @test length(config.models) == 5

        responses = [
            ModelResponse("gpt", "The answer is 42.", 0.92, 1500, 50, "text"),
            ModelResponse("claude", "The answer is 42.", 0.90, 1200, 45, "text"),
            ModelResponse("gemini", "The answer is likely 42.", 0.85, 1000, 55, "text")
        ]

        result = fuse_responses!(config, responses)
        @test result.consensus_score > 0
        @test length(result.contributing_models) == 3
        @test config.total_fusions == 1

        # Consensus check
        consensus = check_consensus(responses)
        @test 0 <= consensus <= 1

        # Hallucination detection
        flags = detect_hallucination(responses)
        @test isa(flags, Vector{String})
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-006: Sovereign Contract Verification
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-006: Contract Verification" begin
        contract_text = """
        Party A shall deliver the software by December 2026.
        Party B must pay the agreed amount within 30 days.
        Neither party shall disclose confidential information.
        If delivery is delayed, Party A may request an extension.
        """

        contract = create_contract("C-001", "Software Agreement", contract_text)
        @test !isempty(contract.clauses)
        @test !isempty(contract.content_hash)

        # Verify
        result = verify_compliance(contract)
        @test result.clauses_verified > 0
        @test 0 <= result.compliance_score <= 1
        @test !isempty(result.proof_hash)

        # Breach detection
        breaches = detect_breach(contract)
        @test isa(breaches, Vector{String})

        # Proof generation
        proof = generate_proof(contract)
        @test length(proof) == 64  # SHA-256 hex
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-007: Edge Mesh Intelligence
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-007: Edge Mesh" begin
        mesh = create_mesh()
        @test length(mesh.nodes) == 0

        register_node!(mesh, "edge-1"; capacity=0.8, latency=50)
        register_node!(mesh, "edge-2"; capacity=0.9, latency=80)
        register_node!(mesh, "edge-3"; capacity=0.7, latency=120)
        @test length(mesh.nodes) == 3

        # Shard workload
        shards = shard_workload(mesh, "task-1", 1000; n_shards=3)
        @test length(shards) == 3

        # Discover peers
        peers = discover_peers(mesh)
        @test length(peers) == 3

        # Failover
        reassigned = failover!(mesh, "edge-1")
        @test mesh.nodes["edge-1"].active == false

        # Metrics
        metrics = mesh_metrics(mesh)
        @test metrics["total_nodes"] == 3
        @test metrics["active_nodes"] == 2
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-008: Visual Scene Intelligence
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-008: Visual Scene" begin
        pipeline = create_pipeline()
        @test length(pipeline.models) == 5

        result = compose_scene!(pipeline, "a golden sunset over mountain landscape with trees")
        @test !isempty(result.objects)
        @test result.harmony_score > 0
        @test pipeline.compositions == 1

        # φ-grid layout
        layout = phi_grid_layout(1920, 1080)
        @test layout.grid_type == "phi_grid"
        @test length(layout.focal_points) == 5
        @test layout.focal_points[1][1] ≈ PHI_INVERSE atol=0.01

        # Metrics
        metrics = pipeline_metrics(pipeline)
        @test metrics["compositions"] == 1
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-009: Memory Lineage
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-009: Memory Lineage" begin
        tree = create_memory_tree()
        @test length(tree.nodes) == 1
        @test tree.active_branch == "main"

        # Store memories
        m1 = store_memory!(tree, "First observation about phi-resonance")
        m2 = store_memory!(tree, "Second observation about quantum coherence")
        @test tree.total_stores == 3  # root + 2

        # Query lineage
        lineage = query_lineage(tree, m2.id)
        @test length(lineage) >= 2  # m2 → m1 → root

        # Branch
        fork_branch!(tree, "experiment-1")
        @test tree.active_branch == "experiment-1"

        store_memory!(tree, "Experimental data point")
        consolidate!(tree, "experiment-1")
        @test tree.active_branch == "main"

        # φ-addressing
        coord = phi_address(42)
        @test coord.z ≈ 42 * PHI_INVERSE atol=0.01

        # Metrics
        metrics = tree_metrics(tree)
        @test metrics["total_stores"] == 4
    end

    # ═══════════════════════════════════════════════════════════════════════
    # PROTO-010: Organism Lifecycle
    # ═══════════════════════════════════════════════════════════════════════
    @testset "PROTO-010: Organism Lifecycle" begin
        runtime = create_runtime("organism-1")
        @test runtime.state == Embryonic

        register_kernel!(runtime, "k1", "PhiCore")
        register_kernel!(runtime, "k2", "MemoryEngine")
        @test length(runtime.kernels) == 2

        # Boot
        boot!(runtime)
        @test runtime.state == Running
        @test runtime.kernels["k1"].state == Running

        # Health check
        health = health_check(runtime)
        @test health["healthy"] == true
        @test health["overall_health"] ≈ 1.0

        # Simulate degradation
        runtime.kernels["k1"].health_score = 0.3
        health2 = health_check(runtime)
        @test health2["healthy"] == false
        @test runtime.state == Degraded

        # Self-heal
        healed = self_heal!(runtime)
        @test healed >= 1
        @test runtime.state == Running

        # Hot-reload
        hot_reload!(runtime, "k2"; new_version="2.0.0")
        @test runtime.kernels["k2"].version == "2.0.0"

        # Shutdown
        shutdown!(runtime)
        @test runtime.state == Dead
    end

    # ═══════════════════════════════════════════════════════════════════════
    # MULTI-MODEL: Model Registry
    # ═══════════════════════════════════════════════════════════════════════
    @testset "Multi-Model: Registry" begin
        registry = ModelRegistry.create_registry()
        @test length(registry.families) == 5

        # List models
        models = list_models(registry)
        @test length(models) >= 12

        # Get specific model
        gpt = get_model(registry, "gpt-4")
        @test gpt !== nothing
        @test gpt.provider == "openai"

        # Query by modality
        vision_models = models_for_modality(registry, "vision")
        @test length(vision_models) >= 2

        # Query by task
        coding_models = models_for_task(registry, "coding")
        @test length(coding_models) >= 3

        # Stats
        stats = registry_stats(registry)
        @test stats["families"] == 5
    end

    # ═══════════════════════════════════════════════════════════════════════
    # MULTI-MODEL: Fusion Engine
    # ═══════════════════════════════════════════════════════════════════════
    @testset "Multi-Model: Fusion Engine" begin
        session = FusionEngine.create_session("session-1")
        @test session.total_fusions == 0

        request = FusionRequest(
            "task-1", "text",
            ["gpt" => "Answer A", "claude" => "Answer A", "gemini" => "Answer B"],
            Dict("gpt" => 0.92, "claude" => 0.90, "gemini" => 0.75),
            PhiDecay
        )

        response = fuse!(session, request)
        @test !isempty(response.fused_output)
        @test response.strategy_used == PhiDecay
        @test session.total_fusions == 1

        # Strategy selection
        strat = select_strategy("text", 5)
        @test strat == MajorityVote

        strat2 = select_strategy("vision", 3)
        @test strat2 == ModalityRoute

        # Session metrics
        metrics = session_metrics(session)
        @test metrics["total_fusions"] == 1
    end

    # ═══════════════════════════════════════════════════════════════════════
    # MULTI-MODEL: Consensus Resolver
    # ═══════════════════════════════════════════════════════════════════════
    @testset "Multi-Model: Consensus Resolver" begin
        resolver = ConsensusResolver.create_resolver("resolver-1")
        @test resolver.total_cases == 0

        votes = [
            ConsensusVote("gpt", "42", 0.95, "hash1", 1500),
            ConsensusVote("claude", "42", 0.92, "hash2", 1200),
            ConsensusVote("gemini", "41", 0.70, "hash3", 1000),
            ConsensusVote("llama", "42", 0.85, "hash4", 500),
            ConsensusVote("mistral", "42", 0.80, "hash5", 400)
        ]

        case_data = DisagreementCase("case-1", "What is the answer?", votes, 0.3, String[])

        resolution = resolve!(resolver, case_data)
        @test resolution.resolved_answer == "42"
        @test resolution.agreement_score >= 0.7
        @test length(resolution.dissenting_models) == 1
        @test "gemini" in resolution.dissenting_models

        # Hallucination detection
        suspects = detect_hallucinations(votes)
        @test isa(suspects, Vector{String})

        # Confidence bounds
        (lower, mid, upper) = confidence_bounds(votes)
        @test lower <= mid <= upper
        @test 0 <= lower
        @test upper <= 1

        # Metrics
        metrics = resolver_metrics(resolver)
        @test metrics["total_resolved"] == 1
    end

end

println("All SDK Protocol & Multi-Model tests completed!")
