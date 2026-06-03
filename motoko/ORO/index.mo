/**
 * ╔════════════════════════════════════════════════════════════════════════╗
 * ║  ORO GOVERNANCE ORGANISM — MODULE INDEX                              ║
 * ║  EffectTrace Governance Intelligence                                  ║
 * ║                                                                        ║
 * ║  "ORO.GOV.TRACE" — Encoded Identity                                 ║
 * ║  3 Words. 3 Rings. 24-Hour SYN Engine.                              ║
 * ║                                                                        ║
 * ║  NOT A QUERY. EXECUTION.                                             ║
 * ║                                                                        ║
 * ║  ORO   = Internal organism name (ORO Governance Organism)           ║
 * ║  GOV   = Governance intelligence layer (NNS + SNS)                  ║
 * ║  TRACE = Effect trace surface (EffectTrace public product)          ║
 * ║                                                                        ║
 * ║  Architecture:                                                       ║
 * ║  ┌─────────────────────────────────────────────────────────────┐   ║
 * ║  │  SYN ENGINE — 24-hour autonomous execution                  │   ║
 * ║  │  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐    │   ║
 * ║  │  │  Ring 1  │  │   Ring 2     │  │      Ring 3        │    │   ║
 * ║  │  │ Proposal │  │ EffectTrace  │  │  GovMemory         │    │   ║
 * ║  │  │  Index   │←→│  Canister    │←→│  Canister          │    │   ║
 * ║  │  └──────────┘  └──────────────┘  └────────────────────┘    │   ║
 * ║  │         ↕                ↕                    ↕             │   ║
 * ║  │  ┌────────────────────────────────────────────────────┐     │   ║
 * ║  │  │  Agent Findings Canister (ARCHON/VECTOR/LUMEN/FORGE)│    │   ║
 * ║  │  └────────────────────────────────────────────────────┘     │   ║
 * ║  │         ↕                                                    │   ║
 * ║  │  ┌────────────────────────────────────────────────────┐     │   ║
 * ║  │  │  Public Frontend Canister (certified assets)        │    │   ║
 * ║  │  └────────────────────────────────────────────────────┘     │   ║
 * ║  └─────────────────────────────────────────────────────────────┘   ║
 * ║                                                                        ║
 * ║  15 Engines execute in every SYN cycle:                             ║
 * ║  E1 Ingest → E2 Payload → E3 Target → E4 EffectPath →             ║
 * ║  E5 Truth → E6 Risk → E7 Verify → E8 Review → E9 Memory →         ║
 * ║  E10 PostExec → E11 Agents → E12 Summary → E13 Evidence →          ║
 * ║  E14 Dispute → E15 Export                                           ║
 * ║                                                                        ║
 * ║  Agent Council (internal names, public names):                       ║
 * ║  ARCHON → "Integrity Check"                                         ║
 * ║  VECTOR → "Execution Trace"                                         ║
 * ║  LUMEN  → "Context Map"                                             ║
 * ║  FORGE  → "Verification Lab"                                        ║
 * ║                                                                        ║
 * ║  Truth Status Labels (public-safe):                                 ║
 * ║  claim_only | payload_identified | review_supported |               ║
 * ║  execution_pending | executed_not_verified |                        ║
 * ║  verified_after_state | disputed | unknown                          ║
 * ║                                                                        ║
 * ║  Risk Classes:                                                       ║
 * ║  motion | parameter_change | code_upgrade | treasury_action |       ║
 * ║  governance_rule_change | canister_control_change |                 ║
 * ║  frontend_asset_change | registry_or_network_change |               ║
 * ║  custom_generic_function | systemic_or_emergency | unknown          ║
 * ║                                                                        ║
 * ║  Guardrails enforced in every engine:                               ║
 * ║  ✗ No adopt/reject recommendations                                  ║
 * ║  ✗ No DFINITY official approval claims                              ║
 * ║  ✗ No CodeGov replacement                                           ║
 * ║  ✗ No unverified claims marked "verified"                           ║
 * ║  ✓ Every claim source-linked or marked "unknown"                    ║
 * ║  ✓ Every AI finding reviewable and disputable                       ║
 * ║                                                                        ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                       ║
 * ║  Medina Sovereign Intelligence — PROPRIETARY AND CONFIDENTIAL         ║
 * ╚════════════════════════════════════════════════════════════════════════╝
 */

import T            "Types";
import ProposalIndex "ProposalIndex";
import EffectTrace  "EffectTrace";
import GovMemory    "GovernanceMemory";
import AgentFinding "AgentFindings";
import SynEngine    "SynEngine";
import PubFrontend  "PublicFrontend";
import Adapters     "Adapters";

