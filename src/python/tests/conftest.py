"""Pytest configuration and shared fixtures."""

import asyncio
import pytest
from pathlib import Path
import tempfile
from typing import Generator, AsyncGenerator

# Add src/python to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def async_client():
    """Async HTTP client for testing."""
    import httpx
    async with httpx.AsyncClient() as client:
        yield client


@pytest.fixture
def temp_dir() -> Generator:
    """Temporary directory for test files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_env_vars(monkeypatch):
    """Set mock environment variables for testing."""
    monkeypatch.setenv("PYTHONPATH", str(Path(__file__).parent.parent))
    monkeypatch.setenv("TEST_MODE", "true")
    monkeypatch.setenv("LOG_LEVEL", "DEBUG")
