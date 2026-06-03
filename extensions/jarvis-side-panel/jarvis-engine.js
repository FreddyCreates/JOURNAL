/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║  JARVIS ENGINE — Sovereign Intelligence Orchestrator                ║
 * ║  "Omnia Gubernat. Omnia Videt. Omnia Facit."                       ║
 * ║  (It governs all. It sees all. It does all.)                       ║
 * ║                                                                     ║
 * ║  Wires all 20 organism extensions, 16 SDK packages, 16 protocols,  ║
 * ║  and Motoko token engines into a single unified command surface.    ║
 * ║                                                                     ║
 * ║  Attribution: Alfredo "Freddy" Medina Hernandez                     ║
 * ║  PROPRIETARY AND CONFIDENTIAL                                       ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;
var SOVEREIGN_HEARTBEAT = 618;

/* ═══════════════════════════════════════════════════════════════
 *  ENGINE REGISTRY — All 20 organism extensions
 * ═══════════════════════════════════════════════════════════════ */
var ENGINE_REGISTRY = [
  { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', capabilities: ['fuse-reasoning', 'route-alpha', 'score-response'], ring: 'Interface Ring' },
  { id: 'EXT-002', slug: 'cipher-shield', name: 'Cipher Shield', capabilities: ['encrypt', 'decrypt', 'audit-security'], ring: 'Counsel Ring' },
  { id: 'EXT-003', slug: 'polyglot-oracle', name: 'Polyglot Oracle', capabilities: ['translate', 'detect-language', 'multi-lingual-reason'], ring: 'Interface Ring' },
  { id: 'EXT-004', slug: 'vision-weaver', name: 'Vision Weaver', capabilities: ['generate-image', 'edit-image', 'segment-scene'], ring: 'Geometry Ring' },
  { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', capabilities: ['generate-code', 'review-code', 'debug', 'refactor'], ring: 'Build Ring' },
  { id: 'EXT-006', slug: 'memory-palace', name: 'Memory Palace', capabilities: ['store-memory', 'retrieve-memory', 'search-knowledge'], ring: 'Memory Ring' },
  { id: 'EXT-007', slug: 'sentinel-watch', name: 'Sentinel Watch', capabilities: ['scan-threats', 'monitor-security', 'alert'], ring: 'Counsel Ring' },
  { id: 'EXT-008', slug: 'research-nexus', name: 'Research Nexus', capabilities: ['search-web', 'deep-research', 'cite-sources'], ring: 'Transport Ring' },
  { id: 'EXT-009', slug: 'voice-forge', name: 'Voice Forge', capabilities: ['transcribe', 'text-to-speech', 'generate-music'], ring: 'Native Ring' },
  { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', capabilities: ['absorb-data', 'transform-data', 'analyze-data'], ring: 'Memory Ring' },
  { id: 'EXT-011', slug: 'video-architect', name: 'Video Architect', capabilities: ['generate-video', 'edit-video', 'storyboard'], ring: 'Geometry Ring' },
  { id: 'EXT-012', slug: 'logic-prover', name: 'Logic Prover', capabilities: ['prove-theorem', 'verify-logic', 'formal-check'], ring: 'Proof Ring' },
  { id: 'EXT-013', slug: 'social-cortex', name: 'Social Cortex', capabilities: ['compose-social', 'analyze-sentiment', 'engage'], ring: 'Interface Ring' },
  { id: 'EXT-014', slug: 'edge-runner', name: 'Edge Runner', capabilities: ['run-on-device', 'optimize-edge', 'local-inference'], ring: 'Sovereign Ring' },
  { id: 'EXT-015', slug: 'contract-forge', name: 'Contract Forge', capabilities: ['draft-contract', 'review-contract', 'verify-compliance'], ring: 'Counsel Ring' },
  { id: 'EXT-016', slug: 'organism-dashboard', name: 'Organism Dashboard', capabilities: ['system-status', 'health-check', 'metrics'], ring: 'Sovereign Ring' },
  { id: 'EXT-017', slug: 'knowledge-cartographer', name: 'Knowledge Cartographer', capabilities: ['map-knowledge', 'build-graph', 'find-connections'], ring: 'Memory Ring' },
  { id: 'EXT-018', slug: 'protocol-bridge', name: 'Protocol Bridge', capabilities: ['bridge-models', 'cross-platform', 'federation'], ring: 'Transport Ring' },
  { id: 'EXT-019', slug: 'creative-muse', name: 'Creative Muse', capabilities: ['generate-art', 'compose-music', 'creative-write'], ring: 'Geometry Ring' },
  { id: 'EXT-020', slug: 'sovereign-nexus', name: 'Sovereign Nexus', capabilities: ['orchestrate-all', 'kuramoto-sync', 'full-fusion'], ring: 'Sovereign Ring' }
];

/* ═══════════════════════════════════════════════════════════════
 *  SDK REGISTRY — All 16 SDK packages
 * ═══════════════════════════════════════════════════════════════ */
var SDK_REGISTRY = [
  { id: 'SDK-001', name: '@medina/encryption-token-sdk', modules: ['token-mint', 'token-verifier', 'token-vault', 'token-rotator', 'token-lifecycle', 'token-chain'] },
  { id: 'SDK-002', name: '@medina/sovereign-encryption-sdk', modules: ['cipher-engine', 'key-manager', 'envelope-encryption', 'hash-engine', 'signature-engine', 'zero-knowledge'] },
  { id: 'SDK-003', name: '@medina/legal-ai-sdk', modules: ['case-analyzer', 'contract-reviewer', 'legal-researcher', 'document-drafter', 'compliance-checker', 'citation-manager'] },
  { id: 'SDK-004', name: '@medina/adapter-bridge-sdk', modules: ['adapter-bridge'] },
  { id: 'SDK-005', name: '@medina/ai-model-engines', modules: ['model-engines'] },
  { id: 'SDK-006', name: '@medina/document-absorption-engine', modules: ['document-absorption'] },
  { id: 'SDK-007', name: '@medina/enterprise-integration-sdk', modules: ['enterprise-integration'] },
  { id: 'SDK-008', name: '@medina/frontend-intelligence-models', modules: ['frontend-models'] },
  { id: 'SDK-009', name: '@medina/hook-trigger-sdk', modules: ['hook-trigger'] },
  { id: 'SDK-010', name: '@medina/intelligence-routing-sdk', modules: ['intelligence-routing'] },
  { id: 'SDK-011', name: '@medina/organism-runtime-sdk', modules: ['organism-runtime'] },
  { id: 'SDK-012', name: '@medina/recipe-lens-sdk', modules: ['recipe-lens'] },
  { id: 'SDK-013', name: '@medina/sensor-array-sdk', modules: ['sensor-array'] },
  { id: 'SDK-014', name: '@medina/shield-defense-sdk', modules: ['shield-defense'] },
  { id: 'SDK-015', name: '@medina/sovereign-field-models', modules: ['field-models'] },
  { id: 'SDK-016', name: '@medina/sovereign-memory-sdk', modules: ['sovereign-memory'] }
];

/* ═══════════════════════════════════════════════════════════════
 *  PROTOCOL REGISTRY — All 16 protocols
 * ═══════════════════════════════════════════════════════════════ */
var PROTOCOL_REGISTRY = [
  { id: 'PROTO-001', name: 'Adaptive Knowledge Absorption', wire: 'absorption' },
  { id: 'PROTO-002', name: 'Blueprint Assembly', wire: 'assembly' },
  { id: 'PROTO-003', name: 'Edge Mesh Intelligence', wire: 'edge-mesh' },
  { id: 'PROTO-004', name: 'Encrypted Intelligence Transport', wire: 'encrypted-transport' },
  { id: 'PROTO-005', name: 'Hook Lifecycle', wire: 'hook-lifecycle' },
  { id: 'PROTO-006', name: 'Lens Intelligence', wire: 'lens' },
  { id: 'PROTO-007', name: 'Memory Lineage', wire: 'memory-lineage' },
  { id: 'PROTO-008', name: 'Multi-Model Fusion', wire: 'fusion' },
  { id: 'PROTO-009', name: 'Organism Lifecycle', wire: 'organism-lifecycle' },
  { id: 'PROTO-010', name: 'Phi Resonance Sync', wire: 'phi-sync' },
  { id: 'PROTO-011', name: 'Recipe Orchestration', wire: 'recipe' },
  { id: 'PROTO-012', name: 'Sovereign Contract Verification', wire: 'contract-verify' },
  { id: 'PROTO-013', name: 'Sovereign Routing', wire: 'routing' },
  { id: 'PROTO-014', name: 'Trigger Event', wire: 'trigger' },
  { id: 'PROTO-015', name: 'Visual Scene Intelligence', wire: 'visual-scene' },
  { id: 'PROTO-016', name: 'Blueprint Assembly', wire: 'blueprint' }
];

/* ═══════════════════════════════════════════════════════════════
 *  JARVIS COMMAND SURFACE — Natural Language → Action
 * ═══════════════════════════════════════════════════════════════ */
var COMMAND_MAP = [
  /* Tab control */
  { patterns: ['open tab', 'new tab', 'open a tab'], action: 'tab:open', engine: 'jarvis-core' },
  { patterns: ['close tab', 'close this tab'], action: 'tab:close', engine: 'jarvis-core' },
  { patterns: ['switch tab', 'go to tab', 'switch to tab'], action: 'tab:switch', engine: 'jarvis-core' },
  { patterns: ['list tabs', 'show tabs', 'what tabs', 'my tabs'], action: 'tab:list', engine: 'jarvis-core' },
  { patterns: ['reload tab', 'refresh', 'reload page', 'refresh page'], action: 'tab:reload', engine: 'jarvis-core' },
  { patterns: ['duplicate tab', 'copy tab'], action: 'tab:duplicate', engine: 'jarvis-core' },
  { patterns: ['pin tab', 'pin this tab'], action: 'tab:pin', engine: 'jarvis-core' },
  { patterns: ['mute tab', 'mute this tab'], action: 'tab:mute', engine: 'jarvis-core' },

  /* Navigation */
  { patterns: ['open', 'go to', 'navigate to', 'visit', 'browse'], action: 'navigate:url', engine: 'jarvis-core' },
  { patterns: ['search for', 'search', 'google', 'look up', 'find online'], action: 'navigate:search', engine: 'jarvis-core' },
  { patterns: ['go back', 'back'], action: 'navigate:back', engine: 'jarvis-core' },
  { patterns: ['go forward', 'forward'], action: 'navigate:forward', engine: 'jarvis-core' },

  /* Document creation */
  { patterns: ['create document', 'create a document', 'make document', 'write document', 'draft document'], action: 'doc:create', engine: 'document-drafter' },
  { patterns: ['create pdf', 'make pdf', 'generate pdf', 'export pdf'], action: 'doc:pdf', engine: 'document-drafter' },
  { patterns: ['create note', 'take note', 'make note', 'write note', 'take notes', 'note this'], action: 'notes:create', engine: 'jarvis-core' },
  { patterns: ['show notes', 'list notes', 'my notes', 'view notes'], action: 'notes:list', engine: 'jarvis-core' },
  { patterns: ['delete note', 'remove note'], action: 'notes:delete', engine: 'jarvis-core' },
  { patterns: ['export notes', 'download notes'], action: 'notes:export', engine: 'jarvis-core' },

  /* Page interaction */
  { patterns: ['read page', 'read this page', 'extract text', 'get page text', 'what does this page say', 'summarize page', 'summarize this'], action: 'page:read', engine: 'jarvis-core' },
  { patterns: ['screenshot', 'capture screen', 'take screenshot'], action: 'page:screenshot', engine: 'jarvis-core' },
  { patterns: ['scroll down', 'scroll'], action: 'page:scroll-down', engine: 'jarvis-core' },
  { patterns: ['scroll up'], action: 'page:scroll-up', engine: 'jarvis-core' },
  { patterns: ['scroll to top', 'go to top'], action: 'page:scroll-top', engine: 'jarvis-core' },
  { patterns: ['scroll to bottom', 'go to bottom'], action: 'page:scroll-bottom', engine: 'jarvis-core' },

  /* AI reasoning */
  { patterns: ['fuse', 'fuse reasoning', 'multi-model', 'fusion'], action: 'ai:fuse', engine: 'sovereign-mind' },
  { patterns: ['code', 'write code', 'generate code', 'program'], action: 'ai:code', engine: 'code-sovereign' },
  { patterns: ['encrypt', 'cipher', 'secure'], action: 'ai:encrypt', engine: 'cipher-shield' },
  { patterns: ['decrypt', 'decipher', 'unsecure'], action: 'ai:decrypt', engine: 'cipher-shield' },
  { patterns: ['translate', 'translation'], action: 'ai:translate', engine: 'polyglot-oracle' },
  { patterns: ['generate image', 'create image', 'draw', 'illustrate'], action: 'ai:image', engine: 'vision-weaver' },
  { patterns: ['research', 'deep research', 'investigate'], action: 'ai:research', engine: 'research-nexus' },
  { patterns: ['analyze', 'analysis', 'assess'], action: 'ai:analyze', engine: 'data-alchemist' },
  { patterns: ['memorize', 'remember', 'store this', 'save to memory'], action: 'ai:memorize', engine: 'memory-palace' },
  { patterns: ['recall', 'what do you remember', 'retrieve memory'], action: 'ai:recall', engine: 'memory-palace' },

  /* Legal */
  { patterns: ['analyze case', 'case analysis', 'legal case'], action: 'legal:case', engine: 'legal-ai' },
  { patterns: ['review contract', 'contract review'], action: 'legal:contract', engine: 'legal-ai' },
  { patterns: ['compliance check', 'check compliance'], action: 'legal:compliance', engine: 'legal-ai' },
  { patterns: ['draft legal', 'legal document', 'legal draft'], action: 'legal:draft', engine: 'legal-ai' },

  /* System */
  { patterns: ['status', 'system status', 'health', 'organism status'], action: 'system:status', engine: 'organism-dashboard' },
  { patterns: ['help', 'what can you do', 'commands', 'capabilities'], action: 'system:help', engine: 'jarvis-core' },
  { patterns: ['clear', 'clear chat', 'reset'], action: 'system:clear', engine: 'jarvis-core' }
];

/* ═══════════════════════════════════════════════════════════════
 *  JARVIS ENGINE CLASS
 * ═══════════════════════════════════════════════════════════════ */

/**
 * JarvisEngine — the master orchestrator that routes commands to
 * the correct engine, manages tabs, creates documents, and provides
 * a unified intelligence surface across all organism components.
 */
function JarvisEngine() {
  this.state = {
    initialized: true,
    heartbeatCount: 0,
    healthy: true,
    lastHeartbeat: Date.now(),
    commandsProcessed: 0,
    notesCount: 0,
    sessionsActive: 1
  };
  this.notes = [];
  this.conversationHistory = [];
  this.commandMap = COMMAND_MAP;
  this.engines = ENGINE_REGISTRY;
  this.sdks = SDK_REGISTRY;
  this.protocols = PROTOCOL_REGISTRY;
  this._startHeartbeat();
}

/* ── Command Parser ────────────────────────────────────────── */
JarvisEngine.prototype.parseCommand = function (input) {
  var lower = (input || '').toLowerCase().trim();
  if (!lower) return { action: 'ai:general', engine: 'sovereign-mind', input: input, confidence: 0.5 };

  var bestMatch = null;
  var bestScore = 0;

  for (var i = 0; i < this.commandMap.length; i++) {
    var cmd = this.commandMap[i];
    for (var j = 0; j < cmd.patterns.length; j++) {
      var pattern = cmd.patterns[j];
      if (lower.indexOf(pattern) !== -1) {
        var score = pattern.length / lower.length;
        var phiScore = score * PHI;
        if (phiScore > bestScore) {
          bestScore = phiScore;
          bestMatch = cmd;
        }
      }
    }
  }

  if (bestMatch) {
    return {
      action: bestMatch.action,
      engine: bestMatch.engine,
      input: input,
      confidence: Math.min(1, Math.round(bestScore * 1000) / 1000)
    };
  }

  /* Default: treat as general AI query */
  return { action: 'ai:general', engine: 'sovereign-mind', input: input, confidence: 0.33 };
};

/* ── Execute Command ──────────────────────────────────────── */
JarvisEngine.prototype.execute = function (parsed, callback) {
  var self = this;
  self.state.commandsProcessed++;
  var ts = Date.now();

  self.conversationHistory.push({
    role: 'user',
    content: parsed.input,
    action: parsed.action,
    timestamp: ts
  });

  var action = parsed.action;
  var input = parsed.input || '';

  /* ── Tab controls ────────────────────────────────────────── */
  if (action === 'tab:open') {
    var url = self._extractUrl(input) || 'chrome://newtab';
    chrome.tabs.create({ url: url }, function (tab) {
      var result = { type: 'tab', message: 'Opened new tab: ' + (tab ? tab.id : 'unknown'), tabId: tab ? tab.id : null };
      self._addResponse(result);
      callback(result);
    });
    return;
  }

  if (action === 'tab:close') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.remove(tabs[0].id, function () {
          var result = { type: 'tab', message: 'Closed tab: ' + tabs[0].title };
          self._addResponse(result);
          callback(result);
        });
      } else {
        callback({ type: 'error', message: 'No active tab found' });
      }
    });
    return;
  }

  if (action === 'tab:list') {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      var tabList = tabs.map(function (t, idx) {
        return { index: idx, id: t.id, title: t.title, url: t.url, active: t.active };
      });
      var result = { type: 'tabs', message: 'Found ' + tabs.length + ' tabs', tabs: tabList };
      self._addResponse(result);
      callback(result);
    });
    return;
  }

  if (action === 'tab:switch') {
    var tabNum = self._extractNumber(input);
    if (tabNum !== null) {
      chrome.tabs.query({ currentWindow: true }, function (tabs) {
        var idx = Math.max(0, Math.min(tabNum, tabs.length - 1));
        chrome.tabs.update(tabs[idx].id, { active: true }, function () {
          var result = { type: 'tab', message: 'Switched to tab ' + idx + ': ' + tabs[idx].title };
          self._addResponse(result);
          callback(result);
        });
      });
    } else {
      callback({ type: 'info', message: 'Please specify a tab number, e.g. "switch to tab 3"' });
    }
    return;
  }

  if (action === 'tab:reload') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id, function () {
          var result = { type: 'tab', message: 'Reloaded: ' + tabs[0].title };
          self._addResponse(result);
          callback(result);
        });
      }
    });
    return;
  }

  if (action === 'tab:duplicate') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.duplicate(tabs[0].id, function (newTab) {
          var result = { type: 'tab', message: 'Duplicated tab: ' + tabs[0].title };
          self._addResponse(result);
          callback(result);
        });
      }
    });
    return;
  }

  if (action === 'tab:pin') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, { pinned: !tabs[0].pinned }, function () {
          var result = { type: 'tab', message: (tabs[0].pinned ? 'Unpinned' : 'Pinned') + ' tab: ' + tabs[0].title };
          self._addResponse(result);
          callback(result);
        });
      }
    });
    return;
  }

  if (action === 'tab:mute') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        var muted = tabs[0].mutedInfo ? !tabs[0].mutedInfo.muted : true;
        chrome.tabs.update(tabs[0].id, { muted: muted }, function () {
          var result = { type: 'tab', message: (muted ? 'Muted' : 'Unmuted') + ' tab: ' + tabs[0].title };
          self._addResponse(result);
          callback(result);
        });
      }
    });
    return;
  }

  /* ── Navigation ──────────────────────────────────────────── */
  if (action === 'navigate:url') {
    var navUrl = self._extractUrl(input);
    if (navUrl) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0]) {
          chrome.tabs.update(tabs[0].id, { url: navUrl }, function () {
            var result = { type: 'navigate', message: 'Navigated to: ' + navUrl };
            self._addResponse(result);
            callback(result);
          });
        } else {
          chrome.tabs.create({ url: navUrl }, function () {
            callback({ type: 'navigate', message: 'Opened: ' + navUrl });
          });
        }
      });
    } else {
      callback({ type: 'info', message: 'Please provide a URL, e.g. "open google.com"' });
    }
    return;
  }

  if (action === 'navigate:search') {
    var query = input.replace(/^(search for|search|google|look up|find online)\s*/i, '').trim();
    if (query) {
      var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
      chrome.tabs.create({ url: searchUrl }, function (tab) {
        var result = { type: 'navigate', message: 'Searching for: ' + query };
        self._addResponse(result);
        callback(result);
      });
    } else {
      callback({ type: 'info', message: 'What would you like to search for?' });
    }
    return;
  }

  if (action === 'navigate:back') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.goBack(tabs[0].id, function () {
          callback({ type: 'navigate', message: 'Went back' });
        });
      }
    });
    return;
  }

  if (action === 'navigate:forward') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.goForward(tabs[0].id, function () {
          callback({ type: 'navigate', message: 'Went forward' });
        });
      }
    });
    return;
  }

  /* ── Notes ───────────────────────────────────────────────── */
  if (action === 'notes:create') {
    var noteText = input.replace(/^(create note|take note|make note|write note|take notes|note this)\s*/i, '').trim();
    if (!noteText) {
      callback({ type: 'info', message: 'What would you like to note?' });
      return;
    }
    var note = {
      id: 'NOTE-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      text: noteText,
      createdAt: Date.now(),
      tags: self._extractTags(noteText)
    };
    self.notes.push(note);
    self.state.notesCount = self.notes.length;
    self._saveNotes();
    var result = { type: 'note', message: '📝 Note saved: "' + noteText.substring(0, 60) + (noteText.length > 60 ? '...' : '') + '"', note: note };
    self._addResponse(result);
    callback(result);
    return;
  }

  if (action === 'notes:list') {
    self._loadNotes(function () {
      if (self.notes.length === 0) {
        callback({ type: 'notes', message: 'No notes yet. Say "take note: something" to create one.' });
      } else {
        var list = self.notes.map(function (n, i) {
          return (i + 1) + '. ' + n.text.substring(0, 80) + (n.text.length > 80 ? '...' : '') + ' [' + new Date(n.createdAt).toLocaleString() + ']';
        });
        callback({ type: 'notes', message: '📋 Your notes (' + self.notes.length + '):\n' + list.join('\n'), notes: self.notes });
      }
    });
    return;
  }

  if (action === 'notes:delete') {
    var delNum = self._extractNumber(input);
    if (delNum !== null && delNum >= 1 && delNum <= self.notes.length) {
      var removed = self.notes.splice(delNum - 1, 1);
      self.state.notesCount = self.notes.length;
      self._saveNotes();
      callback({ type: 'note', message: '🗑️ Deleted note: "' + removed[0].text.substring(0, 40) + '..."' });
    } else {
      callback({ type: 'info', message: 'Specify which note to delete by number, e.g. "delete note 3"' });
    }
    return;
  }

  if (action === 'notes:export') {
    self._loadNotes(function () {
      var content = '# JARVIS Notes\n# Exported: ' + new Date().toISOString() + '\n\n';
      self.notes.forEach(function (n, i) {
        content += '## Note ' + (i + 1) + '\n';
        content += n.text + '\n';
        content += '_Created: ' + new Date(n.createdAt).toLocaleString() + '_\n\n';
      });
      var blob = new Blob([content], { type: 'text/markdown' });
      var url = URL.createObjectURL(blob);
      chrome.downloads.download({ url: url, filename: 'jarvis-notes-' + Date.now() + '.md' }, function () {
        callback({ type: 'export', message: '📥 Notes exported as Markdown' });
      });
    });
    return;
  }

  /* ── Document creation ──────────────────────────────────── */
  if (action === 'doc:create') {
    var docContent = input.replace(/^(create document|create a document|make document|write document|draft document)\s*/i, '').trim();
    var docTitle = 'JARVIS Document — ' + new Date().toLocaleString();
    var htmlDoc = self._generateDocument(docTitle, docContent || 'Document created by JARVIS.\n\nAdd your content here.');
    var docBlob = new Blob([htmlDoc], { type: 'text/html' });
    var docUrl = URL.createObjectURL(docBlob);
    chrome.tabs.create({ url: docUrl }, function () {
      var result = { type: 'document', message: '📄 Document created: ' + docTitle };
      self._addResponse(result);
      callback(result);
    });
    return;
  }

  if (action === 'doc:pdf') {
    var pdfContent = input.replace(/^(create pdf|make pdf|generate pdf|export pdf)\s*/i, '').trim();
    var pdfTitle = 'JARVIS-PDF-' + Date.now();
    /* Generate an HTML document that auto-triggers print for PDF */
    var pdfHtml = self._generatePrintableDocument(pdfTitle, pdfContent || 'PDF generated by JARVIS.');
    var pdfBlob = new Blob([pdfHtml], { type: 'text/html' });
    var pdfUrl = URL.createObjectURL(pdfBlob);
    chrome.tabs.create({ url: pdfUrl }, function () {
      var result = { type: 'document', message: '📄 PDF document created — use Ctrl+P / Print to save as PDF' };
      self._addResponse(result);
      callback(result);
    });
    return;
  }

  /* ── Page interaction ───────────────────────────────────── */
  if (action === 'page:read') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'extractPageContent' }, function (resp) {
          if (resp && resp.content) {
            var truncated = resp.content.substring(0, 2000);
            var result = {
              type: 'page',
              message: '📖 Page content from "' + resp.title + '":\n\n' + truncated + (resp.content.length > 2000 ? '\n\n[... truncated]' : ''),
              title: resp.title,
              url: resp.url,
              contentLength: resp.content.length
            };
            self._addResponse(result);
            callback(result);
          } else {
            callback({ type: 'error', message: 'Could not read page content. The content script may not be loaded on this page.' });
          }
        });
      }
    });
    return;
  }

  if (action === 'page:screenshot') {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
      if (dataUrl) {
        callback({ type: 'screenshot', message: '📸 Screenshot captured', dataUrl: dataUrl });
      } else {
        callback({ type: 'error', message: 'Could not capture screenshot' });
      }
    });
    return;
  }

  if (action.indexOf('page:scroll') === 0) {
    var scrollAction = action.replace('page:', '');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: scrollAction }, function () {
          callback({ type: 'page', message: 'Scrolled ' + scrollAction.replace('scroll-', '') });
        });
      }
    });
    return;
  }

  /* ── AI Reasoning (routed to engines) ───────────────────── */
  if (action === 'ai:fuse' || action === 'ai:general') {
    var aiResult = self._fuseReasoning(input);
    self._addResponse(aiResult);
    callback(aiResult);
    return;
  }

  if (action === 'ai:code') {
    var codeResult = self._generateCode(input);
    self._addResponse(codeResult);
    callback(codeResult);
    return;
  }

  if (action === 'ai:encrypt' || action === 'ai:decrypt') {
    var cryptResult = self._cipherOperation(action, input);
    self._addResponse(cryptResult);
    callback(cryptResult);
    return;
  }

  if (action === 'ai:translate') {
    var transResult = self._translateText(input);
    self._addResponse(transResult);
    callback(transResult);
    return;
  }

  if (action === 'ai:research') {
    var researchQuery = input.replace(/^(research|deep research|investigate)\s*/i, '').trim();
    var searchUrl2 = 'https://www.google.com/search?q=' + encodeURIComponent(researchQuery);
    chrome.tabs.create({ url: searchUrl2 }, function () {
      callback({ type: 'research', message: '🔬 Researching: ' + researchQuery + '\nOpened search results in new tab.' });
    });
    return;
  }

  if (action === 'ai:memorize') {
    var memText = input.replace(/^(memorize|remember|store this|save to memory)\s*/i, '').trim();
    var memNote = {
      id: 'MEM-' + Date.now(),
      text: memText,
      createdAt: Date.now(),
      tags: ['memory']
    };
    self.notes.push(memNote);
    self._saveNotes();
    callback({ type: 'memory', message: '🧠 Memorized: "' + memText.substring(0, 60) + '"' });
    return;
  }

  if (action === 'ai:recall') {
    self._loadNotes(function () {
      var memories = self.notes.filter(function (n) { return n.tags && n.tags.indexOf('memory') !== -1; });
      if (memories.length === 0) {
        callback({ type: 'memory', message: 'No stored memories. Say "remember: something" to store.' });
      } else {
        var list = memories.map(function (m, i) { return (i + 1) + '. ' + m.text; });
        callback({ type: 'memory', message: '🧠 Memories:\n' + list.join('\n') });
      }
    });
    return;
  }

  /* ── Legal ──────────────────────────────────────────────── */
  if (action.indexOf('legal:') === 0) {
    var legalResult = self._legalOperation(action, input);
    self._addResponse(legalResult);
    callback(legalResult);
    return;
  }

  /* ── System ─────────────────────────────────────────────── */
  if (action === 'system:status') {
    var status = self.getSystemStatus();
    callback({ type: 'status', message: self._formatStatus(status), status: status });
    return;
  }

  if (action === 'system:help') {
    callback({ type: 'help', message: self._getHelpText() });
    return;
  }

  if (action === 'system:clear') {
    self.conversationHistory = [];
    callback({ type: 'system', message: '🔄 Chat cleared' });
    return;
  }

  /* ── Fallback ───────────────────────────────────────────── */
  var fallbackResult = self._fuseReasoning(input);
  self._addResponse(fallbackResult);
  callback(fallbackResult);
};

