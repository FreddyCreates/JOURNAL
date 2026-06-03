#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  AIS BRIDGE — CROSS-LANGUAGE AI SYSTEM PROTOCOL FOR JULIA                            ║
║  "Omnia Connectuntur — All Things Are Connected"                                      ║
║                                                                                        ║
║  This module provides the bridge infrastructure for cross-language                    ║
║  communication between Julia, Haskell, Rust, and JavaScript components               ║
║  of the Medina Sovereign Intelligence system.                                         ║
║                                                                                        ║
║  Features:                                                                             ║
║    • Serializable message protocol                                                    ║
║    • φ-weighted priority queuing                                                      ║
║    • Language-agnostic type system                                                    ║
║    • Synchronization primitives                                                       ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module AISBridge

using ..PhiResonance: PHI, PHI_INVERSE, phi_normalize

export Language, MessageType, Priority, AISMessage
export create_message, create_phi_weighted_message
export PhiQueue, enqueue!, dequeue!, queue_length
export LanguageBridge, bridge_capabilities, can_communicate
export serialize_message, deserialize_message
export handle_ping, handle_compute, handle_sync

# ════════════════════════════════════════════════════════════════════════════════
# MESSAGE TYPES
# ════════════════════════════════════════════════════════════════════════════════

"""Supported programming languages in the system"""
@enum Language begin
    Julia_Lang
    Haskell_Lang
    Rust_Lang
    JavaScript_Lang
    Motoko_Lang
    Python_Lang
    Unknown_Lang
end

"""Message types for cross-language communication"""
@enum MessageType begin
    Ping        # Health check
    Pong        # Health response
    Compute     # Computation request
    Result      # Computation result
    Sync        # Synchronization
    SyncAck     # Sync acknowledgment
    PhiState    # φ-state update
    ErrorMsg    # Error message
end

"""Priority levels (φ-weighted)"""
@enum Priority begin
    Critical    # φ² weight
    High        # φ weight
    Normal      # 1.0 weight
    Low         # φ⁻¹ weight
    Background  # φ⁻² weight
end

"""Core AIS message structure"""
mutable struct AISMessage
    id::String
    type::MessageType
    source::Language
    target::Language
    priority::Priority
    payload::String
    timestamp::Int64
    phi_weight::Float64
end

# ════════════════════════════════════════════════════════════════════════════════
# MESSAGE CONSTRUCTION
# ════════════════════════════════════════════════════════════════════════════════

"""Convert priority to φ-based weight"""
function priority_to_weight(pri::Priority)::Float64
    pri == Critical && return PHI^2           # 2.618
    pri == High && return PHI                 # 1.618
    pri == Normal && return 1.0
    pri == Low && return PHI_INVERSE          # 0.618
    return PHI_INVERSE^2                      # 0.382
end

"""Convert weight to priority"""
function weight_to_priority(w::Float64)::Priority
    w > 2.0 && return Critical
    w > 1.3 && return High
    w > 0.8 && return Normal
    w > 0.5 && return Low
    return Background
end

"""
    create_message(id, type, source, target, priority, payload, timestamp) -> AISMessage

Create a new AIS message with automatic φ-weight calculation.
"""
function create_message(
    id::String,
    type::MessageType,
    source::Language,
    target::Language,
    priority::Priority,
    payload::String,
    timestamp::Int64
)::AISMessage
    return AISMessage(
        id, type, source, target, priority,
        payload, timestamp, priority_to_weight(priority)
    )
end

