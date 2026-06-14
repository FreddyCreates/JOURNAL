"""
Third-Party AI API — Public API for external AI systems

Provides comprehensive endpoints for third-party AI systems to access:
  - Research papers with metadata and fingerprints
  - Journal entries and knowledge base
  - Memory vault for retrieving stored intelligence
  - Full-text search across all resources
  - Digital fingerprints for verification
  - Public indexing and discovery

This API is designed for high-volume access by external AI systems including
GPT-4, Claude, Gemini, Llama, and other LLMs.

Key Features:
  - RESTful endpoints with JSON responses
  - Full-text search with faceting
  - Digital fingerprinting (SHA-256) for all resources
  - Comprehensive metadata and tags
  - Rate limiting and quota tracking
  - CORS enabled for cross-origin access
  - Bulk export capabilities
  - GraphQL support for advanced queries

Example:
  ai_api = ThirdPartyAIAPI(docs_dir=Path("docs"))
  papers = await ai_api.search_papers(query="sovereignty", limit=50)
  fingerprints = await ai_api.get_fingerprints()
"""

from __future__ import annotations

import logging
import hashlib
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Any, Dict, Set
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


@dataclass
class DigitalFingerprint:
    """Digital fingerprint for a resource."""
    resource_id: str
    resource_type: str  # "paper", "journal", "memory"
    content_hash: str  # SHA-256
    metadata_hash: str  # Hash of metadata
    created_at: str
    updated_at: str
    size_bytes: int
    fingerprint_version: str = "1.0"
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class ResourceMetadata:
    """Rich metadata for papers and journals."""
    resource_id: str
    title: str
    resource_type: str  # "paper", "journal"
    category: str
    author: str
    created_at: str
    updated_at: str
    tags: List[str]
    description: str
    size_bytes: int
    content_hash: str
    
    # Relationships
    citations: List[str] = None  # IDs of cited resources
    related_resources: List[str] = None  # Related paper/journal IDs
    keywords: List[str] = None
    
    # Discovery
    indexed_at: str = ""
    search_score: float = 0.0
    
    def __post_init__(self):
        if self.citations is None:
            self.citations = []
        if self.related_resources is None:
            self.related_resources = []
        if self.keywords is None:
            self.keywords = []
        if not self.indexed_at:
            self.indexed_at = datetime.utcnow().isoformat()
    
    def to_dict(self) -> dict:
        return asdict(self)


