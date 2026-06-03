/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — CANISTER 4: AGENT FINDINGS               ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Agent Council (Layer 6)                          ║
 * ║  SYN Engine: 24-hour autonomous execution cycle                       ║
 * ║                                                                        ║
 * ║  E11 — Agent Council Engine                                          ║
 * ║  E8 — Reviewer Integration Engine                                    ║
 * ║  E13 — Evidence Registry Engine                                      ║
 * ║                                                                        ║
 * ║  Internal Agent Roles:                                               ║
 * ║    ARCHON → Integrity Check                                          ║
 * ║    VECTOR → Execution Trace                                          ║
 * ║    LUMEN  → Context Map                                              ║
 * ║    FORGE  → Verification Lab                                         ║
 * ║                                                                        ║
 * ║  Stores: structured agent findings, review decisions,                ║
 * ║  evidence chains, dispute records.                                    ║
 * ║                                                                        ║
 * ║  Guardrails:                                                         ║
 * ║    - No adopt/reject recommendations                                  ║
 * ║    - No claim marked verified without evidence                        ║
 * ║    - Every AI finding is reviewable and disputable                   ║
 * ║                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                       ║
 * ║  PROPRIETARY AND CONFIDENTIAL                                          ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

import Array   "mo:base/Array";
import Buffer  "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int     "mo:base/Int";
import Iter    "mo:base/Iter";
import Nat     "mo:base/Nat";
import Text    "mo:base/Text";
import Time    "mo:base/Time";

import T "Types";

