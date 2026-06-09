#!/usr/bin/env julia
#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS CLI — Terminal-native Research Verification Tool                              ║
║  Usage: julia thesis.jl <command> [path] [options]                                    ║
║                                                                                       ║
║  Commands:                                                                            ║
║    verify         Full verification pipeline                                          ║
║    evidence-map   Map implementations (functions, stubs, dead code)                   ║
║    claims         Extract and classify research claims                                ║
║    lineage        Trace code lineage and provenance                                   ║
║    packet build   Generate verification packet                                        ║
║    preprint split Split into preprint-sized verification series                       ║
║    manifest       Generate SHA-256 hash manifest                                      ║
║    seal           Create verification seal                                            ║
║                                                                                       ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

# Add the parent directory to load path
push!(LOAD_PATH, @__DIR__)
push!(LOAD_PATH, joinpath(@__DIR__, "src", "Thesis"))

include(joinpath(@__DIR__, "src", "Thesis", "ThesisVerifier.jl"))

using .ThesisVerifier

# Also expose sub-modules for direct access
using .ThesisVerifier.ClaimBoundary
using .ThesisVerifier.EvidenceMap
using .ThesisVerifier.ProofPosture
using .ThesisVerifier.HashManifest
using .ThesisVerifier.PacketBuilder

# ════════════════════════════════════════════════════════════════════════════════
# CLI Constants
# ════════════════════════════════════════════════════════════════════════════════

const VERSION = "1.0.0"
const AUTHOR = "Freddy Medina — Medina Sovereign Intelligence"

const USAGE = """
╔══════════════════════════════════════════════════════════════╗
║  THESIS — Research Verification Engine v$(VERSION)           ║
║  $(AUTHOR)                    ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
    julia thesis.jl <command> [path] [options]

COMMANDS:
    verify          Run full verification pipeline
    evidence-map    Map all implementations and detect stubs
    claims          Extract and classify research claims
    lineage         Trace code lineage and provenance
    packet build    Build a verification packet
    preprint split  Split into preprint series
    manifest        Generate SHA-256 hash manifest
    seal            Create verification seal for a manifest

OPTIONS:
    --author <name>     Set author for seals (default: THESIS)
    --output <path>     Write output to file
    --json              Output in JSON format
    --quiet             Suppress progress output
    --help              Show this help message
    --version           Show version

EXAMPLES:
    julia thesis.jl verify .
    julia thesis.jl evidence-map ./src
    julia thesis.jl claims ./docs
    julia thesis.jl lineage .
    julia thesis.jl packet build .
    julia thesis.jl preprint split . --output ./preprints/
    julia thesis.jl manifest . --output manifest.json

DESIGN PRINCIPLES:
    • Zero hallucination — only reports what is evidenced
    • Deterministic — same input → same output, always
    • Hash-sealed — every packet cryptographically attested
    • Local-first — no cloud dependency
    • CI-native — runs in any pipeline
"""

# ════════════════════════════════════════════════════════════════════════════════
# CLI Parser
# ════════════════════════════════════════════════════════════════════════════════

function parse_args(args)
    if isempty(args) || "--help" in args || "-h" in args
        println(USAGE)
        return nothing
    end

    if "--version" in args || "-v" in args
        println("THESIS v$(VERSION)")
        return nothing
    end

    command = args[1]
    path = length(args) >= 2 && !startswith(args[2], "-") ? args[2] : "."

    # Handle two-word commands
    if command == "packet" && length(args) >= 2 && args[2] == "build"
        command = "packet-build"
        path = length(args) >= 3 && !startswith(args[3], "-") ? args[3] : "."
    elseif command == "preprint" && length(args) >= 2 && args[2] == "split"
        command = "preprint-split"
        path = length(args) >= 3 && !startswith(args[3], "-") ? args[3] : "."
    end

    # Parse options
    author = "THESIS"
    output = nothing
    json_output = false

    for i in 1:length(args)
        if args[i] == "--author" && i < length(args)
            author = args[i+1]
        elseif args[i] == "--output" && i < length(args)
            output = args[i+1]
        elseif args[i] == "--json"
            json_output = true
        end
    end

    return (command=command, path=abspath(path), author=author, output=output, json=json_output)
end

# ════════════════════════════════════════════════════════════════════════════════
# Command Execution
# ════════════════════════════════════════════════════════════════════════════════

function run_command(parsed)
    parsed === nothing && return

    cmd = parsed.command
    path = parsed.path

    if cmd == "verify"
        result = ThesisVerifier.verify(path; author=parsed.author)
        if parsed.json
            output = PacketBuilder.packet_to_json(result.packet)
        else
            output = PacketBuilder.packet_to_markdown(result.packet)
        end
        write_output(output, parsed.output)

    elseif cmd == "evidence-map"
        emap = ThesisVerifier.evidence_map(path)
        if parsed.json
            output = evidence_map_to_json(emap)
        else
            output = EvidenceMap.generate_evidence_report(emap)
        end
        write_output(output, parsed.output)

    elseif cmd == "claims"
        claim_set = ThesisVerifier.claims(path)
        output = claims_to_output(claim_set, parsed.json)
        write_output(output, parsed.output)

    elseif cmd == "lineage"
        lineage_data = ThesisVerifier.lineage(path)
        output = lineage_to_output(lineage_data, parsed.json)
        write_output(output, parsed.output)

    elseif cmd == "packet-build"
        packet = ThesisVerifier.packet_build(path; author=parsed.author)
        if parsed.json
            output = PacketBuilder.packet_to_json(packet)
        else
            output = PacketBuilder.packet_to_markdown(packet)
        end
        write_output(output, parsed.output)

    elseif cmd == "preprint-split"
        preprints = ThesisVerifier.preprint_split(path)
        output = preprints_to_output(preprints, parsed.json)
        write_output(output, parsed.output)

    elseif cmd == "manifest"
        manifest = HashManifest.generate_manifest(path)
        output = HashManifest.manifest_to_json(manifest)
        write_output(output, parsed.output)
        println("Manifest hash: $(manifest.manifest_hash)")

    elseif cmd == "seal"
        manifest = HashManifest.generate_manifest(path)
        seal = HashManifest.create_seal(manifest, parsed.author,
            "Integrity seal for $(path)")
        output = HashManifest.seal_to_json(seal)
        write_output(output, parsed.output)
        println("Seal ID: $(seal.seal_id)")

    else
        println("Unknown command: $(cmd)")
        println("Run 'julia thesis.jl --help' for usage information.")
    end
