#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  MULTI-MODEL ENGINE: Model Registry                                                    ║
║  Central registry for all AI model families and their capabilities                    ║
║                                                                                        ║
║  Supports: GPT, Claude, Gemini, Llama, Mistral, DALL-E, Stable Diffusion,           ║
║            SAM, CLIP, Florence, Whisper, and custom sovereign models                  ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module ModelRegistry

export ModelFamily, ModelEndpoint, ModelCapability
export create_registry, register_model!, get_model, list_models
export models_for_modality, models_for_task, registry_stats

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const PHI_INVERSE = 1 / PHI

# ═══════════════════════════════════════════════════════════════════════════════
# TYPES
# ═══════════════════════════════════════════════════════════════════════════════

"""Modalities a model can handle."""
struct ModelCapability
    modalities::Vector{String}   # text, code, vision, audio, video
    tasks::Vector{String}        # reasoning, generation, classification, etc.
    max_context::Int             # Max context window in tokens
    supports_streaming::Bool
    supports_tools::Bool
end

"""A specific model endpoint."""
struct ModelEndpoint
    id::String
    provider::String
    model_name::String
    version::String
    base_confidence::Float64
    cost_per_1k_tokens::Float64
    avg_latency_ms::Int
    capability::ModelCapability
end

"""A family of related models."""
struct ModelFamily
    family_id::String
    name::String
    models::Vector{ModelEndpoint}
    fusion_strategy::String
    ring_affinity::String
end

"""Central registry of all available models."""
mutable struct Registry
    families::Dict{String, ModelFamily}
    endpoints::Dict{String, ModelEndpoint}
    total_queries::Int
end

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION
# ═══════════════════════════════════════════════════════════════════════════════

"""Create a registry pre-loaded with core AI model families."""
function create_registry()::Registry
    registry = Registry(Dict(), Dict(), 0)

    # Register core model families
    _register_text_family!(registry)
    _register_vision_family!(registry)
    _register_code_family!(registry)
    _register_audio_family!(registry)
    _register_multimodal_family!(registry)

    return registry
end

"""Register a custom model endpoint."""
function register_model!(registry::Registry, family_id::String, endpoint::ModelEndpoint)
    registry.endpoints[endpoint.id] = endpoint

    if haskey(registry.families, family_id)
        # Add to existing family
        family = registry.families[family_id]
        new_models = vcat(family.models, [endpoint])
        registry.families[family_id] = ModelFamily(
            family.family_id, family.name, new_models,
            family.fusion_strategy, family.ring_affinity
        )
    end
end

"""Get a model by ID."""
function get_model(registry::Registry, model_id::String)::Union{ModelEndpoint, Nothing}
    registry.total_queries += 1
    return get(registry.endpoints, model_id, nothing)
end

"""List all registered model IDs."""
function list_models(registry::Registry)::Vector{String}
    return collect(keys(registry.endpoints))
end

"""Find models supporting a given modality."""
function models_for_modality(registry::Registry, modality::String)::Vector{ModelEndpoint}
    return filter(e -> modality in e.capability.modalities, collect(values(registry.endpoints)))
end

"""Find models suitable for a given task."""
function models_for_task(registry::Registry, task::String)::Vector{ModelEndpoint}
    return filter(e -> task in e.capability.tasks, collect(values(registry.endpoints)))
end

