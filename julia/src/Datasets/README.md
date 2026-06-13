# 🧠 Sovereign AI Datasets — Julia SDK

> Julia interface for loading, querying, and manipulating the Sovereign AI Datasets.

## Installation

The Datasets SDK is part of the `MedinaIntelligenceSDK` Julia package. Ensure you have the dependencies:

```julia
using Pkg
Pkg.add(["JSON3", "StructTypes"])
```

## Quick Start

```julia
# Load the module
include("src/Datasets/Datasets.jl")
using .Datasets

# Load a dataset by domain and name
sentiment = load_dataset(:nlp, :sentiment)
println("Loaded $(length(sentiment)) samples")
println("First sample: $(sentiment[1].text)")

# Use domain accessors for convenience
math_problems = Datasets.Reasoning.math()
entities = Datasets.KnowledgeGraph.entities()
```

## Available Datasets

| Domain | Name | Symbol | Samples |
|--------|------|--------|---------|
| NLP | Sentiment Analysis | `:nlp, :sentiment` | 200 |
| NLP | Named Entity Recognition | `:nlp, :ner` | 20 |
| NLP | Text Classification | `:nlp, :classification` | 40 |
| Code Intelligence | Function Signatures | `:code_intelligence, :functions` | 15 |
| Code Intelligence | Design Patterns | `:code_intelligence, :patterns` | 10 |
| Code Intelligence | Vulnerability Patterns | `:code_intelligence, :vulnerabilities` | 15 |
| Reasoning | Mathematical Reasoning | `:reasoning, :math` | 20-40 |
| Reasoning | Logical Inference | `:reasoning, :logic` | 15 |
| Reasoning | Causal Reasoning | `:reasoning, :causal` | 10 |
| Conversational | Multi-Turn Dialogue | `:conversational, :dialogue` | 5 |
| Conversational | Instruction Following | `:conversational, :instructions` | 10 |
| Multimodal | Image Descriptions | `:multimodal, :images` | 6 |
| Multimodal | Visual QA | `:multimodal, :vqa` | 20 |
| Safety | Toxicity Detection | `:safety, :toxicity` | 30 |
| Safety | Guardrail Triggers | `:safety, :guardrails` | 15 |
| Knowledge Graph | Entity Relations | `:knowledge_graph, :entities` | 60 |
| Knowledge Graph | Domain Ontology | `:knowledge_graph, :ontology` | 80+ |

## API Reference

### Loading

```julia
# Generic loader
ds = load_dataset(:nlp, :sentiment)

# Raw JSON access
raw = load_raw("nlp", "sentiment-analysis")

# List all available datasets
list_datasets()

# Domain-specific shortcuts
ds = Datasets.NLP.sentiment()
ds = Datasets.Reasoning.math()
ds = Datasets.CodeIntelligence.vulnerabilities()
ds = Datasets.Safety.toxicity()
ds = Datasets.KnowledgeGraph.entities()
```

### Querying & Filtering

```julia
# Filter by domain
financial = filter_by_domain(ds, "financial")

# Filter by confidence threshold
high_conf = filter_by_confidence(ds, 0.95)

# Filter by label
positive = filter_by_label(ds, "positive")

# Filter by difficulty (reasoning datasets)
hard = filter_by_difficulty(ds, "competition")

# Random sampling
batch = sample_random(ds, 10)

# Dataset statistics
stats = dataset_stats(ds)
println(stats.domain_distribution)
```

### Iteration

Datasets support Julia's iteration protocol:

```julia
ds = load_dataset(:nlp, :sentiment)

for sample in ds
    println("$(sample.id): $(sample.label) — $(sample.text[1:50])...")
end

# Indexing
first_sample = ds[1]
last_sample = ds[end]
```

## Type System

Every sample is a strongly-typed Julia struct:

```julia
struct SentimentSample <: Sample
    id::String
    text::String
    label::String        # "positive" | "negative" | "neutral" | "mixed"
    confidence::Float64
    domain::String
end

struct MathReasoningSample <: Sample
    id::String
    problem::String
    difficulty::String
    topic::String
    solution::MathSolution  # chain_of_thought, answer, key_insight
end

struct EntityRelationTriple <: Sample
    id::String
    subject::String
    relation::String
    object::String
    confidence::Float64
    domain::String
end
```

## Ring Affinity Map

| Ring | Datasets | Purpose |
|------|----------|---------|
| Interface Ring | NLP, logical reasoning, dialogue | Core reasoning and routing |
| Build Ring | Functions, patterns, math | Code and computation |
| Memory Ring | NER, knowledge graph, ontology | Knowledge substrate |
| Geometry Ring | Image descriptions, VQA | Scene understanding |
| Counsel Ring | Toxicity, guardrails, vulnerabilities | Safety and governance |

## Running Tests

```bash
cd julia
julia test/test_datasets.jl
```

---

**Author:** Freddy Medina · **License:** MIT  
**Organism Placement:** Sovereign intelligence training substrate  
`VAULT-ID: FREDDY.MEDINA.2026.JULIA.DATASETS`
