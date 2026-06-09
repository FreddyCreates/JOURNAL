#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  MEDINA INTELLIGENCE SDK — Sovereign AI Platform                                      ║
║  "Ratio Aurea Vivens — The Living Golden Ratio"                                       ║
║                                                                                        ║
║  Full Julia SDK providing:                                                             ║
║    • φ-Resonance mathematics core                                                     ║
║    • Quantum coherence computations                                                   ║
║    • Neural dynamics / Kuramoto oscillators                                            ║
║    • Token simulation with economic models                                             ║
║    • Multi-agent orchestration                                                         ║
║    • Cross-language AIS bridge                                                         ║
║    • 10 Major AI Protocols                                                             ║
║    • Multi-model fusion engine                                                         ║
║    • THESIS verification layer                                                         ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module MedinaIntelligenceSDK

using LinearAlgebra
using Statistics
using Random
using SHA

# ════════════════════════════════════════════════════════════════════════════════
# CORE MODULES
# ════════════════════════════════════════════════════════════════════════════════

include("PhiResonance.jl")
include("QuantumCoherence.jl")
include("NeuralDynamics.jl")
include("TokenSimulator.jl")
include("MultiAgentOrchestration.jl")
include("AISBridge.jl")
include("CognitiveGeometry.jl")
include("ErgodicCognition.jl")
include("GreekMath.jl")
include("InformationGeometry.jl")
include("MonteCarloThinking.jl")
include("NeuralCoupling.jl")
include("SwarmOrchestration.jl")

# ════════════════════════════════════════════════════════════════════════════════
# AI PROTOCOLS (10 Major Protocols)
# ════════════════════════════════════════════════════════════════════════════════

include("Protocols/SovereignRoutingProtocol.jl")
include("Protocols/EncryptedIntelligenceTransport.jl")
include("Protocols/PhiResonanceSyncProtocol.jl")
include("Protocols/AdaptiveKnowledgeAbsorption.jl")
include("Protocols/MultiModelFusionProtocol.jl")
include("Protocols/SovereignContractVerification.jl")
include("Protocols/EdgeMeshIntelligence.jl")
include("Protocols/VisualSceneIntelligence.jl")
include("Protocols/MemoryLineageProtocol.jl")
include("Protocols/OrganismLifecycleProtocol.jl")

# ════════════════════════════════════════════════════════════════════════════════
# MULTI-MODEL ENGINE
# ════════════════════════════════════════════════════════════════════════════════

include("MultiModel/ModelRegistry.jl")
include("MultiModel/FusionEngine.jl")
include("MultiModel/ConsensusResolver.jl")

# ════════════════════════════════════════════════════════════════════════════════
# RE-EXPORTS — Full SDK surface
# ════════════════════════════════════════════════════════════════════════════════

# Core
using .PhiResonance
using .QuantumCoherence
using .NeuralDynamics
using .TokenSimulator
using .MultiAgentOrchestration
using .AISBridge

# Protocols
using .SovereignRoutingProtocol
using .EncryptedIntelligenceTransport
using .PhiResonanceSyncProtocol
using .AdaptiveKnowledgeAbsorption
using .MultiModelFusionProtocol
using .SovereignContractVerification
using .EdgeMeshIntelligence
using .VisualSceneIntelligence
using .MemoryLineageProtocol
using .OrganismLifecycleProtocol

# Multi-Model
using .ModelRegistry
using .FusionEngine
using .ConsensusResolver

# ════════════════════════════════════════════════════════════════════════════════
# SDK METADATA
# ════════════════════════════════════════════════════════════════════════════════

const SDK_VERSION = "1.0.0"
const SDK_NAME = "MedinaIntelligenceSDK"
const SDK_AUTHOR = "Alfredo 'Freddy' Medina Hernandez"

"""
    sdk_info() -> NamedTuple

Return SDK metadata including version, available modules, and protocol count.
"""
function sdk_info()
    return (
        name = SDK_NAME,
        version = SDK_VERSION,
        author = SDK_AUTHOR,
        core_modules = [
            :PhiResonance, :QuantumCoherence, :NeuralDynamics,
            :TokenSimulator, :MultiAgentOrchestration, :AISBridge,
            :CognitiveGeometry, :ErgodicCognition, :GreekMath,
            :InformationGeometry, :MonteCarloThinking, :NeuralCoupling,
            :SwarmOrchestration
        ],
        protocols = [
            :SovereignRoutingProtocol, :EncryptedIntelligenceTransport,
            :PhiResonanceSyncProtocol, :AdaptiveKnowledgeAbsorption,
            :MultiModelFusionProtocol, :SovereignContractVerification,
            :EdgeMeshIntelligence, :VisualSceneIntelligence,
            :MemoryLineageProtocol, :OrganismLifecycleProtocol
        ],
        multi_model = [
            :ModelRegistry, :FusionEngine, :ConsensusResolver
        ]
    )
end

export sdk_info, SDK_VERSION, SDK_NAME

end # module MedinaIntelligenceSDK
