/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — ADAPTERS MODULE                           ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Pass 6: Proposal Adapters                        ║
 * ║  SYN Engine: 24-hour execution cycle                                 ║
 * ║                                                                        ║
 * ║  TWO COMPLETELY SEPARATED SOURCE LANES:                              ║
 * ║                                                                        ║
 * ║  Lane A — DFINITY / NNS (Proposal Truth Source)                     ║
 * ║    "What the NNS governance canister actually says."                 ║
 * ║    Source: rrkah-fqaaa-aaaaa-aaaaq-cai (NNS Governance)            ║
 * ║    Populates: ProposalRecord, EffectPath, rawPayload                ║
 * ║    RuntimeTruth flags: payloadObserved, targetIdentified            ║
 * ║                                                                        ║
 * ║  Lane B — CodeGov (Reviewer Evidence Source)                        ║
 * ║    "What qualified reviewers said about the proposal."              ║
 * ║    Source: CodeGov GaaS platform (stable memory, public reviews)    ║
 * ║    Populates: AgentFinding evidence, SourceLink (#CodeGov)          ║
 * ║    RuntimeTruth flags: reviewerConfirmed                            ║
 * ║                                                                        ║
 * ║  SEPARATION RULE:                                                    ║
 * ║    Lane A and Lane B NEVER collapse.                                ║
 * ║    DFINITY data = raw on-chain truth (claim or observed).           ║
 * ║    CodeGov data = human reviewer evidence (supporting, disputable).  ║
 * ║    EffectTrace = independent consequence intelligence layer.         ║
 * ║                                                                        ║
 * ║  Lane C — SNS Governance (Per-DAO Proposal Source)                  ║
 * ║    Source: variable governance canister ID per SNS DAO              ║
 * ║    Same separation rule: SNS on-chain truth vs reviewer evidence.   ║
 * ║                                                                        ║
 * ║  Guardrails embedded in every adapter:                              ║
 * ║    - No adopt/reject recommendations emitted                         ║
 * ║    - No DFINITY official approval claims                             ║
 * ║    - CodeGov review = evidence, not verdict                          ║
 * ║    - EffectTrace adds independent risk/consequence intelligence      ║
 * ║                                                                        ║
 * ║  E1  — Proposal Ingest Engine (uses Lane A + Lane C)               ║
 * ║  E2  — Payload Parser Engine (uses Lane A payload)                  ║
 * ║  E3  — Target Resolver Engine (uses Lane A + DFINITY canister map)  ║
 * ║  E8  — Reviewer Integration Engine (uses Lane B / CodeGov)          ║
 * ║  E13 — Evidence Registry Engine (validates source separation)        ║
 * ║                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                       ║
 * ║  PROPRIETARY AND CONFIDENTIAL                                          ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

import Text  "mo:base/Text";
import Array "mo:base/Array";
import Int   "mo:base/Int";
import Nat   "mo:base/Nat";
import Time  "mo:base/Time";

import T "Types";

module {

    // ===================================================================== //
    // LANE A — DFINITY / NNS CANISTER REGISTRY                             //
    // Real ICP mainnet canister IDs. These are truth, not claims.           //
    // Source of record for all NNS proposal data.                           //
    // ===================================================================== //

    /// NNS Governance canister — the authoritative source for all NNS proposals
    /// All NNS proposal data MUST originate from this canister.
    /// Proposal type determines which canister method is invoked on adoption.
    public let NNS_GOVERNANCE_CANISTER : Text = "rrkah-fqaaa-aaaaa-aaaaq-cai";

    /// NNS Ledger canister — for treasury/ICP transfer proposals
    public let NNS_LEDGER_CANISTER : Text = "ryjl3-tyaaa-aaaaa-aaaba-cai";

    /// NNS Root canister — controls upgrade path for NNS system canisters
    public let NNS_ROOT_CANISTER : Text = "r7inp-6aaaa-aaaaa-aaabq-cai";

    /// NNS Lifeline canister — manages root canister upgrades
    public let NNS_LIFELINE_CANISTER : Text = "rno2w-sqaaa-aaaaa-aaacq-cai";

    /// NNS Registry canister — controls node/subnet/canister registration
    public let NNS_REGISTRY_CANISTER : Text = "rwlgt-iiaaa-aaaaa-aaaaa-cai";

    /// NNS SNS-W canister — controls SNS deployments and upgrades
    public let NNS_SNS_WASM_CANISTER : Text = "qaa6y-5yaaa-aaaaa-aaafa-cai";

    /// NNS Cycles Minting Canister — controls ICP→cycles conversion
    public let NNS_CMC_CANISTER : Text = "rkp4c-7iaaa-aaaaa-aaaca-cai";

    /// NNS Identity canister
    public let NNS_IDENTITY_CANISTER : Text = "rdmx6-jaaaa-aaaaa-aaadq-cai";

    /// ICP Dashboard — public-facing proposal browser (Lane A source link)
    public let NNS_DASHBOARD_URL : Text = "https://dashboard.internetcomputer.org/proposal/";

    /// DFINITY Forum — community discussion (secondary source, not primary truth)
    public let ICP_FORUM_URL : Text = "https://forum.dfinity.org";

    /// NNS Dapp — the governance UI (not a truth source, but a source link)
    public let NNS_DAPP_URL : Text = "https://nns.ic0.app/#/proposal/";

    // ===================================================================== //
    // LANE A — NNS PROPOSAL TOPIC MAP                                       //
    // Maps NNS topic codes to human-readable labels + risk class hints.     //
    // Source: DFINITY NNS governance specification.                          //
    // ===================================================================== //

    public type NnsTopicInfo = {
        topicId   : Nat;
        label     : Text;
        riskHint  : T.RiskClass;
        notes     : Text;
    };

    /// All NNS governance topics as of ICP mainnet
    /// Risk hints are EffectTrace's independent classification — NOT DFINITY's.
    public func getNnsTopicMap() : [NnsTopicInfo] {
        [
            { topicId = 0;  label = "Unspecified";              riskHint = #Unknown;                   notes = "No specific topic assigned" },
            { topicId = 1;  label = "NeuronManagement";         riskHint = #GovernanceRuleChange;      notes = "Neuron configuration changes" },
            { topicId = 2;  label = "ExchangeRate";             riskHint = #ParameterChange;           notes = "ICP/SDR exchange rate updates" },
            { topicId = 3;  label = "NetworkEconomics";         riskHint = #GovernanceRuleChange;      notes = "Tokenomics parameters (dissolve delay, reward rates)" },
            { topicId = 4;  label = "Governance";               riskHint = #GovernanceRuleChange;      notes = "NNS governance rules, voting, follow neurons" },
            { topicId = 5;  label = "NodeAdmin";                riskHint = #RegistryOrNetworkChange;   notes = "Node provider management" },
            { topicId = 6;  label = "ParticipantManagement";    riskHint = #GovernanceRuleChange;      notes = "Node providers, participants" },
            { topicId = 7;  label = "SubnetManagement";         riskHint = #RegistryOrNetworkChange;   notes = "Subnet creation, topology changes" },
            { topicId = 8;  label = "NetworkCanisterManagement";riskHint = #CodeUpgrade;               notes = "System canister upgrades (ROOT, LEDGER, GOVERNANCE, etc.)" },
            { topicId = 9;  label = "KYC";                      riskHint = #GovernanceRuleChange;      notes = "KYC / participant verification" },
            { topicId = 10; label = "NodeProviderRewards";      riskHint = #TreasuryAction;            notes = "Node provider ICP reward distributions" },
            { topicId = 11; label = "SnsAndCommunityFund";      riskHint = #SystemicOrEmergency;       notes = "SNS deployment, Community Fund participation" },
            { topicId = 12; label = "SubnetReplicaVersionManagement"; riskHint = #CodeUpgrade;        notes = "IC OS replica version upgrades" },
            { topicId = 13; label = "IcpXdrConversionRate";     riskHint = #ParameterChange;           notes = "ICP to XDR conversion rate" },
            { topicId = 14; label = "ServiceNervousSystemManagement"; riskHint = #CanisterControlChange; notes = "SNS governance and dapp canister management" }
        ]
    };

    public func nnsTopicRiskHint(topicId : Nat) : T.RiskClass {
        let map = getNnsTopicMap();
        for (entry in map.vals()) {
            if (entry.topicId == topicId) { return entry.riskHint };
        };
        #Unknown
    };

    public func nnsTopicLabel(topicId : Nat) : Text {
        let map = getNnsTopicMap();
        for (entry in map.vals()) {
            if (entry.topicId == topicId) { return entry.label };
        };
        "Unknown"
    };

    // ===================================================================== //
    // LANE A — NNS PROPOSAL TYPE MAP                                        //
    // Maps NNS proposal action types to effect path classification.         //
    // ===================================================================== //

    public type NnsProposalTypeInfo = {
        actionType      : Text;
        affectedSystem  : T.AffectedSystem;
        riskClass       : T.RiskClass;
        executionNote   : Text;
    };

    public func getNnsProposalTypeMap() : [NnsProposalTypeInfo] {
        [
            {
                actionType = "Motion";
                affectedSystem = #NNS;
                riskClass = #Motion;
                executionNote = "No on-chain execution. Sentiment signal only.";
            },
            {
                actionType = "ManageNeuron";
                affectedSystem = #NNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "NNS Governance canister executes neuron changes.";
            },
            {
                actionType = "ApproveGenesisKyc";
                affectedSystem = #NNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "NNS Identity canister.";
            },
            {
                actionType = "AddOrRemoveNodeProvider";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry canister executes.";
            },
            {
                actionType = "RewardNodeProvider";
                affectedSystem = #LedgerOrTreasury;
                riskClass = #TreasuryAction;
                executionNote = "NNS Ledger canister: ICP minted to node provider.";
            },
            {
                actionType = "RewardNodeProviders";
                affectedSystem = #LedgerOrTreasury;
                riskClass = #TreasuryAction;
                executionNote = "NNS CMC/Ledger: batch ICP rewards.";
            },
            {
                actionType = "SetDefaultFollowees";
                affectedSystem = #NNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "NNS Governance: default followee configuration.";
            },
            {
                actionType = "NetworkEconomics";
                affectedSystem = #NNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "NNS Governance: tokenomics parameters.";
            },
            {
                actionType = "InstallCode";
                affectedSystem = #ProtocolCanister;
                riskClass = #CodeUpgrade;
                executionNote = "NNS Root canister executes canister install_code.";
            },
            {
                actionType = "UpgradeRootCanister";
                affectedSystem = #ProtocolCanister;
                riskClass = #SystemicOrEmergency;
                executionNote = "NNS Lifeline: upgrades NNS Root itself. Systemic risk.";
            },
            {
                actionType = "BlessReplicaVersion";
                affectedSystem = #Registry;
                riskClass = #CodeUpgrade;
                executionNote = "NNS Registry: IC OS replica version blessed.";
            },
            {
                actionType = "RetireReplicaVersion";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: IC OS version retired.";
            },
            {
                actionType = "UpdateSubnetReplicaVersion";
                affectedSystem = #Registry;
                riskClass = #CodeUpgrade;
                executionNote = "Subnet upgraded to new IC OS replica version.";
            },
            {
                actionType = "CreateSubnet";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: new subnet created.";
            },
            {
                actionType = "AddNodeToSubnet";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: node added to subnet.";
            },
            {
                actionType = "RemoveNodeFromSubnet";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: node removed from subnet.";
            },
            {
                actionType = "UpdateNodeOperatorConfig";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: node operator config.";
            },
            {
                actionType = "RerouteCanisterRanges";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: canister range migration between subnets.";
            },
            {
                actionType = "AddCanisterMigration";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: canister migration route.";
            },
            {
                actionType = "ChangeSubnetMembership";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: subnet node membership change.";
            },
            {
                actionType = "UpdateSubnetConfig";
                affectedSystem = #Registry;
                riskClass = #ParameterChange;
                executionNote = "NNS Registry: subnet configuration parameters.";
            },
            {
                actionType = "SetFirewallConfig";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: firewall rules.";
            },
            {
                actionType = "AddFirewallRules";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: firewall rule addition.";
            },
            {
                actionType = "RemoveFirewallRules";
                affectedSystem = #Registry;
                riskClass = #RegistryOrNetworkChange;
                executionNote = "NNS Registry: firewall rule removal.";
            },
            {
                actionType = "StopOrStartNnsCanister";
                affectedSystem = #ProtocolCanister;
                riskClass = #SystemicOrEmergency;
                executionNote = "NNS Root: stop or restart system canister. Emergency class.";
            },
            {
                actionType = "OpenSnsTokenSwap";
                affectedSystem = #SNS;
                riskClass = #TreasuryAction;
                executionNote = "SNS swap canister: Community Fund + public participation.";
            },
            {
                actionType = "SetSnsTokenSwapOpenTimeWindow";
                affectedSystem = #SNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "SNS swap timing window.";
            }
        ]
    };

    /// Resolve action type to effect classification
    public func resolveNnsActionType(actionType : Text) : ?NnsProposalTypeInfo {
        for (entry in getNnsProposalTypeMap().vals()) {
            if (entry.actionType == actionType) { return ?entry };
        };
        null
    };

    // ===================================================================== //
    // LANE A — NNS PROPOSAL SOURCE LINK BUILDER                            //
    // Produces verified SourceLinks from DFINITY-controlled URLs.           //
    // ===================================================================== //

    public func nnsProposalSourceLinks(proposalId : Text) : [T.SourceLink] {
        [
            {
                label = "NNS Dashboard";
                url   = NNS_DASHBOARD_URL # proposalId;
                kind  = #Dashboard;
            },
            {
                label = "NNS Dapp";
                url   = NNS_DAPP_URL # proposalId;
                kind  = #Dashboard;
            },
            {
                label = "NNS Governance Canister";
                url   = "icp://canister/" # NNS_GOVERNANCE_CANISTER # "/get_proposal_info/" # proposalId;
                kind  = #CanisterQuery;
            }
        ]
    };

    /// Build a canister query source link for a known canister
    public func canisterQueryLink(canisterId : Text, method : Text, desc : Text) : T.SourceLink {
        {
            label = desc # " (canister query)";
            url   = "icp://canister/" # canisterId # "/" # method;
            kind  = #CanisterQuery;
        }
    };

    // ===================================================================== //
    // LANE A — NNS INGEST RECORD                                            //
    // Normalized form of a proposal received from NNS Governance canister.  //
    // This is claim_only until payload is observed from canister directly.  //
    // ===================================================================== //

    public type NnsIngestInput = {
        proposalId      : Text;
        title           : Text;
        summary         : Text;
        proposer        : ?Text;  // neuron ID
        topicId         : Nat;
        actionType      : Text;
        status          : T.ProposalStatus;
        createdAt       : ?Int;
        decidedAt       : ?Int;
        executedAt      : ?Int;
        rawPayload      : ?Text;  // hex or candid bytes if captured
        targetCanisterId : ?Text; // if decodable from payload
        failureReason   : ?Text;
    };

    /// Convert NNS ingest input → ProposalRecord
    /// Lane A truth: all source links point to DFINITY-controlled surfaces.
    public func normalizeNnsIngest(input : NnsIngestInput) : T.ProposalRecord {
        let now = Time.now();
        {
            proposalId = input.proposalId;
            daoType = #NNS;
            snsRootCanisterId = null;
            governanceCanisterId = ?NNS_GOVERNANCE_CANISTER;
            title = input.title;
            summary = input.summary;
            url = ?(NNS_DASHBOARD_URL # input.proposalId);
            topic = ?nnsTopicLabel(input.topicId);
            proposalType = ?(Nat.toText(input.topicId));
            actionType = ?input.actionType;
            proposer = input.proposer;
            status = input.status;
            createdAt = input.createdAt;
            decidedAt = input.decidedAt;
            executedAt = input.executedAt;
            rawPayload = input.rawPayload;
            sourceLinks = nnsProposalSourceLinks(input.proposalId);
            ingestedAt = now;
            lastRefreshed = now;
        }
    };

    // ===================================================================== //
    // LANE A — NNS INITIAL RUNTIME TRUTH BLOCK                             //
    // Assigned the moment a proposal is ingested from NNS canister.        //
    // claim_only until payload observed directly from canister.             //
    // ===================================================================== //

    public func initialNnsTruthBlock(
        hasPayload : Bool,
        hasTargetCanister : Bool
    ) : T.RuntimeTruthBlock {
        {
            claimObserved      = true;   // proposal exists in NNS — confirmed
            payloadObserved    = hasPayload;
            targetIdentified   = hasTargetCanister;
            reviewerConfirmed  = false;  // not confirmed until CodeGov/Lane B
            executionObserved  = false;
            afterStateVerified = false;
            truthStatus = if (hasTargetCanister) { #PayloadIdentified }
                          else if (hasPayload)    { #PayloadIdentified }
                          else                    { #ClaimOnly };
            unresolvedQuestions = [
                "Has the raw payload been decoded and target canister confirmed?",
                "Has a qualified reviewer checked the payload against the summary?",
                "What is the before-state of the target canister/parameter?"
            ];
        }
    };

    // ===================================================================== //
    // LANE B — CODEGOV INTEGRATION PROTOCOL                                //
    // ===================================================================== //
    //
    // WHAT CODEGOV IS:
    //   CodeGov GaaS (Governance as a Service) stores NNS proposal metadata
    //   and standardized reviewer findings in stable memory on ICP.
    //   Reviewers publish structured reviews with severity, findings, and
    //   voting recommendations (adopt/reject) — for THEIR governance use.
    //
    // HOW EFFECTTRACE USES CODEGOV:
    //   EffectTrace does NOT import CodeGov adopt/reject decisions.
    //   EffectTrace uses CodeGov as a REVIEWER EVIDENCE SOURCE ONLY:
    //     - A CodeGov review link becomes a SourceLink (#CodeGov)
    //     - If a proposal has a CodeGov review, reviewerConfirmed → true
    //     - CodeGov reviewer findings become AgentFindings of type #ContextMap
    //     - EffectTrace adds its own INDEPENDENT consequence/risk intelligence
    //
    // WHAT EFFECTTRACE NEVER DOES WITH CODEGOV DATA:
    //   - Never imports CodeGov adopt/reject recommendations
    //   - Never treats CodeGov as the canonical truth source
    //   - Never claims CodeGov endorses EffectTrace's risk classification
    //   - Never conflates CodeGov's technical review with EffectTrace's
    //     consequence intelligence (they are different products)
    //
    // ===================================================================== //

    /// CodeGov GaaS — base URL for review pages
    /// CodeGov stores reviews for NNS technical proposals.
    public let CODEGOV_BASE_URL : Text = "https://www.codegov.org/proposals/";

    /// CodeGov review finding format (what we extract from their reviews)
    public type CodeGovReviewExtract = {
        proposalId    : Text;
        reviewUrl     : Text;
        reviewerLabel : Text;    // "CodeGov Reviewer" — do not name individuals
        reviewExists  : Bool;
        summaryNote   : Text;    // plain-text extract, NOT their adopt/reject
        evidenceLinks : [T.SourceLink];
    };

    /// Build a CodeGov source link for a proposal
    /// This is Lane B evidence, not Lane A truth.
    public func codeGovSourceLink(proposalId : Text) : T.SourceLink {
        {
            label = "CodeGov Technical Review";
            url   = CODEGOV_BASE_URL # proposalId;
            kind  = #CodeGov;
        }
    };

    /// Build the RuntimeTruthBlock update when CodeGov review is confirmed
    /// This updates ONLY reviewerConfirmed — never overwrites DFINITY payload data.
    public func applyCodeGovReviewToTruth(
        existing : T.RuntimeTruthBlock,
        reviewNote : Text
    ) : T.RuntimeTruthBlock {
        let newStatus : T.RuntimeTruthStatus = switch (existing.truthStatus) {
            case (#ClaimOnly)           { #ReviewSupported };
            case (#PayloadIdentified)   { #ReviewSupported };
            case (#ReviewSupported)     { #ReviewSupported };
            case (#ExecutionPending)    { #ExecutionPending };
            case (#ExecutedNotVerified) { #ExecutedNotVerified };
            case (#VerifiedAfterState)  { #VerifiedAfterState };
            case (#Disputed)            { #Disputed };
            case (#Unknown)             { #ReviewSupported };
        };

        // Remove the "Has a qualified reviewer checked the payload" question
        // if it was previously unresolved
        let filtered = Array.filter(existing.unresolvedQuestions, func(q : Text) : Bool {
            not Text.contains(q, #text "qualified reviewer")
        });

        {
            claimObserved      = existing.claimObserved;
            payloadObserved    = existing.payloadObserved;
            targetIdentified   = existing.targetIdentified;
            reviewerConfirmed  = true;   // CodeGov review confirmed
            executionObserved  = existing.executionObserved;
            afterStateVerified = existing.afterStateVerified;
            truthStatus = newStatus;
            unresolvedQuestions = Array.append(filtered, [
                "CodeGov review noted: " # reviewNote # " — verify against payload independently."
            ]);
        }
    };

    /// Build an AgentFinding from a CodeGov review extract
    /// Severity: always #Watch (not #Critical) — reviewer evidence, not our analysis
    /// Agent: #ContextMap (LUMEN) — CodeGov review is context, not our conclusion
    public func codeGovReviewToFinding(
        traceId    : Text,
        proposalId : Text,
        extract    : CodeGovReviewExtract
    ) : T.AgentFinding {
        {
            findingId  = T.makeId("CODEGOV", proposalId);
            traceId;
            proposalId;
            agent    = #ContextMap;   // LUMEN — context map, not integrity check
            finding  = "CodeGov review exists for this proposal. " #
                       "Reviewer summary: " # extract.summaryNote # ". " #
                       "EffectTrace consequence intelligence is independent of this review.";
            severity = #Watch;        // Watch — we note it, we don't adopt it
            evidence = Array.append(extract.evidenceLinks, [codeGovSourceLink(proposalId)]);
            status   = #Draft;
            createdAt = Time.now();
            reviewedAt = null;
            reviewerNote = null;
        }
    };

    // ===================================================================== //
    // LANE C — SNS GOVERNANCE ADAPTER                                       //
    // ===================================================================== //
    //
    // SNS canisters have variable canister IDs per DAO.
    // Each SNS has:
    //   - governance canister (controls proposals)
    //   - root canister (controls canister upgrades)
    //   - ledger canister (SNS token)
    //   - swap canister (token sale)
    //   - index canister (transaction index)
    //
    // SNS proposal types include:
    //   - Native SNS proposals (UpgradeSnsControlledCanister, Motion, etc.)
    //   - Generic/custom proposals (ExecuteGenericNervousSystemFunction)
    //     → these call a validator + target canister/method defined in SNS config
    //
    // Source separation for SNS:
    //   - SNS governance canister = Lane C truth source (parallel to Lane A)
    //   - CodeGov may cover some SNS proposals → still Lane B evidence only
    //
    // ===================================================================== //

    /// Known SNS DAOs on ICP mainnet (non-exhaustive — grows over time)
    /// Format: (name, governanceCanisterId, rootCanisterId)
    public type SnsEntry = {
        name              : Text;
        governanceCanisterId : Text;
        rootCanisterId    : Text;
        dashboardUrl      : Text;
    };

    public func getKnownSnsEntries() : [SnsEntry] {
        [
            {
                name = "OpenChat";
                governanceCanisterId = "2jvtu-yqaaa-aaaaq-aaama-cai";
                rootCanisterId       = "3e3x2-xyaaa-aaaaq-aaalq-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/3e3x2-xyaaa-aaaaq-aaalq-cai/proposals/";
            },
            {
                name = "Kinic";
                governanceCanisterId = "74ncn-fqaaa-aaaaq-aaasa-cai";
                rootCanisterId       = "7jkta-oyaaa-aaaaq-aaarq-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/7jkta-oyaaa-aaaaq-aaarq-cai/proposals/";
            },
            {
                name = "Dragginz";
                governanceCanisterId = "zqfso-syaaa-aaaaq-aaafq-cai";
                rootCanisterId       = "zxeu2-7aaaa-aaaaq-aaafa-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/zxeu2-7aaaa-aaaaq-aaafa-cai/proposals/";
            },
            {
                name = "WaterNeuron";
                governanceCanisterId = "jfnic-kaaaa-aaaaq-aacia-cai";
                rootCanisterId       = "jmod6-4iaaa-aaaaq-aaciq-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/jmod6-4iaaa-aaaaq-aaciq-cai/proposals/";
            },
            {
                name = "ICPSwap";
                governanceCanisterId = "pbo5s-uyaaa-aaaaq-aac4a-cai";
                rootCanisterId       = "ggzvv-5qaaa-aaaaq-aacda-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/ggzvv-5qaaa-aaaaq-aacda-cai/proposals/";
            },
            {
                name = "Catalyze";
                governanceCanisterId = "qtooy-2yaaa-aaaaq-aabvq-cai";
                rootCanisterId       = "uly3p-iqaaa-aaaaq-aabma-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/uly3p-iqaaa-aaaaq-aabma-cai/proposals/";
            },
            {
                name = "BOOM DAO";
                governanceCanisterId = "xjngq-yaaaa-aaaaq-aabha-cai";
                rootCanisterId       = "xomae-vyaaa-aaaaq-aabhq-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/xomae-vyaaa-aaaaq-aabhq-cai/proposals/";
            },
            {
                name = "Hot or Not";
                governanceCanisterId = "6wcax-haaaa-aaaaq-aaava-cai";
                rootCanisterId       = "67bll-riaaa-aaaaq-aaauq-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/67bll-riaaa-aaaaq-aaauq-cai/proposals/";
            },
            {
                name = "Neutrinite";
                governanceCanisterId = "extk2-daaaa-aaaaq-aacda-cai";
                rootCanisterId       = "e3mmv-5qaaa-aaaaq-aadma-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/e3mmv-5qaaa-aaaaq-aadma-cai/proposals/";
            },
            {
                name = "Sonic";
                governanceCanisterId = "qtooy-2yaaa-aaaaq-aabvq-cai";
                rootCanisterId       = "vgh2e-5aaaa-aaaaq-aabja-cai";
                dashboardUrl         = "https://dashboard.internetcomputer.org/sns/vgh2e-5aaaa-aaaaq-aabja-cai/proposals/";
            }
        ]
    };

    /// Look up an SNS entry by governance canister ID
    public func findSnsByGovernanceCanister(governanceId : Text) : ?SnsEntry {
        for (entry in getKnownSnsEntries().vals()) {
            if (entry.governanceCanisterId == governanceId) { return ?entry };
        };
        null
    };

    /// SNS proposal types and their EffectTrace consequence classification
    public type SnsProposalTypeInfo = {
        actionType     : Text;
        affectedSystem : T.AffectedSystem;
        riskClass      : T.RiskClass;
        executionNote  : Text;
        isGeneric      : Bool; // true = ExecuteGenericNervousSystemFunction
    };

    public func getSnSProposalTypeMap() : [SnsProposalTypeInfo] {
        [
            {
                actionType = "Motion";
                affectedSystem = #SNS;
                riskClass = #Motion;
                executionNote = "SNS motion — no on-chain execution.";
                isGeneric = false;
            },
            {
                actionType = "UpgradeSnsControlledCanister";
                affectedSystem = #SnsDappCanister;
                riskClass = #CodeUpgrade;
                executionNote = "SNS Root executes canister upgrade. Target canister identified in payload.";
                isGeneric = false;
            },
            {
                actionType = "UpgradeSnsToNextVersion";
                affectedSystem = #SNS;
                riskClass = #CodeUpgrade;
                executionNote = "SNS framework upgrade to next version from NNS SNS-W.";
                isGeneric = false;
            },
            {
                actionType = "ManageSnsMetadata";
                affectedSystem = #SNS;
                riskClass = #ParameterChange;
                executionNote = "SNS metadata update (name, logo, description).";
                isGeneric = false;
            },
            {
                actionType = "TransferSnsTreasuryFunds";
                affectedSystem = #LedgerOrTreasury;
                riskClass = #TreasuryAction;
                executionNote = "SNS treasury transfer. Target wallet and amount in payload.";
                isGeneric = false;
            },
            {
                actionType = "MintSnsTokens";
                affectedSystem = #LedgerOrTreasury;
                riskClass = #TreasuryAction;
                executionNote = "SNS Ledger: token minting. Recipient and amount in payload.";
                isGeneric = false;
            },
            {
                actionType = "ManageNervousSystemParameters";
                affectedSystem = #SNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "SNS governance parameter change (voting thresholds, dissolve delay, etc).";
                isGeneric = false;
            },
            {
                actionType = "RegisterDappCanisters";
                affectedSystem = #SnsDappCanister;
                riskClass = #CanisterControlChange;
                executionNote = "New canisters registered under SNS control.";
                isGeneric = false;
            },
            {
                actionType = "DeregisterDappCanisters";
                affectedSystem = #SnsDappCanister;
                riskClass = #CanisterControlChange;
                executionNote = "Canisters removed from SNS control. Control returned to specified principal.";
                isGeneric = false;
            },
            {
                actionType = "AddGenericNervousSystemFunction";
                affectedSystem = #SNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "New generic function registered. Future proposals can call this target canister/method.";
                isGeneric = false;
            },
            {
                actionType = "RemoveGenericNervousSystemFunction";
                affectedSystem = #SNS;
                riskClass = #GovernanceRuleChange;
                executionNote = "Generic function removed from SNS registry.";
                isGeneric = false;
            },
            {
                actionType = "ExecuteGenericNervousSystemFunction";
                affectedSystem = #SnsDappCanister;
                riskClass = #CustomGenericFunction;
                executionNote = "GENERIC PROPOSAL: SNS Governance calls the registered target canister/method with this payload. Validator canister may also run. HIGH attention required — target depends on SNS function registry.";
                isGeneric = true;
            },
            {
                actionType = "ManageLedgerParameters";
                affectedSystem = #LedgerOrTreasury;
                riskClass = #ParameterChange;
                executionNote = "SNS Ledger parameter change (fee, decimals, etc).";
                isGeneric = false;
            }
        ]
    };

    /// Build source links for an SNS proposal
    public func snSProposalSourceLinks(
        proposalId : Text,
        entry      : SnsEntry
    ) : [T.SourceLink] {
        [
            {
                label = entry.name # " SNS Dashboard";
                url   = entry.dashboardUrl # proposalId;
                kind  = #Dashboard;
            },
            {
                label = entry.name # " SNS Governance Canister";
                url   = "icp://canister/" # entry.governanceCanisterId # "/get_proposal/" # proposalId;
                kind  = #CanisterQuery;
            },
            {
                label = "NNS Dashboard (SNS)";
                url   = "https://dashboard.internetcomputer.org/sns/" # entry.rootCanisterId # "/proposals/" # proposalId;
                kind  = #Dashboard;
            }
        ]
    };

    // ===================================================================== //
    // GENERIC PROPOSAL CLASSIFIER                                            //
    // Special logic for ExecuteGenericNervousSystemFunction                  //
    // These are the highest-attention SNS proposals because the target       //
    // canister/method is defined in the SNS function registry, not here.    //
    // ===================================================================== //

    public type GenericProposalContext = {
        functionId      : Text;  // the registered generic function ID
        functionName    : Text;  // human-readable name from SNS registry
        targetCanisterId : Text;
        targetMethod    : Text;
        validatorCanisterId : ?Text;
        validatorMethod    : ?Text;
        payloadSummary  : Text;
    };

    /// Build an EffectPath for a generic SNS proposal
    /// These always start as #CustomGenericFunction with HIGH attention needed.
    public func genericProposalEffectPath(
        ctx : GenericProposalContext,
        proposalClaim : Text
    ) : T.EffectPath {
        {
            claim = proposalClaim;
            affectedSystem = #SnsDappCanister;
            targetCanisterId = ?ctx.targetCanisterId;
            targetMethod = ?ctx.targetMethod;
            validatorCanisterId = ctx.validatorCanisterId;
            validatorMethod = ctx.validatorMethod;
            affectedState = "UNKNOWN — target canister state not queried yet";
            beforeState = null;
            expectedAfterState = "UNKNOWN — must query target canister after execution";
            executionTrigger = "SNS Governance → generic function " # ctx.functionId # " → " # ctx.targetCanisterId # "." # ctx.targetMethod;
            executionDependency = ctx.validatorCanisterId;
        }
    };

    // ===================================================================== //
    // E1 ADAPTER — NORMALIZED INGEST RECORD                                 //
    // Standard interface that both NNS and SNS adapters produce.            //
    // The SynEngine E1 stub calls this interface.                           //
    // ===================================================================== //

    public type IngestRecord = {
        proposal    : T.ProposalRecord;
        initialTruth : T.RuntimeTruthBlock;
        initialPath : ?T.EffectPath;   // null if not yet decodable
        sourceLane  : SourceLane;
    };

    public type SourceLane = {
        #NNS;             // Lane A — DFINITY NNS Governance
        #SNS;             // Lane C — SNS DAO Governance
        #Manual;          // Operator-entered manually
    };

    /// Build an initial EffectPath from NNS action type
    public func nnsInitialEffectPath(
        actionType      : Text,
        proposalClaim   : Text,
        targetCanisterId : ?Text,
        targetMethod    : ?Text
    ) : T.EffectPath {
        let typeInfo = resolveNnsActionType(actionType);
        let affSystem = switch (typeInfo) {
            case null    { #Unknown };
            case (?info) { info.affectedSystem };
        };
        let execNote = switch (typeInfo) {
            case null    { "Unknown action type — manual review required." };
            case (?info) { info.executionNote };
        };

        {
            claim = proposalClaim;
            affectedSystem = affSystem;
            targetCanisterId;
            targetMethod;
            validatorCanisterId = null;
            validatorMethod = null;
            affectedState = "NOT YET QUERIED — before-state requires canister query";
            beforeState = null;
            expectedAfterState = "NOT YET DETERMINED — requires payload decode and canister query";
            executionTrigger = "NNS Governance adoption → " # execNote;
            executionDependency = null;
        }
    };

    // ===================================================================== //
    // E8 ADAPTER — REVIEWER INTEGRATION: CODEGOV BRIDGE                    //
    // The E8 engine stub calls this to integrate CodeGov reviews into       //
    // the RuntimeTruthBlock and AgentFindings. Source lane NEVER collapses. //
    // ===================================================================== //

    public type ReviewerIntegrationResult = {
        updatedTruth : T.RuntimeTruthBlock;
        finding      : ?T.AgentFinding;  // null if no review found
        sourceAdded  : T.SourceLink;
    };

    /// Integrate a CodeGov review extract into an existing trace
    /// LANE SEPARATION: this only sets reviewerConfirmed=true.
    /// It does NOT change payloadObserved, targetIdentified, or other Lane A fields.
    /// It does NOT import adopt/reject from CodeGov.
    public func integrateCodeGovReview(
        traceId     : Text,
        proposalId  : Text,
        existing    : T.RuntimeTruthBlock,
        extract     : CodeGovReviewExtract
    ) : ReviewerIntegrationResult {
        if (not extract.reviewExists) {
            return {
                updatedTruth = existing;
                finding = null;
                sourceAdded = codeGovSourceLink(proposalId);
            };
        };

        let updatedTruth = applyCodeGovReviewToTruth(existing, extract.summaryNote);
        let finding = codeGovReviewToFinding(traceId, proposalId, extract);

        {
            updatedTruth;
            finding = ?finding;
            sourceAdded = codeGovSourceLink(proposalId);
        }
    };

    // ===================================================================== //
    // E3 ADAPTER — TARGET RESOLVER: KNOWN CANISTER MAP                      //
    // Maps known canister IDs to their descriptions and risk flags.         //
    // Used by the TargetResolver engine to annotate effect paths.           //
    // ===================================================================== //

    public type CanisterEntry = {
        canisterId  : Text;
        name        : Text;
        controlled  : Text; // "NNS", "SNS:NAME", "DFINITY", "Community"
        riskNote    : Text;
    };

    public func getKnownCanisterMap() : [CanisterEntry] {
        [
            { canisterId = NNS_GOVERNANCE_CANISTER; name = "NNS Governance";     controlled = "NNS";       riskNote = "Changes affect all NNS governance rules." },
            { canisterId = NNS_ROOT_CANISTER;       name = "NNS Root";            controlled = "NNS";       riskNote = "Controls NNS system canister upgrades. Critical." },
            { canisterId = NNS_LEDGER_CANISTER;     name = "NNS Ledger (ICP)";    controlled = "NNS";       riskNote = "ICP token ledger. Treasury/mint changes are Critical." },
            { canisterId = NNS_LIFELINE_CANISTER;   name = "NNS Lifeline";        controlled = "NNS";       riskNote = "Upgrades NNS Root itself. Systemic risk." },
            { canisterId = NNS_REGISTRY_CANISTER;   name = "NNS Registry";        controlled = "NNS";       riskNote = "Controls subnet/node/canister range assignment." },
            { canisterId = NNS_SNS_WASM_CANISTER;   name = "NNS SNS-W";           controlled = "NNS";       riskNote = "Controls SNS deployments and SNS framework upgrades." },
            { canisterId = NNS_CMC_CANISTER;        name = "Cycles Minting (CMC)";controlled = "NNS";       riskNote = "ICP→Cycles conversion. Treasury-adjacent." },
            { canisterId = NNS_IDENTITY_CANISTER;   name = "NNS Identity";        controlled = "NNS";       riskNote = "Internet Identity core. High systemic risk." },
            { canisterId = "2jvtu-yqaaa-aaaaq-aaama-cai"; name = "OpenChat Governance"; controlled = "SNS:OpenChat"; riskNote = "OpenChat DAO governance canister." },
            { canisterId = "74ncn-fqaaa-aaaaq-aaasa-cai"; name = "Kinic Governance";    controlled = "SNS:Kinic";   riskNote = "Kinic DAO governance canister." }
        ]
    };

    public func lookupCanister(canisterId : Text) : ?CanisterEntry {
        for (entry in getKnownCanisterMap().vals()) {
            if (entry.canisterId == canisterId) { return ?entry };
        };
        null
    };

    // ===================================================================== //
    // E13 ADAPTER — EVIDENCE REGISTRY: SOURCE VALIDATION                    //
    // Checks that every claim has a source. Enforces the guardrail:         //
    //   "Every claim must be source-linked or marked unknown."              //
    // ===================================================================== //

    public type EvidenceStatus = {
        #HasSource;       // at least one SourceLink present
        #ClaimOnly;       // no source links — truth status must be #ClaimOnly
        #HasCodeGovOnly;  // only CodeGov review, no Lane A source
        #HasDfinitySource; // has a Dashboard or CanisterQuery source (Lane A)
    };

    public func classifyEvidence(sourceLinks : [T.SourceLink]) : EvidenceStatus {
        var hasDfinity = false;
        var hasCodeGov = false;

        for (link in sourceLinks.vals()) {
            switch (link.kind) {
                case (#Dashboard)    { hasDfinity := true };
                case (#CanisterQuery){ hasDfinity := true };
                case (#CodeGov)      { hasCodeGov := true };
                case _               {};
            };
        };

        if (hasDfinity)                   { #HasDfinitySource }
        else if (hasCodeGov and hasDfinity){ #HasDfinitySource }
        else if (hasCodeGov)              { #HasCodeGovOnly }
        else if (sourceLinks.size() > 0)  { #HasSource }
        else                              { #ClaimOnly }
    };

    // ===================================================================== //
    // SEPARATION MANIFEST — self-describing record of lane separation       //
    // Can be returned by any public query to document the architecture.     //
    // ===================================================================== //

    public type SeparationManifest = {
        laneA_name        : Text;
        laneA_source      : Text;
        laneA_canisterId  : Text;
        laneA_populates   : Text;
        laneA_truthFlags  : Text;
        laneB_name        : Text;
        laneB_source      : Text;
        laneB_populates   : Text;
        laneB_truthFlags  : Text;
        laneC_name        : Text;
        laneC_source      : Text;
        collapseRule      : Text;
        guardrails        : [Text];
    };

    public func getSeparationManifest() : SeparationManifest {
        {
            laneA_name       = "Lane A — DFINITY / NNS (Proposal Truth Source)";
            laneA_source     = "NNS Governance canister: " # NNS_GOVERNANCE_CANISTER;
            laneA_canisterId = NNS_GOVERNANCE_CANISTER;
            laneA_populates  = "ProposalRecord, EffectPath, rawPayload";
            laneA_truthFlags = "claimObserved, payloadObserved, targetIdentified, executionObserved, afterStateVerified";
            laneB_name       = "Lane B — CodeGov (Reviewer Evidence Source)";
            laneB_source     = "CodeGov GaaS platform: " # CODEGOV_BASE_URL;
            laneB_populates  = "AgentFinding (#ContextMap/LUMEN), SourceLink (#CodeGov)";
            laneB_truthFlags = "reviewerConfirmed ONLY — no Lane A flags touched";
            laneC_name       = "Lane C — SNS DAO Governance (Per-DAO Truth Source)";
            laneC_source     = "Variable governance canister ID per SNS DAO";
            collapseRule     = "NEVER COLLAPSE. Lane A and Lane B are separate truth dimensions. " #
                               "DFINITY data = raw on-chain truth. " #
                               "CodeGov data = reviewer evidence (supporting, disputable). " #
                               "EffectTrace = independent consequence intelligence.";
            guardrails = [
                "Do not import CodeGov adopt/reject decisions",
                "Do not claim CodeGov endorses EffectTrace risk classification",
                "Do not treat CodeGov as canonical truth source",
                "Do not conflate CodeGov technical review with EffectTrace consequence intelligence",
                "Do not recommend adopt/reject in any EffectTrace output",
                "Do not claim DFINITY official approval",
                "Every unverified claim must be marked claim_only"
            ];
        }
    };
}
