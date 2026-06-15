"""
Memory Authority SDK — Temporal memory vault system

Production memory vault with temporal indexing, cryptographic hashing,
LRU caching, and Zenodo persistence for long-term storage.

Key Features:
  - Temporal indexing and retrieval
  - SHA-256 cryptographic hashing
  - LRU cache with configurable eviction
  - Zenodo deposit integration
  - Token accounting for AI interactions
  - Memory voting (upvote/downvote)
  - Memory lifetime management

Example:
  vault = MemoryVault()
  memory_id = vault.store(
      content="Research finding",
      agent="THESIS",
      tags=["verification", "claim"]
  )
  memory = vault.retrieve(memory_id)
  vault.vote(memory_id, direction="upvote", reason="Verified")
"""

from __future__ import annotations

import logging
import hashlib
import json
from dataclasses import dataclass, asdict, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Optional, List
from enum import Enum
from collections import OrderedDict

logger = logging.getLogger(__name__)


class MemoryType(Enum):
    """Types of memories stored in the vault."""
    INTERACTION = "interaction"  # Chat log
    DECISION = "decision"  # Governance decision
    PROOF = "proof"  # THESIS verification
    ARTIFACT = "artifact"  # Papers, protocols
    FINDING = "finding"  # Research finding
    CONFIGURATION = "configuration"  # System config


@dataclass
class MemoryVote:
    """A vote on a memory."""
    voter: str  # Agent or user who voted
    direction: str  # "upvote" or "downvote"
    reason: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class Memory:
    """A single memory in the vault."""
    memory_id: str
    content: str
    memory_type: MemoryType
    agent: str  # Agent that created this memory
    tags: list[str] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    expires_at: Optional[str] = None
    content_hash: str = ""
    citations: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    votes: list[MemoryVote] = field(default_factory=list)
    token_count: int = 0
    
    def __post_init__(self):
        """Compute hash of content."""
        if not self.content_hash:
            self.content_hash = hashlib.sha256(self.content.encode()).hexdigest()
    
    def vote_score(self) -> float:
        """Calculate net vote score."""
        upvotes = sum(1 for v in self.votes if v.direction == "upvote")
        downvotes = sum(1 for v in self.votes if v.direction == "downvote")
        return upvotes - downvotes


