/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — SHARED TYPE SUBSTRATE                     ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — 3-word encoded identity                           ║
 * ║  Internal: ORO Governance Organism                                    ║
 * ║  Public: EffectTrace — Governance Consequence Intelligence for ICP   ║
 * ║                                                                        ║
 * ║  "Propositio mutat. Nos recordamur. Veritas manet."                  ║
 * ║  (Proposals change. We remember. Truth remains.)                      ║
 * ║                                                                        ║
 * ║  NOT A QUERY. EXECUTION ON 24-HOUR SYN ENGINE CYCLES.                ║
 * ║  All 3 rings spinning: ProposalIndex ↔ EffectTrace ↔ GovMemory      ║
 * ║                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL         ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 *
 *  Layer 0 — Public Name:     EffectTrace
 *  Layer 1 — Internal Name:   ORO Governance Organism
 *  Layer 2 — Encoded ID:      ORO.GOV.TRACE
 *  Layer 3 — Execution:       SYN Engine, 24-hour autonomous cycle
 *  Layer 4 — Network:         ICP (NNS + SNS)
 */

import Int "mo:base/Int";
import Text "mo:base/Text";
import Time "mo:base/Time";

module {

    // ===================================================================== //
    // ENCODED IDENTITY                                                        //
    // ===================================================================== //

    /// 3-word encoded organism identity
    public let ORO_ENCODED_ID   : Text = "ORO.GOV.TRACE";
    public let ORO_PUBLIC_NAME  : Text = "EffectTrace";
    public let ORO_INTERNAL     : Text = "ORO Governance Organism";
    public let ORO_PUBLIC_LINE  : Text = "Trace what governance proposals actually change.";
    public let ORO_INTERNAL_MISSION : Text = "Convert governance noise into structured runtime truth.";

    /// SYN engine cycle: 24 hours in nanoseconds (ICP Time.now() is in nanoseconds)
    public let SYN_CYCLE_NS     : Int = 86_400_000_000_000; // 24 hours
    /// φ-weighted sub-cycle: 618 × 1_000_000 ns = 618ms
    public let PHI_HEARTBEAT_NS : Int = 618_000_000;
    /// Three Hearts heartbeat: 873 × 1_000_000 ns
    public let THREE_HEARTS_NS  : Int = 873_000_000;

    // ===================================================================== //
    // DAO TYPE                                                                //
    // ===================================================================== //

    public type DaoType = {
        #NNS;
        #SNS;
    };

    // ===================================================================== //
    // SOURCE LINK                                                             //
    // ===================================================================== //

    public type SourceLink = {
        label : Text;   // e.g. "NNS Dashboard", "Forum", "CodeGov"
        url   : Text;   // verified source URL or canister reference
        kind  : SourceKind;
    };

    public type SourceKind = {
        #Dashboard;
        #Forum;
        #CodeGov;
        #GithubRelease;
        #CanisterQuery;
        #ReviewDoc;
        #Manual;
        #Unknown;
    };

    // ===================================================================== //
    // PROPOSAL STATUS                                                         //
    // ===================================================================== //

    public type ProposalStatus = {
        #Open;
        #Adopted;
        #Rejected;
        #Executed;
        #Failed;
        #Unknown;
    };

    // ===================================================================== //
    // PROPOSAL RECORD (Layer 1 — Proposal Ingest Engine)                     //
    // ===================================================================== //

    public type ProposalRecord = {
        proposalId          : Text;
        daoType             : DaoType;
        snsRootCanisterId   : ?Text;
        governanceCanisterId : ?Text;

        title               : Text;
        summary             : Text;
        url                 : ?Text;

        topic               : ?Text;    // NNS topic label
        proposalType        : ?Text;    // e.g. "UpgradeCanister", "Motion"
        actionType          : ?Text;    // granular action class

        proposer            : ?Text;    // neuron ID or principal
        status              : ProposalStatus;

        createdAt           : ?Int;
        decidedAt           : ?Int;
        executedAt          : ?Int;

        rawPayload          : ?Text;    // raw candid/hex if captured
        sourceLinks         : [SourceLink];

        ingestedAt          : Int;      // when ORO ingested this record
        lastRefreshed       : Int;      // last status sync
    };

    // ===================================================================== //
    // AFFECTED SYSTEM                                                         //
    // ===================================================================== //

    public type AffectedSystem = {
        #NNS;
        #SNS;
        #SnsDappCanister;
        #ProtocolCanister;
        #Registry;
        #LedgerOrTreasury;
        #FrontendAssetCanister;
        #GovernanceRule;
        #Unknown;
    };

    // ===================================================================== //
    // EFFECT PATH (Layer 2 — Effect Path Engine)                             //
    // ===================================================================== //

    public type EffectPath = {
        claim               : Text;     // what the proposal claims to do
        affectedSystem      : AffectedSystem;

        targetCanisterId    : ?Text;
        targetMethod        : ?Text;
        validatorCanisterId : ?Text;    // SNS generic function validator
        validatorMethod     : ?Text;

        affectedState       : Text;     // what state is being changed
        beforeState         : ?Text;    // pre-execution observed state
        expectedAfterState  : Text;     // what should be true after execution

        executionTrigger    : Text;     // what causes execution
        executionDependency : ?Text;    // upstream dependency if any
    };

    // ===================================================================== //
    // RUNTIME TRUTH (Layer 3 — Runtime Truth Engine)                        //
    // ===================================================================== //

    public type RuntimeTruthStatus = {
        #ClaimOnly;           // proposal_claim — nothing verified
        #PayloadIdentified;   // payload_observed — target seen in payload
        #ReviewSupported;     // reviewer_confirmed — human review backing
        #ExecutionPending;    // execution_pending — adopted, not executed
        #ExecutedNotVerified; // executed_observed — executed, no after-check
        #VerifiedAfterState;  // after_state_verified — confirmed post-execution
        #Disputed;            // after_state_disputed — conflicting evidence
        #Unknown;             // no data
    };

    public type RuntimeTruthBlock = {
        claimObserved       : Bool;
        payloadObserved     : Bool;
        targetIdentified    : Bool;
        reviewerConfirmed   : Bool;
        executionObserved   : Bool;
        afterStateVerified  : Bool;

        truthStatus         : RuntimeTruthStatus;
        unresolvedQuestions : [Text];
    };

    // ===================================================================== //
    // RISK PROFILE (Layer 4 — Risk & Consequence Engine)                    //
    // ===================================================================== //

    public type RiskClass = {
        #Motion;
        #ParameterChange;
        #CodeUpgrade;
        #TreasuryAction;
        #GovernanceRuleChange;
        #CanisterControlChange;
        #FrontendAssetChange;
        #RegistryOrNetworkChange;
        #CustomGenericFunction;
        #SystemicOrEmergency;
        #Unknown;
    };

    public type RiskLevel = {
        #Low;
        #Medium;
        #High;
        #Critical;
        #Unknown;
    };

    public type RiskScores = {
        technical            : Nat;   // 0-100
        treasury             : Nat;   // 0-100
        governance           : Nat;   // 0-100
        irreversibility      : Nat;   // 0-100
        verificationDifficulty : Nat; // 0-100
        precedentWeight      : Nat;   // 0-100
    };

    public type RiskProfile = {
        riskClass   : RiskClass;
        riskLevel   : RiskLevel;
        scores      : RiskScores;
        explanation : Text;
        openQuestions : [Text];
    };

    // ===================================================================== //
    // VERIFICATION PLAN (Layer 4 — Verification Plan Engine)                //
    // ===================================================================== //

    public type VerificationStep = {
        stepId      : Text;
        description : Text;
        kind        : VerificationKind;
        sourceRef   : ?Text;
        completed   : Bool;
        evidence    : ?Text;
    };

    public type VerificationKind = {
        #CanisterQuery;
        #DashboardCheck;
        #HashVerification;
        #ReleaseNoteReview;
        #ForumConfirmation;
        #ManualReview;
        #PostExecutionCheck;
        #Other;
    };

    public type VerificationPlan = {
        steps       : [VerificationStep];
        generatedBy : Text;  // agent or reviewer ID
        createdAt   : Int;
    };

    // ===================================================================== //
    // GOVERNANCE MEMORY LINK (Layer 5 — Governance Memory Engine)           //
    // ===================================================================== //

    public type MemoryLinkKind = {
        #RelatedProposal;
        #Precedent;
        #Reversal;
        #Contradiction;
        #FollowUp;
        #Context;
    };

    public type GovernanceMemoryLink = {
        linkId      : Text;
        targetProposalId : Text;
        kind        : MemoryLinkKind;
        description : Text;
        createdAt   : Int;
    };

    // ===================================================================== //
    // AGENT FINDING (Layer 6 — Agent Council)                               //
    // ===================================================================== //

    /// Internal: ARCHON, VECTOR, LUMEN, FORGE
    /// Public: IntegrityCheck, ExecutionTrace, ContextMap, VerificationLab
    public type AgentRole = {
        #Integrity;        // ARCHON — payload mismatch, hidden risk, unclear claims
        #ExecutionTrace;   // VECTOR — target canister/method/state
        #ContextMap;       // LUMEN — precedent, history, forum
        #VerificationLab;  // FORGE — verification steps, hash checks
        #Risk;             // Risk Classifier
        #Memory;           // Governance Memory
    };

    public type FindingSeverity = {
        #Info;
        #Watch;
        #Warning;
        #Critical;
    };

    public type FindingStatus = {
        #Draft;
        #Reviewed;
        #Disputed;
        #Archived;
    };

    public type AgentFinding = {
        findingId   : Text;
        traceId     : Text;
        proposalId  : Text;
        agent       : AgentRole;
        finding     : Text;
        severity    : FindingSeverity;
        evidence    : [SourceLink];
        status      : FindingStatus;
        createdAt   : Int;
        reviewedAt  : ?Int;
        reviewerNote : ?Text;
    };

    // ===================================================================== //
    // REVISION RECORD                                                         //
    // ===================================================================== //

    public type RevisionRecord = {
        revisionId  : Text;
        traceId     : Text;
        changedBy   : Text;  // reviewer principal or agent ID
        changeNote  : Text;
        timestamp   : Int;
    };

    // ===================================================================== //
    // EFFECT TRACE STATUS                                                     //
    // ===================================================================== //

    public type TraceStatus = {
        #Draft;
        #NeedsReview;
        #CommunityReviewed;
        #ExecutionPending;
        #PostExecutionChecked;
        #Disputed;
        #Archived;
    };

    public type TraceConfidence = {
        #Low;
        #Medium;
        #High;
    };

    // ===================================================================== //
    // EFFECT TRACE RECORD — The Core Intelligence Record                    //
    // ===================================================================== //

    public type EffectTraceRecord = {
        traceId         : Text;
        proposalId      : Text;

        publicTitle     : Text;
        plainSummary    : Text;

        effectPath      : EffectPath;
        runtimeTruth    : RuntimeTruthBlock;
        riskProfile     : RiskProfile;
        verificationPlan : VerificationPlan;
        memoryLinks     : [GovernanceMemoryLink];
        agentFindings   : [AgentFinding];

        confidence      : TraceConfidence;
        status          : TraceStatus;

        createdAt       : Int;
        updatedAt       : Int;
        revisions       : [RevisionRecord];
    };

    // ===================================================================== //
    // GOVERNANCE MEMORY RECORD                                               //
    // ===================================================================== //

    public type PostExecutionCheck = {
        checkId         : Text;
        proposalId      : Text;
        performedAt     : Int;
        afterStateMatch : Bool;
        evidence        : [SourceLink];
        notes           : Text;
    };

    public type GovernanceMemory = {
        proposalId          : Text;
        relatedProposals    : [GovernanceMemoryLink];
        precedentCreated    : [Text];   // descriptions of precedents set
        followUpObligations : [Text];   // what must be watched
        contradictions      : [Text];   // contradictions found
        postExecutionChecks : [PostExecutionCheck];
        patternTags         : [Text];   // recurring patterns
        createdAt           : Int;
        updatedAt           : Int;
    };

    // ===================================================================== //
    // SYN ENGINE TICK RECORD                                                 //
    // ===================================================================== //

    /// One execution tick of the SYN 24-hour autonomous engine
    public type SynTick = {
        tickId          : Text;
        cycleNumber     : Nat;          // which 24-hour cycle
        startedAt       : Int;
        completedAt     : ?Int;
        proposalsIngested : Nat;
        tracesUpdated   : Nat;
        findingsGenerated : Nat;
        memoryLinksAdded : Nat;
        riskAlertsRaised : Nat;
        engineErrors    : [Text];
        status          : SynTickStatus;
    };

    public type SynTickStatus = {
        #Running;
        #Completed;
        #PartialFailure;
        #Failed;
    };

    // ===================================================================== //
    // PROPOSAL FILTER                                                         //
    // ===================================================================== //

    public type ProposalFilter = {
        daoType     : ?DaoType;
        status      : ?ProposalStatus;
        riskLevel   : ?RiskLevel;
        limit       : Nat;
        offset      : Nat;
    };

    public type TraceFilter = {
        status      : ?TraceStatus;
        confidence  : ?TraceConfidence;
        riskClass   : ?RiskClass;
        limit       : Nat;
        offset      : Nat;
    };

    // ===================================================================== //
    // SUMMARY TYPES (for list endpoints)                                     //
    // ===================================================================== //

    public type ProposalSummary = {
        proposalId  : Text;
        daoType     : DaoType;
        title       : Text;
        status      : ProposalStatus;
        riskLevel   : ?RiskLevel;
        truthStatus : ?RuntimeTruthStatus;
        ingestedAt  : Int;
    };

    public type TraceSummary = {
        traceId     : Text;
        proposalId  : Text;
        publicTitle : Text;
        riskLevel   : RiskLevel;
        riskClass   : RiskClass;
        truthStatus : RuntimeTruthStatus;
        confidence  : TraceConfidence;
        status      : TraceStatus;
        updatedAt   : Int;
    };

    // ===================================================================== //
    // HELPER: STATUS TEXT LABELS                                             //
    // ===================================================================== //

    /// Public-safe truth status label (no internal doctrine names)
    public func truthStatusLabel(s : RuntimeTruthStatus) : Text {
        switch (s) {
            case (#ClaimOnly)           { "claim_only" };
            case (#PayloadIdentified)   { "payload_identified" };
            case (#ReviewSupported)     { "review_supported" };
            case (#ExecutionPending)    { "execution_pending" };
            case (#ExecutedNotVerified) { "executed_not_verified" };
            case (#VerifiedAfterState)  { "verified_after_state" };
            case (#Disputed)            { "disputed" };
            case (#Unknown)             { "unknown" };
        }
    };

    public func riskLevelLabel(r : RiskLevel) : Text {
        switch (r) {
            case (#Low)     { "low" };
            case (#Medium)  { "medium" };
            case (#High)    { "high" };
            case (#Critical){ "critical" };
            case (#Unknown) { "unknown" };
        }
    };

    public func riskClassLabel(r : RiskClass) : Text {
        switch (r) {
            case (#Motion)                  { "motion" };
            case (#ParameterChange)         { "parameter_change" };
            case (#CodeUpgrade)             { "code_upgrade" };
            case (#TreasuryAction)          { "treasury_action" };
            case (#GovernanceRuleChange)    { "governance_rule_change" };
            case (#CanisterControlChange)   { "canister_control_change" };
            case (#FrontendAssetChange)     { "frontend_asset_change" };
            case (#RegistryOrNetworkChange) { "registry_or_network_change" };
            case (#CustomGenericFunction)   { "custom_generic_function" };
            case (#SystemicOrEmergency)     { "systemic_or_emergency" };
            case (#Unknown)                 { "unknown" };
        }
    };

    public func agentPublicName(a : AgentRole) : Text {
        switch (a) {
            case (#Integrity)       { "Integrity Check" };
            case (#ExecutionTrace)  { "Execution Trace" };
            case (#ContextMap)      { "Context Map" };
            case (#VerificationLab) { "Verification Lab" };
            case (#Risk)            { "Risk Classifier" };
            case (#Memory)          { "Governance Memory" };
        }
    };

    // ===================================================================== //
    // ID GENERATION HELPER                                                   //
    // ===================================================================== //

    public func makeId(prefix : Text, suffix : Text) : Text {
        prefix # "-" # Int.toText(Time.now()) # "-" # suffix
    };
}
