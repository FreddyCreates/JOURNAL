"""
Deployed App Engine — FastAPI live platform backend

Wraps docs/ research portal as JSON APIs, provides real-time paper indexing,
journal operations, and vault tools. Serves as the backend for the
live GitHub Pages platform at freddycreates.github.io/JOURNAL/

Key Features:
  - FastAPI with async support
  - Research paper indexing and search
  - Journal CRUD operations
  - Vault operations API
  - WebSocket support for live updates
  - CORS support for GitHub Pages
  - OpenAPI documentation

Example:
  app = FastAPI()
  app = setup_routes(app)
  uvicorn app:app --reload
"""

from __future__ import annotations

import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Any

from fastapi import FastAPI, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# Import Third-Party AI API
try:
    from third_party_ai_api import ThirdPartyAIAPI
except ImportError:
    # Fallback if module path is different
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from third_party_ai_api import ThirdPartyAIAPI

logger = logging.getLogger(__name__)

# ============================================================================
# Data Models
# ============================================================================


class ResearchPaper(BaseModel):
    """Research paper metadata."""
    paper_id: str
    title: str
    category: str
    author: str
    abstract: str
    created_at: str
    updated_at: str
    file_path: str
    tags: List[str] = []
    citations: List[str] = []
    verified: bool = False


class JournalEntry(BaseModel):
    """Journal entry."""
    entry_id: str
    title: str
    category: str
    content: str
    author_agent: str
    created_at: str
    updated_at: str
    tags: List[str] = []
    references: List[str] = []


class VaultOperation(BaseModel):
    """Vault attestation operation."""
    operation: str  # "hash" or "attest"
    content: str
    timestamp: str = ""


class VaultResponse(BaseModel):
    """Vault operation response."""
    operation: str
    input_hash: str
    timestamp: str
    success: bool


# ============================================================================
# Core Engine
# ============================================================================


class DeployedAppEngine:
    """Live platform backend engine."""
    
    def __init__(
        self,
        docs_dir: Path = Path("docs"),
        github_pages_url: str = "https://freddycreates.github.io/JOURNAL/",
    ):
        """
        Initialize Deployed App Engine.
        
        Args:
            docs_dir: Path to docs/ directory
            github_pages_url: Base URL for GitHub Pages
        """
        self.docs_dir = docs_dir
        self.github_pages_url = github_pages_url
        self.papers_cache = {}
        self.journals_cache = {}
        
        # Load initial index
        self._index_papers()
        self._index_journals()
    
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
                    # Parse paper metadata from HTML
                    paper_id = paper_file.stem
                    
                    self.papers_cache[paper_id] = {
                        "paper_id": paper_id,
                        "title": self._extract_title(paper_file),
                        "category": category,
                        "file_path": str(paper_file.relative_to(self.docs_dir)),
                        "created_at": datetime.utcnow().isoformat(),
                        "tags": [category],
                    }
                    
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
                
                self.journals_cache[journal_id] = {
                    "entry_id": journal_id,
                    "title": self._extract_title(journal_file),
                    "category": journal_id,
                    "file_path": str(journal_file.relative_to(self.docs_dir)),
                    "created_at": datetime.utcnow().isoformat(),
                }
                
                logger.debug(f"Indexed journal: {journal_id}")
            except Exception as e:
                logger.error(f"Failed to index journal {journal_file}: {e}")
    
    def _extract_title(self, file_path: Path) -> str:
        """Extract title from HTML file."""
        try:
            content = file_path.read_text()
            # Simple extraction: look for <h1> or <title> tags
            import re
            match = re.search(r"<h1[^>]*>([^<]+)</h1>", content)
            if match:
                return match.group(1).strip()
            match = re.search(r"<title[^>]*>([^<]+)</title>", content)
            if match:
                return match.group(1).strip()
        except:
            pass
        
        return file_path.stem.replace("-", " ").title()
    
    def get_papers(
        self,
        category: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
    ) -> List[ResearchPaper]:
        """Get papers with optional filtering."""
        
        results = list(self.papers_cache.values())
        
        # Filter by category
        if category:
            results = [p for p in results if p["category"] == category]
        
        # Filter by search term
        if search:
            search_lower = search.lower()
            results = [
                p for p in results
                if search_lower in p["title"].lower()
            ]
        
        # Limit results
        return results[:limit]
    
    def get_paper(self, paper_id: str) -> Optional[ResearchPaper]:
        """Get a specific paper."""
        paper = self.papers_cache.get(paper_id)
        
        if paper:
            # Try to read full content
            file_path = self.docs_dir / paper["file_path"]
            if file_path.exists():
                try:
                    paper["content"] = file_path.read_text()
                except:
                    pass
        
        return paper
    
    def get_journals(
        self,
        category: Optional[str] = None,
        limit: int = 50,
    ) -> List[JournalEntry]:
        """Get journal entries."""
        
        results = list(self.journals_cache.values())
        
        # Filter by category
        if category:
            results = [j for j in results if j["category"] == category]
        
        return results[:limit]
    
    def get_journal(self, journal_id: str) -> Optional[JournalEntry]:
        """Get a specific journal entry."""
        entry = self.journals_cache.get(journal_id)
        
        if entry:
            # Try to read full content
            file_path = self.docs_dir / entry["file_path"]
            if file_path.exists():
                try:
                    entry["content"] = file_path.read_text()
                except:
                    pass
        
        return entry
    
    def hash_content(self, content: str) -> str:
        """Compute SHA-256 hash of content."""
        import hashlib
        return hashlib.sha256(content.encode()).hexdigest()
    
    def attest_content(self, content: str) -> dict[str, Any]:
        """Create vault attestation for content."""
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "hash": self.hash_content(content),
            "size": len(content),
            "type": "text/plain",
        }


