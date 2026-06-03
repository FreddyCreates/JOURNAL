/* Video Architect — Background Service Worker (EXT-011) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class VideoArchitectEngine {
  constructor() {
    this.engines = {
      sora: {
        name: 'Sora',
        maxDuration: 60,
        maxResolution: 2160,
        complexityThreshold: 0.7,
        strengths: ['narrative', 'physics', 'long-form', 'cinematic']
      },
      runway: {
        name: 'Runway',
        maxDuration: 30,
        maxResolution: 1080,
        complexityThreshold: 0.5,
        strengths: ['motion', 'style-transfer', 'editing', 'compositing']
      },
      pika: {
        name: 'Pika',
        maxDuration: 15,
        maxResolution: 1080,
        complexityThreshold: 0.2,
        strengths: ['quick', 'simple', 'social', 'looping']
      },
      kling: {
        name: 'Kling',
        maxDuration: 45,
        maxResolution: 1440,
        complexityThreshold: 0.4,
        strengths: ['character', 'animation', 'expression', 'lip-sync']
      }
    };

    this.generationQueue = [];
    this.clipStore = [];
  }

  generateVideo(prompt, engine, duration) {
    if (engine === undefined) engine = 'sora';
    if (duration === undefined) duration = 10;

    var config = this.engines[engine];
    if (!config) {
      return { error: 'Unknown engine: ' + engine, available: Object.keys(this.engines) };
    }

    var clampedDuration = Math.min(duration, config.maxDuration);
    var complexity = this._analyzeComplexity(prompt);
    var frameRate = complexity > 0.6 ? 30 : 24;
    var totalFrames = clampedDuration * frameRate;

    var seed = Math.abs(this._hashString(prompt)) % 4294967295;
    var resolution = Math.min(config.maxResolution, Math.round(config.maxResolution * (0.7 + complexity * 0.3)));
    resolution = resolution - (resolution % 2);

    var record = {
      videoId: 'va-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8),
      prompt: prompt,
      engine: engine,
      engineName: config.name,
      duration: clampedDuration,
      resolution: resolution + 'p',
      frameRate: frameRate,
      totalFrames: totalFrames,
      seed: seed,
      complexity: complexity,
      estimatedRenderTime: this.estimateRenderTime({
        duration: clampedDuration,
        resolution: resolution,
        frameRate: frameRate,
        complexity: complexity
      }),
      status: 'queued',
      timestamp: Date.now()
    };

    this.generationQueue.push(record);
    return record;
  }

  routeByComplexity(prompt) {
    var complexity = this._analyzeComplexity(prompt);
    var engineKeys = Object.keys(this.engines);
    var scores = {};

    for (var i = 0; i < engineKeys.length; i++) {
      var key = engineKeys[i];
      var config = this.engines[key];
      var phiWeight = Math.pow(PHI, -(i));

      var thresholdDist = Math.abs(complexity - config.complexityThreshold);
      var fitScore = 1 / (1 + thresholdDist * PHI);

      var strengthBonus = 0;
      var lower = (prompt || '').toLowerCase();
      for (var s = 0; s < config.strengths.length; s++) {
        if (lower.indexOf(config.strengths[s]) !== -1) {
          strengthBonus += 0.15;
        }
      }

      scores[key] = Math.round((fitScore * phiWeight + strengthBonus) * 1000) / 1000;
    }

    var bestEngine = engineKeys[0];
    var bestScore = 0;
    for (var e in scores) {
      if (scores[e] > bestScore) {
        bestScore = scores[e];
        bestEngine = e;
      }
    }

    return {
      engine: bestEngine,
      engineName: this.engines[bestEngine].name,
      complexity: Math.round(complexity * 1000) / 1000,
      scores: scores,
      reasoning: complexity > 0.7
        ? 'High complexity — routed to ' + this.engines[bestEngine].name + ' for best fidelity'
        : complexity < 0.3
          ? 'Low complexity — routed to ' + this.engines[bestEngine].name + ' for fast generation'
          : 'Medium complexity — routed to ' + this.engines[bestEngine].name + ' for balanced output'
    };
  }

  estimateRenderTime(params) {
    var baseDuration = params.duration || 10;
    var resolution = params.resolution || 1080;
    var frameRate = params.frameRate || 24;
    var complexity = params.complexity || 0.5;

    var resolutionFactor = Math.pow(resolution / 1080, PHI);
    var frameFactor = (baseDuration * frameRate) / 240;
    var complexityFactor = 1 + complexity * PHI;

    var baseTimeMs = HEARTBEAT * 10;
    var totalMs = baseTimeMs * resolutionFactor * frameFactor * complexityFactor;

    return {
      estimatedMs: Math.round(totalMs),
      estimatedSeconds: Math.round(totalMs / 1000),
      estimatedMinutes: Math.round(totalMs / 60000 * 10) / 10,
      factors: {
        resolution: Math.round(resolutionFactor * 1000) / 1000,
        frames: Math.round(frameFactor * 1000) / 1000,
        complexity: Math.round(complexityFactor * 1000) / 1000
      }
    };
  }

  mergeClips(clips) {
    if (!Array.isArray(clips) || clips.length === 0) {
      return { error: 'At least one clip is required' };
    }

    var totalDuration = 0;
    var totalFrames = 0;
    var mergedSegments = [];

    for (var i = 0; i < clips.length; i++) {
      var clip = clips[i];
      var dur = clip.duration || 5;
      var fps = clip.frameRate || 24;
      var transitionDuration = i > 0 ? Math.round(HEARTBEAT / PHI) / 1000 : 0;

      mergedSegments.push({
        clipId: clip.id || 'clip-' + (i + 1),
        startTime: Math.round(totalDuration * 1000) / 1000,
        duration: dur,
        transitionIn: i > 0 ? 'phi-crossfade' : 'none',
        transitionDuration: transitionDuration,
        weight: Math.pow(PHI, -i)
      });

      totalDuration += dur - transitionDuration;
      totalFrames += dur * fps;
    }

    return {
      mergedId: 'merge-' + Date.now().toString(36),
      segments: mergedSegments,
      totalDuration: Math.round(totalDuration * 1000) / 1000,
      totalFrames: totalFrames,
      clipCount: clips.length,
      timestamp: Date.now()
    };
  }

  scoreQuality(videoMeta) {
    var resolution = videoMeta.resolution || 1080;
    var motion = videoMeta.motionScore || 0.5;
    var coherence = videoMeta.coherenceScore || 0.5;

    var resScore = Math.min(1, resolution / 2160);
    var motionScore = Math.min(1, Math.max(0, motion));
    var coherenceScore = Math.min(1, Math.max(0, coherence));

    var weights = {
      resolution: Math.pow(PHI, 0),
      motion: Math.pow(PHI, -1),
      coherence: Math.pow(PHI, -2)
    };

    var totalWeight = weights.resolution + weights.motion + weights.coherence;
    var weighted =
      resScore * weights.resolution +
      motionScore * weights.motion +
      coherenceScore * weights.coherence;

    var overall = weighted / totalWeight;

    return {
      overall: Math.round(overall * 10000) / 10000,
      breakdown: {
        resolution: { raw: Math.round(resScore * 1000) / 1000, weight: Math.round(weights.resolution * 1000) / 1000 },
        motion: { raw: Math.round(motionScore * 1000) / 1000, weight: Math.round(weights.motion * 1000) / 1000 },
        coherence: { raw: Math.round(coherenceScore * 1000) / 1000, weight: Math.round(weights.coherence * 1000) / 1000 }
      },
      grade: overall > 0.85 ? 'A' : overall > 0.7 ? 'B' : overall > 0.5 ? 'C' : 'D'
    };
  }

  _analyzeComplexity(prompt) {
    var lower = (prompt || '').toLowerCase();
    var words = lower.split(/\s+/).filter(function (w) { return w.length > 0; });
    var complexIndicators = ['cinematic', 'narrative', 'physics', 'realistic', 'multi-shot',
      'camera', 'tracking', 'transition', 'slow-motion', 'timelapse', 'choreography'];
    var simpleIndicators = ['loop', 'simple', 'gif', 'quick', 'basic', 'short', 'minimal'];

    var complexCount = 0;
    var simpleCount = 0;

    for (var i = 0; i < complexIndicators.length; i++) {
      if (lower.indexOf(complexIndicators[i]) !== -1) complexCount++;
    }
    for (var j = 0; j < simpleIndicators.length; j++) {
      if (lower.indexOf(simpleIndicators[j]) !== -1) simpleCount++;
    }

    var lengthFactor = Math.min(1, words.length / 40);
    var base = 0.5 + (complexCount - simpleCount) * 0.1 + lengthFactor * 0.2;
    return Math.min(1, Math.max(0, Math.round(base * 1000) / 1000));
  }

  _hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return hash;
  }
}

globalThis.videoArchitect = new VideoArchitectEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.videoArchitect;

  switch (message.action) {
    case 'generateVideo':
      sendResponse({ success: true, data: engine.generateVideo(message.prompt, message.engine, message.duration) });
      break;
    case 'routeByComplexity':
      sendResponse({ success: true, data: engine.routeByComplexity(message.prompt) });
      break;
    case 'estimateRenderTime':
      sendResponse({ success: true, data: engine.estimateRenderTime(message.params) });
      break;
    case 'mergeClips':
      sendResponse({ success: true, data: engine.mergeClips(message.clips) });
      break;
    case 'scoreQuality':
      sendResponse({ success: true, data: engine.scoreQuality(message.videoMeta) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});
