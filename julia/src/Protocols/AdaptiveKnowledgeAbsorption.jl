#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  PROTO-004: Adaptive Knowledge Absorption Protocol (AKAP)                             ║
║  Knowledge Synthesis Intelligence — Content → Knowledge Graph pipeline                ║
║                                                                                        ║
║  Features:                                                                             ║
║    • Entity extraction with relationship mapping                                      ║
║    • φ-weighted knowledge graph construction                                          ║
║    • Deduplication and digest generation                                               ║
║    • Document type pattern evolution                                                   ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module AdaptiveKnowledgeAbsorption

using LinearAlgebra
using Statistics

export KnowledgeEntity, KnowledgeRelation, KnowledgeGraph
export create_knowledge_graph, absorb_document!, extract_entities
export find_relations, generate_digest, graph_metrics
export deduplicate!, query_graph

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const PHI_INVERSE = 1 / PHI
const SIMILARITY_THRESHOLD = 0.85

# ═══════════════════════════════════════════════════════════════════════════════
# TYPES
# ═══════════════════════════════════════════════════════════════════════════════

"""A knowledge entity extracted from content."""
mutable struct KnowledgeEntity
    id::String
    label::String
    entity_type::String  # concept, person, technology, process
    embedding::Vector{Float64}
    frequency::Int
    phi_weight::Float64
    source_documents::Vector{String}
end

"""A relationship between two knowledge entities."""
struct KnowledgeRelation
    source_id::String
    target_id::String
    relation_type::String  # depends_on, implements, extends, contradicts
    strength::Float64
    evidence::String
end

"""Knowledge graph accumulating absorbed content."""
mutable struct KnowledgeGraph
    entities::Dict{String, KnowledgeEntity}
    relations::Vector{KnowledgeRelation}
    documents_absorbed::Int
    total_entities::Int
    total_relations::Int
    absorption_patterns::Dict{String, Float64}  # doc_type → success_rate
end

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION
# ═══════════════════════════════════════════════════════════════════════════════

