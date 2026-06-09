#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS — HashManifest Module                                                         ║
║  SHA-256 integrity layer for deterministic packet hashing and verification seals      ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module HashManifest

export Manifest, ManifestEntry, VerificationSeal
export generate_manifest, verify_manifest, create_seal, verify_seal
export hash_file, hash_directory, manifest_to_json

using SHA

# ════════════════════════════════════════════════════════════════════════════════
# Data Structures
# ════════════════════════════════════════════════════════════════════════════════

"""
    ManifestEntry

Single entry in a hash manifest — one file's integrity record.
"""
struct ManifestEntry
    path::String           # Relative path from manifest root
    hash::String           # SHA-256 hex digest
    size::Int              # File size in bytes
    modified::Float64      # Last modification timestamp
end

"""
    Manifest

Complete hash manifest for a directory or artifact set.
"""
struct Manifest
    entries::Vector{ManifestEntry}
    root_path::String
    manifest_hash::String    # SHA-256 of the manifest itself (self-sealing)
    created_at::Float64
    total_files::Int
    total_bytes::Int
    version::String
end

"""
    VerificationSeal

Cryptographic attestation seal for a verification packet.
"""
struct VerificationSeal
    seal_id::String
    manifest_hash::String
    packet_hash::String
    timestamp::Float64
    author::String
    statement::String        # What is being attested
    chain_hash::String       # Links to previous seal (for lineage)
end

# ════════════════════════════════════════════════════════════════════════════════
# Manifest Generation
# ════════════════════════════════════════════════════════════════════════════════

"""
    generate_manifest(path::String; exclude_patterns=String[]) -> Manifest

Generate a SHA-256 hash manifest for all files in a directory.
Produces a deterministic, reproducible manifest.
"""
function generate_manifest(path::String; exclude_patterns::Vector{String}=String[])::Manifest
    entries = ManifestEntry[]
    total_bytes = 0
    created_at = time()

    if isfile(path)
        entry = hash_file_entry(path, dirname(path))
        push!(entries, entry)
        total_bytes = entry.size
    elseif isdir(path)
        for (root, dirs, files) in walkdir(path)
            # Apply exclusions
            filter!(d -> !should_exclude(d, exclude_patterns) && !startswith(d, "."), dirs)

            for file in sort(files)  # Sort for determinism
                filepath = joinpath(root, file)

                if should_exclude(file, exclude_patterns) || startswith(file, ".")
                    continue
                end

                entry = hash_file_entry(filepath, path)
                push!(entries, entry)
                total_bytes += entry.size
            end
        end
    else
        error("Path does not exist: $path")
    end

    # Sort entries by path for deterministic ordering
    sort!(entries, by=e -> e.path)

    # Compute manifest self-hash (hash of all entry hashes concatenated)
    hash_concat = join([e.hash for e in entries], "")
    manifest_hash = bytes2hex(sha256(Vector{UInt8}(hash_concat)))

    return Manifest(
        entries,
        path,
        manifest_hash,
        created_at,
        length(entries),
        total_bytes,
        "1.0.0"
    )
end

"""
    hash_file_entry(filepath::String, root::String) -> ManifestEntry

Create a manifest entry for a single file.
"""
function hash_file_entry(filepath::String, root::String)::ManifestEntry
    content = read(filepath)
    file_hash = bytes2hex(sha256(content))
    file_size = length(content)
    rel_path = relpath(filepath, root)
    modified = mtime(filepath)

    return ManifestEntry(rel_path, file_hash, file_size, modified)
end

"""
    hash_file(filepath::String) -> String

Compute SHA-256 hash of a single file. Returns hex string.
"""
function hash_file(filepath::String)::String
    content = read(filepath)
    return bytes2hex(sha256(content))
end

"""
    hash_directory(path::String) -> String

Compute a single deterministic hash representing an entire directory.
"""
function hash_directory(path::String)::String
    manifest = generate_manifest(path)
    return manifest.manifest_hash
end

# ════════════════════════════════════════════════════════════════════════════════
# Manifest Verification
# ════════════════════════════════════════════════════════════════════════════════

