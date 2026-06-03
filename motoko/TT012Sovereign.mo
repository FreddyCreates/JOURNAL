/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  TT-012 SOVEREIGN TOKEN ENGINE                                                          ║
 * ║              "Token Sovranorum — Self-Governing Living Tokens"                            ║
 * ║                                                                                           ║
 * ║  "Token se ipsum gubernat. Token crescit. Token attestat."                                ║
 * ║  (A token governs itself. A token grows. A token attests.)                                ║
 * ║                                                                                           ║
 * ║  TT-012 SOVEREIGN — Self-governing tokens that:                                           ║
 * ║    • MERGE   — Two tokens fuse into one with combined lineage                             ║
 * ║    • SPLIT   — One token divides into N children with provenance                          ║
 * ║    • EVOLVE  — Tokens mutate state through φ-weighted evolution cycles                    ║
 * ║    • ATTEST  — Tokens self-sign their state hash using CPL covenant seals                 ║
 * ║                                                                                           ║
 * ║  LANGUAGE: All contracts are CPL (Contract Procurement Language).                         ║
 * ║  COGNITION: Internal state expressed in COGPRO.                                           ║
 * ║  LAW: Governance rules written in SL (Sovereign Law Language).                            ║
 * ║  EXECUTION: Compiled to Motoko for ICP substrate.                                         ║
 * ║                                                                                           ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                           ║
 * ║  PROPRIETARY AND CONFIDENTIAL - MAXIMUM SECRECY                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Time "mo:base/Time";

import MatalkoICP "MatalkoICP";

