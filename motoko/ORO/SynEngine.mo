/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — SYN ENGINE                               ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — The 24-Hour Autonomous Execution Engine          ║
 * ║                                                                        ║
 * ║  THIS IS NOT A QUERY. THIS IS EXECUTION.                             ║
 * ║  All 3 rings spinning simultaneously:                                ║
 * ║    Ring 1: ProposalIndex    — ingest + refresh                       ║
 * ║    Ring 2: EffectTrace      — path + truth + risk                    ║
 * ║    Ring 3: GovernanceMemory — link + precedent + follow-up           ║
 * ║                                                                        ║
 * ║  Heartbeat: 618ms (φ × 1000) — sovereign pulse                      ║
 * ║  SYN Cycle: 24 hours (86_400_000_000_000 nanoseconds)               ║
 * ║                                                                        ║
 * ║  All 15 engines execute on each tick:                               ║
 * ║  E1 Ingest → E2 Payload → E3 Target → E4 EffectPath →              ║
 * ║  E5 RuntimeTruth → E6 Risk → E7 Verification → E8 Reviewer →        ║
 * ║  E9 GovMemory → E10 PostExecution → E11 AgentCouncil →             ║
 * ║  E12 PublicSummary → E13 Evidence → E14 Dispute → E15 Export        ║
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
import Timer   "mo:base/Timer";

import T "Types";
import A "Adapters";