"""
    verify_manifest(manifest::Manifest) -> Dict{String, Any}

Verify a manifest against the current filesystem state.
Returns a report of matches, mismatches, missing, and new files.
"""
function verify_manifest(manifest::Manifest)::Dict{String, Any}
    matches = String[]
    mismatches = String[]
    missing_files = String[]
    new_files = String[]

    root = manifest.root_path

    # Check each entry
    for entry in manifest.entries
        filepath = joinpath(root, entry.path)
        if !isfile(filepath)
            push!(missing_files, entry.path)
        else
            current_hash = hash_file(filepath)
            if current_hash == entry.hash
                push!(matches, entry.path)
            else
                push!(mismatches, entry.path)
            end
        end
    end

    # Check for new files not in manifest
    manifest_paths = Set(e.path for e in manifest.entries)
    if isdir(root)
        for (dir_root, dirs, files) in walkdir(root)
            filter!(d -> !startswith(d, "."), dirs)
            for file in files
                startswith(file, ".") && continue
                filepath = joinpath(dir_root, file)
                rel = relpath(filepath, root)
                if rel ∉ manifest_paths
                    push!(new_files, rel)
                end
            end
        end
    end

    integrity_score = length(manifest.entries) > 0 ?
        length(matches) / length(manifest.entries) : 0.0

    return Dict{String, Any}(
        "matches" => matches,
        "mismatches" => mismatches,
        "missing" => missing_files,
        "new_files" => new_files,
        "integrity_score" => integrity_score,
        "is_valid" => isempty(mismatches) && isempty(missing_files),
        "total_checked" => length(manifest.entries)
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Verification Seals
# ════════════════════════════════════════════════════════════════════════════════

"""
    create_seal(manifest::Manifest, author::String, statement::String;
                previous_seal::Union{VerificationSeal, Nothing}=nothing) -> VerificationSeal

Create a tamper-evident verification seal for a manifest.
Optionally chains to a previous seal for lineage tracking.
"""
function create_seal(manifest::Manifest, author::String, statement::String;
                     previous_seal::Union{VerificationSeal, Nothing}=nothing)::VerificationSeal
    timestamp = time()

    # Generate packet hash (hash of manifest + statement + timestamp)
    packet_data = "$(manifest.manifest_hash)|$(statement)|$(timestamp)|$(author)"
    packet_hash = bytes2hex(sha256(Vector{UInt8}(packet_data)))

    # Chain hash (links to previous seal)
    chain_hash = if previous_seal !== nothing
        prev_data = "$(previous_seal.seal_id)|$(previous_seal.packet_hash)"
        bytes2hex(sha256(Vector{UInt8}(prev_data)))
    else
        bytes2hex(sha256(Vector{UInt8}("GENESIS")))
    end

    # Seal ID
    seal_id = "SEAL-$(packet_hash[1:16])"

    return VerificationSeal(
        seal_id,
        manifest.manifest_hash,
        packet_hash,
        timestamp,
        author,
        statement,
        chain_hash
    )
end

"""
    verify_seal(seal::VerificationSeal, manifest::Manifest) -> Bool

Verify that a seal is consistent with its manifest.
"""
function verify_seal(seal::VerificationSeal, manifest::Manifest)::Bool
    return seal.manifest_hash == manifest.manifest_hash
end

# ════════════════════════════════════════════════════════════════════════════════
# Serialization
# ════════════════════════════════════════════════════════════════════════════════

"""
    manifest_to_json(manifest::Manifest) -> String

Serialize a manifest to JSON format.
"""
function manifest_to_json(manifest::Manifest)::String
    io = IOBuffer()

    println(io, "{")
    println(io, "  \"version\": \"$(manifest.version)\",")
    println(io, "  \"root_path\": \"$(escape_json(manifest.root_path))\",")
    println(io, "  \"manifest_hash\": \"$(manifest.manifest_hash)\",")
    println(io, "  \"created_at\": $(manifest.created_at),")
    println(io, "  \"total_files\": $(manifest.total_files),")
    println(io, "  \"total_bytes\": $(manifest.total_bytes),")
    println(io, "  \"entries\": [")

    for (i, entry) in enumerate(manifest.entries)
        comma = i < length(manifest.entries) ? "," : ""
        println(io, "    {")
        println(io, "      \"path\": \"$(escape_json(entry.path))\",")
        println(io, "      \"hash\": \"$(entry.hash)\",")
        println(io, "      \"size\": $(entry.size),")
        println(io, "      \"modified\": $(entry.modified)")
        println(io, "    }$(comma)")
    end

    println(io, "  ]")
    println(io, "}")

    return String(take!(io))
end

"""
    seal_to_json(seal::VerificationSeal) -> String

Serialize a verification seal to JSON.
"""
function seal_to_json(seal::VerificationSeal)::String
    return """{
  "seal_id": "$(seal.seal_id)",
  "manifest_hash": "$(seal.manifest_hash)",
  "packet_hash": "$(seal.packet_hash)",
  "timestamp": $(seal.timestamp),
  "author": "$(escape_json(seal.author))",
  "statement": "$(escape_json(seal.statement))",
  "chain_hash": "$(seal.chain_hash)"
}"""
end

# ════════════════════════════════════════════════════════════════════════════════
# Utility
# ════════════════════════════════════════════════════════════════════════════════

function should_exclude(name::String, patterns::Vector{String})::Bool
    for pattern in patterns
        if occursin(Regex(pattern), name)
            return true
        end
    end
    # Always exclude common non-source directories
    return name in [".git", "node_modules", "vendor", "__pycache__", ".cache", "target"]
end

function escape_json(s::String)::String
    s = replace(s, "\\" => "\\\\")
    s = replace(s, "\"" => "\\\"")
    s = replace(s, "\n" => "\\n")
    s = replace(s, "\t" => "\\t")
    return s
end

end # module HashManifest
