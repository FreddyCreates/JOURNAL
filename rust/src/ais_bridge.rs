//! AIS Bridge - Cross-Language AI System Protocol for Rust
//!
//! "Omnia Connectuntur" (All things are connected)
//!
//! This module provides the bridge infrastructure for cross-language
//! communication between Rust, Julia, Haskell, and JavaScript components
//! of the Medina Sovereign Intelligence system.
//!
//! Features:
//!   • Serializable message protocol
//!   • φ-weighted priority queuing
//!   • Language-agnostic type system
//!   • Zero-copy serialization where possible

use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::collections::BinaryHeap;

use crate::phi::{PHI, PHI_INVERSE};

/// Supported programming languages in the system
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Language {
    Rust,
    Julia,
    Haskell,
    JavaScript,
    Motoko,
    Python,
    Unknown,
}

impl Language {
    pub fn from_str(s: &str) -> Self {
        match s {
            "Rust" => Language::Rust,
            "Julia" => Language::Julia,
            "Haskell" => Language::Haskell,
            "JavaScript" => Language::JavaScript,
            "Motoko" => Language::Motoko,
            "Python" => Language::Python,
            _ => Language::Unknown,
        }
    }
}

/// Message types for cross-language communication
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum MessageType {
    Ping,       // Health check
    Pong,       // Health response
    Compute,    // Computation request
    Result,     // Computation result
    Sync,       // Synchronization
    SyncAck,    // Sync acknowledgment
    PhiState,   // φ-state update
    Error,      // Error message
}

impl MessageType {
    pub fn from_str(s: &str) -> Self {
        match s {
            "Ping" => MessageType::Ping,
            "Pong" => MessageType::Pong,
            "Compute" => MessageType::Compute,
            "Result" => MessageType::Result,
            "Sync" => MessageType::Sync,
            "SyncAck" => MessageType::SyncAck,
            "PhiState" => MessageType::PhiState,
            _ => MessageType::Error,
        }
    }
}

/// Priority levels (φ-weighted)
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum Priority {
    Background = 0, // φ⁻² weight
    Low = 1,        // φ⁻¹ weight
    Normal = 2,     // 1.0 weight
    High = 3,       // φ weight
    Critical = 4,   // φ² weight
}

impl Priority {
    /// Convert priority to φ-based weight
    pub fn to_weight(&self) -> f64 {
        match self {
            Priority::Critical => PHI * PHI,        // 2.618
            Priority::High => PHI,                  // 1.618
            Priority::Normal => 1.0,
            Priority::Low => PHI_INVERSE,           // 0.618
            Priority::Background => PHI_INVERSE * PHI_INVERSE, // 0.382
        }
    }

    /// Convert weight to priority
    pub fn from_weight(w: f64) -> Self {
        if w > 2.0 {
            Priority::Critical
        } else if w > 1.3 {
            Priority::High
        } else if w > 0.8 {
            Priority::Normal
        } else if w > 0.5 {
            Priority::Low
        } else {
            Priority::Background
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "Critical" => Priority::Critical,
            "High" => Priority::High,
            "Normal" => Priority::Normal,
            "Low" => Priority::Low,
            _ => Priority::Background,
        }
    }
}

/// Core AIS message structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AISMessage {
    pub id: String,
    pub msg_type: MessageType,
    pub source: Language,
    pub target: Language,
    pub priority: Priority,
    pub payload: String,
    pub timestamp: i64,
    pub phi_weight: f64,
}

impl AISMessage {
    /// Create a new AIS message
    pub fn new(
        id: String,
        msg_type: MessageType,
        source: Language,
        target: Language,
        priority: Priority,
        payload: String,
        timestamp: i64,
    ) -> Self {
        Self {
            id,
            msg_type,
            source,
            target,
            priority,
            payload,
            timestamp,
            phi_weight: priority.to_weight(),
        }
    }

    /// Create a φ-weighted message with automatic priority calculation
    pub fn new_phi_weighted(
        id: String,
        msg_type: MessageType,
        source: Language,
        target: Language,
        payload: String,
        timestamp: i64,
        importance: f64,
    ) -> Self {
        let phi_weight = phi_normalize(importance);
        let priority = Priority::from_weight(phi_weight);
        Self {
            id,
            msg_type,
            source,
            target,
            priority,
            payload,
            timestamp,
            phi_weight,
        }
    }

