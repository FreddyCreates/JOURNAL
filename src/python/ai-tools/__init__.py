"""
AI Tools & Memory Token System

Tool registry for autonomous agents, memory tokens for tracking interactions,
and copilot memory bridge for GitHub Copilot integration.

Key Features:
  - AI Tool Registry for agent discovery
  - Memory Token System for interaction tracking
  - Copilot Memory Bridge for persistent memories
  - Protocol Buffer for capability queries
  - Tool composition and verification
  - Memory voting and temporal filtering

Example:
  registry = AIToolRegistry()
  tools = registry.get_tools(agent="AURO", capability="paper-generation")
  
  memory_system = MemoryTokenSystem()
  token = memory_system.create_token(
      token_type="interaction",
      agent="THESIS",
      content="Verified claim X with confidence 0.95"
  )
"""

from __future__ import annotations

import logging
import json
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

logger = logging.getLogger(__name__)


# ============================================================================
# Tool Registry
# ============================================================================


class ToolCapability(Enum):
    """AI tool capabilities."""
    PAPER_GENERATION = "paper-generation"
    CLAIM_VERIFICATION = "claim-verification"
    GOVERNANCE_ENFORCEMENT = "governance-enforcement"
    THREAT_DETECTION = "threat-detection"
    MEMORY_SEARCH = "memory-search"
    ROUTING_DECISION = "routing-decision"
    EVIDENCE_MAPPING = "evidence-mapping"


@dataclass
class AITool:
    """AI tool specification."""
    tool_id: str
    name: str
    description: str
    capability: ToolCapability
    agent: str  # AURO, THESIS, CIVOS PRIME, SENTINEL, etc.
    input_schema: Dict[str, Any]
    output_schema: Dict[str, Any]
    required_approvals: int = 0
    preconditions: List[str] = None  # CPL-L laws to check
    postconditions: List[str] = None  # Governance state changes
    
    def __post_init__(self):
        if self.preconditions is None:
            self.preconditions = []
        if self.postconditions is None:
            self.postconditions = []


