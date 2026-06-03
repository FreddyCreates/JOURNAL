/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — CANISTER 2: EFFECT TRACE                  ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Ring 2 of 3                                       ║
 * ║  SYN Engine: 24-hour autonomous execution cycle                       ║
 * ║                                                                        ║
 * ║  E4 — Effect Path Engine                                             ║
 * ║  E5 — Runtime Truth Engine                                           ║
 * ║  E6 — Risk Classifier Engine                                         ║
 * ║  E7 — Verification Plan Engine                                       ║
 * ║  E12 — Public Summary Engine                                         ║
 * ║  E14 — Dispute / Correction Engine                                   ║
 * ║                                                                        ║
 * ║  Stores: EffectTraceRecord, RuntimeTruthBlock, RiskProfile,          ║
 * ║  VerificationPlan, revision history.                                  ║
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

actor EffectTraceCanister {

    // ================================================================= //
    // STABLE STORAGE                                                      //
    // ================================================================= //

    private stable var _traceEntries : [(Text, T.EffectTraceRecord)] = [];
    private stable var _propToTraceEntries : [(Text, [Text])] = [];
    private stable var _traceCount : Nat = 0;
    private stable var _updateCount : Nat = 0;

    private var traces : HashMap.HashMap<Text, T.EffectTraceRecord> =
        HashMap.fromIter(_traceEntries.vals(), 200, Text.equal, Text.hash);

    private var propToTraces : HashMap.HashMap<Text, [Text]> =
        HashMap.fromIter(_propToTraceEntries.vals(), 200, Text.equal, Text.hash);

    system func preupgrade() {
        _traceEntries := Iter.toArray(traces.entries());
        _propToTraceEntries := Iter.toArray(propToTraces.entries());
    };

    system func postupgrade() {
        traces := HashMap.fromIter(_traceEntries.vals(), 200, Text.equal, Text.hash);
        propToTraces := HashMap.fromIter(_propToTraceEntries.vals(), 200, Text.equal, Text.hash);
        _traceEntries := [];
        _propToTraceEntries := [];
    };

    // ================================================================= //
    // E4 — EFFECT PATH ENGINE: CREATE TRACE                             //
    // ================================================================= //

    /// Create a new effect trace record — full schema always present
    public shared func createTrace(
        proposalId : Text,
        publicTitle : Text,
        plainSummary : Text,
        effectPath : T.EffectPath,
        runtimeTruth : T.RuntimeTruthBlock,
        riskProfile : T.RiskProfile,
        verificationPlan : T.VerificationPlan
    ) : async Text {
        let now = Time.now();
        let traceId = T.makeId("TRACE", proposalId);

        let record : T.EffectTraceRecord = {
            traceId;
            proposalId;
            publicTitle;
            plainSummary;
            effectPath;
            runtimeTruth;
            riskProfile;
            verificationPlan;
            memoryLinks = [];
            agentFindings = [];
            confidence = #Low;
            status = #Draft;
            createdAt = now;
            updatedAt = now;
            revisions = [];
        };

        traces.put(traceId, record);
        _traceCount += 1;

        // Index by proposalId
        let existing = switch (propToTraces.get(proposalId)) {
            case null { [] };
            case (?arr) { arr };
        };
        propToTraces.put(proposalId, Array.append(existing, [traceId]));

        traceId
    };

    // ================================================================= //
    // E5 — RUNTIME TRUTH ENGINE: UPDATE TRUTH STATUS                    //
    // ================================================================= //

    /// Update the runtime truth block for a trace
    public shared func updateTruthStatus(
        traceId : Text,
        truthBlock : T.RuntimeTruthBlock,
        changedBy : Text,
        changeNote : Text
    ) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let rev : T.RevisionRecord = {
                    revisionId = T.makeId("REV", traceId);
                    traceId;
                    changedBy;
                    changeNote;
                    timestamp = Time.now();
                };
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = truthBlock;
                    riskProfile = existing.riskProfile;
                    verificationPlan = existing.verificationPlan;
                    memoryLinks = existing.memoryLinks;
                    agentFindings = existing.agentFindings;
                    confidence = _recalcConfidence(truthBlock, existing.riskProfile);
                    status = existing.status;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = Array.append(existing.revisions, [rev]);
                };
                traces.put(traceId, updated);
                _updateCount += 1;
                true
            };
        }
    };

    // ================================================================= //
    // E6 — RISK CLASSIFIER ENGINE: UPDATE RISK                         //
    // ================================================================= //

    public shared func updateRiskProfile(
        traceId : Text,
        riskProfile : T.RiskProfile,
        changedBy : Text
    ) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let rev : T.RevisionRecord = {
                    revisionId = T.makeId("REV", traceId # "-RISK");
                    traceId;
                    changedBy;
                    changeNote = "Risk profile updated: " # T.riskLevelLabel(riskProfile.riskLevel);
                    timestamp = Time.now();
                };
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = existing.runtimeTruth;
                    riskProfile;
                    verificationPlan = existing.verificationPlan;
                    memoryLinks = existing.memoryLinks;
                    agentFindings = existing.agentFindings;
                    confidence = _recalcConfidence(existing.runtimeTruth, riskProfile);
                    status = existing.status;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = Array.append(existing.revisions, [rev]);
                };
                traces.put(traceId, updated);
                _updateCount += 1;
                true
            };
        }
    };

    // ================================================================= //
    // E7 — VERIFICATION PLAN ENGINE                                     //
    // ================================================================= //

    public shared func updateVerificationPlan(
        traceId : Text,
        plan : T.VerificationPlan,
        changedBy : Text
    ) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let rev : T.RevisionRecord = {
                    revisionId = T.makeId("REV", traceId # "-VERIFY");
                    traceId;
                    changedBy;
                    changeNote = "Verification plan updated: " # Nat.toText(plan.steps.size()) # " steps";
                    timestamp = Time.now();
                };
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = existing.runtimeTruth;
                    riskProfile = existing.riskProfile;
                    verificationPlan = plan;
                    memoryLinks = existing.memoryLinks;
                    agentFindings = existing.agentFindings;
                    confidence = existing.confidence;
                    status = existing.status;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = Array.append(existing.revisions, [rev]);
                };
                traces.put(traceId, updated);
                _updateCount += 1;
                true
            };
        }
    };

    // ================================================================= //
    // AGENT FINDINGS — attach finding to trace                          //
    // ================================================================= //

    public shared func attachFinding(traceId : Text, finding : T.AgentFinding) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = existing.runtimeTruth;
                    riskProfile = existing.riskProfile;
                    verificationPlan = existing.verificationPlan;
                    memoryLinks = existing.memoryLinks;
                    agentFindings = Array.append(existing.agentFindings, [finding]);
                    confidence = existing.confidence;
                    status = existing.status;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = existing.revisions;
                };
                traces.put(traceId, updated);
                true
            };
        }
    };

    /// Attach governance memory links
    public shared func attachMemoryLink(traceId : Text, link : T.GovernanceMemoryLink) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = existing.runtimeTruth;
                    riskProfile = existing.riskProfile;
                    verificationPlan = existing.verificationPlan;
                    memoryLinks = Array.append(existing.memoryLinks, [link]);
                    agentFindings = existing.agentFindings;
                    confidence = existing.confidence;
                    status = existing.status;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = existing.revisions;
                };
                traces.put(traceId, updated);
                true
            };
        }
    };

    // ================================================================= //
    // E14 — DISPUTE / CORRECTION ENGINE                                 //
    // ================================================================= //

    public shared func publishTrace(traceId : Text) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = existing.runtimeTruth;
                    riskProfile = existing.riskProfile;
                    verificationPlan = existing.verificationPlan;
                    memoryLinks = existing.memoryLinks;
                    agentFindings = existing.agentFindings;
                    confidence = existing.confidence;
                    status = #CommunityReviewed;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = existing.revisions;
                };
                traces.put(traceId, updated);
                true
            };
        }
    };

    public shared func disputeTrace(traceId : Text, reason : Text, disputedBy : Text) : async Bool {
        switch (traces.get(traceId)) {
            case null { false };
            case (?existing) {
                let rev : T.RevisionRecord = {
                    revisionId = T.makeId("DISPUTE", traceId);
                    traceId;
                    changedBy = disputedBy;
                    changeNote = "DISPUTED: " # reason;
                    timestamp = Time.now();
                };
                let updated : T.EffectTraceRecord = {
                    traceId = existing.traceId;
                    proposalId = existing.proposalId;
                    publicTitle = existing.publicTitle;
                    plainSummary = existing.plainSummary;
                    effectPath = existing.effectPath;
                    runtimeTruth = existing.runtimeTruth;
                    riskProfile = existing.riskProfile;
                    verificationPlan = existing.verificationPlan;
                    memoryLinks = existing.memoryLinks;
                    agentFindings = existing.agentFindings;
                    confidence = existing.confidence;
                    status = #Disputed;
                    createdAt = existing.createdAt;
                    updatedAt = Time.now();
                    revisions = Array.append(existing.revisions, [rev]);
                };
                traces.put(traceId, updated);
                true
            };
        }
    };

    // ================================================================= //
    // QUERY METHODS                                                       //
    // ================================================================= //

    public query func getTrace(id : Text) : async ?T.EffectTraceRecord {
        traces.get(id)
    };

    public query func getTraceByProposal(proposalId : Text) : async [T.EffectTraceRecord] {
        switch (propToTraces.get(proposalId)) {
            case null { [] };
            case (?ids) {
                Array.mapFilter<Text, T.EffectTraceRecord>(ids, func(id) {
                    traces.get(id)
                })
            };
        }
    };

    public query func listTraces(filter : T.TraceFilter) : async [T.TraceSummary] {
        var all = Iter.toArray(traces.vals());

        switch (filter.status) {
            case null {};
            case (?st) {
                all := Array.filter(all, func(t : T.EffectTraceRecord) : Bool {
                    _traceStatusEq(t.status, st)
                });
            };
        };

        switch (filter.riskClass) {
            case null {};
            case (?rc) {
                all := Array.filter(all, func(t : T.EffectTraceRecord) : Bool {
                    _riskClassEq(t.riskProfile.riskClass, rc)
                });
            };
        };

        let total = all.size();
        let start = if (filter.offset >= total) { total } else { filter.offset };
        let end_ = Nat.min(start + filter.limit, total);
        let page = Array.tabulate<T.EffectTraceRecord>(
            if (end_ > start) { end_ - start } else { 0 },
            func(i) { all[start + i] }
        );

        Array.map(page, func(t : T.EffectTraceRecord) : T.TraceSummary {
            {
                traceId = t.traceId;
                proposalId = t.proposalId;
                publicTitle = t.publicTitle;
                riskLevel = t.riskProfile.riskLevel;
                riskClass = t.riskProfile.riskClass;
                truthStatus = t.runtimeTruth.truthStatus;
                confidence = t.confidence;
                status = t.status;
                updatedAt = t.updatedAt;
            }
        })
    };

    /// E12 — Public Summary Engine: generate forum-safe markdown
    public query func exportMarkdown(traceId : Text) : async Text {
        switch (traces.get(traceId)) {
            case null { "# Error: Trace not found\n" };
            case (?t) {
                "# " # t.publicTitle # "\n\n" #
                "**Status:** " # T.truthStatusLabel(t.runtimeTruth.truthStatus) # "\n" #
                "**Risk:** " # T.riskLevelLabel(t.riskProfile.riskLevel) # " — " # T.riskClassLabel(t.riskProfile.riskClass) # "\n\n" #
                "## Summary\n" # t.plainSummary # "\n\n" #
                "## What This Proposal Claims to Change\n" # t.effectPath.claim # "\n\n" #
                "## Expected After-State\n" # t.effectPath.expectedAfterState # "\n\n" #
                "## Risk Assessment\n" # t.riskProfile.explanation # "\n\n" #
                "## Open Questions\n" #
                _bulletsFromArray(t.riskProfile.openQuestions) # "\n" #
                "## Unresolved Questions\n" #
                _bulletsFromArray(t.runtimeTruth.unresolvedQuestions) # "\n\n" #
                "---\n" #
                "*Generated by EffectTrace — Governance Consequence Intelligence for ICP*\n" #
                "*Trace ID: " # t.traceId # "*\n"
            };
        }
    };

    public query func getStats() : async {
        totalTraces : Nat;
        updateCount : Nat;
        identity : Text;
    } {
        {
            totalTraces = traces.size();
            updateCount = _updateCount;
            identity = T.ORO_ENCODED_ID;
        }
    };

    // ================================================================= //
    // RISK RADAR — high-risk traces for operator dashboard              //
    // ================================================================= //

    public query func getHighRiskTraces() : async [T.TraceSummary] {
        let high = Array.filter(Iter.toArray(traces.vals()), func(t : T.EffectTraceRecord) : Bool {
            switch (t.riskProfile.riskLevel) {
                case (#High) { true };
                case (#Critical) { true };
                case _ { false };
            }
        });
        Array.map(high, func(t : T.EffectTraceRecord) : T.TraceSummary {
            {
                traceId = t.traceId;
                proposalId = t.proposalId;
                publicTitle = t.publicTitle;
                riskLevel = t.riskProfile.riskLevel;
                riskClass = t.riskProfile.riskClass;
                truthStatus = t.runtimeTruth.truthStatus;
                confidence = t.confidence;
                status = t.status;
                updatedAt = t.updatedAt;
            }
        })
    };

    // ================================================================= //
    // PRIVATE HELPERS                                                    //
    // ================================================================= //

    private func _recalcConfidence(truth : T.RuntimeTruthBlock, risk : T.RiskProfile) : T.TraceConfidence {
        var score = 0;
        if (truth.claimObserved)      { score += 1 };
        if (truth.payloadObserved)    { score += 2 };
        if (truth.targetIdentified)   { score += 2 };
        if (truth.reviewerConfirmed)  { score += 3 };
        if (truth.executionObserved)  { score += 1 };
        if (truth.afterStateVerified) { score += 3 };
        if (score >= 8)  { #High }
        else if (score >= 4) { #Medium }
        else { #Low }
    };

    private func _traceStatusEq(a : T.TraceStatus, b : T.TraceStatus) : Bool {
        switch (a, b) {
            case (#Draft, #Draft) { true };
            case (#NeedsReview, #NeedsReview) { true };
            case (#CommunityReviewed, #CommunityReviewed) { true };
            case (#ExecutionPending, #ExecutionPending) { true };
            case (#PostExecutionChecked, #PostExecutionChecked) { true };
            case (#Disputed, #Disputed) { true };
            case (#Archived, #Archived) { true };
            case _ { false };
        }
    };

    private func _riskClassEq(a : T.RiskClass, b : T.RiskClass) : Bool {
        T.riskClassLabel(a) == T.riskClassLabel(b)
    };

    private func _bulletsFromArray(arr : [Text]) : Text {
        if (arr.size() == 0) { "- None\n" }
        else {
            var result = "";
            for (item in arr.vals()) {
                result := result # "- " # item # "\n";
            };
            result
        }
    };
}
