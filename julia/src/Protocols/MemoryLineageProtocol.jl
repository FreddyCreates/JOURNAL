#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  PROTO-009: Memory Lineage Protocol (MLP)                                             ║
║  Temporal Memory Intelligence — Full ancestry tracking with φ-spatial addressing     ║
║                                                                                        ║
║  Features:                                                                             ║
║    • Memory branch forking and consolidation                                          ║
║    • φ-encoded spatial coordinate addressing                                          ║
║    • Access frequency-based pruning                                                    ║
║    • Lineage visualization data structures                                             ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module MemoryLineageProtocol

using LinearAlgebra
using SHA

export MemoryNode, MemoryBranch, MemoryTree, PhiCoordinate
export create_memory_tree, store_memory!, fork_branch!, consolidate!
export query_lineage, prune_inactive!, phi_address, tree_metrics

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + sqrt(5)) / 2
const PHI_INVERSE = 1 / PHI
const PRUNE_THRESHOLD = 10  # Access count below which memory may be pruned

# ═══════════════════════════════════════════════════════════════════════════════
# TYPES
# ═══════════════════════════════════════════════════════════════════════════════

"""φ-encoded spatial coordinate for memory addressing."""
struct PhiCoordinate
    x::Float64  # Spatial X (φ-scaled)
    y::Float64  # Spatial Y (φ-scaled)
    z::Float64  # Temporal depth
    r::Float64  # Resonance radius
    θ::Float64  # Angular position (golden angle increments)
end

"""A single memory node in the lineage tree."""
mutable struct MemoryNode
    id::String
    content::String
    coordinate::PhiCoordinate
    parent_id::Union{String, Nothing}
    children_ids::Vector{String}
    access_count::Int
    created_at::Int64
    last_accessed::Int64
    content_hash::String
end

"""A named branch in the memory tree."""
mutable struct MemoryBranch
    name::String
    head_id::String
    node_count::Int
    created_at::Int64
end

"""The full memory lineage tree."""
mutable struct MemoryTree
    nodes::Dict{String, MemoryNode}
    branches::Dict{String, MemoryBranch}
    active_branch::String
    total_stores::Int
    total_prunes::Int
    coordinate_counter::Int
end

# ═══════════════════════════════════════════════════════════════════════════════
# CONSTRUCTION
# ═══════════════════════════════════════════════════════════════════════════════

"""Create a new memory tree with a root node."""
function create_memory_tree(root_content::String="ROOT")::MemoryTree
    root_coord = phi_address(0)
    root_hash = bytes2hex(sha256(Vector{UInt8}(root_content)))
    now = time_ns()

    root = MemoryNode("root", root_content, root_coord, nothing, String[], 1, now, now, root_hash)

    nodes = Dict("root" => root)
    branches = Dict("main" => MemoryBranch("main", "root", 1, now))

    return MemoryTree(nodes, branches, "main", 1, 0, 1)
end

# ═══════════════════════════════════════════════════════════════════════════════
# STORAGE & RETRIEVAL
# ═══════════════════════════════════════════════════════════════════════════════

"""Store a new memory, linked to the current branch head."""
function store_memory!(tree::MemoryTree, content::String)::MemoryNode
    tree.coordinate_counter += 1
    coord = phi_address(tree.coordinate_counter)

    now = time_ns()
    id = "mem-$(tree.coordinate_counter)"
    content_hash = bytes2hex(sha256(Vector{UInt8}(content)))

    # Get current head
    branch = tree.branches[tree.active_branch]
    parent_id = branch.head_id

    node = MemoryNode(id, content, coord, parent_id, String[], 1, now, now, content_hash)
    tree.nodes[id] = node

    # Update parent's children
    if haskey(tree.nodes, parent_id)
        push!(tree.nodes[parent_id].children_ids, id)
    end

    # Update branch head
    branch.head_id = id
    branch.node_count += 1
    tree.total_stores += 1

    return node
end

"""Query the lineage (ancestry chain) of a memory node."""
function query_lineage(tree::MemoryTree, node_id::String)::Vector{MemoryNode}
    lineage = MemoryNode[]
    current_id = node_id

    while current_id !== nothing && haskey(tree.nodes, current_id)
        node = tree.nodes[current_id]
        node.access_count += 1
        node.last_accessed = time_ns()
        push!(lineage, node)
        current_id = node.parent_id
    end

    return lineage
end

# ═══════════════════════════════════════════════════════════════════════════════
# BRANCHING
# ═══════════════════════════════════════════════════════════════════════════════

"""Fork a new branch from the current position."""
function fork_branch!(tree::MemoryTree, branch_name::String)::MemoryBranch
    current_head = tree.branches[tree.active_branch].head_id
    now = time_ns()

    new_branch = MemoryBranch(branch_name, current_head, 0, now)
    tree.branches[branch_name] = new_branch
    tree.active_branch = branch_name

    return new_branch
end

"""Consolidate a branch back into main by merging histories."""
function consolidate!(tree::MemoryTree, branch_name::String)
    !haskey(tree.branches, branch_name) && error("Branch '$branch_name' not found")
    branch_name == "main" && return

    # The branch nodes are already in the tree; just update main's head
    branch = tree.branches[branch_name]
    tree.branches["main"].head_id = branch.head_id
    tree.branches["main"].node_count += branch.node_count
    tree.active_branch = "main"

    # Remove branch reference
    delete!(tree.branches, branch_name)
end

# ═══════════════════════════════════════════════════════════════════════════════
# MAINTENANCE
# ═══════════════════════════════════════════════════════════════════════════════

"""Prune memories with low access count."""
function prune_inactive!(tree::MemoryTree; threshold::Int=PRUNE_THRESHOLD)::Int
    to_prune = String[]

    for (id, node) in tree.nodes
        id == "root" && continue
        if node.access_count < threshold && isempty(node.children_ids)
            push!(to_prune, id)
        end
    end

    for id in to_prune
        node = tree.nodes[id]
        # Remove from parent's children
        if node.parent_id !== nothing && haskey(tree.nodes, node.parent_id)
            filter!(c -> c != id, tree.nodes[node.parent_id].children_ids)
        end
        delete!(tree.nodes, id)
    end

    tree.total_prunes += length(to_prune)
    return length(to_prune)
end

# ═══════════════════════════════════════════════════════════════════════════════
# φ-ADDRESSING
# ═══════════════════════════════════════════════════════════════════════════════

"""Generate a φ-encoded spatial address for a given index."""
function phi_address(index::Int)::PhiCoordinate
    # Golden angle spacing for even distribution
    θ = index * 2.399963229728653  # Golden angle
    r = sqrt(Float64(index + 1)) * PHI_INVERSE

    x = r * cos(θ)
    y = r * sin(θ)
    z = Float64(index) * PHI_INVERSE  # Temporal depth
    radius = PHI_INVERSE^(mod(index, 5))

    return PhiCoordinate(x, y, z, radius, mod(θ, 2π))
end

"""Return memory tree metrics."""
function tree_metrics(tree::MemoryTree)::Dict{String, Any}
    return Dict{String, Any}(
        "total_nodes" => length(tree.nodes),
        "total_stores" => tree.total_stores,
        "total_prunes" => tree.total_prunes,
        "branches" => length(tree.branches),
        "active_branch" => tree.active_branch,
        "coordinate_counter" => tree.coordinate_counter
    )
end

end # module MemoryLineageProtocol
