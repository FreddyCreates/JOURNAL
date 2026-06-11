# ════════════════════════════════════════════════════════════════════════════════
# KnowledgeGraph.jl — Knowledge Structures dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module KnowledgeGraph

using ..Datasets: load_dataset, Dataset, EntityRelationTriple, OntologyConcept

"""
    entities() -> Dataset{EntityRelationTriple}

Load the Entity Relations Dataset (60 knowledge triples, 15 relation types).
"""
entities() = load_dataset(:knowledge_graph, :entities)

"""
    ontology() -> Dataset{OntologyConcept}

Load the Domain Ontology Dataset (80+ concepts in hierarchical ontology).
"""
ontology() = load_dataset(:knowledge_graph, :ontology)

export entities, ontology

end # module KnowledgeGraph
