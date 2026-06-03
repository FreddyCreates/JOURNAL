/* Knowledge Cartographer — Background Service Worker (EXT-017) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class KnowledgeCartographerEngine {
  constructor() {
    this.engines = ['embeddings', 'command-r', 'florence'];
    this.graph = { nodes: [], edges: [] };
    this.nodeIndex = {};
  }

  mapPage(url, content) {
    if (!url || !content) return { error: 'URL and content are required' };

    var text = typeof content === 'string' ? content : JSON.stringify(content);
    var entities = this._extractEntities(text);
    var relations = this._extractRelations(entities);

    var pageNode = {
      id: 'page-' + this._hashString(url).toString(36),
      type: 'page',
      url: url,
      entityCount: entities.length,
      timestamp: Date.now()
    };

    var nodes = [pageNode];
    var edges = [];

    for (var i = 0; i < entities.length; i++) {
      var entity = entities[i];
      var nodeId = 'ent-' + this._hashString(entity.text).toString(36);

      nodes.push({
        id: nodeId,
        type: entity.type,
        label: entity.text,
        frequency: entity.frequency,
        weight: Math.round(Math.pow(PHI, -(i * 0.2)) * 1000) / 1000
      });

      edges.push({
        source: pageNode.id,
        target: nodeId,
        type: 'contains',
        weight: entity.frequency
      });
    }

    for (var r = 0; r < relations.length; r++) {
      edges.push(relations[r]);
    }

    this.addToGraph(nodes, edges);

    return {
      url: url,
      entitiesFound: entities.length,
      nodesAdded: nodes.length,
      edgesAdded: edges.length,
      entities: entities,
      engine: 'florence',
      timestamp: Date.now()
    };
  }

  addToGraph(nodes, edges) {
    if (!Array.isArray(nodes)) nodes = [];
    if (!Array.isArray(edges)) edges = [];

    var addedNodes = 0;
    var addedEdges = 0;

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!this.nodeIndex[node.id]) {
        this.graph.nodes.push(node);
        this.nodeIndex[node.id] = this.graph.nodes.length - 1;
        addedNodes++;
      }
    }

    for (var j = 0; j < edges.length; j++) {
      this.graph.edges.push(edges[j]);
      addedEdges++;
    }

    return {
      addedNodes: addedNodes,
      addedEdges: addedEdges,
      totalNodes: this.graph.nodes.length,
      totalEdges: this.graph.edges.length
    };
  }

  queryGraph(sparql) {
    if (!sparql) return { error: 'Query string is required' };

    var lower = sparql.toLowerCase();
    var results = [];

    /* Simple pattern matching query language */
    if (lower.indexOf('select') !== -1 && lower.indexOf('where') !== -1) {
      var typeMatch = lower.match(/type\s*=\s*['"](\w+)['"]/);
      var labelMatch = lower.match(/label\s*contains?\s*['"]([^'"]+)['"]/i);

      for (var i = 0; i < this.graph.nodes.length; i++) {
        var node = this.graph.nodes[i];
        var matches = true;

        if (typeMatch && node.type !== typeMatch[1]) matches = false;
        if (labelMatch && (node.label || '').toLowerCase().indexOf(labelMatch[1]) === -1) matches = false;

        if (matches) {
          results.push(node);
        }
      }
    } else if (lower.indexOf('edges') !== -1 || lower.indexOf('relations') !== -1) {
      results = this.graph.edges.slice(0, 50);
    } else {
      /* Full text search across nodes */
      var searchTerm = sparql.toLowerCase().trim();
      for (var n = 0; n < this.graph.nodes.length; n++) {
        var nd = this.graph.nodes[n];
        var ndText = ((nd.label || '') + ' ' + (nd.type || '') + ' ' + (nd.url || '')).toLowerCase();
        if (ndText.indexOf(searchTerm) !== -1) {
          results.push(nd);
        }
      }
    }

    return {
      query: sparql,
      resultCount: results.length,
      results: results.slice(0, 100),
      graphSize: { nodes: this.graph.nodes.length, edges: this.graph.edges.length },
      engine: 'command-r',
      timestamp: Date.now()
    };
  }

  visualizeCluster(centroid, radius) {
    if (centroid === undefined) centroid = 0;
    if (radius === undefined) radius = 200;

    var clusterNodes = this.graph.nodes.slice(0, 50);
    var layout = [];

    for (var i = 0; i < clusterNodes.length; i++) {
      /* Phyllotaxis golden angle spiral */
      var angle = i * GOLDEN_ANGLE * (Math.PI / 180);
      var r = radius * Math.sqrt(i / Math.max(1, clusterNodes.length));

      var x = Math.round(centroid + r * Math.cos(angle));
      var y = Math.round(centroid + r * Math.sin(angle));

      layout.push({
        nodeId: clusterNodes[i].id,
        label: clusterNodes[i].label || clusterNodes[i].type || clusterNodes[i].id,
        x: x,
        y: y,
        angle: Math.round(angle * 180 / Math.PI) % 360,
        radius: Math.round(r),
        size: Math.max(6, Math.round(20 * (clusterNodes[i].weight || Math.pow(PHI, -(i * 0.2)))))
      });
    }

    return {
      nodeCount: layout.length,
      layout: layout,
      centroid: centroid,
      radius: radius,
      spiralType: 'golden-phyllotaxis',
      goldenAngle: GOLDEN_ANGLE,
      timestamp: Date.now()
    };
  }

  mergeBrowsingHistory(historyEntries) {
    if (!Array.isArray(historyEntries) || historyEntries.length === 0) {
      return { error: 'History entries array is required' };
    }

    var temporalNodes = [];
    var temporalEdges = [];
    var prevNodeId = null;

    for (var i = 0; i < historyEntries.length; i++) {
      var entry = historyEntries[i];
      var url = entry.url || entry;
      var titleText = entry.title || url;
      var visitTime = entry.lastVisitTime || Date.now() - (historyEntries.length - i) * 60000;

      var nodeId = 'hist-' + this._hashString(String(url)).toString(36);

      temporalNodes.push({
        id: nodeId,
        type: 'history',
        label: typeof titleText === 'string' ? titleText.substring(0, 80) : String(titleText),
        url: typeof url === 'string' ? url : String(url),
        visitTime: visitTime,
        weight: Math.round(Math.pow(PHI, -(i * 0.1)) * 1000) / 1000
      });

      if (prevNodeId) {
        temporalEdges.push({
          source: prevNodeId,
          target: nodeId,
          type: 'temporal-sequence',
          timeDelta: visitTime - (historyEntries[i - 1].lastVisitTime || 0)
        });
      }
      prevNodeId = nodeId;
    }

    this.addToGraph(temporalNodes, temporalEdges);

    return {
      entriesProcessed: historyEntries.length,
      nodesCreated: temporalNodes.length,
      edgesCreated: temporalEdges.length,
      graphSize: { nodes: this.graph.nodes.length, edges: this.graph.edges.length },
      engine: 'embeddings',
      timestamp: Date.now()
    };
  }

  _extractEntities(text) {
    var words = text.split(/\s+/);
    var frequency = {};

    for (var i = 0; i < words.length; i++) {
      var cleaned = words[i].replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      if (cleaned.length > 3) {
        frequency[cleaned] = (frequency[cleaned] || 0) + 1;
      }
    }

    var entities = [];
    var keys = Object.keys(frequency);
    keys.sort(function (a, b) { return frequency[b] - frequency[a]; });

    var stopWords = ['this', 'that', 'with', 'from', 'they', 'been', 'have', 'will',
      'would', 'could', 'should', 'their', 'there', 'which', 'about', 'more', 'also', 'into', 'only'];

    for (var j = 0; j < Math.min(keys.length, 30); j++) {
      if (stopWords.indexOf(keys[j]) !== -1) continue;

      var type = 'concept';
      if (keys[j].charAt(0) === keys[j].charAt(0).toUpperCase()) type = 'proper-noun';
      if (frequency[keys[j]] > 5) type = 'keyword';

      entities.push({
        text: keys[j],
        type: type,
        frequency: frequency[keys[j]]
      });
    }

    return entities.slice(0, 20);
  }

  _extractRelations(entities) {
    var relations = [];
    for (var i = 0; i < entities.length - 1; i++) {
      for (var j = i + 1; j < Math.min(entities.length, i + 4); j++) {
        var weight = Math.round(Math.pow(PHI, -(j - i)) * (entities[i].frequency + entities[j].frequency) * 100) / 100;
        relations.push({
          source: 'ent-' + this._hashString(entities[i].text).toString(36),
          target: 'ent-' + this._hashString(entities[j].text).toString(36),
          type: 'co-occurrence',
          weight: weight
        });
      }
    }
    return relations;
  }

  _hashString(str) {
    var hash = 0;
    var s = String(str);
    for (var i = 0; i < s.length; i++) {
      var ch = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

globalThis.knowledgeCartographer = new KnowledgeCartographerEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.knowledgeCartographer;

  switch (message.action) {
    case 'mapPage':
      sendResponse({ success: true, data: engine.mapPage(message.url, message.content) });
      break;
    case 'addToGraph':
      sendResponse({ success: true, data: engine.addToGraph(message.nodes, message.edges) });
      break;
    case 'queryGraph':
      sendResponse({ success: true, data: engine.queryGraph(message.sparql) });
      break;
    case 'visualizeCluster':
      sendResponse({ success: true, data: engine.visualizeCluster(message.centroid, message.radius) });
      break;
    case 'mergeBrowsingHistory':
      sendResponse({ success: true, data: engine.mergeBrowsingHistory(message.historyEntries) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});
