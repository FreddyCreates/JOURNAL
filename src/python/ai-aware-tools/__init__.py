"""
AI-Aware Tools — Self-describing APIs for autonomous agents

Implements tools that assume they'll be used by AI agents in any context.
Every tool declares its capabilities, preconditions, postconditions, and
can discover related capabilities.

Key Features:
  - Self-describing APIs with complete metadata
  - Agent tracking and attribution
  - Capability declarations
  - Tool composition with verification
  - Lateral discovery of related tools
  - State change auditing

Example:
  tool = AIAwareTool(
      name="verify-claim",
      capability=["verification"],
      agent="THESIS"
  )
  
  # Tool describes itself completely
  spec = tool.describe()
  
  # Can be discovered via capability
  related = tool.discover_related(capability="governance")
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import Any, Callable, Optional, List, Dict
from enum import Enum

logger = logging.getLogger(__name__)


# ============================================================================
# Capability Declaration
# ============================================================================


@dataclass
class Precondition:
    """Precondition that must be met before using a tool."""
    name: str
    description: str
    law_or_check: str  # CPL-L law name or check function
    critical: bool = True  # Fail if not met?


@dataclass
class Postcondition:
    """State change that occurs after tool execution."""
    name: str
    description: str
    state_change: str
    audit_event: str  # Event to log


@dataclass
class ToolCapability:
    """Declaration of what a tool can do."""
    name: str
    description: str
    preconditions: List[Precondition] = field(default_factory=list)
    postconditions: List[Postcondition] = field(default_factory=list)
    related_capabilities: List[str] = field(default_factory=list)
    requires_governance_approval: bool = False
    requires_thesis_verification: bool = False


@dataclass
class AgentMetadata:
    """Metadata about which agent used a tool."""
    agent_name: str  # AURO, THESIS, CIVOS PRIME, etc.
    agent_role: str
    timestamp: str
    operation_id: str
    reason: str = ""
    confidence: float = 1.0


@dataclass
class ToolExecution:
    """Record of tool execution."""
    execution_id: str
    tool_id: str
    agent: AgentMetadata
    input_data: Dict[str, Any]
    output_data: Optional[Dict[str, Any]] = None
    status: str = "pending"  # pending, success, failure, escalated
    error: Optional[str] = None
    preconditions_met: List[str] = field(default_factory=list)
    preconditions_failed: List[str] = field(default_factory=list)
    postconditions_applied: List[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    completed_at: Optional[str] = None


# ============================================================================
# AI-Aware Tool Base
# ============================================================================


class AIAwareTool:
    """Base class for tools that describe themselves to AI agents."""
    
    def __init__(
        self,
        tool_id: str,
        name: str,
        description: str,
        agent: str,
        capability: ToolCapability,
        executor: Optional[Callable] = None,
    ):
        """
        Initialize AI-Aware Tool.
        
        Args:
            tool_id: Unique tool identifier
            name: Human-readable name
            description: What the tool does
            agent: Agent that implements this tool
            capability: ToolCapability declaration
            executor: Optional async function to execute tool
        """
        self.tool_id = tool_id
        self.name = name
        self.description = description
        self.agent = agent
        self.capability = capability
        self.executor = executor
        self.executions: List[ToolExecution] = []
    
    def describe(self) -> Dict[str, Any]:
        """
        Describe the tool completely for AI agents.
        
        Returns:
            Dict with full tool specification
        """
        return {
            "tool_id": self.tool_id,
            "name": self.name,
            "description": self.description,
            "agent": self.agent,
            "capability": {
                "name": self.capability.name,
                "description": self.capability.description,
                "requires_governance_approval": self.capability.requires_governance_approval,
                "requires_thesis_verification": self.capability.requires_thesis_verification,
            },
            "preconditions": [asdict(p) for p in self.capability.preconditions],
            "postconditions": [asdict(p) for p in self.capability.postconditions],
            "related_capabilities": self.capability.related_capabilities,
        }
    
    async def execute(
        self,
        input_data: Dict[str, Any],
        agent: AgentMetadata,
    ) -> ToolExecution:
        """
        Execute the tool.
        
        Args:
            input_data: Input parameters
            agent: Agent executing the tool
            
        Returns:
            ToolExecution record
        """
        
        import uuid
        execution_id = f"exec-{uuid.uuid4().hex[:12]}"
        
        execution = ToolExecution(
            execution_id=execution_id,
            tool_id=self.tool_id,
            agent=agent,
            input_data=input_data,
        )
        
        try:
            # Check preconditions
            execution.status = "pending"
            for precond in self.capability.preconditions:
                try:
                    # TODO: Actually evaluate preconditions
                    execution.preconditions_met.append(precond.name)
                except Exception as e:
                    execution.preconditions_failed.append(precond.name)
                    if precond.critical:
                        execution.status = "failure"
                        execution.error = f"Precondition failed: {precond.name}"
                        return execution
            
            # Execute tool
            if self.executor:
                execution.output_data = await self.executor(input_data)
            else:
                execution.output_data = await self._default_execute(input_data)
            
            # Apply postconditions
            for postcond in self.capability.postconditions:
                execution.postconditions_applied.append(postcond.name)
            
            execution.status = "success"
            
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            execution.status = "failure"
            execution.error = str(e)
        
        execution.completed_at = datetime.utcnow().isoformat()
        
        # Store execution record
        self.executions.append(execution)
        
        return execution
    
    async def _default_execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Default executor (placeholder)."""
        return {"status": "executed", "input": input_data}
    
    def get_execution_history(self, limit: int = 50) -> List[ToolExecution]:
        """Get recent executions."""
        return self.executions[-limit:]
    
    def discover_related(
        self,
        capability_filter: Optional[str] = None,
    ) -> List[str]:
        """
        Discover related capabilities that should run after this tool.
        
        Returns:
            List of related capability names
        """
        related = list(self.capability.related_capabilities)
        
        if capability_filter:
            related = [c for c in related if capability_filter in c]
        
        return related


