{-|
Module      : AISBridge
Description : AI System Cross-Language Bridge Protocol
Copyright   : (c) Alfredo "Freddy" Medina Hernandez, 2026
License     : PROPRIETARY
Maintainer  : Medina Sovereign Intelligence

AIS BRIDGE — CROSS-LANGUAGE AI SYSTEM PROTOCOL

"Omnia Connectuntur" (All things are connected)

This module provides the bridge infrastructure for cross-language
communication between Haskell, Julia, Rust, and JavaScript components
of the Medina Sovereign Intelligence system.

Features:
  • Serializable message protocol
  • φ-weighted priority queuing
  • Language-agnostic type system
  • Synchronization primitives
-}

{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}

module AISBridge
  ( -- * Message Types
    AISMessage(..)
  , MessageType(..)
  , Language(..)
  , Priority(..)
    -- * Message Construction
  , createMessage
  , createPhiWeightedMessage
    -- * Priority Queue
  , PhiQueue
  , emptyQueue
  , enqueue
  , dequeue
  , queueLength
    -- * Language Bridge
  , LanguageBridge(..)
  , bridgeCapabilities
  , canCommunicate
    -- * Serialization
  , serializeMessage
  , deserializeMessage
    -- * Protocol Handlers
  , handlePing
  , handleCompute
  , handleSync
  ) where

import Data.List (sortBy)
import Data.Ord (comparing, Down(..))

import PhiResonance (phi, phiInverse, phiNormalize)

-- ════════════════════════════════════════════════════════════════════════════════
-- MESSAGE TYPES
-- ════════════════════════════════════════════════════════════════════════════════

-- | Supported programming languages in the system
data Language
  = Haskell
  | Julia
  | Rust
  | JavaScript
  | Motoko
  | Python
  | Unknown String
  deriving (Show, Eq, Ord)

-- | Message types for cross-language communication
data MessageType
  = Ping           -- Health check
  | Pong           -- Health response
  | Compute        -- Computation request
  | Result         -- Computation result
  | Sync           -- Synchronization
  | SyncAck        -- Sync acknowledgment
  | PhiState       -- φ-state update
  | Error          -- Error message
  deriving (Show, Eq, Ord)

-- | Priority levels (φ-weighted)
data Priority
  = Critical  -- φ² weight
  | High      -- φ weight
  | Normal    -- 1.0 weight
  | Low       -- φ⁻¹ weight
  | Background -- φ⁻² weight
  deriving (Show, Eq, Ord)

-- | Core AIS message structure
data AISMessage = AISMessage
  { msgId :: !String
  , msgType :: !MessageType
  , msgSource :: !Language
  , msgTarget :: !Language
  , msgPriority :: !Priority
  , msgPayload :: !String
  , msgTimestamp :: !Integer
  , msgPhiWeight :: !Double
  } deriving (Show, Eq)

-- ════════════════════════════════════════════════════════════════════════════════
-- MESSAGE CONSTRUCTION
-- ════════════════════════════════════════════════════════════════════════════════

-- | Create a new AIS message
createMessage :: String -> MessageType -> Language -> Language -> Priority -> String -> Integer -> AISMessage
createMessage mid mtype src tgt pri payload ts =
  AISMessage
    { msgId = mid
    , msgType = mtype
    , msgSource = src
    , msgTarget = tgt
    , msgPriority = pri
    , msgPayload = payload
    , msgTimestamp = ts
    , msgPhiWeight = priorityToWeight pri
    }

-- | Create a φ-weighted message with automatic weight calculation
createPhiWeightedMessage :: String -> MessageType -> Language -> Language -> String -> Integer -> Double -> AISMessage
createPhiWeightedMessage mid mtype src tgt payload ts importance =
  let pri = weightToPriority (phiNormalize importance)
  in AISMessage
    { msgId = mid
    , msgType = mtype
    , msgSource = src
    , msgTarget = tgt
    , msgPriority = pri
    , msgPayload = payload
    , msgTimestamp = ts
    , msgPhiWeight = phiNormalize importance
    }

-- | Convert priority to φ-based weight
priorityToWeight :: Priority -> Double
priorityToWeight Critical = phi * phi       -- 2.618
priorityToWeight High = phi                  -- 1.618
priorityToWeight Normal = 1.0
priorityToWeight Low = phiInverse            -- 0.618
priorityToWeight Background = phiInverse * phiInverse  -- 0.382

-- | Convert weight to priority
weightToPriority :: Double -> Priority
weightToPriority w
  | w > 2.0   = Critical
  | w > 1.3   = High
  | w > 0.8   = Normal
  | w > 0.5   = Low
  | otherwise = Background

-- ════════════════════════════════════════════════════════════════════════════════
-- PHI-WEIGHTED PRIORITY QUEUE
-- ════════════════════════════════════════════════════════════════════════════════

-- | φ-weighted priority queue
newtype PhiQueue = PhiQueue [AISMessage]
  deriving (Show)

-- | Create empty queue
emptyQueue :: PhiQueue
emptyQueue = PhiQueue []

-- | Enqueue a message (maintains φ-weighted order)
enqueue :: AISMessage -> PhiQueue -> PhiQueue
enqueue msg (PhiQueue msgs) =
  PhiQueue $ sortBy (comparing (Down . msgPhiWeight)) (msg : msgs)

-- | Dequeue highest priority message
dequeue :: PhiQueue -> Maybe (AISMessage, PhiQueue)
dequeue (PhiQueue []) = Nothing
dequeue (PhiQueue (x:xs)) = Just (x, PhiQueue xs)