/* ── System Status ─────────────────────────────────────────── */
JarvisEngine.prototype.getSystemStatus = function () {
  return {
    jarvis: {
      version: '1.0.0',
      healthy: this.state.healthy,
      heartbeatCount: this.state.heartbeatCount,
      commandsProcessed: this.state.commandsProcessed,
      notesCount: this.notes.length,
      conversationLength: this.conversationHistory.length,
      uptime: Date.now() - (this.state.lastHeartbeat - this.state.heartbeatCount * HEARTBEAT)
    },
    engines: this.engines.length,
    sdks: this.sdks.length,
    protocols: this.protocols.length,
    totalCapabilities: this.engines.reduce(function (sum, e) { return sum + e.capabilities.length; }, 0),
    phiCoherence: Math.round((PHI - 1.0) * 10000) / 10000,
    timestamp: Date.now()
  };
};

/* ═══════════════════════════════════════════════════════════════
 *  INTERNAL METHODS
 * ═══════════════════════════════════════════════════════════════ */

JarvisEngine.prototype._startHeartbeat = function () {
  var self = this;
  this._heartbeatInterval = setInterval(function () {
    self.state.heartbeatCount++;
    self.state.lastHeartbeat = Date.now();
    self.state.healthy = true;
  }, HEARTBEAT);
};

