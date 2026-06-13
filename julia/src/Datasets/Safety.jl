# ════════════════════════════════════════════════════════════════════════════════
# Safety.jl — Safety & Alignment dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module Safety

using ..Datasets: load_dataset, Dataset, ToxicitySample, GuardrailSample

"""
    toxicity() -> Dataset{ToxicitySample}

Load the Toxicity Detection Dataset (30 labeled samples with context awareness).
"""
toxicity() = load_dataset(:safety, :toxicity)

"""
    guardrails() -> Dataset{GuardrailSample}

Load the Guardrail Triggers Dataset (15 trigger patterns with recommended responses).
"""
guardrails() = load_dataset(:safety, :guardrails)

export toxicity, guardrails

end # module Safety