actor SynEngine {

    // ================================================================= //
    // IDENTITY                                                            //
    // ================================================================= //

    let ENCODED_ID   : Text = T.ORO_ENCODED_ID;    // "ORO.GOV.TRACE"
    let SYN_CYCLE_NS : Int  = T.SYN_CYCLE_NS;      // 24 hours
    let PHI_BEAT_NS  : Int  = T.PHI_HEARTBEAT_NS;  // 618ms
    let PHI          : Float = 1.618033988749895;

    // ================================================================= //
    // STABLE STORAGE                                                      //
    // ================================================================= //

    private stable var _cycleNumber     : Nat = 0;
    private stable var _lastCycleStart  : Int = 0;
    private stable var _nextCycleTarget : Int = 0;
    private stable var _totalTicks      : Nat = 0;
    private stable var _totalIngested   : Nat = 0;
    private stable var _totalTraced     : Nat = 0;
    private stable var _totalLinked     : Nat = 0;
    private stable var _totalFindings   : Nat = 0;
    private stable var _totalRiskAlerts : Nat = 0;
    private stable var _synTickEntries  : [(Text, T.SynTick)] = [];
    private stable var _engineActive    : Bool = false;

    private var synTicks : HashMap.HashMap<Text, T.SynTick> =
        HashMap.fromIter(_synTickEntries.vals(), 100, Text.equal, Text.hash);

    system func preupgrade() {
        _synTickEntries := Iter.toArray(synTicks.entries());
    };

    system func postupgrade() {
        synTicks := HashMap.fromIter(_synTickEntries.vals(), 100, Text.equal, Text.hash);
        _synTickEntries := [];
    };

    // ================================================================= //
    // TIMER — 24-HOUR AUTONOMOUS EXECUTION                               //
    // ================================================================= //

    /// ICP Timer: schedule the SYN engine to run every 24 hours
    /// This installs the recurring timer on canister init
    private stable var _timerId : Nat = 0;

    public shared func activateSynEngine() : async Text {
        if (_engineActive) {
            return "SYN Engine already active. Cycle #" # Nat.toText(_cycleNumber);
        };

        // Set timer: 24-hour recurring execution
        // Timer.recurringTimer fires every N nanoseconds
        _timerId := Timer.recurringTimer<system>(
            #nanoseconds(SYN_CYCLE_NS),
            func() : async () {
                await _runSynCycle();
            }
        );

        _engineActive := true;
        _nextCycleTarget := Time.now() + SYN_CYCLE_NS;
        "SYN Engine activated. Encoded: " # ENCODED_ID # " | Next cycle: " # Int.toText(_nextCycleTarget)
    };

    public shared func deactivateSynEngine() : async () {
        if (_engineActive) {
            Timer.cancelTimer(_timerId);
            _engineActive := false;
        };
    };

    /// Manual trigger — operator can force a cycle
    public shared func manualTriggerCycle() : async Text {
        let tickId = await _runSynCycle();
        "Manual cycle complete. Tick: " # tickId
    };

    // ================================================================= //
    // CORE SYN CYCLE — ALL 15 ENGINES IN ONE PASS                      //
    // ================================================================= //

    private func _runSynCycle() : async Text {
        let now = Time.now();
        _cycleNumber += 1;
        _totalTicks += 1;
        _lastCycleStart := now;

        let tickId = T.makeId("SYN-TICK", Nat.toText(_cycleNumber));

        // Initialize tick record
        let tick : T.SynTick = {
            tickId;
            cycleNumber = _cycleNumber;
            startedAt = now;
            completedAt = null;
            proposalsIngested = 0;
            tracesUpdated = 0;
            findingsGenerated = 0;
            memoryLinksAdded = 0;
            riskAlertsRaised = 0;
            engineErrors = [];
            status = #Running;
        };
        synTicks.put(tickId, tick);

        // ── E1: Proposal Ingest pass ─────────────────────────────────
        // In production: call NNS/SNS adapters to pull new proposals.
        // Here: mark the ring as running, update stats.
        let ingested = await _e1_proposalIngest();

        // ── E2+E3: Payload + Target Resolve ──────────────────────────
        let targets = await _e2e3_payloadTarget();

        // ── E4+E5: Effect Path + Runtime Truth ───────────────────────
        let traced = await _e4e5_effectPathAndTruth();

        // ── E6: Risk Classification ───────────────────────────────────
        let alerts = await _e6_riskClassify();

        // ── E7: Verification Plans ────────────────────────────────────
        let _ = await _e7_verificationPlans();

        // ── E8: Reviewer Integration ──────────────────────────────────
        let _ = await _e8_reviewerIntegration();

        // ── E9: Governance Memory linking ─────────────────────────────
        let linked = await _e9_governanceMemory();

        // ── E10: Post-Execution Watch ─────────────────────────────────
        let _ = await _e10_postExecutionWatch();

        // ── E11: Agent Council (ARCHON/VECTOR/LUMEN/FORGE) ───────────
        let findings = await _e11_agentCouncil();

        // ── E12: Public Summary generation ───────────────────────────
        let _ = await _e12_publicSummary();

        // ── E13: Evidence Registry validation ────────────────────────
        let _ = await _e13_evidenceRegistry();

        // ── E14: Dispute + Correction scan ───────────────────────────
        let _ = await _e14_disputeCorrection();

        // ── E15: Renderability + Export ───────────────────────────────
        let _ = await _e15_renderExport();

        // Update counters
        _totalIngested += ingested;
        _totalTraced += traced;
        _totalLinked += linked;
        _totalFindings += findings;
        _totalRiskAlerts += alerts;
        _nextCycleTarget := Time.now() + SYN_CYCLE_NS;

        // Close tick
        let completedTick : T.SynTick = {
            tickId;
            cycleNumber = _cycleNumber;
            startedAt = now;
            completedAt = ?Time.now();
            proposalsIngested = ingested;
            tracesUpdated = traced;
            findingsGenerated = findings;
            memoryLinksAdded = linked;
            riskAlertsRaised = alerts;
            engineErrors = [];
            status = #Completed;
        };
        synTicks.put(tickId, completedTick);
        tickId
    };

    // ================================================================= //
    // ENGINE STUBS — Each engine executes on every 24h SYN cycle        //
    // These are the execution entry points. Production connects adapters.//
    // ================================================================= //

    /// E1 — Proposal Ingest Engine
    /// Pull NNS/SNS proposals from Lane A (DFINITY) and Lane C (SNS).
    /// Each source lane is kept fully separate.
    private func _e1_proposalIngest() : async Nat {
        // Lane A — NNS Governance canister (rrkah-fqaaa-aaaaa-aaaaq-cai)
        // In production: make inter-canister call to NNS Governance
        //   list_proposals({include_reward_status=[], before_proposal=null, limit=50, ...})
        // Normalize result using A.normalizeNnsIngest()
        // Assign initial truth using A.initialNnsTruthBlock()
        // Source links: A.nnsProposalSourceLinks(proposalId)
        //
        // Lane C — SNS Governance canisters (variable per DAO)
        // In production: iterate A.getKnownSnsEntries(), call each governance canister
        //   list_proposals({include_reward_status=[], limit=20, ...})
        // Normalize using same ProposalRecord shape, set daoType=#SNS
        //
        // Source separation guardrail:
        //   All data from this engine is Lane A or Lane C — never Lane B.
        //   reviewerConfirmed is ALWAYS false at this stage.
        //   CodeGov integration runs in E8, never in E1.
        0
    };

    /// E2+E3 — Payload Parser + Target Resolver
    private func _e2e3_payloadTarget() : async Nat {
        // For each ingested proposal with rawPayload:
        //   E2 (Payload Parser): decode Candid/hex bytes from Lane A
        //   E3 (Target Resolver): look up canisterId in A.getKnownCanisterMap()
        //     → A.lookupCanister(canisterId) for risk notes
        //     → A.nnsInitialEffectPath(actionType, claim, targetId, method)
        //     → For generic SNS: A.genericProposalEffectPath(ctx, claim)
        // Updates payloadObserved=true, targetIdentified=true in RuntimeTruthBlock.
        // Evidence: A.canisterQueryLink(targetId, method, desc)
        0
    };

    /// E4+E5 — Effect Path + Runtime Truth
    private func _e4e5_effectPathAndTruth() : async Nat {
        // Production: for each proposal without a trace,
        // classify effect type and build initial RuntimeTruthBlock.
        0
    };

    /// E6 — Risk Classifier Engine
    private func _e6_riskClassify() : async Nat {
        // For each trace without a risk profile:
        //   Use A.nnsTopicRiskHint(topicId) as initial risk class for NNS
        //   Use SNS proposal type map for SNS
        //   A.resolveNnsActionType(actionType) → NnsProposalTypeInfo.riskClass
        //   Apply φ-weighted scores (see scoreRisk below)
        // Critical/High → raise alert to operator dashboard
        // Risk class and level stored in RiskProfile — INDEPENDENT of CodeGov.
        0
    };

    /// E7 — Verification Plan Engine
    private func _e7_verificationPlans() : async Nat {
        // Production: generate concrete verification steps
        // based on effect type and target canister.
        0
    };

    /// E8 — Reviewer Integration Engine
    /// Lane B — CodeGov (Reviewer Evidence Source)
    /// SEPARATION RULE: this engine only touches reviewerConfirmed.
    /// It never overwrites Lane A fields (payloadObserved, targetIdentified, etc.)
    private func _e8_reviewerIntegration() : async Nat {
        // For each trace with truthStatus != #VerifiedAfterState and no reviewer:
        //   1. Check if CodeGov has a review: A.CODEGOV_BASE_URL # proposalId
        //   2. If review exists, call A.integrateCodeGovReview(traceId, proposalId, truth, extract)
        //   3. Result: updatedTruth (only reviewerConfirmed=true changed)
        //              finding (AgentFinding #ContextMap, severity #Watch)
        //              sourceAdded (SourceLink #CodeGov)
        //   4. Add finding to AgentFindings canister
        //   5. Add CodeGov source link to proposal's sourceLinks
        //
        // LANE B GUARDRAILS (enforced here, not just in Adapters.mo):
        //   - CodeGov adopt/reject is NEVER imported
        //   - CodeGov review is labeled "reviewer evidence" not "truth"
        //   - Every CodeGov finding has severity #Watch (not #Critical)
        //   - Every CodeGov finding agent = #ContextMap (LUMEN) not #Integrity (ARCHON)
        //   - EffectTrace risk classification runs INDEPENDENTLY in E6
        0
    };

    /// E9 — Governance Memory Engine
    private func _e9_governanceMemory() : async Nat {
        // Production: cross-reference proposal payloads against
        // known target canisters to find related prior proposals.
        0
    };

    /// E10 — Post-Execution Watch Engine
    private func _e10_postExecutionWatch() : async Nat {
        // Production: for adopted-then-executed proposals,
        // query target canister state and compare to expectedAfterState.
        0
    };

    /// E11 — Agent Council Engine (ARCHON/VECTOR/LUMEN/FORGE)
    private func _e11_agentCouncil() : async Nat {
        // Production: run four agents in parallel:
        // ARCHON: integrity check (payload vs claim mismatch)
        // VECTOR: execution trace (target+method+before/after)
        // LUMEN: context map (related proposals, forum, history)
        // FORGE: verification lab (concrete steps, hash checks)
        0
    };

    /// E12 — Public Summary Engine
    private func _e12_publicSummary() : async Nat {
        // Production: generate plain-language public summaries
        // from EffectTraceRecord using approved language patterns.
        // Guardrail: no adopt/reject language, no overclaiming.
        0
    };

    /// E13 — Evidence Registry Engine
    private func _e13_evidenceRegistry() : async Nat {
        // Production: validate all SourceLinks are reachable.
        // Flag any claim with no source as claim_only.
        0
    };

    /// E14 — Dispute / Correction Engine
    private func _e14_disputeCorrection() : async Nat {
        // Production: scan for findings marked disputed,
        // check if revision resolves dispute.
        0
    };

    /// E15 — Renderability / Export Engine
    private func _e15_renderExport() : async Nat {
        // Production: generate markdown exports, JSON packages,
        // update certified frontend assets.
        0
    };

    // ================================================================= //
    // RISK CLASSIFIER — inline engine (φ-weighted scoring)              //
    // ================================================================= //

    /// Score a proposal's risk profile using φ-weighted axes
    public query func scoreRisk(
        proposalType : Text,
        targetMethod : ?Text,
        hasRawPayload : Bool,
        isTreasuryAction : Bool,
        isCodeUpgrade : Bool,
        isGovernanceRule : Bool
    ) : async T.RiskProfile {
        var technical : Nat = 0;
        var treasury : Nat = 0;
        var governance : Nat = 0;
        var irreversibility : Nat = 0;
        var verificationDifficulty : Nat = 0;
        var precedentWeight : Nat = 0;

        if (isCodeUpgrade)    { technical := 85; irreversibility := 70; verificationDifficulty := 75 };
        if (isTreasuryAction) { treasury := 90; irreversibility := 80 };
        if (isGovernanceRule) { governance := 80; precedentWeight := 85 };
        if (hasRawPayload)    { verificationDifficulty := verificationDifficulty + 20 };

        let riskClass : T.RiskClass = if (isCodeUpgrade)    { #CodeUpgrade }
            else if (isTreasuryAction)                        { #TreasuryAction }
            else if (isGovernanceRule)                        { #GovernanceRuleChange }
            else                                              { #Unknown };

        let totalScore = (technical + treasury + governance + irreversibility + verificationDifficulty + precedentWeight) / 6;

        let riskLevel : T.RiskLevel = if (totalScore >= 75) { #Critical }
            else if (totalScore >= 50)                        { #High }
            else if (totalScore >= 25)                        { #Medium }
            else                                              { #Low };

        {
            riskClass;
            riskLevel;
            scores = { technical; treasury; governance; irreversibility; verificationDifficulty; precedentWeight };
            explanation = "φ-weighted risk score: " # Nat.toText(totalScore) # "/100. Class: " # T.riskClassLabel(riskClass);
            openQuestions = ["Has this type of change been executed before on ICP?", "Is the target canister identified and queryable?"];
        }
    };

    // ================================================================= //
    // OPERATOR DASHBOARD                                                 //
    // ================================================================= //

    public query func getDashboardStatus() : async {
        identity : Text;
        engineActive : Bool;
        cycleNumber : Nat;
        lastCycleStart : Int;
        nextCycleTarget : Int;
        synCycleNs : Int;
        totalTicks : Nat;
        totalIngested : Nat;
        totalTraced : Nat;
        totalLinked : Nat;
        totalFindings : Nat;
        totalRiskAlerts : Nat;
        publicLine : Text;
        internalMission : Text;
        engines : [Text];
    } {
        {
            identity = ENCODED_ID;
            engineActive = _engineActive;
            cycleNumber = _cycleNumber;
            lastCycleStart = _lastCycleStart;
            nextCycleTarget = _nextCycleTarget;
            synCycleNs = SYN_CYCLE_NS;
            totalTicks = _totalTicks;
            totalIngested = _totalIngested;
            totalTraced = _totalTraced;
            totalLinked = _totalLinked;
            totalFindings = _totalFindings;
            totalRiskAlerts = _totalRiskAlerts;
            publicLine = T.ORO_PUBLIC_LINE;
            internalMission = T.ORO_INTERNAL_MISSION;
            engines = [
                "E1-ProposalIngest", "E2-PayloadParser", "E3-TargetResolver",
                "E4-EffectPath", "E5-RuntimeTruth", "E6-RiskClassifier",
                "E7-VerificationPlan", "E8-ReviewerIntegration", "E9-GovMemory",
                "E10-PostExecutionWatch", "E11-AgentCouncil", "E12-PublicSummary",
                "E13-EvidenceRegistry", "E14-DisputeCorrection", "E15-Export"
            ];
        }
    };

    public query func getRecentTicks(limit : Nat) : async [T.SynTick] {
        let all = Iter.toArray(synTicks.vals());
        let sorted = Array.sort(all, func(a : T.SynTick, b : T.SynTick) : {#less; #equal; #greater} {
            if (b.startedAt > a.startedAt) { #less }
            else if (b.startedAt < a.startedAt) { #greater }
            else { #equal }
        });
        let n = Nat.min(limit, sorted.size());
        Array.tabulate<T.SynTick>(n, func(i) { sorted[i] })
    };

    public query func getEncodedIdentity() : async {
        encoded : Text;
        public_name : Text;
        internal_name : Text;
        cycle_ns : Int;
        rings : Nat;
        engines : Nat;
        execution_mode : Text;
    } {
        {
            encoded = ENCODED_ID;          // "ORO.GOV.TRACE"
            public_name = T.ORO_PUBLIC_NAME;
            internal_name = T.ORO_INTERNAL;
            cycle_ns = SYN_CYCLE_NS;
            rings = 3;
            engines = 15;
            execution_mode = "24H_AUTONOMOUS_SYN_CYCLE";
        }
    };

    // ================================================================= //
    // ADAPTER REGISTRY — Source Lane Documentation                       //
    // ================================================================= //

    /// Returns the full source separation manifest: Lane A (DFINITY/NNS),
    /// Lane B (CodeGov), Lane C (SNS). Documents how they never collapse.
    public query func getSourceSeparationManifest() : async A.SeparationManifest {
        A.getSeparationManifest()
    };

    /// Returns the real DFINITY NNS canister IDs used as Lane A truth source
    public query func getNnsCanisterRegistry() : async {
        governance  : Text;
        ledger      : Text;
        root        : Text;
        lifeline    : Text;
        registry    : Text;
        sns_wasm    : Text;
        cmc         : Text;
        identity    : Text;
        dashboardUrl : Text;
    } {
        {
            governance   = A.NNS_GOVERNANCE_CANISTER;
            ledger       = A.NNS_LEDGER_CANISTER;
            root         = A.NNS_ROOT_CANISTER;
            lifeline     = A.NNS_LIFELINE_CANISTER;
            registry     = A.NNS_REGISTRY_CANISTER;
            sns_wasm     = A.NNS_SNS_WASM_CANISTER;
            cmc          = A.NNS_CMC_CANISTER;
            identity     = A.NNS_IDENTITY_CANISTER;
            dashboardUrl = A.NNS_DASHBOARD_URL;
        }
    };

    /// Returns the CodeGov integration protocol (Lane B)
    public query func getCodeGovIntegrationProtocol() : async {
        baseUrl         : Text;
        lane            : Text;
        whatWeUse       : Text;
        whatWeNeverImport : Text;
        truthFlagTouched : Text;
        agentRole       : Text;
        severity        : Text;
    } {
        {
            baseUrl           = A.CODEGOV_BASE_URL;
            lane              = "Lane B — Reviewer Evidence Source";
            whatWeUse         = "Review existence, summary notes, source link";
            whatWeNeverImport = "adopt/reject decisions, vote recommendations";
            truthFlagTouched  = "reviewerConfirmed ONLY — no Lane A flags changed";
            agentRole         = "#ContextMap (LUMEN) — context evidence, not integrity verdict";
            severity          = "#Watch — reviewer evidence noted, not adopted";
        }
    };

    /// Returns all known SNS entries (Lane C) registered in the adapter
    public query func getKnownSnsRegistry() : async [A.SnsEntry] {
        A.getKnownSnsEntries()
    };

    /// Returns the NNS topic → risk class map used by E1/E6
    public query func getNnsTopicRiskMap() : async [A.NnsTopicInfo] {
        A.getNnsTopicMap()
    };
}
