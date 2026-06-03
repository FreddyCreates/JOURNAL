/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — CANISTER 3: GOVERNANCE MEMORY             ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Ring 3 of 3 (Memory Layer)                       ║
 * ║  SYN Engine: 24-hour autonomous execution cycle                       ║
 * ║                                                                        ║
 * ║  E9 — Governance Memory Engine                                       ║
 * ║  E10 — Post-Execution Watch Engine                                   ║
 * ║  E13 — Evidence Registry Engine                                      ║
 * ║                                                                        ║
 * ║  Stores: proposal-to-proposal links, precedent graph,                ║
 * ║  follow-up obligations, post-execution checks,                        ║
 * ║  recurring risk patterns.                                             ║
 * ║                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                       ║
 * ║  PROPRIETARY AND CONFIDENTIAL                                          ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

import Array   "mo:base/Array";
import HashMap "mo:base/HashMap";
import Int     "mo:base/Int";
import Iter    "mo:base/Iter";
import Nat     "mo:base/Nat";
import Text    "mo:base/Text";
import Time    "mo:base/Time";

import T "Types";

actor GovernanceMemoryCanister {

    // ================================================================= //
    // STABLE STORAGE                                                      //
    // ================================================================= //

    private stable var _memoryEntries : [(Text, T.GovernanceMemory)] = [];
    private stable var _postCheckEntries : [(Text, [T.PostExecutionCheck])] = [];
    private stable var _patternEntries : [(Text, Nat)] = [];  // patternTag → occurrence count
    private stable var _linkCount : Nat = 0;
    private stable var _checkCount : Nat = 0;

    private var memories : HashMap.HashMap<Text, T.GovernanceMemory> =
        HashMap.fromIter(_memoryEntries.vals(), 200, Text.equal, Text.hash);

    private var postChecks : HashMap.HashMap<Text, [T.PostExecutionCheck]> =
        HashMap.fromIter(_postCheckEntries.vals(), 200, Text.equal, Text.hash);

    /// Pattern registry: track recurring risk patterns across governance
    private var patterns : HashMap.HashMap<Text, Nat> =
        HashMap.fromIter(_patternEntries.vals(), 50, Text.equal, Text.hash);

    system func preupgrade() {
        _memoryEntries := Iter.toArray(memories.entries());
        _postCheckEntries := Iter.toArray(postChecks.entries());
        _patternEntries := Iter.toArray(patterns.entries());
    };

    system func postupgrade() {
        memories := HashMap.fromIter(_memoryEntries.vals(), 200, Text.equal, Text.hash);
        postChecks := HashMap.fromIter(_postCheckEntries.vals(), 200, Text.equal, Text.hash);
        patterns := HashMap.fromIter(_patternEntries.vals(), 50, Text.equal, Text.hash);
        _memoryEntries := [];
        _postCheckEntries := [];
        _patternEntries := [];
    };

    // ================================================================= //
    // E9 — GOVERNANCE MEMORY ENGINE                                     //
    // ================================================================= //

    /// Initialize a governance memory record for a proposal
    public shared func initMemory(proposalId : Text) : async () {
        switch (memories.get(proposalId)) {
            case (?_) { /* already exists */ };
            case null {
                let now = Time.now();
                memories.put(proposalId, {
                    proposalId;
                    relatedProposals = [];
                    precedentCreated = [];
                    followUpObligations = [];
                    contradictions = [];
                    postExecutionChecks = [];
                    patternTags = [];
                    createdAt = now;
                    updatedAt = now;
                });
            };
        }
    };

    /// Link two proposals together in the memory graph
    public shared func linkProposals(
        fromProposalId : Text,
        link : T.GovernanceMemoryLink
    ) : async Text {
        let now = Time.now();
        let linkId = T.makeId("LINK", fromProposalId # "-" # link.targetProposalId);

        // Ensure memory record exists for fromProposalId
        let mem = switch (memories.get(fromProposalId)) {
            case null {
                {
                    proposalId = fromProposalId;
                    relatedProposals = [];
                    precedentCreated = [];
                    followUpObligations = [];
                    contradictions = [];
                    postExecutionChecks = [];
                    patternTags = [];
                    createdAt = now;
                    updatedAt = now;
                }
            };
            case (?m) { m };
        };

        let updated : T.GovernanceMemory = {
            proposalId = mem.proposalId;
            relatedProposals = Array.append(mem.relatedProposals, [link]);
            precedentCreated = mem.precedentCreated;
            followUpObligations = mem.followUpObligations;
            contradictions = mem.contradictions;
            postExecutionChecks = mem.postExecutionChecks;
            patternTags = mem.patternTags;
            createdAt = mem.createdAt;
            updatedAt = now;
        };

        memories.put(fromProposalId, updated);
        _linkCount += 1;
        linkId
    };

    /// Add a precedent created by a proposal
    public shared func addPrecedent(proposalId : Text, precedent : Text) : async Bool {
        switch (memories.get(proposalId)) {
            case null { false };
            case (?mem) {
                let updated : T.GovernanceMemory = {
                    proposalId = mem.proposalId;
                    relatedProposals = mem.relatedProposals;
                    precedentCreated = Array.append(mem.precedentCreated, [precedent]);
                    followUpObligations = mem.followUpObligations;
                    contradictions = mem.contradictions;
                    postExecutionChecks = mem.postExecutionChecks;
                    patternTags = mem.patternTags;
                    createdAt = mem.createdAt;
                    updatedAt = Time.now();
                };
                memories.put(proposalId, updated);
                true
            };
        }
    };

    /// Add a follow-up obligation
    public shared func addFollowUp(proposalId : Text, obligation : Text) : async Bool {
        switch (memories.get(proposalId)) {
            case null { false };
            case (?mem) {
                let updated : T.GovernanceMemory = {
                    proposalId = mem.proposalId;
                    relatedProposals = mem.relatedProposals;
                    precedentCreated = mem.precedentCreated;
                    followUpObligations = Array.append(mem.followUpObligations, [obligation]);
                    contradictions = mem.contradictions;
                    postExecutionChecks = mem.postExecutionChecks;
                    patternTags = mem.patternTags;
                    createdAt = mem.createdAt;
                    updatedAt = Time.now();
                };
                memories.put(proposalId, updated);
                true
            };
        }
    };

    /// Add a contradiction detected
    public shared func addContradiction(proposalId : Text, contradiction : Text) : async Bool {
        switch (memories.get(proposalId)) {
            case null { false };
            case (?mem) {
                let updated : T.GovernanceMemory = {
                    proposalId = mem.proposalId;
                    relatedProposals = mem.relatedProposals;
                    precedentCreated = mem.precedentCreated;
                    followUpObligations = mem.followUpObligations;
                    contradictions = Array.append(mem.contradictions, [contradiction]);
                    postExecutionChecks = mem.postExecutionChecks;
                    patternTags = mem.patternTags;
                    createdAt = mem.createdAt;
                    updatedAt = Time.now();
                };
                memories.put(proposalId, updated);
                true
            };
        }
    };

    /// Tag a proposal with a recurring pattern
    public shared func addPatternTag(proposalId : Text, patternTag : Text) : async Bool {
        switch (memories.get(proposalId)) {
            case null { false };
            case (?mem) {
                let updated : T.GovernanceMemory = {
                    proposalId = mem.proposalId;
                    relatedProposals = mem.relatedProposals;
                    precedentCreated = mem.precedentCreated;
                    followUpObligations = mem.followUpObligations;
                    contradictions = mem.contradictions;
                    postExecutionChecks = mem.postExecutionChecks;
                    patternTags = Array.append(mem.patternTags, [patternTag]);
                    createdAt = mem.createdAt;
                    updatedAt = Time.now();
                };
                memories.put(proposalId, updated);

                // Update global pattern frequency
                let count = switch (patterns.get(patternTag)) {
                    case null { 1 };
                    case (?c) { c + 1 };
                };
                patterns.put(patternTag, count);
                true
            };
        }
    };

    // ================================================================= //
    // E10 — POST-EXECUTION WATCH ENGINE                                  //
    // ================================================================= //

    /// Record a post-execution check result
    public shared func addPostExecutionCheck(
        proposalId : Text,
        afterStateMatch : Bool,
        evidence : [T.SourceLink],
        notes : Text
    ) : async Text {
        let now = Time.now();
        let checkId = T.makeId("CHECK", proposalId);

        let check : T.PostExecutionCheck = {
            checkId;
            proposalId;
            performedAt = now;
            afterStateMatch;
            evidence;
            notes;
        };

        // Ensure memory record exists
        switch (memories.get(proposalId)) {
            case null {
                memories.put(proposalId, {
                    proposalId;
                    relatedProposals = [];
                    precedentCreated = [];
                    followUpObligations = [];
                    contradictions = [];
                    postExecutionChecks = [check];
                    patternTags = [];
                    createdAt = now;
                    updatedAt = now;
                });
            };
            case (?mem) {
                let updated : T.GovernanceMemory = {
                    proposalId = mem.proposalId;
                    relatedProposals = mem.relatedProposals;
                    precedentCreated = mem.precedentCreated;
                    followUpObligations = mem.followUpObligations;
                    contradictions = mem.contradictions;
                    postExecutionChecks = Array.append(mem.postExecutionChecks, [check]);
                    patternTags = mem.patternTags;
                    createdAt = mem.createdAt;
                    updatedAt = now;
                };
                memories.put(proposalId, updated);
            };
        };

        _checkCount += 1;
        checkId
    };

    // ================================================================= //
    // QUERY METHODS                                                       //
    // ================================================================= //

    public query func getGovernanceMemory(proposalId : Text) : async ?T.GovernanceMemory {
        memories.get(proposalId)
    };

    public query func findRelatedProposals(proposalId : Text) : async [T.GovernanceMemoryLink] {
        switch (memories.get(proposalId)) {
            case null { [] };
            case (?mem) { mem.relatedProposals };
        }
    };

    public query func getFollowUpObligations(proposalId : Text) : async [Text] {
        switch (memories.get(proposalId)) {
            case null { [] };
            case (?mem) { mem.followUpObligations };
        }
    };

    public query func getPostExecutionChecks(proposalId : Text) : async [T.PostExecutionCheck] {
        switch (memories.get(proposalId)) {
            case null { [] };
            case (?mem) { mem.postExecutionChecks };
        }
    };

    /// Get recurring governance patterns sorted by frequency
    public query func getRecurringPatterns() : async [(Text, Nat)] {
        let all = Iter.toArray(patterns.entries());
        // Sort descending by count — simple selection sort for small sets
        Array.sort(all, func(a : (Text, Nat), b : (Text, Nat)) : {#less; #equal; #greater} {
            if (b.1 > a.1) { #less }
            else if (b.1 < a.1) { #greater }
            else { #equal }
        })
    };

    /// All proposals with unresolved follow-up obligations
    public query func getOpenFollowUps() : async [(Text, [Text])] {
        let all = Iter.toArray(memories.entries());
        let withFollowUps = Array.filter(all, func(entry : (Text, T.GovernanceMemory)) : Bool {
            entry.1.followUpObligations.size() > 0
        });
        Array.map(withFollowUps, func(entry : (Text, T.GovernanceMemory)) : (Text, [Text]) {
            (entry.0, entry.1.followUpObligations)
        })
    };

    /// Executed proposals without a post-execution check
    public query func getExecutedWithoutCheck() : async [Text] {
        let all = Iter.toArray(memories.vals());
        let noCheck = Array.filter(all, func(m : T.GovernanceMemory) : Bool {
            m.postExecutionChecks.size() == 0
        });
        Array.map(noCheck, func(m : T.GovernanceMemory) : Text { m.proposalId })
    };

    public query func getStats() : async {
        totalMemories : Nat;
        linkCount : Nat;
        checkCount : Nat;
        uniquePatterns : Nat;
        identity : Text;
    } {
        {
            totalMemories = memories.size();
            linkCount = _linkCount;
            checkCount = _checkCount;
            uniquePatterns = patterns.size();
            identity = T.ORO_ENCODED_ID;
        }
    };
}
