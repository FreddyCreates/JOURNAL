#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  SOVEREIGN AI DATASETS SDK — Julia Interface                                          ║
║  "Data Is The Substrate — Intelligence Is The Emergence"                              ║
║                                                                                        ║
║  Julia SDK for loading, querying, and manipulating the Sovereign AI Datasets:          ║
║    • NLP (sentiment, NER, text classification)                                        ║
║    • Code Intelligence (functions, patterns, vulnerabilities)                          ║
║    • Reasoning (mathematical, logical, causal)                                        ║
║    • Conversational (dialogue, instructions)                                          ║
║    • Multimodal (image descriptions, VQA)                                             ║
║    • Safety (toxicity, guardrails)                                                    ║
║    • Knowledge Graph (entity relations, ontology)                                     ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence                                                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module Datasets

using JSON3
using StructTypes

# ════════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ════════════════════════════════════════════════════════════════════════════════

const DATASETS_VERSION = "1.0.0"
const DATASETS_ROOT = normpath(joinpath(@__DIR__, "..", "..", "..", "datasets"))

# ════════════════════════════════════════════════════════════════════════════════
# CORE TYPES
# ════════════════════════════════════════════════════════════════════════════════

include("Types.jl")
include("Loader.jl")
include("Query.jl")

# ════════════════════════════════════════════════════════════════════════════════
# DOMAIN SUBMODULES
# ════════════════════════════════════════════════════════════════════════════════

include("NLP.jl")
include("CodeIntelligence.jl")
include("Reasoning.jl")
include("Conversational.jl")
include("Multimodal.jl")
include("Safety.jl")
include("KnowledgeGraph.jl")

# ════════════════════════════════════════════════════════════════════════════════
# EXPORTS
# ════════════════════════════════════════════════════════════════════════════════

# Types
export DatasetMetadata, Dataset, Sample
export SentimentSample, NERSample, ClassificationSample
export FunctionSignatureSample, DesignPatternSample, VulnerabilitySample
export MathReasoningSample, LogicalInferenceSample, CausalReasoningSample
export DialogueSample, InstructionSample
export ImageDescriptionSample, VQASample
export ToxicitySample, GuardrailSample
export EntityRelationTriple, OntologyConcept

# Loader
export load_dataset, load_raw, datasets_root, list_datasets

# Query
export filter_by_domain, filter_by_confidence, filter_by_difficulty
export filter_by_label, sample_random, dataset_stats

# Domain accessors
export NLP, CodeIntelligence, Reasoning, Conversational
export Multimodal, Safety, KnowledgeGraph

# ════════════════════════════════════════════════════════════════════════════════
# SDK INFO
# ════════════════════════════════════════════════════════════════════════════════

"""
    datasets_info() -> NamedTuple

Return Datasets SDK metadata including version, domains, and dataset count.
"""
function datasets_info()
    return (
        name = "Sovereign AI Datasets SDK",
        version = DATASETS_VERSION,
        author = "Alfredo 'Freddy' Medina Hernandez",
        domains = [:NLP, :CodeIntelligence, :Reasoning, :Conversational,
                   :Multimodal, :Safety, :KnowledgeGraph],
        total_datasets = 14,
        root_path = DATASETS_ROOT
    )
end

export datasets_info

end # module Datasets
