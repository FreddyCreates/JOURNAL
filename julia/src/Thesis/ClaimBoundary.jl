#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS — ClaimBoundary Module                                                        ║
║  Claim detection, extraction, and classification from research artifacts              ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module ClaimBoundary

export Claim, ClaimClass, ClaimSet
export extract_claims, classify_claim, map_claims_to_evidence
export PROVEN, IMPLEMENTED, HYPOTHETICAL, ASPIRATIONAL, OVERSTATED, UNVERIFIABLE

using SHA

# ════════════════════════════════════════════════════════════════════════════════
# Claim Classification Taxonomy
# ════════════════════════════════════════════════════════════════════════════════

"""
Classification for research claims on a verification spectrum.

- `PROVEN`: Claim backed by formal proof, mathematical derivation, or exhaustive test
- `IMPLEMENTED`: Claim backed by working code with test coverage
- `HYPOTHETICAL`: Claim stated as hypothesis, not yet verified
- `ASPIRATIONAL`: Claim about future capability or intent
- `OVERSTATED`: Claim exceeds available evidence
- `UNVERIFIABLE`: Claim cannot be verified with available artifacts
"""
@enum ClaimClass begin
    PROVEN
    IMPLEMENTED
    HYPOTHETICAL
    ASPIRATIONAL
    OVERSTATED
    UNVERIFIABLE
end

# ════════════════════════════════════════════════════════════════════════════════
# Core Data Structures
# ════════════════════════════════════════════════════════════════════════════════

"""
    Claim

A single extracted claim with source location, classification, and evidence links.
"""
struct Claim
    id::String
    text::String
    source_file::String
    source_line::Int
    classification::ClaimClass
    confidence::Float64          # 0.0–1.0 confidence in classification
    evidence_files::Vector{String}
    evidence_score::Float64      # 0.0–1.0 how well evidence supports the claim
    hash::String                 # SHA-256 of claim text for integrity
end

"""
    ClaimSet

Collection of claims extracted from a repository or document set.
"""
struct ClaimSet
    claims::Vector{Claim}
    source_path::String
    extraction_timestamp::Float64
    total_files_scanned::Int
    manifest_hash::String        # Hash of entire claim set for integrity
end

# ════════════════════════════════════════════════════════════════════════════════
# Claim Signal Patterns
# ════════════════════════════════════════════════════════════════════════════════

# Patterns that signal different claim types in text
const PROVEN_SIGNALS = [
    r"(?i)we\s+prove\s+that",
    r"(?i)theorem\s*\d*\s*[:\.]",
    r"(?i)formally\s+verified",
    r"(?i)proof\s*[:\.]",
    r"(?i)QED",
    r"(?i)it\s+follows\s+that",
    r"(?i)by\s+induction",
    r"(?i)mathematically\s+guaranteed"
]

const IMPLEMENTED_SIGNALS = [
    r"(?i)we\s+implement",
    r"(?i)the\s+system\s+(does|performs|executes)",
    r"(?i)our\s+implementation",
    r"(?i)the\s+code\s+(handles|processes|computes)",
    r"(?i)currently\s+supports",
    r"(?i)is\s+deployed",
    r"(?i)runs\s+in\s+production"
]

const HYPOTHETICAL_SIGNALS = [
    r"(?i)we\s+hypothesize",
    r"(?i)we\s+conjecture",
    r"(?i)it\s+may\s+be\s+possible",
    r"(?i)this\s+suggests\s+that",
    r"(?i)further\s+research\s+(is\s+needed|may|could)",
    r"(?i)potentially",
    r"(?i)theoretically"
]

const ASPIRATIONAL_SIGNALS = [
    r"(?i)will\s+(enable|allow|support|provide)",
    r"(?i)future\s+work\s+will",
    r"(?i)planned\s+(feature|capability|support)",
    r"(?i)roadmap",
    r"(?i)vision\s*[:\.]",
    r"(?i)intended\s+to",
    r"(?i)designed\s+to\s+(eventually|ultimately)"
]