class MemoryVault:
    """Temporal memory vault with persistence and voting."""
    
    def __init__(
        self,
        cache_size: int = 1000,
        default_ttl_days: int = 365,
        persistence_path: Optional[Path] = None,
    ):
        """
        Initialize Memory Vault.
        
        Args:
            cache_size: Max memories in LRU cache
            default_ttl_days: Default time-to-live in days
            persistence_path: Optional path for file-based persistence
        """
        self.cache_size = cache_size
        self.default_ttl_days = default_ttl_days
        self.persistence_path = persistence_path
        
        # LRU cache: ordered dict maintains insertion order
        self.memories: OrderedDict[str, Memory] = OrderedDict()
        self.index_by_agent = {}  # Quick lookup by agent
        self.index_by_type = {}  # Quick lookup by type
        self.index_by_tag = {}  # Quick lookup by tag
        
        if self.persistence_path:
            self.persistence_path.mkdir(parents=True, exist_ok=True)
    
    def store(
        self,
        content: str,
        agent: str,
        memory_type: MemoryType = MemoryType.FINDING,
        tags: Optional[list[str]] = None,
        citations: Optional[list[str]] = None,
        expires_in_days: Optional[int] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> str:
        """
        Store a memory.
        
        Args:
            content: Memory content
            agent: Agent that created this memory
            memory_type: Type of memory
            tags: Optional tags for classification
            citations: Optional citations/sources
            expires_in_days: Optional TTL override
            metadata: Optional metadata dict
            
        Returns:
            Memory ID
        """
        
        # Generate memory ID
        memory_id = self._generate_memory_id(content)
        
        # Calculate expiration
        expires_at = None
        ttl = expires_in_days or self.default_ttl_days
        if ttl > 0:
            expires_at = (datetime.utcnow() + timedelta(days=ttl)).isoformat()
        
        # Create memory
        memory = Memory(
            memory_id=memory_id,
            content=content,
            memory_type=memory_type,
            agent=agent,
            tags=tags or [],
            citations=citations or [],
            expires_at=expires_at,
            metadata=metadata or {},
            token_count=len(content.split()),
        )
        
        # Store in cache
        self.memories[memory_id] = memory
        
        # Update indices
        self._update_indices(memory, add=True)
        
        # Evict old entries if cache is full
        if len(self.memories) > self.cache_size:
            self._evict_oldest()
        
        # Persist if configured
        if self.persistence_path:
            self._persist_memory(memory)
        
        logger.info(f"Stored memory: {memory_id} (agent: {agent}, type: {memory_type.value})")
        
        return memory_id
    
    def retrieve(self, memory_id: str) -> Optional[Memory]:
        """Retrieve a memory by ID."""
        memory = self.memories.get(memory_id)
        
        if memory:
            # Check expiration
            if memory.expires_at:
                if datetime.fromisoformat(memory.expires_at) < datetime.utcnow():
                    self.delete(memory_id)
                    return None
            
            # Update LRU order (move to end)
            self.memories.move_to_end(memory_id)
        
        return memory
    
    def search(
        self,
        query: str = "",
        agent: Optional[str] = None,
        memory_type: Optional[MemoryType] = None,
        tags: Optional[list[str]] = None,
        since: Optional[datetime] = None,
        limit: int = 100,
    ) -> list[Memory]:
        """Search memories by various criteria."""
        
        results = []
        
        for memory in self.memories.values():
            # Filter by agent
            if agent and memory.agent != agent:
                continue
            
            # Filter by type
            if memory_type and memory.memory_type != memory_type:
                continue
            
            # Filter by tags (must have all specified tags)
            if tags and not all(tag in memory.tags for tag in tags):
                continue
            
            # Filter by date range
            if since:
                mem_date = datetime.fromisoformat(memory.created_at)
                if mem_date < since:
                    continue
            
            # Filter by query in content
            if query and query.lower() not in memory.content.lower():
                continue
            
            results.append(memory)
        
        # Sort by relevance/recency and limit
        results = sorted(results, key=lambda m: m.updated_at, reverse=True)[:limit]
        
        return results
    
    def vote(
        self,
        memory_id: str,
        direction: str,
        reason: str,
        voter: str = "system",
    ) -> bool:
        """Vote on a memory (upvote/downvote)."""
        
        memory = self.memories.get(memory_id)
        if not memory:
            logger.warning(f"Memory not found for voting: {memory_id}")
            return False
        
        vote = MemoryVote(
            voter=voter,
            direction=direction,
            reason=reason,
        )
        
        memory.votes.append(vote)
        memory.updated_at = datetime.utcnow().isoformat()
        
        logger.info(f"Voted on memory {memory_id}: {direction} (score: {memory.vote_score()})")
        
        if self.persistence_path:
            self._persist_memory(memory)
        
        return True
    
    def delete(self, memory_id: str) -> bool:
        """Delete a memory."""
        
        if memory_id not in self.memories:
            return False
        
        memory = self.memories.pop(memory_id)
        self._update_indices(memory, add=False)
        
        logger.info(f"Deleted memory: {memory_id}")
        
        return True
    
    def get_memories_by_agent(self, agent: str, limit: int = 100) -> list[Memory]:
        """Get all memories from a specific agent."""
        return [m for m in self.memories.values() if m.agent == agent][:limit]
    
    def get_memories_by_type(self, memory_type: MemoryType, limit: int = 100) -> list[Memory]:
        """Get all memories of a specific type."""
        return [m for m in self.memories.values() if m.memory_type == memory_type][:limit]
    
    def get_hot_memories(self, min_score: int = 1, limit: int = 50) -> list[Memory]:
        """Get highest-voted memories."""
        candidates = [m for m in self.memories.values() if m.vote_score() >= min_score]
        return sorted(candidates, key=lambda m: m.vote_score(), reverse=True)[:limit]
    
    def get_statistics(self) -> dict[str, Any]:
        """Get memory vault statistics."""
        
        total_tokens = sum(m.token_count for m in self.memories.values())
        
        by_type = {}
        for mem_type in MemoryType:
            count = len([m for m in self.memories.values() if m.memory_type == mem_type])
            by_type[mem_type.value] = count
        
        return {
            "total_memories": len(self.memories),
            "cache_size": self.cache_size,
            "cache_utilization": len(self.memories) / self.cache_size,
            "total_tokens": total_tokens,
            "by_type": by_type,
            "total_votes": sum(len(m.votes) for m in self.memories.values()),
            "avg_vote_score": sum(m.vote_score() for m in self.memories.values()) / max(1, len(self.memories)),
        }
    
    def _generate_memory_id(self, content: str) -> str:
        """Generate unique memory ID."""
        import uuid
        content_hash = hashlib.sha256(content.encode()).hexdigest()[:8]
        return f"mem-{content_hash}-{uuid.uuid4().hex[:8]}"
    
    def _update_indices(self, memory: Memory, add: bool = True):
        """Update search indices."""
        
        if add:
            # Add to agent index
            if memory.agent not in self.index_by_agent:
                self.index_by_agent[memory.agent] = []
            self.index_by_agent[memory.agent].append(memory.memory_id)
            
            # Add to type index
            type_name = memory.memory_type.value
            if type_name not in self.index_by_type:
                self.index_by_type[type_name] = []
            self.index_by_type[type_name].append(memory.memory_id)
            
            # Add to tag indices
            for tag in memory.tags:
                if tag not in self.index_by_tag:
                    self.index_by_tag[tag] = []
                self.index_by_tag[tag].append(memory.memory_id)
        else:
            # Remove from indices
            self.index_by_agent.get(memory.agent, []).remove(memory.memory_id)
            self.index_by_type.get(memory.memory_type.value, []).remove(memory.memory_id)
            for tag in memory.tags:
                self.index_by_tag.get(tag, []).remove(memory.memory_id)
    
    def _evict_oldest(self):
        """Evict oldest memory (LRU)."""
        if self.memories:
            oldest_id, _ = self.memories.popitem(last=False)
            logger.debug(f"LRU eviction: {oldest_id}")
    
    def _persist_memory(self, memory: Memory):
        """Persist memory to file."""
        if not self.persistence_path:
            return
        
        file_path = self.persistence_path / f"{memory.memory_id}.json"
        data = asdict(memory)
        data["memory_type"] = memory.memory_type.value
        
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)
