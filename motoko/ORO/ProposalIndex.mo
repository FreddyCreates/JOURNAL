/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — CANISTER 1: PROPOSAL INDEX                ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Ring 1 of 3                                       ║
 * ║  SYN Engine: 24-hour autonomous execution cycle                       ║
 * ║                                                                        ║
 * ║  E1 — Proposal Ingest Engine                                         ║
 * ║  E2 — Payload Parser Engine                                          ║
 * ║  E3 — Target Resolver Engine                                         ║
 * ║                                                                        ║
 * ║  Stores: NNS/SNS proposal metadata, status changes,                  ║
 * ║  ingest timestamps, proposal-to-trace index.                          ║
 * ║                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                       ║
 * ║  PROPRIETARY AND CONFIDENTIAL                                          ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

import Array  "mo:base/Array";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int    "mo:base/Int";
import Iter   "mo:base/Iter";
import Nat    "mo:base/Nat";
import Option "mo:base/Option";
import Text   "mo:base/Text";
import Time   "mo:base/Time";

import T "Types";

actor ProposalIndexCanister {

    // ================================================================= //
    // STABLE STORAGE                                                      //
    // ================================================================= //

    /// Stable arrays for upgrade persistence
    private stable var _proposalEntries : [(Text, T.ProposalRecord)] = [];
    private stable var _traceIndexEntries : [(Text, [Text])] = [];
    private stable var _ingestCount : Nat = 0;
    private stable var _refreshCount : Nat = 0;
    private stable var _lastSynTick : Int = 0;
    private stable var _cycleNumber : Nat = 0;

    /// In-memory maps (rebuilt from stable on upgrade)
    private var proposals : HashMap.HashMap<Text, T.ProposalRecord> =
        HashMap.fromIter(_proposalEntries.vals(), 100, Text.equal, Text.hash);

    /// Maps proposalId → [traceId] for the EffectTrace canister
    private var traceIndex : HashMap.HashMap<Text, [Text]> =
        HashMap.fromIter(_traceIndexEntries.vals(), 100, Text.equal, Text.hash);

    // ================================================================= //
    // SYSTEM HOOKS                                                        //
    // ================================================================= //

    system func preupgrade() {
        _proposalEntries := Iter.toArray(proposals.entries());
        _traceIndexEntries := Iter.toArray(traceIndex.entries());
    };

    system func postupgrade() {
        proposals := HashMap.fromIter(_proposalEntries.vals(), 100, Text.equal, Text.hash);
        traceIndex := HashMap.fromIter(_traceIndexEntries.vals(), 100, Text.equal, Text.hash);
        _proposalEntries := [];
        _traceIndexEntries := [];
    };

    // ================================================================= //
    // E1 — PROPOSAL INGEST ENGINE                                        //
    // ================================================================= //

    /// Ingest a new proposal record (manual or adapter-driven)
    public shared func ingestProposal(
        proposalId : Text,
        daoType : T.DaoType,
        title : Text,
        summary : Text,
        url : ?Text,
        topic : ?Text,
        proposalType : ?Text,
        actionType : ?Text,
        proposer : ?Text,
        status : T.ProposalStatus,
        createdAt : ?Int,
        rawPayload : ?Text,
        sourceLinks : [T.SourceLink],
        snsRootCanisterId : ?Text,
        governanceCanisterId : ?Text
    ) : async Text {
        let now = Time.now();
        let record : T.ProposalRecord = {
            proposalId;
            daoType;
            snsRootCanisterId;
            governanceCanisterId;
            title;
            summary;
            url;
            topic;
            proposalType;
            actionType;
            proposer;
            status;
            createdAt;
            decidedAt = null;
            executedAt = null;
            rawPayload;
            sourceLinks;
            ingestedAt = now;
            lastRefreshed = now;
        };

        proposals.put(proposalId, record);
        _ingestCount += 1;
        proposalId
    };

    /// Batch ingest — used by SYN engine on 24-hour execution cycle
    public shared func batchIngest(inputs : [{
        proposalId : Text;
        daoType : T.DaoType;
        title : Text;
        summary : Text;
        url : ?Text;
        topic : ?Text;
        proposalType : ?Text;
        actionType : ?Text;
        proposer : ?Text;
        status : T.ProposalStatus;
        createdAt : ?Int;
        rawPayload : ?Text;
        sourceLinks : [T.SourceLink];
        snsRootCanisterId : ?Text;
        governanceCanisterId : ?Text;
    }]) : async Nat {
        let now = Time.now();
        var count = 0;
        for (input in inputs.vals()) {
            let record : T.ProposalRecord = {
                proposalId = input.proposalId;
                daoType = input.daoType;
                snsRootCanisterId = input.snsRootCanisterId;
                governanceCanisterId = input.governanceCanisterId;
                title = input.title;
                summary = input.summary;
                url = input.url;
                topic = input.topic;
                proposalType = input.proposalType;
                actionType = input.actionType;
                proposer = input.proposer;
                status = input.status;
                createdAt = input.createdAt;
                decidedAt = null;
                executedAt = null;
                rawPayload = input.rawPayload;
                sourceLinks = input.sourceLinks;
                ingestedAt = now;
                lastRefreshed = now;
            };
            proposals.put(input.proposalId, record);
            _ingestCount += 1;
            count += 1;
        };
        count
    };

    // ================================================================= //
    // E2/E3 — PAYLOAD PARSER + TARGET RESOLVER (status refresh)         //
    // ================================================================= //

    /// Refresh status of a known proposal (call on each SYN tick)
    public shared func refreshProposalStatus(
        proposalId : Text,
        newStatus : T.ProposalStatus,
        decidedAt : ?Int,
        executedAt : ?Int,
        failureReason : ?Text
    ) : async Bool {
        switch (proposals.get(proposalId)) {
            case null { false };
            case (?existing) {
                let updated : T.ProposalRecord = {
                    proposalId = existing.proposalId;
                    daoType = existing.daoType;
                    snsRootCanisterId = existing.snsRootCanisterId;
                    governanceCanisterId = existing.governanceCanisterId;
                    title = existing.title;
                    summary = existing.summary;
                    url = existing.url;
                    topic = existing.topic;
                    proposalType = existing.proposalType;
                    actionType = existing.actionType;
                    proposer = existing.proposer;
                    status = newStatus;
                    createdAt = existing.createdAt;
                    decidedAt;
                    executedAt;
                    rawPayload = switch (failureReason) {
                        case null { existing.rawPayload };
                        case (?reason) { ?("FAILED: " # reason) };
                    };
                    sourceLinks = existing.sourceLinks;
                    ingestedAt = existing.ingestedAt;
                    lastRefreshed = Time.now();
                };
                proposals.put(proposalId, updated);
                _refreshCount += 1;
                true
            };
        }
    };

    /// Register a trace ID under a proposal (called by EffectTrace canister)
    public shared func registerTrace(proposalId : Text, traceId : Text) : async () {
        let existing = switch (traceIndex.get(proposalId)) {
            case null { [] };
            case (?arr) { arr };
        };
        traceIndex.put(proposalId, Array.append(existing, [traceId]));
    };

    // ================================================================= //
    // QUERY METHODS                                                       //
    // ================================================================= //

    public query func getProposal(id : Text) : async ?T.ProposalRecord {
        proposals.get(id)
    };

    public query func listProposals(filter : T.ProposalFilter) : async [T.ProposalSummary] {
        let all = Iter.toArray(proposals.vals());
        var filtered : [T.ProposalRecord] = all;

        // Filter by daoType
        switch (filter.daoType) {
            case null {};
            case (?dt) {
                filtered := Array.filter(filtered, func (p : T.ProposalRecord) : Bool {
                    switch (p.daoType, dt) {
                        case (#NNS, #NNS) { true };
                        case (#SNS, #SNS) { true };
                        case _ { false };
                    }
                });
            };
        };

        // Filter by status
        switch (filter.status) {
            case null {};
            case (?st) {
                filtered := Array.filter(filtered, func (p : T.ProposalRecord) : Bool {
                    _statusEq(p.status, st)
                });
            };
        };

        // Apply offset and limit
        let total = filtered.size();
        let start = if (filter.offset >= total) { total } else { filter.offset };
        let end_ = Nat.min(start + filter.limit, total);
        let page = Array.tabulate<T.ProposalRecord>(
            if (end_ > start) { end_ - start } else { 0 },
            func(i) { filtered[start + i] }
        );

        Array.map(page, func (p : T.ProposalRecord) : T.ProposalSummary {
            {
                proposalId = p.proposalId;
                daoType = p.daoType;
                title = p.title;
                status = p.status;
                riskLevel = null;    // set by EffectTrace canister
                truthStatus = null;
                ingestedAt = p.ingestedAt;
            }
        })
    };

    public query func getTraceIds(proposalId : Text) : async [Text] {
        switch (traceIndex.get(proposalId)) {
            case null { [] };
            case (?ids) { ids };
        }
    };

    public query func getStats() : async {
        totalProposals : Nat;
        ingestCount : Nat;
        refreshCount : Nat;
        lastSynTick : Int;
        cycleNumber : Nat;
        identity : Text;
        synCycleNs : Int;
    } {
        {
            totalProposals = proposals.size();
            ingestCount = _ingestCount;
            refreshCount = _refreshCount;
            lastSynTick = _lastSynTick;
            cycleNumber = _cycleNumber;
            identity = T.ORO_ENCODED_ID;
            synCycleNs = T.SYN_CYCLE_NS;
        }
    };

    /// Called by SYN engine at start of each 24-hour tick
    public shared func recordSynTick(cycleNumber : Nat) : async () {
        _lastSynTick := Time.now();
        _cycleNumber := cycleNumber;
    };

    // ================================================================= //
    // LIVE GOVERNANCE PULSE — open high-risk proposals                  //
    // ================================================================= //

    public query func getOpenProposals() : async [T.ProposalSummary] {
        let open = Array.filter(Iter.toArray(proposals.vals()), func(p : T.ProposalRecord) : Bool {
            _statusEq(p.status, #Open)
        });
        Array.map(open, func (p : T.ProposalRecord) : T.ProposalSummary {
            {
                proposalId = p.proposalId;
                daoType = p.daoType;
                title = p.title;
                status = p.status;
                riskLevel = null;
                truthStatus = null;
                ingestedAt = p.ingestedAt;
            }
        })
    };

    public query func getAdoptedPendingExecution() : async [T.ProposalSummary] {
        let adopted = Array.filter(Iter.toArray(proposals.vals()), func(p : T.ProposalRecord) : Bool {
            _statusEq(p.status, #Adopted)
        });
        Array.map(adopted, func (p : T.ProposalRecord) : T.ProposalSummary {
            {
                proposalId = p.proposalId;
                daoType = p.daoType;
                title = p.title;
                status = p.status;
                riskLevel = null;
                truthStatus = null;
                ingestedAt = p.ingestedAt;
            }
        })
    };

    // ================================================================= //
    // PRIVATE HELPERS                                                    //
    // ================================================================= //

    private func _statusEq(a : T.ProposalStatus, b : T.ProposalStatus) : Bool {
        switch (a, b) {
            case (#Open, #Open)         { true };
            case (#Adopted, #Adopted)   { true };
            case (#Rejected, #Rejected) { true };
            case (#Executed, #Executed) { true };
            case (#Failed, #Failed)     { true };
            case (#Unknown, #Unknown)   { true };
            case _                      { false };
        }
    };
}
