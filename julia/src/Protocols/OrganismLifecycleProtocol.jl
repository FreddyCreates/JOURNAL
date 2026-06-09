#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  PROTO-010: Organism Lifecycle Protocol (OLP)                                         ║
║  Autonomous Lifecycle Intelligence — Self-healing organism runtime                   ║
║                                                                                        ║
║  Features:                                                                             ║
║    • Full boot → run → shutdown lifecycle management                                 ║
║    • Kernel hot-reload and health monitoring                                          ║
║    • Autonomous self-healing with restart policies                                    ║
║    • Register integrity verification                                                   ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module OrganismLifecycleProtocol

using SHA

export OrganismState, Embryonic, Booting, Running, Degraded, Healing, ShuttingDown, Dead
export Kernel, OrganismRuntime
export create_runtime, boot!, shutdown!, health_check
export register_kernel!, hot_reload!, self_heal!, runtime_metrics

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const PHI_INVERSE = 1 / PHI
const HEARTBEAT_MS = 873
const MAX_RESTART_ATTEMPTS = 3

# ═══════════════════════════════════════════════════════════════════════════════
# TYPES
# ═══════════════════════════════════════════════════════════════════════════════

"""Organism lifecycle state."""
@enum OrganismState begin
    Embryonic    # Pre-boot
    Booting      # Starting up
    Running      # Healthy and active
    Degraded     # Running with issues
    Healing      # Self-repair in progress
    ShuttingDown # Graceful shutdown
    Dead         # Terminated
end

"""A kernel running within the organism."""
mutable struct Kernel
    id::String
    name::String
    state::OrganismState
    version::String
    health_score::Float64    # [0, 1]
    restart_count::Int
    last_heartbeat::Int64
    register_hash::String    # Integrity hash
end

"""The organism runtime managing kernels and lifecycle."""
mutable struct OrganismRuntime
    id::String
    state::OrganismState
    kernels::Dict{String, Kernel}
    boot_time::Int64
    uptime_ms::Int64
    total_heals::Int
    total_restarts::Int
    integrity_hash::String
end

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION
# ═══════════════════════════════════════════════════════════════════════════════

