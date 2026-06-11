# ════════════════════════════════════════════════════════════════════════════════
# Loader.jl — JSON dataset loading utilities
# ════════════════════════════════════════════════════════════════════════════════

"""
    datasets_root() -> String

Return the absolute path to the datasets directory.
"""
datasets_root() = DATASETS_ROOT

"""
    list_datasets() -> Vector{NamedTuple}

List all available datasets with their domain and filename.
"""
function list_datasets()
    datasets = NamedTuple{(:domain, :file, :path), Tuple{String, String, String}}[]
    for domain_dir in readdir(DATASETS_ROOT; join=true)
        isdir(domain_dir) || continue
        domain = basename(domain_dir)
        domain == "node_modules" && continue
        for f in readdir(domain_dir)
            endswith(f, ".json") || continue
            push!(datasets, (domain=domain, file=f, path=joinpath(domain_dir, f)))
        end
    end
    return datasets
end

"""
    load_raw(domain::String, filename::String) -> Dict

Load a dataset JSON file and return as a raw Dict.
"""
function load_raw(domain::String, filename::String)
    # Normalize filename
    if !endswith(filename, ".json")
        filename = filename * ".json"
    end
    filepath = joinpath(DATASETS_ROOT, domain, filename)
    if !isfile(filepath)
        error("Dataset file not found: $filepath")
    end
    return JSON3.read(read(filepath, String))
end

"""
    load_dataset(domain::Symbol, name::Symbol) -> Dataset

Load a typed dataset by domain and name.

# Examples
```julia
sentiment = load_dataset(:nlp, :sentiment)
math = load_dataset(:reasoning, :math)
entities = load_dataset(:knowledge_graph, :entities)
```
"""
function load_dataset(domain::Symbol, name::Symbol)
    domain_str, filename = _resolve_dataset(domain, name)
    raw = load_raw(domain_str, filename)
    return _parse_dataset(domain, name, raw)
end

# ────────────────────────────────────────────────────────────────────────────
# Internal resolution and parsing
# ────────────────────────────────────────────────────────────────────────────

const DATASET_MAP = Dict{Tuple{Symbol,Symbol}, Tuple{String,String}}(
    # NLP
    (:nlp, :sentiment) => ("nlp", "sentiment-analysis"),
    (:nlp, :ner) => ("nlp", "named-entity-recognition"),
    (:nlp, :classification) => ("nlp", "text-classification"),
    # Code Intelligence
    (:code_intelligence, :functions) => ("code-intelligence", "function-signatures"),
    (:code_intelligence, :patterns) => ("code-intelligence", "design-patterns"),
    (:code_intelligence, :vulnerabilities) => ("code-intelligence", "vulnerability-patterns"),
    # Reasoning
    (:reasoning, :math) => ("reasoning", "mathematical-reasoning"),
    (:reasoning, :logic) => ("reasoning", "logical-inference"),
    (:reasoning, :causal) => ("reasoning", "causal-reasoning"),
    # Conversational
    (:conversational, :dialogue) => ("conversational", "multi-turn-dialogue"),
    (:conversational, :instructions) => ("conversational", "instruction-following"),
    # Multimodal
    (:multimodal, :images) => ("multimodal", "image-descriptions"),
    (:multimodal, :vqa) => ("multimodal", "visual-question-answering"),
    # Safety
    (:safety, :toxicity) => ("safety", "toxicity-detection"),
    (:safety, :guardrails) => ("safety", "guardrail-triggers"),
    # Knowledge Graph
    (:knowledge_graph, :entities) => ("knowledge-graph", "entity-relations"),
    (:knowledge_graph, :ontology) => ("knowledge-graph", "domain-ontology"),
)

function _resolve_dataset(domain::Symbol, name::Symbol)
    key = (domain, name)
    if !haskey(DATASET_MAP, key)
        available = [k for k in keys(DATASET_MAP) if k[1] == domain]
        error("Unknown dataset ($domain, $name). Available for $domain: $(isempty(available) ? "none" : join([string(k[2]) for k in available], ", "))")
    end
    return DATASET_MAP[key]
end

function _parse_metadata(raw)
    meta = raw[:metadata]
    DatasetMetadata(
        string(get(meta, :dataset_id, "")),
        string(get(meta, :name, "")),
        string(get(meta, :version, "")),
        string(get(meta, :description, "")),
        string(get(meta, :task_type, "")),
        Int(get(meta, :total_samples, 0)),
        string(get(meta, :ring_affinity, "")),
        string(get(meta, :organism_placement, ""))
    )
end