"""
    create_phi_weighted_message(id, type, source, target, payload, timestamp, importance) -> AISMessage

Create a φ-weighted message with automatic priority calculation.
"""
function create_phi_weighted_message(
    id::String,
    type::MessageType,
    source::Language,
    target::Language,
    payload::String,
    timestamp::Int64,
    importance::Float64
)::AISMessage
    phi_weight = phi_normalize(importance)
    priority = weight_to_priority(phi_weight)
    return AISMessage(
        id, type, source, target, priority,
        payload, timestamp, phi_weight
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# PHI-WEIGHTED PRIORITY QUEUE
# ════════════════════════════════════════════════════════════════════════════════

"""φ-weighted priority queue"""
mutable struct PhiQueue
    messages::Vector{AISMessage}
    
    PhiQueue() = new(AISMessage[])
end

"""Enqueue a message maintaining φ-weighted order"""
function enqueue!(queue::PhiQueue, msg::AISMessage)
    push!(queue.messages, msg)
    sort!(queue.messages, by = m -> -m.phi_weight)  # Sort descending by weight
    return queue
end

"""Dequeue highest priority message"""
function dequeue!(queue::PhiQueue)::Union{AISMessage, Nothing}
    isempty(queue.messages) && return nothing
    return popfirst!(queue.messages)
end

"""Get queue length"""
function queue_length(queue::PhiQueue)::Int
    return length(queue.messages)
end

# ════════════════════════════════════════════════════════════════════════════════
# LANGUAGE BRIDGE
# ════════════════════════════════════════════════════════════════════════════════

"""Language bridge capabilities"""
struct LanguageBridge
    name::String
    source::Language
    target::Language
    supported_types::Vector{MessageType}
    bidirectional::Bool
    latency_ms::Int
end

"""Get capabilities of the Julia bridge"""
function bridge_capabilities()::Vector{LanguageBridge}
    return [
        LanguageBridge(
            "julia-haskell", Julia_Lang, Haskell_Lang,
            [Ping, Pong, Compute, Result, Sync, SyncAck, PhiState],
            true, 10
        ),
        LanguageBridge(
            "julia-rust", Julia_Lang, Rust_Lang,
            [Ping, Pong, Compute, Result, Sync, SyncAck, PhiState],
            true, 5
        ),
        LanguageBridge(
            "julia-js", Julia_Lang, JavaScript_Lang,
            [Ping, Pong, Compute, Result, Sync, SyncAck],
            true, 15
        ),
        LanguageBridge(
            "julia-motoko", Julia_Lang, Motoko_Lang,
            [Sync, SyncAck, PhiState],
            true, 100
        ),
        LanguageBridge(
            "julia-python", Julia_Lang, Python_Lang,
            [Ping, Pong, Compute, Result, Sync, SyncAck, PhiState],
            true, 8
        )
    ]
end

"""Check if two languages can communicate"""
function can_communicate(src::Language, tgt::Language)::Bool
    src == tgt && return true
    for bridge in bridge_capabilities()
        if (bridge.source == src && bridge.target == tgt) ||
           (bridge.bidirectional && bridge.source == tgt && bridge.target == src)
            return true
        end
    end
    return false
end

# ════════════════════════════════════════════════════════════════════════════════
# SERIALIZATION
# ════════════════════════════════════════════════════════════════════════════════

"""Serialize message to string"""
function serialize_message(msg::AISMessage)::String
    return join([
        "AIS_MSG_V1",
        "ID:$(msg.id)",
        "TYPE:$(msg.type)",
        "SRC:$(msg.source)",
        "TGT:$(msg.target)",
        "PRI:$(msg.priority)",
        "TS:$(msg.timestamp)",
        "PHI:$(msg.phi_weight)",
        "PAYLOAD:$(msg.payload)",
        "END_MSG"
    ], "\n")
end

"""Parse message type from string"""
function parse_message_type(s::String)::MessageType
    s == "Ping" && return Ping
    s == "Pong" && return Pong
    s == "Compute" && return Compute
    s == "Result" && return Result
    s == "Sync" && return Sync
    s == "SyncAck" && return SyncAck
    s == "PhiState" && return PhiState
    return ErrorMsg
end

"""Parse language from string"""
function parse_language(s::String)::Language
    s == "Julia_Lang" && return Julia_Lang
    s == "Haskell_Lang" && return Haskell_Lang
    s == "Rust_Lang" && return Rust_Lang
    s == "JavaScript_Lang" && return JavaScript_Lang
    s == "Motoko_Lang" && return Motoko_Lang
    s == "Python_Lang" && return Python_Lang
    return Unknown_Lang
end

"""Parse priority from string"""
function parse_priority(s::String)::Priority
    s == "Critical" && return Critical
    s == "High" && return High
    s == "Normal" && return Normal
    s == "Low" && return Low
    return Background
end

"""Extract field value from serialized lines"""
function extract_field(prefix::String, lines::Vector{String})::String
    for line in lines
        if startswith(line, prefix)
            return line[length(prefix)+1:end]
        end
    end
    return ""
end

"""Deserialize message from string"""
function deserialize_message(input::String)::Union{AISMessage, Nothing}
    lines = split(input, "\n")
    length(lines) < 10 && return nothing
    lines[1] != "AIS_MSG_V1" && return nothing
    
    return AISMessage(
        extract_field("ID:", collect(lines)),
        parse_message_type(extract_field("TYPE:", collect(lines))),
        parse_language(extract_field("SRC:", collect(lines))),
        parse_language(extract_field("TGT:", collect(lines))),
        parse_priority(extract_field("PRI:", collect(lines))),
        extract_field("PAYLOAD:", collect(lines)),
        parse(Int64, extract_field("TS:", collect(lines))),
        parse(Float64, extract_field("PHI:", collect(lines)))
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# PROTOCOL HANDLERS
# ════════════════════════════════════════════════════════════════════════════════

"""Handle ping message"""
function handle_ping(msg::AISMessage)::AISMessage
    return create_message(
        "$(msg.id)-response",
        Pong,
        msg.target,
        msg.source,
        msg.priority,
        "pong",
        msg.timestamp + 1
    )
end

"""Handle compute request"""
function handle_compute(msg::AISMessage, compute_fn::Function)::AISMessage
    result = compute_fn(msg.payload)
    return create_message(
        "$(msg.id)-result",
        Result,
        msg.target,
        msg.source,
        msg.priority,
        string(result),
        msg.timestamp + 1
    )
end

"""Handle sync message"""
function handle_sync(msg::AISMessage, phi_state::Float64)::AISMessage
    return create_phi_weighted_message(
        "$(msg.id)-ack",
        SyncAck,
        msg.target,
        msg.source,
        string(phi_state),
        msg.timestamp + 1,
        phi_state
    )
end

end # module AISBridge
