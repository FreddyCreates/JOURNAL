/**
 * Memory Vault — Vault Tools (vault.js)
 * Browser-side cryptographic utilities using the Web Crypto API.
 * Author: Freddy Medina  |  © 2026 All Rights Reserved
 * VAULT-ID: FREDDY.MEDINA.2026.SOVEREIGN
 *
 * All processing is client-side only. No data is sent to any server.
 */

/* ── SHA-256 via Web Crypto API ── */
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ── Hash text input ── */
async function hashText() {
  const input = document.getElementById('hash-input');
  const output = document.getElementById('hash-output');

  const text = input ? input.value.trim() : '';
  if (!text) {
    if (output) {
      output.textContent = '⚠ Please paste some text above before computing.';
      output.className = 'output-area error';
    }
    return;
  }

  if (output) {
    output.textContent = 'Computing…';
    output.className = 'output-area loading';
  }

  try {
    const hash = await sha256(text);
    const charCount = text.length;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const ts = new Date().toISOString();

    if (output) {
      output.textContent =
        `SHA-256: ${hash}\n` +
        `Length:  ${charCount} chars / ${wordCount} words\n` +
        `Computed: ${ts}\n` +
        `Author:  Freddy Medina (VAULT-ID: FREDDY.MEDINA.2026.SOVEREIGN)`;
      output.className = 'output-area';
    }
  } catch (err) {
    if (output) {
      output.textContent = `Error: ${err.message}`;
      output.className = 'output-area error';
    }
  }
}

/* ── Generate authorship seal ── */
async function generateSeal() {
  const titleEl = document.getElementById('seal-title');
  const output = document.getElementById('seal-output');

  const title = titleEl ? titleEl.value.trim() : '';
  if (!title) {
    if (output) {
      output.textContent = '⚠ Please enter a document title above.';
      output.style.color = 'var(--red)';
    }
    return;
  }

  const ts = new Date().toISOString();
  const sealData = `AUTHOR:Freddy Medina|TITLE:${title}|DATE:${ts}|VAULT-ID:FREDDY.MEDINA.2026.SOVEREIGN`;

  try {
    const hash = await sha256(sealData);

    const seal =
      `╔══════════════════════════════════════════════════════════════╗\n` +
      `║              MEMORY VAULT — IP ATTESTATION SEAL             ║\n` +
      `╠══════════════════════════════════════════════════════════════╣\n` +
      `  Author:    Freddy Medina\n` +
      `  Document:  ${title}\n` +
      `  Issued:    ${ts}\n` +
      `  Vault ID:  FREDDY.MEDINA.2026.SOVEREIGN\n` +
      `  Seal Hash: ${hash}\n` +
      `╠══════════════════════════════════════════════════════════════╣\n` +
      `  © 2026 Freddy Medina. All Rights Reserved.\n` +
      `  This seal attests original authorship. Reproduce only with\n` +
      `  full attribution to Freddy Medina and this vault.\n` +
      `╚══════════════════════════════════════════════════════════════╝`;

    if (output) {
      output.textContent = seal;
      output.style.color = '';
    }
  } catch (err) {
    if (output) {
      output.textContent = `Error generating seal: ${err.message}`;
      output.style.color = 'var(--red)';
    }
  }
}

/* ── Copy output to clipboard ── */
async function copyOutput(elementId) {
  const el = document.getElementById(elementId);
  if (!el || !el.textContent.trim()) return;

  try {
    await navigator.clipboard.writeText(el.textContent);
    const btn = document.querySelector(`[onclick="copyOutput('${elementId}')"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.style.color = 'var(--green)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.color = '';
      }, 2000);
    }
  } catch (_) {
    /* clipboard API not available — show manual copy prompt */
    const btn = document.querySelector(`[onclick="copyOutput('${elementId}')"]`);
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Select & copy manually';
      btn.style.color = 'var(--gold)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.color = '';
      }, 3000);
    }
    if (el) el.focus();
  }
}
