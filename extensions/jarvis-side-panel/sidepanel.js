/**
 * JARVIS — Side Panel UI Logic (EXT-021)
 *
 * Manages the chat interface, tab viewer, notes manager,
 * and engines dashboard within the side panel.
 *
 * Attribution: Alfredo "Freddy" Medina Hernandez
 * PROPRIETARY AND CONFIDENTIAL
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
   *  DOM References
   * ═══════════════════════════════════════════════════════════ */
  var chatMessages = document.getElementById('chat-messages');
  var chatInput = document.getElementById('chat-input');
  var sendBtn = document.getElementById('send-btn');
  var tabsList = document.getElementById('tabs-list');
  var notesList = document.getElementById('notes-list');
  var noteInput = document.getElementById('note-input');
  var saveNoteBtn = document.getElementById('save-note-btn');
  var enginesList = document.getElementById('engines-list');

  /* ═══════════════════════════════════════════════════════════
   *  Tab Bar Navigation
   * ═══════════════════════════════════════════════════════════ */
  var tabButtons = document.querySelectorAll('.tab-btn');
  var panelViews = document.querySelectorAll('.panel-view');

  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var viewId = btn.getAttribute('data-view');

      tabButtons.forEach(function (b) { b.classList.remove('active'); });
      panelViews.forEach(function (v) { v.classList.remove('active'); });

      btn.classList.add('active');
      document.getElementById('view-' + viewId).classList.add('active');

      /* Auto-refresh on tab switch */
      if (viewId === 'tabs') refreshBrowserTabs();
      if (viewId === 'notes') refreshNotes();
      if (viewId === 'engines') renderEngines();
    });
  });

  /* ═══════════════════════════════════════════════════════════
   *  Chat Functionality
   * ═══════════════════════════════════════════════════════════ */

  function sendMessage() {
    var input = chatInput.value.trim();
    if (!input) return;

    addChatMessage('user', input);
    chatInput.value = '';
    chatInput.style.height = '40px';

    /* Show thinking indicator */
    var thinkingId = addChatMessage('jarvis', '⏳ Processing...');

    chrome.runtime.sendMessage(
      { source: 'jarvis-panel', action: 'execute', input: input },
      function (response) {
        removeChatMessage(thinkingId);

        if (response && response.success && response.data) {
          var data = response.data;
          var msgText = (data.type ? '[' + data.type.toUpperCase() + '] ' : '') +
                        (data.message || JSON.stringify(data, null, 2));

          addChatMessage('jarvis', msgText);

          /* Handle screenshot data */
          if (data.type === 'screenshot' && data.dataUrl) {
            var img = document.createElement('img');
            img.src = data.dataUrl;
            img.className = 'screenshot-preview';
            var lastMsg = chatMessages.lastElementChild;
            if (lastMsg) lastMsg.appendChild(img);
          }
        } else {
          addChatMessage('jarvis', '❌ Error: ' + ((response && response.error) || 'No response'));
        }
      }
    );
  }

  sendBtn.addEventListener('click', sendMessage);

  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* Auto-resize textarea */
  chatInput.addEventListener('input', function () {
    this.style.height = '40px';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  /* Quick action buttons */
  document.querySelectorAll('.quick-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      chatInput.value = btn.getAttribute('data-cmd');
      sendMessage();
    });
  });

  /* Header buttons */
  document.getElementById('btn-status').addEventListener('click', function () {
    chatInput.value = 'status';
    sendMessage();
  });

  document.getElementById('btn-help').addEventListener('click', function () {
    chatInput.value = 'help';
    sendMessage();
  });

  var messageIdCounter = 0;

  function addChatMessage(role, text) {
    var div = document.createElement('div');
    var id = 'msg-' + (++messageIdCounter);
    div.id = id;
    div.className = 'message ' + role;
    /* Use textContent to prevent XSS — no raw HTML injection */
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
  }

  function removeChatMessage(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  /* ═══════════════════════════════════════════════════════════
   *  Browser Tabs Management
   * ═══════════════════════════════════════════════════════════ */

  function refreshBrowserTabs() {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      tabsList.innerHTML = '';
      tabs.forEach(function (tab) {
        var div = document.createElement('div');
        div.className = 'browser-tab' + (tab.active ? ' active-tab' : '');

        var favicon = document.createElement('img');
        favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect fill="%236c63ff" width="16" height="16" rx="3"/></svg>';
        favicon.width = 16;
        favicon.height = 16;
        favicon.style.borderRadius = '2px';

        var titleSpan = document.createElement('span');
        titleSpan.className = 'tab-title';
        titleSpan.textContent = tab.title || 'New Tab';
        titleSpan.title = tab.url;

        var closeBtn = document.createElement('span');
        closeBtn.className = 'tab-close';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          chrome.tabs.remove(tab.id, function () {
            refreshBrowserTabs();
          });
        });

        div.appendChild(favicon);
        div.appendChild(titleSpan);
        div.appendChild(closeBtn);

        div.addEventListener('click', function () {
          chrome.tabs.update(tab.id, { active: true }, function () {
            refreshBrowserTabs();
          });
        });

        tabsList.appendChild(div);
      });
    });
  }

  document.getElementById('btn-new-tab').addEventListener('click', function () {
    chrome.tabs.create({}, function () {
      refreshBrowserTabs();
    });
  });

  document.getElementById('btn-refresh-tabs').addEventListener('click', refreshBrowserTabs);

  /* ═══════════════════════════════════════════════════════════
   *  Notes Management
   * ═══════════════════════════════════════════════════════════ */

  function refreshNotes() {
    chrome.storage.local.get('jarvis_notes', function (data) {
      var notes = [];
      if (data && data.jarvis_notes) {
        try { notes = JSON.parse(data.jarvis_notes); } catch (e) { /* ignore */ }
      }

      notesList.innerHTML = '';

      if (notes.length === 0) {
        notesList.innerHTML = '<div style="text-align:center;color:#8b949e;padding:20px;">No notes yet.<br>Type below or say "take note: ..." in chat.</div>';
        return;
      }

      notes.forEach(function (note, idx) {
        var card = document.createElement('div');
        card.className = 'note-card';

        var textDiv = document.createElement('div');
        textDiv.className = 'note-text';
        textDiv.textContent = note.text;

        var metaDiv = document.createElement('div');
        metaDiv.className = 'note-meta';

        var dateSpan = document.createElement('span');
        dateSpan.textContent = new Date(note.createdAt).toLocaleString();

        var deleteSpan = document.createElement('span');
        deleteSpan.className = 'note-delete';
        deleteSpan.textContent = '🗑️ Delete';
        deleteSpan.addEventListener('click', function () {
          notes.splice(idx, 1);
          chrome.storage.local.set({ jarvis_notes: JSON.stringify(notes) }, function () {
            refreshNotes();
          });
        });

        metaDiv.appendChild(dateSpan);
        metaDiv.appendChild(deleteSpan);
        card.appendChild(textDiv);
        card.appendChild(metaDiv);
        notesList.appendChild(card);
      });
    });
  }

  saveNoteBtn.addEventListener('click', function () {
    var text = noteInput.value.trim();
    if (!text) return;

    chrome.storage.local.get('jarvis_notes', function (data) {
      var notes = [];
      if (data && data.jarvis_notes) {
        try { notes = JSON.parse(data.jarvis_notes); } catch (e) { /* ignore */ }
      }

      notes.push({
        id: 'NOTE-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        text: text,
        createdAt: Date.now(),
        tags: []
      });

      chrome.storage.local.set({ jarvis_notes: JSON.stringify(notes) }, function () {
        noteInput.value = '';
        refreshNotes();
      });
    });
  });

  noteInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveNoteBtn.click();
    }
  });

  /* ═══════════════════════════════════════════════════════════
   *  Engines Dashboard
   * ═══════════════════════════════════════════════════════════ */

  function renderEngines() {
    var engines = [
      { id: 'EXT-001', name: 'Sovereign Mind', ring: 'Interface' },
      { id: 'EXT-002', name: 'Cipher Shield', ring: 'Counsel' },
      { id: 'EXT-003', name: 'Polyglot Oracle', ring: 'Interface' },
      { id: 'EXT-004', name: 'Vision Weaver', ring: 'Geometry' },
      { id: 'EXT-005', name: 'Code Sovereign', ring: 'Build' },
      { id: 'EXT-006', name: 'Memory Palace', ring: 'Memory' },
      { id: 'EXT-007', name: 'Sentinel Watch', ring: 'Counsel' },
      { id: 'EXT-008', name: 'Research Nexus', ring: 'Transport' },
      { id: 'EXT-009', name: 'Voice Forge', ring: 'Native' },
      { id: 'EXT-010', name: 'Data Alchemist', ring: 'Memory' },
      { id: 'EXT-011', name: 'Video Architect', ring: 'Geometry' },
      { id: 'EXT-012', name: 'Logic Prover', ring: 'Proof' },
      { id: 'EXT-013', name: 'Social Cortex', ring: 'Interface' },
      { id: 'EXT-014', name: 'Edge Runner', ring: 'Sovereign' },
      { id: 'EXT-015', name: 'Contract Forge', ring: 'Counsel' },
      { id: 'EXT-016', name: 'Organism Dashboard', ring: 'Sovereign' },
      { id: 'EXT-017', name: 'Knowledge Cartographer', ring: 'Memory' },
      { id: 'EXT-018', name: 'Protocol Bridge', ring: 'Transport' },
      { id: 'EXT-019', name: 'Creative Muse', ring: 'Geometry' },
      { id: 'EXT-020', name: 'Sovereign Nexus', ring: 'Sovereign' },
      { id: 'EXT-021', name: 'JARVIS', ring: 'Sovereign' }
    ];

    var sdks = [
      '@medina/encryption-token-sdk',
      '@medina/sovereign-encryption-sdk',
      '@medina/legal-ai-sdk',
      '@medina/adapter-bridge-sdk',
      '@medina/ai-model-engines',
      '@medina/document-absorption-engine',
      '@medina/enterprise-integration-sdk',
      '@medina/frontend-intelligence-models',
      '@medina/hook-trigger-sdk',
      '@medina/intelligence-routing-sdk',
      '@medina/organism-runtime-sdk',
      '@medina/recipe-lens-sdk',
      '@medina/sensor-array-sdk',
      '@medina/shield-defense-sdk',
      '@medina/sovereign-field-models',
      '@medina/sovereign-memory-sdk'
    ];

    enginesList.innerHTML = '';

    /* Engines section */
    var engTitle = document.createElement('div');
    engTitle.className = 'section-title';
    engTitle.textContent = '⚙️ ENGINES (' + engines.length + ')';
    enginesList.appendChild(engTitle);

    engines.forEach(function (eng) {
      var card = document.createElement('div');
      card.className = 'engine-card';
      card.innerHTML =
        '<span class="engine-id">' + eng.id + '</span>' +
        '<span class="engine-name">' + eng.name + '</span>' +
        '<span class="engine-ring">' + eng.ring + '</span>';
      enginesList.appendChild(card);
    });

    /* SDKs section */
    var sdkTitle = document.createElement('div');
    sdkTitle.className = 'section-title';
    sdkTitle.textContent = '📦 SDKs (' + sdks.length + ')';
    enginesList.appendChild(sdkTitle);

    sdks.forEach(function (sdk, i) {
      var card = document.createElement('div');
      card.className = 'engine-card';
      card.innerHTML =
        '<span class="engine-id">SDK-' + String(i + 1).padStart(3, '0') + '</span>' +
        '<span class="engine-name">' + sdk + '</span>';
      enginesList.appendChild(card);
    });

    /* Protocols section */
    var protoTitle = document.createElement('div');
    protoTitle.className = 'section-title';
    protoTitle.textContent = '🔗 PROTOCOLS (16)';
    enginesList.appendChild(protoTitle);

    var protocols = [
      'Adaptive Knowledge Absorption', 'Blueprint Assembly', 'Edge Mesh Intelligence',
      'Encrypted Intelligence Transport', 'Hook Lifecycle', 'Lens Intelligence',
      'Memory Lineage', 'Multi-Model Fusion', 'Organism Lifecycle', 'Phi Resonance Sync',
      'Recipe Orchestration', 'Sovereign Contract Verification', 'Sovereign Routing',
      'Trigger Event', 'Visual Scene Intelligence', 'Blueprint Assembly'
    ];

    protocols.forEach(function (proto, i) {
      var card = document.createElement('div');
      card.className = 'engine-card';
      card.innerHTML =
        '<span class="engine-id">P-' + String(i + 1).padStart(3, '0') + '</span>' +
        '<span class="engine-name">' + proto + '</span>';
      enginesList.appendChild(card);
    });

    /* Motoko section */
    var mokoTitle = document.createElement('div');
    mokoTitle.className = 'section-title';
    mokoTitle.textContent = '🔷 MOTOKO MODULES (2)';
    enginesList.appendChild(mokoTitle);

    ['MatalkoICP.mo — Foundation Substrate', 'TT012Sovereign.mo — Sovereign Token Engine'].forEach(function (m, i) {
      var card = document.createElement('div');
      card.className = 'engine-card';
      card.innerHTML =
        '<span class="engine-id">MOK-' + String(i + 1).padStart(3, '0') + '</span>' +
        '<span class="engine-name">' + m + '</span>';
      enginesList.appendChild(card);
    });
  }

  /* ═══════════════════════════════════════════════════════════
   *  Listen for background broadcasts
   * ═══════════════════════════════════════════════════════════ */
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.source === 'jarvis-bg' && message.result) {
      var data = message.result;
      addChatMessage('jarvis', data.message || JSON.stringify(data));
    }
  });

  /* ═══════════════════════════════════════════════════════════
   *  Utility
   * ═══════════════════════════════════════════════════════════ */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* Initial render */
  renderEngines();

})();
