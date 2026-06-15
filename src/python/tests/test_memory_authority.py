"""Tests for Memory Authority module."""

import pytest
from unittest.mock import MagicMock, patch
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from memory_authority import MemoryVault, Memory


class TestMemoryVault:
    """Test suite for MemoryVault class."""

    def test_vault_initialization(self):
        """Test vault initializes with default capacity."""
        vault = MemoryVault()
        assert vault is not None
        assert hasattr(vault, 'store')
        assert hasattr(vault, 'retrieve')
        assert hasattr(vault, 'search')

    def test_memory_storage(self):
        """Test storing memory in vault."""
        vault = MemoryVault()
        
        result = vault.store(
            content="Test memory content",
            agent="test_agent",
            memory_type="interaction",
            tags=["test", "memory"],
            citations=["test_citation"]
        )
        
        assert result is not None
        assert hasattr(result, 'memory_id')
        assert hasattr(result, 'content_hash')

    def test_memory_retrieval(self):
        """Test retrieving stored memory."""
        vault = MemoryVault()
        
        stored = vault.store(
            content="Retrievable content",
            agent="test_agent",
            memory_type="decision",
            tags=["retrieval_test"]
        )
        
        retrieved = vault.retrieve(stored.memory_id)
        assert retrieved is not None
        assert retrieved.content == "Retrievable content"

    def test_memory_search(self):
        """Test searching memories."""
        vault = MemoryVault()
        
        vault.store(
            content="First memory about AI",
            agent="agent_a",
            tags=["ai", "test"]
        )
        vault.store(
            content="Second memory about AI verification",
            agent="agent_b",
            tags=["ai", "verification"]
        )
        
        results = vault.search("AI", agent="agent_a")
        assert len(results) > 0

    def test_memory_voting(self):
        """Test upvoting and downvoting memories."""
        vault = MemoryVault()
        
        memory = vault.store(
            content="Voteable memory",
            agent="test_agent"
        )
        
        vault.vote(memory.memory_id, direction="upvote")
        updated = vault.retrieve(memory.memory_id)
        assert updated.upvotes == 1
        assert updated.vote_score() == 1

    def test_memory_expiration(self):
        """Test memory expiration functionality."""
        vault = MemoryVault()
        from datetime import datetime, timedelta
        
        expires_at = datetime.now() + timedelta(seconds=10)
        memory = vault.store(
            content="Expiring memory",
            agent="test_agent",
            expires_at=expires_at
        )
        
        assert memory.expires_at is not None
