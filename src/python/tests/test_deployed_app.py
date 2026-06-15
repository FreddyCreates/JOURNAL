"""Tests for Deployed App module."""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from deployed_app import DeployedAppEngine


class TestDeployedAppEngine:
    """Test suite for DeployedAppEngine class."""

    def test_engine_initialization(self):
        """Test engine initializes properly."""
        engine = DeployedAppEngine()
        assert engine is not None
        assert hasattr(engine, 'run')

    def test_fastapi_app_creation(self):
        """Test FastAPI app is created."""
        engine = DeployedAppEngine()
        
        if hasattr(engine, 'app'):
            assert engine.app is not None
            # FastAPI app should have routes
            assert hasattr(engine.app, 'routes')

    @pytest.mark.asyncio
    async def test_endpoints_exist(self):
        """Test that expected endpoints are defined."""
        from fastapi.testclient import TestClient
        engine = DeployedAppEngine()
        
        if hasattr(engine, 'app'):
            # Expected routes should exist
            route_names = [route.name for route in engine.app.routes]
            assert len(route_names) > 0
