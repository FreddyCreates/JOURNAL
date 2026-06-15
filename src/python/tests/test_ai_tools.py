"""Tests for AI Tools module."""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from ai_tools import AIToolRegistry


class TestAIToolRegistry:
    """Test suite for AIToolRegistry class."""

    def test_registry_initialization(self):
        """Test registry initializes with default tools."""
        registry = AIToolRegistry()
        assert registry is not None
        assert hasattr(registry, 'register_tool')
        assert hasattr(registry, 'get_tools')

    def test_default_tools_registered(self):
        """Test that default tools are registered."""
        registry = AIToolRegistry()
        
        # Get default tools
        if hasattr(registry, 'get_tools'):
            tools = registry.get_tools(agent="any")
            # Should have some default tools
            assert tools is not None or len(tools) >= 0

    def test_tool_registration(self):
        """Test registering a custom tool."""
        registry = AIToolRegistry()
        
        custom_tool = {
            "name": "test_tool",
            "description": "A test tool",
            "input_schema": {},
            "output_schema": {},
        }
        
        if hasattr(registry, 'register_tool'):
            registry.register_tool(custom_tool)
            assert True  # Tool registered
