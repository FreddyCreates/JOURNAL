{-|
Module      : PhiResonance
Description : φ-weighted calculations and Greek mathematics in Haskell
Copyright   : (c) Alfredo "Freddy" Medina Hernandez, 2026
License     : PROPRIETARY
Maintainer  : Medina Sovereign Intelligence

PHI RESONANCE — THE LIVING GOLDEN RATIO IN HASKELL

"φ resonat. Natura computat. Intelligentia emergit."
(Phi resonates. Nature computes. Intelligence emerges.)

High-performance Haskell implementation of:
  • φ-weighted mathematical operations
  • Fibonacci and Lucas sequences
  • Golden spiral geometry
  • Kuramoto oscillator synchronization
  • Greek mathematical constants
-}

{-# LANGUAGE BangPatterns #-}
{-# LANGUAGE ScopedTypeVariables #-}

module PhiResonance
  ( -- * Constants
    phi
  , phiInverse
  , phiComplement
  , phiSquared
  , goldenAngle
  , twoPi
    -- * Greek Constants
  , piGreek
  , tauGreek
  , eulerE
  , eulerMascheroni
    -- * Fibonacci & Lucas
  , fibonacci
  , fibonacciList
  , lucas
  , lucasList
  , fibonacciRatio
    -- * φ-Weighted Operations
  , phiWeight
  , phiNormalize
  , phiWeightedMean
  , phiWeightedSum
  , phiScale
    -- * Golden Geometry
  , goldenSpiralPoint
  , goldenSpiralSequence
  , sunflowerPattern
    -- * Oscillator Synchronization
  , coherenceFromPhases
  , orderParameter
    -- * Number Theory
  , isPrime
  , primeFactors
  , gcdEuclid
  , lcmPair
  , totient
  ) where

import Data.List (foldl')

-- ════════════════════════════════════════════════════════════════════════════════
-- PHI-ENCODED CONSTANTS
-- ════════════════════════════════════════════════════════════════════════════════

-- | Golden ratio φ = (1 + √5) / 2 ≈ 1.618033988749895
phi :: Double
phi = (1.0 + sqrt 5.0) / 2.0

-- | Inverse golden ratio φ⁻¹ = φ - 1 ≈ 0.618033988749895
phiInverse :: Double
phiInverse = phi - 1.0

-- | φ-complement = 1 - φ⁻¹ = 2 - φ ≈ 0.381966011250105
phiComplement :: Double
phiComplement = 2.0 - phi

-- | φ² = φ + 1 ≈ 2.618033988749895
phiSquared :: Double
phiSquared = phi + 1.0

-- | Golden angle in radians = 2π(2 - φ) ≈ 2.399963229728653
goldenAngle :: Double
goldenAngle = 2.0 * pi * phiComplement

-- | Two pi constant τ = 2π
twoPi :: Double
twoPi = 2.0 * pi

-- ════════════════════════════════════════════════════════════════════════════════
-- GREEK MATHEMATICAL CONSTANTS
-- ════════════════════════════════════════════════════════════════════════════════

-- | Pi (π) - ratio of circumference to diameter
piGreek :: Double
piGreek = pi

-- | Tau (τ) = 2π - ratio of circumference to radius
tauGreek :: Double
tauGreek = 2.0 * pi

-- | Euler's number e ≈ 2.718281828459045
eulerE :: Double
eulerE = exp 1.0

-- | Euler-Mascheroni constant γ ≈ 0.5772156649015329
eulerMascheroni :: Double
eulerMascheroni = 0.5772156649015329

-- ════════════════════════════════════════════════════════════════════════════════
-- FIBONACCI & LUCAS SEQUENCES
-- ════════════════════════════════════════════════════════════════════════════════

-- | Compute the n-th Fibonacci number using matrix exponentiation O(log n)
-- F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)
fibonacci :: Integer -> Integer
fibonacci n
  | n < 0     = error "fibonacci: negative argument"
  | n == 0    = 0
  | n == 1    = 1
  | otherwise = fst $ matrixPower (1, 1, 1, 0) n

-- | Generate list of first n Fibonacci numbers
fibonacciList :: Int -> [Integer]
fibonacciList n = take n fibs
  where
    fibs = 0 : 1 : zipWith (+) fibs (tail fibs)

-- | Compute F(n+1)/F(n), which converges to φ
fibonacciRatio :: Int -> Double
fibonacciRatio n
  | n < 1     = 1.0
  | otherwise = fromIntegral (fibonacci (toInteger n + 1)) / fromIntegral (fibonacci (toInteger n))

-- | Compute the n-th Lucas number
-- L(0) = 2, L(1) = 1, L(n) = L(n-1) + L(n-2)
lucas :: Integer -> Integer
lucas n
  | n < 0     = error "lucas: negative argument"
  | n == 0    = 2
  | n == 1    = 1
  | otherwise = go 2 1 (n - 1)
  where
    go !a !b 0 = b
    go !a !b k = go b (a + b) (k - 1)

-- | Generate list of first n Lucas numbers
lucasList :: Int -> [Integer]
lucasList n = take n luc
  where
    luc = 2 : 1 : zipWith (+) luc (tail luc)

-- Matrix exponentiation helper for Fibonacci
-- Matrix [[a,b],[c,d]] represented as (a,b,c,d)
matrixPower :: (Integer, Integer, Integer, Integer) -> Integer -> (Integer, Integer)
matrixPower _ 0 = (1, 0)
matrixPower m 1 = (fst4 m, snd4 m)
  where
    fst4 (a, _, _, _) = a
    snd4 (_, b, _, _) = b
matrixPower m n
  | even n    = matrixPower (matMult m m) (n `div` 2)
  | otherwise = let (a, b) = matrixPower m (n - 1)
                    (ma, mb, mc, _) = m
                in (ma * a + mb * b, mc * a + ma * b)
  where
    matMult (a1, b1, c1, d1) (a2, b2, c2, d2) =
      (a1*a2 + b1*c2, a1*b2 + b1*d2, c1*a2 + d1*c2, c1*b2 + d1*d2)

-- ════════════════════════════════════════════════════════════════════════════════
-- PHI-WEIGHTED OPERATIONS
-- ════════════════════════════════════════════════════════════════════════════════

-- | Apply φ-weighting to a value
-- Level 1: x × φ⁻¹, Level -1: x × φ
phiWeight :: Double -> Int -> Double
phiWeight x level = x * (phi ** fromIntegral (-level))

-- | Normalize a value to [0, 1] using φ-based sigmoid
-- σ_φ(x) = 1 / (1 + φ^(-x))
phiNormalize :: Double -> Double
phiNormalize x = 1.0 / (1.0 + phi ** (-x))

-- | Compute φ-weighted mean where weight_i = φ⁻ⁱ
phiWeightedMean :: [Double] -> Double
phiWeightedMean [] = 0.0
phiWeightedMean values = weightedSum / totalWeight
  where
    weights = [phiInverse ** fromIntegral i | i <- [0..length values - 1]]
    totalWeight = sum weights
    weightedSum = sum $ zipWith (*) values weights

-- | Compute sum with φ-inverse decay: Σ(v_i × φ⁻ⁱ)
phiWeightedSum :: [Double] -> Double
phiWeightedSum values = sum $ zipWith (*) values weights
  where
    weights = [phiInverse ** fromIntegral i | i <- [0..length values - 1]]

-- | Scale a vector of values with φ-weighted factors
phiScale :: [Double] -> Bool -> [Double]
phiScale values ascending =
  let n = length values
      weights = [phi ** (if ascending then fromIntegral (-i) else fromIntegral (n - i))
                | i <- [1..n]]
  in zipWith (*) values weights

-- ════════════════════════════════════════════════════════════════════════════════
-- GOLDEN SPIRAL GEOMETRY
-- ════════════════════════════════════════════════════════════════════════════════

-- | Compute (x, y) on golden spiral: r = φ^(2θ/π)
goldenSpiralPoint :: Double -> (Double, Double)
goldenSpiralPoint theta =
  let r = phi ** (2.0 * theta / pi)
  in (r * cos theta, r * sin theta)

-- | Generate n points along golden spiral
goldenSpiralSequence :: Int -> Double -> Double -> [(Double, Double)]
goldenSpiralSequence n startTheta step =
  [goldenSpiralPoint (startTheta + fromIntegral i * step) | i <- [0..n-1]]

-- | Generate sunflower/Fibonacci spiral pattern for optimal 2D packing
sunflowerPattern :: Int -> Double -> [(Double, Double)]
sunflowerPattern n radius =
  [ let r = radius * sqrt (fromIntegral i / fromIntegral n)
        theta = fromIntegral i * goldenAngle
    in (r * cos theta, r * sin theta)
  | i <- [1..n]
  ]

-- ════════════════════════════════════════════════════════════════════════════════
-- OSCILLATOR SYNCHRONIZATION (KURAMOTO-INSPIRED)
-- ════════════════════════════════════════════════════════════════════════════════

-- | Compute coherence (order parameter magnitude R) from oscillator phases
-- R = |⟨e^(iθ)⟩| = sqrt(⟨cos θ⟩² + ⟨sin θ⟩²)
coherenceFromPhases :: [Double] -> Double
coherenceFromPhases [] = 0.0
coherenceFromPhases phases =
  let n = fromIntegral $ length phases
      avgCos = sum (map cos phases) / n
      avgSin = sum (map sin phases) / n
  in sqrt (avgCos * avgCos + avgSin * avgSin)

-- | Compute Kuramoto order parameter R·e^(iΨ)
-- Returns (R, Ψ) where R is coherence and Ψ is mean phase
orderParameter :: [Double] -> (Double, Double)
orderParameter [] = (0.0, 0.0)
orderParameter phases =
  let n = fromIntegral $ length phases
      avgCos = sum (map cos phases) / n
      avgSin = sum (map sin phases) / n
      r = sqrt (avgCos * avgCos + avgSin * avgSin)
      psi = atan2 avgSin avgCos
  in (r, psi)

-- ════════════════════════════════════════════════════════════════════════════════
-- NUMBER THEORY
-- ════════════════════════════════════════════════════════════════════════════════

-- | Check if a number is prime
isPrime :: Integer -> Bool
isPrime n
  | n < 2     = False
  | n == 2    = True
  | even n    = False
  | otherwise = all (\d -> n `mod` d /= 0) [3, 5..isqrt n]
  where
    isqrt = floor . sqrt . fromIntegral

-- | Find prime factors of a number
primeFactors :: Integer -> [Integer]
primeFactors n
  | n <= 1    = []
  | otherwise = go n 2 []
  where
    go 1 _ acc = reverse acc
    go m d acc
      | m `mod` d == 0 = go (m `div` d) d (d : acc)
      | d * d > m      = reverse (m : acc)
      | d == 2         = go m 3 acc
      | otherwise      = go m (d + 2) acc

-- | Euclidean GCD algorithm
gcdEuclid :: Integer -> Integer -> Integer
gcdEuclid a 0 = abs a
gcdEuclid a b = gcdEuclid b (a `mod` b)

-- | Least common multiple of two numbers
lcmPair :: Integer -> Integer -> Integer
lcmPair a b = abs (a * b) `div` gcdEuclid a b

-- | Euler's totient function φ(n)
totient :: Integer -> Integer
totient n
  | n <= 0    = 0
  | n == 1    = 1
  | otherwise = foldl' (\acc p -> acc * (p - 1) * (p ^ (count p - 1))) 1 uniquePrimes
  where
    factors = primeFactors n
    uniquePrimes = unique factors
    count p = toInteger $ length $ filter (== p) factors
    unique [] = []
    unique (x:xs) = x : unique (filter (/= x) xs)