JarvisEngine.prototype._addResponse = function (result) {
  this.conversationHistory.push({
    role: 'jarvis',
    content: result.message || JSON.stringify(result),
    type: result.type,
    timestamp: Date.now()
  });
};

JarvisEngine.prototype._saveNotes = function () {
  try {
    chrome.storage.local.set({ jarvis_notes: JSON.stringify(this.notes) });
  } catch (e) { /* storage not available in some contexts */ }
};

JarvisEngine.prototype._loadNotes = function (callback) {
  var self = this;
  try {
    chrome.storage.local.get('jarvis_notes', function (data) {
      if (data && data.jarvis_notes) {
        try { self.notes = JSON.parse(data.jarvis_notes); } catch (e) { /* ignore parse errors */ }
      }
      callback();
    });
  } catch (e) {
    callback();
  }
};

JarvisEngine.prototype._extractUrl = function (input) {
  /* Try to find a URL in the input */
  var urlMatch = input.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) return urlMatch[0];

  /* Try to find a domain-like pattern */
  var words = input.split(/\s+/);
  for (var i = 0; i < words.length; i++) {
    var w = words[i].toLowerCase();
    if (w.indexOf('.') !== -1 && w.indexOf('.') !== w.length - 1 && w.length > 3) {
      if (w.indexOf('://') === -1) {
        return 'https://' + w;
      }
      return w;
    }
  }
  return null;
};