"""Create a new organism runtime."""
function create_runtime(id::String)::OrganismRuntime
    return OrganismRuntime(
        id, Embryonic,
        Dict{String, Kernel}(),
        0, 0, 0, 0,
        ""
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# LIFECYCLE
# ═══════════════════════════════════════════════════════════════════════════════

"""Boot the organism runtime."""
function boot!(runtime::OrganismRuntime)::Bool
    runtime.state == Running && return true
    runtime.state = Booting
    runtime.boot_time = time_ns()

    # Boot all registered kernels
    for (_, kernel) in runtime.kernels
        kernel.state = Running
        kernel.health_score = 1.0
        kernel.last_heartbeat = time_ns()
    end

    # Compute integrity hash
    runtime.integrity_hash = _compute_integrity(runtime)
    runtime.state = Running
    return true
end

"""Gracefully shutdown the organism."""
function shutdown!(runtime::OrganismRuntime)
    runtime.state = ShuttingDown

    # Shutdown kernels in reverse priority order
    for (_, kernel) in runtime.kernels
        kernel.state = Dead
        kernel.health_score = 0.0
    end

    runtime.uptime_ms = div(time_ns() - runtime.boot_time, 1_000_000)
    runtime.state = Dead
end

"""Register a new kernel in the runtime."""
function register_kernel!(runtime::OrganismRuntime, id::String, name::String; version::String="1.0.0")::Kernel
    register_hash = bytes2hex(sha256(Vector{UInt8}("$(id):$(name):$(version)")))
    kernel = Kernel(id, name, Embryonic, version, 1.0, 0, 0, register_hash)
    runtime.kernels[id] = kernel

    # If runtime is already running, boot the kernel
    if runtime.state == Running
        kernel.state = Running
        kernel.last_heartbeat = time_ns()
    end

    return kernel
end

# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH & HEALING
# ═══════════════════════════════════════════════════════════════════════════════

"""Check health of all kernels and the runtime."""
function health_check(runtime::OrganismRuntime)::Dict{String, Any}
    runtime.state != Running && runtime.state != Degraded && return Dict{String, Any}(
        "status" => string(runtime.state),
        "healthy" => false
    )

    unhealthy = String[]
    for (id, kernel) in runtime.kernels
        if kernel.health_score < PHI_INVERSE
            push!(unhealthy, id)
        end
    end

    overall_health = isempty(runtime.kernels) ? 1.0 : mean(k.health_score for (_, k) in runtime.kernels)

    if !isempty(unhealthy)
        runtime.state = Degraded
    end

    return Dict{String, Any}(
        "status" => string(runtime.state),
        "healthy" => isempty(unhealthy),
        "overall_health" => overall_health,
        "unhealthy_kernels" => unhealthy,
        "total_kernels" => length(runtime.kernels),
        "integrity_valid" => _verify_integrity(runtime)
    )
end

"""Hot-reload a kernel with a new version."""
function hot_reload!(runtime::OrganismRuntime, kernel_id::String; new_version::String="")::Bool
    !haskey(runtime.kernels, kernel_id) && return false
    kernel = runtime.kernels[kernel_id]

    # Brief restart
    kernel.state = Booting
    if !isempty(new_version)
        kernel.version = new_version
    end
    kernel.register_hash = bytes2hex(sha256(Vector{UInt8}("$(kernel.id):$(kernel.name):$(kernel.version)")))
    kernel.state = Running
    kernel.health_score = 1.0
    kernel.last_heartbeat = time_ns()
    kernel.restart_count += 1

    # Update runtime integrity
    runtime.integrity_hash = _compute_integrity(runtime)
    runtime.total_restarts += 1

    return true
end

"""Self-heal by restarting failed kernels."""
function self_heal!(runtime::OrganismRuntime)::Int
    runtime.state = Healing
    healed = 0

    for (id, kernel) in runtime.kernels
        if kernel.health_score < PHI_INVERSE && kernel.restart_count < MAX_RESTART_ATTEMPTS
            kernel.state = Booting
            kernel.health_score = PHI_INVERSE  # Restore to minimum viable
            kernel.state = Running
            kernel.restart_count += 1
            kernel.last_heartbeat = time_ns()
            healed += 1
        end
    end

    runtime.total_heals += healed
    runtime.state = Running
    runtime.integrity_hash = _compute_integrity(runtime)

    return healed
end

"""Return runtime metrics."""
function runtime_metrics(runtime::OrganismRuntime)::Dict{String, Any}
    return Dict{String, Any}(
        "id" => runtime.id,
        "state" => string(runtime.state),
        "kernels" => length(runtime.kernels),
        "total_heals" => runtime.total_heals,
        "total_restarts" => runtime.total_restarts,
        "integrity_hash" => runtime.integrity_hash,
        "uptime_ms" => runtime.state == Dead ? runtime.uptime_ms : div(time_ns() - runtime.boot_time, 1_000_000)
    )
end

# ═══════════════════════════════════════════════════════════════════════════════
# INTERNAL
# ═══════════════════════════════════════════════════════════════════════════════

function _compute_integrity(runtime::OrganismRuntime)::String
    elements = [runtime.id]
    for (id, kernel) in sort(collect(runtime.kernels), by=p->p.first)
        push!(elements, "$(id):$(kernel.version):$(kernel.register_hash)")
    end
    return bytes2hex(sha256(Vector{UInt8}(join(elements, "|"))))
end

function _verify_integrity(runtime::OrganismRuntime)::Bool
    return _compute_integrity(runtime) == runtime.integrity_hash
end

# Helper for mean when Statistics might not be loaded in scope
function mean(itr)
    s = 0.0
    n = 0
    for x in itr
        s += x
        n += 1
    end
    return n > 0 ? s / n : 0.0
end

end # module OrganismLifecycleProtocol
