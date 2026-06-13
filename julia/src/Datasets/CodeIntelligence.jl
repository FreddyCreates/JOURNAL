# ════════════════════════════════════════════════════════════════════════════════
# CodeIntelligence.jl — Code Understanding & Generation dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module CodeIntelligence

using ..Datasets: load_dataset, Dataset, FunctionSignatureSample, DesignPatternSample, VulnerabilitySample

"""
    functions() -> Dataset{FunctionSignatureSample}

Load the Function Signatures Dataset (15 multi-language signatures with complexity metrics).
"""
functions() = load_dataset(:code_intelligence, :functions)

"""
    patterns() -> Dataset{DesignPatternSample}

Load the Design Patterns Dataset (10 patterns with implementations & trade-offs).
"""
patterns() = load_dataset(:code_intelligence, :patterns)

"""
    vulnerabilities() -> Dataset{VulnerabilitySample}

Load the Vulnerability Patterns Dataset (15 security vulnerabilities with secure alternatives).
"""
vulnerabilities() = load_dataset(:code_intelligence, :vulnerabilities)

export functions, patterns, vulnerabilities

end # module CodeIntelligence
