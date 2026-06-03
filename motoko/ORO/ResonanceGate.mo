/**
 * ╔════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  RESONANCE GATE — CROSS-TOKEN SYNCHRONIZATION BARRIERS                               ║
 * ║  "Porta Resonantiae — Gateway of Harmonic Alignment"                                  ║
 * ║                                                                                        ║
 * ║  "Harmonia vincit. Synchronia regnat. Unitas permanet."                              ║
 * ║  (Harmony conquers. Synchrony reigns. Unity endures.)                                 ║
 * ║                                                                                        ║
 * ║  RESONANCE GATES:                                                                     ║
 * ║    • Phase-locked barriers for coordinated token operations                           ║
 * ║    • Kuramoto-inspired oscillator synchronization                                     ║
 * ║    • φ-weighted coupling strength between token pairs                                 ║
 * ║    • Collective coherence emergence through resonance bonds                           ║
 * ║                                                                                        ║
 * ║  GATE TYPES:                                                                          ║
 * ║    • #Barrier   — All tokens must reach before any proceed                            ║
 * ║    • #Semaphore — N tokens can pass, others wait                                      ║
 * ║    • #Resonance — Tokens must achieve phase alignment to pass                         ║
 * ║    • #Cascade   — Sequential unlocking based on coherence                             ║
 * ║                                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL                         ║
 * ╚════════════════════════════════════════════════════════════════════════════════════════╝
 */

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";

import T "Types";

