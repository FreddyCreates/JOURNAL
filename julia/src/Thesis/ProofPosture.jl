#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS — ProofPosture Module                                                         ║
║  Evidence scoring and proof posture assessment for research claims                    ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module ProofPosture

export PostureScore, PostureReport, EvidenceType
export assess_posture, score_claim_evidence, generate_posture_report
export INTERNAL, EXTERNAL, PRODUCTION, HYPOTHESIS, REAL, ASPIRATIONAL_EVIDENCE

# ════════════════════════════════════════════════════════════════════════════════
# Evidence Type Classification
# ════════════════════════════════════════════════════════════════════════════════

"""
Evidence type distinguishing origin and reliability.
"""
@enum EvidenceType begin
    INTERNAL              # Evidence from within the same repository
    EXTERNAL              # Evidence from external sources/citations
    PRODUCTION            # Evidence from production deployment
    HYPOTHESIS            # Theoretical/hypothetical evidence
    REAL                  # Empirically verified evidence
    ASPIRATIONAL_EVIDENCE # Planned/future evidence
end

# ════════════════════════════════════════════════════════════════════════════════
# Data Structures
# ════════════════════════════════════════════════════════════════════════════════

"""
    PostureScore

Numerical assessment of a claim's proof posture across multiple dimensions.
"""
struct PostureScore
    claim_id::String
    overall::Float64              # 0.0–1.0 composite score

    # Dimension scores (each 0.0–1.0)
    implementation_evidence::Float64    # Is it coded?
    test_evidence::Float64              # Is it tested?
    formal_evidence::Float64            # Is it formally proven?
    empirical_evidence::Float64         # Is there data/output?
    reproducibility::Float64            # Can it be reproduced?
    documentation_quality::Float64      # Is it well-documented?

    # Classification
    evidence_type::EvidenceType
    is_verifiable::Bool
    verification_method::String   # How to verify this claim
end

"""
    PostureReport

Complete proof posture report for a set of claims.
"""
struct PostureReport
    scores::Vector{PostureScore}
    path::String
    timestamp::Float64

    # Aggregate metrics
    mean_posture::Float64
    median_posture::Float64
    verified_ratio::Float64       # Proportion of claims that are verifiable
    strong_claims::Int            # Claims with posture > 0.8
    weak_claims::Int              # Claims with posture < 0.3
    unverifiable_claims::Int      # Claims that cannot be verified
end

# ════════════════════════════════════════════════════════════════════════════════
# Posture Assessment Engine
# ════════════════════════════════════════════════════════════════════════════════

"""
    assess_posture(claims, evidence_map) -> PostureReport

Assess the proof posture of all claims given an evidence map.
Returns a comprehensive PostureReport.
"""
function assess_posture(claims::Vector, evidence_map)::PostureReport
    scores = PostureScore[]
    timestamp = time()

    for claim in claims
        score = score_claim_evidence(claim, evidence_map)
        push!(scores, score)
    end

    # Compute aggregates
    postures = [s.overall for s in scores]
    mean_p = isempty(postures) ? 0.0 : sum(postures) / length(postures)
    median_p = isempty(postures) ? 0.0 : compute_median(postures)
    verified = count(s -> s.is_verifiable, scores)
    verified_ratio = isempty(scores) ? 0.0 : verified / length(scores)
    strong = count(s -> s.overall > 0.8, scores)
    weak = count(s -> s.overall < 0.3, scores)
    unverifiable = count(s -> !s.is_verifiable, scores)

    return PostureReport(
        scores,
        "",
        timestamp,
        mean_p,
        median_p,
        verified_ratio,
        strong,
        weak,
        unverifiable
    )
end

