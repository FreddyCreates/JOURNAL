# Third-Party AI API

## Overview

The Third-Party AI API provides a comprehensive public interface for external AI systems (GPT-4, Claude, Gemini, Llama, etc.) to access research papers, journals, and the memory vault from the Sovereign Organism platform via GitHub Pages.

## Key Features

- **Full-Text Search**: Search across papers and journals with metadata filtering
- **Digital Fingerprinting**: SHA-256 fingerprints for content verification
- **Comprehensive Metadata**: Rich metadata including tags, keywords, authors, categories
- **Resource Indexing**: Complete index of all papers, journals, and memory
- **Bulk Export**: Manifest export for bulk indexing by AI systems
- **Public Discoverability**: CORS-enabled for cross-origin access

## API Endpoints

### Search Endpoints

#### GET `/api/ai/search`
Search across all resources (papers, journals).

**Parameters:**
- `query` (string, optional): Search query
- `resource_types` (string, optional): Comma-separated list of types (paper, journal)
- `limit` (integer, default: 100, max: 500): Maximum results to return

**Example:**
```bash
curl "https://freddycreates.github.io/JOURNAL/api/ai/search?query=sovereignty&limit=50"
```

**Response:**
```json
{
  "query": "sovereignty",
  "count": 25,
  "results": [
    {
      "resource_id": "paper-id",
      "title": "Sovereign Architecture",
      "resource_type": "paper",
      "category": "architecture",
      "author": "AURO",
      "created_at": "2026-06-14T02:58:00Z",
      "updated_at": "2026-06-14T02:58:00Z",
      "tags": ["architecture", "governance"],
      "description": "A comprehensive framework...",
      "size_bytes": 45000,
      "content_hash": "abc123def456...",
      "keywords": ["sovereignty", "architecture", "framework"]
    }
  ]
}
```

#### GET `/api/ai/papers/search`
Full-text search for research papers.

**Parameters:**
- `query` (string, optional): Search query
- `category` (string, optional): Filter by category
- `tags` (string, optional): Comma-separated tags
- `author` (string, optional): Filter by author
- `limit` (integer, default: 50, max: 500): Maximum results

**Example:**
```bash
curl "https://freddycreates.github.io/JOURNAL/api/ai/papers/search?query=temporal&category=protocols&limit=20"
```

#### GET `/api/ai/journals/search`
Full-text search for journal entries.

**Parameters:**
- `query` (string, optional): Search query
- `category` (string, optional): Filter by category
- `tags` (string, optional): Comma-separated tags
- `limit` (integer, default: 50, max: 500): Maximum results

### Fingerprint Endpoints

#### GET `/api/ai/fingerprints`
Get digital fingerprints for all resources.

**Parameters:**
- `resource_type` (string, optional): Filter by type (paper, journal)
- `limit` (integer, default: 500, max: 5000): Maximum results

**Response:**
```json
{
  "count": 150,
  "fingerprints": [
    {
      "resource_id": "paper-id",
      "resource_type": "paper",
      "content_hash": "sha256_hash_here",
      "metadata_hash": "metadata_hash_here",
      "created_at": "2026-06-14T02:58:00Z",
      "updated_at": "2026-06-14T02:58:00Z",
      "size_bytes": 45000,
      "fingerprint_version": "1.0"
    }
  ]
}
```

#### GET `/api/ai/fingerprints/{resource_id}`
Get fingerprint for a specific resource.

**Response:**
```json
{
  "resource_id": "paper-id",
  "fingerprint": {
    "resource_id": "paper-id",
    "resource_type": "paper",
    "content_hash": "sha256_hash",
    "metadata_hash": "metadata_hash",
    "created_at": "2026-06-14T02:58:00Z",
    "updated_at": "2026-06-14T02:58:00Z",
    "size_bytes": 45000,
    "fingerprint_version": "1.0"
  }
}
```

#### POST `/api/ai/fingerprints/verify`
Verify resource integrity using fingerprint.

**Parameters:**
- `resource_id` (string, required): Resource ID
- `content_hash` (string, required): Content hash to verify

**Response:**
```json
{
  "resource_id": "paper-id",
  "valid": true,
  "timestamp": "2026-06-14T02:58:00Z"
}
```

### Index & Manifest Endpoints

#### GET `/api/ai/index`
Get comprehensive public index of all resources.

**Response:**
```json
{
  "index_version": "1.0",
  "generated_at": "2026-06-14T02:58:00Z",
  "index": {
    "timestamp": "2026-06-14T02:58:00Z",
    "total_papers": 150,
    "total_journals": 5,
    "total_fingerprints": 155,
    "categories": ["architecture", "protocols", "quantum"],
    "authors": ["AURO", "SYSTEM"],
    "tags": ["governance", "verification", "intelligence"]
  }
}
```

#### GET `/api/ai/manifest`
Get manifest for bulk indexing by AI systems.

