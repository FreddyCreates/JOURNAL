# ════════════════════════════════════════════════════════════════════════════════
# test_datasets.jl — Tests for the Sovereign AI Datasets Julia SDK
# ════════════════════════════════════════════════════════════════════════════════

using Test

# Add parent project to load path
push!(LOAD_PATH, joinpath(@__DIR__, ".."))

using JSON3

# Include the Datasets module directly for testing
include(joinpath(@__DIR__, "..", "src", "Datasets", "Datasets.jl"))
using .Datasets

@testset "Datasets SDK" begin

    @testset "SDK Info" begin
        info = datasets_info()
        @test info.name == "Sovereign AI Datasets SDK"
        @test info.version == "1.0.0"
        @test length(info.domains) == 7
        @test :NLP in info.domains
        @test :KnowledgeGraph in info.domains
    end

    @testset "List Datasets" begin
        all_datasets = list_datasets()
        @test length(all_datasets) > 0
        @test all(d -> haskey(d, :domain), all_datasets)
        @test all(d -> haskey(d, :file), all_datasets)
        @test all(d -> endswith(d.file, ".json"), all_datasets)
    end

    @testset "Load Raw" begin
        raw = load_raw("nlp", "sentiment-analysis")
        @test haskey(raw, :metadata)
        @test haskey(raw, :samples)
        @test raw[:metadata][:dataset_id] == "AID-NLP-001"
    end

    @testset "NLP - Sentiment" begin
        ds = load_dataset(:nlp, :sentiment)
        @test ds.metadata.dataset_id == "AID-NLP-001"
        @test ds.metadata.task_type == "text-classification"
        @test length(ds) > 0
        @test ds[1] isa SentimentSample
        @test ds[1].id == "sent-001"
        @test ds[1].label in ["positive", "negative", "neutral", "mixed"]
        @test 0.0 <= ds[1].confidence <= 1.0
    end

    @testset "Reasoning - Math" begin
        ds = load_dataset(:reasoning, :math)
        @test ds.metadata.dataset_id == "AID-REASON-001"
        @test length(ds) > 0
        @test ds[1] isa MathReasoningSample
        @test ds[1].difficulty in ["elementary", "intermediate", "advanced", "competition"]
        @test length(ds[1].solution.chain_of_thought) > 0
        @test ds[1].solution.answer != ""
    end

    @testset "Knowledge Graph - Entities" begin
        ds = load_dataset(:knowledge_graph, :entities)
        @test ds.metadata.dataset_id == "AID-KG-001"
        @test length(ds) > 0
        @test ds[1] isa EntityRelationTriple
        @test ds[1].subject != ""
        @test ds[1].relation != ""
        @test ds[1].object != ""
    end

    @testset "Query - Filter by Domain" begin
        ds = load_dataset(:nlp, :sentiment)
        financial = filter_by_domain(ds, "financial")
        @test length(financial) > 0
        @test all(s -> s.domain == "financial", financial)
    end

    @testset "Query - Filter by Confidence" begin
        ds = load_dataset(:nlp, :sentiment)
        high_conf = filter_by_confidence(ds, 0.95)
        @test length(high_conf) > 0
        @test all(s -> s.confidence >= 0.95, high_conf)
    end

    @testset "Query - Filter by Label" begin
        ds = load_dataset(:nlp, :sentiment)
        positive = filter_by_label(ds, "positive")
        @test length(positive) > 0
        @test all(s -> s.label == "positive", positive)
    end

    @testset "Query - Filter by Difficulty" begin
        ds = load_dataset(:reasoning, :math)
        elementary = filter_by_difficulty(ds, "elementary")
        @test all(s -> s.difficulty == "elementary", elementary)
    end

    @testset "Query - Random Sampling" begin
        ds = load_dataset(:nlp, :sentiment)
        sampled = sample_random(ds, 5)
        @test length(sampled) == 5
        @test all(s -> s isa SentimentSample, sampled)
    end

    @testset "Query - Dataset Stats" begin
        ds = load_dataset(:nlp, :sentiment)
        stats = dataset_stats(ds)
        @test stats.id == "AID-NLP-001"
        @test stats.actual_samples > 0
        @test haskey(stats.domain_distribution, "financial")
    end

    @testset "Domain Module - NLP" begin
        ds = Datasets.NLP.sentiment()
        @test ds isa Dataset{SentimentSample}
        @test length(ds) > 0
    end

    @testset "Domain Module - Reasoning" begin
        ds = Datasets.Reasoning.math()
        @test ds isa Dataset{MathReasoningSample}
        @test length(ds) > 0
    end

    @testset "Domain Module - KnowledgeGraph" begin
        ds = Datasets.KnowledgeGraph.entities()
        @test ds isa Dataset{EntityRelationTriple}
        @test length(ds) > 0
    end

    @testset "Iteration Protocol" begin
        ds = load_dataset(:nlp, :sentiment)
        count = 0
        for sample in ds
            count += 1
            @test sample isa SentimentSample
            count >= 3 && break
        end
        @test count == 3
    end

    @testset "Error Handling" begin
        @test_throws ErrorException load_dataset(:nlp, :nonexistent)
        @test_throws ErrorException load_raw("nonexistent", "file")
    end

end

println("\n✅ All Datasets SDK tests passed!")
