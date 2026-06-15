# Third-Party AI API Integration Examples

## Quick Start

The Sovereign Organism Platform provides a comprehensive public API for third-party AI systems to access research papers, journals, and digital fingerprints.

### Base URL
```
https://freddycreates.github.io/JOURNAL/api/ai
```

## Example 1: Search Papers in Python

```python
import aiohttp
import asyncio
import json

async def search_papers():
    async with aiohttp.ClientSession() as session:
        url = "https://freddycreates.github.io/JOURNAL/api/ai/papers/search"
        params = {
            "query": "sovereignty governance",
            "category": "architecture",
            "limit": 25
        }
        
        async with session.get(url, params=params) as resp:
            data = await resp.json()
            
            print(f"Found {data['count']} papers\n")
            for paper in data['results']:
                print(f"Title: {paper['title']}")
                print(f"Author: {paper['author']}")
                print(f"Tags: {', '.join(paper['tags'])}")
                print(f"Keywords: {', '.join(paper['keywords'][:5])}")
                print(f"Description: {paper['description'][:100]}...")
                print()

asyncio.run(search_papers())
```

## Example 2: Verify Paper Integrity

```python
import hashlib
import aiohttp
import asyncio

async def verify_paper():
    paper_id = "sovereign-intelligence-architecture"
    
    # Get the paper's fingerprint
    async with aiohttp.ClientSession() as session:
        fp_url = f"https://freddycreates.github.io/JOURNAL/api/ai/fingerprints/{paper_id}"
        
        async with session.get(fp_url) as resp:
            fingerprint_data = await resp.json()
            expected_hash = fingerprint_data['fingerprint']['content_hash']
        
        # Verify by comparing hashes
        print(f"Expected hash: {expected_hash}")
        print(f"Use this hash to verify paper integrity locally")

asyncio.run(verify_paper())
```

## Example 3: Bulk Index All Papers

```python
import json
import aiohttp
import asyncio

async def index_all_papers():
    """Retrieve complete manifest for bulk indexing."""
    async with aiohttp.ClientSession() as session:
        url = "https://freddycreates.github.io/JOURNAL/api/ai/manifest"
        
        async with session.get(url) as resp:
            manifest = await resp.json()
        
        print(f"Total papers: {manifest['total_papers']}")
        print(f"Total journals: {manifest['total_journals']}")
        print(f"Generated: {manifest['generated_at']}\n")
        
        # Index all papers
        for paper in manifest['papers']:
            paper_id = paper['id']
            title = paper['metadata']['title']
            url = paper['url']
            hash_val = paper['fingerprint']['content_hash']
            
            print(f"ID: {paper_id}")
            print(f"Title: {title}")
            print(f"URL: {url}")
            print(f"Hash: {hash_val}")
            print()

asyncio.run(index_all_papers())
```

## Example 4: JavaScript Client Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>Sovereign AI Search</title>
    <script src="https://freddycreates.github.io/JOURNAL/assets/sovereign-ai-client.js"></script>
</head>
<body>
    <div id="results"></div>
    
    <script>
        const client = new SovereignAIClient();
        
        async function searchPapers() {
            // Search for papers
            const results = await client.searchPapers({
                query: 'temporal reasoning',
                category: 'protocols',
                limit: 10
            });
            
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = `<h2>Found ${results.count} papers</h2>`;
            
            results.results.forEach(paper => {
                const div = document.createElement('div');
                div.style.border = '1px solid #ccc';
                div.style.padding = '10px';
                div.style.marginBottom = '10px';
                
                div.innerHTML = `
                    <h3>${paper.title}</h3>
                    <p><strong>Category:</strong> ${paper.category}</p>
                    <p><strong>Keywords:</strong> ${paper.keywords.join(', ')}</p>
                    <p>${paper.description}</p>
                `;
                
                resultsDiv.appendChild(div);
            });
        }
        
        searchPapers();
    </script>
</body>
</html>
```

## Example 5: cURL Requests

```bash
# Search papers by query
curl -s "https://freddycreates.github.io/JOURNAL/api/ai/papers/search?query=governance&limit=20" | jq

# Get fingerprints for verification
curl -s "https://freddycreates.github.io/JOURNAL/api/ai/fingerprints?resource_type=paper&limit=50" | jq

# Get comprehensive index
curl -s "https://freddycreates.github.io/JOURNAL/api/ai/index" | jq '.index | keys'

# Get manifest for bulk indexing
curl -s "https://freddycreates.github.io/JOURNAL/api/ai/manifest" | jq '.total_papers, .total_journals'

# Verify resource integrity
curl -s -X POST "https://freddycreates.github.io/JOURNAL/api/ai/fingerprints/verify?resource_id=paper-id&content_hash=abc123..." | jq
```

## Example 6: LLM Integration (OpenAI SDK)

```python
import openai
import json
import aiohttp
import asyncio

async def search_knowledge_base(query):
    """Use AI to search and synthesize knowledge."""
    
    # Search our knowledge base
    async with aiohttp.ClientSession() as session:
        url = "https://freddycreates.github.io/JOURNAL/api/ai/papers/search"
        params = {"query": query, "limit": 20}
        
        async with session.get(url, params=params) as resp:
            papers = await resp.json()
    
    # Prepare context for LLM
    context = "Research papers found:\n\n"
    for paper in papers['results'][:5]:  # Top 5
        context += f"- {paper['title']} ({paper['resource_id']})\n"
        context += f"  Keywords: {', '.join(paper['keywords'][:3])}\n"
    
    # Call LLM with context
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are an AI researcher analyzing papers from the Sovereign Organism platform."
            },
            {
                "role": "user",
                "content": f"{context}\n\nQuestion: {query}"
            }
        ]
    )
    
    return response['choices'][0]['message']['content']

