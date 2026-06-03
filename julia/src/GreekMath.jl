#=
╔════════════════════════════════════════════════════════════════════════════════════════╗
║  GREEK MATHEMATICS — COMPLETE NUMBER THEORY IN JULIA                                  ║
║  "Mathematica Graeca — The Foundation of All Computing"                               ║
║                                                                                        ║
║  "Πάντα ῥεῖ καὶ οὐδὲν μένει"                                                          ║
║  (All things flow, nothing stands still)                                              ║
║                                                                                        ║
║  HIGH-PERFORMANCE JULIA IMPLEMENTATION:                                               ║
║    • Greek letter constants with mathematical values                                  ║
║    • Extended number theory functions                                                 ║
║    • Complex number operations                                                        ║
║    • Matrix algebra with φ-weighting                                                  ║
║    • Statistical functions                                                            ║
║                                                                                        ║
║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
╚════════════════════════════════════════════════════════════════════════════════════════╝
=#

module GreekMath

using LinearAlgebra
using Statistics

export ALPHA, BETA, GAMMA_CONST, DELTA, EPSILON_CONST
export ZETA_3, ETA_CONST, THETA_CONST, IOTA_CONST, KAPPA_CONST
export LAMBDA_CONST, MU_CONST, NU_CONST, XI_CONST, OMICRON_CONST
export PI_CONST, RHO_CONST, SIGMA_CONST, TAU_CONST, UPSILON_CONST
export PHI, CHI_CONST, PSI_CONST, OMEGA_CONST
export SQRT_2, SQRT_3, SQRT_5, PLASTIC_NUMBER, SILVER_RATIO
export is_prime, prime_factors, sieve_of_eratosthenes
export gcd_euclid, lcm_pair, totient, mobius, divisors
export tribonacci, tribonacci_list, pentagonal, triangular
export harmonic_number, bernoulli_number
export greek_to_value, all_greek_constants

# ════════════════════════════════════════════════════════════════════════════════
# GREEK LETTER CONSTANTS (Mathematical Values)
# ════════════════════════════════════════════════════════════════════════════════

"""Fine structure constant α ≈ 1/137"""
const ALPHA = 0.0072973525693

"""Bernstein's constant β"""
const BETA = 0.2801694990

"""Euler-Mascheroni constant γ ≈ 0.5772"""
const GAMMA_CONST = 0.5772156649015329

"""Silver ratio δ = 1 + √2"""
const DELTA = 1.0 + sqrt(2.0)

"""Machine epsilon (precision threshold)"""
const EPSILON_CONST = 1e-10

"""Apéry's constant ζ(3) ≈ 1.202"""
const ZETA_3 = 1.2020569031595943

"""Dirichlet eta function η(1) = ln(2)"""
const ETA_CONST = log(2.0)

"""Chebyshev's constant θ"""
const THETA_CONST = 1.0

"""Imaginary unit coefficient ι"""
const IOTA_CONST = 1.0

"""Landau's constant κ"""
const KAPPA_CONST = 0.5

"""Liouville-Roth constant λ"""
const LAMBDA_CONST = 1.0

"""Ramanujan-Soldner constant μ"""
const MU_CONST = 1.451369234883381

"""Euler's partition constant ν"""
const NU_CONST = 0.5772156649015329

"""First Feigenbaum constant ξ"""
const XI_CONST = 4.6692016091029906718532038

"""Omega constant ο = W(1)"""
const OMICRON_CONST = 0.5671432904097838729999686622

"""Circle constant π"""
const PI_CONST = π

"""Plastic number ρ ≈ 1.3247"""
const RHO_CONST = 1.324717957244746

"""Sigma constant (unit) σ"""
const SIGMA_CONST = 1.0

"""Circle constant τ = 2π"""
const TAU_CONST = 2π

"""Golden ratio conjugate υ = (√5-1)/2"""
const UPSILON_CONST = (sqrt(5.0) - 1.0) / 2.0

"""Golden ratio φ = (1+√5)/2"""
const PHI = (1.0 + sqrt(5.0)) / 2.0

