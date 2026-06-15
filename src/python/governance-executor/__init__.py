"""
Governance Executor — CPL-L law and CPL-P pipeline execution engine

Parses and executes constitutional laws (CPL-L) and governance pipelines (CPL-P).
Integrates with THESIS verification layer for proof-backed decisions.

Key Features:
  - CPL-L parser and validator
  - Pipeline state machine
  - Law enforcement tracking
  - THESIS integration for claim verification
  - Audit trail generation (CIL - Cognitive Immutable Ledger)
  - Multi-stage governance workflows

Example:
  executor = GovernanceExecutor()
  result = await executor.enforce_law(
      law_name="sovereign-vault",
      context={"caller": "zenodo-agent", "operation": "deposit"}
  )
"""

from __future__ import annotations

import logging
import json
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, Callable, Awaitable
from enum import Enum

logger = logging.getLogger(__name__)


class LawStatus(Enum):
    """Law enforcement status."""
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"
    REQUIRES_ESCALATION = "requires_escalation"
    VERIFIED = "verified"
    FAILED = "failed"


@dataclass
class LawClause:
    """A single clause in a constitutional law."""
    name: str
    description: str
    condition: str  # Expression to evaluate
    action: str  # Action to take if condition met
    weight: float = 1.0  # φ-weight for importance
    requires_thesis: bool = False  # Requires THESIS verification


@dataclass
class GovernanceLaw:
    """A complete constitutional law."""
    law_id: str
    name: str
    description: str
    version: str
    created_at: str
    clauses: list[LawClause]
    agents_responsible: list[str]
    enforcement_mode: str  # "strict", "advisory", "automatic"
    escalation_threshold: float = 0.7  # Escalate if importance > threshold
    
    @classmethod
    def from_file(cls, path: Path) -> GovernanceLaw:
        """Load law from CPL-L file."""
        # TODO: Parse CPL-L format
        logger.info(f"Loading law from {path}")
        return cls(
            law_id="example",
            name="Example Law",
            description="",
            version="1.0.0",
            created_at=datetime.utcnow().isoformat(),
            clauses=[],
            agents_responsible=[],
            enforcement_mode="strict"
        )


@dataclass
class PipelineStage:
    """A stage in a governance pipeline (CPL-P)."""
    name: str
    description: str
    condition: str
    action: Callable[[dict[str, Any]], Awaitable[dict[str, Any]]]
    timeout_seconds: int = 60
    retry_count: int = 3


@dataclass
class GovernancePipeline:
    """A governance pipeline (CPL-P)."""
    pipeline_id: str
    name: str
    description: str
    stages: list[PipelineStage]
    required_approvals: int = 1
    escalation_on_failure: bool = True


@dataclass
class EnforcementRecord:
    """Record of law enforcement action."""
    record_id: str
    law_id: str
    timestamp: str
    caller: str
    context: dict[str, Any]
    result: LawStatus
    clauses_evaluated: list[str]
    clauses_triggered: list[str]
    verification_proof: Optional[str] = None
    audit_trail: list[str] = None
    
    def __post_init__(self):
        if self.audit_trail is None:
            self.audit_trail = []


