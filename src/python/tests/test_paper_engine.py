"""Tests for Paper Engine module."""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from paper_engine import PaperSynthesizer


class TestPaperSynthesizer:
    """Test suite for PaperSynthesizer class."""

    def test_synthesizer_initialization(self):
        """Test synthesizer initializes properly."""
        synthesizer = PaperSynthesizer()
        assert synthesizer is not None
        assert hasattr(synthesizer, 'generate_paper')

    def test_paper_generation(self, temp_dir):
        """Test paper generation functionality."""
        synthesizer = PaperSynthesizer()
        
        paper = synthesizer.generate_paper(
            title="Test Paper on Sovereign Intelligence",
            content="# Introduction\nThis is a test paper.",
            category="architecture"
        )
        
        assert paper is not None
        assert hasattr(paper, 'paper_id')
        assert hasattr(paper, 'title')
        assert paper.title == "Test Paper on Sovereign Intelligence"

    def test_paper_metadata(self):
        """Test paper metadata creation."""
        synthesizer = PaperSynthesizer()
        
        paper = synthesizer.generate_paper(
            title="Test Metadata Paper",
            content="Content",
            category="protocols",
            author="Test Author",
            keywords=["test", "sovereignty"]
        )
        
        assert paper.author == "Test Author"
        assert "test" in paper.keywords
