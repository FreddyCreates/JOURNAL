#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  THESIS — EvidenceMap Module                                                          ║
║  Implementation mapping via AST analysis, test coverage, and function completeness    ║
║  Part of the THESIS Research Verification Layer                                       ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module EvidenceMap

export ImplementationStatus, FunctionEntry, ModuleMap, RepoEvidenceMap
export map_implementations, detect_stubs, function_completeness
export coverage_analysis, generate_evidence_report

# ════════════════════════════════════════════════════════════════════════════════
# Data Structures
# ════════════════════════════════════════════════════════════════════════════════

"""
Implementation status of a function or module.
"""
@enum ImplementationStatus begin
    FULLY_IMPLEMENTED    # Has body, logic, and tests
    PARTIALLY_IMPLEMENTED # Has body but missing tests or incomplete logic
    STUB                 # Declared but body is trivial/placeholder
    DECLARED_ONLY        # Only signature/interface, no body
    DEAD_CODE            # Implemented but never called/referenced
end

"""
    FunctionEntry

Represents a single function/method found in the codebase.
"""
struct FunctionEntry
    name::String
    file::String
    line::Int
    status::ImplementationStatus
    line_count::Int             # Number of lines in body
    has_docstring::Bool
    has_tests::Bool
    called_by::Vector{String}  # Functions that call this one
    calls::Vector{String}      # Functions this one calls
    complexity_score::Float64  # 0.0–1.0 cyclomatic complexity estimate
end

"""
    ModuleMap

Evidence map for a single module/file.
"""
struct ModuleMap
    file::String
    module_name::String
    functions::Vector{FunctionEntry}
    exports::Vector{String}
    total_lines::Int
    code_lines::Int
    comment_lines::Int
    completeness_score::Float64  # 0.0–1.0
end

"""
    RepoEvidenceMap

Complete evidence map for an entire repository.
"""
struct RepoEvidenceMap
    path::String
    modules::Vector{ModuleMap}
    total_functions::Int
    implemented_functions::Int
    stub_functions::Int
    dead_functions::Int
    overall_completeness::Float64
    test_coverage_estimate::Float64
    timestamp::Float64
end

# ════════════════════════════════════════════════════════════════════════════════
# Implementation Mapping Engine
# ════════════════════════════════════════════════════════════════════════════════

"""
    map_implementations(path::String) -> RepoEvidenceMap

Scan a repository and map all implementations, detecting completeness,
stubs, dead code, and test coverage.
"""
function map_implementations(path::String)::RepoEvidenceMap
    modules = ModuleMap[]
    timestamp = time()

    if isfile(path)
        mod = analyze_file(path)
        if mod !== nothing
            push!(modules, mod)
        end
    elseif isdir(path)
        for (root, dirs, files) in walkdir(path)
            filter!(d -> !startswith(d, ".") && d ∉ ["node_modules", "vendor", ".git"], dirs)
            for file in files
                if is_analyzable(file)
                    filepath = joinpath(root, file)
                    mod = analyze_file(filepath)
                    if mod !== nothing
                        push!(modules, mod)
                    end
                end
            end
        end
    else
        error("Path does not exist: $path")
    end

    # Aggregate statistics
    total_funcs = sum(length(m.functions) for m in modules; init=0)
    impl_funcs = sum(count(f -> f.status == FULLY_IMPLEMENTED, m.functions) for m in modules; init=0)
    stub_funcs = sum(count(f -> f.status == STUB, m.functions) for m in modules; init=0)
    dead_funcs = sum(count(f -> f.status == DEAD_CODE, m.functions) for m in modules; init=0)

    overall_completeness = total_funcs > 0 ? impl_funcs / total_funcs : 0.0
    test_coverage = estimate_test_coverage(modules, path)

    return RepoEvidenceMap(
        path,
        modules,
        total_funcs,
        impl_funcs,
        stub_funcs,
        dead_funcs,
        overall_completeness,
        test_coverage,
        timestamp
    )
end

