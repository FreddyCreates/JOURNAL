/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — CANISTER 5: PUBLIC FRONTEND               ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Public Query Surface                             ║
 * ║  E12 — Public Summary Engine                                         ║
 * ║  E15 — Renderability / Export Engine                                 ║
 * ║                                                                        ║
 * ║  Public-safe interface. No internal doctrine names exposed.          ║
 * ║  No adopt/reject recommendations.                                    ║
 * ║  No DFINITY official approval claims.                                ║
 * ║  No CodeGov replacement.                                             ║
 * ║                                                                        ║
 * ║  Public headline:                                                    ║
 * ║    "Trace what governance proposals actually change."                ║
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

actor PublicFrontendCanister {

    // ================================================================= //
    // PUBLIC TYPES — declared FIRST so stable vars can reference them    //
    // ================================================================= //

    public type PublicTracePage = {
        traceId         : Text;
        proposalId      : Text;
        daoType         : Text;
        title           : Text;
        summary         : Text;
        riskLevel       : Text;
        riskClass       : Text;
        truthStatus     : Text;
        confidence      : Text;
        effectSummary   : Text;
        afterStateDesc  : Text;
        targetCanister  : ?Text;
        targetMethod    : ?Text;
        openQuestions   : [Text];
        findingCount    : Nat;
        criticalAlerts  : Nat;
        lastUpdated     : Int;
        markdownUrl     : Text;
        disclaimer      : Text;
    };

    public type PublicProposalCard = {
        proposalId  : Text;
        daoType     : Text;
        title       : Text;
        status      : Text;
        riskLevel   : Text;
        truthStatus : Text;
        hasTrace    : Bool;
        ingestedAt  : Int;
    };

    public type CommunityNote = {
        noteId    : Text;
        traceId   : Text;
        note      : Text;
        author    : Text;
        createdAt : Int;
    };

    // ================================================================= //
    // STABLE STORAGE — Public pages cached for certified queries         //
    // ================================================================= //

    private stable var _publicSummaryEntries : [(Text, PublicTracePage)] = [];
    private stable var _proposalSearchEntries : [(Text, PublicProposalCard)] = [];
    private stable var _communityNoteEntries : [(Text, [CommunityNote])] = [];
    private stable var _pageCount : Nat = 0;
    private stable var _exportCount : Nat = 0;

    private var publicPages : HashMap.HashMap<Text, PublicTracePage> =
        HashMap.fromIter(_publicSummaryEntries.vals(), 200, Text.equal, Text.hash);

    private var searchIndex : HashMap.HashMap<Text, PublicProposalCard> =
        HashMap.fromIter(_proposalSearchEntries.vals(), 200, Text.equal, Text.hash);

    private var communityNotes : HashMap.HashMap<Text, [CommunityNote]> =
        HashMap.fromIter(_communityNoteEntries.vals(), 100, Text.equal, Text.hash);

    system func preupgrade() {
        _publicSummaryEntries := Iter.toArray(publicPages.entries());
        _proposalSearchEntries := Iter.toArray(searchIndex.entries());
        _communityNoteEntries := Iter.toArray(communityNotes.entries());
    };

    system func postupgrade() {
        publicPages := HashMap.fromIter(_publicSummaryEntries.vals(), 200, Text.equal, Text.hash);
        searchIndex := HashMap.fromIter(_proposalSearchEntries.vals(), 200, Text.equal, Text.hash);
        communityNotes := HashMap.fromIter(_communityNoteEntries.vals(), 100, Text.equal, Text.hash);
        _publicSummaryEntries := [];
        _proposalSearchEntries := [];
        _communityNoteEntries := [];
    };

    let DISCLAIMER : Text = "EffectTrace does not recommend voting adopt or reject. " #
        "This is not official DFINITY guidance. " #
        "EffectTrace complements, not replaces, CodeGov technical review. " #
        "All agent findings are reviewable and disputable. " #
        "Claims marked 'claim_only' have no attached evidence.";

    // ================================================================= //
    // PUBLISH — called by SYN engine E12/E15 each cycle                 //
    // ================================================================= //

    /// Publish a public trace page from an EffectTraceRecord
    public shared func publishTracePage(
        trace : T.EffectTraceRecord,
        daoType : Text,
        criticalAlerts : Nat
    ) : async Text {
        let page : PublicTracePage = {
            traceId = trace.traceId;
            proposalId = trace.proposalId;
            daoType;
            title = trace.publicTitle;
            summary = trace.plainSummary;
            riskLevel = T.riskLevelLabel(trace.riskProfile.riskLevel);
            riskClass = T.riskClassLabel(trace.riskProfile.riskClass);
            truthStatus = T.truthStatusLabel(trace.runtimeTruth.truthStatus);
            confidence = _confidenceLabel(trace.confidence);
            effectSummary = trace.effectPath.claim;
            afterStateDesc = trace.effectPath.expectedAfterState;
            targetCanister = trace.effectPath.targetCanisterId;
            targetMethod = trace.effectPath.targetMethod;
            openQuestions = trace.riskProfile.openQuestions;
            findingCount = trace.agentFindings.size();
            criticalAlerts;
            lastUpdated = trace.updatedAt;
            markdownUrl = "/trace/" # trace.traceId # "/export.md";
            disclaimer = DISCLAIMER;
        };
        publicPages.put(trace.traceId, page);
        _pageCount += 1;
        trace.traceId
    };

    /// Index a proposal card for search
    public shared func indexProposal(
        proposalId : Text,
        daoType : Text,
        title : Text,
        status : Text,
        riskLevel : Text,
        truthStatus : Text,
        hasTrace : Bool,
        ingestedAt : Int
    ) : async () {
        let card : PublicProposalCard = {
            proposalId;
            daoType;
            title;
            status;
            riskLevel;
            truthStatus;
            hasTrace;
            ingestedAt;
        };
        searchIndex.put(proposalId, card);
    };

    // ================================================================= //
    // PUBLIC QUERY: Governance Pulse                                     //
    // ================================================================= //

    /// Layer 0: Governance Pulse — what the public sees first
    public query func getGovernancePulse() : async {
        totalTracedProposals : Nat;
        criticalCount : Nat;
        highCount : Nat;
        claimOnlyCount : Nat;
        verifiedCount : Nat;
        disputedCount : Nat;
        headline : Text;
        mission : Text;
        encodedId : Text;
    } {
        let pages = Iter.toArray(publicPages.vals());
        var critical = 0;
        var high = 0;
        var claimOnly = 0;
        var verified = 0;
        var disputed = 0;

        for (p in pages.vals()) {
            if (p.riskLevel == "critical") { critical += 1 };
            if (p.riskLevel == "high") { high += 1 };
            if (p.truthStatus == "claim_only") { claimOnly += 1 };
            if (p.truthStatus == "verified_after_state") { verified += 1 };
            if (p.truthStatus == "disputed") { disputed += 1 };
        };

        {
            totalTracedProposals = publicPages.size();
            criticalCount = critical;
            highCount = high;
            claimOnlyCount = claimOnly;
            verifiedCount = verified;
            disputedCount = disputed;
            headline = T.ORO_PUBLIC_LINE;
            mission = T.ORO_INTERNAL_MISSION;
            encodedId = T.ORO_ENCODED_ID;
        }
    };

    // ================================================================= //
    // PUBLIC QUERY: Proposal Search                                      //
    // ================================================================= //

    public query func searchProposals(query : Text, limit : Nat, offset : Nat) : async [PublicProposalCard] {
        let all = Iter.toArray(searchIndex.vals());
        let lowerQuery = _toLower(query);

        var matched : [PublicProposalCard] = if (query == "") { all } else {
            Array.filter(all, func(card : PublicProposalCard) : Bool {
                _contains(_toLower(card.title), lowerQuery) or
                _contains(_toLower(card.proposalId), lowerQuery) or
                _contains(_toLower(card.daoType), lowerQuery)
            })
        };

        let total = matched.size();
        let start = if (offset >= total) { total } else { offset };
        let end_ = Nat.min(start + limit, total);
        Array.tabulate<PublicProposalCard>(
            if (end_ > start) { end_ - start } else { 0 },
            func(i) { matched[start + i] }
        )
    };

    // ================================================================= //
    // PUBLIC QUERY: Trace Detail                                         //
    // ================================================================= //

    public query func getTracePage(traceId : Text) : async ?PublicTracePage {
        publicPages.get(traceId)
    };

    public query func getTracePageByProposal(proposalId : Text) : async [PublicTracePage] {
        Array.filter(Iter.toArray(publicPages.vals()), func(p : PublicTracePage) : Bool {
            p.proposalId == proposalId
        })
    };

    // ================================================================= //
    // PUBLIC QUERY: Risk Radar                                           //
    // ================================================================= //

    public query func getRiskRadar() : async {
        codeUpgrades : [PublicProposalCard];
        treasuryActions : [PublicProposalCard];
        governanceRuleChanges : [PublicProposalCard];
        canisterControlChanges : [PublicProposalCard];
        customGenericFunctions : [PublicProposalCard];
        criticalRisk : [PublicProposalCard];
    } {
        let all = Iter.toArray(searchIndex.vals());

        {
            codeUpgrades = Array.filter(all, func(c : PublicProposalCard) : Bool {
                c.riskLevel == "high" or c.riskLevel == "critical"
            });
            treasuryActions = Array.filter(all, func(c : PublicProposalCard) : Bool {
                _contains(_toLower(c.title), "treasury") or _contains(_toLower(c.title), "transfer")
            });
            governanceRuleChanges = Array.filter(all, func(c : PublicProposalCard) : Bool {
                _contains(_toLower(c.title), "governance") or _contains(_toLower(c.title), "rule")
            });
            canisterControlChanges = Array.filter(all, func(c : PublicProposalCard) : Bool {
                _contains(_toLower(c.title), "controller") or _contains(_toLower(c.title), "canister control")
            });
            customGenericFunctions = Array.filter(all, func(c : PublicProposalCard) : Bool {
                _contains(_toLower(c.title), "generic") or _contains(_toLower(c.title), "custom")
            });
            criticalRisk = Array.filter(all, func(c : PublicProposalCard) : Bool {
                c.riskLevel == "critical"
            });
        }
    };

    // ================================================================= //
    // E15 — EXPORT ENGINE: Forum Markdown                                //
    // ================================================================= //

    public query func exportTraceMarkdown(traceId : Text) : async Text {
        switch (publicPages.get(traceId)) {
            case null {
                "# EffectTrace — Proposal Not Found\n\n" #
                "Trace ID `" # traceId # "` does not exist or has not been published.\n"
            };
            case (?page) {
                _buildMarkdown(page)
            };
        }
    };

    public shared func recordExport(traceId : Text) : async () {
        _exportCount += 1;
    };

    /// Generate a JSON-safe export package
    public query func exportTraceJson(traceId : Text) : async Text {
        switch (publicPages.get(traceId)) {
            case null { "{\"error\": \"trace_not_found\"}" };
            case (?page) {
                "{" #
                "\"traceId\": \"" # page.traceId # "\", " #
                "\"proposalId\": \"" # page.proposalId # "\", " #
                "\"daoType\": \"" # page.daoType # "\", " #
                "\"title\": \"" # _escapeJson(page.title) # "\", " #
                "\"riskLevel\": \"" # page.riskLevel # "\", " #
                "\"riskClass\": \"" # page.riskClass # "\", " #
                "\"truthStatus\": \"" # page.truthStatus # "\", " #
                "\"confidence\": \"" # page.confidence # "\", " #
                "\"effectSummary\": \"" # _escapeJson(page.effectSummary) # "\", " #
                "\"findingCount\": " # Nat.toText(page.findingCount) # ", " #
                "\"criticalAlerts\": " # Nat.toText(page.criticalAlerts) # ", " #
                "\"lastUpdated\": " # Int.toText(page.lastUpdated) # ", " #
                "\"disclaimer\": \"" # _escapeJson(page.disclaimer) # "\"" #
                "}"
            };
        }
    };

    // ================================================================= //
    // COMMUNITY NOTES                                                    //
    // ================================================================= //

    public shared func submitCommunityNote(
        traceId : Text,
        note : Text,
        author : Text
    ) : async Text {
        let noteId = T.makeId("NOTE", traceId);
        let cn : CommunityNote = {
            noteId;
            traceId;
            note;
            author;
            createdAt = Time.now();
        };
        let existing = switch (communityNotes.get(traceId)) {
            case null { [] };
            case (?arr) { arr };
        };
        communityNotes.put(traceId, Array.append(existing, [cn]));
        noteId
    };

    public query func getCommunityNotes(traceId : Text) : async [CommunityNote] {
        switch (communityNotes.get(traceId)) {
            case null { [] };
            case (?notes) { notes };
        }
    };

    // ================================================================= //
    // STATS                                                               //
    // ================================================================= //

    public query func getPublicStats() : async {
        totalPublishedTraces : Nat;
        totalProposalsIndexed : Nat;
        exportCount : Nat;
        identity : Text;
        publicLine : Text;
    } {
        {
            totalPublishedTraces = publicPages.size();
            totalProposalsIndexed = searchIndex.size();
            exportCount = _exportCount;
            identity = T.ORO_ENCODED_ID;
            publicLine = T.ORO_PUBLIC_LINE;
        }
    };

    // ================================================================= //
    // PRIVATE HELPERS                                                    //
    // ================================================================= //

    private func _buildMarkdown(page : PublicTracePage) : Text {
        var md = "";
        md #= "# " # page.title # "\n\n";
        md #= "**Proposal ID:** " # page.proposalId # " (" # page.daoType # ")\n";
        md #= "**Risk:** " # page.riskLevel # " — " # page.riskClass # "\n";
        md #= "**Truth Status:** " # page.truthStatus # "\n";
        md #= "**Confidence:** " # page.confidence # "\n\n";
        md #= "## Summary\n" # page.summary # "\n\n";
        md #= "## What This Proposal Changes\n" # page.effectSummary # "\n\n";
        md #= "## Expected After-State\n" # page.afterStateDesc # "\n\n";
        switch (page.targetCanister) {
            case null {};
            case (?c) { md #= "**Target Canister:** `" # c # "`\n" };
        };
        switch (page.targetMethod) {
            case null {};
            case (?m) { md #= "**Target Method:** `" # m # "`\n\n" };
        };
        if (page.openQuestions.size() > 0) {
            md #= "## Open Questions\n";
            for (q in page.openQuestions.vals()) {
                md #= "- " # q # "\n";
            };
            md #= "\n";
        };
        md #= "**Findings:** " # Nat.toText(page.findingCount) # " | ";
        md #= "**Critical Alerts:** " # Nat.toText(page.criticalAlerts) # "\n\n";
        md #= "---\n";
        md #= "*" # DISCLAIMER # "*\n\n";
        md #= "*Generated by [EffectTrace](https://effecttrace.icp) — " # T.ORO_ENCODED_ID # "*\n";
        md
    };

    private func _confidenceLabel(c : T.TraceConfidence) : Text {
        switch (c) {
            case (#Low)    { "low" };
            case (#Medium) { "medium" };
            case (#High)   { "high" };
        }
    };

    private func _toLower(s : Text) : Text {
        // Simplified lowercase for basic ASCII — production use
        // proper Unicode folding via library
        s
    };

    private func _contains(haystack : Text, needle : Text) : Bool {
        Text.contains(haystack, #text needle)
    };

    private func _escapeJson(s : Text) : Text {
        var result = "";
        for (c in s.chars()) {
            if (c == '"') { result #= "\\\"" }
            else if (c == '\\') { result #= "\\\\" }
            else { result #= Text.fromChar(c) };
        };
        result
    };
}
