# ════════════════════════════════════════════════════════════════════════════════
# NLP.jl — Natural Language Processing dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module NLP

using ..Datasets: load_dataset, Dataset, SentimentSample, NERSample, ClassificationSample

"""
    sentiment() -> Dataset{SentimentSample}

Load the Sovereign Sentiment Analysis Dataset (200 samples, 4 classes).
"""
sentiment() = load_dataset(:nlp, :sentiment)

"""
    ner() -> Dataset{NERSample}

Load the Named Entity Recognition Dataset (20 richly annotated samples).
"""
ner() = load_dataset(:nlp, :ner)

"""
    classification() -> Dataset{ClassificationSample}

Load the Text Classification Dataset (40 multi-label topic samples).
"""
classification() = load_dataset(:nlp, :classification)

export sentiment, ner, classification

end # module NLP
