"""
    CivosPrime

CIVOS-PRIME: The Governing Intelligence of Medina Sovereign Architecture.

Supreme governance layer that ensures inter-agent coherence, constitutional compliance,
truth layer integrity, and ecosystem alignment across all research agents.

# Governed Agents
- **THESIS** — Research verification and proof engine
- **AURO** — Voice and declaration layer
- **ORIGO** — Build and implementation engine
- **CODEX** — Execution and manifestation layer

# Governance Functions
- `assess_coherence` — Measure inter-agent alignment
- `detect_contradictions` — Find conflicting claims across agents
- `enforce_constitution` — Apply constitutional governance laws
- `generate_governance_seal` — Seal a governance cycle
- `aggregate_risk` — Compute ecosystem-wide risk score
- `escalate` — Route critical decisions to human oversight
"""
module CivosPrime

export assess_coherence, detect_contradictions, enforce_constitution
export generate_governance_seal, aggregate_risk, escalate
export GovernanceReport, CoherenceGrade, AlignmentMatrix
export AgentState, GovernanceSeal, RiskAssessment

using Dates
using SHA

# ============================================================
# Types
# ============================================================

"""Agent state snapshot for governance assessment."""
struct AgentState
    agent_id::String
    online::Bool
    posture::Float64
    last_seal::Union{String, Nothing}
    claims_count::Int
    risk_score::Float64
    timestamp::DateTime
end

"""Grade representing coherence level across agents."""
@enum CoherenceGrade begin
    GRADE_A = 1  # Full coherence
    GRADE_B = 2  # Minor divergence
    GRADE_C = 3  # Significant divergence — review needed
    GRADE_D = 4  # Critical divergence — escalation required
    GRADE_F = 5  # System incoherent — halt operations
end

"""Contradiction detected between agents."""
struct Contradiction
    agent_a::String
    agent_b::String
    claim_a::String
    claim_b::String
    severity::Symbol  # :low, :medium, :high, :critical
    description::String
end

"""Matrix representing alignment between all agent pairs."""
struct AlignmentMatrix
    agents::Vector{String}
    scores::Matrix{Float64}
    divergent_pairs::Vector{Tuple{String, String}}
    posture_delta::Float64
    aggregate_risk::Float64
end

"""Governance seal — cryptographic proof of governance cycle completion."""
struct GovernanceSeal
    seal_id::String
    timestamp::DateTime
    coherence_grade::CoherenceGrade
    governance_passed::Bool
    risk_level::Symbol
    hash::String
    author::String
    statement::String
end

"""Risk assessment for the entire ecosystem."""
struct RiskAssessment
    level::Symbol  # :low, :medium, :high, :critical
    score::Float64
    contributing_factors::Vector{String}
    recommended_action::Symbol  # :proceed, :review, :escalate, :halt
end

"""Complete governance report from a CIVOS-PRIME cycle."""
struct GovernanceReport
    report_id::String
    timestamp::DateTime
    agent_states::Vector{AgentState}
    coherence_grade::CoherenceGrade
    contradictions::Vector{Contradiction}
    alignment_matrix::AlignmentMatrix
    risk_assessment::RiskAssessment
    decisions::Vector{Dict{String, Any}}
    seal::GovernanceSeal
    governance_passed::Bool
end

# ============================================================
# Core Functions
# ============================================================

"""
    assess_coherence(states::Vector{AgentState}) -> (CoherenceGrade, AlignmentMatrix)

Assess inter-agent coherence by comparing postures, claims, and risk levels
across all governed agents. Returns a coherence grade and alignment matrix.
"""
function assess_coherence(states::Vector{AgentState})
    n = length(states)
    agents = [s.agent_id for s in states]
    scores = ones(Float64, n, n)

    # Compute pairwise alignment scores
    for i in 1:n, j in (i+1):n
        posture_diff = abs(states[i].posture - states[j].posture)
        risk_diff = abs(states[i].risk_score - states[j].risk_score)
        alignment = 1.0 - (0.6 * posture_diff + 0.4 * risk_diff)
        scores[i, j] = alignment
        scores[j, i] = alignment
    end

    # Find divergent pairs (alignment below 0.6)
    divergent_pairs = Tuple{String, String}[]
    for i in 1:n, j in (i+1):n
        if scores[i, j] < 0.6
            push!(divergent_pairs, (agents[i], agents[j]))
        end
    end

    # Compute aggregate metrics
    posture_delta = maximum(s.posture for s in states) - minimum(s.posture for s in states)
    aggregate_risk = mean_risk(states)

    matrix = AlignmentMatrix(agents, scores, divergent_pairs, posture_delta, aggregate_risk)

    # Determine grade
    mean_alignment = sum(scores) / (n * n)
    grade = if mean_alignment >= 0.9
        GRADE_A
    elseif mean_alignment >= 0.75
        GRADE_B
    elseif mean_alignment >= 0.6
        GRADE_C
    elseif mean_alignment >= 0.4
        GRADE_D
    else
        GRADE_F
    end

    return (grade, matrix)
end