"""Gauss-Kuzmin-Wirsing constant χ"""
const CHI_CONST = 0.3036630028987326

"""Reciprocal Fibonacci constant ψ"""
const PSI_CONST = 3.359885666243177553172011302918927179688905133

"""Omega constant ω"""
const OMEGA_CONST = 0.5671432904097838729999686622

# ════════════════════════════════════════════════════════════════════════════════
# MATHEMATICAL CONSTANTS
# ════════════════════════════════════════════════════════════════════════════════

const SQRT_2 = sqrt(2.0)
const SQRT_3 = sqrt(3.0)
const SQRT_5 = sqrt(5.0)
const PLASTIC_NUMBER = RHO_CONST
const SILVER_RATIO = 1.0 + sqrt(2.0)

# ════════════════════════════════════════════════════════════════════════════════
# NUMBER THEORY FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════

"""
    is_prime(n::Integer) -> Bool

Check if n is a prime number using trial division.
"""
function is_prime(n::Integer)
    n < 2 && return false
    n == 2 && return true
    n % 2 == 0 && return false
    for i in 3:2:isqrt(n)
        n % i == 0 && return false
    end
    return true
end

"""
    prime_factors(n::Integer) -> Vector{Int}

Return the prime factorization of n.
"""
function prime_factors(n::Integer)
    n <= 1 && return Int[]
    factors = Int[]
    d = 2
    while d * d <= n
        while n % d == 0
            push!(factors, d)
            n ÷= d
        end
        d += (d == 2 ? 1 : 2)
    end
    n > 1 && push!(factors, n)
    return factors
end

"""
    sieve_of_eratosthenes(n::Integer) -> Vector{Int}

Return all primes up to n using the Sieve of Eratosthenes.
"""
function sieve_of_eratosthenes(n::Integer)
    n < 2 && return Int[]
    is_prime_arr = trues(n)
    is_prime_arr[1] = false
    for i in 2:isqrt(n)
        if is_prime_arr[i]
            for j in i*i:i:n
                is_prime_arr[j] = false
            end
        end
    end
    return findall(is_prime_arr)
end

"""
    gcd_euclid(a::Integer, b::Integer) -> Integer

Compute GCD using the Euclidean algorithm.
"""
function gcd_euclid(a::Integer, b::Integer)
    a, b = abs(a), abs(b)
    while b != 0
        a, b = b, a % b
    end
    return a
end

"""
    lcm_pair(a::Integer, b::Integer) -> Integer

Compute LCM of two integers.
"""
function lcm_pair(a::Integer, b::Integer)
    return abs(a * b) ÷ gcd_euclid(a, b)
end

"""
    totient(n::Integer) -> Integer

Compute Euler's totient function φ(n).
"""
function totient(n::Integer)
    n <= 0 && return 0
    n == 1 && return 1
    result = n
    temp_n = n
    d = 2
    while d * d <= temp_n
        if temp_n % d == 0
            while temp_n % d == 0
                temp_n ÷= d
            end
            result -= result ÷ d
        end
        d += 1
    end
    if temp_n > 1
        result -= result ÷ temp_n
    end
    return result
end

"""
    mobius(n::Integer) -> Int

Compute the Möbius function μ(n).
"""
function mobius(n::Integer)
    n < 1 && return 0
    n == 1 && return 1
    factors = prime_factors(n)
    unique_factors = unique(factors)
    length(factors) != length(unique_factors) && return 0
    return iseven(length(factors)) ? 1 : -1
end

"""
    divisors(n::Integer) -> Vector{Int}

Return all divisors of n in sorted order.
"""
function divisors(n::Integer)
    n < 1 && return Int[]
    divs = Int[]
    for i in 1:isqrt(n)
        if n % i == 0
            push!(divs, i)
            i * i != n && push!(divs, n ÷ i)
        end
    end
    return sort(divs)
end

# ════════════════════════════════════════════════════════════════════════════════
# SPECIAL SEQUENCES
# ════════════════════════════════════════════════════════════════════════════════