    /// Serialize message to string
    pub fn serialize(&self) -> String {
        format!(
            "AIS_MSG_V1\n\
             ID:{}\n\
             TYPE:{:?}\n\
             SRC:{:?}\n\
             TGT:{:?}\n\
             PRI:{:?}\n\
             TS:{}\n\
             PHI:{}\n\
             PAYLOAD:{}\n\
             END_MSG",
            self.id,
            self.msg_type,
            self.source,
            self.target,
            self.priority,
            self.timestamp,
            self.phi_weight,
            self.payload
        )
    }

    /// Deserialize message from string
    pub fn deserialize(input: &str) -> Option<Self> {
        let lines: Vec<&str> = input.lines().collect();
        if lines.len() < 10 || lines[0] != "AIS_MSG_V1" {
            return None;
        }

        let extract_field = |prefix: &str| -> String {
            for line in &lines {
                if line.starts_with(prefix) {
                    return line[prefix.len()..].to_string();
                }
            }
            String::new()
        };

        Some(Self {
            id: extract_field("ID:"),
            msg_type: MessageType::from_str(&extract_field("TYPE:")),
            source: Language::from_str(&extract_field("SRC:")),
            target: Language::from_str(&extract_field("TGT:")),
            priority: Priority::from_str(&extract_field("PRI:")),
            payload: extract_field("PAYLOAD:"),
            timestamp: extract_field("TS:").parse().unwrap_or(0),
            phi_weight: extract_field("PHI:").parse().unwrap_or(1.0),
        })
    }
}

/// φ-normalization function
fn phi_normalize(x: f64) -> f64 {
    1.0 / (1.0 + PHI.powf(-x))
}

/// Wrapper for priority queue ordering
#[derive(Debug, Clone)]
struct PhiQueueEntry(AISMessage);

impl PartialEq for PhiQueueEntry {
    fn eq(&self, other: &Self) -> bool {
        self.0.phi_weight == other.0.phi_weight
    }
}

impl Eq for PhiQueueEntry {}

impl PartialOrd for PhiQueueEntry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for PhiQueueEntry {
    fn cmp(&self, other: &Self) -> Ordering {
        // Sort by phi_weight descending
        self.0
            .phi_weight
            .partial_cmp(&other.0.phi_weight)
            .unwrap_or(Ordering::Equal)
    }
}

/// φ-weighted priority queue
#[derive(Debug)]
pub struct PhiQueue {
    heap: BinaryHeap<PhiQueueEntry>,
}

impl PhiQueue {
    pub fn new() -> Self {
        Self {
            heap: BinaryHeap::new(),
        }
    }

    pub fn enqueue(&mut self, msg: AISMessage) {
        self.heap.push(PhiQueueEntry(msg));
    }

    pub fn dequeue(&mut self) -> Option<AISMessage> {
        self.heap.pop().map(|e| e.0)
    }

    pub fn len(&self) -> usize {
        self.heap.len()
    }

    pub fn is_empty(&self) -> bool {
        self.heap.is_empty()
    }
}

impl Default for PhiQueue {
    fn default() -> Self {
        Self::new()
    }
}

/// Language bridge capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LanguageBridge {
    pub name: String,
    pub source: Language,
    pub target: Language,
    pub supported_types: Vec<MessageType>,
    pub bidirectional: bool,
    pub latency_ms: u32,
}

