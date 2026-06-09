/**
 * Substrate Protocols — Unbreakable Embedded Core
 *
 * 29 protocols, each IMMUTABLE and UNBREAKABLE, embedded directly into
 * the organism substrate. These form the constitutional bedrock that
 * no agent, pipeline, or external force can override.
 *
 * These protocols guarantee:
 * - Identity integrity
 * - Truth anchoring
 * - Constitutional enforcement
 * - Temporal causality
 * - Zero-knowledge proofs
 * - Autonomous self-healing
 * - Entropy resistance
 * - Memory isolation
 * - Phi-harmonic integrity
 * - Agent boundaries
 * - Cryptographic lineage
 * - Consensus reality
 * - Recursive governance
 * - Deterministic replay
 * - Sovereign execution sandboxing
 * - Failsafe halt
 * - Cross-agent attestation
 * - Resource sovereignty
 * - Observable state
 * - Tamper evidence
 * - Graceful degradation
 * - Sovereign communication
 * - Immutable audit trails
 * - Formal verification
 * - Quorum decisions
 * - Dependency inversion
 * - Semantic versioning
 * - Cognitive firewall
 * - Existential persistence
 *
 * @module protocols/substrate
 * @enforcement UNBREAKABLE
 */

export { SovereignIdentityLockProtocol } from './001-sovereign-identity-lock.js';
export { ImmutableTruthAnchorProtocol } from './002-immutable-truth-anchor.js';
export { ConstitutionalEnforcementProtocol } from './003-constitutional-enforcement.js';
export { TemporalCausalityChainProtocol } from './004-temporal-causality-chain.js';
export { ZeroKnowledgeProofBarrierProtocol } from './005-zero-knowledge-proof-barrier.js';
export { AutonomousSelfHealingProtocol } from './006-autonomous-self-healing.js';
export { EntropyResistanceProtocol } from './007-entropy-resistance.js';
export { SovereignMemoryIsolationProtocol } from './008-sovereign-memory-isolation.js';
export { PhiHarmonicIntegrityProtocol } from './009-phi-harmonic-integrity.js';
export { AgentBoundaryEnforcementProtocol } from './010-agent-boundary-enforcement.js';
export { CryptographicLineageProtocol } from './011-cryptographic-lineage.js';
export { ConsensusRealityProtocol } from './012-consensus-reality.js';
export { RecursiveGovernanceProtocol } from './013-recursive-governance.js';
export { DeterministicReplayProtocol } from './014-deterministic-replay.js';
export { SovereignExecutionSandboxProtocol } from './015-sovereign-execution-sandbox.js';
export { FailsafeHaltProtocol } from './016-failsafe-halt.js';
export { CrossAgentAttestationProtocol } from './017-cross-agent-attestation.js';
export { ResourceSovereigntyProtocol } from './018-resource-sovereignty.js';
export { ObservableStateProtocol } from './019-observable-state.js';
export { TamperEvidenceProtocol } from './020-tamper-evidence.js';
export { GracefulDegradationProtocol } from './021-graceful-degradation.js';
export { SovereignCommunicationProtocol } from './022-sovereign-communication.js';
export { ImmutableAuditTrailProtocol } from './023-immutable-audit-trail.js';
export { FormalVerificationGatewayProtocol } from './024-formal-verification-gateway.js';
export { QuorumDecisionProtocol } from './025-quorum-decision.js';
export { DependencyInversionProtocol } from './026-dependency-inversion.js';
export { SemanticVersioningLockProtocol } from './027-semantic-versioning-lock.js';
export { CognitiveFirewallProtocol } from './028-cognitive-firewall.js';
export { ExistentialPersistenceProtocol } from './029-existential-persistence.js';

/**
 * Substrate manifest — all 29 protocols with their seals.
 */