const OVERSTATED_SIGNALS = [
    r"(?i)the\s+first\s+(ever|of\s+its\s+kind)",
    r"(?i)revolutionary",
    r"(?i)completely\s+(solves|eliminates)",
    r"(?i)no\s+other\s+(system|tool|approach)",
    r"(?i)unprecedented",
    r"(?i)zero\s+(error|failure|hallucination)",
    r"(?i)always\s+(correct|accurate|reliable)",
    r"(?i)impossible\s+to\s+fail"
]

# ════════════════════════════════════════════════════════════════════════════════
# Extraction Engine
# ════════════════════════════════════════════════════════════════════════════════

"""
    extract_claims(path::String) -> ClaimSet

Scan a directory or file for research claims. Parses markdown, Julia docstrings,
README files, and research papers. Returns a ClaimSet with all detected claims.
"""
function extract_claims(path::String)::ClaimSet
    claims = Claim[]
    files_scanned = 0
    timestamp = time()

    if isfile(path)
        file_claims = extract_from_file(path)
        append!(claims, file_claims)
        files_scanned = 1
    elseif isdir(path)
        for (root, dirs, files) in walkdir(path)
            # Skip hidden directories and common non-research dirs
            filter!(d -> !startswith(d, ".") && d ∉ ["node_modules", "vendor", ".git"], dirs)
            for file in files
                if is_scannable(file)
                    filepath = joinpath(root, file)
                    file_claims = extract_from_file(filepath)
                    append!(claims, file_claims)
                    files_scanned += 1
                end
            end
        end
    else
        error("Path does not exist: $path")
    end

    # Classify all extracted claims
    classified_claims = [classify_claim(c) for c in claims]

    # Generate manifest hash
    claim_texts = join([c.text for c in classified_claims], "\n")
    manifest_hash = bytes2hex(sha256(Vector{UInt8}(claim_texts)))

    return ClaimSet(
        classified_claims,
        path,
        timestamp,
        files_scanned,
        manifest_hash
    )
end

"""
    extract_from_file(filepath::String) -> Vector{Claim}

Extract claims from a single file based on its type.
"""
function extract_from_file(filepath::String)::Vector{Claim}
    claims = Claim[]

    if !isfile(filepath)
        return claims
    end

    content = try
        read(filepath, String)
    catch
        return claims
    end

    lines = split(content, '\n')

    for (i, line) in enumerate(lines)
        line_str = String(strip(line))

        # Skip empty lines and pure code
        if isempty(line_str) || startswith(line_str, "```")
            continue
        end

        # Detect claim-bearing sentences
        if is_claim_bearing(line_str)
            claim_hash = bytes2hex(sha256(Vector{UInt8}(line_str)))
            claim = Claim(
                "CLAIM-$(claim_hash[1:12])",
                line_str,
                filepath,
                i,
                UNVERIFIABLE,   # Initial classification, refined later
                0.0,
                String[],
                0.0,
                claim_hash
            )
            push!(claims, claim)
        end
    end

    return claims
end

"""
    is_claim_bearing(text::String) -> Bool

Determine if a line of text contains a research claim.
"""
function is_claim_bearing(text::String)::Bool
    # Must be substantial (not just a heading or short fragment)
    length(text) < 20 && return false

    # Check all signal patterns
    all_patterns = vcat(
        PROVEN_SIGNALS, IMPLEMENTED_SIGNALS,
        HYPOTHETICAL_SIGNALS, ASPIRATIONAL_SIGNALS,
        OVERSTATED_SIGNALS
    )

    for pattern in all_patterns
        if occursin(pattern, text)
            return true
        end
    end

    # Also detect declarative claims (sentences with strong assertions)
    declarative_patterns = [
        r"(?i)^(this|the|our|we)\s+.{10,}\.",   # Declarative sentence
        r"(?i)(ensures?|guarantees?|provides?|enables?|achieves?)\s+",
    ]

    for pattern in declarative_patterns
        if occursin(pattern, text)
            return true
        end
    end

    return false
end

# ════════════════════════════════════════════════════════════════════════════════
# Classification Engine
# ════════════════════════════════════════════════════════════════════════════════

