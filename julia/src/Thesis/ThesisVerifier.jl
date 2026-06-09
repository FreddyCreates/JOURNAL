#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS — ThesisVerifier Module                                                       ║
║  Core verification engine orchestrating all THESIS subsystems                         ║
║  The primary entry point for research verification                                    ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module ThesisVerifier

export verify, evidence_map, claims, lineage, packet_build, preprint_split
export VerificationResult

# Include sub-modules
include("ClaimBoundary.jl")
include("EvidenceMap.jl")
include("ProofPosture.jl")
include("HashManifest.jl")
include("PacketBuilder.jl")

using .ClaimBoundary
using .EvidenceMap
using .ProofPosture
using .HashManifest
using .PacketBuilder

using SHA

# ════════════════════════════════════════════════════════════════════════════════
# Core Data Structures
# ════════════════════════════════════════════════════════════════════════════════

"""
    VerificationResult

Complete result of a THESIS verification run.
"""
struct VerificationResult
    path::String
    timestamp::Float64
    claim_set::ClaimBoundary.ClaimSet
    evidence::EvidenceMap.RepoEvidenceMap
    posture::ProofPosture.PostureReport
    manifest::HashManifest.Manifest
    seal::HashManifest.VerificationSeal
    packet::PacketBuilder.VerificationPacket
    grade::String
    summary::Dict{String, Any}
end

# ════════════════════════════════════════════════════════════════════════════════
# Primary API — Full Verification Pipeline
# ════════════════════════════════════════════════════════════════════════════════