class AIToolRegistry:
    """Registry of AI tools for agent discovery and composition."""
    
    def __init__(self):
        """Initialize tool registry."""
        self.tools: Dict[str, AITool] = {}
        self._register_default_tools()
    
    def _register_default_tools(self):
        """Register built-in tools."""
        
        # Paper generation tool (AURO)
        self.register_tool(AITool(
            tool_id="auro-generate-paper",
            name="Generate Research Paper",
            description="Generate a research paper from claims and evidence",
            capability=ToolCapability.PAPER_GENERATION,
            agent="AURO",
            input_schema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "content": {"type": "string"},
                    "category": {"type": "string", "enum": ["architecture", "protocols", "quantum", "defense", "cognitive"]},
                    "thesis_result": {"type": "object"},
                }
            },
            output_schema={
                "type": "object",
                "properties": {
                    "paper_id": {"type": "string"},
                    "url": {"type": "string"},
                    "doi": {"type": "string"},
                }
            },
            preconditions=["sovereign-vault", "governance-enforcement"],
        ))
        
        # Claim verification tool (THESIS)
        self.register_tool(AITool(
            tool_id="thesis-verify-claim",
            name="Verify Research Claim",
            description="Verify a research claim against evidence",
            capability=ToolCapability.CLAIM_VERIFICATION,
            agent="THESIS",
            input_schema={
                "type": "object",
                "properties": {
                    "claim": {"type": "string"},
                    "evidence_sources": {"type": "array", "items": {"type": "string"}},
                }
            },
            output_schema={
                "type": "object",
                "properties": {
                    "verification_id": {"type": "string"},
                    "status": {"type": "string", "enum": ["verified", "rejected", "inconclusive"]},
                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                }
            },
        ))
        
        # Governance enforcement tool (CIVOS PRIME)
        self.register_tool(AITool(
            tool_id="civos-enforce-law",
            name="Enforce Constitutional Law",
            description="Enforce a constitutional law (CPL-L)",
            capability=ToolCapability.GOVERNANCE_ENFORCEMENT,
            agent="CIVOS PRIME",
            input_schema={
                "type": "object",
                "properties": {
                    "law_name": {"type": "string"},
                    "context": {"type": "object"},
                }
            },
            output_schema={
                "type": "object",
                "properties": {
                    "law_id": {"type": "string"},
                    "result": {"type": "string", "enum": ["approved", "denied", "escalated"]},
                }
            },
            required_approvals=1,
        ))
        
        # Threat detection tool (SENTINEL)
        self.register_tool(AITool(
            tool_id="sentinel-detect-threat",
            name="Detect Security Threat",
            description="Detect and isolate security threats",
            capability=ToolCapability.THREAT_DETECTION,
            agent="SENTINEL",
            input_schema={
                "type": "object",
                "properties": {
                    "target": {"type": "string"},
                    "threat_type": {"type": "string"},
                }
            },
            output_schema={
                "type": "object",
                "properties": {
                    "threat_id": {"type": "string"},
                    "severity": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                    "status": {"type": "string"},
                }
            },
        ))
        
        logger.info(f"Registered {len(self.tools)} default tools")
    
    def register_tool(self, tool: AITool):
        """Register a tool."""
        self.tools[tool.tool_id] = tool
        logger.debug(f"Registered tool: {tool.tool_id}")
    
    def get_tool(self, tool_id: str) -> Optional[AITool]:
        """Get a tool by ID."""
        return self.tools.get(tool_id)
    
    def get_tools(
        self,
        agent: Optional[str] = None,
        capability: Optional[ToolCapability] = None,
    ) -> List[AITool]:
        """Get tools by agent or capability."""
        
        results = list(self.tools.values())
        
        if agent:
            results = [t for t in results if t.agent == agent]
        
        if capability:
            results = [t for t in results if t.capability == capability]
        
        return results
    
    def get_tools_for_agent(self, agent: str) -> List[AITool]:
        """Get all tools for a specific agent."""
        return self.get_tools(agent=agent)
    
    def generate_openapi_spec(self) -> Dict[str, Any]:
        """Generate OpenAPI spec from tools."""
        
        paths = {}
        
        for tool in self.tools.values():
            path_key = f"/tools/{tool.tool_id}"
            
            paths[path_key] = {
                "post": {
                    "summary": tool.name,
                    "description": tool.description,
                    "tags": [tool.agent],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": tool.input_schema
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Success",
                            "content": {
                                "application/json": {
                                    "schema": tool.output_schema
                                }
                            }
                        }
                    }
                }
            }
        
        return {
            "openapi": "3.0.0",
            "info": {
                "title": "Sovereign Organism AI Tools API",
                "version": "0.1.0",
            },
            "paths": paths,
        }


# ============================================================================
# Memory Token System
# ============================================================================


class TokenType(Enum):
    """Memory token types."""
    INTERACTION = "interaction"  # Chat log
    DECISION = "decision"  # Governance decision
    PROOF = "proof"  # THESIS verification
    ARTIFACT = "artifact"  # Papers/protocols
    SIGNAL = "signal"  # Status/health signal


@dataclass
class MemoryToken:
    """A memory token for tracking interactions."""
    token_id: str
    token_type: TokenType
    agent: str
    content: str
    timestamp: str
    tags: List[str] = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.metadata is None:
            self.metadata = {}


