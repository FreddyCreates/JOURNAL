# ════════════════════════════════════════════════════════════════════════════════
# Query.jl — Filtering, sampling, and statistics utilities
# ════════════════════════════════════════════════════════════════════════════════

using Random

"""
    filter_by_domain(dataset::Dataset, domain::String) -> Vector

Filter samples that have a `domain` field matching the given value.
"""
function filter_by_domain(dataset::Dataset, domain::String)
    return filter(s -> _has_field(s, :domain) && s.domain == domain, dataset.samples)
end

"""
    filter_by_confidence(dataset::Dataset, min_confidence::Float64) -> Vector

Filter samples with confidence >= min_confidence.
"""
function filter_by_confidence(dataset::Dataset, min_confidence::Float64)
    return filter(s -> _has_field(s, :confidence) && s.confidence >= min_confidence, dataset.samples)
end

"""
    filter_by_difficulty(dataset::Dataset, difficulty::String) -> Vector

Filter samples matching the given difficulty level.
"""
function filter_by_difficulty(dataset::Dataset, difficulty::String)
    return filter(s -> _has_field(s, :difficulty) && s.difficulty == difficulty, dataset.samples)
end

"""
    filter_by_label(dataset::Dataset, label::String) -> Vector

Filter samples matching the given label.
"""
function filter_by_label(dataset::Dataset, label::String)
    return filter(s -> _has_field(s, :label) && s.label == label, dataset.samples)
end

"""
    sample_random(dataset::Dataset, n::Int; rng=Random.GLOBAL_RNG) -> Vector

Return n random samples from the dataset.
"""
function sample_random(dataset::Dataset, n::Int; rng=Random.GLOBAL_RNG)
    n = min(n, length(dataset))
    indices = Random.randperm(rng, length(dataset))[1:n]
    return dataset.samples[indices]
end

"""
    dataset_stats(dataset::Dataset) -> NamedTuple

Return summary statistics about the dataset.
"""
function dataset_stats(dataset::Dataset)
    meta = dataset.metadata
    sample_count = length(dataset.samples)

    # Try to extract domain distribution
    domains = Dict{String,Int}()
    for s in dataset.samples
        if _has_field(s, :domain)
            d = s.domain
            domains[d] = get(domains, d, 0) + 1
        end
    end

    return (
        id = meta.dataset_id,
        name = meta.name,
        task_type = meta.task_type,
        declared_samples = meta.total_samples,
        actual_samples = sample_count,
        ring_affinity = meta.ring_affinity,
        domain_distribution = domains
    )
end

# Helper to check if a struct has a given field
function _has_field(obj, prop::Symbol)
    return prop in fieldnames(typeof(obj))
end