/// Get capabilities of the Rust bridge
pub fn bridge_capabilities() -> Vec<LanguageBridge> {
    vec![
        LanguageBridge {
            name: "rust-julia".to_string(),
            source: Language::Rust,
            target: Language::Julia,
            supported_types: vec![
                MessageType::Ping,
                MessageType::Pong,
                MessageType::Compute,
                MessageType::Result,
                MessageType::Sync,
                MessageType::SyncAck,
                MessageType::PhiState,
            ],
            bidirectional: true,
            latency_ms: 5,
        },
        LanguageBridge {
            name: "rust-haskell".to_string(),
            source: Language::Rust,
            target: Language::Haskell,
            supported_types: vec![
                MessageType::Ping,
                MessageType::Pong,
                MessageType::Compute,
                MessageType::Result,
                MessageType::Sync,
                MessageType::SyncAck,
                MessageType::PhiState,
            ],
            bidirectional: true,
            latency_ms: 8,
        },
        LanguageBridge {
            name: "rust-js".to_string(),
            source: Language::Rust,
            target: Language::JavaScript,
            supported_types: vec![
                MessageType::Ping,
                MessageType::Pong,
                MessageType::Compute,
                MessageType::Result,
            ],
            bidirectional: true,
            latency_ms: 3,
        },
        LanguageBridge {
            name: "rust-motoko".to_string(),
            source: Language::Rust,
            target: Language::Motoko,
            supported_types: vec![
                MessageType::Sync,
                MessageType::SyncAck,
                MessageType::PhiState,
            ],
            bidirectional: true,
            latency_ms: 100,
        },
    ]
}

/// Check if two languages can communicate
pub fn can_communicate(src: Language, tgt: Language) -> bool {
    if src == tgt {
        return true;
    }
    for bridge in bridge_capabilities() {
        if (bridge.source == src && bridge.target == tgt)
            || (bridge.bidirectional && bridge.source == tgt && bridge.target == src)
        {
            return true;
        }
    }
    false
}

/// Handle ping message
pub fn handle_ping(msg: &AISMessage) -> AISMessage {
    AISMessage::new(
        format!("{}-response", msg.id),
        MessageType::Pong,
        msg.target,
        msg.source,
        msg.priority,
        "pong".to_string(),
        msg.timestamp + 1,
    )
}

/// Handle sync message
pub fn handle_sync(msg: &AISMessage, phi_state: f64) -> AISMessage {
    AISMessage::new_phi_weighted(
        format!("{}-ack", msg.id),
        MessageType::SyncAck,
        msg.target,
        msg.source,
        phi_state.to_string(),
        msg.timestamp + 1,
        phi_state,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_message_creation() {
        let msg = AISMessage::new(
            "test-001".to_string(),
            MessageType::Ping,
            Language::Rust,
            Language::Julia,
            Priority::Normal,
            "hello".to_string(),
            12345,
        );
        assert_eq!(msg.id, "test-001");
        assert_eq!(msg.phi_weight, 1.0);
    }

    #[test]
    fn test_priority_weights() {
        assert!((Priority::Critical.to_weight() - 2.618).abs() < 0.01);
        assert!((Priority::High.to_weight() - 1.618).abs() < 0.01);
        assert_eq!(Priority::Normal.to_weight(), 1.0);
    }

    #[test]
    fn test_phi_queue() {
        let mut queue = PhiQueue::new();
        
        queue.enqueue(AISMessage::new(
            "low".to_string(),
            MessageType::Ping,
            Language::Rust,
            Language::Julia,
            Priority::Low,
            "".to_string(),
            0,
        ));
        
        queue.enqueue(AISMessage::new(
            "high".to_string(),
            MessageType::Ping,
            Language::Rust,
            Language::Julia,
            Priority::High,
            "".to_string(),
            0,
        ));
        
        // High priority should come out first
        let first = queue.dequeue().unwrap();
        assert_eq!(first.id, "high");
    }

    #[test]
    fn test_can_communicate() {
        assert!(can_communicate(Language::Rust, Language::Julia));
        assert!(can_communicate(Language::Julia, Language::Rust));
        assert!(can_communicate(Language::Rust, Language::Rust));
    }

    #[test]
    fn test_serialization() {
        let msg = AISMessage::new(
            "test-ser".to_string(),
            MessageType::Compute,
            Language::Rust,
            Language::Haskell,
            Priority::High,
            "compute_fibonacci(42)".to_string(),
            999,
        );
        
        let serialized = msg.serialize();
        assert!(serialized.contains("AIS_MSG_V1"));
        assert!(serialized.contains("test-ser"));
    }
}