class MemoryTokenSystem:
    """Track interactions, decisions, and proofs via memory tokens."""
    
    def __init__(self):
        """Initialize memory token system."""
        self.tokens: List[MemoryToken] = []
    
    def create_token(
        self,
        token_type: TokenType,
        agent: str,
        content: str,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> MemoryToken:
        """Create a memory token."""
        
        import uuid
        token_id = f"token-{uuid.uuid4().hex[:12]}"
        
        token = MemoryToken(
            token_id=token_id,
            token_type=token_type,
            agent=agent,
            content=content,
            timestamp=datetime.utcnow().isoformat(),
            tags=tags or [],
            metadata=metadata or {},
        )
        
        self.tokens.append(token)
        
        logger.debug(f"Created memory token: {token_id} ({token_type.value})")
        
        return token
    
    def get_tokens_by_agent(self, agent: str) -> List[MemoryToken]:
        """Get tokens from specific agent."""
        return [t for t in self.tokens if t.agent == agent]
    
    def get_tokens_by_type(self, token_type: TokenType) -> List[MemoryToken]:
        """Get tokens of specific type."""
        return [t for t in self.tokens if t.token_type == token_type]
    
    def export_ledger(self) -> Dict[str, Any]:
        """Export token ledger."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_tokens": len(self.tokens),
            "tokens": [asdict(t) for t in self.tokens],
        }


# ============================================================================
# Copilot Memory Bridge
# ============================================================================


class CopilotMemoryBridge:
    """Bridge to GitHub Copilot memory system."""
    
    def __init__(self):
        """Initialize Copilot memory bridge."""
        self.memories: List[Dict[str, Any]] = []
    
    def store_memory(
        self,
        fact: str,
        citations: str,
        reason: str,
        subject: str,
        scope: str = "repository",
    ) -> Dict[str, Any]:
        """
        Store a memory for future sessions.
        
        Args:
            fact: The fact to remember
            citations: Citations/sources
            reason: Why this fact is important
            subject: Topic (1-2 words)
            scope: "repository" or "user"
            
        Returns:
            Memory record
        """
        
        memory = {
            "fact": fact,
            "citations": citations,
            "reason": reason,
            "subject": subject,
            "scope": scope,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        self.memories.append(memory)
        
        logger.info(f"Stored Copilot memory: {subject}")
        
        return memory
    
    def vote_memory(
        self,
        fact: str,
        direction: str,  # "upvote" or "downvote"
        reason: str,
        scope: str = "repository",
    ) -> Dict[str, Any]:
        """Vote on an existing memory."""
        
        vote = {
            "fact": fact,
            "direction": direction,
            "reason": reason,
            "scope": scope,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        logger.info(f"Voted on memory: {direction} ({scope})")
        
        return vote


# ============================================================================
# Protocol Buffer
# ============================================================================


class ProtocolBuffer:
    """Query 40+ protocols by capability."""
    
    def __init__(self):
        """Initialize protocol buffer."""
        self.protocols: Dict[str, Dict[str, Any]] = {}
        self._load_protocols()
    
    def _load_protocols(self):
        """Load protocol definitions."""
        # In production, would load from governance/protocols/
        
        self.protocols = {
            "PROTO-MMF-001": {
                "name": "Multi-Model Fusion",
                "category": "Intelligence",
                "capabilities": ["routing", "model-selection"],
                "status": "certified",
            },
            "PROTO-QSC-001": {
                "name": "Quantum Consensus",
                "category": "Coordination",
                "capabilities": ["consensus", "distributed-agreement"],
                "status": "active",
            },
            "PROTO-SCV-001": {
                "name": "Sovereign Contract Verification",
                "category": "Security",
                "capabilities": ["verification", "cryptography"],
                "status": "certified",
            },
        }
    
    def query_protocols(self, capability: str) -> List[Dict[str, Any]]:
        """Query protocols by capability."""
        
        results = []
        for protocol_id, protocol in self.protocols.items():
            if capability in protocol.get("capabilities", []):
                protocol["protocol_id"] = protocol_id
                results.append(protocol)
        
        return results
    
    def suggest_protocols(self, use_case: str) -> List[Dict[str, Any]]:
        """Suggest protocols for a use case."""
        # In production, would use semantic matching
        
        logger.info(f"Suggesting protocols for: {use_case}")
        
        return list(self.protocols.values())[:5]