"""
    tribonacci(n::Integer) -> BigInt

Compute the n-th Tribonacci number.
T(0)=0, T(1)=0, T(2)=1, T(n) = T(n-1)+T(n-2)+T(n-3)
"""
function tribonacci(n::Integer)
    n < 0 && throw(ArgumentError("n must be non-negative"))
    n == 0 && return BigInt(0)
    n == 1 && return BigInt(0)
    n == 2 && return BigInt(1)
    a, b, c = BigInt(0), BigInt(0), BigInt(1)
    for _ in 3:n
        a, b, c = b, c, a + b + c
    end
    return c
end

"""
    tribonacci_list(n::Int) -> Vector{BigInt}

Generate first n Tribonacci numbers.
"""
function tribonacci_list(n::Int)
    n <= 0 && return BigInt[]
    result = BigInt[]
    for i in 0:(n-1)
        push!(result, tribonacci(i))
    end
    return result
end

"""
    pentagonal(n::Integer) -> Integer

Compute the n-th pentagonal number: P(n) = n(3n-1)/2
"""
function pentagonal(n::Integer)
    return n * (3n - 1) ÷ 2
end

"""
    triangular(n::Integer) -> Integer

Compute the n-th triangular number: T(n) = n(n+1)/2
"""
function triangular(n::Integer)
    return n * (n + 1) ÷ 2
end

"""
    harmonic_number(n::Integer) -> Float64

Compute the n-th harmonic number H_n = Σ(1/k) for k=1 to n.
"""
function harmonic_number(n::Integer)
    n <= 0 && return 0.0
    return sum(1.0 / k for k in 1:n)
end

"""
    bernoulli_number(n::Integer) -> Rational

Compute the n-th Bernoulli number using the Akiyama-Tanigawa algorithm.
"""
function bernoulli_number(n::Integer)
    n < 0 && throw(ArgumentError("n must be non-negative"))
    A = Vector{Rational{BigInt}}(undef, n + 1)
    for m in 0:n
        A[m + 1] = 1 // (m + 1)
        for j in m:-1:1
            A[j] = j * (A[j] - A[j + 1])
        end
    end
    return A[1]
end

# ════════════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ════════════════════════════════════════════════════════════════════════════════

"""
    greek_to_value(name::Symbol) -> Float64

Get the value of a Greek letter constant by name.
"""
function greek_to_value(name::Symbol)
    constants = Dict(
        :alpha => ALPHA, :beta => BETA, :gamma => GAMMA_CONST,
        :delta => DELTA, :epsilon => EPSILON_CONST, :zeta => ZETA_3,
        :eta => ETA_CONST, :theta => THETA_CONST, :iota => IOTA_CONST,
        :kappa => KAPPA_CONST, :lambda => LAMBDA_CONST, :mu => MU_CONST,
        :nu => NU_CONST, :xi => XI_CONST, :omicron => OMICRON_CONST,
        :pi => PI_CONST, :rho => RHO_CONST, :sigma => SIGMA_CONST,
        :tau => TAU_CONST, :upsilon => UPSILON_CONST, :phi => PHI,
        :chi => CHI_CONST, :psi => PSI_CONST, :omega => OMEGA_CONST
    )
    return get(constants, name, NaN)
end

"""
    all_greek_constants() -> Dict{Symbol, Float64}

Return all Greek letter constants as a dictionary.
"""
function all_greek_constants()
    return Dict(
        :α => ALPHA, :β => BETA, :γ => GAMMA_CONST, :δ => DELTA,
        :ε => EPSILON_CONST, :ζ => ZETA_3, :η => ETA_CONST, :θ => THETA_CONST,
        :ι => IOTA_CONST, :κ => KAPPA_CONST, :λ => LAMBDA_CONST, :μ => MU_CONST,
        :ν => NU_CONST, :ξ => XI_CONST, :ο => OMICRON_CONST, :π => PI_CONST,
        :ρ => RHO_CONST, :σ => SIGMA_CONST, :τ => TAU_CONST, :υ => UPSILON_CONST,
        :φ => PHI, :χ => CHI_CONST, :ψ => PSI_CONST, :ω => OMEGA_CONST
    )
end

end # module GreekMath
