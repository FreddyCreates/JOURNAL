/**
 * JARVIS — Background Service Worker (EXT-021)
 *
 * Master orchestrator: opens side panel on action click,
 * routes all messages to JarvisEngine, manages heartbeat.
 *
 * Attribution: Alfredo "Freddy" Medina Hernandez
 * PROPRIETARY AND CONFIDENTIAL
 */

importScripts('jarvis-engine.js');

var PHI = 1.618033988749895;
var HEARTBEAT = 873;

/* ── Instantiate engine ───────────────────────────────────── */
var jarvis = new JarvisEngine();

/* ── Open side panel on action click ──────────────────────── */
chrome.action.onClicked.addListener(function (tab) {
  chrome.sidePanel.open({ tabId: tab.id });
});

/* ── Enable side panel on all tabs ────────────────────────── */
chrome.sidePanel.setOptions({
  enabled: true
});

/* ── Context menu: send selected text to JARVIS ───────────── */
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'jarvis-analyze',
    title: 'Ask JARVIS: "%s"',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'jarvis-note',
    title: 'JARVIS: Save as Note',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'jarvis-encrypt',
    title: 'JARVIS: Encrypt Selection',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  var text = info.selectionText || '';

  if (info.menuItemId === 'jarvis-analyze') {
    var parsed = jarvis.parseCommand(text);
    jarvis.execute(parsed, function (result) {
      /* Send result to side panel if open */
      chrome.runtime.sendMessage({ source: 'jarvis-bg', result: result });
    });
  }

  if (info.menuItemId === 'jarvis-note') {
    var noteParsed = jarvis.parseCommand('take note: ' + text);
    jarvis.execute(noteParsed, function (result) {
      chrome.runtime.sendMessage({ source: 'jarvis-bg', result: result });
    });
  }

  if (info.menuItemId === 'jarvis-encrypt') {
    var encParsed = jarvis.parseCommand('encrypt ' + text);
    jarvis.execute(encParsed, function (result) {
      chrome.runtime.sendMessage({ source: 'jarvis-bg', result: result });
    });
  }
});

/* ── Message handler from side panel and content scripts ──── */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.source === 'jarvis-panel' || message.source === 'jarvis-content') {
    if (message.action === 'execute') {
      var parsed = jarvis.parseCommand(message.input);
      jarvis.execute(parsed, function (result) {
        sendResponse({ success: true, data: result });
      });
      return true; /* async response */
    }

    if (message.action === 'status') {
      var status = jarvis.getSystemStatus();
      sendResponse({ success: true, data: status });
      return;
    }

    if (message.action === 'history') {
      sendResponse({ success: true, data: jarvis.conversationHistory });
      return;
    }
  }

  /* Legacy support: handle messages from other extensions */
  if (message.action === 'fuseReasoning') {
    var fuseResult = jarvis._fuseReasoning(message.prompt);
    sendResponse({ success: true, data: fuseResult });
    return;
  }

  if (message.action === 'routeToAlpha') {
    var parsed2 = jarvis.parseCommand(message.task);
    sendResponse({ success: true, data: { routed: parsed2.engine, confidence: parsed2.confidence } });
    return;
  }

  sendResponse({ success: false, error: 'Unknown message: ' + JSON.stringify(message) });
});

/* ── Heartbeat logging ────────────────────────────────────── */
setInterval(function () {
  console.log(
    '[JARVIS] heartbeat #' + jarvis.state.heartbeatCount +
    ' | commands: ' + jarvis.state.commandsProcessed +
    ' | notes: ' + jarvis.notes.length +
    ' | healthy: ' + jarvis.state.healthy
  );
}, HEARTBEAT);