"""Return registry statistics."""
function registry_stats(registry::Registry)::Dict{String, Any}
    return Dict{String, Any}(
        "families" => length(registry.families),
        "endpoints" => length(registry.endpoints),
        "total_queries" => registry.total_queries,
        "modalities" => unique(vcat([e.capability.modalities for e in values(registry.endpoints)]...))
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# INTERNAL — Pre-built families
# ═══════════════════════════════════════════════════════════════════════════════

function _register_text_family!(registry::Registry)
    models = [
        ModelEndpoint("gpt-4", "openai", "GPT-4", "turbo", 0.92, 0.03, 1800,
            ModelCapability(["text", "code"], ["reasoning", "analysis", "generation", "classification"], 128000, true, true)),
        ModelEndpoint("claude-3.5", "anthropic", "Claude-3.5-Sonnet", "v1", 0.90, 0.025, 1500,
            ModelCapability(["text", "code"], ["reasoning", "creative", "analysis", "safety"], 200000, true, true)),
        ModelEndpoint("gemini-2.0", "google", "Gemini-2.0-Pro", "v1", 0.88, 0.02, 1200,
            ModelCapability(["text", "code", "vision"], ["reasoning", "multimodal", "search"], 1000000, true, true)),
        ModelEndpoint("llama-3.1", "meta", "Llama-3.1-405B", "v1", 0.82, 0.005, 600,
            ModelCapability(["text", "code"], ["reasoning", "coding", "efficiency"], 128000, true, false)),
        ModelEndpoint("mistral-large", "mistral", "Mistral-Large", "v2", 0.80, 0.008, 500,
            ModelCapability(["text", "code"], ["coding", "multilingual", "speed"], 128000, true, true))
    ]

    family = ModelFamily("text-reasoning", "Text & Reasoning Family", models, "phi_decay_weighted", "Interface Ring")
    registry.families["text-reasoning"] = family
    for m in models
        registry.endpoints[m.id] = m
    end
end

function _register_vision_family!(registry::Registry)
    models = [
        ModelEndpoint("dall-e-3", "openai", "DALL-E-3", "v3", 0.88, 0.04, 3000,
            ModelCapability(["vision", "text"], ["generation", "editing"], 4000, false, false)),
        ModelEndpoint("stable-diffusion-xl", "stability", "SDXL", "v1.0", 0.85, 0.01, 2000,
            ModelCapability(["vision"], ["generation", "inpainting", "style_transfer"], 77, false, false)),
        ModelEndpoint("sam-2", "meta", "SAM-2", "v2", 0.90, 0.005, 500,
            ModelCapability(["vision"], ["segmentation", "detection"], 0, false, false))
    ]

    family = ModelFamily("vision-generation", "Vision & Generation Family", models, "pipeline_composition", "Geometry Ring")
    registry.families["vision-generation"] = family
    for m in models
        registry.endpoints[m.id] = m
    end
end

function _register_code_family!(registry::Registry)
    models = [
        ModelEndpoint("codex-4", "openai", "GPT-4-Codex", "v4", 0.91, 0.03, 1500,
            ModelCapability(["code", "text"], ["coding", "debugging", "refactoring", "testing"], 128000, true, true)),
        ModelEndpoint("deepseek-coder", "deepseek", "DeepSeek-Coder-V2", "v2", 0.86, 0.003, 400,
            ModelCapability(["code", "text"], ["coding", "completion", "efficiency"], 128000, true, false))
    ]

    family = ModelFamily("code-intelligence", "Code Intelligence Family", models, "confidence_weighted", "Build Ring")
    registry.families["code-intelligence"] = family
    for m in models
        registry.endpoints[m.id] = m
    end
end

function _register_audio_family!(registry::Registry)
    models = [
        ModelEndpoint("whisper-large", "openai", "Whisper-Large-V3", "v3", 0.92, 0.006, 800,
            ModelCapability(["audio", "text"], ["transcription", "translation"], 0, true, false)),
        ModelEndpoint("elevenlabs-v2", "elevenlabs", "ElevenLabs-V2", "v2", 0.88, 0.015, 600,
            ModelCapability(["audio", "text"], ["synthesis", "voice_cloning"], 5000, true, false))
    ]

    family = ModelFamily("audio-intelligence", "Audio Intelligence Family", models, "sequential_pipeline", "Transport Ring")
    registry.families["audio-intelligence"] = family
    for m in models
        registry.endpoints[m.id] = m
    end
end

function _register_multimodal_family!(registry::Registry)
    models = [
        ModelEndpoint("gpt-4v", "openai", "GPT-4-Vision", "turbo", 0.90, 0.035, 2000,
            ModelCapability(["text", "vision", "code"], ["reasoning", "multimodal", "analysis"], 128000, true, true)),
        ModelEndpoint("gemini-2.0-ultra", "google", "Gemini-2.0-Ultra", "v1", 0.91, 0.04, 2500,
            ModelCapability(["text", "vision", "audio", "video", "code"], ["reasoning", "multimodal", "generation"], 2000000, true, true))
    ]

    family = ModelFamily("multimodal-fusion", "Multimodal Fusion Family", models, "modality_routing", "Sovereign Ring")
    registry.families["multimodal-fusion"] = family
    for m in models
        registry.endpoints[m.id] = m
    end
end

end # module ModelRegistry