"""
    detect_contradictions(states::Vector{AgentState}) -> Vector{Contradiction}

Detect contradictory claims or postures between agents.
A contradiction occurs when agents make incompatible assertions.
"""
function detect_contradictions(states::Vector{AgentState})
    contradictions = Contradiction[]

    for i in 1:length(states), j in (i+1):length(states)
        si, sj = states[i], states[j]

        # Posture contradiction: one claims proven, other shows high risk
        if si.posture > 0.8 && sj.risk_score > 0.7
            push!(contradictions, Contradiction(
                si.agent_id, sj.agent_id,
                "High posture ($(si.posture))", "High risk ($(sj.risk_score))",
                :high,
                "Agent $(si.agent_id) reports strong posture while $(sj.agent_id) reports high risk"
            ))
        end

        if sj.posture > 0.8 && si.risk_score > 0.7
            push!(contradictions, Contradiction(
                sj.agent_id, si.agent_id,
                "High posture ($(sj.posture))", "High risk ($(si.risk_score))",
                :high,
                "Agent $(sj.agent_id) reports strong posture while $(si.agent_id) reports high risk"
            ))
        end
    end

    return contradictions
end

"""
    enforce_constitution(grade::CoherenceGrade, matrix::AlignmentMatrix, contradictions::Vector{Contradiction}) -> Vector{Dict{String, Any}}

Apply constitutional governance laws and return enforcement decisions.
"""
function enforce_constitution(grade::CoherenceGrade, matrix::AlignmentMatrix, contradictions::Vector{Contradiction})
    decisions = Dict{String, Any}[]

    # Rule: Critical contradictions block release
    critical = filter(c -> c.severity == :critical, contradictions)
    if !isempty(critical)
        push!(decisions, Dict{String, Any}(
            "action" => "FORBID",
            "target" => "release",
            "severity" => "CRITICAL",
            "reason" => "$(length(critical)) critical contradictions detected"
        ))
    end

    # Rule: Grade D or F requires escalation
    if grade in (GRADE_D, GRADE_F)
        push!(decisions, Dict{String, Any}(
            "action" => "ESCALATE",
            "target" => "human://freddy",
            "severity" => grade == GRADE_F ? "CRITICAL" : "HIGH",
            "reason" => "Coherence grade $(grade) requires human review"
        ))
    end

    # Rule: High aggregate risk blocks merge
    if matrix.aggregate_risk > 0.8
        push!(decisions, Dict{String, Any}(
            "action" => "FORBID",
            "target" => "merge",
            "severity" => "CRITICAL",
            "reason" => "Aggregate risk $(matrix.aggregate_risk) exceeds safety threshold"
        ))
    end

    # Rule: Significant posture delta requires reconciliation
    if matrix.posture_delta > 0.3
        push!(decisions, Dict{String, Any}(
            "action" => "REQUIRE",
            "target" => "posture_reconciliation",
            "severity" => "HIGH",
            "reason" => "Posture delta $(matrix.posture_delta) exceeds tolerance"
        ))
    end

    return decisions
end

"""
    generate_governance_seal(report_id::String, grade::CoherenceGrade, passed::Bool, risk_level::Symbol) -> GovernanceSeal

Generate a cryptographic governance seal for a completed governance cycle.
"""
function generate_governance_seal(report_id::String, grade::CoherenceGrade, passed::Bool, risk_level::Symbol)
    timestamp = now()
    statement = "CIVOS-PRIME governance cycle completed — $(timestamp)"
    seal_content = "$(report_id)|$(grade)|$(passed)|$(risk_level)|$(timestamp)|$(statement)"
    hash = bytes2hex(sha256(Vector{UInt8}(seal_content)))

    GovernanceSeal(
        "seal-civos-$(Dates.format(timestamp, "yyyymmdd-HHMMSS"))",
        timestamp,
        grade,
        passed,
        risk_level,
        hash,
        "CIVOS-PRIME",
        statement
    )
end

"""
    aggregate_risk(states::Vector{AgentState}) -> RiskAssessment

Compute ecosystem-wide risk by aggregating individual agent risk scores
with weighted factors for contradictions and divergence.
"""
function aggregate_risk(states::Vector{AgentState})
    base_risk = mean_risk(states)
    max_risk = maximum(s.risk_score for s in states)
    offline_penalty = count(s -> !s.online, states) * 0.15

    score = min(1.0, 0.5 * base_risk + 0.3 * max_risk + offline_penalty)

    factors = String[]
    for s in states
        if s.risk_score > 0.7
            push!(factors, "$(s.agent_id) risk: $(s.risk_score)")
        end
        if !s.online
            push!(factors, "$(s.agent_id) OFFLINE")
        end
    end

    level = if score >= 0.8
        :critical
    elseif score >= 0.6
        :high
    elseif score >= 0.4
        :medium
    else
        :low
    end

    action = if level == :critical
        :halt
    elseif level == :high
        :escalate
    elseif level == :medium
        :review
    else
        :proceed
    end

    RiskAssessment(level, score, factors, action)
end

"""
    escalate(risk::RiskAssessment, decisions::Vector{Dict{String, Any}}) -> Dict{String, Any}

Determine escalation path and format escalation payload for human review.
"""
function escalate(risk::RiskAssessment, decisions::Vector{Dict{String, Any}})
    forbid_actions = filter(d -> d["action"] == "FORBID", decisions)
    escalate_actions = filter(d -> d["action"] == "ESCALATE", decisions)

    Dict{String, Any}(
        "escalated" => true,
        "target" => "human://freddy",
        "risk_level" => risk.level,
        "risk_score" => risk.score,
        "forbid_count" => length(forbid_actions),
        "recommended_action" => risk.recommended_action,
        "summary" => "CIVOS-PRIME escalation: $(risk.level) risk, $(length(forbid_actions)) blocked actions, $(length(escalate_actions)) escalations"
    )
end

# ============================================================
# Internal Helpers
# ============================================================

function mean_risk(states::Vector{AgentState})
    isempty(states) ? 0.0 : sum(s.risk_score for s in states) / length(states)
end

end # module CivosPrime