**Response:**
```json
{
  "manifest_version": "1.0",
  "generated_at": "2026-06-14T02:58:00Z",
  "github_pages_url": "https://freddycreates.github.io/JOURNAL/",
  "total_papers": 150,
  "total_journals": 5,
  "papers": [
    {
      "id": "paper-id",
      "metadata": {...},
      "fingerprint": {...},
      "url": "https://freddycreates.github.io/JOURNAL/papers/architecture/paper-id.html"
    }
  ],
  "journals": [...]
}
```

### Resource Detail Endpoints

#### GET `/api/ai/papers/{paper_id}`
Get paper with fingerprint for verification.

**Response:**
```json
{
  "metadata": {...},
  "fingerprint": {...},
  "url": "https://freddycreates.github.io/JOURNAL/papers/architecture/paper-id.html"
}
```

#### GET `/api/ai/journals/{journal_id}`
Get journal with fingerprint for verification.

### Statistics Endpoint

#### GET `/api/ai/stats`
Get API statistics and resource counts.

**Response:**
```json
{
  "timestamp": "2026-06-14T02:58:00Z",
  "total_papers": 150,
  "total_journals": 5,
  "total_fingerprints": 155,
  "total_authors": 3,
  "total_categories": 8,
  "total_tags": 45
}
```

## Usage Examples

### Python Example

```python
import aiohttp
import asyncio

async def search_papers():
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://freddycreates.github.io/JOURNAL/api/ai/papers/search",
            params={
                "query": "governance",
                "category": "protocols",
                "limit": 25
            }
        ) as resp:
            data = await resp.json()
            for paper in data["results"]:
                print(f"- {paper['title']} ({paper['resource_id']})")

asyncio.run(search_papers())
```

### JavaScript Example

```javascript
async function searchPapers() {
  const response = await fetch(
    'https://freddycreates.github.io/JOURNAL/api/ai/papers/search?query=sovereignty&limit=50'
  );
  const data = await response.json();
  console.log(`Found ${data.count} papers`);
  data.results.forEach(paper => {
    console.log(`- ${paper.title} (${paper.resource_id})`);
  });
}

searchPapers();
```

### cURL Example

```bash
# Search for papers
curl -s "https://freddycreates.github.io/JOURNAL/api/ai/papers/search?query=temporal&limit=20" | jq

# Get fingerprints
curl -s "https://freddycreates.github.io/JOURNAL/api/ai/fingerprints?limit=50" | jq

# Verify resource
curl -s -X POST \
  "https://freddycreates.github.io/JOURNAL/api/ai/fingerprints/verify?resource_id=paper-id&content_hash=abc123..." | jq
```

## Data Models

### ResourceMetadata

```json
{
  "resource_id": "string",
  "title": "string",
  "resource_type": "paper|journal",
  "category": "string",
  "author": "string",
  "created_at": "ISO8601 timestamp",
  "updated_at": "ISO8601 timestamp",
  "tags": ["string"],
  "description": "string",
  "size_bytes": "integer",
  "content_hash": "SHA-256 hex string",
  "citations": ["string"],
  "related_resources": ["string"],
  "keywords": ["string"],
  "indexed_at": "ISO8601 timestamp",
  "search_score": "float"
}
```

### DigitalFingerprint

```json
{
  "resource_id": "string",
  "resource_type": "paper|journal|memory",
  "content_hash": "SHA-256 hex string",
  "metadata_hash": "SHA-256 hex string",
  "created_at": "ISO8601 timestamp",
  "updated_at": "ISO8601 timestamp",
  "size_bytes": "integer",
  "fingerprint_version": "1.0"
}
```

## Rate Limiting

- **Default limit**: 500 results per query (paper/journal searches)
- **Maximum limit**: 5000 results for fingerprint queries
- **CORS enabled**: All origins allowed
- **Recommended**: Cache results for 1 hour to minimize redundant queries

## Integration Guide

### For AI Systems

1. **Discovery**: Start with `/api/ai/manifest` to get all available resources
2. **Search**: Use `/api/ai/papers/search` or `/api/ai/journals/search` for targeted queries
3. **Verification**: Use fingerprints from `/api/ai/fingerprints` to verify content integrity
4. **Indexing**: Use `/api/ai/index` to maintain local search indices

### For Search Engines

1. Get manifest from `/api/ai/manifest`
2. Index all papers and journals with their metadata
3. Set up periodic refresh (e.g., hourly) to catch updates
4. Use fingerprints to detect content changes

## Performance Considerations

- **Caching**: Results are cached in memory; queries are very fast
- **Search indices**: Full-text indices built on initialization
- **Bulk operations**: Use `/api/ai/manifest` instead of individual resource queries
- **Rate limits**: Not enforced but recommend respectful access patterns

## Support

For issues or questions about the Third-Party AI API, please refer to the main repository documentation or open an issue.