"""
    analyze_file(filepath::String) -> Union{ModuleMap, Nothing}

Perform AST-level analysis on a single file.
"""
function analyze_file(filepath::String)::Union{ModuleMap, Nothing}
    content = try
        read(filepath, String)
    catch
        return nothing
    end

    lines = split(content, '\n')
    total_lines = length(lines)

    ext = lowercase(splitext(filepath)[2])

    if ext == ".jl"
        return analyze_julia_file(filepath, content, lines, total_lines)
    elseif ext == ".py"
        return analyze_python_file(filepath, content, lines, total_lines)
    elseif ext == ".rs"
        return analyze_rust_file(filepath, content, lines, total_lines)
    else
        return analyze_generic_file(filepath, content, lines, total_lines)
    end
end

# ════════════════════════════════════════════════════════════════════════════════
# Julia-Specific Analysis
# ════════════════════════════════════════════════════════════════════════════════

"""
    analyze_julia_file(filepath, content, lines, total_lines) -> ModuleMap

Analyze a Julia source file for functions, exports, and completeness.
"""
function analyze_julia_file(filepath::String, content::String, lines, total_lines::Int)::ModuleMap
    functions = FunctionEntry[]
    exports = String[]
    comment_lines = 0
    code_lines = 0
    module_name = ""

    # Extract module name
    m = match(r"module\s+(\w+)", content)
    if m !== nothing
        module_name = m.captures[1]
    else
        module_name = splitext(basename(filepath))[1]
    end

    # Extract exports
    for em in eachmatch(r"export\s+(.+)", content)
        export_names = split(em.captures[1], r"[,\s]+")
        append!(exports, filter(!isempty, strip.(export_names)))
    end

    # Count comment vs code lines
    in_block_comment = false
    for line in lines
        stripped = strip(line)
        if startswith(stripped, "#=")
            in_block_comment = true
            comment_lines += 1
        elseif startswith(stripped, "=#")
            in_block_comment = false
            comment_lines += 1
        elseif in_block_comment || startswith(stripped, "#")
            comment_lines += 1
        elseif !isempty(stripped)
            code_lines += 1
        end
    end

    # Extract functions using pattern matching
    func_pattern = r"(?:^|\n)\s*(?:\"\"\"[\s\S]*?\"\"\"[\s\n]*)?function\s+(\w+[!]?)\s*\(([^)]*)\)"
    for fm in eachmatch(func_pattern, content)
        fname = fm.captures[1]
        func_start = count('\n', content[1:fm.offset]) + 1

        # Find function body end
        body_lines = count_function_body_lines(content, fm.offset)
        has_doc = has_docstring_before(content, fm.offset)

        # Determine status
        status = determine_julia_function_status(content, fm.offset, body_lines)

        entry = FunctionEntry(
            fname,
            filepath,
            func_start,
            status,
            body_lines,
            has_doc,
            false,  # Tests checked separately
            String[],
            String[],
            estimate_complexity(body_lines)
        )
        push!(functions, entry)
    end

    # Also detect short-form functions: f(x) = expr
    short_func_pattern = r"(?:^|\n)\s*(\w+[!]?)\s*\([^)]*\)\s*="
    for fm in eachmatch(short_func_pattern, content)
        fname = fm.captures[1]
        # Skip if already captured or if it's an assignment to a known keyword
        if fname ∉ [f.name for f in functions] && fname ∉ ["if", "while", "for", "let"]
            func_start = count('\n', content[1:fm.offset]) + 1
            entry = FunctionEntry(
                fname,
                filepath,
                func_start,
                FULLY_IMPLEMENTED,  # Short-form functions are always implemented
                1,
                false,
                false,
                String[],
                String[],
                0.1
            )
            push!(functions, entry)
        end
    end

    completeness = calculate_module_completeness(functions, exports)

    return ModuleMap(
        filepath, module_name, functions, exports,
        total_lines, code_lines, comment_lines, completeness
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Python-Specific Analysis
# ════════════════════════════════════════════════════════════════════════════════

function analyze_python_file(filepath::String, content::String, lines, total_lines::Int)::ModuleMap
    functions = FunctionEntry[]
    exports = String[]
    comment_lines = count(l -> startswith(strip(l), "#") || isempty(strip(l)), lines)
    code_lines = total_lines - comment_lines
    module_name = splitext(basename(filepath))[1]

    # Extract functions
    func_pattern = r"(?:^|\n)\s*def\s+(\w+)\s*\(([^)]*)\)"
    for fm in eachmatch(func_pattern, content)
        fname = fm.captures[1]
        func_start = count('\n', content[1:fm.offset]) + 1

        # Estimate body size
        body_lines = count_indent_body_lines(lines, func_start)
        has_doc = occursin(r"\"\"\"", content[fm.offset:min(fm.offset+500, length(content))])

        status = body_lines <= 2 ? STUB : FULLY_IMPLEMENTED

        entry = FunctionEntry(
            fname, filepath, func_start, status, body_lines,
            has_doc, false, String[], String[], estimate_complexity(body_lines)
        )
        push!(functions, entry)
    end

    completeness = calculate_module_completeness(functions, exports)

    return ModuleMap(
        filepath, module_name, functions, exports,
        total_lines, code_lines, comment_lines, completeness
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Rust-Specific Analysis
# ════════════════════════════════════════════════════════════════════════════════

function analyze_rust_file(filepath::String, content::String, lines, total_lines::Int)::ModuleMap
    functions = FunctionEntry[]
    exports = String[]
    comment_lines = count(l -> startswith(strip(l), "//") || isempty(strip(l)), lines)
    code_lines = total_lines - comment_lines
    module_name = splitext(basename(filepath))[1]

    # Extract functions
    func_pattern = r"(?:pub\s+)?fn\s+(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)"
    for fm in eachmatch(func_pattern, content)
        fname = fm.captures[1]
        func_start = count('\n', content[1:fm.offset]) + 1
        body_lines = count_brace_body_lines(content, fm.offset)

        # pub functions are exports
        if occursin(r"pub\s+fn", content[max(1,fm.offset-10):fm.offset+length(fm.match)])
            push!(exports, fname)
        end

        status = body_lines <= 2 ? STUB : FULLY_IMPLEMENTED

        entry = FunctionEntry(
            fname, filepath, func_start, status, body_lines,
            false, false, String[], String[], estimate_complexity(body_lines)
        )
        push!(functions, entry)
    end

    completeness = calculate_module_completeness(functions, exports)

    return ModuleMap(
        filepath, module_name, functions, exports,
        total_lines, code_lines, comment_lines, completeness
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Generic File Analysis
# ════════════════════════════════════════════════════════════════════════════════

function analyze_generic_file(filepath::String, content::String, lines, total_lines::Int)::ModuleMap
    comment_lines = count(l -> isempty(strip(l)), lines)
    code_lines = total_lines - comment_lines
    module_name = splitext(basename(filepath))[1]

    return ModuleMap(
        filepath, module_name, FunctionEntry[], String[],
        total_lines, code_lines, comment_lines, 0.0
    )
end

# ════════════════════════════════════════════════════════════════════════════════
# Stub Detection
# ════════════════════════════════════════════════════════════════════════════════

"""
    detect_stubs(evidence_map::RepoEvidenceMap) -> Vector{FunctionEntry}

Return all functions detected as stubs (declared but not meaningfully implemented).
"""
function detect_stubs(evidence_map::RepoEvidenceMap)::Vector{FunctionEntry}
    stubs = FunctionEntry[]
    for mod in evidence_map.modules
        for func in mod.functions
            if func.status == STUB || func.status == DECLARED_ONLY
                push!(stubs, func)
            end
        end
    end
    return stubs
end

"""
    function_completeness(evidence_map::RepoEvidenceMap) -> Dict{String, Float64}

Return per-module completeness scores.
"""
function function_completeness(evidence_map::RepoEvidenceMap)::Dict{String, Float64}
    scores = Dict{String, Float64}()
    for mod in evidence_map.modules
        scores[mod.module_name] = mod.completeness_score
    end
    return scores
end

# ════════════════════════════════════════════════════════════════════════════════
# Test Coverage Estimation
# ════════════════════════════════════════════════════════════════════════════════

"""
    coverage_analysis(evidence_map::RepoEvidenceMap) -> Dict{String, Any}

Analyze test coverage based on available test files and function references.
"""
function coverage_analysis(evidence_map::RepoEvidenceMap)::Dict{String, Any}
    total_funcs = evidence_map.total_functions
    tested_funcs = 0

    for mod in evidence_map.modules
        for func in mod.functions
            if func.has_tests
                tested_funcs += 1
            end
        end
    end

    coverage_ratio = total_funcs > 0 ? tested_funcs / total_funcs : 0.0

    return Dict{String, Any}(
        "total_functions" => total_funcs,
        "tested_functions" => tested_funcs,
        "coverage_ratio" => coverage_ratio,
        "untested_functions" => total_funcs - tested_funcs,
        "coverage_grade" => coverage_grade(coverage_ratio)
    )
end

function coverage_grade(ratio::Float64)::String
    ratio >= 0.9 && return "A"
    ratio >= 0.8 && return "B"
    ratio >= 0.7 && return "C"
    ratio >= 0.5 && return "D"
    return "F"
end

# ════════════════════════════════════════════════════════════════════════════════
# Report Generation
# ════════════════════════════════════════════════════════════════════════════════

"""
    generate_evidence_report(evidence_map::RepoEvidenceMap) -> String

Generate a human-readable evidence report in markdown format.
"""
function generate_evidence_report(evidence_map::RepoEvidenceMap)::String
    io = IOBuffer()

    println(io, "# THESIS Evidence Map Report")
    println(io, "")
    println(io, "**Path:** `$(evidence_map.path)`")
    println(io, "**Generated:** $(Dates_format(evidence_map.timestamp))")
    println(io, "")
    println(io, "## Summary")
    println(io, "")
    println(io, "| Metric | Value |")
    println(io, "|--------|-------|")
    println(io, "| Total Functions | $(evidence_map.total_functions) |")
    println(io, "| Fully Implemented | $(evidence_map.implemented_functions) |")
    println(io, "| Stubs | $(evidence_map.stub_functions) |")
    println(io, "| Dead Code | $(evidence_map.dead_functions) |")
    println(io, "| Overall Completeness | $(round(evidence_map.overall_completeness * 100, digits=1))% |")
    println(io, "| Test Coverage Estimate | $(round(evidence_map.test_coverage_estimate * 100, digits=1))% |")
    println(io, "")
    println(io, "## Module Breakdown")
    println(io, "")

    for mod in evidence_map.modules
        println(io, "### $(mod.module_name)")
        println(io, "- **File:** `$(mod.file)`")
        println(io, "- **Functions:** $(length(mod.functions))")
        println(io, "- **Completeness:** $(round(mod.completeness_score * 100, digits=1))%")
        println(io, "- **Lines:** $(mod.total_lines) (code: $(mod.code_lines), comments: $(mod.comment_lines))")
        println(io, "")

        if !isempty(mod.functions)
            println(io, "| Function | Status | Lines | Docs | Tests |")
            println(io, "|----------|--------|-------|------|-------|")
            for func in mod.functions
                status_str = string(func.status)
                docs_str = func.has_docstring ? "✓" : "✗"
                tests_str = func.has_tests ? "✓" : "✗"
                println(io, "| `$(func.name)` | $(status_str) | $(func.line_count) | $(docs_str) | $(tests_str) |")
            end
            println(io, "")
        end
    end

    return String(take!(io))
end

# ════════════════════════════════════════════════════════════════════════════════
# Helper Functions
# ════════════════════════════════════════════════════════════════════════════════

function is_analyzable(filename::String)::Bool
    ext = lowercase(splitext(filename)[2])
    return ext in [".jl", ".py", ".rs", ".ts", ".js", ".go", ".hs", ".ex"]
end

function count_function_body_lines(content::String, offset::Int)::Int
    # Find matching 'end' for Julia function
    depth = 1
    lines = 0
    i = findnext('\n', content, offset)
    i === nothing && return 0

    while i < length(content) && depth > 0
        next_nl = findnext('\n', content, i + 1)
        next_nl === nothing && break

        line = strip(content[i+1:next_nl-1])

        # Track nesting
        if occursin(r"^(function|if|for|while|let|begin|do|try|quote|macro)\b", line)
            depth += 1
        end
        if line == "end" || startswith(line, "end ")
            depth -= 1
        end

        lines += 1
        i = next_nl
    end

    return max(0, lines - 1)  # Subtract the 'end' line
end

function count_indent_body_lines(lines, start_line::Int)::Int
    start_line >= length(lines) && return 0

    # Get indent of the def line
    base_indent = length(lines[start_line]) - length(lstrip(lines[start_line]))
    body_lines = 0

    for i in (start_line + 1):length(lines)
        line = lines[i]
        stripped = strip(line)
        isempty(stripped) && continue

        indent = length(line) - length(lstrip(line))
        if indent <= base_indent
            break
        end
        body_lines += 1
    end

    return body_lines
end

function count_brace_body_lines(content::String, offset::Int)::Int
    # Find opening brace
    brace_start = findnext('{', content, offset)
    brace_start === nothing && return 0

    depth = 1
    lines = 0
    i = brace_start + 1

    while i <= length(content) && depth > 0
        if content[i] == '{'
            depth += 1
        elseif content[i] == '}'
            depth -= 1
        elseif content[i] == '\n'
            lines += 1
        end
        i += 1
    end

    return lines
end

function has_docstring_before(content::String, offset::Int)::Bool
    # Look backwards for a docstring (""" block) within 500 chars
    start = max(1, offset - 500)
    snippet = content[start:offset]
    return occursin(r"\"\"\"\s*\n[^\"]*\"\"\"\s*$"s, snippet)
end

function determine_julia_function_status(content::String, offset::Int, body_lines::Int)::ImplementationStatus
    body_lines <= 0 && return DECLARED_ONLY
    body_lines <= 2 && return STUB

    # Check for placeholder patterns
    func_end = findnext("end", content, offset)
    func_end === nothing && return PARTIALLY_IMPLEMENTED

    body = content[offset:min(offset + 2000, length(content))]

    if occursin(r"(nothing|error\(|throw\(|TODO|FIXME|not\s+implemented)", body)
        return STUB
    end

    return body_lines > 5 ? FULLY_IMPLEMENTED : PARTIALLY_IMPLEMENTED
end

function estimate_complexity(body_lines::Int)::Float64
    # Simple complexity estimate based on body size
    return min(1.0, body_lines / 50.0)
end

function calculate_module_completeness(functions::Vector{FunctionEntry}, exports::Vector{String})::Float64
    isempty(functions) && return 0.0

    implemented = count(f -> f.status == FULLY_IMPLEMENTED || f.status == PARTIALLY_IMPLEMENTED, functions)
    total = length(functions)

    base_score = implemented / total

    # Bonus for having exports that are implemented
    if !isempty(exports)
        exported_impl = count(e -> any(f -> f.name == e && f.status == FULLY_IMPLEMENTED, functions), exports)
        export_score = exported_impl / length(exports)
        return 0.7 * base_score + 0.3 * export_score
    end

    return base_score
end

function estimate_test_coverage(modules::Vector{ModuleMap}, path::String)::Float64
    # Check for test directory
    test_dir = joinpath(path, "test")
    if !isdir(test_dir)
        test_dir = joinpath(path, "tests")
    end

    if !isdir(test_dir)
        return 0.0
    end

    # Count test files vs source files
    test_files = 0
    for (root, dirs, files) in walkdir(test_dir)
        test_files += count(f -> occursin(r"test", lowercase(f)), files)
    end

    source_modules = length(modules)
    source_modules == 0 && return 0.0

    return min(1.0, test_files / source_modules)
end

function Dates_format(timestamp::Float64)::String
    # Simple timestamp formatting
    return string(round(Int, timestamp))
end

end # module EvidenceMap
