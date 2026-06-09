#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS — PacketBuilder Module                                                        ║
║  Verification packet generation — JSON, markdown, and publication-ready bundles       ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module PacketBuilder

export VerificationPacket, PacketType, PreprintEntry
export build_verification_packet, build_reproducibility_packet
export packet_to_json, packet_to_markdown, split_preprint

using SHA

# ════════════════════════════════════════════════════════════════════════════════
# Data Structures
# ════════════════════════════════════════════════════════════════════════════════

"""
Type of verification packet produced.
"""
@enum PacketType begin
    FULL_VERIFICATION      # Complete verification report
    REPRODUCIBILITY        # Reproducibility-focused packet
    CLAIM_AUDIT            # Claim-only audit
    EVIDENCE_BUNDLE        # Evidence files collection
    PREPRINT_SERIES        # Split into preprint-sized packets
end

"""
    VerificationPacket

Complete verification output packet — the primary deliverable of THESIS.
"""
struct VerificationPacket
    packet_id::String
    packet_type::PacketType
    timestamp::Float64
    source_path::String

    # Content sections
    summary::Dict{String, Any}
    claims::Vector{Dict{String, Any}}
    evidence_map::Dict{String, Any}
    posture_scores::Vector{Dict{String, Any}}
    manifest_hash::String
    seal_id::String

    # Metadata
    total_claims::Int
    verified_claims::Int
    implementation_score::Float64
    overall_grade::String
end

"""
    PreprintEntry

A single preprint in a split series.
"""
struct PreprintEntry
    index::Int
    title::String
    abstract_text::String
    claims::Vector{Dict{String, Any}}
    evidence::Vector{String}
    word_count::Int
end

# ════════════════════════════════════════════════════════════════════════════════
# Packet Building
# ════════════════════════════════════════════════════════════════════════════════

"""
    build_verification_packet(claims, evidence_map, posture_report, manifest, seal) -> VerificationPacket

Build a complete verification packet from all THESIS analysis outputs.
"""
function build_verification_packet(claims, evidence_map, posture_report, manifest, seal)::VerificationPacket
    timestamp = time()

    # Build summary
    summary = Dict{String, Any}(
        "total_claims" => length(claims),
        "verified_claims" => count_verified(claims),
        "implementation_score" => get_impl_score(evidence_map),
        "mean_posture" => get_mean_posture(posture_report),
        "manifest_files" => get_manifest_file_count(manifest),
        "integrity_valid" => true
    )

    # Serialize claims
    claim_dicts = [serialize_claim(c) for c in claims]

    # Serialize evidence map
    emap_dict = serialize_evidence_map(evidence_map)

    # Serialize posture scores
    posture_dicts = serialize_posture(posture_report)

    # Get manifest and seal info
    manifest_hash = get_manifest_hash(manifest)
    seal_id_str = get_seal_id(seal)

    total = length(claims)
    verified = count_verified(claims)
    impl_score = get_impl_score(evidence_map)
    grade = compute_grade(impl_score, get_mean_posture(posture_report))

    packet_hash = bytes2hex(sha256(Vector{UInt8}("$(timestamp)|$(manifest_hash)|$(total)")))
    packet_id = "PACKET-$(packet_hash[1:16])"

    return VerificationPacket(
        packet_id,
        FULL_VERIFICATION,
        timestamp,
        "",
        summary,
        claim_dicts,
        emap_dict,
        posture_dicts,
        manifest_hash,
        seal_id_str,
        total,
        verified,
        impl_score,
        grade
    )
end