-- | Get queue length
queueLength :: PhiQueue -> Int
queueLength (PhiQueue msgs) = length msgs

-- ════════════════════════════════════════════════════════════════════════════════
-- LANGUAGE BRIDGE
-- ════════════════════════════════════════════════════════════════════════════════

-- | Language bridge capabilities
data LanguageBridge = LanguageBridge
  { bridgeName :: !String
  , sourceLanguage :: !Language
  , targetLanguage :: !Language
  , supportedTypes :: ![MessageType]
  , bidirectional :: !Bool
  , latencyMs :: !Int
  } deriving (Show, Eq)

-- | Get capabilities of the Haskell bridge
bridgeCapabilities :: [LanguageBridge]
bridgeCapabilities =
  [ LanguageBridge "haskell-julia" Haskell Julia [Ping, Pong, Compute, Result, Sync, SyncAck, PhiState] True 10
  , LanguageBridge "haskell-rust" Haskell Rust [Ping, Pong, Compute, Result, Sync, SyncAck, PhiState] True 5
  , LanguageBridge "haskell-js" Haskell JavaScript [Ping, Pong, Compute, Result, Sync, SyncAck] True 15
  , LanguageBridge "haskell-motoko" Haskell Motoko [Sync, SyncAck, PhiState] True 100
  ]

-- | Check if two languages can communicate
canCommunicate :: Language -> Language -> Bool
canCommunicate src tgt
  | src == tgt = True
  | otherwise = any matchBridge bridgeCapabilities
  where
    matchBridge b =
      (sourceLanguage b == src && targetLanguage b == tgt) ||
      (bidirectional b && sourceLanguage b == tgt && targetLanguage b == src)

-- ════════════════════════════════════════════════════════════════════════════════
-- SERIALIZATION
-- ════════════════════════════════════════════════════════════════════════════════

-- | Serialize message to string (simple format)
serializeMessage :: AISMessage -> String
serializeMessage msg = unlines
  [ "AIS_MSG_V1"
  , "ID:" ++ msgId msg
  , "TYPE:" ++ show (msgType msg)
  , "SRC:" ++ show (msgSource msg)
  , "TGT:" ++ show (msgTarget msg)
  , "PRI:" ++ show (msgPriority msg)
  , "TS:" ++ show (msgTimestamp msg)
  , "PHI:" ++ show (msgPhiWeight msg)
  , "PAYLOAD:" ++ msgPayload msg
  , "END_MSG"
  ]

-- | Deserialize message from string (simple parser)
deserializeMessage :: String -> Maybe AISMessage
deserializeMessage input =
  let ls = lines input
  in if length ls < 10 || head ls /= "AIS_MSG_V1"
     then Nothing
     else Just $ AISMessage
       { msgId = extractField "ID:" ls
       , msgType = parseMessageType $ extractField "TYPE:" ls
       , msgSource = parseLanguage $ extractField "SRC:" ls
       , msgTarget = parseLanguage $ extractField "TGT:" ls
       , msgPriority = parsePriority $ extractField "PRI:" ls
       , msgPayload = extractField "PAYLOAD:" ls
       , msgTimestamp = read $ extractField "TS:" ls
       , msgPhiWeight = read $ extractField "PHI:" ls
       }
  where
    extractField prefix lns =
      let matching = filter (prefix `isPrefix`) lns
      in if null matching
         then ""
         else drop (length prefix) (head matching)
    isPrefix p s = take (length p) s == p

-- | Parse message type from string
parseMessageType :: String -> MessageType
parseMessageType "Ping" = Ping
parseMessageType "Pong" = Pong
parseMessageType "Compute" = Compute
parseMessageType "Result" = Result
parseMessageType "Sync" = Sync
parseMessageType "SyncAck" = SyncAck
parseMessageType "PhiState" = PhiState
parseMessageType _ = Error

-- | Parse language from string
parseLanguage :: String -> Language
parseLanguage "Haskell" = Haskell
parseLanguage "Julia" = Julia
parseLanguage "Rust" = Rust
parseLanguage "JavaScript" = JavaScript
parseLanguage "Motoko" = Motoko
parseLanguage "Python" = Python
parseLanguage s = Unknown s

-- | Parse priority from string
parsePriority :: String -> Priority
parsePriority "Critical" = Critical
parsePriority "High" = High
parsePriority "Normal" = Normal
parsePriority "Low" = Low
parsePriority _ = Background

-- ════════════════════════════════════════════════════════════════════════════════
-- PROTOCOL HANDLERS
-- ════════════════════════════════════════════════════════════════════════════════

-- | Handle ping message
handlePing :: AISMessage -> AISMessage
handlePing msg = createMessage
  (msgId msg ++ "-response")
  Pong
  (msgTarget msg)
  (msgSource msg)
  (msgPriority msg)
  "pong"
  (msgTimestamp msg + 1)

-- | Handle compute request (placeholder - actual computation depends on payload)
handleCompute :: AISMessage -> (String -> String) -> AISMessage
handleCompute msg computeFn = createMessage
  (msgId msg ++ "-result")
  Result
  (msgTarget msg)
  (msgSource msg)
  (msgPriority msg)
  (computeFn $ msgPayload msg)
  (msgTimestamp msg + 1)

-- | Handle sync message
handleSync :: AISMessage -> Double -> AISMessage
handleSync msg phiState = createPhiWeightedMessage
  (msgId msg ++ "-ack")
  SyncAck
  (msgTarget msg)
  (msgSource msg)
  (show phiState)
  (msgTimestamp msg + 1)
  phiState