"""
    classify_claim(claim::Claim) -> Claim

Classify a claim based on textual signals and return a new Claim with
updated classification and confidence.
"""
function classify_claim(claim::Claim)::Claim
    text = claim.text
    scores = Dict{ClaimClass, Float64}(
        PROVEN => 0.0,
        IMPLEMENTED => 0.0,
        HYPOTHETICAL => 0.0,
        ASPIRATIONAL => 0.0,
        OVERSTATED => 0.0,
        UNVERIFIABLE => 0.1  # Small baseline for unverifiable
    )

    # Score against each pattern set
    for pattern in PROVEN_SIGNALS
        if occursin(pattern, text)
            scores[PROVEN] += 1.0
        end
    end

    for pattern in IMPLEMENTED_SIGNALS
        if occursin(pattern, text)
            scores[IMPLEMENTED] += 1.0
        end
    end

    for pattern in HYPOTHETICAL_SIGNALS
        if occursin(pattern, text)
            scores[HYPOTHETICAL] += 1.0
        end
    end

    for pattern in ASPIRATIONAL_SIGNALS
        if occursin(pattern, text)
            scores[ASPIRATIONAL] += 1.0
        end
    end

    for pattern in OVERSTATED_SIGNALS
        if occursin(pattern, text)
            scores[OVERSTATED] += 1.0
        end
    end

    # Find highest scoring classification
    max_class = UNVERIFIABLE
    max_score = 0.0
    total_score = sum(values(scores))

    for (cls, score) in scores
        if score > max_score
            max_score = score
            max_class = cls
        end
    end

    # Confidence is proportion of score for winning class
    confidence = total_score > 0 ? max_score / total_score : 0.0

    return Claim(
        claim.id,
        claim.text,
        claim.source_file,
        claim.source_line,
        max_class,
        confidence,
        claim.evidence_files,
        claim.evidence_score,
        claim.hash
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Evidence Mapping
# ════════════════════════════════════════════════════════════════════════════════

"""
    map_claims_to_evidence(claims::ClaimSet, repo_path::String) -> ClaimSet

Map each claim in the set to supporting evidence files in the repository.
Updates evidence_files and evidence_score for each claim.
"""
function map_claims_to_evidence(claim_set::ClaimSet, repo_path::String)::ClaimSet
    updated_claims = Claim[]

    # Build index of available evidence
    evidence_index = build_evidence_index(repo_path)

    for claim in claim_set.claims
        # Find evidence files related to this claim
        evidence_files = find_evidence_for_claim(claim, evidence_index)
        evidence_score = calculate_evidence_score(claim, evidence_files)

        # Potentially reclassify based on evidence
        new_class = refine_classification(claim, evidence_files, evidence_score)

        updated = Claim(
            claim.id,
            claim.text,
            claim.source_file,
            claim.source_line,
            new_class,
            claim.confidence,
            evidence_files,
            evidence_score,
            claim.hash
        )
        push!(updated_claims, updated)
    end

    # Recompute manifest hash
    claim_texts = join([c.text for c in updated_claims], "\n")
    manifest_hash = bytes2hex(sha256(Vector{UInt8}(claim_texts)))

    return ClaimSet(
        updated_claims,
        claim_set.source_path,
        claim_set.extraction_timestamp,
        claim_set.total_files_scanned,
        manifest_hash
    )
end

"""
    build_evidence_index(repo_path::String) -> Dict{String, Vector{String}}

Build an index mapping keywords to files that contain them.
"""
function build_evidence_index(repo_path::String)::Dict{String, Vector{String}}
    index = Dict{String, Vector{String}}()

    if !isdir(repo_path)
        return index
    end

    for (root, dirs, files) in walkdir(repo_path)
        filter!(d -> !startswith(d, ".") && d ∉ ["node_modules", "vendor", ".git"], dirs)
        for file in files
            if is_evidence_file(file)
                filepath = joinpath(root, file)
                content = try
                    lowercase(read(filepath, String))
                catch
                    continue
                end

                # Extract keywords from filename and content
                keywords = extract_keywords(file, content)
                for kw in keywords
                    if !haskey(index, kw)
                        index[kw] = String[]
                    end
                    push!(index[kw], filepath)
                end
            end
        end
    end

    return index
end

"""
    find_evidence_for_claim(claim::Claim, index::Dict) -> Vector{String}

Find files in the evidence index that are relevant to a given claim.
"""
function find_evidence_for_claim(claim::Claim, index::Dict{String, Vector{String}})::Vector{String}
    evidence = Set{String}()
    claim_words = split(lowercase(claim.text))

    # Filter to meaningful words (>4 chars, not common)
    meaningful = filter(w -> length(w) > 4 && w ∉ COMMON_WORDS, claim_words)

    for word in meaningful
        if haskey(index, word)
            for file in index[word]
                push!(evidence, file)
            end
        end
    end

    return collect(evidence)
end

"""
    calculate_evidence_score(claim::Claim, evidence_files::Vector{String}) -> Float64

Calculate how well the evidence supports the claim (0.0–1.0).
"""
function calculate_evidence_score(claim::Claim, evidence_files::Vector{String})::Float64
    isempty(evidence_files) && return 0.0

    score = 0.0

    # More evidence files → higher base score (diminishing returns)
    n = length(evidence_files)
    score += min(0.4, n * 0.1)

    # Test files are strong evidence
    test_files = filter(f -> occursin(r"test|spec", lowercase(f)), evidence_files)
    score += min(0.3, length(test_files) * 0.15)

    # Source code files are moderate evidence
    src_files = filter(f -> occursin(r"\.(jl|rs|py|ts|js|go|hs)$", f), evidence_files)
    score += min(0.3, length(src_files) * 0.1)

    return min(1.0, score)
end

"""
    refine_classification(claim::Claim, evidence::Vector{String}, score::Float64) -> ClaimClass

Refine claim classification based on available evidence.
"""
function refine_classification(claim::Claim, evidence::Vector{String}, score::Float64)::ClaimClass
    # If originally classified as IMPLEMENTED but no evidence → OVERSTATED
    if claim.classification == IMPLEMENTED && score < 0.1
        return OVERSTATED
    end

    # If originally PROVEN but no test files → HYPOTHETICAL
    if claim.classification == PROVEN
        has_tests = any(f -> occursin(r"test|spec|proof", lowercase(f)), evidence)
        if !has_tests && score < 0.3
            return HYPOTHETICAL
        end
    end

    # If originally UNVERIFIABLE but has evidence → upgrade
    if claim.classification == UNVERIFIABLE && score > 0.5
        has_tests = any(f -> occursin(r"test|spec", lowercase(f)), evidence)
        return has_tests ? IMPLEMENTED : HYPOTHETICAL
    end

    return claim.classification
end

# ════════════════════════════════════════════════════════════════════════════════
# Utility Functions
# ════════════════════════════════════════════════════════════════════════════════

const SCANNABLE_EXTENSIONS = [".md", ".jl", ".rs", ".py", ".txt", ".tex", ".rst", ".adoc"]

function is_scannable(filename::String)::Bool
    ext = lowercase(splitext(filename)[2])
    return ext in SCANNABLE_EXTENSIONS
end

const EVIDENCE_EXTENSIONS = [".jl", ".rs", ".py", ".ts", ".js", ".go", ".hs", ".ex",
                             ".test.jl", ".spec.ts", ".test.py", ".test.js"]

function is_evidence_file(filename::String)::Bool
    ext = lowercase(splitext(filename)[2])
    return ext in [".jl", ".rs", ".py", ".ts", ".js", ".go", ".hs", ".ex", ".toml", ".json"]
end

function extract_keywords(filename::String, content::String)::Vector{String}
    # Extract meaningful words from filename
    name_parts = split(replace(lowercase(splitext(filename)[1]), r"[_\-\.]" => " "))

    # Extract key terms from content (first 2000 chars for efficiency)
    snippet = content[1:min(2000, length(content))]
    content_words = split(replace(snippet, r"[^a-z\s]" => " "))

    # Filter to meaningful words
    all_words = vcat(name_parts, content_words)
    return unique(filter(w -> length(w) > 4 && w ∉ COMMON_WORDS, all_words))
end

const COMMON_WORDS = Set([
    "about", "above", "after", "again", "being", "below", "between",
    "could", "didn", "doesn", "doing", "during", "every", "first",
    "found", "given", "going", "hasn", "having", "hence", "itself",
    "might", "never", "other", "these", "their", "there", "those",
    "through", "under", "until", "using", "where", "which", "while",
    "would", "should", "could", "module", "function", "return", "import",
    "export", "const", "begin", "include", "struct", "abstract", "using"
])

end # module ClaimBoundary