"""
    verify(path::String; author="THESIS") -> VerificationResult

Run the full THESIS verification pipeline on a path.
This is the primary entry point for complete repository verification.

Steps:
1. Extract all claims from documentation and source
2. Map implementations and detect stubs/dead code
3. Map claims to evidence
4. Assess proof posture of all claims
5. Generate hash manifest for integrity
6. Create verification seal
7. Build verification packet

Returns a VerificationResult with all analysis outputs.
"""
function verify(path::String; author::String="THESIS")::VerificationResult
    timestamp = time()

    println("╔══════════════════════════════════════════════════════╗")
    println("║  THESIS — Research Verification Engine               ║")
    println("╚══════════════════════════════════════════════════════╝")
    println()

    # Step 1: Extract claims
    println("  [1/7] Extracting claims...")
    claim_set = ClaimBoundary.extract_claims(path)
    println("        Found $(length(claim_set.claims)) claims in $(claim_set.total_files_scanned) files")

    # Step 2: Map implementations
    println("  [2/7] Mapping implementations...")
    emap = EvidenceMap.map_implementations(path)
    println("        $(emap.total_functions) functions ($(emap.implemented_functions) implemented, $(emap.stub_functions) stubs)")

    # Step 3: Map claims to evidence
    println("  [3/7] Mapping claims to evidence...")
    claim_set_with_evidence = ClaimBoundary.map_claims_to_evidence(claim_set, path)
    println("        Evidence mapped for $(length(claim_set_with_evidence.claims)) claims")

    # Step 4: Assess proof posture
    println("  [4/7] Assessing proof posture...")
    posture = ProofPosture.assess_posture(claim_set_with_evidence.claims, emap)
    println("        Mean posture: $(round(posture.mean_posture, digits=3))")

    # Step 5: Generate manifest
    println("  [5/7] Generating hash manifest...")
    manifest = HashManifest.generate_manifest(path)
    println("        $(manifest.total_files) files, $(manifest.total_bytes) bytes hashed")

    # Step 6: Create seal
    println("  [6/7] Creating verification seal...")
    seal = HashManifest.create_seal(
        manifest,
        author,
        "Full verification of $(path) — $(length(claim_set_with_evidence.claims)) claims assessed"
    )
    println("        Seal: $(seal.seal_id)")

    # Step 7: Build packet
    println("  [7/7] Building verification packet...")
    packet = PacketBuilder.build_verification_packet(
        claim_set_with_evidence.claims,
        emap,
        posture,
        manifest,
        seal
    )
    println("        Packet: $(packet.packet_id) — Grade: $(packet.overall_grade)")

    println()
    println("  ✓ Verification complete")
    println()

    # Build summary
    summary = Dict{String, Any}(
        "total_claims" => length(claim_set_with_evidence.claims),
        "total_functions" => emap.total_functions,
        "implemented_functions" => emap.implemented_functions,
        "stub_functions" => emap.stub_functions,
        "mean_posture" => posture.mean_posture,
        "verified_ratio" => posture.verified_ratio,
        "manifest_files" => manifest.total_files,
        "manifest_hash" => manifest.manifest_hash,
        "seal_id" => seal.seal_id,
        "packet_id" => packet.packet_id,
        "grade" => packet.overall_grade
    )

    return VerificationResult(
        path,
        timestamp,
        claim_set_with_evidence,
        emap,
        posture,
        manifest,
        seal,
        packet,
        packet.overall_grade,
        summary
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Individual Mode APIs
# ════════════════════════════════════════════════════════════════════════════════

"""
    evidence_map(path::String) -> RepoEvidenceMap

Map all implementations in a repository. Detect what is implemented,
what is a stub, what is dead code, and compute completeness scores.
"""
function evidence_map(path::String)::EvidenceMap.RepoEvidenceMap
    println("THESIS — Evidence Map")
    println("─────────────────────")
    emap = EvidenceMap.map_implementations(path)
    println("  Functions: $(emap.total_functions)")
    println("  Implemented: $(emap.implemented_functions)")
    println("  Stubs: $(emap.stub_functions)")
    println("  Dead code: $(emap.dead_functions)")
    println("  Completeness: $(round(emap.overall_completeness * 100, digits=1))%")
    return emap
end

"""
    claims(path::String) -> ClaimSet

Extract and classify all research claims from a path.
"""
function claims(path::String)::ClaimBoundary.ClaimSet
    println("THESIS — Claim Extraction")
    println("─────────────────────────")
    claim_set = ClaimBoundary.extract_claims(path)
    println("  Files scanned: $(claim_set.total_files_scanned)")
    println("  Claims found: $(length(claim_set.claims))")

    # Classification breakdown
    classifications = Dict{ClaimBoundary.ClaimClass, Int}()
    for claim in claim_set.claims
        cls = claim.classification
        classifications[cls] = get(classifications, cls, 0) + 1
    end

    for (cls, count) in sort(collect(classifications), by=last, rev=true)
        println("    $(cls): $(count)")
    end

    return claim_set
end

"""
    lineage(path::String) -> Dict{String, Any}

Trace code lineage and provenance for a repository.
Maps file creation order, dependency chains, and evolution.
"""
function lineage(path::String)::Dict{String, Any}
    println("THESIS — Lineage Trace")
    println("──────────────────────")

    lineage_data = Dict{String, Any}(
        "path" => path,
        "timestamp" => time(),
        "files" => Dict{String, Any}[],
        "dependency_chains" => String[],
        "creation_order" => String[]
    )

    if !isdir(path)
        return lineage_data
    end

    # Collect file modification times for ordering
    file_times = Tuple{String, Float64}[]

    for (root, dirs, files) in walkdir(path)
        filter!(d -> !startswith(d, ".") && d ∉ [".git", "node_modules", "vendor"], dirs)
        for file in files
            startswith(file, ".") && continue
            filepath = joinpath(root, file)
            rel = relpath(filepath, path)
            mt = mtime(filepath)
            push!(file_times, (rel, mt))

            push!(lineage_data["files"], Dict{String, Any}(
                "path" => rel,
                "modified" => mt,
                "size" => filesize(filepath)
            ))
        end
    end

    # Sort by modification time for creation order estimate
    sort!(file_times, by=last)
    lineage_data["creation_order"] = [ft[1] for ft in file_times]

    # Detect dependency chains (imports/includes)
    lineage_data["dependency_chains"] = detect_dependencies(path)

    println("  Files traced: $(length(file_times))")
    println("  Dependency chains: $(length(lineage_data["dependency_chains"]))")

    return lineage_data
end

"""
    packet_build(path::String; author="THESIS") -> VerificationPacket

Build a verification packet for the given path.
Shortcut that runs full verification and returns just the packet.
"""
function packet_build(path::String; author::String="THESIS")::PacketBuilder.VerificationPacket
    result = verify(path; author=author)
    return result.packet
end

"""
    preprint_split(path::String; max_claims_per_part=10) -> Vector{PreprintEntry}

Split a repository's verification into preprint-sized packets.
"""
function preprint_split(path::String; max_claims_per_part::Int=10)::Vector{PacketBuilder.PreprintEntry}
    println("THESIS — Preprint Split")
    println("───────────────────────")

    claim_set = ClaimBoundary.extract_claims(path)
    emap = EvidenceMap.map_implementations(path)

    preprints = PacketBuilder.split_preprint(
        claim_set.claims, emap;
        max_claims_per_part=max_claims_per_part
    )

    println("  Claims: $(length(claim_set.claims))")
    println("  Preprints generated: $(length(preprints))")
    for pp in preprints
        println("    Part $(pp.index): $(pp.title) ($(length(pp.claims)) claims)")
    end

    return preprints
end

# ════════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ════════════════════════════════════════════════════════════════════════════════

"""Detect import/include dependency chains."""
function detect_dependencies(path::String)::Vector{String}
    deps = String[]

    for (root, dirs, files) in walkdir(path)
        filter!(d -> !startswith(d, ".") && d ∉ [".git", "node_modules", "vendor"], dirs)
        for file in files
            filepath = joinpath(root, file)
            ext = lowercase(splitext(file)[2])

            if ext in [".jl", ".py", ".rs", ".ts", ".js"]
                content = try
                    read(filepath, String)
                catch
                    continue
                end

                rel = relpath(filepath, path)

                # Julia includes
                if ext == ".jl"
                    for m in eachmatch(r"include\(\"([^\"]+)\"\)", content)
                        push!(deps, "$(rel) → $(m.captures[1])")
                    end
                    for m in eachmatch(r"using\s+\.(\w+)", content)
                        push!(deps, "$(rel) → $(m.captures[1])")
                    end
                end

                # Python imports
                if ext == ".py"
                    for m in eachmatch(r"from\s+(\S+)\s+import", content)
                        push!(deps, "$(rel) → $(m.captures[1])")
                    end
                end

                # Rust uses
                if ext == ".rs"
                    for m in eachmatch(r"use\s+(\w+(?:::\w+)*)", content)
                        push!(deps, "$(rel) → $(m.captures[1])")
                    end
                end
            end
        end
    end

    return deps
end

end # module ThesisVerifier