module {

    // ================================================================= //
    // ENCODED IDENTITY — 3 words, ICP-native                            //
    // ================================================================= //

    /// "ORO.GOV.TRACE" — the 3-word encoded organism identity
    /// All three rings spinning. Not a query. Execution on 24-hour cycle.
    public let ENCODED_ID = T.ORO_ENCODED_ID;

    /// Public-facing product name
    public let PUBLIC_NAME = T.ORO_PUBLIC_NAME;

    /// Internal organism name
    public let INTERNAL_NAME = T.ORO_INTERNAL;

    /// The single-sentence public promise
    public let PUBLIC_LINE = T.ORO_PUBLIC_LINE;

    /// The internal mission statement
    public let INTERNAL_MISSION = T.ORO_INTERNAL_MISSION;

    // ================================================================= //
    // CANISTER MANIFEST                                                  //
    // ================================================================= //

    public type CanisterManifest = {
        id        : Text;
        name      : Text;
        role      : Text;
        engines   : [Text];
        ring      : Nat;
        storageModel : Text;
    };

    public func getCanisterManifest() : [CanisterManifest] {
        [
            {
                id = "CANISTER-1";
                name = "ProposalIndex";
                role = "NNS/SNS proposal metadata, ingest, status tracking, trace index";
                engines = ["E1-ProposalIngest", "E2-PayloadParser", "E3-TargetResolver"];
                ring = 1;
                storageModel = "stable HashMap + stable arrays";
            },
            {
                id = "CANISTER-2";
                name = "EffectTrace";
                role = "Effect traces, runtime truth, risk profiles, verification plans, revision history";
                engines = ["E4-EffectPath", "E5-RuntimeTruth", "E6-RiskClassifier", "E7-VerificationPlan", "E12-PublicSummary", "E14-DisputeCorrection"];
                ring = 2;
                storageModel = "stable HashMap + stable arrays";
            },
            {
                id = "CANISTER-3";
                name = "GovernanceMemory";
                role = "Proposal links, precedent graph, follow-up obligations, post-execution checks, patterns";
                engines = ["E9-GovMemory", "E10-PostExecutionWatch", "E13-EvidenceRegistry"];
                ring = 3;
                storageModel = "stable HashMap + stable arrays";
            },
            {
                id = "CANISTER-4";
                name = "AgentFindings";
                role = "ARCHON/VECTOR/LUMEN/FORGE findings, review decisions, dispute records";
                engines = ["E11-AgentCouncil", "E8-ReviewerIntegration"];
                ring = 0; // cross-ring
                storageModel = "stable HashMap + stable arrays";
            },
            {
                id = "CANISTER-5";
                name = "PublicFrontend";
                role = "Public trace pages, proposal search, risk radar, markdown/JSON export, community notes";
                engines = ["E12-PublicSummary", "E15-Export"];
                ring = 0; // public surface
                storageModel = "stable HashMap (certified)";
            },
            {
                id = "SYN-ENGINE";
                name = "SynEngine";
                role = "24-hour autonomous execution loop — wires all 15 engines across all rings";
                engines = [
                    "E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8",
                    "E9", "E10", "E11", "E12", "E13", "E14", "E15"
                ];
                ring = 0; // orchestrator
                storageModel = "stable tick history";
            },
            {
                id = "ADAPTERS";
                name = "Adapters";
                role = "DFINITY/NNS Lane A + CodeGov Lane B + SNS Lane C — source separation, never collapsed";
                engines = ["E1-IngestLaneA", "E3-TargetResolver", "E8-ReviewerLaneB", "E13-EvidenceRegistry"];
                ring = 0; // shared module, used by all engines
                storageModel = "pure module — no stable storage";
            }
        ]
    };

    // ================================================================= //
    // ENGINE MANIFEST                                                    //
    // ================================================================= //

    public type EngineManifest = {
        id      : Text;
        name    : Text;
        layer   : Nat;
        purpose : Text;
    };

    public func getEngineManifest() : [EngineManifest] {
        [
            { id="E1";  name="Proposal Ingest Engine";     layer=1; purpose="Pull NNS/SNS proposal metadata" },
            { id="E2";  name="Payload Parser Engine";      layer=1; purpose="Decode proposal payload/action" },
            { id="E3";  name="Target Resolver Engine";     layer=1; purpose="Identify target canister/method/param" },
            { id="E4";  name="Effect Path Engine";         layer=2; purpose="Build before/after effect path" },
            { id="E5";  name="Runtime Truth Engine";       layer=3; purpose="Classify claim vs observed vs verified" },
            { id="E6";  name="Risk Classifier Engine";     layer=4; purpose="φ-weighted risk scoring across 6 axes" },
            { id="E7";  name="Verification Plan Engine";   layer=4; purpose="Generate concrete check steps" },
            { id="E8";  name="Reviewer Integration Engine";layer=4; purpose="Link CodeGov/forum evidence" },
            { id="E9";  name="Governance Memory Engine";   layer=5; purpose="Cross-propose links, precedent, follow-up" },
            { id="E10"; name="Post-Execution Watch";       layer=5; purpose="Verify after-state post-execution" },
            { id="E11"; name="Agent Council Engine";       layer=6; purpose="ARCHON+VECTOR+LUMEN+FORGE agents" },
            { id="E12"; name="Public Summary Engine";      layer=0; purpose="Forum-safe plain-language output" },
            { id="E13"; name="Evidence Registry Engine";   layer=4; purpose="Source-link validation for all claims" },
            { id="E14"; name="Dispute/Correction Engine";  layer=4; purpose="Corrections, disputes, version history" },
            { id="E15"; name="Renderability/Export Engine";layer=0; purpose="Markdown, JSON, review packets" }
        ]
    };

    // ================================================================= //
    // AGENT COUNCIL MANIFEST                                             //
    // ================================================================= //

    public type AgentManifest = {
        internalName : Text;
        publicName   : Text;
        role         : AgentRole;
        checks       : [Text];
    };

    public type AgentRole = T.AgentRole;

    public func getAgentManifest() : [AgentManifest] {
        [
            {
                internalName = "ARCHON";
                publicName   = "Integrity Check";
                role         = #Integrity;
                checks = [
                    "Proposal/payload mismatch",
                    "Unclear claims",
                    "Missing evidence",
                    "Unverifiable execution paths",
                    "Hidden risk",
                    "Summary not matching action"
                ];
            },
            {
                internalName = "VECTOR";
                publicName   = "Execution Trace";
                role         = #ExecutionTrace;
                checks = [
                    "Target canister identification",
                    "Method and payload",
                    "Before-state observed",
                    "After-state expected",
                    "Execution status tracking"
                ];
            },
            {
                internalName = "LUMEN";
                publicName   = "Context Map";
                role         = #ContextMap;
                checks = [
                    "Prior related proposals",
                    "Governance history",
                    "Forum discussion links",
                    "Reviewer comments",
                    "Ecosystem context",
                    "Long-term effect"
                ];
            },
            {
                internalName = "FORGE";
                publicName   = "Verification Lab";
                role         = #VerificationLab;
                checks = [
                    "Verification step generation",
                    "Canister query suggestions",
                    "Hash/release-note checks",
                    "Dashboard links",
                    "Post-execution checklist"
                ];
            }
        ]
    };

    // ================================================================= //
    // FULL ORGANISM MANIFEST                                             //
    // ================================================================= //

    public type OroManifest = {
        encodedId       : Text;
        publicName      : Text;
        internalName    : Text;
        publicLine      : Text;
        internalMission : Text;
        executionMode   : Text;
        synCycleNs      : Int;
        rings           : Nat;
        engines         : Nat;
        agents          : Nat;
        canisters       : Nat;
        phiHeartbeatNs  : Int;
        network         : Text;
        daoTypes        : [Text];
        truthLabels     : [Text];
        riskClasses     : [Text];
        guardrails      : [Text];
    };

    public func getOroManifest() : OroManifest {
        {
            encodedId       = T.ORO_ENCODED_ID;
            publicName      = T.ORO_PUBLIC_NAME;
            internalName    = T.ORO_INTERNAL;
            publicLine      = T.ORO_PUBLIC_LINE;
            internalMission = T.ORO_INTERNAL_MISSION;
            executionMode   = "24H_AUTONOMOUS_SYN_CYCLE";
            synCycleNs      = T.SYN_CYCLE_NS;
            rings           = 3;
            engines         = 15;
            agents          = 4;
            canisters       = 5;
            phiHeartbeatNs  = T.PHI_HEARTBEAT_NS;
            network         = "ICP";
            daoTypes        = ["NNS", "SNS"];
            truthLabels     = [
                "claim_only", "payload_identified", "review_supported",
                "execution_pending", "executed_not_verified",
                "verified_after_state", "disputed", "unknown"
            ];
            riskClasses     = [
                "motion", "parameter_change", "code_upgrade", "treasury_action",
                "governance_rule_change", "canister_control_change",
                "frontend_asset_change", "registry_or_network_change",
                "custom_generic_function", "systemic_or_emergency", "unknown"
            ];
            guardrails      = [
                "No adopt/reject recommendations",
                "No DFINITY official approval claims",
                "No CodeGov replacement",
                "No unverified claims marked verified",
                "Every claim source-linked or marked unknown",
                "Every AI finding is reviewable and disputable"
            ];
        }
    };
}