actor AgentFindingsCanister {

    // ================================================================= //
    // STABLE STORAGE                                                      //
    // ================================================================= //

    private stable var _findingEntries : [(Text, T.AgentFinding)] = [];
    private stable var _propToFindingsEntries : [(Text, [Text])] = [];
    private stable var _traceToFindingsEntries : [(Text, [Text])] = [];
    private stable var _submitCount : Nat = 0;
    private stable var _reviewCount : Nat = 0;
    private stable var _disputeCount : Nat = 0;

    private var findings : HashMap.HashMap<Text, T.AgentFinding> =
        HashMap.fromIter(_findingEntries.vals(), 500, Text.equal, Text.hash);

    private var propToFindings : HashMap.HashMap<Text, [Text]> =
        HashMap.fromIter(_propToFindingsEntries.vals(), 200, Text.equal, Text.hash);

    private var traceToFindings : HashMap.HashMap<Text, [Text]> =
        HashMap.fromIter(_traceToFindingsEntries.vals(), 200, Text.equal, Text.hash);

    system func preupgrade() {
        _findingEntries := Iter.toArray(findings.entries());
        _propToFindingsEntries := Iter.toArray(propToFindings.entries());
        _traceToFindingsEntries := Iter.toArray(traceToFindings.entries());
    };

    system func postupgrade() {
        findings := HashMap.fromIter(_findingEntries.vals(), 500, Text.equal, Text.hash);
        propToFindings := HashMap.fromIter(_propToFindingsEntries.vals(), 200, Text.equal, Text.hash);
        traceToFindings := HashMap.fromIter(_traceToFindingsEntries.vals(), 200, Text.equal, Text.hash);
        _findingEntries := [];
        _propToFindingsEntries := [];
        _traceToFindingsEntries := [];
    };

    // ================================================================= //
    // E11 — AGENT COUNCIL: SUBMIT FINDING                               //
    // ================================================================= //

    /// Submit a structured agent finding
    public shared func submitFinding(
        traceId : Text,
        proposalId : Text,
        agent : T.AgentRole,
        finding : Text,
        severity : T.FindingSeverity,
        evidence : [T.SourceLink]
    ) : async Text {
        let now = Time.now();
        let findingId = T.makeId("FINDING", traceId # "-" # _agentCode(agent));

        let record : T.AgentFinding = {
            findingId;
            traceId;
            proposalId;
            agent;
            finding;
            severity;
            evidence;
            status = #Draft;
            createdAt = now;
            reviewedAt = null;
            reviewerNote = null;
        };

        findings.put(findingId, record);
        _submitCount += 1;

        // Index by proposalId
        let byProp = switch (propToFindings.get(proposalId)) {
            case null { [] };
            case (?arr) { arr };
        };
        propToFindings.put(proposalId, Array.append(byProp, [findingId]));

        // Index by traceId
        let byTrace = switch (traceToFindings.get(traceId)) {
            case null { [] };
            case (?arr) { arr };
        };
        traceToFindings.put(traceId, Array.append(byTrace, [findingId]));

        findingId
    };

    /// Batch submit — used by SYN engine for agent council pass
    public shared func batchSubmitFindings(inputs : [{
        traceId : Text;
        proposalId : Text;
        agent : T.AgentRole;
        finding : Text;
        severity : T.FindingSeverity;
        evidence : [T.SourceLink];
    }]) : async [Text] {
        let buf = Buffer.Buffer<Text>(inputs.size());
        for (input in inputs.vals()) {
            let now = Time.now();
            let findingId = T.makeId("FINDING", input.traceId # "-" # _agentCode(input.agent));
            let record : T.AgentFinding = {
                findingId;
                traceId = input.traceId;
                proposalId = input.proposalId;
                agent = input.agent;
                finding = input.finding;
                severity = input.severity;
                evidence = input.evidence;
                status = #Draft;
                createdAt = now;
                reviewedAt = null;
                reviewerNote = null;
            };
            findings.put(findingId, record);
            _submitCount += 1;

            let byProp = switch (propToFindings.get(input.proposalId)) {
                case null { [] };
                case (?arr) { arr };
            };
            propToFindings.put(input.proposalId, Array.append(byProp, [findingId]));

            let byTrace = switch (traceToFindings.get(input.traceId)) {
                case null { [] };
                case (?arr) { arr };
            };
            traceToFindings.put(input.traceId, Array.append(byTrace, [findingId]));

            buf.add(findingId);
        };
        Buffer.toArray(buf)
    };

    // ================================================================= //
    // E8 — REVIEWER INTEGRATION: REVIEW + DISPUTE                       //
    // ================================================================= //

    /// Human reviewer marks a finding as reviewed
    public shared func reviewFinding(
        findingId : Text,
        approved : Bool,
        reviewerNote : Text
    ) : async Bool {
        switch (findings.get(findingId)) {
            case null { false };
            case (?f) {
                let updated : T.AgentFinding = {
                    findingId = f.findingId;
                    traceId = f.traceId;
                    proposalId = f.proposalId;
                    agent = f.agent;
                    finding = f.finding;
                    severity = f.severity;
                    evidence = f.evidence;
                    status = if (approved) { #Reviewed } else { #Disputed };
                    createdAt = f.createdAt;
                    reviewedAt = ?Time.now();
                    reviewerNote = ?reviewerNote;
                };
                findings.put(findingId, updated);
                _reviewCount += 1;
                true
            };
        }
    };

    /// Dispute a finding — any community member can dispute
    public shared func disputeFinding(findingId : Text, reason : Text) : async Bool {
        switch (findings.get(findingId)) {
            case null { false };
            case (?f) {
                let updated : T.AgentFinding = {
                    findingId = f.findingId;
                    traceId = f.traceId;
                    proposalId = f.proposalId;
                    agent = f.agent;
                    finding = f.finding;
                    severity = f.severity;
                    evidence = f.evidence;
                    status = #Disputed;
                    createdAt = f.createdAt;
                    reviewedAt = ?Time.now();
                    reviewerNote = ?("DISPUTED: " # reason);
                };
                findings.put(findingId, updated);
                _disputeCount += 1;
                true
            };
        }
    };

    /// Archive a finding (remove from active view)
    public shared func archiveFinding(findingId : Text) : async Bool {
        switch (findings.get(findingId)) {
            case null { false };
            case (?f) {
                let updated : T.AgentFinding = {
                    findingId = f.findingId;
                    traceId = f.traceId;
                    proposalId = f.proposalId;
                    agent = f.agent;
                    finding = f.finding;
                    severity = f.severity;
                    evidence = f.evidence;
                    status = #Archived;
                    createdAt = f.createdAt;
                    reviewedAt = f.reviewedAt;
                    reviewerNote = f.reviewerNote;
                };
                findings.put(findingId, updated);
                true
            };
        }
    };

    // ================================================================= //
    // QUERY METHODS                                                       //
    // ================================================================= //

    public query func getFinding(id : Text) : async ?T.AgentFinding {
        findings.get(id)
    };

    public query func getFindingsByProposal(proposalId : Text) : async [T.AgentFinding] {
        switch (propToFindings.get(proposalId)) {
            case null { [] };
            case (?ids) {
                Array.mapFilter<Text, T.AgentFinding>(ids, func(id) { findings.get(id) })
            };
        }
    };

    public query func getFindingsByTrace(traceId : Text) : async [T.AgentFinding] {
        switch (traceToFindings.get(traceId)) {
            case null { [] };
            case (?ids) {
                Array.mapFilter<Text, T.AgentFinding>(ids, func(id) { findings.get(id) })
            };
        }
    };

    public query func getCriticalFindings() : async [T.AgentFinding] {
        Array.filter(Iter.toArray(findings.vals()), func(f : T.AgentFinding) : Bool {
            switch (f.severity) {
                case (#Critical) { true };
                case _ { false };
            }
        })
    };

    public query func getWarningFindings() : async [T.AgentFinding] {
        Array.filter(Iter.toArray(findings.vals()), func(f : T.AgentFinding) : Bool {
            switch (f.severity) {
                case (#Warning) { true };
                case (#Critical) { true };
                case _ { false };
            }
        })
    };

    public query func getDisputedFindings() : async [T.AgentFinding] {
        Array.filter(Iter.toArray(findings.vals()), func(f : T.AgentFinding) : Bool {
            switch (f.status) {
                case (#Disputed) { true };
                case _ { false };
            }
        })
    };

    public query func getStats() : async {
        totalFindings : Nat;
        submitCount : Nat;
        reviewCount : Nat;
        disputeCount : Nat;
        identity : Text;
    } {
        {
            totalFindings = findings.size();
            submitCount = _submitCount;
            reviewCount = _reviewCount;
            disputeCount = _disputeCount;
            identity = T.ORO_ENCODED_ID;
        }
    };

    // ================================================================= //
    // PRIVATE HELPERS                                                    //
    // ================================================================= //

    private func _agentCode(a : T.AgentRole) : Text {
        switch (a) {
            case (#Integrity)       { "ARCHON" };
            case (#ExecutionTrace)  { "VECTOR" };
            case (#ContextMap)      { "LUMEN" };
            case (#VerificationLab) { "FORGE" };
            case (#Risk)            { "RISK" };
            case (#Memory)          { "MEMORY" };
        }
    };
}
