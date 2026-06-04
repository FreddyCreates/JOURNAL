# 🧠 Sovereign AI Datasets

> Real training and evaluation datasets for the organism intelligence substrate.

These are **actual data** — not metadata registers. Each file contains usable training samples, evaluation pairs, and knowledge structures ready for model training, fine-tuning, and evaluation.

## Directory Structure

```
datasets/
├── nlp/                          # Natural Language Processing
│   ├── sentiment-analysis.json       50 multi-domain sentiment samples (4 classes)
│   ├── named-entity-recognition.json 20 richly annotated NER samples (10 entity types)
│   └── text-classification.json      40 multi-label topic classification samples
│
├── code-intelligence/            # Code Understanding & Generation
│   ├── function-signatures.json      15 multi-language function signatures with complexity metrics
│   ├── design-patterns.json          10 patterns with full implementations & trade-offs
│   └── vulnerability-patterns.json   15 security vulnerabilities with secure alternatives
│
├── reasoning/                    # Logic & Mathematics
│   ├── mathematical-reasoning.json   20 math problems with chain-of-thought solutions
│   ├── logical-inference.json        15 logic problems (deductive/inductive/abductive)
│   └── causal-reasoning.json         10 causal inference scenarios
│
├── conversational/               # Dialogue & Instructions
│   ├── multi-turn-dialogue.json      5 rich multi-turn conversations (25+ turns total)
│   └── instruction-following.json    10 diverse instruction-response pairs
│
├── multimodal/                   # Vision-Language
│   ├── image-descriptions.json       6 detailed scene descriptions (3 levels + spatial)
│   └── visual-question-answering.json 20 VQA pairs with reasoning
│
├── safety/                       # Safety & Alignment
│   ├── toxicity-detection.json       30 labeled samples with context awareness
│   └── guardrail-triggers.json       15 trigger patterns with recommended responses
│
├── knowledge-graph/              # Knowledge Structures
│   ├── entity-relations.json         60 knowledge triples (15 relation types)
│   └── domain-ontology.json          80+ concepts in hierarchical ontology
│
└── package.json                  # Package manifest with exports
```

## Usage

```javascript
// Import specific datasets
import sentimentData from '@medina/ai-datasets/nlp/sentiment';
import codePatterns from '@medina/ai-datasets/code-intelligence/patterns';
import mathProblems from '@medina/ai-datasets/reasoning/math';

// Each dataset has metadata + samples
console.log(sentimentData.metadata.total_samples); // 50
console.log(sentimentData.samples[0].label);       // "positive"
```

## Dataset Schema

Every dataset follows this structure:

```json
{
  "metadata": {
    "dataset_id": "AID-XXX-NNN",
    "name": "Human-readable name",
    "version": "1.0.0",
    "description": "What this dataset contains",
    "task_type": "classification | generation | reasoning | ...",
    "total_samples": 50,
    "ring_affinity": "Which organism ring this serves",
    "organism_placement": "Where in the organism architecture"
  },
  "samples": [...]
}
```

## Ring Affinity Map

| Ring | Datasets | Purpose |
|------|----------|---------|
| Interface Ring | NLP classification, logical reasoning, dialogue, instructions | Core reasoning and routing |
| Build Ring | Function signatures, design patterns, math reasoning | Code and computation |
| Memory Ring | NER, knowledge graph, ontology | Knowledge substrate |
| Geometry Ring | Image descriptions, VQA | Scene understanding |
| Counsel Ring | Toxicity detection, guardrails, vulnerability patterns | Safety and governance |

## Total Dataset Statistics

- **21 dataset files** across 7 domains
- **~450+ individual training samples**
- **7 organism rings** covered
- **Multi-format**: classification, generation, reasoning, extraction, dialogue
- **Multi-modal**: text, code, visual descriptions, structured knowledge

---

**Author:** Freddy Medina · **License:** MIT  
**Organism Placement:** Sovereign intelligence training substrate  
`VAULT-ID: FREDDY.MEDINA.2026.DATASETS`
