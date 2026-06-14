# Third-Party AI API Quick Start Guide

## What is the Third-Party AI API?

The Sovereign Organism platform now provides a comprehensive public API that enables third-party AI systems (GPT-4, Claude, Gemini, Llama, etc.) to discover, access, and verify research papers and journals from the GitHub Pages site.

## Key Benefits

### For AI Systems
- **Discovery**: Find relevant papers and journals through full-text search
- **Verification**: Use digital fingerprints to verify content integrity
- **Bulk Access**: Download complete manifests for indexing
- **Real-time Stats**: Monitor resource availability and updates

### For Knowledge Management
- **Digital Fingerprints**: SHA-256 hashes ensure content hasn't been tampered with
- **Comprehensive Indexing**: All resources fully indexed by title, keywords, category, author
- **Public Discovery**: Content accessible via standard HTTP API
- **CORS Support**: Direct access from web browsers and external services

## API Base URL

```
https://freddycreates.github.io/JOURNAL/api/ai/
```

## Quick Examples

### Search Papers
```bash
curl "https://freddycreates.github.io/JOURNAL/api/ai/papers/search?query=sovereignty&limit=20"
```

### Get All Fingerprints
```bash
curl "https://freddycreates.github.io/JOURNAL/api/ai/fingerprints"
```

### Use JavaScript Client
```html
<script src="https://freddycreates.github.io/JOURNAL/assets/sovereign-ai-client.js"></script>
<script>
  const client = new SovereignAIClient();
  client.searchPapers({ query: 'intelligence' })
    .then(results => console.log(`Found ${results.count} papers`));
</script>
```

## Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/search` | GET | Search all resources |
| `/papers/search` | GET | Search papers with filters |
| `/journals/search` | GET | Search journals |
| `/fingerprints` | GET | Get all fingerprints |
| `/fingerprints/{id}` | GET | Get specific fingerprint |
| `/fingerprints/verify` | POST | Verify content integrity |
| `/index` | GET | Get comprehensive index |
| `/manifest` | GET | Get bulk export manifest |
| `/papers/{id}` | GET | Get paper with fingerprint |
| `/journals/{id}` | GET | Get journal with fingerprint |
| `/stats` | GET | Get API statistics |

## Rate Limiting

- **Limit**: 10,000 requests per hour
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Recommendation**: Cache results for 1 hour

## Integration Checklist

- [ ] Install client library or use fetch/requests
- [ ] Start with `/api/ai/manifest` for initial indexing
- [ ] Use search endpoints for queries
- [ ] Cache results to reduce API calls
- [ ] Use fingerprints to verify content integrity
- [ ] Monitor `/api/ai/stats` for availability

## Common Use Cases

### 1. Add Knowledge Base to Chatbot
```python
client = SovereignAIClient()
papers = await client.searchPapers(query=user_question)
# Add papers to chatbot context
```

### 2. Create Local Search Index
```bash
# Get manifest
curl https://freddycreates.github.io/JOURNAL/api/ai/manifest | \
  jq '.papers' > papers.json

# Index locally for faster searches
```

### 3. Verify Content in Workflows
```python
# Get fingerprint
fp = await client.getFingerprint('paper-id')
# Verify locally
is_valid = await client.verifyResource('paper-id', computed_hash)
```

### 4. Federated Search
```python
# Search Sovereign + other sources
# Combine results, deduplicate, rank
```

## Next Steps

1. **Read Documentation**: See [README.md](./README.md) for full API reference
2. **Try Examples**: Check [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) for code samples
3. **Build Integration**: Use client library or HTTP requests
4. **Monitor Usage**: Track API stats and cache performance

## Support & Documentation

- **API Reference**: [README.md](./README.md)
- **Code Examples**: [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)
- **Client Library**: [sovereign-ai-client.js](../docs/assets/sovereign-ai-client.js)
- **Repository**: [FreddyCreates/JOURNAL](https://github.com/FreddyCreates/JOURNAL)

## Architecture

```
┌─────────────────────────────────────────────────┐
│       Third-Party AI Systems                     │
│  (GPT-4, Claude, Gemini, Llama, etc.)           │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP/CORS
                 ▼
┌─────────────────────────────────────────────────┐
│    GitHub Pages + FastAPI Backend               │
│  https://freddycreates.github.io/JOURNAL/       │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌────────┐ ┌──────────┐ ┌────────────┐
│ Papers │ │ Journals │ │ Fingerprints
└────────┘ └──────────┘ └────────────┘
    │            │            │
    └────────────┼────────────┘
                 ▼
        ┌─────────────────┐
        │  Search Index   │
        │  + Caching      │
        └─────────────────┘
```

## Features Summary

✅ **11 REST API Endpoints**
✅ **Full-Text Search with Filtering**
✅ **SHA-256 Digital Fingerprinting**
✅ **Comprehensive Resource Indexing**
✅ **CORS Support for Web Integration**
✅ **Rate Limiting & Quotas**
✅ **JavaScript Client Library**
✅ **Bulk Export Manifests**
✅ **Content Verification**
✅ **Real-time Statistics**
✅ **10 Integration Examples**
✅ **Best Practices Guide**

## Data Model

Each resource includes:
- **ID**: Unique identifier
- **Title**: Human-readable name
- **Category**: Classification
- **Author**: Creator/source
- **Tags**: Classification tags
- **Keywords**: Searchable keywords
- **Description**: Abstract/summary
- **Size**: Content size in bytes
- **Content Hash**: SHA-256 fingerprint
- **Metadata Hash**: For change detection
- **Created/Updated**: Timestamps
- **Citations**: Related resources
- **Related Resources**: Recommendations

## What's Next?

The Third-Party AI API is the foundation for:
- **Federated Knowledge**: Connect multiple knowledge bases
- **AI Training Data**: Structured knowledge for LLM training
- **Content Verification**: Cryptographic proof of content
- **Public Accessibility**: Open knowledge infrastructure
- **Intelligent Discovery**: AI-powered search and synthesis

---

**Version**: 1.0  
**Last Updated**: June 2026  
**Status**: Production Ready
