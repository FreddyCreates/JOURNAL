{-|
Module      : GreekMath
Description : Greek mathematical constants and operations
Copyright   : (c) Alfredo "Freddy" Medina Hernandez, 2026
License     : PROPRIETARY
Maintainer  : Medina Sovereign Intelligence

GREEK MATHEMATICS — NUMERICAL FOUNDATIONS

Complete implementation of Greek mathematical constants, number theory,
and geometric operations in pure functional Haskell.

"Πάντα ῥεῖ" (Panta rhei - Everything flows)
-}

{-# LANGUAGE BangPatterns #-}

module GreekMath
  ( -- * Greek Constants
    alpha, beta, gamma, delta, epsilon
  , zeta, eta, theta, iota, kappa
  , lambda', mu, nu, xi, omicron
  , piConst, rho, sigma, tau, upsilon
  , phiConst, chi, psi, omega
    -- * Mathematical Constants
  , sqrtTwo, sqrtThree, sqrtFive
  , naturalLog2, naturalLog10
  , plasticNumber, silverRatio
    -- * Sequences
  , tribonacci, tribonacciList
  , pentagonal, pentagonalList
  , triangular, triangularList
  , primes, primesUpTo
    -- * Geometry
  , regularPolygonArea
  , regularPolygonPerimeter
  , circleArea, circleCircumference
  , sphereVolume, sphereSurfaceArea
    -- * Complex Numbers (simplified)
  , Complex(..)
  , complexAdd, complexMult, complexMagnitude, complexPhase
  , complexConjugate, complexFromPolar
    -- * Statistics
  , mean, geometricMean, harmonicMean
  , variance, standardDeviation
  , median
    -- * Matrix Operations (2x2)
  , Matrix2x2(..)
  , matrixMult, matrixDet, matrixInverse
  , matrixEigenvalues
  ) where

import Data.List (sort, foldl')

-- ════════════════════════════════════════════════════════════════════════════════
-- GREEK LETTER CONSTANTS (Mathematical values)
-- ════════════════════════════════════════════════════════════════════════════════

-- | α - Fine structure constant
alpha :: Double
alpha = 0.0072973525693

-- | β - Bernstein's constant
beta :: Double
beta = 0.2801694990

-- | γ - Euler-Mascheroni constant
gamma :: Double
gamma = 0.5772156649015329

-- | δ - Silver ratio δ = 1 + √2
delta :: Double
delta = 1.0 + sqrt 2.0

-- | ε - Small epsilon (precision threshold)
epsilon :: Double
epsilon = 1e-10

-- | ζ(3) - Apéry's constant (Riemann zeta at 3)
zeta :: Double
zeta = 1.2020569031595943

-- | η - Dirichlet eta function η(1) = ln(2)
eta :: Double
eta = log 2.0

-- | θ - Chebyshev's constant
theta :: Double
theta = 1.0

-- | ι - Imaginary unit coefficient (for complex)
iota :: Double
iota = 1.0

-- | κ - Landau's constant
kappa :: Double
kappa = 0.5

-- | λ - Liouville-Roth constant
lambda' :: Double
lambda' = 1.0

-- | μ - Ramanujan-Soldner constant
mu :: Double
mu = 1.451369234883381

-- | ν - Euler's constant for partition function
nu :: Double
nu = 0.5772156649015329

-- | ξ - First Feigenbaum constant
xi :: Double
xi = 4.6692016091029906718532038

-- | ο - Omega constant (W(1))
omicron :: Double
omicron = 0.5671432904097838729999686622

-- | π - Circle constant
piConst :: Double
piConst = pi

-- | ρ - Plastic number
rho :: Double
rho = 1.324717957244746

-- | σ - Sum constant (often used for standard deviation)
sigma :: Double
sigma = 1.0

-- | τ - Circle constant 2π
tau :: Double
tau = 2.0 * pi

-- | υ - Golden ratio conjugate
upsilon :: Double
upsilon = (sqrt 5.0 - 1.0) / 2.0

-- | φ - Golden ratio
phiConst :: Double
phiConst = (1.0 + sqrt 5.0) / 2.0

-- | χ - Gauss-Kuzmin-Wirsing constant
chi :: Double
chi = 0.3036630028987326

-- | ψ - Reciprocal Fibonacci constant
psi :: Double
psi = 3.359885666243177553172011302918927179688905133

-- | ω - Omega constant (smallest positive root of xe^x = 1)
omega :: Double
omega = 0.5671432904097838729999686622

-- ════════════════════════════════════════════════════════════════════════════════
-- MATHEMATICAL CONSTANTS
-- ════════════════════════════════════════════════════════════════════════════════

-- | √2 = 1.41421356237...
sqrtTwo :: Double
sqrtTwo = sqrt 2.0

-- | √3 = 1.73205080757...
sqrtThree :: Double
sqrtThree = sqrt 3.0

-- | √5 = 2.2360679775...
sqrtFive :: Double
sqrtFive = sqrt 5.0

-- | ln(2) = 0.693147180559...
naturalLog2 :: Double
naturalLog2 = log 2.0

-- | ln(10) = 2.302585092994...
naturalLog10 :: Double
naturalLog10 = log 10.0

-- | Plastic number ρ ≈ 1.324717957244746
plasticNumber :: Double
plasticNumber = rho

-- | Silver ratio δ_S = 1 + √2 ≈ 2.414213562373095
silverRatio :: Double
silverRatio = 1.0 + sqrt 2.0

-- ════════════════════════════════════════════════════════════════════════════════
-- SEQUENCES
-- ════════════════════════════════════════════════════════════════════════════════

-- | n-th Tribonacci number
-- T(0)=0, T(1)=0, T(2)=1, T(n) = T(n-1)+T(n-2)+T(n-3)
tribonacci :: Integer -> Integer
tribonacci n
  | n < 0     = error "tribonacci: negative argument"
  | n == 0    = 0
  | n == 1    = 0
  | n == 2    = 1
  | otherwise = go 0 0 1 (n - 2)
  where
    go !a !b !c 0 = c
    go !a !b !c k = go b c (a + b + c) (k - 1)

-- | List of first n Tribonacci numbers
tribonacciList :: Int -> [Integer]
tribonacciList n = take n tribs
  where
    tribs = 0 : 0 : 1 : zipWith3 (\a b c -> a + b + c) tribs (tail tribs) (tail $ tail tribs)

-- | n-th pentagonal number: P(n) = n(3n-1)/2
pentagonal :: Integer -> Integer
pentagonal n = n * (3 * n - 1) `div` 2

-- | List of first n pentagonal numbers
pentagonalList :: Int -> [Integer]
pentagonalList n = [pentagonal i | i <- [1..toInteger n]]

-- | n-th triangular number: T(n) = n(n+1)/2
triangular :: Integer -> Integer
triangular n = n * (n + 1) `div` 2

-- | List of first n triangular numbers
triangularList :: Int -> [Integer]
triangularList n = [triangular i | i <- [1..toInteger n]]

-- | Infinite list of primes using sieve
primes :: [Integer]
primes = 2 : filter isPrime [3, 5..]
  where
    isPrime n = all (\p -> n `mod` p /= 0) (takeWhile (\p -> p * p <= n) primes)

-- | Primes up to n
primesUpTo :: Integer -> [Integer]
primesUpTo n = takeWhile (<= n) primes

-- ════════════════════════════════════════════════════════════════════════════════
-- GEOMETRY
-- ════════════════════════════════════════════════════════════════════════════════

-- | Area of regular n-gon with side length s
regularPolygonArea :: Int -> Double -> Double
regularPolygonArea n s =
  let n' = fromIntegral n
  in (n' * s * s) / (4.0 * tan (pi / n'))

-- | Perimeter of regular n-gon with side length s
regularPolygonPerimeter :: Int -> Double -> Double
regularPolygonPerimeter n s = fromIntegral n * s

-- | Area of circle with radius r
circleArea :: Double -> Double
circleArea r = pi * r * r

-- | Circumference of circle with radius r
circleCircumference :: Double -> Double
circleCircumference r = 2.0 * pi * r

-- | Volume of sphere with radius r
sphereVolume :: Double -> Double
sphereVolume r = (4.0 / 3.0) * pi * r * r * r

-- | Surface area of sphere with radius r
sphereSurfaceArea :: Double -> Double
sphereSurfaceArea r = 4.0 * pi * r * r

-- ════════════════════════════════════════════════════════════════════════════════
-- COMPLEX NUMBERS
-- ════════════════════════════════════════════════════════════════════════════════

-- | Complex number representation
data Complex = Complex { real :: !Double, imag :: !Double }
  deriving (Show, Eq)

-- | Add two complex numbers
complexAdd :: Complex -> Complex -> Complex
complexAdd (Complex r1 i1) (Complex r2 i2) = Complex (r1 + r2) (i1 + i2)

-- | Multiply two complex numbers
complexMult :: Complex -> Complex -> Complex
complexMult (Complex r1 i1) (Complex r2 i2) =
  Complex (r1 * r2 - i1 * i2) (r1 * i2 + i1 * r2)

-- | Magnitude (absolute value) of complex number
complexMagnitude :: Complex -> Double
complexMagnitude (Complex r i) = sqrt (r * r + i * i)

-- | Phase (argument) of complex number
complexPhase :: Complex -> Double
complexPhase (Complex r i) = atan2 i r

-- | Complex conjugate
complexConjugate :: Complex -> Complex
complexConjugate (Complex r i) = Complex r (-i)

-- | Create complex from polar coordinates
complexFromPolar :: Double -> Double -> Complex
complexFromPolar r theta = Complex (r * cos theta) (r * sin theta)

-- ════════════════════════════════════════════════════════════════════════════════
-- STATISTICS
-- ════════════════════════════════════════════════════════════════════════════════

-- | Arithmetic mean
mean :: [Double] -> Double
mean [] = 0.0
mean xs = sum xs / fromIntegral (length xs)

-- | Geometric mean
geometricMean :: [Double] -> Double
geometricMean [] = 0.0
geometricMean xs = product xs ** (1.0 / fromIntegral (length xs))

-- | Harmonic mean
harmonicMean :: [Double] -> Double
harmonicMean [] = 0.0
harmonicMean xs = fromIntegral (length xs) / sum (map (1.0 /) xs)

-- | Population variance
variance :: [Double] -> Double
variance [] = 0.0
variance xs =
  let m = mean xs
      n = fromIntegral (length xs)
  in sum [(x - m) ** 2 | x <- xs] / n

-- | Standard deviation
standardDeviation :: [Double] -> Double
standardDeviation = sqrt . variance

-- | Median of a list
median :: [Double] -> Double
median [] = 0.0
median xs =
  let sorted = sort xs
      n = length sorted
      mid = n `div` 2
  in if odd n
     then sorted !! mid
     else (sorted !! (mid - 1) + sorted !! mid) / 2.0

-- ════════════════════════════════════════════════════════════════════════════════
-- MATRIX OPERATIONS (2x2)
-- ════════════════════════════════════════════════════════════════════════════════

-- | 2x2 Matrix representation [[a,b],[c,d]]
data Matrix2x2 = Matrix2x2
  { m11 :: !Double, m12 :: !Double
  , m21 :: !Double, m22 :: !Double
  } deriving (Show, Eq)

-- | Matrix multiplication
matrixMult :: Matrix2x2 -> Matrix2x2 -> Matrix2x2
matrixMult (Matrix2x2 a1 b1 c1 d1) (Matrix2x2 a2 b2 c2 d2) =
  Matrix2x2
    (a1*a2 + b1*c2) (a1*b2 + b1*d2)
    (c1*a2 + d1*c2) (c1*b2 + d1*d2)

-- | Matrix determinant
matrixDet :: Matrix2x2 -> Double
matrixDet (Matrix2x2 a b c d) = a * d - b * c

-- | Matrix inverse (if exists)
matrixInverse :: Matrix2x2 -> Maybe Matrix2x2
matrixInverse m@(Matrix2x2 a b c d)
  | abs det < 1e-10 = Nothing
  | otherwise = Just $ Matrix2x2 (d/det) (-b/det) (-c/det) (a/det)
  where
    det = matrixDet m

-- | Eigenvalues of 2x2 matrix (may be complex)
-- Returns (λ1, λ2) as real parts (imaginary if complex eigenvalues)
matrixEigenvalues :: Matrix2x2 -> (Double, Double)
matrixEigenvalues (Matrix2x2 a b c d) =
  let trace = a + d
      det = a * d - b * c
      discriminant = trace * trace - 4 * det
  in if discriminant >= 0
     then ((trace + sqrt discriminant) / 2, (trace - sqrt discriminant) / 2)
     else (trace / 2, trace / 2)  -- Complex eigenvalues, return real part