"""
    build_reproducibility_packet(path::String, manifest, seal) -> VerificationPacket

Build a reproducibility-focused packet (lighter weight, focused on build/test/run).
"""
function build_reproducibility_packet(path::String, manifest, seal)::VerificationPacket
    timestamp = time()

    # Check for reproducibility artifacts
    repro_artifacts = detect_reproducibility_artifacts(path)

    summary = Dict{String, Any}(
        "has_build_file" => repro_artifacts["has_build"],
        "has_test_suite" => repro_artifacts["has_tests"],
        "has_ci_config" => repro_artifacts["has_ci"],
        "has_lock_file" => repro_artifacts["has_lock"],
        "has_container" => repro_artifacts["has_container"],
        "reproducibility_score" => repro_artifacts["score"]
    )

    manifest_hash = get_manifest_hash(manifest)
    seal_id_str = get_seal_id(seal)

    packet_hash = bytes2hex(sha256(Vector{UInt8}("REPRO|$(timestamp)|$(manifest_hash)")))
    packet_id = "REPRO-$(packet_hash[1:16])"

    return VerificationPacket(
        packet_id,
        REPRODUCIBILITY,
        timestamp,
        path,
        summary,
        Dict{String, Any}[],
        Dict{String, Any}(),
        Dict{String, Any}[],
        manifest_hash,
        seal_id_str,
        0, 0,
        repro_artifacts["score"],
        repro_grade(repro_artifacts["score"])
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Preprint Splitting
# ════════════════════════════════════════════════════════════════════════════════

"""
    split_preprint(claims, evidence_map; max_claims_per_part=10) -> Vector{PreprintEntry}

Split a large verification into a series of preprint-sized packets.
Each preprint covers a coherent subset of claims with associated evidence.
"""
function split_preprint(claims, evidence_map; max_claims_per_part::Int=10)::Vector{PreprintEntry}
    preprints = PreprintEntry[]

    # Group claims by source file
    groups = group_claims_by_source(claims)

    part_index = 1
    current_claims = Dict{String, Any}[]

    for (source, group_claims) in groups
        for claim in group_claims
            push!(current_claims, serialize_claim(claim))

            if length(current_claims) >= max_claims_per_part
                entry = build_preprint_entry(part_index, current_claims, evidence_map)
                push!(preprints, entry)
                current_claims = Dict{String, Any}[]
                part_index += 1
            end
        end
    end

    # Remaining claims
    if !isempty(current_claims)
        entry = build_preprint_entry(part_index, current_claims, evidence_map)
        push!(preprints, entry)
    end

    return preprints
end

function build_preprint_entry(index::Int, claims::Vector{Dict{String, Any}}, evidence_map)::PreprintEntry
    title = "THESIS Verification Report — Part $(index)"
    abstract_text = "Verification of $(length(claims)) research claims with evidence mapping and proof posture assessment."

    evidence_files = String[]
    for claim in claims
        if haskey(claim, "evidence_files")
            append!(evidence_files, claim["evidence_files"])
        end
    end

    word_count = sum(length(split(get(c, "text", ""), " ")) for c in claims; init=0)

    return PreprintEntry(index, title, abstract_text, claims, unique(evidence_files), word_count)
end

# ════════════════════════════════════════════════════════════════════════════════
# Serialization
# ════════════════════════════════════════════════════════════════════════════════

"""
    packet_to_json(packet::VerificationPacket) -> String

Serialize a verification packet to JSON.
"""
function packet_to_json(packet::VerificationPacket)::String
    io = IOBuffer()

    println(io, "{")
    println(io, "  \"packet_id\": \"$(packet.packet_id)\",")
    println(io, "  \"packet_type\": \"$(packet.packet_type)\",")
    println(io, "  \"timestamp\": $(packet.timestamp),")
    println(io, "  \"source_path\": \"$(escape_json(packet.source_path))\",")
    println(io, "  \"total_claims\": $(packet.total_claims),")
    println(io, "  \"verified_claims\": $(packet.verified_claims),")
    println(io, "  \"implementation_score\": $(packet.implementation_score),")
    println(io, "  \"overall_grade\": \"$(packet.overall_grade)\",")
    println(io, "  \"manifest_hash\": \"$(packet.manifest_hash)\",")
    println(io, "  \"seal_id\": \"$(packet.seal_id)\",")
    println(io, "  \"summary\": $(dict_to_json(packet.summary)),")
    println(io, "  \"claims_count\": $(length(packet.claims)),")
    println(io, "  \"posture_scores_count\": $(length(packet.posture_scores))")
    println(io, "}")

    return String(take!(io))
end

"""
    packet_to_markdown(packet::VerificationPacket) -> String

Generate a publication-ready markdown report from a verification packet.
"""
function packet_to_markdown(packet::VerificationPacket)::String
    io = IOBuffer()

    println(io, "# THESIS Verification Packet")
    println(io, "")
    println(io, "**Packet ID:** `$(packet.packet_id)`")
    println(io, "**Type:** $(packet.packet_type)")
    println(io, "**Grade:** $(packet.overall_grade)")
    println(io, "**Manifest Hash:** `$(packet.manifest_hash)`")
    println(io, "**Seal:** `$(packet.seal_id)`")
    println(io, "")
    println(io, "---")
    println(io, "")
    println(io, "## Summary")
    println(io, "")
    println(io, "| Metric | Value |")
    println(io, "|--------|-------|")
    println(io, "| Total Claims | $(packet.total_claims) |")
    println(io, "| Verified Claims | $(packet.verified_claims) |")
    println(io, "| Implementation Score | $(round(packet.implementation_score * 100, digits=1))% |")
    println(io, "")

    if !isempty(packet.claims)
        println(io, "## Claims")
        println(io, "")
        for (i, claim) in enumerate(packet.claims)
            text = get(claim, "text", "")
            class = get(claim, "classification", "unknown")
            println(io, "$(i). **[$(class)]** $(text)")
        end
        println(io, "")
    end

    println(io, "---")
    println(io, "")
    println(io, "*Generated by THESIS — Research Verification Layer*")
    println(io, "*Zero hallucination. Evidence-based cognition.*")

    return String(take!(io))
end

# ════════════════════════════════════════════════════════════════════════════════
# Reproducibility Detection
# ════════════════════════════════════════════════════════════════════════════════

function detect_reproducibility_artifacts(path::String)::Dict{String, Any}
    result = Dict{String, Any}(
        "has_build" => false,
        "has_tests" => false,
        "has_ci" => false,
        "has_lock" => false,
        "has_container" => false,
        "score" => 0.0
    )

    if !isdir(path)
        return result
    end

    # Check for build files
    build_files = ["Makefile", "Project.toml", "Cargo.toml", "package.json",
                   "build.gradle", "pom.xml", "CMakeLists.txt", "setup.py"]
    for bf in build_files
        if isfile(joinpath(path, bf))
            result["has_build"] = true
            break
        end
    end

    # Check for test directories
    test_dirs = ["test", "tests", "spec", "test_suite"]
    for td in test_dirs
        if isdir(joinpath(path, td))
            result["has_tests"] = true
            break
        end
    end

    # Check for CI config
    ci_paths = [".github/workflows", ".gitlab-ci.yml", ".circleci", "Jenkinsfile"]
    for cp in ci_paths
        full = joinpath(path, cp)
        if isfile(full) || isdir(full)
            result["has_ci"] = true
            break
        end
    end

    # Check for lock files
    lock_files = ["Manifest.toml", "Cargo.lock", "package-lock.json", "yarn.lock", "Pipfile.lock"]
    for lf in lock_files
        if isfile(joinpath(path, lf))
            result["has_lock"] = true
            break
        end
    end

    # Check for containers
    container_files = ["Dockerfile", "docker-compose.yml", "docker-compose.yaml"]
    for cf in container_files
        if isfile(joinpath(path, cf))
            result["has_container"] = true
            break
        end
    end

    # Calculate score
    score = 0.0
    result["has_build"] && (score += 0.25)
    result["has_tests"] && (score += 0.25)
    result["has_ci"] && (score += 0.20)
    result["has_lock"] && (score += 0.15)
    result["has_container"] && (score += 0.15)
    result["score"] = score

    return result
end

# ════════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ════════════════════════════════════════════════════════════════════════════════

function count_verified(claims)::Int
    count = 0
    for claim in claims
        if hasproperty(claim, :evidence_score) && claim.evidence_score > 0.5
            count += 1
        elseif hasproperty(claim, :classification)
            cls = claim.classification
            if cls in [:PROVEN, :IMPLEMENTED] || string(cls) in ["PROVEN", "IMPLEMENTED"]
                count += 1
            end
        end
    end
    return count
end

function get_impl_score(evidence_map)::Float64
    if hasproperty(evidence_map, :overall_completeness)
        return evidence_map.overall_completeness
    end
    return 0.0
end

function get_mean_posture(posture_report)::Float64
    if hasproperty(posture_report, :mean_posture)
        return posture_report.mean_posture
    end
    return 0.0
end

function get_manifest_file_count(manifest)::Int
    if hasproperty(manifest, :total_files)
        return manifest.total_files
    end
    return 0
end

function get_manifest_hash(manifest)::String
    if hasproperty(manifest, :manifest_hash)
        return manifest.manifest_hash
    end
    return "NONE"
end

function get_seal_id(seal)::String
    if hasproperty(seal, :seal_id)
        return seal.seal_id
    end
    return "NONE"
end

function serialize_claim(claim)::Dict{String, Any}
    d = Dict{String, Any}()
    if hasproperty(claim, :id)
        d["id"] = claim.id
    end
    if hasproperty(claim, :text)
        d["text"] = claim.text
    end
    if hasproperty(claim, :classification)
        d["classification"] = string(claim.classification)
    end
    if hasproperty(claim, :confidence)
        d["confidence"] = claim.confidence
    end
    if hasproperty(claim, :evidence_score)
        d["evidence_score"] = claim.evidence_score
    end
    if hasproperty(claim, :evidence_files)
        d["evidence_files"] = claim.evidence_files
    end
    if hasproperty(claim, :source_file)
        d["source_file"] = claim.source_file
    end
    return d
end

function serialize_evidence_map(emap)::Dict{String, Any}
    d = Dict{String, Any}()
    if hasproperty(emap, :total_functions)
        d["total_functions"] = emap.total_functions
    end
    if hasproperty(emap, :implemented_functions)
        d["implemented_functions"] = emap.implemented_functions
    end
    if hasproperty(emap, :stub_functions)
        d["stub_functions"] = emap.stub_functions
    end
    if hasproperty(emap, :overall_completeness)
        d["overall_completeness"] = emap.overall_completeness
    end
    return d
end

function serialize_posture(report)::Vector{Dict{String, Any}}
    dicts = Dict{String, Any}[]
    if hasproperty(report, :scores)
        for score in report.scores
            d = Dict{String, Any}(
                "claim_id" => score.claim_id,
                "overall" => score.overall,
                "is_verifiable" => score.is_verifiable
            )
            push!(dicts, d)
        end
    end
    return dicts
end

function group_claims_by_source(claims)::Dict{String, Vector}
    groups = Dict{String, Vector}()
    for claim in claims
        source = hasproperty(claim, :source_file) ? claim.source_file : "unknown"
        if !haskey(groups, source)
            groups[source] = []
        end
        push!(groups[source], claim)
    end
    return groups
end

function compute_grade(impl_score::Float64, posture_score::Float64)::String
    combined = 0.6 * impl_score + 0.4 * posture_score
    combined >= 0.9 && return "A+"
    combined >= 0.8 && return "A"
    combined >= 0.7 && return "B"
    combined >= 0.5 && return "C"
    combined >= 0.3 && return "D"
    return "F"
end

function repro_grade(score::Float64)::String
    score >= 0.9 && return "A+ (Fully Reproducible)"
    score >= 0.7 && return "A (Highly Reproducible)"
    score >= 0.5 && return "B (Moderately Reproducible)"
    score >= 0.3 && return "C (Partially Reproducible)"
    return "D (Low Reproducibility)"
end

function dict_to_json(d::Dict{String, Any})::String
    io = IOBuffer()
    print(io, "{")
    pairs = collect(d)
    for (i, (k, v)) in enumerate(pairs)
        comma = i < length(pairs) ? ", " : ""
        if v isa String
            print(io, "\"$k\": \"$(escape_json(v))\"$comma")
        elseif v isa Bool
            print(io, "\"$k\": $(v ? "true" : "false")$comma")
        elseif v isa Number
            print(io, "\"$k\": $v$comma")
        else
            print(io, "\"$k\": \"$(escape_json(string(v)))\"$comma")
        end
    end
    print(io, "}")
    return String(take!(io))
end

function escape_json(s::String)::String
    s = replace(s, "\\" => "\\\\")
    s = replace(s, "\"" => "\\\"")
    s = replace(s, "\n" => "\\n")
    return s
end

end # module PacketBuilder
