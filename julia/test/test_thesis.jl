#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS TEST SUITE                                                                    ║
║  Comprehensive tests for all THESIS verification modules                              ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

using Test

# Include the main module
include("../src/Thesis/ThesisVerifier.jl")

using .ThesisVerifier
using .ThesisVerifier.ClaimBoundary
using .ThesisVerifier.EvidenceMap
using .ThesisVerifier.ProofPosture
using .ThesisVerifier.HashManifest
using .ThesisVerifier.PacketBuilder

@testset "THESIS Verification Tests" begin

    @testset "ClaimBoundary" begin
        @testset "Claim Classification" begin
            # Test proven claim detection
            proven_claim = ClaimBoundary.Claim(
                "TEST-001", "We prove that the algorithm converges in O(n log n) time.",
                "test.md", 1, UNVERIFIABLE, 0.0, String[], 0.0,
                "abc123"
            )
            classified = ClaimBoundary.classify_claim(proven_claim)
            @test classified.classification == PROVEN
            @test classified.confidence > 0.0

            # Test implemented claim detection
            impl_claim = ClaimBoundary.Claim(
                "TEST-002", "Our implementation currently supports batch processing of 1000 items.",
                "test.md", 2, UNVERIFIABLE, 0.0, String[], 0.0,
                "def456"
            )
            classified = ClaimBoundary.classify_claim(impl_claim)
            @test classified.classification == IMPLEMENTED

            # Test hypothetical claim detection
            hypo_claim = ClaimBoundary.Claim(
                "TEST-003", "We hypothesize that recursive self-improvement may be possible.",
                "test.md", 3, UNVERIFIABLE, 0.0, String[], 0.0,
                "ghi789"
            )
            classified = ClaimBoundary.classify_claim(hypo_claim)
            @test classified.classification == HYPOTHETICAL

            # Test aspirational claim detection
            asp_claim = ClaimBoundary.Claim(
                "TEST-004", "The system will enable real-time verification by Q4 2026.",
                "test.md", 4, UNVERIFIABLE, 0.0, String[], 0.0,
                "jkl012"
            )
            classified = ClaimBoundary.classify_claim(asp_claim)
            @test classified.classification == ASPIRATIONAL

            # Test overstated claim detection
            over_claim = ClaimBoundary.Claim(
                "TEST-005", "This is the first ever system to completely solve the halting problem with zero error.",
                "test.md", 5, UNVERIFIABLE, 0.0, String[], 0.0,
                "mno345"
            )
            classified = ClaimBoundary.classify_claim(over_claim)
            @test classified.classification == OVERSTATED
        end

        @testset "Claim Extraction" begin
            # Create a temp directory with test files
            test_dir = mktempdir()
            test_file = joinpath(test_dir, "README.md")
            write(test_file, """
            # Test Project

            We implement a novel approach to distributed consensus.
            The system currently supports 100 nodes in production.
            We hypothesize that this can scale to 10,000 nodes.
            Future work will enable cross-chain interoperability.
            """)

            claim_set = ClaimBoundary.extract_claims(test_dir)
            @test claim_set.total_files_scanned >= 1
            @test length(claim_set.claims) >= 2
            @test !isempty(claim_set.manifest_hash)

            # Clean up
            rm(test_dir, recursive=true)
        end

        @testset "Claim Bearing Detection" begin
            @test ClaimBoundary.is_claim_bearing("We implement a novel consensus algorithm.")
            @test ClaimBoundary.is_claim_bearing("The system will enable real-time processing.")
            @test !ClaimBoundary.is_claim_bearing("x = 5")
            @test !ClaimBoundary.is_claim_bearing("")
            @test !ClaimBoundary.is_claim_bearing("short")
        end
    end

    @testset "EvidenceMap" begin
        @testset "Julia File Analysis" begin
            test_dir = mktempdir()
            test_file = joinpath(test_dir, "example.jl")
            write(test_file, """
            module Example

            export hello, compute

            \"\"\"
                hello(name)

            Greet someone by name.
            \"\"\"
            function hello(name::String)
                println("Hello, \$name!")
                return "Hello, \$name!"
            end

            function compute(x, y)
                return x + y
            end

            function stub_function()
                # TODO: implement this
                nothing
            end

            short_form(x) = x * 2

            end
            """)

            emap = EvidenceMap.map_implementations(test_dir)
            @test emap.total_functions >= 3
            @test emap.implemented_functions >= 2
            @test emap.overall_completeness > 0.0

            rm(test_dir, recursive=true)
        end

        @testset "Stub Detection" begin
            test_dir = mktempdir()
            test_file = joinpath(test_dir, "stubs.jl")
            write(test_file, """
            module Stubs

            function real_function(x, y)
                result = x * y + 1
                if result > 10
                    return result / 2
                else
                    return result * 3
                end
            end

            function stub_one()
                nothing
            end

            function stub_two()
                error("Not implemented")
            end

            end
            """)

            emap = EvidenceMap.map_implementations(test_dir)
            stubs = EvidenceMap.detect_stubs(emap)
            @test length(stubs) >= 1

            rm(test_dir, recursive=true)
        end

        @testset "Module Completeness" begin
            funcs = [
                EvidenceMap.FunctionEntry("f1", "a.jl", 1, EvidenceMap.FULLY_IMPLEMENTED, 10, true, true, String[], String[], 0.5),
                EvidenceMap.FunctionEntry("f2", "a.jl", 20, EvidenceMap.FULLY_IMPLEMENTED, 8, true, false, String[], String[], 0.3),
                EvidenceMap.FunctionEntry("f3", "a.jl", 30, EvidenceMap.STUB, 2, false, false, String[], String[], 0.1),
            ]
            exports = ["f1", "f2"]

            completeness = EvidenceMap.calculate_module_completeness(funcs, exports)
            @test completeness > 0.5
            @test completeness <= 1.0
        end
    end

    @testset "ProofPosture" begin
        @testset "Posture Scoring" begin
            # Create mock claims with evidence
            mock_claims = [
                (id="C1", text="We implement batch processing", evidence_files=["src/batch.jl", "test/batch_test.jl"], evidence_score=0.7),
                (id="C2", text="We hypothesize convergence", evidence_files=String[], evidence_score=0.0),
                (id="C3", text="The system is deployed in production", evidence_files=["Dockerfile", "deploy.yml"], evidence_score=0.5),
            ]

            report = ProofPosture.assess_posture(mock_claims, nothing)
            @test length(report.scores) == 3
            @test report.mean_posture >= 0.0
            @test report.mean_posture <= 1.0
            @test report.verified_ratio >= 0.0
        end

        @testset "Evidence Type Detection" begin
            @test ProofPosture.determine_evidence_type("deployed in production", String[]) == ProofPosture.PRODUCTION
            @test ProofPosture.determine_evidence_type("we hypothesize that", String[]) == ProofPosture.HYPOTHESIS
            @test ProofPosture.determine_evidence_type("will enable future work", String[]) == ProofPosture.ASPIRATIONAL_EVIDENCE
            @test ProofPosture.determine_evidence_type("measured performance gains", String[]) == ProofPosture.REAL
        end

        @testset "Dimension Scoring" begin
            files_with_tests = ["src/main.jl", "test/main_test.jl"]
            @test ProofPosture.score_tests(files_with_tests) > 0.0
            @test ProofPosture.score_implementation(files_with_tests) > 0.0

            empty_files = String[]
            @test ProofPosture.score_tests(empty_files) == 0.0
            @test ProofPosture.score_implementation(empty_files) == 0.0
        end
    end

    @testset "HashManifest" begin
        @testset "File Hashing" begin
            test_dir = mktempdir()
            test_file = joinpath(test_dir, "test.txt")
            write(test_file, "Hello, THESIS!")

            hash = HashManifest.hash_file(test_file)
            @test length(hash) == 64  # SHA-256 hex = 64 chars
            @test hash == HashManifest.hash_file(test_file)  # Deterministic

            rm(test_dir, recursive=true)
        end

        @testset "Manifest Generation" begin
            test_dir = mktempdir()
            write(joinpath(test_dir, "a.txt"), "file a")
            write(joinpath(test_dir, "b.txt"), "file b")
            mkdir(joinpath(test_dir, "sub"))
            write(joinpath(test_dir, "sub", "c.txt"), "file c")

            manifest = HashManifest.generate_manifest(test_dir)
            @test manifest.total_files == 3
            @test manifest.total_bytes > 0
            @test length(manifest.manifest_hash) == 64
            @test manifest.version == "1.0.0"

            # Deterministic — same content → same hash
            manifest2 = HashManifest.generate_manifest(test_dir)
            @test manifest.manifest_hash == manifest2.manifest_hash

            rm(test_dir, recursive=true)
        end

        @testset "Manifest Verification" begin
            test_dir = mktempdir()
            write(joinpath(test_dir, "a.txt"), "original content")

            manifest = HashManifest.generate_manifest(test_dir)
            result = HashManifest.verify_manifest(manifest)
            @test result["is_valid"] == true
            @test result["integrity_score"] == 1.0
            @test isempty(result["mismatches"])

            # Modify file — should detect mismatch
            write(joinpath(test_dir, "a.txt"), "modified content")
            result2 = HashManifest.verify_manifest(manifest)
            @test result2["is_valid"] == false
            @test !isempty(result2["mismatches"])

            rm(test_dir, recursive=true)
        end

        @testset "Verification Seals" begin
            test_dir = mktempdir()
            write(joinpath(test_dir, "data.txt"), "seal test data")

            manifest = HashManifest.generate_manifest(test_dir)
            seal = HashManifest.create_seal(manifest, "TestAuthor", "Test attestation")

            @test startswith(seal.seal_id, "SEAL-")
            @test seal.author == "TestAuthor"
            @test seal.statement == "Test attestation"
            @test seal.manifest_hash == manifest.manifest_hash
            @test HashManifest.verify_seal(seal, manifest) == true

            # Chained seals
            seal2 = HashManifest.create_seal(manifest, "TestAuthor", "Second seal"; previous_seal=seal)
            @test seal2.chain_hash != seal.chain_hash  # Different chain position
            @test HashManifest.verify_seal(seal2, manifest) == true

            rm(test_dir, recursive=true)
        end

        @testset "JSON Serialization" begin
            test_dir = mktempdir()
            write(joinpath(test_dir, "test.txt"), "json test")

            manifest = HashManifest.generate_manifest(test_dir)
            json = HashManifest.manifest_to_json(manifest)
            @test occursin("\"version\"", json)
            @test occursin("\"manifest_hash\"", json)
            @test occursin("\"entries\"", json)

            seal = HashManifest.create_seal(manifest, "Test", "JSON test")
            seal_json = HashManifest.seal_to_json(seal)
            @test occursin("\"seal_id\"", seal_json)
            @test occursin("\"packet_hash\"", seal_json)

            rm(test_dir, recursive=true)
        end
    end

    @testset "PacketBuilder" begin
        @testset "Reproducibility Detection" begin
            test_dir = mktempdir()
            write(joinpath(test_dir, "Project.toml"), "name = \"Test\"")
            mkdir(joinpath(test_dir, "test"))
            write(joinpath(test_dir, "test", "runtests.jl"), "@test true")

            artifacts = PacketBuilder.detect_reproducibility_artifacts(test_dir)
            @test artifacts["has_build"] == true
            @test artifacts["has_tests"] == true
            @test artifacts["score"] > 0.0

            rm(test_dir, recursive=true)
        end

        @testset "Packet Serialization" begin
            packet = PacketBuilder.VerificationPacket(
                "PACKET-TEST001",
                PacketBuilder.FULL_VERIFICATION,
                time(),
                "/test/path",
                Dict{String, Any}("total_claims" => 5),
                [Dict{String, Any}("id" => "C1", "text" => "Test claim", "classification" => "IMPLEMENTED")],
                Dict{String, Any}("total_functions" => 10),
                [Dict{String, Any}("claim_id" => "C1", "overall" => 0.8)],
                "abc123hash",
                "SEAL-test",
                5, 3, 0.75, "B"
            )

            json = PacketBuilder.packet_to_json(packet)
            @test occursin("PACKET-TEST001", json)
            @test occursin("\"overall_grade\": \"B\"", json)

            md = PacketBuilder.packet_to_markdown(packet)
            @test occursin("# THESIS Verification Packet", md)
            @test occursin("PACKET-TEST001", md)
            @test occursin("Grade:", md)
        end

        @testset "Preprint Splitting" begin
            # Create mock claims
            mock_claims = [(
                id="C$i",
                text="Claim number $i about the system",
                source_file="file$(div(i,5)+1).md",
                evidence_files=String[],
                evidence_score=0.0,
                classification="IMPLEMENTED",
                confidence=0.8
            ) for i in 1:25]

            preprints = PacketBuilder.split_preprint(mock_claims, nothing; max_claims_per_part=10)
            @test length(preprints) >= 2
            @test preprints[1].index == 1
            @test length(preprints[1].claims) <= 10
        end
    end

    @testset "Integration — Full Pipeline" begin
        # Create a realistic test repository
        test_dir = mktempdir()

        # README with claims
        write(joinpath(test_dir, "README.md"), """
        # Test Research Project

        We implement a novel approach to distributed consensus that achieves
        Byzantine fault tolerance with O(n) message complexity.

        Our implementation currently supports networks of up to 100 nodes.

        We hypothesize that the approach can scale to 10,000 nodes with
        minimal latency overhead.

        The system will enable cross-chain interoperability in future versions.
        """)

        # Source code
        mkdir(joinpath(test_dir, "src"))
        write(joinpath(test_dir, "src", "consensus.jl"), """
        module Consensus

        export reach_consensus, validate_block

        \"\"\"
            reach_consensus(nodes, proposal)

        Reach consensus among nodes on a proposal using our BFT algorithm.
        \"\"\"
        function reach_consensus(nodes::Vector, proposal)
            votes = collect_votes(nodes, proposal)
            if count(v -> v == true, votes) > length(nodes) * 2/3
                return (agreed=true, proposal=proposal)
            end
            return (agreed=false, proposal=nothing)
        end

        function validate_block(block, validators)
            for v in validators
                if !v.validate(block)
                    return false
                end
            end
            return true
        end

        function collect_votes(nodes, proposal)
            return [rand() > 0.3 for _ in nodes]
        end

        end
        """)

        # Test file
        mkdir(joinpath(test_dir, "test"))
        write(joinpath(test_dir, "test", "test_consensus.jl"), """
        using Test
        include("../src/consensus.jl")
        using .Consensus

        @testset "Consensus Tests" begin
            nodes = [1, 2, 3, 4, 5]
            result = reach_consensus(nodes, "block_1")
            @test haskey(result, :agreed)
        end
        """)

        # Project file
        write(joinpath(test_dir, "Project.toml"), """
        name = "TestProject"
        version = "0.1.0"
        """)

        # Run full verification
        result = ThesisVerifier.verify(test_dir)

        @test result.grade in ["A+", "A", "B", "C", "D", "F"]
        @test length(result.claim_set.claims) >= 2
        @test result.evidence.total_functions >= 2
        @test result.manifest.total_files >= 4
        @test startswith(result.seal.seal_id, "SEAL-")
        @test startswith(result.packet.packet_id, "PACKET-")
        @test !isempty(result.summary)

        # Test individual modes
        emap = ThesisVerifier.evidence_map(test_dir)
        @test emap.total_functions >= 2

        claim_set = ThesisVerifier.claims(test_dir)
        @test length(claim_set.claims) >= 2

        lineage_data = ThesisVerifier.lineage(test_dir)
        @test length(lineage_data["files"]) >= 4

        preprints = ThesisVerifier.preprint_split(test_dir)
        @test length(preprints) >= 1

        rm(test_dir, recursive=true)
    end
end

println("\n✓ All THESIS tests completed!")