class GovernanceExecutor:
    """Execute constitutional laws and governance pipelines."""
    
    def __init__(
        self,
        laws_dir: Path = Path("governance/laws"),
        pipelines_dir: Path = Path("governance/pipelines"),
        thesis_client=None,
    ):
        """
        Initialize Governance Executor.
        
        Args:
            laws_dir: Directory containing CPL-L law files
            pipelines_dir: Directory containing CPL-P pipeline files
            thesis_client: Optional THESIS client for verification
        """
        self.laws_dir = laws_dir
        self.pipelines_dir = pipelines_dir
        self.thesis_client = thesis_client
        self.laws = {}
        self.pipelines = {}
        self.enforcement_log = []
        
        # Load laws and pipelines
        self._load_laws()
        self._load_pipelines()
    
    def _load_laws(self):
        """Load all laws from laws directory."""
        if not self.laws_dir.exists():
            logger.warning(f"Laws directory not found: {self.laws_dir}")
            return
        
        for law_file in self.laws_dir.glob("*.cpl-l"):
            try:
                law = GovernanceLaw.from_file(law_file)
                self.laws[law.law_id] = law
                logger.info(f"Loaded law: {law.name} ({law.law_id})")
            except Exception as e:
                logger.error(f"Failed to load law {law_file}: {e}")
    
    def _load_pipelines(self):
        """Load all pipelines from pipelines directory."""
        if not self.pipelines_dir.exists():
            logger.warning(f"Pipelines directory not found: {self.pipelines_dir}")
            return
        
        for pipeline_file in self.pipelines_dir.glob("*.cpl-p"):
            try:
                # TODO: Parse CPL-P format
                logger.info(f"Loaded pipeline from {pipeline_file}")
            except Exception as e:
                logger.error(f"Failed to load pipeline {pipeline_file}: {e}")
    
    async def enforce_law(
        self,
        law_name: str,
        context: dict[str, Any],
        require_verification: bool = False,
    ) -> EnforcementRecord:
        """
        Enforce a law in the given context.
        
        Args:
            law_name: Name of the law to enforce
            context: Context dict with caller, operation, etc.
            require_verification: Whether THESIS verification is required
            
        Returns:
            EnforcementRecord with result
        """
        
        # Find law
        law = None
        law_id = None
        for lid, l in self.laws.items():
            if l.name == law_name:
                law = l
                law_id = lid
                break
        
        if not law:
            logger.warning(f"Law not found: {law_name}")
            return EnforcementRecord(
                record_id=self._generate_record_id(),
                law_id="unknown",
                timestamp=datetime.utcnow().isoformat(),
                caller=context.get("caller", "unknown"),
                context=context,
                result=LawStatus.FAILED,
                clauses_evaluated=[],
                clauses_triggered=[],
            )
        
        logger.info(f"Enforcing law: {law.name} (mode: {law.enforcement_mode})")
        
        # Create enforcement record
        record = EnforcementRecord(
            record_id=self._generate_record_id(),
            law_id=law_id,
            timestamp=datetime.utcnow().isoformat(),
            caller=context.get("caller", "unknown"),
            context=context,
            result=LawStatus.PENDING,
            clauses_evaluated=[],
            clauses_triggered=[],
        )
        
        # Evaluate each clause
        triggered_clauses = []
        for clause in law.clauses:
            record.clauses_evaluated.append(clause.name)
            
            # Evaluate condition
            if await self._evaluate_condition(clause.condition, context):
                triggered_clauses.append(clause)
                record.clauses_triggered.append(clause.name)
                record.audit_trail.append(f"Clause triggered: {clause.name}")
        
        # Execute triggered clauses
        if triggered_clauses:
            for clause in triggered_clauses:
                try:
                    if clause.requires_thesis and self.thesis_client:
                        # Get THESIS verification
                        result = await self.thesis_client.verify(
                            claim=clause.action,
                            evidence_sources=context.get("evidence_sources", [])
                        )
                        record.verification_proof = result.get("proof_id")
                        record.audit_trail.append(
                            f"THESIS verification: {result.get('status')}"
                        )
                    
                    # Execute action
                    await self._execute_action(clause.action, context)
                    record.audit_trail.append(f"Action executed: {clause.action}")
                except Exception as e:
                    logger.error(f"Failed to execute clause {clause.name}: {e}")
                    record.audit_trail.append(f"Execution failed: {str(e)}")
                    record.result = LawStatus.FAILED
                    break
        
        # Determine result
        if not triggered_clauses:
            record.result = LawStatus.APPROVED
            record.audit_trail.append("No clauses triggered - law approved")
        elif record.result == LawStatus.FAILED:
            record.audit_trail.append(f"Law enforcement failed")
        else:
            record.result = LawStatus.VERIFIED
            record.audit_trail.append(f"Law enforced successfully")
        
        # Store record
        self.enforcement_log.append(asdict(record))
        
        logger.info(f"Law enforcement result: {record.result.value}")
        return record
    
    async def _evaluate_condition(self, condition: str, context: dict[str, Any]) -> bool:
        """Evaluate a condition expression."""
        # TODO: Implement CPL-L expression evaluation
        # For now, simple string matching
        if not condition:
            return False
        
        # Simple pattern: "context.key == value"
        try:
            # This is a placeholder - real implementation would use a safe evaluator
            return True
        except Exception as e:
            logger.error(f"Condition evaluation failed: {e}")
            return False
    
    async def _execute_action(self, action: str, context: dict[str, Any]):
        """Execute an action."""
        # TODO: Implement CPL-L action execution
        logger.debug(f"Executing action: {action}")
    
    def _generate_record_id(self) -> str:
        """Generate unique record ID."""
        import uuid
        return f"enforcement-{uuid.uuid4().hex[:12]}"
    
    async def execute_pipeline(
        self,
        pipeline_name: str,
        initial_context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Execute a governance pipeline.
        
        Args:
            pipeline_name: Name of the pipeline
            initial_context: Initial context dict
            
        Returns:
            Final context dict after pipeline execution
        """
        
        pipeline = self.pipelines.get(pipeline_name)
        if not pipeline:
            raise ValueError(f"Pipeline not found: {pipeline_name}")
        
        logger.info(f"Executing pipeline: {pipeline_name}")
        
        context = initial_context.copy()
        context["_pipeline_start"] = datetime.utcnow().isoformat()
        
        for stage in pipeline.stages:
            logger.info(f"Executing stage: {stage.name}")
            
            try:
                # Execute stage action
                result = await stage.action(context)
                context.update(result)
                context.setdefault("_stages_executed", []).append(stage.name)
            except Exception as e:
                logger.error(f"Stage failed: {stage.name} - {e}")
                context["_error"] = str(e)
                if pipeline.escalation_on_failure:
                    context["_escalated"] = True
                break
        
        context["_pipeline_end"] = datetime.utcnow().isoformat()
        return context
    
    def get_enforcement_log(self, limit: int = 100) -> list[dict[str, Any]]:
        """Get recent enforcement records."""
        return self.enforcement_log[-limit:]
    
    def get_law_status(self, law_id: str) -> dict[str, Any]:
        """Get status of a specific law."""
        law = self.laws.get(law_id)
        if not law:
            return {"error": f"Law not found: {law_id}"}
        
        return {
            "law_id": law_id,
            "name": law.name,
            "enforcement_mode": law.enforcement_mode,
            "agents_responsible": law.agents_responsible,
            "clause_count": len(law.clauses),
            "recent_enforcements": [
                r for r in self.enforcement_log
                if r["law_id"] == law_id
            ][-10:],
        }