# ============================================================================
# AI-Aware Tool Factory
# ============================================================================


class AIAwareToolFactory:
    """Factory for creating AI-Aware tools."""
    
    @staticmethod
    def create_verification_tool() -> AIAwareTool:
        """Create a claim verification tool."""
        
        capability = ToolCapability(
            name="claim-verification",
            description="Verify research claims against evidence",
            preconditions=[
                Precondition(
                    name="thesis-available",
                    description="THESIS verification engine is available",
                    law_or_check="thesis-verification",
                    critical=True,
                )
            ],
            postconditions=[
                Postcondition(
                    name="verification-record-created",
                    description="Verification record stored in memory vault",
                    state_change="memory_vault.add_record",
                    audit_event="claim_verified",
                )
            ],
            related_capabilities=["governance-enforcement", "paper-generation"],
            requires_thesis_verification=True,
        )
        
        return AIAwareTool(
            tool_id="tool-claim-verify",
            name="Verify Claim",
            description="Verify a research claim against evidence sources",
            agent="THESIS",
            capability=capability,
        )
    
    @staticmethod
    def create_governance_tool() -> AIAwareTool:
        """Create a governance enforcement tool."""
        
        capability = ToolCapability(
            name="governance-enforcement",
            description="Enforce constitutional laws",
            preconditions=[
                Precondition(
                    name="law-loaded",
                    description="CPL-L law file is loaded",
                    law_or_check="check-law-exists",
                    critical=True,
                )
            ],
            postconditions=[
                Postcondition(
                    name="enforcement-record-created",
                    description="Enforcement record in immutable ledger",
                    state_change="governance.enforce",
                    audit_event="law_enforced",
                )
            ],
            related_capabilities=["verification", "threat-detection"],
            requires_governance_approval=True,
        )
        
        return AIAwareTool(
            tool_id="tool-governance-enforce",
            name="Enforce Law",
            description="Enforce a constitutional law in a given context",
            agent="CIVOS PRIME",
            capability=capability,
        )
    
    @staticmethod
    def create_threat_detection_tool() -> AIAwareTool:
        """Create a threat detection tool."""
        
        capability = ToolCapability(
            name="threat-detection",
            description="Detect and isolate security threats",
            preconditions=[],
            postconditions=[
                Postcondition(
                    name="threat-isolated",
                    description="Threat is isolated and contained",
                    state_change="security.isolate_threat",
                    audit_event="threat_detected",
                )
            ],
            related_capabilities=["governance-enforcement"],
        )
        
        return AIAwareTool(
            tool_id="tool-threat-detect",
            name="Detect Threat",
            description="Detect and isolate security threats",
            agent="SENTINEL",
            capability=capability,
        )


# ============================================================================
# Tool Composition
# ============================================================================


class ToolComposer:
    """Compose multiple tools into workflows."""
    
    def __init__(self):
        """Initialize tool composer."""
        self.tools: Dict[str, AIAwareTool] = {}
    
    def register_tool(self, tool: AIAwareTool):
        """Register a tool."""
        self.tools[tool.tool_id] = tool
        logger.debug(f"Registered tool: {tool.tool_id}")
    
    async def compose_workflow(
        self,
        initial_tool: str,
        input_data: Dict[str, Any],
        agent: AgentMetadata,
        max_steps: int = 10,
    ) -> List[ToolExecution]:
        """
        Compose and execute a workflow starting from initial tool.
        
        Args:
            initial_tool: Tool ID to start with
            input_data: Initial input
            agent: Executing agent
            max_steps: Max tools to execute
            
        Returns:
            List of execution records
        """
        
        executions: List[ToolExecution] = []
        current_input = input_data
        current_tool_id = initial_tool
        step = 0
        
        while step < max_steps and current_tool_id in self.tools:
            tool = self.tools[current_tool_id]
            
            logger.info(f"Executing tool in workflow: {tool.name}")
            
            # Execute tool
            execution = await tool.execute(current_input, agent)
            executions.append(execution)
            
            if execution.status == "failure":
                logger.warning(f"Tool failed, stopping workflow")
                break
            
            # Discover next tool
            related = tool.discover_related()
            if related:
                current_tool_id = related[0]
                current_input = execution.output_data or current_input
            else:
                break
            
            step += 1
        
        return executions
