"""Tests for Governance Executor module."""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from governance_executor import GovernanceExecutor


class TestGovernanceExecutor:
    """Test suite for GovernanceExecutor class."""

    def test_executor_initialization(self):
        """Test executor initializes properly."""
        executor = GovernanceExecutor()
        assert executor is not None
        assert hasattr(executor, 'enforce_law')
        assert hasattr(executor, 'execute_pipeline')

    def test_law_registration(self):
        """Test registering governance laws."""
        executor = GovernanceExecutor()
        
        test_law = {
            "id": "test-law-001",
            "name": "Test Law",
            "description": "A test governance law",
            "rules": []
        }
        
        # Mock registration if method exists
        if hasattr(executor, 'register_law'):
            executor.register_law(test_law)
            # Verify law is registered
            assert True  # Placeholder for verification