end

# ════════════════════════════════════════════════════════════════════════════════
# Output Helpers
# ════════════════════════════════════════════════════════════════════════════════

function write_output(content::String, output_path)
    if output_path !== nothing
        mkpath(dirname(output_path))
        write(output_path, content)
        println("Output written to: $(output_path)")
    else
        println(content)
    end
end

function evidence_map_to_json(emap)::String
    return """{
  "total_functions": $(emap.total_functions),
  "implemented_functions": $(emap.implemented_functions),
  "stub_functions": $(emap.stub_functions),
  "dead_functions": $(emap.dead_functions),
  "overall_completeness": $(emap.overall_completeness),
  "test_coverage_estimate": $(emap.test_coverage_estimate),
  "modules": $(length(emap.modules))
}"""
end

function claims_to_output(claim_set, json::Bool)::String
    if json
        io = IOBuffer()
        println(io, "{")
        println(io, "  \"total_claims\": $(length(claim_set.claims)),")
        println(io, "  \"files_scanned\": $(claim_set.total_files_scanned),")
        println(io, "  \"manifest_hash\": \"$(claim_set.manifest_hash)\",")
        println(io, "  \"claims\": [")
        for (i, claim) in enumerate(claim_set.claims)
            comma = i < length(claim_set.claims) ? "," : ""
            println(io, "    {\"id\": \"$(claim.id)\", \"classification\": \"$(claim.classification)\", \"confidence\": $(round(claim.confidence, digits=3)), \"text\": \"$(escape_string(claim.text))\"}$(comma)")
        end
        println(io, "  ]")
        println(io, "}")
        return String(take!(io))
    else
        io = IOBuffer()
        println(io, "# THESIS Claims Report")
        println(io, "")
        println(io, "**Files scanned:** $(claim_set.total_files_scanned)")
        println(io, "**Claims found:** $(length(claim_set.claims))")
        println(io, "**Manifest hash:** `$(claim_set.manifest_hash)`")
        println(io, "")
        for claim in claim_set.claims
            println(io, "- **[$(claim.classification)]** ($(round(claim.confidence*100, digits=0))%) $(claim.text)")
        end
        return String(take!(io))
    end
end

function lineage_to_output(data, json::Bool)::String
    if json
        io = IOBuffer()
        println(io, "{")
        println(io, "  \"path\": \"$(data["path"])\",")
        println(io, "  \"files_traced\": $(length(data["files"])),")
        println(io, "  \"dependency_chains\": $(length(data["dependency_chains"]))")
        println(io, "}")
        return String(take!(io))
    else
        io = IOBuffer()
        println(io, "# THESIS Lineage Report")
        println(io, "")
        println(io, "**Path:** `$(data["path"])`")
        println(io, "**Files:** $(length(data["files"]))")
        println(io, "**Dependencies:** $(length(data["dependency_chains"]))")
        println(io, "")
        if !isempty(data["dependency_chains"])
            println(io, "## Dependency Chains")
            for dep in data["dependency_chains"]
                println(io, "- $(dep)")
            end
        end
        return String(take!(io))
    end
end

function preprints_to_output(preprints, json::Bool)::String
    if json
        io = IOBuffer()
        println(io, "{\"preprints\": $(length(preprints)), \"parts\": [")
        for (i, pp) in enumerate(preprints)
            comma = i < length(preprints) ? "," : ""
            println(io, "  {\"index\": $(pp.index), \"title\": \"$(pp.title)\", \"claims\": $(length(pp.claims)), \"words\": $(pp.word_count)}$(comma)")
        end
        println(io, "]}")
        return String(take!(io))
    else
        io = IOBuffer()
        println(io, "# THESIS Preprint Series")
        println(io, "")
        for pp in preprints
            println(io, "## $(pp.title)")
            println(io, "- Claims: $(length(pp.claims))")
            println(io, "- Word count: $(pp.word_count)")
            println(io, "- Evidence files: $(length(pp.evidence))")
            println(io, "")
        end
        return String(take!(io))
    end
end

function escape_string(s::String)::String
    s = replace(s, "\\" => "\\\\")
    s = replace(s, "\"" => "\\\"")
    s = replace(s, "\n" => "\\n")
    return s
end

# ════════════════════════════════════════════════════════════════════════════════
# Main Entry Point
# ════════════════════════════════════════════════════════════════════════════════

function main()
    parsed = parse_args(ARGS)
    run_command(parsed)
end

# Run if executed directly
if abspath(PROGRAM_FILE) == abspath(@__FILE__)
    main()
end