"""Create an empty knowledge graph."""
function create_knowledge_graph()::KnowledgeGraph
    return KnowledgeGraph(
        Dict{String, KnowledgeEntity}(),
        KnowledgeRelation[],
        0, 0, 0,
        Dict{String, Float64}()
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# ABSORPTION
# ═══════════════════════════════════════════════════════════════════════════════

"""Absorb a document into the knowledge graph."""
function absorb_document!(graph::KnowledgeGraph, content::String, doc_type::String, doc_id::String)
    # Extract entities
    entities = extract_entities(content, doc_id)

    # Add entities to graph
    for entity in entities
        if haskey(graph.entities, entity.id)
            # Merge: increase frequency and weight
            existing = graph.entities[entity.id]
            existing.frequency += 1
            existing.phi_weight = PHI_INVERSE^(1.0 / existing.frequency)
            push!(existing.source_documents, doc_id)
        else
            graph.entities[entity.id] = entity
            graph.total_entities += 1
        end
    end

    # Find relations between new entities
    new_relations = find_relations(entities)
    append!(graph.relations, new_relations)
    graph.total_relations += length(new_relations)

    # Update absorption patterns
    graph.documents_absorbed += 1
    rate = get(graph.absorption_patterns, doc_type, 0.0)
    graph.absorption_patterns[doc_type] = rate * PHI_INVERSE + (1.0 - PHI_INVERSE) * (length(entities) > 0 ? 1.0 : 0.0)

    return length(entities)
end

"""Extract entities from raw content."""
function extract_entities(content::String, doc_id::String)::Vector{KnowledgeEntity}
    entities = KnowledgeEntity[]
    words = split(content)

    # Extract capitalized terms as potential entities
    seen = Set{String}()
    for (i, word) in enumerate(words)
        clean = replace(word, r"[^a-zA-Z0-9_-]" => "")
        length(clean) < 3 && continue

        if !isempty(clean) && isuppercase(clean[1]) && !(lowercase(clean) in seen)
            push!(seen, lowercase(clean))
            # Generate simple embedding (normalized position + hash-based)
            embedding = _simple_embedding(clean, 64)

            entity_type = _classify_entity(clean)
            entity = KnowledgeEntity(
                "entity-$(lowercase(clean))",
                clean,
                entity_type,
                embedding,
                1,
                PHI_INVERSE,
                [doc_id]
            )
            push!(entities, entity)
        end
    end

    return entities
end

"""Find relations between a set of entities based on co-occurrence."""
function find_relations(entities::Vector{KnowledgeEntity})::Vector{KnowledgeRelation}
    relations = KnowledgeRelation[]
    n = length(entities)

    for i in 1:n
        for j in (i+1):n
            # Cosine similarity of embeddings
            sim = _cosine_similarity(entities[i].embedding, entities[j].embedding)
            if sim > SIMILARITY_THRESHOLD * PHI_INVERSE
                relation_type = sim > SIMILARITY_THRESHOLD ? "strongly_related" : "related"
                push!(relations, KnowledgeRelation(
                    entities[i].id, entities[j].id,
                    relation_type, sim,
                    "co-occurrence in $(entities[i].source_documents[1])"
                ))
            end
        end
    end

    return relations
end

# ═══════════════════════════════════════════════════════════════════════════════
# QUERY & MAINTENANCE
# ═══════════════════════════════════════════════════════════════════════════════

"""Generate a digest summary of the knowledge graph."""
function generate_digest(graph::KnowledgeGraph)::Dict{String, Any}
    top_entities = sort(collect(values(graph.entities)), by=e -> -e.phi_weight)[1:min(10, length(graph.entities))]

    return Dict{String, Any}(
        "total_entities" => graph.total_entities,
        "total_relations" => graph.total_relations,
        "documents_absorbed" => graph.documents_absorbed,
        "top_entities" => [e.label for e in top_entities],
        "absorption_patterns" => graph.absorption_patterns
    )
end

"""Remove duplicate entities based on embedding similarity."""
function deduplicate!(graph::KnowledgeGraph; threshold::Float64=SIMILARITY_THRESHOLD)
    entity_list = collect(values(graph.entities))
    to_remove = Set{String}()

    for i in 1:length(entity_list)
        entity_list[i].id in to_remove && continue
        for j in (i+1):length(entity_list)
            entity_list[j].id in to_remove && continue
            sim = _cosine_similarity(entity_list[i].embedding, entity_list[j].embedding)
            if sim > threshold
                # Keep higher-frequency entity
                if entity_list[i].frequency >= entity_list[j].frequency
                    push!(to_remove, entity_list[j].id)
                else
                    push!(to_remove, entity_list[i].id)
                end
            end
        end
    end

    for id in to_remove
        delete!(graph.entities, id)
        graph.total_entities -= 1
    end

    return length(to_remove)
end

"""Query entities matching a label pattern."""
function query_graph(graph::KnowledgeGraph, pattern::String)::Vector{KnowledgeEntity}
    return filter(e -> occursin(lowercase(pattern), lowercase(e.label)), collect(values(graph.entities)))
end

"""Return graph metrics."""
function graph_metrics(graph::KnowledgeGraph)::Dict{String, Any}
    return Dict{String, Any}(
        "entities" => graph.total_entities,
        "relations" => graph.total_relations,
        "documents" => graph.documents_absorbed,
        "density" => graph.total_entities > 1 ? graph.total_relations / (graph.total_entities * (graph.total_entities - 1) / 2) : 0.0,
        "patterns" => length(graph.absorption_patterns)
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# INTERNAL
# ═══════════════════════════════════════════════════════════════════════════════

function _simple_embedding(text::String, dim::Int)::Vector{Float64}
    vec = zeros(dim)
    for (i, c) in enumerate(text)
        idx = mod(Int(c) * i, dim) + 1
        vec[idx] += PHI_INVERSE^(i)
    end
    norm_val = norm(vec)
    return norm_val > 0 ? vec / norm_val : vec
end

function _cosine_similarity(a::Vector{Float64}, b::Vector{Float64})::Float64
    na = norm(a)
    nb = norm(b)
    (na == 0 || nb == 0) && return 0.0
    return dot(a, b) / (na * nb)
end

function _classify_entity(label::String)::String
    lower = lowercase(label)
    occursin("protocol", lower) && return "process"
    occursin("model", lower) && return "technology"
    occursin("engine", lower) && return "technology"
    occursin("intelligence", lower) && return "concept"
    return "concept"
end

end # module AdaptiveKnowledgeAbsorption