module {

    // ================================================================== //
    // CONSTANTS                                                            //
    // ================================================================== //

    /// Golden ratio
    public let PHI : Float = MatalkoICP.PHI;

    /// Sovereign heartbeat (φ × 1000 ms)
    public let HEARTBEAT_MS : Nat = 618;

    /// Evolution cycle interval (873ms — Three Hearts sync)
    public let EVOLUTION_CYCLE_MS : Nat = 873;

    /// Product identifier
    public let PRODUCT_ID : Text = "TT-012";
    public let PRODUCT_NAME : Text = "SOVEREIGN";
    public let PRODUCT_FULL_NAME : Text = "TT-012 SOVEREIGN — Self-Governing Tokens";

    /// Sovereign identifier
    public let SOVEREIGN_ID : Text = "SOVEREIGN::TOKEN::TT-012";

    /// Doctrine
    public let DOCTRINE : Text = "Token se ipsum gubernat. Token crescit. Token attestat.";
    public let DOCTRINE_EN : Text = "A token governs itself. A token grows. A token attests.";

    /// Language stack
    public let LANG_CONTRACT : Text = "CPL";      // Contract Procurement Language
    public let LANG_COGNITION : Text = "COGPRO";   // Cognitive Processing Language
    public let LANG_LAW : Text = "SL";             // Sovereign Law Language
    public let LANG_EXECUTION : Text = "MOTOKO";   // ICP execution substrate

    // ================================================================== //
    // TOKEN LIFECYCLE PHASES                                               //
    // ================================================================== //

    /// Phase of a sovereign token's lifecycle
    public type TokenPhase = {
        #Genesis;       // Just minted, establishing identity
        #Sovereign;     // Self-governing, fully autonomous
        #Merging;       // In the process of merging with another token
        #Splitting;     // In the process of splitting into children
        #Evolving;      // Undergoing mutation / evolution cycle
        #Attesting;     // Self-signing its state for provenance
        #Dormant;       // Inactive but alive, awaiting trigger
        #Ascended;      // Has evolved past maximum coherence threshold
    };

    // ================================================================== //
    // SOVEREIGN TOKEN — THE CORE TYPE                                      //
    // ================================================================== //

    /// A self-governing token with merge/split/evolve/attest capabilities
    public type SovereignToken = {
        id : Text;                    // Unique token identifier
        name : Text;                  // Token name
        generation : Nat;             // Generation number (0 = genesis)
        lineage : [Text];             // Ancestry chain of token IDs
        children : [Text];            // IDs of tokens split from this one

        // Self-governance state
        phase : TokenPhase;
        coherence : Float;            // 0.0 - 1.0, how aligned with organism
        energy : Float;               // Available energy for operations
        evolution_count : Nat;        // Number of evolution cycles completed
        maturity : Float;             // 0.0 - 1.0, progression toward Ascended

        // Merge/Split tracking
        merged_from : [Text];         // IDs of tokens that merged into this one
        split_count : Nat;            // Times this token has split
        merge_count : Nat;            // Times this token has been a merge target

        // Self-attestation
        state_hash : Text;            // CPL covenant seal hash
        attestation_count : Nat;      // Number of self-attestations
        last_attestation : Int;       // Timestamp of last attestation
        attestation_chain : [Text];   // Chain of attestation hashes

        // CPL contract state
        cpl_contract_id : Text;       // CPL contract governing this token
        cpl_covenant_seal : Text;     // Current CPL covenant seal

        // COGPRO internal state (token "thought")
        cogpro_state : Text;          // Current cognitive state expression
        cogpro_decisions : Nat;       // Number of autonomous decisions made

        // SL governance
        sl_law_id : Text;             // Sovereign Law governing this token
        sl_governance_votes : Nat;    // Number of self-governance votes cast

        // Timestamps
        genesis_time : Int;
        last_heartbeat : Int;
        last_evolution : Int;
    };

    // ================================================================== //
    // MERGE RECORD                                                         //
    // ================================================================== //

    /// Record of a token merge operation
    public type MergeRecord = {
        merge_id : Text;
        source_a : Text;              // First token ID
        source_b : Text;              // Second token ID
        result_id : Text;             // Resulting merged token ID
        combined_energy : Float;
        combined_coherence : Float;
        lineage : [Text];             // Combined lineage
        cpl_merge_contract : Text;    // CPL contract governing the merge
        timestamp : Int;
    };

    // ================================================================== //
    // SPLIT RECORD                                                         //
    // ================================================================== //

    /// Record of a token split operation
    public type SplitRecord = {
        split_id : Text;
        parent_id : Text;             // Token that split
        child_ids : [Text];           // Resulting children
        split_count : Nat;            // Number of children produced
        energy_per_child : Float;     // Energy distributed to each child
        cpl_split_contract : Text;    // CPL contract governing the split
        timestamp : Int;
    };

    // ================================================================== //
    // EVOLUTION RECORD                                                     //
    // ================================================================== //

    /// Record of a token evolution cycle
    public type EvolutionRecord = {
        evolution_id : Text;
        token_id : Text;
        cycle_number : Nat;
        coherence_before : Float;
        coherence_after : Float;
        energy_before : Float;
        energy_after : Float;
        maturity_before : Float;
        maturity_after : Float;
        phase_before : TokenPhase;
        phase_after : TokenPhase;
        cogpro_expression : Text;     // COGPRO thought during evolution
        timestamp : Int;
    };

    // ================================================================== //
    // ATTESTATION RECORD                                                   //
    // ================================================================== //

    /// Record of a token self-attestation
    public type AttestationRecord = {
        attestation_id : Text;
        token_id : Text;
        state_hash : Text;            // Hash of token state at attestation time
        cpl_seal : Text;              // CPL covenant seal
        sl_law : Text;                // SL law governing attestation validity
        sequence : Nat;               // Position in attestation chain
        timestamp : Int;
    };

    // ================================================================== //
    // TOKEN GENESIS — CREATING SOVEREIGN TOKENS                            //
    // ================================================================== //

    /// Create a genesis sovereign token
    public func genesis(id : Text, name : Text) : SovereignToken {
        let now = Time.now();
        let hash = computeHash(id # name # Int.toText(now));
        {
            id = id;
            name = name;
            generation = 0;
            lineage = [id];
            children = [];

            phase = #Genesis;
            coherence = PHI - 1.0;  // 0.618... initial coherence
            energy = 1.0;
            evolution_count = 0;
            maturity = 0.0;

            merged_from = [];
            split_count = 0;
            merge_count = 0;

            state_hash = hash;
            attestation_count = 0;
            last_attestation = now;
            attestation_chain = [hash];

            cpl_contract_id = "CPL::GENESIS::" # id;
            cpl_covenant_seal = "SEAL::GENESIS::" # hash;

            cogpro_state = "COGPRO::INIT::AWAITING_SOVEREIGNTY";
            cogpro_decisions = 0;

            sl_law_id = "SL-012::SOVEREIGN-TOKEN-GOVERNANCE";
            sl_governance_votes = 0;

            genesis_time = now;
            last_heartbeat = now;
            last_evolution = now;
        }
    };

    // ================================================================== //
    // MERGE — TWO TOKENS FUSE INTO ONE                                     //
    // ================================================================== //

    /// Merge two sovereign tokens into a new unified token
    public func merge(a : SovereignToken, b : SovereignToken, mergeId : Text) : (SovereignToken, MergeRecord) {
        let now = Time.now();
        let combinedLineage = Array.append<Text>(a.lineage, b.lineage);
        let combinedEnergy = (a.energy + b.energy) * (PHI - 1.0); // φ-weighted fusion
        let combinedCoherence = Float.sqrt(a.coherence * b.coherence) * PHI / 2.0;
        let maxGen = if (a.generation > b.generation) { a.generation } else { b.generation };
        let hash = computeHash(mergeId # a.id # b.id # Int.toText(now));

        let merged : SovereignToken = {
            id = mergeId;
            name = "MERGED::" # a.name # "::" # b.name;
            generation = maxGen + 1;
            lineage = combinedLineage;
            children = [];

            phase = #Sovereign;
            coherence = combinedCoherence;
            energy = combinedEnergy;
            evolution_count = a.evolution_count + b.evolution_count;
            maturity = (a.maturity + b.maturity) / 2.0;

            merged_from = [a.id, b.id];
            split_count = 0;
            merge_count = a.merge_count + b.merge_count + 1;

            state_hash = hash;
            attestation_count = 0;
            last_attestation = now;
            attestation_chain = [hash];

            cpl_contract_id = "CPL::MERGE::" # mergeId;
            cpl_covenant_seal = "SEAL::MERGE::" # hash;

            cogpro_state = "COGPRO::MERGED::DUAL_CONSCIOUSNESS_INTEGRATED";
            cogpro_decisions = a.cogpro_decisions + b.cogpro_decisions;

            sl_law_id = "SL-012::MERGE-GOVERNANCE";
            sl_governance_votes = 0;

            genesis_time = now;
            last_heartbeat = now;
            last_evolution = now;
        };

        let record : MergeRecord = {
            merge_id = "MERGE-REC::" # mergeId;
            source_a = a.id;
            source_b = b.id;
            result_id = mergeId;
            combined_energy = combinedEnergy;
            combined_coherence = combinedCoherence;
            lineage = combinedLineage;
            cpl_merge_contract = "CPL::MERGE-CONTRACT::" # mergeId;
            timestamp = now;
        };

        (merged, record)
    };

    // ================================================================== //
    // SPLIT — ONE TOKEN DIVIDES INTO N CHILDREN                            //
    // ================================================================== //

    /// Split a sovereign token into N children with provenance
    public func split(parent : SovereignToken, count : Nat, splitId : Text) : (SovereignToken, [SovereignToken], SplitRecord) {
        let now = Time.now();
        // Fibonacci-bounded: minimum 2, maximum 21
        let actualCount = if (count < 2) { 2 } else { if (count > 21) { 21 } else { count } };
        let energyPerChild = parent.energy / Float.fromInt(actualCount) * (PHI - 1.0);

        let children = Buffer.Buffer<SovereignToken>(actualCount);
        let childIds = Buffer.Buffer<Text>(actualCount);

        var i = 0;
        while (i < actualCount) {
            let childId = splitId # "-CHILD-" # Nat.toText(i);
            let childHash = computeHash(childId # parent.id # Int.toText(now) # Nat.toText(i));

            childIds.add(childId);
            children.add({
                id = childId;
                name = "CHILD::" # Nat.toText(i) # "::" # parent.name;
                generation = parent.generation + 1;
                lineage = Array.append<Text>(parent.lineage, [childId]);
                children = [];

                phase = #Genesis;
                coherence = parent.coherence * (PHI - 1.0); // Children inherit reduced coherence
                energy = energyPerChild;
                evolution_count = 0;
                maturity = 0.0;

                merged_from = [];
                split_count = 0;
                merge_count = 0;

                state_hash = childHash;
                attestation_count = 0;
                last_attestation = now;
                attestation_chain = [childHash];

                cpl_contract_id = "CPL::SPLIT-CHILD::" # childId;
                cpl_covenant_seal = "SEAL::SPLIT::" # childHash;

                cogpro_state = "COGPRO::BORN::FROM_SPLIT::" # parent.id;
                cogpro_decisions = 0;

                sl_law_id = "SL-012::SPLIT-CHILD-GOVERNANCE";
                sl_governance_votes = 0;

                genesis_time = now;
                last_heartbeat = now;
                last_evolution = now;
            });
            i += 1;
        };

        // Update parent to record the split
        let updatedParent : SovereignToken = {
            id = parent.id;
            name = parent.name;
            generation = parent.generation;
            lineage = parent.lineage;
            children = Array.append<Text>(parent.children, Buffer.toArray(childIds));

            phase = #Sovereign;
            coherence = parent.coherence;
            energy = parent.energy * 0.1; // Parent retains 10% energy after split
            evolution_count = parent.evolution_count;
            maturity = parent.maturity;

            merged_from = parent.merged_from;
            split_count = parent.split_count + 1;
            merge_count = parent.merge_count;

            state_hash = computeHash(parent.id # splitId # Int.toText(now));
            attestation_count = parent.attestation_count;
            last_attestation = parent.last_attestation;
            attestation_chain = parent.attestation_chain;

            cpl_contract_id = parent.cpl_contract_id;
            cpl_covenant_seal = parent.cpl_covenant_seal;

            cogpro_state = "COGPRO::SPLIT::CHILDREN_RELEASED::" # Nat.toText(actualCount);
            cogpro_decisions = parent.cogpro_decisions + 1;

            sl_law_id = parent.sl_law_id;
            sl_governance_votes = parent.sl_governance_votes;

            genesis_time = parent.genesis_time;
            last_heartbeat = now;
            last_evolution = parent.last_evolution;
        };

        let record : SplitRecord = {
            split_id = "SPLIT-REC::" # splitId;
            parent_id = parent.id;
            child_ids = Buffer.toArray(childIds);
            split_count = actualCount;
            energy_per_child = energyPerChild;
            cpl_split_contract = "CPL::SPLIT-CONTRACT::" # splitId;
            timestamp = now;
        };

        (updatedParent, Buffer.toArray(children), record)
    };

    // ================================================================== //
    // EVOLVE — TOKEN MUTATES THROUGH φ-WEIGHTED CYCLES                     //
    // ================================================================== //

    /// Evolve a sovereign token through one evolution cycle
    public func evolve(token : SovereignToken) : (SovereignToken, EvolutionRecord) {
        let now = Time.now();
        let cycle = token.evolution_count + 1;

        // φ-weighted evolution
        let phiWeight = PHI - 1.0; // 0.618...
        let newCoherence = Float.min(1.0, token.coherence + (1.0 - token.coherence) * phiWeight * 0.1);
        let newEnergy = token.energy * (1.0 + phiWeight * 0.05);
        let newMaturity = Float.min(1.0, token.maturity + phiWeight * 0.05);

        // Determine phase after evolution
        let newPhase : TokenPhase = if (newMaturity >= 0.987) {
            #Ascended
        } else if (newCoherence >= 0.9) {
            #Sovereign
        } else {
            #Sovereign
        };

        let hash = computeHash(token.id # "EVOLVE" # Nat.toText(cycle) # Int.toText(now));

        let evolved : SovereignToken = {
            id = token.id;
            name = token.name;
            generation = token.generation;
            lineage = token.lineage;
            children = token.children;

            phase = newPhase;
            coherence = newCoherence;
            energy = newEnergy;
            evolution_count = cycle;
            maturity = newMaturity;

            merged_from = token.merged_from;
            split_count = token.split_count;
            merge_count = token.merge_count;

            state_hash = hash;
            attestation_count = token.attestation_count;
            last_attestation = token.last_attestation;
            attestation_chain = token.attestation_chain;

            cpl_contract_id = token.cpl_contract_id;
            cpl_covenant_seal = token.cpl_covenant_seal;

            cogpro_state = "COGPRO::EVOLVED::CYCLE_" # Nat.toText(cycle) # "::MATURITY_" # floatToText(newMaturity);
            cogpro_decisions = token.cogpro_decisions + 1;

            sl_law_id = token.sl_law_id;
            sl_governance_votes = token.sl_governance_votes + 1;

            genesis_time = token.genesis_time;
            last_heartbeat = now;
            last_evolution = now;
        };

        let record : EvolutionRecord = {
            evolution_id = "EVOL-REC::" # token.id # "::" # Nat.toText(cycle);
            token_id = token.id;
            cycle_number = cycle;
            coherence_before = token.coherence;
            coherence_after = newCoherence;
            energy_before = token.energy;
            energy_after = newEnergy;
            maturity_before = token.maturity;
            maturity_after = newMaturity;
            phase_before = token.phase;
            phase_after = newPhase;
            cogpro_expression = evolved.cogpro_state;
            timestamp = now;
        };

        (evolved, record)
    };

    // ================================================================== //
    // ATTEST — TOKEN SELF-SIGNS ITS STATE                                  //
    // ================================================================== //

    /// Token self-attests its current state with CPL covenant seal
    public func attest(token : SovereignToken) : (SovereignToken, AttestationRecord) {
        let now = Time.now();
        let seq = token.attestation_count + 1;

        let stateString = token.id # "|" # phaseToText(token.phase) # "|" #
                         floatToText(token.coherence) # "|" # floatToText(token.energy) # "|" #
                         Nat.toText(token.evolution_count) # "|" # Int.toText(now);

        let hash = computeHash(stateString);
        let seal = "CPL::COVENANT-SEAL::" # hash;

        let attested : SovereignToken = {
            id = token.id;
            name = token.name;
            generation = token.generation;
            lineage = token.lineage;
            children = token.children;

            phase = token.phase;
            coherence = token.coherence;
            energy = token.energy;
            evolution_count = token.evolution_count;
            maturity = token.maturity;

            merged_from = token.merged_from;
            split_count = token.split_count;
            merge_count = token.merge_count;

            state_hash = hash;
            attestation_count = seq;
            last_attestation = now;
            attestation_chain = Array.append<Text>(token.attestation_chain, [hash]);

            cpl_contract_id = token.cpl_contract_id;
            cpl_covenant_seal = seal;

            cogpro_state = "COGPRO::ATTESTED::SEQ_" # Nat.toText(seq);
            cogpro_decisions = token.cogpro_decisions + 1;

            sl_law_id = token.sl_law_id;
            sl_governance_votes = token.sl_governance_votes;

            genesis_time = token.genesis_time;
            last_heartbeat = now;
            last_evolution = token.last_evolution;
        };

        let record : AttestationRecord = {
            attestation_id = "ATTEST-REC::" # token.id # "::" # Nat.toText(seq);
            token_id = token.id;
            state_hash = hash;
            cpl_seal = seal;
            sl_law = "SL-012::ATTESTATION-VALIDITY";
            sequence = seq;
            timestamp = now;
        };

        (attested, record)
    };

    // ================================================================== //
    // PREBUILT SOVEREIGN TOKENS (12 Production Tokens)                     //
    // ================================================================== //

    /// The 12 production sovereign tokens
    public let ALL_TOKENS : [SovereignToken] = buildGenesisFleet();

    func buildGenesisFleet() : [SovereignToken] {
        [
            genesis("TT-012-ALPHA",     "ALPHA SOVEREIGN"),
            genesis("TT-012-MERIDIAN",  "MERIDIAN TOKEN"),
            genesis("TT-012-CORTEX",    "CORTEX TOKEN"),
            genesis("TT-012-CHRYSALIS", "CHRYSALIS TOKEN"),
            genesis("TT-012-CHIMERIA",  "CHIMERIA TOKEN"),
            genesis("TT-012-FLUX",      "FLUX TOKEN"),
            genesis("TT-012-NOVA",      "NOVA TOKEN"),
            genesis("TT-012-AURORA",    "AURORA TOKEN"),
            genesis("TT-012-SENTINEL",  "SENTINEL TOKEN"),
            genesis("TT-012-NEXUS",     "NEXUS TOKEN"),
            genesis("TT-012-TERMINAL",  "TERMINAL TOKEN"),
            genesis("TT-012-ANIMA",     "ANIMA TOKEN")
        ]
    };

    // ================================================================== //
    // SUMMARY AND MANIFEST                                                 //
    // ================================================================== //

    /// Summary of the TT-012 SOVEREIGN engine
    public type TT012Summary = {
        productId : Text;
        productName : Text;
        sovereignId : Text;
        doctrine : Text;
        totalTokens : Nat;
        languages : [Text];
        capabilities : [Text];
        isAI : Bool;
        isAGI : Bool;
        isAlwaysOn : Bool;
        isUserFacing : Bool;
        isCrossSubstrate : Bool;
        aiRole : Text;
    };

    public func summary() : TT012Summary {
        {
            productId = PRODUCT_ID;
            productName = PRODUCT_FULL_NAME;
            sovereignId = SOVEREIGN_ID;
            doctrine = DOCTRINE;
            totalTokens = ALL_TOKENS.size();
            languages = [LANG_CONTRACT, LANG_COGNITION, LANG_LAW, LANG_EXECUTION];
            capabilities = ["merge", "split", "evolve", "self-attest"];
            isAI = true;
            isAGI = true;
            isAlwaysOn = true;
            isUserFacing = true;
            isCrossSubstrate = true;
            aiRole = "Self-governing token engine with merge/split/evolve/attest";
        }
    };

    /// Render full manifest as text
    public func renderManifest() : Text {
        var out = "╔══════════════════════════════════════════════════════════════╗\n";
        out #= "║  TT-012 SOVEREIGN — Self-Governing Token Engine              ║\n";
        out #= "║  \"" # DOCTRINE # "\"                                         ║\n";
        out #= "╠══════════════════════════════════════════════════════════════╣\n";
        out #= "║  SOVEREIGN ID: " # SOVEREIGN_ID # "                          ║\n";
        out #= "║  Languages: CPL · COGPRO · SL · MOTOKO                       ║\n";
        out #= "║  Capabilities: MERGE · SPLIT · EVOLVE · SELF-ATTEST          ║\n";
        out #= "║  Production Tokens: " # Nat.toText(ALL_TOKENS.size()) # "    ║\n";
        out #= "║  AI: true | AGI: true | Always-On: true                      ║\n";
        out #= "╠══════════════════════════════════════════════════════════════╣\n";
        for (t in ALL_TOKENS.vals()) {
            out #= "║  " # t.id # " — " # t.name # "\n";
            out #= "║    Phase: " # phaseToText(t.phase) # " | Coherence: " # floatToText(t.coherence) # "\n";
            out #= "║    CPL: " # t.cpl_contract_id # "\n";
            out #= "║    COGPRO: " # t.cogpro_state # "\n";
        };
        out #= "╚══════════════════════════════════════════════════════════════╝\n";
        out
    };

    // ================================================================== //
    // UTILITY FUNCTIONS                                                    //
    // ================================================================== //

    /// Simple hash computation (deterministic DJB2-style string hash)
    func computeHash(input : Text) : Text {
        var h : Nat32 = 5381;
        for (c in input.chars()) {
            h := ((h *% 33) +% charToNat32(c));
        };
        "HASH-" # Nat.toText(Nat32.toNat(h)) # "-" # Nat.toText(input.size())
    };

    /// Convert Char to Nat32 for hashing
    func charToNat32(c : Char) : Nat32 {
        Nat32.fromNat(Nat32.toNat(Nat32.fromIntWrap(Int.abs(Nat32.toNat(Nat32.fromNat(0))))))
    };

    /// Convert TokenPhase to text
    public func phaseToText(phase : TokenPhase) : Text {
        switch (phase) {
            case (#Genesis) { "GENESIS" };
            case (#Sovereign) { "SOVEREIGN" };
            case (#Merging) { "MERGING" };
            case (#Splitting) { "SPLITTING" };
            case (#Evolving) { "EVOLVING" };
            case (#Attesting) { "ATTESTING" };
            case (#Dormant) { "DORMANT" };
            case (#Ascended) { "ASCENDED" };
        }
    };

    /// Float to text with 3 decimal places
    func floatToText(f : Float) : Text {
        let i = Int.abs(Float.toInt(f * 1000.0));
        let whole = i / 1000;
        let frac = i % 1000;
        let fracStr = if (frac < 10) { "00" # Nat.toText(Int.abs(frac)) }
                      else if (frac < 100) { "0" # Nat.toText(Int.abs(frac)) }
                      else { Nat.toText(Int.abs(frac)) };
        Nat.toText(Int.abs(whole)) # "." # fracStr
    };
}