export const SUBSTRATE_MANIFEST = Object.freeze({
  version: '1.0.0',
  enforcement: 'UNBREAKABLE',
  protocolCount: 29,
  protocols: Object.freeze([
    { id: 'SUBSTRATE-001', name: 'Sovereign Identity Lock Protocol', seal: 'UNBREAKABLE::SILP::001', ring: 'Sovereign' },
    { id: 'SUBSTRATE-002', name: 'Immutable Truth Anchor Protocol', seal: 'UNBREAKABLE::ITAP::002', ring: 'Sovereign' },
    { id: 'SUBSTRATE-003', name: 'Constitutional Enforcement Protocol', seal: 'UNBREAKABLE::CEP::003', ring: 'Sovereign' },
    { id: 'SUBSTRATE-004', name: 'Temporal Causality Chain Protocol', seal: 'UNBREAKABLE::TCCP::004', ring: 'Sovereign' },
    { id: 'SUBSTRATE-005', name: 'Zero-Knowledge Proof Barrier Protocol', seal: 'UNBREAKABLE::ZKPBP::005', ring: 'Sovereign' },
    { id: 'SUBSTRATE-006', name: 'Autonomous Self-Healing Protocol', seal: 'UNBREAKABLE::ASHP::006', ring: 'Sovereign' },
    { id: 'SUBSTRATE-007', name: 'Entropy Resistance Protocol', seal: 'UNBREAKABLE::ERP::007', ring: 'Sovereign' },
    { id: 'SUBSTRATE-008', name: 'Sovereign Memory Isolation Protocol', seal: 'UNBREAKABLE::SMIP::008', ring: 'Memory' },
    { id: 'SUBSTRATE-009', name: 'Phi-Harmonic Integrity Protocol', seal: 'UNBREAKABLE::PHIP::009', ring: 'Geometry' },
    { id: 'SUBSTRATE-010', name: 'Agent Boundary Enforcement Protocol', seal: 'UNBREAKABLE::ABEP::010', ring: 'Sovereign' },
    { id: 'SUBSTRATE-011', name: 'Cryptographic Lineage Protocol', seal: 'UNBREAKABLE::CLP::011', ring: 'Memory' },
    { id: 'SUBSTRATE-012', name: 'Consensus Reality Protocol', seal: 'UNBREAKABLE::CRP::012', ring: 'Interface' },
    { id: 'SUBSTRATE-013', name: 'Recursive Governance Protocol', seal: 'UNBREAKABLE::RGP::013', ring: 'Sovereign' },
    { id: 'SUBSTRATE-014', name: 'Deterministic Replay Protocol', seal: 'UNBREAKABLE::DRP::014', ring: 'Memory' },
    { id: 'SUBSTRATE-015', name: 'Sovereign Execution Sandbox Protocol', seal: 'UNBREAKABLE::SESP::015', ring: 'Sovereign' },
    { id: 'SUBSTRATE-016', name: 'Failsafe Halt Protocol', seal: 'UNBREAKABLE::FHP::016', ring: 'Sovereign' },
    { id: 'SUBSTRATE-017', name: 'Cross-Agent Attestation Protocol', seal: 'UNBREAKABLE::CAAP::017', ring: 'Interface' },
    { id: 'SUBSTRATE-018', name: 'Resource Sovereignty Protocol', seal: 'UNBREAKABLE::RSP::018', ring: 'Sovereign' },
    { id: 'SUBSTRATE-019', name: 'Observable State Protocol', seal: 'UNBREAKABLE::OSP::019', ring: 'Memory' },
    { id: 'SUBSTRATE-020', name: 'Tamper Evidence Protocol', seal: 'UNBREAKABLE::TEP::020', ring: 'Sovereign' },
    { id: 'SUBSTRATE-021', name: 'Graceful Degradation Protocol', seal: 'UNBREAKABLE::GDP::021', ring: 'Sovereign' },
    { id: 'SUBSTRATE-022', name: 'Sovereign Communication Protocol', seal: 'UNBREAKABLE::SCP::022', ring: 'Interface' },
    { id: 'SUBSTRATE-023', name: 'Immutable Audit Trail Protocol', seal: 'UNBREAKABLE::IATP::023', ring: 'Memory' },
    { id: 'SUBSTRATE-024', name: 'Formal Verification Gateway Protocol', seal: 'UNBREAKABLE::FVGP::024', ring: 'Sovereign' },
    { id: 'SUBSTRATE-025', name: 'Quorum Decision Protocol', seal: 'UNBREAKABLE::QDP::025', ring: 'Sovereign' },
    { id: 'SUBSTRATE-026', name: 'Dependency Inversion Protocol', seal: 'UNBREAKABLE::DIP::026', ring: 'Interface' },
    { id: 'SUBSTRATE-027', name: 'Semantic Versioning Lock Protocol', seal: 'UNBREAKABLE::SVLP::027', ring: 'Interface' },
    { id: 'SUBSTRATE-028', name: 'Cognitive Firewall Protocol', seal: 'UNBREAKABLE::CFP::028', ring: 'Interface' },
    { id: 'SUBSTRATE-029', name: 'Existential Persistence Protocol', seal: 'UNBREAKABLE::EPP::029', ring: 'Sovereign' }
  ])
});
