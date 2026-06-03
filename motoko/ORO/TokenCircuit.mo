/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  TOKEN CIRCUIT BREAKER & FLOW CONTROL SYSTEM                                         ║
 * ║  "Circuitus Custos — Guardian of Token Flow"                                          ║
 * ║                                                                                        ║
 * ║  "Fluxus protegit. Coherentia servat. Organism vivit."                               ║
 * ║  (Flow protects. Coherence preserves. The organism lives.)                            ║
 * ║                                                                                        ║
 * ║  CIRCUIT BREAKER ARCHITECTURE:                                                        ║
 * ║    • #Closed  — Normal operation, all flows permitted                                 ║
 * ║    • #Open    — Circuit tripped, operations halted for protection                     ║
 * ║    • #HalfOpen — Testing phase, limited operations to verify recovery                 ║
 * ║                                                                                        ║
 * ║  FLOW GOVERNOR:                                                                        ║
 * ║    • φ-weighted rate limiting for token operations                                    ║
 * ║    • Energy distribution based on coherence levels                                    ║
 * ║    • Adaptive throttling during high-load periods                                     ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";

import T "Types";

module {

    // ════════════════════════════════════════════════════════════════════════
    // CONSTANTS — PHI-ENCODED CIRCUIT PARAMETERS
    // ════════════════════════════════════════════════════════════════════════

    /// Golden ratio
    public let PHI : Float = 1.618033988749895;
    
    /// Inverse golden ratio
    public let PHI_INVERSE : Float = 0.6180339887498949;
    
    /// φ-complement (used for baseline thresholds)
    public let PHI_COMPLEMENT : Float = 0.3819660112501051;
    
    /// Circuit breaker encoded identity
    public let CIRCUIT_ID : Text = "CIRCUIT.BREAKER.FLOW";
    
    /// Doctrine
    public let DOCTRINE : Text = "Fluxus protegit. Coherentia servat. Organism vivit.";
    public let DOCTRINE_EN : Text = "Flow protects. Coherence preserves. The organism lives.";

    /// Heartbeat intervals
    public let CIRCUIT_CHECK_NS : Int = 618_000_000;  // 618ms — φ-weighted check
    public let RECOVERY_WINDOW_NS : Int = 3_819_000_000; // 3.819s — φ-complement × 10s

    /// Thresholds
    public let COHERENCE_COLLAPSE_THRESHOLD : Float = 0.382;  // Below this = circuit opens
    public let ENERGY_CRITICAL_THRESHOLD : Float = 0.1;       // Below this = emergency halt
    public let ATTESTATION_FAILURE_LIMIT : Nat = 5;           // Consecutive failures to trip
    public let HALF_OPEN_TEST_LIMIT : Nat = 3;                // Tests before closing

    // ════════════════════════════════════════════════════════════════════════
    // CIRCUIT STATE — THE THREE STATES
    // ════════════════════════════════════════════════════════════════════════

    /// Circuit breaker state machine
    public type CircuitState = {
        #Closed;    // Normal operation — all flows permitted
        #Open;      // Circuit tripped — operations halted for protection
        #HalfOpen;  // Testing phase — limited operations to verify recovery
    };

    /// Reason for circuit trip
    public type TripReason = {
        #CoherenceCollapse;      // Token coherence fell below threshold
        #EnergyDepletion;        // Token energy critically low
        #AttestationFailure;     // Too many consecutive attestation failures
        #GovernanceHalt;         // Manual halt from governance decision
        #ResonanceDesync;        // Lost synchronization with organism
        #ExternalThreat;         // Detected external threat or anomaly
        #EvolutionInstability;   // Evolution cycle produced unstable state
        #MergeConflict;          // Conflicting merge operations detected
        #SplitCascade;           // Uncontrolled splitting detected
        #ManualOverride;         // Operator-initiated circuit break
    };

    // ════════════════════════════════════════════════════════════════════════
    // CIRCUIT BREAKER — CORE TYPE
    // ════════════════════════════════════════════════════════════════════════

    /// Circuit breaker protecting a sovereign token
    public type CircuitBreaker = {
        id : Text;                         // Breaker identifier
        tokenId : Text;                    // Token being protected
        state : CircuitState;              // Current circuit state
        
        // Trip history
        tripCount : Nat;                   // Total number of trips
        lastTrip : ?Int;                   // Timestamp of last trip
        lastTripReason : ?TripReason;      // Reason for last trip
        tripHistory : [TripRecord];        // Recent trip records
        
        // Recovery tracking
        recoveryAttempts : Nat;            // Attempts to close circuit
        successfulRecoveries : Nat;        // Times circuit successfully closed
        halfOpenTests : Nat;               // Tests performed in half-open state
        halfOpenSuccesses : Nat;           // Successful tests in half-open
        
        // Monitoring metrics
        coherenceReadings : [Float];       // Recent coherence values
        energyReadings : [Float];          // Recent energy values
        attestationFailures : Nat;         // Consecutive attestation failures
        lastHealthCheck : Int;             // Last health check timestamp
        
        // Configuration
        coherenceThreshold : Float;        // Custom coherence threshold
        energyThreshold : Float;           // Custom energy threshold
        autoRecovery : Bool;               // Whether to attempt auto-recovery
        
        // Timestamps
        createdAt : Int;
        lastStateChange : Int;
    };

    /// Record of a circuit trip event
    public type TripRecord = {
        tripId : Text;
        timestamp : Int;
        reason : TripReason;
        coherenceAtTrip : Float;
        energyAtTrip : Float;
        attestationFailuresAtTrip : Nat;
        recoveredAt : ?Int;
        recoveryMethod : ?Text;
    };

    // ════════════════════════════════════════════════════════════════════════
    // FLOW GOVERNOR — φ-WEIGHTED RATE LIMITING
    // ════════════════════════════════════════════════════════════════════════

    /// Flow control mode
    public type FlowMode = {
        #Normal;      // Full throughput allowed
        #Throttled;   // Reduced throughput (φ-inverse scaling)
        #Emergency;   // Minimal throughput (φ-complement scaling)
        #Halted;      // No throughput — waiting for recovery
    };

    /// Operation type for rate limiting
    public type OperationType = {
        #Transfer;
        #Merge;
        #Split;
        #Evolve;
        #Attest;
        #Governance;
        #Query;
    };

    /// Flow governor managing token operation rates
    public type FlowGovernor = {
        id : Text;
        tokenId : Text;
        mode : FlowMode;
        
        // Rate limits (operations per φ-interval)
        transferLimit : Nat;
        mergeLimit : Nat;
        splitLimit : Nat;
        evolveLimit : Nat;
        attestLimit : Nat;
        governanceLimit : Nat;
        
        // Current window counters
        transferCount : Nat;
        mergeCount : Nat;
        splitCount : Nat;
        evolveCount : Nat;
        attestCount : Nat;
        governanceCount : Nat;
        
        // Window tracking
        windowStart : Int;
        windowDuration : Int;  // φ-scaled window in nanoseconds
        
        // Energy distribution
        energyPool : Float;
        energyAllocationRate : Float;  // φ-weighted allocation per operation
        
        // Statistics
        totalOperations : Nat;
        throttledOperations : Nat;
        rejectedOperations : Nat;
        
        // Timestamps
        createdAt : Int;
        lastWindowReset : Int;
    };

    // ════════════════════════════════════════════════════════════════════════
    // CIRCUIT BREAKER FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /// Create a new circuit breaker for a token
    public func createBreaker(tokenId : Text) : CircuitBreaker {
        let now = Time.now();
        {
            id = "CB::" # tokenId;
            tokenId = tokenId;
            state = #Closed;
            
            tripCount = 0;
            lastTrip = null;
            lastTripReason = null;
            tripHistory = [];
            
            recoveryAttempts = 0;
            successfulRecoveries = 0;
            halfOpenTests = 0;
            halfOpenSuccesses = 0;
            
            coherenceReadings = [];
            energyReadings = [];
            attestationFailures = 0;
            lastHealthCheck = now;
            
            coherenceThreshold = COHERENCE_COLLAPSE_THRESHOLD;
            energyThreshold = ENERGY_CRITICAL_THRESHOLD;
            autoRecovery = true;
            
            createdAt = now;
            lastStateChange = now;
        }
    };

    /// Trip the circuit breaker (open the circuit)
    public func tripBreaker(breaker : CircuitBreaker, reason : TripReason, coherence : Float, energy : Float) : CircuitBreaker {
        let now = Time.now();
        let tripId = "TRIP::" # breaker.tokenId # "::" # Int.toText(now);
        
        let newRecord : TripRecord = {
            tripId = tripId;
            timestamp = now;
            reason = reason;
            coherenceAtTrip = coherence;
            energyAtTrip = energy;
            attestationFailuresAtTrip = breaker.attestationFailures;
            recoveredAt = null;
            recoveryMethod = null;
        };
        
        // Keep last 10 trip records
        let historyBuf = Buffer.fromArray<TripRecord>(breaker.tripHistory);
        historyBuf.add(newRecord);
        let newHistory = if (historyBuf.size() > 10) {
            Buffer.toArray(Buffer.subBuffer(historyBuf, historyBuf.size() - 10, 10));
        } else {
            Buffer.toArray(historyBuf);
        };
        
        {
            breaker with
            state = #Open;
            tripCount = breaker.tripCount + 1;
            lastTrip = ?now;
            lastTripReason = ?reason;
            tripHistory = newHistory;
            lastStateChange = now;
        }
    };

    /// Attempt to move from Open to HalfOpen (test mode)
    public func attemptRecovery(breaker : CircuitBreaker) : CircuitBreaker {
        let now = Time.now();
        switch (breaker.state) {
            case (#Open) {
                // Check if recovery window has elapsed
                switch (breaker.lastTrip) {
                    case (?tripTime) {
                        if (now - tripTime >= RECOVERY_WINDOW_NS) {
                            {
                                breaker with
                                state = #HalfOpen;
                                recoveryAttempts = breaker.recoveryAttempts + 1;
                                halfOpenTests = 0;
                                halfOpenSuccesses = 0;
                                lastStateChange = now;
                            }
                        } else {
                            breaker // Not ready yet
                        }
                    };
                    case null { breaker };
                };
            };
            case (_) { breaker }; // Already closed or half-open
        }
    };

    /// Record a test result in half-open state
    public func recordHalfOpenTest(breaker : CircuitBreaker, success : Bool) : CircuitBreaker {
        let now = Time.now();
        switch (breaker.state) {
            case (#HalfOpen) {
                let newTests = breaker.halfOpenTests + 1;
                let newSuccesses = if (success) { breaker.halfOpenSuccesses + 1 } else { breaker.halfOpenSuccesses };
                
                // Check if we should close or re-open
                if (not success) {
                    // Failed test — re-open circuit
                    tripBreaker(breaker, #CoherenceCollapse, 0.0, 0.0)
                } else if (newSuccesses >= HALF_OPEN_TEST_LIMIT) {
                    // Enough successful tests — close circuit
                    {
                        breaker with
                        state = #Closed;
                        halfOpenTests = newTests;
                        halfOpenSuccesses = newSuccesses;
                        successfulRecoveries = breaker.successfulRecoveries + 1;
                        attestationFailures = 0;
                        lastStateChange = now;
                    }
                } else {
                    // Continue testing
                    {
                        breaker with
                        halfOpenTests = newTests;
                        halfOpenSuccesses = newSuccesses;
                    }
                }
            };
            case (_) { breaker };
        }
    };

    /// Check if an operation should be permitted
    public func shouldPermitOperation(breaker : CircuitBreaker) : Bool {
        switch (breaker.state) {
            case (#Closed) { true };
            case (#HalfOpen) { breaker.halfOpenTests < HALF_OPEN_TEST_LIMIT };
            case (#Open) { false };
        }
    };

    /// Record health metrics and potentially trip breaker
    public func recordHealth(breaker : CircuitBreaker, coherence : Float, energy : Float, attestationFailed : Bool) : CircuitBreaker {
        let now = Time.now();
        
        // Update readings (keep last 10)
        let cohBuf = Buffer.fromArray<Float>(breaker.coherenceReadings);
        cohBuf.add(coherence);
        let newCoherence = if (cohBuf.size() > 10) {
            Buffer.toArray(Buffer.subBuffer(cohBuf, cohBuf.size() - 10, 10));
        } else {
            Buffer.toArray(cohBuf);
        };
        
        let enBuf = Buffer.fromArray<Float>(breaker.energyReadings);
        enBuf.add(energy);
        let newEnergy = if (enBuf.size() > 10) {
            Buffer.toArray(Buffer.subBuffer(enBuf, enBuf.size() - 10, 10));
        } else {
            Buffer.toArray(enBuf);
        };
        
        // Update attestation failures
        let newAttestationFailures = if (attestationFailed) {
            breaker.attestationFailures + 1
        } else {
            0 // Reset on success
        };
        
        // Check for trip conditions
        var updatedBreaker : CircuitBreaker = {
            breaker with
            coherenceReadings = newCoherence;
            energyReadings = newEnergy;
            attestationFailures = newAttestationFailures;
            lastHealthCheck = now;
        };
        
        // Only trip if currently closed
        switch (updatedBreaker.state) {
            case (#Closed) {
                if (coherence < breaker.coherenceThreshold) {
                    updatedBreaker := tripBreaker(updatedBreaker, #CoherenceCollapse, coherence, energy);
                } else if (energy < breaker.energyThreshold) {
                    updatedBreaker := tripBreaker(updatedBreaker, #EnergyDepletion, coherence, energy);
                } else if (newAttestationFailures >= ATTESTATION_FAILURE_LIMIT) {
                    updatedBreaker := tripBreaker(updatedBreaker, #AttestationFailure, coherence, energy);
                };
            };
            case (_) {};
        };
        
        updatedBreaker
    };

    // ════════════════════════════════════════════════════════════════════════
    // FLOW GOVERNOR FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════

    /// Create a new flow governor for a token
    public func createGovernor(tokenId : Text) : FlowGovernor {
        let now = Time.now();
        let phiWindow = Int.abs(Float.toInt(PHI * 1_000_000_000.0)); // φ seconds in ns
        
        {
            id = "FG::" # tokenId;
            tokenId = tokenId;
            mode = #Normal;
            
            // φ-scaled limits per window
            transferLimit = 100;      // Base operations
            mergeLimit = 5;           // More expensive
            splitLimit = 5;
            evolveLimit = 10;
            attestLimit = 20;
            governanceLimit = 3;
            
            transferCount = 0;
            mergeCount = 0;
            splitCount = 0;
            evolveCount = 0;
            attestCount = 0;
            governanceCount = 0;
            
            windowStart = now;
            windowDuration = phiWindow;
            
            energyPool = 1.0;
            energyAllocationRate = PHI_INVERSE; // Each operation costs φ⁻¹ of remaining
            
            totalOperations = 0;
            throttledOperations = 0;
            rejectedOperations = 0;
            
            createdAt = now;
            lastWindowReset = now;
        }
    };

    /// Get the effective limit based on flow mode
    public func getEffectiveLimit(governor : FlowGovernor, baseLimit : Nat) : Nat {
        switch (governor.mode) {
            case (#Normal) { baseLimit };
            case (#Throttled) { Int.abs(Float.toInt(Float.fromInt(baseLimit) * PHI_INVERSE)) };
            case (#Emergency) { Int.abs(Float.toInt(Float.fromInt(baseLimit) * PHI_COMPLEMENT)) };
            case (#Halted) { 0 };
        }
    };

    /// Check if operation is permitted and record it
    public func requestOperation(governor : FlowGovernor, opType : OperationType) : (FlowGovernor, Bool) {
        let now = Time.now();
        
        // Check if window needs reset
        var g = if (now - governor.windowStart >= governor.windowDuration) {
            {
                governor with
                transferCount = 0;
                mergeCount = 0;
                splitCount = 0;
                evolveCount = 0;
                attestCount = 0;
                governanceCount = 0;
                windowStart = now;
                lastWindowReset = now;
            }
        } else {
            governor
        };
        
        // Get current count and limit for operation type
        let (currentCount, baseLimit) : (Nat, Nat) = switch (opType) {
            case (#Transfer) { (g.transferCount, g.transferLimit) };
            case (#Merge) { (g.mergeCount, g.mergeLimit) };
            case (#Split) { (g.splitCount, g.splitLimit) };
            case (#Evolve) { (g.evolveCount, g.evolveLimit) };
            case (#Attest) { (g.attestCount, g.attestLimit) };
            case (#Governance) { (g.governanceCount, g.governanceLimit) };
            case (#Query) { (0, 1000) }; // Queries are nearly unlimited
        };
        
        let effectiveLimit = getEffectiveLimit(g, baseLimit);
        
        if (currentCount >= effectiveLimit) {
            // Reject operation
            ({
                g with
                rejectedOperations = g.rejectedOperations + 1;
            }, false)
        } else {
            // Permit and record
            let updatedG = switch (opType) {
                case (#Transfer) { { g with transferCount = g.transferCount + 1 } };
                case (#Merge) { { g with mergeCount = g.mergeCount + 1 } };
                case (#Split) { { g with splitCount = g.splitCount + 1 } };
                case (#Evolve) { { g with evolveCount = g.evolveCount + 1 } };
                case (#Attest) { { g with attestCount = g.attestCount + 1 } };
                case (#Governance) { { g with governanceCount = g.governanceCount + 1 } };
                case (#Query) { g };
            };
            
            ({
                updatedG with
                totalOperations = updatedG.totalOperations + 1;
            }, true)
        }
    };

    /// Set flow mode based on system conditions
    public func setFlowMode(governor : FlowGovernor, mode : FlowMode) : FlowGovernor {
        {
            governor with
            mode = mode;
        }
    };

    /// Allocate energy for an operation (returns remaining energy)
    public func allocateEnergy(governor : FlowGovernor, baseCost : Float) : (FlowGovernor, Bool) {
        let scaledCost = baseCost * governor.energyAllocationRate;
        
        if (governor.energyPool >= scaledCost) {
            ({
                governor with
                energyPool = governor.energyPool - scaledCost;
            }, true)
        } else {
            (governor, false)
        }
    };

    /// Replenish energy pool (called on organism heartbeat)
    public func replenishEnergy(governor : FlowGovernor, amount : Float) : FlowGovernor {
        let newPool = Float.min(1.0, governor.energyPool + amount * PHI_INVERSE);
        {
            governor with
            energyPool = newPool;
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // INTEGRATED CIRCUIT CONTROL
    // ════════════════════════════════════════════════════════════════════════

    /// Combined circuit state for a token
    public type TokenCircuit = {
        tokenId : Text;
        breaker : CircuitBreaker;
        governor : FlowGovernor;
        overallHealth : Float;          // 0.0 - 1.0 combined health score
        lastUpdate : Int;
    };

    /// Create integrated circuit control for a token
    public func createTokenCircuit(tokenId : Text) : TokenCircuit {
        let now = Time.now();
        {
            tokenId = tokenId;
            breaker = createBreaker(tokenId);
            governor = createGovernor(tokenId);
            overallHealth = 1.0;
            lastUpdate = now;
        }
    };

    /// Calculate overall health score
    public func calculateHealth(circuit : TokenCircuit, coherence : Float, energy : Float) : Float {
        // φ-weighted health formula
        let coherenceWeight = PHI_INVERSE;
        let energyWeight = PHI_COMPLEMENT;
        let circuitWeight = 1.0 - coherenceWeight - energyWeight;
        
        let circuitScore : Float = switch (circuit.breaker.state) {
            case (#Closed) { 1.0 };
            case (#HalfOpen) { PHI_INVERSE };
            case (#Open) { 0.0 };
        };
        
        coherence * coherenceWeight + energy * energyWeight + circuitScore * circuitWeight
    };

    /// Full circuit update with health recording and mode adjustment
    public func updateCircuit(circuit : TokenCircuit, coherence : Float, energy : Float, attestationFailed : Bool) : TokenCircuit {
        let now = Time.now();
        
        // Update breaker with health data
        let newBreaker = recordHealth(circuit.breaker, coherence, energy, attestationFailed);
        
        // Adjust governor mode based on circuit state
        let newGovernor = switch (newBreaker.state) {
            case (#Closed) {
                if (coherence < 0.5 or energy < 0.3) {
                    setFlowMode(circuit.governor, #Throttled)
                } else {
                    setFlowMode(circuit.governor, #Normal)
                }
            };
            case (#HalfOpen) { setFlowMode(circuit.governor, #Emergency) };
            case (#Open) { setFlowMode(circuit.governor, #Halted) };
        };
        
        let newHealth = calculateHealth({
            circuit with
            breaker = newBreaker;
            governor = newGovernor;
        }, coherence, energy);
        
        {
            circuit with
            breaker = newBreaker;
            governor = newGovernor;
            overallHealth = newHealth;
            lastUpdate = now;
        }
    };

    /// Request operation through circuit
    public func requestCircuitOperation(circuit : TokenCircuit, opType : OperationType) : (TokenCircuit, Bool) {
        // First check circuit breaker
        if (not shouldPermitOperation(circuit.breaker)) {
            (circuit, false)
        } else {
            // Then check flow governor
            let (newGovernor, permitted) = requestOperation(circuit.governor, opType);
            ({
                circuit with
                governor = newGovernor;
            }, permitted)
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // DIAGNOSTICS & REPORTING
    // ════════════════════════════════════════════════════════════════════════

    /// Circuit status report
    public type CircuitReport = {
        tokenId : Text;
        circuitState : Text;
        flowMode : Text;
        overallHealth : Float;
        tripCount : Nat;
        recoveryCount : Nat;
        totalOperations : Nat;
        rejectedOperations : Nat;
        energyPool : Float;
        coherenceThreshold : Float;
        lastTripReason : ?Text;
    };

    /// Generate circuit status report
    public func generateReport(circuit : TokenCircuit) : CircuitReport {
        let stateText = switch (circuit.breaker.state) {
            case (#Closed) { "CLOSED" };
            case (#Open) { "OPEN" };
            case (#HalfOpen) { "HALF_OPEN" };
        };
        
        let modeText = switch (circuit.governor.mode) {
            case (#Normal) { "NORMAL" };
            case (#Throttled) { "THROTTLED" };
            case (#Emergency) { "EMERGENCY" };
            case (#Halted) { "HALTED" };
        };
        
        let reasonText : ?Text = switch (circuit.breaker.lastTripReason) {
            case (?#CoherenceCollapse) { ?"COHERENCE_COLLAPSE" };
            case (?#EnergyDepletion) { ?"ENERGY_DEPLETION" };
            case (?#AttestationFailure) { ?"ATTESTATION_FAILURE" };
            case (?#GovernanceHalt) { ?"GOVERNANCE_HALT" };
            case (?#ResonanceDesync) { ?"RESONANCE_DESYNC" };
            case (?#ExternalThreat) { ?"EXTERNAL_THREAT" };
            case (?#EvolutionInstability) { ?"EVOLUTION_INSTABILITY" };
            case (?#MergeConflict) { ?"MERGE_CONFLICT" };
            case (?#SplitCascade) { ?"SPLIT_CASCADE" };
            case (?#ManualOverride) { ?"MANUAL_OVERRIDE" };
            case null { null };
        };
        
        {
            tokenId = circuit.tokenId;
            circuitState = stateText;
            flowMode = modeText;
            overallHealth = circuit.overallHealth;
            tripCount = circuit.breaker.tripCount;
            recoveryCount = circuit.breaker.successfulRecoveries;
            totalOperations = circuit.governor.totalOperations;
            rejectedOperations = circuit.governor.rejectedOperations;
            energyPool = circuit.governor.energyPool;
            coherenceThreshold = circuit.breaker.coherenceThreshold;
            lastTripReason = reasonText;
        }
    };
}