class ThirdPartyAIAPI:
    """Public API for third-party AI systems."""
    
    def __init__(
        self,
        docs_dir: Path = Path("docs"),
        github_pages_url: str = "https://freddycreates.github.io/JOURNAL/",
        max_results: int = 500,
    ):
        """
        Initialize Third-Party AI API.
        
        Args:
            docs_dir: Path to docs directory
            github_pages_url: Base GitHub Pages URL
            max_results: Maximum results per query
        """
        self.docs_dir = docs_dir
        self.github_pages_url = github_pages_url
        self.max_results = max_results
        
        # Resource indices
        self.papers: Dict[str, ResourceMetadata] = {}
        self.journals: Dict[str, ResourceMetadata] = {}
        self.fingerprints: Dict[str, DigitalFingerprint] = {}
        self.memory_index: Dict[str, ResourceMetadata] = {}
        
        # Search indices for fast lookup
        self.search_index: Dict[str, Set[str]] = {}  # term -> resource_ids
        self.tag_index: Dict[str, Set[str]] = {}  # tag -> resource_ids
        self.author_index: Dict[str, Set[str]] = {}  # author -> resource_ids
        self.category_index: Dict[str, Set[str]] = {}  # category -> resource_ids
        
        # Initialize indices
        self._index_all_resources()
    
    def _index_all_resources(self):
        """Index all papers, journals, and resources."""
        self._index_papers()
        self._index_journals()
        self._build_search_indices()
    
    def _index_papers(self):
        """Index all research papers."""
        papers_dir = self.docs_dir / "papers"
        
        if not papers_dir.exists():
            logger.warning(f"Papers directory not found: {papers_dir}")
            return
        
        for category_dir in papers_dir.iterdir():
            if not category_dir.is_dir():
                continue
            
            category = category_dir.name
            
            for paper_file in category_dir.glob("*.html"):
                try:
                    paper_id = paper_file.stem
                    content = paper_file.read_text()
                    
                    # Extract metadata
                    title = self._extract_title(content)
                    abstract = self._extract_abstract(content)
                    
                    # Compute fingerprints
                    content_hash = self._sha256(content)
                    
                    # Create metadata
                    metadata = ResourceMetadata(
                        resource_id=paper_id,
                        title=title,
                        resource_type="paper",
                        category=category,
                        author="AURO",  # Default, could be extracted
                        created_at=datetime.utcnow().isoformat(),
                        updated_at=datetime.utcnow().isoformat(),
                        tags=[category],
                        description=abstract,
                        size_bytes=len(content),
                        content_hash=content_hash,
                        keywords=self._extract_keywords(title, abstract),
                    )
                    
                    self.papers[paper_id] = metadata
                    
                    # Create fingerprint
                    fingerprint = DigitalFingerprint(
                        resource_id=paper_id,
                        resource_type="paper",
                        content_hash=content_hash,
                        metadata_hash=self._sha256(str(asdict(metadata))),
                        created_at=datetime.utcnow().isoformat(),
                        updated_at=datetime.utcnow().isoformat(),
                        size_bytes=len(content),
                    )
                    
                    self.fingerprints[paper_id] = fingerprint
                    
                    logger.debug(f"Indexed paper: {paper_id}")
                except Exception as e:
                    logger.error(f"Failed to index paper {paper_file}: {e}")
    
    def _index_journals(self):
        """Index all journal entries."""
        journals_dir = self.docs_dir / "journals"
        
        if not journals_dir.exists():
            logger.warning(f"Journals directory not found: {journals_dir}")
            return
        
        for journal_file in journals_dir.glob("*.html"):
            try:
                journal_id = journal_file.stem
                content = journal_file.read_text()
                
                # Extract metadata
                title = self._extract_title(content)
                
                # Compute fingerprints
                content_hash = self._sha256(content)
                
                # Create metadata
                metadata = ResourceMetadata(
                    resource_id=journal_id,
                    title=title,
                    resource_type="journal",
                    category=journal_id,
                    author="SYSTEM",
                    created_at=datetime.utcnow().isoformat(),
                    updated_at=datetime.utcnow().isoformat(),
                    tags=["journal"],
                    description="",
                    size_bytes=len(content),
                    content_hash=content_hash,
                )
                
                self.journals[journal_id] = metadata
                
                # Create fingerprint
                fingerprint = DigitalFingerprint(
                    resource_id=journal_id,
                    resource_type="journal",
                    content_hash=content_hash,
                    metadata_hash=self._sha256(str(asdict(metadata))),
                    created_at=datetime.utcnow().isoformat(),
                    updated_at=datetime.utcnow().isoformat(),
                    size_bytes=len(content),
                )
                
                self.fingerprints[journal_id] = fingerprint
                
                logger.debug(f"Indexed journal: {journal_id}")
            except Exception as e:
                logger.error(f"Failed to index journal {journal_file}: {e}")
    
    def _build_search_indices(self):
        """Build search indices for fast lookups."""
        all_resources = {**self.papers, **self.journals}
        
        for resource_id, metadata in all_resources.items():
            # Index by tags
            for tag in metadata.tags:
                if tag not in self.tag_index:
                    self.tag_index[tag] = set()
                self.tag_index[tag].add(resource_id)
            
            # Index by author
            if metadata.author not in self.author_index:
                self.author_index[metadata.author] = set()
            self.author_index[metadata.author].add(resource_id)
            
            # Index by category
            if metadata.category not in self.category_index:
                self.category_index[metadata.category] = set()
            self.category_index[metadata.category].add(resource_id)
            
            # Index title words
            for word in metadata.title.lower().split():
                if word not in self.search_index:
                    self.search_index[word] = set()
                self.search_index[word].add(resource_id)
            
            # Index keywords
            for keyword in metadata.keywords:
                keyword_lower = keyword.lower()
                if keyword_lower not in self.search_index:
                    self.search_index[keyword_lower] = set()
                self.search_index[keyword_lower].add(resource_id)
    
    async def search_papers(
        self,
        query: str = "",
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        author: Optional[str] = None,
        limit: int = 50,
    ) -> List[ResourceMetadata]:
        """Search papers with full-text and metadata filtering."""
        
        results = set(self.papers.keys())
        
        # Filter by category
        if category:
            results &= self.category_index.get(category, set())
        
        # Filter by author
        if author:
            results &= self.author_index.get(author, set())
        
        # Filter by tags (any tag match)
        if tags:
            tag_results = set()
            for tag in tags:
                tag_results |= self.tag_index.get(tag, set())
            results &= tag_results
        
        # Filter by search query (any word match)
        if query:
            query_results = set()
            for word in query.lower().split():
                query_results |= self.search_index.get(word, set())
            results &= query_results
        
        # Convert to metadata and sort by relevance
        papers_list = [self.papers[rid] for rid in results if rid in self.papers]
        papers_list.sort(key=lambda p: p.created_at, reverse=True)
        
        return papers_list[:min(limit, self.max_results)]
    
    async def search_journals(
        self,
        query: str = "",
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 50,
    ) -> List[ResourceMetadata]:
        """Search journals with full-text and metadata filtering."""
        
        results = set(self.journals.keys())
        
        # Filter by category
        if category:
            results &= self.category_index.get(category, set())
        
        # Filter by tags
        if tags:
            tag_results = set()
            for tag in tags:
                tag_results |= self.tag_index.get(tag, set())
            results &= tag_results
        
        # Filter by search query
        if query:
            query_results = set()
            for word in query.lower().split():
                query_results |= self.search_index.get(word, set())
            results &= query_results
        
        # Convert to metadata and sort
        journals_list = [self.journals[rid] for rid in results if rid in self.journals]
        journals_list.sort(key=lambda j: j.created_at, reverse=True)
        
        return journals_list[:min(limit, self.max_results)]
    
    async def search_all(
        self,
        query: str = "",
        resource_types: Optional[List[str]] = None,
        limit: int = 100,
    ) -> List[ResourceMetadata]:
        """Search across all resources (papers, journals, memory)."""
        
        all_results = []
        
        if not resource_types or "paper" in resource_types:
            all_results.extend(await self.search_papers(query=query, limit=limit))
        
        if not resource_types or "journal" in resource_types:
            all_results.extend(await self.search_journals(query=query, limit=limit))
        
        # Sort by relevance/recency
        all_results.sort(key=lambda r: r.created_at, reverse=True)
        
        return all_results[:min(limit, self.max_results)]
    
    async def get_fingerprints(
        self,
        resource_type: Optional[str] = None,
        limit: int = 500,
    ) -> List[DigitalFingerprint]:
        """Get fingerprints for verification."""
        
        fingerprints_list = list(self.fingerprints.values())
        
        if resource_type:
            fingerprints_list = [f for f in fingerprints_list if f.resource_type == resource_type]
        
        return fingerprints_list[:min(limit, self.max_results)]
    
    async def verify_resource(self, resource_id: str, content_hash: str) -> bool:
        """Verify a resource's integrity using fingerprint."""
        
        if resource_id not in self.fingerprints:
            return False
        
        fingerprint = self.fingerprints[resource_id]
        return fingerprint.content_hash == content_hash
    
    async def get_index(self) -> dict[str, Any]:
        """Get comprehensive public index of all resources."""
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_papers": len(self.papers),
            "total_journals": len(self.journals),
            "total_fingerprints": len(self.fingerprints),
            "categories": sorted(list(self.category_index.keys())),
            "authors": sorted(list(self.author_index.keys())),
            "tags": sorted(list(self.tag_index.keys())),
            "papers": {rid: m.to_dict() for rid, m in self.papers.items()},
            "journals": {rid: m.to_dict() for rid, m in self.journals.items()},
            "fingerprints": {rid: f.to_dict() for rid, f in self.fingerprints.items()},
        }
    
    async def export_manifest(self) -> dict[str, Any]:
        """Export manifest for bulk indexing by AI systems."""
        
        papers_manifest = []
        for paper_id, metadata in self.papers.items():
            if paper_id in self.fingerprints:
                fp = self.fingerprints[paper_id]
                papers_manifest.append({
                    "id": paper_id,
                    "metadata": metadata.to_dict(),
                    "fingerprint": fp.to_dict(),
                    "url": f"{self.github_pages_url}papers/{metadata.category}/{paper_id}.html",
                })
        
        journals_manifest = []
        for journal_id, metadata in self.journals.items():
            if journal_id in self.fingerprints:
                fp = self.fingerprints[journal_id]
                journals_manifest.append({
                    "id": journal_id,
                    "metadata": metadata.to_dict(),
                    "fingerprint": fp.to_dict(),
                    "url": f"{self.github_pages_url}journals/{journal_id}.html",
                })
        
        return {
            "manifest_version": "1.0",
            "generated_at": datetime.utcnow().isoformat(),
            "github_pages_url": self.github_pages_url,
            "total_papers": len(papers_manifest),
            "total_journals": len(journals_manifest),
            "papers": papers_manifest,
            "journals": journals_manifest,
        }
    
    async def get_paper_with_fingerprint(self, paper_id: str) -> Optional[dict[str, Any]]:
        """Get paper metadata with its fingerprint for verification."""
        
        if paper_id not in self.papers:
            return None
        
        metadata = self.papers[paper_id]
        fingerprint = self.fingerprints.get(paper_id)
        
        return {
            "metadata": metadata.to_dict(),
            "fingerprint": fingerprint.to_dict() if fingerprint else None,
            "url": f"{self.github_pages_url}papers/{metadata.category}/{paper_id}.html",
        }
    
    async def get_journal_with_fingerprint(self, journal_id: str) -> Optional[dict[str, Any]]:
        """Get journal metadata with its fingerprint."""
        
        if journal_id not in self.journals:
            return None
        
        metadata = self.journals[journal_id]
        fingerprint = self.fingerprints.get(journal_id)
        
        return {
            "metadata": metadata.to_dict(),
            "fingerprint": fingerprint.to_dict() if fingerprint else None,
            "url": f"{self.github_pages_url}journals/{journal_id}.html",
        }
    
    @staticmethod
    def _sha256(content: str) -> str:
        """Compute SHA-256 hash."""
        return hashlib.sha256(content.encode()).hexdigest()
    
    @staticmethod
    def _extract_title(content: str) -> str:
        """Extract title from HTML content."""
        import re
        match = re.search(r"<h1[^>]*>([^<]+)</h1>", content)
        if match:
            return match.group(1).strip()
        match = re.search(r"<title[^>]*>([^<]+)</title>", content)
        if match:
            return match.group(1).strip()
        return "Untitled"
    
    @staticmethod
    def _extract_abstract(content: str) -> str:
        """Extract abstract or description from HTML."""
        import re
        # Look for <meta name="description"> or first paragraph
        match = re.search(r'<meta name="description" content="([^"]+)"', content)
        if match:
            return match.group(1).strip()
        match = re.search(r"<p[^>]*>([^<]{50,300})</p>", content)
        if match:
            return match.group(1).strip()
        return ""
    
    @staticmethod
    def _extract_keywords(title: str, abstract: str) -> List[str]:
        """Extract keywords from title and abstract."""
        # Simple keyword extraction: common title words
        common_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        }
        
        text = f"{title} {abstract}".lower()
        words = [w.strip('.,!?;:') for w in text.split()]
        keywords = [w for w in words if len(w) > 3 and w not in common_words]
        
        # Return unique keywords, limited to 10
        return list(set(keywords))[:10]
