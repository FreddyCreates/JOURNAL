# ════════════════════════════════════════════════════════════════════════════════
# Reasoning.jl — Logic & Mathematics dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module Reasoning

using ..Datasets: load_dataset, Dataset, MathReasoningSample, LogicalInferenceSample, CausalReasoningSample

"""
    math() -> Dataset{MathReasoningSample}

Load the Mathematical Reasoning Dataset (20 problems with chain-of-thought solutions).
"""
math() = load_dataset(:reasoning, :math)

"""
    logic() -> Dataset{LogicalInferenceSample}

Load the Logical Inference Dataset (15 logic problems — deductive/inductive/abductive).
"""
logic() = load_dataset(:reasoning, :logic)

"""
    causal() -> Dataset{CausalReasoningSample}

Load the Causal Reasoning Dataset (10 causal inference scenarios).
"""
causal() = load_dataset(:reasoning, :causal)

export math, logic, causal

end # module Reasoning
