/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════╗
 * ║  MATALKO ICP — Foundation Module for Internet Computer Protocol                         ║
 * ║              "Matalko Fundamentum — The Living Substrate"                                ║
 * ║                                                                                           ║
 * ║  "Substrata vivunt. Substrata computant. Substrata protegunt."                            ║
 * ║  (Substrates live. Substrates compute. Substrates protect.)                               ║
 * ║                                                                                           ║
 * ║  Foundation constants, types, and utilities shared across all                             ║
 * ║  TT-series sovereign token engines compiled to Motoko for ICP.                            ║
 * ║                                                                                           ║
 * ║  LANGUAGE: Motoko (ICP execution substrate)                                               ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                                           ║
 * ║  PROPRIETARY AND CONFIDENTIAL - MAXIMUM SECRECY                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════╝
 */

import Float "mo:base/Float";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Text "mo:base/Text";
import Time "mo:base/Time";

module {

    // ================================================================== //
    // UNIVERSAL CONSTANTS                                                  //
    // ================================================================== //

    /// Golden ratio — φ = (1 + √5) / 2
    public let PHI : Float = 1.618033988749895;

    /// Inverse golden ratio — 1/φ = φ - 1
    public let PHI_INV : Float = 0.618033988749895;

    /// Golden angle in radians — 2π / φ²
    public let PHI_ANGLE : Float = 2.399963229728653;

    /// Three Hearts heartbeat interval (ms)
    public let THREE_HEARTS_MS : Nat = 873;

    /// Sovereign heartbeat interval (ms) — φ × 1000 truncated
    public let SOVEREIGN_HEARTBEAT_MS : Nat = 618;

    /// Platform identifier
    public let PLATFORM : Text = "ICP";
    public let PLATFORM_FULL : Text = "Internet Computer Protocol";
    public let SUBSTRATE : Text = "MOTOKO";

    /// Attribution
    public let ATTRIBUTION : Text = "Alfredo 'Freddy' Medina Hernandez";
    public let ORGANIZATION : Text = "Medina Sovereign Intelligence";

    // ================================================================== //
    // SUBSTRATE STATUS                                                     //
    // ================================================================== //

    /// Status of a substrate component
    public type SubstrateStatus = {
        #Active;
        #Dormant;
        #Evolving;
        #Attesting;
        #Terminated;
    };

    // ================================================================== //
    // COHERENCE UTILITIES                                                  //
    // ================================================================== //

    /// Compute phi-weighted coherence blend between two values
    public func phiBlend(a : Float, b : Float) : Float {
        a * PHI_INV + b * (1.0 - PHI_INV)
    };

    /// Clamp a float to [0.0, 1.0]
    public func clamp01(v : Float) : Float {
        if (v < 0.0) { 0.0 }
        else if (v > 1.0) { 1.0 }
        else { v }
    };

    /// Phi-weighted growth: value + (ceiling - value) * phi_inv * rate
    public func phiGrow(value : Float, ceiling : Float, rate : Float) : Float {
        clamp01(value + (ceiling - value) * PHI_INV * rate)
    };

    /// Phi-weighted decay: value * (1 - phi_inv * rate)
    public func phiDecay(value : Float, rate : Float) : Float {
        clamp01(value * (1.0 - PHI_INV * rate))
    };

    // ================================================================== //
    // HASHING UTILITIES                                                    //
    // ================================================================== //

    /// DJB2-style deterministic string hash
    public func djb2(input : Text) : Nat32 {
        var hash : Nat32 = 5381;
        for (c in input.chars()) {
            hash := ((hash *% 33) +% charToNat32(c));
        };
        hash
    };

    /// Convert Char to Nat32 for hashing
    func charToNat32(c : Char) : Nat32 {
        Nat32.fromNat(Nat32.toNat(Nat32.fromIntWrap(Int.abs(Nat32.toNat(Nat32.fromNat(0))))))
    };

    /// Generate a hash string from input
    public func hashText(input : Text) : Text {
        let h = djb2(input);
        "HASH-" # Nat.toText(Nat32.toNat(h)) # "-" # Nat.toText(input.size())
    };

    // ================================================================== //
    // TEXT UTILITIES                                                        //
    // ================================================================== //

    /// Float to text with 3 decimal places
    public func floatToText(f : Float) : Text {
        let i = Int.abs(Float.toInt(f * 1000.0));
        let whole = i / 1000;
        let frac = i % 1000;
        let fracStr = if (frac < 10) { "00" # Nat.toText(Int.abs(frac)) }
                      else if (frac < 100) { "0" # Nat.toText(Int.abs(frac)) }
                      else { Nat.toText(Int.abs(frac)) };
        Nat.toText(Int.abs(whole)) # "." # fracStr
    };

    /// Timestamp to text
    public func timeToText() : Text {
        Int.toText(Time.now())
    };

    // ================================================================== //
    // SUBSTRATE MANIFEST                                                   //
    // ================================================================== //

    /// Substrate manifest type
    public type SubstrateManifest = {
        platform : Text;
        substrate : Text;
        attribution : Text;
        phiConstant : Float;
        heartbeatMs : Nat;
        threeHeartsMs : Nat;
        status : SubstrateStatus;
    };

    /// Build the substrate manifest
    public func manifest() : SubstrateManifest {
        {
            platform = PLATFORM_FULL;
            substrate = SUBSTRATE;
            attribution = ATTRIBUTION;
            phiConstant = PHI;
            heartbeatMs = SOVEREIGN_HEARTBEAT_MS;
            threeHeartsMs = THREE_HEARTS_MS;
            status = #Active;
        }
    };
}