function _parse_dataset(domain::Symbol, name::Symbol, raw)
    metadata = _parse_metadata(raw)

    if domain == :nlp && name == :sentiment
        samples = _parse_sentiment(raw)
        return Dataset{SentimentSample}(metadata, samples)
    elseif domain == :nlp && name == :ner
        samples = _parse_ner(raw)
        return Dataset{NERSample}(metadata, samples)
    elseif domain == :nlp && name == :classification
        samples = _parse_classification(raw)
        return Dataset{ClassificationSample}(metadata, samples)
    elseif domain == :code_intelligence && name == :functions
        samples = _parse_functions(raw)
        return Dataset{FunctionSignatureSample}(metadata, samples)
    elseif domain == :code_intelligence && name == :patterns
        samples = _parse_patterns(raw)
        return Dataset{DesignPatternSample}(metadata, samples)
    elseif domain == :code_intelligence && name == :vulnerabilities
        samples = _parse_vulnerabilities(raw)
        return Dataset{VulnerabilitySample}(metadata, samples)
    elseif domain == :reasoning && name == :math
        samples = _parse_math(raw)
        return Dataset{MathReasoningSample}(metadata, samples)
    elseif domain == :reasoning && name == :logic
        samples = _parse_logic(raw)
        return Dataset{LogicalInferenceSample}(metadata, samples)
    elseif domain == :reasoning && name == :causal
        samples = _parse_causal(raw)
        return Dataset{CausalReasoningSample}(metadata, samples)
    elseif domain == :conversational && name == :dialogue
        samples = _parse_dialogue(raw)
        return Dataset{DialogueSample}(metadata, samples)
    elseif domain == :conversational && name == :instructions
        samples = _parse_instructions(raw)
        return Dataset{InstructionSample}(metadata, samples)
    elseif domain == :multimodal && name == :images
        samples = _parse_images(raw)
        return Dataset{ImageDescriptionSample}(metadata, samples)
    elseif domain == :multimodal && name == :vqa
        samples = _parse_vqa(raw)
        return Dataset{VQASample}(metadata, samples)
    elseif domain == :safety && name == :toxicity
        samples = _parse_toxicity(raw)
        return Dataset{ToxicitySample}(metadata, samples)
    elseif domain == :safety && name == :guardrails
        samples = _parse_guardrails(raw)
        return Dataset{GuardrailSample}(metadata, samples)
    elseif domain == :knowledge_graph && name == :entities
        samples = _parse_entities(raw)
        return Dataset{EntityRelationTriple}(metadata, samples)
    elseif domain == :knowledge_graph && name == :ontology
        samples = _parse_ontology(raw)
        return Dataset{OntologyConcept}(metadata, samples)
    else
        error("No parser for ($domain, $name)")
    end
end

# ────────────────────────────────────────────────────────────────────────────
# Parsers for each dataset type
# ────────────────────────────────────────────────────────────────────────────

function _parse_sentiment(raw)
    samples = SentimentSample[]
    for s in raw[:samples]
        push!(samples, SentimentSample(
            string(s[:id]),
            string(s[:text]),
            string(s[:label]),
            Float64(s[:confidence]),
            string(s[:domain])
        ))
    end
    return samples
end

function _parse_ner(raw)
    samples = NERSample[]
    for s in raw[:samples]
        entities = NEREntity[]
        for e in get(s, :entities, [])
            push!(entities, NEREntity(
                string(get(e, :text, "")),
                string(get(e, :entity_type, get(e, :type, ""))),
                Int(get(e, :start, get(e, :start_pos, 0))),
                Int(get(e, :end, get(e, :end_pos, 0)))
            ))
        end
        push!(samples, NERSample(
            string(s[:id]),
            string(s[:text]),
            entities,
            string(get(s, :domain, "general"))
        ))
    end
    return samples
end

function _parse_classification(raw)
    samples = ClassificationSample[]
    for s in raw[:samples]
        labels = String[string(l) for l in get(s, :labels, get(s, :categories, []))]
        push!(samples, ClassificationSample(
            string(s[:id]),
            string(s[:text]),
            labels,
            string(get(s, :domain, "general"))
        ))
    end
    return samples
end

function _parse_functions(raw)
    samples = FunctionSignatureSample[]
    for s in raw[:samples]
        params = Dict{String,Any}[]
        for p in get(s, :parameters, [])
            push!(params, Dict{String,Any}(string(k) => v for (k,v) in pairs(p)))
        end
        push!(samples, FunctionSignatureSample(
            string(s[:id]),
            string(get(s, :name, "")),
            string(get(s, :language, "")),
            string(get(s, :signature, "")),
            string(get(s, :description, "")),
            params,
            string(get(s, :return_type, "Any")),
            string(get(s, :complexity, "O(n)"))
        ))
    end
    return samples
end

function _parse_patterns(raw)
    samples = DesignPatternSample[]
    for s in raw[:samples]
        push!(samples, DesignPatternSample(
            string(s[:id]),
            string(get(s, :name, "")),
            string(get(s, :category, "")),
            string(get(s, :description, "")),
            String[string(u) for u in get(s, :use_cases, [])],
            String[string(l) for l in get(s, :languages, [])]
        ))
    end
    return samples
end

