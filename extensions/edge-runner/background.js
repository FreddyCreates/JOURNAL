/* Edge Runner — Background Service Worker (EXT-014) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class EdgeRunnerEngine {
  constructor() {
    this.models = {
      phi: {
        name: 'Phi',
        sizeGB: 2.7,
        maxTokens: 2048,
        latencyBase: 45,
        strengths: ['reasoning', 'code', 'math'],
        memoryRequiredMB: 3000
      },
      gemma: {
        name: 'Gemma',
        sizeGB: 5.0,
        maxTokens: 8192,
        latencyBase: 65,
        strengths: ['general', 'instruction', 'conversation'],
        memoryRequiredMB: 5500
      },
      dbrx: {
        name: 'DBRX',
        sizeGB: 36.0,
        maxTokens: 32768,
        latencyBase: 120,
        strengths: ['enterprise', 'data', 'analysis', 'long-context'],
        memoryRequiredMB: 40000
      }
    };

    this.inferenceCache = {};
    this.benchmarkResults = null;
  }

  inferLocal(prompt, model) {
    if (model === undefined) model = 'phi';

    var config = this.models[model];
    if (!config) {
      return { error: 'Unknown model: ' + model, available: Object.keys(this.models) };
    }

    var inputTokens = Math.ceil((prompt || '').split(/\s+/).length * 1.3);
    var outputTokens = Math.min(config.maxTokens, Math.max(50, Math.round(inputTokens * PHI)));

    var latency = this.estimateLatency(config.sizeGB, inputTokens);
    var cached = this._checkCache(prompt);
    if (cached) {
      return {
        result: cached.result,
        model: model,
        cached: true,
        latencyMs: 1,
        tokens: { input: inputTokens, output: cached.outputTokens },
        timestamp: Date.now()
      };
    }

    var simulatedOutput = 'Local inference result from ' + config.name +
      ' model for: "' + (prompt || '').substring(0, 80) + '"';

    var record = {
      result: simulatedOutput,
      model: model,
      modelName: config.name,
      cached: false,
      tokens: { input: inputTokens, output: outputTokens },
      latency: latency,
      offline: true,
      timestamp: Date.now()
    };

    this.cacheInference(prompt, record);
    return record;
  }

  estimateLatency(modelSize, inputTokens) {
    var sizeGB = typeof modelSize === 'number' ? modelSize : 2.7;
    var tokens = inputTokens || 100;

    var sizeFactor = Math.pow(sizeGB / 2.7, PHI * 0.5);
    var tokenFactor = Math.log(tokens + 1) / Math.log(PHI * 10);
    var baseLatency = HEARTBEAT * 0.1;

    var totalMs = baseLatency * sizeFactor * tokenFactor;

    return {
      estimatedMs: Math.round(totalMs),
      tokensPerSecond: Math.round((tokens / totalMs) * 1000),
      factors: {
        sizeFactor: Math.round(sizeFactor * 1000) / 1000,
        tokenFactor: Math.round(tokenFactor * 1000) / 1000,
        baseLatency: Math.round(baseLatency)
      }
    };
  }

  selectOptimalModel(taskComplexity, availableMemory) {
    var complexity = taskComplexity || 0.5;
    var memoryMB = availableMemory || 8000;

    var candidates = [];
    var modelKeys = Object.keys(this.models);

    for (var i = 0; i < modelKeys.length; i++) {
      var key = modelKeys[i];
      var config = this.models[key];

      if (config.memoryRequiredMB > memoryMB) continue;

      var complexityFit = 1 - Math.abs(complexity - (config.sizeGB / 36));
      var efficiencyScore = complexityFit / config.sizeGB;
      var phiScore = efficiencyScore * Math.pow(PHI, -i * 0.5);

      candidates.push({
        model: key,
        name: config.name,
        sizeGB: config.sizeGB,
        memoryMB: config.memoryRequiredMB,
        complexityFit: Math.round(complexityFit * 1000) / 1000,
        efficiencyScore: Math.round(efficiencyScore * 10000) / 10000,
        phiScore: Math.round(phiScore * 10000) / 10000,
        fitsMemory: true
      });
    }

    if (candidates.length === 0) {
      return {
        error: 'No model fits available memory: ' + memoryMB + 'MB',
        minimumRequired: this.models.phi.memoryRequiredMB
      };
    }

    candidates.sort(function (a, b) { return b.phiScore - a.phiScore; });

    return {
      selected: candidates[0].model,
      selectedName: candidates[0].name,
      candidates: candidates,
      taskComplexity: complexity,
      availableMemory: memoryMB,
      reasoning: 'Selected ' + candidates[0].name + ' (phi-score: ' + candidates[0].phiScore + ')',
      timestamp: Date.now()
    };
  }

  cacheInference(prompt, result, ttl) {
    if (ttl === undefined) ttl = HEARTBEAT * 100;

    var key = this._hashPrompt(prompt);
    this.inferenceCache[key] = {
      result: result.result || result,
      outputTokens: (result.tokens && result.tokens.output) || 0,
      cachedAt: Date.now(),
      ttl: ttl,
      expiresAt: Date.now() + ttl
    };

    this._pruneCache();

    return {
      cached: true,
      key: key,
      ttl: ttl,
      expiresAt: this.inferenceCache[key].expiresAt,
      cacheSize: Object.keys(this.inferenceCache).length
    };
  }

  benchmarkModels() {
    var testPrompts = [
      'What is 2 + 2?',
      'Explain the theory of relativity in simple terms.',
      'Write a function to sort an array using quicksort.',
      'Analyze the economic impact of renewable energy adoption.',
      'Summarize the key findings from recent quantum computing research.'
    ];

    var modelKeys = Object.keys(this.models);
    var benchmarks = {};

    for (var m = 0; m < modelKeys.length; m++) {
      var modelKey = modelKeys[m];
      var config = this.models[modelKey];
      var totalLatency = 0;
      var totalThroughput = 0;

      for (var p = 0; p < testPrompts.length; p++) {
        var tokens = testPrompts[p].split(/\s+/).length;
        var latency = this.estimateLatency(config.sizeGB, tokens);
        totalLatency += latency.estimatedMs;
        totalThroughput += latency.tokensPerSecond;
      }

      var avgLatency = totalLatency / testPrompts.length;
      var avgThroughput = totalThroughput / testPrompts.length;

      var performanceIndex = (avgThroughput / avgLatency) * Math.pow(PHI, -(m * 0.3));

      benchmarks[modelKey] = {
        name: config.name,
        avgLatencyMs: Math.round(avgLatency),
        avgThroughput: Math.round(avgThroughput),
        sizeGB: config.sizeGB,
        memoryMB: config.memoryRequiredMB,
        performanceIndex: Math.round(performanceIndex * 10000) / 10000,
        grade: performanceIndex > 1 ? 'A' : performanceIndex > 0.5 ? 'B' : performanceIndex > 0.2 ? 'C' : 'D'
      };
    }

    var sorted = Object.keys(benchmarks).sort(function (a, b) {
      return benchmarks[b].performanceIndex - benchmarks[a].performanceIndex;
    });

    this.benchmarkResults = {
      models: benchmarks,
      ranking: sorted,
      testCount: testPrompts.length,
      bestModel: sorted[0],
      timestamp: Date.now()
    };

    return this.benchmarkResults;
  }

  _checkCache(prompt) {
    var key = this._hashPrompt(prompt);
    var entry = this.inferenceCache[key];
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      delete this.inferenceCache[key];
      return null;
    }
    return entry;
  }

  _pruneCache() {
    var now = Date.now();
    var keys = Object.keys(this.inferenceCache);
    for (var i = 0; i < keys.length; i++) {
      if (now > this.inferenceCache[keys[i]].expiresAt) {
        delete this.inferenceCache[keys[i]];
      }
    }
  }

  _hashPrompt(prompt) {
    var hash = 0;
    var str = (prompt || '').substring(0, 200);
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return 'cache-' + Math.abs(hash).toString(36);
  }
}

globalThis.edgeRunner = new EdgeRunnerEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.edgeRunner;

  switch (message.action) {
    case 'inferLocal':
      sendResponse({ success: true, data: engine.inferLocal(message.prompt, message.model) });
      break;
    case 'estimateLatency':
      sendResponse({ success: true, data: engine.estimateLatency(message.modelSize, message.inputTokens) });
      break;
    case 'selectOptimalModel':
      sendResponse({ success: true, data: engine.selectOptimalModel(message.taskComplexity, message.availableMemory) });
      break;
    case 'cacheInference':
      sendResponse({ success: true, data: engine.cacheInference(message.prompt, message.result, message.ttl) });
      break;
    case 'benchmarkModels':
      sendResponse({ success: true, data: engine.benchmarkModels() });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});