module {

    // ════════════════════════════════════════════════════════════════════════
    // CONSTANTS — PHI-ENCODED RESONANCE PARAMETERS
    // ════════════════════════════════════════════════════════════════════════

    /// Golden ratio
    public let PHI : Float = 1.618033988749895;
    
    /// Inverse golden ratio
    public let PHI_INVERSE : Float = 0.6180339887498949;
    
    /// Two-pi for oscillator calculations
    public let TWO_PI : Float = 6.283185307179586;
    
    /// Resonance gate encoded identity
    public let GATE_ID : Text = "RESONANCE.GATE.SYNC";
    
    /// Doctrine
    public let DOCTRINE : Text = "Harmonia vincit. Synchronia regnat. Unitas permanet.";
    public let DOCTRINE_EN : Text = "Harmony conquers. Synchrony reigns. Unity endures.";

    /// Synchronization thresholds
    public let PHASE_LOCK_THRESHOLD : Float = 0.95;     // Order parameter R for phase lock
    public let COHERENCE_BOND_THRESHOLD : Float = 0.8;  // Minimum coherence for bonding
    public let RESONANCE_COUPLING_K : Float = 1.618;    // φ-weighted Kuramoto coupling

    // ════════════════════════════════════════════════════════════════════════
    // GATE TYPES
    // ════════════════════════════════════════════════════════════════════════

    /// Types of synchronization gates
    public type GateType = {
        #Barrier;     // All tokens must reach before any proceed
        #Semaphore;   // N tokens can pass, others wait
        #Resonance;   // Tokens must achieve phase alignment to pass
        #Cascade;     // Sequential unlocking based on coherence
    };

    /// Gate state
    public type GateState = {
        #Open;        // Gate is open, tokens can pass
        #Closed;      // Gate is closed, tokens must wait
        #Aligning;    // Gate is in alignment phase
        #Cascading;   // Gate is sequentially releasing
    };

    // ════════════════════════════════════════════════════════════════════════
    // OSCILLATOR — KURAMOTO MODEL TOKEN REPRESENTATION
    // ════════════════════════════════════════════════════════════════════════

    /// Token oscillator for phase synchronization
    public type TokenOscillator = {
        tokenId : Text;
        phase : Float;              // Current phase θ ∈ [0, 2π)
        naturalFrequency : Float;   // Natural frequency ω
        coherence : Float;          // Token coherence (0-1)
        energy : Float;             // Token energy (0-1)
        lastUpdate : Int;
        pulseCount : Nat;
    };

    /// Create oscillator for a token
    public func createOscillator(tokenId : Text, coherence : Float, energy : Float) : TokenOscillator {
        let now = Time.now();
        // Initial phase based on token ID hash for deterministic but varied starting points
        let hashSum = Text.hash(tokenId);
        let initialPhase = Float.fromInt(Int.abs(hashSum)) / 4294967296.0 * TWO_PI;
        
        {
            tokenId = tokenId;
            phase = initialPhase;
            naturalFrequency = TWO_PI / (PHI * 1000.0); // φ-scaled frequency
            coherence = coherence;
            energy = energy;
            lastUpdate = now;
            pulseCount = 0;
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // RESONANCE BOND — TOKEN PAIR COUPLING
    // ════════════════════════════════════════════════════════════════════════

    /// Bond between two oscillating tokens
    public type ResonanceBond = {
        bondId : Text;
        tokenA : Text;
        tokenB : Text;
        couplingStrength : Float;   // K_ij coupling constant
        phaseOffset : Float;        // Desired phase difference
        bondCoherence : Float;      // How well synchronized (0-1)
        bondAge : Nat;              // Number of cycles bonded
        createdAt : Int;
    };

    /// Create a resonance bond between two tokens
    public func createBond(tokenA : Text, tokenB : Text) : ResonanceBond {
        let now = Time.now();
        let sortedIds = if (tokenA < tokenB) { [tokenA, tokenB] } else { [tokenB, tokenA] };
        let bondId = "BOND::" # sortedIds[0] # "::" # sortedIds[1];
        
        {
            bondId = bondId;
            tokenA = sortedIds[0];
            tokenB = sortedIds[1];
            couplingStrength = RESONANCE_COUPLING_K;
            phaseOffset = 0.0;  // In-phase synchronization by default
            bondCoherence = 0.0;
            bondAge = 0;
            createdAt = now;
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // RESONANCE GATE — MAIN TYPE
    // ════════════════════════════════════════════════════════════════════════

    /// Resonance gate for cross-token synchronization
    public type ResonanceGate = {
        gateId : Text;
        name : Text;
        gateType : GateType;
        state : GateState;
        
        // Participating tokens
        requiredTokens : [Text];    // Tokens that must participate
        arrivedTokens : [Text];     // Tokens that have arrived
        passedTokens : [Text];      // Tokens that have passed through
        
        // Oscillator state
        oscillators : [TokenOscillator];
        bonds : [ResonanceBond];
        
        // Synchronization metrics
        orderParameter : Float;     // Kuramoto R ∈ [0, 1]
        meanPhase : Float;          // Kuramoto Ψ (mean phase)
        collectiveCoherence : Float;
        
        // Gate configuration
        semaphoreLimit : Nat;       // For #Semaphore type
        cascadeOrder : [Text];      // For #Cascade type
        cascadeIndex : Nat;         // Current cascade position
        
        // Timing
        alignmentDeadline : ?Int;   // Optional deadline for alignment
        createdAt : Int;
        lastUpdate : Int;
        openedAt : ?Int;
        closedAt : ?Int;
    };

    /// Create a new resonance gate
    public func createGate(gateId : Text, name : Text, gateType : GateType, requiredTokens : [Text]) : ResonanceGate {
        let now = Time.now();
        {
            gateId = gateId;
            name = name;
            gateType = gateType;
            state = #Closed;
            
            requiredTokens = requiredTokens;
            arrivedTokens = [];
            passedTokens = [];
            
            oscillators = [];
            bonds = [];
            
            orderParameter = 0.0;
            meanPhase = 0.0;
            collectiveCoherence = 0.0;
            
            semaphoreLimit = 1;
            cascadeOrder = requiredTokens;
            cascadeIndex = 0;
            
            alignmentDeadline = null;
            createdAt = now;
            lastUpdate = now;
            openedAt = null;
            closedAt = null;
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // KURAMOTO MODEL CALCULATIONS
    // ════════════════════════════════════════════════════════════════════════

    /// Calculate Kuramoto order parameter R·e^(iΨ) = (1/N)·Σe^(iθ_j)
    public func calculateOrderParameter(oscillators : [TokenOscillator]) : (Float, Float) {
        let n = oscillators.size();
        if (n == 0) { return (0.0, 0.0) };
        
        var sumCos : Float = 0.0;
        var sumSin : Float = 0.0;
        
        for (osc in oscillators.vals()) {
            sumCos += Float.cos(osc.phase);
            sumSin += Float.sin(osc.phase);
        };
        
        let avgCos = sumCos / Float.fromInt(n);
        let avgSin = sumSin / Float.fromInt(n);
        
        let r = Float.sqrt(avgCos * avgCos + avgSin * avgSin);
        let psi = Float.arctan2(avgSin, avgCos);
        
        (r, psi)
    };

    /// Evolve oscillators using Kuramoto model: dθ_i = ω_i + (K/N)·Σ_j sin(θ_j - θ_i)
    public func evolveOscillators(oscillators : [TokenOscillator], bonds : [ResonanceBond], dt : Float) : [TokenOscillator] {
        let n = oscillators.size();
        if (n == 0) { return [] };
        
        let now = Time.now();
        let updates = Buffer.Buffer<TokenOscillator>(n);
        
        for (i in Iter.range(0, n - 1)) {
            let osc = oscillators[i];
            var coupling : Float = 0.0;
            
            // Sum coupling from all other oscillators
            for (j in Iter.range(0, n - 1)) {
                if (i != j) {
                    let other = oscillators[j];
                    var k = RESONANCE_COUPLING_K / Float.fromInt(n);
                    
                    // Check for bond-enhanced coupling
                    for (bond in bonds.vals()) {
                        if ((bond.tokenA == osc.tokenId and bond.tokenB == other.tokenId) or
                            (bond.tokenA == other.tokenId and bond.tokenB == osc.tokenId)) {
                            k *= PHI; // φ-enhanced bond coupling
                        };
                    };
                    
                    coupling += k * Float.sin(other.phase - osc.phase);
                };
            };
            
            // Update phase: θ' = θ + (ω + coupling) × dt
            var newPhase = osc.phase + (osc.naturalFrequency + coupling) * dt;
            
            // Wrap to [0, 2π)
            while (newPhase >= TWO_PI) { newPhase -= TWO_PI };
            while (newPhase < 0.0) { newPhase += TWO_PI };
            
            updates.add({
                osc with
                phase = newPhase;
                lastUpdate = now;
                pulseCount = osc.pulseCount + 1;
            });
        };
        
        Buffer.toArray(updates)
    };

    /// Calculate collective coherence from individual token coherences
    public func calculateCollectiveCoherence(oscillators : [TokenOscillator]) : Float {
        let n = oscillators.size();
        if (n == 0) { return 0.0 };
        
        var sumCoherence : Float = 0.0;
        for (osc in oscillators.vals()) {
            sumCoherence += osc.coherence;
        };
        
        sumCoherence / Float.fromInt(n)
    };

    // ════════════════════════════════════════════════════════════════════════
    // GATE OPERATIONS
    // ════════════════════════════════════════════════════════════════════════

    /// Register a token's arrival at the gate
    public func arriveAtGate(gate : ResonanceGate, tokenId : Text, coherence : Float, energy : Float) : ResonanceGate {
        let now = Time.now();
        
        // Check if token is required and hasn't arrived
        let isRequired = Array.find<Text>(gate.requiredTokens, func(t) { t == tokenId }) != null;
        let hasArrived = Array.find<Text>(gate.arrivedTokens, func(t) { t == tokenId }) != null;
        
        if (not isRequired or hasArrived) { return gate };
        
        // Add to arrived tokens
        let newArrived = Array.append<Text>(gate.arrivedTokens, [tokenId]);
        
        // Create oscillator for this token
        let newOsc = createOscillator(tokenId, coherence, energy);
        let newOscillators = Array.append<TokenOscillator>(gate.oscillators, [newOsc]);
        
        // Create bonds with all existing oscillators
        let bondBuf = Buffer.fromArray<ResonanceBond>(gate.bonds);
        for (existing in gate.oscillators.vals()) {
            bondBuf.add(createBond(tokenId, existing.tokenId));
        };
        
        // Recalculate order parameter
        let (r, psi) = calculateOrderParameter(newOscillators);
        let collective = calculateCollectiveCoherence(newOscillators);
        
        {
            gate with
            arrivedTokens = newArrived;
            oscillators = newOscillators;
            bonds = Buffer.toArray(bondBuf);
            orderParameter = r;
            meanPhase = psi;
            collectiveCoherence = collective;
            lastUpdate = now;
        }
    };

    /// Check if gate should open based on type and state
    public func shouldOpen(gate : ResonanceGate) : Bool {
        switch (gate.gateType) {
            case (#Barrier) {
                // All required tokens must have arrived
                gate.arrivedTokens.size() == gate.requiredTokens.size()
            };
            case (#Semaphore) {
                // At least one slot available
                gate.passedTokens.size() < gate.semaphoreLimit
            };
            case (#Resonance) {
                // Order parameter must exceed threshold
                gate.orderParameter >= PHASE_LOCK_THRESHOLD and
                gate.collectiveCoherence >= COHERENCE_BOND_THRESHOLD
            };
            case (#Cascade) {
                // Next token in cascade is ready
                gate.cascadeIndex < gate.cascadeOrder.size() and
                Array.find<Text>(gate.arrivedTokens, func(t) { 
                    t == gate.cascadeOrder[gate.cascadeIndex] 
                }) != null
            };
        }
    };

    /// Attempt to open the gate
    public func tryOpen(gate : ResonanceGate) : ResonanceGate {
        let now = Time.now();
        
        if (gate.state == #Open) { return gate };
        if (not shouldOpen(gate)) { return gate };
        
        {
            gate with
            state = #Open;
            openedAt = ?now;
            lastUpdate = now;
        }
    };

    /// Allow a token to pass through the gate
    public func passThrough(gate : ResonanceGate, tokenId : Text) : (ResonanceGate, Bool) {
        let now = Time.now();
        
        // Must be open and token must have arrived but not passed
        let hasArrived = Array.find<Text>(gate.arrivedTokens, func(t) { t == tokenId }) != null;
        let hasPassed = Array.find<Text>(gate.passedTokens, func(t) { t == tokenId }) != null;
        
        if (gate.state != #Open or not hasArrived or hasPassed) {
            return (gate, false);
        };
        
        // For cascade gates, must be next in order
        switch (gate.gateType) {
            case (#Cascade) {
                if (gate.cascadeIndex >= gate.cascadeOrder.size()) { return (gate, false) };
                if (gate.cascadeOrder[gate.cascadeIndex] != tokenId) { return (gate, false) };
            };
            case (_) {};
        };
        
        // Token passes through
        let newPassed = Array.append<Text>(gate.passedTokens, [tokenId]);
        
        // Update cascade index if applicable
        let newCascadeIndex = switch (gate.gateType) {
            case (#Cascade) { gate.cascadeIndex + 1 };
            case (_) { gate.cascadeIndex };
        };
        
        // Check if gate should close
        let allPassed = newPassed.size() == gate.requiredTokens.size();
        let semaphoreFull = gate.gateType == #Semaphore and newPassed.size() >= gate.semaphoreLimit;
        
        let newState = if (allPassed or semaphoreFull) { #Closed } else { gate.state };
        let newClosedAt = if (newState == #Closed) { ?now } else { gate.closedAt };
        
        ({
            gate with
            passedTokens = newPassed;
            cascadeIndex = newCascadeIndex;
            state = newState;
            closedAt = newClosedAt;
            lastUpdate = now;
        }, true)
    };

    /// Evolve gate oscillators by one time step
    public func tickGate(gate : ResonanceGate, dt : Float) : ResonanceGate {
        let now = Time.now();
        
        if (gate.oscillators.size() == 0) { return gate };
        
        // Evolve oscillators
        let newOscillators = evolveOscillators(gate.oscillators, gate.bonds, dt);
        
        // Recalculate metrics
        let (r, psi) = calculateOrderParameter(newOscillators);
        let collective = calculateCollectiveCoherence(newOscillators);
        
        // Update bond coherences
        let bondBuf = Buffer.Buffer<ResonanceBond>(gate.bonds.size());
        for (bond in gate.bonds.vals()) {
            // Find the two oscillators
            var phaseA : Float = 0.0;
            var phaseB : Float = 0.0;
            for (osc in newOscillators.vals()) {
                if (osc.tokenId == bond.tokenA) { phaseA := osc.phase };
                if (osc.tokenId == bond.tokenB) { phaseB := osc.phase };
            };
            
            // Bond coherence = cos(phase_difference)
            let phaseDiff = phaseA - phaseB - bond.phaseOffset;
            let bondCoh = (Float.cos(phaseDiff) + 1.0) / 2.0; // Map to [0, 1]
            
            bondBuf.add({
                bond with
                bondCoherence = bondCoh;
                bondAge = bond.bondAge + 1;
            });
        };
        
        // Determine state transitions
        var newState = gate.state;
        if (gate.state == #Closed and gate.gateType == #Resonance) {
            if (r >= PHASE_LOCK_THRESHOLD * 0.8) {
                newState := #Aligning;
            };
        };
        if (gate.state == #Aligning and gate.gateType == #Resonance) {
            if (r >= PHASE_LOCK_THRESHOLD) {
                newState := #Open;
            } else if (r < PHASE_LOCK_THRESHOLD * 0.5) {
                newState := #Closed; // Lost alignment
            };
        };
        
        {
            gate with
            oscillators = newOscillators;
            bonds = Buffer.toArray(bondBuf);
            orderParameter = r;
            meanPhase = psi;
            collectiveCoherence = collective;
            state = newState;
            openedAt = if (newState == #Open and gate.state != #Open) { ?now } else { gate.openedAt };
            lastUpdate = now;
        }
    };

    /// Reset gate for reuse
    public func resetGate(gate : ResonanceGate) : ResonanceGate {
        let now = Time.now();
        {
            gate with
            state = #Closed;
            arrivedTokens = [];
            passedTokens = [];
            oscillators = [];
            bonds = [];
            orderParameter = 0.0;
            meanPhase = 0.0;
            collectiveCoherence = 0.0;
            cascadeIndex = 0;
            openedAt = null;
            closedAt = null;
            lastUpdate = now;
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // GATE NETWORK — MULTIPLE COORDINATED GATES
    // ════════════════════════════════════════════════════════════════════════

    /// A network of interconnected resonance gates
    public type GateNetwork = {
        networkId : Text;
        name : Text;
        gates : [ResonanceGate];
        dependencies : [(Text, Text)];  // (gateA, gateB) = gateB depends on gateA
        globalOrderParameter : Float;
        networkCoherence : Float;
        createdAt : Int;
        lastUpdate : Int;
    };

    /// Create a gate network
    public func createNetwork(networkId : Text, name : Text) : GateNetwork {
        let now = Time.now();
        {
            networkId = networkId;
            name = name;
            gates = [];
            dependencies = [];
            globalOrderParameter = 0.0;
            networkCoherence = 0.0;
            createdAt = now;
            lastUpdate = now;
        }
    };

    /// Add a gate to the network
    public func addGateToNetwork(network : GateNetwork, gate : ResonanceGate) : GateNetwork {
        let now = Time.now();
        {
            network with
            gates = Array.append<ResonanceGate>(network.gates, [gate]);
            lastUpdate = now;
        }
    };

    /// Add a dependency between gates
    public func addDependency(network : GateNetwork, prerequisiteGateId : Text, dependentGateId : Text) : GateNetwork {
        let now = Time.now();
        {
            network with
            dependencies = Array.append<(Text, Text)>(network.dependencies, [(prerequisiteGateId, dependentGateId)]);
            lastUpdate = now;
        }
    };

    /// Tick all gates in the network
    public func tickNetwork(network : GateNetwork, dt : Float) : GateNetwork {
        let now = Time.now();
        
        let gateBuf = Buffer.Buffer<ResonanceGate>(network.gates.size());
        var totalR : Float = 0.0;
        var totalCoherence : Float = 0.0;
        
        for (gate in network.gates.vals()) {
            let updatedGate = tickGate(gate, dt);
            let finalGate = tryOpen(updatedGate);
            gateBuf.add(finalGate);
            totalR += finalGate.orderParameter;
            totalCoherence += finalGate.collectiveCoherence;
        };
        
        let n = Float.fromInt(network.gates.size());
        let globalR = if (n > 0.0) { totalR / n } else { 0.0 };
        let globalCoh = if (n > 0.0) { totalCoherence / n } else { 0.0 };
        
        {
            network with
            gates = Buffer.toArray(gateBuf);
            globalOrderParameter = globalR;
            networkCoherence = globalCoh;
            lastUpdate = now;
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // DIAGNOSTICS
    // ════════════════════════════════════════════════════════════════════════

    /// Gate status report
    public type GateReport = {
        gateId : Text;
        name : Text;
        gateType : Text;
        state : Text;
        arrivedCount : Nat;
        requiredCount : Nat;
        passedCount : Nat;
        orderParameter : Float;
        collectiveCoherence : Float;
        bondCount : Nat;
        isReady : Bool;
    };

    /// Generate gate status report
    public func generateGateReport(gate : ResonanceGate) : GateReport {
        let typeText = switch (gate.gateType) {
            case (#Barrier) { "BARRIER" };
            case (#Semaphore) { "SEMAPHORE" };
            case (#Resonance) { "RESONANCE" };
            case (#Cascade) { "CASCADE" };
        };
        
        let stateText = switch (gate.state) {
            case (#Open) { "OPEN" };
            case (#Closed) { "CLOSED" };
            case (#Aligning) { "ALIGNING" };
            case (#Cascading) { "CASCADING" };
        };
        
        {
            gateId = gate.gateId;
            name = gate.name;
            gateType = typeText;
            state = stateText;
            arrivedCount = gate.arrivedTokens.size();
            requiredCount = gate.requiredTokens.size();
            passedCount = gate.passedTokens.size();
            orderParameter = gate.orderParameter;
            collectiveCoherence = gate.collectiveCoherence;
            bondCount = gate.bonds.size();
            isReady = shouldOpen(gate);
        }
    };
}
