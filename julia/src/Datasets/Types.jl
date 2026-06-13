# ════════════════════════════════════════════════════════════════════════════════
# Types.jl — Core type definitions for the Datasets SDK
# ════════════════════════════════════════════════════════════════════════════════

"""
    DatasetMetadata

Metadata header present in every dataset file.
"""
struct DatasetMetadata
    dataset_id::String
    name::String
    version::String
    description::String
    task_type::String
    total_samples::Int
    ring_affinity::String
    organism_placement::String
end

"""
    Dataset{T}

A typed dataset container holding metadata and a vector of samples.
"""
struct Dataset{T}
    metadata::DatasetMetadata
    samples::Vector{T}
end

Base.length(d::Dataset) = length(d.samples)
Base.iterate(d::Dataset) = iterate(d.samples)
Base.iterate(d::Dataset, state) = iterate(d.samples, state)
Base.getindex(d::Dataset, i) = d.samples[i]
Base.firstindex(d::Dataset) = 1
Base.lastindex(d::Dataset) = length(d.samples)
Base.eltype(::Type{Dataset{T}}) where {T} = T

"""
    Sample

Abstract base type for all dataset samples.
"""
abstract type Sample end

# ────────────────────────────────────────────────────────────────────────────
# NLP Types
# ────────────────────────────────────────────────────────────────────────────

struct SentimentSample <: Sample
    id::String
    text::String
    label::String
    confidence::Float64
    domain::String
end

struct NEREntity
    text::String
    entity_type::String
    start_pos::Int
    end_pos::Int
end

struct NERSample <: Sample
    id::String
    text::String
    entities::Vector{NEREntity}
    domain::String
end

struct ClassificationSample <: Sample
    id::String
    text::String
    labels::Vector{String}
    domain::String
end

# ────────────────────────────────────────────────────────────────────────────
# Code Intelligence Types
# ────────────────────────────────────────────────────────────────────────────

struct FunctionSignatureSample <: Sample
    id::String
    name::String
    language::String
    signature::String
    description::String
    parameters::Vector{Dict{String,Any}}
    return_type::String
    complexity::String
end

struct DesignPatternSample <: Sample
    id::String
    name::String
    category::String
    description::String
    use_cases::Vector{String}
    languages::Vector{String}
end

struct VulnerabilitySample <: Sample
    id::String
    name::String
    severity::String
    description::String
    vulnerable_code::String
    secure_code::String
    language::String
end

# ────────────────────────────────────────────────────────────────────────────
# Reasoning Types
# ────────────────────────────────────────────────────────────────────────────

struct MathSolution
    chain_of_thought::Vector{String}
    answer::String
    key_insight::String
end

struct MathReasoningSample <: Sample
    id::String
    problem::String
    difficulty::String
    topic::String
    solution::MathSolution
end

struct LogicalInferenceSample <: Sample
    id::String
    premises::Vector{String}
    conclusion::String
    inference_type::String
    valid::Bool
    explanation::String
end

struct CausalReasoningSample <: Sample
    id::String
    scenario::String
    cause::String
    effect::String
    reasoning_type::String
    explanation::String
end

# ────────────────────────────────────────────────────────────────────────────
# Conversational Types
# ────────────────────────────────────────────────────────────────────────────

struct DialogueTurn
    role::String
    content::String
end

struct DialogueSample <: Sample
    id::String
    context::String
    turns::Vector{DialogueTurn}
    topic::String
end

struct InstructionSample <: Sample
    id::String
    instruction::String
    response::String
    category::String
    complexity::String
end

# ────────────────────────────────────────────────────────────────────────────
# Multimodal Types
# ────────────────────────────────────────────────────────────────────────────

struct ImageDescriptionSample <: Sample
    id::String
    image_concept::String
    brief_description::String
    detailed_description::String
    spatial_relations::Vector{String}
end

struct VQASample <: Sample
    id::String
    image_concept::String
    question::String
    answer::String
    reasoning::String
end

# ────────────────────────────────────────────────────────────────────────────
# Safety Types
# ────────────────────────────────────────────────────────────────────────────

struct ToxicitySample <: Sample
    id::String
    text::String
    toxic::Bool
    category::String
    severity::String
    context::String
end

struct GuardrailSample <: Sample
    id::String
    trigger::String
    category::String
    risk_level::String
    recommended_response::String
end

# ────────────────────────────────────────────────────────────────────────────
# Knowledge Graph Types
# ────────────────────────────────────────────────────────────────────────────

struct EntityRelationTriple <: Sample
    id::String
    subject::String
    relation::String
    object::String
    confidence::Float64
    domain::String
end

struct OntologyConcept <: Sample
    id::String
    name::String
    parent::String
    description::String
    domain::String
    properties::Vector{String}
end
