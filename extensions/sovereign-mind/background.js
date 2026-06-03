/* Sovereign Mind — Background Service Worker (EXT-001) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class SovereignMindEngine {
  constructor() {
    this.models = ['gpt', 'claude', 'gemini'];
    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now()
    };
    this._startHeartbeat();
  }

  fuseReasoning(prompt, models) {
    if (!models || models.length === 0) {
      models = this.models;
    }

    const modelResponses = models.map(function (model) {
      return this._simulateModelResponse(model, prompt);
    }.bind(this));

    var modelScores = {};
    var weightedSum = 0;
    var weightTotal = 0;

    for (var i = 0; i < modelResponses.length; i++) {
      var resp = modelResponses[i];
      var weight = Math.pow(PHI, -i);
      var score = this.scoreResponse(resp);
      modelScores[resp.model] = {
        confidence: resp.confidence,
        score: score.total,
        weight: weight
      };
      weightedSum += score.total * weight;
      weightTotal += weight;
    }

    var fusedConfidence = weightTotal > 0 ? weightedSum / weightTotal : 0;

    var bestResponse = modelResponses.reduce(function (best, curr) {
      return curr.confidence > best.confidence ? curr : best;
    }, modelResponses[0]);

    var fusedResponse = {
      text: bestResponse.text,
      sourceModel: bestResponse.model,
      allModels: models,
      prompt: prompt,
      timestamp: Date.now()
    };

    return {
      fusedResponse: fusedResponse,
      confidence: Math.round(fusedConfidence * 1000) / 1000,
      modelScores: modelScores
    };
  }

  scoreResponse(response) {
    var text = response.text || response || '';
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }

    var criteria = {
      coherence: Math.min(1, (text.length > 20 ? 0.7 : 0.3) + (response.confidence || 0.5) * 0.3),
      relevance: Math.min(1, (response.confidence || 0.5) * 0.8 + 0.2),
      accuracy: Math.min(1, (response.confidence || 0.5) * 0.7 + 0.15),
      creativity: Math.min(1, (text.length > 50 ? 0.6 : 0.3) + Math.random() * 0.2)
    };

    var keys = Object.keys(criteria);
    var total = 0;
    var breakdown = {};

    for (var i = 0; i < keys.length; i++) {
      var weight = Math.pow(PHI, -i);
      var weighted = criteria[keys[i]] * weight;
      breakdown[keys[i]] = {
        raw: Math.round(criteria[keys[i]] * 1000) / 1000,
        weight: Math.round(weight * 1000) / 1000,
        weighted: Math.round(weighted * 1000) / 1000
      };
      total += weighted;
    }

    return {
      total: Math.round(total * 1000) / 1000,
      breakdown: breakdown
    };
  }

  routeToAlpha(task) {
    var lower = (task || '').toLowerCase();

    var routing = [
      { model: 'gpt', keywords: ['code', 'math', 'debug', 'algorithm', 'function', 'program', 'logic', 'compute'] },
      { model: 'claude', keywords: ['creative', 'write', 'story', 'essay', 'poem', 'explain', 'summarize', 'draft'] },
      { model: 'gemini', keywords: ['research', 'data', 'search', 'analyze', 'fact', 'compare', 'review', 'source'] }
    ];

    var bestMatch = { model: 'gpt', score: 0, matched: [] };

    for (var i = 0; i < routing.length; i++) {
      var entry = routing[i];
      var matchCount = 0;
      var matched = [];

      for (var j = 0; j < entry.keywords.length; j++) {
        if (lower.indexOf(entry.keywords[j]) !== -1) {
          matchCount++;
          matched.push(entry.keywords[j]);
        }
      }

      if (matchCount > bestMatch.score) {
        bestMatch = { model: entry.model, score: matchCount, matched: matched };
      }
    }

    var confidence = bestMatch.score > 0
      ? Math.min(1, 0.5 + bestMatch.score * 0.15)
      : 0.33;

    var reasoning = bestMatch.score > 0
      ? 'Routed to ' + bestMatch.model + ' based on keyword matches: [' + bestMatch.matched.join(', ') + ']'
      : 'No strong keyword signal detected; defaulting to GPT as general-purpose model';

    return {
      model: bestMatch.model,
      confidence: Math.round(confidence * 1000) / 1000,
      reasoning: reasoning
    };
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();

      var memoryOk = true;
      if (typeof performance !== 'undefined' && performance.memory) {
        memoryOk = performance.memory.usedJSHeapSize < performance.memory.jsHeapSizeLimit * 0.9;
      }

      this.state.healthy = memoryOk;

      console.log(
        '[SovereignMind] heartbeat #' + this.state.heartbeatCount +
        ' | healthy: ' + this.state.healthy +
        ' | ts: ' + this.state.lastHeartbeat
      );
    }.bind(this), HEARTBEAT);
  }

  _simulateModelResponse(model, prompt) {
    var characteristics = {
      gpt: { style: 'analytical', baseConfidence: 0.85, prefix: 'Based on logical analysis' },
      claude: { style: 'thoughtful', baseConfidence: 0.82, prefix: 'Considering multiple perspectives' },
      gemini: { style: 'comprehensive', baseConfidence: 0.80, prefix: 'After reviewing available information' }
    };

    var config = characteristics[model] || characteristics.gpt;
    var promptLen = (prompt || '').length;
    var variance = ((promptLen * 7 + 13) % 20 - 10) / 100;
    var confidence = Math.min(1, Math.max(0.1, config.baseConfidence + variance));

    return {
      model: model,
      text: config.prefix + ', here is a ' + config.style + ' response to: "' +
            (prompt || '').substring(0, 80) + (promptLen > 80 ? '...' : '') + '"',
      confidence: Math.round(confidence * 1000) / 1000,
      style: config.style,
      timestamp: Date.now()
    };
  }
}

globalThis.sovereignMind = new SovereignMindEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.sovereignMind;

  if (message.action === 'fuseReasoning') {
    var result = engine.fuseReasoning(message.prompt, message.models);
    sendResponse({ success: true, data: result });
  } else if (message.action === 'scoreResponse') {
    var score = engine.scoreResponse(message.response);
    sendResponse({ success: true, data: score });
  } else if (message.action === 'routeToAlpha') {
    var route = engine.routeToAlpha(message.task);
    sendResponse({ success: true, data: route });
  } else {
    sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});
