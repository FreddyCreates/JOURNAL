#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  MULTI-MODEL ENGINE: Fusion Engine                                                     ║
║  Orchestrates multi-model inference with φ-weighted fusion strategies                 ║
║                                                                                        ║
║  Fusion Strategies:                                                                    ║
║    • φ-decay weighted — Earlier/higher-confidence models weighted by φ^(-i)           ║
║    • Majority voting — Democratic consensus                                           ║
║    • Confidence cascade — Use highest confidence until threshold met                  ║
║    • Modality routing — Route by input modality to specialized models                 ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module FusionEngine

using LinearAlgebra
using Statistics

export FusionStrategy, PhiDecay, MajorityVote, ConfidenceCascade, ModalityRoute, Ensemble
export FusionRequest, FusionResponse, FusionSession
export create_session, fuse!, select_strategy, session_metrics
export phi_decay_fusion, majority_vote_fusion, cascade_fusion, modality_route

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const PHI_INVERSE = 1 / PHI

# ═══════════════════════════════════════════════════════════════════════════════
# TYPES
# ═══════════════════════════════════════════════════════════════════════════════

"""Available fusion strategies."""
@enum FusionStrategy begin
    PhiDecay          # φ^(-i) weighting
    MajorityVote      # Democratic consensus
    ConfidenceCascade # Highest confidence first
    ModalityRoute     # Route by modality
    Ensemble          # Weighted ensemble average
end

"""A fusion request containing multiple model outputs."""
struct FusionRequest
    task_id::String
    modality::String
    model_outputs::Vector{Pair{String, String}}  # model_id => output
    confidences::Dict{String, Float64}
    strategy::FusionStrategy
end

"""Result of a fusion operation."""
struct FusionResponse
    task_id::String
    fused_output::String
    strategy_used::FusionStrategy
    consensus_score::Float64
    contributing_models::Vector{String}
    phi_weights::Dict{String, Float64}
    total_models_queried::Int
end

"""Stateful fusion session tracking metrics."""
mutable struct FusionSession
    session_id::String
    default_strategy::FusionStrategy
    total_fusions::Int
    total_consensus::Int
    strategy_performance::Dict{FusionStrategy, Float64}
    model_contribution_count::Dict{String, Int}
end

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION
# ═══════════════════════════════════════════════════════════════════════════════

"""Create a new fusion session."""
function create_session(session_id::String; strategy::FusionStrategy=PhiDecay)::FusionSession
    perf = Dict(s => 0.0 for s in instances(FusionStrategy))
    return FusionSession(session_id, strategy, 0, 0, perf, Dict{String, Int}())
end

# ═══════════════════════════════════════════════════════════════════════════════
# FUSION
# ═══════════════════════════════════════════════════════════════════════════════

"""Execute fusion on a request using the specified strategy."""
function fuse!(session::FusionSession, request::FusionRequest)::FusionResponse
    response = if request.strategy == PhiDecay
        phi_decay_fusion(request)
    elseif request.strategy == MajorityVote
        majority_vote_fusion(request)
    elseif request.strategy == ConfidenceCascade
        cascade_fusion(request)
    elseif request.strategy == ModalityRoute
        modality_route(request)
    else
        phi_decay_fusion(request)  # Default
    end

    # Update session metrics
    session.total_fusions += 1
    if response.consensus_score >= 0.7
        session.total_consensus += 1
    end

    for model in response.contributing_models
        session.model_contribution_count[model] = get(session.model_contribution_count, model, 0) + 1
    end

    # Update strategy performance
    session.strategy_performance[request.strategy] += response.consensus_score

    return response
end

