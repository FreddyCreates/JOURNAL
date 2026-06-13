# ════════════════════════════════════════════════════════════════════════════════
# Multimodal.jl — Vision-Language dataset accessors
# ════════════════════════════════════════════════════════════════════════════════

module Multimodal

using ..Datasets: load_dataset, Dataset, ImageDescriptionSample, VQASample

"""
    images() -> Dataset{ImageDescriptionSample}

Load the Image Descriptions Dataset (6 detailed scene descriptions with spatial relations).
"""
images() = load_dataset(:multimodal, :images)

"""
    vqa() -> Dataset{VQASample}

Load the Visual Question Answering Dataset (20 VQA pairs with reasoning).
"""
vqa() = load_dataset(:multimodal, :vqa)

export images, vqa

end # module Multimodal