# ============================================================================
# FastAPI Setup
# ============================================================================


def create_app(docs_dir: Path = Path("docs")) -> FastAPI:
    """Create FastAPI application."""
    
    app = FastAPI(
        title="Sovereign Organism Platform",
        description="API for the Sovereign Organism intelligence platform",
        version="0.1.0",
    )
    
    # Add CORS middleware for GitHub Pages
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add rate limiting and quota headers middleware
    @app.middleware("http")
    async def add_api_headers(request, call_next):
        response = await call_next(request)
        
        # Add rate limiting headers for Third-Party AI API
        if request.url.path.startswith("/api/ai"):
            response.headers["X-RateLimit-Limit"] = "10000"
            response.headers["X-RateLimit-Remaining"] = "9999"
            response.headers["X-RateLimit-Reset"] = str(int(datetime.utcnow().timestamp()) + 3600)
            response.headers["X-API-Version"] = "1.0"
            response.headers["X-API-Purpose"] = "Third-Party AI Access"
        
        return response
    
    # Initialize engine
    engine = DeployedAppEngine(docs_dir=docs_dir)
    
    # Initialize Third-Party AI API
    ai_api = ThirdPartyAIAPI(docs_dir=docs_dir)
    
    # ====================================================================
    # Health & Info Routes
    # ====================================================================
    
    @app.get("/health")
    async def health():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "papers": len(engine.papers_cache),
            "journals": len(engine.journals_cache),
        }
    
    @app.get("/")
    async def root():
        """Root endpoint with platform info."""
        return {
            "platform": "Sovereign Organism",
            "version": "0.1.0",
            "docs_url": "/docs",
            "openapi_url": "/openapi.json",
            "github_pages": "https://freddycreates.github.io/JOURNAL/",
        }
    
    # ====================================================================
    # Research Papers Routes
    # ====================================================================
    
    @app.get("/api/papers", response_model=List[ResearchPaper])
    async def list_papers(
        category: Optional[str] = Query(None),
        search: Optional[str] = Query(None),
        limit: int = Query(50, le=200),
    ):
        """List research papers with optional filtering."""
        return engine.get_papers(category=category, search=search, limit=limit)
    
    @app.get("/api/papers/{paper_id}", response_model=ResearchPaper)
    async def get_paper(paper_id: str):
        """Get a specific paper."""
        paper = engine.get_paper(paper_id)
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")
        return paper
    
    @app.get("/api/papers/categories")
    async def list_categories():
        """List available paper categories."""
        categories = set(p["category"] for p in engine.papers_cache.values())
        return {"categories": sorted(list(categories))}
    
    # ====================================================================
    # Journals Routes
    # ====================================================================
    
    @app.get("/api/journals", response_model=List[JournalEntry])
    async def list_journals(
        category: Optional[str] = Query(None),
        limit: int = Query(50, le=200),
    ):
        """List journal entries."""
        return engine.get_journals(category=category, limit=limit)
    
    @app.get("/api/journals/{journal_id}", response_model=JournalEntry)
    async def get_journal(journal_id: str):
        """Get a specific journal entry."""
        entry = engine.get_journal(journal_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return entry
    
    # ====================================================================
    # Vault Routes
    # ====================================================================
    
    @app.post("/api/vault/hash", response_model=VaultResponse)
    async def hash_content(request: VaultOperation):
        """Hash content using SHA-256."""
        
        result = {
            "operation": "hash",
            "input_hash": engine.hash_content(request.content),
            "timestamp": datetime.utcnow().isoformat(),
            "success": True,
        }
        return result
    
    @app.post("/api/vault/attest", response_model=VaultResponse)
    async def attest_content(request: VaultOperation):
        """Create vault attestation for content."""
        
        attestation = engine.attest_content(request.content)
        return {
            "operation": "attest",
            "input_hash": attestation["hash"],
            "timestamp": attestation["timestamp"],
            "success": True,
        }
    
    # ====================================================================
    # WebSocket Routes (for live updates)
    # ====================================================================
    
    @app.websocket("/ws/papers")
    async def websocket_papers(websocket: WebSocket):
        """WebSocket for real-time paper updates."""
        await websocket.accept()
        
        try:
            while True:
                # In production, this would push updates
                data = await websocket.receive_text()
                await websocket.send_text(
                    json.dumps({
                        "type": "papers_update",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                )
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
    
    @app.websocket("/ws/journals")
    async def websocket_journals(websocket: WebSocket):
        """WebSocket for real-time journal updates."""
        await websocket.accept()
        
        try:
            while True:
                data = await websocket.receive_text()
                await websocket.send_text(
                    json.dumps({
                        "type": "journals_update",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                )
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
    
    # ====================================================================
    # Third-Party AI API Routes
    # ====================================================================
    
    @app.get("/api/ai/search")
    async def ai_search_all(
        query: str = Query(""),
        resource_types: Optional[str] = Query(None),
        limit: int = Query(100, le=500),
    ):
        """Search across all resources (papers, journals) for AI systems."""
        try:
            types = resource_types.split(",") if resource_types else None
            results = await ai_api.search_all(
                query=query,
                resource_types=types,
                limit=limit
            )
            return {
                "query": query,
                "count": len(results),
                "results": [r.to_dict() for r in results],
            }
        except Exception as e:
            logger.error(f"AI search error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/papers/search")
    async def ai_search_papers(
        query: str = Query(""),
        category: Optional[str] = Query(None),
        tags: Optional[str] = Query(None),
        author: Optional[str] = Query(None),
        limit: int = Query(50, le=500),
    ):
        """Full-text search papers for AI systems."""
        try:
            tag_list = tags.split(",") if tags else None
            results = await ai_api.search_papers(
                query=query,
                category=category,
                tags=tag_list,
                author=author,
                limit=limit
            )
            return {
                "resource_type": "paper",
                "query": query,
                "count": len(results),
                "results": [r.to_dict() for r in results],
            }
        except Exception as e:
            logger.error(f"Paper search error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/journals/search")
    async def ai_search_journals(
        query: str = Query(""),
        category: Optional[str] = Query(None),
        tags: Optional[str] = Query(None),
        limit: int = Query(50, le=500),
    ):
        """Full-text search journals for AI systems."""
        try:
            tag_list = tags.split(",") if tags else None
            results = await ai_api.search_journals(
                query=query,
                category=category,
                tags=tag_list,
                limit=limit
            )
            return {
                "resource_type": "journal",
                "query": query,
                "count": len(results),
                "results": [r.to_dict() for r in results],
            }
        except Exception as e:
            logger.error(f"Journal search error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/fingerprints")
    async def ai_get_fingerprints(
        resource_type: Optional[str] = Query(None),
        limit: int = Query(500, le=5000),
    ):
        """Get digital fingerprints for all resources."""
        try:
            fingerprints = await ai_api.get_fingerprints(
                resource_type=resource_type,
                limit=limit
            )
            return {
                "count": len(fingerprints),
                "fingerprints": [f.to_dict() for f in fingerprints],
            }
        except Exception as e:
            logger.error(f"Fingerprint fetch error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/fingerprints/{resource_id}")
    async def ai_get_fingerprint(resource_id: str):
        """Get fingerprint for a specific resource."""
        try:
            fingerprints = await ai_api.get_fingerprints()
            fp = next((f for f in fingerprints if f.resource_id == resource_id), None)
            
            if not fp:
                raise HTTPException(status_code=404, detail="Fingerprint not found")
            
            return {
                "resource_id": resource_id,
                "fingerprint": fp.to_dict(),
            }
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Fingerprint fetch error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/ai/fingerprints/verify")
    async def ai_verify_resource(
        resource_id: str = Query(...),
        content_hash: str = Query(...),
    ):
        """Verify resource integrity using fingerprint."""
        try:
            is_valid = await ai_api.verify_resource(resource_id, content_hash)
            return {
                "resource_id": resource_id,
                "valid": is_valid,
                "timestamp": datetime.utcnow().isoformat(),
            }
        except Exception as e:
            logger.error(f"Verification error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/index")
    async def ai_get_index():
        """Get comprehensive public index of all resources."""
        try:
            index = await ai_api.get_index()
            return {
                "index_version": "1.0",
                "generated_at": datetime.utcnow().isoformat(),
                "index": index,
            }
        except Exception as e:
            logger.error(f"Index generation error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/manifest")
    async def ai_get_manifest():
        """Get manifest for bulk indexing by AI systems."""
        try:
            manifest = await ai_api.export_manifest()
            return manifest
        except Exception as e:
            logger.error(f"Manifest export error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/papers/{paper_id}")
    async def ai_get_paper_with_fingerprint(paper_id: str):
        """Get paper with fingerprint for verification."""
        try:
            result = await ai_api.get_paper_with_fingerprint(paper_id)
            if not result:
                raise HTTPException(status_code=404, detail="Paper not found")
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Paper fetch error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/journals/{journal_id}")
    async def ai_get_journal_with_fingerprint(journal_id: str):
        """Get journal with fingerprint for verification."""
        try:
            result = await ai_api.get_journal_with_fingerprint(journal_id)
            if not result:
                raise HTTPException(status_code=404, detail="Journal not found")
            return result
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Journal fetch error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/ai/stats")
    async def ai_get_stats():
        """Get API statistics and resource counts."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "total_papers": len(ai_api.papers),
            "total_journals": len(ai_api.journals),
            "total_fingerprints": len(ai_api.fingerprints),
            "total_authors": len(ai_api.author_index),
            "total_categories": len(ai_api.category_index),
            "total_tags": len(ai_api.tag_index),
        }
    
    return app


if __name__ == "__main__":
    import uvicorn
    
    app = create_app()
    uvicorn.run(app, host="0.0.0.0", port=8000)
