/* Sovereign Nexus — Content Script (EXT-020) */

(function () {
  'use strict';

  var PANEL_ID = 'sovereign-nexus-panel';
  if (document.getElementById(PANEL_ID)) return;

  var HEARTBEAT = 873;

  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', top: '20px', left: '20px', width: '420px',
    maxHeight: '640px', backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '2px solid #ffd700', borderRadius: '12px',
    boxShadow: '0 8px 40px rgba(255,215,0,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column'
  });

  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'linear-gradient(135deg, #ffd700, #ff8f00)',
    cursor: 'grab', userSelect: 'none', color: '#000'
  });
  var title = document.createElement('span');
  title.textContent = '\uD83D\uDD31 Sovereign Nexus';
  title.style.fontWeight = '700';
  title.style.fontSize = '15px';
  var toggle = document.createElement('button');
  Object.assign(toggle.style, {
    background: 'none', border: 'none', color: '#000',
    fontSize: '16px', cursor: 'pointer', padding: '0 4px'
  });
  toggle.textContent = '\u2796';
  header.appendChild(title);
  header.appendChild(toggle);
  panel.appendChild(header);

  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Extension status grid — all 20 extensions */
  var gridLabel = document.createElement('div');
  Object.assign(gridLabel.style, {
    fontSize: '11px', color: '#ffd700', marginBottom: '6px', fontWeight: '600'
  });
  gridLabel.textContent = 'Extension Registry (20)';
  body.appendChild(gridLabel);

  var extGrid = document.createElement('div');
  Object.assign(extGrid.style, {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '12px'
  });

  var extNames = [
    'Mind', 'Polyglot', 'Code', 'Vision', 'Voice',
    'Data', 'Research', 'Memory', 'Sentinel', 'Cipher',
    'Video', 'Logic', 'Social', 'Edge', 'Contract',
    'Organism', 'Knowl.', 'Protocol', 'Muse', 'Nexus'
  ];

  var statusDots = [];
  for (var i = 0; i < extNames.length; i++) {
    var cell = document.createElement('div');
    Object.assign(cell.style, {
      padding: '3px 4px', backgroundColor: '#161b22', borderRadius: '4px',
      fontSize: '9px', textAlign: 'center', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '2px'
    });
    var dot = document.createElement('div');
    Object.assign(dot.style, {
      width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00e676'
    });
    var label = document.createElement('span');
    label.textContent = extNames[i];
    cell.appendChild(dot);
    cell.appendChild(label);
    extGrid.appendChild(cell);
    statusDots.push(dot);
  }
  body.appendChild(extGrid);

  /* Sync indicator */
  var syncRow = document.createElement('div');
  Object.assign(syncRow.style, {
    display: 'flex', justifyContent: 'space-between', marginBottom: '10px',
    fontSize: '11px', padding: '6px 8px', backgroundColor: '#161b22', borderRadius: '6px'
  });
  var syncLabel = document.createElement('span');
  syncLabel.textContent = 'Sync: --';
  syncLabel.id = 'sn-sync';
  var pulseLabel = document.createElement('span');
  pulseLabel.textContent = '\u2764 ' + HEARTBEAT + 'ms';
  pulseLabel.style.color = '#ffd700';
  var extCountLabel = document.createElement('span');
  extCountLabel.textContent = 'Extensions: 20';
  syncRow.appendChild(syncLabel);
  syncRow.appendChild(pulseLabel);
  syncRow.appendChild(extCountLabel);
  body.appendChild(syncRow);

  /* Topology canvas */
  var canvas = document.createElement('canvas');
  canvas.width = 396;
  canvas.height = 200;
  Object.assign(canvas.style, {
    width: '100%', height: '200px', backgroundColor: '#161b22',
    borderRadius: '6px', marginBottom: '8px'
  });
  body.appendChild(canvas);

  /* Global command input */
  var cmdRow = document.createElement('div');
  Object.assign(cmdRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });
  var cmdInput = document.createElement('input');
  Object.assign(cmdInput.style, {
    flex: '1', padding: '6px 8px', backgroundColor: '#161b22',
    color: '#e0e0e0', border: '1px solid #ffd700', borderRadius: '6px',
    fontSize: '12px'
  });
  cmdInput.placeholder = 'Global command\u2026';
  var cmdBtn = document.createElement('button');
  Object.assign(cmdBtn.style, {
    padding: '6px 12px', border: 'none', borderRadius: '6px',
    backgroundColor: '#ffd700', color: '#000', fontWeight: '700',
    fontSize: '12px', cursor: 'pointer'
  });
  cmdBtn.textContent = '\u26A1 Send';
  cmdRow.appendChild(cmdInput);
  cmdRow.appendChild(cmdBtn);
  body.appendChild(cmdRow);

  /* Action buttons */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px', marginBottom: '8px' });

  function makeButton(label, color) {
    var btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: '1', padding: '7px 0', border: 'none', borderRadius: '6px',
      backgroundColor: color, color: '#fff', fontWeight: '600',
      fontSize: '11px', cursor: 'pointer'
    });
    return btn;
  }

  var topoBtn = makeButton('\uD83C\uDF10 Topology', '#6c63ff');
  var metricsBtn = makeButton('\uD83D\uDCCA Metrics', '#e94560');
  var routeBtn = makeButton('\uD83C\uDFAF Route', '#00d4aa');

  btnRow.appendChild(topoBtn);
  btnRow.appendChild(metricsBtn);
  btnRow.appendChild(routeBtn);
  body.appendChild(btnRow);

  /* Results */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '6px', padding: '8px', backgroundColor: '#161b22',
    borderRadius: '6px', minHeight: '40px', maxHeight: '160px',
    overflowY: 'auto', fontSize: '12px', lineHeight: '1.5',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'none'
  });
  body.appendChild(results);
  panel.appendChild(body);
  document.body.appendChild(panel);

  /* Collapse */
  var collapsed = false;
  toggle.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '\u2795' : '\u2796';
  });

  /* Drag */
  var isDragging = false, dx = 0, dy = 0;
  header.addEventListener('mousedown', function (e) {
    isDragging = true; dx = e.clientX - panel.getBoundingClientRect().left;
    dy = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing'; e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - dx) + 'px';
    panel.style.top = (e.clientY - dy) + 'px';
  });
  document.addEventListener('mouseup', function () {
    if (isDragging) { isDragging = false; header.style.cursor = 'grab'; }
  });

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  /* Draw topology on canvas */
  function drawTopology(topo) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, 0, w, h);

    var nodes = topo.nodes || [];
    var edges = topo.edges || [];
    var scale = 0.4;

    /* Draw edges */
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (var e = 0; e < edges.length; e++) {
      var src = null;
      var tgt = null;
      for (var n = 0; n < nodes.length; n++) {
        if (nodes[n].id === edges[e].source) src = nodes[n];
        if (nodes[n].id === edges[e].target) tgt = nodes[n];
      }
      if (src && tgt) {
        ctx.beginPath();
        ctx.moveTo(cx + src.x * scale, cy + src.y * scale);
        ctx.lineTo(cx + tgt.x * scale, cy + tgt.y * scale);
        ctx.stroke();
      }
    }

    /* Draw nodes */
    var colors = ['#ffd700', '#6c63ff', '#e94560', '#00d4aa', '#ff6b35', '#00bcd4',
      '#e040fb', '#f5a623', '#28a745', '#9c27b0'];
    for (var ni = 0; ni < nodes.length; ni++) {
      var nd = nodes[ni];
      var nx = cx + nd.x * scale;
      var ny = cy + nd.y * scale;
      ctx.beginPath();
      ctx.arc(nx, ny, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors[ni % colors.length];
      ctx.fill();

      ctx.fillStyle = '#ccc';
      ctx.font = '7px sans-serif';
      ctx.fillText(nd.name.split(' ').pop(), nx + 7, ny + 3);
    }
  }

  /* Heartbeat sync animation */
  function pulseStatusDots() {
    chrome.runtime.sendMessage({ action: 'masterHeartbeat' }, function (r) {
      if (r && r.success) {
        var sync = r.data.synchronization;
        var el = document.getElementById('sn-sync');
        if (el) {
          el.textContent = 'Sync: ' + (sync * 100).toFixed(1) + '%';
          el.style.color = sync > 0.8 ? '#00e676' : sync > 0.5 ? '#ff9800' : '#e94560';
        }

        /* Pulse dots based on phase */
        for (var d = 0; d < statusDots.length && d < r.data.phases.length; d++) {
          var phase = r.data.phases[d].phase;
          var brightness = Math.round(50 + 50 * Math.sin(phase));
          statusDots[d].style.backgroundColor = 'hsl(145, 80%, ' + brightness + '%)';
        }
      }
    });
  }

  setInterval(pulseStatusDots, HEARTBEAT);

  /* Button handlers */
  cmdBtn.addEventListener('click', function () {
    var cmd = cmdInput.value.trim();
    if (!cmd) { showResult('Enter a command.'); return; }
    chrome.runtime.sendMessage({ action: 'broadcastCommand', command: cmd }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
    cmdInput.value = '';
  });

  topoBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'getOrganismTopology' }, function (r) {
      if (r && r.success) {
        drawTopology(r.data);
        showResult(r.data);
      } else { showResult('Error'); }
    });
  });

  metricsBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'getGlobalMetrics' }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
  });

  routeBtn.addEventListener('click', function () {
    var task = cmdInput.value.trim() || 'general intelligence task';
    chrome.runtime.sendMessage({ action: 'routeToExtension', task: task }, function (r) {
      showResult(r && r.success ? r.data : 'Error');
    });
  });

  /* Initial topology draw */
  setTimeout(function () {
    chrome.runtime.sendMessage({ action: 'getOrganismTopology' }, function (r) {
      if (r && r.success) drawTopology(r.data);
    });
  }, 1000);

})();