"""
    score_claim_evidence(claim, evidence_map) -> PostureScore

Score an individual claim's proof posture based on available evidence.
"""
function score_claim_evidence(claim, evidence_map)::PostureScore
    # Extract relevant info from claim
    claim_id = hasproperty(claim, :id) ? claim.id : "UNKNOWN"
    claim_text = hasproperty(claim, :text) ? claim.text : string(claim)
    evidence_files = hasproperty(claim, :evidence_files) ? claim.evidence_files : String[]
    evidence_score_raw = hasproperty(claim, :evidence_score) ? claim.evidence_score : 0.0

    # Score each dimension
    impl_score = score_implementation(evidence_files)
    test_score = score_tests(evidence_files)
    formal_score = score_formal_proof(claim_text, evidence_files)
    empirical_score = score_empirical(evidence_files)
    repro_score = score_reproducibility(evidence_files)
    doc_score = score_documentation(claim_text, evidence_files)

    # Determine evidence type
    etype = determine_evidence_type(claim_text, evidence_files)

    # Composite overall score (weighted)
    overall = (
        0.25 * impl_score +
        0.20 * test_score +
        0.15 * formal_score +
        0.15 * empirical_score +
        0.15 * repro_score +
        0.10 * doc_score
    )

    # Determine if verifiable
    is_verifiable = overall > 0.1 || !isempty(evidence_files)

    # Determine verification method
    method = determine_verification_method(impl_score, test_score, formal_score, empirical_score)

    return PostureScore(
        claim_id,
        overall,
        impl_score,
        test_score,
        formal_score,
        empirical_score,
        repro_score,
        doc_score,
        etype,
        is_verifiable,
        method
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Dimension Scoring Functions
# ════════════════════════════════════════════════════════════════════════════════

"""Score based on implementation evidence (source code files)."""
function score_implementation(evidence_files::Vector{String})::Float64
    source_exts = [".jl", ".rs", ".py", ".ts", ".js", ".go", ".hs", ".ex"]
    src_files = filter(f -> any(ext -> endswith(lowercase(f), ext), source_exts), evidence_files)
    isempty(src_files) && return 0.0
    return min(1.0, length(src_files) * 0.25)
end

"""Score based on test evidence."""
function score_tests(evidence_files::Vector{String})::Float64
    test_files = filter(f -> occursin(r"test|spec|_test\.|\.test\.", lowercase(f)), evidence_files)
    isempty(test_files) && return 0.0
    return min(1.0, length(test_files) * 0.3)
end

"""Score based on formal proof evidence."""
function score_formal_proof(claim_text::String, evidence_files::Vector{String})::Float64
    score = 0.0

    # Check claim text for formal language
    formal_patterns = [r"(?i)theorem", r"(?i)proof", r"(?i)lemma", r"(?i)QED",
                       r"(?i)∀|∃|⟹|⟸|≡", r"(?i)formally\s+verified"]
    for pattern in formal_patterns
        if occursin(pattern, claim_text)
            score += 0.2
        end
    end

    # Check for proof files
    proof_files = filter(f -> occursin(r"proof|theorem|lemma|verify", lowercase(f)), evidence_files)
    score += length(proof_files) * 0.2

    return min(1.0, score)
end

"""Score based on empirical evidence (data, outputs, benchmarks)."""
function score_empirical(evidence_files::Vector{String})::Float64
    data_files = filter(f -> occursin(r"\.(csv|json|dat|log|bench|result)", lowercase(f)), evidence_files)
    isempty(data_files) && return 0.0
    return min(1.0, length(data_files) * 0.25)
end

"""Score based on reproducibility (build files, CI, containers)."""
function score_reproducibility(evidence_files::Vector{String})::Float64
    repro_files = filter(f -> occursin(r"(Makefile|Dockerfile|\.yml|\.yaml|Project\.toml|Cargo\.toml|package\.json)", lowercase(f)), evidence_files)
    isempty(repro_files) && return 0.0
    return min(1.0, length(repro_files) * 0.3)
end

"""Score based on documentation quality."""
function score_documentation(claim_text::String, evidence_files::Vector{String})::Float64
    doc_files = filter(f -> occursin(r"\.(md|rst|txt|adoc|tex)", lowercase(f)), evidence_files)
    score = min(0.5, length(doc_files) * 0.15)

    # Longer, more specific claims suggest better documentation
    if length(claim_text) > 100
        score += 0.2
    end
    if occursin(r"(?i)(section|chapter|appendix|figure|table)\s+\d", claim_text)
        score += 0.2
    end

    return min(1.0, score)
end

# ════════════════════════════════════════════════════════════════════════════════
# Evidence Type Determination
# ════════════════════════════════════════════════════════════════════════════════

function determine_evidence_type(claim_text::String, evidence_files::Vector{String})::EvidenceType
    text_lower = lowercase(claim_text)

    # Check for external references
    if occursin(r"(?i)(cited|reference|external|third.party|published)", text_lower)
        return EXTERNAL
    end

    # Check for production indicators
    if occursin(r"(?i)(production|deployed|live|running|serving)", text_lower)
        return PRODUCTION
    end

    # Check for aspirational language
    if occursin(r"(?i)(will|planned|future|intended|roadmap)", text_lower)
        return ASPIRATIONAL_EVIDENCE
    end

    # Check for hypothesis indicators
    if occursin(r"(?i)(hypothe|conjecture|may|might|could|possibly)", text_lower)
        return HYPOTHESIS
    end

    # Check for empirical evidence
    if occursin(r"(?i)(measured|observed|tested|benchmark|result)", text_lower)
        return REAL
    end

    # Default to internal
    return INTERNAL
end

function determine_verification_method(impl::Float64, test::Float64, formal::Float64, empirical::Float64)::String
    max_score = maximum([impl, test, formal, empirical])

    max_score < 0.1 && return "No verification method available"

    if formal == max_score
        return "Formal verification (proof checking)"
    elseif test == max_score
        return "Test execution (run test suite)"
    elseif impl == max_score
        return "Code inspection (review implementation)"
    elseif empirical == max_score
        return "Empirical validation (reproduce results)"
    end

    return "Multi-method verification"
end

# ════════════════════════════════════════════════════════════════════════════════
# Report Generation
# ════════════════════════════════════════════════════════════════════════════════

"""
    generate_posture_report(report::PostureReport) -> String

Generate a human-readable proof posture report in markdown.
"""
function generate_posture_report(report::PostureReport)::String
    io = IOBuffer()

    println(io, "# THESIS Proof Posture Report")
    println(io, "")
    println(io, "## Overview")
    println(io, "")
    println(io, "| Metric | Value |")
    println(io, "|--------|-------|")
    println(io, "| Total Claims Assessed | $(length(report.scores)) |")
    println(io, "| Mean Posture Score | $(round(report.mean_posture, digits=3)) |")
    println(io, "| Median Posture Score | $(round(report.median_posture, digits=3)) |")
    println(io, "| Verified Ratio | $(round(report.verified_ratio * 100, digits=1))% |")
    println(io, "| Strong Claims (>0.8) | $(report.strong_claims) |")
    println(io, "| Weak Claims (<0.3) | $(report.weak_claims) |")
    println(io, "| Unverifiable Claims | $(report.unverifiable_claims) |")
    println(io, "")
    println(io, "## Posture Grade: $(posture_grade(report.mean_posture))")
    println(io, "")
    println(io, "## Claim Details")
    println(io, "")
    println(io, "| Claim ID | Overall | Impl | Test | Formal | Empirical | Type | Verifiable |")
    println(io, "|----------|---------|------|------|--------|-----------|------|------------|")

    for score in report.scores
        println(io, "| $(score.claim_id) | $(round(score.overall, digits=2)) | $(round(score.implementation_evidence, digits=2)) | $(round(score.test_evidence, digits=2)) | $(round(score.formal_evidence, digits=2)) | $(round(score.empirical_evidence, digits=2)) | $(score.evidence_type) | $(score.is_verifiable ? "✓" : "✗") |")
    end

    println(io, "")
    println(io, "## Verification Methods")
    println(io, "")
    for score in report.scores
        if score.is_verifiable
            println(io, "- **$(score.claim_id)**: $(score.verification_method)")
        end
    end

    return String(take!(io))
end

function posture_grade(mean_score::Float64)::String
    mean_score >= 0.9 && return "A+ (Excellent — claims well-supported)"
    mean_score >= 0.8 && return "A (Strong — most claims verified)"
    mean_score >= 0.7 && return "B (Good — majority supported)"
    mean_score >= 0.5 && return "C (Fair — mixed evidence)"
    mean_score >= 0.3 && return "D (Weak — many unsupported claims)"
    return "F (Critical — claims lack evidence)"
end

# ════════════════════════════════════════════════════════════════════════════════
# Utility
# ════════════════════════════════════════════════════════════════════════════════

function compute_median(values::Vector{Float64})::Float64
    sorted = sort(values)
    n = length(sorted)
    if n == 0
        return 0.0
    elseif n % 2 == 1
        return sorted[div(n, 2) + 1]
    else
        return (sorted[div(n, 2)] + sorted[div(n, 2) + 1]) / 2.0
    end
end

end # module ProofPosture