"""φ-decay weighted fusion: w_i = φ^(-i) × confidence_i"""
function phi_decay_fusion(request::FusionRequest)::FusionResponse
    outputs = request.model_outputs
    isempty(outputs) && error("No model outputs to fuse")

    # Sort by confidence
    scored = [(p, get(request.confidences, p.first, 0.5)) for p in outputs]
    sort!(scored, by=x -> -x[2])

    # Compute φ-decay weights
    weights = Dict{String, Float64}()
    for (i, (pair, conf)) in enumerate(scored)
        weights[pair.first] = PHI_INVERSE^(i - 1) * conf
    end

    # Select best output (highest weight)
    best_output = scored[1][1].second
    total_weight = sum(values(weights))
    consensus = _compute_consensus(request.confidences)

    return FusionResponse(
        request.task_id,
        best_output,
        PhiDecay,
        consensus,
        [p.first for p in outputs],
        weights,
        length(outputs)
    )
end

"""Majority voting fusion."""
function majority_vote_fusion(request::FusionRequest)::FusionResponse
    outputs = request.model_outputs
    isempty(outputs) && error("No model outputs to fuse")

    # Count votes (by output similarity - simplified as exact match)
    vote_counts = Dict{String, Int}()
    for (_, output) in outputs
        vote_counts[output] = get(vote_counts, output, 0) + 1
    end

    # Winner is most common output
    winner = sort(collect(vote_counts), by=x -> -x.second)[1].first
    consensus = maximum(values(vote_counts)) / length(outputs)

    weights = Dict(p.first => 1.0 / length(outputs) for p in outputs)

    return FusionResponse(
        request.task_id,
        winner,
        MajorityVote,
        consensus,
        [p.first for p in outputs],
        weights,
        length(outputs)
    )
end

"""Confidence cascade: use first model that exceeds threshold."""
function cascade_fusion(request::FusionRequest; threshold::Float64=0.85)::FusionResponse
    outputs = request.model_outputs
    isempty(outputs) && error("No model outputs to fuse")

    # Sort by confidence descending
    scored = [(p, get(request.confidences, p.first, 0.5)) for p in outputs]
    sort!(scored, by=x -> -x[2])

    # Take first that exceeds threshold, or best available
    selected = scored[1]
    for s in scored
        if s[2] >= threshold
            selected = s
            break
        end
    end

    weights = Dict(selected[1].first => selected[2])
    consensus = selected[2]

    return FusionResponse(
        request.task_id,
        selected[1].second,
        ConfidenceCascade,
        consensus,
        [selected[1].first],
        weights,
        length(outputs)
    )
end

"""Modality-based routing to specialized models."""
function modality_route(request::FusionRequest)::FusionResponse
    outputs = request.model_outputs
    isempty(outputs) && error("No model outputs to fuse")

    # Simple: select best confidence for the modality
    scored = [(p, get(request.confidences, p.first, 0.5)) for p in outputs]
    sort!(scored, by=x -> -x[2])

    best = scored[1]
    weights = Dict(best[1].first => best[2])

    return FusionResponse(
        request.task_id,
        best[1].second,
        ModalityRoute,
        best[2],
        [best[1].first],
        weights,
        length(outputs)
    )
end

"""Select optimal fusion strategy based on task characteristics."""
function select_strategy(modality::String, model_count::Int)::FusionStrategy
    # Heuristics for strategy selection
    model_count == 1 && return ConfidenceCascade
    modality in ["vision", "audio"] && return ModalityRoute
    model_count >= 5 && return MajorityVote
    return PhiDecay  # Default for text reasoning
end

"""Return session metrics."""
function session_metrics(session::FusionSession)::Dict{String, Any}
    return Dict{String, Any}(
        "session_id" => session.session_id,
        "total_fusions" => session.total_fusions,
        "consensus_rate" => session.total_fusions > 0 ? session.total_consensus / session.total_fusions : 0.0,
        "model_contributions" => session.model_contribution_count,
        "strategy_scores" => Dict(string(k) => v for (k, v) in session.strategy_performance)
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# INTERNAL
# ═══════════════════════════════════════════════════════════════════════════════

function _compute_consensus(confidences::Dict{String, Float64})::Float64
    vals = collect(values(confidences))
    isempty(vals) && return 0.0
    length(vals) == 1 && return vals[1]

    m = Statistics.mean(vals)
    s = Statistics.std(vals)
    return m > 0 ? clamp(1.0 - s / m, 0.0, 1.0) : 0.0
end

end # module FusionEngine
