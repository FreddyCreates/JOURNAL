# ════════════════════════════════════════════════════════════════════════════════
# Conversational.jl — Dialogue & Instructions dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module Conversational

using ..Datasets: load_dataset, Dataset, DialogueSample, InstructionSample

"""
    dialogue() -> Dataset{DialogueSample}

Load the Multi-Turn Dialogue Dataset (5 rich conversations with 25+ turns).
"""
dialogue() = load_dataset(:conversational, :dialogue)

"""
    instructions() -> Dataset{InstructionSample}

Load the Instruction Following Dataset (10 diverse instruction-response pairs).
"""
instructions() = load_dataset(:conversational, :instructions)

export dialogue, instructions

end # module Conversational