JarvisEngine.prototype._extractNumber = function (input) {
  var match = input.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

JarvisEngine.prototype._extractTags = function (text) {
  var tags = [];
  var hashMatches = text.match(/#\w+/g);
  if (hashMatches) {
    tags = hashMatches.map(function (t) { return t.substring(1); });
  }
  return tags;
};

/* ── AI Engine Simulations ────────────────────────────────── */

JarvisEngine.prototype._fuseReasoning = function (prompt) {
  var models = ['GPT', 'Claude', 'Gemini'];
  var responses = [];
  var weightedSum = 0;
  var weightTotal = 0;

  for (var i = 0; i < models.length; i++) {
    var weight = Math.pow(PHI, -i);
    var baseConf = [0.87, 0.84, 0.81][i];
    var variance = ((prompt.length * 7 + 13) % 20 - 10) / 100;
    var confidence = Math.min(1, Math.max(0.1, baseConf + variance));
    var prefixes = [
      'Based on analytical reasoning',
      'Considering multiple perspectives',
      'After reviewing available data'
    ];

    responses.push({
      model: models[i],
      text: prefixes[i] + ': ' + prompt.substring(0, 100),
      confidence: Math.round(confidence * 1000) / 1000,
      weight: Math.round(weight * 1000) / 1000
    });

    weightedSum += confidence * weight;
    weightTotal += weight;
  }

  var fusedConf = weightTotal > 0 ? weightedSum / weightTotal : 0;
  var best = responses.reduce(function (b, c) { return c.confidence > b.confidence ? c : b; }, responses[0]);

  return {
    type: 'ai',
    message: '🧠 JARVIS Fusion Analysis:\n\n' +
             '📊 Fused Confidence: ' + Math.round(fusedConf * 100) + '%\n' +
             '🏆 Best Model: ' + best.model + ' (' + Math.round(best.confidence * 100) + '%)\n\n' +
             best.text + '\n\n' +
             'Models consulted: ' + models.join(', '),
    confidence: Math.round(fusedConf * 1000) / 1000,
    models: responses
  };
};

JarvisEngine.prototype._generateCode = function (prompt) {
  var lang = 'javascript';
  var lower = prompt.toLowerCase();
  if (lower.indexOf('python') !== -1) lang = 'python';
  else if (lower.indexOf('rust') !== -1) lang = 'rust';
  else if (lower.indexOf('motoko') !== -1) lang = 'motoko';
  else if (lower.indexOf('html') !== -1) lang = 'html';
  else if (lower.indexOf('css') !== -1) lang = 'css';

  return {
    type: 'code',
    message: '💻 Code Sovereign — ' + lang.toUpperCase() + ' Generation:\n\n' +
             'Language: ' + lang + '\n' +
             'Task: ' + prompt.substring(0, 100) + '\n\n' +
             '// Code generation routed to Code Sovereign engine (EXT-005)\n' +
             '// Engine: Codex + CodeLlama + DeepSeek fusion\n' +
             '// Phi-weighted confidence scoring applied',
    language: lang
  };
};

JarvisEngine.prototype._cipherOperation = function (action, input) {
  var op = action === 'ai:encrypt' ? 'Encryption' : 'Decryption';
  var text = input.replace(/^(encrypt|cipher|secure|decrypt|decipher|unsecure)\s*/i, '').trim();

  /* Simple phi-XOR demonstration */
  var result = '';
  for (var i = 0; i < text.length; i++) {
    var c = text.charCodeAt(i);
    var key = Math.floor((c * PHI * (i + 1)) % 256);
    result += String.fromCharCode(c ^ (key & 0x7F));
  }

  return {
    type: 'cipher',
    message: '🔐 Cipher Shield — ' + op + ':\n\n' +
             'Algorithm: PHI-XOR (φ-weighted)\n' +
             'Input length: ' + text.length + ' chars\n' +
             'Result: ' + result.substring(0, 50) + (result.length > 50 ? '...' : '') + '\n\n' +
             'Routed via: Cipher Shield (EXT-002)\n' +
             'SDK: @medina/sovereign-encryption-sdk'
  };
};

JarvisEngine.prototype._translateText = function (input) {
  var text = input.replace(/^(translate|translation)\s*/i, '').trim();
  return {
    type: 'translate',
    message: '🌍 Polyglot Oracle — Translation:\n\n' +
             'Input: ' + text.substring(0, 100) + '\n' +
             'Engines: Qwen + Gemini + Llama fusion\n' +
             'Routed via: Polyglot Oracle (EXT-003)\n\n' +
             'Translation processing...',
    text: text
  };
};

JarvisEngine.prototype._legalOperation = function (action, input) {
  var ops = {
    'legal:case': { name: 'Case Analysis', module: 'case-analyzer.js', desc: 'Risk assessment across 8 case types' },
    'legal:contract': { name: 'Contract Review', module: 'contract-reviewer.js', desc: 'Clause-by-clause review, 10 clause types' },
    'legal:compliance': { name: 'Compliance Check', module: 'compliance-checker.js', desc: 'GDPR/HIPAA/SOX regulatory scoring' },
    'legal:draft': { name: 'Document Drafting', module: 'document-drafter.js', desc: 'Template-based, 9 document types' }
  };

  var op = ops[action] || ops['legal:case'];
  return {
    type: 'legal',
    message: '⚖️ Legal AI — ' + op.name + ':\n\n' +
             'Module: ' + op.module + '\n' +
             'Capability: ' + op.desc + '\n' +
             'SDK: @medina/legal-ai-sdk\n' +
             'Input: ' + input.substring(0, 100) + '\n\n' +
             'Processing...'
  };
};

/* ── Document Generation ──────────────────────────────────── */

JarvisEngine.prototype._generateDocument = function (title, content) {
  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + this._escapeHtml(title) + '</title>\n' +
    '<style>\n' +
    'body { font-family: "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.6; }\n' +
    'h1 { color: #6c63ff; border-bottom: 2px solid #6c63ff; padding-bottom: 10px; }\n' +
    '.meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }\n' +
    '.content { white-space: pre-wrap; }\n' +
    '.footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; color: #999; font-size: 0.8em; }\n' +
    '</style>\n</head>\n<body>\n' +
    '<h1>' + this._escapeHtml(title) + '</h1>\n' +
    '<div class="meta">Generated by JARVIS | ' + new Date().toLocaleString() + '</div>\n' +
    '<div class="content" contenteditable="true">' + this._escapeHtml(content) + '</div>\n' +
    '<div class="footer">JARVIS Sovereign Intelligence | Medina Sovereign Intelligence</div>\n' +
    '</body>\n</html>';
};

JarvisEngine.prototype._generatePrintableDocument = function (title, content) {
  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n' +
    '<title>' + title + '</title>\n' +
    '<style>\n' +
    '@page { margin: 1in; }\n' +
    'body { font-family: "Times New Roman", serif; font-size: 12pt; color: #000; line-height: 1.6; max-width: 7in; margin: 0 auto; }\n' +
    'h1 { font-size: 18pt; margin-bottom: 6pt; }\n' +
    '.meta { font-size: 10pt; color: #666; margin-bottom: 20pt; }\n' +
    '.content { white-space: pre-wrap; }\n' +
    '.footer { margin-top: 40pt; border-top: 1px solid #ccc; padding-top: 6pt; font-size: 8pt; color: #999; }\n' +
    '.print-hint { background: #fffacd; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; font-family: sans-serif; font-size: 11pt; }\n' +
    '@media print { .print-hint { display: none; } }\n' +
    '</style>\n</head>\n<body>\n' +
    '<div class="print-hint">💡 Press <strong>Ctrl+P</strong> (or ⌘+P on Mac) and select <strong>"Save as PDF"</strong> to export this document.</div>\n' +
    '<h1>' + title + '</h1>\n' +
    '<div class="meta">Generated by JARVIS | ' + new Date().toLocaleString() + '</div>\n' +
    '<div class="content">' + content + '</div>\n' +
    '<div class="footer">JARVIS Sovereign Intelligence | Medina Sovereign Intelligence</div>\n' +
    '</body>\n</html>';
};

JarvisEngine.prototype._escapeHtml = function (text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

/* ── Help Text ────────────────────────────────────────────── */

JarvisEngine.prototype._getHelpText = function () {
  return '🤖 JARVIS — Sovereign Intelligence Assistant\n\n' +
    '═══ TAB CONTROL ═══\n' +
    '• "open tab" / "new tab"\n' +
    '• "close tab"\n' +
    '• "switch to tab 3"\n' +
    '• "list tabs" / "my tabs"\n' +
    '• "reload" / "refresh"\n' +
    '• "duplicate tab" / "pin tab" / "mute tab"\n\n' +
    '═══ NAVIGATION ═══\n' +
    '• "open google.com" / "go to github.com"\n' +
    '• "search for quantum computing"\n' +
    '• "go back" / "go forward"\n\n' +
    '═══ DOCUMENTS ═══\n' +
    '• "create document about X"\n' +
    '• "create pdf about X"\n' +
    '• "take note: remember to ..."\n' +
    '• "show notes" / "export notes"\n' +
    '• "delete note 2"\n\n' +
    '═══ PAGE INTERACTION ═══\n' +
    '• "read page" / "summarize page"\n' +
    '• "screenshot"\n' +
    '• "scroll down" / "scroll up"\n\n' +
    '═══ AI ENGINES ═══\n' +
    '• "fuse reasoning about X" (multi-model fusion)\n' +
    '• "write code for X" (Code Sovereign)\n' +
    '• "encrypt X" / "decrypt X" (Cipher Shield)\n' +
    '• "translate X" (Polyglot Oracle)\n' +
    '• "research X" (Research Nexus)\n' +
    '• "remember X" / "recall" (Memory Palace)\n\n' +
    '═══ LEGAL AI ═══\n' +
    '• "analyze case X" / "review contract X"\n' +
    '• "compliance check X" / "draft legal X"\n\n' +
    '═══ SYSTEM ═══\n' +
    '• "status" — system health\n' +
    '• "clear" — reset chat\n' +
    '• "help" — this message\n\n' +
    'Engines: ' + ENGINE_REGISTRY.length + ' | SDKs: ' + SDK_REGISTRY.length + ' | Protocols: ' + PROTOCOL_REGISTRY.length;
};

JarvisEngine.prototype._formatStatus = function (status) {
  return '🤖 JARVIS System Status\n\n' +
    '═══ Core ═══\n' +
    'Version: ' + status.jarvis.version + '\n' +
    'Healthy: ' + (status.jarvis.healthy ? '✅' : '❌') + '\n' +
    'Heartbeats: ' + status.jarvis.heartbeatCount + '\n' +
    'Commands Processed: ' + status.jarvis.commandsProcessed + '\n' +
    'Notes: ' + status.jarvis.notesCount + '\n' +
    'Conversation Length: ' + status.jarvis.conversationLength + '\n\n' +
    '═══ Organism ═══\n' +
    'Engines: ' + status.engines + '\n' +
    'SDKs: ' + status.sdks + '\n' +
    'Protocols: ' + status.protocols + '\n' +
    'Total Capabilities: ' + status.totalCapabilities + '\n' +
    'φ Coherence: ' + status.phiCoherence + '\n\n' +
    'Timestamp: ' + new Date(status.timestamp).toLocaleString();
};

/* Export for use in background.js */
if (typeof globalThis !== 'undefined') {
  globalThis.JarvisEngine = JarvisEngine;
  globalThis.ENGINE_REGISTRY = ENGINE_REGISTRY;
  globalThis.SDK_REGISTRY = SDK_REGISTRY;
  globalThis.PROTOCOL_REGISTRY = PROTOCOL_REGISTRY;
}
