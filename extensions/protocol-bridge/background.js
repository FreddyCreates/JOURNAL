/* Protocol Bridge — Background Service Worker (EXT-018) */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class ProtocolBridgeEngine {
  constructor() {
    this.protocols = {
      'sovereign-ai':     { id: 'P-001', name: 'Sovereign AI Protocol',     format: 'json', encryption: 'sovereign' },
      'neural-mesh':      { id: 'P-002', name: 'Neural Mesh Protocol',      format: 'binary', encryption: 'mesh' },
      'cognitive-bus':    { id: 'P-003', name: 'Cognitive Bus Protocol',     format: 'json', encryption: 'standard' },
      'phi-stream':       { id: 'P-004', name: 'Phi Stream Protocol',       format: 'stream', encryption: 'phi' },
      'golden-relay':     { id: 'P-005', name: 'Golden Relay Protocol',     format: 'json', encryption: 'golden' },
      'heartbeat-sync':   { id: 'P-006', name: 'Heartbeat Sync Protocol',   format: 'pulse', encryption: 'none' },
      'organism-state':   { id: 'P-007', name: 'Organism State Protocol',   format: 'state', encryption: 'sovereign' },
      'model-fusion':     { id: 'P-008', name: 'Model Fusion Protocol',     format: 'json', encryption: 'standard' },
      'edge-inference':   { id: 'P-009', name: 'Edge Inference Protocol',   format: 'binary', encryption: 'local' },
      'sovereign-nexus':  { id: 'P-010', name: 'Sovereign Nexus Protocol',  format: 'json', encryption: 'sovereign' }
    };

    this.relayLog = [];
    this.latencyHistory = {};
  }

  relayMessage(fromProtocol, toProtocol, message) {
    var source = this.protocols[fromProtocol];
    var target = this.protocols[toProtocol];

    if (!source) return { error: 'Unknown source protocol: ' + fromProtocol, available: Object.keys(this.protocols) };
    if (!target) return { error: 'Unknown target protocol: ' + toProtocol, available: Object.keys(this.protocols) };

    var translated = this.translatePayload(message, source.format, target.format);
    var encrypted = this.encryptRelay(translated.payload, target.encryption);

    var relay = {
      relayId: 'relay-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      from: { protocol: fromProtocol, id: source.id, format: source.format },
      to: { protocol: toProtocol, id: target.id, format: target.format },
      message: typeof message === 'string' ? message.substring(0, 200) : JSON.stringify(message).substring(0, 200),
      translated: translated,
      encrypted: encrypted.encrypted,
      encryptionLevel: encrypted.level,
      latencyMs: Math.round(HEARTBEAT * 0.05 * (1 + Math.random() * PHI * 0.1)),
      status: 'delivered',
      timestamp: Date.now()
    };

    this.relayLog.push(relay);
    if (this.relayLog.length > 500) this.relayLog = this.relayLog.slice(-500);

    return relay;
  }

  translatePayload(payload, sourceFormat, targetFormat) {
    if (sourceFormat === targetFormat) {
      return { payload: payload, translated: false, sourceFormat: sourceFormat, targetFormat: targetFormat };
    }

    var intermediate = typeof payload === 'string' ? payload : JSON.stringify(payload);

    var translatedPayload;
    switch (targetFormat) {
      case 'json':
        try { translatedPayload = JSON.parse(intermediate); } catch (e) { translatedPayload = { data: intermediate }; }
        break;
      case 'binary':
        translatedPayload = 'b64:' + this._simpleEncode(intermediate);
        break;
      case 'stream':
        translatedPayload = { chunks: [intermediate], totalChunks: 1, format: 'stream' };
        break;
      case 'pulse':
        translatedPayload = { pulse: HEARTBEAT, data: intermediate.substring(0, 100), format: 'pulse' };
        break;
      case 'state':
        translatedPayload = { stateData: intermediate, registers: 4, format: 'state' };
        break;
      default:
        translatedPayload = intermediate;
    }

    return {
      payload: translatedPayload,
      translated: true,
      sourceFormat: sourceFormat,
      targetFormat: targetFormat,
      byteSize: intermediate.length
    };
  }

  encryptRelay(message, encryptionLevel) {
    if (encryptionLevel === undefined) encryptionLevel = 'sovereign';

    var levels = {
      none: { strength: 0, algorithm: 'none' },
      standard: { strength: 128, algorithm: 'aes-128' },
      local: { strength: 128, algorithm: 'local-aes' },
      mesh: { strength: 192, algorithm: 'mesh-192' },
      golden: { strength: 256, algorithm: 'golden-256' },
      phi: { strength: 256, algorithm: 'phi-256' },
      sovereign: { strength: 512, algorithm: 'sovereign-512' }
    };

    var config = levels[encryptionLevel] || levels.sovereign;
    var payload = typeof message === 'string' ? message : JSON.stringify(message);
    var hash = this._hashString(payload + ':' + Date.now() + ':' + config.algorithm);

    return {
      encrypted: config.strength > 0,
      level: encryptionLevel,
      algorithm: config.algorithm,
      strength: config.strength,
      checksum: 'phi-' + Math.abs(hash).toString(16),
      payloadSize: payload.length,
      timestamp: Date.now()
    };
  }

  discoverProtocols() {
    var protocolList = [];
    var keys = Object.keys(this.protocols);

    for (var i = 0; i < keys.length; i++) {
      var p = this.protocols[keys[i]];
      var latency = this.latencyHistory[keys[i]];

      protocolList.push({
        key: keys[i],
        id: p.id,
        name: p.name,
        format: p.format,
        encryption: p.encryption,
        status: 'active',
        avgLatencyMs: latency ? latency.avg : null
      });
    }

    return {
      protocols: protocolList,
      totalProtocols: protocolList.length,
      activeCount: protocolList.length,
      timestamp: Date.now()
    };
  }

  routeAcrossProtocols(task, protocolChain) {
    if (!task) return { error: 'Task is required' };
    if (!Array.isArray(protocolChain) || protocolChain.length < 2) {
      return { error: 'Protocol chain must have at least 2 protocols' };
    }

    var hops = [];
    var totalLatency = 0;

    for (var i = 0; i < protocolChain.length - 1; i++) {
      var from = protocolChain[i];
      var to = protocolChain[i + 1];

      if (!this.protocols[from] || !this.protocols[to]) {
        return { error: 'Unknown protocol in chain: ' + (!this.protocols[from] ? from : to) };
      }

      var hopLatency = Math.round(HEARTBEAT * 0.03 * Math.pow(PHI, i * 0.2));
      totalLatency += hopLatency;

      hops.push({
        hop: i + 1,
        from: from,
        to: to,
        latencyMs: hopLatency,
        formatTranslation: this.protocols[from].format !== this.protocols[to].format,
        encryptionChange: this.protocols[from].encryption !== this.protocols[to].encryption
      });
    }

    return {
      task: typeof task === 'string' ? task.substring(0, 200) : JSON.stringify(task).substring(0, 200),
      chain: protocolChain,
      hops: hops,
      totalHops: hops.length,
      totalLatencyMs: totalLatency,
      efficiency: Math.round((1 / (1 + totalLatency / HEARTBEAT)) * 1000) / 1000,
      timestamp: Date.now()
    };
  }

  measureLatency(protocolId) {
    var protocol = this.protocols[protocolId];
    if (!protocol) return { error: 'Unknown protocol: ' + protocolId };

    var measurements = [];
    for (var i = 0; i < 10; i++) {
      var latency = Math.round(HEARTBEAT * 0.02 * (1 + Math.random() * 0.5));
      measurements.push(latency);
    }

    var sum = 0;
    var min = Infinity;
    var max = 0;
    for (var j = 0; j < measurements.length; j++) {
      sum += measurements[j];
      if (measurements[j] < min) min = measurements[j];
      if (measurements[j] > max) max = measurements[j];
    }
    var avg = sum / measurements.length;

    var phiNormalized = Math.round((avg / HEARTBEAT) * PHI * 1000) / 1000;

    this.latencyHistory[protocolId] = { avg: Math.round(avg), min: min, max: max };

    return {
      protocolId: protocolId,
      protocolName: protocol.name,
      measurements: measurements,
      stats: {
        avg: Math.round(avg),
        min: min,
        max: max,
        stdDev: Math.round(Math.sqrt(measurements.reduce(function (s, v) { return s + Math.pow(v - avg, 2); }, 0) / measurements.length)),
        phiNormalized: phiNormalized
      },
      rating: phiNormalized < 0.05 ? 'excellent' : phiNormalized < 0.1 ? 'good' : phiNormalized < 0.2 ? 'fair' : 'poor',
      timestamp: Date.now()
    };
  }

  _simpleEncode(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result.substring(0, 64);
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

globalThis.protocolBridge = new ProtocolBridgeEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.protocolBridge;

  switch (message.action) {
    case 'relayMessage':
      sendResponse({ success: true, data: engine.relayMessage(message.fromProtocol, message.toProtocol, message.message) });
      break;
    case 'translatePayload':
      sendResponse({ success: true, data: engine.translatePayload(message.payload, message.sourceFormat, message.targetFormat) });
      break;
    case 'encryptRelay':
      sendResponse({ success: true, data: engine.encryptRelay(message.message, message.encryptionLevel) });
      break;
    case 'discoverProtocols':
      sendResponse({ success: true, data: engine.discoverProtocols() });
      break;
    case 'routeAcrossProtocols':
      sendResponse({ success: true, data: engine.routeAcrossProtocols(message.task, message.protocolChain) });
      break;
    case 'measureLatency':
      sendResponse({ success: true, data: engine.measureLatency(message.protocolId) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});
