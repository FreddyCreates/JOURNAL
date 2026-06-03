/**
 * JARVIS — Content Script (EXT-021)
 *
 * Injected into every page to enable:
 * - Page text extraction for "read page" / "summarize page"
 * - Scroll control (up/down/top/bottom)
 * - Selected text capture
 * - Page metadata extraction
 *
 * Attribution: Alfredo "Freddy" Medina Hernandez
 * PROPRIETARY AND CONFIDENTIAL
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
   *  Message Handler — responds to background/sidepanel
   * ═══════════════════════════════════════════════════════════ */
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    /* ── Extract page content ──────────────────────────────── */
    if (message.action === 'extractPageContent') {
      var bodyText = document.body ? document.body.innerText : '';
      var title = document.title || '';
      var url = window.location.href;

      /* Extract meta description */
      var metaDesc = '';
      var metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) metaDesc = metaEl.getAttribute('content') || '';

      /* Extract headings for structure */
      var headings = [];
      var hElements = document.querySelectorAll('h1, h2, h3');
      for (var i = 0; i < Math.min(hElements.length, 20); i++) {
        headings.push({
          level: hElements[i].tagName,
          text: hElements[i].innerText.trim().substring(0, 100)
        });
      }

      /* Extract links */
      var links = [];
      var linkElements = document.querySelectorAll('a[href]');
      for (var j = 0; j < Math.min(linkElements.length, 30); j++) {
        var href = linkElements[j].getAttribute('href');
        var linkText = linkElements[j].innerText.trim();
        if (linkText && href) {
          links.push({ text: linkText.substring(0, 60), href: href });
        }
      }

      sendResponse({
        content: bodyText.substring(0, 10000),
        title: title,
        url: url,
        metaDescription: metaDesc,
        headings: headings,
        linkCount: linkElements.length,
        links: links,
        wordCount: bodyText.split(/\s+/).filter(function (w) { return w.length > 0; }).length,
        charCount: bodyText.length,
        timestamp: Date.now()
      });
      return;
    }

    /* ── Scroll commands ───────────────────────────────────── */
    if (message.action === 'scroll-down') {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      sendResponse({ done: true });
      return;
    }

    if (message.action === 'scroll-up') {
      window.scrollBy({ top: -500, behavior: 'smooth' });
      sendResponse({ done: true });
      return;
    }

    if (message.action === 'scroll-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      sendResponse({ done: true });
      return;
    }

    if (message.action === 'scroll-bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      sendResponse({ done: true });
      return;
    }

    /* ── Get selected text ─────────────────────────────────── */
    if (message.action === 'getSelection') {
      var sel = window.getSelection();
      sendResponse({ selection: sel ? sel.toString() : '' });
      return;
    }

    /* ── Get page metadata ─────────────────────────────────── */
    if (message.action === 'getPageMeta') {
      var metas = {};
      document.querySelectorAll('meta').forEach(function (m) {
        var name = m.getAttribute('name') || m.getAttribute('property') || '';
        var content = m.getAttribute('content') || '';
        if (name && content) metas[name] = content;
      });

      sendResponse({
        title: document.title,
        url: window.location.href,
        meta: metas,
        lang: document.documentElement.lang || 'unknown',
        charset: document.characterSet,
        timestamp: Date.now()
      });
      return;
    }

    /* ── Highlight text on page ────────────────────────────── */
    if (message.action === 'highlight') {
      var searchText = message.text || '';
      if (searchText) {
        window.find(searchText, false, false, true, false, true, false);
      }
      sendResponse({ done: true });
      return;
    }
  });

  /* ═══════════════════════════════════════════════════════════
   *  Auto-capture selected text → send to JARVIS
   * ═══════════════════════════════════════════════════════════ */
  document.addEventListener('mouseup', function () {
    var sel = window.getSelection();
    if (sel && sel.toString().trim().length > 2) {
      chrome.runtime.sendMessage({
        source: 'jarvis-content',
        action: 'selectionCaptured',
        text: sel.toString().trim().substring(0, 500)
      });
    }
  });

  /* ═══════════════════════════════════════════════════════════
   *  JARVIS presence indicator (bottom-right dot)
   * ═══════════════════════════════════════════════════════════ */
  var indicator = document.createElement('div');
  indicator.id = 'jarvis-indicator';
  Object.assign(indicator.style, {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#6c63ff',
    boxShadow: '0 0 6px rgba(108,99,255,0.6)',
    zIndex: '2147483646',
    opacity: '0.5',
    transition: 'opacity 0.3s',
    cursor: 'pointer',
    pointerEvents: 'auto'
  });

  indicator.title = 'JARVIS Active';
  indicator.addEventListener('mouseenter', function () { indicator.style.opacity = '1'; });
  indicator.addEventListener('mouseleave', function () { indicator.style.opacity = '0.5'; });

  if (document.body) {
    document.body.appendChild(indicator);
  }

})();