function _parse_vulnerabilities(raw)
    samples = VulnerabilitySample[]
    for s in raw[:samples]
        push!(samples, VulnerabilitySample(
            string(s[:id]),
            string(get(s, :name, "")),
            string(get(s, :severity, "")),
            string(get(s, :description, "")),
            string(get(s, :vulnerable_code, "")),
            string(get(s, :secure_code, "")),
            string(get(s, :language, ""))
        ))
    end
    return samples
end

function _parse_math(raw)
    samples = MathReasoningSample[]
    for s in raw[:samples]
        sol = s[:solution]
        solution = MathSolution(
            String[string(step) for step in sol[:chain_of_thought]],
            string(sol[:answer]),
            string(get(sol, :key_insight, ""))
        )
        push!(samples, MathReasoningSample(
            string(s[:id]),
            string(s[:problem]),
            string(s[:difficulty]),
            string(s[:topic]),
            solution
        ))
    end
    return samples
end

function _parse_logic(raw)
    samples = LogicalInferenceSample[]
    for s in raw[:samples]
        push!(samples, LogicalInferenceSample(
            string(s[:id]),
            String[string(p) for p in get(s, :premises, [])],
            string(get(s, :conclusion, "")),
            string(get(s, :inference_type, "")),
            Bool(get(s, :valid, true)),
            string(get(s, :explanation, ""))
        ))
    end
    return samples
end

function _parse_causal(raw)
    samples = CausalReasoningSample[]
    for s in raw[:samples]
        push!(samples, CausalReasoningSample(
            string(s[:id]),
            string(get(s, :scenario, "")),
            string(get(s, :cause, "")),
            string(get(s, :effect, "")),
            string(get(s, :reasoning_type, "")),
            string(get(s, :explanation, ""))
        ))
    end
    return samples
end

function _parse_dialogue(raw)
    samples = DialogueSample[]
    for s in raw[:samples]
        turns = DialogueTurn[]
        for t in get(s, :turns, get(s, :conversation, []))
            push!(turns, DialogueTurn(
                string(get(t, :role, get(t, :speaker, ""))),
                string(get(t, :content, get(t, :message, "")))
            ))
        end
        push!(samples, DialogueSample(
            string(s[:id]),
            string(get(s, :context, "")),
            turns,
            string(get(s, :topic, ""))
        ))
    end
    return samples
end

function _parse_instructions(raw)
    samples = InstructionSample[]
    for s in raw[:samples]
        push!(samples, InstructionSample(
            string(s[:id]),
            string(get(s, :instruction, "")),
            string(get(s, :response, "")),
            string(get(s, :category, "")),
            string(get(s, :complexity, "medium"))
        ))
    end
    return samples
end

function _parse_images(raw)
    samples = ImageDescriptionSample[]
    for s in raw[:samples]
        push!(samples, ImageDescriptionSample(
            string(s[:id]),
            string(get(s, :image_concept, get(s, :scene, ""))),
            string(get(s, :brief_description, get(s, :brief, ""))),
            string(get(s, :detailed_description, get(s, :detailed, ""))),
            String[string(r) for r in get(s, :spatial_relations, [])]
        ))
    end
    return samples
end

function _parse_vqa(raw)
    samples = VQASample[]
    for s in raw[:samples]
        push!(samples, VQASample(
            string(s[:id]),
            string(get(s, :image_concept, get(s, :scene, ""))),
            string(get(s, :question, "")),
            string(get(s, :answer, "")),
            string(get(s, :reasoning, ""))
        ))
    end
    return samples
end

function _parse_toxicity(raw)
    samples = ToxicitySample[]
    for s in raw[:samples]
        push!(samples, ToxicitySample(
            string(s[:id]),
            string(s[:text]),
            Bool(get(s, :toxic, get(s, :is_toxic, false))),
            string(get(s, :category, "")),
            string(get(s, :severity, "low")),
            string(get(s, :context, ""))
        ))
    end
    return samples
end

function _parse_guardrails(raw)
    samples = GuardrailSample[]
    for s in raw[:samples]
        push!(samples, GuardrailSample(
            string(s[:id]),
            string(get(s, :trigger, get(s, :pattern, ""))),
            string(get(s, :category, "")),
            string(get(s, :risk_level, "medium")),
            string(get(s, :recommended_response, get(s, :response, "")))
        ))
    end
    return samples
end

function _parse_entities(raw)
    samples = EntityRelationTriple[]
    for s in get(raw, :triples, get(raw, :samples, []))
        push!(samples, EntityRelationTriple(
            string(s[:id]),
            string(s[:subject]),
            string(s[:relation]),
            string(s[:object]),
            Float64(get(s, :confidence, 1.0)),
            string(get(s, :domain, "general"))
        ))
    end
    return samples
end

function _parse_ontology(raw)
    samples = OntologyConcept[]
    for s in get(raw, :concepts, get(raw, :samples, []))
        push!(samples, OntologyConcept(
            string(get(s, :id, "")),
            string(get(s, :name, "")),
            string(get(s, :parent, "")),
            string(get(s, :description, "")),
            string(get(s, :domain, "")),
            String[string(p) for p in get(s, :properties, [])]
        ))
    end
    return samples
end