# Usage
result = asyncio.run(search_knowledge_base("What is temporal reasoning in AI?"))
print(result)
```

## Example 7: Node.js Integration

```javascript
const fetch = require('node-fetch');

async function searchAndAnalyze(query) {
  // Search papers
  const response = await fetch(
    `https://freddycreates.github.io/JOURNAL/api/ai/papers/search?query=${encodeURIComponent(query)}&limit=30`
  );
  const data = await response.json();

  // Process results
  console.log(`Found ${data.count} papers for: "${query}"\n`);

  const summary = {
    query,
    count: data.count,
    categories: {},
    authors: {},
    keywords: new Set()
  };

  data.results.forEach(paper => {
    // Count by category
    summary.categories[paper.category] = (summary.categories[paper.category] || 0) + 1;
    
    // Count by author
    summary.authors[paper.author] = (summary.authors[paper.author] || 0) + 1;
    
    // Collect keywords
    paper.keywords.forEach(kw => summary.keywords.add(kw));
  });

  summary.keywords = Array.from(summary.keywords);

  return summary;
}

searchAndAnalyze('distributed consensus').then(summary => {
  console.log(JSON.stringify(summary, null, 2));
});
```

## Example 8: Real-time Monitoring

```python
import asyncio
import aiohttp
from datetime import datetime

async def monitor_updates():
    """Monitor for new papers and changes."""
    
    async with aiohttp.ClientSession() as session:
        previous_count = 0
        
        while True:
            # Get current stats
            url = "https://freddycreates.github.io/JOURNAL/api/ai/stats"
            async with session.get(url) as resp:
                stats = await resp.json()
            
            current_count = stats['total_papers'] + stats['total_journals']
            timestamp = datetime.now().isoformat()
            
            print(f"[{timestamp}] Papers: {stats['total_papers']}, Journals: {stats['total_journals']}")
            
            if current_count > previous_count:
                print(f"  ✓ New content detected! (+{current_count - previous_count} items)")
                previous_count = current_count
            
            # Check every 5 minutes
            await asyncio.sleep(300)

asyncio.run(monitor_updates())
```

## Example 9: Building a Local Search Index

```python
import json
import sqlite3
import aiohttp
import asyncio

async def build_search_index():
    """Build local SQLite index of all papers."""
    
    conn = sqlite3.connect('sovereign_index.db')
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS papers (
            id TEXT PRIMARY KEY,
            title TEXT,
            category TEXT,
            author TEXT,
            keywords TEXT,
            url TEXT,
            fingerprint TEXT
        )
    ''')
    
    # Fetch manifest
    async with aiohttp.ClientSession() as session:
        url = "https://freddycreates.github.io/JOURNAL/api/ai/manifest"
        async with session.get(url) as resp:
            manifest = await resp.json()
    
    # Index all papers
    for paper in manifest['papers']:
        cursor.execute('''
            INSERT OR REPLACE INTO papers 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            paper['id'],
            paper['metadata']['title'],
            paper['metadata']['category'],
            paper['metadata']['author'],
            ','.join(paper['metadata']['keywords']),
            paper['url'],
            paper['fingerprint']['content_hash']
        ))
    
    conn.commit()
    conn.close()
    
    print(f"Indexed {manifest['total_papers']} papers in sovereign_index.db")

asyncio.run(build_search_index())
```

## Example 10: Federated Search Across Multiple Platforms

```python
import asyncio
import aiohttp
from typing import List, Dict

class FederatedSearchClient:
    def __init__(self):
        self.sources = {
            'sovereign': 'https://freddycreates.github.io/JOURNAL/api/ai',
            # Add other sources here
        }
    
    async def search_all_sources(self, query: str) -> List[Dict]:
        """Search across all connected platforms."""
        
        results = []
        tasks = []
        
        async with aiohttp.ClientSession() as session:
            for source_name, base_url in self.sources.items():
                url = f"{base_url}/search?query={query}&limit=20"
                tasks.append(self._fetch_source(session, source_name, url))
            
            source_results = await asyncio.gather(*tasks)
        
        # Merge and deduplicate results
        seen_ids = set()
        for source, source_data in source_results:
            if source_data and 'results' in source_data:
                for result in source_data['results']:
                    result_id = result.get('resource_id')
                    if result_id not in seen_ids:
                        seen_ids.add(result_id)
                        result['source'] = source
                        results.append(result)
        
        return sorted(results, key=lambda x: x.get('created_at', ''), reverse=True)
    
    async def _fetch_source(self, session, source_name, url):
        try:
            async with session.get(url, timeout=5) as resp:
                data = await resp.json()
                return source_name, data
        except Exception as e:
            print(f"Error fetching from {source_name}: {e}")
            return source_name, None

# Usage
client = FederatedSearchClient()
results = asyncio.run(client.search_all_sources('quantum computing'))
print(f"Found {len(results)} results from federated search")
```

## Best Practices

1. **Caching**: Cache results for 1 hour to minimize redundant requests
2. **Bulk Operations**: Use `/api/ai/manifest` for initial indexing instead of individual queries
3. **Rate Limiting**: Respect reasonable access patterns; don't hammer the API
4. **Verification**: Use fingerprints to verify content integrity locally
5. **Error Handling**: Gracefully handle 404s and network errors
6. **Pagination**: Use `limit` parameter responsibly
7. **Search Operators**: Combine multiple filters for precise results

## Support

For issues or questions, refer to the API documentation or open an issue in the repository.
